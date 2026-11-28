import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Check, ChevronUp, Lock } from 'lucide-react'
import Badge from '../components/Badge'
import Logo from '../components/Logo'
import RiskGauge from '../components/RiskGauge'
import WhyWeAsk from '../components/WhyWeAsk'
import { btnPrimary, btnSecondary, btnSmall, card, focusRing, pageWrap, textLink } from '../components/ui'
import { MoneyField, NotSure, NumberField, Question, RadioCards, SliderField, type RadioOption } from '../components/fields'
import { CURRENCY_WHY, WHY_WE_ASK } from '../content/whyWeAsk'
import { CURRENCIES, CURRENCY_NAME, type Currency } from '../data/fx'
import {
  answerEffect,
  assumptions,
  CAP_LABEL,
  currencySymbol,
  driverLines,
  drawdownQuestion,
  explainGrowthCap,
  niceAmount,
  panelExplanation,
  unansweredCount,
  type QuestionNo,
  formatPct,
  formatRatio,
  impliedGrowthLabel,
  type Experience,
  type IncomeSecurity,
  type Likert,
  type Profile,
  type Sector,
} from '../engine'
import { changeCurrency, useCurrency, useMyTarget } from '../store/hooks'
import { useProfileStore, type BorrowChoice, type KnowledgePicks } from '../store/profileStore'

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

const CURRENCY_OPTIONS: RadioOption<Currency>[] = CURRENCIES.map((c) => ({ value: c, label: c, description: CURRENCY_NAME[c] }))

/** Log-slider ranges for the money questions, in EUR (converted with fx and rounded, BUILD_SPEC 18.1–18.2). */
const SLIDER_EUR = { invested: [500, 1_000_000], income: [5_000, 500_000], loss: [100, 1_000_000] } as const

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

/** Step (0–3) of each screen: 0 = currency ("Before we start"), then questions 1–16. */
const STEP_OF: number[] = [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 3, 3, 3, 3, 3]
const firstOfStep = (step: number) => STEP_OF.indexOf(step)
const countOfStep = (step: number) => STEP_OF.filter((x) => x === step).length

