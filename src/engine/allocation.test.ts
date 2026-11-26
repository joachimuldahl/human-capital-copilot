import { describe, expect, it } from 'vitest'
import { solveAllocation } from './allocation'
import { targetEEE } from './target'
import { PERSONAS } from './test/fixtures'

const near = (a: number, e: number, tol = 0.001) => expect(Math.abs(a - e)).toBeLessThanOrEqual(tol)

describe('solveAllocation (section 9)', () => {
  it('Sofie 1.5 → equity 150%, loan −50%', () => {
    const a = solveAllocation(1.5)
    near(a.equity, 1.5)
    near(a.loan, -0.5)
    expect(a.bonds).toBe(0)
    near(a.vol, 0.24)
  })
  it('Mads 1.2 → equity 120%, loan −20%', () => {
    const a = solveAllocation(1.2)
    near(a.equity, 1.2)
    near(a.loan, -0.2)
  })
  it('Lea target → equity 18.6%, bonds 81.4%', () => {
    const a = solveAllocation(targetEEE(PERSONAS.lea).finalEEE)
    near(a.equity, 0.186)
    near(a.bonds, 0.814)
    expect(a.loan).toBe(0)
  })
  it('Jonas target → equity 63.4%, bonds 36.6%', () => {
    const a = solveAllocation(targetEEE(PERSONAS.jonas).finalEEE)
    near(a.equity, 0.634)
    near(a.bonds, 0.366)
  })
  it('1.5 with gold 5% and btc 5% → equity 1.4094, loan −0.5094', () => {
    const a = solveAllocation(1.5, { gold: 0.05, btc: 0.05 })
    near(a.equity, 1.4094)
    near(a.loan, -0.5094)
  })
  it('1.5 with btc 10% → equity 1.3101, loan −0.4101', () => {
    const a = solveAllocation(1.5, { btc: 0.1 })
    near(a.equity, 1.3101)
    near(a.loan, -0.4101)
  })
  it('Lea with gold 5% → equity 0.1799, bonds 0.7701', () => {
    const a = solveAllocation(targetEEE(PERSONAS.lea).finalEEE, { gold: 0.05 })
    near(a.equity, 0.1799)
    near(a.bonds, 0.7701)
  })
})
