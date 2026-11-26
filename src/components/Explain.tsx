import type { ReactNode } from 'react'

/** Highlighted plain-English explanation built from engine templates (D-14: no AI). */
export default function Explain({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border-l-[3px] border-accent-700 bg-accent-50 px-4 py-3 text-help text-slate-800">{children}</p>
  )
}
