/** Example products per plan sleeve (BUILD_SPEC 7.5, D-3): 2–3 per sleeve, always "Example, not advice". */
import type { PlanSleeve } from '../engine'

export const EXAMPLE_PRODUCTS: Record<Exclude<PlanSleeve, 'loan'>, string[]> = {
  equity: ['vwce', 'cspx'],
  bonds: ['aggbond', 'govshort'],
  gold: ['sgln'],
  crypto: ['btcetp'],
  cash: ['cash'],
}

/** Shown only under "Alternative route" in the leverage panel. */
export const LEVERAGED_EXAMPLE = 'lev2x'
