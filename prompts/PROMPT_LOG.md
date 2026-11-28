# Prompt log: Human Capital Copilot
Design phase (Claude, Cowork project): see prompts/design-phase-log.md (export of project doc "07 Prompt log", entries D-001 onward).
Build phase (Claude Code): entries below. Every prompt verbatim.
From C-003 on, prompts are captured automatically in prompts/PROMPT_LOG_AUTO.md (hook); C-entries reference its timestamps instead of copying the prompt.

Team prompts: Damien → `prompts/team/damien.md` (summary written by Damien with AI assistance, NOT verbatim; his original prompts were requested on 26 Nov 2026 and will replace that file when received).

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

### C-003 · 2026-11-26 · Joachim · Claude Code · Setup (prompt logging)
**Prompt:** see PROMPT_LOG_AUTO.md, entry 2026-11-26 14:04:27 +02:00 (backfilled)
**What the AI did:** Added a project-scoped UserPromptSubmit hook (.claude/hooks/log-prompt.mjs, registered in .claude/settings.json) that appends every prompt verbatim to prompts/PROMPT_LOG_AUTO.md, skips "nolog:" prompts, never prints to stdout and always exits 0 (errors go to .claude/hooks/log-prompt.err). Backfilled the 5 earlier prompts from this project's transcript (read only). Updated CLAUDE.md.
**Files changed:** .claude/settings.json, .claude/hooks/log-prompt.mjs, .gitignore, CLAUDE.md, prompts/PROMPT_LOG_AUTO.md, prompts/PROMPT_LOG.md, docs/CHANGELOG.md
**Result:** tests ✔ · lint ✔ · build ✔ · hook tested by hand (normal, nolog, missing field, invalid JSON, unwritable folder: stdout empty, exit 0) and live (entry 2026-11-26 14:09:22 +02:00 logged without a restart)
**Human check:** (to fill in by Joachim: /hooks listing and a live "nolog:" prompt)
**Lesson:** Hook stdout is added to the model's context on exit 0, so a logging hook must stay silent and must never exit 2 (that blocks the prompt).

### C-004 · 2026-11-26 · Joachim · Claude Code · Phase 2
**Prompt:** see PROMPT_LOG_AUTO.md, entry 2026-11-26 14:09:22 +02:00
**What the AI did:** First finished the logging task (C-003 commit, pushed both commits). Then built src/data per section 6 plus a quick-entry mapping, the two persisted Zustand stores, and resolveProfile (onboarding defaults) in the engine. Switched the engine test fixtures to the real data. Added data checks (totals = F, splits sum to 100, product references) and store tests (persona switching, persistence/rehydration).
**Files changed:** src/data/{personas,products,lookthrough,demoPortfolios,quickEntry}.ts, src/data/data.test.ts, src/store/{profileStore,portfolioStore}.ts, src/store/stores.test.ts, src/engine/{defaults,defaults.test,assumptions,types,index}.ts, src/engine/test/fixtures.ts, src/test/setup.ts, vite.config.ts, docs/CHANGELOG.md, prompts/PROMPT_LOG.md
**Result:** tests ✔ (110/110, engine coverage 100% lines / 99.2% branches) · lint ✔ · build ✔
**Human check:** (to fill in by Joachim)
**Lesson:** Zustand's persist saves on every setState, so a "page reload" test has to restore the saved storage copy before rehydrating; otherwise it only tests itself.