export default function Onboarding() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const rawQ = clampQ(Number(params.get('q')))
  const answers = useProfileStore((s) => s.answers)
  const borrowChoice = useProfileStore((s) => s.borrowChoice)
  const setAnswer = useProfileStore((s) => s.setAnswer)
  const clearAnswer = useProfileStore((s) => s.clearAnswer)
  const showMyAnswers = useProfileStore((s) => s.showMyAnswers)
  const { profile: p, target, pending, borrowingMatters, estimate } = useMyTarget()
  // Q16 is skipped when borrowing can't change the result (target without the borrowing rule ≤ 1.0×).
  const skip16 = !borrowingMatters
  const total = skip16 ? TOTAL - 1 : TOTAL
  const q = skip16 && rawQ === 16 ? REVIEW : rawQ
  const { currency, fx, money } = useCurrency()
  const symbol = currencySymbol(currency)
  const range = (k: keyof typeof SLIDER_EUR) => ({ sliderMin: niceAmount(SLIDER_EUR[k][0] * fx), sliderMax: niceAmount(SLIDER_EUR[k][1] * fx) })
  const minAssets = money(assumptions.minAssetsForLeverage * fx)

  // Onboarding always edits "My answers", never a persona.
  useEffect(() => showMyAnswers(), [showMyAnswers])

  const set = <K extends keyof Profile>(k: K) => (v: Profile[K]) => setAnswer(k, v)
  const go = (n: number) => {
    let to = clampQ(n)
    if (skip16 && to === 16) to = n > q ? REVIEW : 15
    setParams({ q: String(to) })
    window.scrollTo({ top: 0 })
  }
  const finish = () => {
    // Store every shown value (defaults included) so "My answers" counts as answered.
    useProfileStore.getState().setAnswers(p)
    navigate('/results')
  }
  const next = () => (q === REVIEW ? finish() : go(q + 1))
  const retireMsg = p.age >= p.retireAge ? 'Retirement age needs to be after your current age.' : undefined
  // A skipped Q16 doesn't count as unanswered.
  const unanswered = unansweredCount(answers) - (skip16 && answers.knowledgeCheckPassed === undefined ? 1 : 0)
  const borrowing = borrowChoice === 'no' ? 'declined' : skip16 ? 'not-needed' : undefined
  // G3/G4 are skipped while pending, so the explanation never names a limit the user hasn't answered (BUILD_SPEC 18.3).
  const explanation = panelExplanation(target, p, { answers, estimate, unanswered, currency, borrowing })
  const growthNotice = explainGrowthCap(p)
  const incomeBase = p.incomeNow > 0 ? p.incomeNow : niceAmount(40000 * fx)
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
      body: (
        <div className="flex flex-col gap-4">
          <MoneyField id="q-f" value={p.investableAssets} onChange={set('investableAssets')} symbol={symbol} format={money} max={100_000_000 * fx} {...range('invested')} sliderLabel="Invested today, slider" />
          <SmallAmountCheck value={p.investableAssets} money={money} onCorrect={set('investableAssets')} />
        </div>
      ),
    },
    4: {
      step: 0,
      label: 'What share of your net income do you invest?',
      hint: 'Only what you actually invest reaches your portfolio.',
      htmlFor: 'q-sav',
      body: <SliderField id="q-sav" value={Math.round(p.savingsRate * 100)} onChange={(v) => setAnswer('savingsRate', v / 100)} min={0} max={40} step={1} display={formatPct(p.savingsRate)} minLabel="0%" maxLabel="40%" />,
    },
    5: {
      step: 1,
      label: 'Your net yearly income now',
      hint: 'Students: your expected first salary, after tax.',
      htmlFor: 'q-inc',
      body: <MoneyField id="q-inc" value={p.incomeNow} onChange={set('incomeNow')} symbol={symbol} format={money} max={10_000_000 * fx} {...range('income')} suffix="/ year" sliderLabel="Net income now, slider" />,
    },
    6: {
      step: 1,
      label: 'Where do you expect your income to be in 10 years?',
      hint: "In today's money, after tax.",
      htmlFor: 'q-inc10',
      body: (
        <div className="flex flex-col gap-3">
          {/* Exact amount: typed up to 20× today's income, log slider 0.5×–5× (never derived from the growth cap). */}
          <MoneyField
            id="q-inc10"
            value={p.income10y}
            onChange={set('income10y')}
            symbol={symbol}
            format={money}
            max={Math.round(incomeBase * 20)}
            sliderMin={Math.round(incomeBase * 0.5)}
            sliderMax={Math.round(incomeBase * 5)}
            suffix="/ year"
            sliderLabel="Income in 10 years, slider"
            hint={
              <>
                <span className="block">{impliedGrowthLabel(p)}</span>
                {growthNotice && (
                  <span className="mt-1 block text-warn" role="status">
                    {growthNotice}
                  </span>
                )}
              </>
            }
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
    12: { step: 3, label: `“${drawdownQuestion(p.investableAssets, currency)}”`, hint: "There's no right answer. Pick what you'd actually do.", body: <RadioCards name="drawdown" legend="Reaction to a fall" options={DRAWDOWN} value={p.drawdownReaction} onChange={set('drawdownReaction')} /> },
    13: {
      step: 3,
      label: "“You're offered a job: 50% chance it doubles your income, 50% chance it cuts it. What's the largest cut you'd accept?”",
      hint: 'A classic economics question about risk with your own income.',
      body: <RadioCards name="gamble" legend="Largest income cut" options={GAMBLE} value={p.incomeGamble} onChange={set('incomeGamble')} />,
    },
    14: {
      step: 3,
      label: 'What is the most you could lose in a bad year without changing your plans?',
      hint: 'This is your capacity to bear losses, in money rather than percentages.',
      htmlFor: 'q-loss',
      body: (
        <div className="flex flex-col gap-3">
          <MoneyField id="q-loss" value={p.maxLossMoney} onChange={set('maxLossMoney')} symbol={symbol} format={money} max={100_000_000 * fx} {...range('loss')} sliderLabel="Max loss in a bad year, slider" />
          <NotSure active={answers.maxLossMoney === undefined} onClick={() => clearAnswer('maxLossMoney')} defaultText={`${roundPct(assumptions.defaultMaxLossShare)}% of what you invest (${money(p.maxLossMoney)})`} />
        </div>
      ),
    },
    15: { step: 3, label: 'How much investing experience do you have?', hint: 'Have you held investments through a fall?', body: <RadioCards name="experience" legend="Investing experience" options={EXPERIENCE} value={p.experience} onChange={set('experience')} columns={3} /> },
    16: {
      step: 3,
      label: 'Would you consider borrowing to invest, e.g. a loan from your broker, if your situation allows it?',
      hint: 'Your other answers support more than 1.0×, which is only possible with borrowing. If you say yes, three short questions check that you know the risks first.',
      body: <BorrowingStep />,
    },
  }

  return (
    <>
      <OnboardingBar step={step} q={q} isReview={isReview} skip16={skip16} onSave={() => navigate('/')} />
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
              <Review profile={p} edited={answers} onEdit={go} currency={currency} money={money} skip16={skip16} borrowChoice={borrowChoice} />
            ) : q === 0 ? (
              <Question
                number={0}
                total={total}
                eyebrow="BEFORE WE START"
                label="Which currency should we use?"
                hint="Every amount will be shown in this currency. You can change it later."
                why={<WhyWeAsk content={CURRENCY_WHY} minAssets={minAssets} effect={`Your Risk Capacity stays ${formatRatio(target.finalEEE)} in every currency: amounts are converted, ratios are not.`} />}
              >
                <RadioCards name="currency" legend="Currency" options={CURRENCY_OPTIONS} value={currency} onChange={changeCurrency} columns={3} />
              </Question>
            ) : (
              <Question number={q} total={total} label={screens[q as Q].label} hint={screens[q as Q].hint} htmlFor={screens[q as Q].htmlFor} why={<WhyWeAsk content={WHY_WE_ASK[q as Q]} minAssets={minAssets} effect={answerEffect(q as Q, p, { pending, currency })} />}>
                {screens[q as Q].body}
              </Question>
            )}
          </div>

          <nav aria-label="Onboarding steps" className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <button type="button" onClick={() => go(q - 1)} disabled={q === 0} className={`${btnSecondary} disabled:invisible`}>
              Back
            </button>
            <div className="flex items-center gap-4">
              <span className="hidden text-[13px] text-muted sm:inline">
                or press <kbd className="rounded-md border border-line px-[7px] py-0.5 font-sans text-ink-2">Enter ↵</kbd>
              </span>
              <button type="button" onClick={next} className={btnPrimary}>
                {isReview ? 'See my result' : q === total ? 'Review answers' : 'Continue'}
              </button>
            </div>
          </nav>
          <p className="text-[13px] text-muted">You can change any answer later.</p>
        </section>

        <SummaryPanel value={target.finalEEE} estimate={estimate} unanswered={unanswered} lines={explanation} drivers={panelDrivers(driverLines(target, p.investableAssets, currency), target, answers, estimate)} />
      </div>
    </>
  )
}

