import type { ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Profile } from '../engine'
import type { ActiveId } from '../store/profileStore'
import type { QuickValues } from '../store/portfolioStore'

// Server rendering normally uses the store's *initial* state (zustand persist sets it to the defaults on purpose).
// For these tests, serve the live state instead, as a browser does after load. zustand is inlined in vite.config.ts
// so this mock reaches it.
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  const useSyncExternalStore: typeof actual.useSyncExternalStore = (subscribe, getSnapshot) =>
    actual.useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return { ...actual, default: { ...actual, useSyncExternalStore }, useSyncExternalStore }
})

type Page = 'Landing' | 'Onboarding' | 'Results' | 'Portfolio'

/** Server-render a page with the given profile state. */
async function renderPage(
  page: Page,
  state: { active: ActiveId; answers: Partial<Profile> } = { active: 'mine', answers: {} },
  quick: Partial<QuickValues> = {},
) {
  const { useProfileStore } = await import('../store/profileStore')
  const { usePortfolioStore, EMPTY_QUICK } = await import('../store/portfolioStore')
  useProfileStore.setState(state)
  usePortfolioStore.setState({ source: 'demo', quick: { ...EMPTY_QUICK, ...quick } })
  const mod = (await import(`./${page}.tsx`)) as { default: () => ReactElement }
  const Comp = mod.default
  const html = renderToString(
    <MemoryRouter>
      <Comp />
    </MemoryRouter>,
  )
  // Strip tags so text split across elements can be matched.
  return html.replace(/<[^>]+>/g, ' ').replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ')
}

beforeEach(() => {
  // Recharts measures the DOM; in server rendering it only warns about a 0-size container.
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

describe('Results presets (Phase 3 acceptance)', () => {
  it.each([
    ['sofie', '1.50×', 'Safety cap (1.5×)'],
    ['mads', '1.20×', 'Max loss in a bad year'],
    ['lea', '0.34×', 'Set by your profile'],
    ['jonas', '0.67×', 'Max loss in a bad year'],
  ] as const)('%s shows %s (%s)', async (id, ratio, binding) => {
    const t = await renderPage('Results', { active: id, answers: {} })
    expect(t).toContain(ratio)
    expect(t).toContain(binding)
    expect(t).toContain('Illustrative data')
    expect(t).toContain('Expected path if markets deliver average returns.')
  })

  it('Sofie: hero sentence, human capital and drivers', async () => {
    const t = await renderPage('Results', { active: 'sofie', answers: {} })
    expect(t).toContain('You can carry about 1.5 times the risk of the global stock market.')
    expect(t).toContain('95.6% of your lifetime investable wealth is still in your future salary (future savings worth €219,484).')
    expect(t).toContain('hold 87.9% of your total wealth in stocks')
    expect(t).toContain('mixed, βH 0.20')
  })

  it('empty state when there are no answers', async () => {
    const t = await renderPage('Results')
    expect(t).toContain('No answers yet')
    expect(t).toContain('Start (3 minutes)')
    expect(t).toContain('Sofie')
  })

  it('"My answers" shows the user\'s own result', async () => {
    const t = await renderPage('Results', { active: 'mine', answers: { age: 30, investableAssets: 20000 } })
    expect(t).toContain('Your Risk Capacity')
    expect(t).not.toContain('No answers yet')
  })
})

describe('Onboarding', () => {
  it('starts at step 1 with the live needle on the defaults', async () => {
    const t = await renderPage('Onboarding')
    expect(t).toContain('Step 1 of 4: About you')
    expect(t).toContain('How old are you?')
    expect(t).toContain('Risk Capacity so far')
    // Defaults: max loss = 30% of €10,000 → G4 = 3,000 / (0.5 · 10,000) = 0.60×, which binds before the 1.0× borrowing rule
    expect(t).toContain('0.60×')
    expect(t).toContain('Limited by the most you said you could lose in a bad year (€3,000).')
  })

  it('the needle follows saved answers', async () => {
    const t = await renderPage('Onboarding', { active: 'mine', answers: { maxLossMoney: 4000 } })
    expect(t).toContain('0.80×')
  })
})

describe('Landing', () => {
  it('hero, CTAs, steps, personas and research line', async () => {
    const t = await renderPage('Landing')
    expect(t).toContain('Your biggest asset is your future salary. Is your portfolio built for it?')
    expect(t).toContain('Start (3 minutes)')
    expect(t).toContain('Try a demo person')
    for (const name of ['Sofie', 'Mads', 'Lea', 'Jonas']) expect(t).toContain(name)
    expect(t).toContain('Ayres & Nalebuff (2010)')
  })
})

describe('Portfolio (Phase 4 acceptance: section 9 numbers)', () => {
  it.each([
    ['sofie', '1.01×', '1.50×', 'Too little risk', '€4,750', '(47.5%)', 'within the €8,000'],
    ['mads', '0.20×', '1.20×', 'Too little risk', '€2,500', '(10.0%)', 'within the €15,000'],
    ['lea', '0.81×', '0.34×', 'Too much risk', '€15,880', '(39.7%)', 'within the €20,000'],
    ['jonas', '2.39×', '0.67×', 'Too much risk', '€9,000', '(60.0%)', 'more than the €5,000'],
  ] as const)('%s: actual %s vs target %s, %s, crash loss %s', async (id, actual, target, status, loss, pct, limit) => {
    const t = await renderPage('Portfolio', { active: id, answers: {} })
    expect(t).toContain(`Now ${actual}`)
    expect(t).toContain(`Target ${target}`)
    expect(t).toContain(status)
    expect(t).toContain(`could lose ${loss} ${pct}`)
    expect(t).toContain(limit)
    expect(t).not.toContain('adds up to') // demo totals equal F: no mismatch banner
  })

  it("Sofie: Apple alert 14.4% with sources, and 15.0% VWCE/CNDX overlap", async () => {
    const t = await renderPage('Portfolio', { active: 'sofie', answers: {} })
    expect(t).toContain('Apple 14.4%: direct 10.0% + VWCE 1.8% + CNDX 2.6%')
    expect(t).toContain('Over 10%')
    expect(t).toContain('VWCE and CNDX share 15.0% of their top holdings')
    expect(t).toContain('VWCE + CNDX')
    expect(t).toContain('Online broker')
    expect(t).toContain('Crypto exchange')
  })

  it('Lea: finance job and finance-heavy stocks are flagged', async () => {
    const t = await renderPage('Portfolio', { active: 'lea', answers: {} })
    expect(t).toContain('Your salary also depends on financials')
  })

  it('"My answers" without answers asks for onboarding first', async () => {
    const t = await renderPage('Portfolio')
    expect(t).toContain('answer the 16 questions')
    expect(t).toContain('Quick entry')
  })
})

describe('Portfolio quick entry', () => {
  it('"My answers" + quick entry: analysis and the mismatch banner', async () => {
    const t = await renderPage('Portfolio', { active: 'mine', answers: { investableAssets: 10000 } }, { globalEquity: 6000, cash: 6000 })
    expect(t).toContain('€12,000')
    expect(t).toContain('Use €12,000 as my invested amount')
    expect(t).toContain('My portfolio (quick entry)')
  })
  it('no banner within 5%', async () => {
    const t = await renderPage('Portfolio', { active: 'mine', answers: { investableAssets: 10000 } }, { globalEquity: 10400 })
    expect(t).not.toContain('as my invested amount')
  })
})
