/** App routes (HashRouter: URLs look like /#/results). Single source for Nav and App. */
export interface AppRoute {
  path: string
  label: string
  inNav: boolean
}

export const ROUTES: AppRoute[] = [
  { path: '/', label: 'Home', inNav: false },
  { path: '/onboarding', label: 'Onboarding', inNav: true },
  { path: '/results', label: 'Results', inNav: true },
  { path: '/portfolio', label: 'Portfolio', inNav: true },
  { path: '/plan', label: 'Plan', inNav: true },
  { path: '/method', label: 'Method', inNav: false },
]

export const NAV_ROUTES = ROUTES.filter((r) => r.inNav)
