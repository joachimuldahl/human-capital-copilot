import { describe, expect, it } from 'vitest'
import {
  explainAssetClasses,
  explainConcentrationSummary,
  explainOverlap,
  explainRegions,
  explainRiskFit,
  explainSectors,
  explainStress,
  explainStressLimit,
  stressWithinLimit,
} from './explain'
import { assetClassValues, holdingShares, concentrationFlags, exposures, lookThrough, overlapPairs, portfolioMismatch, riskFit } from './portfolio'
import { portfolioEEE, stressLoss } from './risk'
import { targetEEE } from './target'
import { LOOKTHROUGH, PERSONAS, PORTFOLIOS, PRODUCTS, mk } from './test/fixtures'

const ticker = (id: string) => PRODUCTS[id].ticker ?? PRODUCTS[id].name

describe('assetClassValues', () => {
  it('Sofie: stocks 80%, bitcoin 10%, cash 10% (in class order)', () => {
    const v = assetClassValues(PORTFOLIOS.sofie, PRODUCTS)
    expect(v.map((x) => [x.assetClass, x.valueEUR])).toEqual([
      ['equity', 8000],
      ['btc', 1000],
      ['cash', 1000],
    ])
    expect(v[0].share).toBeCloseTo(0.8, 10)
  })
  it('leveraged ETF counts at value (not doubled) and empty portfolio is empty', () => {
    expect(assetClassValues([mk('a', 'lev2x', 100)], PRODUCTS)[0].share).toBe(1)
    expect(assetClassValues([], PRODUCTS)).toEqual([])
  })
})

describe('overlapPairs', () => {
  it('Sofie: VWCE/CNDX 15.0%', () => {
    const pairs = overlapPairs(PORTFOLIOS.sofie, LOOKTHROUGH)
    expect(pairs).toHaveLength(1)
    expect(pairs[0]).toMatchObject({ a: 'vwce', b: 'cndx' })
    expect(pairs[0].overlap).toBeCloseTo(0.15, 10)
  })
  it('Lea: finetf/cspx share only JPMorgan (1.3%)', () => {
    const pairs = overlapPairs(PORTFOLIOS.lea, LOOKTHROUGH)
    expect(pairs).toHaveLength(1)
    expect(pairs[0].overlap).toBeCloseTo(0.013, 10)
  })
  it('sorted largest first; stocks and duplicates ignored', () => {
    const pairs = overlapPairs([mk('a', 'vwce', 1), mk('a', 'finetf', 1), mk('a', 'cndx', 1), mk('b', 'vwce', 1), mk('a', 'aapl', 1)], LOOKTHROUGH)
    expect(pairs).toHaveLength(3)
    expect(pairs[0].overlap).toBeGreaterThanOrEqual(pairs[1].overlap)
    expect(pairs[1].overlap).toBeGreaterThanOrEqual(pairs[2].overlap)
  })
})

describe('portfolioMismatch (> 5%)', () => {
  it('boundaries', () => {
    expect(portfolioMismatch(10500, 10000)).toBe(false)
    expect(portfolioMismatch(10501, 10000)).toBe(true)
    expect(portfolioMismatch(9400, 10000)).toBe(true)
    expect(portfolioMismatch(0, 0)).toBe(false)
    expect(portfolioMismatch(100, 0)).toBe(true)
  })
})

