# FOMOMD

**Helps Indian MBBS graduates find a postgraduate branch that fits them — no ranks, no cutoffs.**

🔗 **Live:** https://fomomd.vercel.app · 📋 **Audit:** https://fomomd.vercel.app/dev/audit.html

<!-- Replace with a real screenshot: save one to docs/screenshot.png and it will appear here -->
![FOMOMD results page](docs/screenshot.png)

A 28-question self-reflection tool for doctors choosing an MD/MS (or DNB) branch during post-NEET-PG counselling. It runs entirely in the browser: no login, no backend, no analytics, nothing stored.

Content version **1.5** (beta). MIT licensed.

---

## How it works

**28 indirect questions → 14 trait dimensions → double-centred cosine similarity against 33 expert-estimated branch profiles → fit bands, not percentages.**

Questions never name a branch, so prestige can't steer the answers. They ask about the work instead: which room you'd rather spend the day in, how you feel about a 3 a.m. call, whether you'd rather own a case end-to-end or hand it over. Each answer nudges dimensions such as *procedural*, *acuity*, *patient contact*, *predictable hours* and *research*.

The results page has four parts: **your closest 3**, the **best fit in every branch family**, a **full fit map** of all 33 ranked, and a **shortlist tool** where you tick the branches realistically open to you and see how those compare. Every branch shows why it may fit, where it may *not* fit, an honest reality check, questions to ask a resident, who thrives there, its long-term outlook and how widely it is offered.

## Engineering decisions worth noting

**Double-centred scoring, because the first version barely discriminated.** Plain cosine similarity on raw 0–5 profile vectors favoured branches that scored high on many dimensions at once, so very different answers produced suspiciously similar results. Each dimension is now expressed as a z-score across all 33 branch profiles — "how unusual is this branch on this dimension" — and the user's vector is centred on their own mean, so only the *shape* of their preferences is compared, never the level. Measured over 5,000 random answer sets, the spread (Shannon entropy) of #1 results rose from **92.5% to 95.5%** of the theoretical maximum, and branches with distinctive but non-extreme profiles stopped being buried.

**Skipped questions were silently read as dislikes.** A skipped question left its dimension at the scale midpoint. After centring, that midpoint was compared against the user's own mean — so an untouched dimension came out as a mild *like* or *dislike* depending on entirely unrelated answers (measured at ±0.6 SD). The fix tracks per-dimension coverage: a dimension with no evidence behind it is dropped from the comparison and the remaining weights are renormalised. Nothing is imputed. An audit check runs answer sets with 0–8 skips and confirms results don't drift toward bland, middle-of-the-road branches.

**Availability tiers, so nobody is recommended a door they can't open.** Every branch is tagged `widely-available`, `limited-centres` or `restricted-entry`. Restricted-entry branches (armed-forces and designated-institute routes) never appear in the closest 3 or the family bests, but stay in the full fit map with their access route stated plainly — hiding them would be its own kind of dishonesty.

**A bias and discrimination audit that can fail the build.** [`dev/audit.html`](dev/audit.html) runs in the browser with no tooling: 8 persona tests, 5,000 random answer sets, per-branch distribution limits, reachability, entropy, single-answer sensitivity, determinism, a gender-proxy and gendered-language scan across every string including generated output, and a check that every displayed statistic carries its country, year and source. It prints PASS/FAIL per check.

## What this deliberately does NOT do

- **No rank, NEET-PG score, cutoff, college or seat prediction.** It never asks for them and never uses them.
- **No invented statistics and no salary figures.** Earnings and lifestyle are described qualitatively. Every statistic shown must carry its country and year in the same sentence and be registered in `data.js`.
- **No claim to be counselling.** It is a conversation-starter to take to residents, consultants and a mentor.

## Tech

Vanilla HTML, CSS and JavaScript. **No build step, no dependencies, no framework, no backend, no database, no analytics.** Clone it and open `index.html`.

That is a deliberate choice, not a limitation: the people who maintain the content are doctors, not developers, and all the wording lives in one readable `data.js`. It also means the whole thing is auditable by reading it, deploys as static files anywhere, and keeps its privacy promise structurally — with no server, there is nowhere for answers to go. A service worker adds offline use after the first visit.

---

## Hard rules (never violate)

1. **No rank, NEET-PG score, cutoff, college or seat prediction** — anywhere, ever.
2. **No invented statistics, no salary figures, no cutoff numbers.** Earnings and lifestyle are described in words only. Every statistic shown must carry its **country and year in the same sentence**, and must be registered in `statistics` in `data.js`.
3. **Guidance, not counselling.** The disclaimer is always visible on the results screen.
4. **Private by design.** No login, no backend and no cookies. Nothing is stored. Answers live only in the browser tab's memory.

