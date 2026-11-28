import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import Badge, { IllustrativeBadge } from '../components/Badge'
import Card from '../components/Card'
import GlideChart from '../components/GlideChart'
import RiskGauge from '../components/RiskGauge'
import PersonaCards from '../components/PersonaCards'
import StatTile from '../components/StatTile'
import { SliderField } from '../components/fields'
import { btnPrimary, btnSecondary, card, pageWrap, textLink } from '../components/ui'
import {
  BAND_LABEL,
  BINDING_LABEL,
  incomeTypeTitle,
  crashCost,
  explainBinding,
  explainCrashCost,
  explainHumanCapital,
  explainIncomeType,
  formatPct,
  formatWealthShare,
  formatRatio,
  glidePath,
  limitRows,
  loanAmount,
  maxLossRange,
  modelBeforeLimitsSentence,
  rawEEELabel,
  riskAttitudeLine,
  riskSentence,
  targetEEE,
  type Profile,
} from '../engine'
import { PERSONAS } from '../data/personas'
import { borrowingNote, useActivePortfolioRisk, useActiveProfile, useCurrency } from '../store/hooks'
import { useProfileStore } from '../store/profileStore'

type WhatIf = Partial<Pick<Profile, 'savingsRate' | 'maxLossMoney'>>

export default function Results() {
  const { active, profile: saved, hasAnswers } = useActiveProfile()
  const { currency, money } = useCurrency()
  const lossIsDefault = useProfileStore((s) => active === 'mine' && s.answers.maxLossMoney === undefined)
  const borrowChoice = useProfileStore((s) => (active === 'mine' ? s.borrowChoice : undefined))
  const [whatIf, setWhatIf] = useState<WhatIf>({})
  const [whatIfFor, setWhatIfFor] = useState(active)
  // What-if values belong to one profile: drop them when the user switches persona.
  if (whatIfFor !== active) {
    setWhatIfFor(active)
    setWhatIf({})
  }

  const profile = useMemo(() => ({ ...saved, ...whatIf }), [saved, whatIf])
  const t = useMemo(() => targetEEE(profile), [profile])
  const path = useMemo(() => glidePath(profile), [profile])
  const risk = useActivePortfolioRisk(t.finalEEE)
  const whatIfOn = Object.keys(whatIf).length > 0
  const isPersona = active !== 'mine'

  if (!isPersona && !hasAnswers) {
    return (
      <div className={`${pageWrap} flex flex-col gap-8 pt-12 pb-20`}>
        <h1 className="sr-only">Results</h1>
        <Card className="flex flex-col items-start gap-4 rounded-hero sm:p-10">
          <h2 className="font-display text-[28px] font-semibold tracking-[-0.02em]">No answers yet</h2>
          <p className="max-w-[560px] text-ink-2">Answer 16 short questions to see your own Risk Capacity, or look at one of the demo people below.</p>
          <Link to="/onboarding" className={btnPrimary}>
            Start (3 minutes)
          </Link>
        </Card>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-h2">Try a demo person</h2>
            <IllustrativeBadge />
          </div>
          <PersonaCards />
        </div>
      </div>
    )
  }

  const F = profile.investableAssets
  const fShare = 1 - t.hcRatio
  const name = isPersona ? PERSONAS[active].name : null
  const loan = loanAmount(t.finalEEE, F)
  const atCap = t.binding !== 'model' && t.binding !== 'floor'
  // Slider: 0 to the largest loss possible at the 1.5× cap (0.75 · F), at least 500 in the chosen currency.
  const lossRange = maxLossRange(F)

  return (
    <div className={`${pageWrap} flex flex-col gap-6 pt-8 pb-20 sm:pt-12`}>
      <h1 className="sr-only">Results</h1>

      {/* 1. Hero */}
      <section aria-labelledby="hero" className={`${card} flex flex-wrap items-center gap-10 rounded-hero p-6 sm:p-10`}>
        <div className="flex flex-[1_1_280px] justify-center">
          <RiskGauge value={t.finalEEE} width={320} stroke={18} label={`Risk Capacity ${formatRatio(t.finalEEE)}: ${BINDING_LABEL[t.binding]}`} />
        </div>
        <div className="flex min-w-0 flex-[999_1_440px] flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="hero" className="text-label">
              {name ? `${name}'s Risk Capacity` : 'Your Risk Capacity'}
            </h2>
            {isPersona && <IllustrativeBadge />}
            {whatIfOn && <Badge tone="warning">What-if</Badge>}
          </div>
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <p className="text-[64px] leading-[0.95] font-semibold tracking-[-0.04em] font-display sm:text-display-xl">{formatRatio(t.finalEEE)}</p>
            <p className="text-lg text-ink-2">{riskSentence(t.finalEEE)}</p>
          </div>
          <Badge tone="accent" className="self-start px-3 py-1.5 text-[13px]">
            <ShieldCheck size={14} strokeWidth={2.25} aria-hidden />
            {BINDING_LABEL[t.binding]}
          </Badge>
          <p className="max-w-[620px] text-base leading-relaxed text-panel">
            {explainBinding(t, profile, { lossIsDefault, currency, borrowing: active === 'mine' ? borrowingNote(profile, borrowChoice) : undefined })}
            {atCap && ` ${modelBeforeLimitsSentence(t.rawEEE)}`}
            {loan > 0 && ` In practice: stock exposure of ${formatRatio(t.finalEEE)}, using a broker loan of about ${money(loan)}.`}
          </p>
        </div>
      </section>

      {/* 2. Drivers */}
      <section aria-labelledby="drivers">
        <h2 id="drivers" className="sr-only">
          What drives your number
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile title="Risk attitude" value={BAND_LABEL[t.band]}>
            Your answers suggest you would {riskAttitudeLine(t)}.
          </StatTile>
          <StatTile title="Human capital" value={formatWealthShare(t.hcRatio, F)} footnote={`Present value of all future earnings: ${money(t.pvEarnings)}`}>
            {explainHumanCapital(t, currency, F)}
          </StatTile>
          <StatTile title="Income type" value={incomeTypeTitle(t.betaH)}>
            {explainIncomeType(t.betaH)}
          </StatTile>
          <Card className="flex flex-col gap-2.5">
            <h3 className="text-[13px] font-medium text-ink-2">Limits checked</h3>
            <ul className="flex flex-col gap-2 text-help">
              {limitRows(t, profile, currency).map((r) => (
                <li key={r.id} className={`flex justify-between gap-3 ${r.binding ? 'font-semibold text-lime' : 'text-ink-2'}`}>
                  <span>{r.label}</span>
                  <span className={`text-right tabular-nums ${r.binding ? '' : 'text-ink'}`}>{r.value}</span>
                </li>
              ))}
            </ul>
            <p className="mt-auto text-xs text-muted">Model result before limits: {rawEEELabel(t.rawEEE)}</p>
          </Card>
        </div>
      </section>

      {/* 3. Glide path + 4. lifetime balance sheet */}
      <section className="flex flex-wrap gap-4">
        <Card className="flex min-w-0 flex-[999_1_560px] flex-col gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-h2">Your glide path</h2>
            <span className="text-[13px] text-muted">Recalculated each year as you save and age</span>
          </div>
          <GlideChart points={path} currentAge={profile.age} />
        </Card>

        <Card className="flex flex-[1_1_320px] flex-col gap-[18px]">
          <h2 className="text-h2">Lifetime balance sheet</h2>
          <div
            className="flex h-3.5 overflow-hidden rounded-full bg-line"
            role="img"
            aria-label={`Invested today ${money(F)} (${formatPct(fShare)}), future savings ${money(t.pvfs)} (${formatWealthShare(t.hcRatio, F)}).`}
          >
            <div className="bg-lime" style={{ width: `${Math.max(fShare * 100, 1)}%` }} />
            <div className="flex-1 bg-sky" />
          </div>
          <dl className="flex flex-col gap-2.5 text-help">
            <div className="flex justify-between gap-3">
              <dt className="flex items-center gap-2 text-ink-2">
                <span className="h-2.5 w-2.5 rounded-[3px] bg-lime" aria-hidden />
                Invested today ({formatPct(fShare)})
              </dt>
              <dd className="font-semibold">{money(F)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="flex items-center gap-2 text-ink-2">
                <span className="h-2.5 w-2.5 rounded-[3px] bg-sky" aria-hidden />
                Future savings ({formatWealthShare(t.hcRatio, F)})
              </dt>
              <dd className="font-semibold">{money(t.pvfs)}</dd>
            </div>
          </dl>
          <div className="h-px bg-line" />
          {risk ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[13px] text-ink-2">{name ? `${name}'s portfolio today` : 'Your portfolio today'}</span>
                <span className={`font-display text-[26px] font-semibold ${risk.fit.status === 'On target' ? 'text-lime' : 'text-warn'}`}>{formatRatio(risk.actual)}</span>
              </div>
              <Badge tone={risk.fit.status === 'On target' ? 'success' : 'warning'}>{risk.fit.status}</Badge>
            </div>
          ) : (
            <p className="text-help text-ink-2">Add your portfolio to see how much risk it carries today.</p>
          )}
          <div className="mt-auto flex flex-col gap-2.5">
            <Link to="/plan" className={`${btnPrimary} px-4 py-3 text-sm`}>
              See my plan
            </Link>
            <Link to="/portfolio" className={`${btnSecondary} px-4 py-3 text-sm`}>
              Compare with my portfolio
            </Link>
          </div>
        </Card>
      </section>

      {/* 5. What-if */}
      <Card className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-h2">What if…</h2>
          <button type="button" onClick={() => setWhatIf({})} disabled={!whatIfOn} className={`text-sm disabled:text-muted ${textLink}`}>
            Reset
          </button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="wi-sav" className="text-help font-medium">
              Share of income you invest
            </label>
            <SliderField id="wi-sav" min={0} max={40} step={1} value={Math.round(profile.savingsRate * 100)} onChange={(v) => setWhatIf((w) => ({ ...w, savingsRate: v / 100 }))} display={formatPct(profile.savingsRate)} />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="wi-loss" className="text-help font-medium">
              Max loss in a bad year
            </label>
            <SliderField
              id="wi-loss"
              min={lossRange.min}
              max={lossRange.max}
              step={Math.max(1, Math.round(lossRange.max / 100))}
              value={Math.min(profile.maxLossMoney, lossRange.max)}
              onChange={(v) => setWhatIf((w) => ({ ...w, maxLossMoney: v }))}
              display={money(profile.maxLossMoney)}
              minLabel={money(lossRange.min)}
              maxLabel={money(lossRange.max)}
              hint={explainCrashCost(crashCost(t.finalEEE, F), currency)}
            />
          </div>
        </div>
        <p className="text-xs text-muted">Try changes here without saving them. The whole page updates.</p>
      </Card>
    </div>
  )
}
