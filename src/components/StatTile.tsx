import type { ReactNode } from 'react'
import Card from './Card'

interface StatTileProps {
  title: string
  value: ReactNode
  /** Main explanation line. */
  children?: ReactNode
  /** Small print under the explanation. */
  footnote?: ReactNode
}

export default function StatTile({ title, value, children, footnote }: StatTileProps) {
  return (
    <Card className="flex flex-col gap-2">
      <h3 className="text-caption text-slate-500">{title}</h3>
      <p className="text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
      {children && <div className="text-sm text-slate-700">{children}</div>}
      {footnote && <p className="text-xs text-slate-500">{footnote}</p>}
    </Card>
  )
}
