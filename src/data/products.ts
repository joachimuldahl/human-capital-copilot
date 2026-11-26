/**
 * Example products (BUILD_SPEC 6.2). Illustrative (D-16): tickers marked null are still to be verified,
 * and ter is null ("TER: see factsheet") until Damien's verified factsheet data arrives.
 */
import type { Product, ProductMap } from '../engine'

const p = (x: Omit<Product, 'leverageFactor' | 'ter' | 'illustrative'> & Partial<Pick<Product, 'leverageFactor'>>): Product => ({
  leverageFactor: 1,
  ter: null,
  illustrative: true,
  ...x,
})

export const PRODUCT_LIST: Product[] = [
  p({ id: 'vwce', name: 'Vanguard FTSE All-World UCITS ETF (Acc)', ticker: 'VWCE', assetClass: 'equity', sleeve: 'core_equity' }),
  p({ id: 'cspx', name: 'iShares Core S&P 500 UCITS ETF (Acc)', ticker: 'CSPX', assetClass: 'equity', sleeve: 'core_equity' }),
  p({ id: 'cndx', name: 'iShares Nasdaq 100 UCITS ETF (Acc)', ticker: 'CNDX', assetClass: 'equity', sleeve: 'core_equity' }),
  p({ id: 'finetf', name: 'World financials sector ETF', ticker: null, assetClass: 'equity', sleeve: 'core_equity' }),
  p({ id: 'aggbond', name: 'Global aggregate bond ETF, EUR-hedged', ticker: null, assetClass: 'bonds', sleeve: 'bonds' }),
  p({ id: 'govshort', name: 'Short-term euro government bond ETF', ticker: null, assetClass: 'bonds', sleeve: 'bonds' }),
  p({ id: 'sgln', name: 'iShares Physical Gold ETC', ticker: 'SGLN', assetClass: 'gold', sleeve: 'gold' }),
  p({ id: 'btcetp', name: 'Physical Bitcoin ETP', ticker: null, assetClass: 'btc', sleeve: 'crypto' }),
  p({ id: 'lev2x', name: '2× daily leveraged S&P 500 ETF', ticker: null, assetClass: 'equity', sleeve: 'leveraged', leverageFactor: 2 }),
  p({ id: 'aapl', name: 'Apple', ticker: 'AAPL', assetClass: 'equity', sleeve: 'single_stock', region: 'North America', sector: 'Technology' }),
  p({ id: 'msft', name: 'Microsoft', ticker: 'MSFT', assetClass: 'equity', sleeve: 'single_stock', region: 'North America', sector: 'Technology' }),
  p({ id: 'nvda', name: 'NVIDIA', ticker: 'NVDA', assetClass: 'equity', sleeve: 'single_stock', region: 'North America', sector: 'Technology' }),
  p({ id: 'jpm', name: 'JPMorgan Chase', ticker: 'JPM', assetClass: 'equity', sleeve: 'single_stock', region: 'North America', sector: 'Financials' }),
  p({ id: 'cash', name: 'Cash account', ticker: null, assetClass: 'cash', sleeve: 'cash' }),
]

export const PRODUCTS: ProductMap = Object.fromEntries(PRODUCT_LIST.map((x) => [x.id, x]))
