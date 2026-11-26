import type { ReactNode } from 'react'

export type BadgeTone = 'neutral' | 'accent' | 'warning' | 'alert' | 'success'

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
  accent: 'bg-accent-50 text-accent-800 ring-accent-200',
  warning: 'bg-amber-50 text-amber-800 ring-amber-200',
  alert: 'bg-red-50 text-red-800 ring-red-200',
  success: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
}

export default function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: BadgeTone }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[tone]}`}>
      {children}
    </span>
  )
}

/** D-16: shown wherever demo data is used. */
export function IllustrativeBadge() {
  return <Badge tone="warning">Illustrative data</Badge>
}
