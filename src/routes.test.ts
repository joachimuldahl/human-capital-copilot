import { describe, expect, it } from 'vitest'
import { NAV_ROUTES, ROUTES } from './routes'

describe('routes', () => {
  it('has the five pages from BUILD_SPEC section 4', () => {
    expect(ROUTES.map((r) => r.path)).toEqual(['/', '/onboarding', '/results', '/portfolio', '/plan'])
  })

  it('shows Onboarding · Results · Portfolio · Plan in the nav', () => {
    expect(NAV_ROUTES.map((r) => r.label)).toEqual(['Onboarding', 'Results', 'Portfolio', 'Plan'])
  })
})
