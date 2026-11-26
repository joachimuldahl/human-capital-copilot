import { borrowSpread, erp, lateGrowth, peakAge, rfReal } from './assumptions'
import { growthRate } from './humanCapital'
import { targetEEE } from './target'
import type { GlidePoint, Profile } from './types'

/**
 * Expected path of Risk Capacity from today to retirement, if markets deliver average returns.
 * No loss cap. For a = age … retireAge:
 *   t = targetEEE(p, {F, age: a, applyLossCap: false}); record {age, F, H, raw, final}
 *   e = t.finalEEE; r = rfReal + e·erp − max(e − 1, 0)·borrowSpread
 *   sav = a+1 ≤ retireAge ? savingsRate·y (then y grows by g before peakAge, lateGrowth after) : 0
 *   F = F·(1 + r) + sav
 */
export function glidePath(p: Profile): GlidePoint[] {
  const g = growthRate(p)
  let F = p.investableAssets
  let y = p.incomeNow
  const points: GlidePoint[] = []
  for (let a = p.age; a <= p.retireAge; a++) {
    const t = targetEEE(p, { F, age: a, applyLossCap: false })
    points.push({ age: a, F, H: t.pvfs, raw: t.rawEEE, final: t.finalEEE })
    const e = t.finalEEE
    const r = rfReal + e * erp - Math.max(e - 1, 0) * borrowSpread
    let sav = 0
    if (a + 1 <= p.retireAge) {
      sav = p.savingsRate * y
      y *= 1 + (a + 1 < peakAge ? g : lateGrowth)
    }
    F = F * (1 + r) + sav
  }
  return points
}
