import { defineConfig, devices } from '@playwright/test';

const PORT = 4300;
const BASE_URL = `http://127.0.0.1:${PORT}`;

/**
 * Performance budgets (P-N2): Core Web Vitals of the key pages on a throttled mid-range phone profile, measured
 * against the optimised `performance` build (production optimisation with the dev-only mock adapter, output
 * `dist/atlas-performance`, never deployed). Run with `npm run e2e:performance`.
 */
export default defineConfig({
  testDir: './e2e/performance',
  fullyParallel: false,
  // One page at a time, so parallel work does not distort CPU-throttled timings.
  workers: 1,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: BASE_URL, trace: 'on-first-retry' },
  projects: [{ name: 'mobile-chromium', use: { ...devices['Pixel 7'] } }],
  webServer: {
    command: `node scripts/serve-static.mjs dist/atlas-performance/browser ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env['CI'],
  },
});
