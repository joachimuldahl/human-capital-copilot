/** Shape of the verified ETF data generated from Damien's factsheet extracts (src/data/verifiedEtfs.ts). */
import type { LookThroughEntry } from '../engine'

/** Our products that use verified data (matched on ISIN in scripts/import-etf-data.mjs). */
export type VerifiedProductId = 'vwce' | 'cspx' | 'cndx' | 'aggbond' | 'sgln'

export interface VerifiedEtf {
  isin: string
  name: string
  ticker: string
  issuer: string
  /** Fraction, e.g. 0.0014 = 0.14%; null if the factsheet prints none. */
  ter: number | null
  /** Factsheet date (ISO). */
  asOf: string
  sourceUrl: string
  /** Factsheet file in Damien's package (kept locally, not published). */
  sourceFile: string
  /** Equity ETFs only. */
  lookThrough?: Omit<LookThroughEntry, 'illustrative'>
}
