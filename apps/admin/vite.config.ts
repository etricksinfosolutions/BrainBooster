/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5174 },
  // The repo is an npm workspace, so react/react-dom can hoist to two locations.
  // Dedupe pins a single instance (otherwise React throws "invalid hook call").
  resolve: { dedupe: ['react', 'react-dom'] },
  build: { outDir: 'dist', sourcemap: false },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
