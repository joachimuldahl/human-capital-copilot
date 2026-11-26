/**
 * Test-only fixtures copied from BUILD_SPEC section 6 (personas, products, look-through, demo portfolios).
 * Phase 2 creates the real src/data files; these keep the engine tests independent of them.
 */
import type { Holding, LookThroughMap, Product, ProductMap, Profile } from '../types'

const shared = {
  retireAge: 67,
  bufferMonths: 4,
  maxDebtRate: 0,
  experience: 'some',
  knowledgeCheckPassed: true,
  leverageOptIn: true,
} as const

export const PERSONAS: Record<'sofie' | 'mads' | 'lea' | 'jonas', Profile> = {
  sofie: { ...shared, age: 24, investableAssets: 10000, savingsRate: 0.15, incomeNow: 45000, income10y: 63476, sector: 'salaried', variablePayShare: 0, incomeSecurity: 'average', drawdownReaction: 4, incomeGamble: 4, maxLossMoney: 8000 },
  mads: { ...shared, age: 27, investableAssets: 25000, savingsRate: 0.15, incomeNow: 55000, income10y: 73915, sector: 'public', variablePayShare: 0, incomeSecurity: 'very_stable', drawdownReaction: 3, incomeGamble: 3, maxLossMoney: 15000 },
  lea: { ...shared, age: 26, investableAssets: 40000, savingsRate: 0.2, incomeNow: 70000, income10y: 114023, sector: 'finance', variablePayShare: 0.2, incomeSecurity: 'volatile', drawdownReaction: 3, incomeGamble: 3, maxLossMoney: 20000, experience: 'experienced' },
  jonas: { ...shared, age: 29, investableAssets: 15000, savingsRate: 0.1, incomeNow: 40000, income10y: 71634, sector: 'founder', variablePayShare: 0.2, incomeSecurity: 'volatile', drawdownReaction: 4, incomeGamble: 4, maxLossMoney: 5000 },
}

const prod = (p: Omit<Product, 'illustrative' | 'leverageFactor' | 'ter'> & Partial<Pick<Product, 'leverageFactor'>>): Product => ({
  leverageFactor: 1,
  ter: null,
  illustrative: true,
  ...p,
})

const list: Product[] = [
  prod({ id: 'vwce', name: 'Vanguard FTSE All-World UCITS ETF (Acc)', ticker: 'VWCE', assetClass: 'equity', sleeve: 'core_equity' }),
  prod({ id: 'cspx', name: 'iShares Core S&P 500 UCITS ETF (Acc)', ticker: 'CSPX', assetClass: 'equity', sleeve: 'core_equity' }),
  prod({ id: 'cndx', name: 'iShares Nasdaq 100 UCITS ETF (Acc)', ticker: 'CNDX', assetClass: 'equity', sleeve: 'core_equity' }),
  prod({ id: 'finetf', name: 'World financials sector ETF', ticker: null, assetClass: 'equity', sleeve: 'core_equity' }),
  prod({ id: 'aggbond', name: 'Global aggregate bond ETF, EUR-hedged', ticker: null, assetClass: 'bonds', sleeve: 'bonds' }),
  prod({ id: 'sgln', name: 'iShares Physical Gold ETC', ticker: 'SGLN', assetClass: 'gold', sleeve: 'gold' }),
  prod({ id: 'btcetp', name: 'Physical Bitcoin ETP', ticker: null, assetClass: 'btc', sleeve: 'crypto' }),
  prod({ id: 'lev2x', name: '2× daily leveraged S&P 500 ETF', ticker: null, assetClass: 'equity', sleeve: 'leveraged', leverageFactor: 2 }),
  prod({ id: 'aapl', name: 'Apple', ticker: 'AAPL', assetClass: 'equity', sleeve: 'single_stock', region: 'North America', sector: 'Technology' }),
  prod({ id: 'nvda', name: 'NVIDIA', ticker: 'NVDA', assetClass: 'equity', sleeve: 'single_stock', region: 'North America', sector: 'Technology' }),
  prod({ id: 'jpm', name: 'JPMorgan Chase', ticker: 'JPM', assetClass: 'equity', sleeve: 'single_stock', region: 'North America', sector: 'Financials' }),
  prod({ id: 'mystery', name: 'Equity fund without look-through', ticker: null, assetClass: 'equity', sleeve: 'core_equity' }),
  prod({ id: 'cash', name: 'Cash account', ticker: null, assetClass: 'cash', sleeve: 'cash' }),
]
export const PRODUCTS: ProductMap = Object.fromEntries(list.map((p) => [p.id, p]))

