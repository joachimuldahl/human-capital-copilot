import { describe, expect, it } from 'vitest'
import { betaH, growthRate, pvfs } from './humanCapital'
import { mertonShare, riskBand } from './riskBand'
import { resolveProfile } from './defaults'
import { leverageEligible, targetEEE } from './target'
import { PERSONAS } from './test/fixtures'
import type { Profile } from './types'

const R = 3 // ratios ±0.001 → toBeCloseTo(x, 3) allows ±0.0005
const near = (actual: number, expected: number, tol: number) => expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tol)

// BUILD_SPEC section 9, first table
const EXPECTED = {
  sofie: { band: 'high', w: 0.8789, growth: 0.035, beta: 0.2, pvfs: 219483.66, hc: 0.9564, raw: 15.7798, final: 1.5, binding: 'policy_cap', g4: 1.6 },
  mads: { band: 'moderate', w: 0.5859, growth: 0.03, beta: 0.05, pvfs: 336298.99, hc: 0.9308, raw: 7.7953, final: 1.2, binding: 'G4_loss', g4: 1.2 },
  lea: { band: 'moderate', w: 0.5859, growth: 0.05, beta: 0.61, pvfs: 402386.74, hc: 0.9096, raw: 0.3439, final: 0.3439, binding: 'model', g4: 1.0 },
  jonas: { band: 'high', w: 0.8789, growth: 0.06, beta: 0.71, pvfs: 116565.28, hc: 0.886, raw: 2.1915, final: 0.6667, binding: 'G4_loss', g4: 0.6667 },
} as const

describe('targetEEE: section 9 personas', () => {
  for (const [id, e] of Object.entries(EXPECTED)) {
    it(`${id} → ${e.final}× (${e.binding})`, () => {
      const t = targetEEE(PERSONAS[id as keyof typeof PERSONAS])
      expect(t.band).toBe(e.band)
      near(t.wStar, e.w, 0.001)
      near(t.growth, e.growth, 0.001)
      near(t.betaH, e.beta, 0.001)
      near(t.pvfs, e.pvfs, 2)
      near(t.hcRatio, e.hc, 0.001)
      near(t.rawEEE, e.raw, 0.001)
      near(t.finalEEE, e.final, 0.001)
      expect(t.binding).toBe(e.binding)
      expect(t.caps.map((c) => c.id)).toEqual(['policy_cap', 'G4_loss'])
      expect(t.caps[0].value).toBe(1.5)
      near(t.caps[1].value, e.g4, 0.001)
      expect(t.gates).toEqual([])
      near(t.pvEarnings, e.pvfs / PERSONAS[id as keyof typeof PERSONAS].savingsRate, 2)
    })
  }
})

describe('gate tests on Sofie (section 9)', () => {
  const sofie = PERSONAS.sofie
  it('bufferMonths 2 → 1.0, G1_buffer', () => {
    const t = targetEEE({ ...sofie, bufferMonths: 2 })
    expect(t.finalEEE).toBe(1.0)
    expect(t.binding).toBe('G1_buffer')
    expect(t.gates).toContain('G1_buffer')
  })
  it('maxDebtRate 0.09 → 1.0, G2_debt', () => {
    const t = targetEEE({ ...sofie, maxDebtRate: 0.09 })
    expect(t.finalEEE).toBe(1.0)
    expect(t.binding).toBe('G2_debt')
  })
  it('leverageOptIn false → 1.0, G3_leverage', () => {
    const t = targetEEE({ ...sofie, leverageOptIn: false })
    expect(t.finalEEE).toBe(1.0)
    expect(t.binding).toBe('G3_leverage')
  })
  it("experience 'none' + knowledge check not passed → moderate, 1.0, G3_leverage", () => {
    const t = targetEEE({ ...sofie, experience: 'none', knowledgeCheckPassed: false })
    expect(t.band).toBe('moderate')
    expect(t.finalEEE).toBe(1.0)
    expect(t.binding).toBe('G3_leverage')
  })
  it('first cap in order wins when several share the minimum', () => {
    const t = targetEEE({ ...sofie, bufferMonths: 0, maxDebtRate: 0.2, leverageOptIn: false })
    expect(t.binding).toBe('G1_buffer')
    expect(t.gates).toEqual(['G1_buffer', 'G2_debt', 'G3_leverage'])
  })
})

describe('targetEEE edge cases', () => {
  it('floor binds when raw is below 0.2', () => {
    const p: Profile = { ...PERSONAS.lea, drawdownReaction: 1, incomeGamble: 1, sector: 'founder', variablePayShare: 1 }
    const t = targetEEE(p)
    expect(t.rawEEE).toBeLessThan(0.2)
    expect(t.finalEEE).toBe(0.2)
    expect(t.binding).toBe('floor')
  })
  it('F = 0 does not divide by zero', () => {
    const t = targetEEE({ ...PERSONAS.sofie, investableAssets: 0 })
    expect(Number.isFinite(t.rawEEE)).toBe(true)
    expect(t.binding).toBe('G3_leverage') // F < 5000 blocks leverage
  })
  it('applyLossCap false drops G4', () => {
    expect(targetEEE(PERSONAS.mads, { applyLossCap: false }).caps.map((c) => c.id)).toEqual(['policy_cap'])
  })
  it('savingsRate 0 → no future savings, pvEarnings 0', () => {
    const t = targetEEE({ ...PERSONAS.sofie, savingsRate: 0 })
    expect(t.pvfs).toBe(0)
    expect(t.pvEarnings).toBe(0)
  })
  it('leverage needs 15+ years to retirement', () => {
    expect(leverageEligible(PERSONAS.sofie, 10000, 52)).toBe(true)
    expect(leverageEligible(PERSONAS.sofie, 10000, 53)).toBe(false)
    expect(leverageEligible(PERSONAS.sofie, 4999, 24)).toBe(false)
  })
})