> **⚠️ NEVER add rank, cutoff or college/seat prediction, or salary numbers, in future edits.**

## Tone rule

The name plays on "fear of missing out", but **FOMOMD must reduce anxiety, never add to it.**

- No urgency, countdowns, "don't miss out", "last chance" or fear-based phrasing, anywhere.
- The voice is calm, warm and reassuring.

---

## What's in the folder

| File | What it is |
|---|---|
| `index.html` | The page. Open this. |
| `styles.css` | Colours and layout (light + dark). |
| `app.js` | Scoring, screens, share card, method page. Fit-band thresholds and other tuning constants are at the top. |
| `data.js` | **All words and scoring data**: UI strings by language, glossary, dimensions, questions, branches, content version and review info. |
| `sw.js` | Service worker, for offline use after the first visit. |
| `dev/audit.html` | Developer-only bias and integrity audit (not linked from the app). |
| `LICENSE` | MIT licence. |
| `README.md` | This guide. |

---

## Run it locally

**Double-click `index.html`.** It works straight away with no server, because it uses plain `<script>` tags.

(The offline service worker only activates when the site is served over http/https, e.g. once deployed.)

To test like a real website, including offline mode and the audit page:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`, or `http://localhost:8000/dev/audit.html` for the audit.

---

## The method (plain English)

The app has an **About the method** page with the full explanation. In short:

- **14 dimensions**, e.g. hands-on work, adrenaline, patient contact, predictable hours, research. Each answer nudges some of them. Your scores run from 0 to 5; a dimension measured by only a few questions is pulled towards the middle.
- **Branch profiles** are 0–5 scores per dimension. They are **expert-estimated and not yet validated in Indian students.**
- **Skipped questions are never guessed at (v1.3).** FOMOMD tracks how much weight each dimension actually received. A dimension with no evidence behind it is dropped from the comparison entirely and the remaining weights are renormalised — it is never filled in with a default. (Before v1.3 an untouched dimension sat at the scale midpoint, which after centring could read as a mild like *or* dislike depending on unrelated answers.) Skip more than 4 questions, or leave fewer than 10 dimensions covered, and the results say plainly that it is a rough read, with a button back to the first skipped question.
- **Long-term outlook (v1.4).** Every branch carries one of four values, shown as a plain line on its card: `terminal` (independent practice realistic after the degree), `hospital-based` (a full consultant career, but practised inside a hospital), `often-paired` (commonly paired with a DM/MCh for consultant practice in larger cities) and `institutional` (mainly teaching, labs, research, industry or public systems). General Medicine and General Surgery carry their own wording via `careerOutlookNote`. No numbers, no salary, no market claims.
- **Availability tiers (v1.3, revised v1.4).** Every branch is tagged `widely-available`, `limited-centres` or `restricted-entry`. Restricted-entry branches (armed-forces and designated-institute routes) are never offered as a closest-3 or family best, but still appear in the full fit map with their access route stated plainly. Limited-centres branches stay fully eligible and carry a note to check what is actually on offer in your counselling.
- **Dealbreakers** remove branches:
  - fainting at blood → heavily procedural branches
  - no frequent nights → night-heavy branches
  - needing patient contact → non-clinical and lab-based branches
- **Matching (changed in v1.2)** uses *double-centred* cosine similarity. In plain English:
  - Plain cosine compared raw 0–5 scores, so a branch scoring high on many dimensions looked similar to almost everybody, and results barely moved when answers changed.
  - Now each dimension measures **how unusual a branch is on it compared with every other branch**. Scoring "4 out of 5 on procedures" counts only relative to how procedural other branches are.
  - Your own scores are centred on your personal average, so only the **shape** of your preferences counts, not how enthusiastically you answered.
  - Result: much better discrimination. Across 5,000 random answer sets every branch can come out #1, and the spread of #1 results reaches about 95% of the theoretical maximum (see the audit).
- **Interest nudges** (e.g. caring for children) are small and capped. Two niche defence-linked branches need a slightly stronger fit to appear.
- **Fit bands** replace percentages, recalibrated for v1.2 from 5,000 random answer sets: "Strong fit" is roughly the top 10% of all branch scores, "Good fit — explore" the next 25%, "Possible fit" the rest. The thresholds are named constants at the top of `app.js`.
- **Magnitude check**: if your answers are very flat, the app says results are less certain.
- **Sensitivity check**: your answers are re-scored 10 times with every dimension weight randomly shifted by up to ±20%. The stability line shows how often each branch stayed in your top 3.
- **Consistency checks**: 4 answer pairs, including 2 reverse-worded mirror items. Contradictory answers trigger a gentle banner.

