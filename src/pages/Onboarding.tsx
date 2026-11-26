import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Check, ChevronUp, Lock } from 'lucide-react'
import Badge from '../components/Badge'
import Logo from '../components/Logo'
import RiskGauge from '../components/RiskGauge'
import WhyWeAsk from '../components/WhyWeAsk'
import { btnPrimary, btnSecondary, btnSmall, card, focusRing, pageWrap, textLink } from '../components/ui'
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

const STEP_TITLES = ['About you', 'Your income', 'Safety net', 'Risk & knowledge'] as const
const TOTAL = 16
const REVIEW = TOTAL + 1

type Q = QuestionNo

interface Screen {
  step: number
  label: ReactNode
  hint?: ReactNode
  htmlFor?: string
  body: ReactNode
}

/** Step (0–3) of each question 1–16 (index 0 unused). */
const STEP_OF: number[] = [-1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 3, 3, 3, 3, 3]
const firstOfStep = (step: number) => STEP_OF.indexOf(step)
const countOfStep = (step: number) => STEP_OF.filter((x) => x === step).length

export default function Onboarding() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const q = clampQ(Number(params.get('q')))
  const answers = useProfileStore((s) => s.answers)
  const setAnswer = useProfileStore((s) => s.setAnswer)
  const clearAnswer = useProfileStore((s) => s.clearAnswer)
  const showMyAnswers = useProfileStore((s) => s.showMyAnswers)
  const { profile: p, target, pending } = useMyTarget()

  // Onboarding always edits "My answers", never a persona.
  useEffect(() => showMyAnswers(), [showMyAnswers])

  const set = <K extends keyof Profile>(k: K) => (v: Profile[K]) => setAnswer(k, v)
  const go = (n: number) => {
    setParams({ q: String(clampQ(n)) })
    window.scrollTo({ top: 0 })
  }
  const finish = () => {
    // Store every shown value (defaults included) so "My answers" counts as answered.
    useProfileStore.getState().setAnswers(p)
    navigate('/results')
  }
  const next = () => (q === REVIEW ? finish() : go(q + 1))
  const retireMsg = p.age >= p.retireAge ? 'Retirement age needs to be after your current age.' : undefined
  const unanswered = unansweredCount(answers)
  // G3/G4 are skipped while pending, so the explanation never names a limit the user hasn't answered.
  const explanation = explainBinding(target, p)
  const isReview = q === REVIEW
  const step = isReview ? QUESTION_STEPS : STEP_OF[q]

  const screens: Record<Q, Screen> = {
    1: { step: 0, label: 'How old are you?', hint: 'Your age sets how many working years, and future savings, are still ahead of you.', htmlFor: 'q-age', body: <NumberField id="q-age" size="lg" value={p.age} onChange={set('age')} min={16} max={80} suffix="years" message={retireMsg} /> },
    2: {
      step: 0,
      label: 'When do you expect to retire?',
      hint: 'More working years mean more future savings. You can change this later.',
      htmlFor: 'q-retire',
      body: <SliderField id="q-retire" value={p.retireAge} onChange={set('retireAge')} min={55} max={75} step={1} display={`age ${p.retireAge}`} minLabel="55" maxLabel="75" />,
    },
    3: {
      step: 0,
      label: 'How much do you have invested or saved for investing today?',
      hint: 'Funds, shares, crypto and cash you set aside for investing.',
      htmlFor: 'q-f',
      body: <NumberField id="q-f" size="lg" value={p.investableAssets} onChange={set('investableAssets')} min={0} max={100_000_000} step={500} prefix="€" />,
    },
    4: {
      step: 0,
      label: 'What share of your net income do you invest?',
      hint: 'Only what you actually invest reaches your portfolio.',
      htmlFor: 'q-sav',
      body: <SliderField id="q-sav" value={Math.round(p.savingsRate * 100)} onChange={(v) => setAnswer('savingsRate', v / 100)} min={0} max={40} step={1} display={formatPct(p.savingsRate)} minLabel="0%" maxLabel="40%" />,
    },
    5: { step: 1, label: 'Your net yearly income now', hint: 'Students: your expected first salary, after tax.', htmlFor: 'q-inc', body: <NumberField id="q-inc" size="lg" value={p.incomeNow} onChange={set('incomeNow')} min={0} max={10_000_000} step={1000} prefix="€" suffix="/ year" /> },
    6: {
      step: 1,
      label: 'Where do you expect your income to be in 10 years?',
      hint: "In today's money, after tax.",
      htmlFor: 'q-inc10',
      body: (
        <div className="flex flex-col gap-3">
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
      ),
    },
    7: {
      step: 1,
      label: 'Which sector do you work in, or plan to?',
      hint: 'This tells us whether your salary behaves more like a bond (stable) or a stock (moves with the market).',
      body: <RadioCards name="sector" legend="Sector" options={SECTORS} value={p.sector} onChange={set('sector')} />,
    },
    8: {
      step: 1,
      label: 'How much of your pay is bonus, commission or shares?',
      hint: 'Variable pay usually falls exactly when markets fall.',
      htmlFor: 'q-var',
      body: (
        <div className="flex flex-col gap-3">
          <SliderField id="q-var" value={Math.round(p.variablePayShare * 100)} onChange={(v) => setAnswer('variablePayShare', v / 100)} min={0} max={100} step={5} display={formatPct(p.variablePayShare)} minLabel="0%" maxLabel="100%" />
          <NotSure active={answers.variablePayShare === undefined} onClick={() => clearAnswer('variablePayShare')} defaultText="0%" />
        </div>
      ),
    },
    9: { step: 1, label: 'How secure is your income?', hint: 'Riskier income is worth less today, just as a risky bond is priced lower than a safe one.', body: <RadioCards name="security" legend="Income security" options={SECURITY} value={p.incomeSecurity} onChange={set('incomeSecurity')} /> },
    10: { step: 2, label: 'How many months of expenses could you cover with savings?', hint: 'Count cash you could reach quickly, not your investments.', body: <RadioCards name="buffer" legend="Months of buffer" options={BUFFER} value={p.bufferMonths} onChange={set('bufferMonths')} columns={3} /> },
    11: { step: 2, label: 'Highest interest rate on any debt you have?', hint: 'Enter 0 if you have no debt.', htmlFor: 'q-debt', body: <NumberField id="q-debt" size="lg" value={roundPct(p.maxDebtRate)} onChange={(v) => setAnswer('maxDebtRate', v / 100)} min={0} max={100} step={0.5} suffix="%" /> },
    12: { step: 3, label: `“${drawdownQuestion(p.investableAssets)}”`, hint: "There's no right answer. Pick what you'd actually do.", body: <RadioCards name="drawdown" legend="Reaction to a fall" options={DRAWDOWN} value={p.drawdownReaction} onChange={set('drawdownReaction')} /> },
    13: {
      step: 3,
      label: "“You're offered a job: 50% chance it doubles your income, 50% chance it cuts it. What's the largest cut you'd accept?”",
      hint: 'A classic economics question about risk with your own income.',
      body: <RadioCards name="gamble" legend="Largest income cut" options={GAMBLE} value={p.incomeGamble} onChange={set('incomeGamble')} />,
    },
    14: {
      step: 3,
      label: 'What is the most you could lose in a bad year without changing your plans?',
      hint: 'This is your capacity to bear losses, in euros.',
      htmlFor: 'q-loss',
      body: (
        <div className="flex flex-col gap-3">
          <NumberField id="q-loss" size="lg" value={p.maxLossMoney} onChange={set('maxLossMoney')} min={0} max={100_000_000} step={500} prefix="€" />
          <NotSure active={answers.maxLossMoney === undefined} onClick={() => clearAnswer('maxLossMoney')} defaultText={`${roundPct(assumptions.defaultMaxLossShare)}% of what you invest (${formatEUR(p.maxLossMoney)})`} />
        </div>
      ),
    },
    15: { step: 3, label: 'How much investing experience do you have?', hint: 'Have you held investments through a fall?', body: <RadioCards name="experience" legend="Investing experience" options={EXPERIENCE} value={p.experience} onChange={set('experience')} columns={3} /> },
    16: { step: 3, label: 'Knowledge check and borrowing opt-in', hint: 'Three short questions. Borrowing can only be switched on when all three are right.', body: <KnowledgeCheck /> },
  }

  return (
    <>
      <OnboardingBar step={step} q={q} isReview={isReview} onSave={() => navigate('/')} />
      <div className={`${pageWrap} flex flex-wrap items-start gap-12 pt-10 pb-28 sm:pt-14 lg:pb-20`}>
        <section
          aria-label={isReview ? 'Your answers' : STEP_TITLES[step]}
          className="flex min-w-0 flex-[999_1_560px] flex-col gap-7"
          onKeyDown={(e) => {
            // "or press Enter ↵": Enter in a field moves on (buttons, links and <summary> keep their own Enter).
            const t = e.target as HTMLElement
            if (e.key === 'Enter' && t.tagName === 'INPUT') {
              e.preventDefault()
              next()
            }
          }}
        >
          <div key={q} className="q-enter">
            {isReview ? (
              <Review profile={p} edited={answers} onEdit={go} />
            ) : (
              <Question number={q} total={TOTAL} label={screens[q as Q].label} hint={screens[q as Q].hint} htmlFor={screens[q as Q].htmlFor} why={<WhyWeAsk content={WHY_WE_ASK[q as Q]} effect={answerEffect(q as Q, p, { pending })} />}>
                {screens[q as Q].body}
              </Question>
            )}
          </div>

          <nav aria-label="Onboarding steps" className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <button type="button" onClick={() => go(q - 1)} disabled={q === 1} className={`${btnSecondary} disabled:invisible`}>
              Back
            </button>
            <div className="flex items-center gap-4">
              <span className="hidden text-[13px] text-muted sm:inline">
                or press <kbd className="rounded-md border border-line px-[7px] py-0.5 font-sans text-ink-2">Enter ↵</kbd>
              </span>
              <button type="button" onClick={next} className={btnPrimary}>
                {isReview ? 'See my result' : q === TOTAL ? 'Review answers' : 'Continue'}
              </button>
            </div>
          </nav>
          <p className="text-[13px] text-muted">You can change any answer later.</p>
        </section>

        <SummaryPanel value={target.finalEEE} estimate={pending.length > 0} unanswered={unanswered} text={explanation} drivers={driverLines(target)} />
      </div>
    </>
  )
}

