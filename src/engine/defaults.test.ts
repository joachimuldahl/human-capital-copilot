import { describe, expect, it } from 'vitest'
import { DEFAULT_ANSWERS, resolveProfile } from './defaults'
import { targetEEE } from './target'

describe('resolveProfile', () => {
  it('fills every field from the 7.2 defaults', () => {
    const p = resolveProfile({})
    expect(p).toMatchObject(DEFAULT_ANSWERS)
    expect(p.income10y).toBe(53757) // 40,000 · 1.03^10
    expect(p.maxLossMoney).toBe(3000) // 30% of €10,000
    expect(Number.isFinite(targetEEE(p).finalEEE)).toBe(true)
  })
  it('dependent defaults follow the answers they depend on', () => {
    const p = resolveProfile({ incomeNow: 50000, investableAssets: 20000 })
    expect(p.income10y).toBe(67196)
    expect(p.maxLossMoney).toBe(6000)
  })
  it('explicit answers win, including 0', () => {
    const p = resolveProfile({ income10y: 45000, maxLossMoney: 0, age: 30 })
    expect(p.income10y).toBe(45000)
    expect(p.maxLossMoney).toBe(0)
    expect(p.age).toBe(30)
  })
})
