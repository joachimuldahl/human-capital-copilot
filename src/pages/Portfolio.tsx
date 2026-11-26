import { useMemo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import AssetDonut from '../components/AssetDonut'
import Badge, { IllustrativeBadge } from '../components/Badge'
import Card from '../components/Card'
import Explain from '../components/Explain'
import PersonaSwitcher from '../components/PersonaSwitcher'
import RiskFitGauge from '../components/RiskFitGauge'
import SplitBars from '../components/SplitBars'
import Tabs from '../components/Tabs'
import { NumberField } from '../components/fields'
import {
  assetClassValues,
  concentrationFlags,
  explainAssetClasses,
  explainConcentration,
  explainConcentrationSummary,
  explainOverlap,
  explainRegions,
  explainRiskFit,
  explainSectors,
  explainStress,
  explainStressLimit,
  exposures,
  formatEUR,
  formatPct,
  formatRatio,
  lookThrough,
  netWorth,
  overlapPairs,
  portfolioEEE,
  portfolioMismatch,
  riskFit,
  stressLoss,
  stressWithinLimit,
  targetEEE,
  holdingShares,
  type Account,
  type Holding,
  type Profile,
} from '../engine'
import { DEMO_PORTFOLIOS } from '../data/demoPortfolios'
import { LOOKTHROUGH } from '../data/lookthrough'
import { PERSONAS } from '../data/personas'
import { PRODUCTS } from '../data/products'
import { QUICK_FIELDS } from '../data/quickEntry'
import { useActiveProfile } from '../store/hooks'
import { selectPortfolio, usePortfolioStore, type PortfolioSource } from '../store/portfolioStore'
import { useProfileStore } from '../store/profileStore'

const productLabel = (id: string) => PRODUCTS[id]?.ticker ?? PRODUCTS[id]?.name ?? id

export default function Portfolio() {
  const { active, profile, hasAnswers } = useActiveProfile()
  const source = usePortfolioStore((s) => s.source)
  const quick = usePortfolioStore((s) => s.quick)
  const portfolio = useMemo(() => selectPortfolio(active, { source, quick }), [active, source, quick])
  const isPersona = active !== 'mine'

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-page-title">Portfolio</h1>
          <IllustrativeBadge />
        </div>
        <PersonaSwitcher />
      </div>

      <SourceSelector personaName={isPersona ? PERSONAS[active].name : null} source={portfolio.source} story={isPersona ? DEMO_PORTFOLIOS[active].story : null} />

      {portfolio.source === 'quick' && <QuickEntry />}

      {!isPersona && !hasAnswers ? (
        <Card className="space-y-2">
          <p className="text-slate-700">
            To compare your portfolio with your Risk Capacity, first{' '}
            <Link to="/onboarding" className="font-medium text-accent-700 underline">
              answer the 16 questions
            </Link>
            , or pick a demo person above.
          </p>
        </Card>
      ) : portfolio.holdings.length === 0 ? (
        <Card>
          <p className="text-slate-700">Enter at least one amount above to see the analysis.</p>
        </Card>
      ) : (
        <Analysis holdings={portfolio.holdings} accounts={portfolio.accounts} profile={profile} isPersona={isPersona} />
      )}
    </div>
  )
}

interface AnalysisProps {
  holdings: Holding[]
  accounts: Account[]
  profile: Profile
  isPersona: boolean
}