const NOT_ANSWERED = 'not answered yet'

/**
 * "What drives this" rows for the side panel (BUILD_SPEC 15): risk attitude says "not answered yet" until Q12–13
 * are answered, and a Limits row names the limit that applies, or "not answered yet" while Q14/Q16 are pending.
 * Display only: every value is engine output.
 */
function panelDrivers(
  lines: { label: string; value: string }[],
  t: ReturnType<typeof useMyTarget>['target'],
  answers: Partial<Profile>,
  limitsPending: boolean,
): { label: string; value: string }[] {
  const attitudeOpen = answers.drawdownReaction === undefined || answers.incomeGamble === undefined
  const rows = lines.map((d) => (d.label === 'Risk attitude' && attitudeOpen ? { ...d, value: NOT_ANSWERED } : d))
  const cap = t.caps.find((c) => c.id === t.binding)
  const limits = limitsPending ? NOT_ANSWERED : cap ? `${CAP_LABEL[cap.id]} · ${formatRatio(cap.value)}` : 'None reached'
  return [...rows, { label: 'Limits', value: limits }]
}

function clampQ(n: number) {
  return Number.isInteger(n) && n >= 0 && n <= REVIEW ? n : 0
}

const roundPct = (x: number) => Math.round(x * 1000) / 10

