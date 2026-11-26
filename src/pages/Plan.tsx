import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AssumptionsDialog from '../components/AssumptionsDialog'
import { IllustrativeBadge } from '../components/Badge'
import Card from '../components/Card'
import Explain from '../components/Explain'
import PersonaSwitcher from '../components/PersonaSwitcher'
import ProductCard from '../components/ProductCard'
import SleeveChart from '../components/SleeveChart'
import Tabs from '../components/Tabs'
import { SliderField } from '../components/fields'
import {
  SLEEVE_LABEL,
  assetClassValues,
  describeChange,
  explainCrypto,
  explainLetfDrag,
  explainMarginBuffer,
  explainNextSavings,
  exposures,
  formatEUR,
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
import { useActiveProfile } from '../store/hooks'
import { selectPortfolio, usePortfolioStore } from '../store/portfolioStore'

export default function Plan() {
  const { active, profile, hasAnswers } = useActiveProfile()
  const source = usePortfolioStore((s) => s.source)
  const quick = usePortfolioStore((s) => s.quick)
  const holdings = useMemo(() => selectPortfolio(active, { source, quick }).holdings, [active, source, quick])
  const [sat, setSat] = useState({ gold: 0, btc: 0 })
  const isPersona = active !== 'mine'

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{isPersona ? `${PERSONAS[active].name}'s plan` : 'Your plan'}</h1>
          <AssumptionsDialog />
        </div>
        <PersonaSwitcher />
      </div>

      {!isPersona && !hasAnswers ? (
        <Card className="space-y-2">
          <p className="text-slate-700">
            Your plan is built from your answers.{' '}
            <Link to="/onboarding" className="font-medium text-accent-700 underline">
              Answer the 16 questions
            </Link>{' '}
            first, or pick a demo person above.
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
              <div key={g} className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Do this first</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">{c.title}</h2>
                <p className="mt-1 text-sm text-slate-700">{c.text}</p>
              </div>
            )
          })}
        </section>
      )}

      <Card className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-slate-700">
          Target Risk Capacity: <strong className="text-xl tabular-nums text-slate-900">{formatRatio(t.finalEEE)}</strong>
        </p>
        <Link to="/results" className="text-sm font-medium text-accent-700 underline">
          Why this number?
        </Link>
      </Card>

      {/* 2. Satellites */}
      <section aria-labelledby="sat" className="space-y-3">
        <h2 id="sat" className="text-lg font-semibold">
          Optional satellites
        </h2>
        <Card className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="sat-gold" className="text-sm font-medium">
              Gold
            </label>
            <SliderField id="sat-gold" min={0} max={10} step={1} value={Math.round(sat.gold * 100)} onChange={(v) => setSat({ ...sat, gold: v / 100 })} display={formatPct(sat.gold)} />
          </div>
          <div className="space-y-2">
            <label htmlFor="sat-btc" className="text-sm font-medium">
              Crypto (Bitcoin)
            </label>
            <SliderField id="sat-btc" min={0} max={10} step={1} value={Math.round(sat.btc * 100)} onChange={(v) => setSat({ ...sat, btc: v / 100 })} display={formatPct(sat.btc)} />
          </div>
          <p className="text-sm text-slate-700 sm:col-span-2">
            {sat.btc > 0 ? `${explainCrypto(t.finalEEE, sat.btc, sat.gold)}, because the plan keeps your total risk at ${formatRatio(t.finalEEE)}.` : 'Adding a satellite keeps your total risk the same, so the stock share goes down to make room.'}
          </p>
        </Card>
      </section>

      {/* 3. Target vs current */}
      <section aria-labelledby="tvc" className="space-y-3">
        <h2 id="tvc" className="text-lg font-semibold">
          Target vs current
        </h2>
        <Card className="space-y-4">
          <SleeveChart rows={rows} />
          <div>
            <table className="w-full text-xs sm:text-sm">
              <caption className="sr-only">Target and current weight per sleeve</caption>
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
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
                    <span className="sr-only">Target in euro</span>
                    <span aria-hidden>€</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.sleeve} className="border-b border-slate-100 last:border-0">
                    <th scope="row" className="py-2 text-left font-normal text-slate-800">
                      {SLEEVE_LABEL[r.sleeve]}
                    </th>
                    <td className="py-2 pl-3 text-right tabular-nums text-slate-600">{formatPct(r.currentShare)}</td>
                    <td className="py-2 pl-3 text-right tabular-nums font-semibold">{formatPct(r.targetShare)}</td>
                    <td className="py-2 pl-3 text-right tabular-nums">{formatEUR(r.targetEUR)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500">Target weights are a share of your invested amount ({formatEUR(F)}). A negative loan means borrowed money.</p>
        </Card>
      </section>

      {/* 4. Example products */}
      <section aria-labelledby="ex" className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="ex" className="text-lg font-semibold">
            Example products
          </h2>
          <IllustrativeBadge />
        </div>
        <div className="space-y-5">
          {shownSleeves.map((r) => (
            <div key={r.sleeve} className="space-y-2">
              <h3 className="text-sm font-medium text-slate-700">
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
      <section aria-labelledby="stress" className="space-y-3">
        <h2 id="stress" className="text-lg font-semibold">
          Crash test: a 2008-style fall
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <StressTile title="Your portfolio today" s={stressNow} limit={p.maxLossMoney} />
          <StressTile title="With the target plan" s={stressTarget} limit={p.maxLossMoney} />
        </div>
      </section>

      {/* 6. Leverage panel */}
      {t.finalEEE > 1 && (
        <section aria-labelledby="lev" className="space-y-3">
          <h2 id="lev" className="text-lg font-semibold">
            Borrowing to invest
          </h2>
          <Card className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Stat label="Loan amount" value={formatEUR(loan.amount)} />
              <Stat label="Interest per year" value={formatEUR(loan.costPerYear)} note={`at ${formatPct(assumptions.cashNominal + assumptions.borrowSpread)}`} />
              <Stat label="Margin buffer" value={buffer === null ? '—' : formatPct(buffer)} note={buffer === null ? undefined : explainMarginBuffer(buffer)} />
            </div>
            <Tabs
              label="How to borrow"
              tabs={[
                {
                  id: 'loan',
                  label: 'Broker loan (recommended)',
                  content: (
                    <p className="text-sm text-slate-700">
                      Borrow {formatEUR(loan.amount)} from your broker against your portfolio and invest it in the same global stock fund. You pay interest of about {formatEUR(loan.costPerYear)} a year. If stocks fall a lot, the broker can ask for more collateral or sell your holdings (a margin call): {buffer === null ? '' : explainMarginBuffer(buffer).toLowerCase()}
                    </p>
                  ),
                },
                {
                  id: 'letf',
                  label: 'Leveraged ETF (alternative)',
                  content: (
                    <div className="space-y-3">
                      <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                        <strong>Warning: </strong>
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
      <section aria-labelledby="how" className="space-y-3">
        <h2 id="how" className="text-lg font-semibold">
          How to get there
        </h2>
        <Card className="space-y-4">
          <Explain>{explainNextSavings(monthlySavings(p), mostUnderweight(rows))}</Explain>
          <div>
            <h3 className="font-medium">Changes to make at your own broker</h3>
            {changes.length === 0 ? (
              <p className="mt-1 text-sm text-slate-600">No change is larger than 2% of your invested amount.</p>
            ) : (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {changes.map((c) => (
                  <li key={c.sleeve}>{describeChange(c)}</li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-slate-500">Educational example, not advice. This app never places orders.</p>
          </div>
        </Card>
      </section>
    </>
  )
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div>
      <p className="text-sm text-slate-600">{label}</p>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      {note && <p className="text-xs text-slate-500">{note}</p>}
    </div>
  )
}

function StressTile({ title, s, limit }: { title: string; s: StressResult | null; limit: number }) {
  if (!s)
    return (
      <Card>
        <h3 className="text-sm font-medium text-slate-600">{title}</h3>
        <p className="mt-2 text-sm text-slate-600">
          Add your holdings on the{' '}
          <Link to="/portfolio" className="text-accent-700 underline">
            Portfolio
          </Link>{' '}
          page to compare.
        </p>
      </Card>
    )
  const ok = stressWithinLimit(s, limit)
  return (
    <Card className="space-y-1">
      <h3 className="text-sm font-medium text-slate-600">{title}</h3>
      <p className="text-3xl font-semibold tabular-nums text-red-700">−{formatEUR(Math.max(-s.money, 0))}</p>
      <p className="text-sm text-slate-600">{formatPct(Math.max(-s.pct, 0))} of the portfolio</p>
      <p className={`text-sm font-medium ${ok ? 'text-emerald-800' : 'text-red-800'}`}>
        {ok ? '✔ Within' : '✘ Above'} your limit of {formatEUR(limit)}
      </p>
    </Card>
  )
}
