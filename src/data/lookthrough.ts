/**
 * ETF look-through (BUILD_SPEC 6.3): top holdings, region and sector splits, weights in %.
 * Illustrative (D-16). securityId equals the product id for stocks that exist in products.ts.
 * Region and sector splits each sum to 100.
 */
import type { LookThroughEntry, LookThroughMap } from '../engine'

const cspx: LookThroughEntry = {
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
  illustrative: true,
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
    illustrative: true,
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
    illustrative: true,
  },
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
  /** Same holdings as the S&P 500 it tracks. */
  lev2x: cspx,
}