describe('portfolio captions', () => {
  it('risk fit for Sofie, Jonas and on target', () => {
    const s = targetEEE(PERSONAS.sofie).finalEEE
    const a = portfolioEEE(exposures(PORTFOLIOS.sofie, PRODUCTS))
    expect(explainRiskFit(a, s, riskFit(a, s))).toBe('Your portfolio carries 1.01× against a target of 1.50×. Your future salary could support more market risk.')
    expect(explainRiskFit(2.39, 0.67, riskFit(2.39, 0.67))).toContain('more risk than your whole-life situation supports')
    expect(explainRiskFit(1, 1, riskFit(1, 1))).toContain('on target')
  })
  it('stress test vs limit (Sofie within €8,000, Jonas above €5,000)', () => {
    const sofie = stressLoss(exposures(PORTFOLIOS.sofie, PRODUCTS), 10000)
    expect(explainStress(sofie)).toBe('In a crash like 2008 your portfolio could lose €4,750 (47.5%).')
    expect(stressWithinLimit(sofie, 8000)).toBe(true)
    expect(explainStressLimit(sofie, 8000)).toBe('That is within the €8,000 you said you could lose in a bad year.')
    const jonas = stressLoss(exposures(PORTFOLIOS.jonas, PRODUCTS), 15000)
    expect(explainStress(jonas)).toBe('In a crash like 2008 your portfolio could lose €9,000 (60.0%).')
    expect(explainStressLimit(jonas, 5000)).toBe('That is more than the €5,000 you said you could lose in a bad year.')
    expect(explainStress({ pct: 0.04, money: 40 })).toBe('In a crash like 2008 your portfolio could lose €0 (0.0%).')
  })
  it('asset classes: largest, cash and bitcoin notes', () => {
    expect(explainAssetClasses(assetClassValues(PORTFOLIOS.mads, PRODUCTS))).toBe(
      'Cash make up the largest part of your portfolio: 80.0%. Cash (80.0%) is safe but barely grows after inflation.',
    )
    expect(explainAssetClasses(assetClassValues(PORTFOLIOS.jonas, PRODUCTS))).toContain('Bitcoin (60.0%) is very volatile')
    expect(explainAssetClasses([])).toBe('Add holdings to see how your money is split.')
  })
  it('regions and sectors (Lea: finance job + finance-heavy stocks)', () => {
    const lea = lookThrough(PORTFOLIOS.lea, PRODUCTS, LOOKTHROUGH)
    expect(explainRegions(lea.regions)).toBe('North America is 85.0% of your stocks. That is more concentrated than the global stock market.')
    // Financials = 16,000 + 8,000 + 8,000·13% = 25,040 of 32,000 = 78.3%
    expect(explainSectors(lea.sectors, 'finance')).toBe(
      'Financials is the largest sector: 78.3% of your stocks. Your salary also depends on financials: 78.3% of your stocks are in the same sector as your job, so a downturn could hit both at once.',
    )
    const mads = lookThrough(PORTFOLIOS.mads, PRODUCTS, LOOKTHROUGH)
    expect(explainRegions(mads.regions)).toBe('North America is 64.0% of your stocks.')
    expect(explainSectors(mads.sectors, 'public')).toBe('Technology is the largest sector: 26.0% of your stocks.')
    expect(explainRegions([])).toContain('no stocks')
    expect(explainSectors([], 'tech')).toContain('no stocks')
  })
  it('concentration and overlap summaries', () => {
    const flags = concentrationFlags(lookThrough(PORTFOLIOS.sofie, PRODUCTS, LOOKTHROUGH).securities)
    expect(explainConcentrationSummary(flags)).toBe(
      '1 company is above 5% of your portfolio once you count what your ETFs hold. Largest: Apple 14.4%: direct 10.0% + VWCE 1.8% + CNDX 2.6%.',
    )
    expect(explainConcentrationSummary([])).toContain('No single company')
    const lea = concentrationFlags(lookThrough(PORTFOLIOS.lea, PRODUCTS, LOOKTHROUGH).securities)
    // Only JPMorgan is above 5% (Berkshire via the financials ETF is 2.8%)
    expect(explainConcentrationSummary(lea)).toBe(
      '1 company is above 5% of your portfolio once you count what your ETFs hold. Largest: JPMorgan Chase 23.9%: direct 20.0% + World financials sector ETF 3.6% + CSPX 0.3%.',
    )
    expect(explainConcentrationSummary([...flags, ...flags])).toMatch(/^2 companies are above 5%/)
    expect(explainOverlap(overlapPairs(PORTFOLIOS.sofie, LOOKTHROUGH), ticker)).toBe(
      'VWCE and CNDX share 15.0% of their top holdings, so part of your money buys the same companies twice.',
    )
    expect(explainOverlap([], ticker)).toContain('fewer than two ETFs')
    expect(explainOverlap([{ a: 'vwce', b: 'finetf', overlap: 0 }], ticker)).toBe('Your ETFs share none of their top holdings.')
  })
})

describe('holdingShares', () => {
  it('Sofie: VWCE 40%, cash 10%', () => {
    const sh = holdingShares(PORTFOLIOS.sofie)
    expect(sh['sofie-vwce']).toBeCloseTo(0.4, 10)
    expect(sh['sofie-cash']).toBeCloseTo(0.1, 10)
  })
  it('an all-zero portfolio gives 0, not NaN', () => {
    const h = mk('a', 'cash', 0)
    expect(holdingShares([h])).toEqual({ [h.id]: 0 })
  })
})
