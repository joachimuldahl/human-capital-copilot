import { useNavigate } from 'react-router-dom'
import { formatRatio, targetEEE } from '../engine'
import { PERSONAS } from '../data/personas'
import { usePersonaLoader } from '../store/hooks'
import { card, focusRing } from './ui'

/** Four persona cards with their Risk Capacity; clicking one loads the persona + demo portfolio and opens Results. */
export default function PersonaCards() {
  const loadPersona = usePersonaLoader()
  const navigate = useNavigate()
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Object.values(PERSONAS).map((p) => {
        const v = targetEEE(p.profile).finalEEE
        return (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => {
                loadPersona(p.id)
                navigate('/results')
              }}
              className={`${card} flex h-full w-full flex-col gap-2.5 rounded-[18px] p-5 text-left transition-colors hover:border-line-strong ${focusRing}`}
            >
              <span className="text-[15px] font-semibold text-ink">{p.name}</span>
              <span className="text-[13px] leading-normal text-ink-2">{p.story}</span>
              <span className={`mt-auto font-display text-[28px] font-semibold ${v >= 1 ? 'text-lime' : 'text-sky'}`}>{formatRatio(v)}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
