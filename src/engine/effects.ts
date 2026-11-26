/**
 * "Your answer's effect" lines for the onboarding "Why we ask" panels (BUILD_SPEC 15).
 * Each line re-runs targetEEE on a profile where one answer moves one step, and fills a template.
 * No new maths: only targetEEE / growthRate are used.
 */
import { expensiveDebtRate, minAssetsForLeverage, minBufferMonths, minYearsForLeverage, policyCap } from './assumptions'
import { formatMoney, formatRatio, niceAmount, roundHalfAway } from './explain'
import { growthRate } from './humanCapital'
import { targetEEE, type PendingCap } from './target'
import type { Binding, Currency, Experience, IncomeSecurity, Likert, Profile, Sector, TargetResult } from './types'

/** Question numbers that have a "Why we ask" panel (all 16). */
export type QuestionNo = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16

interface Option {
  label: string
  patch: Partial<Profile>
  current: boolean
}

const same = (a: number, b: number) => roundHalfAway(a, 2) === roundHalfAway(b, 2)

/** Currency context for the sentences: formatter and units per EUR. */
interface Ctx {
  money: (x: number) => string
  fx: number
}

/** Why the target does not move: the active limit, in a few words. */
function heldBy(b: Binding, money: (x: number) => string, fx: number): string {
  switch (b) {
    case 'policy_cap':
      return `our ${policyCap}× safety cap`
    case 'G1_buffer':
      return `the ${minBufferMonths}-month emergency-buffer rule`
    case 'G2_debt':
      return `the rule on debt above ${roundHalfAway(expensiveDebtRate * 100, 1)}% interest`
    case 'G3_leverage':
      return `the borrowing rules (knowledge check, opt-in, ${minYearsForLeverage}+ years to retirement, at least ${money(minAssetsForLeverage * fx)})`
    case 'G4_loss':
      return 'your loss limit for a bad year'
    case 'floor':
      return 'our minimum level'
    case 'model':
      return 'your profile'
  }
}

/** "{change} would {hcPart} and move your target from a to b." or "…, but your target stays at a because …". */
function move(change: string, now: TargetResult, alt: TargetResult, showH: boolean, ctx: Ctx): string {
  const dH = alt.pvfs - now.pvfs
  const hPart = showH && Math.abs(dH) >= 1 ? `${dH > 0 ? 'add' : 'take'} ${ctx.money(Math.abs(dH))} ${dH > 0 ? 'to' : 'from'} your future savings` : ''
  if (same(now.finalEEE, alt.finalEEE)) {
    const why = now.binding === 'model' ? '' : ` because it is limited by ${heldBy(now.binding, ctx.money, ctx.fx)}`
    return hPart
      ? `${change} would ${hPart}, but your target stays at ${formatRatio(now.finalEEE)}${why}.`
      : `${change} would keep your target at ${formatRatio(now.finalEEE)}${why}.`
  }
  const mv = `move your target from ${formatRatio(now.finalEEE)} to ${formatRatio(alt.finalEEE)}`
  return hPart ? `${change} would ${hPart} and ${mv}.` : `${change} would ${mv}.`
}

/** Result for every option of a choice question, with neighbouring options that give the same result merged. */
function alternatives(p: Profile, options: Option[], tgt: (x: Profile) => TargetResult, ctx: Ctx, unit = ''): string {
  const vals = options.map((o) => tgt({ ...p, ...o.patch }).finalEEE)
  const groups: { from: number; to: number }[] = []
  vals.forEach((v, i) => {
    const g = groups[groups.length - 1]
    if (g && same(vals[g.from], v)) g.to = i
    else groups.push({ from: i, to: i })
  })
  if (groups.length === 1) {
    const now = tgt(p)
    const why = now.binding === 'model' ? '' : `, because it is limited by ${heldBy(now.binding, ctx.money, ctx.fx)}`
    return `Every answer here gives ${formatRatio(vals[0])} for you right now${why}.`
  }
  return groups
    .map(({ from, to }) => {
      const first = options[from].label
      const label =
        from === to ? `${first}${unit}` : to === options.length - 1 && unit && !first.endsWith('+') ? `${first}+${unit}` : `${first}${/^\d/.test(first) ? '–' : ' to '}${options[to].label}${unit}`
      const you = options.slice(from, to + 1).some((o) => o.current) ? ' (you)' : ''
      return `${label}${you} → ${formatRatio(vals[from])}`
    })
    .join(' · ')
}

const SECTOR_SHORT: [Sector, string][] = [
  ['public', 'Public'],
  ['health_edu', 'Health & education'],
  ['salaried', 'Salaried'],
  ['tech', 'Tech'],
  ['sales', 'Sales'],
  ['finance', 'Finance'],
  ['founder', 'Founder'],
]
const SECURITY_SHORT: [IncomeSecurity, string][] = [
  ['very_stable', 'Very stable'],
  ['stable', 'Stable'],
  ['average', 'Average'],
  ['volatile', 'Volatile'],
]
const BUFFER_SHORT: [number, string][] = [
  [0, '0'],
  [1, '1'],
  [2, '2'],
  [3, '3'],
  [5, '4–6'],
  [6, '6+'],
]
/** Onboarding answer bucket for a month count (4–6 months is stored as 5). */
const bufferBucket = (b: number) => (b >= 6 ? 6 : b >= 4 ? 5 : b)
const DRAWDOWN_SHORT = ['Sell all', 'Sell some', 'Do nothing', 'Buy a little', 'Buy a lot']
const GAMBLE_SHORT = ['Never', '10%', '20%', '33%', '50%']
const EXPERIENCE_SHORT: [Experience, string][] = [
  ['none', 'None'],
  ['some', 'Some'],
  ['experienced', 'Experienced'],
]

