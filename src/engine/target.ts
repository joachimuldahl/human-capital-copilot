import {
  borrowSpread,
  cashNominal,
  equityNominal,
  equityShock,
  expensiveDebtRate,
  floor,
  leverageHurdle,
  minAssetsForLeverage,
  minBufferMonths,
  minYearsForLeverage,
  policyCap,
} from './assumptions'
import { betaH, growthRate, pvfs } from './humanCapital'
import { mertonShare, riskBand } from './riskBand'
import type { Binding, Cap, GateId, Profile, TargetResult } from './types'

export interface TargetOptions {
  /** Invested assets; defaults to p.investableAssets. */
  F?: number
  /** Age to value at; defaults to p.age. */
  age?: number
  /** Apply the G4 loss cap; default true (glide path uses false). */
  applyLossCap?: boolean
}

/** True if borrowing to invest is allowed (gate G3 open). */
export function leverageEligible(p: Profile, F: number, age: number): boolean {
  return (
    p.retireAge - age >= minYearsForLeverage &&
    F >= minAssetsForLeverage &&
    p.knowledgeCheckPassed &&
    p.leverageOptIn &&
    cashNominal + borrowSpread <= equityNominal - leverageHurdle
  )
}

/**
 * Risk Capacity as a multiple of global equity (Ayres & Nalebuff 2010).
 * w = mertonShare(gamma); H = pvfs(p, age); b = βH
 * raw = (w·F + (w − b)·H) / F, with F = max(F, 1)
 * caps in order: policy_cap 1.5 · G1_buffer 1.0 (buffer < 3 months) · G2_debt 1.0 (debt > 7%)
 *   · G3_leverage 1.0 (unless eligible) · G4_loss = maxLossMoney / (equityShock · F)
 * final = max(floor, min(raw, min(caps)))
 * binding = raw ≤ capVal ? (raw ≥ floor ? 'model' : 'floor') : first cap equal to capVal
 * hcRatio = H / (F + H)
 */
export function targetEEE(p: Profile, opts: TargetOptions = {}): TargetResult {
  const age = opts.age ?? p.age
  const applyLossCap = opts.applyLossCap ?? true
  const F = Math.max(opts.F ?? p.investableAssets, 1)

  const { band, gamma } = riskBand(p)
  const w = mertonShare(gamma)
  const H = pvfs(p, age)
  const b = betaH(p)
  const raw = (w * F + (w - b) * H) / F

  const caps: Cap[] = [{ id: 'policy_cap', value: policyCap }]
  const gates: GateId[] = []
  if (p.bufferMonths < minBufferMonths) {
    caps.push({ id: 'G1_buffer', value: 1.0 })
    gates.push('G1_buffer')
  }
  if (p.maxDebtRate > expensiveDebtRate) {
    caps.push({ id: 'G2_debt', value: 1.0 })
    gates.push('G2_debt')
  }
  if (!leverageEligible(p, F, age)) {
    caps.push({ id: 'G3_leverage', value: 1.0 })
    gates.push('G3_leverage')
  }
  if (applyLossCap) {
    caps.push({ id: 'G4_loss', value: Math.max(p.maxLossMoney, 0) / (equityShock * F) })
  }

  const capVal = Math.min(...caps.map((c) => c.value))
  const finalEEE = Math.max(floor, Math.min(raw, capVal))
  const binding: Binding =
    raw <= capVal ? (raw >= floor ? 'model' : 'floor') : (caps.find((c) => c.value === capVal) as Cap).id

  const pvE = p.savingsRate > 0 ? H / p.savingsRate : 0

  return {
    band,
    gamma,
    wStar: w,
    growth: growthRate(p),
    betaH: b,
    pvfs: H,
    pvEarnings: pvE,
    hcRatio: H / (F + H),
    rawEEE: raw,
    finalEEE,
    binding,
    caps,
    gates,
  }
}