const cspx = {
  topHoldings: [
    { securityId: 'nvda', name: 'NVIDIA', weight: 6.5 },
    { securityId: 'aapl', name: 'Apple', weight: 6.5 },
    { securityId: 'msft', name: 'Microsoft', weight: 6.2 },
    { securityId: 'amzn', name: 'Amazon', weight: 3.7 },
    { securityId: 'meta', name: 'Meta', weight: 2.5 },
    { securityId: 'jpm', name: 'JPMorgan Chase', weight: 1.3 },
  ],
  regions: { 'North America': 100 },
  sectors: { Technology: 33, Financials: 13, 'Health care': 10, Consumer: 10, Communication: 9, Other: 25 },
}

export const LOOKTHROUGH: LookThroughMap = {
  vwce: {
    topHoldings: [
      { securityId: 'aapl', name: 'Apple', weight: 4.5 },
      { securityId: 'msft', name: 'Microsoft', weight: 4.2 },
      { securityId: 'nvda', name: 'NVIDIA', weight: 4.0 },
      { securityId: 'amzn', name: 'Amazon', weight: 2.3 },
      { securityId: 'meta', name: 'Meta', weight: 1.5 },
    ],
    regions: { 'North America': 64, Europe: 15, 'Japan & Pacific': 11, Emerging: 10 },
    sectors: { Technology: 26, Financials: 16, Industrials: 11, Consumer: 11, 'Health care': 10, Other: 26 },
  },
  cndx: {
    topHoldings: [
      { securityId: 'aapl', name: 'Apple', weight: 8.5 },
      { securityId: 'msft', name: 'Microsoft', weight: 8.0 },
      { securityId: 'nvda', name: 'NVIDIA', weight: 8.0 },
      { securityId: 'amzn', name: 'Amazon', weight: 5.5 },
      { securityId: 'avgo', name: 'Broadcom', weight: 5.0 },
    ],
    regions: { 'North America': 100 },
    sectors: { Technology: 60, Consumer: 20, Communication: 15, 'Health care': 5 },
  },
  cspx,
  lev2x: cspx,
  finetf: {
    topHoldings: [
      { securityId: 'jpm', name: 'JPMorgan Chase', weight: 9.0 },
      { securityId: 'brk', name: 'Berkshire Hathaway', weight: 7.0 },
      { securityId: 'v', name: 'Visa', weight: 5.0 },
      { securityId: 'ma', name: 'Mastercard', weight: 4.0 },
      { securityId: 'bac', name: 'Bank of America', weight: 3.0 },
    ],
    regions: { 'North America': 70, Europe: 20, 'Japan & Pacific': 10 },
    sectors: { Financials: 100 },
  },
}

let n = 0
const h = (accountId: string, productId: string, valueEUR: number): Holding => ({ id: `h${++n}`, accountId, productId, valueEUR })

export const PORTFOLIOS: Record<keyof typeof PERSONAS, Holding[]> = {
  sofie: [h('broker', 'vwce', 4000), h('broker', 'cndx', 3000), h('broker', 'aapl', 1000), h('crypto', 'btcetp', 1000), h('bank', 'cash', 1000)],
  mads: [h('bank', 'cash', 20000), h('broker', 'vwce', 5000)],
  lea: [h('broker', 'finetf', 16000), h('broker', 'jpm', 8000), h('broker', 'cspx', 8000), h('broker', 'aggbond', 4000), h('bank', 'cash', 4000)],
  jonas: [h('crypto', 'btcetp', 9000), h('broker', 'nvda', 4500), h('bank', 'cash', 1500)],
}

export const mk = h
