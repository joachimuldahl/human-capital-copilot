# Prompt log: Human Capital Copilot

Note: two setup-troubleshooting prompts about personal account configuration (D-005, D-007) are omitted; they don't concern the app's development. Shortened passages are marked [shortened: …].

Required for submission ("All prompts used during the development process"). Every prompt is logged **verbatim**. Stage IDs such as `[S3]` refer to an earlier staged prompt plan (`claude-code-prompts.md`, not in this repo) that was replaced by `BUILD_SPEC.md`. Follow-up prompts are always copied in full.

**Tools used**
- **Claude (Cowork, claude.ai project "Building Your Wealth – Investment Project")**: research, product spec, risk-engine prototype, build plan, prompt pack (design phase, D-entries)
- **Claude Code**: implementation (C-entries)

## Entry template (copy for each new prompt)

```
### C-### · YYYY-MM-DD · <author> · Claude Code · Stage <S#>
**Prompt:**
> <verbatim prompt, or "[S#] as in claude-code-prompts.md (edits: …)">
**What the AI did:** <1–3 lines>
**Files changed:** <list>
**Result:** tests ✔/✘ · lint ✔/✘ · build ✔/✘ · manual check ✔/✘
**Human intervention:** <what we corrected or decided>
**Lesson:** <one line: what worked, what didn't, what we'd prompt differently>
```

---

## Design phase (Claude, Cowork)

### D-001 · 2026-10-15 · Joachim · Claude (Cowork) · Product discovery
**Prompt:**
> This is our project so far, please add this to the project knowledge and help me refine it with exact features, calculations and customer flow etc.:
> Please find below our team registration and initial project idea.
> Team: Jens, Damien, Joachim
> Working title: Human Capital Copilot
> 1. PROBLEM
> Trackers show what you own, not whether your risk fits your situation. Robo-advisors and AI chatbots default to conservative advice as they cannot see future earnings, job risk or true loss tolerance, leaving young, risk-seeking investors with little guidance.
> 2. CORE MODULE: PORTFOLIO TRACKER
> Some of the key Features:
> • Net worth across all bank and brokerage accounts
> • Transactions, performance and benchmarking (indices, gold, Bitcoin)
> • Breakdown by asset class, region, sector and currency
> • ETF look-through for overlaps and over- or underweights
> • Dividend tracking
> • Star investor portfolios (e.g. via 13F filings) to compare with and copy, fully or partly
> 3. ADD-ON: AI STRATEGY LAYER BASED ON HUMAN CAPITAL
> • Basis: lifecycle and human capital research (e.g. Ayres and Nalebuff; Ibbotson et al.). Young investors with high future earnings can take more risk; bond-like incomes support more equities, stock-like incomes more bonds
> • Onboarding questionnaire (15 to 20 questions) on age, education, income outlook, job stability, inheritance, savings rate, horizon and loss tolerance etc.
> • Human capital score that sets a target risk level, potentially above 100% equity exposure for young users
> • Specialist AI agents (equities, ETFs incl. leveraged, bonds, precious metals, crypto) under a lead agent, suggesting products that fit the user's profile and portfolio
> • Focus on high-risk, high-return strategies, with clear risk explanations
> • Alerts when actual risk drifts from the target
> 4. TARGET USERS
> Students and young professionals with limited capital but high expected earnings, and anyone wanting a total-wealth view.

**Clarifying questions asked by the AI, and our answers:**
> Demo market → "Generic international"
> Above-100% equity → "Cap at ~150%, via loan or margin (Recommended)"
> Advice level → "Allocation + example products (Recommended)"

**What the AI did:** Saved the registration to project knowledge. Verified the Ayres & Nalebuff paper (2:1 leverage cap, target as % of PV of lifetime savings). Prototyped the risk engine in Python on four personas. Wrote product spec v0.1 (questionnaire, formulas, gates, allocation solver, tracker maths, alerts, AI architecture, MVP scope).
**Outputs:** project docs 01, 02, 03.
**Human intervention:** chose market, leverage cap and advice level.
**Lesson:** Prototyping the maths before writing the spec exposed that the 1.5× cap binds for almost all young users, which changed how we pitch the product ("right-sized risk", not "high risk").

