import { useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge, { IllustrativeBadge } from '../components/Badge'
import PersonaCards from '../components/PersonaCards'
import RiskGauge from '../components/RiskGauge'
import { btnPrimary, btnSecondary, card, pageWrap } from '../components/ui'
import { formatEUR, formatPct, formatRatio, targetEEE } from '../engine'
import { DEMO_PORTFOLIOS } from '../data/demoPortfolios'
import { PERSONAS } from '../data/personas'
import { portfolioRisk, usePersonaLoader } from '../store/hooks'
import { useProfileStore } from '../store/profileStore'

const STEPS = [
  { title: 'Answer 16 questions', text: 'Age, income outlook, how stable your job is and how you handle losses.' },
  { title: 'See your Risk Capacity', text: 'One number, explained: what drives it and which limit applies.' },
  { title: 'Compare and plan', text: 'See how your portfolio fits, what a crash would cost and what to change.' },
]

export default function Landing() {
  const personasRef = useRef<HTMLElement>(null)
  const showMyAnswers = useProfileStore((s) => s.showMyAnswers)
  return (
    <div className={pageWrap}>
      <section className="grid items-center gap-12 pt-12 pb-14 sm:pt-[88px] lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <div className="flex flex-col gap-7">
          <span className="self-start rounded-full border border-lime-line bg-lime-tint px-3 py-1.5 text-xs font-semibold tracking-[0.08em] text-lime uppercase">
            Lifecycle investing, made personal
          </span>
          <h1 className="font-display text-[40px] leading-[1.06] font-semibold tracking-[-0.03em] text-ink sm:text-[60px] sm:leading-[1.04]">
            Your biggest asset is your future salary. Is your portfolio built for it?
          </h1>
          <p className="max-w-[520px] text-lg leading-relaxed text-ink-2">
            Human Capital Copilot sizes your investment risk to your whole life, not just today's portfolio. 16 questions, about 3 minutes, one clear number.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/onboarding" onClick={showMyAnswers} className={btnPrimary}>
              Start (3 minutes) <ArrowRight size={16} strokeWidth={2.25} aria-hidden />
            </Link>
            <button type="button" onClick={() => personasRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className={`${btnSecondary} bg-surface`}>
              Try a demo person
            </button>
          </div>
          <p className="text-[13px] text-muted">Your answers stay in your browser. Educational demo, not investment advice.</p>
        </div>
        <ExampleCard />
      </section>

      <section ref={personasRef} aria-labelledby="demo" className="flex scroll-mt-6 flex-col gap-5 py-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="demo" className="font-display text-2xl font-semibold tracking-[-0.01em]">
            Try a demo person
          </h2>
          <IllustrativeBadge />
        </div>
        <PersonaCards />
      </section>

      <section aria-labelledby="how" className="pt-6 pb-14">
        <h2 id="how" className="sr-only">
          How it works
        </h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex flex-col gap-2 border-t border-line pt-5">
              <span className="font-display text-sm font-semibold text-lime">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="text-base font-semibold">{s.title}</h3>
              <p className="text-help text-ink-2">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <p className="pb-16 text-[13px] text-muted">
        Built on research: Ayres &amp; Nalebuff (2010), <cite>Lifecycle Investing</cite>; Ibbotson, Milevsky, Chen &amp; Zhu (2007), <cite>Lifetime Financial Advice</cite>.
      </p>
    </div>
  )
}

/** Sofie's real result, computed by the engine, as the hero example. */
function ExampleCard() {
  const loadPersona = usePersonaLoader()
  const sofie = PERSONAS.sofie
  const t = targetEEE(sofie.profile)
  const risk = portfolioRisk(DEMO_PORTFOLIOS.sofie.holdings, t.finalEEE)
  const tiles: [string, string, string?][] = [
    ['Future savings', formatEUR(t.pvfs)],
    ['Invested today', formatEUR(sofie.profile.investableAssets)],
    ...(risk ? [['Portfolio now', formatRatio(risk.actual), risk.fit.status === 'On target' ? 'text-lime' : 'text-warn'] as [string, string, string]] : []),
  ]
  return (
    <div className={`${card} flex min-w-0 flex-col gap-6 rounded-[24px] p-6 sm:p-8`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-label">Sofie, 24 · consultant</span>
        <Badge tone="solid">Example</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-x-7 gap-y-2">
        <RiskGauge value={t.finalEEE} width={220} stroke={18} />
        <div className="flex flex-col gap-1">
          <span className="text-[48px] leading-none font-semibold tracking-[-0.03em] font-display sm:text-display-lg">{formatRatio(t.finalEEE)}</span>
          <span className="text-help text-ink-2">the risk of the global stock market</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {tiles.map(([label, value, color]) => (
          <div key={label} className="min-w-0 rounded-[14px] bg-surface-2 p-3 sm:p-3.5">
            <div className="text-xs text-muted">{label}</div>
            <div className={`mt-1 font-display text-base font-semibold sm:text-xl ${color ?? 'text-ink'}`}>{value}</div>
          </div>
        ))}
      </div>
      <p className="text-help text-ink-2">
        {formatPct(t.hcRatio)} of Sofie's lifetime investable wealth is still in future salary.{' '}
        {risk && risk.fit.status === 'Too little risk' && 'The portfolio carries less risk than this situation can handle.'}
      </p>
      <Link
        to="/results"
        onClick={() => loadPersona('sofie')}
        className="self-start text-sm font-medium text-lime hover:text-lime-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime rounded"
      >
        See Sofie's full result →
      </Link>
    </div>
  )
}
