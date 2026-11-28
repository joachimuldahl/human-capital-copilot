import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Info } from 'lucide-react'
import AssumptionsDialog from '../components/AssumptionsDialog'
import { IllustrativeBadge } from '../components/Badge'
import Card from '../components/Card'
import FanChart, { FanLegend } from '../components/FanChart'
import OwnBars from '../components/OwnBars'
import ProductCard from '../components/ProductCard'
import SleeveChart from '../components/SleeveChart'
import Tabs from '../components/Tabs'
import { SliderField } from '../components/fields'
import { focusRing, pageWrap, textLink } from '../components/ui'
import {
  BAD_YEAR_NOTE,
  CASH_WEIGHTS,
  PROJECTION_LABEL,
  SLEEVE_LABEL,
  assetClassValues,
  assumptions,
  currencySymbol,
  explainCrypto,
  explainLetfDrag,
  explainMarginBuffer,
  exposures,
  formatPct,
  formatRatio,
  gateCard,
  horizonYears,
  howToSteps,
  letfDrag,
  marginBuffer,
  monthlySavings,
  netWorth,
  oddsSentence,
  oneYearRange,
  ownBarSegments,
  planChanges,
  planLoan,
  planSleeves,
  planSummarySentence,
  portfolioEEE,
  projectWealth,
  projectionCallout,
  projectionCaption,
  solveAllocation,
  stressWithinLimit,
  targetEEE,
  type CompareWith,
  type HorizonChoice,
  type Profile,
  type ProjectionWeights,
} from '../engine'
import { EXAMPLE_PRODUCTS, LEVERAGED_EXAMPLE } from '../data/examples'
import { PERSONAS } from '../data/personas'
import { isIllustrative, PRODUCTS } from '../data/products'
import { useActiveProfile, useCurrency } from '../store/hooks'
import { selectPortfolio, usePortfolioStore } from '../store/portfolioStore'