function clampQ(n: number) {
  return Number.isInteger(n) && n >= 1 && n <= REVIEW ? n : 1
}

const roundPct = (x: number) => Math.round(x * 1000) / 10

/** Top bar: logo, "Step 2 of 4 · Your income" with 4 progress segments, "Save and finish later". */
function OnboardingBar({ step, q, isReview, onSave }: { step: number; q: number; isReview: boolean; onSave: () => void }) {
  const fill = (i: number) => (i < step ? 1 : i > step ? 0 : isReview ? 1 : (q - firstOfStep(i) + 1) / countOfStep(i))
  const done = isReview ? QUESTION_STEPS : step
  return (
    <header className="border-b border-line">
      <div className={`${pageWrap} flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-3.5 sm:py-[18px]`}>
        <Logo compact />
        <div className="order-3 flex w-full items-center gap-3.5 sm:order-none sm:w-auto sm:max-w-[520px] sm:flex-[1_1_320px]">
          <span className="whitespace-nowrap text-[13px] text-ink-2">{isReview ? 'Review' : `Step ${step + 1} of ${QUESTION_STEPS} · ${STEP_TITLES[step]}`}</span>
          <div className="grid flex-1 grid-cols-4 gap-1.5" role="progressbar" aria-label="Onboarding progress" aria-valuemin={0} aria-valuemax={QUESTION_STEPS} aria-valuenow={done}>
            {Array.from({ length: QUESTION_STEPS }, (_, i) => (
              <span key={i} className="h-1 overflow-hidden rounded bg-line">
                <span className="block h-full rounded bg-lime transition-[width] duration-200 motion-reduce:transition-none" style={{ width: `${fill(i) * 100}%` }} />
              </span>
            ))}
          </div>
        </div>
        <button type="button" onClick={onSave} className={btnSmall}>
          Save and finish later
        </button>
      </div>
    </header>
  )
}