### D-002 · 2026-10-15 · Joachim · Claude (Cowork) · Assignment alignment
**Prompt:**
> This is the scope for the team assignment of creating this app:
> Wealth Management Application Development
> Objective
> Students will work in groups of up to three members to design and develop a functional application that helps users manage and/or monitor their personal or family wealth.
> Assignment Brief
> The application may focus on budgeting, portfolio tracking, asset allocation, investment monitoring, risk analysis, savings goals, retirement planning, or another relevant wealth-management function.
> Team Registration:
>
> * Teams and project ideas must be formed and registered during the first teaching session
> * Project topics allocated on a first-come, first-served basis
> * Deadline for team formation: midnight on the day of the first teaching session
>
> AI Integration:
>
> * Students are encouraged to use any coding-oriented AI model to support the development process
> * The objective is to create a working application and demonstrate effective use of AI-assisted software development tools
>
> Submission Requirements (Single ZIP Folder):
>
> * All prompts used during the development process
> * The complete source code of the application
> * A document describing the application's purpose, key features, and intended users
> * A link to a live demo accessible through any standard web browser
>
> Criteria	Weighting
> Innovation & Value of the Idea	15%
> Problem & Solution	15%
> Application Functionality	35%
> Use of AI in Development	20%
> Submission Quality	15%

**Clarifying questions asked by the AI, and our answers:**
> Deadline → "Within 2 weeks"
> Build tool → "If i only use claude code will i then be able to see the actual output along the way? how will i show and try the app once it's close to being finished?"
> In-app AI → "Yes, with a capped API key (Recommended)"

**What the AI did:** Saved the brief to project knowledge. Mapped the rubric to scope decisions, proposed the stack (Next.js + Vercel), explained local preview and Vercel preview URLs, wrote the 2-week build plan with 11 stages and the submission ZIP structure.
**Outputs:** project docs 00, 04.
**Human intervention:** chose deadline scope and the live AI chat.
**Lesson:** The 20% "Use of AI" weighting means the process (spec → staged prompts → tests → log) has to be visible, not just the app.

### D-003 · 2026-10-15 · Joachim · Claude (Cowork) · Setup + prompt pack
**Prompt:**
> please keep a prompt log for me in this project, please also write a full claude code prompts, and also give a thorough guide of how to set up Node.js, Git, GitHub, Vercel, Claude Code and an Anthropic API key for the chat