function Analysis({ holdings, accounts, profile, isPersona }: AnalysisProps) {
  const total = netWorth(holdings)
  const shares = holdingShares(holdings)
  const x = exposures(holdings, PRODUCTS)
  const actual = portfolioEEE(x)
  const target = targetEEE(profile).finalEEE
  const fit = riskFit(actual, target)
  const stress = stressLoss(x, total)
  const ok = stressWithinLimit(stress, profile.maxLossMoney)
  const lt = lookThrough(holdings, PRODUCTS, LOOKTHROUGH)
  const flags = concentrationFlags(lt.securities)
  const flagOf = new Map(flags.map((f) => [f.securityId, f.level]))
  const classes = assetClassValues(holdings, PRODUCTS)
  const pairs = overlapPairs(holdings, LOOKTHROUGH)

  return (
    <>
      {portfolioMismatch(total, profile.investableAssets) && (
        <MismatchBanner total={total} F={profile.investableAssets} canUpdate={!isPersona} />
      )}

      {/* Top row */}
      <section aria-label="Summary" className="grid gap-4 md:grid-cols-3">
        <Card className="flex flex-col gap-1">
          <h2 className="text-sm font-medium text-slate-600">Net worth in this portfolio</h2>
          <p className="text-[28px] font-semibold leading-tight">{formatEUR(total)}</p>
          <p className="text-xs text-slate-500">
            {holdings.length} holdings in {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}
          </p>
        </Card>
        <Card className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-slate-600">Risk fit</h2>
          <RiskFitGauge actual={actual} target={target} status={fit.status} />
          <p className="text-xs text-slate-600">{explainRiskFit(actual, target, fit)}</p>
        </Card>
        <Card className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-slate-600">Crash test today</h2>
          <p className="text-[28px] font-semibold leading-tight text-alert">−{formatEUR(Math.max(-stress.money, 0))}</p>
          <p className="text-sm text-slate-700">{explainStress(stress)}</p>
          <p className={`text-sm font-medium ${ok ? 'text-emerald-800' : 'text-red-800'}`}>
            <span aria-hidden>{ok ? '✔ ' : '✘ '}</span>
            {explainStressLimit(stress, profile.maxLossMoney)}
          </p>
        </Card>
      </section>

      {/* Accounts */}
      <section aria-labelledby="accounts" className="space-y-3">
        <h2 id="accounts" className="text-lg font-semibold">
          Accounts and holdings
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {accounts.map((a) => {
            const rows = holdings.filter((h) => h.accountId === a.id)
            if (rows.length === 0) return null
            return (
              <Card key={a.id} className="space-y-2">
                <h3 className="font-semibold">{a.name}</h3>
                <table className="w-full text-sm">
                  <thead className="sr-only">
                    <tr>
                      <th>Holding</th>
                      <th>Value</th>
                      <th>Share of total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((h) => {
                      const p = PRODUCTS[h.productId]
                      return (
                        <tr key={h.id} className="border-b border-slate-100 last:border-0">
                          <td className="py-2 pr-2">
                            <span className="block text-slate-900">{p.name}</span>
                            <span className="block text-xs text-slate-500">{p.ticker ?? 'Ticker to verify'}</span>
                          </td>
                          <td className="py-2 text-right tabular-nums">{formatEUR(h.valueEUR)}</td>
                          <td className="w-16 py-2 text-right tabular-nums text-slate-600">{formatPct(shares[h.id])}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Tabs */}
      <section aria-labelledby="look" className="space-y-3">
        <h2 id="look" className="text-lg font-semibold">
          What you really own
        </h2>
        <Card>
          <Tabs
            label="Portfolio breakdown"
            tabs={[
              {
                id: 'class',
                label: 'Asset class',
                content: (
                  <Panel caption={explainAssetClasses(classes)}>
                    <AssetDonut values={classes} />
                  </Panel>
                ),
              },
              {
                id: 'region',
                label: 'Region',
                content: (
                  <Panel caption={explainRegions(lt.regions)} note="Stocks only, looking through your ETFs.">
                    <SplitBars items={lt.regions} label="Stocks by region" />
                  </Panel>
                ),
              },
              {
                id: 'sector',
                label: 'Sector',
                content: (
                  <Panel caption={explainSectors(lt.sectors, profile.sector)} note="Stocks only, looking through your ETFs.">
                    <SplitBars items={lt.sectors} label="Stocks by sector" />
                  </Panel>
                ),
              },
              {
                id: 'concentration',
                label: 'Concentration',
                content: (
                  <Panel caption={explainConcentrationSummary(flags)} note="Top 10 companies, counting direct shares and what your ETFs hold (based on top holdings).">
                    <ol className="space-y-2">
                      {lt.securities.slice(0, 10).map((s, i) => {
                        const level = flagOf.get(s.securityId)
                        return (
                          <li key={s.securityId} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-slate-100 pb-2 text-sm last:border-0">
                            <span className="flex items-baseline gap-2">
                              <span className="w-5 text-right text-slate-400">{i + 1}.</span>
                              <span className="font-medium text-slate-900">{s.name}</span>
                              {level && <Badge tone={level === 'alert' ? 'alert' : 'warning'}>{level === 'alert' ? 'Over 10%' : 'Over 5%'}</Badge>}
                            </span>
                            <span className="tabular-nums font-semibold">{formatPct(s.share)}</span>
                            {level && <span className="w-full pl-7 text-xs text-slate-600">{explainConcentration({ ...s, level })}</span>}
                          </li>
                        )
                      })}
                    </ol>
                  </Panel>
                ),
              },
              {
                id: 'overlap',
                label: 'Overlap',
                content: (
                  <Panel caption={explainOverlap(pairs, productLabel)} note="Based on top holdings.">
                    {pairs.length > 0 && (
                      <ul className="space-y-2 text-sm">
                        {pairs.map((p) => (
                          <li key={`${p.a}-${p.b}`} className="flex justify-between gap-3 border-b border-slate-100 pb-2 last:border-0">
                            <span>
                              {productLabel(p.a)} + {productLabel(p.b)}
                            </span>
                            <span className="tabular-nums font-semibold">{formatPct(p.overlap)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Panel>
                ),
              },
            ]}
          />
        </Card>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link to="/plan" className="inline-flex h-10 items-center justify-center rounded-lg bg-accent-700 px-4 text-sm font-semibold text-white hover:bg-accent-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-700">
          See my plan
        </Link>
        <Link to="/results" className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-700">
          Back to results ({formatRatio(target)})
        </Link>
      </div>
    </>
  )
}

function Panel({ caption, note, children }: { caption: string; note?: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      {children}
      <div className="space-y-1">
        <Explain>
          <strong className="font-semibold">What this means: </strong>
          {caption}
        </Explain>
        {note && <p className="text-xs text-slate-500">{note}</p>}
      </div>
    </div>
  )
}

function SourceSelector({ personaName, source, story }: { personaName: string | null; source: PortfolioSource; story: string | null }) {
  const setSource = usePortfolioStore((s) => s.setSource)
  const options: { value: PortfolioSource; label: string; disabled: boolean }[] = [
    { value: 'demo', label: personaName ? `${personaName}'s demo portfolio` : 'Demo portfolio (pick a demo person)', disabled: !personaName },
    { value: 'quick', label: 'Quick entry (my own amounts)', disabled: false },
  ]
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-slate-700">Portfolio source</legend>
      <div className="flex flex-col gap-2 sm:flex-row">
        {options.map((o) => (
          <label
            key={o.value}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm focus-within:ring-2 focus-within:ring-accent-600 ${
              o.disabled ? 'cursor-not-allowed border-slate-200 text-slate-400' : 'cursor-pointer'
            } ${source === o.value ? 'border-accent-600 bg-accent-50 font-medium' : 'border-slate-200 bg-white'}`}
          >
            <input type="radio" name="source" value={o.value} checked={source === o.value} disabled={o.disabled} onChange={() => setSource(o.value)} className="accent-accent-700" />
            {o.label}
          </label>
        ))}
      </div>
      {source === 'demo' && story && <p className="text-xs text-slate-500">What this portfolio shows: {story}.</p>}
    </fieldset>
  )
}

function QuickEntry() {
  const quick = usePortfolioStore((s) => s.quick)
  const setQuickValue = usePortfolioStore((s) => s.setQuickValue)
  const resetQuick = usePortfolioStore((s) => s.resetQuick)
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold">Quick entry</h2>
        <button type="button" onClick={resetQuick} className="text-sm font-medium text-accent-700 underline focus-visible:outline-2 focus-visible:outline-accent-700">
          Clear all
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_FIELDS.map((f) => (
          <div key={f.key} className="space-y-1">
            <label htmlFor={`quick-${f.key}`} className="text-sm font-medium text-slate-700">
              {f.label}
            </label>
            <NumberField id={`quick-${f.key}`} value={quick[f.key]} onChange={(v) => setQuickValue(f.key, v)} min={0} max={100_000_000} step={100} prefix="€" />
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500">Each amount is analysed as one example product (for example, global equity = VWCE).</p>
    </Card>
  )
}

function MismatchBanner({ total, F, canUpdate }: { total: number; F: number; canUpdate: boolean }) {
  const setAnswer = useProfileStore((s) => s.setAnswer)
  return (
    <div role="status" className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-warning-bg p-4 text-help sm:flex-row sm:items-center sm:justify-between">
      <p className="text-slate-800">
        This portfolio adds up to <strong>{formatEUR(total)}</strong>, but your profile says you have <strong>{formatEUR(F)}</strong> invested. Your Risk
        Capacity is based on the profile amount.
        {!canUpdate && ' Demo people keep their own amount; switch to "My answers" to use yours.'}
      </p>
      {canUpdate && (
        <button
          type="button"
          onClick={() => setAnswer('investableAssets', total)}
          className="shrink-0 rounded-xl bg-amber-600 px-4 py-2 font-semibold text-white hover:bg-amber-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
        >
          Use {formatEUR(total)} as my invested amount
        </button>
      )}
    </div>
  )
}