### C-005 · 2026-11-26 · Joachim · Claude Code · Phase 3
**Prompt:** see PROMPT_LOG_AUTO.md, entry 2026-11-26 14:20:02 +02:00 (plus the choice "Commit+push 2, start 3" in a question dialog)
**What the AI did:** Committed and pushed Phase 2, then built Landing, Onboarding (16 questions, live needle, knowledge check, review) and Results (hero, drivers, balance sheet, glide path, what-if, empty state) per sections 7.1–7.3, with all numbers from src/engine. Added server-render page tests and lazy-loaded pages to split the bundle.
**Files changed:** src/pages/{Landing,Onboarding,Results}.tsx, src/pages/pages.test.tsx, src/components/{Card,Badge,StatTile,Explain,NeedleBar,PersonaCards,PersonaSwitcher,GlideChart,fields}.tsx, src/store/hooks.ts, src/store/profileStore.ts (action renamed showMyAnswers), src/engine/explain.ts (+tests), src/App.tsx, src/index.css, vite.config.ts, docs/CHANGELOG.md, prompts/PROMPT_LOG.md
**Result:** tests ✔ (122/122) · lint ✔ · build ✔
**Human check:** (to fill in by Joachim: click through on phone and desktop)
**Lesson:** zustand persist deliberately serves the default state when rendering on the server, so the first page tests showed the empty state for every persona. A test-only useSyncExternalStore stub fixed the tests without changing app code.

### C-006 · 2026-11-26 · Joachim · Claude Code · Phase 4
**Prompt:** none in PROMPT_LOG_AUTO.md. Joachim asked whether to debug now or later and asked for that question not to be logged; he then chose "Push 3, start 4" in a question dialog.
**What the AI did:** Committed and pushed Phase 3 so it can be reviewed on a phone at the live URL. Built the Portfolio page per sections 5.4 and 7.4 with new engine helpers and caption templates. Page tests check the section 9 portfolio numbers.
**Files changed:** src/pages/Portfolio.tsx, src/pages/pages.test.tsx, src/components/{Tabs,RiskFitGauge,SplitBars,AssetDonut}.tsx, src/engine/{portfolio,explain,types,assumptions,index}.ts, src/engine/portfolioPage.test.ts, docs/CHANGELOG.md, prompts/PROMPT_LOG.md
**Result:** tests ✔ (144/144) · lint ✔ · build ✔
**Human check:** (to fill in by Joachim)
**Lesson:** A component defined inside another component is a new component on every render, so its state (the open tab) resets while typing. Self-review caught it before it shipped.

### C-007 · 2026-11-26 · Joachim · Claude Code · Phase 5
**Prompt:** "Push 4, start 5" chosen in a question dialog (no typed prompt).
**What the AI did:** Committed and pushed Phase 4, then built the Plan page per section 7.5 (gates, satellites, target vs current, example products, crash test, leverage panel, how to get there, Assumptions dialog) with a new engine module plan.ts. Page tests check the section 9 allocations and crash numbers.
**Files changed:** src/pages/Plan.tsx, src/pages/pages.test.tsx, src/components/{ProductCard,SleeveChart,AssumptionsDialog}.tsx, src/data/examples.ts, src/engine/{plan,plan.test,explain,assumptions,index}.ts, docs/CHANGELOG.md, prompts/PROMPT_LOG.md
**Result:** tests ✔ (163/163) · lint ✔ · build ✔
**Human check:** (to fill in by Joachim)
**Lesson:** Reading the full rendered page text in a failing test exposed two wording bugs that unit tests missed ("risks below" pointing to a panel above; "bitcoin" lowercased).

