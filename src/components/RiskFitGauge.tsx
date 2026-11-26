import { formatRatio, type RiskFitStatus } from '../engine'
import Badge, { type BadgeTone } from './Badge'

const TONE: Record<RiskFitStatus, BadgeTone> = { 'On target': 'success', 'Too much risk': 'alert', 'Too little risk': 'warning' }
const MAX = 2.5

/** Actual vs target Risk Capacity on one 0–2.5× scale with two markers and a status label. */
export default function RiskFitGauge({ actual, target, status }: { actual: number; target: number; status: RiskFitStatus }) {
  const frac = (v: number) => Math.min(Math.max(v, 0), MAX) / MAX
  return (
    <div className="space-y-3">
      <Badge tone={TONE[status]}>{status}</Badge>
      <div className="relative pt-6 pb-6" role="img" aria-label={`Actual risk ${formatRatio(actual)}, target ${formatRatio(target)}: ${status}.`}>
        <div className="h-2.5 rounded-full bg-gradient-to-r from-slate-100 via-accent-200 to-red-200" />
        <Marker at={frac(target)} label={`Target ${formatRatio(target)}`} className="bg-accent-700" top />
        <Marker at={frac(actual)} label={`Now ${formatRatio(actual)}`} className="bg-slate-900" />
      </div>
      <div className="flex justify-between text-xs text-slate-500" aria-hidden>
        <span>0×</span>
        <span>1.0×</span>
        <span>2.5×</span>
      </div>
    </div>
  )
}

function Marker({ at, label, className, top = false }: { at: number; label: string; className: string; top?: boolean }) {
  // Near the ends, anchor the label inward so it never sticks out of the card (no sideways scroll on phones).
  const shift = at < 0.15 ? 'translate-x-0 items-start' : at > 0.85 ? '-translate-x-full items-end' : '-translate-x-1/2 items-center'
  return (
    <div className={`absolute ${shift.split(' ')[0]}`} style={{ left: `${at * 100}%`, top: top ? 0 : 'auto', bottom: top ? 'auto' : 0 }} aria-hidden>
      <div className={`flex ${shift.split(' ')[1]} ${top ? 'flex-col' : 'flex-col-reverse'}`}>
        <span className="text-xs font-semibold whitespace-nowrap text-slate-800">{label}</span>
        <span className={`h-4 w-1.5 rounded-full ${className}`} />
      </div>
    </div>
  )
}
