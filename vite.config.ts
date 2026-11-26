/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['src/test/setup.ts'],
    // Inline zustand so page tests can give it a test-only useSyncExternalStore (see src/pages/pages.test.tsx).
    server: { deps: { inline: ['zustand'] } },
    coverage: {
      provider: 'v8',
      include: ['src/engine/**/*.ts'],
      exclude: ['src/engine/**/*.test.ts', 'src/engine/test/**'],
      reporter: ['text'],
      thresholds: { lines: 90, functions: 90, branches: 90, statements: 90 },
    },
  },
})
