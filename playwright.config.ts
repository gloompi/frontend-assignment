import { createHash } from 'node:crypto'
import { defineConfig, devices } from '@playwright/test'

// Each checkout (main or an agent worktree) gets its own stable port, so
// parallel runs never hit another checkout's server by accident.
const port =
  Number(process.env.E2E_PORT) ||
  4200 +
    (createHash('sha1')
      .update(import.meta.dirname)
      .digest()
      .readUInt16BE(0) %
      700)
const baseURL = `http://localhost:${String(port)}`
const isCI = Boolean(process.env.CI)

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: true,
  retries: isCI ? 1 : 0,
  ...(isCI ? { workers: 2 } : {}),
  reporter: isCI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  // e2e always runs against a production build, never the dev server.
  webServer: {
    command: `vite build && vite preview --port ${String(port)} --strictPort`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
