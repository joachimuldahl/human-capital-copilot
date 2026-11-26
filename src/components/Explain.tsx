import type { ReactNode } from 'react'

/** Highlighted plain-English explanation built from engine templates (D-14: no AI). */
export default function Explain({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border-l-4 border-accent-600 bg-accent-50 px-4 py-3 text-sm text-slate-800">{children}</p>
  )
}
