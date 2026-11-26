/** Accessible form fields in the v1.3 dark design (used by onboarding, what-if, quick entry and the plan). */
import { useState, type ReactNode } from 'react'
import { focusRing } from './ui'

interface QuestionProps {
  number: number
  total: number
  label: ReactNode
  /** One-line subline under the question (17px, text-2). */
  hint?: ReactNode
  /** Input id: makes the question text the input's label. */
  htmlFor?: string
  children: ReactNode
  /** "Why we ask" card, shown under the answer. */
  why?: ReactNode
}

/** One onboarding screen: "QUESTION 7 OF 16" in lime, the question at 40px, a subline, then the answer and "Why we ask". */
export function Question({ number, total, label, hint, htmlFor, children, why }: QuestionProps) {
  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-3">
        <p className="text-[13px] font-semibold tracking-[0.04em] text-lime">
          QUESTION {number} OF {total}
        </p>
        <h1 className="text-[30px] leading-[1.15] font-semibold tracking-[-0.02em] font-display text-ink sm:text-h1">
          {htmlFor ? <label htmlFor={htmlFor}>{label}</label> : label}
        </h1>
        {hint && <p className="max-w-[620px] text-[17px] leading-[1.55] text-ink-2">{hint}</p>}
      </div>
      {children}
      {why}
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
  /** "lg": the big onboarding input. */
  size?: 'md' | 'lg'
}

/** Number input that keeps a draft while typing and only commits valid numbers within [min, max]. */
export function NumberField({ id, value, onChange, min = 0, max = Number.MAX_SAFE_INTEGER, step = 1, prefix, suffix, message, describedBy, size = 'md' }: NumberFieldProps) {
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
  const lg = size === 'lg'
  return (
    <div>
      <div
        className={`flex w-full items-center rounded-control border bg-surface transition-colors focus-within:border-lime ${lg ? 'h-16 max-w-sm text-2xl' : 'h-11 max-w-xs'} ${
          note ? 'border-warn' : 'border-line'
        }`}
      >
        {prefix && <span className={`text-muted ${lg ? 'pl-5' : 'pl-3'}`}>{prefix}</span>}
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
          className={`h-full w-full min-w-0 rounded-control bg-transparent text-ink outline-none ${lg ? 'font-display font-semibold' : ''} ${
            prefix ? 'pl-1.5' : lg ? 'pl-5' : 'pl-3'
          } ${suffix ? 'pr-1.5' : 'pr-3'}`}
        />
        {suffix && <span className={`whitespace-nowrap text-muted ${lg ? 'pr-5 text-base' : 'pr-3 text-help'}`}>{suffix}</span>}
      </div>
      {note && (
        <p id={noteId} className="mt-2 text-help text-warn" role="status">
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
  /** Accessible name when no <label> points at the slider. */
  ariaLabel?: string
}

/** Slider with the value in a lime pill above the thumb and min/max labels underneath. */
export function SliderField({ id, value, onChange, min, max, step, display, hint, minLabel, maxLabel, ariaLabel }: SliderFieldProps) {
  const frac = max > min ? Math.min(Math.max((value - min) / (max - min), 0), 1) : 0
  // Thumb centre = frac · (width − 20px) + 10px.
  const left = `calc(${frac * 100}% + ${10 - frac * 20}px)`
  return (
    <div className="max-w-xl space-y-2">
      <div className="relative pt-9">
        <output
          htmlFor={id}
          className="pointer-events-none absolute top-0 whitespace-nowrap rounded-full border border-lime-line bg-lime-tint px-2.5 py-0.5 text-[13px] font-semibold text-lime"
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
          aria-label={ariaLabel}
          onChange={(e) => onChange(Number(e.target.value))}
          className="range block"
          style={{ ['--fill' as string]: `${frac * 100}%` }}
        />
      </div>
      {(minLabel || maxLabel) && (
        <div className="flex justify-between text-xs text-muted" aria-hidden>
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
      {hint && <p className="text-help text-ink-2">{hint}</p>}
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
  /** 2 (default): auto-fit cards of at least 260px. 1: always one column. 3: three per row from tablet up. */
  columns?: 1 | 2 | 3
}

/** Radio group drawn as cards with real radio inputs; the selected card gets a lime border and tint background. */
export function RadioCards<T extends string | number>({ name, legend, options, value, onChange, columns = 2 }: RadioCardsProps<T>) {
  const cols = columns === 1 ? '' : columns === 2 ? 'sm:grid-cols-[repeat(auto-fit,minmax(260px,1fr))]' : 'grid-cols-2 sm:grid-cols-3'
  return (
    <fieldset>
      <legend className="sr-only">{legend}</legend>
      <div className={`grid gap-3 ${cols}`}>
        {options.map((o) => {
          const checked = o.value === value
          return (
            <label
              key={String(o.value)}
              className={`flex cursor-pointer items-start gap-3.5 rounded-2xl border px-[18px] py-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-lime ${
                checked ? 'border-lime bg-lime-tint shadow-[inset_0_0_0_0.5px_var(--color-lime)]' : 'border-line bg-surface hover:border-line-strong'
              }`}
            >
              <input type="radio" name={name} value={String(o.value)} checked={checked} onChange={() => onChange(o.value)} className="mt-[3px] shrink-0 accent-lime" />
              <span className="flex flex-col gap-1">
                <span className={`text-[15px] text-ink ${o.description || o.label.length < 40 ? 'font-semibold' : 'font-medium'}`}>{o.label}</span>
                {o.description && <span className="text-[13px] leading-snug text-ink-2">{o.description}</span>}
              </span>
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
    <p className="text-help text-ink-2" role="status">
      Using our default: {defaultText}. Change the answer to set your own.
    </p>
  ) : (
    <button type="button" onClick={onClick} className={`self-start rounded text-[13px] font-medium text-ink-2 underline decoration-line-strong underline-offset-2 hover:text-ink ${focusRing}`}>
      I'm not sure
    </button>
  )
}
