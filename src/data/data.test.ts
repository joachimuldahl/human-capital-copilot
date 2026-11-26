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
  it('14 products, unique ids, all illustrative with TER pending', () => {
    expect(PRODUCT_LIST).toHaveLength(14)
    expect(Object.keys(PRODUCTS)).toHaveLength(14)
    expect(PRODUCT_LIST.every((p) => p.illustrative && p.ter === null)).toBe(true)
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
  it.each(Object.keys(LOOKTHROUGH))('%s: region and sector splits sum to 100', (id) => {
    expect(sum(LOOKTHROUGH[id].regions)).toBeCloseTo(100, 10)
    expect(sum(LOOKTHROUGH[id].sectors)).toBeCloseTo(100, 10)
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
    expect(LOOKTHROUGH.lev2x).toEqual(LOOKTHROUGH.cspx)
  })
})
