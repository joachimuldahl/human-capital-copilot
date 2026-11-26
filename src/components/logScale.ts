/**
 * Logarithmic slider mapping (BUILD_SPEC 18.2). UI only: maps a slider position 0…STEPS to an amount between
 * min and max on a log scale, so small and large amounts are both easy to set. Not finance.
 */
export const LOG_STEPS = 1000

/** Amount at slider position pos: min · (max/min)^(pos/STEPS). */
export function fromSlider(pos: number, min: number, max: number): number {
  const f = Math.min(Math.max(pos / LOG_STEPS, 0), 1)
  return min * Math.pow(max / min, f)
}

/** Slider position for an amount; values at or below min sit at 0, at or above max at STEPS. */
export function toSlider(value: number, min: number, max: number): number {
  if (!(value > min)) return 0
  if (value >= max) return LOG_STEPS
  return Math.round((Math.log(value / min) / Math.log(max / min)) * LOG_STEPS)
}

/** Rounds a slider amount to a tidy number (2–3 significant figures) so the field doesn't show 41,237. */
export function tidy(x: number): number {
  if (x <= 0) return 0
  const mag = Math.pow(10, Math.floor(Math.log10(x)) - 2)
  const step = x >= 1000 ? Math.max(mag * 5, 1) : Math.max(mag, 1)
  return Math.round(x / step) * step
}
