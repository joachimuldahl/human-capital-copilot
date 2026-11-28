/**
 * Wealth projections for the Plan page (BUILD_SPEC section 19, v1.7).
 * Pure functions: everything is in real terms (today's money), before fees and taxes.
 */
import { EXPECTED_NOMINAL, inflation, loanRate, projectionPaths, projectionSeed } from './assumptions'
import { portfolioVol } from './allocation'
import { stressLoss } from './risk'
import type { StressResult } from './types'

/** Weights over equity, bonds, gold, btc, cash and loan (loan ≤ 0). Compatible with Allocation and Exposures. */
export interface ProjectionWeights {
  equity: number
  bonds: number
  gold: number
  btc: number
  cash?: number
  loan?: number
}

/** All money in cash: the "All in cash" comparison. */
export const CASH_WEIGHTS: ProjectionWeights = { equity: 0, bonds: 0, gold: 0, btc: 0, cash: 1, loan: 0 }

/**
 * Expected real return and volatility of a portfolio.
 * mu = Σ wᵢ·(returnᵢ − inflation) + loan·(loanRate − inflation)   (loan is negative, so borrowing costs money)
 * sigma = sqrt(xᵀ·COV·x) over equity, bonds, gold, btc (cash and loan have zero volatility).
 */
export function portfolioParams(w: ProjectionWeights): { mu: number; sigma: number } {
  const r = (k: keyof typeof EXPECTED_NOMINAL) => EXPECTED_NOMINAL[k] - inflation
  const mu = w.equity * r('equity') + w.bonds * r('bonds') + w.gold * r('gold') + w.btc * r('btc') + (w.cash ?? 0) * r('cash') + (w.loan ?? 0) * (loanRate - inflation)
  return { mu, sigma: portfolioVol([w.equity, w.bonds, w.gold, w.btc]) }
}

/**
 * Yearly log-return parameters of a log-normal return with mean mu and volatility sigma:
 * s² = ln(1 + sigma²/(1+mu)²), m = ln(1+mu) − ½·s².
 */
export function logParams(mu: number, sigma: number): { m: number; s: number } {
  const s2 = Math.log(1 + (sigma * sigma) / ((1 + mu) * (1 + mu)))
  return { m: Math.log(1 + mu) - s2 / 2, s: Math.sqrt(s2) }
}

/** Seeded PRNG (mulberry32): same seed → same sequence in (0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Standard normal draws via Box–Muller from a uniform generator. */
function normals(rand: () => number): () => number {
  let spare: number | null = null
  return () => {
    if (spare !== null) {
      const z = spare
      spare = null
      return z
    }
    let u = 0
    while (u <= Number.EPSILON) u = rand()
    const v = rand()
    const r = Math.sqrt(-2 * Math.log(u))
    spare = r * Math.sin(2 * Math.PI * v)
    return r * Math.cos(2 * Math.PI * v)
  }
}

/** Quantile of an ascending sorted array (linear interpolation). */
function quantile(sorted: Float64Array, q: number): number {
  const pos = (sorted.length - 1) * q
  const lo = Math.floor(pos)
  const hi = Math.ceil(pos)
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo)
}

export interface ProjectionPoint {
  year: number
  /** 1-in-10 bad case. */
  p10: number
  /** Likely value (median). */
  p50: number
  /** 1-in-10 good case. */
  p90: number
  /** startValue + savings so far. */
  paidIn: number
}

export interface Projection {
  points: ProjectionPoint[]
  /** Share of paths ending below the money paid in. */
  probBelowPaidIn: number
  /** Share of paths ending above the same money held in cash. */
  probBeatsCash: number
  /** The same start value and savings held in cash at the horizon (real cash return). */
  cashValue: number
  mu: number
  sigma: number
}

export interface ProjectionInput {
  startValue: number
  monthlySaving: number
  weights: ProjectionWeights
  years: number
  paths?: number
  seed?: number
}

/**
 * Simulated wealth paths in today's money.
 * Each year: W ← W·exp(m + s·Z) + 12·monthlySaving, Z ~ N(0,1) (seeded mulberry32 + Box–Muller).
 * With sigma = 0 this is exact compounding: W ← W·(1+mu) + 12·monthlySaving.
 * Returns p10/p50/p90 and paid-in per year 0…years, plus the odds at the horizon.
 */
export function projectWealth({ startValue, monthlySaving, weights, years, paths = projectionPaths, seed = projectionSeed }: ProjectionInput): Projection {
  const n = Math.max(0, Math.round(years))
  const yearly = 12 * monthlySaving
  const { mu, sigma } = portfolioParams(weights)
  const { m, s } = logParams(mu, sigma)
  const cashReal = EXPECTED_NOMINAL.cash - inflation
  let cashValue = startValue
  for (let y = 1; y <= n; y++) cashValue = cashValue * (1 + cashReal) + yearly
  const paidInAt = (y: number) => startValue + yearly * y

  if (sigma === 0) {
    const points: ProjectionPoint[] = []
    let w = startValue
    for (let y = 0; y <= n; y++) {
      if (y > 0) w = w * (1 + mu) + yearly
      points.push({ year: y, p10: w, p50: w, p90: w, paidIn: paidInAt(y) })
    }
    const end = points[n].p50
    return { points, probBelowPaidIn: end < paidInAt(n) ? 1 : 0, probBeatsCash: end > cashValue + 1e-9 ? 1 : 0, cashValue, mu, sigma }
  }

  const z = normals(mulberry32(seed))
  const wealth = new Float64Array(paths).fill(startValue)
  const sorted = new Float64Array(paths)
  const points: ProjectionPoint[] = [{ year: 0, p10: startValue, p50: startValue, p90: startValue, paidIn: startValue }]
  for (let y = 1; y <= n; y++) {
    for (let i = 0; i < paths; i++) wealth[i] = wealth[i] * Math.exp(m + s * z()) + yearly
    sorted.set(wealth)
    sorted.sort()
    points.push({ year: y, p10: quantile(sorted, 0.1), p50: quantile(sorted, 0.5), p90: quantile(sorted, 0.9), paidIn: paidInAt(y) })
  }
  let below = 0
  let beats = 0
  for (let i = 0; i < paths; i++) {
    if (wealth[i] < paidInAt(n)) below++
    if (wealth[i] > cashValue) beats++
  }
  return { points, probBelowPaidIn: below / paths, probBeatsCash: beats / paths, cashValue, mu, sigma }
}

export interface YearOutcome {
  money: number
  pct: number
}

/** z-score of the 90th percentile of a standard normal. */
const Z90 = 1.2815515655446004

/**
 * One year ahead without savings, in today's money.
 * good = p90 and typical = p50 of the log-normal yearly return (startValue·(exp(m + z·s) − 1));
 * bad = the 2008-style stress test, stressLoss(weights, startValue), so it matches the crash test exactly.
 */
export function oneYearRange(weights: ProjectionWeights, startValue: number): { good: YearOutcome; typical: YearOutcome; bad: StressResult } {
  const { mu, sigma } = portfolioParams(weights)
  const { m, s } = logParams(mu, sigma)
  const goodPct = Math.exp(m + Z90 * s) - 1
  const typicalPct = Math.exp(m) - 1
  return {
    good: { pct: goodPct, money: goodPct * startValue },
    typical: { pct: typicalPct, money: typicalPct * startValue },
    bad: stressLoss(weights, startValue),
  }
}
