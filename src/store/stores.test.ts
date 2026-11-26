import { beforeEach, describe, expect, it } from 'vitest'
import { PERSONAS } from '../data/personas'
import { DEMO_PORTFOLIOS } from '../data/demoPortfolios'
import { EMPTY_QUICK, quickHoldings, selectPortfolio, usePortfolioStore } from './portfolioStore'
import { selectHasAnswers, selectProfile, useProfileStore } from './profileStore'

beforeEach(() => {
  localStorage.clear()
  useProfileStore.getState().reset()
  usePortfolioStore.setState({ source: 'demo', quick: EMPTY_QUICK })
})

describe('profileStore', () => {
  it('starts on "My answers" with the onboarding defaults', () => {
    const s = useProfileStore.getState()
    expect(s.active).toBe('mine')
    expect(selectHasAnswers(s)).toBe(false)
    expect(selectProfile(s).age).toBe(25)
  })

  it('loading a persona never overwrites my answers', () => {
    const s = useProfileStore.getState()
    s.setAnswer('age', 31)
    s.loadPersona('lea')
    expect(selectProfile(useProfileStore.getState())).toEqual(PERSONAS.lea.profile)
    useProfileStore.getState().showMyAnswers()
    expect(selectProfile(useProfileStore.getState()).age).toBe(31)
  })

  it('setAnswers merges; reset clears answers and goes back to mine', () => {
    const s = useProfileStore.getState()
    s.setAnswers({ age: 40, investableAssets: 50000 })
    s.setAnswers({ savingsRate: 0.2 })
    expect(useProfileStore.getState().answers).toEqual({ age: 40, investableAssets: 50000, savingsRate: 0.2 })
    s.loadPersona('jonas')
    useProfileStore.getState().reset()
    expect(useProfileStore.getState()).toMatchObject({ active: 'mine', answers: {} })
  })

  it('persists answers and active persona to localStorage and rehydrates them', async () => {
    useProfileStore.getState().setAnswer('age', 33)
    useProfileStore.getState().loadPersona('mads')
    const saved = JSON.parse(localStorage.getItem('hcc-profile')!)
    expect(saved.state).toEqual({ active: 'mads', answers: { age: 33 } })

    // Simulate a page reload: the in-memory state is reset, but storage still holds the saved answers.
    const raw = localStorage.getItem('hcc-profile')!
    useProfileStore.setState({ active: 'mine', answers: {} }) // also overwrites storage...
    localStorage.setItem('hcc-profile', raw) // ...so put the saved copy back, as after a reload
    expect(useProfileStore.getState().active).toBe('mine')
    await useProfileStore.persist.rehydrate()
    expect(useProfileStore.getState()).toMatchObject({ active: 'mads', answers: { age: 33 } })
  })
})

describe('portfolioStore', () => {
  it('persona + demo source → the persona demo portfolio', () => {
    const p = selectPortfolio('sofie', usePortfolioStore.getState())
    expect(p.source).toBe('demo')
    expect(p.holdings).toBe(DEMO_PORTFOLIOS.sofie.holdings)
  })

  it('"My answers" always uses quick entry, zero fields left out', () => {
    usePortfolioStore.getState().setQuickValue('globalEquity', 6000)
    usePortfolioStore.getState().setQuickValue('cash', 1500)
    const p = selectPortfolio('mine', usePortfolioStore.getState())
    expect(p.source).toBe('quick')
    expect(p.accounts.map((a) => a.id)).toEqual(['quick'])
    expect(p.holdings.map((h) => [h.productId, h.valueEUR])).toEqual([
      ['vwce', 6000],
      ['cash', 1500],
    ])
  })

  it('quick source on a persona; negative amounts become 0; resetQuick', () => {
    const s = usePortfolioStore.getState()
    s.setSource('quick')
    s.setQuickValue('crypto', -50)
    expect(usePortfolioStore.getState().quick.crypto).toBe(0)
    expect(selectPortfolio('lea', usePortfolioStore.getState()).source).toBe('quick')
    s.setQuickValue('gold', 100)
    usePortfolioStore.getState().resetQuick()
    expect(quickHoldings(usePortfolioStore.getState().quick)).toEqual([])
  })

  it('persists source and quick values', () => {
    usePortfolioStore.getState().setSource('quick')
    usePortfolioStore.getState().setQuickValue('bonds', 2000)
    const saved = JSON.parse(localStorage.getItem('hcc-portfolio')!)
    expect(saved.state.source).toBe('quick')
    expect(saved.state.quick.bonds).toBe(2000)
  })
})
