import { PERSONAS } from '../data/personas'
import { useProfileStore, type ActiveId } from '../store/profileStore'
import { usePersonaLoader } from '../store/hooks'

const OPTIONS: { id: ActiveId; label: string }[] = [
  ...Object.values(PERSONAS).map((p) => ({ id: p.id as ActiveId, label: p.name })),
  { id: 'mine', label: 'My answers' },
]

/** Switch between demo personas and the user's own answers. Never overwrites "My answers". */
export default function PersonaSwitcher() {
  const active = useProfileStore((s) => s.active)
  const showMyAnswers = useProfileStore((s) => s.showMyAnswers)
  const loadPersona = usePersonaLoader()
  return (
    <div role="group" aria-label="Show results for" className="inline-flex max-w-full overflow-x-auto rounded-lg border border-slate-200 bg-white p-0.5 shadow-card">
      {OPTIONS.map((o) => {
        const on = o.id === active
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={on}
            onClick={() => (o.id === 'mine' ? showMyAnswers() : loadPersona(o.id))}
            className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-[13px] font-medium focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent-700 ${
              on ? 'bg-accent-50 text-accent-800 shadow-[inset_0_0_0_1px_var(--color-accent-200)]' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
