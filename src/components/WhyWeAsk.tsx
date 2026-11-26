import { ArrowRight, Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { WhyWeAskContent } from '../content/whyWeAsk'
import { textLink } from './ui'

interface WhyWeAskProps {
  content: WhyWeAskContent
  /** Live "Your answer's effect" line from the engine. */
  effect: string
}

const PARTS: [string, keyof WhyWeAskContent | 'effect'][] = [
  ['Why it matters', 'why'],
  ['How we use it', 'how'],
  ["Your answer's effect", 'effect'],
  ['Research', 'research'],
]

/** "Why we ask" as a <details> card with the four labelled parts in a responsive grid (BUILD_SPEC 15 + 16). */
export default function WhyWeAsk({ content, effect }: WhyWeAskProps) {
  return (
    <details className="group rounded-[18px] border border-line bg-surface px-[22px] py-5">
      <summary className="flex cursor-pointer items-center gap-2 rounded text-sm font-semibold text-lime hover:text-lime-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime">
        <Info size={16} strokeWidth={2} aria-hidden />
        Why we ask
      </summary>
      <div className="mt-[18px] grid gap-x-7 gap-y-5 sm:grid-cols-[repeat(auto-fit,minmax(230px,1fr))]">
        {PARTS.map(([title, key]) => (
          <div key={key} className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">{title}</span>
            <span className={`text-help ${key === 'effect' ? 'text-ink' : 'text-panel'}`} aria-live={key === 'effect' ? 'polite' : undefined}>
              {key === 'effect' ? effect : content[key]}
              {key === 'research' && (
                <>
                  {' '}
                  <Link to="/method" className={`inline-flex items-center gap-1 ${textLink}`}>
                    Read the full method <ArrowRight size={14} strokeWidth={2} aria-hidden />
                  </Link>
                </>
              )}
            </span>
          </div>
        ))}
      </div>
    </details>
  )
}