### C-008 · 2026-11-26 · Joachim · Claude Code · Phase 6
**Prompt:** "Push 5, start 6" chosen in a question dialog (no typed prompt).
**What the AI did:** Committed and pushed Phase 5. Wrote a headless-Chrome check (scratchpad, not committed) that loads 16 page states at phone and desktop width, records console errors and elements wider than the screen, and saves screenshots; reviewed the screenshots and fixed what they showed. Rewrote the README and drafted docs/Application-Description.md.
**Files changed:** src/pages/{Plan,Results}.tsx, src/components/{Tabs,AssetDonut}.tsx, src/engine/explain.ts (+tests), src/pages/pages.test.tsx, src/engine/portfolioPage.test.ts, README.md, docs/Application-Description.md, docs/screenshots/*.png, docs/CHANGELOG.md, prompts/PROMPT_LOG.md
**Result:** tests ✔ (163/163) · lint ✔ · build ✔ · browser check ✔ (32/32 page states clean)
**Human check:** (to fill in by Joachim: walkthrough on phone and desktop; live link in a private window)
**Lesson:** Looking at real screenshots found layout problems no unit test could (a table hiding its most important column off-screen on phones). The automated overflow check had first been told to ignore tables and tabs, so it reported "clean" too early; it was tightened before trusting it.

### C-009 · 2026-11-26 · Joachim · Claude Code · Phase 3b
**Prompt:** see prompts/PROMPT_LOG_AUTO.md, entry 2026-11-26 15:37:57 +02:00 (Phase 3b prompt from BUILD_SPEC section 12).
**What the AI did:** Planned, then restyled the global layout to the section 15 tokens (self-hosted Inter, 64px header with underline nav, 1120px width, 12px cards, type scale, 40px buttons, segmented persona switcher) and rebuilt Onboarding: step header with 4-segment progress, question blocks with dividers, 44px inputs with live thousands separators, sliders with the value pill above the thumb, radio cards, "I'm not sure" for Q6/Q8/Q14, sticky summary panel with a semicircle gauge, Preliminary chip and "What drives this", 56px mobile bar. Every "Why we ask" is now the 4-part panel with the section 16 text and a live effect line from a new engine helper (answerEffect: re-runs targetEEE one step away; says which limit holds the target when it does not move). Added the Method page (Sofie worked example computed by the engine, assumptions with justifications, gates, limitations, references), linked from the footer and every panel. Engine maths unchanged.
**Files changed:** src/index.css, src/App.tsx, src/routes.ts (+test), src/components/{Nav,Footer,Card,Badge,PersonaSwitcher,StatTile,Explain,PersonaCards,Placeholder,AssumptionsDialog,fields,WhyWeAsk,RiskGauge}.tsx, src/pages/{Onboarding,Method,Results,Portfolio,Plan,Landing}.tsx, src/pages/pages.test.tsx, src/engine/{effects,effects.test,defaults,explain,index}.ts, src/store/profileStore.ts, src/content/{whyWeAsk,assumptionNotes,references,content.test}.ts, package.json (lucide-react, @fontsource-variable/inter), docs/screenshots/*, docs/CHANGELOG.md, prompts/PROMPT_LOG.md
**Result:** tests ✔ (181/181) · lint ✔ · build ✔ · browser check ✔ (20 page states at 375/1280 px: no overflow, no console errors, nothing above 28px except hero numbers)
**Human check:** (to fill in by Joachim)
**Lesson:** The first screenshot run showed the onboarding ignoring seeded answers. The cause was the QA script, not the app: a hash-only navigation kept the old in-memory store, which then overwrote localStorage. Forcing a full page load fixed it, so checking odd test results before "fixing" the app saved a wrong change.

### C-010 · 2026-11-26 · Joachim · Claude Code · Phase 3b follow-up
**Prompt:** typed with the "nolog:" prefix, so not in PROMPT_LOG_AUTO.md. Content: push Phase 3b to main and continue finishing the work.
**What the AI did:** Committed and pushed Phase 3b. Fixed the remaining section 15 gaps: one-row 64px header on phones (short wordmark), semicircle gauge on the Results hero instead of the old needle bar (unused NeedleBar removed), gauge end labels moved clear of the needle. Updated docs/Application-Description.md (live effect lines, Method page, design system, 181 tests, AI-use notes) and refreshed all its screenshots. Added `npm run zip` for the submission archive.
**Files changed:** src/components/{Nav,RiskGauge}.tsx, src/components/NeedleBar.tsx (deleted), src/pages/Results.tsx, docs/Application-Description.md, docs/screenshots/*, README.md, package.json, .gitignore, docs/CHANGELOG.md, prompts/PROMPT_LOG.md
**Result:** tests ✔ (181/181) · lint ✔ · build ✔ · browser check ✔ (26 page states at 375/1280 px clean)
**Human check:** (to fill in by Joachim)
**Lesson:** Screenshot review caught the gauge label hidden under the needle at exactly 1.50×, the most common demo value; it would not have shown at the default 0.60×.

### C-011 · 2026-11-26 · Joachim · Claude Code · Bug fix (onboarding panel)
**Prompt:** see prompts/PROMPT_LOG_AUTO.md, entries 2026-11-26 16:22:31 +02:00 (bug report) and 16:43:44 +02:00 ("go on").
**What the AI did:** Added `pending` to targetEEE: listed caps (G3_leverage, G4_loss) are skipped instead of applied from defaults; without it results are identical, so section 9 is unchanged. New `pendingCaps(answers)` marks G4 pending until Q14 and G3 until Q16. The onboarding panel and every "Why we ask" effect line use it. Q14 and Q16 still show their own limit in their own panel. While anything is pending the panel says "Estimate" with the exact note from the bug report; afterwards "Preliminary" while other defaults remain. With no answers the panel now shows 1.50× (safety cap) instead of 0.60× from a default loss limit.
**Files changed:** src/engine/{target,defaults,effects,explain,index}.ts, src/engine/{target,effects}.test.ts, src/store/hooks.ts, src/pages/Onboarding.tsx, src/pages/pages.test.tsx, docs/CHANGELOG.md, prompts/PROMPT_LOG.md
**Result:** tests ✔ (191/191, section 9 unchanged) · lint ✔ · build ✔ · browser check ✔ (26 page states)
**Human check:** (to fill in by Joachim)
**Lesson:** Root cause: a default answer was treated as a real one inside the engine. Hiding the wording (the earlier "starting loss limit" text) did not fix the number; making "not answered yet" a real input to the engine did.

### C-012 · 2026-11-26 · Joachim · Claude Code · Spec v1.3 import
**Prompt:** see prompts/PROMPT_LOG_AUTO.md, entries 2026-11-26 16:47:46 (cd), 16:47:58 (unzip hcc-design-update.zip) and 16:50:13 +02:00 (commit the fix, then prepare); plus two answers in a question dialog (prep for Phase 3c; self-host Space Grotesk).
**What the AI did:** Listed and unpacked the ZIP in a scratch folder before touching the project. It replaces BUILD_SPEC.md with v1.3 (dark redesign, one question per screen, Phase 3c prompt) and adds three reference mockups in docs/design/. The mockups only load a local support.js (not included) and Google Fonts; they are reference only and never served by the app. Then unzipped into the project, committed the bug fix separately, and installed @fontsource-variable/space-grotesk (approved), so the new heading font is bundled instead of loaded from Google. Not imported yet: Phase 3c will use it.
**Files changed:** BUILD_SPEC.md, docs/design/*, package.json, package-lock.json, docs/CHANGELOG.md, prompts/PROMPT_LOG.md
**Result:** tests ✔ · lint ✔ · build ✔ (see below)
**Human check:** (to fill in by Joachim)
**Lesson:** Inspect a downloaded archive before running "unzip -o" on a project: this one silently replaced the source-of-truth spec, which is fine here but should be a conscious, separate commit.

### C-013 · 2026-11-26 · Joachim · Claude Code · Phase 3c
**Prompt:** see prompts/PROMPT_LOG_AUTO.md, entry 2026-11-26 17:00:37 +02:00 (Phase 3c prompt from BUILD_SPEC section 12).
**What the AI did:** Planned (approved), then restyled the whole app to the v1.3 mockups: tokens, fonts and header first, then Landing, Onboarding (rebuilt as one question per screen, with the question number in the URL, a review screen with edit links, Enter to continue and a mobile sheet), Results, Portfolio, Plan and Method. Kept the §7.1 copy that the tests pin down and used the mockups' layout. Engine and data untouched. Reran the headless-Chrome check (43 states at 375/1280 px), compared screenshots with the mockups and fixed what didn't match (wrapping CTAs, a two-row phone header). Ran Lighthouse accessibility via npx (not a project dependency): 100 on four pages, after fixing one label/name mismatch. Refreshed the screenshots and the design text in docs/Application-Description.md.
**Files changed:** src/index.css, src/App.tsx, src/routes.ts (+test), src/components/{ui.ts,Logo,Nav,Footer,Card,Badge,StatTile,Explain,PersonaSwitcher,PersonaCards,RiskGauge,RiskFitGauge,GlideChart,AssetDonut,SleeveChart,SplitBars,Tabs,ProductCard,AssumptionsDialog,WhyWeAsk,fields}.tsx, src/components/Placeholder.tsx (deleted, unused), src/store/hooks.ts, src/pages/*.tsx, src/pages/pages.test.tsx, docs/Application-Description.md, docs/screenshots/*, docs/CHANGELOG.md, prompts/PROMPT_LOG.md
**Result:** tests ✔ (193/193) · lint ✔ · build ✔ · browser check ✔ (43 states) · Lighthouse a11y 100
**Human check:** (to fill in by Joachim)
**Lesson:** The mockups' copy and the spec's copy disagreed (landing headline, CTA labels). Keeping the spec text that tests already check, and taking only layout and tone from the mockups, avoided a silent change to the source of truth.

### C-014 · 2026-11-26 · Joachim · Claude Code · Phase 3c follow-up
**Prompt:** see prompts/PROMPT_LOG_AUTO.md, entries 2026-11-26 19:39:22 (are we missing anything?) and 19:42:30 +02:00 (go ahead).
**What the AI did:** Audited the build against spec sections 14–15 and listed the gaps. Then (1) the onboarding "What drives this" panel now says "not answered yet" for risk attitude until Q12–13 are answered, and has a Limits row that says "not answered yet" while Q14/Q16 are pending, otherwise it names the limit that applies (display only, engine unchanged); (2) ran Lighthouse accessibility on Results, Portfolio and Plan with a demo person loaded (localStorage seeded over CDP, storage reset off). Portfolio and Plan scored 96–97 because Recharts 3 makes chart SVGs focusable inside aria-hidden wrappers; turned that off (accessibilityLayer={false}, Pie rootTabIndex={-1}). Now 100 on every page.
**Files changed:** src/pages/Onboarding.tsx, src/pages/pages.test.tsx, src/components/{AssetDonut,SleeveChart}.tsx, docs/Application-Description.md, docs/screenshots/{desktop-onboarding-7,mobile-onboarding-2}.png, docs/CHANGELOG.md, prompts/PROMPT_LOG.md
**Result:** tests ✔ (195/195) · lint ✔ · build ✔ · browser check ✔ (43 states) · Lighthouse a11y 100 on all pages (phone + desktop)
**Human check:** (to fill in by Joachim)
**Lesson:** Lighthouse runs from a clean profile, so pages that need saved state were never really audited until storage was seeded first; the empty states had hidden the chart issue.

### C-015 · 2026-11-26 · Joachim · Claude Code · Phase 3d
**Prompt:** see prompts/PROMPT_LOG_AUTO.md, entry 2026-11-26 20:18:05 +02:00 (Phase 3d prompt from BUILD_SPEC section 12).
**What the AI did:** Planned, then built spec v1.4: currency question (Q0) with fixed ECB rates; the engine stays currency-free apart from an optional `fx` on the profile that converts the €5,000 borrowing minimum; personas, demo portfolios and defaults converted in the stores; every amount formatted with Intl in the chosen currency. Q3/Q5/Q6/Q14 became typed field + log slider; growthCap 0.12 with the over-12% notice; side-panel explanation rules and "≈ 100%" fix as engine helpers. Method page got the FX table and growth-cap note. Checked onboarding, Results and Method at 375px and 1280px in headless Chrome (no horizontal overflow).
**Files changed:** src/engine/{types,assumptions,target,humanCapital,explain,defaults,effects,index}.ts, src/engine/{currency,currencyText}.test.ts, src/engine/{target,plan}.test.ts, src/data/fx.ts (+test), src/store/{profileStore,portfolioStore,hooks}.ts, src/store/stores.test.ts, src/components/{fields,WhyWeAsk,GlideChart,SplitBars,AssetDonut}.tsx, src/components/logScale.ts (+test), src/content/{whyWeAsk,assumptionNotes}.ts, src/pages/{Onboarding,Results,Portfolio,Plan,Landing,Method}.tsx, src/pages/pages.test.tsx, src/test/setup.ts, BUILD_SPEC.md (v1.4), docs/Application-Description.md, docs/CHANGELOG.md, prompts/PROMPT_LOG.md
**Result:** tests ✔ (282/282, all section 9 values unchanged) · lint ✔ · build ✔ · browser check ✔ (375/1280, no overflow)
**Human check:** (to fill in by Joachim)
**Lesson:** Keeping the engine free of currency names (one `fx` factor on the profile) made invariance easy to prove: the only EUR number in the maths is the borrowing minimum, so one test over 4 personas × 7 currencies covers it. Tests pin the locale to en-IE, because Node reports en-US and would otherwise silently switch every test to dollars.

### C-016 · 2026-11-26 · Joachim · Claude Code · Team delivery audit
**Prompt:** see prompts/PROMPT_LOG_AUTO.md, entry 2026-11-26 21:36:36 +02:00 (audit Damien's package, prompts summary, housekeeping).
**What the AI did:** Found Damien's package already in the repo (`Team/Damien/Headroom_package/`, nothing moved). Read the .docx files with textutil and the PDFs with macOS PDFKit (page images where splits are charts). Checked every ETF's ISIN, TER, ticker, holdings count and date, plus top holdings, regions and sectors against the 10 factsheets (no errors). Checked accounts/holdings consistency, compared with our personas, checked the description's citations against BUILD_SPEC 17, and listed conflicts in the notes. Wrote docs/audit-damien.md, created prompts/team/damien.md with the "not verbatim" caveat, and git-ignored the factsheet PDFs. No change to src/.
**Files changed:** docs/audit-damien.md (new), prompts/team/damien.md (new), Team/Damien/** (added, factsheet PDFs ignored), .gitignore, docs/Application-Description.md, docs/CHANGELOG.md, prompts/PROMPT_LOG.md
**Result:** tests ✔ (282/282, src unchanged) · lint ✔ · build ✔
**Human check:** (to fill in by Joachim)
**Lesson:** Two factsheets keep their numbers only in charts or in a jumbled text layer, so a text-only check reported them as "missing". Rendering those pages and reading them showed the data was right; trusting the first automated pass would have wrongly flagged good work.

### C-017 · 2026-11-26 · Joachim · Claude Code · Verified ETF data (spec v1.5)
**Prompt:** see prompts/PROMPT_LOG_AUTO.md, entry 2026-11-26 21:55:25 +02:00 (decisions on Damien's audit).
**What the AI did:** Wrote scripts/import-etf-data.mjs (`npm run data:etf`), which generates src/data/verifiedEtfs.ts from Damien's CSVs for the five shared products, matched on ISIN, with one id per company (Alphabet A + C merged), countries mapped to regions (MSCI classification) and VWCE's unlisted 11.3% as "Other countries" with a footnote. Products show the factsheet ticker, ISIN, TER (2 decimals) and source; they lose the "Illustrative data" badge, everything else keeps it. Method page lists sources and dates. A drift test checks the generated file against the CSVs. Before/after dump of every page per persona confirmed Results and Landing are unchanged; only look-through numbers moved. BUILD_SPEC v1.5: section 9 Apple €1,437 and overlap 20.5%, D-16 and new 6.5. Description: Damien's evidence, research that disagrees, tagline, "Headroom" line, Team contributions; 3 extra citations verified by web search (Lai & Chow 2023, D'Acunto et al. 2019, Avellaneda & Zhang 2010), 4 left out (CFA digest 2017, Bakshi et al. 2026, Lo & Ross 2024 wording, SEC 13F). Retook 10 screenshots.
**Files changed:** scripts/import-etf-data.mjs (new), src/data/{verifiedEtfs,verifiedTypes,verifiedEtfs.test}.ts (new), src/data/{products,lookthrough,data.test}.ts, src/engine/{types,explain}.ts, src/engine/{portfolio,portfolioPage,currencyText}.test.ts, src/pages/{Portfolio,Plan,Method}.tsx, src/pages/pages.test.tsx, src/components/{ProductCard,Footer}.tsx, package.json, BUILD_SPEC.md, docs/Application-Description.md, docs/audit-damien.md, docs/screenshots/*, docs/CHANGELOG.md, prompts/PROMPT_LOG.md
**Result:** tests ✔ (296/296) · lint ✔ · build ✔ · browser check ✔ (no overflow at 375/1280)
**Human check:** (to fill in by Joachim)
**Lesson:** Dumping every page's text before and after the data swap turned "did any section 9 value change?" from a judgement into a diff: Results and Landing were byte-identical, so only look-through numbers moved.

### C-018 · 2026-11-26 · Joachim · Claude Code · Design-phase log added
**Prompt:** see prompts/PROMPT_LOG_AUTO.md, entries 2026-11-26 22:24:58 (move the file), 22:28:55 (how to handle it) and 22:30:51 +02:00 (OK to commit).
**What the AI did:** Moved the exported design-phase log into prompts/design-phase-log.md and read it before publishing. Shortened three remarks about teammates' workload with a visible [shortened: …] marker, removed D-005 and D-007 (personal account configuration) with a note under the title, fixed the pointer to the old staged prompt plan and added a pointer from the empty build-phase section to PROMPT_LOG.md and PROMPT_LOG_AUTO.md. Searched prompts/, docs/, README and BUILD_SPEC.md for account-related terms and reported the hits without changing them. Removed the "not in the repo yet" remark from the description's draft box.
**Files changed:** prompts/design-phase-log.md (new), docs/Application-Description.md, docs/CHANGELOG.md, prompts/PROMPT_LOG.md
**Result:** tests ✔ (296/296, no code changed) · lint ✔ · build ✔
**Human check:** (to fill in by Joachim)
**Lesson:** A verbatim log written for one audience (the team) can contain remarks that shouldn't go to another (the public repo and the examiner); read it before publishing and mark every edit so it stays honest.

### C-019 · 2026-11-26 · Joachim · Claude Code · Auto log shortened
**Prompt:** see prompts/PROMPT_LOG_AUTO.md, entry 2026-11-26 22:31:51 +02:00 (option 2).
**What the AI did:** Shortened the two auto-log lines that listed account-related terms with a visible [shortened: …] marker, added a note to the auto log's header, rechecked prompts/, docs/, README and BUILD_SPEC.md (no hits), and committed the auto log.
**Files changed:** prompts/PROMPT_LOG_AUTO.md, prompts/PROMPT_LOG.md, docs/CHANGELOG.md
**Result:** tests ✔ · lint ✔ · build ✔ (no code changed)
**Human check:** (to fill in by Joachim)
**Lesson:** A verbatim auto log also captures the instructions about what to hide, so it needs the same check as any other file before it is published.

### C-020 · 2026-11-28 · Joachim · Claude Code · Hand-in readiness check
**Prompt:** asked with the "nolog:" prefix, so it is not in PROMPT_LOG_AUTO.md: whether anything was missing before hand-in, then "go ahead with the ones you can do".
**What the AI did:** Checked the build against the submission checklist (BUILD_SPEC 14): live site serves the current build; listed open items (README, D-009 reference, empty human checks, Jens's contribution, Damien's original prompts, PDF export, phone walkthrough, final commit and ZIP). Updated the README (currency, verified product data, data:etf, prompt files, Damien's folder and audit, disclaimer) and marked D-007 as omitted in D-009's lesson.
**Files changed:** README.md, prompts/design-phase-log.md, prompts/PROMPT_LOG.md, docs/CHANGELOG.md
**Result:** tests ✔ · lint ✔ · build ✔ (no code changed)
**Human check:** (to fill in by Joachim)
**Lesson:** A README written at Phase 6 goes stale quietly; check it against what changed since, not just the checklist.
