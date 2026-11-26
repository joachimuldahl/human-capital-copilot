import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import Badge from '../components/Badge'
import RiskGauge from '../components/RiskGauge'
import WhyWeAsk from '../components/WhyWeAsk'
import { NotSure, NumberField, Question, RadioCards, SliderField, type RadioOption } from '../components/fields'
import { WHY_WE_ASK } from '../content/whyWeAsk'
import {
  answerEffect,
  assumptions,
  driverLines,
  ESTIMATE_NOTE,
  drawdownQuestion,
  explainBinding,
  unansweredCount,
  type QuestionNo,
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

const STEP_SUBTITLES = [
  '4 quick questions about your situation. The whole check takes about 3 minutes.',
  '5 questions about your pay',
  '2 questions about your safety net',
  '5 questions about risk and what you know',
  'Check your answers, then see your result',
] as const

type Q = QuestionNo

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [openWhy, setOpenWhy] = useState<Q | null>(null)
  const answers = useProfileStore((s) => s.answers)
  const setAnswer = useProfileStore((s) => s.setAnswer)
  const clearAnswer = useProfileStore((s) => s.clearAnswer)
  const showMyAnswers = useProfileStore((s) => s.showMyAnswers)
  const { profile: p, target, pending } = useMyTarget()

  // Onboarding always edits "My answers", never a persona.
  useEffect(() => showMyAnswers(), [showMyAnswers])

  const set = <K extends keyof Profile>(k: K) => (v: Profile[K]) => setAnswer(k, v)
  const go = (s: number) => {
    setStep(s)
    setOpenWhy(null)
    window.scrollTo({ top: 0 })
  }
  /** "Why we ask" panel for question q; only one is open at a time. */
  const why = (q: Q) => (
    <WhyWeAsk content={WHY_WE_ASK[q]} effect={() => answerEffect(q, p, { pending })} open={openWhy === q} onToggle={() => setOpenWhy((o) => (o === q ? null : q))} />
  )
  const retireMsg = p.age >= p.retireAge ? 'Retirement age needs to be after your current age.' : undefined
  const unanswered = unansweredCount(answers)
  // G3/G4 are skipped while pending, so the explanation never names a limit the user hasn't answered.
  const explanation = explainBinding(target, p)
  const isReview = step === QUESTION_STEPS

  return (
    <div className="pb-20 lg:grid lg:grid-cols-[minmax(0,640px)_320px] lg:items-start lg:justify-between lg:gap-10 lg:pb-0">
      <div className="space-y-6">
        <header className="space-y-3">
          <p className="text-caption text-slate-500">{isReview ? 'Review' : `Step ${step + 1} of ${QUESTION_STEPS}`}</p>
          <h1 className="text-step-title text-slate-900">{isReview ? 'Your answers' : STEP_TITLES[step]}</h1>
          <p className="text-help text-slate-600">{STEP_SUBTITLES[step]}</p>
          <div className="flex gap-1.5" role="progressbar" aria-label="Onboarding progress" aria-valuemin={0} aria-valuemax={QUESTION_STEPS} aria-valuenow={Math.min(step + 1, QUESTION_STEPS)}>
            {Array.from({ length: QUESTION_STEPS }, (_, i) => (
              <span key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-accent-700' : 'bg-slate-200'}`} />
            ))}
          </div>
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <Lock size={14} strokeWidth={1.75} aria-hidden />
            Your answers stay in your browser. Nothing is sent anywhere.
          </p>
        </header>

        <section aria-label={isReview ? 'Your answers' : STEP_TITLES[step]} className="rounded-xl border border-slate-200 bg-white shadow-card">
          <div className="divide-y divide-slate-200 p-4 lg:p-6">
            {step === 0 && (
              <>
                <Question number={1} label="How old are you?" htmlFor="q-age" why={why(1)}>
                  <NumberField id="q-age" value={p.age} onChange={set('age')} min={16} max={80} suffix="years" message={retireMsg} />
                </Question>
                <Question number={2} label="When do you expect to retire?" htmlFor="q-retire" why={why(2)}>
                  <SliderField id="q-retire" value={p.retireAge} onChange={set('retireAge')} min={55} max={75} step={1} display={`age ${p.retireAge}`} minLabel="55" maxLabel="75" />
                </Question>
                <Question number={3} label="How much do you have invested or saved for investing today?" hint="Funds, shares, crypto and cash you set aside for investing." htmlFor="q-f" why={why(3)}>
                  <NumberField id="q-f" value={p.investableAssets} onChange={set('investableAssets')} min={0} max={100_000_000} step={500} prefix="€" />
                </Question>
                <Question number={4} label="What share of your net income do you invest?" htmlFor="q-sav" why={why(4)}>
                  <SliderField id="q-sav" value={Math.round(p.savingsRate * 100)} onChange={(v) => setAnswer('savingsRate', v / 100)} min={0} max={40} step={1} display={formatPct(p.savingsRate)} minLabel="0%" maxLabel="40%" />
                </Question>
              </>
            )}

            {step === 1 && (
              <>
                <Question number={5} label="Your net yearly income now" hint="Students: your expected first salary, after tax." htmlFor="q-inc" why={why(5)}>
                  <NumberField id="q-inc" value={p.incomeNow} onChange={set('incomeNow')} min={0} max={10_000_000} step={1000} prefix="€" suffix="/ year" />
                </Question>
                <Question number={6} label="Where do you expect your income to be in 10 years?" hint="In today's money, after tax." htmlFor="q-inc10" why={why(6)}>
                  <div className="space-y-2">
                    <SliderField
                      id="q-inc10"
                      value={p.income10y}
                      onChange={set('income10y')}
                      min={Math.round(p.incomeNow * 0.8)}
                      max={Math.max(Math.round(p.incomeNow * 2.2), 1000)}
                      step={500}
                      display={formatEUR(p.income10y)}
                      hint={impliedGrowthLabel(p)}
                      minLabel={formatEUR(p.incomeNow * 0.8)}
                      maxLabel={formatEUR(Math.max(p.incomeNow * 2.2, 1000))}
                    />
                    <NotSure active={answers.income10y === undefined} onClick={() => clearAnswer('income10y')} defaultText={`+${roundPct(assumptions.defaultIncomeGrowth)}% a year`} />
                  </div>
                </Question>
                <Question number={7} label="Which sector do you work (or plan to work) in?" why={why(7)}>
                  <RadioCards name="sector" legend="Sector" options={SECTORS} value={p.sector} onChange={set('sector')} />
                </Question>
                <Question number={8} label="How much of your pay is bonus, commission or shares?" htmlFor="q-var" why={why(8)}>
                  <div className="space-y-2">
                    <SliderField id="q-var" value={Math.round(p.variablePayShare * 100)} onChange={(v) => setAnswer('variablePayShare', v / 100)} min={0} max={100} step={5} display={formatPct(p.variablePayShare)} minLabel="0%" maxLabel="100%" />
                    <NotSure active={answers.variablePayShare === undefined} onClick={() => clearAnswer('variablePayShare')} defaultText="0%" />
                  </div>
                </Question>
                <Question number={9} label="How secure is your income?" why={why(9)}>
                  <RadioCards name="security" legend="Income security" options={SECURITY} value={p.incomeSecurity} onChange={set('incomeSecurity')} />
                </Question>
              </>
            )}

            {step === 2 && (
              <>
                <Question number={10} label="How many months of expenses could you cover with savings?" why={why(10)}>
                  <RadioCards name="buffer" legend="Months of buffer" options={BUFFER} value={p.bufferMonths} onChange={set('bufferMonths')} columns={3} />
                </Question>
                <Question number={11} label="Highest interest rate on any debt you have?" hint="Enter 0 if you have no debt." htmlFor="q-debt" why={why(11)}>
                  <NumberField id="q-debt" value={roundPct(p.maxDebtRate)} onChange={(v) => setAnswer('maxDebtRate', v / 100)} min={0} max={100} step={0.5} suffix="%" />
                </Question>
              </>
            )}

            {step === 3 && (
              <>
                <Question number={12} label={`“${drawdownQuestion(p.investableAssets)}”`} why={why(12)}>
                  <RadioCards name="drawdown" legend="Reaction to a fall" options={DRAWDOWN} value={p.drawdownReaction} onChange={set('drawdownReaction')} />
                </Question>
                <Question number={13} label="“You're offered a job: 50% chance it doubles your income, 50% chance it cuts it. What's the largest cut you'd accept?”" why={why(13)}>
                  <RadioCards name="gamble" legend="Largest income cut" options={GAMBLE} value={p.incomeGamble} onChange={set('incomeGamble')} />
                </Question>
                <Question number={14} label="What is the most you could lose in a bad year without changing your plans?" htmlFor="q-loss" why={why(14)}>
                  <div className="space-y-2">
                    <NumberField id="q-loss" value={p.maxLossMoney} onChange={set('maxLossMoney')} min={0} max={100_000_000} step={500} prefix="€" />
                    <NotSure
                      active={answers.maxLossMoney === undefined}
                      onClick={() => clearAnswer('maxLossMoney')}
                      defaultText={`${roundPct(assumptions.defaultMaxLossShare)}% of what you invest (${formatEUR(p.maxLossMoney)})`}
                    />
                  </div>
                </Question>
                <Question number={15} label="Investing experience" why={why(15)}>
                  <RadioCards name="experience" legend="Investing experience" options={EXPERIENCE} value={p.experience} onChange={set('experience')} columns={3} />
                </Question>
                <Question number={16} label="Knowledge check and borrowing opt-in" hint="Three short questions. Borrowing can only be switched on when all three are right." why={why(16)}>
                  <KnowledgeCheck />
                </Question>
              </>
            )}

            {isReview && <Review profile={p} edited={answers} onEdit={go} />}
          </div>

          {!isReview && <p className="border-t border-slate-200 px-4 py-3 text-help text-slate-500 lg:px-6">You can change any answer later.</p>}

          <nav aria-label="Onboarding steps" className="sticky bottom-14 z-10 flex items-center justify-between gap-3 rounded-b-xl border-t border-slate-200 bg-white px-4 py-3 lg:static lg:px-6">
            <button type="button" onClick={() => go(step - 1)} disabled={step === 0} className={`${BTN_SECONDARY} disabled:invisible`}>
              Back
            </button>
            {step < QUESTION_STEPS ? (
              <button type="button" onClick={() => go(step + 1)} className={BTN_PRIMARY}>
                {step === QUESTION_STEPS - 1 ? 'Review answers' : 'Next'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  // Store every shown value (defaults included) so "My answers" counts as answered.
                  useProfileStore.getState().setAnswers(p)
                  navigate('/results')
                }}
                className={BTN_PRIMARY}
              >
                See my result
              </button>
            )}
          </nav>
        </section>
      </div>

      <SummaryPanel value={target.finalEEE} estimate={pending.length > 0} unanswered={unanswered} text={explanation} drivers={driverLines(target)} />
    </div>
  )
}

