import { describe, expect, it } from 'vitest'
import { letfDrag, loanAmount, loanCostPerYear, marginBuffer, portfolioEEE, stressLoss } from './risk'

describe('risk helpers (section 9)', () => {
  it('marginBuffer', () => {
    expect(marginBuffer(1.5)).toBeCloseTo(0.5556, 4)
    expect(marginBuffer(1.2)).toBeCloseTo(0.7778, 4)
    expect(marginBuffer(1.0)).toBeNull()
  })
  it('letfDrag(2, 0.16) = 0.0256', () => {
    expect(letfDrag(2, 0.16)).toBeCloseTo(0.0256, 6)
  })
  it('loan amount and cost', () => {
    expect(loanAmount(1.5, 10000)).toBeCloseTo(5000, 6)
    expect(loanAmount(0.8, 10000)).toBe(0)
    expect(loanCostPerYear(1.5, 10000)).toBeCloseTo(225, 6)
  })
  it('portfolioEEE of 100% equity is 1, cash adds nothing', () => {
    expect(portfolioEEE({ equity: 1, bonds: 0, gold: 0, btc: 0 })).toBeCloseTo(1, 10)
    expect(portfolioEEE({ equity: 0.2, bonds: 0, gold: 0, btc: 0, cash: 0.8 })).toBeCloseTo(0.2, 10)
  })
  it('stress test at a levered target counts the loan as 0', () => {
    const s = stressLoss({ equity: 1.5, bonds: 0, gold: 0, btc: 0, loan: -0.5 }, 10000)
    expect(s.pct).toBeCloseTo(-0.75, 10)
    expect(s.money).toBeCloseTo(-7500, 6)
  })
  it('gold and bonds gain in the stress scenario', () => {
    expect(stressLoss({ equity: 0, bonds: 0.5, gold: 0.5, btc: 0 }, 1000).money).toBeCloseTo(40, 6)
  })
})
