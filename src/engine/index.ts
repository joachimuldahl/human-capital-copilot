/** Public API of the deterministic engine. UI imports numbers only from here (BUILD_SPEC D-4, section 8). */
export * as assumptions from './assumptions'
export * from './types'
export { riskBand, mertonShare } from './riskBand'
export { growthRate, rawGrowthRate, betaH, pvfs } from './humanCapital'
export { targetEEE, leverageEligible, type TargetOptions, type PendingCap } from './target'
export { DEFAULT_ANSWERS, MONEY_KEYS, resolveProfile, scaleMoney, QUESTION_KEYS, unansweredCount, pendingCaps } from './defaults'
export { answerEffect, type QuestionNo } from './effects'
export { glidePath } from './glidePath'
export { solveAllocation, portfolioVol } from './allocation'
export { portfolioEEE, stressLoss, crashCost, maxLossRange, marginBuffer, loanAmount, loanCostPerYear, letfDrag } from './risk'
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
export { portfolioParams, logParams, mulberry32, projectWealth, oneYearRange, CASH_WEIGHTS, type ProjectionWeights, type Projection, type ProjectionPoint, type YearOutcome } from './projection'
export { horizonYears, planSummarySentence, formatMoneyCompact, ownBarSegments, type OwnSegment, type OwnSegmentKey, calloutKind, projectionCallout, oddsSentence, projectionCaption, howToSteps, BAD_YEAR_NOTE, PROJECTION_LABEL, type HorizonChoice, type CompareWith } from './planView'
