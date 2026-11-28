#!/usr/bin/env node
/**
 * Generates src/data/verifiedEtfs.ts from Damien's factsheet extracts (team/damien/Headroom_package/2_Demo_data).
 * Only the five products we share with his data are imported, matched on ISIN (decision 26 Nov 2026).
 * Run: npm run data:etf   (re-run whenever the CSVs change; the output is committed)
 *
 * Normalisation, all explicit so it can be audited:
 * - Security names → one id per company (e.g. "APPLE INC", "Apple Inc." → aapl). Alphabet class A and C are merged.
 *   An unknown name stops the script instead of guessing.
 * - Countries → our four regions, using MSCI market classification (e.g. Korea and Taiwan → Emerging).
 *   If a factsheet lists only part of the split (VWCE: top 10 countries), the rest goes to "Other countries".
 * - Sector labels (GICS, ICB, issuer wording) → one set of names.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'team/damien/Headroom_package/2_Demo_data')
const OUT = join(ROOT, 'src/data/verifiedEtfs.ts')

/** Our product id → ISIN of the matching ETF in Damien's data. */
export const PRODUCT_ISIN = {
  vwce: 'IE00BK5BQT80', // Vanguard FTSE All-World (Acc)
  cspx: 'IE00B6YX5C33', // S&P 500 → State Street SPDR S&P 500 (Dist), SPY5
  cndx: 'IE0032077012', // Nasdaq-100 → Invesco EQQQ NASDAQ-100 (Dist), EQQQ
  aggbond: 'IE00BDBRDM35', // Global aggregate bond, EUR-hedged → iShares AGGH
  sgln: 'JE00B1VS3770', // Physical gold → WisdomTree Physical Gold, PHAU
}

/** Security name patterns → [id, display name]. Ids equal our product ids for stocks we have as products. */
const SECURITIES = [
  [/^apple\b/, 'aapl', 'Apple'],
  [/^nvidia\b/, 'nvda', 'NVIDIA'],
  [/^microsoft\b/, 'msft', 'Microsoft'],
  [/^amazon(\.com)?\b/, 'amzn', 'Amazon'],
  [/^alphabet\b/, 'googl', 'Alphabet'],
  [/^broadcom\b/, 'avgo', 'Broadcom'],
  [/^meta platforms\b/, 'meta', 'Meta Platforms'],
  [/^tesla\b/, 'tsla', 'Tesla'],
  [/^eli lilly\b/, 'lly', 'Eli Lilly'],
  [/^taiwan semiconductor\b/, 'tsm', 'TSMC'],
  [/^micron\b/, 'mu', 'Micron Technology'],
  [/^advanced micro devices\b/, 'amd', 'AMD'],
  [/^walmart\b/, 'wmt', 'Walmart'],
  [/^jpmorgan\b/, 'jpm', 'JPMorgan Chase'],
]

/** Country → region (MSCI market classification). */
const REGION = {
  'United States': 'North America',
  Canada: 'North America',
  'United Kingdom': 'Europe',
  Switzerland: 'Europe',
  France: 'Europe',
  Germany: 'Europe',
  Netherlands: 'Europe',
  Japan: 'Japan & Pacific',
  Taiwan: 'Emerging',
  China: 'Emerging',
  Korea: 'Emerging',
  Brazil: 'Emerging',
}
const OTHER_COUNTRIES = 'Other countries'

/** Sector label (lower case) → our sector name. */
const SECTOR = {
  technology: 'Technology',
  'information technology': 'Technology',
  financials: 'Financials',
  'health care': 'Health care',
  industrials: 'Industrials',
  'consumer discretionary': 'Consumer discretionary',
  'consumer staples': 'Consumer staples',
  'communication services': 'Communication',
  telecommunications: 'Communication',
  energy: 'Energy',
  materials: 'Materials',
  'basic materials': 'Materials',
  utilities: 'Utilities',
  'real estate': 'Real estate',
}

