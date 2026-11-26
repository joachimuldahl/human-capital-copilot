/**
 * "Why we ask" text for the 16 onboarding questions (BUILD_SPEC section 16, verbatim). The live effect line comes from the engine.
 * "{minAssets}" is replaced with the borrowing minimum in the chosen currency (€5,000 in EUR).
 */
import type { QuestionNo } from '../engine'

export interface WhyWeAskContent {
  why: string
  how: string
  research: string
}

export const WHY_WE_ASK: Record<QuestionNo, WhyWeAskContent> = {
  1: {
    why: "Your future salary is usually your largest asset when you're young, and it shrinks each year you work. That is the core of lifecycle investing.",
    how: 'Sets how many working years are left in your future-savings calculation (human capital, H) and where you start on the glide path.',
    research: 'Bodie, Merton & Samuelson (1992); Cocco, Gomes & Maenhout (2005)',
  },
  2: {
    why: 'More working years mean more future savings. The option to work longer is itself a buffer against bad markets.',
    how: 'Sets the last year of savings in H, and the 15-year minimum horizon for using a loan.',
    research: 'Bodie, Merton & Samuelson (1992)',
  },
  3: {
    why: "Your target depends on the ratio between today's money (F) and future savings (H). With little invested, small amounts carry your whole future.",
    how: 'F in the formula raw = (w*·F + (w* − βH)·H) / F. It also sizes the loss-limit check and the {minAssets} minimum for borrowing.',
    research: 'Ayres & Nalebuff (2010, 2013)',
  },
  4: {
    why: 'Only what you actually invest reaches your portfolio. Ayres & Nalebuff measure human capital as the present value of future contributions, not total salary.',
    how: 'Multiplies every future salary in H.',
    research: 'Ayres & Nalebuff (2013), "Diversification Across Time"',
  },
  5: {
    why: 'The starting point of your earnings path.',
    how: "Year-1 income in H (net, after tax, in today's money).",
    research: 'Ibbotson, Milevsky, Chen & Zhu (2007)',
  },
  6: {
    why: 'Earnings typically rise steeply early in a career and flatten around mid-career.',
    how: 'Your implied yearly growth (capped at 12% in the calculation) until age 45, then 0.5% a year.',
    research: 'Cocco, Gomes & Maenhout (2005)',
  },
  7: {
    why: "Whether your salary moves with the stock market decides whether it acts like a bond (stable) or a stock (market-linked). A bond-like income lets your portfolio carry more stock risk; a stock-like one means you're already exposed.",
    how: 'Sets βH, the stock-like share of your future savings: public 0.05 … founder 0.65. These are our model assumptions, set conservatively; average empirical correlations are low.',
    research: 'Ibbotson et al. (2007); Benzoni, Collin-Dufresne & Goldstein (2007)',
  },
  8: {
    why: 'Bonuses, commission and share options usually fall exactly when markets fall.',
    how: 'Adds 0.3 × your variable share to βH (max 0.9).',
    research: 'Ibbotson et al. (2007)',
  },
  9: {
    why: 'Riskier income is worth less today, just as a risky bond is priced lower than a safe one.',
    how: 'Sets the discount rate for H: real risk-free rate 1% + a spread of 1–4.5%.',
    research: 'Ibbotson et al. (2007); Viceira (2001)',
  },
  10: {
    why: 'Without a cash buffer, a job loss could force you to sell investments at the worst moment.',
    how: 'Gate G1: under 3 months caps your target at 1.0× and makes "build a buffer" step 1 of your plan.',
    research: 'Common financial-planning guideline (3–6 months of expenses)',
  },
  11: {
    why: 'Repaying debt that costs more than investments are expected to earn is a guaranteed, risk-free return.',
    how: 'Gate G2: any debt above 7% caps your target at 1.0×. Our expected stock return assumption is 7.5% a year.',
    research: 'Standard debt-vs-invest comparison; our assumptions are on the Method page',
  },
  12: {
    why: "What you'd actually do in a crash matters more than how brave you feel. Selling after a fall locks in losses.",
    how: 'Half of your risk-attitude score, which sets risk aversion (γ) and your share of total wealth in stocks (w* = premium / (γ·σ²)).',
    research: 'Grable & Lytton (1999); Merton (1969)',
  },
  13: {
    why: 'A classic economics question that measures risk aversion from choices about your own income.',
    how: 'The other half of your risk-attitude score (γ).',
    research: 'Barsky, Juster, Kimball & Shapiro (1997)',
  },
  14: {
    why: 'Willingness (Q12–13) and capacity to bear losses are different things. This is your capacity, in money.',
    how: 'Gate G4: your target is capped so that a 50% stock-market fall never costs more than this amount.',
    research: 'ESMA guidelines on MiFID II suitability requirements (ability to bear losses)',
  },
  15: {
    why: "Inexperienced investors overestimate their tolerance until they've lived through a fall.",
    how: 'With no experience and no passed knowledge check, risk attitude is capped at "moderate".',
    research: 'ESMA guidelines on MiFID II suitability (knowledge and experience)',
  },
  16: {
    why: 'Borrowing to invest amplifies both gains and losses, and leveraged ETFs lose value in volatile markets. You should understand that before using either.',
    how: 'Gate G3: leverage above 1.0× needs all 3 answers right, an explicit opt-in, 15+ years to retirement and {minAssets}+ invested. Even then we cap at 1.5× (Ayres & Nalebuff use 2.0×).',
    research: 'Ayres & Nalebuff (2010); Cheng & Madhavan (2009)',
  },
}

/** Question 0, currency (BUILD_SPEC 18.1). */
export const CURRENCY_WHY: WhyWeAskContent = {
  why: "So every amount is in money you think in. It doesn't change your result: the model works with ratios, and every threshold is converted at the same rate.",
  how: 'Formats every amount, and converts our euro-based demo data, defaults and the {minAssets} borrowing minimum at fixed ECB reference rates.',
  research: 'ECB euro reference rates (see the Method page for the date and source)',
}
