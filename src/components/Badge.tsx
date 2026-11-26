import type { ReactNode } from 'react'

export type BadgeTone = 'neutral' | 'accent' | 'warning' | 'alert' | 'success'

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100 text-slate-700',
  accent: 'bg-accent-50 text-accent-800',
  warning: 'bg-warning-bg text-warning',
  alert: 'bg-alert-bg text-alert',
  success: 'bg-success-bg text-success',
}

export default function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: BadgeTone }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${TONES[tone]}`}>
      {children}
    </span>
  )
}

/** D-16: shown wherever demo data is used. */
export function IllustrativeBadge() {
  return <Badge tone="warning">Illustrative data</Badge>
}
