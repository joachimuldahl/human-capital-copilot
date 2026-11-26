import { formatRatio } from '../engine'

interface NeedleBarProps {
  value: number
  /** Right end of the scale. */
  max?: number
  /** Accessible name. */
  label?: string
  compact?: boolean
}

/** Horizontal 0–max scale with a needle at `value`, and a tick at 1.0× ("no borrowing"). */
export default function NeedleBar({ value, max = 1.5, label = 'Risk Capacity', compact = false }: NeedleBarProps) {
  const pct = (v: number) => `${Math.min(Math.max(v / max, 0), 1) * 100}%`
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Number(value.toFixed(2))}
      aria-valuetext={formatRatio(value)}
      className="w-full"
    >
      <div className={`relative rounded-full bg-gradient-to-r from-accent-100 via-accent-200 to-accent-500 ${compact ? 'h-2' : 'h-3'}`}>
        <div className="absolute top-1/2 h-4 w-px -translate-y-1/2 bg-slate-500" style={{ left: pct(1) }} aria-hidden />
        <div
          className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-slate-900 shadow transition-[left] duration-300 motion-reduce:transition-none ${compact ? 'h-4 w-4' : 'h-5 w-5'}`}
          style={{ left: pct(value) }}
          aria-hidden
        />
      </div>
      {!compact && (
        <div className="relative mt-1 h-4 text-xs text-slate-500" aria-hidden>
          <span className="absolute left-0">0×</span>
          <span className="absolute -translate-x-1/2" style={{ left: pct(1) }}>
            1.0×
          </span>
          <span className="absolute right-0">{max.toFixed(1)}×</span>
        </div>
      )}
    </div>
  )
}
