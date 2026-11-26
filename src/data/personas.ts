/** Demo personas (BUILD_SPEC 6.1). Illustrative (D-16). */
import type { Profile } from '../engine'

export type PersonaId = 'sofie' | 'mads' | 'lea' | 'jonas'

export interface Persona {
  id: PersonaId
  name: string
  /** One line shown in the UI. */
  story: string
  profile: Profile
}

const shared = {
  retireAge: 67,
  bufferMonths: 4,
  maxDebtRate: 0,
  experience: 'some',
  knowledgeCheckPassed: true,
  leverageOptIn: true,
} as const

export const PERSONAS: Record<PersonaId, Persona> = {
  sofie: {
    id: 'sofie',
    name: 'Sofie',
    story: "24, finishing a master's, starting as a consultant",
    profile: { ...shared, age: 24, investableAssets: 10000, savingsRate: 0.15, incomeNow: 45000, income10y: 63476, sector: 'salaried', variablePayShare: 0, incomeSecurity: 'average', drawdownReaction: 4, incomeGamble: 4, maxLossMoney: 8000 },
  },
  mads: {
    id: 'mads',
    name: 'Mads',
    story: '27, doctor in the public health system',
    profile: { ...shared, age: 27, investableAssets: 25000, savingsRate: 0.15, incomeNow: 55000, income10y: 73915, sector: 'public', variablePayShare: 0, incomeSecurity: 'very_stable', drawdownReaction: 3, incomeGamble: 3, maxLossMoney: 15000 },
  },
  lea: {
    id: 'lea',
    name: 'Lea',
    story: '26, trader at a bank with a yearly bonus',
    profile: { ...shared, age: 26, investableAssets: 40000, savingsRate: 0.2, incomeNow: 70000, income10y: 114023, sector: 'finance', variablePayShare: 0.2, incomeSecurity: 'volatile', drawdownReaction: 3, incomeGamble: 3, maxLossMoney: 20000, experience: 'experienced' },
  },
  jonas: {
    id: 'jonas',
    name: 'Jonas',
    story: '29, startup founder',
    profile: { ...shared, age: 29, investableAssets: 15000, savingsRate: 0.1, incomeNow: 40000, income10y: 71634, sector: 'founder', variablePayShare: 0.2, incomeSecurity: 'volatile', drawdownReaction: 4, incomeGamble: 4, maxLossMoney: 5000 },
  },
}

export const PERSONA_IDS = Object.keys(PERSONAS) as PersonaId[]
