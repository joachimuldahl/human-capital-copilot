import {
  BETA_BASE,
  SPREAD,
  betaHMax,
  growthCap,
  growthFloor,
  lateGrowth,
  peakAge,
  rfReal,
  variablePayBeta,
} from './assumptions'
import type { Profile } from './types'

const clamp = (x: number, lo: number, hi: number) => Math.min(Math.max(x, lo), hi)

/**
 * Early-career real income growth implied by the 10-year expectation.
 * g = clamp((income10y / incomeNow)^(1/10) − 1, growthFloor, growthCap)
 */
export function growthRate(p: Profile): number {
  if (p.incomeNow <= 0) return 0
  return clamp(Math.pow(p.income10y / p.incomeNow, 1 / 10) - 1, growthFloor, growthCap)
}

/**
 * How stock-like income is (Ibbotson et al. 2007).
 * βH = min(BETA_BASE[sector] + 0.3 · variablePayShare, 0.9)
 */
export function betaH(p: Profile): number {
  return Math.min(BETA_BASE[p.sector] + variablePayBeta * p.variablePayShare, betaHMax)
}

/**
 * Present value of future savings, valued at `atAge` (real terms).
 * d = rfReal + SPREAD[incomeSecurity]; y starts at incomeNow at p.age
 * for a = p.age+1 … retireAge:
 *   if a > atAge: total += savingsRate · y / (1+d)^(a − atAge)
 *   y *= 1 + (a < peakAge ? g : lateGrowth)
 */
export function pvfs(p: Profile, atAge: number = p.age): number {
  const d = rfReal + SPREAD[p.incomeSecurity]
  const g = growthRate(p)
  let y = p.incomeNow
  let total = 0
  for (let a = p.age + 1; a <= p.retireAge; a++) {
    if (a > atAge) total += (p.savingsRate * y) / Math.pow(1 + d, a - atAge)
    y *= 1 + (a < peakAge ? g : lateGrowth)
  }
  return total
}
