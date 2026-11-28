import { describe, expect, it } from 'vitest'
import { solveAllocation } from './allocation'
import { borrowSpread, cashNominal, inflation, loanRate } from './assumptions'
import { exposures, netWorth } from './portfolio'
import { CASH_WEIGHTS, logParams, oneYearRange, portfolioParams, projectWealth } from './projection'
import { stressLoss } from './risk'
import { targetEEE } from './target'
import { PERSONAS, PORTFOLIOS, PRODUCTS } from './test/fixtures'

describe('portfolioParams', () => {
  it('all equity: real 5.5% (= rfReal + erp) and 16% volatility', () => {
    const { mu, sigma } = portfolioParams({ equity: 1, bonds: 0, gold: 0, btc: 0 })
    expect(mu).toBeCloseTo(0.055, 10)
    expect(sigma).toBeCloseTo(0.16, 10)
  })
  it('cash: real 1%, no volatility', () => {
    expect(portfolioParams(CASH_WEIGHTS)).toEqual({ mu: cashNominal - inflation, sigma: 0 })
  })
  it('a loan lowers mu by loan × (loanRate − inflation)', () => {
    const base = portfolioParams({ equity: 1.5, bonds: 0, gold: 0, btc: 0 })
    const withLoan = portfolioParams({ equity: 1.5, bonds: 0, gold: 0, btc: 0, loan: -0.5 })
    expect(loanRate).toBeCloseTo(cashNominal + borrowSpread, 12)
    expect(base.mu - withLoan.mu).toBeCloseTo(0.5 * (loanRate - inflation), 12)
    expect(withLoan.sigma).toBe(base.sigma)
  })
})

describe('projectWealth', () => {
  it('sigma = 0 equals deterministic compounding exactly', () => {
    const r = projectWealth({ startValue: 10000, monthlySaving: 100, weights: CASH_WEIGHTS, years: 3 })
    let w = 10000
    for (let y = 1; y <= 3; y++) {
      w = w * 1.01 + 1200
      expect(r.points[y].p50).toBe(w)
      expect(r.points[y].p10).toBe(w)
    }
    expect(r.points[3].paidIn).toBe(13600)
  })
  it('no savings: simulated median within 2% of startValue·exp(years·m)', () => {
    const weights = { equity: 1, bonds: 0, gold: 0, btc: 0 }
    const { mu, sigma } = portfolioParams(weights)
    const { m } = logParams(mu, sigma)
    for (const years of [10, 30]) {
      const r = projectWealth({ startValue: 10000, monthlySaving: 0, weights, years })
      const analytic = 10000 * Math.exp(years * m)
      expect(Math.abs(r.points[years].p50 / analytic - 1)).toBeLessThan(0.02)
    }
  })
  it('the same seed gives identical output; another seed differs', () => {
    const args = { startValue: 25000, monthlySaving: 500, weights: { equity: 1.2, bonds: 0, gold: 0, btc: 0, loan: -0.2 }, years: 20 }
    expect(projectWealth(args)).toEqual(projectWealth(args))
    expect(projectWealth({ ...args, seed: 7 }).points[20].p50).not.toBe(projectWealth(args).points[20].p50)
  })
  it('p10 ≤ p50 ≤ p90 at every year; paid-in grows by 12 × monthly', () => {
    const r = projectWealth({ startValue: 15000, monthlySaving: 333, weights: { equity: 0.3, bonds: 0, gold: 0, btc: 0.6, cash: 0.1 }, years: 30 })
    expect(r.points).toHaveLength(31)
    r.points.forEach((pt, y) => {
      expect(pt.p10).toBeLessThanOrEqual(pt.p50)
      expect(pt.p50).toBeLessThanOrEqual(pt.p90)
      expect(pt.paidIn).toBeCloseTo(15000 + 12 * 333 * y, 6)
    })
    expect(r.probBelowPaidIn).toBeGreaterThanOrEqual(0)
    expect(r.probBelowPaidIn).toBeLessThanOrEqual(1)
  })
  it('equity beats cash in most paths over 30 years', () => {
    const r = projectWealth({ startValue: 10000, monthlySaving: 100, weights: { equity: 1, bonds: 0, gold: 0, btc: 0 }, years: 30 })
    expect(r.probBeatsCash).toBeGreaterThan(0.8)
  })
})

describe('oneYearRange', () => {
  it('bad year equals the section 9 stress test for every persona (target and current)', () => {
    const expected = {
      sofie: { now: -4750, target: -7500 },
      mads: { now: -2500, target: -15000 },
      lea: { now: -15880, target: -2745 },
      jonas: { now: -9000, target: -4593 },
    }
    for (const id of Object.keys(expected) as (keyof typeof expected)[]) {
      const p = PERSONAS[id]
      const alloc = solveAllocation(targetEEE(p).finalEEE)
      const holdings = PORTFOLIOS[id]
      const x = exposures(holdings, PRODUCTS)
      const total = netWorth(holdings)
      expect(oneYearRange(alloc, p.investableAssets).bad).toEqual(stressLoss(alloc, p.investableAssets))
      expect(oneYearRange(x, total).bad).toEqual(stressLoss(x, total))
      expect(oneYearRange(alloc, p.investableAssets).bad.money).toBeCloseTo(expected[id].target, -1)
      expect(Math.abs(oneYearRange(x, total).bad.money - expected[id].now)).toBeLessThanOrEqual(2)
    }
  })
  it('good > typical > bad for an all-equity portfolio', () => {
    const r = oneYearRange({ equity: 1, bonds: 0, gold: 0, btc: 0 }, 10000)
    expect(r.good.money).toBeGreaterThan(r.typical.money)
    expect(r.typical.money).toBeGreaterThan(r.bad.money)
    expect(r.typical.pct).toBeCloseTo(Math.exp(logParams(0.055, 0.16).m) - 1, 12)
  })
})
