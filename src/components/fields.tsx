/** Accessible form fields styled to BUILD_SPEC section 15 (used by onboarding, what-if, quick entry and the plan). */
import { useState, type ReactNode } from 'react'

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-700'

interface QuestionProps {
  number: number
  label: ReactNode
  /** One-line hint under the question (14px slate-500). */
  hint?: ReactNode
  /** "Why we ask" button + panel. */
  why?: ReactNode
  htmlFor?: string
  children: ReactNode
}

/** One numbered question: number + question (16px/600), optional hint, "Why we ask", then the input. */
export function Question({ number, label, hint, why, htmlFor, children }: QuestionProps) {
  const text = (
    <>
      <span className="mr-1.5 text-slate-400">{number}.</span>
      {label}
    </>
  )
  return (
    <div className="space-y-3 py-6 first:pt-0 last:pb-0">
      <div className="space-y-1">
        {htmlFor ? (
          <label htmlFor={htmlFor} className="block text-question text-slate-900">
            {text}
          </label>
        ) : (
          <p className="text-question text-slate-900" aria-hidden>
            {text}
          </p>
        )}
        {hint && <p className="text-help text-slate-500">{hint}</p>}
        {why}
      </div>
      {children}
    </div>
  )
}

const MONEY = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

interface NumberFieldProps {
  id: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  /** Shown inside the field on the left; "€" turns on thousands separators. */
  prefix?: string
  /** Muted unit inside the field on the right ("years", "%"). */
  suffix?: string
  /** Friendly message for a rule that involves other answers. */
  message?: string
  describedBy?: string
}

/** Number input that keeps a draft while typing and only commits valid numbers within [min, max]. */
export function NumberField({ id, value, onChange, min = 0, max = Number.MAX_SAFE_INTEGER, step = 1, prefix, suffix, message, describedBy }: NumberFieldProps) {
  const money = prefix === '€'
  const [draft, setDraft] = useState<string | null>(null)
  const parse = (s: string) => Number(money ? s.replace(/,/g, '') : s)
  const isValid = (s: string) => {
    const n = parse(s)
    return s.trim() !== '' && Number.isFinite(n) && n >= min && n <= max
  }
  const invalid = draft !== null && !isValid(draft)
  const shown = draft ?? (money ? MONEY.format(value) : String(value))
  const note = invalid ? `Please enter a number between ${MONEY.format(min)} and ${MONEY.format(max)}.` : message
  const noteId = `${id}-note`
  return (
    <div>
      <div
        className={`flex h-11 w-full max-w-xs items-center rounded-lg border bg-white transition-colors focus-within:border-accent-700 focus-within:ring-3 focus-within:ring-accent-100 ${
          note ? 'border-warning' : 'border-slate-300'
        }`}
      >
        {prefix && <span className="pl-3 text-slate-500">{prefix}</span>}
        <input
          id={id}
          type={money ? 'text' : 'number'}
          inputMode={money ? 'numeric' : 'decimal'}
          min={money ? undefined : min}
          max={money ? undefined : max}
          step={money ? undefined : step}
          value={shown}
          aria-invalid={invalid}
          aria-describedby={[note ? noteId : '', describedBy ?? ''].filter(Boolean).join(' ') || undefined}
          onChange={(e) => {
            let s = e.target.value
            if (money) {
              const digits = s.replace(/[^\d]/g, '')
              s = digits === '' ? '' : MONEY.format(Number(digits))
            }
            setDraft(s)
            if (isValid(s)) onChange(parse(s))
          }}
          onBlur={() => setDraft(null)}
          className={`h-full w-full min-w-0 rounded-lg bg-transparent text-slate-900 outline-none ${prefix ? 'pl-1.5' : 'pl-3'} ${suffix ? 'pr-1.5' : 'pr-3'}`}
        />
        {suffix && <span className="whitespace-nowrap pr-3 text-help text-slate-400">{suffix}</span>}
      </div>
      {note && (
        <p id={noteId} className="mt-1.5 text-help text-warning" role="status">
          {note}
        </p>
      )}
    </div>
  )
}

