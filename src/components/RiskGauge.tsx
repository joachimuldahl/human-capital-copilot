import { formatRatio } from '../engine'

const MAX = 1.5
const ZONES = [
  { from: 0, to: 0.6, label: 'Cautious', color: 'var(--color-slate-200)' },
  { from: 0.6, to: 1.0, label: 'Market-like', color: 'var(--color-accent-100)' },
  { from: 1.0, to: 1.5, label: 'Uses borrowing', color: 'var(--color-accent-200)' },
]
const CX = 110
const CY = 104
const R = 90

/** Point on the arc for a value on the 0–1.5× scale (0 = left, 1.5 = right). */
function pt(v: number, r = R) {
  const a = Math.PI * (1 - v / MAX)
  return [CX + r * Math.cos(a), CY - r * Math.sin(a)] as const
}

function arc(from: number, to: number) {
  const [x1, y1] = pt(from)
  const [x2, y2] = pt(to)
  return `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`
}

/** Semicircle gauge from 0× to 1.5× with three zones and an animated needle (300ms, off for reduced motion). */
export default function RiskGauge({ value }: { value: number }) {
  const v = Math.min(Math.max(value, 0), MAX)
  const deg = -90 + (v / MAX) * 180
  const ticks = [0, 1, 1.5]
  return (
    <div role="meter" aria-label="Risk Capacity" aria-valuemin={0} aria-valuemax={MAX} aria-valuenow={Number(value.toFixed(2))} aria-valuetext={formatRatio(value)}>
      <svg viewBox="0 0 220 126" className="w-full" aria-hidden>
        {ZONES.map((z, i) => (
          <path key={z.label} d={arc(z.from + (i ? 0.01 : 0), z.to)} stroke={z.color} strokeWidth={14} fill="none" />
        ))}
        {ticks.map((t) => {
          // End labels sit under the arc ends (clear of the needle); 1.0× sits just inside the arc.
          const [x, y] = t === 1 ? pt(t, R - 20) : [pt(t)[0], CY + 17]
          return (
            <text key={t} x={x} y={y + 4} textAnchor="middle" className="fill-slate-400 text-[10px] font-medium">
              {t === 0 ? '0×' : `${t.toFixed(1)}×`}
            </text>
          )
        })}
        <g style={{ transform: `rotate(${deg}deg)`, transformOrigin: `${CX}px ${CY}px` }} className="transition-transform duration-300 ease-out motion-reduce:transition-none">
          <line x1={CX} y1={CY} x2={CX} y2={CY - R + 4} stroke="var(--color-slate-900)" strokeWidth={2.5} strokeLinecap="round" />
        </g>
        <circle cx={CX} cy={CY} r={6} fill="var(--color-slate-900)" />
        <circle cx={CX} cy={CY} r={2.5} fill="#fff" />
      </svg>
      <ul className="mt-1 flex justify-between gap-2 text-[11px] text-slate-500" aria-hidden>
        {ZONES.map((z) => (
          <li key={z.label} className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ background: z.color }} />
            {z.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
