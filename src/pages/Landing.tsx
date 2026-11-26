import { useRef } from 'react'
import { Link } from 'react-router-dom'
import PersonaCards from '../components/PersonaCards'
import { IllustrativeBadge } from '../components/Badge'
import { useProfileStore } from '../store/profileStore'

const STEPS = [
  { title: 'Answer 16 questions', text: 'About your age, income, safety net and how you feel about risk.' },
  { title: 'See your Risk Capacity', text: 'One number: how much stock-market risk your whole life can carry.' },
  { title: 'Compare and plan', text: 'Check your portfolio against it and see a plan with a stress test.' },
]

export default function Landing() {
  const personasRef = useRef<HTMLElement>(null)
  const showMyAnswers = useProfileStore((s) => s.showMyAnswers)
  return (
    <div className="space-y-14">
      <section className="space-y-6 pt-4 sm:pt-10">
        <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          Your biggest asset is your future salary. Is your portfolio built for it?
        </h1>
        <p className="max-w-2xl text-lg text-slate-600">
          Human Capital Copilot sizes your investment risk to your whole life, not just today's portfolio.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to="/onboarding"
            onClick={showMyAnswers}
            className="rounded-xl bg-accent-700 px-5 py-3 text-center font-semibold text-white shadow-sm hover:bg-accent-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600"
          >
            Start (3 minutes)
          </Link>
          <button
            type="button"
            onClick={() => personasRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600"
          >
            Try a demo person
          </button>
        </div>
      </section>

      <section aria-labelledby="how" className="space-y-4">
        <h2 id="how" className="text-xl font-semibold text-slate-900">
          How it works
        </h2>
        <ol className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-2xl border border-slate-200 bg-white p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-50 font-semibold text-accent-800">
                {i + 1}
              </span>
              <h3 className="mt-3 font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section ref={personasRef} aria-labelledby="demo" className="scroll-mt-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="demo" className="text-xl font-semibold text-slate-900">
            Try a demo person
          </h2>
          <IllustrativeBadge />
        </div>
        <PersonaCards />
      </section>

      <p className="text-sm text-slate-500">
        Built on research: Ayres &amp; Nalebuff (2010), <cite>Lifecycle Investing</cite>; Ibbotson, Milevsky, Chen &amp; Zhu
        (2007), <cite>Lifetime Financial Advice</cite>.
      </p>
    </div>
  )
}