interface SliderFieldProps {
  id: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step: number
  /** Text in the pill above the thumb, e.g. "15%". */
  display: string
  hint?: ReactNode
  /** Labels under the track's ends. */
  minLabel?: string
  maxLabel?: string
}

/** Thin slider with the value in a pill above the thumb and min/max labels underneath. */
export function SliderField({ id, value, onChange, min, max, step, display, hint, minLabel, maxLabel }: SliderFieldProps) {
  const frac = max > min ? Math.min(Math.max((value - min) / (max - min), 0), 1) : 0
  // Thumb centre = frac · (width − 18px) + 9px.
  const left = `calc(${frac * 100}% + ${9 - frac * 18}px)`
  return (
    <div className="max-w-md space-y-1.5">
      <div className="relative pt-8">
        <output
          htmlFor={id}
          className="pointer-events-none absolute top-0 whitespace-nowrap rounded-full bg-accent-50 px-2 py-0.5 text-[13px] font-semibold text-accent-800 ring-1 ring-accent-200"
          style={{ left, transform: `translateX(-${frac * 100}%)` }}
        >
          {display}
        </output>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-valuetext={display}
          onChange={(e) => onChange(Number(e.target.value))}
          className="range block"
          style={{ ['--fill' as string]: `${frac * 100}%` }}
        />
      </div>
      {(minLabel || maxLabel) && (
        <div className="flex justify-between text-xs text-slate-400" aria-hidden>
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
      {hint && <p className="text-help text-slate-600">{hint}</p>}
    </div>
  )
}

export interface RadioOption<T extends string | number> {
  value: T
  label: string
  description?: string
}

interface RadioCardsProps<T extends string | number> {
  name: string
  legend: ReactNode
  options: RadioOption<T>[]
  value: T
  onChange: (v: T) => void
  /** 2 (default): two columns from tablet width up. 1: always one column. */
  columns?: 1 | 2 | 3
}

/** Radio group drawn as cards (native radios kept for keyboard and screen readers, visually hidden). */
export function RadioCards<T extends string | number>({ name, legend, options, value, onChange, columns = 2 }: RadioCardsProps<T>) {
  const cols = columns === 1 ? '' : columns === 2 ? 'sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'
  return (
    <fieldset>
      <legend className="sr-only">{legend}</legend>
      <div className={`grid gap-2 ${cols}`}>
        {options.map((o) => {
          const checked = o.value === value
          return (
            <label
              key={String(o.value)}
              className={`relative cursor-pointer rounded-lg border px-3.5 py-3 transition-colors focus-within:ring-2 focus-within:ring-accent-700 focus-within:ring-offset-1 ${
                checked ? 'border-accent-700 bg-accent-50' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <input type="radio" name={name} value={String(o.value)} checked={checked} onChange={() => onChange(o.value)} className="sr-only" />
              <span className={`block text-[15px] text-slate-900 ${o.description || o.label.length < 40 ? 'font-semibold' : 'font-medium'}`}>{o.label}</span>
              {o.description && <span className="mt-0.5 block text-[13px] leading-snug text-slate-500">{o.description}</span>}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

/** Small "I'm not sure" toggle for questions 6, 8 and 14: uses the default and says so. */
export function NotSure({ active, onClick, defaultText }: { active: boolean; onClick: () => void; defaultText: string }) {
  return active ? (
    <p className="text-help text-slate-600" role="status">
      Using our default: {defaultText}. Change the answer to set your own.
    </p>
  ) : (
    <button type="button" onClick={onClick} className={`rounded text-[13px] font-medium text-slate-600 underline decoration-slate-300 underline-offset-2 hover:text-slate-900 ${focusRing}`}>
      I'm not sure
    </button>
  )
}
