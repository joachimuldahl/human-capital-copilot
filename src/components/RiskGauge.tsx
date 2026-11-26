import { formatRatio } from '../engine'

const MAX = 1.5
const CX = 150
const CY = 150
const R = 120
const LIME = 'var(--color-lime)'
const SKY = 'var(--color-sky)'

/** Point on the arc for a value on the 0–1.5× scale (0 = left, 1.5 = right). */
function pt(v: number, r = R) {
  const a = Math.PI * (1 - v / MAX)
  return [CX + r * Math.cos(a), CY - r * Math.sin(a)] as const
}

interface RiskGaugeProps {
  value: number
  /** Accessible label; defaults to "Risk Capacity gauge at 1.50×". */
  label?: string
  /** Rendered width in px (height follows the 300:172 viewBox). */
  width?: number
  /** Stroke width of the arc. */
  stroke?: number
  className?: string
}

/**
 * Semicircle progress arc from 0× to 1.5× (BUILD_SPEC 15). Lime at 1.0× and above, sky below.
 * The 0× / 1.0× / 1.5× labels sit outside the arc so the value never hides them.
 */
export default function RiskGauge({ value, label, width = 260, stroke = 16, className = '' }: RiskGaugeProps) {
  const v = Math.min(Math.max(value, 0), MAX)
  const color = value >= 1 ? LIME : SKY
  const [tx, ty] = pt(1, R + stroke / 2 + 10)
  const arc = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`
  return (
    <svg
      viewBox="0 0 300 172"
      width={width}
      className={`block h-auto max-w-full ${className}`}
      role="img"
      aria-label={label ?? `Risk Capacity gauge at ${formatRatio(value)}`}
    >
      <path d={arc} fill="none" stroke="var(--color-line)" strokeWidth={stroke} />
      {v > 0 && (
        <path
          d={arc}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          pathLength={100}
          strokeDasharray={`${(v / MAX) * 100} 100`}
          className="transition-[stroke-dasharray] duration-300 ease-out motion-reduce:transition-none"
        />
      )}
      {/* 1.0× tick across the track. */}
      <line x1={pt(1, R - stroke / 2)[0]} y1={pt(1, R - stroke / 2)[1]} x2={pt(1, R + stroke / 2)[0]} y2={pt(1, R + stroke / 2)[1]} stroke="var(--color-bg)" strokeWidth={2} />
      <text x={CX - R} y={CY + 20} textAnchor="middle" fill="var(--color-muted)" fontSize="12">
        0×
      </text>
      <text x={tx + 4} y={ty} textAnchor="start" fill="var(--color-muted)" fontSize="12">
        1.0×
      </text>
      <text x={CX + R} y={CY + 20} textAnchor="middle" fill="var(--color-muted)" fontSize="12">
        1.5×
      </text>
    </svg>
  )
}
