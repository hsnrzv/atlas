import { defineConfig, devices } from '@playwright/test';

const PORT = 4200;
const BASE_URL = `http://localhost:${PORT}`;

/**
 * Smoke, accessibility and user-flow checks against the dev server: Chromium at desktop and mobile size, plus
 * Firefox and WebKit at desktop size (the phase 5 gate runs flows B–D in all three engines).
 */
export default defineConfig({
  testDir: './e2e',
  // Screenshot comparisons and performance budgets have their own configs (playwright.visual.config.ts,
  // playwright.performance.config.ts).
  testIgnore: ['**/visual/**', '**/performance/**'],
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  // GitHub's Linux runners for public repositories have 4 vCPUs; the tests mostly wait on the browser.
  workers: process.env['CI'] ? 4 : undefined,
  reporter: process.env['CI'] ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
    { name: 'desktop-firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'desktop-webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: `npx ng serve --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
});
