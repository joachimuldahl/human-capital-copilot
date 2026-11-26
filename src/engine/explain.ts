/**
 * Plain-English explanation templates filled with engine numbers (BUILD_SPEC 5.5, decision D-14: no AI).
 * Also the display formatters (section 7: 1.50×, €10,000, 14.4%), so wording and numbers stay consistent.
 */
import { minBufferMonths, policyCap, expensiveDebtRate, floor, defaultMaxLossShare } from './assumptions'
import { solveAllocation } from './allocation'
import type { PlanSleeve, SleeveRow } from './plan'
import { growthRate } from './humanCapital'
import type {
  AssetClass,
  Band,
  Binding,
  CapId,
  ClassValue,
  ConcentrationFlag,
  OverlapPair,
  Profile,
  RiskFit,
  Sector,
  Split,
  StressResult,
  TargetResult,
} from './types'

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

/** Title for the income-type card: "Mixed". */
export function incomeTypeTitle(betaH: number): string {
  const t = incomeType(betaH)
  return t.charAt(0).toUpperCase() + t.slice(1)
}

/** βH ≤ 0.15 bond-like · ≤ 0.40 mixed · > 0.40 stock-like. */
export function incomeType(betaH: number): IncomeType {
  return betaH <= 0.15 ? 'bond-like' : betaH <= 0.4 ? 'mixed' : 'stock-like'
}

/** "stock-like, βH 0.61" */
export function betaLabel(betaH: number): string {
  return `${incomeType(betaH)}, βH ${roundHalfAway(betaH, 2).toFixed(2)}`
}