/** "Estimate" while step-4 limits are pending; otherwise "Preliminary" while any default is in use. */
function StatusChip({ estimate }: { estimate: boolean }) {
  return <Badge tone="warning">{estimate ? 'Estimate' : 'Preliminary'}</Badge>
}

interface PanelProps {
  value: number
  estimate: boolean
  unanswered: number
  text: string
  drivers: { label: string; value: string }[]
}

/** Desktop: sticky side panel. Phones: a 56px bottom bar that opens the same panel as a sheet. */
function SummaryPanel(props: PanelProps) {
  const { value, estimate, unanswered } = props
  const prelim = estimate || unanswered > 0
  const sheet = useRef<HTMLDialogElement>(null)
  return (
    <>
      <aside aria-label="Your Risk Capacity so far" className={`${card} hidden max-w-[400px] flex-[1_1_340px] rounded-[24px] p-7 lg:sticky lg:top-6 lg:block`}>
        <PanelBody {...props} />
      </aside>
      <button
        type="button"
        onClick={() => sheet.current?.showModal()}
        aria-haspopup="dialog"
        className={`fixed inset-x-0 bottom-0 z-20 flex h-14 items-center justify-between gap-3 border-t border-line bg-surface/95 px-4 backdrop-blur lg:hidden ${focusRing}`}
      >
        <span className="text-label">Risk capacity</span>
        <span className="flex items-center gap-2.5">
          {prelim && <StatusChip estimate={estimate} />}
          <span className="font-display text-[22px] font-semibold text-ink" aria-live="polite">
            {formatRatio(value)}
          </span>
          <ChevronUp size={18} className="text-ink-2" aria-hidden />
          <span className="sr-only">Open details</span>
        </span>
      </button>
      <dialog
        ref={sheet}
        aria-label="Your Risk Capacity so far"
        onClick={(e) => e.target === sheet.current && sheet.current?.close()}
        className="mx-0 mt-auto mb-0 max-h-[85vh] w-full max-w-none rounded-t-[24px] border border-line bg-surface p-0 text-ink backdrop:bg-black/60 lg:hidden"
      >
        <div className="p-6">
          <div className="mb-4 flex justify-end">
            <button type="button" onClick={() => sheet.current?.close()} className={btnSmall}>
              Close
            </button>
          </div>
          <PanelBody {...props} />
        </div>
      </dialog>
    </>
  )
}

