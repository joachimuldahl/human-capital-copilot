/** The generated verified data (src/data/verifiedEtfs.ts) must match Damien's factsheet CSVs exactly. */
import { describe, expect, it } from 'vitest'
import etfsCsv from '../../team/damien/Headroom_package/2_Demo_data/etfs.csv?raw'
import topCsv from '../../team/damien/Headroom_package/2_Demo_data/etf_top_holdings.csv?raw'
import regionsCsv from '../../team/damien/Headroom_package/2_Demo_data/etf_regions.csv?raw'
import sectorsCsv from '../../team/damien/Headroom_package/2_Demo_data/etf_sectors.csv?raw'
import { VERIFIED_ETFS } from './verifiedEtfs'
import type { VerifiedProductId } from './verifiedTypes'

/** Small CSV parser (quoted fields). */
function parse(text: string): Record<string, string>[] {
  const rows: string[][] = []
  let row: string[] = []
  let f = ''
  let q = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (q) {
      if (c === '"' && text[i + 1] === '"') {
        f += '"'
        i++
      } else if (c === '"') q = false
      else f += c
    } else if (c === '"') q = true
    else if (c === ',') {
      row.push(f)
      f = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(f)
      f = ''
      if (row.some((x) => x !== '')) rows.push(row)
      row = []
    } else f += c
  }
  if (f !== '' || row.length) rows.push([...row, f])
  const [head, ...body] = rows
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h.replace(/^﻿/, ''), r[i] ?? ''])))
}

const etfs = parse(etfsCsv)
const tops = parse(topCsv)
const regions = parse(regionsCsv)
const sectors = parse(sectorsCsv)
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
const ids = Object.keys(VERIFIED_ETFS) as VerifiedProductId[]

describe('verified ETF data = Damien\'s factsheet CSVs', () => {
  it.each(ids)('%s: ISIN, ticker, TER, date and source URL', (id) => {
    const v = VERIFIED_ETFS[id]
    const row = etfs.find((e) => e.isin === v.isin)!
    expect(row, v.isin).toBeDefined()
    expect(v.ticker).toBe(row.primary_ticker)
    expect(v.name).toBe(row.name)
    expect(v.ter).toBeCloseTo(Number(row.ter_percent) / 100, 12)
    expect(v.asOf).toBe(row.factsheet_date)
    expect(v.sourceUrl).toBe(row.issuer_page_url)
  })

  it.each(ids.filter((id) => VERIFIED_ETFS[id].lookThrough))('%s: top holdings, regions and sectors carry every weight', (id) => {
    const v = VERIFIED_ETFS[id]
    const lt = v.lookThrough!
    const csvTop = tops.filter((r) => r.isin === v.isin).map((r) => Number(r.weight_pct))
    expect(sum(lt.topHoldings.map((h) => h.weight))).toBeCloseTo(sum(csvTop), 9)
    const csvReg = sum(regions.filter((r) => r.isin === v.isin).map((r) => Number(r.weight_pct)))
    const other = lt.regions['Other countries'] ?? 0
    expect(sum(Object.values(lt.regions)) - other).toBeCloseTo(csvReg, 9)
    if (other) expect(other).toBeCloseTo(100 - csvReg, 9)
    expect(sum(Object.values(lt.sectors))).toBeCloseTo(sum(sectors.filter((r) => r.isin === v.isin).map((r) => Number(r.weight_pct))), 9)
  })

  it('Apple weights as printed: VWCE 4.80%, EQQQ 8.17%, SPY5 7.70%', () => {
    const apple = (id: VerifiedProductId) => VERIFIED_ETFS[id].lookThrough!.topHoldings.find((h) => h.securityId === 'aapl')!.weight
    expect([apple('vwce'), apple('cndx'), apple('cspx')]).toEqual([4.8, 8.17, 7.7])
  })
})
