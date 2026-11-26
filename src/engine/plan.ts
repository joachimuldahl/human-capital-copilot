import { borrowSpread, cashNominal, planChangeThreshold } from './assumptions'
import type { Allocation, ClassValue, Profile } from './types'

export type PlanSleeve = 'equity' | 'bonds' | 'gold' | 'crypto' | 'cash' | 'loan'
export const PLAN_SLEEVES: PlanSleeve[] = ['equity', 'bonds', 'gold', 'crypto', 'cash', 'loan']

export interface SleeveRow {
  sleeve: PlanSleeve
  /** Target weight of F (loan is negative). */
  targetShare: number
  targetEUR: number
  /** Current weight of the current portfolio total (not leverage-adjusted). */
  currentShare: number
  currentEUR: number
  /** targetEUR − currentEUR. */
  diffEUR: number
}

/**
 * Target vs current per sleeve.
 * Target: solveAllocation weights · F (cash 0). Current: value per asset class (bitcoin → crypto, no loan).
 */
export function planSleeves(alloc: Allocation, current: ClassValue[], F: number): SleeveRow[] {
  const target: Record<PlanSleeve, number> = { equity: alloc.equity, bonds: alloc.bonds, gold: alloc.gold, crypto: alloc.btc, cash: 0, loan: alloc.loan }
  const cur = (s: PlanSleeve) => current.find((c) => (c.assetClass === 'btc' ? 'crypto' : c.assetClass) === s)
  return PLAN_SLEEVES.map((sleeve) => {
    const targetEUR = target[sleeve] * F
    const currentEUR = cur(sleeve)?.valueEUR ?? 0
    return { sleeve, targetShare: target[sleeve], targetEUR, currentShare: cur(sleeve)?.share ?? 0, currentEUR, diffEUR: targetEUR - currentEUR }
  })
}

/** Broker loan implied by the allocation: amount = −loan · F; yearly interest = amount · (cashNominal + borrowSpread). */
export function planLoan(alloc: Allocation, F: number): { amount: number; costPerYear: number } {
  const amount = Math.max(-alloc.loan, 0) * F
  return { amount, costPerYear: amount * (cashNominal + borrowSpread) }
}

/** Sleeves where |target − current| > 2% of F, largest change first. */
export function planChanges(rows: SleeveRow[], F: number): SleeveRow[] {
  return rows.filter((r) => Math.abs(r.diffEUR) > planChangeThreshold * Math.max(F, 0)).sort((a, b) => Math.abs(b.diffEUR) - Math.abs(a.diffEUR))
}

/** The sleeve furthest below target (loan excluded); null if nothing is below target. */
export function mostUnderweight(rows: SleeveRow[]): SleeveRow | null {
  const under = rows.filter((r) => r.sleeve !== 'loan' && r.diffEUR > 0).sort((a, b) => b.diffEUR - a.diffEUR)
  return under[0] ?? null
}

/** Monthly amount invested: savingsRate · incomeNow / 12. */
export function monthlySavings(p: Profile): number {
  return (p.savingsRate * p.incomeNow) / 12
}
