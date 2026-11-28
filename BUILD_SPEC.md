# Human Capital Copilot: demo build spec (for Claude Code)

*v1.7 · 28 Nov 2026 · Single source of truth for building the demo. Replaces the staged S0–S11 plan (project docs 04/06) for this deadline. Financial maths matches project doc 03 (reference engine v2) exactly.*

---

## How to use this file: step by step (for Joachim)

Do Parts A to F **in this order**. Parts A–E take about 45 minutes and are done once. Part F is the build loop you repeat for Phases 1–6.

> **What "your other project" means:** the separate project you already use Claude Code for (it was running in another terminal when we set things up in October). This demo must have **its own folder that is not inside that project's folder**. Claude Code reads instruction files (`CLAUDE.md`) from the folder you start it in *and every folder above it*, so a demo folder inside the other project would mix the two projects' instructions. If you don't have another project on this Mac, just follow the commands below; the check in Part C confirms the folder is clean either way.

**General rule for the Terminal:** paste **one line at a time** and press Enter. Don't paste any notes after a command, because zsh on the Mac runs them as part of the command.

### Part A: Check your tools (5 min)

Open Terminal (`⌘ + Space`, type **Terminal**, Enter). Paste each line and check the result:

```
node -v
```
→ must be 20.9 or higher (you had v26.7.0 in October).
```
git --version
```
→ any version number. If macOS offers to install the "Command Line Developer Tools", click **Install**, wait, then run it again.
```
gh auth status
```
→ must say "Logged in to github.com account **joachimuldahl**".
```
claude --version
```
→ any version number.

### Part B: Check the email on GitHub (2 min; skip if already done in October)

1. Go to **github.com** → your profile picture (top right) → **Settings** → **Emails**.
2. Check that **joth20ae@student.cbs.dk** is listed and verified. If not: **Add email**, then click the verification link sent to your CBS inbox.
3. On the same page: if both "Keep my email addresses private" and "Block command line pushes that expose my email" are ticked, untick the **Block command line pushes…** option.

*Why:* Vercel only publishes a commit if the email on that commit is verified on your GitHub account.

### Part C: Create the project folder (5 min)

1. Download `BUILD_SPEC.md` from Claude. It lands in your **Downloads** folder.
2. In Terminal, paste one line at a time:
```
mkdir -p ~/Projects/human-capital-copilot
```
```
cd ~/Projects/human-capital-copilot
```
```
mv ~/Downloads/BUILD_SPEC.md .
```
```
ls
```
→ should show `BUILD_SPEC.md`.
```
git rev-parse --show-toplevel
```
→ must say **"fatal: not a git repository"**. That means the folder is clean.
If it instead prints a folder path, this location is inside another project. Move to a clean location instead: run `mkdir -p ~/hcc/human-capital-copilot`, then `mv BUILD_SPEC.md ~/hcc/human-capital-copilot/`, then `cd ~/hcc/human-capital-copilot`, and run the `git rev-parse` line again. From then on, use `~/hcc/human-capital-copilot` wherever this file says `~/Projects/human-capital-copilot`.
```
git init
```
```
git config user.name "Joachim Uldahl"
```
```
git config user.email "joth20ae@student.cbs.dk"
```

### Part D: Phase 0 in Claude Code (20–30 min)

1. In the same Terminal window (still in the project folder) type `claude` and press Enter. The first time, it asks whether you trust this folder: choose **Yes**.
2. Press `Shift + Tab` until the bottom line says **plan mode**.
3. Copy the **Phase 0 prompt** from section 12 of this file, paste it and press Enter.
4. Claude Code shows a plan. Read it and approve it.
5. **Pre-flight:** it shows your Git name, email and GitHub account. Confirm only if they are *Joachim Uldahl / joth20ae@student.cbs.dk / joachimuldahl*.
6. **Permission prompts:** approve commands like `npm create`, `npm install`, `npm run …` and `git …`. Say **no** to anything that touches files outside `human-capital-copilot`.
7. **See the app on your Mac (local preview):** when Claude Code says the placeholder pages are ready, open a second Terminal tab (`⌘ + T`) and paste one line at a time:
```
cd ~/Projects/human-capital-copilot
```
```
npm run dev
```
   Then open **http://localhost:5173** in your browser. Leave this tab running: the page updates by itself whenever Claude Code changes a file.
8. **GitHub:** Claude Code asks before creating the GitHub repository. Answer yes. Then check that **github.com/joachimuldahl/human-capital-copilot** exists.

### Part E: Vercel, for the live demo link (10 min, once)

1. Go to **vercel.com** → **Sign Up** → choose **Hobby** (personal, free) → **Continue with GitHub** → sign in as *joachimuldahl* and authorise.
2. If Vercel asks to install its GitHub app, choose **Only select repositories** → `human-capital-copilot` → **Install**. If the app is already installed for other repositories (e.g. a business project), **add** `human-capital-copilot` to the selected list; don't remove the others.
   *Already use Vercel for another project?* Log in with the same account, but check that the account/team selector in the top-left corner shows your **personal Hobby** account, not a business team, before you continue.
3. On the Vercel dashboard click **Add New… → Project** (some screens show a **New Project** button instead).
4. Under **Import Git Repository**, find `human-capital-copilot` (and only this one) → **Import**. If it isn't listed, click the link to adjust the GitHub app's permissions and give it access to this repository.
5. On **Configure Project**:
   - **Project Name:** `human-capital-copilot`
   - **Framework Preset:** should say **Vite**. If not, pick Vite from the list.
   - **Root Directory:** `./` (leave as is)
   - **Build and Output Settings:** Build Command `npm run build`, Output Directory `dist` (the Vite defaults; leave as is)
   - **Environment Variables:** none
6. Click **Deploy** and wait about a minute. Then go to the project dashboard: your live URL is under **Domains**, normally `human-capital-copilot.vercel.app` (Vercel adds a suffix if the name is taken).
7. Open the URL in a private browser window to check it works. This is the link for the submission and for Jens and Damien.

**How changes reach the live site:**
- Every push to the `main` branch makes Vercel publish a new **production** version at the same URL (about 1 minute).
- A push to any other branch, or a pull request, gets its own separate **preview** URL (Vercel dashboard → **Deployments**, and as a comment on the GitHub pull request). You're the only one coding, so the simplest approach is to work on `main`. Use a branch only when you want to try a risky change online before it goes live.

### Part F: The build loop (Phases 1–6)

For each phase:
1. In Claude Code type `/clear`, press `Shift + Tab` until plan mode, paste the phase prompt from **section 12**, then approve the plan.
2. When it's done, check http://localhost:5173 against the phase's **"Done when"** column in **section 10**. If something is wrong, use the bug-fix prompt in section 12.
3. Tell Claude Code: `Commit and push this phase.`
4. Wait about a minute and refresh your Vercel URL to see the change live.
5. Check that `prompts/PROMPT_LOG.md` has a new entry.

Suggested pacing: **Day 1** Parts A–E + Phases 1–2 · **Day 2** Phases 3–4 · **Day 3** Phases 5–6 + submission (section 14).

### If something goes wrong

| Problem | Fix |
|---|---|
| `command not found` after pasting | Paste one line at a time, with nothing after the command |
| Vercel says the deploy is blocked / "commit author" error | Part B: the commit email isn't verified on GitHub |
| The live site still shows the old version | Vercel → **Deployments**: if the newest build failed, open it, copy the error log and paste it into Claude Code with the bug-fix prompt |
| Port 5173 already in use | Vite picks the next free port; use the address it prints |
| Lost? | Ask Claude Code: `Read BUILD_SPEC.md and tell me which phase we're in and what's next.` |

You need **no API key**: the demo has no live AI chat (decision D-14).

---

## 1. What we are building

**Human Capital Copilot** is a web app for students and young professionals. It sizes your investment risk to your **whole life**, not just your current portfolio. Your future savings ("human capital") are usually your biggest asset. If your income is safe and bond-like, you can carry more stock-market risk in your portfolio. If your income already moves with markets (finance, founders), you should carry less.

The app turns 16 questions into one number, **Risk Capacity**: risk as a multiple of the global stock market (e.g. "1.50×"). It explains why, compares it with the user's actual portfolio, and shows a plan with a stress test.

**Context:** CBS team assignment (Jens, Damien, Joachim). Graded on Functionality 35%, Use of AI in development 20%, Innovation 15%, Problem & solution 15%, Submission quality 15%. The submission needs a live demo link, the full source code, **all prompts used** and a description document. The deadline is in a few days, so build small, correct and polished.

