import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import NeedleBar from '../components/NeedleBar'
import { NumberField, Question, RadioCards, SliderField, type RadioOption } from '../components/fields'
import {
  drawdownQuestion,
  explainBinding,
  formatEUR,
  formatPct,
  formatRatio,
  impliedGrowthLabel,
  type Experience,
  type IncomeSecurity,
  type Likert,
  type Profile,
  type Sector,
} from '../engine'
import { useMyTarget } from '../store/hooks'
import { useProfileStore } from '../store/profileStore'

const STEP_TITLES = ['About you', 'Your income', 'Safety net', 'Risk & knowledge', 'Review'] as const
const QUESTION_STEPS = 4

const SECTORS: RadioOption<Sector>[] = [
  { value: 'public', label: 'Public sector', description: 'Civil servant, public hospital, military' },
  { value: 'health_edu', label: 'Health & education', description: 'Nurse, teacher, private clinic' },
  { value: 'salaried', label: 'Salaried private job', description: 'Consulting, engineering, industry' },
  { value: 'tech', label: 'Tech', description: 'Software, IT, start-up employee' },
  { value: 'sales', label: 'Sales', description: 'Commission-based sales, real estate' },
  { value: 'finance', label: 'Finance', description: 'Banking, trading, asset management' },
  { value: 'founder', label: 'Founder / self-employed', description: 'Own company, freelancer' },
]

const SECURITY: RadioOption<IncomeSecurity>[] = [
  { value: 'very_stable', label: 'Very stable', description: 'Tenured public job, hard to lose' },
  { value: 'stable', label: 'Stable', description: 'Permanent contract in a steady industry' },
  { value: 'average', label: 'Average', description: 'Typical private-sector job' },
  { value: 'volatile', label: 'Volatile', description: 'Commission, bonus-heavy or founder income' },
]

const BUFFER: RadioOption<number>[] = [
  { value: 0, label: '0 months' },
  { value: 1, label: '1 month' },
  { value: 2, label: '2 months' },
  { value: 3, label: '3 months' },
  { value: 5, label: '4–6 months' },
  { value: 6, label: '6+ months' },
]

const DRAWDOWN: RadioOption<Likert>[] = [
  { value: 1, label: 'Sell everything' },
  { value: 2, label: 'Sell some' },
  { value: 3, label: 'Do nothing' },
  { value: 4, label: 'Buy a little more' },
  { value: 5, label: 'Buy a lot more' },
]

const GAMBLE: RadioOption<Likert>[] = [
  { value: 1, label: 'Never' },
  { value: 2, label: 'A 10% cut' },
  { value: 3, label: 'A 20% cut' },
  { value: 4, label: 'A 33% cut' },
  { value: 5, label: 'A 50% cut' },
]

const EXPERIENCE: RadioOption<Experience>[] = [
  { value: 'none', label: 'None', description: 'I have not invested yet' },
  { value: 'some', label: 'Some', description: 'I own funds or shares' },
  { value: 'experienced', label: 'Experienced', description: 'Several years, through ups and downs' },
]

