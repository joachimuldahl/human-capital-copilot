# Human Capital Copilot: demo build spec (for Claude Code)

*v1.1 · 26 Nov 2026 · Single source of truth for building the demo. Replaces the staged S0–S11 plan (project docs 04/06) for this deadline. Financial maths matches project doc 03 (reference engine v2) exactly.*

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
2. If Vercel asks to install its GitHub app, choose **Only select repositories** → `human-capital-copilot` → **Install**.
3. On the Vercel dashboard click **Add New… → Project** (some screens show a **New Project** button instead).
4. Under **Import Git Repository**, find `human-capital-copilot` → **Import**. If it isn't listed, click the link to adjust the GitHub app's permissions and give it access to this repository.
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
| D-1 | Generic international demo. Base currency **EUR** for all demo data. No tax logic. |
| D-2 | Maximum risk **1.5× global equity** via a broker loan. Leveraged ETFs are shown only as an alternative, with a volatility-decay warning. |
| D-3 | The plan shows **sleeve weights + 2–3 example products per sleeve**, always labelled "Example, not advice". No buy/sell instructions. |
| D-4 | All numbers come from a **deterministic engine** (pure TypeScript functions). No AI-generated numbers in the app. |
| D-12 | **Static web app** (Vite + React + TypeScript), no backend, no login, state in the browser (localStorage). |
| D-13 | Hosted on **Vercel** from a public GitHub repo under the personal account `joachimuldahl`. The live link is the demo link for the submission. |
| D-14 | **No in-app AI chat.** "Explain" boxes use pre-written templates filled with engine numbers. |
| D-15 | Scope = Landing, Onboarding, Results, Portfolio, Plan. Out of scope: AI chat, alerts page, CSV import, performance/benchmarks, dividends, star investors, bank connections. |
| D-16 | Demo data (products, ETF look-through) is **illustrative** until Damien's verified factsheet data arrives. It is isolated in `src/data/` so swapping it changes no other code. Show a small "Illustrative data" badge wherever it is used. |

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
growthCap 0.08         growthFloor -0.02    policyCap 1.5         floor 0.2
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

Every product has `illustrative: true`. The UI shows an "Illustrative data" badge. Keep the shapes stable; Damien's verified data will replace the values.

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

Set `ter: null` and show "TER: see factsheet" until verified data arrives.

### 6.3 Look-through (`lookthrough.ts`, weights in %, illustrative)

| ETF | Top holdings | Regions | Sectors |
|---|---|---|---|
| vwce | Apple 4.5 · Microsoft 4.2 · NVIDIA 4.0 · Amazon 2.3 · Meta 1.5 | N. America 64 · Europe 15 · Japan & Pacific 11 · Emerging 10 | Technology 26 · Financials 16 · Industrials 11 · Consumer 11 · Health care 10 · Other 26 |
| cndx | Apple 8.5 · Microsoft 8.0 · NVIDIA 8.0 · Amazon 5.5 · Broadcom 5.0 | N. America 100 | Technology 60 · Consumer 20 · Communication 15 · Health care 5 |
| cspx | NVIDIA 6.5 · Apple 6.5 · Microsoft 6.2 · Amazon 3.7 · Meta 2.5 · JPMorgan 1.3 | N. America 100 | Technology 33 · Financials 13 · Health care 10 · Consumer 10 · Communication 9 · Other 25 |
| finetf | JPMorgan 9.0 · Berkshire Hathaway 7.0 · Visa 5.0 · Mastercard 4.0 · Bank of America 3.0 | N. America 70 · Europe 20 · Japan & Pacific 10 | Financials 100 |
| lev2x | same as cspx | N. America 100 | as cspx |

Region and sector splits each sum to 100. Bonds, gold, bitcoin and cash are shown as "Non-equity" and are not part of the region/sector charts.

### 6.4 Demo portfolios (`demoPortfolios.ts`, values in EUR, totals = F exactly)

| Persona | Accounts → holdings | Story |
|---|---|---|
| sofie (10,000) | Online broker: vwce 4,000 · cndx 3,000 · aapl 1,000 — Crypto exchange: btcetp 1,000 — Bank: cash 1,000 | Apple hidden concentration, ETF overlap, too little risk |
| mads (25,000) | Bank: cash 20,000 — Online broker: vwce 5,000 | Mostly cash, far below target |
| lea (40,000) | Online broker: finetf 16,000 · jpm 8,000 · cspx 8,000 · aggbond 4,000 — Bank: cash 4,000 | Finance job AND finance-heavy portfolio |
| jonas (15,000) | Crypto exchange: btcetp 9,000 — Online broker: nvda 4,500 — Bank: cash 1,500 | Far too much risk vs a 0.67× target |

