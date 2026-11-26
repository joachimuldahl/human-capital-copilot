# Changelog

## 2026-11-26 · Phase 0 · Setup
- Scaffolded Vite + React + TypeScript (strict) from the official react-ts template (linting via the template's oxlint).
- Added Tailwind CSS v4 (@tailwindcss/vite), React Router (HashRouter), Recharts, Zustand and Vitest.
- Placeholder pages (Landing, Onboarding, Results, Portfolio, Plan) with shared nav and disclaimer footer.
- Added CLAUDE.md, prompts/PROMPT_LOG.md, README.md; created the GitHub repo joachimuldahl/human-capital-copilot.
- Live on Vercel: https://building-your-wealth.vercel.app/ (README updated).

## 2026-11-26 · Phase 1 · Engine
- src/engine: assumptions, types, riskBand, humanCapital, target (caps G1–G4, binding), glidePath, allocation (bisection), risk (stress, margin, loan, LETF drag), portfolio (exposures, look-through, concentration, overlap, risk fit), explain (templates + €/×/% formatters).
- 82 Vitest tests reproduce every value in BUILD_SPEC section 9; engine coverage 100% lines / 99% branches (`npm run coverage`, new dev dependency @vitest/coverage-v8, approved).
- Fixed: a risk-fit gap of exactly ±0.15 was misclassified because of floating-point error (now uses a 1e-9 tolerance).
- Formatters round half away from zero so Apple shows 14.4% (not 14.3%) as in the spec.

## 2026-11-26 · Setup · Automatic prompt logging
- UserPromptSubmit hook (.claude/hooks/log-prompt.mjs) logs every prompt verbatim to prompts/PROMPT_LOG_AUTO.md; "nolog:" prompts are skipped.
- Backfilled earlier prompts from the session transcript; CLAUDE.md now says C-entries reference auto-log timestamps.

## 2026-11-26 · Phase 2 · Data + stores
- src/data: personas, products (14, all illustrative, TER pending), look-through, demo portfolios, quick-entry mapping.
- src/store: profileStore (persisted; persona switching never overwrites "My answers"; setAnswer/loadPersona/reset) and portfolioStore (demo vs quick entry, persisted).
- Engine: resolveProfile + onboarding defaults (income10y = +3%/yr, max loss = 30% of F follow the other answers until set); two new assumptions.
- Engine tests now run on the real src/data, so section 9 also verifies the data. 110 tests.

## 2026-11-26 · Phase 3 · Landing, Onboarding, Results
- Landing (hero, CTAs, how it works, persona cards, research line); Onboarding (16 questions in 4 steps + review, "Why we ask", knowledge check + opt-in switch, live needle: sticky panel on desktop, bottom bar on mobile); Results (hero, binding badge + explanation, 4 driver cards, lifetime balance sheet, glide path chart, what-if sliders, CTAs, empty state).
- Components: Card, Badge/IllustrativeBadge, StatTile, Explain, NeedleBar, PersonaCards, PersonaSwitcher, GlideChart, accessible form fields. All numbers and wording come from src/engine (new text helpers in explain.ts).
- Server-render page tests check the presets (1.50× / 1.20× / 0.34× / 0.67×), the live needle and the empty state. 122 tests.
- Pages load lazily: the first page load dropped from 718 kB to 278 kB (Recharts only loads with Results).

## 2026-11-26 · Phase 4 · Portfolio
- Portfolio page: demo/quick-entry source selector, mismatch banner ("Use €x as my invested amount", > 5%), net worth, risk-fit gauge (0–2.5×), crash test vs the user's limit, accounts list, and tabs for asset class (donut), region, sector, concentration (top 10 with flags and sources) and overlap, each with a "What this means" caption.
- Engine: assetClassValues, overlapPairs, portfolioMismatch, holdingShares, and caption templates (risk fit, stress, asset classes, regions, sectors incl. job-sector warning, concentration, overlap).
- Page tests reproduce the section 9 portfolio table, Sofie's Apple 14.4% alert and the 15.0% overlap. 144 tests.

## 2026-11-26 · Phase 5 · Plan
- Plan page: gate cards (G1 buffer, G2 debt), gold/crypto satellite sliders with the crypto explanation, target vs current (grouped bars + table in % and €), example products per sleeve ("Example, not advice"), crash test now vs target, leverage panel only above 1× (loan, interest, margin buffer, broker loan vs leveraged ETF with volatility-drag warning), "How to get there", Assumptions dialog generated from assumptions.ts.
- Engine: plan.ts (planSleeves, planLoan, planChanges, mostUnderweight, monthlySavings) and plan text templates.
- Page tests reproduce the section 9 target allocations and crash losses, the leverage panel rule and the gate cards. 163 tests.

## 2026-11-26 · Phase 6 · Polish + ship
- Headless-Chrome QA of 16 page states at 375 px and 1280 px: no console errors, no horizontal overflow. Fixed: Plan table wider than a phone screen, tab rows cut off (now wrap), donut chart warning in hidden tabs.
- Wording: income-type card title ("Mixed"), asset-class caption grammar.
- README rewritten for submission (live link, pitch, features, how to run, team, disclaimer); draft docs/Application-Description.md with screenshots in docs/screenshots/.

## 2026-11-26 · Phase 3b · Design system, "Why we ask", Method page
- Section 15 tokens across the app: self-hosted Inter with tabular figures, 64px header with underline nav, 1120px width, 12px cards, type scale (nothing above 28px except hero numbers), 40px buttons, segmented persona switcher, Method link in the footer.
- Onboarding rebuilt: step header + 4-segment progress, privacy line, question blocks, 44px inputs with thousands separators, slider value pills, radio cards, "I'm not sure" (Q6/8/14), summary panel with semicircle gauge, Preliminary chip and drivers; 56px bar on mobile.
- "Why we ask" is a 4-part panel with the section 16 text and a live effect line from the new engine helper answerEffect (one open at a time). The G4 explanation no longer quotes the default loss limit as the user's words.
- New Method page (/#/method) with Sofie's worked example from the engine, assumption justifications, gates, limitations and references. 181 tests.

## 2026-11-26 · Phase 3b follow-up
- Header fits one 64px row on phones; Results hero uses the semicircle gauge; gauge labels no longer hide under the needle.
- Application description updated for the new features, with fresh screenshots. New `npm run zip` builds the submission ZIP from the last commit.
