/**
 * Profile state (persisted in localStorage). The user's own answers ("My answers") are stored apart from the
 * personas: loading a persona only changes `active`, so it never overwrites the user's answers.
 */
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { resolveProfile, type Profile } from '../engine'
import { PERSONAS, type PersonaId } from '../data/personas'

export type ActiveId = PersonaId | 'mine'

interface ProfileState {
  active: ActiveId
  /** The user's own answers; missing ones fall back to defaults via resolveProfile. */
  answers: Partial<Profile>
  setAnswer: <K extends keyof Profile>(key: K, value: Profile[K]) => void
  setAnswers: (answers: Partial<Profile>) => void
  loadPersona: (id: PersonaId) => void
  useMyAnswers: () => void
  /** Clears the user's answers and switches back to "My answers". */
  reset: () => void
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      active: 'mine',
      answers: {},
      setAnswer: (key, value) => set((s) => ({ answers: { ...s.answers, [key]: value } })),
      setAnswers: (answers) => set((s) => ({ answers: { ...s.answers, ...answers } })),
      loadPersona: (id) => set({ active: id }),
      useMyAnswers: () => set({ active: 'mine' }),
      reset: () => set({ active: 'mine', answers: {} }),
    }),
    {
      name: 'hcc-profile',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ active: s.active, answers: s.answers }),
    },
  ),
)

/** The profile currently shown: a persona's, or the user's answers with defaults filled in. */
export function selectProfile(s: Pick<ProfileState, 'active' | 'answers'>): Profile {
  return s.active === 'mine' ? resolveProfile(s.answers) : PERSONAS[s.active].profile
}

/** True once the user has answered at least one question. */
export function selectHasAnswers(s: Pick<ProfileState, 'answers'>): boolean {
  return Object.keys(s.answers).length > 0
}
