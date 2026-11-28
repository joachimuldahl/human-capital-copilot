import { STRESS_SHOCK, borrowSpread, cashNominal, equityShock, maintMargin, policyCap, sigmaEq } from './assumptions'
import { portfolioVol } from './allocation'
import type { Exposures, StressResult } from './types'

/**
 * Risk of a portfolio as a multiple of global equity.
 * portfolioEEE = sqrt(xᵀ·COV·x) / 0.16, x = shares of total value in [equity, bonds, gold, btc].
 * Cash contributes nothing.
 */
export function portfolioEEE(x: Exposures): number {
  return portfolioVol([x.equity, x.bonds, x.gold, x.btc]) / sigmaEq
}

/**
 * Loss in a 2008-style crash.
 * pct = Σ shareₖ · SHOCKₖ (equity −50%, bonds +3%, gold +5%, btc −75%, cash 0, loan 0); money = pct · F
 */
export function stressLoss(x: Exposures, F: number): StressResult {
  const pct =
    x.equity * STRESS_SHOCK.equity +
    x.bonds * STRESS_SHOCK.bonds +
    x.gold * STRESS_SHOCK.gold +
    x.btc * STRESS_SHOCK.btc +
    (x.cash ?? 0) * STRESS_SHOCK.cash +
    (x.loan ?? 0) * STRESS_SHOCK.loan
  return { pct, money: pct * F }
}

/**
 * What a stock-market crash (equityShock, −50%) costs at a target exposure: equityShock · eee · F.
 * At the G4 loss cap this equals maxLossMoney exactly, because G4 = maxLossMoney / (equityShock · F).
 */
export function crashCost(eee: number, F: number): number {
  return equityShock * eee * Math.max(F, 0)
}

/**
 * Range for the "max loss in a bad year" what-if slider: 0 to the largest loss possible at the policy cap,
 * equityShock · policyCap · F (= 0.75 · F), but at least `minMax` (500 in the chosen currency).
 */
export function maxLossRange(F: number, minMax = 500): { min: number; max: number } {
  return { min: 0, max: Math.max(equityShock * policyCap * Math.max(F, 0), minMax) }
}

/**
 * How far stocks can fall before a margin call.
 * eee ≤ 1 → null; else 1 − (eee − 1) / ((1 − maintMargin) · eee). (1.5 → 0.5556)
 */
export function marginBuffer(eee: number): number | null {
  if (eee <= 1) return null
  return 1 - (eee - 1) / ((1 - maintMargin) * eee)
}

/** Broker loan needed for a given exposure: max(eee − 1, 0) · F. */
export function loanAmount(eee: number, F: number): number {
  return Math.max(eee - 1, 0) * F
}

/** Yearly interest on that loan: loanAmount · (cashNominal + borrowSpread). */
export function loanCostPerYear(eee: number, F: number): number {
  return loanAmount(eee, F) * (cashNominal + borrowSpread)
}

/**
 * Yearly volatility drag of a daily-rebalanced leveraged ETF vs L× the index.
 * letfDrag = (L² − L) / 2 · σ². (2× at 16% → 0.0256)
 */
export function letfDrag(L: number, sigma: number): number {
  return ((L * L - L) / 2) * sigma * sigma
}
