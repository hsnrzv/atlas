import { expect, test, type Page } from '@playwright/test';

/**
 * A-2: full-page screenshots of the key pages at the mobile and desktop Figma frame widths in both themes.
 * Update baselines after an approved visual change with `npm run e2e:visual -- --update-snapshots`.
 */
const GOAL = '/destinations/sample-goal-masters';
const PAGES = [
  { name: 'design-foundation', path: '/_design', mock: 'sample' },
  { name: 'welcome', path: '/welcome', mock: 'new' },
  { name: 'my-atlas', path: '/atlas', mock: 'sample' },
  { name: 'destinations', path: '/destinations', mock: 'sample' },
  { name: 'destination', path: GOAL, mock: 'sample' },
  { name: 'waypoint', path: `${GOAL}/waypoints/sample-node-submit-application`, mock: 'sample' },
  { name: 'step', path: `${GOAL}/steps/sample-node-draft-statement`, mock: 'sample' },
  { name: 'journey', path: '/journey', mock: 'sample' },
  { name: 'connections', path: '/connections', mock: 'sample' },
  { name: 'awards', path: '/awards', mock: 'sample' },
  { name: 'dimensions', path: '/dimensions', mock: 'sample' },
  { name: 'settings', path: '/settings', mock: 'sample' },
] as const;

const LAYOUTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
] as const;

/** Relative dates ("in 3 months") and the Journey window depend on today. */
const TODAY = new Date('2026-11-16T09:00:00');

async function settle(page: Page, mobile: boolean): Promise<void> {
  await expect(page.locator('main h1, h1').first()).toBeVisible();
  // The shell picks its layout from a breakpoint observer; wait until it matches the viewport.
  const shell = page.locator('atlas-app-shell');
  if ((await shell.count()) > 0) {
    await expect(shell.locator(mobile ? '.bottom-nav' : 'atlas-sidebar')).toBeVisible();
    await expect(shell.locator(mobile ? 'atlas-sidebar' : '.bottom-nav')).toHaveCount(0);
  }
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState('networkidle');
}

for (const layout of LAYOUTS) {
  test.describe(`${layout.name} (${layout.width} px)`, () => {
    test.use({ viewport: { width: layout.width, height: layout.height } });

    for (const theme of ['light', 'dark'] as const) {
      for (const { name, path, mock } of PAGES) {
        test(`${name} in ${theme}`, async ({ page }) => {
          await page.clock.setFixedTime(TODAY);
          await page.emulateMedia({ reducedMotion: 'reduce' });
          await page.addInitScript((value) => localStorage.setItem('atlas.theme', value), theme);
          await page.goto(`${path}?mock=${mock}`);
          await settle(page, layout.width < 768);
          await expect(page).toHaveScreenshot(`${name}-${layout.name}-${theme}.png`, {
            fullPage: true,
          });
        });
      }
    }
  });
}
