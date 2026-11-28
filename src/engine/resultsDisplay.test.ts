/** Results page wording: limits card, model value before limits, what-if loss range and crash cost, hero sentence. */
import { describe, expect, it } from 'vitest'
import { resolveProfile } from './defaults'
import { explainCrashCost, limitRows, modelBeforeLimitsSentence, rawEEELabel, riskSentence } from './explain'
import { crashCost, maxLossRange } from './risk'
import { targetEEE } from './target'
import { PERSONAS } from './test/fixtures'

const rows = (p: Parameters<typeof targetEEE>[0]) => Object.fromEntries(limitRows(targetEEE(p), p).map((r) => [r.id, r.value]))
const MULTIPLE = /(\d[\d,]*\.\d{2})×/g
const multiples = (xs: string[]) => xs.flatMap((s) => [...s.matchAll(MULTIPLE)].map((m) => Number(m[1].replace(/,/g, ''))))

describe('limits card (1)', () => {
  it('Sofie: safety cap applies as a multiple; other rules ok; loss limit as money', () => {
    expect(rows(PERSONAS.sofie)).toEqual({
      policy_cap: '1.50× · applies',
      G1_buffer: 'ok',
      G2_debt: 'ok',
      G3_leverage: 'ok',
      G4_loss: '€8,000 · not limiting',
    })
  })
  it('Mads: the loss limit binds and shows its multiple', () => {
    expect(rows(PERSONAS.mads)).toMatchObject({ policy_cap: '1.50×', G4_loss: '1.20× · applies' })
  })
  it('screenshot case: €7 invested, max loss €6,500 → no 1857.14×', () => {
    const p = resolveProfile({ investableAssets: 7, maxLossMoney: 6500 })
    const r = rows(p)
    expect(r.G4_loss).toBe('€6,500 · not limiting')
    expect(r.G3_leverage).toBe('applies')
    expect(multiples(Object.values(r)).every((x) => x <= 10)).toBe(true)
  })
  it('a rule in force that does not bind reads "not limiting"; one that binds reads "applies"', () => {
    expect(rows({ ...PERSONAS.lea, bufferMonths: 2 }).G1_buffer).toBe('not limiting') // Lea's 0.34× is below 1.0×
    expect(rows({ ...PERSONAS.sofie, bufferMonths: 2 }).G1_buffer).toBe('applies')
    expect(rows({ ...PERSONAS.sofie, maxDebtRate: 0.09 }).G2_debt).toBe('applies')
  })
  it('in another currency the loss limit uses that currency', () => {
    const t = targetEEE(PERSONAS.sofie)
    expect(limitRows(t, { ...PERSONAS.sofie, maxLossMoney: 59799 }, 'DKK').find((r) => r.id === 'G4_loss')!.value.replace(/ /g, ' ')).toBe('kr 59,799 · not limiting')
  })
})

describe('model value before limits (2)', () => {
  it('above 10× it is described, not shown', () => {
    expect(rawEEELabel(15.7798)).toBe('far above the 1.5× cap')
    expect(rawEEELabel(13543.92)).toBe('far above the 1.5× cap')
    expect(modelBeforeLimitsSentence(13543.92)).toBe("Before limits, the model's result is far above the 1.5× cap.")
  })
  it('up to 10× it is shown with 2 decimals', () => {
    expect(rawEEELabel(7.7953)).toBe('7.80×')
    expect(rawEEELabel(10)).toBe('10.00×')
    expect(modelBeforeLimitsSentence(2.1915)).toBe('The model before limits says 2.19×.')
  })
})

describe('what-if max loss range and crash cost (4)', () => {
  it('range is 0 to 0.75 × invested (the loss at 1.5×), at least 500', () => {
    expect(maxLossRange(10000)).toEqual({ min: 0, max: 7500 })
    expect(maxLossRange(7)).toEqual({ min: 0, max: 500 })
    expect(maxLossRange(0)).toEqual({ min: 0, max: 500 })
    expect(maxLossRange(25000 * 7.4749).max).toBeCloseTo(0.75 * 25000 * 7.4749, 6)
  })
  it('crash cost = 50% × target × invested; equals the loss limit when that limit binds', () => {
    expect(crashCost(1.5, 10000)).toBe(7500)
    const mads = targetEEE(PERSONAS.mads)
    expect(mads.binding).toBe('G4_loss')
    expect(crashCost(mads.finalEEE, PERSONAS.mads.investableAssets)).toBeCloseTo(PERSONAS.mads.maxLossMoney, 6)
    expect(explainCrashCost(7500)).toBe('A 50% crash would cost you about €7,500 at your current target.')
  })
})

describe('hero sentence (5)', () => {
  it('exactly 1.00× is "the same risk"; otherwise "about X times"', () => {
    expect(riskSentence(1)).toBe('You can carry about the same risk as the global stock market.')
    expect(riskSentence(0.999)).toBe('You can carry about the same risk as the global stock market.')
    expect(riskSentence(1.2)).toBe('You can carry about 1.2 times the risk of the global stock market.')
  })
})