## Thin dimensions and v1.4 candidates

Every dimension is fed by at least 3 questions (most by 8 or more), because most options load several dimensions at once. `THIN_DIM_QUESTIONS` in `app.js` is set to 4, so `biz` (3 questions) counts as low-confidence: wherever it drives a recommendation, the card adds "This is based on only a couple of your answers."

Four drafted questions for `biz` and `research` sit in `candidateQuestionsV14` in `data.js`. **The app never reads that block.** Adding all four would take the bank to 32 questions, past the 28-question cap, so that cap needs a decision before any of them go live. To make one live, move it into the right round in `rounds`.

## Known limitations

- **Modest predictive validity.** Links between personality or interests and specialty choice are real but modest. In a 2009 US study, the AAMC's Medical Specialty Preference Inventory (MSPI) correctly predicted medical students' eventual specialty about 58% of the time (Glavin, Richard & Porfeli, *Journal of Vocational Behavior*, 2009).
- **Expert-estimated profiles.** The branch scores come from reasoning about day-to-day work, not from measured data.
- **No Indian validation yet.** Nothing has been tested with Indian students, residents or consultants.
- **Preferences change.** Clinical exposure shifts what people want. Users are encouraged to retake after a few months.
- **It deliberately ignores** rank, seats, finances, service bonds and seat-leaving penalties, location, family obligations and workplace safety. All of these matter a lot for the real decision.

---

## Before each counselling season

- **Verify the specialty list against the current NMC PG regulations before each counselling season.**
- Check each branch's text. Add citations to its `sources` array and set `lastChecked` (e.g. `"2027-05-01"`).
- Update `lastReviewed` and `reviewerName` at the top of `data.js`. These appear in the footer.
- Bump `contentVersion` in `data.js` and `CACHE_VERSION` in `sw.js` (e.g. `fomomd-v1.2-2027-05-01`) so returning visitors get the new files.
- Run the bias audit (below).

---

## Run the persona tests and bias audit

**Full audit (recommended):**

1. Serve the folder (`python3 -m http.server 8000`), or just double-click `dev/audit.html`.
2. Open `http://localhost:8000/dev/audit.html`.

It runs:

- **Data validation**: traits, ids, glossary terms, adjacency, 28 questions or fewer.
- **All 8 persona tests.**
- **500 seeded random answer sets.** Checks: no errors; valid fit bands with no percentages; "why" built only from high-scoring traits; a "may NOT fit" statement on every result; no rank/cutoff/salary language.
- **Gender checks.** No question asks for or uses gender, and no data field stores it. No dimension is defined in gendered terms, and no question probes common proxies (marriage, family plans, appearance…).
- **Discrimination checks (new in v1.2).** 5,000 random answer sets: no branch may take more than 25% or fewer than 2% of top-3 places; every branch must reach #1 for some answer set; the spread (Shannon entropy) of #1 results must be at least 80% of maximum; single-answer flips must move the top 3 without churning it completely; and every scored question's options must differ enough to carry information. It also prints the old v1.1 distribution beside the new one.
- **Availability checks (v1.3).** Every branch must carry a valid tier, and no restricted-entry branch may appear in the closest 3 or the families section across 5,000 random sets.
- **Skip-bias check (v1.3).** Runs answer sets with 0, 2, 4, 6 and 8 skipped questions and reports how the spread of #1 results changes, plus how distinctive the winning branches are. It fails if skipping pushes results towards bland, middle-of-the-road branches.
- **A gendered-language scan** across all specialty text, UI strings, questions and generated results (he/she, "female-friendly", "for women", etc.).
- **Content verification.** Every statistic must carry its country and year in the displayed sentence and have a registered source; any unregistered percentage in the UI fails. Empty review fields are flagged. Per-branch sources are listed for information.

The top of the page prints a PASS/FAIL summary. The audit checks wording and structure. A true statistical gender-proxy test would need real, consented demographic data.

**Quick console check:** open `index.html`, press F12 (Mac: Cmd + Option + J), type `runPersonaTests()` and press Enter.

