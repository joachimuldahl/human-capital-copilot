/**
 * Example products (BUILD_SPEC 6.2).
 * Five products use verified issuer-factsheet data from Damien (src/data/verifiedEtfs.ts, matched on ISIN):
 * vwce, cspx (shown as SPY5), cndx (shown as EQQQ), aggbond (AGGH) and sgln (PHAU). Their ids stay as in the spec.
 * Everything else is illustrative (D-16): tickers marked null are still to be verified, ter null = "TER: see factsheet".
 */
import type { Product, ProductMap } from '../engine'
import { VERIFIED_ETFS } from './verifiedEtfs'
import type { VerifiedProductId } from './verifiedTypes'

const p = (x: Omit<Product, 'leverageFactor' | 'ter' | 'illustrative'> & Partial<Pick<Product, 'leverageFactor'>>): Product => ({
  leverageFactor: 1,
  ter: null,
  illustrative: true,
  ...x,
})

/** A product filled from verified factsheet data: name, ticker, ISIN, TER and source come from the factsheet. */
const verified = (id: VerifiedProductId, x: Pick<Product, 'assetClass' | 'sleeve'>): Product => {
  const v = VERIFIED_ETFS[id]
  return { id, name: v.name, ticker: v.ticker, isin: v.isin, ter: v.ter, leverageFactor: 1, source: { issuer: v.issuer, url: v.sourceUrl, asOf: v.asOf }, illustrative: false, ...x }
}

export const PRODUCT_LIST: Product[] = [
  verified('vwce', { assetClass: 'equity', sleeve: 'core_equity' }),
  verified('cspx', { assetClass: 'equity', sleeve: 'core_equity' }),
  verified('cndx', { assetClass: 'equity', sleeve: 'core_equity' }),
  p({ id: 'finetf', name: 'World financials sector ETF', ticker: null, assetClass: 'equity', sleeve: 'core_equity' }),
  verified('aggbond', { assetClass: 'bonds', sleeve: 'bonds' }),
  p({ id: 'govshort', name: 'Short-term euro government bond ETF', ticker: null, assetClass: 'bonds', sleeve: 'bonds' }),
  verified('sgln', { assetClass: 'gold', sleeve: 'gold' }),
  p({ id: 'btcetp', name: 'Physical Bitcoin ETP', ticker: null, assetClass: 'btc', sleeve: 'crypto' }),
  p({ id: 'lev2x', name: '2× daily leveraged S&P 500 ETF', ticker: null, assetClass: 'equity', sleeve: 'leveraged', leverageFactor: 2 }),
  p({ id: 'aapl', name: 'Apple', ticker: 'AAPL', assetClass: 'equity', sleeve: 'single_stock', region: 'North America', sector: 'Technology' }),
  p({ id: 'msft', name: 'Microsoft', ticker: 'MSFT', assetClass: 'equity', sleeve: 'single_stock', region: 'North America', sector: 'Technology' }),
  p({ id: 'nvda', name: 'NVIDIA', ticker: 'NVDA', assetClass: 'equity', sleeve: 'single_stock', region: 'North America', sector: 'Technology' }),
  p({ id: 'jpm', name: 'JPMorgan Chase', ticker: 'JPM', assetClass: 'equity', sleeve: 'single_stock', region: 'North America', sector: 'Financials' }),
  p({ id: 'cash', name: 'Cash account', ticker: null, assetClass: 'cash', sleeve: 'cash' }),
]

export const PRODUCTS: ProductMap = Object.fromEntries(PRODUCT_LIST.map((x) => [x.id, x]))

/** Products shown with the "Illustrative data" badge: illustrative products, except cash (no data to verify). */
export function isIllustrative(productId: string): boolean {
  const p = PRODUCTS[productId]
  return p !== undefined && p.illustrative && p.assetClass !== 'cash'
}

/** Verified products, for the Method page source list. */
export const VERIFIED_PRODUCTS: Product[] = PRODUCT_LIST.filter((p) => !p.illustrative)

/** Factsheet date for display: "2026-10-31" → "31 Oct 2026". */
export function formatSourceDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
}
