import { COV, sigmaEq } from './assumptions'
import type { Allocation } from './types'

/** Portfolio volatility sqrt(wᵀ·COV·w) for weights in [equity, bonds, gold, btc] order. */
export function portfolioVol(w: readonly number[]): number {
  let v = 0
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) v += w[i] * w[j] * COV[i][j]
  return Math.sqrt(Math.max(v, 0))
}

/**
 * Sleeve weights that hit a target Risk Capacity, with optional gold/bitcoin satellites.
 * target vol = targetEEE · 0.16. Bisection on equity e in [0, 2], 200 iterations:
 *   resid = 1 − e − gold − btc; w = [e, max(resid, 0), gold, btc]
 *   vol(w) < target → lo = e, else hi = e
 * Returns {equity, bonds, gold, btc, loan = min(resid, 0), vol}.
 */
export function solveAllocation(targetEEE: number, opts: { gold?: number; btc?: number } = {}): Allocation {
  const gold = opts.gold ?? 0
  const btc = opts.btc ?? 0
  const targetVol = targetEEE * sigmaEq
  const weightsFor = (e: number) => {
    const resid = 1 - e - gold - btc
    return { w: [e, Math.max(resid, 0), gold, btc], resid }
  }
  let lo = 0
  let hi = 2
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2
    if (portfolioVol(weightsFor(mid).w) < targetVol) lo = mid
    else hi = mid
  }
  const e = (lo + hi) / 2
  const { w, resid } = weightsFor(e)
  return { equity: e, bonds: w[1], gold, btc, loan: Math.min(resid, 0), vol: portfolioVol(w) }
}