const likert = (labels: string[], key: 'drawdownReaction' | 'incomeGamble', p: Profile): Option[] =>
  labels.map((label, i) => ({ label, patch: { [key]: (i + 1) as Likert }, current: p[key] === i + 1 }))

/**
 * Live effect line for one onboarding question: what happens to the target if this answer moves one step
 * (numeric questions) or takes each other value (choice questions).
 */
export function answerEffect(q: QuestionNo, p: Profile, opts: { pending?: readonly PendingCap[]; currency?: Currency } = {}): string {
  // A question's own limit is always shown in its own panel (Q14 → G4, Q16 → G3); other unanswered limits stay out.
  const own: PendingCap | null = q === 14 ? 'G4_loss' : q === 16 ? 'G3_leverage' : null
  const pending = (opts.pending ?? []).filter((c) => c !== own)
  const tgt = (x: Profile) => targetEEE(x, { pending })
  const now = tgt(p)
  const at = (patch: Partial<Profile>) => tgt({ ...p, ...patch })
  const ctx: Ctx = { money: (x) => formatMoney(x, opts.currency), fx: p.fx ?? 1 }
  // €5,000 steps, converted and rounded (37,000 kr in DKK).
  const step = niceAmount(5000 * ctx.fx)
  switch (q) {
    case 1:
      return p.age + 1 < p.retireAge
        ? move('Being one year older', now, at({ age: p.age + 1 }), true, ctx)
        : 'You are at or past your retirement age, so there are no future savings left to count.'
    case 2: {
      const later = p.retireAge + 2 <= 75
      const retireAge = later ? p.retireAge + 2 : p.retireAge - 2
      return move(`Retiring 2 years ${later ? 'later' : 'earlier'}`, now, at({ retireAge }), true, ctx)
    }
    case 3:
      return move(`Having ${ctx.money(step)} more invested today`, now, at({ investableAssets: p.investableAssets + step }), false, ctx)
    case 4: {
      const up = p.savingsRate + 0.05 <= 0.4 + 1e-9
      const savingsRate = up ? p.savingsRate + 0.05 : p.savingsRate - 0.05
      return move(`Investing 5 percentage points ${up ? 'more' : 'less'} of your income`, now, at({ savingsRate }), true, ctx)
    }
    case 5: {
      const k = p.incomeNow > 0 ? (p.incomeNow + step) / p.incomeNow : 1
      return move(`Earning ${ctx.money(step)} more a year`, now, at({ incomeNow: p.incomeNow + step, income10y: p.income10y * k }), true, ctx)
    }
    case 6: {
      const g = growthRate(p) + 0.01
      return move('Pay growing 1 percentage point faster each year', now, at({ income10y: p.incomeNow * Math.pow(1 + g, 10) }), true, ctx)
    }
    case 7:
      return alternatives(p, SECTOR_SHORT.map(([s, label]) => ({ label, patch: { sector: s }, current: p.sector === s })), tgt, ctx)
    case 8: {
      const up = p.variablePayShare + 0.1 <= 1 + 1e-9
      const variablePayShare = up ? p.variablePayShare + 0.1 : p.variablePayShare - 0.1
      return move(`${up ? '10 percentage points more' : '10 percentage points less'} of your pay as bonus or shares`, now, at({ variablePayShare }), false, ctx)
    }
    case 9:
      return alternatives(p, SECURITY_SHORT.map(([s, label]) => ({ label, patch: { incomeSecurity: s }, current: p.incomeSecurity === s })), tgt, ctx)
    case 10:
      return alternatives(
        p,
        BUFFER_SHORT.map(([m, label]) => ({ label, patch: { bufferMonths: m }, current: bufferBucket(p.bufferMonths) === m })),
        tgt,
        ctx,
        ' months',
      )
    case 11:
      return p.maxDebtRate > expensiveDebtRate
        ? move('Paying off your expensive debt', now, at({ maxDebtRate: 0 }), false, ctx)
        : move(`Debt above ${roundHalfAway(expensiveDebtRate * 100, 1)}% interest`, now, at({ maxDebtRate: expensiveDebtRate + 0.02 }), false, ctx)
    case 12:
      return alternatives(p, likert(DRAWDOWN_SHORT, 'drawdownReaction', p), tgt, ctx)
    case 13:
      return alternatives(p, likert(GAMBLE_SHORT, 'incomeGamble', p), tgt, ctx)
    case 14:
      return move(`A loss limit ${ctx.money(step)} higher`, now, at({ maxLossMoney: p.maxLossMoney + step }), false, ctx)
    case 15:
      return alternatives(p, EXPERIENCE_SHORT.map(([e, label]) => ({ label, patch: { experience: e }, current: p.experience === e })), tgt, ctx)
    case 16:
      return p.knowledgeCheckPassed && p.leverageOptIn
        ? move('Switching borrowing off', now, at({ leverageOptIn: false }), false, ctx)
        : move('Passing the check and opting in', now, at({ knowledgeCheckPassed: true, leverageOptIn: true }), false, ctx)
  }
}
