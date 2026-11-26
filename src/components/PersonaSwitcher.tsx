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
    <div role="group" aria-label="Show results for" className="flex flex-wrap gap-1.5">
      {OPTIONS.map((o) => {
        const on = o.id === active
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={on}
            onClick={() => (o.id === 'mine' ? showMyAnswers() : loadPersona(o.id))}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ring-1 ring-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600 ${
              on ? 'bg-accent-700 text-white ring-accent-700' : 'bg-white text-slate-700 ring-slate-300 hover:bg-slate-50'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
