# Audit of Damien's delivery ("Headroom package")

*26 Nov 2026 · Audited by Claude Code for Joachim · Nothing in `src/` was changed.*

**Location.** The package was already inside the repo, at `Team/Damien/Headroom_package/` (not `team/damien/`), so nothing was moved. The folder structure is kept as Damien delivered it. The 10 factsheet PDFs are git-ignored (third-party documents); their URLs stay in `etfs.csv`.

**Method.** Word files were read with macOS `textutil`. PDF text was extracted with macOS PDFKit. Where a factsheet shows splits only as a chart, or its text layer is jumbled, the page was rendered to an image and read visually. CSV totals and links were checked with a script. Figures were checked against the PDFs in the package; prices and issuer web pages were **not** checked online.

**Verdict in one line.** The ETF data is careful, sourced work and matches the factsheets in every figure checked. The example users are internally consistent but built for a different product. The notes and the application description describe "Headroom", a broader product than the one we built.

---

## 1. Inventory

| File | What it is |
|---|---|
| `Package_contents.docx` | Index of the package; folder numbers follow the developer's task list. |
| `1_Notes/Notes.docx` | Idea and design notes: name "Headroom", Finary as design reference, tracker + AI-agent product, build order. |
| `2_Demo_data/ETFs_and_example_users.docx` | Readable version of the data: the 10 ETFs (issuer, ticker, ISIN, factsheet date) and the 3 example users with holdings and prices. |
| `2_Demo_data/etfs.csv` | One row per ETF: ISIN, name, issuer, listings, asset class, TER, holdings count, benchmark, net assets, dates, source file, issuer URL. |
| `2_Demo_data/etf_top_holdings.csv` | Top 10 holdings per ETF (91 rows; gold has one "Gold 100%" row), with weight basis (fund/index) and as-of date. |
| `2_Demo_data/etf_regions.csv` | Country weights per equity ETF (79 rows), with a coverage note. |
| `2_Demo_data/etf_sectors.csv` | Sector weights per ETF (93 rows), with the classification used (GICS, ICB, bond sectors, industry groups). |
| `2_Demo_data/etf_bond_breakdowns.csv` | Maturity and credit-rating buckets for the aggregate bond ETF (18 rows). |
| `2_Demo_data/accounts.csv` | 5 accounts for 3 example users (student, young professional, 45-year-old), with cash balances. |
| `2_Demo_data/holdings.csv` | 17 holdings: ISIN, ticker, exchange, quantity, price, price date, value, price source URL. |
| `2_Demo_data/factsheets/01_IWDA_…pdf` … `10_ZPDT_…pdf` | The 10 official issuer factsheets (Oct 2026), 3–8 pages each. **Git-ignored.** |
| `5_Application_description/Headroom_Application_Description.pdf` | 3-page application description for "Headroom" (problem, solution, features, users, research, AI use, demo data). |
| `AI_prompts/AI_prompts.docx` | Summary of the prompts Damien used, in 5 groups (pitch, developer brief, demo data, description, packaging). Not verbatim. |
| `.DS_Store` (2) | macOS folder metadata; already ignored by `.gitignore`. |

---

## 2. ETF data (10 ETFs)

**Checked for every ETF (text layer):** ISIN, TER/ongoing charge, primary ticker, number of holdings, factsheet date. All 10 match.

**Figures checked in detail:**