/** Top bar: logo, "Step 2 of 4 · Your income" with 4 progress segments, "Save and finish later". */
function OnboardingBar({ step, q, isReview, skip16, onSave }: { step: number; q: number; isReview: boolean; skip16: boolean; onSave: () => void }) {
  const count = (i: number) => countOfStep(i) - (skip16 && i === STEP_OF[16] ? 1 : 0)
  const fill = (i: number) => (i < step ? 1 : i > step ? 0 : isReview ? 1 : (q - firstOfStep(i) + 1) / count(i))
  const done = isReview ? QUESTION_STEPS : step
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur-md">
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
  /** Explanation sentences, each shown once (engine panelExplanation). */
  lines: string[]
  drivers: { label: string; value: string }[]
}

/** Desktop: sticky side panel. Phones: a 56px bottom bar that opens the same panel as a sheet. */
function SummaryPanel(props: PanelProps) {
  const { value, estimate, unanswered } = props
  const prelim = estimate || unanswered > 0
  const sheet = useRef<HTMLDialogElement>(null)
  return (
    <>
      <aside aria-label="Your Risk Capacity so far" className={`${card} hidden max-w-[400px] flex-[1_1_340px] rounded-[24px] p-7 lg:sticky lg:top-[104px] lg:block`}>
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

function PanelBody({ value, estimate, unanswered, lines, drivers }: PanelProps) {
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
        {lines.map((l) => (
          <p key={l}>{l}</p>
        ))}
      </div>
      <div className="h-px bg-line" />
      <div className="flex flex-col gap-3.5">
        <p className="text-label">What drives this</p>
        <dl className="flex flex-col gap-3.5">
          {drivers.map((d) => (
            <div key={d.label} className="flex items-baseline justify-between gap-3 text-help">
              <dt className="whitespace-nowrap text-ink-2">{d.label}</dt>
              <dd className={`text-right ${d.value === NOT_ANSWERED ? 'text-muted italic' : 'font-medium text-ink'}`}>{d.value}</dd>
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

/** Below this amount (in the chosen currency) question 3 asks whether the user meant thousands. */
const SMALL_AMOUNT = 100

/**
 * Gentle check on question 3: an amount above 0 but below 100 is often thousands typed without the zeros.
 * Offers the ×1,000 amount; "keep" hides the check for that amount.
 */
function SmallAmountCheck({ value, money, onCorrect }: { value: number; money: (x: number) => string; onCorrect: (v: number) => void }) {
  const [kept, setKept] = useState<number | null>(null)
  if (!(value > 0 && value < SMALL_AMOUNT) || kept === value) return null
  const thousands = value * 1000
  return (
    <div role="status" className="flex max-w-xl flex-col gap-3 rounded-2xl border border-warn-line bg-warn-bg p-4 text-help">
      <p className="text-ink">
        Did you mean <strong>{money(thousands)}</strong>?
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btnSmall} onClick={() => onCorrect(thousands)}>
          Yes, use {money(thousands)}
        </button>
        <button type="button" className={btnSmall} onClick={() => setKept(value)}>
          No, keep {money(value)}
        </button>
      </div>
    </div>
  )
}

const BORROW_OPTIONS: RadioOption<BorrowChoice>[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unsure', label: 'Not sure, tell me more' },
]

/** True only when all three knowledge-check answers are given and correct. */
const knowledgePassed = (picks: KnowledgePicks) => KNOWLEDGE.every((k, i) => picks[i] === k.correct)

/**
 * Question 16. A gating question first ("Would you consider borrowing?"):
 * No → borrowing off, no knowledge check. Not sure → a short explanation, then the same choice.
 * Yes → three multiple-choice questions (saved, so the radios show them again), then the opt-in switch,
 * which can only be switched on when all three answers are right.
 */
function BorrowingStep() {
  const choice = useProfileStore((s) => s.borrowChoice)
  const picks = useProfileStore((s) => s.knowledgePicks)
  const optIn = useProfileStore((s) => s.answers.leverageOptIn ?? false)
  const allAnswered = picks.every((x) => x !== null)
  const passed = allAnswered && knowledgePassed(picks)

  /** Saves the answers and keeps knowledgeCheckPassed in line with them (undefined until all three are answered). */
  function saveCheck(next: KnowledgePicks) {
    const st = useProfileStore.getState()
    st.setKnowledgePicks(next)
    if (next.every((x) => x !== null)) {
      const ok = knowledgePassed(next)
      st.setAnswers(ok ? { knowledgeCheckPassed: true } : { knowledgeCheckPassed: false, leverageOptIn: false })
    } else {
      st.clearAnswer('knowledgeCheckPassed')
      st.setAnswers({ leverageOptIn: false })
    }
  }

  function choose(v: BorrowChoice) {
    const st = useProfileStore.getState()
    st.setBorrowChoice(v)
    if (v === 'unsure') {
      // Not an answer yet: Q16 stays open until Yes or No.
      st.clearAnswer('knowledgeCheckPassed')
      st.clearAnswer('leverageOptIn')
      return
    }
    if (v === 'no') st.setAnswers({ knowledgeCheckPassed: false, leverageOptIn: false })
    else saveCheck(st.knowledgePicks)
  }

  return (
    <div className="flex flex-col gap-6">
      <RadioCards name="borrow" legend="Would you consider borrowing to invest?" options={BORROW_OPTIONS} value={choice ?? ('' as BorrowChoice)} onChange={choose} columns={3} />

      {choice === 'unsure' && (
        <div role="status" className="space-y-2 rounded-2xl border border-line bg-surface p-5 text-help text-panel">
          <p>Borrowing to invest means taking a loan, usually from your broker, and investing it on top of your own money.</p>
          <p>Gains and losses are both magnified: at 1.5×, a 20% fall in stocks costs you about 30% of your own money.</p>
          <p>If prices fall far enough, the broker can demand more money or sell your investments for you (a margin call), often at the worst moment.</p>
          <p className="font-medium text-ink">Knowing this, would you consider it? Choose Yes or No above.</p>
        </div>
      )}

      {choice === 'no' && (
        <p className="text-help text-ink-2" role="status">
          Borrowing stays off, so your Risk Capacity is capped at 1.0×. You can change this at any time.
        </p>
      )}

      {choice === 'yes' && (
        <>
          <ol className="flex flex-col gap-6">
            {KNOWLEDGE.map((k, i) => (
              <li key={k.q} className="flex flex-col gap-3">
                <p className="text-base font-medium text-ink">
                  {String.fromCharCode(97 + i)}) {k.q}
                </p>
                <RadioCards
                  name={`kc-${i}`}
                  legend={k.q}
                  options={k.options.map((label, v) => ({ value: v, label }))}
                  value={picks[i] ?? -1}
                  onChange={(v) => saveCheck(picks.map((x, j) => (j === i ? v : x)) as KnowledgePicks)}
                  columns={1}
                />
              </li>
            ))}
          </ol>

          <p className="text-help" role="status">
            {passed ? (
              <span className="inline-flex items-center gap-2 text-lime">
                <Check size={16} strokeWidth={2.5} aria-hidden /> Knowledge check passed.
              </span>
            ) : allAnswered ? (
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
                aria-checked={optIn && passed}
                aria-labelledby="optin-label"
                disabled={!passed}
                onClick={() => useProfileStore.getState().setAnswers({ leverageOptIn: !optIn })}
                className={`relative h-7 w-12 shrink-0 rounded-full border transition disabled:cursor-not-allowed disabled:opacity-40 ${focusRing} ${optIn && passed ? 'border-lime bg-lime' : 'border-line-strong bg-surface-2'}`}
              >
                <span className={`absolute top-[3px] h-5 w-5 rounded-full transition-all ${optIn && passed ? 'left-[23px] bg-on-lime' : 'left-[3px] bg-ink-2'}`} />
              </button>
            </div>
            <p className="mt-2 text-panel">Borrowing magnifies both gains and losses, and in a crash the broker can sell your holdings (a margin call). Off by default.</p>
          </div>
        </>
      )}
    </div>
  )
}

const BUFFER_LABEL = Object.fromEntries(BUFFER.map((o) => [o.value, o.label]))
const label = <T extends string | number>(opts: RadioOption<T>[], v: T) => opts.find((o) => o.value === v)?.label ?? String(v)

/** Summary of all 16 answers with links straight back to each question. */
function Review({ profile: p, edited, onEdit, currency, money, skip16, borrowChoice }: { profile: Profile; edited: Partial<Profile>; onEdit: (q: number) => void; currency: Currency; money: (x: number) => string; skip16: boolean; borrowChoice?: BorrowChoice }) {
  const rows: [number, string, string, keyof Profile | null][] = [
    [0, 'Currency', `${currency} · ${CURRENCY_NAME[currency]}`, null],
    [1, 'Age', `${p.age}`, 'age'],
    [2, 'Retirement age', `${p.retireAge}`, 'retireAge'],
    [3, 'Invested today', money(p.investableAssets), 'investableAssets'],
    [4, 'Share of income invested', formatPct(p.savingsRate), 'savingsRate'],
    [5, 'Net income now', money(p.incomeNow), 'incomeNow'],
    [6, 'Income in 10 years', `${money(p.income10y)} (${impliedGrowthLabel(p)})`, 'income10y'],
    [7, 'Sector', label(SECTORS, p.sector), 'sector'],
    [8, 'Bonus, commission or shares', formatPct(p.variablePayShare), 'variablePayShare'],
    [9, 'Income security', label(SECURITY, p.incomeSecurity), 'incomeSecurity'],
    [10, 'Emergency buffer', BUFFER_LABEL[p.bufferMonths] ?? `${p.bufferMonths} months`, 'bufferMonths'],
    [11, 'Highest debt interest', formatPct(p.maxDebtRate), 'maxDebtRate'],
    [12, 'After a 30% fall', label(DRAWDOWN, p.drawdownReaction), 'drawdownReaction'],
    [13, 'Largest income cut accepted', label(GAMBLE, p.incomeGamble), 'incomeGamble'],
    [14, 'Max loss in a bad year', money(p.maxLossMoney), 'maxLossMoney'],
    [15, 'Experience', label(EXPERIENCE, p.experience), 'experience'],
    [16, 'Borrowing to invest', borrowChoice === 'no' ? 'No' : borrowChoice === 'unsure' ? 'Not decided yet' : `Knowledge check ${p.knowledgeCheckPassed ? 'passed' : 'not passed'} · borrowing ${p.leverageOptIn ? 'on' : 'off'}`, 'knowledgeCheckPassed'],
  ].filter(([q]) => !(skip16 && q === 16)) as [number, string, string, keyof Profile | null][]
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
                {key !== null && edited[key] === undefined && <span className="ml-1.5 text-xs font-normal text-muted">default</span>}
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