/** Minimal CSV parser (quoted fields, commas inside quotes). */
function parseCsv(text) {
  const rows = []
  let row = [], field = '', q = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++ }
      else if (c === '"') q = false
      else field += c
    } else if (c === '"') q = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field); field = ''
      if (row.some((x) => x !== '')) rows.push(row)
      row = []
    } else field += c
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row) }
  const [head, ...body] = rows
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h.replace(/^﻿/, ''), r[i] ?? ''])))
}
const read = (f) => parseCsv(readFileSync(join(SRC, f), 'utf8'))
const round = (x) => Math.round(x * 100) / 100

function security(name) {
  const n = name.toLowerCase().trim()
  const hit = SECURITIES.find(([re]) => re.test(n))
  if (!hit) throw new Error(`Unknown security name "${name}": add it to SECURITIES in scripts/import-etf-data.mjs`)
  return { securityId: hit[1], name: hit[2] }
}

const etfs = read('etfs.csv')
const tops = read('etf_top_holdings.csv')
const regions = read('etf_regions.csv')
const sectors = read('etf_sectors.csv')

const out = {}
for (const [productId, isin] of Object.entries(PRODUCT_ISIN)) {
  const e = etfs.find((x) => x.isin === isin)
  if (!e) throw new Error(`ISIN ${isin} (${productId}) not in etfs.csv`)
  const entry = {
    isin,
    name: e.name,
    ticker: e.primary_ticker,
    issuer: e.issuer,
    ter: e.ter_percent === '' ? null : Math.round(Number(e.ter_percent) * 100) / 10000, // 0.14 (%) → 0.0014
    asOf: e.factsheet_date,
    sourceUrl: e.issuer_page_url,
    sourceFile: e.source_file,
  }
  if (e.asset_class === 'Equity') {
    // Top holdings, one entry per company (weights of share classes added together).
    const th = new Map()
    for (const r of tops.filter((x) => x.isin === isin)) {
      const s = security(r.holding_name_as_printed)
      const prev = th.get(s.securityId)
      th.set(s.securityId, { ...s, weight: round((prev?.weight ?? 0) + Number(r.weight_pct)) })
    }
    // Regions from countries; any unprinted remainder → "Other countries".
    const reg = {}
    let regTotal = 0
    for (const r of regions.filter((x) => x.isin === isin)) {
      const region = REGION[r.country_or_region_as_printed]
      if (!region) throw new Error(`No region for country "${r.country_or_region_as_printed}"`)
      reg[region] = round((reg[region] ?? 0) + Number(r.weight_pct))
      regTotal += Number(r.weight_pct)
    }
    const rest = round(100 - regTotal)
    let regionNote
    if (rest > 0.05) {
      reg[OTHER_COUNTRIES] = rest
      regionNote = `${e.primary_ticker}'s factsheet lists only its top 10 countries; the remaining ${rest}% is shown as "${OTHER_COUNTRIES}".`
    }
    const sec = {}
    for (const r of sectors.filter((x) => x.isin === isin)) {
      const s = SECTOR[r.sector_as_printed.toLowerCase()]
      if (!s) throw new Error(`No sector mapping for "${r.sector_as_printed}"`)
      sec[s] = round((sec[s] ?? 0) + Number(r.weight_pct))
    }
    entry.lookThrough = { topHoldings: [...th.values()], regions: reg, sectors: sec, ...(regionNote ? { regionNote } : {}) }
  }
  out[productId] = entry
}

const ts = `/**
 * GENERATED by scripts/import-etf-data.mjs from Damien's factsheet extracts (team/damien/Headroom_package/2_Demo_data).
 * Do not edit by hand: change the script or the CSVs and run \`npm run data:etf\`.
 * Verified against the issuer factsheets (docs/audit-damien.md). Weights in %.
 */
import type { VerifiedEtf, VerifiedProductId } from './verifiedTypes'

export const VERIFIED_ETFS: Record<VerifiedProductId, VerifiedEtf> = ${JSON.stringify(out, null, 2)}
`
writeFileSync(OUT, ts)
console.log(`Wrote ${OUT}: ${Object.keys(out).join(', ')}`)