**Research basis:** Ayres & Nalebuff (2010), *Lifecycle Investing*, and "Diversification Across Time" (2:1 leverage cap, target = % of PV of lifetime savings). Ibbotson, Milevsky, Chen & Zhu (2007), *Lifetime Financial Advice* (CFA Institute Research Foundation): stock-like vs bond-like human capital. Merton (1969) and Samuelson (1969) for the optimal risky share.

---

## 2. Decisions (do not change without asking)

| # | Decision |
|---|---|
| D-1 | Generic international demo. The user **chooses a currency** at the start (section 18). Demo data and thresholds are stored in EUR and converted with fixed ECB reference rates. No tax logic. |
| D-2 | Maximum risk **1.5× global equity** via a broker loan. Leveraged ETFs are shown only as an alternative, with a volatility-decay warning. |
| D-3 | The plan shows **sleeve weights + 2–3 example products per sleeve**, always labelled "Example, not advice". No buy/sell instructions. |
| D-4 | All numbers come from a **deterministic engine** (pure TypeScript functions). No AI-generated numbers in the app. |
| D-12 | **Static web app** (Vite + React + TypeScript), no backend, no login, state in the browser (localStorage). |
| D-13 | Hosted on **Vercel** from a public GitHub repo under the personal account `joachimuldahl`. The live link is the demo link for the submission. |
| D-14 | **No in-app AI chat.** "Explain" boxes use pre-written templates filled with engine numbers. |
| D-15 | Scope = Landing, Onboarding, Results, Portfolio, Plan, **Method** (section 17). Out of scope: AI chat, alerts page, CSV import, performance/benchmarks, dividends, star investors, bank connections. |
| D-16 | Demo data (products, ETF look-through) is **illustrative** unless verified. It is isolated in `src/data/` so swapping it changes no other code. Show a small "Illustrative data" badge wherever illustrative data is used. **v1.5:** five products use Damien's verified factsheet data (section 6.5); they show their source instead of the badge. |

---

## 3. Tech stack