| # | ETF | Figures checked against the factsheet | Splits sum | Result |
|---|---|---|---|---|
| 1 | IWDA, iShares Core MSCI World (IE00B4L5Y983) | TER 0.20%, 1,250 holdings, net assets 146,648.56 M, all 10 top holdings (total 26.47% = printed), all 11 countries and 11 sectors (chart, read visually) | regions 100.00 · sectors 99.99 | **Verified** |
| 2 | VWCE, Vanguard FTSE All-World (IE00BK5BQT80) | OCF 0.14%, 3,574 holdings, 10 top holdings, 10 countries, 11 sectors | regions **88.70** · sectors 100.00 | **Verified**, regions incomplete (factsheet prints only the top 10 countries; this is stated in the `coverage` column) |
| 3 | SPY5, SPDR S&P 500 Dist (IE00B6YX5C33) | TER 0.03%, 505 holdings, 10 top holdings, US 100%, 11 sectors | 100.00 · 99.99 | **Verified** |
| 4 | EQQQ, Invesco Nasdaq-100 Dist (IE0032077012) | Ongoing charge 0.30%, 102 holdings, NAV 693.83, 10 top holdings, 6 countries, 10 sectors | 100.00 · 99.90 (printed with 1 decimal) | **Verified** |
| 5 | IEEM, iShares MSCI EM Dist (IE00B0M63177) | TER 0.18%, 1,136 holdings, 10 top holdings (total 38.02% = printed), 11 countries and 11 sectors (chart, read visually) | 99.99 · 99.98 | **Verified** |
| 6 | MEUD, Amundi Core STOXX Europe 600 (LU0908500753) | 599 holdings, NAV 318.75, 10 top holdings, 16 countries (chart, read visually), 11 sectors | 100.00 · 100.00 | **Verified, with gaps:** no TER (the factsheet doesn't print one; the CSV leaves it blank, correctly). Top holdings, countries and sectors are **benchmark-index** weights, not fund weights (labelled in the CSV). Top-10 sum 20.57% vs printed 20.58% (rounding). |
| 7 | AGGH, iShares Core Global Aggregate Bond EUR Hedged (IE00BDBRDM35) | TER 0.10%, 19,978 holdings, 10 top **issuers** (total 51.69% = printed), 11 sectors, 10 maturity and 8 rating buckets (charts, read visually) | sectors 100.02 · maturity 99.99 · ratings 99.98 | **Verified.** No country split (the factsheet has none). |
| 8 | PHAU, WisdomTree Physical Gold (JE00B1VS3770) | Management fee 0.39%, document date 30/10/2026, Xetra ticker VZLD printed | n/a (one "Gold 100%" row) | **Verified** (little to check; an ETC, not a fund) |
| 9 | ZPRS, SPDR MSCI World Small Cap (IE00BCBJG560) | TER 0.45%, 3,680 holdings, 10 top holdings, 23 countries, 11 sectors (page read visually: the text layer is jumbled) | 99.99 · 100.01 | **Verified** |
| 10 | ZPDT, SPDR S&P US Technology Select Sector (IE00BWBXM948) | TER 0.15%, 75 holdings, 10 top holdings, US 100%, 6 rows | 100.00 · 100.01 | **Verified.** The "sectors" are GICS industry groups (labelled in the CSV). |

**Errors found: none.** Every figure checked matches the factsheet.

**Points to know (not errors):**
- **Sources and dates.** Every row in the breakdown CSVs has an `as_of_date` and a `source_file` (the local PDF). URLs are per ETF, in `etfs.csv` (`issuer_page_url`), not per row. For PHAU the Word table says "no PDF link, see local file". MEUD's URL is an Amundi PDF link. Once the PDFs are ignored in git, `source_file` points to a file that exists only locally, so the URL in `etfs.csv` is the public source.
- **Tickers.** `holdings.csv` uses Xetra/Bloomberg codes that differ from the primary ticker in `etfs.csv`: EUNL (IWDA), IQQE (IEEM), EUNA (AGGH), VZLD (PHAU). The ISINs match in every case. EUNA and VZLD are printed on the factsheets; EUNL and IQQE are not (the factsheets only say "also listed on Deutsche Boerse Xetra").
- **Security names differ between issuers**: "APPLE", "Apple", "APPLE INC" and "Apple Inc.", or "Alphabet" vs "ALPHABET CLASS A/C". Look-through and overlap need a name mapping before this data can be used (see section 6).
- **Countries, not regions.** The splits are by country; our app uses regions (North America, Europe, …), so a country→region mapping is needed.

---

## 3. Example users (accounts.csv, holdings.csv)

**Consistency: passes.**
- All 17 holdings point to an existing account (ACC-S1, Y1, Y2, M1, M2).
- All 15 ETF holdings point to an ISIN in `etfs.csv`, with the same name. Apple and Microsoft (account ACC-Y2) are single stocks and are correctly not in `etfs.csv`.
- `market_value = quantity × price` on every row. Each holding's currency matches its account.
- Account totals match the Word document: Student €4,249.10 · Young professional €26,480.63 + $8,486.88 · 45-year-old €204,292.85 + €39,066.00 = €243,358.85.
- Every price has a date and a source URL (MEUD uses the NAV from its factsheet).

**Points to know:**
- **Price dates vary:** 30 Oct (MEUD, a NAV, not a market price), 13 Nov (IQQE), 20–25 Nov (others). Prices were not checked online.
- **One account is in USD** (Apple, Microsoft). Our app holds one currency per user and does not mix currencies within a portfolio.

**Compared with our 4 personas (BUILD_SPEC 6.1, 6.4):**

| | Damien's example users | Our personas |
|---|---|---|
| Who | Student 22 · young professional 28 · established investor 45 ("less in our target") | Sofie 24 · Mads 27 · Lea 26 · Jonas 29, each with a different income type |
| Profile data | Age (and an income range for one); no answers to our 16 questions | Full profile: income now and in 10 years, sector, variable pay, security, buffer, risk answers, max loss |
| Portfolio | Real ISINs, real dated prices, invented quantities; 1–2 accounts | Illustrative products; values in EUR; totals equal F exactly |
| Story | Tracker demo (multi-account, multi-currency) | Each persona tells one risk story (cap, loss limit, stock-like income, crypto) that section 9 tests |

They serve a different purpose. They can't replace our personas without inventing the missing profile answers, which would change every section 9 value. They could serve as an extra "real tickers" demo portfolio.

---

## 4. Application description PDF

**What it adds beyond `docs/Application-Description.md`:**
- **Market evidence for the problem:** robo-advisor questionnaires with questions that don't affect the result (Lai & Chow 2023); unstable AI-chatbot advice (Bakshi et al. 2026); robo-advice benefits (D'Acunto et al. 2019); LLM reliability (Lo & Ross 2024).
- **A balanced research paragraph:** human capital as bond-like (Viceira 2001; Cocco, Gomes & Maenhout 2005) vs stock-like over the long run (Benzoni, Collin-Dufresne & Goldstein 2007). Our document doesn't argue this; our Method page only cites them.
- **A tagline:** "Know what you own. Know how much risk to take."
- **A one-line user example** (a 24-year-old graduate), close to our Sofie.

