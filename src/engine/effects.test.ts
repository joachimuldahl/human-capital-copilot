import { describe, expect, it } from 'vitest'
import { QUESTION_KEYS, resolveProfile, unansweredCount } from './defaults'
import { answerEffect, type QuestionNo } from './effects'
import { driverLines, explainBinding } from './explain'
import { targetEEE } from './target'
import { PERSONAS } from './test/fixtures'

describe('answerEffect (live "Your answer\'s effect" line)', () => {
  it('every question gives a non-empty line for every persona and the defaults', () => {
    for (const p of [resolveProfile({}), ...Object.values(PERSONAS)])
      for (let q = 1; q <= 16; q++) expect(answerEffect(q as QuestionNo, p).length).toBeGreaterThan(20)
  })

  it('shows the move when the model binds (Lea, savings +5 pp)', () => {
    const lea = PERSONAS.lea
    const alt = targetEEE({ ...lea, savingsRate: lea.savingsRate + 0.05 })
    const dH = Math.round(alt.pvfs - targetEEE(lea).pvfs).toLocaleString('en-US')
    expect(answerEffect(4, lea)).toBe(`Investing 5 percentage points more of your income would add €${dH} to your future savings and move your target from 0.34× to 0.28×.`)
  })

  it('says why the target stays when a cap binds (Sofie, retire 2 years later)', () => {
    expect(answerEffect(2, PERSONAS.sofie)).toMatch(/^Retiring 2 years later would add €[\d,]+ to your future savings, but your target stays at 1\.50× because it is limited by our 1\.5× safety cap\.$/)
  })

  it('Q14: a higher loss limit lifts a G4-bound target (Mads 1.20× → 1.50×)', () => {
    expect(answerEffect(14, PERSONAS.mads)).toBe('A loss limit €5,000 higher would move your target from 1.20× to 1.50×.')
  })

  it('choice questions list alternatives and merge equal neighbours (Sofie, buffer)', () => {
    expect(answerEffect(10, PERSONAS.sofie)).toBe('0–2 months → 1.00× · 3+ months (you) → 1.50×')
  })

  it('choice questions: Lea sector alternatives, current answer marked', () => {
    expect(answerEffect(7, PERSONAS.lea)).toBe('Public to Sales → 1.00× · Finance (you) → 0.34× · Founder → 0.20×')
  })

  it('choice question where every answer gives the same result says so', () => {
    expect(answerEffect(15, PERSONAS.sofie)).toBe('Every answer here gives 1.50× for you right now, because it is limited by our 1.5× safety cap.')
  })

  it('Q16: opting out, and opting in', () => {
    expect(answerEffect(16, PERSONAS.sofie)).toBe('Switching borrowing off would move your target from 1.50× to 1.00×.')
    expect(answerEffect(16, { ...PERSONAS.sofie, leverageOptIn: false })).toBe('Passing the check and opting in would move your target from 1.00× to 1.50×.')
  })

  it('Q11 with expensive debt shows the payoff', () => {
    expect(answerEffect(11, { ...PERSONAS.sofie, maxDebtRate: 0.09 })).toBe('Paying off your expensive debt would move your target from 1.00× to 1.50×.')
  })
})

describe('unansweredCount', () => {
  it('counts the 16 questions', () => {
    expect(Object.keys(QUESTION_KEYS)).toHaveLength(16)
    expect(unansweredCount({})).toBe(16)
    expect(unansweredCount({ age: 30, maxLossMoney: 0 })).toBe(14)
    expect(unansweredCount(PERSONAS.sofie)).toBe(0)
  })
})

describe('explainBinding with a default loss limit', () => {
  it('never quotes the default as the user\'s own words', () => {
    const p = resolveProfile({})
    const t = targetEEE(p)
    expect(t.binding).toBe('G4_loss')
    expect(explainBinding(t, p, { lossIsDefault: true })).toBe('Limited by our starting loss limit of €3,000 (30% of what you invest). Set your own in question 14.')
    expect(explainBinding(t, p)).toContain('the most you said you could lose')
  })
})

describe('driverLines', () => {
  it('Sofie', () => {
    expect(driverLines(targetEEE(PERSONAS.sofie))).toEqual([
      { label: 'Risk attitude', value: 'High · 87.9% in stocks' },
      { label: 'Future savings', value: '€219,484 · 95.6% of wealth' },
      { label: 'Income type', value: 'Mixed · βH 0.20' },
    ])
  })
})
