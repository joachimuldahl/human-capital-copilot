import { defaultIncomeGrowth, defaultMaxLossShare, defaultRetireAge } from './assumptions'
import type { Profile } from './types'

/** Onboarding defaults (BUILD_SPEC 7.2), except the two that depend on other answers. */
export const DEFAULT_ANSWERS: Omit<Profile, 'income10y' | 'maxLossMoney'> = {
  age: 25,
  retireAge: defaultRetireAge,
  investableAssets: 10000,
  savingsRate: 0.1,
  incomeNow: 40000,
  sector: 'salaried',
  variablePayShare: 0,
  incomeSecurity: 'average',
  bufferMonths: 3,
  maxDebtRate: 0,
  drawdownReaction: 3,
  incomeGamble: 3,
  experience: 'some',
  knowledgeCheckPassed: false,
  leverageOptIn: false,
}

/**
 * Full profile from (possibly partial) answers; missing answers use the defaults.
 * Unanswered income10y = incomeNow · (1 + 3%)^10; unanswered maxLossMoney = 30% · F (rounded to whole EUR).
 */
export function resolveProfile(answers: Partial<Profile>): Profile {
  const base = { ...DEFAULT_ANSWERS, ...answers }
  return {
    ...base,
    income10y: answers.income10y ?? Math.round(base.incomeNow * Math.pow(1 + defaultIncomeGrowth, 10)),
    maxLossMoney: answers.maxLossMoney ?? Math.round(defaultMaxLossShare * base.investableAssets),
  }
}
