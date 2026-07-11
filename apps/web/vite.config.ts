import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))

// Vendored @etricks/* game-shell packages (prebuilt dist) live under
// <repo>/packages/etricks/*. Alias each package name to its built entry so the
// standalone web app resolves them without a pnpm workspace. Their internal
// cross-imports (bare '@etricks/contracts' etc.) resolve through these same
// aliases. See docs/migration for the full vendored-port rationale.
const etricksPkgs = [
  'activity-engine', 'activity-match3', 'aios', 'contracts',
  'game-definition', 'game-shell', 'memory-engine', 'quiz-engine',
]
const alias = etricksPkgs.map((p) => ({
  find: `@etricks/${p}`,
  replacement: resolve(here, `../../packages/etricks/${p}/dist/index.js`),
}))

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: { alias },
  build: { outDir: 'dist', sourcemap: false },
  test: {
    environment: 'node',
    // forks pool: threads/worker_threads crash on Node 24 once the SSR module
    // graph is large (generator tests import the whole games/ + packages graph).
    pool: 'forks',
    poolOptions: { forks: { minForks: 1, maxForks: 4 } },
    testTimeout: 20000,
    hookTimeout: 20000,
    teardownTimeout: 10000,
  },
} as any)
