import { PERSONAS } from '../data/personas'
import { useProfileStore, type ActiveId } from '../store/profileStore'
import { usePersonaLoader } from '../store/hooks'
import { focusRing } from './ui'

const OPTIONS: { id: ActiveId; label: string }[] = [
  ...Object.values(PERSONAS).map((p) => ({ id: p.id as ActiveId, label: p.name })),
  { id: 'mine', label: 'Me' },
]

/** Segmented control: demo personas and the user's own answers ("Me"). Never overwrites "My answers". */
export default function PersonaSwitcher() {
  const active = useProfileStore((s) => s.active)
  const showMyAnswers = useProfileStore((s) => s.showMyAnswers)
  const loadPersona = usePersonaLoader()
  return (
    <div role="group" aria-label="Show results for" className="flex w-full gap-0.5 rounded-control border border-line bg-surface p-1 text-[13px] lg:inline-flex lg:w-auto">
      {OPTIONS.map((o) => {
        const on = o.id === active
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={on}
            title={o.id === 'mine' ? 'My answers' : undefined}
            onClick={() => (o.id === 'mine' ? showMyAnswers() : loadPersona(o.id))}
            className={`flex-1 whitespace-nowrap rounded-[9px] px-3 py-[7px] lg:flex-none ${focusRing} ${
              on ? 'bg-lime font-semibold text-on-lime' : 'text-ink-2 hover:text-ink'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
