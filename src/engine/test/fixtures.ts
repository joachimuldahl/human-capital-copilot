/**
 * Test fixtures for the engine tests. They use the real demo data in src/data (BUILD_SPEC section 6),
 * so the section 9 tests also check that data. Adds one test-only product without look-through data.
 */
import { DEMO_PORTFOLIOS } from '../../data/demoPortfolios'
import { LOOKTHROUGH as DATA_LOOKTHROUGH } from '../../data/lookthrough'
import { PERSONAS as DATA_PERSONAS, type PersonaId } from '../../data/personas'
import { PRODUCTS as DATA_PRODUCTS } from '../../data/products'
import type { Holding, LookThroughMap, ProductMap, Profile } from '../types'

export const PERSONAS = Object.fromEntries(
  Object.values(DATA_PERSONAS).map((p) => [p.id, p.profile]),
) as Record<PersonaId, Profile>

export const PRODUCTS: ProductMap = {
  ...DATA_PRODUCTS,
  mystery: { id: 'mystery', name: 'Equity fund without look-through', ticker: null, assetClass: 'equity', sleeve: 'core_equity', leverageFactor: 1, ter: null, illustrative: true },
}

export const LOOKTHROUGH: LookThroughMap = DATA_LOOKTHROUGH

export const PORTFOLIOS = Object.fromEntries(
  Object.values(DEMO_PORTFOLIOS).map((d) => [d.personaId, d.holdings]),
) as Record<PersonaId, Holding[]>

let n = 0
export const mk = (accountId: string, productId: string, valueEUR: number): Holding => ({ id: `t${++n}`, accountId, productId, valueEUR })