describe('targetEEE pending option (limits whose question is unanswered)', () => {
  it('default: nothing pending, section 9 results unchanged', () => {
    for (const [id, e] of Object.entries(EXPECTED)) {
      const p = PERSONAS[id as keyof typeof PERSONAS]
      expect(targetEEE(p, { pending: [] })).toEqual(targetEEE(p))
      expect(targetEEE(p).finalEEE).toBeCloseTo(e.final, R)
      expect(targetEEE(p).binding).toBe(e.binding)
    }
  })
  it('G4 pending: the loss cap is skipped (Mads 1.20× → 1.50×, binding policy_cap)', () => {
    const t = targetEEE(PERSONAS.mads, { pending: ['G4_loss'] })
    expect(t.caps.map((c) => c.id)).toEqual(['policy_cap'])
    expect(t.finalEEE).toBe(1.5)
    expect(t.binding).toBe('policy_cap')
    expect(t.rawEEE).toBeCloseTo(EXPECTED.mads.raw, R) // raw is not affected
  })
  it('G3 pending: the leverage gate is skipped and not listed as a gate', () => {
    const p = { ...PERSONAS.sofie, leverageOptIn: false }
    expect(targetEEE(p).binding).toBe('G3_leverage')
    const t = targetEEE(p, { pending: ['G3_leverage'] })
    expect(t.gates).not.toContain('G3_leverage')
    expect(t.caps.map((c) => c.id)).toEqual(['policy_cap', 'G4_loss'])
    expect(t.finalEEE).toBe(1.5)
  })
  it('G1 and G2 still apply while G3/G4 are pending', () => {
    const t = targetEEE({ ...PERSONAS.sofie, bufferMonths: 2 }, { pending: ['G3_leverage', 'G4_loss'] })
    expect(t.finalEEE).toBe(1.0)
    expect(t.binding).toBe('G1_buffer')
  })
  it('onboarding defaults: 1.50× (safety cap) instead of 0.60× from a default loss limit', () => {
    const p = resolveProfile({})
    expect(targetEEE(p).finalEEE).toBeCloseTo(0.6, R)
    const t = targetEEE(p, { pending: ['G3_leverage', 'G4_loss'] })
    expect(t.finalEEE).toBe(1.5)
    expect(t.binding).toBe('policy_cap')
  })
  it('works together with applyLossCap false', () => {
    expect(targetEEE(PERSONAS.jonas, { applyLossCap: false, pending: ['G3_leverage'] }).caps.map((c) => c.id)).toEqual(['policy_cap'])
  })
})

describe('riskBand and mertonShare', () => {
  const withScores = (d: number, g: number) => ({ ...PERSONAS.sofie, drawdownReaction: d, incomeGamble: g }) as Profile
  it.each([
    [5, 4, 'very_high'],
    [4, 4, 'high'],
    [3, 3, 'moderate'],
    [2, 2, 'low'],
    [1, 2, 'very_low'],
  ])('scores %i/%i → %s', (d, g, band) => {
    expect(riskBand(withScores(d, g)).band).toBe(band)
  })
  it('very_high is capped at moderate without experience or knowledge', () => {
    expect(riskBand({ ...withScores(5, 5), experience: 'none', knowledgeCheckPassed: false }).band).toBe('moderate')
  })
  it('no downgrade for low bands', () => {
    expect(riskBand({ ...withScores(2, 2), experience: 'none', knowledgeCheckPassed: false }).band).toBe('low')
  })
  it('mertonShare values from 5.3', () => {
    expect(mertonShare(2)).toBeCloseTo(0.8789, R)
    expect(mertonShare(3)).toBeCloseTo(0.5859, R)
    expect(mertonShare(1)).toBe(1)
  })
})

describe('human capital helpers', () => {
  it('growth is clamped', () => {
    expect(growthRate({ ...PERSONAS.sofie, income10y: 1e6 })).toBe(0.12)
    expect(growthRate({ ...PERSONAS.sofie, income10y: 1000 })).toBe(-0.02)
    expect(growthRate({ ...PERSONAS.sofie, incomeNow: 0 })).toBe(0)
  })
  it('βH is capped at 0.9', () => {
    expect(betaH({ ...PERSONAS.jonas, variablePayShare: 1 })).toBe(0.9)
  })
  it('pvfs at retirement age is 0', () => {
    expect(pvfs(PERSONAS.sofie, 67)).toBe(0)
  })
})
