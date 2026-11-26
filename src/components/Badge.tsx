import type { ReactNode } from 'react'

export type BadgeTone = 'neutral' | 'accent' | 'warning' | 'alert' | 'success' | 'sky' | 'solid'

const TONES: Record<BadgeTone, string> = {
  neutral: 'border-line bg-surface-2 text-ink-2',
  accent: 'border-lime-line bg-lime-tint text-lime',
  success: 'border-lime-line bg-lime-tint text-lime',
  warning: 'border-warn-line bg-warn-bg text-warn',
  alert: 'border-alert-line bg-alert-bg text-alert',
  sky: 'border-sky-line bg-sky-tint text-sky',
  solid: 'border-lime bg-lime text-on-lime',
}

/** Status chip: 999px radius, 12px/600. */
export default function Badge({ children, tone = 'neutral', className = '' }: { children: ReactNode; tone?: BadgeTone; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs leading-none font-semibold ${TONES[tone]} ${className}`}>
      {children}
    </span>
  )
}

/** D-16: shown wherever demo data is used. */
export function IllustrativeBadge() {
  return <Badge tone="warning">Illustrative data</Badge>
}
