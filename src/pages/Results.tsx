import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge, { IllustrativeBadge } from '../components/Badge'
import Card from '../components/Card'
import Explain from '../components/Explain'
import GlideChart from '../components/GlideChart'
import RiskGauge from '../components/RiskGauge'
import PersonaCards from '../components/PersonaCards'
import PersonaSwitcher from '../components/PersonaSwitcher'
import StatTile from '../components/StatTile'
import { SliderField } from '../components/fields'
import {
  BAND_LABEL,
  BINDING_LABEL,
  CAP_LABEL,
  incomeTypeTitle,
  explainBinding,
  explainHumanCapital,
  explainIncomeType,
  formatEUR,
  formatPct,
  formatRatio,
  glidePath,
  riskAttitudeLine,
  riskSentence,
  targetEEE,
  type Profile,
} from '../engine'
import { PERSONAS } from '../data/personas'
import { useActiveProfile } from '../store/hooks'
import { useProfileStore } from '../store/profileStore'

type WhatIf = Partial<Pick<Profile, 'savingsRate' | 'maxLossMoney'>>

const btn =
  'rounded-xl px-5 py-3 text-center font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-700'

export default function Results() {
  const { active, profile: saved, hasAnswers } = useActiveProfile()
  const lossIsDefault = useProfileStore((s) => active === 'mine' && s.answers.maxLossMoney === undefined)
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
  const whatIfOn = Object.keys(whatIf).length > 0
  const isPersona = active !== 'mine'

  if (!isPersona && !hasAnswers) {
    return (
      <div className="space-y-8">
        <Header />
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold">No answers yet</h2>
          <p className="text-slate-600">Answer 16 short questions to see your own Risk Capacity, or look at one of the demo people below.</p>
          <Link to="/onboarding" className={`${btn} inline-block bg-accent-700 text-white hover:bg-accent-800`}>
            Start (3 minutes)
          </Link>
        </Card>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-section">Try a demo person</h2>
            <IllustrativeBadge />
          </div>
          <PersonaCards />
        </div>
      </div>
    )
  }

  const F = profile.investableAssets
  const fShare = 1 - t.hcRatio

  return (
    <div className="space-y-8">
      <Header />

      {/* 1. Hero */}
      <section aria-labelledby="hero" className="grid gap-6 rounded-xl border border-slate-200 bg-white p-4 shadow-card sm:grid-cols-[minmax(0,1fr)_260px] sm:items-center lg:p-6">
        <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="hero" className="text-caption text-slate-500">
            {isPersona ? `${PERSONAS[active].name}'s Risk Capacity` : 'Your Risk Capacity'}
          </h2>
          {isPersona && <IllustrativeBadge />}
          {whatIfOn && <Badge tone="warning">What-if</Badge>}
        </div>
        <p className="text-hero text-slate-900">{formatRatio(t.finalEEE)}</p>
        <p className="text-body text-slate-700">{riskSentence(t.finalEEE)}</p>
        <div className="space-y-2">
          <Badge tone="accent">{BINDING_LABEL[t.binding]}</Badge>
          <Explain>{explainBinding(t, profile, { lossIsDefault })}</Explain>
        </div>
        </div>
        <div className="mx-auto w-full max-w-[260px]">
          <RiskGauge value={t.finalEEE} />
        </div>
      </section>

      {/* 2. Drivers */}
      <section aria-labelledby="drivers" className="space-y-3">
        <h2 id="drivers" className="text-section">
          What drives your number
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile title="Risk attitude" value={BAND_LABEL[t.band]}>
            Your answers suggest you would {riskAttitudeLine(t)}.
          </StatTile>
          <StatTile title="Human capital" value={formatPct(t.hcRatio)} footnote={`Present value of all future earnings: ${formatEUR(t.pvEarnings)}`}>
            {explainHumanCapital(t)}
          </StatTile>
          <StatTile title="Income type" value={incomeTypeTitle(t.betaH)}>
            {explainIncomeType(t.betaH)}
          </StatTile>
          <Card className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-slate-600">Limits</h3>
            <ul className="space-y-1.5 text-sm">
              {t.caps.map((c) => {
                const binding = c.id === t.binding
                return (
                  <li key={c.id} className={`flex justify-between gap-3 rounded-md px-2 py-1 ${binding ? 'bg-accent-50 font-semibold text-accent-800 ring-1 ring-accent-200' : 'text-slate-700'}`}>
                    <span>
                      {CAP_LABEL[c.id]}
                      {binding && <span className="sr-only"> (the limit that applies)</span>}
                    </span>
                    <span className="tabular-nums">{formatRatio(c.value)}</span>
                  </li>
                )
              })}
            </ul>
            <p className="text-xs text-slate-500">Model result before limits: {formatRatio(t.rawEEE)}</p>
          </Card>
        </div>
      </section>

      {/* 3. Lifetime balance sheet */}
      <section aria-labelledby="bs" className="space-y-3">
        <h2 id="bs" className="text-section">
          Your lifetime balance sheet
        </h2>
        <Card className="space-y-3">
          <div className="flex h-10 w-full overflow-hidden rounded-lg" role="img" aria-label={`Investments today ${formatEUR(F)} (${formatPct(fShare)}), future savings ${formatEUR(t.pvfs)} (${formatPct(t.hcRatio)}).`}>
            <div className="bg-slate-700" style={{ width: `${Math.max(fShare * 100, 1)}%` }} />
            <div className="flex-1 bg-accent-500" />
          </div>
          <div className="flex flex-wrap justify-between gap-3 text-sm">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-slate-700" aria-hidden /> Investments today: <strong>{formatEUR(F)}</strong> ({formatPct(fShare)})
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-accent-500" aria-hidden /> Future savings: <strong>{formatEUR(t.pvfs)}</strong> ({formatPct(t.hcRatio)})
            </span>
          </div>
        </Card>
      </section>

      {/* 4. Glide path */}
      <section aria-labelledby="glide" className="space-y-3">
        <h2 id="glide" className="text-section">
          How your Risk Capacity changes with age
        </h2>
        <Card>
          <GlideChart points={path} currentAge={profile.age} />
        </Card>
      </section>

      {/* 5. What-if */}
      <section aria-labelledby="whatif" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="whatif" className="text-section">
            What if…
          </h2>
          <button
            type="button"
            onClick={() => setWhatIf({})}
            disabled={!whatIfOn}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-accent-700 underline disabled:text-slate-400 disabled:no-underline focus-visible:outline-2 focus-visible:outline-accent-700"
          >
            Reset
          </button>
        </div>
        <Card className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="wi-sav" className="text-sm font-medium">
              Share of income you invest
            </label>
            <SliderField id="wi-sav" min={0} max={40} step={1} value={Math.round(profile.savingsRate * 100)} onChange={(v) => setWhatIf((w) => ({ ...w, savingsRate: v / 100 }))} display={formatPct(profile.savingsRate)} />
          </div>
          <div className="space-y-2">
            <label htmlFor="wi-loss" className="text-sm font-medium">
              Max loss in a bad year
            </label>
            <SliderField
              id="wi-loss"
              min={0}
              max={Math.max(F, saved.maxLossMoney)}
              step={100}
              value={profile.maxLossMoney}
              onChange={(v) => setWhatIf((w) => ({ ...w, maxLossMoney: v }))}
              display={formatEUR(profile.maxLossMoney)}
            />
          </div>
          <p className="text-xs text-slate-500 sm:col-span-2">Try changes here without saving them. The whole page updates.</p>
        </Card>
      </section>

      {/* 6. CTAs */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link to="/portfolio" className={`${btn} bg-accent-700 text-white hover:bg-accent-800`}>
          Compare with my portfolio
        </Link>
        <Link to="/plan" className={`${btn} border border-slate-300 bg-white text-slate-800 hover:bg-slate-50`}>
          See my plan
        </Link>
      </div>
    </div>
  )
}

function Header() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-page-title">Results</h1>
      <PersonaSwitcher />
    </div>
  )
}
