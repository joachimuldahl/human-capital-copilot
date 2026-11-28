/**
 * Plan page texts and small view helpers (BUILD_SPEC section 19, v1.7).
 * Template strings filled with engine numbers; no AI, no buy/sell instructions.
 */
import { riskFitTolerance } from './assumptions'
import { formatMoney, formatPct, SLEEVE_IN_SENTENCE } from './explain'
import { monthlySavings, type SleeveRow } from './plan'
import type { Projection } from './projection'
import type { Allocation, Currency, Profile } from './types'

/** Horizon choice on the Plan page: a number of years, or until retirement. */
export type HorizonChoice = number | 'retire'

/** Years for a horizon choice: "Until retirement" = retireAge − age (at least 1). */
export function horizonYears(choice: HorizonChoice, p: Profile): number {
  return choice === 'retire' ? Math.max(1, p.retireAge - p.age) : choice
}

/** One plain sentence describing the target allocation. */
export function planSummarySentence(a: Allocation): string {
  const sats: string[] = []
  if (a.gold > 0.0005) sats.push(`${formatPct(a.gold)} in gold`)
  if (a.btc > 0.0005) sats.push(`${formatPct(a.btc)} in Bitcoin`)
  const satText = sats.length ? `, plus ${sats.join(' and ')}` : ''
  if (a.loan < -0.0005) return `A global stock fund plus a small loan from your broker${satText}.`
  if (a.bonds > a.equity) return `Mostly bonds for stability, with ${formatPct(a.equity)} in a global stock fund${satText}.`
  if (a.bonds > 0.0005) return `A global stock fund with ${formatPct(a.bonds)} in bonds for stability${satText}.`
  return `A global stock fund${satText}.`
}

export type CompareWith = 'current' | 'cash'

export interface CalloutInput {
  targetEEE: number
  /** Risk of the comparison mix (portfolioEEE of the current holdings, 0 for cash). */
  compareEEE: number
  plan: Projection
  compare: Projection
  years: number
  compareWith: CompareWith
  currency?: Currency
}

/** Which callout applies: the comparison is more cautious, riskier, or close to the plan (±riskFitTolerance). */
export function calloutKind(targetEEE: number, compareEEE: number): 'cautious' | 'riskier' | 'close' {
  const gap = compareEEE - targetEEE
  if (gap < -riskFitTolerance) return 'cautious'
  if (gap > riskFitTolerance) return 'riskier'
  return 'close'
}

const money = (x: number, c: Currency) => formatMoney(x, c)
const yearsText = (n: number) => `${n} ${n === 1 ? 'year' : 'years'}`

/** The adaptive callout under the growth chart. */
export function projectionCallout(i: CalloutInput): { kind: 'cautious' | 'riskier' | 'close'; text: string } {
  const cur = i.currency ?? 'EUR'
  const fm = (x: number) => formatMoney(x, cur)
  const P = i.plan.points[i.plan.points.length - 1]
  const C = i.compare.points[i.compare.points.length - 1]
  const kind = i.compareWith === 'cash' ? 'cautious' : calloutKind(i.targetEEE, i.compareEEE)
  const who = i.compareWith === 'cash' ? 'Keeping it all in cash' : 'Staying as you are'
  if (kind === 'cautious') {
    const gap = P.p50 - C.p50
    if (gap <= 0) return { kind, text: `${who} gives about the same likely value after ${yearsText(i.years)} (${fm(C.p50)}).` }
    return { kind, text: `${who} could leave you about ${fm(gap)} less after ${yearsText(i.years)} (likely case: ${fm(C.p50)} instead of ${fm(P.p50)}).` }
  }
  if (kind === 'riskier') {
    const lead = C.p50 > P.p50 ? 'Your current mix could grow more in the likely case, but' : 'Your current mix takes more risk without a higher likely value:'
    const below = C.p10 < C.paidIn ? `, below the ${fm(C.paidIn)} you put in` : ''
    return { kind, text: `${lead} in the 1-in-10 bad case you'd end with ${fm(C.p10)}${below}. The plan's bad case is ${fm(P.p10)}.` }
  }
  return { kind, text: "You're already close to your plan. Keep saving monthly." }
}

const pct0 = (x: number) => `${Math.round(x * 100)}%`

/** "Chance of ending below what you put in: X% after N years (plan) vs Y% (current mix)." */
export function oddsSentence(plan: Projection, compare: Projection, years: number, compareWith: CompareWith): string {
  const label = compareWith === 'cash' ? 'all in cash' : 'current mix'
  return `Chance of ending below what you put in: ${pct0(plan.probBelowPaidIn)} after ${yearsText(years)} (plan) vs ${pct0(compare.probBelowPaidIn)} (${label}).`
}

/** "What this means" caption for the fan chart. */
export function projectionCaption(plan: Projection, years: number, currency: Currency = 'EUR'): string {
  const P = plan.points[plan.points.length - 1]
  return `If you follow the plan for ${yearsText(years)}, ${money(P.p50, currency)} is the likely outcome; 8 in 10 simulated paths end between ${money(P.p10, currency)} and ${money(P.p90, currency)}. You put in ${money(P.paidIn, currency)}.`
}
/** "What this means" caption for the one-year tiles. */
export const BAD_YEAR_NOTE = 'Bad years happen. What matters is that the loss stays within what you said you could handle, and that you keep investing through it.'

