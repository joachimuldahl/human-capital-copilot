import { useMemo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import AssetDonut from '../components/AssetDonut'
import Badge, { IllustrativeBadge } from '../components/Badge'
import Card from '../components/Card'
import Explain from '../components/Explain'
import RiskFitGauge from '../components/RiskFitGauge'
import SplitBars from '../components/SplitBars'
import Tabs from '../components/Tabs'
import { NumberField } from '../components/fields'
import { btnPrimary, btnSecondary, focusRing, pageWrap, textLink } from '../components/ui'
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
  currencySymbol,
  explainStress,
  explainStressLimit,
  exposures,
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
import { formatSourceDate, isIllustrative, PRODUCTS } from '../data/products'
import { QUICK_FIELDS } from '../data/quickEntry'
import { useActiveProfile, useCurrency } from '../store/hooks'
import { selectPortfolio, usePortfolioStore, type PortfolioSource } from '../store/portfolioStore'
import { useProfileStore } from '../store/profileStore'

const productLabel = (id: string) => PRODUCTS[id]?.ticker ?? PRODUCTS[id]?.name ?? id

export default function Portfolio() {
  const { active, profile, hasAnswers } = useActiveProfile()
  const source = usePortfolioStore((s) => s.source)
  const quick = usePortfolioStore((s) => s.quick)
  const { currency } = useCurrency()
  const portfolio = useMemo(() => selectPortfolio(active, { source, quick }, currency), [active, source, quick, currency])
  const isPersona = active !== 'mine'

  return (
    <div className={`${pageWrap} flex flex-col gap-6 pt-8 pb-20 sm:pt-12`}>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-[32px] font-semibold tracking-[-0.02em] sm:text-h1">Portfolio</h1>
        {portfolio.holdings.some((h) => isIllustrative(h.productId)) && <IllustrativeBadge />}
      </div>

      <SourceSelector personaName={isPersona ? PERSONAS[active].name : null} source={portfolio.source} story={isPersona ? DEMO_PORTFOLIOS[active].story : null} />

      {portfolio.source === 'quick' && <QuickEntry />}

      {!isPersona && !hasAnswers ? (
        <Card className="space-y-2">
          <p className="text-ink-2">
            To compare your portfolio with your Risk Capacity, first{' '}
            <Link to="/onboarding" className={`underline underline-offset-2 ${textLink}`}>
              answer the 16 questions
            </Link>
            , or pick a demo person in the menu above.
          </p>
        </Card>
      ) : portfolio.holdings.length === 0 ? (
        <Card>
          <p className="text-ink-2">Enter at least one amount above to see the analysis.</p>
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
  const { money, currency } = useCurrency()
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
  // Source footnotes (e.g. VWCE lists only its top 10 countries), one per ETF held.
  const regionNotes = [...new Set(holdings.map((h) => LOOKTHROUGH[h.productId]?.regionNote).filter((n): n is string => !!n))]

  return (
    <>
      {portfolioMismatch(total, profile.investableAssets) && (
        <MismatchBanner total={total} F={profile.investableAssets} canUpdate={!isPersona} />
      )}

      {/* Top row */}
      <section aria-label="Summary" className="grid gap-4 md:grid-cols-3">
        <Card className="flex flex-col gap-1">
          <h2 className="text-[13px] font-medium text-ink-2">Net worth in this portfolio</h2>
          <p className="text-card-num">{money(total)}</p>
          <p className="text-xs text-muted">
            {holdings.length} holdings in {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}
          </p>
        </Card>
        <Card className="flex flex-col gap-2">
          <h2 className="text-[13px] font-medium text-ink-2">Risk fit</h2>
          <RiskFitGauge actual={actual} target={target} status={fit.status} />
          <p className="text-[13px] text-ink-2">{explainRiskFit(actual, target, fit)}</p>
        </Card>
        <Card className="flex flex-col gap-2">
          <h2 className="text-[13px] font-medium text-ink-2">Crash test today</h2>
          <p className="text-card-num text-alert">−{money(Math.max(-stress.money, 0))}</p>
          <p className="text-help text-ink-2">{explainStress(stress, currency)}</p>
          <p className={`text-help font-medium ${ok ? 'text-lime' : 'text-alert'}`}>
            <span aria-hidden>{ok ? '✔ ' : '✘ '}</span>
            {explainStressLimit(stress, profile.maxLossMoney, currency)}
          </p>
        </Card>
      </section>

      {/* Accounts */}
      <section aria-labelledby="accounts" className="flex flex-col gap-4 pt-2">
        <h2 id="accounts" className="text-h2">
          Accounts and holdings
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {accounts.map((a) => {
            const rows = holdings.filter((h) => h.accountId === a.id)
            if (rows.length === 0) return null
            return (
              <Card key={a.id} className="space-y-2">
                <h3 className="font-semibold text-ink">{a.name}</h3>
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
                        <tr key={h.id} className="border-b border-line last:border-0">
                          <td className="py-2 pr-2">
                            <span className="block text-ink">{p.name}</span>
                            <span className="block text-xs text-muted">
                              {p.ticker ?? 'Ticker to verify'}
                              {p.source ? ` · factsheet ${formatSourceDate(p.source.asOf)}` : isIllustrative(p.id) ? ' · illustrative' : ''}
                            </span>
                          </td>
                          <td className="py-2 text-right tabular-nums">{money(h.valueEUR)}</td>
                          <td className="w-16 py-2 text-right tabular-nums text-ink-2">{formatPct(shares[h.id])}</td>
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
      <section aria-labelledby="look" className="flex flex-col gap-4 pt-2">
        <h2 id="look" className="text-h2">
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
                  <Panel caption={explainRegions(lt.regions)} note={['Stocks only, looking through your ETFs.', ...regionNotes].join(' ')}>
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
                          <li key={s.securityId} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line pb-2 text-help last:border-0">
                            <span className="flex items-baseline gap-2">
                              <span className="w-5 text-right text-muted">{i + 1}.</span>
                              <span className="font-medium text-ink">{s.name}</span>
                              {level && <Badge tone={level === 'alert' ? 'alert' : 'warning'}>{level === 'alert' ? 'Over 10%' : 'Over 5%'}</Badge>}
                            </span>
                            <span className="tabular-nums font-semibold">{formatPct(s.share)}</span>
                            {level && <span className="w-full pl-7 text-xs text-ink-2">{explainConcentration({ ...s, level })}</span>}
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
                      <ul className="space-y-2 text-help">
                        {pairs.map((p) => (
                          <li key={`${p.a}-${p.b}`} className="flex justify-between gap-3 border-b border-line pb-2 last:border-0">
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
        <Link to="/plan" className={btnPrimary}>
          See my plan
        </Link>
        <Link to="/results" className={btnSecondary}>
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
          <strong className="font-semibold text-ink">What this means: </strong>
          {caption}
        </Explain>
        {note && <p className="text-xs text-muted">{note}</p>}
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
      <legend className="mb-2 text-label">Portfolio source</legend>
      <div className="flex flex-col gap-2 sm:flex-row">
        {options.map((o) => (
          <label
            key={o.value}
            className={`flex items-center gap-2.5 rounded-control border px-4 py-3 text-help has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-lime ${
              o.disabled ? 'cursor-not-allowed text-muted' : 'cursor-pointer'
            } ${source === o.value ? 'border-lime bg-lime-tint font-medium text-ink' : 'border-line bg-surface'}`}
          >
            <input type="radio" name="source" value={o.value} checked={source === o.value} disabled={o.disabled} onChange={() => setSource(o.value)} className="accent-lime" />
            {o.label}
          </label>
        ))}
      </div>
      {source === 'demo' && story && <p className="text-[13px] text-muted">What this portfolio shows: {story}.</p>}
    </fieldset>
  )
}

function QuickEntry() {
  const quick = usePortfolioStore((s) => s.quick)
  const setQuickValue = usePortfolioStore((s) => s.setQuickValue)
  const resetQuick = usePortfolioStore((s) => s.resetQuick)
  const { currency } = useCurrency()
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-h2">Quick entry</h2>
        <button type="button" onClick={resetQuick} className={`text-sm underline underline-offset-2 ${textLink}`}>
          Clear all
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_FIELDS.map((f) => (
          <div key={f.key} className="space-y-1">
            <label htmlFor={`quick-${f.key}`} className="text-help font-medium text-ink-2">
              {f.label}
            </label>
            <NumberField id={`quick-${f.key}`} value={quick[f.key]} onChange={(v) => setQuickValue(f.key, v)} min={0} max={100_000_000} step={100} prefix={currencySymbol(currency)} money />
          </div>
        ))}
      </div>
      <p className="text-xs text-muted">Each amount is analysed as one example product (for example, global equity = VWCE).</p>
    </Card>
  )
}

function MismatchBanner({ total, F, canUpdate }: { total: number; F: number; canUpdate: boolean }) {
  const setAnswer = useProfileStore((s) => s.setAnswer)
  const { money } = useCurrency()
  return (
    <div role="status" className="flex flex-col gap-3 rounded-card border border-warn-line bg-warn-bg p-4 text-help sm:p-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-panel">
        This portfolio adds up to <strong>{money(total)}</strong>, but your profile says you have <strong>{money(F)}</strong> invested. Your Risk
        Capacity is based on the profile amount.
        {!canUpdate && ' Demo people keep their own amount; switch to "Me" to use yours.'}
      </p>
      {canUpdate && (
        <button
          type="button"
          onClick={() => setAnswer('investableAssets', total)}
          className={`shrink-0 rounded-control bg-warn px-4 py-2.5 font-semibold text-on-lime hover:brightness-110 ${focusRing}`}
        >
          Use {money(total)} as my invested amount
        </button>
      )}
    </div>
  )
}