- **Vite + React + TypeScript** (strict). Create with the official Vite React-TS template.
- **Tailwind CSS**, following the current official Tailwind + Vite setup.
- **React Router** with a **HashRouter** (URLs like `/#/results`). This works on any static host with no rewrite config.
- **Recharts** for charts. **Zustand** with `persist` (localStorage) for state. **Vitest** for unit tests.
- No component library is required. Build small components with Tailwind. Font: Inter or system sans.
- Commands: `npm run dev` (local, http://localhost:5173), `npm test`, `npm run build`, `npm run lint`.

---

## 4. Folder structure

```
/
├── BUILD_SPEC.md            this file
├── CLAUDE.md                short rules (created in Phase 0, section 11)
├── README.md
├── prompts/PROMPT_LOG.md    every prompt, verbatim (section 13)
├── docs/CHANGELOG.md
├── src/
│   ├── engine/              PURE functions only: no React, no Date, no fetch
│   │   ├── assumptions.ts   every constant from section 5.1
│   │   ├── types.ts
│   │   ├── riskBand.ts      humanCapital.ts  target.ts  glidePath.ts
│   │   ├── allocation.ts    risk.ts  portfolio.ts  explain.ts
│   │   ├── index.ts
│   │   └── *.test.ts
│   ├── data/                personas.ts  products.ts  lookthrough.ts  demoPortfolios.ts
│   ├── store/               profileStore.ts  portfolioStore.ts
│   ├── components/          Gauge, Card, StatTile, NeedleBar, Badge, Explain, PersonaSwitcher, Nav, Footer …
│   └── pages/               Landing.tsx  Onboarding.tsx  Results.tsx  Portfolio.tsx  Plan.tsx
└── vite.config.ts …
```

---

## 5. The engine: exact maths

All human-capital maths is in **real** (inflation-adjusted) terms. Implement exactly as written. Section 9 lists the numbers the tests must reproduce.

### 5.1 Assumptions (`src/engine/assumptions.ts`, every value marked "assumption, editable")

```
rfReal 0.01            erp 0.045            sigmaEq 0.16          borrowSpread 0.015
cashNominal 0.03       equityNominal 0.075  lateGrowth 0.005      peakAge 45
growthCap 0.12         growthFloor -0.02    policyCap 1.5         floor 0.2
maintMargin 0.25       equityShock 0.50     leverageHurdle 0.02
minAssetsForLeverage 5000   minYearsForLeverage 15   minBufferMonths 3   expensiveDebtRate 0.07

GAMMA (risk aversion by band): very_high 1.75 · high 2.0 · moderate 3.0 · low 4.5 · very_low 7.0
SPREAD (income-risk discount spread): very_stable 0.01 · stable 0.02 · average 0.03 · volatile 0.045
BETA_BASE (how stock-like income is, by sector): public 0.05 · health_edu 0.10 · salaried 0.20 · tech 0.35 · sales 0.45 · finance 0.55 · founder 0.65

Allocation assets (order): equity, bonds, gold, btc
VOL: equity 0.16 · bonds 0.05 · gold 0.15 · btc 0.60
CORR (same order):
  equity [1.0, 0.2, 0.1, 0.4]
  bonds  [0.2, 1.0, 0.3, 0.0]
  gold   [0.1, 0.3, 1.0, 0.1]
  btc    [0.4, 0.0, 0.1, 1.0]
COV = VOLᵢ · VOLⱼ · CORRᵢⱼ ;  cash and loan have zero volatility
STRESS SHOCK: equity −0.50 · bonds +0.03 · gold +0.05 · btc −0.75 · cash 0 · loan 0
```

### 5.2 Profile (`types.ts`)

```ts
type Sector = 'public'|'health_edu'|'salaried'|'tech'|'sales'|'finance'|'founder'
type IncomeSecurity = 'very_stable'|'stable'|'average'|'volatile'
type Band = 'very_high'|'high'|'moderate'|'low'|'very_low'
interface Profile {
  age: number; retireAge: number;               // default retireAge 67
  investableAssets: number;                     // F, EUR
  savingsRate: number;                          // 0–1 of net income
  incomeNow: number; income10y: number;         // net, EUR/yr (students: expected starting salary)
  sector: Sector; variablePayShare: number;     // 0–1
  incomeSecurity: IncomeSecurity;
  bufferMonths: number; maxDebtRate: number;    // 0 if no debt; 0.09 = 9%
  drawdownReaction: 1|2|3|4|5; incomeGamble: 1|2|3|4|5;
  maxLossMoney: number;                         // EUR you could lose in a bad year without changing plans
  experience: 'none'|'some'|'experienced';
  knowledgeCheckPassed: boolean; leverageOptIn: boolean;
}
```

### 5.3 Functions

1. **riskBand(p)**: avg = (drawdownReaction + incomeGamble)/2 → `very_high` if avg ≥ 4.5, `high` ≥ 3.75, `moderate` ≥ 2.75, `low` ≥ 2.0, else `very_low`. If experience = 'none' AND not knowledgeCheckPassed AND band is very_high/high → `moderate`. Return {band, gamma}.
2. **mertonShare(gamma)** = min(erp / (gamma · sigmaEq²), 1). (high → 0.8789, moderate → 0.5859)
3. **growthRate(p)** = clamp((income10y / incomeNow)^(1/10) − 1, growthFloor, growthCap).
4. **betaH(p)** = min(BETA_BASE[sector] + 0.3 · variablePayShare, 0.9).
5. **pvfs(p, atAge = p.age)**: present value of future savings.
   ```
   d = rfReal + SPREAD[incomeSecurity];  g = growthRate(p);  y = incomeNow;  total = 0
   for a = p.age+1 … p.retireAge:
       if a > atAge: total += savingsRate · y / (1+d)^(a − atAge)
       y *= 1 + (a < peakAge ? g : lateGrowth)
   ```
   pvEarnings = pvfs / savingsRate (display only).
6. **targetEEE(p, {F = p.investableAssets, age = p.age, applyLossCap = true})**
   ```
   w = mertonShare(gamma); H = pvfs(p, age); b = betaH(p)
   raw = (w·F + (w − b)·H) / F                  (use F = max(F, 1) to avoid ÷0)
   caps (in THIS order): policy_cap = 1.5
        G1_buffer   = 1.0 if bufferMonths < 3
        G2_debt     = 1.0 if maxDebtRate > 0.07
        G3_leverage = 1.0 unless eligible, where eligible = (retireAge − age ≥ 15) AND F ≥ 5000
                      AND knowledgeCheckPassed AND leverageOptIn AND (cashNominal + borrowSpread ≤ equityNominal − leverageHurdle)
        G4_loss     = maxLossMoney / (equityShock · F)          (only if applyLossCap)
   capVal = min(all caps);  final = max(floor, min(raw, capVal))
   binding = raw ≤ capVal ? (raw ≥ floor ? 'model' : 'floor') : first cap (in the order above) whose value equals capVal
   hcRatio = H / (F + H)
   ```
   Return {band, gamma, wStar, growth, betaH, pvfs: H, pvEarnings, hcRatio, rawEEE, finalEEE, binding, caps, gates[]}.
7. **glidePath(p)** (no loss cap):
   ```
   F = investableAssets; g = growthRate(p); y = incomeNow
   for a = p.age … retireAge:
       t = targetEEE(p, {F, age: a, applyLossCap: false});  push {age: a, F, H: t.pvfs, raw: t.rawEEE, final: t.finalEEE}
       e = t.finalEEE;  r = rfReal + e·erp − max(e−1, 0)·borrowSpread
       if a+1 ≤ retireAge: sav = savingsRate·y; y *= 1 + (a+1 < peakAge ? g : lateGrowth)  else sav = 0
       F = F·(1+r) + sav
   ```
8. **solveAllocation(targetEEE, {gold = 0, btc = 0})**: target vol = targetEEE · 0.16. Bisection on the equity weight e in [0, 2], 200 iterations: resid = 1 − e − gold − btc; weights = [e, max(resid,0), gold, btc]; if sqrt(wᵀ·COV·w) < target vol then lo = e else hi = e. Return {equity, bonds, gold, btc, loan: min(resid, 0), vol}.
9. **portfolioEEE(exposures)** = sqrt(xᵀ·COV·x) / 0.16, with x = shares of total portfolio value in [equity, bonds, gold, btc] (cash contributes nothing).
10. **stressLoss(exposures, F)**: pct = Σ shareₖ · SHOCKₖ; money = pct · F.
11. **marginBuffer(eee)** = eee ≤ 1 ? null : 1 − (eee − 1) / ((1 − 0.25) · eee). (1.5 → 0.5556)
12. **loanAmount(eee, F)** = max(eee − 1, 0) · F; **loanCostPerYear** = loanAmount · (cashNominal + borrowSpread).
13. **letfDrag(L, σ)** = (L² − L)/2 · σ². (2× at 16% → 0.0256 = 2.6%/yr)

### 5.4 Portfolio maths (`portfolio.ts`)

- **Holding** = {id, accountId, productId, valueEUR}. Net worth = Σ valueEUR.
- **exposures(holdings)**: sum valueEUR by the product's assetClass (equity, bonds, gold, btc, cash). Multiply equity by `leverageFactor` (a 2× ETF counts double). Divide by the total.
- **lookThrough(holdings)**: for each ETF, exposure to security j = valueEUR · weightⱼ (top holdings from `lookthrough.ts`). Direct stocks count 100%. Aggregate per security. Also aggregate **region** and **sector** over equity value: ETFs use their split, direct stocks use their own region/sector.
- **concentrationFlags**: any single security > 5% of net worth → warning, > 10% → alert. List which holdings it comes from ("Apple 14.4%: direct 10.0% + VWCE 1.8% + CNDX 2.6%").
- **overlap(etfA, etfB)** = Σ over shared top holdings of min(weightA, weightB), labelled "based on top holdings".
- **riskFit** = actualEEE − targetEEE → "On target" if |gap| ≤ 0.15, "Too much risk" if gap > 0.15, "Too little risk" if gap < −0.15.

### 5.5 Explanations (`explain.ts`): templates, no AI

Pure functions that return short plain-English strings built from engine results, e.g.:
- Binding: policy_cap → "Limited by our 1.5× safety cap. Your future savings would justify more, but we never go above 1.5×." · G4_loss → "Limited by the most you said you could lose in a bad year ({maxLoss})." · G1 → "Capped at 1.0× until you have a 3-month emergency buffer." · G2 → "Capped at 1.0× while you have debt above 7% interest. Paying it off first is a guaranteed return." · G3 → "Capped at 1.0× because borrowing to invest needs the knowledge check, opt-in, 15+ years to retirement and at least €5,000." · model → "Your income already behaves like stocks ({betaLabel}), so your portfolio should carry less market risk."
- Human capital: "{hcPct} of your lifetime investable wealth is still in your future salary (future savings worth {pvfs})."
- Income type: βH ≤ 0.15 "bond-like", ≤ 0.40 "mixed", > 0.40 "stock-like".
- Crypto: "{btcPct} in Bitcoin uses {pp} percentage points of your stock budget" (compare solveAllocation with and without it).

---

## 6. Demo data (`src/data/`, illustrative: D-16)

Every product has `illustrative: true`, except the five verified products in section 6.5 (`illustrative: false`, with ISIN and source). The UI shows an "Illustrative data" badge for illustrative data. Keep the shapes stable.

### 6.1 Personas (`personas.ts`)

Shared defaults: retireAge 67, bufferMonths 4, maxDebtRate 0, experience 'some', knowledgeCheckPassed true, leverageOptIn true.

| id | Story (one line in UI) | age | F | savingsRate | incomeNow | income10y | sector | varPay | security | drawdown | gamble | maxLoss | other |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| sofie | 24, finishing a master's, starting as a consultant | 24 | 10,000 | 0.15 | 45,000 | 63,476 | salaried | 0 | average | 4 | 4 | 8,000 | |
| mads | 27, doctor in the public health system | 27 | 25,000 | 0.15 | 55,000 | 73,915 | public | 0 | very_stable | 3 | 3 | 15,000 | |
| lea | 26, trader at a bank with a yearly bonus | 26 | 40,000 | 0.20 | 70,000 | 114,023 | finance | 0.2 | volatile | 3 | 3 | 20,000 | experience 'experienced' |
| jonas | 29, startup founder | 29 | 15,000 | 0.10 | 40,000 | 71,634 | founder | 0.2 | volatile | 4 | 4 | 5,000 | |

### 6.2 Products (`products.ts`)

Fields: id, name, ticker, assetClass ('equity'|'bonds'|'gold'|'btc'|'cash'), sleeve ('core_equity'|'bonds'|'gold'|'crypto'|'leveraged'|'single_stock'|'cash'), leverageFactor (1|2), ter (number | null), region & sector (stocks only), illustrative: true.

| id | Name | Ticker | Class | Sleeve |
|---|---|---|---|---|
| vwce | Vanguard FTSE All-World UCITS ETF (Acc) | VWCE | equity | core_equity |
| cspx | iShares Core S&P 500 UCITS ETF (Acc) | CSPX | equity | core_equity |
| cndx | iShares Nasdaq 100 UCITS ETF (Acc) | CNDX | equity | core_equity |
| finetf | World financials sector ETF | (to verify) | equity | core_equity |
| aggbond | Global aggregate bond ETF, EUR-hedged | (to verify) | bonds | bonds |
| govshort | Short-term euro government bond ETF | (to verify) | bonds | bonds |
| sgln | iShares Physical Gold ETC | SGLN | gold | gold |
| btcetp | Physical Bitcoin ETP | (to verify) | btc | crypto |
| lev2x | 2× daily leveraged S&P 500 ETF | (to verify) | equity (leverageFactor 2) | leveraged |
| aapl | Apple | AAPL | equity | single_stock (North America, Technology) |
| msft | Microsoft | MSFT | equity | single_stock (North America, Technology) |
| nvda | NVIDIA | NVDA | equity | single_stock (North America, Technology) |
| jpm | JPMorgan Chase | JPM | equity | single_stock (North America, Financials) |
| cash | Cash account | — | cash | cash |

Set `ter: null` and show "TER: see factsheet" until verified data arrives. **v1.5:** vwce, cspx, cndx, aggbond and sgln now carry the verified name, ticker, ISIN and TER of the matching factsheet ETF (section 6.5); their ids are unchanged.

### 6.3 Look-through (`lookthrough.ts`, weights in %, illustrative)

| ETF | Top holdings | Regions | Sectors |
|---|---|---|---|
| vwce | Apple 4.5 · Microsoft 4.2 · NVIDIA 4.0 · Amazon 2.3 · Meta 1.5 | N. America 64 · Europe 15 · Japan & Pacific 11 · Emerging 10 | Technology 26 · Financials 16 · Industrials 11 · Consumer 11 · Health care 10 · Other 26 |
| cndx | Apple 8.5 · Microsoft 8.0 · NVIDIA 8.0 · Amazon 5.5 · Broadcom 5.0 | N. America 100 | Technology 60 · Consumer 20 · Communication 15 · Health care 5 |
| cspx | NVIDIA 6.5 · Apple 6.5 · Microsoft 6.2 · Amazon 3.7 · Meta 2.5 · JPMorgan 1.3 | N. America 100 | Technology 33 · Financials 13 · Health care 10 · Consumer 10 · Communication 9 · Other 25 |
| finetf | JPMorgan 9.0 · Berkshire Hathaway 7.0 · Visa 5.0 · Mastercard 4.0 · Bank of America 3.0 | N. America 70 · Europe 20 · Japan & Pacific 10 | Financials 100 |
| lev2x | same as cspx | N. America 100 | as cspx |

Region and sector splits each sum to 100. Bonds, gold, bitcoin and cash are shown as "Non-equity" and are not part of the region/sector charts. **v1.5:** the vwce, cspx and cndx rows above are replaced by verified factsheet data (section 6.5); finetf and lev2x stay illustrative.

### 6.4 Demo portfolios (`demoPortfolios.ts`, values in EUR, totals = F exactly)

| Persona | Accounts → holdings | Story |
|---|---|---|
| sofie (10,000) | Online broker: vwce 4,000 · cndx 3,000 · aapl 1,000 — Crypto exchange: btcetp 1,000 — Bank: cash 1,000 | Apple hidden concentration, ETF overlap, too little risk |
| mads (25,000) | Bank: cash 20,000 — Online broker: vwce 5,000 | Mostly cash, far below target |
| lea (40,000) | Online broker: finetf 16,000 · jpm 8,000 · cspx 8,000 · aggbond 4,000 — Bank: cash 4,000 | Finance job AND finance-heavy portfolio |
| jonas (15,000) | Crypto exchange: btcetp 9,000 — Online broker: nvda 4,500 — Bank: cash 1,500 | Far too much risk vs a 0.67× target |


### 6.5 Verified product data (v1.5)

Five products use Damien's factsheet extracts (`team/damien/Headroom_package/2_Demo_data`, audited in `docs/audit-damien.md`), matched on ISIN and generated into `src/data/verifiedEtfs.ts` by `npm run data:etf`:

| Our id | Factsheet ETF | Ticker | ISIN | TER | Factsheet date |
|---|---|---|---|---|---|
| vwce | Vanguard FTSE All-World UCITS ETF (USD) Accumulating | VWCE | IE00BK5BQT80 | 0.14% | 31 Oct 2026 |
| cspx | State Street SPDR S&P 500 UCITS ETF (Dist) | SPY5 | IE00B6YX5C33 | 0.03% | 31 Oct 2026 |
| cndx | Invesco EQQQ NASDAQ-100 UCITS ETF Dist | EQQQ | IE0032077012 | 0.30% | 31 Oct 2026 |
| aggbond | iShares Core Global Aggregate Bond UCITS ETF EUR Hedged (Acc) | AGGH | IE00BDBRDM35 | 0.10% | 31 Oct 2026 |
| sgln | WisdomTree Physical Gold | PHAU | JE00B1VS3770 | 0.39% | 30 Oct 2026 |

Rules: one security id per company (e.g. "APPLE INC" and "Apple Inc." → aapl; Alphabet class A + C merged); countries grouped into the four regions by MSCI market classification; VWCE's unlisted 11.3% of countries shown as "Other countries" with a footnote; sector labels (GICS, ICB) aligned to one set. Source URL and date per product are listed on the Method page. The financials ETF, short government bonds, Bitcoin ETP, 2× leveraged ETF and single-stock details stay illustrative.

---

## 7. Screens and user flow

Global: top nav (logo text "Human Capital Copilot" + links Onboarding · Results · Portfolio · Plan), a **persona switcher** (Sofie / Mads / Lea / Jonas / "My answers") visible on Results, Portfolio and Plan. The store keeps the user's own answers and portfolio separately from the personas, so switching to a persona never overwrites "My answers". Every page has a footer: "Educational demo. Not investment advice. Data is illustrative." Mobile-first: works at 375px. Style: calm and trustworthy, white/neutral background, one accent colour (deep teal or indigo), large readable numbers. Ratios show 2 decimals plus "×" (1.50×), money in EUR without decimals (€10,000), percentages with 1 decimal.

### 7.1 Landing (`/`)
- Hero: **"Your biggest asset is your future salary. Is your portfolio built for it?"** Subline: "Human Capital Copilot sizes your investment risk to your whole life, not just today's portfolio."
- Two CTAs: "Start (3 minutes)" → `/onboarding`; "Try a demo person" → four persona cards (name, one-line story). Clicking one loads the persona profile + demo portfolio and goes to `/results`.
- "How it works" in 3 steps: Answer 16 questions → See your Risk Capacity → Compare with your portfolio and plan.
- A small "Built on research" line citing Ayres & Nalebuff (2010) and Ibbotson et al. (2007).

### 7.2 Onboarding (`/onboarding`): 16 questions in 4 steps
Progress bar, Back/Next, one step per screen on mobile. **Live needle**: a sticky panel (desktop right side, mobile bottom bar) showing the current finalEEE on a 0–1.5× scale with explanation line 1. It updates on every answer. Unanswered questions use the defaults below, but the needle must say so: a **"Preliminary"** chip and "Based on defaults for N questions you haven't answered yet" until the user has passed step 4. Never show an explanation that quotes a default as if the user had said it (e.g. "the most you said you could lose" before Q14 is answered). Each question has an expandable **"Why we ask"** panel with the content from section 16, styled as in section 15. Q6, Q8 and Q14 also offer an **"I'm not sure"** option that uses the default and says so.

| Step | # | Question | Input | Default |
|---|---|---|---|---|
| 1 About you | 1 | How old are you? | number 16–80 | 25 |
| | 2 | When do you expect to retire? | slider 55–75 | 67 |
| | 3 | How much do you have invested or saved for investing today? | € | 10,000 |
| | 4 | What share of your net income do you invest? | slider 0–40% | 10% |
| 2 Your income | 5 | Your net yearly income now (students: expected first salary) | € | 40,000 |
| | 6 | Where do you expect your income to be in 10 years? | exact amount: typed field + log-scale slider (section 18) | +3%/yr |
| | 7 | Which sector do you work (or plan to work) in? | 7 radio cards with examples | salaried |
| | 8 | How much of your pay is bonus, commission or shares? | slider 0–100% | 0 |
| | 9 | How secure is your income? | 4 radio cards (very stable: tenured public job … volatile: commission/founder) | average |
| 3 Safety net | 10 | How many months of expenses could you cover with savings? | 0, 1, 2, 3, 4–6, 6+ (→ 0,1,2,3,5,6) | 3 |
| | 11 | Highest interest rate on any debt you have? (0 if none) | % | 0 |
| 4 Risk & knowledge | 12 | "Your €{F} falls to €{0.7·F} in three months. What do you do?" Sell everything (1) · Sell some (2) · Do nothing (3) · Buy a little more (4) · Buy a lot more (5) | radio | 3 |
| | 13 | "You're offered a job: 50% chance it doubles your income, 50% chance it cuts it. What's the largest cut you'd accept?" Never (1) · 10% (2) · 20% (3) · 33% (4) · 50% (5) | radio | 3 |
| | 14 | What is the most you could lose in a bad year without changing your plans? | € | 30% of F |
| | 15 | Investing experience | none / some / experienced | some |
| | 16 | **v1.6:** only asked if borrowing can change the result (see below). Gating question "Would you consider borrowing to invest, e.g. a loan from your broker, if your situation allows it?" Yes / No / Not sure, tell me more. Yes → knowledge check (3 multiple-choice questions; pass = all correct, answers saved and shown again), then the leverage opt-in switch (disabled until passed, with a short risk warning). No → opt-in off, no knowledge check. Not sure → 2–3 plain sentences on borrowing (gains and losses magnified, margin calls), then the same choice | | not passed, off |

**Q16 skip rule (v1.6):** compute the user's target with the borrowing rule (G3) left out, using `targetEEE` with G3 pending (plus G4 while Q14 is unanswered). If that is 1.0× or lower, borrowing can't change the result: Q16 is skipped and the counter becomes "of 15". "Knowledge check passed" shows only when all three answers are given and correct. If the user chose No and G3 binds, the explanation reads "Capped at 1.0× because you chose not to borrow."

Knowledge check:
a) "You invest with 1.5× exposure (borrowing 50% extra). Stocks fall 20%. Roughly how much of your own money do you lose?" → **30%** (options 20% · 30% · 50%)
b) "What is a margin call?" → **"The broker demands more collateral, or sells your holdings, because your loan has become too large relative to your assets."** (plus two wrong options)
c) "Over several years, a 2× daily leveraged ETF…" → **"can return less than twice the index, especially when markets are volatile."** (plus two wrong options)

