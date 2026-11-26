import type { ReactNode } from 'react'

/** White card: 1px slate-200 border, radius 12px, subtle shadow, 16px padding on mobile and 24px on desktop. */
export default function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-slate-200 bg-white p-4 shadow-card lg:p-6 ${className}`}>{children}</div>
}
