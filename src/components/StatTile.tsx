import type { ReactNode } from 'react'
import Card from './Card'

interface StatTileProps {
  title: string
  value: ReactNode
  /** Main explanation line. */
  children?: ReactNode
  /** Small print under the explanation. */
  footnote?: ReactNode
  className?: string
}

/** Driver card: small title, 30px Space Grotesk number, explanation. */
export default function StatTile({ title, value, children, footnote, className = '' }: StatTileProps) {
  return (
    <Card className={`flex flex-col gap-2.5 ${className}`}>
      <h3 className="text-[13px] font-medium text-ink-2">{title}</h3>
      <p className="text-card-num text-ink">{value}</p>
      {children && <div className="text-help text-ink-2">{children}</div>}
      {footnote && <p className="text-xs text-muted">{footnote}</p>}
    </Card>
  )
}
