import { describe, expect, it } from 'vitest'
import { CURRENCIES, currencyFromLocale, FX, FX_DATE } from './fx'

describe('FX table (BUILD_SPEC 18.1)', () => {
  it('ECB reference rates of 17 Nov 2026, units per EUR', () => {
    expect(FX).toEqual({ EUR: 1, USD: 1.0989, GBP: 0.83305, DKK: 7.4749, SEK: 11.11, NOK: 10.5755, CHF: 0.9233 })
    expect(FX_DATE).toBe('17 Nov 2026')
    expect(CURRENCIES).toEqual(['DKK', 'EUR', 'USD', 'GBP', 'SEK', 'NOK', 'CHF'])
  })
  it('preselects from the browser locale, otherwise EUR', () => {
    expect(currencyFromLocale('da-DK')).toBe('DKK')
    expect(currencyFromLocale('sv-SE')).toBe('SEK')
    expect(currencyFromLocale('nb-NO')).toBe('NOK')
    expect(currencyFromLocale('nn-NO')).toBe('NOK')
    expect(currencyFromLocale('de-CH')).toBe('CHF')
    expect(currencyFromLocale('fr-CH')).toBe('CHF')
    expect(currencyFromLocale('en-GB')).toBe('GBP')
    expect(currencyFromLocale('en-US')).toBe('USD')
    expect(currencyFromLocale('de-DE')).toBe('EUR')
    expect(currencyFromLocale('da')).toBe('EUR')
    expect(currencyFromLocale(undefined)).toBe('EUR')
  })
})
