/* =====================================================================
   FOMOMD — app.js
   ---------------------------------------------------------------------
   Part A: SETTINGS & LANGUAGE
   Part B: SCORING ENGINE  (pure functions, no page access)
   Part C: DEV TOOLS       (runPersonaTests(), used by dev/audit.html)
   Part D: USER INTERFACE  (screens, results, share card, method page)

   Nothing is stored or tracked. Answers live only in memory and disappear
   when the tab is closed. All wording lives in data.js.
   ===================================================================== */
(function () {
  "use strict";

  var DATA = window.FOMOMD_DATA;
  if (!DATA) {
    if (typeof document !== "undefined" && document.body) {
      document.body.innerHTML = "<p style='padding:24px'>Could not load data.js. Make sure data.js is in the same folder as index.html.</p>";
    }
    return;
  }

  /* =================================================================
     PART A — SETTINGS & LANGUAGE
     ================================================================= */

  // Fit bands: similarity (−1…1) needed for each band, highest first.
  // Fit bands, calibrated for the v1.2 double-centred scores.
  // Derived from 5,000 random answer sets scored offline (every branch in
  // every set): "strong" is about the top 10% of all branch scores,
  // "good" the next ~25%, "possible" the rest. Re-derive with
  // dev/audit.html if you change dimension weights or branch profiles.
  var FIT_BANDS = [
    { key: "strong", minSim: 0.45 },
    { key: "good", minSim: 0.15 },
    { key: "possible", minSim: -Infinity }
  ];
  // Two results within this similarity margin are "very close".
  var CLOSE_MARGIN = 0.04;   // z-score scale (v1.2), was 0.03 on the old scale
  // A user trait counts as "scored high" when it is this far above the
  // scale midpoint (2.5 + 0.5 = 3.0 out of 5).
  var HIGH_TRAIT_MARGIN = 0.5;
  // "Where it may NOT fit": user must lean at least this far one way, and
  // the branch at least this far the other way.
  var CONFLICT_USER_MARGIN = 0.4;
  var CONFLICT_SPEC_MARGIN = 1.0;
  // A dimension counts as "covered" only if the answered questions could
  // actually have moved it by at least this much weight mass. Below that we
  // have no evidence, so the dimension is dropped from the comparison
  // entirely (never imputed) and the remaining weights are renormalised.
  var COVERAGE_MIN = 0.75;
  // Results warn that the read is rough beyond this many skips, or below
  // this many covered dimensions.
  var MAX_SKIPS_BEFORE_NOTICE = 4;
  var MIN_COVERED_DIMS = 10;
  // A dimension built from fewer than this many questions is reported as
  // low-confidence wherever it drives a recommendation. Raised to 4 in
  // v1.4, which marks "biz" (3 questions) as low-confidence.
  var THIN_DIM_QUESTIONS = 4;
  // Magnitude check: below this root-mean-square distance from the midpoint,
  // the user's answers count as "flat" (weak preferences everywhere).
  var FLAT_RMS_THRESHOLD = 0.70;
  // Sensitivity check: re-score N times with weights jittered ±JITTER.
  var SENSITIVITY_RUNS = 10;
  var SENSITIVITY_JITTER = 0.2;

  /* Every event FOMOMD can ever send. track() refuses anything else, so a
     future edit cannot quietly start sending answers, results or free text.
     dev/audit.html checks this list and every track() call in this file. */
  var ALLOWED_EVENTS = [
    "quiz_start", "round_complete_1", "round_complete_2", "round_complete_3", "round_complete_4",
    "results_reached", "fitmap_opened", "shortlist_used", "sharecard_downloaded",
    "results_copied", "retake_clicked", "feedback_useful", "feedback_not_useful"
  ];
  // The only event carrying a number: how far someone got before leaving.
  var ABANDON_EVENT = /^quiz_abandoned_q([1-9]|1[0-9]|2[0-8])$/;

  function isAllowedEvent(name) {
    return ALLOWED_EVENTS.indexOf(name) !== -1 || ABANDON_EVENT.test(name);
  }

  var hasLocation = typeof location !== "undefined";
  var LANG = (function () {
    var m = hasLocation ? /[?&]lang=([A-Za-z-]+)/.exec(location.search || "") : null;
    var want = m ? m[1] : DATA.defaultLanguage;
    return DATA.strings[want] ? want : DATA.defaultLanguage;
  })();
  var STR = DATA.strings[LANG];
  var EN = DATA.strings.en;

  function lookup(obj, path) {
    return path.split(".").reduce(function (o, k) { return o == null ? undefined : o[k]; }, obj);
  }
  function fill(s, vars) {
    if (!vars) return s;
    return s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] !== undefined ? vars[k] : m; });
  }
  /** Translate: t("results.heading", {vars}) — falls back to English. */
  function t(path, vars) {
    var v = lookup(STR, path);
    if (v === undefined) v = lookup(EN, path);
    if (v === undefined) return path;
    return typeof v === "string" ? fill(v, vars) : v;
  }

  // Apply optional content translations (questions, dimensions, specialties).
  (function applyContentTranslations() {
    var tr = DATA.translations && DATA.translations[LANG];
    if (!tr) return;
    DATA.rounds.forEach(function (r) {
      if (tr.rounds && tr.rounds[r.id]) Object.assign(r, tr.rounds[r.id]);
      r.questions.forEach(function (q) {
        var tq = tr.questions && tr.questions[q.id];
        if (!tq) return;
        ["prompt", "helper", "minLabel", "maxLabel"].forEach(function (k) { if (tq[k]) q[k] = tq[k]; });
        (q.options || []).forEach(function (o) {
          var to = tq.options && tq.options[o.id];
          if (typeof to === "string") o.text = to;
          else if (to) Object.assign(o, { text: to.text || o.text, title: to.title || o.title });
        });
      });
    });
    DATA.dimensions.forEach(function (d) { if (tr.dimensions && tr.dimensions[d.id]) Object.assign(d, tr.dimensions[d.id]); });
    DATA.specialties.forEach(function (s) { if (tr.specialties && tr.specialties[s.id]) Object.assign(s, tr.specialties[s.id]); });
  })();

  /* =================================================================
     PART B — SCORING ENGINE
     ================================================================= */
  var DIM_IDS = DATA.dimensions.map(function (d) { return d.id; });
  var DIM_BY_ID = {};
  DATA.dimensions.forEach(function (d) { DIM_BY_ID[d.id] = d; });
  var SPEC_BY_ID = {};
  DATA.specialties.forEach(function (s) { SPEC_BY_ID[s.id] = s; });

  var QUESTIONS = [];
  DATA.rounds.forEach(function (round, ri) {
    round.questions.forEach(function (q) { QUESTIONS.push(Object.assign({ roundIndex: ri }, q)); });
  });

  /** How many questions can actually move each dimension (for D: thinness). */
  var DIM_QUESTION_COUNT = (function () {
    var counts = {};
    DIM_IDS.forEach(function (d) { counts[d] = 0; });
    QUESTIONS.forEach(function (q) {
      DIM_IDS.forEach(function (d) {
        var mass;
        if (q.type === "slider") mass = Math.abs((q.perPoint || {})[d] || 0) * (q.max - q.centre) * 2;
        else {
          var ws = q.options.map(function (o) { return (o.weights || {})[d] || 0; });
          mass = Math.max.apply(null, ws) - Math.min.apply(null, ws);
        }
        if (mass > 0.0001) counts[d]++;
      });
    });
    return counts;
  })();
  var THIN_DIMS = DIM_IDS.filter(function (d) { return DIM_QUESTION_COUNT[d] < THIN_DIM_QUESTIONS; });

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function zeroVec() { var v = {}; DIM_IDS.forEach(function (d) { v[d] = 0; }); return v; }
  function baseWeights() { var w = {}; DIM_IDS.forEach(function (d) { w[d] = DIM_BY_ID[d].importance || 1; }); return w; }

  /**
   * Builds the user's 0–5 trait vector. Skipped questions are ignored.
   * answers: { questionId: { optionId: "a" } | { value: 7 } }
   */
  function computeUserProfile(answers) {
    var raw = zeroVec(), lo = zeroVec(), hi = zeroVec();
    var dealbreakers = [], boosts = {}, notes = [], answered = 0;
    var cfg = DATA.scoring;

    QUESTIONS.forEach(function (q) {
      var a = answers[q.id];
      if (!a) return;
      if (q.type === "slider") {
        var v = Number(a.value);
        if (!isFinite(v)) return;
        v = clamp(v, q.min, q.max);
        answered++;
        DIM_IDS.forEach(function (d) {
          var c = (q.perPoint && q.perPoint[d]) || 0;
          raw[d] += (v - q.centre) * c;
          var atMin = (q.min - q.centre) * c, atMax = (q.max - q.centre) * c;
          lo[d] += Math.min(atMin, atMax);
          hi[d] += Math.max(atMin, atMax);
        });
        if (q.note && v >= q.note.atLeast && notes.indexOf(q.note.id) === -1) notes.push(q.note.id);
        return;
      }
      var opt = (q.options || []).filter(function (o) { return o.id === a.optionId; })[0];
      if (!opt) return;
      answered++;
      DIM_IDS.forEach(function (d) {
        var ws = q.options.map(function (o) { return (o.weights && o.weights[d]) || 0; });
        raw[d] += (opt.weights && opt.weights[d]) || 0;
        lo[d] += Math.min.apply(null, ws);
        hi[d] += Math.max.apply(null, ws);
      });
      if (opt.dealbreaker && dealbreakers.indexOf(opt.dealbreaker) === -1) dealbreakers.push(opt.dealbreaker);
      if (opt.boost) Object.keys(opt.boost).forEach(function (sid) { boosts[sid] = (boosts[sid] || 0) + opt.boost[sid]; });
    });

    // Coverage = total absolute weight mass the answered questions could
    // have applied to this dimension. Zero (or near-zero) means "no data".
    var coverage = {}, covered = [], uncovered = [];
    DIM_IDS.forEach(function (d) {
      coverage[d] = hi[d] - lo[d];
      (coverage[d] >= COVERAGE_MIN ? covered : uncovered).push(d);
    });

    var scaled = {}, mid = cfg.scaleMidpoint, max = cfg.scaleMax, sumSq = 0;
    DIM_IDS.forEach(function (d) {
      var range = hi[d] - lo[d];
      if (range < 1e-9) { scaled[d] = mid; return; }
      var linear = max * (raw[d] - lo[d]) / range;
      var confidence = range / (range + cfg.evidenceShrink);   // thin evidence → pulled to middle
      scaled[d] = clamp(mid + (linear - mid) * confidence, 0, max);
    });
    // Flatness is judged only on dimensions we actually have evidence for.
    covered.forEach(function (d) { sumSq += Math.pow(scaled[d] - mid, 2); });

    return {
      raw: raw, scaled: scaled, dealbreakers: dealbreakers, boosts: boosts, notes: notes, answered: answered,
      coverage: coverage, covered: covered, uncovered: uncovered,
      skipped: QUESTIONS.length - answered,
      thinUsed: covered.filter(function (d) { return THIN_DIMS.indexOf(d) !== -1; }),
      magnitude: covered.length ? Math.sqrt(sumSq / covered.length) : 0
    };
  }

  /* ---------- Double-centred scoring (v1.2) ----------------------------
     Problem with plain cosine on 0–5 profiles: a branch scoring high on
     many dimensions looked similar to almost everybody, so results barely
     moved when answers changed.
     Fix: centre EACH dimension on how branches actually differ. A branch's
     score on a dimension becomes "how unusual is this branch on that
     dimension, compared with all other branches" (a z-score). The user's
     vector is centred on their own average, so only the SHAPE of their
     preferences is compared — never the overall level.
     --------------------------------------------------------------------- */
  var BRANCH_STATS = (function () {
    var stats = {};
    DIM_IDS.forEach(function (d) {
      var vals = DATA.specialties.map(function (s) { return s.profile[d] || 0; });
      var mean = vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
      var varc = vals.reduce(function (a, b) { return a + Math.pow(b - mean, 2); }, 0) / vals.length;
      var sd = Math.sqrt(varc);
      stats[d] = { mean: mean, sd: sd < 0.01 ? 0.01 : sd };   // guard tiny SD
    });
    return stats;
  })();

  var BRANCH_Z = {};
  DATA.specialties.forEach(function (spec) {
    BRANCH_Z[spec.id] = DIM_IDS.map(function (d) {
      return ((spec.profile[d] || 0) - BRANCH_STATS[d].mean) / BRANCH_STATS[d].sd;
    });
  });

  /**
   * Centres the user's 0–5 vector on its own mean — using ONLY dimensions
   * with evidence behind them. An uncovered dimension gets z = 0 and zero
   * weight, so it cannot masquerade as a like or a dislike.
   */
  function userZVector(userScaled, covered) {
    var use = covered && covered.length ? covered : DIM_IDS;
    var vals = use.map(function (d) { return userScaled[d]; });
    var mean = vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
    var sd = Math.sqrt(vals.reduce(function (a, b) { return a + Math.pow(b - mean, 2); }, 0) / vals.length);
    var flat = sd < 0.01;
    var div = flat ? 1 : sd;
    return {
      z: DIM_IDS.map(function (d) { return use.indexOf(d) === -1 ? 0 : (userScaled[d] - mean) / div; }),
      flat: flat, sd: sd
    };
  }

  /** Zeroes uncovered dimensions and renormalises the rest to the same total. */
  function coverageWeights(weights, covered) {
    var out = {}, baseTotal = 0, keptTotal = 0;
    DIM_IDS.forEach(function (d) {
      baseTotal += weights[d];
      if (covered.indexOf(d) !== -1) keptTotal += weights[d];
    });
    var factor = keptTotal > 0 ? baseTotal / keptTotal : 1;
    DIM_IDS.forEach(function (d) { out[d] = covered.indexOf(d) === -1 ? 0 : weights[d] * factor; });
    return out;
  }

  function weightedCosine(a, b, weights) {
    var dot = 0, aa = 0, bb = 0;
    DIM_IDS.forEach(function (d, i) {
      var w = weights[d];
      dot += w * a[i] * b[i]; aa += w * a[i] * a[i]; bb += w * b[i] * b[i];
    });
    return aa === 0 || bb === 0 ? 0 : dot / Math.sqrt(aa * bb);
  }

  /** v1.1 scoring, kept only so dev/audit.html can show a before/after. */
  function legacySimilarity(userScaled, profile, weights) {
    var centre = DATA.scoring.scaleMidpoint;
    var u = DIM_IDS.map(function (d) { return userScaled[d] - centre; });
    var s2 = DIM_IDS.map(function (d) { return (profile[d] || 0) - centre; });
    return weightedCosine(u, s2, weights);
  }

  /** Similarity between the user's answers and one branch. */
  function similarity(userScaled, spec, weights, mode, covered) {
    if (mode === "legacy") return legacySimilarity(userScaled, spec.profile, weights);
    return weightedCosine(userZVector(userScaled, covered).z, BRANCH_Z[spec.id], weights);
  }

  function removedByDealbreakers(spec, dealbreakers) {
    return dealbreakers.filter(function (id) {
      var db = DATA.dealbreakers[id];
      return db && db.removesFlags.some(function (f) { return spec.flags && spec.flags[f]; });
    });
  }

  /** Scores every branch. Returns all (sorted) plus those surviving dealbreakers. */
  function scoreAll(profile, weights, mode) {
    var cfg = DATA.scoring;
    var covered = profile.covered || DIM_IDS;
    var w = mode === "legacy" ? weights : coverageWeights(weights, covered);
    var all = DATA.specialties.map(function (spec) {
      var boost = Math.min(profile.boosts[spec.id] || 0, cfg.maxInterestBoost);
      var sim = clamp(similarity(profile.scaled, spec, w, mode, covered) + boost, -1, 1);
      return { spec: spec, sim: sim, removedBy: removedByDealbreakers(spec, profile.dealbreakers) };
    }).sort(function (a, b) { return b.sim - a.sim || a.spec.name.localeCompare(b.spec.name); });
    return { all: all, kept: all.filter(function (r) { return r.removedBy.length === 0; }) };
  }

  function bandFor(sim) {
    for (var i = 0; i < FIT_BANDS.length; i++) if (sim >= FIT_BANDS[i].minSim) return FIT_BANDS[i].key;
    return "possible";
  }

  function joinList(items) {
    if (items.length <= 1) return items.join("");
    return items.slice(0, -1).join(", ") + " " + t("listAnd") + " " + items[items.length - 1];
  }

  /** "Why this fits you" — ONLY from traits where the user actually scored high. */
  function buildWhy(spec, scaled, covered) {
    var mid = DATA.scoring.scaleMidpoint;
    var picks = (covered || DIM_IDS).map(function (d) {
      return { d: d, u: scaled[d] - mid, s: spec.profile[d] - mid, w: DIM_BY_ID[d].importance || 1 };
    }).filter(function (c) { return c.u >= HIGH_TRAIT_MARGIN && c.s > 0; })
      .sort(function (a, b) { return b.u * b.s * b.w - a.u * a.s * a.w; })
      .slice(0, 3);

    if (!picks.length) return { text: t("results.whyNone"), traits: [] };
    var sentences = [t("results.whyIntro", {
      traits: joinList(picks.map(function (c) { return DIM_BY_ID[c.d].userPhrase; })),
      branch: spec.shortName
    })];
    picks.slice(0, 2).forEach(function (c) { sentences.push(spec.whyItFits[c.d] || DIM_BY_ID[c.d].highFit); });
    return { text: sentences.join(" "), traits: picks.map(function (c) { return c.d; }) };
  }

  /** "Where it may NOT fit you" — traits where user and branch pull apart. */
  function buildNotFit(spec, scaled, covered) {
    var mid = DATA.scoring.scaleMidpoint;
    var cands = (covered || DIM_IDS).map(function (d) {
      return { d: d, u: scaled[d] - mid, s: spec.profile[d] - mid, w: DIM_BY_ID[d].importance || 1 };
    });
    var conflicts = cands.filter(function (c) {
      return c.u * c.s < 0 && Math.abs(c.u) >= CONFLICT_USER_MARGIN && Math.abs(c.s) >= CONFLICT_SPEC_MARGIN;
    }).sort(function (a, b) { return Math.abs(b.u * b.s) * b.w - Math.abs(a.u * a.s) * a.w; }).slice(0, 2);

    if (conflicts.length) {
      return {
        kind: "conflict",
        traits: conflicts.map(function (c) { return c.d; }),
        items: conflicts.map(function (c) {
          var dim = DIM_BY_ID[c.d];
          return t("results.conflict", { user: c.u > 0 ? dim.userPhrase : dim.lowPhrase, conflict: c.s > 0 ? dim.conflictHigh : dim.conflictLow });
        })
      };
    }
    // Milder clash: opposite directions, even if the user leaned only slightly.
    var mild = cands.filter(function (c) { return c.u * c.s < 0 && Math.abs(c.u) >= 0.1 && Math.abs(c.s) >= CONFLICT_SPEC_MARGIN; })
      .sort(function (a, b) { return Math.abs(b.u * b.s) * b.w - Math.abs(a.u * a.s) * a.w; })[0];
    if (mild) {
      var md = DIM_BY_ID[mild.d];
      return {
        kind: "mild", traits: [mild.d],
        items: [t("results.conflictMild", { user: mild.u > 0 ? md.userPhrase : md.lowPhrase, conflict: mild.s > 0 ? md.conflictHigh : md.conflictLow })]
      };
    }
    var neutral = cands.filter(function (c) { return Math.abs(c.u) < CONFLICT_USER_MARGIN && Math.abs(c.s) >= 1.5; })
      .sort(function (a, b) { return Math.abs(b.s) * b.w - Math.abs(a.s) * a.w; })[0];
    if (neutral) {
      var nd = DIM_BY_ID[neutral.d];
      return {
        kind: "neutral", traits: [neutral.d],
        items: [t("results.conflictNeutral", { trait: nd.userPhrase, conflict: neutral.s > 0 ? nd.conflictHigh : nd.conflictLow })]
      };
    }
    // Close match everywhere: name the biggest gap (branch demands more than the user showed).
    var gap = cands.filter(function (c) { return Math.abs(c.s) >= 1.5 && Math.abs(c.s - c.u) >= 0.5 && (c.s > 0 ? c.s > c.u : c.s < c.u); })
      .sort(function (a, b) { return Math.abs(b.s - b.u) * b.w - Math.abs(a.s - a.u) * a.w; })[0];
    if (gap) {
      return { kind: "gap", traits: [gap.d], items: [t(gap.s > 0 ? "results.conflictGap" : "results.conflictGapLow", { trait: DIM_BY_ID[gap.d].userPhrase })] };
    }
    return { kind: "none", traits: [], items: [t("results.conflictNone")] };
  }

  // Small seeded random generator, so the same answers give the same sensitivity check.
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var x = Math.imul(seed ^ seed >>> 15, 1 | seed);
      x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x;
      return ((x ^ x >>> 14) >>> 0) / 4294967296;
    };
  }
  function hashString(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  /** Re-scores with dimension weights randomly jittered; counts top-3 survival. */
  function sensitivityCheck(answers, profile, topIds) {
    var rng = mulberry32(hashString(JSON.stringify(answers)));
    var base = baseWeights(), counts = {};
    topIds.forEach(function (id) { counts[id] = 0; });
    for (var run = 0; run < SENSITIVITY_RUNS; run++) {
      var w = {};
      DIM_IDS.forEach(function (d) { w[d] = base[d] * (1 + (rng() * 2 - 1) * SENSITIVITY_JITTER); });
      scoreAll(profile, w).kept.slice(0, 3).forEach(function (r) {
        if (counts[r.spec.id] !== undefined) counts[r.spec.id]++;
      });
    }
    return { runs: SENSITIVITY_RUNS, jitter: SENSITIVITY_JITTER, counts: counts };
  }

  /** Adds the written rationale and related branches to one scored row. */
  function decorateEntry(r, profile) {
    return Object.assign({
      rank: null,
      band: bandFor(r.sim),
      why: buildWhy(r.spec, profile.scaled, profile.covered),
      notFit: buildNotFit(r.spec, profile.scaled, profile.covered),
      cautions: profile.dealbreakers.map(function (db) { return r.spec.cautionIf && r.spec.cautionIf[db]; }).filter(Boolean),
      adjacent: (r.spec.adjacentBranches || []).map(function (id) { return SPEC_BY_ID[id]; }).filter(Boolean),
      thin: null   // filled in below once the rationale is known
    }, r);
  }

  var CATEGORY_ORDER = ["Clinical", "Surgical", "Diagnostic/Lab", "Non-clinical/Preclinical", "Public health/Admin"];
  /** True when a recommendation leans on a dimension built from few questions. */
  function usesThinDimension(entry) {
    var used = entry.why.traits.concat(entry.notFit.traits || []);
    return used.some(function (d) { return THIN_DIMS.indexOf(d) !== -1; });
  }

  /** Main entry point: answers in, full results object out. */
  function computeResults(answers, options) {
    options = options || {};
    var profile = computeUserProfile(answers);
    if (profile.answered === 0) return { empty: true, profile: profile };

    var scored = scoreAll(profile, baseWeights());
    // Decorate every branch once, so the fit map and the shortlist can show
    // the same depth of detail as the top 3.
    var entries = scored.all.map(function (r) {
      var e = decorateEntry(r, profile);
      e.thin = usesThinDimension(e);
      return e;
    });
    var byId = {};
    entries.forEach(function (e) { byId[e.spec.id] = e; });
    var keptEntries = entries.filter(function (e) { return e.removedBy.length === 0; });
    keptEntries.forEach(function (e, i) { e.rank = i + 1; });
    // Restricted-entry branches stay in the fit map (with their access route
    // stated plainly) but are never offered as a "closest 3" or family best.
    var eligible = keptEntries.filter(function (e) { return e.spec.availability !== "restricted-entry"; });
    var overallTopFive = keptEntries.slice(0, 5).map(function (e) { return e.spec.id; });
    keptEntries.forEach(function (e) {
      e.restrictedButStrong = e.spec.availability === "restricted-entry" && overallTopFive.indexOf(e.spec.id) !== -1;
    });
    var hiddenEntries = entries.filter(function (e) { return e.removedBy.length > 0; });
    var top = eligible.slice(0, 4);

    var thirdSim = top.length >= 3 ? top[2].sim : -Infinity;
    var hidden = scored.all.filter(function (r) { return r.removedBy.length > 0 && r.sim >= thirdSim; });
    var hiddenReasons = [];
    hidden.forEach(function (r) { r.removedBy.forEach(function (id) { if (hiddenReasons.indexOf(id) === -1) hiddenReasons.push(id); }); });

    var closePairs = [];
    for (var i = 0; i < top.length - 1; i++) {
      if (top[i].sim - top[i + 1].sim <= CLOSE_MARGIN) closePairs.push([top[i], top[i + 1]]);
    }

    var consistency = DATA.consistencyPairs.filter(function (pair) {
      var a1 = answers[pair.questions[0]], a2 = answers[pair.questions[1]];
      if (!a1 || !a2) return false;
      return pair.conflicts.some(function (c) { return a1.optionId === c[0] && a2.optionId === c[1]; });
    }).map(function (p) { return p.message; });

    var stability = options.skipSensitivity ? null :
      sensitivityCheck(answers, profile, top.slice(0, 4).map(function (r) { return r.spec.id; }));

    var traitSnapshot = profile.covered.map(function (d) { return { id: d, label: DIM_BY_ID[d].label, value: profile.scaled[d] }; })
      .sort(function (a, b) { return b.value - a.value; }).slice(0, 5);

    return {
      empty: false,
      profile: profile,
      top: top.slice(0, 3),
      honourable: top[3] || null,
      hidden: hidden,
      hiddenReasons: hiddenReasons,
      closePairs: closePairs,
      consistency: consistency,
      flat: profile.magnitude < FLAT_RMS_THRESHOLD,
      roughRead: profile.skipped > MAX_SKIPS_BEFORE_NOTICE || profile.covered.length < MIN_COVERED_DIMS,
      skipped: profile.skipped,
      covered: profile.covered,
      uncovered: profile.uncovered,
      stability: stability,
      traitSnapshot: traitSnapshot,
      entries: entries,
      byId: byId,
      keptEntries: keptEntries,
      eligibleEntries: eligible,
      hiddenEntries: hiddenEntries,
      families: CATEGORY_ORDER.map(function (cat) {
        var best = eligible.filter(function (e) {
          return e.spec.category === cat && top.slice(0, 3).indexOf(e) === -1;
        })[0];
        return best ? { category: cat, entry: best } : null;
      }).filter(Boolean),
      notes: profile.notes,
      answered: profile.answered,
      total: QUESTIONS.length,
      ranked: scored.kept
    };
  }

  var Engine = {
    questions: QUESTIONS,
    dimensions: DIM_IDS,
    computeUserProfile: computeUserProfile,
    similarity: similarity,
    legacySimilarity: legacySimilarity,
    userZVector: userZVector,
    branchStats: BRANCH_STATS,
    scoreAll: scoreAll,
    baseWeights: baseWeights,
    computeResults: computeResults,
    decorateEntry: decorateEntry,
    bandFor: bandFor,
    categoryOrder: CATEGORY_ORDER,
    constants: {
      FIT_BANDS: FIT_BANDS, CLOSE_MARGIN: CLOSE_MARGIN, HIGH_TRAIT_MARGIN: HIGH_TRAIT_MARGIN,
      CONFLICT_USER_MARGIN: CONFLICT_USER_MARGIN, CONFLICT_SPEC_MARGIN: CONFLICT_SPEC_MARGIN,
      FLAT_RMS_THRESHOLD: FLAT_RMS_THRESHOLD, SENSITIVITY_RUNS: SENSITIVITY_RUNS, SENSITIVITY_JITTER: SENSITIVITY_JITTER,
      COVERAGE_MIN: COVERAGE_MIN, MAX_SKIPS_BEFORE_NOTICE: MAX_SKIPS_BEFORE_NOTICE, MIN_COVERED_DIMS: MIN_COVERED_DIMS,
      THIN_DIM_QUESTIONS: THIN_DIM_QUESTIONS
    },
    dimQuestionCount: DIM_QUESTION_COUNT,
    thinDimensions: THIN_DIMS,
    coverageWeights: coverageWeights
  };

  /* =================================================================
     PART C — DEV TOOLS
     Browser console:  runPersonaTests()      Full audit: dev/audit.html
     ================================================================= */
  var PERSONAS = [
    { name: "1. The maker", expectAnyOf: ["gen_surg", "ortho"],
      answers: { q1: "b", q2: "b", q3: "b", x1: "b", x2: "b", x3: "c", q4: "c", q5: 4, q6: "b", x4: "a", x5: 10, x6: "b", d3: "c",
        q7: "a", q8: "a", x7: "a", d1: "a", q9: "a", x8: "a", r2: "a", d2: "a", q10: "b", q11: 6, q12: "b", r1: "a", x9: "b", x10: "b", x11: 5 } },
    { name: "2. The screen detective", expectAnyOf: ["radio"],
      answers: { q1: "a", q2: "a", q3: "b", x1: "a", x2: "b", x3: "e", q4: "a", q5: 10, q6: "b", x4: "b", x5: 3, x6: "a", d3: "a",
        q7: "b", q8: "a", x7: "b", d1: "b", q9: "b", x8: "b", r2: "a", d2: "b", q10: "a", q11: 7, q12: "a", r1: "b", x9: "b", x10: "c", x11: 5 } },
    { name: "3. The calm lifestyle-seeker", expectAnyOf: ["derm"],
      answers: { q1: "b", q2: "a", q3: "a", x1: "a", x2: "b", x3: "c", q4: "a", q5: 5, q6: "b", x4: "c", x5: 2, x6: "a", d3: "b",
        q7: "b", q8: "b", x7: "b", d1: "b", q9: "b", x8: "b", r2: "a", d2: "c", q10: "a", q11: 9, q12: "a", r1: "a", x9: "b", x10: "c", x11: 5 } },
    { name: "4. The talker", expectAnyOf: ["psych", "fm"],
      answers: { q1: "a", q2: "b", q3: "a", x1: "b", x2: "b", x3: "c", q4: "a", q5: 0, q6: "a", x4: "c", x5: 3, x6: "a", d3: "c",
        q7: "b", q8: "a", x7: "b", d1: "b", q9: "b", x8: "a", r2: "b", d2: "b", q10: "a", q11: 6, q12: "b", r1: "b", x9: "a", x10: "b", x11: 5 } },
    { name: "5. The adrenaline seeker", expectAnyOf: ["em"],
      answers: { q1: "a", q2: "b", q3: "b", x1: "b", x2: "b", x3: "c", q4: "b", q5: 4, q6: "a", x4: "d", x5: 8, x6: "b", d3: "c",
        q7: "a", q8: "a", x7: "a", d1: "a", q9: "a", x8: "a", r2: "b", d2: "a", q10: "b", q11: 2, q12: "b", r1: "b", x9: "b", x10: "b", x11: 8 } },
    { name: "6. The scientist who faints at blood", expectCategoryIn: ["Diagnostic/Lab", "Non-clinical/Preclinical"], expectRemovedFlag: "heavilyProcedural",
      answers: { q1: "a", q2: "a", q3: "a", x1: "a", x2: "a", x3: "e", q4: "a", q5: 10, q6: "b", x4: "e", x5: 1, x6: "a", d3: "a",
        q7: "b", q8: "a", x7: "b", d1: "c", q9: "b", x8: "b", r2: "a", d2: "b", q10: "c", q11: 3, q12: "a", r1: "b", x9: "b", x10: "c", x11: 5 } },
    { name: "7. The child advocate", expectAnyOf: ["paeds"],
      answers: { q1: "a", q2: "b", q3: "a", x1: "b", x2: "b", x3: "a", q4: "b", q5: 1, q6: "a", x4: "c", x5: 6, x6: "b", d3: "c",
        q7: "a", q8: "a", x7: "a", d1: "a", q9: "a", x8: "a", r2: "b", d2: "a", q10: "b", q11: 4, q12: "b", r1: "b", x9: "a", x10: "a", x11: 5 } },
    { name: "8. The entrepreneur", expectAnyOf: ["derm", "ophthal", "radio"],
      answers: { q1: "b", q2: "a", q3: "a", x1: "a", x2: "b", x3: "e", q4: "a", q5: 7, q6: "b", x4: "c", x5: 4, x6: "a", d3: "b",
        q7: "b", q8: "a", x7: "a", d1: "a", q9: "b", x8: "b", r2: "a", d2: "b", q10: "a", q11: 10, q12: "a", r1: "a", x9: "b", x10: "c", x11: 5 } }
  ];

  function personaToAnswers(p) {
    var out = {};
    Object.keys(p.answers).forEach(function (qid) {
      var v = p.answers[qid];
      out[qid] = typeof v === "number" ? { value: v } : { optionId: v };
    });
    return out;
  }

  /** Checks data.js for mistakes. Returns a list of problems (empty = OK). */
  function validateData() {
    var problems = [], usedDims = {};
    if (QUESTIONS.length > 28) problems.push("More than 28 questions (" + QUESTIONS.length + ")");
    QUESTIONS.forEach(function (q) {
      if (q.type === "slider") Object.keys(q.perPoint || {}).forEach(function (d) { usedDims[d] = 1; if (!DIM_BY_ID[d]) problems.push(q.id + ": unknown trait " + d); });
      (q.terms || []).forEach(function (term) { if (!lookup(EN, "glossary")[term]) problems.push(q.id + ": term missing from glossary: " + term); });
      (q.options || []).forEach(function (o) {
        Object.keys(o.weights || {}).forEach(function (d) { usedDims[d] = 1; if (!DIM_BY_ID[d]) problems.push(q.id + "/" + o.id + ": unknown trait " + d); });
        if (o.dealbreaker && !DATA.dealbreakers[o.dealbreaker]) problems.push(q.id + ": unknown dealbreaker " + o.dealbreaker);
        Object.keys(o.boost || {}).forEach(function (sid) { if (!SPEC_BY_ID[sid]) problems.push(q.id + ": boost for unknown branch " + sid); });
      });
    });
    DIM_IDS.forEach(function (d) {
      if (!usedDims[d]) problems.push("Trait never asked about: " + d);
      ["conflictHigh", "conflictLow", "description"].forEach(function (k) { if (!DIM_BY_ID[d][k]) problems.push("Dimension " + d + " missing " + k); });
    });
    DATA.consistencyPairs.forEach(function (p) {
      p.questions.forEach(function (qid) { if (!QUESTIONS.some(function (q) { return q.id === qid; })) problems.push("Consistency pair uses unknown question " + qid); });
    });
    DATA.specialties.forEach(function (s) {
      DIM_IDS.forEach(function (d) { if (typeof s.profile[d] !== "number") problems.push(s.id + ": missing profile value for " + d); });
      if (!s.realityCheck) problems.push(s.id + ": missing realityCheck");
      if (!s.askAResident || !s.askAResident.length) problems.push(s.id + ": missing askAResident");
      if (!Array.isArray(s.adjacentBranches) || s.adjacentBranches.length < 1 || s.adjacentBranches.length > 2) problems.push(s.id + ": adjacentBranches must list 1–2 branches");
      (s.adjacentBranches || []).forEach(function (id) { if (!SPEC_BY_ID[id] || id === s.id) problems.push(s.id + ": bad adjacent branch " + id); });
      if (!Array.isArray(s.sources)) problems.push(s.id + ": sources must be an array");
      if (typeof s.lastChecked !== "string") problems.push(s.id + ": lastChecked must be a string");
    });
    return problems;
  }

  function runPersonaTests(opts) {
    var quiet = opts && opts.quiet;
    var log = quiet ? function () {} : function (level, msg) { console[level](msg); };
    var problems = validateData();
    if (problems.length) log("warn", "[FOMOMD] Data problems:\n - " + problems.join("\n - "));
    else log("log", "[FOMOMD] Data check: OK (" + QUESTIONS.length + " questions, " + DATA.specialties.length + " branches, all 14 traits used)");

    var rows = [];
    PERSONAS.forEach(function (p) {
      var r = computeResults(personaToAnswers(p), { skipSensitivity: true });
      var top3 = r.top.map(function (x) { return x.spec; });
      var ok = p.expectAnyOf
        ? top3.some(function (s) { return p.expectAnyOf.indexOf(s.id) !== -1; })
        : top3.some(function (s) { return p.expectCategoryIn.indexOf(s.category) !== -1; }) &&
          !r.ranked.some(function (x) { return x.spec.flags[p.expectRemovedFlag]; });
      var summary = r.top.map(function (x, i) { return (i + 1) + ") " + x.spec.shortName + " [" + t("results.bands." + x.band) + "]"; }).join("  ");
      rows.push({ name: p.name, pass: ok, summary: summary });
      log(ok ? "log" : "warn", (ok ? "PASS  " : "FAIL  ") + p.name + "  →  " + summary);
    });
    var passed = rows.filter(function (x) { return x.pass; }).length;
    log("log", "[FOMOMD] Persona tests: " + passed + "/" + PERSONAS.length + " passed");
    return { passed: passed, total: PERSONAS.length, rows: rows, dataProblems: problems };
  }

  window.FOMOMD = {
    engine: Engine, personas: PERSONAS, personaToAnswers: personaToAnswers,
    validateData: validateData, runPersonaTests: runPersonaTests, t: t, language: LANG,
    analytics: { allowedEvents: ALLOWED_EVENTS, abandonPattern: ABANDON_EVENT, isAllowedEvent: isAllowedEvent }
  };
  window.runPersonaTests = runPersonaTests;

  /* =================================================================
     PART D — USER INTERFACE
     ================================================================= */
  if (typeof document === "undefined") return;
  var main = document.getElementById("main");
  if (!main) return;   // e.g. dev/audit.html loads the engine only

  var toastEl = document.getElementById("toast");
  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var state = { screen: "landing", qIndex: 0, answers: {}, busy: false, results: null, completedAt: null, lineIndex: 0, returnTo: "landing",
    shortlist: [], shortlistSubmitted: false };   // shortlist lives in memory only
  var uid = 0;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, reducedMotion ? Math.min(ms, 120) : ms); }); }
  function formatDate(d) {
    try { return new Intl.DateTimeFormat(t("dateLocale"), { day: "numeric", month: "long", year: "numeric" }).format(d); }
    catch (e) { return d.toDateString(); }
  }
  /** Escapes a translated string, then swaps {token} for trusted HTML. */
  function withHtml(path, tokens) {
    var marks = {};
    Object.keys(tokens).forEach(function (k, i) { marks[k] = "" + i + ""; });
    var s = esc(t(path, marks));
    Object.keys(tokens).forEach(function (k, i) { s = s.split("" + i + "").join(tokens[k]); });
    return s;
  }

  /* ---------- Optional analytics (disabled by default; see data.js) ---------- */
  var analyticsOn = (function () {
    var a = DATA.analytics;
    if (!a || !a.enabled || !a.goatcounterCode || !/^https?:$/.test(location.protocol)) return false;
    var s2 = document.createElement("script");
    s2.async = true;
    s2.src = "https://gc.zgo.at/count.js";
    s2.setAttribute("data-goatcounter", "https://" + encodeURIComponent(a.goatcounterCode) + ".goatcounter.com/count");
    document.head.appendChild(s2);
    return true;
  })();

  /**
   * Sends ONE allowlisted event name. No answers, no results, no branch
   * names, no free text, no identifiers — the name is the entire payload.
   */
  function track(eventName) {
    if (!analyticsOn || !isAllowedEvent(eventName)) return;
    try {
      if (window.goatcounter && window.goatcounter.count) {
        window.goatcounter.count({ path: "fomomd/" + eventName, title: eventName, event: true });
      }
    } catch (e) { /* ignore */ }
  }

  /* ---------- Static chrome (header, footer) ---------- */
  function renderChrome() {
    document.documentElement.lang = LANG === "en" ? "en-IN" : LANG;
    var set = function (id, text) { var el = document.getElementById(id); if (el) el.textContent = text; };
    set("brand-name", t("appName"));
    set("brand-sub", t("headerSubtitle"));
    set("header-note", t("headerNote"));
    set("skip-link", t("skipLink"));
    set("footer-privacy", analyticsOn ? t("footer.privacyAnalytics") : t("footer.privacy"));
    var beta = document.getElementById("footer-beta");
    if (beta) { beta.textContent = t("footer.beta"); beta.title = t("footer.betaNote"); }
    var betaNote = document.getElementById("footer-beta-note");
    if (betaNote) betaNote.textContent = t("footer.betaNote");
    set("footer-line", t("footer.line", {
      app: t("appName"), version: DATA.contentVersion,
      date: DATA.lastReviewed || t("footer.pending"), name: DATA.reviewerName || t("footer.pending")
    }));
    var an = document.getElementById("footer-analytics");
    if (an && analyticsOn) { an.textContent = t("footer.analytics"); an.hidden = false; }
    var fb = document.getElementById("footer-feedback");
    if (fb && DATA.feedbackUrl) { fb.href = DATA.feedbackUrl; fb.textContent = t("footer.feedback"); fb.hidden = false; }
  }

  /* ---------- Mascot ---------- */
  function mascotSVG(mood, extraClass) {
    return '<svg class="mascot ' + (extraClass || "") + '" data-mood="' + (mood || "idle") + '" viewBox="0 0 100 110" aria-hidden="true" focusable="false">' +
      '<path class="m-tube" d="M50 40 V30 C50 16 30 22 28 8 M50 30 C50 16 70 22 72 8" fill="none" stroke-width="4" stroke-linecap="round"/>' +
      '<circle class="m-ear" cx="28" cy="7" r="4"/><circle class="m-ear" cx="72" cy="7" r="4"/>' +
      '<circle class="m-ring" cx="50" cy="70" r="31"/><circle class="m-face" cx="50" cy="70" r="24"/>' +
      '<g class="m-eyes"><ellipse cx="41" cy="66" rx="3" ry="4"/><ellipse cx="59" cy="66" rx="3" ry="4"/></g>' +
      '<circle class="m-cheek" cx="34" cy="75" r="3.5"/><circle class="m-cheek" cx="66" cy="75" r="3.5"/>' +
      '<path class="m-smile" d="M42 77 Q50 84 58 77" fill="none" stroke-width="3" stroke-linecap="round"/>' +
      '<path class="m-grin" d="M40 75 Q50 90 60 75 Z"/></svg>';
  }
  function setMascotMood(mood) {
    var m = main.querySelector(".mascot");
    if (!m) return;
    m.setAttribute("data-mood", mood);
    if (mood === "happy") { m.classList.remove("bounce"); void m.getBoundingClientRect(); m.classList.add("bounce"); }
  }

  var toastTimer;
  function showToast(text) {
    toastEl.textContent = text;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 1400);
  }

  function renderScreen(name, html) {
    state.screen = name;
    main.innerHTML = '<div class="screen screen-' + name + '">' + html + "</div>";
    window.scrollTo(0, 0);
    var focusTarget = main.querySelector("[data-autofocus]") || main.querySelector("h1, h2");
    if (focusTarget) { focusTarget.setAttribute("tabindex", "-1"); focusTarget.focus({ preventScroll: true }); }
  }

  /* ---------- Glossary (i) tooltips ---------- */
  function glossary() { return lookup(STR, "glossary") || EN.glossary; }
  function termTips(terms) {
    var gl = glossary();
    var list = (terms || []).filter(function (k, i, arr) { return gl[k] && arr.indexOf(k) === i; });
    if (!list.length) return "";
    return '<div class="terms">' + list.map(function (k) {
      var id = "tip-" + (++uid);
      return '<button type="button" class="term-btn" data-action="term" aria-expanded="false" aria-controls="' + id + '" aria-label="' + esc(t("question.termButton", { term: k })) + '">' +
        '<span class="term-i" aria-hidden="true">i</span>' + esc(k) + '</button>' +
        '<p class="term-def" id="' + id + '" hidden><strong>' + esc(k) + ':</strong> ' + esc(gl[k].def) + '</p>';
    }).join("") + '</div>';
  }
  function detectTerms(text) {
    var gl = glossary();
    return Object.keys(gl).filter(function (k) {
      if (!gl[k].detect) return false;
      var re = new RegExp("(^|[^A-Za-z])" + k.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&") + "([^A-Za-z]|$)");
      return re.test(text);
    });
  }

  function disclaimerBlock(text, label) {
    return '<aside class="disclaimer" role="note"><p>' + (label ? '<strong>' + esc(label) + '</strong> ' : '') + esc(text) + '</p></aside>';
  }

  /* ---------- Landing ---------- */
  function renderLanding() {
    renderScreen("landing",
      '<section class="hero">' +
        '<div class="hero-mascot">' + mascotSVG("happy") + '</div>' +
        '<h1 data-autofocus class="app-title">' + esc(t("appName")) + '</h1>' +
        '<p class="tagline">' + esc(t("tagline")) + '</p>' +
        '<p class="lede">' + esc(t("landing.line")) + '</p>' +
        '<ul class="meta-list">' +
          '<li><span aria-hidden="true">⏱️</span> ' + esc(t("landing.metaTime", { n: QUESTIONS.length })) + '</li>' +
          '<li><span aria-hidden="true">🔒</span> ' + esc(analyticsOn ? t("landing.metaPrivacyAnalytics") : t("landing.metaPrivacy")) + '</li>' +
          '<li><span aria-hidden="true">🧭</span> ' + esc(t("landing.metaBranches", { n: DATA.specialties.length })) + '</li>' +
        '</ul>' +
        '<p class="state-trait" role="note">' + esc(t("landing.stateTrait")) + '</p>' +
        '<button class="btn btn-primary btn-lg" data-action="start">' + esc(t("landing.start")) + '</button>' +
      '</section>' +
      '<section class="card how" aria-labelledby="how-title">' +
        '<h2 id="how-title">' + esc(t("landing.howTitle")) + '</h2>' +
        '<ol class="steps">' + t("landing.howSteps").map(function (s) { return '<li>' + s + '</li>'; }).join("") + '</ol>' +
        '<p class="never">' + t("landing.never") + '</p>' +
        '<p class="method-link"><a href="#method">' + esc(t("landing.methodLink")) + ' →</a></p>' +
      '</section>' +
      disclaimerBlock(t("landing.disclaimer"), t("landing.disclaimerLabel"))
    );
  }

  /* ---------- Progress + round intro ---------- */
  function progressHeader(done, total, ri) {
    var pct = Math.round(done / total * 100);
    return '<div class="progress-wrap">' +
      '<div class="progress-labels"><span>' + esc(t("round.roundOf", { i: ri + 1, n: DATA.rounds.length })) + ' · ' + esc(DATA.rounds[ri].title) + '</span><span>' + pct + '%</span></div>' +
      '<div class="progress" role="progressbar" aria-label="' + esc(t("question.progressLabel")) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '">' +
      '<div class="progress-fill" style="width:' + pct + '%"></div></div></div>';
  }

  function renderRoundIntro(ri) {
    var round = DATA.rounds[ri];
    renderScreen("round",
      progressHeader(state.qIndex, QUESTIONS.length, ri) +
      '<section class="round-card">' +
        '<div class="round-mascot">' + mascotSVG(ri === 0 ? "idle" : "happy", "bounce") + '</div>' +
        '<p class="eyebrow">' + esc(t("round.roundOf", { i: ri + 1, n: DATA.rounds.length })) + '</p>' +
        '<h2 data-autofocus>' + esc(round.title) + '</h2>' +
        '<p class="lede">' + esc(round.intro) + '</p>' +
        '<p class="round-count">' + esc(t("round.questionsInRound", { n: round.questions.length })) + '</p>' +
        '<button class="btn btn-primary btn-lg" data-action="begin-round">' + esc(ri === 0 ? t("round.letsGo") : t("round.continue")) + '</button>' +
      '</section>'
    );
  }

  /* ---------- Question ---------- */
  function sliderText(q, v) {
    return t("question.sliderValueText", { v: v, min: q.min, max: q.max, minLabel: q.minLabel, maxLabel: q.maxLabel });
  }

  function renderQuestion() {
    var q = QUESTIONS[state.qIndex];
    var total = QUESTIONS.length;
    var ans = state.answers[q.id];
    var lines = t("mascotLines");
    var line = lines[state.lineIndex++ % lines.length];
    var body;

    if (q.type === "slider") {
      var val = ans ? ans.value : q.centre;
      body = '<div class="slider-block">' +
        (q.helper ? '<p class="helper">' + esc(q.helper) + '</p>' : '') +
        '<label class="visually-hidden" for="slider-' + q.id + '">' + esc(q.prompt) + '</label>' +
        '<output class="slider-value" for="slider-' + q.id + '" aria-hidden="true">' + val + '</output>' +
        '<input type="range" class="slider" id="slider-' + q.id + '" min="' + q.min + '" max="' + q.max + '" step="' + q.step + '" value="' + val + '" ' +
          'aria-valuetext="' + esc(sliderText(q, val)) + '" style="--fill:' + ((val - q.min) / (q.max - q.min) * 100) + '%">' +
        '<div class="slider-ends" aria-hidden="true"><span>' + q.min + ' · ' + esc(q.minLabel) + '</span><span>' + q.max + ' · ' + esc(q.maxLabel) + '</span></div>' +
        '<button class="btn btn-primary" data-action="confirm-slider">' + esc(t("question.lockIn")) + '</button>' +
      '</div>';
    } else {
      var cls = q.format === "room" ? "options rooms" : q.format === "thisOrThat" ? "options this-or-that" : "options scenario";
      body = '<div class="' + cls + '" role="group" aria-labelledby="q-title">' +
        q.options.map(function (o, i) {
          var selected = ans && ans.optionId === o.id;
          var inner = q.format === "room"
            ? '<span class="room-icon" aria-hidden="true">' + esc(o.icon) + '</span><span class="room-title">' + esc(o.title) + '</span><span class="room-text">' + esc(o.text) + '</span>'
            : '<span class="opt-key" aria-hidden="true">' + String.fromCharCode(65 + i) + '</span><span class="opt-text">' + esc(o.text) + '</span>';
          var or = (q.format === "thisOrThat" && i === 0) ? '<span class="or" aria-hidden="true">or</span>' : '';
          return '<button class="option' + (selected ? ' selected' : '') + '" data-action="choose" data-option="' + esc(o.id) + '" aria-pressed="' + (selected ? "true" : "false") + '">' + inner + '</button>' + or;
        }).join("") + '</div>';
    }

    renderScreen("question",
      progressHeader(state.qIndex, total, q.roundIndex) +
      '<section class="q-card">' +
        '<div class="q-top">' +
          '<div class="q-mascot">' + mascotSVG("idle") + '<span class="bubble">' + esc(line) + '</span></div>' +
          '<p class="q-count">' + esc(t("question.questionOf", { i: state.qIndex + 1, n: total })) +
            (q.isDealbreakerQuestion ? ' · <span class="kind">' + esc(t("question.honestCheck")) + '</span>' : '') + '</p>' +
        '</div>' +
        '<h2 id="q-title" data-autofocus>' + esc(q.prompt) + '</h2>' +
        termTips(q.terms) +
        body +
        '<div class="q-nav">' +
          (state.qIndex > 0 ? '<button class="btn btn-ghost" data-action="back">' + esc(t("question.back")) + '</button>' : '<span></span>') +
          '<button class="btn btn-ghost" data-action="skip">' + esc(t("question.skip")) + '</button>' +
        '</div>' +
        (q.type !== "slider" ? '<p class="kbd-hint">' + esc(t("question.kbdHint", { keys: q.options.map(function (_, i) { return i + 1; }).join(", ") })) + '</p>' : '') +
      '</section>'
    );

    var slider = main.querySelector(".slider");
    if (slider) {
      slider.addEventListener("input", function () {
        var v = Number(slider.value);
        main.querySelector(".slider-value").textContent = v;
        slider.setAttribute("aria-valuetext", sliderText(q, v));
        slider.style.setProperty("--fill", ((v - q.min) / (q.max - q.min) * 100) + "%");
      });
    }
  }

  function acknowledge() {
    var lines = t("feedbackLines");
    showToast(lines[Math.floor(Math.random() * lines.length)]);
    setMascotMood("happy");
    var fill = main.querySelector(".progress-fill");
    if (fill) {
      fill.style.width = Math.round((state.qIndex + 1) / QUESTIONS.length * 100) + "%";
      fill.classList.remove("pulse"); void fill.offsetWidth; fill.classList.add("pulse");
    }
  }

  function choose(optionId, button) {
    if (state.busy) return;
    var q = QUESTIONS[state.qIndex];
    state.busy = true;
    state.answers[q.id] = { optionId: optionId };
    main.querySelectorAll(".option").forEach(function (b) {
      var on = b === button;
      b.classList.toggle("selected", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
      if (!on) b.classList.add("dimmed");
    });
    if (button) button.classList.add("chosen");
    acknowledge();
    wait(480).then(function () {
      var card = main.querySelector(".q-card");
      if (card) card.classList.add("leaving");
      return wait(200);
    }).then(function () { state.busy = false; advance(); });
  }

  function confirmSlider() {
    if (state.busy) return;
    var q = QUESTIONS[state.qIndex];
    state.busy = true;
    state.answers[q.id] = { value: Number(main.querySelector(".slider").value) };
    acknowledge();
    wait(420).then(function () { state.busy = false; advance(); });
  }

  function advance() {
    var prev = QUESTIONS[state.qIndex];
    state.qIndex++;
    if (state.qIndex >= QUESTIONS.length) { finish(); return; }
    var next = QUESTIONS[state.qIndex];
    if (next.roundIndex !== prev.roundIndex) { track("round_complete_" + (prev.roundIndex + 1)); renderRoundIntro(next.roundIndex); }
    else renderQuestion();
  }

  /* ---------- Results ---------- */
  function finish() {
    track("round_complete_" + (DATA.rounds.length));
    state.results = computeResults(state.answers);
    state.completedAt = new Date();
    renderScreen("computing",
      '<section class="computing">' + mascotSVG("happy", "bounce") +
        '<h2 data-autofocus>' + esc(t("computing", { n: DATA.specialties.length })) + '</h2>' +
        '<div class="dots" aria-hidden="true"><span></span><span></span><span></span></div>' +
      '</section>'
    );
    wait(1200).then(function () { renderResults(); track("results_reached"); });
  }

  var CATEGORY_CLASS = {
    "Clinical": "tag-clinical", "Surgical": "tag-surgical", "Diagnostic/Lab": "tag-diagnostic",
    "Non-clinical/Preclinical": "tag-preclinical", "Public health/Admin": "tag-public"
  };

  function availabilityTag(spec) {
    if (spec.availability === "restricted-entry") return '<span class="avail avail-restricted">' + esc(t("results.availability.restrictedTag")) + '</span>';
    if (spec.availability === "limited-centres") return '<span class="avail avail-limited">' + esc(t("results.availability.limitedTag")) + '</span>';
    return "";
  }
  function availabilityNote(e) {
    var out = "";
    var extra = e.spec.availabilityNote ? " " + e.spec.availabilityNote : "";
    if (e.spec.availability === "restricted-entry") {
      out += '<p class="avail-note" role="note">' + esc(t("results.availability.restrictedNote") + extra) + '</p>';
      if (e.restrictedButStrong) out += '<p class="avail-note strong-note">' + esc(t("results.availability.restrictedTopFive")) + '</p>';
    } else if (e.spec.availability === "limited-centres") {
      out += '<p class="avail-note" role="note">' + esc(t("results.availability.limitedNote") + extra) + '</p>';
    } else if (extra) {
      out += '<p class="avail-note" role="note">' + esc(e.spec.availabilityNote) + '</p>';
    }
    return out;
  }

  function bandPill(band) {
    return '<span class="band band-' + band + '">' + esc(t("results.bands." + band)) + '</span>';
  }

  function stabilityLine(r, res) {
    if (!res.stability || res.stability.counts[r.spec.id] === undefined) return "";
    return '<p class="stability">' + esc(t("results.stability", {
      name: r.spec.shortName, k: res.stability.counts[r.spec.id], n: res.stability.runs
    })) + '</p>';
  }

  function resultBody(r) {
    var s = r.spec;
    var notMeId = "notme-" + (++uid);
    var tips = detectTerms(s.realityCheck + " " + s.indiaNote);
    return '' +
      availabilityNote(r) +
      (r.thin ? '<p class="thin-note" role="note">' + esc(t("results.thinNote")) + '</p>' : '') +
      (s.aliases && s.aliases.length ? '<p class="also-called">' + esc(t("results.alsoCalled", { names: s.aliases.join(", ") })) + '</p>' : '') +
      (s.careerOutlook ? '<p class="outlook">' + esc(s.careerOutlookNote || t("results.outlook." + s.careerOutlook)) + '</p>' : '') +
      (s.whoThrivesHere ? '<section class="rc-section thrives"><h3>' + esc(t("results.whoThrives")) + '</h3><p>' + esc(s.whoThrivesHere) + '</p></section>' : '') +
      '<section class="rc-section"><h3>' + esc(t("results.why")) + '</h3><p>' + esc(r.why.text) + '</p></section>' +
      '<section class="rc-section notfit"><h3>' + esc(t("results.notFit")) + '</h3>' +
        (r.notFit.items.length > 1
          ? '<ul>' + r.notFit.items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join("") + '</ul>'
          : '<p>' + esc(r.notFit.items[0]) + '</p>') +
      '</section>' +
      (r.cautions.length ? '<p class="caution" role="note">' + esc(r.cautions.join(" ")) + '</p>' : '') +
      '<section class="rc-section reality"><h3>' + esc(t("results.reality")) + '</h3><p>' + esc(s.realityCheck) + '</p></section>' +
      '<section class="rc-section"><h3>' + esc(t("results.askResident")) + '</h3><ul>' +
        s.askAResident.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join("") + '</ul></section>' +
      '<section class="rc-section"><h3>' + esc(t("results.inIndia")) + '</h3><p>' + esc(s.indiaNote) + '</p></section>' +
      termTips(tips) +
      (r.adjacent.length ? '<section class="rc-section"><h3>' + esc(t("results.adjacent")) + '</h3>' +
        '<ul class="chips" aria-describedby="adj-hint-' + notMeId + '">' + r.adjacent.map(function (a) { return '<li>' + esc(a.shortName) + '</li>'; }).join("") + '</ul>' +
        '<p class="visually-hidden" id="adj-hint-' + notMeId + '">' + esc(t("results.adjacentHint")) + '</p></section>' : '') +
      '<div class="notme no-print">' +
        '<button type="button" class="btn btn-small" data-action="not-me" aria-expanded="false" aria-controls="' + notMeId + '">' + esc(t("results.notMe")) + '</button>' +
        '<p class="notme-reply" id="' + notMeId + '" hidden>' + esc(t("results.notMeReply")) + '</p>' +
      '</div>';
  }

  function resultCard(r, res) {
    return '<article class="result-card rank-' + r.rank + '" aria-labelledby="rc-' + r.rank + '">' +
      '<header class="rc-head">' +
        '<span class="rank-badge" aria-hidden="true">' + r.rank + '</span>' +
        '<div class="rc-titles">' +
          '<p class="visually-hidden">' + esc(t("results.rankLabel", { i: r.rank })) + '</p>' +
          '<h2 id="rc-' + r.rank + '">' + esc(r.spec.name) + '</h2>' +
          '<div class="rc-tags"><span class="tag ' + CATEGORY_CLASS[r.spec.category] + '">' + esc(r.spec.category) + '</span>' + bandPill(r.band) + availabilityTag(r.spec) + '</div>' +
        '</div>' +
      '</header>' +
      stabilityLine(r, res) +
      resultBody(r) +
    '</article>';
  }

  /** One branch as a collapsible panel (families, fit map, shortlist). */
  function branchPanel(e, res, opts) {
    opts = opts || {};
    var id = "bp-" + (++uid);
    return '<details class="branch-panel" aria-labelledby="' + id + '">' +
      '<summary><span class="bp-line">' +
        (opts.lead ? '<span class="bp-lead">' + esc(opts.lead) + '</span>' : '') +
        '<span class="bp-name" id="' + id + '">' + esc(e.spec.shortName) + '</span>' +
        '<span class="tag ' + CATEGORY_CLASS[e.spec.category] + '">' + esc(e.spec.category) + '</span>' +
        bandPill(e.band) + availabilityTag(e.spec) +
      '</span></summary>' +
      '<div class="bp-body">' + stabilityLine(e, res) + resultBody(e) + '</div>' +
    '</details>';
  }

  /**
   * "Was this useful?" — two taps, nothing else. Hidden entirely when
   * analytics is off, so there is never a dead button. Shown once per
   * session and never repeated.
   */
  function feedbackBlock() {
    if (!analyticsOn || state.feedbackDone) return "";
    return '<section class="feedback no-print" id="feedback-block" aria-labelledby="fb-title">' +
      '<p class="fb-title" id="fb-title">' + esc(t("results.feedbackTitle")) + '</p>' +
      '<div class="fb-buttons">' +
        '<button class="btn btn-small" data-action="feedback" data-value="useful">' + esc(t("results.feedbackYes")) + '</button>' +
        '<button class="btn btn-small" data-action="feedback" data-value="not_useful">' + esc(t("results.feedbackNo")) + '</button>' +
      '</div>' +
    '</section>';
  }

  function ignoresPanel() {
    var link = '<a href="' + esc(DATA.officialLinks.mcc) + '" target="_blank" rel="noopener noreferrer">' + esc(DATA.officialLinks.mcc.replace(/^https?:\/\//, "")) + '</a>';
    return '<details class="card ignores">' +
      '<summary>' + esc(t("results.ignoresTitle")) + '</summary>' +
      '<p>' + esc(t("results.ignoresIntro")) + '</p>' +
      '<ul>' + t("results.ignoresItems").map(function (x) { return '<li>' + esc(x) + '</li>'; }).join("") + '</ul>' +
      '<p>' + withHtml("results.ignoresOfficial", { link: link }) + '</p>' +
    '</details>';
  }

  /** (b) Best fit in every family. */
  function familiesSection(res) {
    if (!res.families.length) return "";
    return '<section class="card section-block" aria-labelledby="fam-title">' +
      '<h2 id="fam-title">' + esc(t("results.familiesTitle")) + '</h2>' +
      '<p class="muted">' + esc(t("results.familiesIntro")) + '</p>' +
      res.families.map(function (f) { return branchPanel(f.entry, res, { lead: f.category }); }).join("") +
    '</section>';
  }

  /** (c) Full fit map — every branch, ranked. */
  function fitMapSection(res) {
    return '<section class="card section-block" aria-labelledby="map-title">' +
      '<h2 id="map-title">' + esc(t("results.mapTitle")) + '</h2>' +
      '<p class="muted">' + esc(t("results.mapIntro")) + '</p>' +
      '<p class="calm">' + esc(t("results.mapCalm")) + '</p>' +
      '<details class="fit-map"><summary>' + esc(t("results.mapOpen", { n: res.keptEntries.length + res.hiddenEntries.length })) + '</summary>' +
        '<div class="fit-map-body">' +
          res.keptEntries.map(function (e) { return branchPanel(e, res, { lead: "#" + e.rank }); }).join("") +
          (res.hiddenEntries.length ? '<h3 class="map-hidden-title">' + esc(t("results.mapHiddenTitle")) + '</h3>' +
            '<p class="muted small">' + esc(t("results.mapHiddenIntro")) + '</p>' +
            res.hiddenEntries.map(function (e) { return branchPanel(e, res, {}); }).join("") : '') +
        '</div>' +
      '</details>' +
    '</section>';
  }

  /** (d) Student-supplied shortlist. Never asks for rank, marks or college. */
  function shortlistSection(res) {
    var chosen = state.shortlist;
    return '<section class="card section-block shortlist" aria-labelledby="sl-title">' +
      '<h2 id="sl-title">' + esc(t("results.shortlistTitle")) + '</h2>' +
      '<p class="muted">' + esc(t("results.shortlistLabel")) + '</p>' +
      '<details class="sl-picker" id="sl-picker"' + (state.shortlistSubmitted ? '' : ' open') + '>' +
        '<summary>' + esc(t("results.shortlistOpen")) + ' <span class="sl-count">' + esc(t("results.shortlistCount", { n: chosen.length })) + '</span></summary>' +
        '<div class="sl-list" role="group" aria-labelledby="sl-title">' +
          '<label class="sl-item sl-all"><input type="checkbox" id="sl-all" data-action="shortlist-all"' +
            (chosen.length === res.entries.length ? ' checked' : '') + '> <span>' + esc(t("results.shortlistSelectAll")) + '</span></label>' +
          res.entries.slice().sort(function (a, b) { return a.spec.shortName.localeCompare(b.spec.shortName); }).map(function (e) {
            return '<label class="sl-item"><input type="checkbox" id="sl-' + esc(e.spec.id) + '" data-action="shortlist-toggle" value="' + esc(e.spec.id) + '"' +
              (chosen.indexOf(e.spec.id) !== -1 ? ' checked' : '') + '> <span>' + esc(e.spec.shortName) +
              (e.spec.aliases && e.spec.aliases.length ? ' <span class="sl-alias">(' + esc(e.spec.aliases.join(", ")) + ')</span>' : '') + '</span></label>';
          }).join("") +
        '</div>' +
        '<button class="btn btn-primary" data-action="shortlist-submit">' + esc(t("results.shortlistSubmit")) + '</button>' +
      '</details>' +
      '<p class="muted small">' + esc(t("results.shortlistPrivacy")) + '</p>' +
      '<div id="shortlist-results">' + shortlistResults(res) + '</div>' +
    '</section>';
  }

  function shortlistResults(res) {
    if (!state.shortlistSubmitted) return "";
    var picked = state.shortlist.map(function (id) { return res.byId[id]; }).filter(Boolean)
      .sort(function (a, b) { return b.sim - a.sim; });
    if (!picked.length) return '<p class="banner banner-warn" role="note">' + esc(t("results.shortlistEmpty")) + '</p>';
    var best = picked.slice(0, 3);
    var hidden = best.filter(function (e) { return e.removedBy.length > 0; });
    return '<div class="sl-results">' +
      '<h3 class="sl-results-title">' + esc(t("results.shortlistResultTitle")) + '</h3>' +
      '<p class="banner banner-info" role="note">' + esc(t("results.shortlistOverall", { name: res.top[0].spec.shortName })) + '</p>' +
      (hidden.length ? '<p class="muted small">' + esc(t("results.shortlistHidden", { names: hidden.map(function (e) { return e.spec.shortName; }).join(", ") })) + '</p>' : '') +
      best.map(function (e, i) { return branchPanel(e, res, { lead: "#" + (i + 1) + " of your list" }); }).join("") +
      '<button class="btn btn-secondary" data-action="shortlist-edit">' + esc(t("results.shortlistEdit")) + '</button>' +
    '</div>';
  }

  function renderResults() {
    var res = state.results;
    if (!res || res.empty) {
      renderScreen("results",
        '<section class="card center"><h1 data-autofocus>' + esc(t("results.emptyTitle")) + '</h1>' +
        '<p>' + esc(t("results.emptyText")) + '</p>' +
        '<button class="btn btn-primary btn-lg" data-action="retake">' + esc(t("results.retakeFull")) + '</button></section>'
      );
      return;
    }

    var banners = [];
    if (res.roughRead) banners.push(["warn", t("results.roughRead"), "resume-skipped", t("results.roughReadButton")]);
    res.consistency.forEach(function (m) { banners.push(["warn", m]); });
    if (res.flat) banners.push(["warn", t("results.flat")]);
    if (res.answered < DATA.scoring.minAnsweredForConfidence) banners.push(["warn", t("results.fewAnswers")]);
    if (res.hiddenReasons.length) {
      banners.push(["info", t("results.hidden", {
        reasons: joinList(res.hiddenReasons.map(function (id) { return DATA.dealbreakers[id].label; })),
        names: joinList(res.hidden.slice(0, 3).map(function (h) { return h.spec.shortName; }))
      })]);
    }
    res.closePairs.forEach(function (p) {
      banners.push(["info", t("results.closePair", { a: p[0].spec.shortName, b: p[1].spec.shortName })]);
    });
    if (res.notes.indexOf("abroad") !== -1) banners.push(["info", t("results.abroad")]);

    var hm = res.honourable;
    var hmHtml = hm ? '<article class="result-card honourable" aria-labelledby="rc-hm">' +
        '<header class="rc-head"><span class="rank-badge small" aria-hidden="true">4</span>' +
          '<div class="rc-titles"><p class="eyebrow">' + esc(t("results.honourable")) + '</p>' +
          '<h2 id="rc-hm">' + esc(hm.spec.name) + '</h2>' +
          '<div class="rc-tags"><span class="tag ' + CATEGORY_CLASS[hm.spec.category] + '">' + esc(hm.spec.category) + '</span>' + bandPill(hm.band) + availabilityTag(hm.spec) + '</div></div>' +
        '</header>' + stabilityLine(hm, res) +
        '<details><summary>' + esc(t("results.honourableSummary")) + '</summary>' + resultBody(hm) + '</details>' +
      '</article>' : '';

    var snapshot = '<section class="card snapshot" aria-labelledby="snap-title">' +
      '<h2 id="snap-title">' + esc(t("results.snapshotTitle")) + '</h2>' +
      '<p class="muted">' + esc(t("results.snapshotSub")) + '</p>' +
      '<ul class="bars">' + res.traitSnapshot.map(function (tr) {
        var pct = Math.round(tr.value / DATA.scoring.scaleMax * 100);
        var word = t("results.strength." + (tr.value >= 4 ? "strong" : tr.value >= 3.25 ? "clear" : "moderate"));
        return '<li><div class="bar-label"><span>' + esc(tr.label) + '</span><span class="bar-word">' + esc(word) + '</span></div>' +
          '<div class="bar" role="img" aria-label="' + esc(tr.label + ": " + word) + '"><div class="bar-fill" style="width:' + pct + '%"></div></div></li>';
      }).join("") + '</ul></section>';

    renderScreen("results",
      '<section class="results-head">' +
        '<div class="results-mascot">' + mascotSVG("happy", "bounce") + '</div>' +
        '<h1 data-autofocus>' + esc(t("results.heading")) + '</h1>' +
        '<p class="timestamp">' + esc(t("results.stateTrait", { date: formatDate(state.completedAt || new Date()) })) + '</p>' +
      '</section>' +
      disclaimerBlock(t("results.disclaimer")) +
      (banners.length ? '<div class="banners">' + banners.map(function (b) {
        return '<p class="banner banner-' + b[0] + '" role="note">' + esc(b[1]) +
          (b[2] ? ' <button class="btn btn-small" data-action="' + b[2] + '">' + esc(b[3]) + '</button>' : '') + '</p>';
      }).join("") + '</div>' : '') +
      '<h2 class="section-title">' + esc(t("results.closestTitle")) + '</h2>' +
      '<p class="muted section-intro">' + esc(t("results.closestIntro")) + '</p>' +
      '<div class="results-grid">' + res.top.map(function (r) { return resultCard(r, res); }).join("") + '</div>' +
      hmHtml +
      familiesSection(res) +
      fitMapSection(res) +
      shortlistSection(res) +
      snapshot +
      ignoresPanel() +
      '<div class="actions no-print">' +
        '<button class="btn btn-secondary" data-action="retake">' + esc(t("results.retake")) + '</button>' +
        '<button class="btn btn-primary" data-action="copy">' + esc(t("results.copy")) + '</button>' +
        '<button class="btn btn-secondary" data-action="share">' + esc(t("results.share")) + '</button>' +
        '<button class="btn btn-secondary" data-action="print">' + esc(t("results.print")) + '</button>' +
        '<a class="btn btn-ghost" href="#method">' + esc(t("results.method")) + '</a>' +
      '</div>' +
      '<div class="copy-fallback no-print" hidden><label for="copy-text">' + esc(t("results.copyLabel")) + '</label><textarea id="copy-text" readonly rows="10"></textarea></div>' +
      '<p class="muted small">' + esc(t("results.generalIndia")) + '</p>' +
      feedbackBlock() +
      '<p class="support" role="note"><span aria-hidden="true">💬</span> ' + withHtml("results.support", { phone: '<a href="tel:14416">14416</a>' }) + '</p>'
    );
  }

  /* ---------- Copy my results (plain text) ---------- */
  function resultsText() {
    var res = state.results;
    var lines = [t("results.copyHeader"), t("results.answersOn", { date: formatDate(state.completedAt || new Date()) }), ""];
    res.top.forEach(function (r) {
      var adj = r.adjacent.length ? " (" + t("results.copyAdjacent") + ": " + r.adjacent.map(function (a) { return a.shortName; }).join(", ") + ")" : "";
      lines.push(r.rank + ". " + r.spec.shortName + " — " + t("results.bands." + r.band) + adj);
    });
    lines.push("", t("share.verdict"), t("results.disclaimer"));
    return lines.join("\n");
  }

  function copyResults() {
    var text = resultsText();
    var fallback = function () {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      ta.remove();
      if (ok) { track("results_copied"); showToast(t("results.copied")); return; }
      var box = main.querySelector(".copy-fallback");
      if (box) {
        box.hidden = false;
        var area = box.querySelector("textarea");
        area.value = text; area.focus(); area.select();
      }
      showToast(t("results.copyFallback"));
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { track("results_copied"); showToast(t("results.copied")); }, fallback);
    } else {
      fallback();
    }
  }

  /* ---------- Share card ---------- */
  function renderShare() {
    var res = state.results;
    if (!res || res.empty) { renderLanding(); return; }
    var listText = res.top.map(function (r) { return r.spec.shortName + " (" + t("results.bands." + r.band) + ")"; }).join(", ");
    var canFileShare = !!(navigator.share && navigator.canShare);

    renderScreen("share",
      '<section class="share-head"><h1 data-autofocus>' + esc(t("share.title")) + '</h1>' +
        '<p class="muted">' + esc(t("share.intro")) + '</p></section>' +
      '<div class="share-layout">' +
        '<div class="story-card" role="img" aria-label="' + esc(t("share.cardLabel", { list: listText })) + '">' +
          '<div class="sc-top"><span class="sc-brand">' + esc(t("appName")) + '</span><span class="sc-tag">' + esc(t("tagline")) + '</span></div>' +
          '<div class="sc-mascot">' + mascotSVG("happy") + '</div>' +
          '<p class="sc-label">' + esc(t("share.listTitle")) + '</p>' +
          '<ol class="sc-list">' + res.top.map(function (r) {
            return '<li><span class="sc-name">' + esc(r.spec.shortName) + '</span><span class="sc-band">' + esc(t("results.bands." + r.band)) + '</span></li>';
          }).join("") + '</ol>' +
          '<p class="sc-verdict">' + esc(t("share.verdict")) + '</p>' +
          '<p class="sc-sub">' + esc(t("share.subline")) + '</p>' +
        '</div>' +
        '<div class="share-actions">' +
          '<button class="btn btn-primary" data-action="download-image">' + esc(t("share.download")) + '</button>' +
          (canFileShare ? '<button class="btn btn-secondary" data-action="native-share">' + esc(t("share.nativeShare")) + '</button>' : '') +
          '<button class="btn btn-secondary" data-action="copy-from-share">' + esc(t("results.copy")) + '</button>' +
          '<button class="btn btn-ghost" data-action="back-to-results">' + esc(t("share.back")) + '</button>' +
          '<p class="muted small">' + esc(t("share.fallback")) + '</p>' +
          '<img class="generated" alt="' + esc(t("share.generatedAlt")) + '" hidden>' +
        '</div>' +
      '</div>'
    );
  }

  /** Draws the 1080×1920 story card using only built-in canvas APIs. */
  function drawShareCanvas() {
    var res = state.results;
    var W = 1080, H = 1920, P = 90;
    var c = document.createElement("canvas");
    c.width = W; c.height = H;
    var ctx = c.getContext("2d");
    var font = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans", Arial, sans-serif';

    var g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#0f766e"); g.addColorStop(1, "#0b2f3a");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.beginPath(); ctx.arc(W - 120, 260, 260, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(80, H - 380, 200, 0, Math.PI * 2); ctx.fill();

    ctx.textBaseline = "top";
    ctx.fillStyle = "#ffffff"; ctx.font = "800 64px " + font; ctx.fillText(t("appName"), P, P);
    ctx.fillStyle = "#b8e6df"; ctx.font = "500 38px " + font; ctx.fillText(t("tagline"), P, P + 84);

    drawMascot(ctx, W / 2, 470, 2.2);

    var y = 660;
    ctx.textAlign = "center";
    ctx.fillStyle = "#b8e6df"; ctx.font = "700 40px " + font;
    ctx.fillText(t("share.listTitle").toUpperCase(), W / 2, y); y += 90;

    res.top.forEach(function (r, i) {
      var boxH = 230;
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      roundRect(ctx, P, y, W - P * 2, boxH, 36); ctx.fill();
      ctx.fillStyle = "#fde68a"; ctx.font = "800 44px " + font;
      ctx.fillText(String(i + 1), W / 2, y + 22);
      ctx.fillStyle = "#ffffff"; ctx.font = "800 64px " + font;
      var name = r.spec.shortName;
      while (ctx.measureText(name).width > W - P * 2 - 60 && name.length > 4) name = name.slice(0, -2) + "…";
      ctx.fillText(name, W / 2, y + 76);
      var band = t("results.bands." + r.band);
      ctx.font = "700 36px " + font;
      var bw = ctx.measureText(band).width + 56;
      ctx.fillStyle = "#ffffff"; roundRect(ctx, W / 2 - bw / 2, y + 160, bw, 54, 27); ctx.fill();
      ctx.fillStyle = "#0b3b3a"; ctx.fillText(band, W / 2, y + 167);
      y += boxH + 34;
    });

    y += 40;
    ctx.fillStyle = "#fde68a"; ctx.font = "italic 800 64px " + font;
    ctx.fillText(t("share.verdict"), W / 2, y); y += 100;
    ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.font = "500 34px " + font;
    wrapText(ctx, t("share.subline"), W / 2, y, W - P * 2, 46);
    return c;
  }

  function drawMascot(ctx, cx, cy, s) {
    ctx.save(); ctx.translate(cx - 50 * s, cy - 60 * s); ctx.scale(s, s);
    ctx.strokeStyle = "#e6f6f3"; ctx.lineWidth = 4; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(50, 40); ctx.lineTo(50, 30); ctx.bezierCurveTo(50, 16, 30, 22, 28, 8);
    ctx.moveTo(50, 30); ctx.bezierCurveTo(50, 16, 70, 22, 72, 8); ctx.stroke();
    ctx.fillStyle = "#e6f6f3";
    [[28, 7], [72, 7]].forEach(function (p) { ctx.beginPath(); ctx.arc(p[0], p[1], 4, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = "#14b8a6"; ctx.beginPath(); ctx.arc(50, 70, 31, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#f0fdfa"; ctx.beginPath(); ctx.arc(50, 70, 24, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#12343b";
    [[41, 66], [59, 66]].forEach(function (p) { ctx.beginPath(); ctx.ellipse(p[0], p[1], 3, 4, 0, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = "rgba(244,114,182,0.55)";
    [[34, 75], [66, 75]].forEach(function (p) { ctx.beginPath(); ctx.arc(p[0], p[1], 3.5, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = "#12343b"; ctx.beginPath(); ctx.moveTo(40, 75); ctx.quadraticCurveTo(50, 90, 60, 75); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function wrapText(ctx, text, x, y, maxW, lh) {
    var words = String(text).split(" "), line = "";
    words.forEach(function (w) {
      var test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, x, y); y += lh; line = w; } else { line = test; }
    });
    if (line) { ctx.fillText(line, x, y); y += lh; }
    return y;
  }
  function canvasToBlob(canvas) {
    return new Promise(function (resolve) {
      if (canvas.toBlob) { canvas.toBlob(resolve, "image/png"); return; }
      var bin = atob(canvas.toDataURL("image/png").split(",")[1]);
      var arr = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      resolve(new Blob([arr], { type: "image/png" }));
    });
  }
  function downloadImage() {
    var canvas;
    try { canvas = drawShareCanvas(); } catch (e) { showToast(t("share.imageFailed")); return; }
    canvasToBlob(canvas).then(function (blob) {
      if (!blob) { showToast(t("share.imageFailed")); return; }
      var url = URL.createObjectURL(blob);
      var img = main.querySelector(".generated");
      if (img) { img.src = url; img.hidden = false; }
      var a = document.createElement("a");
      a.href = url; a.download = "fomomd-result.png";
      document.body.appendChild(a); a.click(); a.remove();
      track("sharecard_downloaded");
      showToast(t("share.imageReady"));
    });
  }
  function nativeShare() {
    canvasToBlob(drawShareCanvas()).then(function (blob) {
      var file = new File([blob], "fomomd-result.png", { type: "image/png" });
      var payload = { files: [file], title: t("appName"), text: t("share.shareText") };
      if (navigator.canShare && navigator.canShare(payload)) navigator.share(payload).catch(function () {});
      else downloadImage();
    });
  }

  /* ---------- About the method ---------- */
  function renderMethod() {
    var res = state.results && !state.results.empty ? state.results : null;
    var dims = DATA.dimensions;
    var runsPct = { runs: SENSITIVITY_RUNS, pct: Math.round(SENSITIVITY_JITTER * 100) };

    var table = '<div class="table-wrap" tabindex="0" role="region" aria-labelledby="profiles-caption">' +
      '<table class="profiles"><caption id="profiles-caption">' + esc(t("method.profilesTitle") + " (0–5)") + '</caption>' +
      '<thead><tr><th scope="col">Branch</th>' + dims.map(function (d, i) {
        return '<th scope="col"><abbr title="' + esc(d.label) + '">' + (i + 1) + '</abbr></th>';
      }).join("") + '</tr></thead><tbody>' +
      DATA.specialties.map(function (s) {
        return '<tr><th scope="row">' + esc(s.shortName) + '</th>' + dims.map(function (d) {
          return '<td>' + s.profile[d.id] + '</td>';
        }).join("") + '</tr>';
      }).join("") + '</tbody></table></div>';

    var sensitivity = res
      ? '<ul>' + res.top.concat(res.honourable ? [res.honourable] : []).map(function (r) {
          return '<li>' + esc(t("results.stability", { name: r.spec.shortName, k: res.stability.counts[r.spec.id], n: res.stability.runs })) + '</li>';
        }).join("") + '</ul>'
      : '<p>' + esc(t("method.sensitivityNone")) + '</p>';

    renderScreen("method",
      '<section class="method">' +
        '<h1 data-autofocus>' + esc(t("method.title")) + '</h1>' +
        '<p class="lede">' + esc(t("method.intro")) + '</p>' +
        '<section class="card"><h2>' + esc(t("method.dimsTitle")) + '</h2><p>' + esc(t("method.dimsIntro")) + '</p>' +
          '<ol class="dims">' + dims.map(function (d) {
            return '<li><strong>' + esc(d.label) + '</strong> — ' + esc(d.description) + '</li>';
          }).join("") + '</ol>' + termTips(["continuity of care", "on-call", "private practice"]) + '</section>' +
        '<section class="card"><h2>' + esc(t("method.profilesTitle")) + '</h2>' +
          '<p class="label-warn">' + esc(t("method.profilesLabel")) + '</p>' +
          '<p class="muted small">' + esc(t("method.profilesNote")) + '</p>' + table + '</section>' +
        '<section class="card"><h2>' + esc(t("method.evidenceTitle")) + '</h2>' +
          t("method.evidence").map(function (p) { return '<p>' + esc(p) + '</p>'; }).join("") +
          '<h3 class="sources-title">' + esc(t("method.sourcesTitle")) + '</h3>' +
          '<p class="muted small">' + esc(t("method.sourcesIntro")) + '</p>' +
          '<ol class="sources">' + (DATA.statistics || []).map(function (st) {
            return '<li><p>' + esc(t("method.sourceLine", { claim: st.claim, country: st.country, year: st.year })) + '</p>' +
              '<p class="citation">' + esc(st.source) + '</p></li>';
          }).join("") + '</ol></section>' +
        '<section class="card"><h2>' + esc(t("method.scoringTitle")) + '</h2><ul>' +
          t("method.scoring").map(function (p) { return '<li>' + esc(fill(p, runsPct)) + '</li>'; }).join("") + '</ul></section>' +
        '<section class="card"><h2>' + esc(t("method.sendsTitle")) + '</h2>' +
          (analyticsOn
            ? '<p>' + esc(t("method.sendsIntro")) + '</p><ul>' +
              t("method.sendsList").map(function (x) { return '<li>' + esc(x) + '</li>'; }).join("") +
              '</ul><p>' + esc(t("method.sendsOutro")) + '</p>'
            : '<p>' + esc(t("method.sendsNone")) + '</p>') + '</section>' +
        '<section class="card"><h2>' + esc(t("method.sensitivityTitle")) + '</h2>' + sensitivity + '</section>' +
        ignoresPanel() +
        '<div class="actions">' +
          '<button class="btn btn-secondary" data-action="close-method">' + esc(t("method.back")) + '</button>' +
          (res ? '' : '<button class="btn btn-primary" data-action="start">' + esc(t("method.startQuiz")) + '</button>') +
        '</div>' +
      '</section>'
    );
  }

  function openMethodFromHash() {
    if (location.hash !== "#method") return false;
    if (state.screen !== "method") state.returnTo = state.screen;
    renderMethod();
    return true;
  }
  function closeMethod() {
    if (history.replaceState) history.replaceState(null, "", location.pathname + location.search);
    var back = state.returnTo;
    if (back === "results" && state.results) renderResults();
    else if (back === "question") renderQuestion();
    else if (back === "round") renderRoundIntro(QUESTIONS[state.qIndex].roundIndex);
    else if (back === "share" && state.results) renderShare();
    else renderLanding();
  }

  /* ---------- Events ---------- */
  function startQuiz() {
    if (location.hash === "#method" && history.replaceState) history.replaceState(null, "", location.pathname + location.search);
    state.answers = {}; state.qIndex = 0; state.results = null; state.completedAt = null; state.busy = false;
    state.shortlist = []; state.shortlistSubmitted = false;
    state.feedbackDone = false; state.abandonSent = false;
    track("quiz_start");
    renderRoundIntro(0);
  }

  main.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-action]");
    if (!btn) return;
    if (btn.tagName === "INPUT" && e.target !== btn) return;   // label click already toggles the box
    switch (btn.getAttribute("data-action")) {
      case "start": startQuiz(); break;
      case "begin-round": renderQuestion(); break;
      case "choose": choose(btn.getAttribute("data-option"), btn); break;
      case "confirm-slider": confirmSlider(); break;
      case "skip":
        if (state.busy) return;
        delete state.answers[QUESTIONS[state.qIndex].id];
        showToast(t("question.skipped"));
        advance();
        break;
      case "back":
        if (state.busy || state.qIndex === 0) return;
        state.qIndex--; renderQuestion();
        break;
      case "term":
      case "not-me":
        var target = document.getElementById(btn.getAttribute("aria-controls"));
        if (!target) return;
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", open ? "false" : "true");
        target.hidden = open;
        break;
      case "shortlist-toggle":
      case "shortlist-all": {
        var res0 = state.results;
        if (!res0) return;
        if (btn.getAttribute("data-action") === "shortlist-all") {
          state.shortlist = btn.checked ? res0.entries.map(function (e) { return e.spec.id; }) : [];
          main.querySelectorAll('[data-action="shortlist-toggle"]').forEach(function (cb) { cb.checked = btn.checked; });
        } else {
          var id = btn.value;
          var at = state.shortlist.indexOf(id);
          if (btn.checked && at === -1) state.shortlist.push(id);
          if (!btn.checked && at !== -1) state.shortlist.splice(at, 1);
          var all = main.querySelector("#sl-all");
          if (all) all.checked = state.shortlist.length === res0.entries.length;
        }
        var count = main.querySelector(".sl-count");
        if (count) count.textContent = t("results.shortlistCount", { n: state.shortlist.length });
        break;
      }
      case "shortlist-submit": {
        track("shortlist_used");
        state.shortlistSubmitted = true;
        var box = main.querySelector("#shortlist-results");
        if (box) {
          box.innerHTML = shortlistResults(state.results);
          var picker = main.querySelector("#sl-picker");
          if (picker && state.shortlist.length) picker.open = false;
          var firstPanel = box.querySelector(".sl-results-title");
          if (firstPanel) { firstPanel.setAttribute("tabindex", "-1"); firstPanel.focus({ preventScroll: true }); firstPanel.scrollIntoView({ block: "center" }); }
        }
        break;
      }
      case "shortlist-edit": {
        var picker2 = main.querySelector("#sl-picker");
        if (picker2) { picker2.open = true; picker2.querySelector("summary").focus(); }
        break;
      }
      case "resume-skipped": {
        var firstSkipped = -1;
        for (var qi = 0; qi < QUESTIONS.length; qi++) { if (!state.answers[QUESTIONS[qi].id]) { firstSkipped = qi; break; } }
        if (firstSkipped === -1) return;
        state.qIndex = firstSkipped;
        renderQuestion();
        break;
      }
      case "feedback": {
        var value = btn.getAttribute("data-value");
        track(value === "useful" ? "feedback_useful" : "feedback_not_useful");
        state.feedbackDone = true;
        var block = main.querySelector("#feedback-block");
        if (block) {
          block.innerHTML = '<p class="fb-thanks" role="status">' +
            esc(value === "useful" ? t("results.feedbackThanks") : t("results.feedbackThanksNo")) + '</p>';
        }
        break;
      }
      case "retake": track("retake_clicked"); startQuiz(); break;
      case "copy": copyResults(); break;
      case "copy-from-share": copyResults(); break;
      case "share": renderShare(); break;
      case "print": window.print(); break;
      case "download-image": downloadImage(); break;
      case "native-share": nativeShare(); break;
      case "back-to-results": renderResults(); break;
      case "close-method": closeMethod(); break;
    }
  });

  document.addEventListener("keydown", function (e) {
    if (state.screen !== "question" || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.target && e.target.matches && e.target.matches("input, textarea, button.term-btn")) return;
    var n = parseInt(e.key, 10);
    if (!n) return;
    var buttons = main.querySelectorAll(".option");
    if (buttons[n - 1]) { e.preventDefault(); buttons[n - 1].focus(); buttons[n - 1].click(); }
  });

  // Fit map opened (delegated, because the panel is re-rendered each time).
  main.addEventListener("toggle", function (e) {
    if (e.target && e.target.classList && e.target.classList.contains("fit-map") && e.target.open) track("fitmap_opened");
  }, true);

  // Left mid-quiz: records only how far they got, once per session.
  function reportAbandon() {
    if (state.abandonSent || state.screen !== "question") return;
    state.abandonSent = true;
    track("quiz_abandoned_q" + (state.qIndex + 1));
  }
  window.addEventListener("pagehide", reportAbandon);
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") reportAbandon(); });

  window.addEventListener("hashchange", openMethodFromHash);
  window.addEventListener("beforeprint", function () {
    main.querySelectorAll("details").forEach(function (d) { d.setAttribute("open", ""); });
  });

  // Offline support after the first visit (only works over http/https).
  // (Silently skipped where service workers aren't allowed, e.g. sandboxed embeds.)
  try {
    if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
      window.addEventListener("load", function () {
        try { navigator.serviceWorker.register("sw.js").catch(function () {}); } catch (e) { /* not allowed here */ }
      });
    }
  } catch (e) { /* not allowed here */ }

  renderChrome();
  if (!openMethodFromHash()) renderLanding();
})();
