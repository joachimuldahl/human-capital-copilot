import { describe, expect, it } from 'vitest'
import { glidePath } from './glidePath'
import { PERSONAS } from './test/fixtures'

describe("glidePath: Sofie's path (section 9, ±0.005)", () => {
  const path = glidePath(PERSONAS.sofie)
  const at = (age: number) => path.find((p) => p.age === age)!

  it('runs from age to retirement', () => {
    expect(path[0].age).toBe(24)
    expect(path.at(-1)!.age).toBe(67)
    expect(path).toHaveLength(44)
    expect(path[0].F).toBe(10000)
    expect(path.at(-1)!.H).toBe(0)
  })

  it.each([
    [24, 1.5],
    [30, 1.5],
    [39, 1.5],
    [40, 1.45],
    [42, 1.33],
    [45, 1.2],
    [48, 1.11],
    [53, 1.0],
    [60, 0.93],
    [67, 0.88],
  ])('age %i → %f', (age, expected) => {
    expect(Math.abs(at(age).final - expected)).toBeLessThanOrEqual(0.005)
  })
})
