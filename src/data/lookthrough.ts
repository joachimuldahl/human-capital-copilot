/**
 * ETF look-through (BUILD_SPEC 6.3): top holdings, region and sector splits, weights in %.
 * VWCE, S&P 500 (SPY5) and Nasdaq-100 (EQQQ) use verified issuer-factsheet data (src/data/verifiedEtfs.ts):
 * one securityId per company, countries mapped to regions. The financials ETF stays illustrative (D-16), and the
 * 2× leveraged ETF uses the S&P 500 holdings it tracks but stays illustrative as a product.
 * securityId equals the product id for stocks that exist in products.ts. Splits sum to 100 (±0.1 for rounding).
 */
import type { LookThroughEntry, LookThroughMap } from '../engine'
import { VERIFIED_ETFS } from './verifiedEtfs'

const fromVerified = (id: 'vwce' | 'cspx' | 'cndx'): LookThroughEntry => {
  const lt = VERIFIED_ETFS[id].lookThrough
  if (!lt) throw new Error(`No look-through data for ${id}`)
  return { ...lt, illustrative: false }
}

const cspx = fromVerified('cspx')

export const LOOKTHROUGH: LookThroughMap = {
  vwce: fromVerified('vwce'),
  cndx: fromVerified('cndx'),
  cspx,
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
    illustrative: true,
  },
  /** Same holdings as the S&P 500 it tracks (the product itself stays illustrative). */
  lev2x: { ...cspx, illustrative: true },
}
