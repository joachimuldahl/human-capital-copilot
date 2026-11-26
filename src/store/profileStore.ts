/**
 * Profile state (persisted in localStorage). The user's own answers ("My answers") are stored apart from the
 * personas: loading a persona only changes `active`, so it never overwrites the user's answers.
 */
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { MONEY_KEYS, resolveProfile, scaleMoney, type Profile } from '../engine'
import { PERSONAS, type PersonaId } from '../data/personas'
import { detectCurrency, FX, type Currency } from '../data/fx'

export type ActiveId = PersonaId | 'mine'

interface ProfileState {
  active: ActiveId
  /** Currency for every amount (BUILD_SPEC 18.1). Answers are stored in this currency. */
  currency: Currency
  /** The user's own answers; missing ones fall back to defaults via resolveProfile. */
  answers: Partial<Profile>
  setAnswer: <K extends keyof Profile>(key: K, value: Profile[K]) => void
  setAnswers: (answers: Partial<Profile>) => void
  /** Removes one answer so it falls back to its default ("I'm not sure"). */
  clearAnswer: (key: keyof Profile) => void
  /** Switches currency and converts the stored money answers at the fixed FX rates (rounded to whole units). */
  setCurrency: (currency: Currency) => void
  loadPersona: (id: PersonaId) => void
  showMyAnswers: () => void
  /** Clears the user's answers and switches back to "My answers". */
  reset: () => void
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      active: 'mine',
      currency: detectCurrency(),
      answers: {},
      setAnswer: (key, value) => set((s) => ({ answers: { ...s.answers, [key]: value } })),
      setAnswers: (answers) => set((s) => ({ answers: { ...s.answers, ...answers } })),
      clearAnswer: (key) =>
        set((s) => {
          const answers = { ...s.answers }
          delete answers[key]
          return { answers }
        }),
      setCurrency: (currency) =>
        set((s) => {
          if (currency === s.currency) return {}
          const answers = scaleMoney(s.answers, FX[currency] / FX[s.currency])
          for (const k of MONEY_KEYS) if (answers[k] !== undefined) answers[k] = Math.round(answers[k] as number)
          return { currency, answers }
        }),
      loadPersona: (id) => set({ active: id }),
      showMyAnswers: () => set({ active: 'mine' }),
      reset: () => set({ active: 'mine', answers: {} }),
    }),
    {
      name: 'hcc-profile',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ active: s.active, currency: s.currency, answers: s.answers }),
      // v1 had no currency: its stored answers are in EUR.
      migrate: (persisted, version) => (version < 2 ? { ...(persisted as object), currency: 'EUR' } : persisted) as ProfileState,
    },
  ),
)

/**
 * The profile currently shown: a persona's (its EUR money converted to the chosen currency), or the user's
 * answers with defaults filled in. The profile carries fx so EUR thresholds convert too.
 */
export function selectProfile(s: Pick<ProfileState, 'active' | 'answers'> & { currency?: Currency }): Profile {
  const currency = s.currency ?? 'EUR'
  const fx = FX[currency]
  if (s.active === 'mine') return resolveProfile(s.answers, fx)
  const persona = PERSONAS[s.active].profile
  return currency === 'EUR' ? persona : { ...scaleMoney(persona, fx), fx }
}

/** True once the user has answered at least one question. */
export function selectHasAnswers(s: Pick<ProfileState, 'answers'>): boolean {
  return Object.keys(s.answers).length > 0
}
