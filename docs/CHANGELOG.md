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
