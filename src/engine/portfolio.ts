import { concentrationAlert, concentrationWarn, riskFitTolerance } from './assumptions'
import type {
  ConcentrationFlag,
  Exposures,
  Holding,
  LookThroughMap,
  LookThroughResult,
  LookThroughEntry,
  ProductMap,
  RiskFit,
  SecurityExposure,
  Split,
} from './types'

/** Label for unknown region/sector buckets. */
export const UNKNOWN = 'Unknown'

/** Net worth = Σ valueEUR. */
export function netWorth(holdings: Holding[]): number {
  return holdings.reduce((s, h) => s + h.valueEUR, 0)
}

function productOf(products: ProductMap, id: string) {
  const p = products[id]
  if (!p) throw new Error(`Unknown product: ${id}`)
  return p
}

/**
 * Shares of total value by asset class (equity, bonds, gold, btc, cash).
 * Equity is multiplied by the product's leverageFactor (a 2× ETF counts double); divided by the total.
 */
export function exposures(holdings: Holding[], products: ProductMap): Exposures {
  const total = netWorth(holdings)
  const x = { equity: 0, bonds: 0, gold: 0, btc: 0, cash: 0 }
  if (total <= 0) return x
  for (const h of holdings) {
    const p = productOf(products, h.productId)
    const factor = p.assetClass === 'equity' ? p.leverageFactor : 1
    x[p.assetClass] += (h.valueEUR * factor) / total
  }
  return x
}

/** Direct holdings first, then ETFs in portfolio order (stable). */
function directFirst<T extends { label: string }>(sources: T[]): T[] {
  return [...sources].sort((a, b) => Number(b.label === 'direct') - Number(a.label === 'direct'))
}

function addTo(map: Map<string, number>, key: string, v: number) {
  map.set(key, (map.get(key) ?? 0) + v)
}

function toSplits(map: Map<string, number>, equityValue: number): Split[] {
  return [...map.entries()]
    .map(([name, valueEUR]) => ({ name, valueEUR, share: equityValue > 0 ? valueEUR / equityValue : 0 }))
    .sort((a, b) => b.valueEUR - a.valueEUR)
}

/**
 * Look-through of ETFs to securities, regions and sectors.
 * Security exposure from an ETF = valueEUR · weightⱼ (top holdings only); direct stocks count 100%.
 * Regions/sectors are aggregated over equity value: ETFs use their split, stocks their own region/sector.
 */
export function lookThrough(holdings: Holding[], products: ProductMap, lt: LookThroughMap): LookThroughResult {
  const total = netWorth(holdings)
  const secs = new Map<string, SecurityExposure>()
  const regions = new Map<string, number>()
  const sectors = new Map<string, number>()
  let equityValue = 0

  const addSecurity = (securityId: string, name: string, valueEUR: number, productId: string, label: string) => {
    const s = secs.get(securityId) ?? { securityId, name, valueEUR: 0, share: 0, sources: [] }
    s.valueEUR += valueEUR
    const src = s.sources.find((x) => x.productId === productId)
    const share = total > 0 ? valueEUR / total : 0
    if (src) src.share += share
    else s.sources.push({ productId, label, share })
    secs.set(securityId, s)
  }

  for (const h of holdings) {
    const p = productOf(products, h.productId)
    if (p.assetClass !== 'equity') continue
    equityValue += h.valueEUR
    const entry: LookThroughEntry | undefined = lt[p.id]
    if (p.sleeve === 'single_stock') {
      addSecurity(p.id, p.name, h.valueEUR, p.id, 'direct')
      addTo(regions, p.region ?? UNKNOWN, h.valueEUR)
      addTo(sectors, p.sector ?? UNKNOWN, h.valueEUR)
    } else if (entry) {
      const label = p.ticker ?? p.name
      for (const th of entry.topHoldings) addSecurity(th.securityId, th.name, (h.valueEUR * th.weight) / 100, p.id, label)
      for (const [r, w] of Object.entries(entry.regions)) addTo(regions, r, (h.valueEUR * w) / 100)
      for (const [s, w] of Object.entries(entry.sectors)) addTo(sectors, s, (h.valueEUR * w) / 100)
    } else {
      addTo(regions, UNKNOWN, h.valueEUR)
      addTo(sectors, UNKNOWN, h.valueEUR)
    }
  }

  const securities = [...secs.values()]
    .map((s) => ({ ...s, share: total > 0 ? s.valueEUR / total : 0, sources: directFirst(s.sources) }))
    .sort((a, b) => b.valueEUR - a.valueEUR)

  return {
    securities,
    regions: toSplits(regions, equityValue),
    sectors: toSplits(sectors, equityValue),
    equityValue,
    netWorth: total,
  }
}

/** Securities above 5% of net worth → warning, above 10% → alert. Largest first. */
export function concentrationFlags(securities: SecurityExposure[]): ConcentrationFlag[] {
  return securities
    .filter((s) => s.share > concentrationWarn)
    .map((s) => ({ ...s, level: s.share > concentrationAlert ? ('alert' as const) : ('warning' as const) }))
}

/**
 * Overlap of two ETFs, based on top holdings only:
 * Σ over shared securities of min(weightA, weightB). Returned as a fraction (15% → 0.15).
 */
export function overlap(a: LookThroughEntry, b: LookThroughEntry): number {
  let sum = 0
  for (const ha of a.topHoldings) {
    const hb = b.topHoldings.find((x) => x.securityId === ha.securityId)
    if (hb) sum += Math.min(ha.weight, hb.weight)
  }
  return sum / 100
}

/**
 * Risk fit: gap = actualEEE − targetEEE.
 * |gap| ≤ 0.15 "On target" · gap > 0.15 "Too much risk" · gap < −0.15 "Too little risk".
 */
export function riskFit(actualEEE: number, targetEEE: number): RiskFit {
  const gap = actualEEE - targetEEE
  // 1e-9 tolerance so a gap of exactly ±0.15 (e.g. 0.85 − 1.00 = −0.15000000000000002) counts as on target
  const tol = riskFitTolerance + 1e-9
  const status = gap > tol ? 'Too much risk' : gap < -tol ? 'Too little risk' : 'On target'
  return { gap, status }
}