export default function Plan() {
  const { active, profile, hasAnswers } = useActiveProfile()
  const source = usePortfolioStore((s) => s.source)
  const quick = usePortfolioStore((s) => s.quick)
  const { currency } = useCurrency()
  const holdings = useMemo(() => selectPortfolio(active, { source, quick }, currency).holdings, [active, source, quick, currency])
  const [sat, setSat] = useState({ gold: 0, btc: 0 })
  const isPersona = active !== 'mine'

  return (
    <div className={`${pageWrap} flex flex-col gap-6 pt-8 pb-20 sm:pt-12`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[32px] font-semibold tracking-[-0.02em] sm:text-h1">{isPersona ? `${PERSONAS[active].name}'s plan` : 'Your plan'}</h1>
        <AssumptionsDialog />
      </div>

      {!isPersona && !hasAnswers ? (
        <Card className="space-y-2">
          <p className="text-ink-2">
            Your plan is built from your answers.{' '}
            <Link to="/onboarding" className={`underline underline-offset-2 ${textLink}`}>
              Answer the 16 questions
            </Link>{' '}
            first, or pick a demo person in the menu above.
          </p>
        </Card>
      ) : (
        <PlanBody profile={profile} holdings={holdings} sat={sat} setSat={setSat} />
      )}
    </div>
  )
}

interface PlanBodyProps {
  profile: Profile
  holdings: ReturnType<typeof selectPortfolio>['holdings']
  sat: { gold: number; btc: number }
  setSat: (s: { gold: number; btc: number }) => void
}

const HORIZONS: { id: HorizonChoice; label: string }[] = [...assumptions.PROJECTION_HORIZONS.map((y) => ({ id: y as HorizonChoice, label: `${y} years` })), { id: 'retire', label: 'Until retirement' }]

function PlanBody({ profile: p, holdings, sat, setSat }: PlanBodyProps) {
  const { money, currency } = useCurrency()
  const F = p.investableAssets
  const t = targetEEE(p)
  const alloc = solveAllocation(t.finalEEE, sat)
  const rows = planSleeves(alloc, assetClassValues(holdings, PRODUCTS), F)
  const total = netWorth(holdings)
  const hasHoldings = holdings.length > 0 && total > 0
  const current = hasHoldings ? exposures(holdings, PRODUCTS) : null
  const loan = planLoan(alloc, F)
  const buffer = marginBuffer(t.finalEEE)
  const changes = planChanges(rows, F)
  const gates = t.gates.filter((g): g is 'G1_buffer' | 'G2_debt' => g === 'G1_buffer' || g === 'G2_debt')
  const shownSleeves = rows.filter((r) => r.sleeve !== 'loan' && r.targetShare > 0)
  const bars = ownBarSegments(rows)
  const steps = howToSteps(changes, rows, p, currency)

  const [horizon, setHorizon] = useState<HorizonChoice>(assumptions.defaultHorizon)
  const [compareChoice, setCompareChoice] = useState<CompareWith>('current')
  const [showRange, setShowRange] = useState(false)
  const compareWith: CompareWith = hasHoldings ? compareChoice : 'cash'
  const years = horizonYears(horizon, p)
  const monthly = monthlySavings(p)

  const cmpWeights: ProjectionWeights = compareWith === 'cash' || !current ? CASH_WEIGHTS : current
  const cmpStart = hasHoldings ? total : F
  const planKey = JSON.stringify([F, monthly, alloc.equity, alloc.bonds, alloc.gold, alloc.btc, alloc.loan, years])
  const cmpKey = JSON.stringify([cmpStart, monthly, cmpWeights, years])
  // Projections run 5,000 paths: recompute only when their inputs change (keys above).
  const planProj = useMemo(() => projectWealth({ startValue: F, monthlySaving: monthly, weights: alloc, years }), [planKey]) // oxlint-disable-line react-hooks/exhaustive-deps
  const cmpProj = useMemo(() => projectWealth({ startValue: cmpStart, monthlySaving: monthly, weights: cmpWeights, years }), [cmpKey]) // oxlint-disable-line react-hooks/exhaustive-deps
  const compareLabel = compareWith === 'cash' ? 'All in cash' : 'Your current mix'
  const callout = projectionCallout({ targetEEE: t.finalEEE, compareEEE: compareWith === 'cash' || !current ? 0 : portfolioEEE(current), plan: planProj, compare: cmpProj, years, compareWith, currency })
  const end = planProj.points[planProj.points.length - 1]
  const yearPlan = oneYearRange(alloc, F)
  const yearNow = current ? oneYearRange(current, total) : null

  return (
    <>
      {/* Gates */}
      {gates.length > 0 && (
        <section aria-label="Do these first" className="grid gap-4 md:grid-cols-2">
          {gates.map((g) => {
            const c = gateCard(g, p)
            return (
              <div key={g} className="rounded-card border border-warn-line bg-warn-bg p-5 sm:p-6">
                <p className="text-xs font-semibold tracking-[0.08em] text-warn uppercase">Do this first</p>
                <h2 className="mt-1.5 text-h2 text-ink">{c.title}</h2>
                <p className="mt-1.5 text-help text-panel">{c.text}</p>
              </div>
            )
          })}
        </section>
      )}

      {/* A. Plan summary */}
      <section aria-labelledby="summary" className="rounded-hero border border-line bg-surface p-5 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-label">Target Risk Capacity</p>
            <p id="summary" className={`font-display text-[48px] leading-none font-semibold tracking-[-0.03em] tabular-nums sm:text-[56px] ${t.finalEEE >= 1 ? 'text-lime' : 'text-sky'}`}>
              {formatRatio(t.finalEEE)}
            </p>
            <p className="text-[17px] text-ink">{planSummarySentence(alloc)}</p>
          </div>
          <Link to="/results" className={`text-sm ${textLink}`}>
            Why this number?
          </Link>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <SummaryTile label={`Money you put in · ${years} years`} value={money(end.paidIn)} />
          <SummaryTile label="Likely value" value={money(end.p50)} accent />
          <SummaryTile label="Range" value={`${money(end.p10)} – ${money(end.p90)}`} small note="1 in 10 bad case — 1 in 10 good case" />
        </div>
        <p className="mt-4 text-xs text-muted">{PROJECTION_LABEL}</p>
      </section>

      {/* B + C. Growth over time | A good year vs a bad year */}
      <section aria-labelledby="growth" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="growth" className="text-h2">
            Where your money could be
          </h2>
          <Odds />
        </div>
        <Card>
          <Tabs
            label="Plan views"
            tabs={[
              {
                id: 'growth',
                label: 'Growth over time',
                content: (
                  <div className="space-y-4">
                    <div className="-mx-1 overflow-x-auto px-1 pb-1">
                      <div role="radiogroup" aria-label="Horizon" className="flex w-max gap-2">
                        {HORIZONS.map((h) => (
                          <ChipRadio key={String(h.id)} name="horizon" checked={horizon === h.id} onChange={() => setHorizon(h.id)}>
                            {h.label}
                          </ChipRadio>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-ink-2">
                      <div role="radiogroup" aria-label="Compare with" className="flex flex-wrap items-center gap-2">
                        <span>Compare with</span>
                        <ChipRadio name="compare" checked={compareWith === 'current'} disabled={!hasHoldings} onChange={() => setCompareChoice('current')}>
                          My current mix
                        </ChipRadio>
                        <ChipRadio name="compare" checked={compareWith === 'cash'} onChange={() => setCompareChoice('cash')}>
                          All in cash
                        </ChipRadio>
                      </div>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={showRange} onChange={(e) => setShowRange(e.target.checked)} className={`h-4 w-4 accent-[#7DD3FC] ${focusRing}`} />
                        Show range for {compareWith === 'cash' ? 'cash' : 'current mix'}
                      </label>
                    </div>
                    {!hasHoldings && (
                      <p className="text-xs text-muted">
                        No holdings entered yet, so we compare with cash. Add them on the{' '}
                        <Link to="/portfolio" className={`underline underline-offset-2 ${textLink}`}>
                          Portfolio
                        </Link>{' '}
                        page.
                      </p>
                    )}
                    <FanChart plan={planProj.points} compare={cmpProj.points} compareLabel={compareLabel} showCompareRange={showRange} summary={projectionCaption(planProj, years, currency)} />
                    <FanLegend compareLabel={compareLabel} />
                    <div className={`rounded-control border p-4 text-help text-panel ${callout.kind === 'riskier' ? 'border-warn-line bg-warn-bg' : 'border-line bg-surface-2'}`}>
                      <p>{callout.text}</p>
                      <p className="mt-2 text-ink-2">{oddsSentence(planProj, cmpProj, years, compareWith)}</p>
                    </div>
                    <p className="text-[13px] text-muted">
                      <span className="font-semibold text-ink-2">What this means: </span>
                      {projectionCaption(planProj, years, currency)} {PROJECTION_LABEL}
                    </p>
                  </div>
                ),
              },
              {
                id: 'year',
                label: 'A good year vs a bad year',
                content: (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <h3 className="text-label">With the plan · one year ahead</h3>
                      <YearTiles r={yearPlan} limit={p.maxLossMoney} />
                    </div>
                    {yearNow ? (
                      <div className="space-y-2">
                        <h3 className="text-label">Your portfolio today</h3>
                        <YearTiles r={yearNow} limit={p.maxLossMoney} small />
                      </div>
                    ) : (
                      <p className="text-help text-ink-2">
                        Add your holdings on the{' '}
                        <Link to="/portfolio" className={`underline underline-offset-2 ${textLink}`}>
                          Portfolio
                        </Link>{' '}
                        page to compare.
                      </p>
                    )}
                    <p className="text-help text-ink-2">{BAD_YEAR_NOTE}</p>
                    <p className="text-[13px] text-muted">The bad year is our 2008-style crash test (stocks −50%, Bitcoin −75%, bonds +3%, gold +5%). Good and typical years are the 1-in-10 good case and the likely case of the same return model as the growth chart.</p>
                  </div>
                ),
              },
            ]}
          />
        </Card>
      </section>

      {/* D. What you'd own */}
      <section aria-labelledby="own" className="flex flex-col gap-4">
        <h2 id="own" className="text-h2">
          What you'd own
        </h2>
        <Card className="space-y-5">
          <OwnBars today={bars.today} plan={bars.plan} />
          <details className="group rounded-control border border-line px-4 py-3">
            <summary className={`cursor-pointer rounded text-sm font-semibold text-lime hover:text-lime-hover ${focusRing}`}>Details: target vs current per sleeve</summary>
            <div className="mt-4 space-y-4">
              <SleeveChart rows={rows} />
              <table className="w-full text-xs sm:text-sm">
                <caption className="sr-only">Target and current weight per sleeve</caption>
                <thead>
                  <tr className="border-b border-line text-left text-xs text-muted">
                    <th scope="col" className="py-2 font-medium">
                      Sleeve
                    </th>
                    <th scope="col" className="py-2 pl-3 text-right font-medium">
                      Current
                    </th>
                    <th scope="col" className="py-2 pl-3 text-right font-medium">
                      Target
                    </th>
                    <th scope="col" className="py-2 pl-3 text-right font-medium">
                      <span className="sr-only">Target in {currency}</span>
                      <span aria-hidden>{currencySymbol(currency)}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.sleeve} className="border-b border-line last:border-0">
                      <th scope="row" className="py-2 text-left font-normal text-ink">
                        {SLEEVE_LABEL[r.sleeve]}
                      </th>
                      <td className="py-2 pl-3 text-right tabular-nums text-ink-2">{formatPct(r.currentShare)}</td>
                      <td className="py-2 pl-3 text-right tabular-nums font-semibold text-lime">{formatPct(r.targetShare)}</td>
                      <td className="py-2 pl-3 text-right tabular-nums">{money(r.targetEUR)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-muted">Target weights are a share of your invested amount ({money(F)}). A negative loan means borrowed money.</p>
            </div>
          </details>
        </Card>
      </section>

      {/* E. Example products */}
      <section aria-labelledby="ex" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="ex" className="text-h2">
            Example products
          </h2>
          {shownSleeves.some((r) => EXAMPLE_PRODUCTS[r.sleeve as keyof typeof EXAMPLE_PRODUCTS].some(isIllustrative)) && <IllustrativeBadge />}
        </div>
        <div className="space-y-5">
          {shownSleeves.map((r) => (
            <div key={r.sleeve} className="space-y-2">
              <h3 className="text-label">
                {SLEEVE_LABEL[r.sleeve]} · {formatPct(r.targetShare)}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {EXAMPLE_PRODUCTS[r.sleeve as keyof typeof EXAMPLE_PRODUCTS].map((id) => (
                  <ProductCard key={id} product={PRODUCTS[id]} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* F. How to get there */}
      <section aria-labelledby="how" className="flex flex-col gap-4">
        <h2 id="how" className="text-h2">
          How to get there
        </h2>
        <Card className="space-y-4">
          <ol className="space-y-3">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-3 text-help text-panel">
                <span aria-hidden className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-lime-line bg-lime-tint text-xs font-semibold text-lime">
                  {i + 1}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
          <p className="text-xs text-muted">Changes to make at your own broker. Educational example, not advice. This app never places orders.</p>
        </Card>
      </section>

      {/* G. Advanced */}
      <section aria-labelledby="adv" className="flex flex-col gap-4">
        <h2 id="adv" className="text-h2">
          Advanced
        </h2>
        {t.finalEEE > 1 && (
          <details className="rounded-card border border-line bg-surface p-4 sm:p-6">
            <summary className={`cursor-pointer rounded font-semibold text-ink ${focusRing}`}>Borrowing to invest</summary>
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <Stat label="Loan amount" value={money(loan.amount)} />
                <Stat label="Interest per year" value={money(loan.costPerYear)} note={`at ${formatPct(assumptions.loanRate)}`} />
                <Stat label="Margin buffer" value={buffer === null ? '—' : formatPct(buffer)} note={buffer === null ? undefined : explainMarginBuffer(buffer)} />
              </div>
              <Tabs
                label="How to borrow"
                tabs={[
                  {
                    id: 'loan',
                    label: 'Broker loan (recommended)',
                    content: (
                      <p className="text-help text-panel">
                        Borrow {money(loan.amount)} from your broker against your portfolio and invest it in the same global stock fund. You pay interest of about {money(loan.costPerYear)} a year. If stocks fall a lot, the broker can ask for more collateral or sell your holdings (a margin call): {buffer === null ? '' : explainMarginBuffer(buffer).toLowerCase()}
                      </p>
                    ),
                  },
                  {
                    id: 'letf',
                    label: 'Leveraged ETF (alternative)',
                    content: (
                      <div className="space-y-3">
                        <div className="rounded-control border border-warn-line bg-warn-bg p-3.5 text-help text-panel">
                          <strong className="text-warn">Warning: </strong>
                          {explainLetfDrag(letfDrag(2, assumptions.sigmaEq))}
                        </div>
                        <div className="max-w-sm">
                          <ProductCard product={PRODUCTS[LEVERAGED_EXAMPLE]} />
                        </div>
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          </details>
        )}
        <details className="rounded-card border border-line bg-surface p-4 sm:p-6">
          <summary className={`cursor-pointer rounded font-semibold text-ink ${focusRing}`}>Optional satellites: gold and crypto</summary>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="sat-gold" className="text-help font-medium">
                Gold
              </label>
              <SliderField id="sat-gold" min={0} max={10} step={1} value={Math.round(sat.gold * 100)} onChange={(v) => setSat({ ...sat, gold: v / 100 })} display={formatPct(sat.gold)} />
            </div>
            <div className="space-y-2">
              <label htmlFor="sat-btc" className="text-help font-medium">
                Crypto (Bitcoin)
              </label>
              <SliderField id="sat-btc" min={0} max={10} step={1} value={Math.round(sat.btc * 100)} onChange={(v) => setSat({ ...sat, btc: v / 100 })} display={formatPct(sat.btc)} />
            </div>
            <p className="text-help text-ink-2 sm:col-span-2">
              {sat.btc > 0 ? `${explainCrypto(t.finalEEE, sat.btc, sat.gold)}, because the plan keeps your total risk at ${formatRatio(t.finalEEE)}.` : 'Adding a satellite keeps your total risk the same, so the stock share goes down to make room. The chart and tiles above update.'}
            </p>
          </div>
        </details>
      </section>
    </>
  )
}

/** ⓘ: explains "likely", "1 in 10 bad case" and "1 in 10 good case" once. */
function Odds() {
  return (
    <details className="group relative">
      <summary className={`flex cursor-pointer list-none items-center gap-1 rounded text-xs text-ink-2 hover:text-ink ${focusRing}`}>
        <Info size={16} aria-hidden /> What do “likely” and “1 in 10” mean?
      </summary>
      <div className="mt-2 max-w-xl rounded-control border border-line bg-surface-2 p-3.5 text-[13px] text-panel">
        We simulate 5,000 possible market paths. <strong>Likely</strong> is the middle one (half end higher, half lower). The <strong>1 in 10 bad case</strong> is worse than 9 in 10 paths, and the{' '}
        <strong>1 in 10 good case</strong> is better than 9 in 10. Real outcomes can fall outside this range.
      </div>
    </details>
  )
}

function ChipRadio({ name, checked, disabled, onChange, children }: { name: string; checked: boolean; disabled?: boolean; onChange: () => void; children: ReactNode }) {
  return (
    <label
      className={`relative shrink-0 cursor-pointer rounded-full border px-3.5 py-1.5 text-[13px] font-medium whitespace-nowrap has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-lime ${
        checked ? 'border-lime-line bg-lime-tint text-lime' : 'border-line text-ink-2 hover:text-ink'
      } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      <input type="radio" name={name} checked={checked} disabled={disabled} onChange={onChange} className="sr-only" />
      {children}
    </label>
  )
}

function SummaryTile({ label, value, note, accent, small }: { label: string; value: string; note?: string; accent?: boolean; small?: boolean }) {
  return (
    <div className="rounded-control border border-line bg-surface-2 p-4">
      <p className="text-[13px] text-ink-2">{label}</p>
      <p className={`mt-1 font-display font-semibold tabular-nums ${small ? 'text-lg text-ink-2' : 'text-card-num'} ${accent ? 'text-lime' : ''}`}>{value}</p>
      {note && <p className="mt-0.5 text-xs text-muted">{note}</p>}
    </div>
  )
}

function YearTiles({ r, limit, small }: { r: ReturnType<typeof oneYearRange>; limit: number; small?: boolean }) {
  const { money } = useCurrency()
  const ok = stressWithinLimit(r.bad, limit)
  const signed = (x: number) => (x >= 0 ? `+${money(x)}` : money(x))
  const pct = (x: number) => `${x >= 0 ? '+' : '−'}${formatPct(Math.abs(x))}`
  const num = small ? 'text-xl' : 'text-card-num'
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-control border border-line bg-surface-2 p-4">
        <p className="text-[13px] text-ink-2">Good year</p>
        <p className={`font-display font-semibold tabular-nums text-lime ${num}`}>{signed(r.good.money)}</p>
        <p className="text-xs text-muted">{pct(r.good.pct)} · 1 in 10 good case</p>
      </div>
      <div className="rounded-control border border-line bg-surface-2 p-4">
        <p className="text-[13px] text-ink-2">Typical year</p>
        <p className={`font-display font-semibold tabular-nums text-ink ${num}`}>{signed(r.typical.money)}</p>
        <p className="text-xs text-muted">{pct(r.typical.pct)} · likely</p>
      </div>
      <div className={`rounded-control border p-4 ${ok ? 'border-warn-line bg-warn-bg' : 'border-alert-line bg-alert-bg'}`}>
        <p className="text-[13px] text-ink-2">Bad year, like 2008</p>
        <p className={`font-display font-semibold tabular-nums ${ok ? 'text-warn' : 'text-alert'} ${num}`}>{signed(r.bad.money)}</p>
        <p className="text-xs text-muted">{pct(r.bad.pct)}</p>
        <p className={`mt-1 text-xs font-medium ${ok ? 'text-panel' : 'text-alert'}`}>
          {ok ? 'Within' : 'Above'} your limit of {money(limit)} {ok ? '✔' : '✘'}
        </p>
      </div>
    </div>
  )
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div>
      <p className="text-[13px] text-ink-2">{label}</p>
      <p className="text-card-num">{value}</p>
      {note && <p className="text-xs text-muted">{note}</p>}
    </div>
  )
}
