/** React hooks on top of the stores. Selectors return stable values so components don't re-render in a loop. */
import { useMemo } from 'react'
import { pendingCaps, targetEEE, type Profile } from '../engine'
import type { PersonaId } from '../data/personas'
import { usePortfolioStore } from './portfolioStore'
import { selectProfile, useProfileStore, type ActiveId } from './profileStore'

/** The active profile (persona or "My answers" with defaults) and whether the user has answered anything. */
export function useActiveProfile(): { active: ActiveId; profile: Profile; hasAnswers: boolean } {
  const active = useProfileStore((s) => s.active)
  const answers = useProfileStore((s) => s.answers)
  const profile = useMemo(() => selectProfile({ active, answers }), [active, answers])
  return { active, profile, hasAnswers: Object.keys(answers).length > 0 }
}

/**
 * Engine result for "My answers" (onboarding panel). Limits whose question is unanswered (Q14 → G4, Q16 → G3)
 * are pending: skipped rather than applied from defaults.
 */
export function useMyTarget() {
  const answers = useProfileStore((s) => s.answers)
  return useMemo(() => {
    const profile = selectProfile({ active: 'mine', answers })
    const pending = pendingCaps(answers)
    return { profile, pending, target: targetEEE(profile, { pending }) }
  }, [answers])
}

/** Loads a persona and its demo portfolio. */
export function usePersonaLoader() {
  const loadPersona = useProfileStore((s) => s.loadPersona)
  const setSource = usePortfolioStore((s) => s.setSource)
  return (id: PersonaId) => {
    loadPersona(id)
    setSource('demo')
  }
}
