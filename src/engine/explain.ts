/**
 * Plain-English explanation templates filled with engine numbers (BUILD_SPEC 5.5, decision D-14: no AI).
 * Also the display formatters (section 7: 1.50×, €10,000, 14.4%), so wording and numbers stay consistent.
 */
import { minBufferMonths, policyCap, expensiveDebtRate, floor } from './assumptions'
import { solveAllocation } from './allocation'
import type { ConcentrationFlag, Profile, TargetResult } from './types'

/** Round half away from zero to `decimals`, tolerant of binary floating-point error (0.1435 → 14.4%). */
export function roundHalfAway(x: number, decimals: number): number {
  const f = Math.pow(10, decimals)
  const r = Math.round(Math.abs(x) * f * (1 + 1e-12)) / f
  return x < 0 && r !== 0 ? -r : r
}

/** Ratio with 2 decimals and "×": 1.5 → "1.50×". */
export function formatRatio(x: number): string {
  return `${roundHalfAway(x, 2).toFixed(2)}×`
}

/** EUR without decimals: 10000 → "€10,000", -4750 → "−€4,750". */
export function formatEUR(x: number): string {
  const r = roundHalfAway(x, 0)
  const s = `€${Math.abs(r).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  return r < 0 ? `−${s}` : s
}

/** Fraction as percentage with 1 decimal: 0.1435 → "14.4%", -0.475 → "−47.5%". */
export function formatPct(x: number): string {
  const r = roundHalfAway(x * 100, 1)
  const s = `${Math.abs(r).toFixed(1)}%`
  return r < 0 ? `−${s}` : s
}

export type IncomeType = 'bond-like' | 'mixed' | 'stock-like'

/** βH ≤ 0.15 bond-like · ≤ 0.40 mixed · > 0.40 stock-like. */
export function incomeType(betaH: number): IncomeType {
  return betaH <= 0.15 ? 'bond-like' : betaH <= 0.4 ? 'mixed' : 'stock-like'
}

/** "stock-like, βH 0.61" */
export function betaLabel(betaH: number): string {
  return `${incomeType(betaH)}, βH ${roundHalfAway(betaH, 2).toFixed(2)}`
}

/** Why the final Risk Capacity is what it is (the binding constraint). */
export function explainBinding(t: TargetResult, p: Profile): string {
  switch (t.binding) {
    case 'policy_cap':
      return `Limited by our ${policyCap}× safety cap. Your future savings would justify more, but we never go above ${policyCap}×.`
    case 'G4_loss':
      return `Limited by the most you said you could lose in a bad year (${formatEUR(p.maxLossMoney)}).`
    case 'G1_buffer':
      return `Capped at 1.0× until you have a ${minBufferMonths}-month emergency buffer.`
    case 'G2_debt':
      return `Capped at 1.0× while you have debt above ${roundHalfAway(expensiveDebtRate * 100, 1)}% interest. Paying it off first is a guaranteed return.`
    case 'G3_leverage':
      return 'Capped at 1.0× because borrowing to invest needs the knowledge check, opt-in, 15+ years to retirement and at least €5,000.'
    case 'floor':
      return `Kept at our minimum of ${formatRatio(floor)}, so your savings still grow with the market.`
    case 'model':
      return incomeType(t.betaH) === 'stock-like'
        ? `Your income already behaves like stocks (${betaLabel(t.betaH)}), so your portfolio should carry less market risk.`
        : `This is what your risk attitude and future savings add up to (income ${betaLabel(t.betaH)}). No cap was needed.`
  }
}

/** "95.6% of your lifetime investable wealth is still in your future salary (future savings worth €219,484)." */
export function explainHumanCapital(t: TargetResult): string {
  return `${formatPct(t.hcRatio)} of your lifetime investable wealth is still in your future salary (future savings worth ${formatEUR(t.pvfs)}).`
}

/** Short line for the income-type driver card. */
export function explainIncomeType(betaH: number): string {
  const type = incomeType(betaH)
  const why =
    type === 'bond-like'
      ? 'Your income is steady, like a bond, so it balances stock-market risk.'
      : type === 'mixed'
        ? 'Your income moves somewhat with the economy.'
        : 'Your income tends to fall when markets fall, like a stock.'
  return `Your income is ${type} (βH ${roundHalfAway(betaH, 2).toFixed(2)}). ${why}`
}

/** Percentage points of equity that a bitcoin satellite displaces at the same total risk. */
export function cryptoEquityCost(targetEEE: number, btc: number, gold = 0): number {
  return solveAllocation(targetEEE, { gold }).equity - solveAllocation(targetEEE, { gold, btc }).equity
}

/** "10.0% in Bitcoin uses 19.0 percentage points of your stock budget" */
export function explainCrypto(targetEEE: number, btc: number, gold = 0): string {
  const pp = roundHalfAway(cryptoEquityCost(targetEEE, btc, gold) * 100, 1).toFixed(1)
  return `${formatPct(btc)} in Bitcoin uses ${pp} percentage points of your stock budget`
}

/** "Apple 14.4%: direct 10.0% + VWCE 1.8% + CNDX 2.6%" */
export function explainConcentration(f: ConcentrationFlag): string {
  return `${f.name} ${formatPct(f.share)}: ${f.sources.map((s) => `${s.label} ${formatPct(s.share)}`).join(' + ')}`
}
