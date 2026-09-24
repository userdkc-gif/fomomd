/* =====================================================================
   FOMOMD — data.js
   ---------------------------------------------------------------------
   Everything the app SAYS and everything it SCORES lives in this file:
     1. Content metadata (version, review, statistics register, options)
     2. UI strings by language (+ glossary for the (i) tooltips)
     3. Content translations (optional overlays for other languages)
     4. The 14 trait dimensions
     5. Scoring settings
     6. Dealbreakers
     7. Questions (4 rounds, 28 questions)
     8. Consistency-check pairs
     9. Specialty profiles (33 branches)

   EDITING SAFELY (for non-coders):
   - Only change text between quotation marks "like this".
   - If your text needs a quote mark, use a single quote ' instead of ".
   - Keep every comma, bracket and colon exactly where it is.
   - After editing, open index.html and check it still loads. Then open
     dev/audit.html (or type runPersonaTests() in the browser console).

   HARD RULES — NEVER ADD:
   - ranks, NEET-PG marks, cutoffs, college/seat predictions
   - salary or income numbers, or any invented statistics
   - any statistic without its country AND year in the same sentence
     (and register it in `statistics` below)
   TONE RULE:
   - FOMOMD must reduce anxiety. No urgency, countdowns, "don't miss out",
     "last chance" or fear-based phrasing anywhere.
   ===================================================================== */