**Conflicts with what we built.** It describes features we don't have, and some that our spec rules out:
- AI strategy agents and risk-drift alerts. D-14 rules out in-app AI; D-15 puts alerts out of scope.
- Performance vs benchmarks, dividends and 13F star-investor portfolios (out of scope, D-15).
- A target of up to **200% (2:1)**; ours is capped at **1.5×** (D-2).
- "15 to 20 questions" including education and inheritance; ours has 16, without those.
- "Three illustrative users, nine ETFs and one gold ETC" as demo data; the app uses our 4 personas and illustrative products.
- The name "Headroom".

**Citations, checked against BUILD_SPEC section 17:**

| Citation in the PDF | In section 17? | Check |
|---|---|---|
| Ayres, I. & Nalebuff, B. (2013). Diversification across time. *Journal of Portfolio Management*, 39, 73–86. | Yes | **Matches** (section 17: 39(2); the PDF adds pages, omits the issue number). Not checked: the PDF's claim of "21% smaller standard deviation" vs a constant 75% allocation. |
| Ibbotson, R. G., Milevsky, M. A., Chen, P. & Zhu, K. X. (2007). *Lifetime Financial Advice: Human Capital, Asset Allocation, and Insurance*. CFA Institute Research Foundation. | Yes | **Matches.** |
| Cheng & Madhavan (2009) | Yes | Matches by author and year (in-text only, no full reference). |
| Viceira (2001) | Yes | Matches by author and year (in-text only). |
| Cocco, Gomes & Maenhout (2005) | Yes | Matches by author and year (in-text only). |
| Benzoni, Collin-Dufresne & Goldstein (2007) | Yes | Matches by author and year (in-text only). |
| ESMA (2022) | Yes, as "ESMA. Guidelines on … MiFID II suitability requirements" (no year) | Consistent; section 17 gives no year. |
| Lai & Chow (2023) · CFA Institute digest (2017) · Bakshi et al. (2026, preprint) · Avellaneda & Zhang (2010) · D'Acunto et al. (2019) · Lo & Ross (2024) · SEC (13F deadline) | **No** | In-text only. The PDF says full references are in a "Sources" document, which **is not in the package**. Titles and journals can't be checked from the package. |

**Missing from the PDF but in section 17:** Ayres & Nalebuff (2010) *Lifecycle Investing*, Merton (1969), Samuelson (1969), Bodie, Merton & Samuelson (1992), Barsky et al. (1997), Grable & Lytton (1999). That's expected: they support the questionnaire and maths, which his document doesn't cover.

---

## 5. Notes: conflicts with what we built