const KNOWLEDGE = [
  {
    q: 'You invest with 1.5× exposure (borrowing 50% extra). Stocks fall 20%. Roughly how much of your own money do you lose?',
    options: ['20%', '30%', '50%'],
    correct: 1,
  },
  {
    q: 'What is a margin call?',
    options: [
      'A call from your broker offering you a cheaper loan.',
      'The broker demands more collateral, or sells your holdings, because your loan has become too large relative to your assets.',
      'A fee you pay every time you buy shares with borrowed money.',
    ],
    correct: 1,
  },
  {
    q: 'Over several years, a 2× daily leveraged ETF…',
    options: [
      'always returns exactly twice the index.',
      'has less risk than the index because it rebalances every day.',
      'can return less than twice the index, especially when markets are volatile.',
    ],
    correct: 2,
  },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const answers = useProfileStore((s) => s.answers)
  const setAnswer = useProfileStore((s) => s.setAnswer)
  const showMyAnswers = useProfileStore((s) => s.showMyAnswers)
  const { profile: p, target } = useMyTarget()

  // Onboarding always edits "My answers", never a persona.
  useEffect(() => showMyAnswers(), [showMyAnswers])

  const set = <K extends keyof Profile>(k: K) => (v: Profile[K]) => setAnswer(k, v)
  const go = (s: number) => {
    setStep(s)
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="pb-28 lg:grid lg:grid-cols-[1fr_300px] lg:gap-8 lg:pb-0">
      <div className="space-y-6">
        <header className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {step < QUESTION_STEPS ? `Step ${step + 1} of ${QUESTION_STEPS}: ${STEP_TITLES[step]}` : 'Review your answers'}
          </h1>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-label="Onboarding progress"
            aria-valuemin={0}
            aria-valuemax={QUESTION_STEPS}
            aria-valuenow={Math.min(step + 1, QUESTION_STEPS)}
          >
            <div className="h-full rounded-full bg-accent-600 transition-all" style={{ width: `${(Math.min(step + 1, QUESTION_STEPS) / QUESTION_STEPS) * 100}%` }} />
          </div>
        </header>

        <div className="space-y-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          {step === 0 && (
            <>
              <Question number={1} label="How old are you?" htmlFor="q-age" why="Younger people have more future salary ahead, which changes how much risk fits.">
                <NumberField id="q-age" value={p.age} onChange={set('age')} min={16} max={80} suffix="years" />
              </Question>
              <Question number={2} label="When do you expect to retire?" htmlFor="q-retire" why="The years until retirement decide how much future saving you still have.">
                <SliderField id="q-retire" value={p.retireAge} onChange={set('retireAge')} min={55} max={75} step={1} display={`age ${p.retireAge}`} />
              </Question>
              <Question number={3} label="How much do you have invested or saved for investing today?" htmlFor="q-f" why="This is the portfolio we size the risk for.">
                <NumberField id="q-f" value={p.investableAssets} onChange={set('investableAssets')} min={0} max={100_000_000} step={500} prefix="€" />
              </Question>
              <Question number={4} label="What share of your net income do you invest?" htmlFor="q-sav" why="Your future savings are your human capital: the bigger they are, the more risk your portfolio can carry.">
                <SliderField id="q-sav" value={Math.round(p.savingsRate * 100)} onChange={(v) => setAnswer('savingsRate', v / 100)} min={0} max={40} step={1} display={formatPct(p.savingsRate)} />
              </Question>
            </>
          )}

          {step === 1 && (
            <>
              <Question number={5} label="Your net yearly income now (students: expected first salary)" htmlFor="q-inc" why="Your income is what your future savings come from.">
                <NumberField id="q-inc" value={p.incomeNow} onChange={set('incomeNow')} min={0} max={10_000_000} step={1000} prefix="€" suffix="/ year" />
              </Question>
              <Question number={6} label="Where do you expect your income to be in 10 years?" htmlFor="q-inc10" why="Expected pay rises make your future savings worth more today.">
                <SliderField
                  id="q-inc10"
                  value={p.income10y}
                  onChange={set('income10y')}
                  min={Math.round(p.incomeNow * 0.8)}
                  max={Math.max(Math.round(p.incomeNow * 2.2), 1000)}
                  step={500}
                  display={formatEUR(p.income10y)}
                  hint={impliedGrowthLabel(p)}
                />
              </Question>
              <Question number={7} label="Which sector do you work (or plan to work) in?" why="Some jobs pay less or disappear when markets fall, so that income already carries stock-market risk.">
                <RadioCards name="sector" legend="Sector" options={SECTORS} value={p.sector} onChange={set('sector')} />
              </Question>
              <Question number={8} label="How much of your pay is bonus, commission or shares?" htmlFor="q-var" why="Variable pay tends to fall in the same years as the stock market.">
                <SliderField id="q-var" value={Math.round(p.variablePayShare * 100)} onChange={(v) => setAnswer('variablePayShare', v / 100)} min={0} max={100} step={5} display={formatPct(p.variablePayShare)} />
              </Question>
              <Question number={9} label="How secure is your income?" why="Less secure income is worth less today, so we count it more carefully.">
                <RadioCards name="security" legend="Income security" options={SECURITY} value={p.incomeSecurity} onChange={set('incomeSecurity')} />
              </Question>
            </>
          )}

          {step === 2 && (
            <>
              <Question number={10} label="How many months of expenses could you cover with savings?" why="Without a buffer, a surprise bill could force you to sell at a bad time.">
                <RadioCards name="buffer" legend="Months of buffer" options={BUFFER} value={p.bufferMonths} onChange={set('bufferMonths')} columns={3} />
              </Question>
              <Question number={11} label="Highest interest rate on any debt you have? (0 if none)" htmlFor="q-debt" why="Paying off expensive debt is a guaranteed return that beats investing.">
                <NumberField id="q-debt" value={roundPct(p.maxDebtRate)} onChange={(v) => setAnswer('maxDebtRate', v / 100)} min={0} max={100} step={0.5} suffix="%" />
              </Question>
            </>
          )}

          {step === 3 && (
            <>
              <Question number={12} label={`“${drawdownQuestion(p.investableAssets)}”`} why="How you reacted (or would react) to a fall is the best guide to the risk you can live with.">
                <RadioCards name="drawdown" legend="Reaction to a fall" options={DRAWDOWN} value={p.drawdownReaction} onChange={set('drawdownReaction')} columns={1} />
              </Question>
              <Question
                number={13}
                label="“You're offered a job: 50% chance it doubles your income, 50% chance it cuts it. What's the largest cut you'd accept?”"
                why="This measures your general attitude to risk, separate from markets."
              >
                <RadioCards name="gamble" legend="Largest income cut" options={GAMBLE} value={p.incomeGamble} onChange={set('incomeGamble')} columns={1} />
              </Question>
              <Question number={14} label="What is the most you could lose in a bad year without changing your plans?" htmlFor="q-loss" why="We never suggest a risk level whose 2008-style crash loss is above this amount.">
                <NumberField id="q-loss" value={p.maxLossMoney} onChange={set('maxLossMoney')} min={0} max={100_000_000} step={500} prefix="€" />
              </Question>
              <Question number={15} label="Investing experience" why="Borrowing to invest is only offered to people who understand how it works.">
                <RadioCards name="experience" legend="Investing experience" options={EXPERIENCE} value={p.experience} onChange={set('experience')} columns={3} />
              </Question>
              <Question number={16} label="Knowledge check and borrowing opt-in" why="Above 1.0× means borrowing to invest. You need to know how it can go wrong before you can switch it on.">
                <KnowledgeCheck />
              </Question>
            </>
          )}

          {step === 4 && <Review profile={p} edited={answers} onEdit={go} />}
        </div>

        <nav aria-label="Onboarding steps" className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => go(step - 1)}
            disabled={step === 0}
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-800 hover:bg-slate-50 disabled:invisible focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600"
          >
            Back
          </button>
          {step < QUESTION_STEPS ? (
            <button
              type="button"
              onClick={() => go(step + 1)}
              className="rounded-xl bg-accent-700 px-5 py-2.5 font-semibold text-white hover:bg-accent-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600"
            >
              {step === QUESTION_STEPS - 1 ? 'Review' : 'Next'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                // Store every shown value (defaults included) so "My answers" counts as answered.
                useProfileStore.getState().setAnswers(p)
                navigate('/results')
              }}
              className="rounded-xl bg-accent-700 px-5 py-2.5 font-semibold text-white hover:bg-accent-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600"
            >
              See my result
            </button>
          )}
        </nav>
      </div>

      <LiveNeedle value={target.finalEEE} text={explainBinding(target, p)} />
    </div>
  )
}