window.FOMOMD_DATA = {

  /* ------------------------------------------------------------------
     1. CONTENT METADATA
     ------------------------------------------------------------------ */
  contentVersion: "1.8",
  lastReviewed: "2026-09-24",   // date of the last clinical content review (YYYY-MM-DD)
  reviewerName: "Dr. Karthik Deegutla, Anaesthesiologist",   // shown in the footer

  // Every statistic displayed anywhere in the app must be registered here
  // with its country and year. dev/audit.html flags incomplete entries.
  statistics: [
    {
      id: "mspiPredictiveValidity2009",
      where: "strings.en.results.disclaimer",
      // `mustContain` lets dev/audit.html confirm the displayed sentence
      // really carries the country and year.
      claim: "The MSPI correctly predicted medical students' eventual specialty about 58% of the time.",
      value: "about 58%",
      country: "USA",
      countryLabels: ["US", "USA", "United States"],
      year: 2009,
      source: "Glavin K, Richard GV, Porfeli EJ. Predictive validity of the Medical Specialty Preference Inventory. Journal of Vocational Behavior, 2009.",
      note: "Wording approved by the product owner (Dr. Karthik Deegutla), 2026-09-16."
    }
  ],

  // OPTIONAL — privacy-friendly analytics (GoatCounter), cookieless.
  // To enable: put your GoatCounter code below (e.g. "fomomd" for
  // fomomd.goatcounter.com) and set enabled: true. A footer notice and the
  // "What FOMOMD sends" section on the method page appear automatically.
  //
  // FOMOMD can only ever send the fixed event names allowlisted in app.js
  // (ALLOWED_EVENTS): quiz_start, round_complete_1..4, quiz_abandoned_qN
  // (the question number reached, nothing else), results_reached,
  // fitmap_opened, shortlist_used, sharecard_downloaded, results_copied,
  // retake_clicked, feedback_useful, feedback_not_useful.
  // It NEVER sends answers, traits, results, branch names or free text —
  // track() drops anything not on that list, and dev/audit.html enforces it.
  analytics: {
    enabled: true,
    goatcounterCode: "fomomd"   // dashboard: https://fomomd.goatcounter.com
  },

  // Feedback form (Tally). Opened in a new tab, always bare: the app never
  // appends answers, results or any query parameter to it, and the link
  // carries rel="noreferrer" so not even the page URL is passed along.
  // Leave empty to hide every feedback link.
  feedbackUrl: "https://tally.so/r/VLg9lM",

  officialLinks: {
    mcc: "https://mcc.nic.in"
  },

  /* ------------------------------------------------------------------
     2. UI STRINGS BY LANGUAGE
     To add Hindi later: copy the whole `en: { ... }` block, rename it
     `hi`, translate the text, and open the app with ?lang=hi.
     Words in {curly braces} are filled in by the app — keep them as-is.
     ------------------------------------------------------------------ */
  defaultLanguage: "en",
  strings: {
    en: {
      appName: "FOMOMD",
      headerSubtitle: "Find your branch. Skip the regret.",
      tagline: "Choose your branch. Skip the regret.",
      headerNote: "No login · nothing saved",
      skipLink: "Skip to content",
      noscript: "FOMOMD needs JavaScript switched on. Nothing is sent anywhere — everything runs on your own device.",

      landing: {
        line: "Many doctors wonder if they picked the right branch. FOMOMD helps you think it through calmly before you choose.",
        metaTime: "About 6–8 minutes, {n} questions",
        metaPrivacy: "No login. Nothing about you is saved.",
        metaPrivacyAnalytics: "No login. Your answers are never saved or sent.",
        metaBranches: "3 branches worth exploring, from {n} options",
        start: "Start",
        stateTrait: "Answer as your usual self over the last year — not how you feel this week. Exam fatigue can make almost anyone crave a quiet life.",
        howTitle: "How it works",
        howSteps: [
          "<strong>4 short rounds</strong> — instincts, a day in your life, pressure, and the long game. Take your time; there are no right answers.",
          "<strong>We never name branches</strong> while you answer, so prestige doesn't sway you.",
          "<strong>You get 3 branches worth exploring</strong>, each with why it may fit, where it may not, an honest reality check and questions to ask a resident."
        ],
        never: "<strong>We never ask for</strong> your rank, marks or cutoffs, and we never predict colleges or seats.",
        methodLink: "About the method",
        disclaimerLabel: "Please read:",
        disclaimer: "This tool offers guidance based on your personality, interests and work-style — not a prediction and not medical or career advice. It does NOT use your rank, marks or cutoffs and does NOT predict colleges or seats. Personality–specialty links are helpful but modest; treat this as a conversation-starter. Before deciding, speak to residents and consultants in your shortlisted branches and to a trusted mentor."
      },

      round: {
        roundOf: "Round {i} of {n}",
        questionsInRound: "{n} questions in this round",
        letsGo: "Let's begin",
        continue: "Continue"
      },

      question: {
        questionOf: "Question {i} of {n}",
        honestCheck: "Honest check",
        progressLabel: "Quiz progress",
        lockIn: "Lock it in",
        back: "← Back",
        skip: "Skip this one",
        skipped: "Skipped — that's fine",
        kbdHint: "Tip: press {keys} on a keyboard.",
        sliderValueText: "{v} out of {max} ({min} means {minLabel}; {max} means {maxLabel})",
        termButton: "What does '{term}' mean?"
      },

      computing: "Thinking through your answers across {n} branches…",

      results: {
        heading: "3 Branches Worth Exploring",
        answersOn: "Your answers on {date}",
        disclaimer: "FOMOMD is an educational self-reflection tool, not career counselling. It does NOT consider your rank, seat availability, finances, service bonds, location or family situation. In a 2009 US study, a well-known specialty-interest questionnaire (the AAMC's MSPI) correctly predicted medical students' eventual specialty about 58% of the time — even the best tools of this kind are only moderately accurate. Preferences often change with clinical exposure — retake this in a few months.",
        bands: { strong: "Strong fit", good: "Good fit — explore", possible: "Possible fit" },
        rankLabel: "Branch {i} of 3",
        honourable: "Also worth a look",
        honourableSummary: "Why it came close, where it may not fit, and the reality check",
        why: "Why this fits you",
        notFit: "Where it may NOT fit you",
        reality: "Reality check",
        askResident: "Talk to a resident about…",
        inIndia: "In India",
        adjacent: "Adjacent branches",
        adjacentHint: "Related branches you may also want to read about.",
        stability: "Stability check: {name} stayed in your top 3 in {k} of {n} checks.",
        notMe: "This doesn't sound like me",
        notMeReply: "Trust your own reading. Retake later or explore your #2 and #3 more deeply.",
        closePair: "{a} and {b}: these two are very close — explore both.",
        hidden: "We hid some branches because you told us {reasons}. If that's flexible, your results may change (for example: {names}).",
        flat: "Your answers didn't show strong preferences — results are less certain. Consider getting more clinical exposure and retaking.",
        fewAnswers: "You skipped several questions, so these results are less certain than usual. You can retake whenever you like.",
        abroad: "You said working abroad someday matters to you. No Indian MD/MS branch is automatically recognised abroad; every country sets its own licensing exams, registration and training-equivalence rules, and these change. Residents and consultants who have made that move are the best people to ask.",
        generalIndia: "Seat availability, DNB options and regulations change over time — check current NMC, NBEMS and counselling information.",
        whyIntro: "You leaned clearly towards {traits} — {branch} often suits people with that pull.",
        whyNone: "None of your clearest leanings line up with this branch's core traits; it came up because your overall pattern is broadly similar. Look at it with a critical eye.",
        conflict: "You leaned towards {user}, but {conflict}",
        conflictNeutral: "Your answers were fairly neutral about {trait}, but {conflict} Think about how that would feel week after week.",
        conflictMild: "You leaned slightly towards {user}, but {conflict}",
        conflictGap: "Your answers matched this branch closely. The biggest gap is {trait}: this branch demands even more of it than your answers showed, day after day.",
        conflictGapLow: "Your answers matched this branch closely. One gap: it offers even less of {trait} than your answers suggested you'd want.",
        conflictNone: "Nothing in your answers clashed strongly with this branch — so read the reality check closely and test it against real clinical exposure.",
        roughRead: "You skipped several questions, so this is a rough read. Go back and answer them for a sharper result.",
        roughReadButton: "Go to my first skipped question",
        thinNote: "This is based on only a couple of your answers.",
        stateTrait: "You took this on {date}. If you were exhausted or anxious today, your answers may lean toward calmer options. Retake it in a few weeks and see if the picture holds.",
        outlook: {
          terminal: "Long-term: independent practice is realistic after your degree.",
          "hospital-based": "Long-term: a full consultant career, but practised within a hospital rather than a solo clinic.",
          "often-paired": "Long-term: commonly paired with a DM/MCh for consultant practice in larger cities.",
          institutional: "Long-term: mainly teaching, labs, research, industry or public health systems."
        },
        alsoCalled: "Also called: {names}",
        availability: {
          restrictedTag: "Restricted entry",
          restrictedNote: "Restricted entry — mainly armed forces or designated institutes; not usually available through general counselling.",
          restrictedTopFive: "This fits your answers well. It's only worth pursuing if you're eligible through the armed forces route.",
          limitedTag: "Limited centres",
          limitedNote: "Offered in relatively few centres — check what's actually on offer in your counselling."
        },
        closestTitle: "Your closest 3",
        closestIntro: "The three branches whose day-to-day work best matches how you answered.",
        whoThrives: "Who thrives here",
        familiesTitle: "Best fit in every family",
        familiesIntro: "Good fits exist in every part of medicine. Here's your strongest match in each.",
        mapTitle: "Your full fit map",
        mapIntro: "Every branch, ranked by how well it fits your answers.",
        mapCalm: "Many excellent doctors trained in a branch they hadn't first imagined. Fit grows with the work you do in it.",
        mapOpen: "Show all {n} branches",
        mapHiddenTitle: "Hidden by your answers about blood, nights or patient contact",
        mapHiddenIntro: "You ruled these out earlier, so they are not ranked above. They are listed in case that changes.",
        shortlistTitle: "Check the branches you can actually consider",
        shortlistLabel: "You know your options better than any tool. Tell us what's on your list.",
        shortlistOpen: "Choose your branches",
        shortlistSelectAll: "Select all",
        shortlistCount: "{n} selected",
        shortlistSubmit: "Show my best fits",
        shortlistEdit: "Change my list",
        shortlistEmpty: "Pick at least one branch to compare.",
        shortlistResultTitle: "Your best fits among your options",
        shortlistOverall: "Your overall #1 was {name}; here's how your options compare.",
        shortlistHidden: "{names} — you ruled this out earlier in the quiz, but it is on your list, so it is ranked here too.",
        shortlistPrivacy: "Your list stays in this page only. Nothing is sent or saved, and FOMOMD never asks for your rank, marks or college.",
        feedbackTitle: "Was this useful?",
        feedbackYes: "👍 Yes",
        feedbackNo: "👎 Not really",
        feedbackThanks: "Thank you — noted.",
        feedbackThanksNo: "Thank you — that's genuinely useful. Tell us what felt off and I'll fix it.",
        feedbackForm: "Tell us what felt off",
        feedbackQuiet: "Something wrong? Tell us.",
        feedbackNewTab: "opens in a new tab",
        snapshotTitle: "Your trait snapshot",
        snapshotSub: "Your five clearest leanings, based on today's answers.",
        strength: { strong: "Strong", clear: "Clear", moderate: "Moderate" },
        retake: "↺ Retake",
        copy: "Copy my results",
        share: "Share my result card",
        print: "Print / Save",
        method: "About the method",
        copied: "Copied ✓",
        copyFallback: "Couldn't copy automatically — the text is below. Select it and copy.",
        copyLabel: "Your results as plain text",
        copyHeader: "FOMOMD — 3 branches worth exploring",
        copyAdjacent: "adjacent",
        ignoresTitle: "What FOMOMD deliberately ignores",
        ignoresIntro: "These matter a lot for your decision, but FOMOMD does not (and should not) weigh them for you:",
        ignoresItems: [
          "Your rank and cutoffs",
          "Seat availability",
          "Fees and your finances",
          "State service bonds and seat-leaving penalties — these can run to several lakh rupees and multi-year service. Check your state's counselling brochure carefully.",
          "Location — distance from home, city, language",
          "Family obligations",
          "Workplace safety in the hospitals you may join"
        ],
        ignoresOfficial: "For official information, see the Medical Counselling Committee at {link}, and check your state counselling authority's website and brochure.",
        support: "Counselling season is stressful. If you're feeling overwhelmed, talk to someone you trust. You can also call Tele-MANAS, India's national mental-health helpline, on {phone} — free, confidential and available around the clock.",
        emptyTitle: "Let's try that again",
        emptyText: "Every question was skipped, so there's nothing to reflect on yet. Whenever you're ready, it takes a few minutes.",
        retakeFull: "Retake the quiz"
      },

      share: {
        title: "Your result card",
        intro: "Portrait size for stories and status updates. It shows only your 3 branches and fit bands — none of your answers.",
        listTitle: "3 branches worth exploring",
        verdict: "Guidance, not a verdict.",
        subline: "An educational self-reflection tool — not career counselling.",
        cardLabel: "Result card listing three branches worth exploring: {list}",
        download: "Download image",
        nativeShare: "Share…",
        back: "← Back to results",
        fallback: "Download not working on your phone? Take a screenshot of the card, long-press the generated image below, or use 'Copy my results' instead.",
        generatedAlt: "Generated FOMOMD result card image",
        imageReady: "Image ready ✓",
        imageFailed: "Couldn't create the image — please screenshot the card or copy your results.",
        shareText: "My FOMOMD reflection — guidance, not a verdict."
      },

      method: {
        title: "About the method",
        intro: "FOMOMD is a structured self-reflection exercise. Here is exactly how it works and where its limits are.",
        dimsTitle: "The 14 dimensions",
        dimsIntro: "Every question nudges one or more of these dimensions. Every branch has an estimated score on each.",
        profilesTitle: "Branch profiles",
        profilesLabel: "Expert-estimated; not yet validated in Indian students.",
        profilesNote: "Scores run from 0 (very little of this) to 5 (a great deal). Column numbers match the dimension list above.",
        evidenceTitle: "The evidence base, and its limits",
        evidence: [
          "Research on how personality, interests and work-style relate to specialty choice comes mostly from North America and Europe. It finds real but modest links: doctors in different specialties differ somewhat on average, but there is a lot of overlap, and many people thrive in branches that don't 'fit their type'.",
          "Preferences often change during internship and training as you get clinical exposure. FOMOMD reflects how you think today, not who you will become.",
          "FOMOMD's branch profiles were estimated by reasoning about day-to-day work in each branch. They have not yet been tested against the experiences of Indian residents and consultants.",
          "Results are shown as broad fit bands rather than percentages, because a precise number would suggest more certainty than this method has."
        ],
        sourcesTitle: "Sources for statistics shown in FOMOMD",
        sourcesIntro: "Every statistic in the app is listed here with its country, year and full citation.",
        sourceLine: "{claim} ({country}, {year})",
        scoringTitle: "How scoring works",
        scoring: [
          "Your answers build a score from 0 to 5 on each dimension. A dimension measured by only a few questions is pulled gently towards the middle, so a single answer can't make it look extreme.",
          "Dealbreakers (blood, nights, the need for patient contact) remove branches completely.",
          "Your pattern is compared with each branch using weighted cosine similarity — it looks at the shape of your preferences, not their size. Dimensions that separate branches well count a little more.",
          "A few questions carry small, capped interest nudges (for example, wanting to care for children). Two very niche defence-linked branches need a slightly stronger fit before they appear.",
          "Magnitude check: cosine similarity ignores how strong your preferences are, so FOMOMD separately checks whether your answers were very flat and tells you when results are less certain.",
          "Sensitivity check: your answers are re-scored {runs} times with every dimension weight randomly shifted by up to ±{pct}%. The stability line under each result shows how often that branch stayed in your top 3."
        ],
        sendsTitle: "What FOMOMD sends",
        sendsNone: "Nothing. There is no analytics, no backend and no account. Your answers stay in this browser tab and disappear when you close it.",
        sendsIntro: "Anonymous, cookie-free counts through GoatCounter, so we can see where people get stuck and whether the tool helps. Your answers, traits, results and branch names are never sent, and neither is any free text. This is the complete list of what can be sent:",
        sendsList: [
          "A page view when the page loads",
          "quiz_start — the quiz was started",
          "round_complete_1 … round_complete_4 — a round was finished",
          "quiz_abandoned_qN — someone left mid-quiz, and the question number they had reached (nothing about the answers)",
          "results_reached — the results page was shown",
          "fitmap_opened, shortlist_used, sharecard_downloaded, results_copied, retake_clicked — a feature was used",
          "feedback_useful / feedback_not_useful — the thumbs button under the results"
        ],
        sendsOutro: "Each of those is sent as a bare name with nothing attached. The list is enforced in code: app.js keeps an allowlist and drops anything not on it, and the audit page checks every call against it.",
        sensitivityTitle: "Your sensitivity check",
        sensitivityNone: "Take the quiz first — your sensitivity check will appear here and on your results page.",
        back: "← Back",
        startQuiz: "Start the quiz"
      },

      listAnd: "and",
      dateLocale: "en-IN",

      footer: {
        line: "{app} · Content v{version} · Last reviewed: {date} · Reviewed by: {name}",
        pending: "pending",
        beta: "beta",
        betaNote: "New tool — if anything looks wrong or unfair, tell us.",
        privacy: "Guidance, not counselling. FOMOMD never asks for rank, marks or cutoffs, never predicts colleges or seats, and nothing you answer leaves this page.",
        privacyAnalytics: "Guidance, not counselling. FOMOMD never asks for rank, marks or cutoffs and never predicts colleges or seats. Your answers and results never leave this page; we count anonymous visits and a few actions, such as reaching the results, to see where people get stuck.",
        analytics: "Anonymous, cookie-free visit counts only.",
        feedback: "Is something wrong or misleading? Tell us."
      },

      mascotLines: [
        "Go with your gut.",
        "No wrong answers here.",
        "Think of a normal Tuesday, not a highlight reel.",
        "Both paths are respectable.",
        "Be honest with future-you.",
        "Take your time.",
        "What would you enjoy on a tired day?",
        "Forget prestige — what fits you?"
      ],
      feedbackLines: ["Got it ✓", "Noted ✓", "Got it ✓", "Thanks ✓"],

      // Glossary for the (i) buttons. `detect: true` means the term is also
      // explained automatically when it appears in results text.
      glossary: {
        "OPD": { def: "Outpatient department — the clinic where patients are seen without being admitted.", detect: true },
        "on-call": { def: "Being available outside normal hours (often nights or weekends) to handle emergencies, either in the hospital or reachable by phone.", detect: true },
        "continuity of care": { def: "Looking after the same patient over a long time, rather than seeing them once and handing over." },
        "resus bay": { def: "The resuscitation area of the emergency department, where the sickest, most unstable patients are treated first." },
        "ICU": { def: "Intensive care unit — for critically ill patients who need close monitoring and organ support.", detect: true },
        "medicolegal": { def: "Relating to the law — complaints, consumer cases, court work, or records that may be legally examined.", detect: true },
        "consultant": { def: "A fully trained specialist who leads patient care and supervises residents." },
        "private practice": { def: "Seeing patients in your own clinic or setup, rather than only as a salaried hospital doctor." },
        "DNB": { def: "Diplomate of National Board — a postgraduate specialist qualification awarded by NBEMS. Check current NMC rules on equivalence for your specific plans.", detect: true },
        "NBEMS": { def: "National Board of Examinations in Medical Sciences — the body that runs DNB training and several national medical exams.", detect: true },
        "DM": { def: "Doctorate of Medicine — a super-specialty degree taken after MD, e.g. cardiology or nephrology.", detect: true },
        "MCh": { def: "Magister Chirurgiae — a super-specialty surgical degree taken after MS, e.g. neurosurgery or urology.", detect: true },
        "MRCEM": { def: "Membership of the Royal College of Emergency Medicine (UK) — an example of an extra exam some emergency physicians take.", detect: true },
        "teleradiology": { def: "Reporting scans remotely for hospitals or diagnostic centres elsewhere.", detect: true },
        "apheresis": { def: "A procedure that separates blood components — for example, collecting platelets or removing harmful substances from the blood.", detect: true },
        "theranostics": { def: "Using radioactive tracers both to find and to treat certain diseases, such as some cancers.", detect: true },
        "pharmacovigilance": { def: "Monitoring the safety of medicines once they are in use.", detect: true }
      }
    }
  },

  /* ------------------------------------------------------------------
     3. CONTENT TRANSLATIONS (optional)
     Question, round, dimension and specialty text is written in English
     below. To translate it, add an overlay here — only the fields you
     include are replaced. Example:
       hi: {
         rounds: { instincts: { title: "...", intro: "..." } },
         questions: { q1: { prompt: "...", options: { a: "...", b: "..." } } },
         dimensions: { proc: { label: "..." } },
         specialties: { derm: { realityCheck: "..." } }
       }
     ------------------------------------------------------------------ */
  translations: {},

  /* ------------------------------------------------------------------
     4. TRAIT DIMENSIONS (14)
     description        : plain-English meaning (About the method page)
     userPhrase/lowPhrase: how we describe the user's leaning
     highFit/lowFit     : generic fallback lines for "Why this fits"
     conflictHigh       : branch is HIGH here but the user leaned low
     conflictLow        : branch is LOW here but the user leaned high
     importance         : scoring weight (1.2 strong, 0.8 weak)
     ------------------------------------------------------------------ */
  dimensions: [
    { id: "proc", label: "Procedural / hands-on", importance: 1.2,
      description: "How much you enjoy doing things with your hands — procedures, operations, interventions.",
      userPhrase: "hands-on, procedural work", lowPhrase: "thinking- and talking-based work over procedures",
      highFit: "Hands-on procedures are a real part of the everyday work.",
      lowFit: "Procedures play only a small role — your value comes from thinking and communicating.",
      conflictHigh: "this branch involves a lot of hands-on procedural work.",
      conflictLow: "this branch offers relatively few hands-on procedures." },
    { id: "acuity", label: "Acuity / adrenaline", importance: 1.2,
      description: "How comfortable you are with emergencies and unstable patients who need decisions in minutes.",
      userPhrase: "acute, fast-moving situations", lowPhrase: "calmer work with fewer emergencies",
      highFit: "Acute, time-critical decisions are a regular part of the day.",
      lowFit: "True emergencies are relatively uncommon, so the pace is steadier.",
      conflictHigh: "this branch regularly involves emergencies and unstable patients.",
      conflictLow: "this branch rarely has the adrenaline of acute emergencies." },
    { id: "patient", label: "Patient interaction", importance: 1.2,
      description: "How much of your day you want to spend talking with patients and families.",
      userPhrase: "deep conversations with patients", lowPhrase: "work with less face-to-face patient time",
      highFit: "Talking with patients and families is at the heart of the job.",
      lowFit: "Much of the work happens away from the bedside, with less face-to-face patient time.",
      conflictHigh: "this branch involves a lot of direct conversation with patients and families.",
      conflictLow: "this branch involves limited direct patient contact." },
    { id: "continuity", label: "Long-term continuity", importance: 1.0,
      description: "Whether you want to follow the same patients over months or years (continuity of care).",
      userPhrase: "following patients over the long term", lowPhrase: "episodic care where you contribute and hand over",
      highFit: "You often follow the same patients over months or years.",
      lowFit: "Care tends to be episodic — you contribute at a key moment and hand over.",
      conflictHigh: "this branch often means following the same patients for years.",
      conflictLow: "care here is usually episodic, so you rarely follow patients long-term." },
    { id: "dx", label: "Diagnostic puzzle-solving", importance: 1.0,
      description: "How much you enjoy piecing clues together to work out what is really going on.",
      userPhrase: "diagnostic puzzle-solving", lowPhrase: "clearly defined tasks over open-ended puzzles",
      highFit: "Diagnostic reasoning — weighing clues to reach an answer — is central.",
      lowFit: "The clinical question is often already framed, so the focus is on doing it well.",
      conflictHigh: "this branch leans heavily on open-ended diagnostic reasoning.",
      conflictLow: "this branch involves less open-ended diagnostic puzzle-solving." },
    { id: "visual", label: "Visual pattern recognition", importance: 1.2,
      description: "How much you enjoy reading images, slides, skin lesions and other visual patterns.",
      userPhrase: "visual pattern recognition", lowPhrase: "work that relies less on images and morphology",
      highFit: "Recognising visual patterns — lesions, images or slides — is a core daily skill.",
      lowFit: "The work leans less on image or pattern recognition.",
      conflictHigh: "this branch relies heavily on reading images, slides or visual patterns.",
      conflictLow: "this branch relies little on visual pattern recognition." },
    { id: "ambiguity", label: "Comfort with uncertainty", importance: 0.8,
      description: "How comfortable you are deciding without complete information or a clear protocol.",
      userPhrase: "comfort with uncertainty", lowPhrase: "clear protocols and well-defined answers",
      highFit: "You regularly make sound decisions without complete information.",
      lowFit: "Much of the work follows established protocols with clearer right answers.",
      conflictHigh: "this branch often means deciding with incomplete information and no clear protocol.",
      conflictLow: "this branch is fairly protocol-driven, with less room for judgement calls in grey areas." },
    { id: "lifestyle", label: "Predictable hours", importance: 1.2,
      description: "How much you value controllable, predictable working hours with fewer night calls.",
      userPhrase: "predictable hours", lowPhrase: "accepting irregular hours for the right kind of work",
      highFit: "Hours are often more predictable than in most acute specialties.",
      lowFit: "Hours can be irregular — the work does not always stop in the evening.",
      conflictHigh: "this branch's steadier, more predictable routine may feel less intense than you'd like.",
      conflictLow: "this branch has frequent emergency or night calls, and hours are often irregular." },
    { id: "biz", label: "Independent practice drive", importance: 1.0,
      description: "How much you want to build your own practice or setup in the long run.",
      userPhrase: "building an independent practice", lowPhrase: "working within an institution rather than running your own setup",
      highFit: "There is real scope to build an independent practice or setup over time.",
      lowFit: "Careers are mostly institution-based rather than independent private practice.",
      conflictHigh: "many careers here lean towards building and running your own practice or setup.",
      conflictLow: "independent private practice is limited here; most careers are institution-based." },
    { id: "stamina", label: "Physical stamina", importance: 1.0,
      description: "How comfortable you are with long hours on your feet and physically tiring days.",
      userPhrase: "physically demanding, long working days", lowPhrase: "work that is less physically draining",
      highFit: "Long standing hours and physical stamina come with the territory.",
      lowFit: "Day-to-day work is physically less demanding.",
      conflictHigh: "this branch is physically demanding, with long hours on your feet.",
      conflictLow: "this branch is mostly desk- or clinic-based, with little physically active work." },
    { id: "research", label: "Research & teaching", importance: 0.8,
      description: "How much you are drawn to academics — research, teaching and publishing.",
      userPhrase: "research, academics and teaching", lowPhrase: "practical, service-focused work over academics",
      highFit: "Academic, teaching and research roles are a natural part of this path.",
      lowFit: "The emphasis is on practice and service rather than research.",
      conflictHigh: "this branch is strongly academic, and many careers centre on teaching and research.",
      conflictLow: "this branch is mainly service-focused, with fewer built-in research roles." },
    { id: "resilience", label: "Emotional resilience", importance: 1.0,
      description: "How steady you expect to feel around serious illness, death and breaking bad news.",
      userPhrase: "staying steady around serious illness and loss", lowPhrase: "less day-to-day exposure to death and suffering",
      highFit: "You will regularly face serious illness, loss or difficult news — and need to stay steady.",
      lowFit: "Day-to-day exposure to death and breaking bad news is comparatively lower.",
      conflictHigh: "this branch involves regular exposure to death, serious illness or breaking bad news.",
      conflictLow: "this branch involves less of the emotionally intense, high-stakes care you seem ready for." },
    { id: "autonomy", label: "Working independently", importance: 1.0,
      description: "Whether you prefer owning decisions on your own or working embedded in a busy team.",
      userPhrase: "working independently", lowPhrase: "being embedded in a busy team",
      highFit: "You can often work independently and own your decisions.",
      lowFit: "The work is team-embedded, with shared decisions and handovers.",
      conflictHigh: "much of the work here is done independently, with less day-to-day team interaction.",
      conflictLow: "the work is team-embedded, with shared decisions and frequent handovers." },
    { id: "tech", label: "Technology / AI comfort", importance: 1.0,
      description: "How comfortable you are with equipment-heavy, digital and AI-assisted workflows.",
      userPhrase: "technology- and AI-heavy workflows", lowPhrase: "skills that rely less on technology",
      highFit: "Technology, equipment and digital tools are closely woven into the work.",
      lowFit: "Your core skills rely less on equipment and technology.",
      conflictHigh: "this branch is heavily equipment- and technology-driven, and its workflows keep changing.",
      conflictLow: "this branch relies less on technology than you might enjoy." }
  ],

  /* ------------------------------------------------------------------
     5. SCORING SETTINGS (change with care; re-run dev/audit.html)
     Fit-band thresholds, the "very close" margin, the flatness check and
     the sensitivity-check settings live as constants at the top of app.js.
     ------------------------------------------------------------------ */
  scoring: {
    scaleMax: 5,
    scaleMidpoint: 2.5,
    // v1.2 scoring: each dimension is centred on how branches actually
    // differ on it (a z-score across all branch profiles), and the user's
    // vector is centred on their own average — so only the SHAPE of their
    // preferences is compared, never the overall level. See "How scoring
    // works" on the About the method page. (Set by app.js; kept here for
    // reference. The old v1.1 method survives only for the audit's
    // before/after comparison.)
    similarityMode: "doubleCentred",
    // Pulls a trait towards the middle when few questions measured it.
    evidenceShrink: 2,
    // Small "interest nudges" can add at most this much similarity.
    maxInterestBoost: 0.1,
    // v1.1 had a "nichePenalty" here that pushed two niche branches down.
    // Double-centred scoring separates them on merit, so it was removed
    // rather than fudging the spread with a runtime penalty.
    minAnsweredForConfidence: 14
  },

  /* ------------------------------------------------------------------
     6. DEALBREAKERS — a set dealbreaker hides branches with these flags
     ------------------------------------------------------------------ */
  dealbreakers: {
    no_blood: {
      label: "blood, pus or open wounds make you genuinely unwell",
      removesFlags: ["heavilyProcedural"]
    },
    no_nights: {
      label: "you need predictable nights without frequent on-call",
      removesFlags: ["nightHeavy"]
    },
    need_patient_contact: {
      label: "you can't imagine a career without direct patient care",
      removesFlags: ["nonClinical", "labBased"]
    }
  },

  /* ------------------------------------------------------------------
     7. QUESTIONS
     type "choice": options carry `weights` (trait points) and may carry
       `dealbreaker` or `boost` (a tiny nudge to named branches).
     type "slider": answer 0–10; each trait gets (value − 5) × perPoint.
     format: "thisOrThat" | "scenario" | "room" | "slider"
     terms: glossary words to explain with an (i) button.
     No question may ask about gender, marital status or family plans.
     ------------------------------------------------------------------ */
  rounds: [
    {
      id: "instincts",
      title: "Your Instincts",
      intro: "Quick gut reactions. There are no right answers — both sides of every question are respected paths in medicine.",
      questions: [
        {
          id: "q1", type: "choice", format: "thisOrThat",
          prompt: "It's a slow afternoon. Which feels more satisfying?",
          options: [
            { id: "a", text: "Cracking a tricky puzzle — piecing clues together to explain what's really going on.",
              weights: { dx: 2, ambiguity: 1, research: 0.5 } },
            { id: "b", text: "Fixing something with my hands and seeing an immediate result.",
              weights: { proc: 2, visual: 0.5, stamina: 0.5 } }
          ]
        },
        {
          id: "q2", type: "choice", format: "thisOrThat",
          prompt: "Pick the workspace you'd enjoy more:",
          options: [
            { id: "a", text: "A quiet room with screens and detailed images to interpret.",
              weights: { visual: 2, dx: 1, tech: 1, autonomy: 1, lifestyle: 1 } },
            { id: "b", text: "A busy floor with people to talk to all day.",
              weights: { patient: 2, continuity: 1, autonomy: -1 } }
          ]
        },
        {
          id: "q3", type: "choice", format: "thisOrThat",
          prompt: "Which win feels better?",
          terms: ["continuity of care"],
          options: [
            { id: "a", text: "A patient thanks you years later for staying with them through a long illness.",
              weights: { continuity: 2, patient: 1.5, resilience: 1 } },
            { id: "b", text: "You stabilise a crashing patient in ten minutes and move on.",
              weights: { acuity: 2, proc: 1, resilience: 1, lifestyle: -0.5 } }
          ]
        },
        {
          id: "x1", type: "choice", format: "thisOrThat",
          prompt: "Which skill would you rather become brilliant at?",
          options: [
            { id: "a", text: "Spotting the subtle clue in a scan, a slide or a skin lesion that everyone else missed.",
              weights: { visual: 2, dx: 1, tech: 0.5 } },
            { id: "b", text: "Reading a person — noticing what they're worried about but not saying.",
              weights: { patient: 2, continuity: 0.5, visual: -1 } }
          ]
        },
        {
          id: "x2", type: "choice", format: "thisOrThat",
          prompt: "Where would you rather make your mark?",
          options: [
            { id: "a", text: "On a whole district — outbreak data, vaccination drives, stronger health systems.",
              weights: { research: 1.5, ambiguity: 1, tech: 0.5, patient: -1, proc: -1 },
              boost: { psm: 0.07, hosp_admin: 0.03 } },
            { id: "b", text: "On the individual in front of me — I want to see the person I helped.",
              weights: { patient: 1.5, proc: 0.5, continuity: 0.5, research: -0.5 } }
          ]
        },
        {
          id: "x3", type: "choice", format: "scenario",
          prompt: "Picture the patients you'd most like to spend your career caring for:",
          options: [
            { id: "a", text: "Babies and children — and their worried parents.",
              weights: { patient: 1, continuity: 0.5, resilience: 0.5 },
              boost: { paeds: 0.08 } },
            { id: "b", text: "Patients through pregnancy, childbirth and beyond.",
              weights: { patient: 0.5, continuity: 0.5, acuity: 0.5 },
              boost: { obg: 0.07 } },
            { id: "c", text: "Adults of every age and background.",
              weights: { dx: 0.5 } },
            { id: "d", text: "Older adults juggling many conditions at once.",
              weights: { continuity: 1, patient: 1, resilience: 0.5 },
              boost: { geri: 0.07, palli: 0.03 } },
            { id: "e", text: "Honestly, the problem interests me more than the age group.",
              weights: { dx: 1, visual: 0.5, patient: -0.5 } }
          ]
        }
      ]
    },

    {
      id: "day",
      title: "A Day in Your Life",
      intro: "Nice start. Now picture an ordinary working day ten years from now — a normal Tuesday, not a highlight reel.",
      questions: [
        {
          id: "q4", type: "choice", format: "scenario",
          prompt: "Your ideal working day looks like:",
          terms: ["OPD"],
          options: [
            { id: "a", text: "Predictable OPD hours, home by evening, few surprises.",
              weights: { lifestyle: 2.5, continuity: 1, acuity: -1 } },
            { id: "b", text: "Shifts and unpredictability, but real intensity while I'm on.",
              weights: { acuity: 2, lifestyle: -1.5, stamina: 1 } },
            { id: "c", text: "Long theatre/procedure days, physically tiring but I'm in the zone.",
              weights: { proc: 2, stamina: 2, lifestyle: -1 } }
          ]
        },
        {
          id: "q5", type: "slider", format: "slider",
          prompt: "How do you feel about spending most of your day NOT talking to patients (labs, images, reports)?",
          min: 0, max: 10, step: 1, centre: 5,
          minLabel: "I'd hate it", maxLabel: "I'd love it",
          perPoint: { patient: -0.4, visual: 0.2, autonomy: 0.2, lifestyle: 0.1 }
        },
        {
          id: "q6", type: "choice", format: "thisOrThat",
          prompt: "A family wants a long, emotional conversation about a poor prognosis. You:",
          options: [
            { id: "a", text: "Feel this is exactly the meaningful part of medicine.",
              weights: { patient: 2, resilience: 2, continuity: 1 } },
            { id: "b", text: "Would rather focus on the technical fix and let others handle the talk.",
              weights: { proc: 1.5, patient: -1, autonomy: 1 } }
          ]
        },
        {
          id: "x4", type: "choice", format: "room",
          prompt: "Which room would you rather spend most of your working day in?",
          terms: ["resus bay", "ICU"],
          options: [
            { id: "a", icon: "🧤", title: "Operation theatre", text: "Bright lights, sterile gloves, a clear task in front of you.",
              weights: { proc: 2, stamina: 1.5, patient: -0.5 } },
            { id: "b", icon: "🖥️", title: "Reporting room", text: "Dim lights, big screens, a queue of images or slides.",
              weights: { visual: 2, tech: 1, autonomy: 1, patient: -1 } },
            { id: "c", icon: "🪑", title: "Consultation room", text: "A chair, a desk, one person's story at a time.",
              weights: { patient: 2, continuity: 1.5, proc: -1 } },
            { id: "d", icon: "🚨", title: "Resus bay / ICU", text: "Monitors beeping, things changing minute to minute.",
              weights: { acuity: 2, resilience: 1, stamina: 0.5, lifestyle: -1 } },
            { id: "e", icon: "📊", title: "Seminar room / field office", text: "Data, teaching, communities and planning.",
              weights: { research: 2, ambiguity: 0.5, patient: -0.5, acuity: -0.5 } }
          ]
        },
        {
          id: "x5", type: "slider", format: "slider",
          prompt: "Standing for 5–6 hours at a stretch, several days a week, sounds…",
          min: 0, max: 10, step: 1, centre: 5,
          minLabel: "Tiring — not for me", maxLabel: "Fine — I've got the legs for it",
          perPoint: { stamina: 0.5, proc: 0.15, lifestyle: -0.1 }
        },
        {
          id: "x6", type: "choice", format: "thisOrThat",
          prompt: "A complicated case lands with you. You'd rather:",
          options: [
            { id: "a", text: "Own it end-to-end — my call, my responsibility, my follow-up.",
              weights: { autonomy: 2, biz: 0.5, continuity: 0.5 } },
            { id: "b", text: "Work it through with a big team — many hands, shared decisions, quick handovers.",
              weights: { autonomy: -1.5, acuity: 0.5, stamina: 0.5 } }
          ]
        },
        {
          id: "d3", type: "choice", format: "scenario", isDealbreakerQuestion: true,
          prompt: "Working mostly in a lab, mortuary or non-clinical setting (little direct patient contact) is:",
          options: [
            { id: "a", text: "Appealing — I like that.",
              weights: { autonomy: 1, lifestyle: 1, patient: -1 } },
            { id: "b", text: "Acceptable.", weights: {} },
            { id: "c", text: "I can't imagine a career without direct patient care.",
              weights: {}, dealbreaker: "need_patient_contact" }
          ]
        }
      ]
    },

    {
      id: "pressure",
      title: "Under Pressure",
      intro: "Halfway there. This round is about stress, nights and the hard moments. There's no 'tough enough' score — just be honest with future-you.",
      questions: [
        {
          id: "q7", type: "choice", format: "thisOrThat",
          prompt: "3 a.m. emergency call. Be honest about future-you:",
          terms: ["on-call"],
          options: [
            { id: "a", text: "Adrenaline — I'm built for this.",
              weights: { acuity: 2.5, stamina: 1, resilience: 1 } },
            { id: "b", text: "I can do it in training, but I want a career with minimal night calls.",
              weights: { lifestyle: 2.5, acuity: -1.5 } }
          ]
        },
        {
          id: "q8", type: "choice", format: "thisOrThat",
          prompt: "You must act with incomplete information and no clear answer. You feel:",
          options: [
            { id: "a", text: "Comfortable — I trust my judgement and adjust as I go.",
              weights: { ambiguity: 2, acuity: 1, dx: 1 } },
            { id: "b", text: "Stressed — I prefer clear protocols and defined right answers.",
              weights: { ambiguity: -2, proc: 0.5, tech: 0.5 } }
          ]
        },
        {
          id: "x7", type: "choice", format: "thisOrThat",
          prompt: "How do you feel about high-stakes decisions where a bad outcome could mean a complaint or lawsuit?",
          terms: ["medicolegal"],
          options: [
            { id: "a", text: "It comes with meaningful work — I'd document carefully, lean on seniors and keep going.",
              weights: { resilience: 1.5, acuity: 1, proc: 0.5, lifestyle: -0.5 } },
            { id: "b", text: "I'd genuinely prefer a field where that pressure is lower day to day.",
              weights: { lifestyle: 1, acuity: -1, resilience: -0.5 } }
          ]
        },
        {
          id: "d1", type: "choice", format: "scenario", isDealbreakerQuestion: true,
          prompt: "Be honest — the sight of blood, pus or open wounds makes me:",
          options: [
            { id: "a", text: "Totally fine, I barely notice.", weights: {} },
            { id: "b", text: "A bit squeamish, but manageable.", weights: {} },
            { id: "c", text: "Genuinely unwell — I feel faint.", weights: {}, dealbreaker: "no_blood" }
          ]
        },
        {
          id: "q9", type: "choice", format: "thisOrThat",
          prompt: "Which trade-off is worth it?",
          options: [
            { id: "a", text: "Higher intensity and irregular hours for more excitement.",
              weights: { acuity: 1.5, lifestyle: -1.5 } },
            { id: "b", text: "Calmer, steadier work, even if less dramatic.",
              weights: { lifestyle: 1.5, acuity: -1 } }
          ]
        },
        {
          id: "x8", type: "choice", format: "thisOrThat",
          prompt: "A patient you cared for dies, even though everything was done right. Looking ahead, you'd want a career where:",
          options: [
            { id: "a", text: "This happens sometimes — I can grieve, process it and show up fully for the next person.",
              weights: { resilience: 2, continuity: 0.5, acuity: 0.5 } },
            { id: "b", text: "It's rare — I'd rather put my emotional energy into other parts of medicine.",
              weights: { resilience: -1.5, lifestyle: 0.5, acuity: -0.5 } }
          ]
        },
        {
          // REVERSE-WORDED mirror of q6 (checked in consistencyPairs)
          id: "r2", type: "choice", format: "thisOrThat", isReverseItem: true,
          prompt: "True or not? “I'd be relieved if someone else always handled the long, emotional conversations with families.”",
          options: [
            { id: "a", text: "That's true for me.",
              weights: { patient: -1, resilience: -1, autonomy: 0.5 } },
            { id: "b", text: "Not really true for me.",
              weights: { patient: 1, resilience: 1 } }
          ]
        },
        {
          id: "d2", type: "choice", format: "scenario", isDealbreakerQuestion: true,
          prompt: "A career with frequent night duties and on-call is:",
          terms: ["on-call"],
          options: [
            { id: "a", text: "Fine — part of the job.", weights: {} },
            { id: "b", text: "OK for now, but I want it to ease later.", weights: { stamina: -0.3 } },
            { id: "c", text: "A hard no — I need predictable nights.", weights: {}, dealbreaker: "no_nights" }
          ]
        }
      ]
    },

    {
      id: "long",
      title: "The Long Game",
      intro: "Final round. Think about the career you'd like to be living in your forties.",
      questions: [
        {
          id: "q10", type: "choice", format: "scenario",
          prompt: "In 10 years you'd love to be:",
          terms: ["consultant"],
          options: [
            { id: "a", text: "Running my own clinic or setup — my own boss.",
              weights: { biz: 2.5, autonomy: 1.5, continuity: 1 } },
            { id: "b", text: "A senior consultant in a big hospital team.",
              weights: { autonomy: -1, patient: 1, proc: 0.5 } },
            { id: "c", text: "In academics or research — teaching and publishing.",
              weights: { research: 2.5, dx: 1, patient: 0.5 } }
          ]
        },
        {
          id: "q11", type: "slider", format: "slider",
          prompt: "How much does building an independent private practice (your own patients, your own setup) matter to you?",
          terms: ["private practice"],
          min: 0, max: 10, step: 1, centre: 5,
          minLabel: "Not at all", maxLabel: "It matters a lot",
          perPoint: { biz: 0.5, autonomy: 0.2 }
        },
        {
          id: "q12", type: "choice", format: "thisOrThat",
          prompt: "New AI tools will reshape image- and data-heavy fields. Your reaction:",
          options: [
            { id: "a", text: "Exciting — I want to ride that wave and use the tech.",
              weights: { tech: 2, visual: 1, dx: 1 } },
            { id: "b", text: "I'd rather my value come from hands-on skills or human connection AI can't replace.",
              weights: { proc: 1, patient: 1, tech: -1 } }
          ]
        },
        {
          // REVERSE-WORDED mirror of q1 (checked in consistencyPairs)
          id: "r1", type: "choice", format: "thisOrThat", isReverseItem: true,
          prompt: "True or not? “I'd get restless in a career where I mostly think, read or talk — and rarely use my hands.”",
          options: [
            { id: "a", text: "That's true for me.",
              weights: { proc: 1.5, stamina: 0.5, dx: -0.5 } },
            { id: "b", text: "Not really true for me.",
              weights: { dx: 0.5, proc: -1 } }
          ]
        },
        {
          id: "x9", type: "choice", format: "thisOrThat",
          prompt: "A patient's main problem is low mood, anxiety or a crisis at home — not a lab value. You find that:",
          options: [
            { id: "a", text: "Fascinating — the mind is the most interesting part of medicine.",
              weights: { patient: 1.5, continuity: 1, ambiguity: 1, proc: -0.5 },
              boost: { psych: 0.08 } },
            { id: "b", text: "Important, but I'd rather refer and focus on problems I can measure, see or fix.",
              weights: { dx: 0.5, visual: 0.5, proc: 0.5, patient: -0.5 } }
          ]
        },
        {
          id: "x10", type: "choice", format: "scenario",
          prompt: "Caring for people with cancer — long treatment journeys, with hope and hard news mixed together — sounds:",
          options: [
            { id: "a", text: "Like deeply meaningful everyday work.",
              weights: { resilience: 1.5, continuity: 1, patient: 0.5 },
              boost: { radonc: 0.07, palli: 0.04, nucmed: 0.02 } },
            { id: "b", text: "Worth being part of sometimes, but not my main focus.", weights: {} },
            { id: "c", text: "Something I respect, but I'd rather it not be my everyday.",
              weights: { resilience: -0.5, lifestyle: 0.5 } }
          ]
        },
        {
          id: "x11", type: "slider", format: "slider",
          prompt: "How important is it that your training could help you work abroad someday?",
          helper: "No promises either way — every country sets its own exams and registration rules.",
          min: 0, max: 10, step: 1, centre: 5,
          minLabel: "Not important", maxLabel: "Very important",
          perPoint: {},                       // deliberately no trait weights
          note: { atLeast: 7, id: "abroad" }  // shows an honest note on results
        }
      ]
    }
  ],

  /* ------------------------------------------------------------------
     7b. v1.4 CANDIDATES — NOT LIVE
     Drafted to thicken the thinnest dimensions (biz: 3 questions,
     research: 4). The app never reads this block. Adding all four would
     take the bank to 32 questions, past the 28-question cap, so that cap
     needs a decision first. Move entries into `rounds` to make them live.
     ------------------------------------------------------------------ */
  candidateQuestionsV14: [
    {
      forDimension: "biz", id: "c1", type: "choice", format: "thisOrThat",
      prompt: "Ten years in, a friend offers to go halves on a clinic — the lease, the staff, the late-night accounts, all of it. Your first feeling is:",
      options: [
        { id: "a", text: "Excitement — I'd want to build something of my own.", weights: { biz: 2, autonomy: 1 } },
        { id: "b", text: "Relief that I have a salaried job and someone else handles all that.", weights: { biz: -1.5, autonomy: -0.5 } }
      ]
    },
    {
      forDimension: "biz", id: "c2", type: "choice", format: "thisOrThat",
      prompt: "A busy week ends. Which leaves you more satisfied?",
      options: [
        { id: "a", text: "The department ran smoothly because of the systems I set up.", weights: { biz: 1, autonomy: 1, research: 0.5 } },
        { id: "b", text: "I saw every patient well and left the running of the place to others.", weights: { patient: 1, biz: -0.5 } }
      ]
    },
    {
      forDimension: "research", id: "c3", type: "choice", format: "thisOrThat",
      prompt: "You notice something odd across several patients that nobody has written about. You:",
      options: [
        { id: "a", text: "Start collecting the data properly — this could be worth publishing.", weights: { research: 2, dx: 1 } },
        { id: "b", text: "Mention it to colleagues and get on with the day's work.", weights: { research: -1, patient: 0.5 } }
      ]
    },
    {
      forDimension: "research", id: "c4", type: "choice", format: "thisOrThat",
      prompt: "Given a free Saturday and a good library, you'd rather:",
      options: [
        { id: "a", text: "Go deep into the evidence behind something you do every day.", weights: { research: 1.5, dx: 0.5 } },
        { id: "b", text: "Practise a practical skill you can use on Monday.", weights: { proc: 1, research: -0.5 } }
      ]
    }
  ],

  /* ------------------------------------------------------------------
     8. CONSISTENCY CHECKS — if these answer combos occur, show a banner
     ------------------------------------------------------------------ */
  consistencyPairs: [
    {
      questions: ["q4", "q9"],
      conflicts: [["a", "a"], ["b", "b"]],
      message: "Your answers on lifestyle vs. intensity were mixed — read the reality-checks carefully."
    },
    {
      questions: ["q7", "d2"],
      conflicts: [["a", "c"]],
      message: "Your answers about night-time emergencies were mixed (you enjoy the adrenaline but ruled out nights) — read the reality-checks carefully."
    },
    {
      // reverse-worded pair
      questions: ["q1", "r1"],
      conflicts: [["a", "a"], ["b", "b"]],
      message: "Your answers about hands-on vs. thinking-based work were mixed — read the reality-checks carefully."
    },
    {
      // reverse-worded pair
      questions: ["q6", "r2"],
      conflicts: [["a", "a"], ["b", "b"]],
      message: "Your answers about emotional conversations with families were mixed — read the reality-checks carefully."
    }
  ],

  /* ------------------------------------------------------------------
     9. SPECIALTIES
     profile: 0–5 on each of the 14 traits (expert-estimated anchors)
     flags: nightHeavy, heavilyProcedural, nonClinical, labBased
     adjacentBranches: ids of 1–2 related branches
     whyItFits: sentences keyed by trait id (used only when the user scored high)
     realityCheck: MANDATORY honest downside
     cautionIf: optional extra warning shown only if a dealbreaker is set
     indiaNote: qualitative only — NO numbers
     sources: citations backing the text (add as you verify)
     lastChecked: date the text was last checked against sources ("" = not yet)
     Verify this list against the current NMC PG regulations each season.
     ------------------------------------------------------------------ */
  specialties: [
    {
      whoThrivesHere: "People who love the puzzle and the relationship in equal measure — who want to be the doctor others turn to when nothing quite adds up, and who find a long chronic-illness relationship as rewarding as a dramatic save.",
      id: "gen_med", name: "General Medicine · MD", shortName: "General Medicine", category: "Clinical",
      availability: "widely-available",
      careerOutlook: "terminal",
      careerOutlookNote: "Long-term: you can practise independently after MD; many add a DM for subspecialty consultant work in larger cities.",
      profile: { proc: 1, acuity: 3, patient: 4, continuity: 4, dx: 5, visual: 2, ambiguity: 4, lifestyle: 2, biz: 3, stamina: 3, research: 3, resilience: 4, autonomy: 2, tech: 3 },
      flags: { nightHeavy: true, heavilyProcedural: false, nonClinical: false, labBased: false },
      adjacentBranches: ["resp", "geri"],
      whyItFits: {
        dx: "Internal medicine is the home of the diagnostic puzzle — connecting symptoms, signs and investigations across every organ system.",
        patient: "You build real relationships with patients, especially those living with chronic illness.",
        continuity: "Many patients stay with you for years — diabetes, heart, kidney and lung disease.",
        ambiguity: "Patients rarely arrive with a label; you reason through incomplete, evolving pictures.",
        resilience: "Very sick patients and difficult conversations are common, and you learn to stay steady.",
        acuity: "Ward emergencies and casualty duties bring plenty of acutely unwell patients."
      },
      realityCheck: "Heavy patient load, night duties and real medicolegal exposure, especially in busy public hospitals. Most organ-specific careers (cardiology, nephrology, gastroenterology and others) need a further DM, which means more years of training and another competitive exam.",
      askAResident: ["How many nights per week did you do in your first year?", "Do you plan a DM, and how competitive does it feel from the inside?", "What does a typical admission day look like?"],
      indiaNote: "A broad base and the gateway to most DM super-specialties. Strong demand in hospitals of every size; private practice is viable but often linked to a hospital or nursing home. Also available as DNB (NBEMS).",
      sources: [],
      lastChecked: ""
    },
    {
      whoThrivesHere: "People who think with their hands, stay calm when an operation turns unexpectedly, and get real satisfaction from a problem that is fixed and visible by the end of the day.",
      id: "gen_surg", name: "General Surgery · MS", shortName: "General Surgery", category: "Surgical",
      availability: "widely-available",
      careerOutlook: "terminal",
      careerOutlookNote: "Long-term: you can practise independently after MS; many add an MCh for subspecialty consultant work in larger cities.",
      profile: { proc: 5, acuity: 4, patient: 3, continuity: 2, dx: 3, visual: 3, ambiguity: 2, lifestyle: 1, biz: 3, stamina: 5, research: 2, resilience: 4, autonomy: 2, tech: 2 },
      flags: { nightHeavy: true, heavilyProcedural: true, nonClinical: false, labBased: false },
      adjacentBranches: ["ent", "ortho"],
      whyItFits: {
        proc: "Operating is the core of the job — you see the result of your skill directly.",
        stamina: "Long theatre lists and emergency operations reward genuine physical stamina.",
        acuity: "Acute abdomens, trauma and post-operative emergencies keep the pace high.",
        resilience: "You take responsibility for high-stakes outcomes and learn to carry that weight.",
        visual: "Anatomy in 3D — in the abdomen, on scans and through the laparoscope — is constantly in play."
      },
      realityCheck: "Physically demanding, with long training and high medicolegal risk. Private practice needs infrastructure, hospital tie-ups and capital, and many surgeons find an MCh (super-specialty) is needed to stand out.",
      askAResident: ["How much independent operating did you get by final year?", "How often are you on emergency call, and how late do lists run?", "Are most of your seniors planning an MCh — and why?"],
      indiaNote: "Huge need across India, from district hospitals to corporate centres. Practising independently usually means partnering with or building a facility. Gateway to MCh branches. Also available as DNB (NBEMS).",
      sources: [],
      lastChecked: ""
    },
    {
      whoThrivesHere: "People who can talk to a frightened four-year-old and a frightened parent in the same breath, and who find growth and recovery in children genuinely joyful work.",
      id: "paeds", name: "Paediatrics · MD", shortName: "Paediatrics", category: "Clinical",
      availability: "widely-available",
      careerOutlook: "terminal",
      profile: { proc: 2, acuity: 3, patient: 5, continuity: 4, dx: 4, visual: 2, ambiguity: 3, lifestyle: 2, biz: 3, stamina: 3, research: 2, resilience: 4, autonomy: 2, tech: 2 },
      flags: { nightHeavy: true, heavilyProcedural: false, nonClinical: false, labBased: false },
      adjacentBranches: ["fm", "gen_med"],
      whyItFits: {
        patient: "You communicate with two patients at once — the child and the family — and that relationship matters enormously.",
        continuity: "You may follow children through growth, development and chronic conditions over many years.",
        dx: "Children can't always describe their symptoms, so careful observation and diagnostic reasoning are essential.",
        resilience: "Sick children and anxious parents need a clinician who stays calm and kind."
      },
      realityCheck: "Emotionally intense — seriously ill children and distressed parents are part of everyday work. Nights (especially NICU/PICU and labour-room calls) are busy. Many go on to subspecialise, such as neonatology, which means further training.",
      askAResident: ["How do you cope after losing a child patient?", "What are NICU and PICU nights like here?", "How do you handle difficult conversations with parents?"],
      indiaNote: "Consistent demand in government and private sectors; OPD-based private practice is common once established. Neonatology and other subspecialties are growing. Also available as DNB (NBEMS).",
      sources: [],
      lastChecked: ""
    },
    {
      whoThrivesHere: "People who want to be present at the biggest moments in a family's life, can switch from clinic to a fast-moving labour room without losing their nerve, and want both surgery and long relationships.",
      id: "obg", name: "Obstetrics & Gynaecology · MS/MD", shortName: "Obstetrics & Gynaecology", category: "Surgical",
      availability: "widely-available",
      careerOutlook: "terminal",
      profile: { proc: 5, acuity: 4, patient: 4, continuity: 4, dx: 3, visual: 3, ambiguity: 3, lifestyle: 1, biz: 4, stamina: 4, research: 2, resilience: 4, autonomy: 2, tech: 2 },
      flags: { nightHeavy: true, heavilyProcedural: true, nonClinical: false, labBased: false },
      adjacentBranches: ["gen_surg", "fm"],
      whyItFits: {
        proc: "It blends clinic work with deliveries, caesareans and gynaecological surgery — very hands-on.",
        continuity: "You often follow patients through pregnancy and beyond, sometimes across several pregnancies.",
        patient: "Conversations with patients and families at important life moments are central.",
        biz: "There is strong scope for private practice and running your own clinic or nursing home over time.",
        acuity: "Labour rooms change fast — obstetric emergencies need quick, confident action.",
        resilience: "You stay steady through frightening emergencies and share both joyful and devastating news."
      },
      realityCheck: "Among the highest medicolegal-risk fields in India. Deliveries don't keep office hours, so the schedule is unpredictable, and obstetric emergencies can be frightening. In exchange, demand is consistently strong and private-practice potential is real.",
      askAResident: ["How often are you called in at night for deliveries?", "How does your unit handle medicolegal risk and documentation?", "How much surgical exposure (laparoscopy, gynae-oncology) do residents get?"],
      indiaNote: "Needed everywhere — from primary-care settings to tertiary centres. Many obstetricians build private practices or nursing homes. Also available as DNB (NBEMS).",
      sources: [],
      lastChecked: ""
    },
    {
      whoThrivesHere: "People who enjoy mechanical problem-solving, physical work and a clear before-and-after — restoring someone's ability to walk, lift or play.",
      id: "ortho", name: "Orthopaedics · MS", shortName: "Orthopaedics", category: "Surgical",
      availability: "widely-available",
      careerOutlook: "terminal",
      profile: { proc: 5, acuity: 3, patient: 3, continuity: 2, dx: 2, visual: 3, ambiguity: 2, lifestyle: 2, biz: 4, stamina: 5, research: 2, resilience: 3, autonomy: 2, tech: 3 },
      flags: { nightHeavy: true, heavilyProcedural: true, nonClinical: false, labBased: false },
      adjacentBranches: ["sports", "pmr"],
      whyItFits: {
        proc: "Fixing fractures and joints gives tangible, mechanical, visible results.",
        stamina: "Long surgeries, heavy instruments and trauma calls ask a lot physically — and reward those who enjoy that.",
        biz: "Established orthopaedic surgeons often have strong private-practice potential.",
        visual: "X-rays and scans are read constantly to plan and check your work.",
        ambiguity: "Many problems have well-defined mechanical solutions and clear protocols."
      },
      realityCheck: "Physically heavy work with trauma calls. Private practice needs implants, theatre access and setup costs. It is a competitive branch to get into.",
      askAResident: ["How much trauma call do you do, and how late do nights run?", "When did you start operating independently?", "What does it really take to set up in private practice?"],
      indiaNote: "Road-traffic trauma, sports injuries and an ageing population mean steady demand. Private practice is common but capital- and hospital-dependent. Also available as DNB (NBEMS).",
      sources: [],
      lastChecked: ""
    },
    {
      whoThrivesHere: "People who love the detective work of an image, are happy to be the expert other doctors depend on, and want a career where technology keeps changing what is possible.",
      id: "radio", name: "Radio-diagnosis (Radiology) · MD", shortName: "Radiology", category: "Diagnostic/Lab",
      availability: "widely-available",
      careerOutlook: "terminal",
      profile: { proc: 2, acuity: 2, patient: 1, continuity: 1, dx: 4, visual: 5, ambiguity: 3, lifestyle: 4, biz: 4, stamina: 2, research: 3, resilience: 2, autonomy: 4, tech: 5 },
      flags: { nightHeavy: false, heavilyProcedural: false, nonClinical: false, labBased: false },
      adjacentBranches: ["nucmed", "radonc"],
      whyItFits: {
        visual: "Your day is spent interpreting images — pattern recognition at its most refined.",
        tech: "It is one of the most technology-driven branches, and the tools keep evolving.",
        dx: "You're often the one who cracks the diagnosis for other doctors.",
        autonomy: "Much of the reporting work is done independently at a workstation.",
        lifestyle: "Hours are generally more controllable than acute clinical branches, though on-call reporting exists.",
        biz: "Diagnostic centres and teleradiology offer real scope for independent work."
      },
      realityCheck: "AI is changing how images and slides are read. Current evidence suggests it assists rather than replaces specialists, but expect your workflow to evolve. Practice depends on expensive equipment and capital. Direct patient contact is limited, and hospital on-call reporting (including nights) does exist.",
      askAResident: ["How much on-call and night reporting do you actually do?", "How are AI tools used in your department today?", "How much interventional work (biopsies, drainages) do residents get?"],
      indiaNote: "Strong potential in teleradiology and private diagnostic centres, with demand in hospitals of all sizes. Also available as DNB (NBEMS).",
      sources: [],
      lastChecked: ""
    },
    {
      whoThrivesHere: "People with a sharp visual memory who enjoy a busy clinic, long-term skin conditions and the craft of procedures done well.",
      id: "derm", name: "Dermatology, Venereology & Leprosy · MD", shortName: "Dermatology", category: "Clinical",
      availability: "widely-available",
      careerOutlook: "terminal",
      profile: { proc: 3, acuity: 1, patient: 4, continuity: 3, dx: 3, visual: 5, ambiguity: 2, lifestyle: 5, biz: 5, stamina: 1, research: 2, resilience: 1, autonomy: 4, tech: 3 },
      flags: { nightHeavy: false, heavilyProcedural: false, nonClinical: false, labBased: false },
      adjacentBranches: ["ophthal", "path"],
      whyItFits: {
        visual: "Diagnosis often starts with the eye — recognising skin patterns is a daily skill.",
        lifestyle: "Largely OPD-based, with more predictable hours than most clinical branches.",
        biz: "There is strong scope for independent clinical and aesthetic practice.",
        autonomy: "You can run your own clinic and manage patients largely independently.",
        patient: "Consultations are frequent and conversational — and skin conditions deeply affect how people feel about themselves.",
        proc: "Minor procedures, biopsies, lasers and dermatosurgery add a hands-on element."
      },
      realityCheck: "Highly competitive to enter. Aesthetic and cosmetology practice depends on skill, reputation and the local market, and it isn't glamorous in every setting. Many skin conditions are chronic and relapsing, which can frustrate patients and doctors alike.",
      askAResident: ["What share of your OPD is general dermatology vs. aesthetics?", "How long did your seniors take to build a private practice?", "How much hands-on procedure training (lasers, dermatosurgery) do you get?"],
      indiaNote: "Excellent OPD lifestyle and strong private and aesthetic practice potential in cities and towns. Also available as DNB (NBEMS).",
      sources: [],
      lastChecked: ""
    },
    {
      whoThrivesHere: "People who are calm under pressure, take pride in invisible expertise, and like physiology in real time — the patient is safe precisely because you are good at this.",
      id: "anaes", name: "Anaesthesiology · MD", shortName: "Anaesthesiology", category: "Clinical",
      availability: "widely-available",
      careerOutlook: "hospital-based",
      profile: { proc: 4, acuity: 5, patient: 2, continuity: 1, dx: 3, visual: 2, ambiguity: 3, lifestyle: 3, biz: 2, stamina: 3, research: 2, resilience: 4, autonomy: 2, tech: 4 },
      flags: { nightHeavy: true, heavilyProcedural: true, nonClinical: false, labBased: false },
      adjacentBranches: ["em", "resp"],
      whyItFits: {
        acuity: "You manage patients at their most vulnerable — airway, breathing and circulation, minute by minute.",
        proc: "Intubations, central lines and nerve blocks make it a very hands-on specialty.",
        tech: "Monitors, ventilators and anaesthesia workstations are part of every case.",
        resilience: "Crises in theatre or ICU call for a calm, steady head.",
        continuity: "Your involvement is intense but short — you see a patient safely through and hand over."
      },
      realityCheck: "Vital but often 'behind the scenes' — many patients never remember you. Strong hospital demand, but limited independent private practice, since you work where surgery happens. Night and emergency calls are part of training. Many describe manageable burnout, though some raise concerns about career visibility.",
      askAResident: ["How are night emergencies and ICU duties split in your department?", "How much regional anaesthesia and critical-care exposure do you get?", "How do anaesthetists in private practice find their work?"],
      indiaNote: "Needed wherever surgery happens, from district hospitals to corporate centres. Opens pathways into critical care, pain and palliative medicine. Also available as DNB (NBEMS).",
      sources: [],
      lastChecked: ""
    },
    {
      whoThrivesHere: "People who find the story behind the symptom fascinating, can sit with distress without rushing to fix it, and want their main clinical tool to be conversation.",
      id: "psych", name: "Psychiatry · MD", shortName: "Psychiatry", category: "Clinical",
      availability: "widely-available",
      careerOutlook: "terminal",
      profile: { proc: 1, acuity: 2, patient: 5, continuity: 5, dx: 4, visual: 1, ambiguity: 4, lifestyle: 4, biz: 4, stamina: 1, research: 3, resilience: 4, autonomy: 3, tech: 2 },
      flags: { nightHeavy: false, heavilyProcedural: false, nonClinical: false, labBased: false },
      adjacentBranches: ["fm", "palli"],
      whyItFits: {
        patient: "Conversation is the main clinical tool — listening well is the skill.",
        continuity: "You often support patients and families over many years.",
        ambiguity: "Mental health rarely has a single test or clear answer, so you work comfortably in grey areas.",
        dx: "Formulating what's really going on — biology, psychology and circumstances together — is a rich diagnostic challenge.",
        lifestyle: "Mostly OPD-based, with comparatively predictable hours in many settings.",
        resilience: "Suicide risk and severe distress call for steady, compassionate judgement."
      },
      realityCheck: "Emotionally heavy in a different way — suicide risk, severe illness and family distress are part of the work. Stigma still exists in India, though acceptance and demand are rising. It is talk-based with minimal procedures, so if you crave hands-on work, think carefully.",
      askAResident: ["How do you look after your own mental health in this job?", "How much psychotherapy training do you actually get?", "What are emergency and ward calls like?"],
      indiaNote: "Large unmet need and growing acceptance, with private practice, hospital, de-addiction and tele-psychiatry options. Also available as DNB (NBEMS).",
      sources: [],
      lastChecked: ""
    },
    {
      whoThrivesHere: "People who enjoy precise, small-field microsurgery and quick, clear results — restoring someone's sight is among the most immediate wins in medicine.",
      id: "ophthal", name: "Ophthalmology · MS", shortName: "Ophthalmology", category: "Surgical",
      availability: "widely-available",
      careerOutlook: "terminal",
      profile: { proc: 4, acuity: 2, patient: 4, continuity: 3, dx: 3, visual: 5, ambiguity: 2, lifestyle: 4, biz: 5, stamina: 2, research: 2, resilience: 2, autonomy: 4, tech: 4 },
      flags: { nightHeavy: false, heavilyProcedural: true, nonClinical: false, labBased: false },
      adjacentBranches: ["ent", "derm"],
      whyItFits: {
        visual: "Examining the eye is intensely visual — slit-lamp and fundus findings are all pattern recognition.",
        proc: "Microsurgery such as cataract surgery gives precise, satisfying results.",
        biz: "There is strong private-practice potential, especially in cataract and refractive surgery.",
        tech: "Lasers, imaging and precision instruments are central to the work.",
        lifestyle: "Emergencies are relatively uncommon, so hours are usually controllable.",
        autonomy: "Many ophthalmologists run largely independent clinics and theatres."
      },
      realityCheck: "Microsurgical skill takes time to build, and surgical exposure varies a lot between institutes. Private practice is strong but needs expensive equipment. It is competitive to get into.",
      askAResident: ["How many independent cataract surgeries did you do before finishing?", "What equipment would I need to start a practice?", "How much do subspecialty fellowships matter?"],
      indiaNote: "Large need for cataract and preventable-blindness work, plus strong private and eye-hospital-chain demand. Also available as DNB (NBEMS).",
      sources: [],
      lastChecked: ""
    },
    {
      whoThrivesHere: "People who like variety: a busy clinic, endoscopes, and surgery that ranges from quick day cases to complex head-and-neck work.",
      id: "ent", name: "Otorhinolaryngology (ENT) · MS", shortName: "ENT", category: "Surgical",
      availability: "widely-available",
      careerOutlook: "terminal",
      profile: { proc: 4, acuity: 2, patient: 3, continuity: 2, dx: 3, visual: 3, ambiguity: 2, lifestyle: 3, biz: 4, stamina: 3, research: 2, resilience: 2, autonomy: 3, tech: 3 },
      flags: { nightHeavy: false, heavilyProcedural: true, nonClinical: false, labBased: false },
      adjacentBranches: ["ophthal", "gen_surg"],
      whyItFits: {
        proc: "It blends OPD work with endoscopic, ear and head-and-neck surgery.",
        biz: "Good private-practice potential with a mix of clinic and procedures.",
        autonomy: "Many ENT surgeons run largely independent practices.",
        visual: "Endoscopes and microscopes make examination and surgery very visual."
      },
      realityCheck: "A mix of OPD and surgery, so you need both skill sets. Airway and bleeding emergencies can be tense. Surgical exposure varies between institutes, and top seats are competitive.",
      askAResident: ["How much hands-on surgery do residents get here?", "What emergencies are you called in for?", "What does an ENT practice need to get set up?"],
      indiaNote: "Steady OPD demand and good private-practice potential in cities and towns. Also available as DNB (NBEMS).",
      sources: [],
      lastChecked: ""
    },
    {
      whoThrivesHere: "People drawn to acute physiology and long-term care at once — ventilators and ICU one day, chronic asthma, COPD and TB clinics the next.",
      id: "resp", name: "Respiratory Medicine (Pulmonary Medicine) · MD", shortName: "Respiratory Medicine", category: "Clinical",
      availability: "widely-available",
      careerOutlook: "terminal",
      profile: { proc: 3, acuity: 4, patient: 4, continuity: 3, dx: 4, visual: 3, ambiguity: 3, lifestyle: 2, biz: 3, stamina: 3, research: 3, resilience: 3, autonomy: 2, tech: 3 },
      flags: { nightHeavy: true, heavilyProcedural: false, nonClinical: false, labBased: false },
      adjacentBranches: ["gen_med", "anaes"],
      whyItFits: {
        acuity: "The critical-care crossover means ICU work, ventilators and acutely breathless patients.",
        dx: "Interpreting lung function, chest imaging and bronchoscopy findings is real diagnostic work.",
        patient: "Chronic conditions like asthma, COPD and TB mean many ongoing patient relationships.",
        proc: "Bronchoscopy, pleural procedures and ventilator management add hands-on skills."
      },
      realityCheck: "The critical-care crossover means nights and ICU work. Infectious exposure (TB, respiratory viruses) is a real consideration. Interventional pulmonology needs additional training.",
      askAResident: ["How much ICU and night duty is there?", "How much bronchoscopy exposure do residents get?", "How are infection-control precautions handled for staff?"],
      indiaNote: "A high burden of TB, COPD, asthma and pollution-related lung disease keeps demand strong. Hospital and private practice are both possible. Also available as DNB (NBEMS).",
      sources: [],
      lastChecked: ""
    },
    {
      whoThrivesHere: "People who are at their best when things are uncertain and fast, who can make a sound decision with half the information, and who like being the first person to help anyone who walks through the door.",
      id: "em", name: "Emergency Medicine · MD", shortName: "Emergency Medicine", category: "Clinical",
      availability: "widely-available",
      careerOutlook: "hospital-based",
      profile: { proc: 4, acuity: 5, patient: 3, continuity: 1, dx: 4, visual: 2, ambiguity: 5, lifestyle: 2, biz: 1, stamina: 4, research: 2, resilience: 5, autonomy: 2, tech: 3 },
      flags: { nightHeavy: true, heavilyProcedural: false, nonClinical: false, labBased: false },
      adjacentBranches: ["anaes", "fm"],
      whyItFits: {
        acuity: "It's the front door of the hospital — you see the most unstable patients first.",
        ambiguity: "You make decisions fast, often with very incomplete information.",
        resilience: "Trauma, sudden death and distressed families are regular parts of a shift.",
        proc: "Airways, lines, reductions and resuscitation keep you hands-on.",
        dx: "Undifferentiated patients mean rapid, broad diagnostic thinking.",
        stamina: "Busy shifts on your feet ask a lot physically."
      },
      realityCheck: "High burnout risk, with shift work at all hours, including nights, weekends and festivals. It's a fast-growing field in India. It can be globally portable only with extra exams (e.g., MRCEM) — an Indian MD alone isn't automatically recognised abroad.",
      askAResident: ["How is the shift rota structured — and does it improve after residency?", "How do you decompress after a bad shift?", "What career paths do your seniors take after MD?"],
      indiaNote: "A relatively young specialty in India with fast-growing demand in corporate and teaching hospitals. Limited independent private practice. Also available as DNB (NBEMS).",
      sources: [],
      lastChecked: ""
    },
    {
      whoThrivesHere: "People who want breadth over depth, know their patients' families and circumstances, and want to be the first and most trusted contact rather than the last referral.",
      id: "fm", name: "Family Medicine · MD", shortName: "Family Medicine", category: "Clinical",
      availability: "limited-centres",
      availabilityNote: "MD seats are relatively few; DNB Family Medicine is more widely available through NBEMS.",
      careerOutlook: "terminal",
      profile: { proc: 2, acuity: 3, patient: 5, continuity: 5, dx: 4, visual: 1, ambiguity: 5, lifestyle: 3, biz: 4, stamina: 2, research: 2, resilience: 3, autonomy: 3, tech: 3 },
      flags: { nightHeavy: false, heavilyProcedural: false, nonClinical: false, labBased: false },
      adjacentBranches: ["gen_med", "psych"],
      whyItFits: {
        continuity: "You care for whole families, sometimes across generations.",
        patient: "Relationships and communication are the core of primary care.",
        ambiguity: "Undifferentiated problems come to you first — before anyone has given them a label.",
        biz: "It's well suited to running your own community clinic.",
        dx: "You need broad diagnostic breadth — knowing a little about a lot, and when to refer."
      },
      realityCheck: "The broad scope means constant uncertainty and knowing when to refer. It has historically been undervalued in parts of India, though its standing is rising with telemedicine and primary care. Some settings still involve night calls.",
      askAResident: ["How is family medicine perceived by patients and other specialists where you train?", "What kind of practice do graduates set up?", "How much rotation time do you get across other specialties?"],
      indiaNote: "Growing recognition, with strong roles in primary care, community clinics and telemedicine. Also available as DNB (NBEMS).",
      sources: [],
      lastChecked: ""
    },
    {
      whoThrivesHere: "People who want to make the diagnosis that decides someone's treatment, enjoy morphology and reasoning, and like deep, focused work with fewer interruptions.",
      id: "path", name: "Pathology · MD", shortName: "Pathology", category: "Diagnostic/Lab",
      availability: "widely-available",
      careerOutlook: "terminal",
      profile: { proc: 2, acuity: 1, patient: 1, continuity: 1, dx: 5, visual: 5, ambiguity: 3, lifestyle: 4, biz: 4, stamina: 1, research: 4, resilience: 2, autonomy: 4, tech: 4 },
      flags: { nightHeavy: false, heavilyProcedural: false, nonClinical: false, labBased: true },
      adjacentBranches: ["micro", "ihbt"],
      whyItFits: {
        visual: "Under the microscope, diagnosis is morphology and pattern recognition.",
        dx: "You make the final call on many diagnoses — especially in cancer.",
        research: "There are strong academic and research pathways.",
        autonomy: "Reporting work is largely independent.",
        tech: "Digital pathology and AI tools are emerging parts of the field.",
        biz: "Independent and chain laboratories offer entrepreneurial routes."
      },
      realityCheck: "Little or no direct patient contact. AI is changing how images and slides are read. Current evidence suggests it assists rather than replaces specialists, but expect your workflow to evolve. Private-lab entrepreneurship is possible but competitive. Some find the day-to-day less of a 'buzz' than clinical work.",
      askAResident: ["How is your time split between histopathology, haematology and lab management?", "What do seniors do after MD — labs, academics, oncopathology?", "How is digital pathology changing your work?"],
      indiaNote: "Careers in hospital labs, private diagnostic chains, independent labs and teaching. Also available as DNB (NBEMS).",
      sources: [],
      lastChecked: ""
    },
    {
      whoThrivesHere: "People fascinated by infection as a puzzle, who enjoy laboratory precision and want to shape how a whole hospital uses antibiotics.",
      id: "micro", name: "Microbiology · MD", shortName: "Microbiology", category: "Diagnostic/Lab",
      availability: "widely-available",
      careerOutlook: "institutional",
      profile: { proc: 1, acuity: 1, patient: 1, continuity: 1, dx: 4, visual: 3, ambiguity: 3, lifestyle: 4, biz: 2, stamina: 1, research: 4, resilience: 1, autonomy: 4, tech: 4 },
      flags: { nightHeavy: false, heavilyProcedural: false, nonClinical: true, labBased: true },
      adjacentBranches: ["path", "psm"],
      whyItFits: {
        dx: "Identifying the organism behind a clinical problem is genuine detective work.",
        research: "Strong academic, research and public-health roles.",
        tech: "Molecular diagnostics and lab automation are growing parts of the work.",
        lifestyle: "Mostly daytime lab hours."
      },
      realityCheck: "Mostly lab, academic and infection-control work, with limited direct clinical practice. It's strong for diagnostics and teaching — but if you want bedside care, this probably isn't it.",
      askAResident: ["How much clinical interaction (infection control, antimicrobial stewardship) do you have?", "What are the job options outside teaching?", "How much molecular diagnostics exposure do you get?"],
      indiaNote: "Roles in medical colleges, hospital infection control, diagnostic labs and public health. Also available as DNB (NBEMS).",
      sources: [],
      lastChecked: ""
    },
    {
      whoThrivesHere: "People who genuinely enjoy the science under medicine, and want a career built around teaching, research and laboratory diagnostics.",
      id: "biochem", name: "Biochemistry · MD", shortName: "Biochemistry", category: "Non-clinical/Preclinical",
      availability: "widely-available",
      careerOutlook: "institutional",
      profile: { proc: 0, acuity: 0, patient: 1, continuity: 0, dx: 4, visual: 2, ambiguity: 3, lifestyle: 5, biz: 1, stamina: 1, research: 5, resilience: 1, autonomy: 4, tech: 3 },
      flags: { nightHeavy: false, heavilyProcedural: false, nonClinical: true, labBased: true },
      adjacentBranches: ["path", "pharm"],
      whyItFits: {
        research: "It's built for people who love academic science, research and teaching.",
        lifestyle: "Hours are very predictable.",
        dx: "Clinical biochemistry and metabolic diagnostics involve careful, analytical reasoning.",
        autonomy: "Teaching and lab roles offer a lot of independence."
      },
      realityCheck: "Mostly teaching, research and diagnostics-industry work, with essentially no clinical practice. Choose it only if you genuinely love academic science.",
      askAResident: ["What do graduates do besides teaching?", "How is your time split between the clinical lab and teaching?", "How good are the research opportunities?"],
      indiaNote: "Mainly medical-college teaching, clinical biochemistry labs, research and the diagnostics industry.",
      sources: [],
      lastChecked: ""
    },
    {
      whoThrivesHere: "People who want to understand why treatments work and fail, and who enjoy teaching, trials and drug-safety work that shapes care far beyond one patient.",
      id: "pharm", name: "Pharmacology · MD", shortName: "Pharmacology", category: "Non-clinical/Preclinical",
      availability: "widely-available",
      careerOutlook: "institutional",
      profile: { proc: 0, acuity: 0, patient: 1, continuity: 0, dx: 4, visual: 1, ambiguity: 3, lifestyle: 5, biz: 2, stamina: 1, research: 5, resilience: 1, autonomy: 4, tech: 3 },
      flags: { nightHeavy: false, heavilyProcedural: false, nonClinical: true, labBased: false },
      adjacentBranches: ["biochem", "physio"],
      whyItFits: {
        research: "Drug research, clinical trials and teaching are central.",
        lifestyle: "Excellent, predictable hours.",
        dx: "Understanding how drugs work — and why they fail — is analytical work.",
        autonomy: "Academic and industry roles allow a lot of independent work."
      },
      realityCheck: "Teaching, clinical-trials and pharma-industry work, plus drug safety — but no bedside care. The lifestyle is excellent.",
      askAResident: ["How do graduates split between industry and teaching?", "How much clinical-trial exposure do you get?", "How do you stay connected to clinical medicine?"],
      indiaNote: "Teaching, clinical research, pharmacovigilance and pharmaceutical-industry roles.",
      sources: [],
      lastChecked: ""
    },
    {
      whoThrivesHere: "People who love explaining how the body works and want teaching and research at the centre of their career.",
      id: "physio", name: "Physiology · MD", shortName: "Physiology", category: "Non-clinical/Preclinical",
      availability: "widely-available",
      careerOutlook: "institutional",
      profile: { proc: 0, acuity: 0, patient: 1, continuity: 0, dx: 3, visual: 1, ambiguity: 3, lifestyle: 5, biz: 1, stamina: 1, research: 5, resilience: 1, autonomy: 4, tech: 2 },
      flags: { nightHeavy: false, heavilyProcedural: false, nonClinical: true, labBased: false },
      adjacentBranches: ["pharm", "sports"],
      whyItFits: {
        research: "How the body works is the whole subject — ideal if you love teaching and research.",
        lifestyle: "Very stable, predictable hours.",
        autonomy: "Academic roles offer considerable independence."
      },
      realityCheck: "Predominantly teaching and research, with no clinical practice.",
      askAResident: ["What does a normal week of teaching look like?", "What research opportunities exist?", "Do you ever miss clinical work?"],
      indiaNote: "Predominantly medical-college teaching and research, with some roles in applied and clinical physiology.",
      sources: [],
      lastChecked: ""
    },
    {
      whoThrivesHere: "People with strong spatial and visual thinking who enjoy teaching, dissection and the structural foundation every clinician relies on.",
      id: "anat", name: "Anatomy · MD/MS", shortName: "Anatomy", category: "Non-clinical/Preclinical",
      availability: "widely-available",
      careerOutlook: "institutional",
      profile: { proc: 1, acuity: 0, patient: 0, continuity: 0, dx: 2, visual: 3, ambiguity: 2, lifestyle: 5, biz: 1, stamina: 1, research: 4, resilience: 2, autonomy: 4, tech: 2 },
      flags: { nightHeavy: false, heavilyProcedural: false, nonClinical: true, labBased: false },
      adjacentBranches: ["fmt", "radio"],
      whyItFits: {
        visual: "Understanding three-dimensional structure is deeply visual.",
        research: "Teaching, embryology, genetics and clinical anatomy research are core.",
        lifestyle: "A very stable lifestyle."
      },
      realityCheck: "Teaching, dissection and research, with no clinical practice. The lifestyle is very stable.",
      cautionIf: { no_blood: "Dissection uses preserved cadavers — very different from active bleeding, but spend time in a dissection hall before choosing." },
      askAResident: ["What does a teaching week look like?", "What research areas are active in your department?", "What career growth looks like after MD?"],
      indiaNote: "Mainly medical-college teaching, dissection and research.",
      sources: [],
      lastChecked: ""
    },
    {
      whoThrivesHere: "People who want their work measured in populations rather than patients — outbreaks contained, programmes improved, systems made to work better.",
      id: "psm", name: "Community Medicine (Preventive & Social Medicine) · MD", shortName: "Community Medicine", category: "Public health/Admin",
      availability: "widely-available",
      careerOutlook: "institutional",
      profile: { proc: 0, acuity: 1, patient: 3, continuity: 2, dx: 3, visual: 1, ambiguity: 4, lifestyle: 4, biz: 2, stamina: 1, research: 5, resilience: 2, autonomy: 3, tech: 3 },
      flags: { nightHeavy: false, heavilyProcedural: false, nonClinical: true, labBased: false },
      adjacentBranches: ["hosp_admin", "tropmed"],
      whyItFits: {
        research: "Epidemiology, research and data are the tools of the trade.",
        ambiguity: "Real-world public health is messy — decisions are made with imperfect data.",
        lifestyle: "Mostly daytime work, though outbreaks and campaigns can get intense.",
        patient: "You work with communities rather than at a single bedside."
      },
      realityCheck: "Policy, epidemiology, government and NGO work — not bedside care. The impact can be huge if you value population health over individual procedures.",
      askAResident: ["What roles do graduates take — teaching, government, NGOs, global health?", "How much field work is there?", "How much real policy influence do people get?"],
      indiaNote: "Roles in medical colleges, government health programmes, NGOs, research and global-health organisations. Also available as DNB (NBEMS).",
      sources: [],
      lastChecked: ""
    },
    {
      whoThrivesHere: "People with strong nerves and strict objectivity who want their findings to stand up in court and give families answers.",
      id: "fmt", name: "Forensic Medicine & Toxicology · MD", shortName: "Forensic Medicine", category: "Non-clinical/Preclinical",
      availability: "widely-available",
      careerOutlook: "institutional",
      profile: { proc: 2, acuity: 1, patient: 1, continuity: 1, dx: 4, visual: 3, ambiguity: 3, lifestyle: 3, biz: 1, stamina: 2, research: 3, resilience: 5, autonomy: 3, tech: 2 },
      flags: { nightHeavy: false, heavilyProcedural: false, nonClinical: true, labBased: false },
      adjacentBranches: ["path", "anat"],
      whyItFits: {
        resilience: "Autopsy and medicolegal work demand a strong stomach and emotional steadiness.",
        dx: "Reconstructing what happened from the evidence is a rigorous puzzle.",
        visual: "Injury patterns and autopsy findings rely on careful observation.",
        autonomy: "You form and defend independent expert opinions."
      },
      realityCheck: "Autopsy, medicolegal and court work. A strong stomach and objectivity are essential, and court appearances are part of the job. Careers are mainly in government and teaching.",
      cautionIf: { no_blood: "Autopsy work involves blood and decomposition — think very carefully given what you told us about blood." },
      askAResident: ["How often do you testify in court?", "How do you cope with difficult cases, including those involving children?", "What job options exist beyond teaching and government?"],
      indiaNote: "Mainly government and medical-college roles; objectivity and legal knowledge matter as much as medicine.",
      sources: [],
      lastChecked: ""
    },
    {
      whoThrivesHere: "People who want to combine precise technology with long relationships through cancer treatment, and who can hold hope and honesty together.",
      id: "radonc", name: "Radiation Oncology · MD", shortName: "Radiation Oncology", category: "Clinical",
      availability: "limited-centres",
      availabilityNote: "Needs a linear accelerator, so training sits in cancer centres and larger teaching hospitals.",
      careerOutlook: "hospital-based",
      profile: { proc: 3, acuity: 2, patient: 4, continuity: 4, dx: 4, visual: 4, ambiguity: 3, lifestyle: 3, biz: 2, stamina: 2, research: 4, resilience: 5, autonomy: 2, tech: 5 },
      flags: { nightHeavy: false, heavilyProcedural: false, nonClinical: false, labBased: false },
      adjacentBranches: ["palli", "nucmed"],
      whyItFits: {
        tech: "Linear accelerators and precise treatment planning make this highly technology-driven.",
        resilience: "You walk alongside people facing cancer — hope and hard news together.",
        continuity: "Patients are followed through long treatment courses and years of follow-up.",
        visual: "Contouring tumours on scans is detailed visual work.",
        research: "Oncology is research-rich, with trials and evolving techniques.",
        patient: "Honest, compassionate conversations are a daily part of cancer care."
      },
      realityCheck: "Emotionally heavy — this is daily cancer care. It is technology- and infrastructure-dependent (linear accelerators), so work is mostly based in big hospitals.",
      askAResident: ["How much of the week is treatment planning vs. clinics?", "How do you handle the emotional side of cancer care?", "What does the job market look like outside big cancer centres?"],
      indiaNote: "Mostly in larger hospitals and cancer centres because of expensive equipment; need is growing as cancer care expands. Also available as DNB (NBEMS).",
      sources: [],
      lastChecked: ""
    },
    {
      whoThrivesHere: "People who enjoy physics and physiology together, and want to work at the edge of imaging and targeted treatment.",
      id: "nucmed", name: "Nuclear Medicine · MD", shortName: "Nuclear Medicine", category: "Diagnostic/Lab",
      availability: "limited-centres",
      availabilityNote: "Departments need licensed facilities and equipment, so they cluster in larger hospitals.",
      careerOutlook: "hospital-based",
      profile: { proc: 2, acuity: 1, patient: 2, continuity: 2, dx: 4, visual: 5, ambiguity: 3, lifestyle: 4, biz: 2, stamina: 1, research: 4, resilience: 2, autonomy: 4, tech: 5 },
      flags: { nightHeavy: false, heavilyProcedural: false, nonClinical: false, labBased: false },
      adjacentBranches: ["radio", "radonc"],
      whyItFits: {
        visual: "PET-CT and scintigraphy interpretation is detailed image work.",
        tech: "It's very equipment- and physics-heavy.",
        research: "A research-rich field, with theranostics evolving quickly.",
        dx: "Functional imaging answers difficult diagnostic questions for other teams."
      },
      realityCheck: "A niche field that is equipment- and regulation-heavy (radiation safety), concentrated in larger centres.",
      askAResident: ["How many centres near you actually have nuclear medicine departments?", "How much therapy (theranostics) vs. diagnostics do you do?", "What are the job options in smaller cities?"],
      indiaNote: "Concentrated in larger cities and centres with PET-CT and radionuclide facilities. Also available as DNB (NBEMS).",
      sources: [],
      lastChecked: ""
    },
    {
      whoThrivesHere: "People who measure success in independence regained, and who enjoy leading a team over weeks and months of steady progress.",
      id: "pmr", name: "Physical Medicine & Rehabilitation · MD", shortName: "PMR", category: "Clinical",
      availability: "limited-centres",
      availabilityNote: "A smaller speciality with comparatively few departments nationally.",
      careerOutlook: "terminal",
      profile: { proc: 3, acuity: 1, patient: 5, continuity: 5, dx: 3, visual: 2, ambiguity: 3, lifestyle: 4, biz: 4, stamina: 2, research: 2, resilience: 3, autonomy: 3, tech: 3 },
      flags: { nightHeavy: false, heavilyProcedural: false, nonClinical: false, labBased: false },
      adjacentBranches: ["sports", "ortho"],
      whyItFits: {
        patient: "You work closely with patients and families to rebuild function and independence.",
        continuity: "Rehabilitation unfolds over weeks to months, with the same patients.",
        lifestyle: "Generally good, predictable hours.",
        biz: "Rehabilitation and pain clinics offer independent-practice options."
      },
      realityCheck: "Function- and rehab-focused, so outcomes are slower and measured in small gains. Public awareness of the specialty is still limited in places. Demand is growing and the lifestyle is good.",
      askAResident: ["What conditions make up most of your caseload?", "How do you work with physiotherapists and the wider team?", "Where do graduates end up practising?"],
      indiaNote: "Growing demand from stroke, spinal injury, trauma and age-related disability, with relatively few specialists in many regions. Also available as DNB (NBEMS).",
      sources: [],
      lastChecked: ""
    },
    {
      whoThrivesHere: "People who like precision, protocols and clear standards, and want to run a service the whole hospital depends on in its most urgent moments.",
      id: "ihbt", name: "Immunohaematology & Blood Transfusion (Transfusion Medicine) · MD", shortName: "Transfusion Medicine", category: "Diagnostic/Lab",
      availability: "limited-centres",
      availabilityNote: "MD IHBT seats are far fewer than Pathology seats, though most large hospitals have a blood centre.",
      careerOutlook: "hospital-based",
      profile: { proc: 3, acuity: 2, patient: 2, continuity: 1, dx: 3, visual: 2, ambiguity: 1, lifestyle: 4, biz: 2, stamina: 1, research: 3, resilience: 2, autonomy: 4, tech: 4 },
      flags: { nightHeavy: false, heavilyProcedural: false, nonClinical: false, labBased: true },
      adjacentBranches: ["path", "micro"],
      whyItFits: {
        lifestyle: "Mostly daytime work, with on-call cover for urgent blood needs.",
        dx: "Solving compatibility problems and transfusion reactions is precise work.",
        ambiguity: "Clear standards and protocols guide much of the work."
      },
      realityCheck: "Blood-bank leadership, lab work and some clinical work (e.g., apheresis). Lifestyle-friendly but niche, and the in-charge carries regulatory and licensing responsibilities.",
      askAResident: ["How much clinical work (apheresis, patient consults) do you do?", "What regulatory responsibilities come with running a blood centre?", "What are the job options outside teaching hospitals?"],
      indiaNote: "Roles leading hospital blood centres and apheresis services — niche but steadily needed. Also available as DNB (NBEMS).",
      sources: [],
      lastChecked: ""
    },
    {
      whoThrivesHere: "People who enjoy complexity — many conditions, many medicines, one person — and who value dignity and function as much as cure.",
      id: "geri", name: "Geriatric Medicine · MD", shortName: "Geriatrics", category: "Clinical",
      availability: "limited-centres",
      availabilityNote: "A newer speciality in India with few dedicated departments so far.",
      careerOutlook: "terminal",
      profile: { proc: 2, acuity: 3, patient: 5, continuity: 5, dx: 4, visual: 1, ambiguity: 4, lifestyle: 2, biz: 3, stamina: 2, research: 2, resilience: 5, autonomy: 2, tech: 2 },
      flags: { nightHeavy: true, heavilyProcedural: false, nonClinical: false, labBased: false },
      adjacentBranches: ["gen_med", "palli"],
      whyItFits: {
        patient: "Patient and family conversations — about goals, dignity and priorities — are central.",
        continuity: "You follow older adults and their families over the long term.",
        resilience: "Frailty, dementia and end-of-life decisions call for steady, compassionate judgement.",
        dx: "Multiple conditions and many medicines make every case a careful puzzle.",
        ambiguity: "Atypical presentations mean you often work with an unclear picture."
      },
      realityCheck: "Complex, multi-morbid older patients make the work emotionally demanding. Need is growing with an ageing population.",
      askAResident: ["How much of your work is acute ward care vs. clinics?", "How do you manage conversations about end-of-life care?", "Where do geriatricians find jobs outside big academic centres?"],
      indiaNote: "Few trained geriatricians relative to a rapidly ageing population; posts are mostly in larger hospitals and academic centres for now.",
      sources: [],
      lastChecked: ""
    },
    {
      whoThrivesHere: "People with exceptional communication skills and emotional steadiness, who believe that comfort, honesty and control of symptoms are a full medical speciality in their own right.",
      id: "palli", name: "Palliative Medicine · MD", shortName: "Palliative Medicine", category: "Clinical",
      availability: "limited-centres",
      availabilityNote: "A newer speciality in India; most units are attached to cancer centres or hospices.",
      careerOutlook: "terminal",
      profile: { proc: 1, acuity: 2, patient: 5, continuity: 5, dx: 3, visual: 1, ambiguity: 4, lifestyle: 3, biz: 2, stamina: 2, research: 2, resilience: 5, autonomy: 3, tech: 1 },
      flags: { nightHeavy: false, heavilyProcedural: false, nonClinical: false, labBased: false },
      adjacentBranches: ["geri", "radonc"],
      whyItFits: {
        patient: "Skilled, honest communication is the main intervention.",
        continuity: "You stay with patients and families through the most important time of their lives.",
        resilience: "You're with people at the end of life every day — and help them live well until then.",
        ambiguity: "Balancing symptom control, wishes and family dynamics rarely has a textbook answer."
      },
      realityCheck: "Constant end-of-life care — deeply meaningful, but among the highest emotional loads in medicine. It needs strong resilience and excellent communication.",
      askAResident: ["How do you process the emotional load of daily end-of-life care?", "How much pain management vs. communication work is there?", "Where do graduates find jobs?"],
      indiaNote: "Services are expanding but still unevenly available, across hospital, hospice, home-care and NGO settings.",
      sources: [],
      lastChecked: ""
    },
    {
      whoThrivesHere: "People who enjoy musculoskeletal medicine with motivated, active patients, and who like working alongside coaches, physios and teams as much as with individual patients.",
      id: "sports", name: "Sports Medicine · MD", shortName: "Sports Medicine", category: "Clinical",
      availability: "limited-centres",
      availabilityNote: "A young field in India, so departments and posts are still few.",
      careerOutlook: "terminal",
      profile: { proc: 3, acuity: 2, patient: 4, continuity: 3, dx: 3, visual: 3, ambiguity: 2, lifestyle: 4, biz: 4, stamina: 3, research: 2, resilience: 2, autonomy: 3, tech: 3 },
      flags: { nightHeavy: false, heavilyProcedural: false, nonClinical: false, labBased: false },
      adjacentBranches: ["pmr", "ortho"],
      whyItFits: {
        patient: "You work with motivated athletes and active people who want to get back to what they love.",
        biz: "Club, team and private-clinic opportunities suit an enterprising mindset.",
        lifestyle: "Mostly clinic-based, with event cover at times.",
        proc: "Joint injections, rehabilitation plans and on-field care keep it hands-on."
      },
      realityCheck: "A newer field, and the market in India is still developing. There are team, club and private opportunities, but career paths are less established than in older branches.",
      askAResident: ["Where do graduates actually get jobs?", "How much musculoskeletal intervention do you learn?", "How do you work alongside orthopaedics and physiotherapy?"],
      indiaNote: "A newer field, with opportunities developing among teams, sports bodies, fitness organisations and private clinics.",
      sources: [],
      lastChecked: ""
    },
    {
      whoThrivesHere: "People fascinated by infectious disease, who want clinical work and research to sit side by side.",
      id: "tropmed", name: "Tropical Medicine · MD", shortName: "Tropical Medicine", category: "Clinical",
      availability: "limited-centres",
      availabilityNote: "Concentrated in a small number of designated institutes.",
      careerOutlook: "institutional",
      profile: { proc: 2, acuity: 3, patient: 4, continuity: 2, dx: 5, visual: 2, ambiguity: 4, lifestyle: 3, biz: 2, stamina: 2, research: 4, resilience: 3, autonomy: 3, tech: 2 },
      flags: { nightHeavy: false, heavilyProcedural: false, nonClinical: false, labBased: false },
      adjacentBranches: ["gen_med", "micro"],
      whyItFits: {
        dx: "Fevers, infections and unusual presentations make it a diagnostician's field.",
        ambiguity: "You often work with overlapping, uncertain clinical pictures.",
        research: "Strongly research- and academic-oriented.",
        patient: "Bedside clinical work with infectious-disease patients remains central."
      },
      realityCheck: "Niche, academic and infectious-disease focused, concentrated in a small number of centres.",
      askAResident: ["Where do graduates work after MD?", "How much clinical vs. research work is there?", "How does it compare with pursuing infectious diseases after General Medicine?"],
      indiaNote: "Few training centres; roles in academics, infectious-disease units and research.",
      sources: [],
      lastChecked: ""
    },
    {
      whoThrivesHere: "People who see the system as the patient — who want to fix the processes, teams and budgets that decide whether good clinical care is possible.",
      id: "hosp_admin", name: "Hospital Administration · MD", shortName: "Hospital Administration", category: "Public health/Admin",
      aliases: ["Health Administration"],
      availability: "limited-centres",
      availabilityNote: "Relatively few seats, mostly in larger institutions.",
      careerOutlook: "institutional",
      profile: { proc: 0, acuity: 2, patient: 2, continuity: 2, dx: 3, visual: 1, ambiguity: 4, lifestyle: 3, biz: 5, stamina: 2, research: 3, resilience: 2, autonomy: 4, tech: 4 },
      flags: { nightHeavy: false, heavilyProcedural: false, nonClinical: true, labBased: false },
      adjacentBranches: ["psm", "fm"],
      whyItFits: {
        biz: "Enterprising, systems-minded doctors thrive here.",
        autonomy: "Leadership roles bring ownership of decisions and teams.",
        tech: "Health IT, data and process design are everyday tools.",
        ambiguity: "You balance people, budgets and priorities without perfect answers."
      },
      realityCheck: "Management and leadership, not clinical care. It suits enterprising, systems-minded doctors — an MBA-adjacent path.",
      askAResident: ["Do you miss clinical work — and can you keep some?", "What roles do graduates get in their first few years?", "How much authority do doctor-administrators really have?"],
      indiaNote: "Roles in corporate and government hospitals, quality and accreditation, health-tech and consulting.",
      sources: [],
      lastChecked: ""
    },
    {
      whoThrivesHere: "People fascinated by human physiology at its limits, who want a structured service career combining medicine, research and aviation.",
      id: "aerospace", niche: true, name: "Aerospace Medicine · MD", shortName: "Aerospace Medicine", category: "Public health/Admin",
      availability: "restricted-entry",
      careerOutlook: "institutional",
      profile: { proc: 1, acuity: 2, patient: 3, continuity: 2, dx: 3, visual: 2, ambiguity: 3, lifestyle: 3, biz: 1, stamina: 3, research: 4, resilience: 3, autonomy: 3, tech: 4 },
      flags: { nightHeavy: false, heavilyProcedural: false, nonClinical: false, labBased: false },
      adjacentBranches: ["marine", "physio"],
      whyItFits: {
        research: "Human performance in extreme environments is a research-rich area.",
        tech: "Aviation technology and physiology-training equipment are part of the work.",
        stamina: "The work environment can be physically demanding."
      },
      realityCheck: "Very specialised, with limited settings — careers are largely linked to the Armed Forces and aviation medicine. It is not a route into general clinical practice.",
      askAResident: ["Who is eligible for this course, and what service commitments come with it?", "What does day-to-day work look like beyond aircrew fitness assessments?"],
      indiaNote: "Training and jobs are closely tied to the Armed Forces medical services and aviation medicine, with few civilian openings. Check eligibility rules carefully.",
      sources: [],
      lastChecked: ""
    },
    {
      whoThrivesHere: "People drawn to physiology in extreme environments and a structured service career at sea and in diving medicine.",
      id: "marine", niche: true, name: "Marine Medicine · MD", shortName: "Marine Medicine", category: "Public health/Admin",
      availability: "restricted-entry",
      careerOutlook: "institutional",
      profile: { proc: 2, acuity: 3, patient: 3, continuity: 2, dx: 3, visual: 2, ambiguity: 3, lifestyle: 2, biz: 1, stamina: 4, research: 3, resilience: 3, autonomy: 3, tech: 3 },
      flags: { nightHeavy: false, heavilyProcedural: false, nonClinical: false, labBased: false },
      adjacentBranches: ["aerospace", "em"],
      whyItFits: {
        stamina: "Work in demanding environments such as ships, submarines and diving settings.",
        acuity: "Diving and maritime emergencies need calm, practical responses.",
        research: "Underwater and maritime physiology is a specialised research area."
      },
      realityCheck: "Very specialised, with limited settings — largely linked to naval and maritime services. Few civilian career paths.",
      askAResident: ["Who is eligible for this course, and what service commitments come with it?", "What civilian roles, if any, do graduates take up?"],
      indiaNote: "Largely tied to naval and Armed Forces medical services, with very limited civilian settings. Check eligibility rules carefully.",
      sources: [],
      lastChecked: ""
    }
  ]
};
