import { formatRatio, type RiskFitStatus } from '../engine'
import Badge, { type BadgeTone } from './Badge'

const TONE: Record<RiskFitStatus, BadgeTone> = { 'On target': 'success', 'Too much risk': 'warning', 'Too little risk': 'warning' }
const ACTUAL_COLOR: Record<RiskFitStatus, string> = { 'On target': 'bg-lime', 'Too much risk': 'bg-warn', 'Too little risk': 'bg-sky' }
const MAX = 2.5

/** Actual vs target Risk Capacity on one 0–2.5× scale: target marker in lime, actual in amber (too much) or sky (too little). */
export default function RiskFitGauge({ actual, target, status }: { actual: number; target: number; status: RiskFitStatus }) {
  const frac = (v: number) => Math.min(Math.max(v, 0), MAX) / MAX
  return (
    <div className="space-y-3">
      <Badge tone={TONE[status]}>{status}</Badge>
      <div className="relative pt-7 pb-7" role="img" aria-label={`Actual risk ${formatRatio(actual)}, target ${formatRatio(target)}: ${status}.`}>
        <div className="relative h-2.5 rounded-full bg-line">
          <span className="absolute top-0 bottom-0 w-px bg-line-strong" style={{ left: `${frac(1) * 100}%` }} aria-hidden />
        </div>
        <Marker at={frac(target)} label={`Target ${formatRatio(target)}`} className="bg-lime" labelClass="text-lime" top />
        <Marker at={frac(actual)} label={`Now ${formatRatio(actual)}`} className={ACTUAL_COLOR[status]} labelClass="text-ink" />
      </div>
      <div className="flex justify-between text-xs text-muted" aria-hidden>
        <span>0×</span>
        <span>1.0×</span>
        <span>2.5×</span>
      </div>
    </div>
  )
}

function Marker({ at, label, className, labelClass, top = false }: { at: number; label: string; className: string; labelClass: string; top?: boolean }) {
  // Near the ends, anchor the label inward so it never sticks out of the card (no sideways scroll on phones).
  const shift = at < 0.15 ? 'translate-x-0 items-start' : at > 0.85 ? '-translate-x-full items-end' : '-translate-x-1/2 items-center'
  return (
    <div className={`absolute ${shift.split(' ')[0]}`} style={{ left: `${at * 100}%`, top: top ? 0 : 'auto', bottom: top ? 'auto' : 0 }} aria-hidden>
      <div className={`flex ${shift.split(' ')[1]} ${top ? 'flex-col' : 'flex-col-reverse'}`}>
        <span className={`text-xs font-semibold whitespace-nowrap ${labelClass}`}>{label}</span>
        <span className={`h-5 w-1.5 rounded-full ring-2 ring-surface ${className}`} />
      </div>
    </div>
  )
}