/** Join with commas and "and". */
function listText(items: string[]): string {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

/**
 * Numbered "How to get there" checklist.
 * 1. Monthly savings into the most underweight sleeve.
 * 2. Move what is above target (cash first) into what is below target; the part of the stock increase
 *    that a broker loan pays for is left out.
 * 3. Only when the plan uses a loan (which needs the opt-in): the optional borrowing step.
 * Changes at or below the planChangeThreshold are ignored (rows come from planChanges).
 */
export function howToSteps(changes: SleeveRow[], allRows: SleeveRow[], p: Profile, currency: Currency = 'EUR'): string[] {
  const m = (x: number) => formatMoney(x, currency)
  const steps: string[] = []
  const under = allRows.filter((r) => r.sleeve !== 'loan' && r.diffEUR > 0).sort((a, b) => b.diffEUR - a.diffEUR)
  const main = under[0]
  steps.push(main ? `Put your next monthly savings (${m(monthlySavings(p))}) into ${SLEEVE_IN_SENTENCE[main.sleeve]}.` : `Keep investing your monthly savings (${m(monthlySavings(p))}) in the plan's proportions.`)

  const loanRow = changes.find((r) => r.sleeve === 'loan' && r.diffEUR < 0)
  const borrow = loanRow ? -loanRow.diffEUR : 0
  const out = changes.filter((r) => r.sleeve !== 'loan' && r.diffEUR < 0).sort((a, b) => (a.sleeve === 'cash' ? -1 : b.sleeve === 'cash' ? 1 : a.diffEUR - b.diffEUR))
  const into = changes
    .filter((r) => r.sleeve !== 'loan' && r.diffEUR > 0)
    .map((r) => ({ sleeve: r.sleeve, amount: r.sleeve === 'equity' ? r.diffEUR - borrow : r.diffEUR }))
    .filter((r) => r.amount > 0.5)
    .sort((a, b) => b.amount - a.amount)
  const outTotal = out.reduce((s, r) => s - r.diffEUR, 0)
  const intoText = (list: typeof into) =>
    list.length === 1 ? SLEEVE_IN_SENTENCE[list[0].sleeve] : listText(list.map((r) => `${m(r.amount)} into ${SLEEVE_IN_SENTENCE[r.sleeve]}`))
  if (out.length > 0 && into.length > 0) {
    const from = listText(out.map((r) => (r.sleeve === 'cash' ? 'cash' : SLEEVE_IN_SENTENCE[r.sleeve])))
    steps.push(into.length === 1 ? `Move ${m(outTotal)} from ${from} into ${intoText(into)}.` : `Move ${m(outTotal)} from ${from}: about ${intoText(into)}.`)
  } else if (out.length > 0) {
    steps.push(`Reduce ${listText(out.map((r) => `${SLEEVE_IN_SENTENCE[r.sleeve]} by ${m(-r.diffEUR)}`))}.`)
  } else if (into.length > 0) {
    steps.push(`Put ${into.length === 1 ? `${m(into[0].amount)} into ${SLEEVE_IN_SENTENCE[into[0].sleeve]}` : intoText(into)}.`)
  }
  if (borrow > 0 && p.leverageOptIn) steps.push(`Optional: borrow ${m(borrow)} from your broker. Read “Borrowing to invest” under Advanced first.`)
  return steps
}

/** Compact money for chart axes: 150000 EUR → "€150K", 1.2e6 DKK → "kr 1.2M". */
export function formatMoneyCompact(x: number, currency: Currency = 'EUR'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, currencyDisplay: 'narrowSymbol', notation: 'compact', maximumFractionDigits: 1 }).format(x)
}

export type OwnSegmentKey = 'equity' | 'bonds' | 'gold' | 'crypto' | 'cash' | 'borrowed'
export interface OwnSegment {
  key: OwnSegmentKey
  /** Share of the invested amount (own money sums to 1; borrowed comes on top). */
  share: number
}

/**
 * Segments for the "What you'd own" bars.
 * Today: current shares per sleeve. Plan: target shares, with the loan shown as a "borrowed" segment beyond 100%
 * (own stocks = equity + loan, borrowed = −loan), so own money always sums to 100%.
 */
export function ownBarSegments(rows: SleeveRow[]): { today: OwnSegment[]; plan: OwnSegment[] } {
  const get = (s: SleeveRow['sleeve']) => rows.find((r) => r.sleeve === s)
  const keys: Exclude<OwnSegmentKey, 'borrowed'>[] = ['equity', 'bonds', 'gold', 'crypto', 'cash']
  const loan = get('loan')?.targetShare ?? 0
  const today = keys.map((key) => ({ key, share: get(key)?.currentShare ?? 0 })).filter((s) => s.share > 0.0005)
  const plan: OwnSegment[] = keys
    .map((key) => ({ key, share: (get(key)?.targetShare ?? 0) + (key === 'equity' ? Math.min(loan, 0) : 0) }))
    .filter((s) => s.share > 0.0005)
  if (loan < -0.0005) plan.push({ key: 'borrowed', share: -loan })
  return { today, plan }
}

/** Label for every projection number (section 19 honesty rule). */
export const PROJECTION_LABEL = "In today's money, before fees and taxes. Not a guarantee."
