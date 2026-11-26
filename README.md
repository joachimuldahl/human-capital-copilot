# Human Capital Copilot

**Live demo:** https://building-your-wealth.vercel.app/

Your biggest asset is usually your future salary. Human Capital Copilot sizes your investment risk to your whole life, not just today's portfolio. If your income is safe and bond-like, your portfolio can carry more stock-market risk. If your income already moves with the markets (finance, founders), it should carry less. Sixteen questions become one number, **Risk Capacity**: risk as a multiple of the global stock market (for example 1.50×). The app explains that number, compares it with your actual portfolio and shows a plan with a crash test.

> Educational demo. Not investment advice. Data is illustrative.

## Features

- **Onboarding:** 16 questions in 4 steps, each with a "Why we ask" note and a live needle that updates on every answer. Includes a knowledge check before borrowing can be switched on.
- **Results:** Risk Capacity with the limit that applies, four drivers (risk attitude, human capital, income type, limits), lifetime balance sheet, glide path to retirement and what-if sliders.
- **Portfolio:** demo portfolio or quick entry; risk fit (actual vs target), 2008-style crash test against your own loss limit, and ETF look-through by asset class, region, sector, single-company concentration and ETF overlap.
- **Plan:** safety gates (emergency buffer, expensive debt), gold and crypto satellites, target vs current allocation, example products ("Example, not advice"), crash test now vs target, borrowing panel with margin buffer and leveraged-ETF warning, and the steps to get there.
- **Four demo people** (Sofie, Mads, Lea, Jonas) to explore without typing anything.
- Every number comes from a deterministic, unit-tested engine (`src/engine`). No AI-generated numbers; explanations are templates filled with engine results.

## Run locally

Requires Node 20.9 or newer.

```
npm install
npm run dev        # http://localhost:5173
npm test           # unit and page tests
npm run coverage   # engine coverage
npm run lint
npm run build
```

Stack: Vite + React + TypeScript (strict), Tailwind CSS, React Router (HashRouter), Recharts, Zustand (state saved in the browser), Vitest. No backend, no login.

## Project layout

- `src/engine/`: pure financial functions, all assumptions (`assumptions.ts`) and explanation templates
- `src/data/`: illustrative demo data (personas, products, ETF look-through, demo portfolios)
- `src/store/`: persisted Zustand stores
- `src/pages/`, `src/components/`: the UI
- `BUILD_SPEC.md`: the full specification (source of truth)
- `docs/Application-Description.md`: the description document
- `prompts/`: every prompt used to build the app (`PROMPT_LOG_AUTO.md` verbatim, `PROMPT_LOG.md` with what the AI did per task)

## Team

Jens, Damien and Joachim (CBS team assignment).

## Research basis

Ayres & Nalebuff (2010), *Lifecycle Investing*; Ibbotson, Milevsky, Chen & Zhu (2007), *Lifetime Financial Advice*; Merton (1969); Samuelson (1969).

## Disclaimer

Educational demo, not investment advice. Product data, tickers and ETF holdings are illustrative until verified against factsheets. The app never places orders.
