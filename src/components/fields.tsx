/** Accessible form fields for onboarding and what-if controls. */
import { useId, useState, type ReactNode } from 'react'

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600'

/** "Why we ask" toggle with a one-sentence reason. */
export function WhyWeAsk({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <span className="inline-block">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={`rounded text-xs font-medium text-accent-700 underline decoration-dotted underline-offset-2 ${focusRing}`}
      >
        Why we ask
      </button>
      {open && (
        <span id={id} className="mt-1 block text-xs text-slate-600">
          {children}
        </span>
      )}
    </span>
  )
}

interface QuestionProps {
  number: number
  label: ReactNode
  why: ReactNode
  htmlFor?: string
  children: ReactNode
}

/** One numbered question with label, "Why we ask" and its input. */
export function Question({ number, label, why, htmlFor, children }: QuestionProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-1">
        {htmlFor ? (
          <label htmlFor={htmlFor} className="font-medium text-slate-900">
            <span className="mr-1.5 text-slate-400">{number}.</span>
            {label}
          </label>
        ) : (
          <p className="font-medium text-slate-900" aria-hidden>
            <span className="mr-1.5 text-slate-400">{number}.</span>
            {label}
          </p>
        )}
        <WhyWeAsk>{why}</WhyWeAsk>
      </div>
      {children}
    </div>
  )
}

interface NumberFieldProps {
  id: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  prefix?: string
  suffix?: string
}

/** Number input that keeps a draft while typing and only commits valid numbers within [min, max]. */
export function NumberField({ id, value, onChange, min = 0, max = Number.MAX_SAFE_INTEGER, step = 1, prefix, suffix }: NumberFieldProps) {
  const [draft, setDraft] = useState<string | null>(null)
  const invalid = draft !== null && !isValid(draft)
  function isValid(s: string) {
    const n = Number(s)
    return s.trim() !== '' && Number.isFinite(n) && n >= min && n <= max
  }
  return (
    <div>
      <div className={`flex max-w-xs items-center rounded-lg border bg-white ${invalid ? 'border-red-500' : 'border-slate-300'} focus-within:border-accent-600 focus-within:ring-2 focus-within:ring-accent-200`}>
        {prefix && <span className="pl-3 text-slate-500">{prefix}</span>}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={draft ?? String(value)}
          aria-invalid={invalid}
          onChange={(e) => {
            setDraft(e.target.value)
            if (isValid(e.target.value)) onChange(Number(e.target.value))
          }}
          onBlur={() => setDraft(null)}
          className="w-full rounded-lg bg-transparent px-3 py-2 text-slate-900 outline-none"
        />
        {suffix && <span className="pr-3 text-slate-500">{suffix}</span>}
      </div>
      {invalid && (
        <p className="mt-1 text-xs text-red-700" role="alert">
          Enter a number between {min.toLocaleString('en-US')} and {max.toLocaleString('en-US')}.
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
  /** Text shown next to the slider, e.g. "15%". */
  display: string
  hint?: ReactNode
}

export function SliderField({ id, value, onChange, min, max, step, display, hint }: SliderFieldProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-valuetext={display}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`h-2 w-full max-w-md cursor-pointer accent-accent-700 ${focusRing}`}
        />
        <output htmlFor={id} className="min-w-20 text-right font-semibold tabular-nums text-slate-900">
          {display}
        </output>
      </div>
      {hint && <p className="text-xs text-slate-600">{hint}</p>}
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
  columns?: 1 | 2 | 3
}

/** Radio group drawn as cards (native radios for keyboard and screen reader support). */
export function RadioCards<T extends string | number>({ name, legend, options, value, onChange, columns = 2 }: RadioCardsProps<T>) {
  const cols = columns === 1 ? '' : columns === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'
  return (
    <fieldset>
      <legend className="sr-only">{legend}</legend>
      <div className={`grid gap-2 ${cols}`}>
        {options.map((o) => {
          const checked = o.value === value
          return (
            <label
              key={String(o.value)}
              className={`flex cursor-pointer gap-3 rounded-xl border p-3 text-sm transition focus-within:ring-2 focus-within:ring-accent-600 ${
                checked ? 'border-accent-600 bg-accent-50' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={String(o.value)}
                checked={checked}
                onChange={() => onChange(o.value)}
                className="mt-0.5 accent-accent-700"
              />
              <span>
                <span className="block font-medium text-slate-900">{o.label}</span>
                {o.description && <span className="block text-slate-600">{o.description}</span>}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
