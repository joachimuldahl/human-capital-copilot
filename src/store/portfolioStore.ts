/**
 * Portfolio state (persisted): source (persona demo portfolio or quick entry) and the quick-entry amounts.
 * "My answers" has no demo portfolio, so it always uses quick entry.
 */
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Account, Holding } from '../engine'
import { DEMO_PORTFOLIOS } from '../data/demoPortfolios'
import { QUICK_ACCOUNT, QUICK_FIELDS, type QuickField } from '../data/quickEntry'
import type { ActiveId } from './profileStore'
import { FX, type Currency } from '../data/fx'

export type PortfolioSource = 'demo' | 'quick'
export type QuickValues = Record<QuickField, number>

export const EMPTY_QUICK: QuickValues = Object.fromEntries(QUICK_FIELDS.map((f) => [f.key, 0])) as QuickValues

interface PortfolioState {
  source: PortfolioSource
  quick: QuickValues
  setSource: (source: PortfolioSource) => void
  setQuickValue: (key: QuickField, valueEUR: number) => void
  resetQuick: () => void
  /** Multiplies the quick-entry amounts by k (currency change), rounded to whole units. */
  scaleQuick: (k: number) => void
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      source: 'demo',
      quick: EMPTY_QUICK,
      setSource: (source) => set({ source }),
      setQuickValue: (key, valueEUR) => set((s) => ({ quick: { ...s.quick, [key]: Math.max(0, valueEUR) } })),
      resetQuick: () => set({ quick: EMPTY_QUICK }),
      scaleQuick: (k) => set((s) => ({ quick: Object.fromEntries(Object.entries(s.quick).map(([key, v]) => [key, Math.round(v * k)])) as QuickValues })),
    }),
    {
      name: 'hcc-portfolio',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ source: s.source, quick: s.quick }),
    },
  ),
)

/** Quick-entry amounts as holdings (zero amounts left out). */
export function quickHoldings(quick: QuickValues): Holding[] {
  return QUICK_FIELDS.filter((f) => quick[f.key] > 0).map((f) => ({
    id: `quick-${f.key}`,
    accountId: QUICK_ACCOUNT.id,
    productId: f.productId,
    valueEUR: quick[f.key],
  }))
}

export interface ActivePortfolio {
  source: PortfolioSource
  accounts: Account[]
  holdings: Holding[]
}

/** The portfolio to show for the active profile. Demo portfolios (EUR data) are converted to the chosen currency. */
export function selectPortfolio(active: ActiveId, s: Pick<PortfolioState, 'source' | 'quick'>, currency: Currency = 'EUR'): ActivePortfolio {
  if (active !== 'mine' && s.source === 'demo') {
    const d = DEMO_PORTFOLIOS[active]
    const fx = FX[currency]
    const holdings = fx === 1 ? d.holdings : d.holdings.map((h) => ({ ...h, valueEUR: h.valueEUR * fx }))
    return { source: 'demo', accounts: d.accounts, holdings }
  }
  return { source: 'quick', accounts: [QUICK_ACCOUNT], holdings: quickHoldings(s.quick) }
}
