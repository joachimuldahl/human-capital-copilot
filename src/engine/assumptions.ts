/**
 * Every constant the engine uses (BUILD_SPEC section 5.1).
 * Each value is an assumption and editable. Rates are real (inflation-adjusted)
 * unless the name says "Nominal".
 */
import type { AllocAsset, Band, IncomeSecurity, Sector } from './types'

/** Real risk-free rate. Assumption, editable. */
export const rfReal = 0.01
/** Equity risk premium over the risk-free rate. Assumption, editable. */
export const erp = 0.045
/** Volatility of global equity. Assumption, editable. */
export const sigmaEq = 0.16
/** Extra interest a broker charges over cash rates on a margin loan. Assumption, editable. */
export const borrowSpread = 0.015
/** Nominal cash rate. Assumption, editable. */
export const cashNominal = 0.03
/** Nominal expected equity return. Assumption, editable. */
export const equityNominal = 0.075
/** Real income growth after peakAge. Assumption, editable. */
export const lateGrowth = 0.005
/** Age at which early-career income growth stops. Assumption, editable. */
export const peakAge = 45
/** Upper clamp on early-career real income growth: a generous bound for steep early careers. Assumption, editable. */
export const growthCap = 0.12
/** Lower clamp on early-career real income growth. Assumption, editable. */
export const growthFloor = -0.02
/** Policy cap on risk: never above 1.5x global equity. Assumption, editable. */
export const policyCap = 1.5
/** Minimum risk we ever recommend. Assumption, editable. */
export const floor = 0.2
/** Broker maintenance margin. Assumption, editable. */
export const maintMargin = 0.25
/** Equity fall used for the loss cap (a 2008-style crash). Assumption, editable. */
export const equityShock = 0.5
/** Leverage only if expected equity return beats loan cost by at least this. Assumption, editable. */
export const leverageHurdle = 0.02
/** Minimum invested assets (EUR; converted with the profile's fx) before borrowing to invest. Assumption, editable. */
export const minAssetsForLeverage = 5000
/** Minimum years to retirement before borrowing to invest. Assumption, editable. */
export const minYearsForLeverage = 15
/** Emergency buffer (months of expenses) required before any leverage. Assumption, editable. */
export const minBufferMonths = 3
/** Debt above this interest rate caps risk at 1.0x. Assumption, editable. */
export const expensiveDebtRate = 0.07
/** Default retirement age. Assumption, editable. */
export const defaultRetireAge = 67

/** Relative risk aversion by risk band. Assumption, editable. */
export const GAMMA: Record<Band, number> = {
  very_high: 1.75,
  high: 2.0,
  moderate: 3.0,
  low: 4.5,
  very_low: 7.0,
}

/** Discount-rate spread over rfReal by income security. Assumption, editable. */
export const SPREAD: Record<IncomeSecurity, number> = {
  very_stable: 0.01,
  stable: 0.02,
  average: 0.03,
  volatile: 0.045,
}

/** How stock-like income is, by sector (before variable pay). Assumption, editable. */
export const BETA_BASE: Record<Sector, number> = {
  public: 0.05,
  health_edu: 0.1,
  salaried: 0.2,
  tech: 0.35,
  sales: 0.45,
  finance: 0.55,
  founder: 0.65,
}

/** Weight of variable pay share in βH. Assumption, editable. */
export const variablePayBeta = 0.3
/** Maximum βH. Assumption, editable. */
export const betaHMax = 0.9

/** Allocation assets, in matrix order. */
export const ALLOC_ASSETS: readonly AllocAsset[] = ['equity', 'bonds', 'gold', 'btc']

/** Volatility per allocation asset. Assumption, editable. */
export const VOL: Record<AllocAsset, number> = {
  equity: 0.16,
  bonds: 0.05,
  gold: 0.15,
  btc: 0.6,
}

/** Correlation matrix in ALLOC_ASSETS order. Assumption, editable. */
export const CORR: readonly (readonly number[])[] = [
  [1.0, 0.2, 0.1, 0.4],
  [0.2, 1.0, 0.3, 0.0],
  [0.1, 0.3, 1.0, 0.1],
  [0.4, 0.0, 0.1, 1.0],
]

/** Covariance matrix: COV[i][j] = VOL[i] * VOL[j] * CORR[i][j]. Cash and loan have zero volatility. */
export const COV: readonly (readonly number[])[] = ALLOC_ASSETS.map((a, i) =>
  ALLOC_ASSETS.map((b, j) => VOL[a] * VOL[b] * CORR[i][j]),
)

/** Stress-test shock per exposure (a 2008-style crash). Assumption, editable. */
export const STRESS_SHOCK = {
  equity: -0.5,
  bonds: 0.03,
  gold: 0.05,
  btc: -0.75,
  cash: 0,
  loan: 0,
} as const

/** Risk-fit tolerance: |actual - target| within this counts as "On target". Assumption, editable. */
export const riskFitTolerance = 0.15
/** Single security above this share of net worth → warning. Assumption, editable. */
export const concentrationWarn = 0.05
/** Single security above this share of net worth → alert. Assumption, editable. */
export const concentrationAlert = 0.1

/** Onboarding default for expected income growth (question 6: "+3%/yr"). Assumption, editable. */
export const defaultIncomeGrowth = 0.03
/** Onboarding default for max loss in a bad year, as share of F (question 14: "30% of F"). Assumption, editable. */
export const defaultMaxLossShare = 0.3

/** Portfolio total differing from F by more than this share triggers the "use as invested amount" banner. Assumption, editable. */
export const portfolioMismatchTolerance = 0.05

/** "How to get there" lists only changes larger than this share of F. Assumption, editable. */
export const planChangeThreshold = 0.02