function PanelBody({ value, estimate, unanswered, text, drivers }: PanelProps) {
  const prelim = estimate || unanswered > 0
  return (
    <div className="flex flex-col gap-[22px]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-label">Your risk capacity</p>
        {prelim && <StatusChip estimate={estimate} />}
      </div>
      <div className="flex flex-col items-center">
        <RiskGauge value={value} width={260} />
        <p className="-mt-12 text-display-md text-ink" aria-live="polite">
          {formatRatio(value)}
        </p>
      </div>
      <div className="space-y-2 text-help text-ink-2">
        {estimate ? (
          <p>{ESTIMATE_NOTE}</p>
        ) : (
          prelim && (
            <p>
              Based on defaults for {unanswered} {unanswered === 1 ? 'question' : 'questions'} you haven't answered yet.
            </p>
          )
        )}
        <p>{text}</p>
      </div>
      <div className="h-px bg-line" />
      <div className="flex flex-col gap-3.5">
        <p className="text-label">What drives this</p>
        <dl className="flex flex-col gap-3.5">
          {drivers.map((d) => (
            <div key={d.label} className="flex items-baseline justify-between gap-3 text-help">
              <dt className="whitespace-nowrap text-ink-2">{d.label}</dt>
              <dd className="text-right font-medium text-ink">{d.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="flex items-start gap-2.5 rounded-[14px] bg-surface-2 px-4 py-3.5">
        <Lock size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-ink-2" aria-hidden />
        <p className="text-[13px] leading-normal text-ink-2">Your answers stay in your browser. Nothing is sent anywhere.</p>
      </div>
    </div>
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
    <div className="flex flex-col gap-6">
      {showQuiz ? (
        <ol className="flex flex-col gap-6">
          {KNOWLEDGE.map((k, i) => (
            <li key={k.q} className="flex flex-col gap-3">
              <p className="text-base font-medium text-ink">
                {String.fromCharCode(97 + i)}) {k.q}
              </p>
              <RadioCards name={`kc-${i}`} legend={k.q} options={k.options.map((label, v) => ({ value: v, label }))} value={picks[i] ?? -1} onChange={(v) => pick(i, v)} columns={1} />
            </li>
          ))}
        </ol>
      ) : null}

      <p className="text-help" role="status">
        {passed ? (
          <span className="inline-flex flex-wrap items-center gap-2 text-lime">
            <Check size={16} strokeWidth={2.5} aria-hidden /> Knowledge check passed.
            {!retake && (
              <button
                type="button"
                onClick={() => {
                  setRetake(true)
                  setPicks([null, null, null])
                }}
                className={`underline underline-offset-2 ${textLink}`}
              >
                Retake
              </button>
            )}
          </span>
        ) : allAnswered && !allCorrect ? (
          <span className="text-warn">Not all three are right yet. Have another look: you can change any answer.</span>
        ) : (
          <span className="text-ink-2">Answer all three to unlock the borrowing option.</span>
        )}
      </p>

      <div className="rounded-2xl border border-warn-line bg-warn-bg p-5 text-help">
        <div className="flex items-center justify-between gap-4">
          <span id="optin-label" className="font-semibold text-ink">
            Allow borrowing to invest (above 1.0×)
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={optIn}
            aria-labelledby="optin-label"
            disabled={!passed}
            onClick={() => setAnswers({ leverageOptIn: !optIn })}
            className={`relative h-7 w-12 shrink-0 rounded-full border transition disabled:cursor-not-allowed disabled:opacity-40 ${focusRing} ${optIn ? 'border-lime bg-lime' : 'border-line-strong bg-surface-2'}`}
          >
            <span className={`absolute top-[3px] h-5 w-5 rounded-full transition-all ${optIn ? 'left-[23px] bg-on-lime' : 'left-[3px] bg-ink-2'}`} />
          </button>
        </div>
        <p className="mt-2 text-panel">Borrowing magnifies both gains and losses, and in a crash the broker can sell your holdings (a margin call). Off by default.</p>
      </div>
    </div>
  )
}

const BUFFER_LABEL = Object.fromEntries(BUFFER.map((o) => [o.value, o.label]))
const label = <T extends string | number>(opts: RadioOption<T>[], v: T) => opts.find((o) => o.value === v)?.label ?? String(v)

/** Summary of all 16 answers with links straight back to each question. */
function Review({ profile: p, edited, onEdit }: { profile: Profile; edited: Partial<Profile>; onEdit: (q: number) => void }) {
  const rows: [number, string, string, keyof Profile][] = [
    [1, 'Age', `${p.age}`, 'age'],
    [2, 'Retirement age', `${p.retireAge}`, 'retireAge'],
    [3, 'Invested today', formatEUR(p.investableAssets), 'investableAssets'],
    [4, 'Share of income invested', formatPct(p.savingsRate), 'savingsRate'],
    [5, 'Net income now', formatEUR(p.incomeNow), 'incomeNow'],
    [6, 'Income in 10 years', `${formatEUR(p.income10y)} (${impliedGrowthLabel(p)})`, 'income10y'],
    [7, 'Sector', label(SECTORS, p.sector), 'sector'],
    [8, 'Bonus, commission or shares', formatPct(p.variablePayShare), 'variablePayShare'],
    [9, 'Income security', label(SECURITY, p.incomeSecurity), 'incomeSecurity'],
    [10, 'Emergency buffer', BUFFER_LABEL[p.bufferMonths] ?? `${p.bufferMonths} months`, 'bufferMonths'],
    [11, 'Highest debt interest', formatPct(p.maxDebtRate), 'maxDebtRate'],
    [12, 'After a 30% fall', label(DRAWDOWN, p.drawdownReaction), 'drawdownReaction'],
    [13, 'Largest income cut accepted', label(GAMBLE, p.incomeGamble), 'incomeGamble'],
    [14, 'Max loss in a bad year', formatEUR(p.maxLossMoney), 'maxLossMoney'],
    [15, 'Experience', label(EXPERIENCE, p.experience), 'experience'],
    [16, 'Knowledge check / borrowing', `${p.knowledgeCheckPassed ? 'Passed' : 'Not passed'} · ${p.leverageOptIn ? 'opted in' : 'off'}`, 'knowledgeCheckPassed'],
  ]
  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-3">
        <p className="text-[13px] font-semibold tracking-[0.04em] text-lime">REVIEW</p>
        <h1 className="font-display text-[30px] leading-[1.15] font-semibold tracking-[-0.02em] text-ink sm:text-h1">Your answers</h1>
        <p className="max-w-[620px] text-[17px] leading-[1.55] text-ink-2">Answers marked “default” use our starting values. You can change any of them.</p>
      </div>
      <dl className={`${card} divide-y divide-line px-5 sm:px-6`}>
        {rows.map(([q, name, value, key]) => (
          <div key={name} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
            <dt className="text-help text-ink-2">{name}</dt>
            <dd className="flex items-baseline gap-3 text-help font-medium text-ink">
              <span>
                {value}
                {edited[key] === undefined && <span className="ml-1.5 text-xs font-normal text-muted">default</span>}
              </span>
              <button type="button" onClick={() => onEdit(q)} className={`text-[13px] ${textLink}`} aria-label={`Edit ${name}`}>
                Edit
              </button>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