---

## 7. Screens and user flow

Global: top nav (logo text "Human Capital Copilot" + links Onboarding · Results · Portfolio · Plan), a **persona switcher** (Sofie / Mads / Lea / Jonas / "My answers") visible on Results, Portfolio and Plan. The store keeps the user's own answers and portfolio separately from the personas, so switching to a persona never overwrites "My answers". Every page has a footer: "Educational demo. Not investment advice. Data is illustrative." Mobile-first: works at 375px. Style: calm and trustworthy, white/neutral background, one accent colour (deep teal or indigo), large readable numbers. Ratios show 2 decimals plus "×" (1.50×), money in EUR without decimals (€10,000), percentages with 1 decimal.

### 7.1 Landing (`/`)
- Hero: **"Your biggest asset is your future salary. Is your portfolio built for it?"** Subline: "Human Capital Copilot sizes your investment risk to your whole life, not just today's portfolio."
- Two CTAs: "Start (3 minutes)" → `/onboarding`; "Try a demo person" → four persona cards (name, one-line story). Clicking one loads the persona profile + demo portfolio and goes to `/results`.
- "How it works" in 3 steps: Answer 16 questions → See your Risk Capacity → Compare with your portfolio and plan.
- A small "Built on research" line citing Ayres & Nalebuff (2010) and Ibbotson et al. (2007).

### 7.2 Onboarding (`/onboarding`): 16 questions in 4 steps
Progress bar, Back/Next, one step per screen on mobile. **Live needle**: a sticky panel (desktop right side, mobile bottom bar) showing the current finalEEE on a 0–1.5× scale with explanation line 1. It updates on every answer (missing answers use the defaults below). Each question has a one-sentence "Why we ask" tooltip.

| Step | # | Question | Input | Default |
|---|---|---|---|---|
| 1 About you | 1 | How old are you? | number 16–80 | 25 |
| | 2 | When do you expect to retire? | slider 55–75 | 67 |
| | 3 | How much do you have invested or saved for investing today? | € | 10,000 |
| | 4 | What share of your net income do you invest? | slider 0–40% | 10% |
| 2 Your income | 5 | Your net yearly income now (students: expected first salary) | € | 40,000 |
| | 6 | Where do you expect your income to be in 10 years? | € slider, shows "≈ x% per year" | +3%/yr |
| | 7 | Which sector do you work (or plan to work) in? | 7 radio cards with examples | salaried |
| | 8 | How much of your pay is bonus, commission or shares? | slider 0–100% | 0 |
| | 9 | How secure is your income? | 4 radio cards (very stable: tenured public job … volatile: commission/founder) | average |
| 3 Safety net | 10 | How many months of expenses could you cover with savings? | 0, 1, 2, 3, 4–6, 6+ (→ 0,1,2,3,5,6) | 3 |
| | 11 | Highest interest rate on any debt you have? (0 if none) | % | 0 |
| 4 Risk & knowledge | 12 | "Your €{F} falls to €{0.7·F} in three months. What do you do?" Sell everything (1) · Sell some (2) · Do nothing (3) · Buy a little more (4) · Buy a lot more (5) | radio | 3 |
| | 13 | "You're offered a job: 50% chance it doubles your income, 50% chance it cuts it. What's the largest cut you'd accept?" Never (1) · 10% (2) · 20% (3) · 33% (4) · 50% (5) | radio | 3 |
| | 14 | What is the most you could lose in a bad year without changing your plans? | € | 30% of F |
| | 15 | Investing experience | none / some / experienced | some |
| | 16 | Knowledge check (3 multiple-choice questions; pass = all correct), then the leverage opt-in switch (disabled until passed, with a short risk warning) | | not passed, off |

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
- Sofie look-through: Apple = 1,000 + 4,000·4.5% + 3,000·8.5% = €1,435 = **14.4%** → alert. Overlap(vwce, cndx) = 4.5 + 4.2 + 4.0 + 2.3 = **15.0%**
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
