import { useNavigate } from 'react-router-dom'
import { PERSONAS } from '../data/personas'
import { usePersonaLoader } from '../store/hooks'

/** Four persona cards; clicking one loads the persona + demo portfolio and opens Results. */
export default function PersonaCards() {
  const loadPersona = usePersonaLoader()
  const navigate = useNavigate()
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {Object.values(PERSONAS).map((p) => (
        <li key={p.id}>
          <button
            type="button"
            onClick={() => {
              loadPersona(p.id)
              navigate('/results')
            }}
            className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-card transition hover:border-accent-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-700"
          >
            <span className="block font-semibold text-slate-900">{p.name}</span>
            <span className="block text-sm text-slate-600">{p.story}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
