/** Engine types (BUILD_SPEC sections 5.2 and 5.4). */

export type Sector = 'public' | 'health_edu' | 'salaried' | 'tech' | 'sales' | 'finance' | 'founder'
export type IncomeSecurity = 'very_stable' | 'stable' | 'average' | 'volatile'
export type Band = 'very_high' | 'high' | 'moderate' | 'low' | 'very_low'
export type Likert = 1 | 2 | 3 | 4 | 5
export type Experience = 'none' | 'some' | 'experienced'

export interface Profile {
  age: number
  /** Default 67. */
  retireAge: number
  /** F: invested assets today, EUR. */
  investableAssets: number
  /** Share of net income invested, 0–1. */
  savingsRate: number
  /** Net income now, EUR/yr (students: expected starting salary). */
  incomeNow: number
  /** Expected net income in 10 years, EUR/yr. */
  income10y: number
  sector: Sector
  /** Bonus/commission/shares as share of pay, 0–1. */
  variablePayShare: number
  incomeSecurity: IncomeSecurity
  bufferMonths: number
  /** Highest debt interest rate; 0 if no debt, 0.09 = 9%. */
  maxDebtRate: number
  drawdownReaction: Likert
  incomeGamble: Likert
  /** EUR the user could lose in a bad year without changing plans. */
  maxLossMoney: number
  experience: Experience
  knowledgeCheckPassed: boolean
  leverageOptIn: boolean
}

/** Allocation assets with volatility, in matrix order. */
export type AllocAsset = 'equity' | 'bonds' | 'gold' | 'btc'
export type AssetClass = AllocAsset | 'cash'

export type CapId = 'policy_cap' | 'G1_buffer' | 'G2_debt' | 'G3_leverage' | 'G4_loss'
export type GateId = 'G1_buffer' | 'G2_debt' | 'G3_leverage'
export type Binding = CapId | 'model' | 'floor'

export interface Cap {
  id: CapId
  value: number
}

export interface TargetResult {
  band: Band
  gamma: number
  /** Merton optimal share of total wealth in stocks. */
  wStar: number
  growth: number
  betaH: number
  /** H: present value of future savings. */
  pvfs: number
  /** Present value of future earnings (display only). */
  pvEarnings: number
  /** H / (F + H). */
  hcRatio: number
  rawEEE: number
  finalEEE: number
  binding: Binding
  /** Active caps in evaluation order (policy_cap, G1, G2, G3, G4). */
  caps: Cap[]
  /** Active gates (G1–G3), i.e. reasons leverage is blocked. */
  gates: GateId[]
}

export interface GlidePoint {
  age: number
  F: number
  H: number
  raw: number
  final: number
}

export interface Allocation {
  equity: number
  bonds: number
  gold: number
  btc: number
  /** ≤ 0: borrowed share of portfolio. */
  loan: number
  /** Portfolio volatility. */
  vol: number
}

/** Shares of total portfolio value (cash and loan optional). */
export interface Exposures {
  equity: number
  bonds: number
  gold: number
  btc: number
  cash?: number
  loan?: number
}

export interface StressResult {
  /** Fractional change, e.g. -0.475. */
  pct: number
  /** EUR change, e.g. -4750. */
  money: number
}

// ---- Portfolio (5.4) ----

export type Sleeve = 'core_equity' | 'bonds' | 'gold' | 'crypto' | 'leveraged' | 'single_stock' | 'cash'

export interface Product {
  id: string
  name: string
  ticker: string | null
  assetClass: AssetClass
  sleeve: Sleeve
  leverageFactor: 1 | 2
  ter: number | null
  /** Single stocks only. */
  region?: string
  /** Single stocks only. */
  sector?: string
  illustrative: true
}

export interface Account {
  id: string
  name: string
}

export interface Holding {
  id: string
  accountId: string
  productId: string
  valueEUR: number
}

export interface TopHolding {
  /** For single stocks this equals the product id (e.g. 'aapl'). */
  securityId: string
  name: string
  /** Percent, e.g. 4.5. */
  weight: number
}

export interface LookThroughEntry {
  topHoldings: TopHolding[]
  /** Percent per region; sums to 100. */
  regions: Record<string, number>
  /** Percent per sector; sums to 100. */
  sectors: Record<string, number>
  /** Demo data until verified factsheets arrive (D-16). */
  illustrative: true
}

/** Product id → product. */
export type ProductMap = Record<string, Product>
/** ETF product id → look-through data. */
export type LookThroughMap = Record<string, LookThroughEntry>

export interface ExposureSource {
  productId: string
  /** 'direct' for single stocks, otherwise the ETF's ticker (or name). */
  label: string
  /** Share of net worth. */
  share: number
}

export interface SecurityExposure {
  securityId: string
  name: string
  valueEUR: number
  /** Share of net worth. */
  share: number
  sources: ExposureSource[]
}

export interface Split {
  name: string
  valueEUR: number
  /** Share of equity value. */
  share: number
}

export interface LookThroughResult {
  securities: SecurityExposure[]
  regions: Split[]
  sectors: Split[]
  equityValue: number
  netWorth: number
}

export type FlagLevel = 'warning' | 'alert'
export interface ConcentrationFlag extends SecurityExposure {
  level: FlagLevel
}

export type RiskFitStatus = 'On target' | 'Too much risk' | 'Too little risk'
export interface RiskFit {
  gap: number
  status: RiskFitStatus
}

export interface ClassValue {
  assetClass: AssetClass
  valueEUR: number
  /** Share of net worth (not leverage-adjusted). */
  share: number
}

export interface OverlapPair {
  a: string
  b: string
  /** Fraction of top holdings shared, e.g. 0.15. */
  overlap: number
}
