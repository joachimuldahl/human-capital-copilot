import { describe, expect, it } from 'vitest'
import { solveAllocation } from './allocation'
import { describeChange, explainLetfDrag, explainMarginBuffer, explainNextSavings, gateCard } from './explain'
import { monthlySavings, mostUnderweight, planChanges, planLoan, planSleeves } from './plan'
import { assetClassValues } from './portfolio'
import { letfDrag, marginBuffer, stressLoss } from './risk'
import { targetEEE } from './target'
import { PERSONAS, PORTFOLIOS, PRODUCTS } from './test/fixtures'

const plan = (id: keyof typeof PERSONAS, sat: { gold?: number; btc?: number } = {}) => {
  const p = PERSONAS[id]
  const alloc = solveAllocation(targetEEE(p).finalEEE, sat)
  return { p, alloc, rows: planSleeves(alloc, assetClassValues(PORTFOLIOS[id], PRODUCTS), p.investableAssets) }
}
const row = (rows: ReturnType<typeof plan>['rows'], s: string) => rows.find((r) => r.sleeve === s)!

describe('planSleeves (section 9 target allocations)', () => {
  it('Sofie: equity 150% (€15,000), loan −50% (−€5,000); current stocks €8,000', () => {
    const { rows } = plan('sofie')
    expect(row(rows, 'equity').targetEUR).toBeCloseTo(15000, 0)
    expect(row(rows, 'loan').targetEUR).toBeCloseTo(-5000, 0)
    expect(row(rows, 'equity').currentEUR).toBe(8000)
    expect(row(rows, 'crypto').currentEUR).toBe(1000)
    expect(row(rows, 'crypto').targetEUR).toBe(0)
    expect(row(rows, 'cash').targetShare).toBe(0)
  })
  it('Lea: equity 18.6%, bonds 81.4%; Jonas: 63.4% / 36.6%', () => {
    expect(row(plan('lea').rows, 'equity').targetShare).toBeCloseTo(0.186, 3)
    expect(row(plan('lea').rows, 'bonds').targetShare).toBeCloseTo(0.814, 3)
    expect(row(plan('jonas').rows, 'equity').targetShare).toBeCloseTo(0.634, 3)
    expect(row(plan('jonas').rows, 'bonds').targetShare).toBeCloseTo(0.366, 3)
  })
  it('Lea with gold 5% → equity 0.1799, bonds 0.7701, gold 0.05', () => {
    const { rows } = plan('lea', { gold: 0.05 })
    expect(row(rows, 'equity').targetShare).toBeCloseTo(0.1799, 3)
    expect(row(rows, 'bonds').targetShare).toBeCloseTo(0.7701, 3)
    expect(row(rows, 'gold').targetShare).toBe(0.05)
  })
  it('stress at target (section 9)', () => {
    for (const [id, pct, money] of [
      ['sofie', -0.75, -7500],
      ['mads', -0.6, -15000],
      ['lea', -0.069, -2745],
      ['jonas', -0.306, -4593],
    ] as const) {
      const { alloc, p } = plan(id)
      const s = stressLoss(alloc, p.investableAssets)
      expect(Math.abs(s.pct - pct), id).toBeLessThanOrEqual(0.0005)
      expect(Math.abs(s.money - money), id).toBeLessThanOrEqual(2)
    }
  })
})

describe('loan, changes and next savings', () => {
  it('Sofie loan €5,000 at 4.5% = €225/yr; Lea no loan', () => {
    const s = planLoan(plan('sofie').alloc, 10000)
    expect(s.amount).toBeCloseTo(5000, 0)
    expect(s.costPerYear).toBeCloseTo(225, 0)
    expect(planLoan(plan('lea').alloc, 40000)).toEqual({ amount: 0, costPerYear: 0 })
  })
  it('Mads: changes above 2% of F, largest first; savings go to stocks', () => {
    const { rows, p } = plan('mads')
    const changes = planChanges(rows, p.investableAssets)
    // target stocks €30,000 vs €5,000 now; cash €0 vs €20,000; loan −€5,000
    expect(changes.map((c) => c.sleeve)).toEqual(['equity', 'cash', 'loan'])
    expect(changes.map(describeChange)).toEqual([
      'Increase stocks (global equity) by €25,000.',
      'Reduce cash by €20,000.',
      'Borrow €5,000 with a broker loan (only if you are comfortable with the risks under “Borrowing to invest”).',
    ])
    expect(mostUnderweight(rows)?.sleeve).toBe('equity')
    expect(monthlySavings(p)).toBeCloseTo(687.5, 6)
    expect(explainNextSavings(monthlySavings(p), mostUnderweight(rows))).toBe('Put your next monthly savings (€688) into stocks (global equity).')
  })
  it('Sofie: Bitcoin keeps its capital letter', () => {
    const { rows, p } = plan('sofie')
    expect(planChanges(rows, p.investableAssets).map(describeChange)).toContain('Reduce crypto (Bitcoin) by €1,000.')
  })
  it('nothing underweight → keep investing message; repay wording', () => {
    expect(mostUnderweight([])).toBeNull()
    expect(explainNextSavings(500, null)).toContain('already matches the plan')
    expect(describeChange({ sleeve: 'loan', targetShare: 0, targetEUR: 0, currentShare: 0, currentEUR: -1000, diffEUR: 1000 })).toBe('Repay €1,000 of borrowing.')
    expect(describeChange({ sleeve: 'gold', targetShare: 0, targetEUR: 0, currentShare: 0, currentEUR: 500, diffEUR: -500 })).toBe('Reduce gold by €500.')
  })
  it('small differences (≤ 2% of F) are left out', () => {
    expect(planChanges([{ sleeve: 'gold', targetShare: 0, targetEUR: 200, currentShare: 0, currentEUR: 0, diffEUR: 200 }], 10000)).toEqual([])
  })
})

describe('leverage and gate texts', () => {
  it('margin buffer 1.5× → 56%, LETF drag 2.6%', () => {
    expect(explainMarginBuffer(marginBuffer(1.5)!)).toBe('Stocks could fall 56% before a margin call.')
    expect(explainLetfDrag(letfDrag(2, 0.16))).toContain('about 2.6% a year')
  })
  it('gate cards', () => {
    expect(gateCard('G1_buffer', { ...PERSONAS.sofie, bufferMonths: 2 }).title).toBe('Build a 3-month buffer first')
    expect(gateCard('G1_buffer', { ...PERSONAS.sofie, bufferMonths: 1 }).text).toContain('1 month of')
    expect(gateCard('G2_debt', { ...PERSONAS.sofie, maxDebtRate: 0.09 }).title).toBe('Repay your 9% debt first')
  })
})