The final step has a summary of answers with edit links and "See my result" → `/results`. Answers persist in localStorage.

### 7.3 Results (`/results`)
1. **Hero**: big "1.50×" + "You can carry about 1.5 times the risk of the global stock market." Binding-constraint badge + explanation (5.5).
2. **Four driver cards**: Risk attitude (band, "hold {w*} of your total wealth in stocks") · Human capital (hcRatio, PV future savings, PV earnings as small text) · Income type (βH + bond-like/mixed/stock-like) · Limits (all caps with values, binding one highlighted).
3. **Lifetime balance sheet**: horizontal stacked bar, today's investments F vs future savings H (EUR labels).
4. **Glide path**: line chart of finalEEE by age, dashed line at 1.0× ("no borrowing"), current age marked, tooltip with F and H. Caption: "Expected path if markets deliver average returns."
5. **What-if**: two sliders (savings rate 0–40%; max loss in a bad year) that recompute live without saving, plus Reset.
6. CTAs: "Compare with my portfolio" → `/portfolio`, "See my plan" → `/plan`.
Empty state (no profile): link to onboarding plus the persona cards.

### 7.4 Portfolio (`/portfolio`)
- Source selector: **demo portfolio** (persona) or **quick entry** (7 euro fields: Global equity ETF → vwce, US tech ETF → cndx, Single stocks → aapl, Bonds → aggbond, Gold → sgln, Crypto → btcetp, Cash → cash).
- If the portfolio total differs from the profile's F by > 5%: a banner with a button "Use €{total} as my invested amount" (updates the profile).
- **Top row**: net worth tile; **risk-fit gauge** (actual vs target EEE on one 0–2.5× scale, two markers, status label); stress test now ("In a crash like 2008 your portfolio could lose €{x}", against the user's limit, ✔ or ✘).
- Accounts list with holdings (name, ticker, value, % of total).
- Tabs: **Asset class** (donut) · **Region** (bars, look-through) · **Sector** (bars, look-through) · **Concentration** (top 10 look-through securities with flags and sources) · **Overlap** (pairs of ETFs with overlap %).
- Each chart has a one-sentence "What this means" caption from the data.

### 7.5 Plan (`/plan`)
1. **Gate cards first**, if any: G1 "Build a 3-month buffer first", G2 "Repay your {rate}% debt first".
2. **Satellites**: sliders gold 0–10% and crypto 0–10% (defaults 0) + the crypto explanation from 5.5.
3. **Target vs current**: grouped bar chart and table per sleeve (equity, bonds, gold, crypto, cash, loan) with the solveAllocation weights in % and €.
4. **Example products** per non-zero sleeve: 2–3 cards from products.ts (name, ticker, "Example, not advice" badge, illustrative badge). The leveraged ETF appears only under "Alternative route" in the leverage panel.
5. **Stress test**: current vs target, money first, percentage second, vs the user's limit.
6. **Leverage panel** (only if finalEEE > 1): loan amount, yearly interest cost, margin buffer ("Stocks could fall 56% before a margin call"). Tabs "Broker loan (recommended)" / "Leveraged ETF (alternative)" with the letfDrag warning.
7. **How to get there**: "Put your next monthly savings (€{savingsRate·incomeNow/12}) into {most underweight sleeve}" plus a list of changes where |current − target| > 2% of F, titled "Changes to make at your own broker". No buttons that execute anything.
8. "Assumptions" dialog: a table of all values from assumptions.ts.

---

## 8. Quality rules

- Every number in the UI comes from `src/engine`. Components never calculate finance themselves.
- Engine functions are pure, typed, documented (JSDoc with the formula) and unit-tested.
- Accessible labels and focus states, AA contrast, no console errors, works at 375px and 1280px.
- Wording: educational. Never "you should buy/sell X".
- Before declaring any phase done: `npm test`, `npm run lint` and `npm run build` must pass.

---

## 9. Expected values (tests must reproduce these: ratios ±0.001, money ±2)

| Persona | band | w* | growth | βH | pvfs | hcRatio | raw | **final** | binding | caps |
|---|---|---|---|---|---|---|---|---|---|---|
| sofie | high | 0.8789 | 0.0350 | 0.20 | 219,483.66 | 0.9564 | 15.7798 | **1.5000** | policy_cap | policy 1.5, G4 1.6 |
| mads | moderate | 0.5859 | 0.0300 | 0.05 | 336,298.99 | 0.9308 | 7.7953 | **1.2000** | G4_loss | policy 1.5, G4 1.2 |
| lea | moderate | 0.5859 | 0.0500 | 0.61 | 402,386.74 | 0.9096 | 0.3439 | **0.3439** | model | policy 1.5, G4 1.0 |
| jonas | high | 0.8789 | 0.0600 | 0.71 | 116,565.28 | 0.8860 | 2.1915 | **0.6667** | G4_loss | policy 1.5, G4 0.6667 |

Demo portfolios (from 6.4):

| Persona | actual EEE | gap vs target | status | stress now | target allocation (no satellites) | stress at target |
|---|---|---|---|---|---|---|
| sofie | 1.0103 | −0.4897 | Too little risk | −47.5% (−€4,750) | equity 150%, loan −50% | −75.0% (−€7,500) |
| mads | 0.2000 | −1.0000 | Too little risk | −10.0% (−€2,500) | equity 120%, loan −20% | −60.0% (−€15,000) |
| lea | 0.8068 | +0.4630 | Too much risk | −39.7% (−€15,880) | equity 18.6%, bonds 81.4% | −6.9% (−€2,745) |
| jonas | 2.3859 | +1.7192 | Too much risk | −60.0% (−€9,000) | equity 63.4%, bonds 36.6% | −30.6% (−€4,593) |

Other checks:
- solveAllocation(1.5, gold 0.05, btc 0.05) → equity 1.4094, loan −0.5094 · solveAllocation(1.5, btc 0.10) → equity 1.3101, loan −0.4101 · Lea with gold 0.05 → equity 0.1799, bonds 0.7701
- marginBuffer(1.5) = 0.5556 · marginBuffer(1.2) = 0.7778 · marginBuffer(1.0) = null · letfDrag(2, 0.16) = 0.0256
- Sofie's glide path finalEEE: age 24 → 1.50 · 30 → 1.50 · 39 → 1.50 · 40 → 1.45 · 42 → 1.33 · 45 → 1.20 · 48 → 1.11 · 53 → 1.00 · 60 → 0.93 · 67 → 0.88 (±0.005)
- Sofie look-through (v1.5, verified factsheet weights): Apple = 1,000 + 4,000·4.80% + 3,000·8.17% = **€1,437** (1,437.10) = **14.4%** → alert. Overlap(vwce, cndx) = Apple 4.80 + NVIDIA 4.60 + Microsoft 3.70 + Alphabet 2.67 + Amazon 2.30 + Meta 1.30 + Tesla 1.10 = 20.47% ≈ **20.5%** (was €1,435 and 15.0% with the illustrative v1.4 data)
- Gate tests on Sofie: bufferMonths 2 → final 1.0, binding G1_buffer · maxDebtRate 0.09 → 1.0, G2_debt · leverageOptIn false → 1.0, G3_leverage · experience 'none' + knowledge check not passed → band moderate, final 1.0, binding G3_leverage

---

## 10. Build phases and acceptance criteria

| Phase | Build | Done when |
|---|---|---|
| **0 Setup** | Pre-flight (10.1), Vite React-TS scaffold, Tailwind, Router (HashRouter), Recharts, Zustand, Vitest; CLAUDE.md (section 11); prompts/PROMPT_LOG.md (section 13); docs/CHANGELOG.md; placeholder pages + nav + footer; first commit; GitHub repo; Vercel import | Placeholder pages work locally and on the Vercel URL; tests/lint/build pass |
| **1 Engine** | `src/engine/*` per section 5 with tests per section 9 | All section 9 values reproduced; ≥ 90% coverage of src/engine |
| **2 Data + stores** | `src/data/*` per section 6; profileStore (persisted, with defaults, loadPersona, reset); portfolioStore (demo/quick entry) | Data passes type checks; persona totals = F; ETF splits sum to 100 |
| **3 Onboarding + Results** | Sections 7.1–7.3 | Presets show Sofie 1.50×, Mads 1.20×, Lea 0.34×, Jonas 0.67×; needle moves live; glide chart matches section 9; refresh keeps answers |
| **4 Portfolio** | Section 7.4 | Section 9 portfolio numbers shown; Sofie's Apple alert (14.4%) and 15.0% overlap visible |
| **5 Plan** | Section 7.5 | Allocation and stress numbers match section 9; leverage panel only when > 1×; gate cards appear for the gate tests |
| **6 Polish + ship** | Responsive pass, empty states, Assumptions dialog, README, draft `docs/Application-Description.md`, final deploy | Full walkthrough on phone and desktop with no errors; live link works in a private window |

### 10.1 Phase 0 pre-flight (Joachim also uses Claude Code and GitHub for another project)
- `git -C .. rev-parse --show-toplevel` must FAIL (this folder must not be inside another repo). If it succeeds, stop.
- List CLAUDE.md files loaded from parent folders and `~/.claude/CLAUDE.md`, and flag conflicts. Never edit files outside this folder.
- Show `git config user.name`, `git config user.email` and `gh auth status`. Ask Joachim to confirm (expected: joth20ae@student.cbs.dk, account joachimuldahl) before the first commit.
- Ask before any GitHub action. Then run `gh repo create human-capital-copilot --public --source=. --remote=origin --push`. Never touch other repos or remotes.
- After the GitHub push, remind Joachim to do **Part E** (Vercel) at the top of this file. Don't try to do it yourself: it happens in his browser.

---

## 11. CLAUDE.md to create in Phase 0 (keep it this short)

```markdown
# Human Capital Copilot
Static Vite + React + TS demo. Full spec: @BUILD_SPEC.md (source of truth).
- Every financial number comes from src/engine (pure, tested). UI never calculates finance.
- All assumptions live in src/engine/assumptions.ts.
- Educational wording only: "Example, not advice". Never buy/sell instructions.
- Work one phase at a time (BUILD_SPEC section 10). Plan first, then build.
- Before saying done: npm test, npm run lint, npm run build must pass.
- After each task: append an entry to prompts/PROMPT_LOG.md (BUILD_SPEC section 13) and 2–5 lines to docs/CHANGELOG.md.
- Ask before adding dependencies outside BUILD_SPEC section 3, and before any git push or GitHub action.
```

---

## 12. Prompts to paste (one per phase; `/clear` between phases)

- **Phase 0:** `Read BUILD_SPEC.md fully. Do Phase 0 (sections 3, 4, 10, 10.1, 11, 13). Start with the pre-flight and wait for my confirmations. Stop when the Phase 0 acceptance criteria pass, then remind me to do Part E (Vercel).`
- **Phase 1:** `Read BUILD_SPEC.md sections 5 and 9. Do Phase 1: build src/engine exactly as specified and write Vitest tests for every value in section 9. Show me the test output.`
- **Phase 2:** `Read BUILD_SPEC.md section 6. Do Phase 2: data files and the two Zustand stores, with tests that persona portfolio totals equal F and splits sum to 100.`
- **Phase 3:** `Read BUILD_SPEC.md sections 7.1–7.3 and 8. Do Phase 3: Landing, Onboarding (16 questions, live needle, presets) and Results. Use only engine functions for numbers.`
- **Phase 4:** `Read BUILD_SPEC.md sections 5.4 and 7.4. Do Phase 4: the Portfolio page with look-through, concentration, overlap, risk-fit gauge and stress test.`
- **Phase 5:** `Read BUILD_SPEC.md section 7.5. Do Phase 5: the Plan page.`
- **Phase 6:** `Read BUILD_SPEC.md sections 8 and 14. Do Phase 6: responsive and accessibility pass, empty states, Assumptions dialog, README with the live link, and a draft docs/Application-Description.md. Then commit, push and confirm the Vercel deploy.`
- **Phase 3b (design + help content, v1.2):** `Read BUILD_SPEC.md sections 7.2, 15, 16 and 17. Redesign the global layout and the Onboarding page to match section 15 exactly (Inter, tokens, header, two-column layout, question blocks, inputs, sliders, radio cards, semicircle gauge with the Preliminary state). Replace every "Why we ask" with the 4-part panel and the section 16 text, including the live effect line computed with the engine. Add the Method page (section 17) and link it from the footer and every panel. Don't change engine maths. When done, check the result at 375px and 1280px (take screenshots with Playwright if available) and list anything that still deviates from section 15.`
- **Phase 3c (dark redesign, v1.3):** `Read BUILD_SPEC.md section 15 (v1.3) and the three mockups in docs/design/. Restyle the whole app to this design: tokens, fonts and header first, then Landing, Onboarding (convert to one question per screen, keep the pending-gates fix and the Why-we-ask content), Results, Portfolio, Plan and Method. Don't change the engine or data; all tests must still pass. Then rerun the 375px/1280px browser check, retake the screenshots in docs/Application-Description.md, update its design paragraph, commit, push and run npm run zip.`
- **Phase 3d (currency + income input, v1.4):** `Read BUILD_SPEC.md section 18 (and D-1, 5.1, 16). Add the currency question and FX conversion, change Q3/Q5/Q6/Q14 to typed field + log slider, raise growthCap to 0.12 with the over-12% notice, and fix the side-panel issues in 18.3. Add the currency-invariance tests and update the Method page (FX source/date, growth cap). All section 9 tests must still pass. Commit and push.`
- **Bug fix (any time):** `Bug on <page>: when I <steps>, I expected <x> but got <y>. Find the root cause first, explain it in 2–3 sentences, fix it, add a test if it is in src/engine, and run tests/lint/build.`

---

## 13. Prompt log (required for submission)

`prompts/PROMPT_LOG.md` starts with this header:

```markdown
# Prompt log: Human Capital Copilot
Design phase (Claude, Cowork project): see prompts/design-phase-log.md (export of project doc "07 Prompt log", entries D-001 onward).
Build phase (Claude Code): entries below. Every prompt verbatim.
```

After every task Claude Code appends:

```markdown
### C-### · YYYY-MM-DD · <author> · Claude Code · Phase <n>
**Prompt:**
> <the user's prompt, verbatim>
**What the AI did:** <1–3 lines>
**Files changed:** <list>
**Result:** tests ✔/✘ · lint ✔/✘ · build ✔/✘
**Human check:** <what Joachim verified or corrected>
**Lesson:** <one line>
```

---

## 14. Submission checklist

- [ ] Live Vercel link works in a private browser window on phone and desktop
- [ ] README: link, one-paragraph pitch, features, how to run (`npm install`, `npm run dev`), team, disclaimer
- [ ] `docs/Application-Description.md` (→ PDF): problem, solution, innovation, users and personas, features with screenshots, method (formulas and assumptions), how AI was used in development, limitations
- [ ] `prompts/PROMPT_LOG.md` complete + `prompts/design-phase-log.md` + any prompts from Jens and Damien
- [ ] ZIP: README, docs/, prompts/, source (without node_modules, dist, .git)

---

## 15. Design system (v1.3: dark, modern direction; reference mockups in `docs/design/`)

**Reference:** `docs/design/Landing.html`, `docs/design/Onboarding.html` and `docs/design/Results.html` are exported from the approved design canvas. Match them closely: layout, spacing, colours, type, copy tone. They are static mockups with inline styles and a canvas runtime (`<x-dc>`, `support.js`). **Rebuild them with Tailwind and our own components; never copy the runtime or load these files in the app.**

**Tokens** (Tailwind theme + CSS variables):
- Fonts: **Space Grotesk** 500/600 for headings and big numbers; **Inter** 400/500/600 for everything else. Use `font-feature-settings: "tnum"` on all numbers.
- Colours: background `#070B14` · surface `#0E1422` · surface-2 `#141B2D` · border `#1E293B` · text `#F1F5F9` · text-2 `#A3AEC2` · muted `#7D8AA3` · panel body `#D5DCE8` · **accent lime `#C8F560`** (hover `#E3FB9F`, text on lime `#0B1220`, tint background `#141F08` with border `#3A4A1A`) · secondary data colour sky `#7DD3FC` (future savings, targets below 1.0×) · warning amber `#FBBF24` on `#2A1F05` with border `#4A3608` · alert red `#F87171` on `#2A0F0F`.
- Radius: buttons and inputs 12px · cards 20px · hero card 28px · chips 999px. No drop shadows: depth comes from surface colours and 1px borders.
- Type: hero numbers in Space Grotesk 600 with tracking −0.03em (Results 88px, side panel 52px, landing card 56px) · page H1 40px (onboarding question) to 60px (landing) · card numbers 30px · body 15–17px · labels 12px/600, uppercase, tracking 0.08em, muted colour.
- Layout: content max 1240px, page padding 32px (16px on phones), 4px spacing grid.

**Components:**
- **Header:** a 28px lime logo tile with a line-chart icon, the wordmark in Space Grotesk 17px/600, nav at 14px. The active link is white with a 2px lime underline. On Results, Portfolio and Plan, a **persona segmented control** (Sofie · Mads · Lea · Jonas · Me) with the active item filled lime.
- **Buttons:** primary lime with dark text and 600 weight; secondary transparent with a 1px border. Focus ring: 2px lime with a 2px offset.
- **Onboarding = ONE question per screen** (16 screens in 4 steps), as in `Onboarding.html`:
  - Top bar: "Step 2 of 4 · Your income" plus 4 progress segments, the current one partly filled. A "Save and finish later" button (answers are already saved).
  - "QUESTION 7 OF 16" label in lime, the question at 40px, a one-line subline in text-2.
  - Answers as radio cards (real `<input type=radio>`; the selected card gets a lime border and tint background), big inputs or sliders.
  - "Why we ask" is a `<details>` card with the four labelled parts (WHY IT MATTERS · HOW WE USE IT · YOUR ANSWER'S EFFECT · RESEARCH) in a responsive grid. No coloured left border.
  - Back (secondary) and Continue (primary), plus "or press Enter ↵". Transitions between questions: 200ms fade and slide, turned off under `prefers-reduced-motion`.
  - Side panel: "YOUR RISK CAPACITY", an amber **Estimate** chip while any gate is pending, the arc gauge, the big number, the explanation, "WHAT DRIVES THIS" rows ("not answered yet" where relevant) and the privacy box with a lock icon. On phones it becomes a 56px sticky bottom bar (number + chip) that opens the full panel as a sheet.
- **Gauge:** a semicircle progress arc (track `#1E293B`, value lime when ≥ 1.0× and sky when < 1.0×), with labels 0× / 1.0× / 1.5× placed outside the arc so the value never hides them.
- **Results:** as `Results.html`. A hero card (gauge, 88px number, the binding-constraint chip with a shield icon, a one-paragraph explanation that includes the unconstrained model value and the loan in euros) · four driver cards (Risk attitude · Human capital · Income type · Limits checked, the binding one in lime) · a glide path card (lime line, dashed 1.0× line labelled "no borrowing", a current-age dot, a marker where it reaches 1.0×) · a lifetime balance sheet card (lime = invested today, sky = future savings, then the portfolio's actual risk with a status chip and two CTAs).
- **Portfolio and Plan:** the same card language. Charts use lime, sky and slate only. The risk-fit gauge shows two markers (target in lime, actual in amber or sky). Status chips as above.
- **Method page:** a reading layout with max width 760px, 16px/1.7 body, Space Grotesk headings, formulas in a surface-2 box.
- **Accessibility:** these colour pairs pass WCAG AA on `#070B14`. Keep real buttons, links and inputs, `aria-label` on icon-only buttons and the gauge as `role="img"` with a label.

**Customer-service touches** (unchanged): the privacy line, friendly validation, "You can change any answer later", and time estimates ("about 3 minutes").

**Acceptance:** side by side with the three mockups at 1280px they look like the same product. Nothing scrolls sideways at 375px. Lighthouse accessibility ≥ 95.

---

## 16. "Why we ask" content (use this text; keep the citations)

Format per question: **Why it matters** · **How we use it** · **Your answer's effect** (live, per section 15) · **Research**. Short references in the panel, full references on the Method page (section 17).

| # | Why it matters | How we use it | Research |
|---|---|---|---|
| 1 Age | Your future salary is usually your largest asset when you're young, and it shrinks each year you work. That is the core of lifecycle investing. | Sets how many working years are left in your future-savings calculation (human capital, H) and where you start on the glide path. | Bodie, Merton & Samuelson (1992); Cocco, Gomes & Maenhout (2005) |
| 2 Retirement age | More working years mean more future savings. The option to work longer is itself a buffer against bad markets. | Sets the last year of savings in H, and the 15-year minimum horizon for using a loan. | Bodie, Merton & Samuelson (1992) |
| 3 Invested today | Your target depends on the **ratio** between today's money (F) and future savings (H). With little invested, small amounts carry your whole future. | F in the formula raw = (w*·F + (w* − βH)·H) / F. It also sizes the loss-limit check and the €5,000 minimum for borrowing. | Ayres & Nalebuff (2010, 2013) |
| 4 Share invested | Only what you actually invest reaches your portfolio. Ayres & Nalebuff measure human capital as the present value of future **contributions**, not total salary. | Multiplies every future salary in H. | Ayres & Nalebuff (2013), "Diversification Across Time" |
| 5 Income now | The starting point of your earnings path. | Year-1 income in H (net, after tax, in today's money). | Ibbotson, Milevsky, Chen & Zhu (2007) |
| 6 Income in 10 years | Earnings typically rise steeply early in a career and flatten around mid-career. | Your implied yearly growth (capped at 12% in the calculation) until age 45, then 0.5% a year. | Cocco, Gomes & Maenhout (2005) |
| 7 Sector | Whether your salary moves with the stock market decides whether it acts like a **bond** (stable) or a **stock** (market-linked). A bond-like income lets your portfolio carry more stock risk; a stock-like one means you're already exposed. | Sets βH, the stock-like share of your future savings: public 0.05 … founder 0.65. These are our model assumptions, set conservatively; average empirical correlations are low. | Ibbotson et al. (2007); Benzoni, Collin-Dufresne & Goldstein (2007) |
| 8 Variable pay | Bonuses, commission and share options usually fall exactly when markets fall. | Adds 0.3 × your variable share to βH (max 0.9). | Ibbotson et al. (2007) |
| 9 Income security | Riskier income is worth less today, just as a risky bond is priced lower than a safe one. | Sets the discount rate for H: real risk-free rate 1% + a spread of 1–4.5%. | Ibbotson et al. (2007); Viceira (2001) |
| 10 Emergency buffer | Without a cash buffer, a job loss could force you to sell investments at the worst moment. | Gate G1: under 3 months caps your target at 1.0× and makes "build a buffer" step 1 of your plan. | Common financial-planning guideline (3–6 months of expenses) |
| 11 Debt rate | Repaying debt that costs more than investments are expected to earn is a guaranteed, risk-free return. | Gate G2: any debt above 7% caps your target at 1.0×. Our expected stock return assumption is 7.5% a year. | Standard debt-vs-invest comparison; our assumptions are on the Method page |
| 12 Reaction to a fall | What you'd actually do in a crash matters more than how brave you feel. Selling after a fall locks in losses. | Half of your risk-attitude score, which sets risk aversion (γ) and your share of total wealth in stocks (w* = premium / (γ·σ²)). | Grable & Lytton (1999); Merton (1969) |
| 13 Income gamble | A classic economics question that measures risk aversion from choices about your own income. | The other half of your risk-attitude score (γ). | Barsky, Juster, Kimball & Shapiro (1997) |
| 14 Max loss in a bad year | Willingness (Q12–13) and **capacity** to bear losses are different things. This is your capacity, in money. | Gate G4: your target is capped so that a 50% stock-market fall never costs more than this amount. | ESMA guidelines on MiFID II suitability requirements (ability to bear losses) |
| 15 Experience | Inexperienced investors overestimate their tolerance until they've lived through a fall. | With no experience and no passed knowledge check, risk attitude is capped at "moderate". | ESMA guidelines on MiFID II suitability (knowledge and experience) |
| 16 Borrowing, knowledge check & opt-in | Borrowing to invest amplifies both gains and losses, and leveraged ETFs lose value in volatile markets. You should understand that before using either. We only test your knowledge if you want to borrow, just as suitability rules assess complex products when a client wants them (ESMA guidelines on MiFID II). | Gate G3: leverage above 1.0× needs a Yes to borrowing, all 3 answers right, an explicit opt-in, 15+ years to retirement and €5,000+ invested. Even then we cap at 1.5× (Ayres & Nalebuff use 2.0×). Skipped when borrowing can't change the result. | Ayres & Nalebuff (2010); Cheng & Madhavan (2009); ESMA guidelines on MiFID II suitability |

---

## 17. Method page (`/#/method`): for the examiner, linked from every "Why we ask" panel and the footer

Sections:
1. **The idea in one paragraph** (from section 1).
2. **How your Risk Capacity is calculated:** the 5 steps with the formulas from section 5.3, written as readable maths (w*, H, βH, raw, caps, final), plus a worked example for Sofie with her real numbers.
3. **Assumptions:** the full table from `assumptions.ts`, each value with a one-line justification and the label "assumption, editable".
4. **Limits and gates:** G1–G4 + the 1.5× cap + the 0.2× floor, each with why it exists.
5. **What this model does not do (limitations):** no taxes; deterministic glide path (no Monte Carlo); sector betas are judgement-based; savings rate held constant; no insurance or housing; illustrative product data.
6. **Not investment advice:** an educational demo; personal recommendations of specific products would be regulated investment advice (e.g. under MiFID II in the EU).
7. **References** (full):
   - Ayres, I. & Nalebuff, B. (2010). *Lifecycle Investing*. Basic Books.
   - Ayres, I. & Nalebuff, B. (2013). Diversification across time. *Journal of Portfolio Management*, 39(2).
   - Barsky, R., Juster, F. T., Kimball, M. & Shapiro, M. (1997). Preference parameters and behavioral heterogeneity. *Quarterly Journal of Economics*, 112(2).
   - Benzoni, L., Collin-Dufresne, P. & Goldstein, R. (2007). Portfolio choice over the life-cycle when the stock and labor markets are cointegrated. *Journal of Finance*, 62(5).
   - Bodie, Z., Merton, R. C. & Samuelson, W. (1992). Labor supply flexibility and portfolio choice in a life cycle model. *Journal of Economic Dynamics and Control*, 16.
   - Cheng, M. & Madhavan, A. (2009). The dynamics of leveraged and inverse exchange-traded funds. *Journal of Investment Management*, 7(4).
   - Cocco, J., Gomes, F. & Maenhout, P. (2005). Consumption and portfolio choice over the life cycle. *Review of Financial Studies*, 18(2).
   - ESMA. Guidelines on certain aspects of the MiFID II suitability requirements.
   - Grable, J. & Lytton, R. (1999). Financial risk tolerance revisited: the development of a risk assessment instrument. *Financial Services Review*, 8(3).
   - Ibbotson, R., Milevsky, M., Chen, P. & Zhu, K. (2007). *Lifetime Financial Advice: Human Capital, Asset Allocation, and Insurance*. CFA Institute Research Foundation.
   - Merton, R. C. (1969). Lifetime portfolio selection under uncertainty: the continuous-time case. *Review of Economics and Statistics*, 51(3).
   - Samuelson, P. A. (1969). Lifetime portfolio selection by dynamic stochastic programming. *Review of Economics and Statistics*, 51(3).
   - Viceira, L. (2001). Optimal portfolio choice for long-horizon investors with nontradable labor income. *Journal of Finance*, 56(2).

---

## 18. v1.4 changes: currency choice and income input

### 18.1 Currency (new question 0, before Q1)
- **Q0 "Which currency should we use?"** with radio cards: DKK · EUR · USD · GBP · SEK · NOK · CHF. Preselect from the browser locale (`da-DK` → DKK, `sv-SE` → SEK, `nb-NO`/`nn-NO` → NOK, `de-CH`/`fr-CH` → CHF, `en-GB` → GBP, `en-US` → USD, otherwise EUR). It sits on the first onboarding screen. The question count stays "of 16"; Q0 is labelled "Before we start".
- **Why we ask:** "So every amount is in money you think in. It doesn't change your result: the model works with ratios, and every threshold is converted at the same rate."
- **FX table** (`src/data/fx.ts`), units per 1 EUR, **ECB euro reference rates of 17 Nov 2026** (source: Banca d'Italia's publication of the ECB reference rates): USD 1.0989 · GBP 0.83305 · DKK 7.4749 · SEK 11.1100 · NOK 10.5755 · CHF 0.9233 · EUR 1. Show the date and source on the Method page.
- **Rules:** profile money (incomes, F, maxLossMoney) is stored in the chosen currency. Every EUR-denominated constant or data value (`minAssetsForLeverage` €5,000, onboarding defaults, slider ranges, product/demo portfolio values, persona money) is converted with `fx[currency]` before use. Format with `Intl.NumberFormat(locale, {style: 'currency', currency, maximumFractionDigits: 0})`. Changing the currency later converts the stored amounts.
- **Personas** are shown in the chosen currency (all their money converted). Their Risk Capacity must not change.
- **Test:** for every persona and every currency, finalEEE, rawEEE, binding and the allocation are identical to EUR (±0.0005).

### 18.2 Income in 10 years (Q6): an exact amount, not brackets
- **Decision:** keep an exact figure; **don't use income brackets with midpoints.** Brackets of 50k are too coarse at normal income levels (a €45k earner would count as €25k), and an open top bracket has no midpoint.
- **Input:** a typed money field (any value up to 20× today's income) plus a **logarithmic slider** from 0.5× to 5× today's income, so both €40k→€55k and €40k→€200k are easy to set. Never derive the slider's range from the growth cap.
- Under it, show the implied yearly growth. Above 12% a year, add a notice: "That's x% a year: possible in some careers, but we cap growth at 12% a year in the calculation." "I'm not sure" keeps +3% a year.
- **Engine:** `growthCap` becomes **0.12** (assumption, editable; the Method page explains it as a generous upper bound for steep early careers, e.g. a student's first salary rising quickly). Persona values in section 9 are unchanged (all ≤ 6%).
- The same typed-field + log-slider pattern applies to Q5 (income now), Q3 (invested today) and Q14 (max loss).

### 18.3 Side-panel fixes seen in testing
- "Risk attitude" shows **"not answered yet"** until Q12 and Q13 are answered (it currently shows "Moderate · 58.6%" from defaults).
- With F = 0, show future savings as "≈ 100% of wealth", not "100.0%".
- Show the explanation once: the Estimate sentence, plus the binding-cap sentence only if it comes from an answered question or the 1.5× policy cap.

---

## 19. v1.7 changes: Plan page redesign, growth first, honest about risk

*28 Nov 2026 · Source: `docs/plan-page-redesign.md`. Replaces the Plan layout in section 7.5 (the gates, products, borrowing panel and "How to get there" content stay). Engine and section 9 values must not change; this only adds functions (`src/engine/projection.ts`, `src/engine/planView.ts`).*

### 19.0 Goal

A beginner should leave the Plan page understanding three things, in this order:
1. **Where my money could be in X years** if I follow the plan, and the realistic range around that.
2. **What it costs me to stay as I am** (too cautious or too risky), shown as two paths side by side.
3. **What a good and a bad single year look like.** The downside stays visible but calm, not the first thing on the page in big red numbers.

**Honesty rule (not negotiable):** projections always show the range, including the 1-in-10 bad outcome, next to the likely one. Never a single optimistic line. Label everything "in today's money, before fees and taxes, not a guarantee". This keeps the page fair and balanced, which suitability and marketing rules expect, and it's what an examiner will check.

---

### 19.1 New engine functions (`src/engine/projection.ts`, pure, tested)

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

### 19.2 Page layout (top to bottom)

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

### 19.3 Visual rules

- Colours: gains and plan = lime; current mix = sky; money paid in = slate; losses = **amber**. Red only for a loss that exceeds the user's own limit.
- Numbers: likely values big (Space Grotesk), ranges smaller and muted. Always "in today's money".
- Every chart has a one-line "What this means" caption written from the data.
- Beginner wording: "likely" (median), "1 in 10 bad case" (p10), "1 in 10 good case" (p90). Explain these once with a small ⓘ.
- Phone layout: tiles stack; the fan chart stays readable (no more than 4 x-axis labels); the horizon toggle scrolls horizontally.

---

### 19.4 Method page and description

- **Method page,** new section "Projections": the formulas above, the assumptions table and the limitations:
  - constant expected returns
  - yearly steps
  - no fees or taxes
  - savings constant in today's money
  - the target held constant over the horizon (no glide path in the projection)
  - simulated with 5,000 seeded paths
- **Application description:** one paragraph on the projections and the "honest range" principle. Retake the Plan screenshots.

---

### 19.5 Acceptance criteria

- Plan page order: summary → growth chart (default tab) → good/bad-year tab → allocation → products → how to get there → advanced.
- Mads at 10 years: the plan's likely value is above the current mix's likely value, and the callout states the gap. Jonas: the callout uses the "riskier" wording with his p10.
- The bad-year tile equals the old stress-test numbers for every persona (target and current).
- No red on the page unless a loss exceeds the user's limit.
- All projection tests pass; section 9 values are unchanged; lint and build pass; works at 375px and 1280px.
- BUILD_SPEC gets this file as section 19 (v1.7).
