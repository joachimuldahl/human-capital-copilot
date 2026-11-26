/** React hooks on top of the stores. Selectors return stable values so components don't re-render in a loop. */
import { useMemo } from 'react'
import { exposures, formatMoney, netWorth, pendingCaps, portfolioEEE, riskFit, targetEEE, type Holding, type Profile, type RiskFit } from '../engine'
import { FX, type Currency } from '../data/fx'
import { PRODUCTS } from '../data/products'
import type { PersonaId } from '../data/personas'
import { selectPortfolio, usePortfolioStore } from './portfolioStore'
import { selectProfile, useProfileStore, type ActiveId } from './profileStore'

/** The active profile (persona or "My answers" with defaults) and whether the user has answered anything. */
export function useActiveProfile(): { active: ActiveId; profile: Profile; hasAnswers: boolean } {
  const active = useProfileStore((s) => s.active)
  const answers = useProfileStore((s) => s.answers)
  const currency = useProfileStore((s) => s.currency)
  const profile = useMemo(() => selectProfile({ active, answers, currency }), [active, answers, currency])
  return { active, profile, hasAnswers: Object.keys(answers).length > 0 }
}

/**
 * Engine result for "My answers" (onboarding panel). Limits whose question is unanswered (Q14 → G4, Q16 → G3)
 * are pending: skipped rather than applied from defaults.
 */
export function useMyTarget() {
  const answers = useProfileStore((s) => s.answers)
  const currency = useProfileStore((s) => s.currency)
  return useMemo(() => {
    const profile = selectProfile({ active: 'mine', answers, currency })
    const pending = pendingCaps(answers)
    return { profile, pending, target: targetEEE(profile, { pending }) }
  }, [answers, currency])
}

/** Loads a persona and its demo portfolio. */
export function usePersonaLoader() {
  const loadPersona = useProfileStore((s) => s.loadPersona)
  const setSource = usePortfolioStore((s) => s.setSource)
  return (id: PersonaId) => {
    loadPersona(id)
    setSource('demo')
  }
}

/** Actual portfolio risk (engine portfolioEEE) and its fit against a target; null for an empty portfolio. */
export function portfolioRisk(holdings: Holding[], target: number): { actual: number; fit: RiskFit } | null {
  if (netWorth(holdings) <= 0) return null
  const actual = portfolioEEE(exposures(holdings, PRODUCTS))
  return { actual, fit: riskFit(actual, target) }
}

/** The active profile's portfolio risk vs a target (demo portfolio for personas, quick entry for "My answers"). */
export function useActivePortfolioRisk(target: number) {
  const active = useProfileStore((s) => s.active)
  const source = usePortfolioStore((s) => s.source)
  const quick = usePortfolioStore((s) => s.quick)
  const currency = useProfileStore((s) => s.currency)
  return useMemo(() => portfolioRisk(selectPortfolio(active, { source, quick }, currency).holdings, target), [active, source, quick, currency, target])
}

/** The chosen currency, its rate per EUR, and a money formatter for it. */
export function useCurrency(): { currency: Currency; fx: number; money: (x: number) => string } {
  const currency = useProfileStore((s) => s.currency)
  return useMemo(() => ({ currency, fx: FX[currency], money: (x: number) => formatMoney(x, currency) }), [currency])
}

/** Changes the currency and converts the stored answers and quick-entry amounts (BUILD_SPEC 18.1). */
export function changeCurrency(currency: Currency) {
  const from = useProfileStore.getState().currency
  if (from === currency) return
  usePortfolioStore.getState().scaleQuick(FX[currency] / FX[from])
  useProfileStore.getState().setCurrency(currency)
}
