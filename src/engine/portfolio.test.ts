import { describe, expect, it } from 'vitest'
import { solveAllocation } from './allocation'
import { explainConcentration } from './explain'
import { concentrationFlags, exposures, lookThrough, netWorth, overlap, riskFit, UNKNOWN } from './portfolio'
import { portfolioEEE, stressLoss } from './risk'
import { targetEEE } from './target'
import { LOOKTHROUGH, PERSONAS, PORTFOLIOS, PRODUCTS, mk } from './test/fixtures'

const near = (a: number, e: number, tol: number) => expect(Math.abs(a - e)).toBeLessThanOrEqual(tol)

// BUILD_SPEC section 9, demo portfolio table
const EXPECTED = {
  sofie: { eee: 1.0103, gap: -0.4897, status: 'Too little risk', stressPct: -0.475, stress: -4750, tStressPct: -0.75, tStress: -7500 },
  mads: { eee: 0.2, gap: -1.0, status: 'Too little risk', stressPct: -0.1, stress: -2500, tStressPct: -0.6, tStress: -15000 },
  lea: { eee: 0.8068, gap: 0.463, status: 'Too much risk', stressPct: -0.397, stress: -15880, tStressPct: -0.069, tStress: -2745 },
  jonas: { eee: 2.3859, gap: 1.7192, status: 'Too much risk', stressPct: -0.6, stress: -9000, tStressPct: -0.306, tStress: -4593 },
} as const

describe('demo portfolios (section 9)', () => {
  for (const [id, e] of Object.entries(EXPECTED)) {
    const key = id as keyof typeof PERSONAS
    it(`${id}: actual ${e.eee}×, ${e.status}, stress now and at target`, () => {
      const p = PERSONAS[key]
      const holdings = PORTFOLIOS[key]
      expect(netWorth(holdings)).toBe(p.investableAssets)
      const x = exposures(holdings, PRODUCTS)
      const actual = portfolioEEE(x)
      near(actual, e.eee, 0.001)
      const target = targetEEE(p).finalEEE
      const fit = riskFit(actual, target)
      near(fit.gap, e.gap, 0.001)
      expect(fit.status).toBe(e.status)
      const now = stressLoss(x, p.investableAssets)
      near(now.pct, e.stressPct, 0.0005)
      near(now.money, e.stress, 2)
      const a = solveAllocation(target)
      const atTarget = stressLoss(a, p.investableAssets)
      near(atTarget.pct, e.tStressPct, 0.0005)
      near(atTarget.money, e.tStress, 2)
    })
  }
})

describe('look-through (Sofie)', () => {
  const lt = lookThrough(PORTFOLIOS.sofie, PRODUCTS, LOOKTHROUGH)
  const apple = lt.securities.find((s) => s.securityId === 'aapl')!

  it('Apple = 1,000 + 4,000·4.5% + 3,000·8.5% = €1,435 = 14.4% → alert', () => {
    near(apple.valueEUR, 1435, 0.01)
    near(apple.share, 0.1435, 1e-9)
    const flags = concentrationFlags(lt.securities)
    expect(flags[0].securityId).toBe('aapl')
    expect(flags[0].level).toBe('alert')
    expect(explainConcentration(flags[0])).toBe('Apple 14.4%: direct 10.0% + VWCE 1.8% + CNDX 2.6%')
  })

  it('largest security first; equity value and net worth', () => {
    expect(lt.securities[0].securityId).toBe('aapl')
    expect(lt.equityValue).toBe(8000)
    expect(lt.netWorth).toBe(10000)
  })

  it('region and sector splits are over equity value and sum to 100%', () => {
    const sum = (xs: { share: number }[]) => xs.reduce((s, x) => s + x.share, 0)
    near(sum(lt.regions), 1, 1e-9)
    near(sum(lt.sectors), 1, 1e-9)
    // N. America = 4000·64% + 3000 + 1000 = 6560 of 8000
    near(lt.regions.find((r) => r.name === 'North America')!.valueEUR, 6560, 1e-6)
  })

  it('overlap(vwce, cndx) = 15.0%', () => {
    near(overlap(LOOKTHROUGH.vwce, LOOKTHROUGH.cndx), 0.15, 1e-9)
    expect(overlap(LOOKTHROUGH.cndx, LOOKTHROUGH.finetf)).toBe(0)
  })
})

describe('portfolio edge cases', () => {
  it('Lea gets a warning for JPMorgan (direct + ETFs)', () => {
    const flags = concentrationFlags(lookThrough(PORTFOLIOS.lea, PRODUCTS, LOOKTHROUGH).securities)
    const jpm = flags.find((f) => f.securityId === 'jpm')!
    // 8000 + 16000·9% + 8000·1.3% = 9544 → 23.9%
    near(jpm.share, 0.2386, 1e-4)
    expect(jpm.level).toBe('alert')
    expect(jpm.sources.map((s) => s.label)).toEqual(['direct', 'World financials sector ETF', 'CSPX'])
  })
  it('a 2× ETF counts double in exposures', () => {
    const x = exposures([mk('a', 'lev2x', 500), mk('a', 'cash', 500)], PRODUCTS)
    expect(x.equity).toBe(1)
    expect(x.cash).toBe(0.5)
  })
  it('equity without look-through data goes to Unknown', () => {
    const lt = lookThrough([mk('a', 'mystery', 100), mk('a', 'aapl', 100)], PRODUCTS, LOOKTHROUGH)
    expect(lt.regions.find((r) => r.name === UNKNOWN)!.share).toBe(0.5)
  })
  it('stocks without region/sector go to Unknown', () => {
    const products = { ...PRODUCTS, xyz: { ...PRODUCTS.aapl, id: 'xyz', region: undefined, sector: undefined } }
    const lt = lookThrough([mk('a', 'xyz', 100)], products, LOOKTHROUGH)
    expect(lt.sectors[0].name).toBe(UNKNOWN)
  })
  it('same ETF held twice merges its source', () => {
    const lt = lookThrough([mk('a', 'vwce', 1000), mk('b', 'vwce', 1000)], PRODUCTS, LOOKTHROUGH)
    const apple = lt.securities.find((s) => s.securityId === 'aapl')!
    expect(apple.sources).toHaveLength(1)
    near(apple.sources[0].share, 0.045, 1e-9)
  })
  it('empty portfolio', () => {
    expect(exposures([], PRODUCTS)).toEqual({ equity: 0, bonds: 0, gold: 0, btc: 0, cash: 0 })
    const lt = lookThrough([], PRODUCTS, LOOKTHROUGH)
    expect(lt.securities).toEqual([])
    expect(lt.netWorth).toBe(0)
  })
  it('zero-value holdings do not produce NaN', () => {
    const lt = lookThrough([mk('a', 'vwce', 0)], PRODUCTS, LOOKTHROUGH)
    expect(lt.securities.every((s) => s.share === 0)).toBe(true)
    expect(lt.regions.every((r) => r.share === 0)).toBe(true)
  })
  it('unknown product throws', () => {
    expect(() => exposures([mk('a', 'nope', 1)], PRODUCTS)).toThrow('Unknown product: nope')
  })
  it('riskFit boundaries', () => {
    expect(riskFit(1.15, 1.0).status).toBe('On target')
    expect(riskFit(0.85, 1.0).status).toBe('On target')
    expect(riskFit(1.2, 1.0).status).toBe('Too much risk')
  })
})
