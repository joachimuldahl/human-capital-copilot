import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AssumptionsDialog from '../components/AssumptionsDialog'
import { IllustrativeBadge } from '../components/Badge'
import Card from '../components/Card'
import Explain from '../components/Explain'
import ProductCard from '../components/ProductCard'
import SleeveChart from '../components/SleeveChart'
import Tabs from '../components/Tabs'
import { SliderField } from '../components/fields'
import { pageWrap, textLink } from '../components/ui'
import {
  SLEEVE_LABEL,
  assetClassValues,
  currencySymbol,
  describeChange,
  explainCrypto,
  explainLetfDrag,
  explainMarginBuffer,
  explainNextSavings,
  exposures,
  formatPct,
  formatRatio,
  gateCard,
  letfDrag,
  marginBuffer,
  monthlySavings,
  mostUnderweight,
  netWorth,
  planChanges,
  planLoan,
  planSleeves,
  solveAllocation,
  stressLoss,
  stressWithinLimit,
  targetEEE,
  assumptions,
  type Profile,
  type StressResult,
} from '../engine'
import { EXAMPLE_PRODUCTS, LEVERAGED_EXAMPLE } from '../data/examples'
import { PERSONAS } from '../data/personas'
import { PRODUCTS } from '../data/products'
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

function PlanBody({ profile: p, holdings, sat, setSat }: PlanBodyProps) {
  const { money, currency } = useCurrency()
  const F = p.investableAssets
  const t = targetEEE(p)
  const alloc = solveAllocation(t.finalEEE, sat)
  const rows = planSleeves(alloc, assetClassValues(holdings, PRODUCTS), F)
  const total = netWorth(holdings)
  const stressNow = holdings.length > 0 ? stressLoss(exposures(holdings, PRODUCTS), total) : null
  const stressTarget = stressLoss(alloc, F)
  const loan = planLoan(alloc, F)
  const buffer = marginBuffer(t.finalEEE)
  const changes = planChanges(rows, F)
  const gates = t.gates.filter((g): g is 'G1_buffer' | 'G2_debt' => g === 'G1_buffer' || g === 'G2_debt')
  const shownSleeves = rows.filter((r) => r.sleeve !== 'loan' && r.targetShare > 0)

  return (
    <>
      {/* 1. Gates */}
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

      <Card className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-baseline gap-3 text-ink-2">
          Target Risk Capacity <strong className={`text-card-num ${t.finalEEE >= 1 ? 'text-lime' : 'text-sky'}`}>{formatRatio(t.finalEEE)}</strong>
        </p>
        <Link to="/results" className={`text-sm ${textLink}`}>
          Why this number?
        </Link>
      </Card>

      {/* 2. Satellites */}
      <section aria-labelledby="sat" className="flex flex-col gap-4">
        <h2 id="sat" className="text-h2">
          Optional satellites
        </h2>
        <Card className="grid gap-6 sm:grid-cols-2">
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
            {sat.btc > 0 ? `${explainCrypto(t.finalEEE, sat.btc, sat.gold)}, because the plan keeps your total risk at ${formatRatio(t.finalEEE)}.` : 'Adding a satellite keeps your total risk the same, so the stock share goes down to make room.'}
          </p>
        </Card>
      </section>

      {/* 3. Target vs current */}
      <section aria-labelledby="tvc" className="flex flex-col gap-4">
        <h2 id="tvc" className="text-h2">
          Target vs current
        </h2>
        <Card className="space-y-4">
          <SleeveChart rows={rows} />
          <div>
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
          </div>
          <p className="text-xs text-muted">Target weights are a share of your invested amount ({money(F)}). A negative loan means borrowed money.</p>
        </Card>
      </section>

      {/* 4. Example products */}
      <section aria-labelledby="ex" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="ex" className="text-h2">
            Example products
          </h2>
          <IllustrativeBadge />
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

      {/* 5. Stress test */}
      <section aria-labelledby="stress" className="flex flex-col gap-4">
        <h2 id="stress" className="text-h2">
          Crash test: a 2008-style fall
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <StressTile title="Your portfolio today" s={stressNow} limit={p.maxLossMoney} />
          <StressTile title="With the target plan" s={stressTarget} limit={p.maxLossMoney} />
        </div>
      </section>

      {/* 6. Leverage panel */}
      {t.finalEEE > 1 && (
        <section aria-labelledby="lev" className="flex flex-col gap-4">
          <h2 id="lev" className="text-h2">
            Borrowing to invest
          </h2>
          <Card className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Stat label="Loan amount" value={money(loan.amount)} />
              <Stat label="Interest per year" value={money(loan.costPerYear)} note={`at ${formatPct(assumptions.cashNominal + assumptions.borrowSpread)}`} />
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
                      <div className="rounded-control border border-alert-line bg-alert-bg p-3.5 text-help text-panel">
                        <strong className="text-alert">Warning: </strong>
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
          </Card>
        </section>
      )}

      {/* 7. How to get there */}
      <section aria-labelledby="how" className="flex flex-col gap-4">
        <h2 id="how" className="text-h2">
          How to get there
        </h2>
        <Card className="space-y-4">
          <Explain>{explainNextSavings(monthlySavings(p), mostUnderweight(rows), currency)}</Explain>
          <div>
            <h3 className="font-semibold text-ink">Changes to make at your own broker</h3>
            {changes.length === 0 ? (
              <p className="mt-1 text-help text-ink-2">No change is larger than 2% of your invested amount.</p>
            ) : (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-help text-panel marker:text-lime">
                {changes.map((c) => (
                  <li key={c.sleeve}>{describeChange(c, currency)}</li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-muted">Educational example, not advice. This app never places orders.</p>
          </div>
        </Card>
      </section>
    </>
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

function StressTile({ title, s, limit }: { title: string; s: StressResult | null; limit: number }) {
  const { money } = useCurrency()
  if (!s)
    return (
      <Card>
        <h3 className="text-[13px] font-medium text-ink-2">{title}</h3>
        <p className="mt-2 text-help text-ink-2">
          Add your holdings on the{' '}
          <Link to="/portfolio" className={`underline underline-offset-2 ${textLink}`}>
            Portfolio
          </Link>{' '}
          page to compare.
        </p>
      </Card>
    )
  const ok = stressWithinLimit(s, limit)
  return (
    <Card className="space-y-1">
      <h3 className="text-[13px] font-medium text-ink-2">{title}</h3>
      <p className="text-card-num text-alert">−{money(Math.max(-s.money, 0))}</p>
      <p className="text-help text-ink-2">{formatPct(Math.max(-s.pct, 0))} of the portfolio</p>
      <p className={`text-help font-medium ${ok ? 'text-lime' : 'text-alert'}`}>
        {ok ? '✔ Within' : '✘ Above'} your limit of {money(limit)}
      </p>
    </Card>
  )
}
