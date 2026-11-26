# Human Capital Copilot: application description

*Draft · 26 Nov 2026 · Team: Jens, Damien, Joachim · Live demo: https://building-your-wealth.vercel.app/*

> **Draft notes for the team (delete before submission):** check the wording of each section, export this file to PDF, add Damien's verified product data when it arrives (section 8), and add any prompts from Jens and Damien to `prompts/`, and add the design-phase export as `prompts/design-phase-log.md` (referenced in section 7, not in the repo yet). Screenshots are in `docs/screenshots/`.

## 1. Problem

Young people are told to invest "according to their risk profile", but that profile usually looks only at the money they already have and how they feel about losses. For a 24-year-old, the money already invested is a small part of their wealth. The biggest part is **human capital**: the present value of everything they will save from their salary over their working life. For our demo person Sofie, future savings are worth about €219,000 against €10,000 invested today, so **96% of her lifetime investable wealth is still in her future salary**.

That matters for risk, in two directions:

- If your income is safe and **bond-like** (a doctor in the public health system), your salary already works like a large bond holding. Your portfolio can carry more stock-market risk.
- If your income is **stock-like** (a bank trader with a bonus, a startup founder), your salary falls in the same crashes as the stock market. Your portfolio should carry less.

Standard risk questionnaires miss both effects. Young people with safe jobs often hold too little risk (lots of cash), while people in finance often double up on the same risk.

## 2. Solution

Human Capital Copilot turns 16 questions into one number, **Risk Capacity**: how much risk your portfolio can carry, as a multiple of the global stock market (1.00× = 100% in a global stock index fund; 1.50× = the most we ever suggest, using a broker loan). The app then:

1. **Explains** the number in plain language: which limit applies, how much of your wealth is future salary, and whether your income is bond-like or stock-like.
2. **Compares** it with your actual portfolio, looking through your ETFs to the companies, regions and sectors you really own.
3. **Shows a plan:** a target allocation, a 2008-style crash test against the loss you said you could live with, and the changes to make at your own broker, with example products labelled "Example, not advice".

## 3. Innovation

- **Whole-life risk sizing for ordinary users.** The lifecycle-investing research (Ayres & Nalebuff 2010; Ibbotson et al. 2007) is turned into a 3-minute questionnaire with a live gauge that moves with every answer. It is marked "Preliminary" until every question is answered.
- **Show, don't tell.** Every question has a "Why we ask" panel with the reason, how the answer is used, the research behind it and a live line computed by the engine, for example "Retiring 2 years later would add €5,274 to your future savings, but your target stays at 1.50× because it is limited by our 1.5× safety cap."
- **Income type changes the answer.** The same age, savings and risk attitude give very different results for a doctor and a trader, because the app measures how stock-like each income is (βH).
- **Safety built into the number.** A 1.5× policy cap, gates for missing emergency savings and expensive debt, a knowledge check before borrowing, and a cap based on the user's own maximum loss.
- **Look-through of ETFs.** The app shows hidden concentration (Sofie owns 14.4% Apple across a stock and two ETFs) and overlap between ETFs (VWCE and CNDX share 15% of their top holdings).
- **Transparent and deterministic.** Every number comes from tested formulas, and every assumption is shown in an Assumptions table. There is no AI chat and no AI-generated numbers.

## 4. Users and personas

Students and young professionals (roughly 20–35) who have started investing or are about to. Four demo people let anyone try the app without typing:

| Person | Story | Risk Capacity | Why | Their demo portfolio |
|---|---|---|---|---|
| Sofie, 24 | Finishing a master's, starting as a consultant | **1.50×** | Limited by the 1.5× safety cap | 1.01×: too little risk; hidden Apple concentration and ETF overlap |
| Mads, 27 | Doctor in the public health system | **1.20×** | Limited by the most he could lose in a bad year | 0.20×: mostly cash, far below target |
| Lea, 26 | Trader at a bank with a yearly bonus | **0.34×** | Her income is already stock-like (βH 0.61) | 0.81×: too much risk; finance job *and* finance-heavy portfolio |
| Jonas, 29 | Startup founder | **0.67×** | Limited by the most he could lose in a bad year | 2.39×: far too much risk (60% Bitcoin) |

