import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { focusRing } from './ui'

export interface Tab {
  id: string
  label: string
  content: ReactNode
}

/**
 * Accessible tabs (arrow keys, Home/End). Inactive panels stay in the page but hidden,
 * so their content is still rendered (and testable) without being shown.
 */
export default function Tabs({ tabs, label }: { tabs: Tab[]; label: string }) {
  const [active, setActive] = useState(tabs[0]?.id)
  const base = useId()
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  function onKey(e: KeyboardEvent, i: number) {
    const last = tabs.length - 1
    const next = e.key === 'ArrowRight' ? (i === last ? 0 : i + 1) : e.key === 'ArrowLeft' ? (i === 0 ? last : i - 1) : e.key === 'Home' ? 0 : e.key === 'End' ? last : null
    if (next === null) return
    e.preventDefault()
    setActive(tabs[next].id)
    refs.current[next]?.focus()
  }

  return (
    <div>
      <div role="tablist" aria-label={label} className="flex flex-wrap gap-x-1 border-b border-line">
        {tabs.map((t, i) => {
          const on = t.id === active
          return (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[i] = el
              }}
              role="tab"
              type="button"
              id={`${base}-tab-${t.id}`}
              aria-selected={on}
              aria-controls={`${base}-panel-${t.id}`}
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(t.id)}
              onKeyDown={(e) => onKey(e, i)}
              className={`-mb-px shrink-0 border-b-2 px-3 py-2 text-sm font-medium whitespace-nowrap ${focusRing} ${
                on ? 'border-lime text-ink' : 'border-transparent text-ink-2 hover:text-ink'
              }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>
      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${base}-panel-${t.id}`}
          aria-labelledby={`${base}-tab-${t.id}`}
          hidden={t.id !== active}
          tabIndex={0}
          className={`rounded pt-5 ${focusRing}`}
        >
          {t.content}
        </div>
      ))}
    </div>
  )
}
