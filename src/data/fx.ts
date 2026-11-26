/**
 * Currencies and fixed FX rates (BUILD_SPEC 18.1). Units of each currency per 1 EUR.
 * Source: ECB euro reference rates of 17 Nov 2026, as published by Banca d'Italia.
 * Demo data and EUR thresholds are converted with these rates; Risk Capacity does not depend on the currency.
 */
import type { Currency } from '../engine'

export type { Currency }

/** Order shown in the onboarding question. */
export const CURRENCIES: readonly Currency[] = ['DKK', 'EUR', 'USD', 'GBP', 'SEK', 'NOK', 'CHF']

/** Units per 1 EUR. */
export const FX: Record<Currency, number> = {
  EUR: 1,
  USD: 1.0989,
  GBP: 0.83305,
  DKK: 7.4749,
  SEK: 11.11,
  NOK: 10.5755,
  CHF: 0.9233,
}

export const FX_DATE = '17 Nov 2026'
export const FX_SOURCE = "ECB euro reference rates, as published by Banca d'Italia"

export const CURRENCY_NAME: Record<Currency, string> = {
  DKK: 'Danish krone',
  EUR: 'Euro',
  USD: 'US dollar',
  GBP: 'British pound',
  SEK: 'Swedish krona',
  NOK: 'Norwegian krone',
  CHF: 'Swiss franc',
}

const LOCALE_CURRENCY: Record<string, Currency> = {
  'da-DK': 'DKK',
  'sv-SE': 'SEK',
  'nb-NO': 'NOK',
  'nn-NO': 'NOK',
  'de-CH': 'CHF',
  'fr-CH': 'CHF',
  'en-GB': 'GBP',
  'en-US': 'USD',
}

/** Preselected currency from the browser locale (da-DK → DKK, …), otherwise EUR. */
export function currencyFromLocale(locale: string | undefined): Currency {
  if (!locale) return 'EUR'
  const [lang, region] = locale.replace('_', '-').split('-')
  return LOCALE_CURRENCY[`${lang.toLowerCase()}-${(region ?? '').toUpperCase()}`] ?? 'EUR'
}

/** The browser's preselected currency (EUR outside a browser). */
export function detectCurrency(): Currency {
  return currencyFromLocale(typeof navigator === 'undefined' ? undefined : navigator.language)
}
