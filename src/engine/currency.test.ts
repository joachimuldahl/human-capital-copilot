/** Currency invariance (BUILD_SPEC 18.1): every persona in every currency gives the EUR result (±0.0005). */
import { describe, expect, it } from 'vitest'
import { CURRENCIES, FX } from '../data/fx'
import { DEMO_PORTFOLIOS } from '../data/demoPortfolios'
import { scaleMoney } from './defaults'
import { solveAllocation } from './allocation'
import { glidePath } from './glidePath'
import { exposures, netWorth } from './portfolio'
import { portfolioEEE, stressLoss } from './risk'
import { leverageEligible, targetEEE } from './target'
import { PERSONAS, PRODUCTS } from './test/fixtures'
import type { PersonaId } from '../data/personas'

const TOL = 0.0005
const ids = Object.keys(PERSONAS) as PersonaId[]
const cases = ids.flatMap((id) => CURRENCIES.map((c) => [id, c] as const))

describe('currency invariance (18.1)', () => {
  it.each(cases)('%s in %s: finalEEE, rawEEE, binding and allocation equal EUR', (id, currency) => {
    const eur = PERSONAS[id]
    const p = { ...scaleMoney(eur, FX[currency]), fx: FX[currency] }
    const a = targetEEE(eur)
    const b = targetEEE(p)
    expect(Math.abs(b.finalEEE - a.finalEEE)).toBeLessThan(TOL)
    expect(Math.abs(b.rawEEE - a.rawEEE)).toBeLessThan(TOL)
    expect(b.binding).toBe(a.binding)
    expect(b.caps.map((c) => c.id)).toEqual(a.caps.map((c) => c.id))
    const ea = solveAllocation(a.finalEEE)
    const eb = solveAllocation(b.finalEEE)
    for (const k of ['equity', 'bonds', 'gold', 'btc', 'loan'] as const) expect(Math.abs(eb[k] - ea[k])).toBeLessThan(TOL)
    // Money scales with the rate.
    expect(b.pvfs / FX[currency]).toBeCloseTo(a.pvfs, 6)
  })

  it.each(cases)('%s in %s: glide path and demo portfolio risk equal EUR', (id, currency) => {
    const fx = FX[currency]
    const eur = PERSONAS[id]
    const p = { ...scaleMoney(eur, fx), fx }
    glidePath(p).forEach((pt, i) => expect(Math.abs(pt.final - glidePath(eur)[i].final)).toBeLessThan(TOL))
    const h = DEMO_PORTFOLIOS[id].holdings
    const hx = h.map((x) => ({ ...x, valueEUR: x.valueEUR * fx }))
    expect(netWorth(hx)).toBeCloseTo(p.investableAssets, 6)
    expect(Math.abs(portfolioEEE(exposures(hx, PRODUCTS)) - portfolioEEE(exposures(h, PRODUCTS)))).toBeLessThan(TOL)
    expect(stressLoss(exposures(hx, PRODUCTS), netWorth(hx)).pct).toBeCloseTo(stressLoss(exposures(h, PRODUCTS), netWorth(h)).pct, 9)
  })

  it('the €5,000 borrowing minimum converts with fx (G3)', () => {
    const sofie = PERSONAS.sofie
    // 30,000 kr is below €5,000 · 7.4749 = 37,374.5 kr, so leverage is blocked in DKK …
    expect(leverageEligible({ ...sofie, fx: FX.DKK }, 30000, sofie.age)).toBe(false)
    // … while €30,000 (no fx) is well above it.
    expect(leverageEligible(sofie, 30000, sofie.age)).toBe(true)
    expect(leverageEligible({ ...sofie, fx: FX.DKK }, 37375, sofie.age)).toBe(true)
  })
})