/** Why the final Risk Capacity is what it is (the binding constraint). */
export function explainBinding(t: TargetResult, p: Profile, opts: { lossIsDefault?: boolean } = {}): string {
  switch (t.binding) {
    case 'policy_cap':
      return `Limited by our ${policyCap}× safety cap. Your future savings would justify more, but we never go above ${policyCap}×.`
    case 'G4_loss':
      // BUILD_SPEC 7.2: never quote a default as if the user had said it.
      return opts.lossIsDefault
        ? `Limited by our starting loss limit of ${formatEUR(p.maxLossMoney)} (${roundHalfAway(defaultMaxLossShare * 100, 0)}% of what you invest). Set your own in question 14.`
        : `Limited by the most you said you could lose in a bad year (${formatEUR(p.maxLossMoney)}).`
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

/** Shown on the onboarding panel while the loss limit (Q14) or the leverage check (Q16) is still unanswered. */
export const ESTIMATE_NOTE = 'Estimate from your answers so far. Your loss limit and the leverage check come in step 4 and can lower this.'

/** The three drivers in the onboarding summary panel ("What drives this"). */
export function driverLines(t: TargetResult): { label: string; value: string }[] {
  return [
    { label: 'Risk attitude', value: `${BAND_LABEL[t.band]} · ${formatPct(t.wStar)} in stocks` },
    { label: 'Future savings', value: `${formatEUR(t.pvfs)} · ${formatPct(t.hcRatio)} of wealth` },
    { label: 'Income type', value: `${incomeTypeTitle(t.betaH)} · βH ${roundHalfAway(t.betaH, 2).toFixed(2)}` },
  ]
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

/** Ratio without trailing zeros, for sentences: 1.5 → "1.5", 0.3439 → "0.34". */
export function formatTimes(x: number): string {
  return String(roundHalfAway(x, 2))
}

/** Results hero sentence. */
export function riskSentence(finalEEE: number): string {
  return `You can carry about ${formatTimes(finalEEE)} times the risk of the global stock market.`
}

export const BAND_LABEL: Record<Band, string> = {
  very_high: 'Very high',
  high: 'High',
  moderate: 'Moderate',
  low: 'Low',
  very_low: 'Very low',
}

export const CAP_LABEL: Record<CapId, string> = {
  policy_cap: `Safety cap (${policyCap}×)`,
  G1_buffer: 'Emergency buffer',
  G2_debt: 'Expensive debt',
  G3_leverage: 'Borrowing rules',
  G4_loss: 'Max loss in a bad year',
}

export const BINDING_LABEL: Record<Binding, string> = {
  ...CAP_LABEL,
  model: 'Set by your profile',
  floor: 'Minimum level',
}

/** "Risk attitude" driver line: "hold 87.9% of your total wealth in stocks". */
export function riskAttitudeLine(t: TargetResult): string {
  return `hold ${formatPct(t.wStar)} of your total wealth in stocks`
}

/** Onboarding question 12, with the user's own amount. */
export function drawdownQuestion(F: number): string {
  return `Your ${formatEUR(F)} falls to ${formatEUR(0.7 * F)} in three months. What do you do?`
}

/** Onboarding question 6 helper: "≈ 3.0% per year" (the growth the engine will use). */
export function impliedGrowthLabel(p: Profile): string {
  return `≈ ${formatPct(growthRate(p))} per year`
}

// ---- Portfolio page (7.4) ----

export const ASSET_CLASS_LABEL: Record<AssetClass, string> = {
  equity: 'Stocks',
  bonds: 'Bonds',
  gold: 'Gold',
  btc: 'Bitcoin',
  cash: 'Cash',
}

const ASSET_CLASS_IN_SENTENCE: Record<AssetClass, string> = { equity: 'stocks', bonds: 'bonds', gold: 'gold', btc: 'Bitcoin', cash: 'cash' }

/** "Your portfolio carries 1.01× against a target of 1.50×." */
export function explainRiskFit(actualEEE: number, targetEEE: number, fit: RiskFit): string {
  const base = `Your portfolio carries ${formatRatio(actualEEE)} against a target of ${formatRatio(targetEEE)}`
  if (fit.status === 'On target') return `${base}. That is on target.`
  return fit.status === 'Too much risk'
    ? `${base}. It takes more risk than your whole-life situation supports.`
    : `${base}. Your future salary could support more market risk.`
}

/** Crash-test sentence: "In a crash like 2008 your portfolio could lose €4,750 (47.5%)." */
export function explainStress(s: StressResult): string {
  const loss = Math.max(-s.money, 0)
  return `In a crash like 2008 your portfolio could lose ${formatEUR(loss)} (${formatPct(Math.max(-s.pct, 0))}).`
}

/** Whether the crash loss stays within the user's own limit. */
export function stressWithinLimit(s: StressResult, maxLossMoney: number): boolean {
  return Math.max(-s.money, 0) <= maxLossMoney
}

export function explainStressLimit(s: StressResult, maxLossMoney: number): string {
  return stressWithinLimit(s, maxLossMoney)
    ? `That is within the ${formatEUR(maxLossMoney)} you said you could lose in a bad year.`
    : `That is more than the ${formatEUR(maxLossMoney)} you said you could lose in a bad year.`
}

/** "What this means" for the asset-class donut. */
export function explainAssetClasses(values: ClassValue[]): string {
  if (values.length === 0) return 'Add holdings to see how your money is split.'
  const top = [...values].sort((a, b) => b.share - a.share)[0]
  const parts = [`The largest part of your portfolio is ${ASSET_CLASS_IN_SENTENCE[top.assetClass]}: ${formatPct(top.share)}.`]
  const cash = values.find((v) => v.assetClass === 'cash')
  if (cash && cash.share >= 0.3) parts.push(`Cash (${formatPct(cash.share)}) is safe but barely grows after inflation.`)
  const btc = values.find((v) => v.assetClass === 'btc')
  if (btc && btc.share >= 0.2) parts.push(`Bitcoin (${formatPct(btc.share)}) is very volatile: it can fall 75% in a crash.`)
  return parts.join(' ')
}

/** "What this means" for the region bars. */
export function explainRegions(regions: Split[]): string {
  if (regions.length === 0) return 'You have no stocks, so there is no region split.'
  const top = regions[0]
  const base = `${top.name} is ${formatPct(top.share)} of your stocks.`
  return top.share > 0.7 ? `${base} That is more concentrated than the global stock market.` : base
}

const SECTOR_OF_JOB: Partial<Record<Sector, string>> = { finance: 'Financials', tech: 'Technology' }

/** "What this means" for the sector bars; flags when the top sector is also the user's job sector. */
export function explainSectors(sectors: Split[], jobSector: Sector): string {
  if (sectors.length === 0) return 'You have no stocks, so there is no sector split.'
  const top = sectors[0]
  const base = `${top.name} is the largest sector: ${formatPct(top.share)} of your stocks.`
  const job = SECTOR_OF_JOB[jobSector]
  const jobSplit = job ? sectors.find((s) => s.name === job) : undefined
  if (job && jobSplit && jobSplit.share >= 0.25)
    return `${base} Your salary also depends on ${job.toLowerCase()}: ${formatPct(jobSplit.share)} of your stocks are in the same sector as your job, so a downturn could hit both at once.`
  return base
}

/** "What this means" for the concentration list. */
export function explainConcentrationSummary(flags: ConcentrationFlag[]): string {
  if (flags.length === 0) return 'No single company is more than 5% of your portfolio, counting what your ETFs hold.'
  const n = flags.length
  return `${n} ${n === 1 ? 'company is' : 'companies are'} above 5% of your portfolio once you count what your ETFs hold. Largest: ${explainConcentration(flags[0])}.`
}

/** "What this means" for the ETF overlap list. */
export function explainOverlap(pairs: OverlapPair[], label: (productId: string) => string): string {
  if (pairs.length === 0) return 'You hold fewer than two ETFs, so there is no overlap to check.'
  const top = pairs[0]
  if (top.overlap === 0) return 'Your ETFs share none of their top holdings.'
  return `${label(top.a)} and ${label(top.b)} share ${formatPct(top.overlap)} of their top holdings, so part of your money buys the same companies twice.`
}

// ---- Plan page (7.5) ----

export const SLEEVE_LABEL: Record<PlanSleeve, string> = {
  equity: 'Stocks (global equity)',
  bonds: 'Bonds',
  gold: 'Gold',
  crypto: 'Crypto (Bitcoin)',
  cash: 'Cash',
  loan: 'Broker loan',
}

/** Sleeve names inside sentences (keeps "Bitcoin" capitalised). */
const SLEEVE_IN_SENTENCE: Record<PlanSleeve, string> = {
  equity: 'stocks (global equity)',
  bonds: 'bonds',
  gold: 'gold',
  crypto: 'crypto (Bitcoin)',
  cash: 'cash',
  loan: 'the broker loan',
}

/** "Stocks could fall 56% before a margin call." */
export function explainMarginBuffer(buffer: number): string {
  return `Stocks could fall ${roundHalfAway(buffer * 100, 0)}% before a margin call.`
}

/** Leveraged-ETF warning with the yearly volatility drag. */
export function explainLetfDrag(drag: number): string {
  return `A 2× daily leveraged ETF resets its leverage every day. In normal markets that costs about ${formatPct(drag)} a year compared with twice the index (volatility decay), and much more when markets swing a lot.`
}

/** "Put your next monthly savings (€563) into Stocks (global equity)." */
export function explainNextSavings(monthly: number, sleeve: SleeveRow | null): string {
  if (!sleeve) return `Your portfolio already matches the plan. Keep investing your monthly savings (${formatEUR(monthly)}) in the same proportions.`
  return `Put your next monthly savings (${formatEUR(monthly)}) into ${SLEEVE_IN_SENTENCE[sleeve.sleeve]}.`
}

/** One "Changes to make at your own broker" line, educational wording (no buy/sell orders). */
export function describeChange(r: SleeveRow): string {
  const amount = formatEUR(Math.abs(r.diffEUR))
  if (r.sleeve === 'loan') return r.diffEUR < 0 ? `Borrow ${amount} with a broker loan (only if you are comfortable with the risks under “Borrowing to invest”).` : `Repay ${amount} of borrowing.`
  return r.diffEUR > 0 ? `Increase ${SLEEVE_IN_SENTENCE[r.sleeve]} by ${amount}.` : `Reduce ${SLEEVE_IN_SENTENCE[r.sleeve]} by ${amount}.`
}

/** Gate card text (G1, G2). */
export function gateCard(gate: 'G1_buffer' | 'G2_debt', p: Profile): { title: string; text: string } {
  return gate === 'G1_buffer'
    ? { title: 'Build a 3-month buffer first', text: `You have ${p.bufferMonths} ${p.bufferMonths === 1 ? 'month' : 'months'} of expenses saved. Until you have 3, we keep your risk at 1.0× or less so a surprise bill never forces you to sell in a crash.` }
    : { title: `Repay your ${roundHalfAway(p.maxDebtRate * 100, 1)}% debt first`, text: 'Paying off debt above 7% interest is a guaranteed return that investing is unlikely to beat. Until then we keep your risk at 1.0× or less.' }
}
