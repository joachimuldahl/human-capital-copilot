import { describe, expect, it } from 'vitest'
import { resolveProfile, scaleMoney } from './defaults'
import { answerEffect } from './effects'
import {
  currencySymbol,
  defaultsNote,
  driverLines,
  ESTIMATE_NOTE,
  explainBinding,
  explainGrowthCap,
  formatMoney,
  formatWealthShare,
  niceAmount,
  panelExplanation,
} from './explain'
import { growthRate, rawGrowthRate } from './humanCapital'
import { targetEEE } from './target'
import { PERSONAS } from './test/fixtures'

const nb = (s: string) => s.replace(/ /g, ' ')

describe('formatMoney (18.1)', () => {
  it('formats each currency without decimals, minus sign in front', () => {
    expect(formatMoney(10000)).toBe('€10,000')
    expect(formatMoney(10989, 'USD')).toBe('$10,989')
    expect(formatMoney(8330.5, 'GBP')).toBe('£8,331')
    expect(nb(formatMoney(74749, 'DKK'))).toBe('kr 74,749')
    expect(nb(formatMoney(-4750, 'SEK'))).toBe('−kr 4,750')
    expect(nb(formatMoney(9233, 'CHF'))).toBe('CHF 9,233')
  })
  it('symbols', () => {
    expect(currencySymbol('EUR')).toBe('€')
    expect(currencySymbol('DKK')).toBe('kr')
    expect(currencySymbol('CHF')).toBe('CHF')
  })
  it('niceAmount rounds to 2 significant figures', () => {
    expect(niceAmount(74749)).toBe(75000)
    expect(niceAmount(298996)).toBe(300000)
    expect(niceAmount(37374.5)).toBe(37000)
    expect(niceAmount(10989)).toBe(11000)
    expect(niceAmount(0)).toBe(0)
  })
})

describe('currency in defaults and text', () => {
  it('defaults are converted and rounded; EUR defaults unchanged', () => {
    const dkk = resolveProfile({}, 7.4749)
    expect(dkk.investableAssets).toBe(75000)
    expect(dkk.incomeNow).toBe(300000)
    expect(dkk.maxLossMoney).toBe(22500)
    expect(dkk.fx).toBe(7.4749)
    expect(resolveProfile({}).investableAssets).toBe(10000)
  })
  it('scaleMoney scales only money fields that are present', () => {
    expect(scaleMoney({ age: 30, investableAssets: 100 }, 2)).toEqual({ age: 30, investableAssets: 200 })
  })
  it('G3 sentence and effect steps use the converted amounts', () => {
    const p = { ...scaleMoney(PERSONAS.sofie, 7.4749), fx: 7.4749, leverageOptIn: false }
    const t = targetEEE(p)
    expect(t.binding).toBe('G3_leverage')
    expect(nb(explainBinding(t, p, { currency: 'DKK' }))).toContain('at least kr 37,375')
    expect(nb(answerEffect(3, p, { currency: 'DKK' }))).toContain('Having kr 37,000 more invested today')
  })
})

describe('income growth notice (18.2)', () => {
  it('growth is capped at 12% in the calculation; the notice shows the real figure', () => {
    const p = { ...PERSONAS.sofie, incomeNow: 40000, income10y: 200000 }
    expect(rawGrowthRate(p)).toBeCloseTo(0.1746, 4)
    expect(growthRate(p)).toBe(0.12)
    expect(explainGrowthCap(p)).toBe("That's 17.5% a year: possible in some careers, but we cap growth at 12% a year in the calculation.")
    expect(explainGrowthCap({ ...p, income10y: 120000 })).toBeNull() // 11.6%
    expect(explainGrowthCap(PERSONAS.sofie)).toBeNull()
  })
})

describe('side panel (18.3)', () => {
  const p = resolveProfile({})
  const t = targetEEE(p, { pending: ['G3_leverage', 'G4_loss'] })

  it('F = 0 reads "≈ 100% of wealth"', () => {
    const z = resolveProfile({ investableAssets: 0 })
    const tz = targetEEE(z)
    expect(formatWealthShare(tz.hcRatio, 0)).toBe('≈ 100%')
    expect(driverLines(tz, 0)[1].value).toMatch(/≈ 100% of wealth$/)
    expect(formatWealthShare(0.9564, 10000)).toBe('95.6%')
  })

  it('estimate: the note plus the policy-cap sentence (once)', () => {
    expect(t.binding).toBe('policy_cap')
    const lines = panelExplanation(t, p, { answers: {}, estimate: true, unanswered: 16 })
    expect(lines).toEqual([ESTIMATE_NOTE, explainBinding(t, p)])
  })

  it('a model or default-based limit sentence is held back until answered', () => {
    const lea = { ...PERSONAS.lea }
    const tl = targetEEE(lea, { pending: ['G3_leverage', 'G4_loss'] })
    expect(tl.binding).toBe('model')
    expect(panelExplanation(tl, lea, { answers: { age: 26 }, estimate: true, unanswered: 15 })).toEqual([ESTIMATE_NOTE])
    // G1 from the default would not happen, but an answered buffer below 3 months shows its sentence.
    const g1 = { ...p, bufferMonths: 1 }
    const tg = targetEEE(g1, { pending: ['G3_leverage', 'G4_loss'] })
    expect(tg.binding).toBe('G1_buffer')
    expect(panelExplanation(tg, g1, { answers: { bufferMonths: 1 }, estimate: true, unanswered: 15 })).toHaveLength(2)
    expect(panelExplanation(tg, g1, { answers: {}, estimate: true, unanswered: 16 })).toHaveLength(1)
  })

  it('preliminary (no estimate): the defaults note; all answered: the binding sentence only', () => {
    const tl = targetEEE(PERSONAS.lea)
    expect(panelExplanation(tl, PERSONAS.lea, { answers: {}, estimate: false, unanswered: 3 })).toEqual([defaultsNote(3)])
    expect(panelExplanation(tl, PERSONAS.lea, { answers: PERSONAS.lea, estimate: false, unanswered: 0 })).toEqual([explainBinding(tl, PERSONAS.lea)])
  })
})
