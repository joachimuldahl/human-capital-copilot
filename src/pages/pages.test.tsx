import type { ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Profile } from '../engine'
import { PERSONAS } from '../data/personas'
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

type Page = 'Landing' | 'Onboarding' | 'Results' | 'Portfolio' | 'Plan' | 'Method'

/** Server-render a page with the given profile state. */
async function renderPage(
  page: Page,
  state: { active: ActiveId; answers: Partial<Profile> } = { active: 'mine', answers: {} },
  quick: Partial<QuickValues> = {},
  url = '/',
) {
  const { useProfileStore } = await import('../store/profileStore')
  const { usePortfolioStore, EMPTY_QUICK } = await import('../store/portfolioStore')
  useProfileStore.setState(state)
  usePortfolioStore.setState({ source: 'demo', quick: { ...EMPTY_QUICK, ...quick } })
  const mod = (await import(`./${page}.tsx`)) as { default: () => ReactElement }
  const Comp = mod.default
  const html = renderToString(
    <MemoryRouter initialEntries={[url]}>
      <Comp />
    </MemoryRouter>,
  )
  // Strip tags so text split across elements can be matched.
  return html.replace(/<!-- -->/g, '').replace(/<[^>]+>/g, ' ').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/\s+/g, ' ')
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
    expect(t).toContain('Your income is mixed (βH 0.20)')
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
  it('starts at step 1 with an estimate that ignores the unanswered step-4 limits', async () => {
    const t = await renderPage('Onboarding')
    expect(t).toContain('Step 1 of 4')
    expect(t).toContain('About you')
    expect(t).toContain('How old are you?')
    expect(t).toContain('Your answers stay in your browser. Nothing is sent anywhere.')
    expect(t).toContain('You can change any answer later.')
    expect(t).toContain('Your risk capacity')
    expect(t).toContain('Estimate')
    expect(t).toContain('Estimate from your answers so far. Your loss limit and the leverage check come in step 4 and can lower this.')
    expect(t).not.toContain('Preliminary')
    // G3 and G4 are pending, so the default loss limit (€3,000 → 0.60×) is not applied and never mentioned.
    expect(t).toContain('1.50×')
    expect(t).not.toContain('0.60×')
    expect(t).toContain('Limited by our 1.5× safety cap.')
    expect(t).not.toMatch(/starting loss limit|you said you could lose|borrowing to invest needs/)
    expect(t).toContain('What drives this')
  })

  it('after Q14 the loss limit applies; still an estimate until Q16', async () => {
    const t = await renderPage('Onboarding', { active: 'mine', answers: { maxLossMoney: 4000 } })
    expect(t).toContain('0.80×')
    expect(t).toContain('Limited by the most you said you could lose in a bad year (€4,000).')
    expect(t).toContain('Estimate from your answers so far.')
  })

  it('after Q14 and Q16: Preliminary (other defaults), no estimate note', async () => {
    const t = await renderPage('Onboarding', { active: 'mine', answers: { maxLossMoney: 4000, knowledgeCheckPassed: false } })
    expect(t).toContain('0.80×')
    expect(t).toContain('Preliminary')
    expect(t).toContain("Based on defaults for 14 questions you haven't answered yet.")
    expect(t).not.toContain('Estimate from your answers so far.')
  })

  it('no Preliminary chip once every question is answered', async () => {
    const t = await renderPage('Onboarding', { active: 'mine', answers: PERSONAS.sofie.profile })
    expect(t).not.toContain('Preliminary')
    expect(t).not.toContain('Estimate')
    expect(t).toContain('1.50×')
  })

  it('one question per screen, each with its own 4-part "Why we ask" card and the method link', async () => {
    const { WHY_WE_ASK } = await import('../content/whyWeAsk')
    const t = await renderPage('Onboarding')
    expect(t.match(/Why we ask/g)).toHaveLength(1)
    expect(t).toContain('QUESTION 1 OF 16')
    expect(t).not.toContain('When do you expect to retire?')
    for (const part of ['Why it matters', 'How we use it', "Your answer's effect", 'Research', 'Read the full method']) expect(t).toContain(part)
    expect(t).toContain('Bodie, Merton & Samuelson (1992); Cocco, Gomes & Maenhout (2005)')
    for (let q = 1 as keyof typeof WHY_WE_ASK; q <= 16; q++) {
      const s = await renderPage('Onboarding', { active: 'mine', answers: {} }, {}, `/onboarding?q=${q}`)
      expect(s).toContain(`QUESTION ${q} OF 16`)
      expect(s).toContain(WHY_WE_ASK[q].research)
    }
  })

  it('?q=7 shows the sector question in step 2', async () => {
    const t = await renderPage('Onboarding', { active: 'mine', answers: {} }, {}, '/onboarding?q=7')
    expect(t).toContain('Step 2 of 4 · Your income')
    expect(t).toContain('Which sector do you work in, or plan to?')
    expect(t).toContain('Salaried private job')
  })

  it('the review screen lists all 16 answers with edit links', async () => {
    const t = await renderPage('Onboarding', { active: 'mine', answers: { age: 30 } }, {}, '/onboarding?q=17')
    expect(t).toContain('Your answers')
    expect(t.match(/ Edit /g)).toHaveLength(16)
    expect(t).toContain('See my result')
  })
})