const roundPct = (x: number) => Math.round(x * 1000) / 10

/** Sticky panel (desktop: right column, mobile: bottom bar) with the live Risk Capacity. */
function LiveNeedle({ value, text }: { value: number; text: string }) {
  return (
    <aside aria-label="Your Risk Capacity so far" aria-live="polite" className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
      <div className="mx-auto max-w-5xl lg:sticky lg:top-6 lg:rounded-2xl lg:border lg:border-slate-200 lg:bg-white lg:p-5 lg:shadow-sm">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-medium text-slate-600">Risk Capacity so far</p>
          <p className="text-2xl font-semibold tabular-nums text-slate-900 lg:text-3xl">{formatRatio(value)}</p>
        </div>
        <div className="mt-2">
          <NeedleBar value={value} max={1.5} />
        </div>
        <p className="mt-2 hidden text-sm text-slate-700 sm:block">{text}</p>
      </div>
    </aside>
  )
}

/** Question 16: three multiple-choice questions (all correct = passed), then the leverage opt-in switch. */
function KnowledgeCheck() {
  const passed = useProfileStore((s) => s.answers.knowledgeCheckPassed ?? false)
  const optIn = useProfileStore((s) => s.answers.leverageOptIn ?? false)
  const setAnswers = useProfileStore((s) => s.setAnswers)
  const [picks, setPicks] = useState<(number | null)[]>([null, null, null])
  const [retake, setRetake] = useState(false)
  const allAnswered = picks.every((x) => x !== null)
  const allCorrect = KNOWLEDGE.every((k, i) => picks[i] === k.correct)
  const showQuiz = !passed || retake

  function pick(i: number, v: number) {
    const next = picks.map((x, j) => (j === i ? v : x))
    setPicks(next)
    if (next.every((x) => x !== null)) {
      const ok = KNOWLEDGE.every((k, j) => next[j] === k.correct)
      setAnswers(ok ? { knowledgeCheckPassed: true } : { knowledgeCheckPassed: false, leverageOptIn: false })
      if (ok) setRetake(false)
    }
  }

  return (
    <div className="space-y-4">
      {showQuiz ? (
        <ol className="space-y-4">
          {KNOWLEDGE.map((k, i) => (
            <li key={k.q} className="space-y-2">
              <p className="text-sm font-medium text-slate-800">
                {String.fromCharCode(97 + i)}) {k.q}
              </p>
              <RadioCards
                name={`kc-${i}`}
                legend={k.q}
                options={k.options.map((label, v) => ({ value: v, label }))}
                value={picks[i] ?? -1}
                onChange={(v) => pick(i, v)}
                columns={1}
              />
            </li>
          ))}
        </ol>
      ) : null}

      <Status>
        {passed ? (
          <span className="text-emerald-800">
            ✔ Knowledge check passed.{' '}
            {!retake && (
              <button type="button" onClick={() => { setRetake(true); setPicks([null, null, null]) }} className="underline">
                Retake
              </button>
            )}
          </span>
        ) : allAnswered && !allCorrect ? (
          <span className="text-red-800">Not all answers are correct. Have another look and change your answers.</span>
        ) : (
          <span className="text-slate-600">Answer all three to unlock the borrowing option.</span>
        )}
      </Status>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span id="optin-label" className="font-medium text-slate-900">
            Allow borrowing to invest (above 1.0×)
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={optIn}
            aria-labelledby="optin-label"
            disabled={!passed}
            onClick={() => setAnswers({ leverageOptIn: !optIn })}
            className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600 ${optIn ? 'bg-accent-700' : 'bg-slate-300'}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${optIn ? 'left-5.5' : 'left-0.5'}`} />
          </button>
        </div>
        <p className="mt-2 text-slate-700">
          Borrowing magnifies both gains and losses, and in a crash the broker can sell your holdings (a margin call). Off by default.
        </p>
      </div>
    </div>
  )
}

function Status({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm" role="status">
      {children}
    </p>
  )
}

const BUFFER_LABEL = Object.fromEntries(BUFFER.map((o) => [o.value, o.label]))
const label = <T extends string | number>(opts: RadioOption<T>[], v: T) => opts.find((o) => o.value === v)?.label ?? String(v)

/** Summary of all 16 answers with links back to their step. */
function Review({ profile: p, edited, onEdit }: { profile: Profile; edited: Partial<Profile>; onEdit: (step: number) => void }) {
  const rows: [number, string, string, keyof Profile][] = [
    [0, 'Age', `${p.age}`, 'age'],
    [0, 'Retirement age', `${p.retireAge}`, 'retireAge'],
    [0, 'Invested today', formatEUR(p.investableAssets), 'investableAssets'],
    [0, 'Share of income invested', formatPct(p.savingsRate), 'savingsRate'],
    [1, 'Net income now', formatEUR(p.incomeNow), 'incomeNow'],
    [1, 'Income in 10 years', `${formatEUR(p.income10y)} (${impliedGrowthLabel(p)})`, 'income10y'],
    [1, 'Sector', label(SECTORS, p.sector), 'sector'],
    [1, 'Bonus, commission or shares', formatPct(p.variablePayShare), 'variablePayShare'],
    [1, 'Income security', label(SECURITY, p.incomeSecurity), 'incomeSecurity'],
    [2, 'Emergency buffer', BUFFER_LABEL[p.bufferMonths] ?? `${p.bufferMonths} months`, 'bufferMonths'],
    [2, 'Highest debt interest', formatPct(p.maxDebtRate), 'maxDebtRate'],
    [3, 'After a 30% fall', label(DRAWDOWN, p.drawdownReaction), 'drawdownReaction'],
    [3, 'Largest income cut accepted', label(GAMBLE, p.incomeGamble), 'incomeGamble'],
    [3, 'Max loss in a bad year', formatEUR(p.maxLossMoney), 'maxLossMoney'],
    [3, 'Experience', label(EXPERIENCE, p.experience), 'experience'],
    [3, 'Knowledge check / borrowing', `${p.knowledgeCheckPassed ? 'Passed' : 'Not passed'} · ${p.leverageOptIn ? 'opted in' : 'off'}`, 'knowledgeCheckPassed'],
  ]
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">Answers marked “default” use our starting values. You can change any of them.</p>
      <dl className="divide-y divide-slate-100">
        {rows.map(([step, name, value, key]) => (
          <div key={name} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5">
            <dt className="text-sm text-slate-600">{name}</dt>
            <dd className="flex items-baseline gap-3 text-sm font-medium text-slate-900">
              <span>
                {value}
                {edited[key] === undefined && <span className="ml-1.5 text-xs font-normal text-slate-500">default</span>}
              </span>
              <button type="button" onClick={() => onEdit(step)} className="text-xs font-medium text-accent-700 underline focus-visible:outline-2 focus-visible:outline-accent-600" aria-label={`Edit ${name}`}>
                Edit
              </button>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
