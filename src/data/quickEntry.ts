/** Quick-entry portfolio fields (BUILD_SPEC 7.4): one EUR amount per field, mapped to an example product. */
import type { Account } from '../engine'

export type QuickField = 'globalEquity' | 'usTech' | 'singleStocks' | 'bonds' | 'gold' | 'crypto' | 'cash'

export const QUICK_FIELDS: { key: QuickField; label: string; productId: string }[] = [
  { key: 'globalEquity', label: 'Global equity ETF', productId: 'vwce' },
  { key: 'usTech', label: 'US tech ETF', productId: 'cndx' },
  { key: 'singleStocks', label: 'Single stocks', productId: 'aapl' },
  { key: 'bonds', label: 'Bonds', productId: 'aggbond' },
  { key: 'gold', label: 'Gold', productId: 'sgln' },
  { key: 'crypto', label: 'Crypto', productId: 'btcetp' },
  { key: 'cash', label: 'Cash', productId: 'cash' },
]

export const QUICK_ACCOUNT: Account = { id: 'quick', name: 'My portfolio (quick entry)' }
