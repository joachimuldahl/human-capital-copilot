/**
 * One-line justification for every value in src/engine/assumptions.ts (Method page, BUILD_SPEC 17.3).
 * Values are always read from the engine, so the table can never drift from the maths.
 */
import { assumptions as A } from '../engine'

export const ASSUMPTION_NOTES: Record<string, { label: string; why: string }> = {
  rfReal: { label: 'Real risk-free rate', why: 'Long-run real yield on safe government bonds, roughly 0–2%.' },
  erp: { label: 'Equity risk premium', why: 'Extra yearly return expected from stocks over safe bonds; a middle-of-the-range long-run estimate.' },
  sigmaEq: { label: 'Stock-market volatility', why: 'Long-run yearly standard deviation of global equities, about 15–17%.' },
  borrowSpread: { label: 'Loan spread over cash', why: 'Typical margin a low-cost broker charges above money-market rates.' },
  cashNominal: { label: 'Cash rate (nominal)', why: 'Used with the spread to price a broker loan.' },
  equityNominal: { label: 'Expected stock return (nominal)', why: 'Cash rate plus the risk premium, rounded; compared with loan cost and debt rates.' },
  lateGrowth: { label: 'Income growth after peak age', why: 'Real earnings flatten in mid-career (Cocco, Gomes & Maenhout 2005).' },
  peakAge: { label: 'Age when fast income growth stops', why: 'Earnings profiles typically peak in the mid-40s.' },
  growthCap: { label: 'Highest early-career growth', why: 'Keeps optimistic salary expectations from inflating future savings.' },
  growthFloor: { label: 'Lowest early-career growth', why: 'Allows for an expected pay cut without extreme values.' },
  policyCap: { label: 'Safety cap on risk', why: 'Below the 2:1 limit Ayres & Nalebuff use, as an extra margin of safety.' },
  floor: { label: 'Minimum risk level', why: 'Keeps some market exposure so long-run savings still grow after inflation.' },
  maintMargin: { label: 'Broker maintenance margin', why: 'Common minimum equity share a broker requires on a margin loan.' },
  equityShock: { label: 'Crash size for the loss limit', why: 'Global stocks fell about 50% in 2008–09.' },
  leverageHurdle: { label: 'Required edge over loan cost', why: 'Borrow only if expected stock returns beat the loan rate by a clear margin.' },
  minAssetsForLeverage: { label: 'Minimum invested before borrowing', why: 'Below this, fees and loan minimums outweigh the benefit.' },
  minYearsForLeverage: { label: 'Minimum years to retirement for borrowing', why: 'Leverage needs time to recover from a crash.' },
  minBufferMonths: { label: 'Required emergency buffer (months)', why: 'Common planning guideline of 3–6 months of expenses.' },
  expensiveDebtRate: { label: 'Expensive-debt threshold', why: 'Close to the expected stock return: repaying such debt is a safer equal return.' },
  defaultRetireAge: { label: 'Default retirement age', why: 'Typical statutory pension age in many EU countries.' },
  variablePayBeta: { label: 'Weight of variable pay in βH', why: 'Bonuses and commission fall with markets, so they add stock-like risk.' },
  betaHMax: { label: 'Highest βH', why: 'Even very market-linked income is not a pure stock.' },
  riskFitTolerance: { label: 'Risk-fit tolerance', why: 'A gap of ±0.15× is treated as on target, to avoid false precision.' },
  concentrationWarn: { label: 'Concentration warning', why: 'A single company above 5% of your money is worth a look.' },
  concentrationAlert: { label: 'Concentration alert', why: 'Above 10% one company can move your whole portfolio.' },
  defaultIncomeGrowth: { label: 'Default income growth', why: 'Used until you answer question 6.' },
  defaultMaxLossShare: { label: 'Default loss limit (share of investments)', why: 'Used until you answer question 14.' },
  portfolioMismatchTolerance: { label: 'Portfolio vs invested amount tolerance', why: 'Differences above 5% trigger a prompt to update your invested amount.' },
  planChangeThreshold: { label: 'Smallest change listed in the plan', why: 'Changes under 2% of your money are not worth the trading costs.' },
  GAMMA: { label: 'Risk aversion (γ) by risk band', why: 'Spans the range estimated by Barsky et al. (1997) for typical investors.' },
  SPREAD: { label: 'Discount spread by income security', why: 'Riskier income is discounted more, like a riskier bond (Ibbotson et al. 2007).' },
  BETA_BASE: { label: 'βH by sector', why: 'Judgement-based and conservative; empirical correlations are usually lower.' },
  VOL: { label: 'Volatility by asset', why: 'Long-run historical ranges, rounded.' },
  CORR: { label: 'Correlations (stocks, bonds, gold, Bitcoin)', why: 'Long-run historical ranges, rounded.' },
  STRESS_SHOCK: { label: 'Crash scenario per asset', why: 'Roughly what happened in 2008–09 (Bitcoin: a typical crypto crash).' },
}

const fmt = (v: number) => String(Number(v.toFixed(4)))
const rec = (r: Record<string, number>) =>
  Object.entries(r)
    .map(([k, v]) => `${k.replace(/_/g, ' ')} ${fmt(v)}`)
    .join(' · ')

export interface AssumptionRow {
  key: string
  label: string
  value: string
  why: string
}

/** Every assumption with its current value (from the engine) and its justification. */
export function assumptionRows(): AssumptionRow[] {
  const out: AssumptionRow[] = []
  // Follow the order of ASSUMPTION_NOTES (grouped by topic), not the alphabetical order of the module namespace.
  const values = A as unknown as Record<string, unknown>
  for (const key of Object.keys(ASSUMPTION_NOTES)) {
    const v = values[key]
    let value: string | null = null
    if (typeof v === 'number') value = fmt(v)
    else if (key === 'CORR') value = (v as readonly (readonly number[])[]).map((r) => `[${r.join(', ')}]`).join(' ')
    else if (v && typeof v === 'object') value = rec(v as Record<string, number>)
    if (value === null) continue
    const note = ASSUMPTION_NOTES[key]
    out.push({ key, label: note.label, value, why: note.why })
  }
  return out
}
