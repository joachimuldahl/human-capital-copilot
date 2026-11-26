import { describe, expect, it } from 'vitest'
import {
  betaLabel,
  cryptoEquityCost,
  explainBinding,
  explainCrypto,
  explainHumanCapital,
  explainIncomeType,
  formatEUR,
  formatPct,
  formatRatio,
  incomeType,
  incomeTypeTitle,
  roundHalfAway,
} from './explain'
import { targetEEE } from './target'
import { PERSONAS } from './test/fixtures'
import type { Profile } from './types'

describe('formatters (section 7)', () => {
  it('ratios: 2 decimals + ×', () => {
    expect(formatRatio(1.5)).toBe('1.50×')
    expect(formatRatio(0.34389)).toBe('0.34×')
    expect(formatRatio(0.66667)).toBe('0.67×')
  })
  it('EUR without decimals', () => {
    expect(formatEUR(10000)).toBe('€10,000')
    expect(formatEUR(219483.66)).toBe('€219,484')
    expect(formatEUR(-4750)).toBe('−€4,750')
    expect(formatEUR(-0.4)).toBe('€0')
  })
  it('percent with 1 decimal, half away from zero', () => {
    expect(formatPct(0.1435)).toBe('14.4%')
    expect(formatPct(0.0255)).toBe('2.6%')
    expect(formatPct(-0.475)).toBe('−47.5%')
    expect(formatPct(0.15)).toBe('15.0%')
  })
  it('roundHalfAway', () => {
    expect(roundHalfAway(-2.5, 0)).toBe(-3)
    expect(roundHalfAway(1.005, 2)).toBe(1.01)
  })
})

describe('income type', () => {
  it('thresholds 0.15 / 0.40', () => {
    expect(incomeType(0.05)).toBe('bond-like')
    expect(incomeType(0.15)).toBe('bond-like')
    expect(incomeType(0.2)).toBe('mixed')
    expect(incomeType(0.4)).toBe('mixed')
    expect(incomeType(0.61)).toBe('stock-like')
    expect(betaLabel(0.61)).toBe('stock-like, βH 0.61')
    expect(incomeTypeTitle(0.2)).toBe('Mixed')
  })
  it('explains each type', () => {
    expect(explainIncomeType(0.05)).toContain('bond-like')
    expect(explainIncomeType(0.2)).toContain('mixed')
    expect(explainIncomeType(0.71)).toContain('stock-like')
  })
})

describe('binding explanations (5.5)', () => {
  const sofie = PERSONAS.sofie
  const ex = (p: Profile) => explainBinding(targetEEE(p), p)
  it('policy cap', () => {
    expect(ex(sofie)).toBe('Limited by our 1.5× safety cap. Your future savings would justify more, but we never go above 1.5×.')
  })
  it('loss cap', () => {
    expect(ex(PERSONAS.mads)).toBe('Limited by the most you said you could lose in a bad year (€15,000).')
  })
  it('gates', () => {
    expect(ex({ ...sofie, bufferMonths: 2 })).toBe('Capped at 1.0× until you have a 3-month emergency buffer.')
    expect(ex({ ...sofie, maxDebtRate: 0.09 })).toBe(
      'Capped at 1.0× while you have debt above 7% interest. Paying it off first is a guaranteed return.',
    )
    expect(ex({ ...sofie, leverageOptIn: false })).toBe(
      'Capped at 1.0× because borrowing to invest needs the knowledge check, opt-in, 15+ years to retirement and at least €5,000.',
    )
  })
  it('model with stock-like income (Lea)', () => {
    expect(ex(PERSONAS.lea)).toBe(
      'Your income already behaves like stocks (stock-like, βH 0.61), so your portfolio should carry less market risk.',
    )
  })
  it('model with non-stock-like income', () => {
    const p: Profile = { ...PERSONAS.mads, drawdownReaction: 1, incomeGamble: 1, investableAssets: 2_000_000, maxLossMoney: 2_000_000 }
    const t = targetEEE(p)
    expect(t.binding).toBe('model')
    expect(explainBinding(t, p)).toContain('No cap was needed')
  })
  it('floor', () => {
    const p: Profile = { ...PERSONAS.lea, drawdownReaction: 1, incomeGamble: 1, sector: 'founder', variablePayShare: 1 }
    expect(ex(p)).toBe('Kept at our minimum of 0.20×, so your savings still grow with the market.')
  })
})

describe('human capital and crypto text', () => {
  it('Sofie human capital', () => {
    expect(explainHumanCapital(targetEEE(PERSONAS.sofie))).toBe(
      '95.6% of your lifetime investable wealth is still in your future salary (future savings worth €219,484).',
    )
  })
  it('10% bitcoin at 1.5× uses 19.0 pp of the stock budget', () => {
    expect(cryptoEquityCost(1.5, 0.1)).toBeCloseTo(0.1899, 3)
    expect(explainCrypto(1.5, 0.1)).toBe('10.0% in Bitcoin uses 19.0 percentage points of your stock budget')
  })
})

describe('Phase 3 text helpers', () => {
  it('formatTimes and riskSentence', async () => {
    const { formatTimes, riskSentence } = await import('./explain')
    expect(formatTimes(1.5)).toBe('1.5')
    expect(formatTimes(0.34389)).toBe('0.34')
    expect(riskSentence(1.5)).toBe('You can carry about 1.5 times the risk of the global stock market.')
  })
  it('labels and question helpers', async () => {
    const m = await import('./explain')
    expect(m.BINDING_LABEL.policy_cap).toBe('Safety cap (1.5×)')
    expect(m.BINDING_LABEL.model).toBe('Set by your profile')
    expect(m.BAND_LABEL.high).toBe('High')
    expect(m.riskAttitudeLine(targetEEE(PERSONAS.sofie))).toBe('hold 87.9% of your total wealth in stocks')
    expect(m.drawdownQuestion(10000)).toBe('Your €10,000 falls to €7,000 in three months. What do you do?')
    expect(m.impliedGrowthLabel(PERSONAS.sofie)).toBe('≈ 3.5% per year')
  })
})
