/** Public API of the deterministic engine. UI imports numbers only from here (BUILD_SPEC D-4, section 8). */
export * as assumptions from './assumptions'
export * from './types'
export { riskBand, mertonShare } from './riskBand'
export { growthRate, betaH, pvfs } from './humanCapital'
export { targetEEE, leverageEligible, type TargetOptions } from './target'
export { DEFAULT_ANSWERS, resolveProfile, QUESTION_KEYS, unansweredCount } from './defaults'
export { answerEffect, type QuestionNo } from './effects'
export { glidePath } from './glidePath'
export { solveAllocation, portfolioVol } from './allocation'
export { portfolioEEE, stressLoss, marginBuffer, loanAmount, loanCostPerYear, letfDrag } from './risk'
export {
  netWorth,
  exposures,
  lookThrough,
  concentrationFlags,
  overlap,
  overlapPairs,
  assetClassValues,
  portfolioMismatch,
  holdingShares,
  riskFit,
  UNKNOWN,
} from './portfolio'
export * from './explain'
export { PLAN_SLEEVES, planSleeves, planLoan, planChanges, mostUnderweight, monthlySavings, type PlanSleeve, type SleeveRow } from './plan'
