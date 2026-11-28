import { describe, expect, it } from 'vitest'
import { solveAllocation } from './allocation'
import { planChanges, planSleeves } from './plan'
import { horizonYears, howToSteps, ownBarSegments, oddsSentence, planSummarySentence, projectionCallout, projectionCaption } from './planView'
import { assetClassValues, exposures, netWorth } from './portfolio'
import { CASH_WEIGHTS, projectWealth } from './projection'
import { monthlySavings } from './plan'
import { portfolioEEE } from './risk'
import { targetEEE } from './target'
import { PERSONAS, PORTFOLIOS, PRODUCTS } from './test/fixtures'

function view(id: keyof typeof PERSONAS, years = 10, compareWith: 'current' | 'cash' = 'current') {
  const p = PERSONAS[id]
  const t = targetEEE(p)
  const alloc = solveAllocation(t.finalEEE)
  const x = exposures(PORTFOLIOS[id], PRODUCTS)
  const monthlySaving = monthlySavings(p)
  const plan = projectWealth({ startValue: p.investableAssets, monthlySaving, weights: alloc, years })
  const compare = projectWealth({ startValue: netWorth(PORTFOLIOS[id]), monthlySaving, weights: compareWith === 'cash' ? CASH_WEIGHTS : x, years })
  const rows = planSleeves(alloc, assetClassValues(PORTFOLIOS[id], PRODUCTS), p.investableAssets)
  return { p, t, alloc, plan, compare, rows, compareEEE: compareWith === 'cash' ? 0 : portfolioEEE(x), years, compareWith }
}

describe('planSummarySentence', () => {
  it('describes loan, bonds, bond-heavy and satellites', () => {
    expect(planSummarySentence(solveAllocation(1.2))).toBe('A global stock fund plus a small loan from your broker.')
    expect(planSummarySentence(solveAllocation(0.6667))).toBe('A global stock fund with 36.6% in bonds for stability.')
    expect(planSummarySentence(solveAllocation(0.3439))).toBe('Mostly bonds for stability, with 18.6% in a global stock fund.')
    expect(planSummarySentence(solveAllocation(1.0))).toBe('A global stock fund.')
    expect(planSummarySentence(solveAllocation(1.5, { gold: 0.05 }))).toBe('A global stock fund plus a small loan from your broker, plus 5.0% in gold.')
  })
})

describe('horizonYears', () => {
  it('until retirement = retireAge − age', () => {
    expect(horizonYears('retire', PERSONAS.mads)).toBe(40)
    expect(horizonYears(10, PERSONAS.mads)).toBe(10)
  })
})

describe('projectionCallout (section 19 acceptance)', () => {
  it('Mads at 10 years: plan likely value above current mix, callout states the gap', () => {
    const v = view('mads')
    const P = v.plan.points[10]
    const C = v.compare.points[10]
    expect(P.p50).toBeGreaterThan(C.p50)
    const c = projectionCallout({ targetEEE: v.t.finalEEE, compareEEE: v.compareEEE, plan: v.plan, compare: v.compare, years: 10, compareWith: 'current' })
    expect(c.kind).toBe('cautious')
    expect(c.text).toMatch(/^Staying as you are could leave you about €[\d,]+ less after 10 years/)
  })
  it('Jonas: riskier wording with his p10', () => {
    const v = view('jonas')
    const c = projectionCallout({ targetEEE: v.t.finalEEE, compareEEE: v.compareEEE, plan: v.plan, compare: v.compare, years: 10, compareWith: 'current' })
    expect(c.kind).toBe('riskier')
    const p10 = Math.round(v.compare.points[10].p10).toLocaleString('en-US')
    expect(c.text).toContain(`in the 1-in-10 bad case you'd end with €${p10}`)
    expect(c.text).toContain("The plan's bad case is")
  })
  it('compare with cash uses the cash wording', () => {
    const v = view('sofie', 10, 'cash')
    const c = projectionCallout({ targetEEE: v.t.finalEEE, compareEEE: 0, plan: v.plan, compare: v.compare, years: 10, compareWith: 'cash' })
    expect(c.text).toMatch(/^Keeping it all in cash could leave you about/)
  })
  it('close to the plan: keep saving', () => {
    const v = view('sofie')
    const c = projectionCallout({ targetEEE: 1.0, compareEEE: 1.1, plan: v.plan, compare: v.compare, years: 10, compareWith: 'current' })
    expect(c).toEqual({ kind: 'close', text: "You're already close to your plan. Keep saving monthly." })
  })
})

describe('odds and captions', () => {
  it('odds sentence quotes both chances', () => {
    const v = view('mads')
    expect(oddsSentence(v.plan, v.compare, 10, 'current')).toMatch(/^Chance of ending below what you put in: \d+% after 10 years \(plan\) vs \d+% \(current mix\)\.$/)
    expect(projectionCaption(v.plan, 10)).toContain('8 in 10 simulated paths end between')
  })
})

describe('howToSteps', () => {
  it('Mads: savings, move cash, optional borrow', () => {
    const v = view('mads')
    const steps = howToSteps(planChanges(v.rows, v.p.investableAssets), v.rows, v.p)
    expect(steps).toEqual([
      'Put your next monthly savings (€688) into stocks (global equity).',
      'Move €20,000 from cash into stocks (global equity).',
      'Optional: borrow €5,000 from your broker. Read “Borrowing to invest” under Advanced first.',
    ])
  })
  it('Jonas: no borrowing; moves out of Bitcoin and cash into bonds and stocks', () => {
    const v = view('jonas')
    const steps = howToSteps(planChanges(v.rows, v.p.investableAssets), v.rows, v.p)
    expect(steps).toHaveLength(2)
    expect(steps[1]).toMatch(/^Move €10,500 from cash and crypto \(Bitcoin\): about €[\d,]+ into bonds and €[\d,]+ into stocks \(global equity\)\.$/)
  })
})

describe('ownBarSegments', () => {
  it('Mads: today 80% cash / 20% stocks; plan 100% own stocks + 20% borrowed', () => {
    const v = view('mads')
    const s = ownBarSegments(v.rows)
    expect(s.today.map((x) => [x.key, +x.share.toFixed(3)])).toEqual([['equity', 0.2], ['cash', 0.8]])
    expect(s.plan.map((x) => [x.key, +x.share.toFixed(3)])).toEqual([['equity', 1], ['borrowed', 0.2]])
  })
  it('Lea plan: stocks and bonds sum to 100%', () => {
    const s = ownBarSegments(view('lea').rows)
    expect(s.plan.reduce((a, x) => a + x.share, 0)).toBeCloseTo(1, 6)
  })
})
