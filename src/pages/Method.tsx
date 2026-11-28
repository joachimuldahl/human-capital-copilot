import type { ReactNode } from 'react'
import { pageWrap, textLink } from '../components/ui'
import { assumptionRows } from '../content/assumptionNotes'
import { REFERENCES } from '../content/references'
import { FX, FX_DATE, FX_SOURCE, CURRENCIES, CURRENCY_NAME } from '../data/fx'
import { useCurrency } from '../store/hooks'
import { selectProfile } from '../store/profileStore'
import { formatSourceDate, VERIFIED_PRODUCTS } from '../data/products'
import { assumptions as A, BAND_LABEL, CAP_LABEL, formatPct, formatRatio, portfolioParams, roundHalfAway, targetEEE } from '../engine'

const SECTIONS = [
  ['idea', 'The idea'],
  ['calculation', 'How your Risk Capacity is calculated'],
  ['assumptions', 'Assumptions'],
  ['limits', 'Limits and gates'],
  ['projections', 'Projections'],
  ['limitations', 'What this model does not do'],
  ['not-advice', 'Not investment advice'],
  ['references', 'References'],
] as const

const n2 = (x: number) => roundHalfAway(x, 2).toFixed(2)
const n4 = (x: number) => roundHalfAway(x, 4).toFixed(4)

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="space-y-4 border-t border-line pt-8">
      <h2 id={`${id}-title`} className="font-display text-2xl font-semibold tracking-[-0.01em] text-ink">
        {title}
      </h2>
      {children}
    </section>
  )
}

function Formula({ children }: { children: ReactNode }) {
  return <p className="overflow-x-auto rounded-control border border-line bg-surface-2 px-4 py-3 font-mono text-[13px] leading-relaxed text-ink">{children}</p>
}

