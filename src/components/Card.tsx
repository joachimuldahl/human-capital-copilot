import type { ReactNode } from 'react'
import { card } from './ui'

/** Dark surface card: 1px border, radius 20px, 16px padding on phones and 24px on desktop. No shadow. */
export default function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`${card} p-4 sm:p-6 ${className}`}>{children}</div>
}
