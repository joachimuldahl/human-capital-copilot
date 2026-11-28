# Plan page redesign: growth first, honest about risk

*28 Nov 2026 · For Claude Code. Became BUILD_SPEC section 19 (v1.7). Engine and section 9 values must not change; this only adds functions.*

## Goal

A beginner should leave the Plan page understanding three things, in this order:
1. **Where my money could be in X years** if I follow the plan, and the realistic range around that.
2. **What it costs me to stay as I am** (too cautious or too risky), shown as two paths side by side.
3. **What a good and a bad single year look like.** The downside stays visible but calm, not the first thing on the page in big red numbers.

**Honesty rule (not negotiable):** projections always show the range, including the 1-in-10 bad outcome, next to the likely one. Never a single optimistic line. Label everything "in today's money, before fees and taxes, not a guarantee". This keeps the page fair and balanced, which suitability and marketing rules expect, and it's what an examiner will check.

---

## 1. New engine functions (`src/engine/projection.ts`, pure, tested)

**Assumptions** (add to `assumptions.ts`, each marked "assumption, editable"):
- Expected nominal returns: equity 7.5% · bonds 4.0% · gold 4.5% · bitcoin 7.5% (no credible basis; deliberately set equal to equity) · cash 3.0%. Loan cost = cash + borrowSpread = 4.5%.
- Inflation 2.0%, so all projections are **real** (today's money). Equity real = 5.5% = rfReal + erp, consistent with the glide path.

**`portfolioParams(weights)`** → `{ mu, sigma }` for a weight vector over equity, bonds, gold, btc, cash and loan (loan negative):
- mu = Σ wᵢ·(returnᵢ − inflation) + loan·(loanRate − inflation), where loan is the negative weight, so borrowing costs money.
- sigma = sqrt(xᵀ·COV·x) over equity, bonds, gold and btc (cash and loan have zero volatility).

**`projectWealth({ startValue, monthlySaving, weights, years, paths = 5000, seed = 42 })`**
- Simulates yearly log-normal returns from mu and sigma: log-return mean m = ln(1+mu) − ½·s², with s² = ln(1 + sigma²/(1+mu)²).
- Seeded PRNG (mulberry32) plus Box–Muller, so every run gives the same numbers.
- The yearly saving (12 × monthlySaving, constant in today's money) is added at each year end.
- Returns, per year 0…years: `p10, p50, p90` and `paidIn` (startValue + cumulative savings), plus at the horizon: `probBelowPaidIn` (share of paths ending below the money paid in) and `probBeatsCash` (share ending above the same savings held in cash).

**`oneYearRange(weights, startValue)`** → `{ good: p90, typical: p50, bad: stressLoss(...) }` in money and %, one year ahead without savings. "Bad" uses the existing 2008-style stress test, so the numbers match the old crash test.

**Tests:**
- sigma = 0: the result equals deterministic compounding exactly.
- No savings: the simulated median is within 2% of the analytic median startValue·exp(years·m).
- The same seed gives identical output.
- p10 ≤ p50 ≤ p90 at every year.
- The loan weight lowers mu by loan × (loanRate − inflation).
- Section 9 tests are unchanged.

---

## 2. Page layout (top to bottom)

**A. Plan summary (hero card)**
- "Mads's plan" + target **1.20×** + one plain sentence: "A global stock fund plus a small loan from your broker" (generated from the allocation: equity only → "A global stock fund"; loan → "…plus a small broker loan"; bonds share → "…with X% in bonds for stability").
- Three small tiles for the selected horizon: **Money you put in** · **Likely value** (p50) · **Range** ("1 in 10 bad: kr X — 1 in 10 good: kr Y").
- "Why this number?" link (keep).

**B. "Where your money could be" (main card, default open)**
- Horizon toggle: **5 · 10 · 20 · 30 years · Until retirement**. Default 10 years.
- **Fan chart** (Recharts area + lines):
  - Lime shaded band = target plan p10–p90; solid lime line = target plan p50.
  - Dashed sky line = **your current mix** p50, with a light sky band if "Show range" is ticked.
  - Thin grey line = money paid in.
  - Tooltip per year: likely value, range, paid in.
- **Adaptive callout** under the chart, from the numbers:
  - Current mix is more cautious than the target (e.g. Mads, 80% cash): "Staying as you are could leave you about **kr X less** after N years (likely case)."
  - Current mix is riskier than the target (e.g. Jonas): "Your current mix could grow more on average, but in the 1-in-10 bad case you'd end with **kr X**, below the kr Y you put in. The plan's bad case is kr Z."
  - Within ±0.15× of the target: "You're already close to your plan. Keep saving monthly."
- One line of plain-language odds: "Chance of ending below what you put in: **X%** after N years (plan) vs **Y%** (current mix)."
- "Compare with" switch: **My current mix** (default) / **All in cash** (a savings account at 3% nominal, the classic beginner mistake).

**C. Tabs: "Growth over time" | "A good year vs a bad year"** (the growth view above is the first tab and the default)
- Second tab: three tiles for one year ahead with the target plan: **Good year** (p90, lime) · **Typical year** (p50, neutral) · **Bad year, like 2008** (stress test, **amber, not red**). Each shows money and %. Under the bad year: "Within your limit of kr 112,124 ✔". Same tiles for the current mix in a smaller row below.
- Calm explanation: "Bad years happen. What matters is that the loss stays within what you said you could handle, and that you keep investing through it."
- Remove the old standalone red "Crash test" section; its numbers now live in this tab.

**D. "What you'd own" (simplified allocation)**
- Two horizontal stacked bars: **Today** vs **Plan** (segments: stocks, bonds, gold, crypto, cash; the loan shown as a hatched segment beyond 100% labelled "borrowed").
- The detailed table moves into a collapsible "Details" section.

**E. Example products** (keep as is).

**F. "How to get there"** as a numbered checklist with amounts:
1. "Put your next monthly savings (kr 5,139) into a global stock fund."
2. "Move kr 149,498 from cash into the stock fund."
3. Only if borrowing applies and is opted in: "Optional: borrow kr 37,375 from your broker. Read 'Borrowing' below first."

The footer line stays: "Educational example, not advice. This app never places orders."

**G. Advanced (collapsed by default)**
- **Borrowing to invest** (only when target > 1.0×): as now (loan, interest, margin buffer, broker loan vs leveraged ETF tabs).
- **Optional satellites** (gold and crypto sliders): moved here from the top of the page. Changing them updates the chart and the tiles.

---

## 3. Visual rules

- Colours: gains and plan = lime; current mix = sky; money paid in = slate; losses = **amber**. Red only for a loss that exceeds the user's own limit.
- Numbers: likely values big (Space Grotesk), ranges smaller and muted. Always "in today's money".
- Every chart has a one-line "What this means" caption written from the data.
- Beginner wording: "likely" (median), "1 in 10 bad case" (p10), "1 in 10 good case" (p90). Explain these once with a small ⓘ.
- Phone layout: tiles stack; the fan chart stays readable (no more than 4 x-axis labels); the horizon toggle scrolls horizontally.

---

## 4. Method page and description

- **Method page,** new section "Projections": the formulas above, the assumptions table and the limitations:
  - constant expected returns
  - yearly steps
  - no fees or taxes
  - savings constant in today's money
  - the target held constant over the horizon (no glide path in the projection)
  - simulated with 5,000 seeded paths
- **Application description:** one paragraph on the projections and the "honest range" principle. Retake the Plan screenshots.

---

## 5. Acceptance criteria

- Plan page order: summary → growth chart (default tab) → good/bad-year tab → allocation → products → how to get there → advanced.
- Mads at 10 years: the plan's likely value is above the current mix's likely value, and the callout states the gap. Jonas: the callout uses the "riskier" wording with his p10.
- The bad-year tile equals the old stress-test numbers for every persona (target and current).
- No red on the page unless a loss exceeds the user's limit.
- All projection tests pass; section 9 values are unchanged; lint and build pass; works at 375px and 1280px.
- BUILD_SPEC gets this file as section 19 (v1.7).