## 5. Features

| Page | What it does | Screenshot |
|---|---|---|
| Landing | Hero, "Start (3 minutes)", demo people, how it works, research basis | `screenshots/desktop-landing.png` |
| Onboarding | One question per screen (16 screens in 4 steps, Enter to continue) + review with edit links; a "Why we ask" card with research and a live effect line on every question; live Risk Capacity panel with an "Estimate" / "Preliminary" chip and the three drivers (a bottom bar that opens as a sheet on phones); "I'm not sure" on three questions; knowledge check and borrowing opt-in | `screenshots/desktop-onboarding-7.png`, `screenshots/desktop-onboarding-1.png`, `screenshots/mobile-onboarding-2.png` |
| Results | Risk Capacity, the limit that applies, four drivers, lifetime balance sheet, glide path, what-if sliders | `screenshots/desktop-results-sofie.png`, `screenshots/mobile-results-sofie.png` |
| Portfolio | Demo portfolio or quick entry; risk fit; crash test; look-through by asset class, region, sector, concentration, overlap | `screenshots/desktop-portfolio-sofie-conc.png`, `screenshots/mobile-portfolio-sofie.png` |
| Plan | Safety gates, satellites, target vs current, example products, crash test, borrowing panel, how to get there, Assumptions | `screenshots/desktop-plan-sofie.png`, `screenshots/mobile-plan-gates.png` |
| Method | For the examiner: the five calculation steps with Sofie's worked example (computed live by the engine), every assumption with a one-line justification, the limits and gates, limitations and full references | `screenshots/desktop-method.png` |

The app works on phones (375 px) and desktops, saves answers in the browser (no login), and needs no backend. The design follows a written design system (BUILD_SPEC section 15, v1.3): a dark interface (near-black background, layered surfaces and 1px borders instead of shadows), one lime accent for the user's own number and actions, sky blue for future savings and values below 1.0×, amber for warnings, Space Grotesk for headings and big numbers and Inter for text, with tabular figures throughout. The team approved three mockups (landing, onboarding question, results) on a design canvas; the app rebuilds them with its own components. Colour pairs pass WCAG AA, and Lighthouse rates accessibility 100 on the pages tested.

## 6. Method

All human-capital maths is in real (inflation-adjusted) terms. The full specification is in `BUILD_SPEC.md` section 5, and all values are in `src/engine/assumptions.ts`.

1. **Risk attitude.** The average of two questions (reaction to a 30% fall; a job gamble) gives a risk band and a risk aversion γ (1.75 to 7). The optimal share of total wealth in stocks follows Merton (1969): **w\* = min(ERP / (γ·σ²), 1)**, with ERP = 4.5% and σ = 16%.
2. **Human capital.** Future savings are projected from today's income, growing at the user's expected rate until age 45 and 0.5% a year after, and discounted at the real risk-free rate (1%) plus a spread for income security (1–4.5%): **H = Σ savingsRate · yₐ / (1+d)^(a−age)**.
3. **Income type.** βH = sector base (0.05 public … 0.65 founder) + 0.3 × variable-pay share, capped at 0.9.
4. **Risk Capacity.** Stocks the investor should hold across financial wealth F and human capital H, expressed relative to F: **raw = (w\*·F + (w\* − βH)·H) / F**. Stock-like income (high βH) lowers the result, bond-like income raises it.
5. **Limits, in order:** policy cap 1.5×; 1.0× without a 3-month buffer; 1.0× with debt above 7%; 1.0× unless borrowing is allowed (15+ years to retirement, at least €5,000, knowledge check passed, opted in, and borrowing cheap enough); and a loss cap = max loss ÷ (50% × F). The final value is the raw value capped by the lowest limit, with a floor of 0.2×.
6. **Allocation.** The target is turned into weights for stocks, bonds, gold and Bitcoin with the same volatility (target × 16%), solved by bisection using a fixed correlation matrix. Weights above 100% stocks mean a broker loan.
7. **Portfolio checks.** Actual risk = portfolio volatility ÷ 16%; crash test = equity −50%, Bitcoin −75%, bonds +3%, gold +5%; look-through via ETF top holdings; risk fit is "on target" within ±0.15×.

