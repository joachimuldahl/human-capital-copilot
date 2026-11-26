# Prompt log: Human Capital Copilot
Design phase (Claude, Cowork project): see prompts/design-phase-log.md (export of project doc "07 Prompt log", entries D-001 onward).
Build phase (Claude Code): entries below. Every prompt verbatim.

### C-001 · 2026-11-26 · Joachim · Claude Code · Phase 0
**Prompt:**
> Read BUILD_SPEC.md fully. Do Phase 0 (sections 3, 4, 10, 10.1, 11, 13). Start with the pre-flight and wait for my confirmations. Stop when the Phase 0 acceptance criteria pass, then remind me to do Part E (Vercel).

(Mid-task follow-up from Joachim: "just don't touch anything outside of human-capital-copilot.")
**What the AI did:** Ran the pre-flight (no parent repo, no parent CLAUDE.md, identity confirmed), scaffolded Vite React-TS with Tailwind v4, HashRouter, Recharts, Zustand and Vitest, built placeholder pages with nav and footer, wrote CLAUDE.md, this log and the changelog, committed and created the public GitHub repo.
**Files changed:** package.json, vite.config.ts, tsconfig*.json, index.html, .oxlintrc.json, .gitignore, src/ (main, App, routes + test, components/Nav, Footer, Placeholder, pages/*), CLAUDE.md, README.md, docs/CHANGELOG.md, prompts/PROMPT_LOG.md
**Result:** tests ✔ · lint ✔ · build ✔
**Human check:** Joachim confirmed Git name/email and GitHub account (Joachim Uldahl / joth20ae@student.cbs.dk / joachimuldahl) and approved the GitHub repo creation.
**Lesson:** The current Vite template uses oxlint instead of ESLint; `npm run lint` still works as the spec expects.

### C-002 · 2026-11-26 · Joachim · Claude Code · Phase 1
**Prompt:**
> it works, here's my Vercel URL: https://building-your-wealth.vercel.app/ let's move onto phase 1 etc.

(Follow-up answer: approved adding @vitest/coverage-v8 to measure the ≥ 90% engine coverage criterion.)
**What the AI did:** Checked the live URL and added it to the README. Built src/engine per section 5 (pure, typed, JSDoc formulas) with test fixtures from section 6, and wrote 82 Vitest tests covering every section 9 value, the gate tests, the glide path and the explanation templates.
**Files changed:** README.md, package.json, vite.config.ts, src/engine/{assumptions,types,riskBand,humanCapital,target,glidePath,allocation,risk,portfolio,explain,index}.ts, src/engine/*.test.ts, src/engine/test/fixtures.ts, docs/CHANGELOG.md, prompts/PROMPT_LOG.md
**Result:** tests ✔ (82/82, engine coverage 100% lines / 99.2% branches) · lint ✔ · build ✔
**Human check:** (to fill in by Joachim)
**Lesson:** The first test run caught a floating-point boundary bug in riskFit (0.85 − 1.00 ≠ −0.15 exactly) and showed that `toFixed` rounds 14.35 down. Exact expected values in the spec pay off.
