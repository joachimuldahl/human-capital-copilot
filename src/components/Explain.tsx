import type { ReactNode } from 'react'

/** Plain-English explanation built from engine templates (D-14: no AI). */
export default function Explain({ children }: { children: ReactNode }) {
  return <p className="rounded-control bg-surface-2 px-4 py-3 text-help text-panel">{children}</p>
}
