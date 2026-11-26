# Human Capital Copilot
Static Vite + React + TS demo. Full spec: @BUILD_SPEC.md (source of truth).
- Every financial number comes from src/engine (pure, tested). UI never calculates finance.
- All assumptions live in src/engine/assumptions.ts.
- Educational wording only: "Example, not advice". Never buy/sell instructions.
- Work one phase at a time (BUILD_SPEC section 10). Plan first, then build.
- Before saying done: npm test, npm run lint, npm run build must pass.
- After each task: append an entry to prompts/PROMPT_LOG.md (BUILD_SPEC section 13) and 2–5 lines to docs/CHANGELOG.md.
- Ask before adding dependencies outside BUILD_SPEC section 3, and before any git push or GitHub action.