describe('Method page', () => {
  it('shows Sofie\'s worked example from the engine, the gates and all references', async () => {
    const t = await renderPage('Method')
    expect(t).toContain('w* = 0.8789')
    expect(t).toContain('H = €219,484')
    expect(t).toContain('βH = 0.20')
    expect(t).toContain('= 15.78×')
    expect(t).toContain('final 1.50×')
    for (const s of ['Limits and gates', 'What this model does not do', 'Not investment advice', 'assumption, editable']) expect(t).toContain(s)
    const { REFERENCES } = await import('../content/references')
    expect(REFERENCES).toHaveLength(13)
    for (const r of REFERENCES) expect(t).toContain(r.split('.')[0])
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

describe('Plan (Phase 5 acceptance)', () => {
  it.each([
    ['sofie', ['150.0%', '−50.0%', '€15,000', '−€5,000'], '€7,500', '75.0%'],
    ['mads', ['120.0%', '−20.0%', '€30,000', '−€5,000'], '€15,000', '60.0%'],
    ['lea', ['18.6%', '81.4%'], '€2,745', '6.9%'],
    ['jonas', ['63.4%', '36.6%'], '€4,593', '30.6%'],
  ] as const)('%s: target allocation and crash test at target', async (id, weights, loss, pct) => {
    const t = await renderPage('Plan', { active: id, answers: {} })
    for (const w of weights) expect(t).toContain(w)
    expect(t).toContain(`−${loss}`)
    expect(t).toContain(`${pct} of the portfolio`)
    expect(t).toContain('Example, not advice')
    expect(t).toContain('Changes to make at your own broker')
  })

  it('leverage panel only above 1×: Sofie yes (loan €5,000, €225/yr, 56%), Lea no', async () => {
    const sofie = await renderPage('Plan', { active: 'sofie', answers: {} })
    expect(sofie).toContain('Borrowing to invest')
    expect(sofie).toContain('€225')
    expect(sofie).toContain('Stocks could fall 56% before a margin call.')
    expect(sofie).toContain('Broker loan (recommended)')
    expect(sofie).toContain('about 2.6% a year')
    expect(sofie).toContain('2× daily leveraged S&P 500 ETF')
    const lea = await renderPage('Plan', { active: 'lea', answers: {} })
    expect(lea).not.toContain('Borrowing to invest')
    expect(lea).not.toContain('2× daily leveraged S&P 500 ETF')
  })

  it('gate cards appear for the gate tests', async () => {
    const g1 = await renderPage('Plan', { active: 'mine', answers: { ...PERSONAS.sofie.profile, bufferMonths: 2 } })
    expect(g1).toContain('Build a 3-month buffer first')
    expect(g1).not.toContain('Borrowing to invest') // capped at 1.0×
    const g2 = await renderPage('Plan', { active: 'mine', answers: { ...PERSONAS.sofie.profile, maxDebtRate: 0.09 } })
    expect(g2).toContain('Repay your 9% debt first')
    const none = await renderPage('Plan', { active: 'sofie', answers: {} })
    expect(none).not.toContain('Do this first')
  })

  it('Mads: next savings go to stocks; Assumptions dialog lists the engine values', async () => {
    const t = await renderPage('Plan', { active: 'mads', answers: {} })
    expect(t).toContain('Put your next monthly savings (€688) into stocks (global equity).')
    expect(t).toContain('Increase stocks (global equity) by €25,000.')
    expect(t).toContain('Assumptions')
    expect(t).toContain('policyCap')
    expect(t).toContain('very high 1.75')
  })

  it('empty state without answers', async () => {
    const t = await renderPage('Plan')
    expect(t).toContain('Answer the 16 questions')
  })
})