| # | Persona | Must appear in top 3 |
|---|---|---|
| 1 | The maker | General Surgery **or** Orthopaedics |
| 2 | The screen detective | Radiology |
| 3 | The calm lifestyle-seeker | Dermatology |
| 4 | The talker | Psychiatry **or** Family Medicine |
| 5 | The adrenaline seeker | Emergency Medicine |
| 6 | The scientist who faints at blood | A Diagnostic/Lab or Non-clinical branch, with heavily procedural branches removed |
| 7 | The child advocate | Paediatrics |
| 8 | The entrepreneur | Dermatology / Ophthalmology / Radiology |

If a persona fails after edits, adjust **answer weights** only, never the hard rules.

---

## Editing text safely (`data.js`)

- Only change words **inside quotation marks**. Use single quotes inside if needed: `"often 'behind the scenes'"`.
- Don't delete commas, brackets or colons. Words in `{curly braces}` are filled in by the app — keep them.
- **UI text** lives in `strings.en`.
  - **To add Hindi:** copy the `en` block, rename it `hi`, translate it, and open the site with `?lang=hi`.
  - Question and branch text can be translated through the `translations` overlay. `app.js` never needs changing.
- **Glossary (i) tips** live in `strings.en.glossary`. Add a term there, then list it in a question's `terms`.
- **Adjacent branches**: edit `adjacentBranches` using branch ids (e.g. `"nucmed"`).

---

## Analytics and feedback

Both are **off until a GoatCounter code is set** in `data.js`. With them off, FOMOMD makes no third-party requests at all and the feedback block is hidden entirely, so there is never a dead button.

To turn them on: create a free site at [goatcounter.com](https://www.goatcounter.com), then in `data.js` set `analytics.goatcounterCode` to your account name and `analytics.enabled` to `true`.

**What can be sent.** GoatCounter is cookieless. FOMOMD sends a page view plus these fixed event names, and nothing else:

`quiz_start` · `round_complete_1…4` · `quiz_abandoned_qN` (the question number reached) · `results_reached` · `fitmap_opened` · `shortlist_used` · `sharecard_downloaded` · `results_copied` · `retake_clicked` · `feedback_useful` · `feedback_not_useful`

**How that is enforced.** `ALLOWED_EVENTS` in `app.js` is the complete list, and `track()` drops anything not on it — a name carrying a branch, an answer or free text is refused rather than sent. `dev/audit.html` checks three things: the list matches the approved set, hostile payloads are refused, and every `track()` call in `app.js` passes a literal from the list.

**Privacy wording adapts automatically.** With analytics on, the footer and landing page stop saying "nothing about you is saved" and say precisely what happens instead: answers and results never leave the page, anonymous visits and a few actions are counted. The method page gains a "What FOMOMD sends" section listing every event above. With analytics off it says "Nothing."

**Feedback.** Under the results: "Was this useful?" with 👍 / 👎. A tap sends one anonymous event and shows a short thank-you. It appears once per session, never nags and never blocks the results. No stars, no rating scale, no popup.

## Deploy

The site is static, so any host works. It is currently deployed on **Vercel** from this repo: push to `main` and Vercel redeploys.

**Vercel (from this repo):** Add New → Project → import `fomomd` → Framework Preset **Other** → leave Build Command and Output Directory empty → Deploy. Set the project name to `fomomd` so the URL is `fomomd.vercel.app`.

**Anything else:** drag the folder onto [app.netlify.com/drop](https://app.netlify.com/drop), or enable GitHub Pages (Settings → Pages → deploy from `main` / root). No build step, so nothing needs configuring.

**After changing any file:** bump `contentVersion` in `data.js` and `CACHE_VERSION` in `sw.js` (e.g. `fomomd-v1.6-2027-01-15`), or returning visitors keep the cached copy until their next reload.

### Custom domain

To point a domain such as `fomomd.in` at the Vercel deployment:

1. Vercel → Project → **Settings → Domains → Add**, enter `fomomd.in` and `www.fomomd.in`.
2. At your registrar, add the records Vercel shows — typically an `A` record for the apex domain to Vercel's IP, and a `CNAME` for `www` to `cname.vercel-dns.com`. Vercel issues the HTTPS certificate automatically.
3. If you run the DNS through **Cloudflare**, add the same records there and set them to **DNS only** (grey cloud) until Vercel verifies the domain and issues the certificate. Proxying (orange cloud) before verification causes a certificate loop. You can enable the proxy afterwards; if you do, set SSL/TLS mode to **Full (strict)**.
4. `.in` domains need a registrar that supports them (most do). Nothing in the app hardcodes a domain, so no code change is needed.

---

*Guidance, not a verdict.* Speak to residents, consultants and a trusted mentor before deciding. Counselling season is stressful — if you're feeling overwhelmed, talk to someone you trust, or call **Tele-MANAS on 14416**.
