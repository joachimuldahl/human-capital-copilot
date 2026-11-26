import { describe, expect, it } from 'vitest'
import { assumptions as A } from '../engine'
import { ASSUMPTION_NOTES, assumptionRows } from './assumptionNotes'
import { WHY_WE_ASK } from './whyWeAsk'

describe('"Why we ask" content (BUILD_SPEC 16)', () => {
  it('has all 16 questions, each with why, how and research', () => {
    expect(Object.keys(WHY_WE_ASK)).toHaveLength(16)
    for (const c of Object.values(WHY_WE_ASK)) {
      expect(c.why.length).toBeGreaterThan(10)
      expect(c.how.length).toBeGreaterThan(10)
      expect(c.research.length).toBeGreaterThan(5)
    }
  })
})

describe('assumption notes (BUILD_SPEC 17.3)', () => {
  it('every number and table in assumptions.ts has a label and a justification', () => {
    const keys = Object.entries(A).filter(([, v]) => typeof v === 'number').map(([k]) => k)
    for (const k of [...keys, 'GAMMA', 'SPREAD', 'BETA_BASE', 'VOL', 'CORR', 'STRESS_SHOCK']) expect(ASSUMPTION_NOTES[k]?.why, k).toBeTruthy()
  })
  it('rows read their values from the engine', () => {
    const rows = assumptionRows()
    expect(rows.find((r) => r.key === 'policyCap')?.value).toBe(String(A.policyCap))
    expect(rows.find((r) => r.key === 'BETA_BASE')?.value).toContain('founder 0.65')
  })
})