/** Method page for the examiner (BUILD_SPEC 17). Every number is read from the engine. */
export default function Method() {
  const { money, currency } = useCurrency()
  const sofie = selectProfile({ active: 'sofie', answers: {}, currency })
  const t = targetEEE(sofie)
  const steps: [string, ReactNode, ReactNode, string][] = [
    [
      'Risk attitude → share of total wealth in stocks (w*)',
      'Questions 12 and 13 set a risk band and a risk aversion γ. Merton (1969) gives the share of total wealth to hold in stocks.',
      <>w* = min(premium / (γ · σ²), 1) = min({A.erp} / (γ · {A.sigmaEq}²), 1)</>,
      `Sofie: band ${BAND_LABEL[t.band]}, γ ${t.gamma} → w* = ${n4(t.wStar)}`,
    ],
    [
      'Future savings (human capital, H)',
      'The present value of what you will invest each year until retirement, in today’s money. Income grows at your expected rate until age 45, then slowly; riskier income is discounted more.',
      <>H = Σ savingsRate · income(a) / (1 + {A.rfReal} + spread)^(a − age), for every year to retirement</>,
      `Sofie: growth ${formatPct(t.growth)} a year → H = ${money(t.pvfs)} (${formatPct(t.hcRatio)} of Sofie's lifetime investable wealth)`,
    ],
    [
      'How stock-like your income is (βH)',
      'Sector plus variable pay. A bond-like salary balances stock risk; a stock-like one already carries it.',
      <>βH = min(sector base + {A.variablePayBeta} · variable pay share, {A.betaHMax})</>,
      `Sofie: salaried, no variable pay → βH = ${n2(t.betaH)}`,
    ],
    [
      'Raw target (before limits)',
      'Hold w* of total wealth (today’s money F plus H) in stocks, after counting the stock-like part of H you already own (Ayres & Nalebuff 2010).',
      <>raw = (w* · F + (w* − βH) · H) / F</>,
      `Sofie: (${n4(t.wStar)} · ${money(sofie.investableAssets)} + (${n4(t.wStar)} − ${n2(t.betaH)}) · ${money(t.pvfs)}) / ${money(sofie.investableAssets)} = ${formatRatio(t.rawEEE)}`,
    ],
    [
      'Limits → final Risk Capacity',
      'The lowest active limit wins; the result is never below the floor.',
      <>final = max({A.floor}, min(raw, lowest limit))</>,
      `Sofie: limits ${t.caps.map((c) => `${CAP_LABEL[c.id]} ${formatRatio(c.value)}`).join(', ')} → final ${formatRatio(t.finalEEE)}`,
    ],
  ]

  return (
    <div className={`${pageWrap} pt-10 pb-20 sm:pt-14`}>
      <article className="mx-auto max-w-[760px] space-y-10 text-base leading-[1.7] text-panel">
      <header className="space-y-3">
        <p className="text-[13px] font-semibold tracking-[0.04em] text-lime">METHOD</p>
        <h1 className="font-display text-[32px] leading-[1.12] font-semibold tracking-[-0.02em] text-ink sm:text-h1">How Human Capital Copilot works</h1>
        <p className="text-[17px] text-ink-2">The model, the assumptions behind it and the research it rests on.</p>
        <nav aria-label="On this page" className="flex flex-wrap gap-x-4 gap-y-1.5 pt-2 text-[13px] leading-normal">
          {SECTIONS.map(([id, title]) => (
            <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView() }} className={textLink}>
              {title}
            </a>
          ))}
        </nav>
      </header>

        <Section id="idea" title="1. The idea">
          <p>
            Your future savings ("human capital") are usually your biggest asset when you are young. If your income is safe and bond-like, your portfolio can carry more stock-market risk. If your income
            already moves with markets (finance, founders), it should carry less. Human Capital Copilot turns 16 questions into one number, your <strong>Risk Capacity</strong>: risk as a multiple of
            the global stock market (for example 1.50×). It builds on Ayres &amp; Nalebuff (2010), Ibbotson et al. (2007), and Merton (1969) and Samuelson (1969).
          </p>
        </Section>

        <Section id="calculation" title="2. How your Risk Capacity is calculated">
          <p className="text-ink-2">Five steps. The worked example uses the demo person Sofie (24, starting as a consultant, {money(sofie.investableAssets)} invested, saves 15%).</p>
          <ol className="space-y-7">
            {steps.map(([title, text, formula, example], i) => (
              <li key={title} className="space-y-2">
                <p className="font-display text-lg font-semibold text-ink">
                  <span className="mr-2 text-lime">{i + 1}.</span>
                  {title}
                </p>
                <p>{text}</p>
                <Formula>{formula}</Formula>
                <p className="text-help text-ink-2">{example}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="assumptions" title="3. Assumptions">
          <p className="text-ink-2">Every value is an assumption and editable in src/engine/assumptions.ts. Rates are real (after inflation) unless marked nominal.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-help">
              <thead>
                <tr className="border-b border-line text-left">
                  <th scope="col" className="py-2 pr-3 text-label">Assumption</th>
                  <th scope="col" className="py-2 pr-3 text-label">Value</th>
                  <th scope="col" className="py-2 text-label">Why</th>
                </tr>
              </thead>
              <tbody>
                {assumptionRows().map((r) => (
                  <tr key={r.key} className="border-b border-line align-top last:border-0">
                    <th scope="row" className="py-2 pr-3 text-left font-medium text-ink">
                      {r.label}
                      <span className="block text-xs font-normal text-muted">assumption, editable</span>
                    </th>
                    <td className="max-w-[14rem] py-2 pr-3 font-mono text-xs break-words text-ink">{r.value}</td>
                    <td className="py-2 text-ink-2">{r.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 className="pt-2 font-display text-lg font-semibold text-ink">Income growth cap</h3>
          <p>
            The growth you expect in question 6 is used until age {A.peakAge}, capped at {roundHalfAway(A.growthCap * 100, 1)}% a year (and at least {roundHalfAway(A.growthFloor * 100, 1)}%). {roundHalfAway(A.growthCap * 100, 1)}% is a
            generous upper bound for steep early careers, for example a student whose first salary rises quickly. You can enter any expected income; only the calculation is capped.
          </p>
          <h3 id="data-sources" className="pt-2 font-display text-lg font-semibold text-ink">Product data sources</h3>
          <p>
            Five example products use data from the issuers’ official factsheets, collected and checked by Damien (team member) and audited against the PDFs: name,
            ticker, ISIN, fee, top 10 holdings, country and sector weights. Products are matched on ISIN. Company names are mapped to one id per company (e.g.
            “APPLE INC” and “Apple Inc.” are the same), countries are grouped into regions using MSCI’s market classification (so Korea and Taiwan count as
            Emerging), and sector names are aligned. Vanguard reports ICB industries and the others GICS sectors, so “Technology” is defined slightly differently
            between funds. VWCE’s factsheet lists only its top 10 countries; the remaining 11.3% is shown as “Other countries”. Everything else (the
            financials ETF, short government bonds, Bitcoin ETP, 2× leveraged ETF and single-stock details) stays illustrative.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-help">
              <caption className="sr-only">Verified product data and sources</caption>
              <thead>
                <tr className="border-b border-line text-left">
                  <th scope="col" className="py-2 pr-3 text-label">Product</th>
                  <th scope="col" className="py-2 pr-3 text-label">ISIN</th>
                  <th scope="col" className="py-2 text-label">Source and date</th>
                </tr>
              </thead>
              <tbody>
                {VERIFIED_PRODUCTS.map((p) => (
                  <tr key={p.id} className="border-b border-line align-top last:border-0">
                    <th scope="row" className="py-2 pr-3 text-left font-medium text-ink">
                      {p.ticker} <span className="block text-xs font-normal text-ink-2">{p.name}</span>
                    </th>
                    <td className="py-2 pr-3 font-mono text-xs text-ink">{p.isin}</td>
                    <td className="py-2 text-ink-2">
                      <a href={p.source!.url} target="_blank" rel="noreferrer" className={textLink}>
                        {p.source!.issuer} factsheet
                      </a>
                      , {formatSourceDate(p.source!.asOf)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 id="currency" className="pt-2 font-display text-lg font-semibold text-ink">Currencies and exchange rates</h3>
          <p>
            You choose the currency at the start. Demo data and the money thresholds (the {money(A.minAssetsForLeverage * FX[currency])} minimum for borrowing, onboarding defaults and slider ranges) are stored in
            euros and converted at fixed rates. The model works with ratios, so your Risk Capacity is the same in every currency. Rates: {FX_SOURCE}, {FX_DATE}.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full max-w-md text-help">
              <caption className="sr-only">Units of each currency per 1 euro</caption>
              <thead>
                <tr className="border-b border-line text-left">
                  <th scope="col" className="py-2 pr-3 text-label">Currency</th>
                  <th scope="col" className="py-2 text-right text-label">Per 1 EUR</th>
                </tr>
              </thead>
              <tbody>
                {CURRENCIES.map((c) => (
                  <tr key={c} className="border-b border-line last:border-0">
                    <th scope="row" className="py-2 pr-3 text-left font-medium text-ink">
                      {c} <span className="font-normal text-ink-2">· {CURRENCY_NAME[c]}</span>
                    </th>
                    <td className="py-2 text-right font-mono text-xs text-ink">{FX[c]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="limits" title="4. Limits and gates">
          <ul className="space-y-3 [&_strong]:text-ink">
            <li><strong>Safety cap {formatRatio(A.policyCap)}.</strong> Never more than {A.policyCap} times the stock market’s risk, below the 2:1 limit Ayres &amp; Nalebuff use, because borrowing can force sales in a crash.</li>
            <li><strong>G1 Emergency buffer.</strong> Under {A.minBufferMonths} months of expenses saved caps the target at 1.00×, so a job loss never forces you to sell at the bottom.</li>
            <li><strong>G2 Expensive debt.</strong> Debt above {roundHalfAway(A.expensiveDebtRate * 100, 1)}% interest caps the target at 1.00×: repaying it is a guaranteed return close to what stocks are expected to earn.</li>
            <li><strong>G3 Borrowing rules.</strong> Above 1.00× means borrowing. It needs the knowledge check, an explicit opt-in, {A.minYearsForLeverage}+ years to retirement and at least {money(A.minAssetsForLeverage * FX[currency])} invested.</li>
            <li><strong>G4 Loss limit.</strong> The target is capped so a {roundHalfAway(A.equityShock * 100, 0)}% stock-market fall never costs more than the amount you said you could lose in a bad year (capacity to bear losses, as in MiFID II suitability).</li>
            <li><strong>Floor {formatRatio(A.floor)}.</strong> We never go below this, so long-run savings still grow faster than inflation.</li>
          </ul>
        </Section>

        <Section id="projections" title="5. Projections (Plan page)">
          <p>
            The Plan page shows where your money could be after 5 to 30 years, or at retirement, with the target plan and with your current mix (or all in cash). We always show the range next to the
            likely value, never a single optimistic line. All amounts are in today’s money, before fees and taxes, and none of them is a guarantee.
          </p>
          <p>
            <strong className="text-ink">Expected return and risk of a mix.</strong> Each asset’s expected nominal return minus {formatPct(A.inflation)} inflation, weighted by the plan. A broker loan
            costs {formatPct(A.loanRate)} a year (cash rate plus the loan spread), so borrowing lowers the expected return. Volatility uses the same covariance matrix as the allocation.
          </p>
          <Formula>
            μ = Σ wᵢ · (returnᵢ − inflation) + loan · (loanRate − inflation)
            <br />σ = √(xᵀ · COV · x) over stocks, bonds, gold and Bitcoin (cash and the loan have no volatility)
          </Formula>
          <p>
            <strong className="text-ink">Simulation.</strong> {A.projectionPaths.toLocaleString('en-US')} paths of yearly log-normal returns with that mean and volatility, from a fixed random seed ({A.projectionSeed}), so
            the numbers are the same on every visit. Your monthly savings (constant in today’s money) are added at the end of each year.
          </p>
          <Formula>
            s² = ln(1 + σ² / (1 + μ)²), m = ln(1 + μ) − s² / 2
            <br />W(t+1) = W(t) · exp(m + s · Z) + 12 · monthly saving, Z ~ N(0, 1)
          </Formula>
          <p>
            <strong className="text-ink">What we show.</strong> “Likely” is the median path, the “1 in 10 bad case” the 10th percentile and the “1 in 10 good case” the 90th. We also show the chance
            of ending below the money you put in. The one-year “bad year” is the 2008-style crash test (section 4), so it matches the loss limit exactly.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Expected returns used in projections</caption>
              <thead>
                <tr className="border-b border-line text-xs text-muted">
                  <th scope="col" className="py-2 font-medium">Asset</th>
                  <th scope="col" className="py-2 text-right font-medium">Nominal</th>
                  <th scope="col" className="py-2 text-right font-medium">Real (today’s money)</th>
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    ['Stocks (global)', 'equity'],
                    ['Bonds', 'bonds'],
                    ['Gold', 'gold'],
                    ['Bitcoin (no credible basis; set equal to stocks)', 'btc'],
                    ['Cash', 'cash'],
                  ] as const
                ).map(([label, k]) => (
                  <tr key={k} className="border-b border-line last:border-0">
                    <th scope="row" className="py-2 font-normal text-ink">{label}</th>
                    <td className="py-2 text-right font-mono text-xs text-ink">{formatPct(A.EXPECTED_NOMINAL[k])}</td>
                    <td className="py-2 text-right font-mono text-xs text-ink">
                      {formatPct(portfolioParams({ equity: 0, bonds: 0, gold: 0, btc: 0, cash: 0, [k]: 1 }).mu)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="font-semibold text-ink">Limitations of the projections</p>
          <ul className="list-disc space-y-1 pl-5 marker:text-lime">
            <li>Constant expected returns and volatility; real markets have regimes and fat tails.</li>
            <li>Yearly steps.</li>
            <li>No fees or taxes.</li>
            <li>Savings constant in today’s money.</li>
            <li>The target is held constant over the horizon (no glide path in the projection).</li>
            <li>Simulated with {A.projectionPaths.toLocaleString('en-US')} seeded paths, so percentiles carry a small sampling error.</li>
          </ul>
        </Section>

        <Section id="limitations" title="6. What this model does not do">
          <ul className="list-disc space-y-1 pl-5 marker:text-lime">
            <li>No taxes.</li>
            <li>The glide path on Results is deterministic (average returns). Only the Plan projections are simulated (section 5).</li>
            <li>Sector betas (βH) are judgement-based, not estimated from data.</li>
            <li>The savings rate is held constant over your working life.</li>
            <li>No insurance, housing or pensions outside your portfolio.</li>
            <li>Only five products use verified factsheet data (listed under Assumptions); all other product data, the demo people and their portfolios are illustrative. Look-through uses each ETF’s top 10 holdings only.</li>
          </ul>
        </Section>

        <Section id="not-advice" title="7. Not investment advice">
          <p>
            This is an educational demo. It shows examples, not recommendations. A personal recommendation of specific products would be regulated investment advice (for example under MiFID II in the EU).
          </p>
        </Section>

        <Section id="references" title="8. References">
          <ul className="space-y-2 text-help">
            {REFERENCES.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </Section>
      </article>
    </div>
  )
}
