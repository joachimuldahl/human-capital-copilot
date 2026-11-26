import type { ReactNode } from 'react'

interface PlaceholderProps {
  title: string
  phase: number
  children?: ReactNode
}

/** Temporary page body used until the page is built in its phase (BUILD_SPEC section 10). */
export default function Placeholder({ title, phase, children }: PlaceholderProps) {
  return (
    <section className="space-y-3">
      <h1 className="text-page-title">{title}</h1>
      {children}
      <p className="text-slate-600">Placeholder. This page is built in Phase {phase}.</p>
    </section>
  )
}
