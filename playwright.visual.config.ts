import { defineConfig, devices } from '@playwright/test';
import base from './playwright.config';

/**
 * Visual regression (A-2): screenshots of the key pages in both themes, compared with approved baselines in
 * `e2e/visual/__screenshots__`. The browser always runs in the official Linux Playwright container
 * (`npm run e2e:visual:start`), so fonts and anti-aliasing match on every machine and in CI.
 */
export default defineConfig({
  ...base,
  testDir: './e2e/visual',
  testIgnore: [],
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
      maxDiffPixelRatio: 0.001,
    },
  },
  use: {
    ...base.use,
    connectOptions: {
      wsEndpoint: process.env['PLAYWRIGHT_VISUAL_WS'] ?? 'ws://127.0.0.1:3000/',
      // The browser in the container reaches the dev server on this machine's loopback.
      exposeNetwork: '<loopback>',
    },
  },
  projects: [{ name: 'visual-chromium', use: { ...devices['Desktop Chrome'] } }],
});