| Note | What we built | Conflict |
|---|---|---|
| Name "Headroom" (used in the pitch; "open to changing it") | "Human Capital Copilot" everywhere: app, repo, README, description, live URL | **Yes.** Team decision needed; the pitch and the app should use one name. |
| Design based on Finary (finary.com) | Our own dark design system (BUILD_SPEC 15, mockups in `docs/design/`) | **Yes**, but historical: Finary was the brief; the team later approved our mockups. |
| Core module = portfolio tracker with performance vs benchmarks, dividends, 13F star investors | Portfolio page with look-through, concentration, overlap, risk fit and stress test; no performance, dividends or 13F (D-15) | **Partly.** Look-through and allocation match; the rest is out of scope. |
| AI strategy layer: AI agents suggesting products, alerts | No AI in the app (D-14); example products labelled "Example, not advice" (D-3); no alerts | **Yes.** |
| Insight: young people can go above 100% equity (Ayres & Nalebuff; Ibbotson et al.) | Same idea, capped at 1.5× with gates | Consistent (cap level differs, see section 4). |
| Users: students and young professionals | Same | Consistent. |
| Build plan: tracker first, then engine, then AI agents | Engine first, then pages; no agents | Historical; no action. |

---

## 6. Recommendations

| Item | Recommendation | Effort | Notes |
|---|---|---|---|
| ETF data (`etfs.csv` + breakdown CSVs) | **Use with fixes** | About half a day: products and look-through rewritten from the CSVs, a security-name mapping, a country→region mapping, test updates, spec section 6/9 edits | High quality. It covers only 5 of our 9 ETF-type products (see below). |
| Factsheet PDFs | **Keep locally, don't publish** | Done (git-ignored) | URLs stay in `etfs.csv`. |
| Example users | **Don't use as personas**; optionally add one as an extra "real tickers" demo portfolio | 1–2 hours for one extra portfolio | They lack the profile answers our engine needs; one account is in USD. |
| Application description PDF | **Use parts, with fixes**: the problem evidence, the counter-evidence paragraph, the tagline | 1 hour to merge into our description | Drop or rewrite: Headroom name, AI agents, alerts, 13F, 200% target, "three users / ten ETFs". Get the missing "Sources" document before citing the extra papers, and add them to the Method page references. |
| Notes | **Don't use** (reference only) | none | Settle the name. |
| AI prompts | **Use as a summary, with the caveat** | Done (`prompts/team/damien.md`) | Replace with his originals when they arrive. |

### If Damien's ETF data replaced `src/data` (what would change)

**Product mapping.** Our products vs his ETFs:

| Our product (`products.ts`) | Damien's closest | Fit |
|---|---|---|
| vwce | VWCE | Same fund |
| cspx (iShares S&P 500) | SPY5 (SPDR S&P 500) | Same index, different issuer and ticker |
| cndx (iShares Nasdaq-100) | EQQQ (Invesco Nasdaq-100) | Same index, different issuer and ticker |
| aggbond | AGGH | Same type (global aggregate, EUR-hedged) |
| sgln (iShares gold) | PHAU (WisdomTree gold) | Same type, different issuer |
| finetf (financials sector) | **none** | Lea's demo story depends on it |
| govshort, btcetp, lev2x | **none** | Would stay illustrative |
| (not in our app) | IWDA, IEEM, MEUD, ZPRS, ZPDT | Extra choices |

**Section 9 values (BUILD_SPEC):**
- **Unchanged:** every Risk Capacity number, every allocation, actual EEE, risk fit, and both stress tests. These depend only on asset classes and amounts, not on look-through weights. That holds as long as the demo portfolios keep their amounts and asset classes.
- **Sofie's Apple concentration:** 1,000 + 4,000·4.8% (VWCE) + 3,000·8.17% (EQQQ) = **€1,437 = 14.4%**. The percentage is unchanged; the euro amount and the source split ("VWCE 1.9% + EQQQ 2.5%") change.
- **Sofie's overlap VWCE/CNDX: 15.0% → about 20.5%** (VWCE vs EQQQ, matching names across issuers). The spec's 15.0% value and its test would change.
- **Lea's JPMorgan and financials story breaks:** no financials ETF, and SPY5's top 10 has no JPMorgan (our illustrative CSPX has 1.3%). Her "finance job and finance-heavy portfolio" needs a financials-ETF factsheet from Damien or a new demo portfolio.
- **Other tests that would change** (not in section 9): the VWCE "North America 64%" region figures (Mads 64.0%, Lea 85.0%, Sofie €6,560), Mads's "Technology 26.0%", Lea's "Financials 78.3%", and the Lea overlap (1.3%).
