import type { ReactNode } from 'react'
import Card from '../components/Card'
import { assumptionRows } from '../content/assumptionNotes'
import { REFERENCES } from '../content/references'
import { PERSONAS } from '../data/personas'
import { assumptions as A, BAND_LABEL, CAP_LABEL, formatEUR, formatPct, formatRatio, roundHalfAway, targetEEE } from '../engine'

const SECTIONS = [
  ['idea', 'The idea'],
  ['calculation', 'How your Risk Capacity is calculated'],
  ['assumptions', 'Assumptions'],
  ['limits', 'Limits and gates'],
  ['limitations', 'What this model does not do'],
  ['not-advice', 'Not investment advice'],
  ['references', 'References'],
] as const


const n2 = (x: number) => roundHalfAway(x, 2).toFixed(2)
const n4 = (x: number) => roundHalfAway(x, 4).toFixed(4)

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-6 space-y-3">
      <h2 id={`${id}-title`} className="text-section text-slate-900">
        {title}
      </h2>
      {children}
    </section>
  )
}

function Formula({ children }: { children: ReactNode }) {
  return <p className="overflow-x-auto rounded-lg bg-slate-50 px-3 py-2 font-mono text-[13px] text-slate-800">{children}</p>
}

/** Method page for the examiner (BUILD_SPEC 17). Every number is read from the engine. */
export default function Method() {
  const sofie = PERSONAS.sofie.profile
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
      `Sofie: growth ${formatPct(t.growth)} a year → H = ${formatEUR(t.pvfs)} (${formatPct(t.hcRatio)} of her lifetime investable wealth)`,
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
      `Sofie: (${n4(t.wStar)} · ${formatEUR(sofie.investableAssets)} + (${n4(t.wStar)} − ${n2(t.betaH)}) · ${formatEUR(t.pvfs)}) / ${formatEUR(sofie.investableAssets)} = ${formatRatio(t.rawEEE)}`,
    ],
    [
      'Limits → final Risk Capacity',
      'The lowest active limit wins; the result is never below the floor.',
      <>final = max({A.floor}, min(raw, lowest limit))</>,
      `Sofie: limits ${t.caps.map((c) => `${CAP_LABEL[c.id]} ${formatRatio(c.value)}`).join(', ')} → final ${formatRatio(t.finalEEE)}`,
    ],
  ]

  return (
    <div className="mx-auto max-w-[760px] space-y-8">
      <header className="space-y-2">
        <p className="text-caption text-slate-500">Method</p>
        <h1 className="text-page-title">How Human Capital Copilot works</h1>
        <p className="text-help text-slate-600">The model, the assumptions behind it and the research it rests on.</p>
        <nav aria-label="On this page" className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-[13px] font-medium">
          {SECTIONS.map(([id, title]) => (
            <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView() }} className="text-accent-700 hover:text-accent-800">
              {title}
            </a>
          ))}
        </nav>
      </header>

      <Card className="space-y-8">
        <Section id="idea" title="1. The idea">
          <p>
            Your future savings ("human capital") are usually your biggest asset when you are young. If your income is safe and bond-like, your portfolio can carry more stock-market risk. If your income
            already moves with markets (finance, founders), it should carry less. Human Capital Copilot turns 16 questions into one number, your <strong>Risk Capacity</strong>: risk as a multiple of
            the global stock market (for example 1.50×). It builds on Ayres &amp; Nalebuff (2010), Ibbotson et al. (2007), and Merton (1969) and Samuelson (1969).
          </p>
        </Section>

        <Section id="calculation" title="2. How your Risk Capacity is calculated">
          <p className="text-help text-slate-600">Five steps. The worked example uses the demo person Sofie (24, starting as a consultant, €10,000 invested, saves 15%).</p>
          <ol className="space-y-5">
            {steps.map(([title, text, formula, example], i) => (
              <li key={title} className="space-y-1.5">
                <p className="text-question">
                  <span className="mr-1.5 text-slate-400">{i + 1}.</span>
                  {title}
                </p>
                <p className="text-help text-slate-700">{text}</p>
                <Formula>{formula}</Formula>
                <p className="text-help text-slate-600">{example}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="assumptions" title="3. Assumptions">
          <p className="text-help text-slate-600">Every value is an assumption and editable in src/engine/assumptions.ts. Rates are real (after inflation) unless marked nominal.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-help">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th scope="col" className="py-2 pr-3 text-caption text-slate-500">Assumption</th>
                  <th scope="col" className="py-2 pr-3 text-caption text-slate-500">Value</th>
                  <th scope="col" className="py-2 text-caption text-slate-500">Why</th>
                </tr>
              </thead>
              <tbody>
                {assumptionRows().map((r) => (
                  <tr key={r.key} className="border-b border-slate-100 align-top last:border-0">
                    <th scope="row" className="py-2 pr-3 text-left font-medium text-slate-800">
                      {r.label}
                      <span className="block text-xs font-normal text-slate-400">assumption, editable</span>
                    </th>
                    <td className="max-w-[14rem] py-2 pr-3 font-mono text-xs break-words text-slate-900">{r.value}</td>
                    <td className="py-2 text-slate-600">{r.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="limits" title="4. Limits and gates">
          <ul className="space-y-2 text-help text-slate-700">
            <li><strong>Safety cap {formatRatio(A.policyCap)}.</strong> Never more than {A.policyCap} times the stock market’s risk, below the 2:1 limit Ayres &amp; Nalebuff use, because borrowing can force sales in a crash.</li>
            <li><strong>G1 Emergency buffer.</strong> Under {A.minBufferMonths} months of expenses saved caps the target at 1.00×, so a job loss never forces you to sell at the bottom.</li>
            <li><strong>G2 Expensive debt.</strong> Debt above {roundHalfAway(A.expensiveDebtRate * 100, 1)}% interest caps the target at 1.00×: repaying it is a guaranteed return close to what stocks are expected to earn.</li>
            <li><strong>G3 Borrowing rules.</strong> Above 1.00× means borrowing. It needs the knowledge check, an explicit opt-in, {A.minYearsForLeverage}+ years to retirement and at least {formatEUR(A.minAssetsForLeverage)} invested.</li>
            <li><strong>G4 Loss limit.</strong> The target is capped so a {roundHalfAway(A.equityShock * 100, 0)}% stock-market fall never costs more than the amount you said you could lose in a bad year (capacity to bear losses, as in MiFID II suitability).</li>
            <li><strong>Floor {formatRatio(A.floor)}.</strong> We never go below this, so long-run savings still grow faster than inflation.</li>
          </ul>
        </Section>

        <Section id="limitations" title="5. What this model does not do">
          <ul className="list-disc space-y-1 pl-5 text-help text-slate-700">
            <li>No taxes.</li>
            <li>The glide path is deterministic (average returns), not a Monte Carlo simulation.</li>
            <li>Sector betas (βH) are judgement-based, not estimated from data.</li>
            <li>The savings rate is held constant over your working life.</li>
            <li>No insurance, housing or pensions outside your portfolio.</li>
            <li>Product and ETF data is illustrative until verified factsheet data arrives.</li>
          </ul>
        </Section>

        <Section id="not-advice" title="6. Not investment advice">
          <p className="text-help text-slate-700">
            This is an educational demo. It shows examples, not recommendations. A personal recommendation of specific products would be regulated investment advice (for example under MiFID II in the EU).
          </p>
        </Section>

        <Section id="references" title="7. References">
          <ul className="space-y-1.5 text-help text-slate-700">
            {REFERENCES.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </Section>
      </Card>
    </div>
  )
}