**What the AI did:** Verified the current install steps (Claude Code docs, Node.js release schedule, Next.js installation docs, Vercel Hobby limits, Anthropic spend-limit docs). Rewrote the engine as a questionnaire-driven reference (engine_v2.py) with expected test values. This **corrected a v0.1 glide-path bug** (future income wasn't grown when recomputing) and changed Lea's target from 0.45× to 0.34×. Wrote CLAUDE.md, the full prompt pack (S0–S11 + utilities), the setup guide and this log, and packaged everything as a starter kit.
**Outputs:** project docs 02 (v0.2), 03 (v2), 05, 06, 07; hcc-starter-kit.zip.
**Human intervention:** none yet. Team to review assumptions (sector β table, CMA).
**Lesson:** Re-deriving every number from the questionnaire inputs (not hand-set parameters) caught a bug before any app code existed. Expected-value JSON files make the AI-written TypeScript engine testable.

### D-004 · 2026-10-15 · Joachim · Claude (Cowork) · Adapt plan to existing setup
**Prompt:**
> i am already using claude code in my terminal and using github as the repo for another project, please update the plan with this in mind

**What the AI did:** Checked the Claude Code memory docs: CLAUDE.md files in the working folder *and every parent folder* are loaded and combined, and `~/.claude/CLAUDE.md` applies to all projects. Added "Track A" to the setup guide for Joachim: version check, separate sibling folder, per-repo Git identity, personal GitHub account for Vercel Hobby, the Claude account check, keeping ANTHROPIC_API_KEY out of the shell, port and settings overlaps. Added a pre-flight to S0 that checks for a parent repo, loaded instruction files, accounts and a shell API key before the first commit. Updated the build plan (D11, Day 1 split, new risk).
**Outputs:** project docs 04, 05, 06, 07 updated; starter kit re-zipped.
**Human intervention:** none.
**Lesson:** An existing setup speeds up Day 1, but it also brings risks: parent-folder instructions and account mix-ups. These are cheap to check up front and painful to untangle after commits are pushed.

### D-006 · 2026-10-15 · Joachim · Claude (Cowork) · Setup checks (Track A, continued)
**Prompt:**
> github.com
>   ✓ Logged in to github.com account joachimuldahl (keyring)
>   - Active account: true
>   - Git operations protocol: https
>   - Token: gho_************************************
>   - Token scopes: 'gist', 'read:org', 'repo', 'workflow'
>
> API key not set (good)

**What the AI did:** Confirmed the personal GitHub account (joachimuldahl, HTTPS, has the repo + workflow scopes) and that no API key is set in the shell. Since the Git identity and `~/.claude/CLAUDE.md` outputs were missing, set a repo-local Git identity in step 6 and let the S0 pre-flight list the loaded instruction files. Gave the step 6 commands.
**Human intervention:** Joachim ran the checks.
**Lesson:** Let the S0 pre-flight verify the remaining items, so setup doesn't stall on optional checks.

### D-008 · 2026-10-15 · Joachim · Claude (Cowork) · Commit email vs GitHub account email
**Prompt:**
> will it be a problem if i change this project's email to my school email when my git repo uses another (personal) email?

**What the AI did:** Checked Vercel's guide and GitHub's email-privacy docs. Explained that a repo-local commit email is fine for Git and GitHub authentication, but Vercel only deploys commits whose author email matches an email **verified** on the GitHub account. So the school email must be added and verified on GitHub, and GitHub's private-email push blocking can reject it. Also found that Vercel's guide says Hobby only lets the account owner trigger deployments. Added a fallback: Joachim merges teammates' pull requests with "Create a merge commit". Updated the setup guide (A3, step 4, troubleshooting).
**Human intervention:** decision pending (which email).
**Lesson:** A small identity choice (commit email) can silently block deployments. Verify against the deploy platform's rules, not just Git's.

### D-009 · 2026-10-15 · Joachim · Claude (Cowork) · Start of build
**Prompt:**
> done, i'm now in claude ready to commence

**What the AI did:** Handed over the S0 prompt verbatim, with what to expect (pre-flight confirmations, permission prompts, the stop before GitHub). Suggested setting up the Anthropic Console (step 7) while S0 runs.
**Human intervention:** Joachim added the school email to GitHub and opened Claude Code in the new project folder.
**Lesson:** From here on, prompts run in Claude Code and are logged there as C-entries. Entries D-007 (omitted from this file) to D-009 exist only in project doc 07 and must be merged into the repo's log before submission (S11).

### D-010 · 2026-11-02 · Joachim · Claude (Cowork) · Recap after a break
**Prompt:**
> hi claude i'm back, i sort of forgot what we talked about in this chat - i haven't done anyhting yet, where did we get to? will i need git and node.js to build this app? how should we set it up?

**What the AI did:** Recapped the decisions and documents so far. Confirmed that Node.js and Git are required, and which checks Joachim had already passed on 15 Oct (Node v26.7.0, Claude Code, gh logged in as joachimuldahl, no API key in the shell). Listed the remaining setup steps. Flagged that the "within 2 weeks" deadline from 15 Oct has likely passed and asked for the current date before re-planning.
**Human intervention:** pending (deadline).
**Lesson:** After a pause, recheck the timeline before resuming the plan.

### D-011 · 2026-11-19 · Joachim · Claude (Cowork) · Delegating work to teammates
**Prompt:**
> i need my two teammates [shortened: comment about teammates' workload] to help me build this app so i want them to do something so i can build the app demo: Hey guys, please write me everything that you have on how the app was going to be built, and also a text describing the exact functionality of the user experience, and i will start building the app.
>
> Please write something similar but should i ask for something else specific as well?

**What the AI did:** Read the build plan (doc 04) and assignment brief (doc 00). Pointed out that asking for "everything you have" and a fresh UX description would mostly duplicate the existing spec. Drafted a message that keeps the open ask but adds concrete, rubric-linked deliverables with an owner and deadline each: screen-by-screen user flow checked against the spec, verified demo data (accounts, ETF factsheet look-through), AI chat test script incl. refusals, first draft of the application description document, user testing on the live link, and their own prompts for the prompt log.
**Human intervention:** Joachim to fill in deadline/links and confirm who does what.
**Lesson:** Give non-coding teammates concrete deliverables tied to the grading criteria (description doc, test data, user tests, prompt evidence) rather than open-ended "send what you have".

### D-012 · 2026-11-19 · Joachim · Claude (Cowork) · Finalising the team message
**Prompt:**
> i was thinking something like this, could you please finish it? Hey guys, I'm starting to build the Human Capital Copilot demo now and need your input before i wanna move on.  Please send me the following:
>
> 1. Your notes (both of you)
> Anything you have on the idea, features or design: notes, sketches, apps you like. Bullet points are fine. If you have nothing, just tell me so I know to go from the spec.
>
> 2. User flow, screen by screen (Jens)
> Read the spec, then write what the user sees and does on each screen: landing → onboarding (20 questions) → results → portfolio → plan → alerts → AI chat. For each screen: what's on it, what you can click, and what happens next. Flag anything in the spec you disagree with.
>
> 3. Demo data (Damien)
> - 3 example brokerage accounts (holdings, amounts, currency)
> - ~10 popular ETFs with their top holdings and region/sector split, taken from the official factsheets. Include the link and date for each one. This seed data needs to be from real historic data. 
>
> 4. AI chat test script (Jens)
> 10–15 questions a user would ask the in-app AI, with what a good answer looks like, plus 3–5 it should refuse (e.g. "should I buy Tesla now?").
>
> 5. Application description (Damien)
> First draft of the document we have to submit: the problem, our solution, key features, target users and the research behind it (Ayres & Nalebuff, Ibbotson et al.). 2–3 pages.
>
> If you use ChatGPT/Claude for any of this, save your prompts in a doc. We have to hand in every prompt, and "Use of AI" is 20% of the grade.
>
> Swap tasks between you if you prefer, just tell me who has what so i can document it.
>
> I will then build the entire demo etc. .....

**What the AI did:** Kept Joachim's structure and wording, fixed small typos, added a link to the spec and a deadline placeholder, made the "real data" requirement concrete (real tickers, prices and factsheet figures as of a stated date), and wrote the ending: Joachim builds the demo with Claude Code and shares the live link, then both teammates click through it, report bugs and each get 2–3 fellow students to test it, plus a "tell me by [day] if you can't make it" line.
**Human intervention:** Joachim to fill in the link and dates before sending.
**Lesson:** A vague requirement like "real historic data" needs to say what counts as real (source + date), or it comes back unverifiable.

### D-013 · 2026-11-19 · Joachim · Claude (Cowork) · Team message: deadlines per task
**Prompt:**
> how about this: Hey guys, I'm starting to build the Human Capital Copilot demo now and need your input before I move on. The spec and build plan are here: [link]. Please send me the following by [day/time]:
>
> 1. Your notes (both of you)
> Anything you have on the idea, features or design: notes, sketches, apps you like. Bullet points are fine. If you have nothing, just tell me so I know to go from the spec.
>
> 2. User flow, screen by screen - a little more urgent than the other tasks as I want to make sure to build it right the first time around, instead of doing double work (Jens)
> Read the spec, then write what the user sees and does on each screen: landing → onboarding (20 questions) → results → portfolio → plan → alerts → AI chat. For each screen: what's on it, what you can click, and what happens next. Flag anything in the spec you disagree with.
>
> 3. Demo data - this can be sent before the 30th of november (Damien)
> - 3 example brokerage accounts (holdings, amounts, currency)
> - ~10 popular ETFs with their top holdings and region/sector split, taken from the official factsheets. Include the link and date for each one.
> All seed data has to be real: real tickers, real prices and real factsheet figures as of a stated date. Nothing made up, since the app's numbers are built on it.
>
> 4. AI chat test script (Jens)
> 10–15 questions a user would ask the in-app AI, with what a good answer looks like, plus 3–5 it should refuse (e.g. "should I buy Tesla now?").
>
> 5. Application description (Damien)
> First draft of the document we have to submit: the problem, our solution, key features, target users and the research behind it (Ayres & Nalebuff, Ibbotson et al.). 2–3 pages.
>
> If you use ChatGPT/Claude for any of this, save your prompts in a doc. We have to hand in every prompt, and "Use of AI" is 20% of the grade.
>
> Swap tasks between you if you prefer, just tell me who has what so I can document it.
>
> I'll then build the demo with Claude Code and send you the live link as soon as the first version is up. When it's live, I'll need you both to click through it, report bugs, and each get 2–3 fellow students to test it so we can fix what confuses them before we submit.
>
> If you can't send these please let me know so I can plan around it. Thanks!

**What the AI did:** Reviewed the draft. Flagged that "a little more urgent" needs an actual date, that the general deadline and task 3's own date conflicted, and that 30 Nov is late for seed data because the build plan loads it early (portfolio and plan screens depend on it), which risks the double work the message tries to avoid. Returned the same message with only those fixes: per-task date tags, "unless a task has its own date", and a clearer closing line.
**Human intervention:** Joachim to set the dates.
**Lesson:** When tasks have different urgency, give each its own date; "more urgent" without a date is read as "whenever".

### D-014 · 2026-11-26 · Joachim · Claude (Cowork) · One build spec for a simple demo
**Prompt:**
> what do you need from me to create full .md file for code to code a simple demo app that will show basic functionality?

**Clarifying questions asked by the AI, and our answers:**
> Time → "Within a few days"
> Features → "Onboarding + risk result, Portfolio overview, Plan + stress test"
> AI chat → "Scripted answers only"
> Stack → "i thought we could also send the app as a download file, but maybe vercel is better?"

**What the AI did:** Recommended Vercel, because the brief requires a live link that opens in any browser (a download alone doesn't meet it), with a static Vite + React app since there is no live AI chat. Rebuilt the reference engine from project doc 03, simplified the questionnaire to 16 questions (debts reduced to "highest interest rate"), designed demo portfolios per persona, and computed every expected value: targets, actual portfolio risk, stress tests, allocations, glide path, Apple look-through 14.4%, overlap 15.0%. Wrote one self-contained BUILD_SPEC.md with decisions, stack, maths, data, screens, expected test values, 7 build phases with acceptance criteria, paste-ready prompts, prompt-log format and a submission checklist.
**Outputs:** project doc 09; BUILD_SPEC.md download.
**Human intervention:** Joachim chose the scope, scripted explanations and the time frame.
**Lesson:** With a tight deadline, one self-contained spec with test values beats a staged prompt pack. Claude Code can check its own work against the numbers.

### D-015 · 2026-11-26 · Joachim · Claude (Cowork) · Clearer setup steps in BUILD_SPEC
**Prompt (review comment on the "How to use this file" steps):**
> i need more thorough instructions, as i don't know what "other project" you are referring to. I also need precise instructions on how to set up vercel for the preview, the order to do it all in etc.

**What the AI did:** Checked Vercel's Vite and Git docs (via a fetch agent): the project is imported from the dashboard, the configure screen sets framework preset, root directory and build/output settings, pushes to `main` create production deployments, and other branches and PRs get preview URLs. Rewrote the top of BUILD_SPEC.md as Parts A–F in order: tool checks, GitHub email, folder creation with a clean-folder check, Phase 0 in Claude Code (incl. local preview at localhost:5173), Vercel import with exact fields, and the per-phase build loop. Explained what "other project" meant, added a troubleshooting table, and bumped the spec to v1.1.
**Outputs:** project doc 09 (v1.1); BUILD_SPEC.md download.
**Human intervention:** Joachim flagged the unclear instructions.
**Lesson:** Instructions that refer to earlier conversations ("your other project") lose meaning after a break. Make each setup step self-contained, with expected output.

### D-016 · 2026-11-26 · Joachim · Claude (Cowork) · Automating the prompt log
**Prompt:**
> code said: Phase 1 is done. The engine reproduces every number in section 9, and coverage is well above the 90% target. Phase 0 is now fully complete too: https://building-your-wealth.vercel.app/ returns the app, and the link is in the README. […Claude Code's Phase 1 report, pasted in full…]
>
> can we automate logging these prompts please
>
> only for this session ofc.

**What the AI did:** Checked the Claude Code hooks docs (via a fetch agent). A `UserPromptSubmit` hook fires on every prompt and needs no matcher. It can be registered in the project's `.claude/settings.json` using `${CLAUDE_PROJECT_DIR}`. Its stdout is injected into Claude's context, so the hook must print nothing, and a non-zero exit other than 2 doesn't block the prompt. The docs page couldn't be read far enough to confirm the name of the prompt field, so the setup prompt tells Claude Code to verify it and fall back to logging the raw JSON. Wrote a paste-ready Claude Code prompt for a project-only hook: it appends every prompt verbatim to prompts/PROMPT_LOG_AUTO.md, skips prompts starting with `nolog:`, backfills earlier sessions from the transcripts, and updates CLAUDE.md so C-entries reference the auto log. Also flagged Claude Code's custom rounding (14.4% vs 14.3%) for a check.
**Human intervention:** Joachim to paste the prompt, run the test and fill in the C-002 human check.
**Lesson:** Make logging deterministic (a hook) instead of relying on the model remembering an instruction. Keep the model only for the summary and the lesson.

### D-017 · 2026-11-26 · Joachim · Claude (Cowork) · Design and "Why we ask" quality
**Prompt:**
> [screenshot of the onboarding page, step 1 of 4]
> might be one of the ugliest apps ever made hahah, and also when clicking why we ask the answer is sooo vague. Remember that my professor will click these and grade the level of customer service and academia there is to this.

**What the AI did:** Reviewed the screenshot. Oversized type, a pill-style nav, a detached slider value, a one-line help text and a bare progress bar. Also found a logic/UX bug: the needle said "Limited by the most you said you could lose (€3,000)" on step 1, before Q14 had been answered (it quoted a default as if it were the user's answer). Added to BUILD_SPEC v1.2: section 15, a concrete design system (Inter, colour/type/spacing tokens, layout, inputs, sliders, radio cards, semicircle gauge with a "Preliminary" state, customer-service microcopy); section 16, a 4-part "Why we ask" panel for all 16 questions (why it matters · how we use it · live effect computed by the engine · research citation); section 17, a Method page with formulas, assumptions, limitations and full references; plus a Phase 3b prompt.
**Outputs:** project doc 09 (v1.2); BUILD_SPEC.md download.
**Human intervention:** Joachim flagged the visual quality and the vague help text.
**Lesson:** "Make it look good" isn't a spec. Concrete tokens and component rules, plus help text tied to the model and to sources, are what an AI coder can execute and an examiner can grade.

### D-018 · 2026-11-26 · Joachim · Claude (Cowork) · After Phase 3b: is the preliminary-estimate fix still needed?
**Prompt:**
> i've run through all steps, and code gave me this: Both commits are on main and live: the site now serves the same build as my local one, with the new header and the Method link. […Claude Code's full report pasted…]
>
> Should i still send it that prompt you just gave me?

**What the AI did:** Noted that Claude Code's report doesn't mention the preliminary-estimate bug (the loss limit and leverage check applied from default answers before step 4), so it is most likely still live. Recommended sending the fix prompt, with a 30-second check on the live site first. Exported this prompt log as `design-phase-log.md` for the repo (to-do item 1 in Claude Code's list).
**Human intervention:** Joachim to send the fix prompt and do the manual checks (Lighthouse, phone walkthrough, human-check lines).
**Lesson:** A spec rule ("never quote a default as an answer") can be met in letter but not in spirit. A concrete fix prompt with exact expected text closes the gap.

### D-019 · 2026-11-26 · Joachim · Claude (Cowork) · Implementing the dark redesign
**Prompt:**
> and how do i implement the design you just made?

**What the AI did:** Rewrote BUILD_SPEC section 15 (v1.3) as a dark design system matching the approved canvas: tokens, type, radius, header, one-question-per-screen onboarding, gauge rules, results layout, Portfolio/Plan/Method styling and acceptance criteria. Exported the three canvas screens as static reference files (docs/design/Landing.html, Onboarding.html, Results.html, "reference only, never serve") and added a Phase 3c prompt. Packaged both as hcc-design-update.zip for the repo.
**Outputs:** project doc 09 (v1.3); hcc-design-update.zip.
**Human intervention:** Joachim approved the dark direction.
**Lesson:** Give the AI coder a visual reference (exported mockups) plus tokens. A written design spec alone produced a generic look twice.

### D-020 · 2026-11-26 · Joachim · Claude (Cowork) · Final submission plan + team audit
**Prompt:**
> it seems i still need to:
> - export the description to PDF;
> - add prompts/design-phase-log.md (section 7 of the description refers to it, but it isn't in the repo);
> - add anything made by Jens or Damien [shortened: comment about teammates' work];
> - fill in the three empty "Human check" lines in prompts/PROMPT_LOG.md;
> - delete the draft-notes box before submitting.
> And also i need to remember the One uncommitted file. prompts/PROMPT_LOG_AUTO.md has my latest prompts in it. It needs committing, and the zip rebuilt, before the final submission.
> Let's make an ordered plan for this including a thorough audit of Jens and Damien's work [shortened: comment about teammates' workload].

**What the AI did:** Searched the project for teammate deliverables and found none stored. Wrote a 10-step ordered plan (project doc 10): collect and audit the teammates' work against the 19 Nov brief with an evidence-based rubric; use what's usable; manual QA; human-check lines; team contributions paragraph; remove the draft box; PDF export; final design-phase log export; one final commit-and-zip prompt; ZIP verification. It also covers the catch that the logging hook makes PROMPT_LOG_AUTO.md dirty again after every prompt, so the commit-and-zip prompt must be the last one.
**Outputs:** project doc 10.
**Human intervention:** Joachim to collect and upload Jens's and Damien's files for the audit.
**Lesson:** Order the final steps so the thing that changes on every action (the auto log) is committed last.

### D-021 · 2026-11-26 · Joachim · Claude (Cowork) · Income range and currency choice
**Prompt:**
> [screenshot of question 6: income in 10 years, slider €32,000–€88,000]
> the max future income only goes up to 88k a year, which is far too low. not sure where to cap it, but it wouldn't be unrealistic for someone to earn a lot more, so i think the glider should go from interval to interval, starting at 0-50k then 50 - 100 k etc., is that possible and then use the median of the interval for the calculation, or is it better to have an exact figure and then make the cap higher? We also need to implement that the customer can pick currency in the beginning of the questionnaire.

**What the AI did:** Diagnosed that the slider's €32k–€88k range came from the engine's −2%/+8% growth limits applied to €40k (the range was derived from the cap). Recommended an exact amount over brackets, because 50k brackets distort normal incomes and the open top bracket has no midpoint. Proposed a typed field plus log-scale slider (0.5×–5×), with the growth cap raised to 12% a year and a notice when exceeded; persona test values are unaffected. Fetched the ECB reference rates of 17 Nov 2026 (via Banca d'Italia) for a fixed FX table, and specified a currency question with locale preselection, conversion of all EUR thresholds and data, and a currency-invariance test. Also flagged two side-panel issues in the screenshot ("Risk attitude" shown from defaults, "100.0% of wealth"). BUILD_SPEC v1.4, section 18 + a Phase 3d prompt.
**Outputs:** project doc 09 (v1.4); BUILD_SPEC.md download.
**Human intervention:** Joachim spotted the low income ceiling and asked for the currency choice.
**Lesson:** UI limits shouldn't be derived from model caps. Let users enter reality, and let the model state openly when it caps.

### D-022 · 2026-11-26 · Joachim · Claude (Cowork) · Adding Damien's folder during a running Claude Code session
**Prompt:**
> the project is in ~/Hcc/human-capital-copilot not projects by the way. can i just create a folder inside of it whilst still in session in code?

**What the AI did:** Confirmed that folders and files can be added while a Claude Code session is running (it reads files when it needs them), adjusted the path to ~/Hcc/human-capital-copilot/team/damien, and gave three ways to do it: Finder, Terminal, or asking Claude Code to copy the folder itself. The audit prompt uses relative paths, so it's unchanged.
**Human intervention:** Joachim corrected the project path.
**Lesson:** Keep prompts path-relative to the repo, so they survive a different folder location.

### D-023 · 2026-11-26 · Joachim · Claude (Cowork) · Damien's data integrated: next steps
**Prompt:**
> Answer from latest implementation, all looks good to me.
> […Claude Code's report pasted: Damien's verified data now drives the five shared products (commit b4807a4, 296 tests pass); only look-through, product names and fees changed on screen; overlap 20.5%, Apple 14.4%; 3 of Damien's 7 extra citations verified, 4 left out; description updated with his evidence, the Headroom line and team contributions; screenshots retaken…]

**What the AI did:** Confirmed the integration matches the agreed decisions (no Risk Capacity value moved; only the two approved section 9 values changed). Listed the remaining submission steps in order, with a paste-ready prompt to finalise and export the Application Description to PDF, guidance for the "Human check" lines, and the final ZIP sequence from doc 10.
**Human intervention:** Joachim reviewed the changes and approved them.
**Lesson:** A before/after text snapshot of every page is a cheap, strong check that a data swap changed only what it should.

---

## Build phase (Claude Code)

The build-phase prompts are in `prompts/PROMPT_LOG.md` (C-entries: what the AI did, results, lessons) and `prompts/PROMPT_LOG_AUTO.md` (every prompt, verbatim, captured automatically).
