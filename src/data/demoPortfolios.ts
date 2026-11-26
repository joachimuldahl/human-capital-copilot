/** Demo portfolios per persona (BUILD_SPEC 6.4). Values in EUR; each total equals the persona's F. Illustrative (D-16). */
import type { Account, Holding } from '../engine'
import type { PersonaId } from './personas'

export interface DemoPortfolio {
  personaId: PersonaId
  /** What the portfolio is meant to show. */
  story: string
  accounts: Account[]
  holdings: Holding[]
}

const BROKER: Account = { id: 'broker', name: 'Online broker' }
const CRYPTO: Account = { id: 'crypto', name: 'Crypto exchange' }
const BANK: Account = { id: 'bank', name: 'Bank' }

const holdings = (personaId: PersonaId, rows: [Account, string, number][]): Holding[] =>
  rows.map(([account, productId, valueEUR]) => ({ id: `${personaId}-${productId}`, accountId: account.id, productId, valueEUR }))

export const DEMO_PORTFOLIOS: Record<PersonaId, DemoPortfolio> = {
  sofie: {
    personaId: 'sofie',
    story: 'Apple hidden concentration, ETF overlap, too little risk',
    accounts: [BROKER, CRYPTO, BANK],
    holdings: holdings('sofie', [
      [BROKER, 'vwce', 4000],
      [BROKER, 'cndx', 3000],
      [BROKER, 'aapl', 1000],
      [CRYPTO, 'btcetp', 1000],
      [BANK, 'cash', 1000],
    ]),
  },
  mads: {
    personaId: 'mads',
    story: 'Mostly cash, far below target',
    accounts: [BANK, BROKER],
    holdings: holdings('mads', [
      [BANK, 'cash', 20000],
      [BROKER, 'vwce', 5000],
    ]),
  },
  lea: {
    personaId: 'lea',
    story: 'Finance job AND finance-heavy portfolio',
    accounts: [BROKER, BANK],
    holdings: holdings('lea', [
      [BROKER, 'finetf', 16000],
      [BROKER, 'jpm', 8000],
      [BROKER, 'cspx', 8000],
      [BROKER, 'aggbond', 4000],
      [BANK, 'cash', 4000],
    ]),
  },
  jonas: {
    personaId: 'jonas',
    story: 'Far too much risk vs a 0.67× target',
    accounts: [CRYPTO, BROKER, BANK],
    holdings: holdings('jonas', [
      [CRYPTO, 'btcetp', 9000],
      [BROKER, 'nvda', 4500],
      [BANK, 'cash', 1500],
    ]),
  },
}
