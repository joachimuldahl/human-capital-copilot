import { Link } from 'react-router-dom'
import { focusRing } from './ui'

/** 28px lime tile with a line-chart icon + wordmark (wordmark hidden on phones when compact). */
export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className={`flex shrink-0 items-center gap-2.5 rounded-lg text-ink ${focusRing}`} aria-label="Human Capital Copilot, home">
      <span aria-hidden className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B1220" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 18 L10 11 L14 14 L20 6" />
        </svg>
      </span>
      <span aria-hidden className={`font-display text-[17px] font-semibold tracking-[-0.01em] ${compact ? 'hidden sm:inline' : ''}`}>
        Human Capital Copilot
      </span>
    </Link>
  )
}