**Testing.** 181 automated tests reproduce every expected value in the specification (all four personas, demo portfolios, allocations, crash tests, glide path, gate cases) and check the pages themselves. Engine coverage is 100% of lines.

## 7. How AI was used in development

The app was built with **Claude Code** (Anthropic's coding agent) working from a written specification, `BUILD_SPEC.md`, which the team developed with Claude in a design phase (see `prompts/design-phase-log.md`).

- **Spec first, then phases.** The build was split into 7 phases (setup, engine, data, three page phases, polish). Each phase had acceptance criteria, and the agent planned before building.
- **Every prompt is logged.** A small hook in the project (`.claude/hooks/log-prompt.mjs`) automatically saves every prompt verbatim to `prompts/PROMPT_LOG_AUTO.md`. `prompts/PROMPT_LOG.md` records what the AI did, which files changed, test results, what the human checked and the lesson from each task.
- **Numbers are never trusted, they are tested.** The spec lists exact expected values (for example Sofie 1.50×, Lea 0.34×, Apple 14.4%). The AI wrote tests that reproduce them before any page used them.
- **The AI found its own mistakes through tests and checks,** for example a floating-point error at the exact ±0.15 risk-fit boundary, a rounding issue that showed Apple at 14.3% instead of 14.4%, a component that would have reset the open tab while typing, and wording that pointed to a panel "below" when it was above.
- **A design system as a spec.** The first build worked but looked unpolished. Instead of asking for "nicer", the team wrote exact design rules (tokens, sizes, components) and research-backed help text into the spec (v1.2), and the AI rebuilt the layout against them, then checked the result at phone and desktop width.
- **Mockups as the target.** For the final redesign (spec v1.3) the team approved three static mockups and asked the AI to rebuild them with the app's own components, not copy them. Onboarding changed from four questions per page to one question per screen, while the engine and all 190+ tests stayed unchanged. The AI compared its screenshots side by side with the mockups and fixed the differences it found (for example buttons that wrapped in a narrow card).
- **Automated browser checks.** The AI drove a headless Chrome to load every page at phone and desktop width, check for console errors and sideways scrolling, and review screenshots. This found a table that was too wide on phones and a chart warning, which were fixed. Once, the check itself was wrong: it seemed to show onboarding losing saved answers, but the cause was the test script reusing an old page in memory. The AI traced this before changing any app code.
- **Humans decided.** Joachim approved every plan, every dependency outside the agreed stack, every commit and every push, and checked the result in the browser.

## 8. Limitations

- **Illustrative data.** Product names, tickers, fees (TER) and ETF holdings are placeholders until verified against factsheets. Only top holdings are used for look-through and overlap.
- **Judgement-based income betas.** How stock-like each sector's income is (βH) is a conservative model assumption, not an estimate from data.
- **Simplified model.** Fixed return, volatility and correlation assumptions; no taxes, fees, inflation scenarios or currency risk; the crash test is one historical-style scenario, not a forecast.
- **Income model.** One growth rate until 45, then 0.5% a year; no career breaks, unemployment or pensions.
- **Not advice.** The app shows sleeve weights and example products for education. It never gives buy or sell instructions and never places orders.
- **Local only.** Answers are stored in the user's browser and are not shared between devices.
