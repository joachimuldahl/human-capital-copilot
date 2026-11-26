import { defaultIncomeGrowth, defaultMaxLossShare, defaultRetireAge } from './assumptions'
import type { PendingCap } from './target'
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

/** Which profile field each onboarding question (1–16) sets. Question 16 also sets leverageOptIn. */
export const QUESTION_KEYS: Record<number, keyof Profile> = {
  1: 'age',
  2: 'retireAge',
  3: 'investableAssets',
  4: 'savingsRate',
  5: 'incomeNow',
  6: 'income10y',
  7: 'sector',
  8: 'variablePayShare',
  9: 'incomeSecurity',
  10: 'bufferMonths',
  11: 'maxDebtRate',
  12: 'drawdownReaction',
  13: 'incomeGamble',
  14: 'maxLossMoney',
  15: 'experience',
  16: 'knowledgeCheckPassed',
}

/** Number of onboarding questions that still use a default (drives the "Preliminary" chip). */
export function unansweredCount(answers: Partial<Profile>): number {
  return Object.values(QUESTION_KEYS).filter((k) => answers[k] === undefined).length
}

/**
 * Limits whose question is still unanswered: G4 waits for Q14 (max loss), G3 for Q16 (knowledge check).
 * The onboarding panel passes these to targetEEE so defaults never set a limit the user hasn't chosen.
 */
export function pendingCaps(answers: Partial<Profile>): PendingCap[] {
  const out: PendingCap[] = []
  if (answers[QUESTION_KEYS[16]] === undefined) out.push('G3_leverage')
  if (answers[QUESTION_KEYS[14]] === undefined) out.push('G4_loss')
  return out
}
