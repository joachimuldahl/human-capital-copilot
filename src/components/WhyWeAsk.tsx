import { ArrowRight, Info } from 'lucide-react'
import { useId } from 'react'
import { Link } from 'react-router-dom'
import type { WhyWeAskContent } from '../content/whyWeAsk'

interface WhyWeAskProps {
  content: WhyWeAskContent
  /** Live "Your answer's effect" line from the engine (only computed while open). */
  effect: () => string
  open: boolean
  onToggle: () => void
}

const PARTS: [string, keyof WhyWeAskContent | 'effect'][] = [
  ['Why it matters', 'why'],
  ['How we use it', 'how'],
  ["Your answer's effect", 'effect'],
  ['Research', 'research'],
]

/** "Why we ask" text button and its 4-part panel (BUILD_SPEC 15 + 16). Height animates in 150ms. */
export default function WhyWeAsk({ content, effect, open, onToggle }: WhyWeAskProps) {
  const id = useId()
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
        className="inline-flex items-center gap-1 rounded text-[13px] font-medium text-accent-700 hover:text-accent-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-700"
      >
        <Info size={16} strokeWidth={1.75} aria-hidden />
        Why we ask
      </button>
      <div
        id={id}
        className={`grid transition-[grid-template-rows] duration-150 ease-out motion-reduce:transition-none ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
        inert={!open}
      >
        <div className="overflow-hidden">
          <div className="mt-3 space-y-3 rounded-lg border-l-[3px] border-accent-700 bg-slate-50 p-4">
            {PARTS.map(([title, key]) => (
              <div key={key}>
                <p className="text-caption text-slate-500">{title}</p>
                <p className={`mt-0.5 text-help ${key === 'effect' ? 'font-medium text-slate-900' : 'text-slate-700'}`} aria-live={key === 'effect' ? 'polite' : undefined}>
                  {key === 'effect' ? (open ? effect() : '') : content[key]}
                </p>
              </div>
            ))}
            <Link to="/method" className="inline-flex items-center gap-1 text-[13px] font-medium text-accent-700 hover:text-accent-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-700">
              Read the full method <ArrowRight size={16} strokeWidth={1.75} aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
