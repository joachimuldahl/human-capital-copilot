import { describe, expect, it } from 'vitest'
import { netWorth } from '../engine'
import { DEMO_PORTFOLIOS } from './demoPortfolios'
import { LOOKTHROUGH } from './lookthrough'
import { PERSONAS, PERSONA_IDS } from './personas'
import { PRODUCT_LIST, PRODUCTS } from './products'
import { QUICK_FIELDS } from './quickEntry'

const sum = (r: Record<string, number>) => Object.values(r).reduce((a, b) => a + b, 0)

describe('personas (6.1)', () => {
  it('has the four personas with the shared defaults', () => {
    expect(PERSONA_IDS).toEqual(['sofie', 'mads', 'lea', 'jonas'])
    for (const { id, profile } of Object.values(PERSONAS)) {
      expect(profile.retireAge, id).toBe(67)
      expect(profile.bufferMonths, id).toBe(4)
      expect(profile.knowledgeCheckPassed && profile.leverageOptIn, id).toBe(true)
    }
    expect(PERSONAS.lea.profile.experience).toBe('experienced')
  })
})

describe('demo portfolios (6.4)', () => {
  it.each(PERSONA_IDS)('%s: total equals F exactly', (id) => {
    expect(netWorth(DEMO_PORTFOLIOS[id].holdings)).toBe(PERSONAS[id].profile.investableAssets)
  })
  it('every holding references a known product and one of its accounts', () => {
    for (const d of Object.values(DEMO_PORTFOLIOS)) {
      const accountIds = d.accounts.map((a) => a.id)
      for (const h of d.holdings) {
        expect(PRODUCTS[h.productId], h.productId).toBeDefined()
        expect(accountIds).toContain(h.accountId)
      }
      expect(new Set(d.holdings.map((h) => h.id)).size).toBe(d.holdings.length)
    }
  })
})

describe('products (6.2)', () => {
  it('14 products, unique ids; five verified from factsheets, the rest illustrative with TER pending', () => {
    expect(PRODUCT_LIST).toHaveLength(14)
    expect(Object.keys(PRODUCTS)).toHaveLength(14)
    const verified = PRODUCT_LIST.filter((p) => !p.illustrative)
    expect(verified.map((p) => p.id).sort()).toEqual(['aggbond', 'cndx', 'cspx', 'sgln', 'vwce'])
    for (const p of verified) {
      expect(p.isin, p.id).toMatch(/^[A-Z]{2}[A-Z0-9]{10}$/)
      expect(p.source?.url, p.id).toMatch(/^https:\/\//)
      expect(p.source?.asOf, p.id).toMatch(/^2026-10-3[01]$/)
    }
    expect(PRODUCT_LIST.filter((p) => p.illustrative).every((p) => p.ter === null && !p.isin && !p.source)).toBe(true)
  })
  it('verified products show the factsheet tickers and TERs', () => {
    expect(['vwce', 'cspx', 'cndx', 'aggbond', 'sgln'].map((id) => [PRODUCTS[id].ticker, PRODUCTS[id].ter])).toEqual([
      ['VWCE', 0.0014],
      ['SPY5', 0.0003],
      ['EQQQ', 0.003],
      ['AGGH', 0.001],
      ['PHAU', 0.0039],
    ])
  })
  it('single stocks have region and sector; only lev2x is 2×', () => {
    for (const p of PRODUCT_LIST.filter((x) => x.sleeve === 'single_stock')) {
      expect(p.region, p.id).toBeTruthy()
      expect(p.sector, p.id).toBeTruthy()
    }
    expect(PRODUCT_LIST.filter((p) => p.leverageFactor === 2).map((p) => p.id)).toEqual(['lev2x'])
  })
  it('every equity ETF has look-through data', () => {
    const etfs = PRODUCT_LIST.filter((p) => p.assetClass === 'equity' && p.sleeve !== 'single_stock')
    for (const p of etfs) expect(LOOKTHROUGH[p.id], p.id).toBeDefined()
  })
  it('quick entry maps to existing products', () => {
    expect(QUICK_FIELDS).toHaveLength(7)
    for (const f of QUICK_FIELDS) expect(PRODUCTS[f.productId], f.key).toBeDefined()
  })
})

describe('look-through (6.3)', () => {
  // Factsheets print 1–2 decimals, so verified splits sum to 100 within 0.1 (EQQQ sectors: 99.9).
  it.each(Object.keys(LOOKTHROUGH))('%s: region and sector splits sum to 100 (±0.1)', (id) => {
    expect(Math.abs(sum(LOOKTHROUGH[id].regions) - 100)).toBeLessThanOrEqual(0.1 + 1e-9)
    expect(Math.abs(sum(LOOKTHROUGH[id].sectors) - 100)).toBeLessThanOrEqual(0.1 + 1e-9)
  })
  it('VWCE: the 11.3% of countries the factsheet does not list is "Other countries", with a footnote', () => {
    expect(LOOKTHROUGH.vwce.regions['Other countries']).toBe(11.3)
    expect(LOOKTHROUGH.vwce.regionNote).toContain('only its top 10 countries')
  })
  it('one security id per company (Alphabet class A + C merged)', () => {
    for (const e of Object.values(LOOKTHROUGH)) {
      const ids = e.topHoldings.map((h) => h.securityId)
      expect(new Set(ids).size).toBe(ids.length)
    }
    expect(LOOKTHROUGH.cspx.topHoldings.find((h) => h.securityId === 'googl')!.weight).toBeCloseTo(2.51 + 2.02, 10)
  })
  it('verified look-through is not illustrative; the financials ETF and lev2x are', () => {
    expect([LOOKTHROUGH.vwce, LOOKTHROUGH.cspx, LOOKTHROUGH.cndx].every((e) => !e.illustrative)).toBe(true)
    expect(LOOKTHROUGH.finetf.illustrative && LOOKTHROUGH.lev2x.illustrative).toBe(true)
  })
  it('top holdings that are also products use the product id and name', () => {
    for (const e of Object.values(LOOKTHROUGH)) {
      for (const h of e.topHoldings) {
        const prod = PRODUCTS[h.securityId]
        if (prod) expect(h.name).toBe(prod.name)
      }
    }
  })
  it('lev2x has the same holdings as cspx', () => {
    expect({ ...LOOKTHROUGH.lev2x, illustrative: false }).toEqual(LOOKTHROUGH.cspx)
  })
})
