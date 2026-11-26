import { describe, expect, it } from 'vitest'
import { fromSlider, LOG_STEPS, tidy, toSlider } from './logScale'

describe('log slider mapping (BUILD_SPEC 18.2)', () => {
  it('ends map to min and max, middle to the geometric mean', () => {
    expect(fromSlider(0, 20000, 200000)).toBeCloseTo(20000)
    expect(fromSlider(LOG_STEPS, 20000, 200000)).toBeCloseTo(200000)
    expect(fromSlider(LOG_STEPS / 2, 20000, 200000)).toBeCloseTo(Math.sqrt(20000 * 200000))
  })
  it('round-trips within one step', () => {
    for (const v of [25000, 40000, 55000, 120000, 199000]) {
      const back = fromSlider(toSlider(v, 20000, 200000), 20000, 200000)
      expect(Math.abs(back / v - 1)).toBeLessThan(0.003)
    }
  })
  it('clamps values outside the range (0 sits at the left end)', () => {
    expect(toSlider(0, 500, 1e6)).toBe(0)
    expect(toSlider(5e6, 500, 1e6)).toBe(LOG_STEPS)
  })
  it('tidies amounts', () => {
    expect(tidy(41237)).toBe(41000)
    expect(tidy(298996)).toBe(300000)
    expect(tidy(733)).toBe(733)
    expect(tidy(0)).toBe(0)
  })
})