const BTN_BASE = 'inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-700'
const BTN_PRIMARY = `${BTN_BASE} bg-accent-700 text-white hover:bg-accent-800`
const BTN_SECONDARY = `${BTN_BASE} border border-slate-300 bg-white text-slate-800 hover:bg-slate-50`

const roundPct = (x: number) => Math.round(x * 1000) / 10

/** "Estimate" while step-4 limits are pending; otherwise "Preliminary" while any default is in use. */
function StatusChip({ estimate }: { estimate: boolean }) {
  return <Badge tone="warning">{estimate ? 'Estimate' : 'Preliminary'}</Badge>
}

/** Desktop: sticky 320px panel with gauge and drivers. Mobile: 56px bottom bar with the number and chip. */
function SummaryPanel({ value, estimate, unanswered, text, drivers }: { value: number; estimate: boolean; unanswered: number; text: string; drivers: { label: string; value: string }[] }) {
  const prelim = estimate || unanswered > 0
  return (
    <>
      <aside aria-label="Your Risk Capacity so far" className="hidden lg:sticky lg:top-6 lg:block">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
          <div>
            <p className="text-caption text-slate-500">Your risk capacity</p>
            <div className="mt-1 flex items-center gap-3">
              <p className="text-hero text-slate-900" aria-live="polite">
                {formatRatio(value)}
              </p>
              {prelim && <StatusChip estimate={estimate} />}
            </div>
            {estimate ? (
              <p className="mt-1 text-xs text-slate-500">{ESTIMATE_NOTE}</p>
            ) : (
              prelim && (
                <p className="mt-1 text-xs text-slate-500">
                  Based on defaults for {unanswered} {unanswered === 1 ? 'question' : 'questions'} you haven't answered yet.
                </p>
              )
            )}
          </div>
          <RiskGauge value={value} />
          <p className="text-help text-slate-700">{text}</p>
          <div className="border-t border-slate-200 pt-4">
            <p className="text-caption text-slate-500">What drives this</p>
            <dl className="mt-2 space-y-1.5">
              {drivers.map((d) => (
                <div key={d.label} className="flex items-baseline justify-between gap-3 text-[13px]">
                  <dt className="whitespace-nowrap text-slate-600">{d.label}</dt>
                  <dd className="text-right font-medium text-slate-900">{d.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </aside>
      <aside aria-label="Your Risk Capacity so far" className="fixed inset-x-0 bottom-0 z-20 flex h-14 items-center justify-between gap-3 border-t border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden">
        <p className="text-caption text-slate-500">Risk capacity</p>
        <div className="flex items-center gap-2">
          {prelim && <StatusChip estimate={estimate} />}
          <p className="text-xl font-semibold text-slate-900" aria-live="polite">
            {formatRatio(value)}
          </p>
        </div>
      </aside>
    </>
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
              <p className="text-[15px] font-medium text-slate-800">
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
          <span className="text-success">
            ✔ Knowledge check passed.{' '}
            {!retake && (
              <button type="button" onClick={() => { setRetake(true); setPicks([null, null, null]) }} className="font-medium text-accent-700 underline underline-offset-2">
                Retake
              </button>
            )}
          </span>
        ) : allAnswered && !allCorrect ? (
          <span className="text-warning">Not all three are right yet. Have another look: you can change any answer.</span>
        ) : (
          <span className="text-slate-600">Answer all three to unlock the borrowing option.</span>
        )}
      </Status>

      <div className="rounded-lg border border-amber-200 bg-warning-bg p-4 text-help">
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
            className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-700 ${optIn ? 'bg-accent-700' : 'bg-slate-300'}`}
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
    <p className="text-help" role="status">
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
      <p className="pb-2 text-help text-slate-600">Answers marked “default” use our starting values. You can change any of them.</p>
      <dl className="divide-y divide-slate-200">
        {rows.map(([step, name, value, key]) => (
          <div key={name} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5">
            <dt className="text-help text-slate-600">{name}</dt>
            <dd className="flex items-baseline gap-3 text-help font-medium text-slate-900">
              <span>
                {value}
                {edited[key] === undefined && <span className="ml-1.5 text-xs font-normal text-slate-500">default</span>}
              </span>
              <button type="button" onClick={() => onEdit(step)} className="rounded text-[13px] font-medium text-accent-700 hover:text-accent-800 focus-visible:outline-2 focus-visible:outline-accent-700" aria-label={`Edit ${name}`}>
                Edit
              </button>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
