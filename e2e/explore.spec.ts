import { expect, test, type Page } from '@playwright/test';
import { expectNoAxeViolations, expectNoHorizontalOverflow } from './support/a11y';

/** Gate 6: Journey, Connections, Milestone Awards and Life Dimensions (Figma pages 09–12), flows E–H. */
const GOAL_ID = 'sample-goal-masters';
const GOAL_TITLE = 'Complete an online Master’s degree in Computer Science / AI';
const WAYPOINT = `/destinations/${GOAL_ID}/waypoints/sample-node-submit-application`;
const step = (id: string) => `/destinations/${GOAL_ID}/steps/sample-node-${id}`;

const h1 = (page: Page) => page.getByRole('main').getByRole('heading', { level: 1 });
/** Below 768 px the Journey shows its agenda and Connections its list instead of the visualisations. */
const isCompact = (page: Page) => (page.viewportSize()?.width ?? 0) < 768;

test.describe('Journey, Connections, Awards and Life Dimensions', () => {
  test('flow E: from a Journey marker to its Waypoint', async ({ page }) => {
    await page.goto('/journey?mock=sample');
    const main = page.getByRole('main');
    await expect(h1(page)).toHaveText('Journey Overview');

    const marker = isCompact(page)
      ? main.getByRole('link', { name: 'Open Waypoint Submit application' })
      : main.getByRole('link', { name: /^Submit application, / });
    await marker.click();
    await expect(page).toHaveURL(new RegExp(`${WAYPOINT}$`));
    await expect(h1(page)).toHaveText('Submit application');
  });

  test('flow F: read the Finance relationship in Connections', async ({ page }) => {
    await page.goto('/connections?mock=sample');
    const main = page.getByRole('main');
    await expect(h1(page)).toHaveText('Connections');

    const finance = isCompact(page)
      ? main.getByRole('button', { name: 'Read Finance relationship' })
      : main.getByRole('button', { name: /^Finance, / });
    await finance.click();
    const panel = main.getByRole('complementary');
    await expect(panel).toContainText('Selected relationship · Finance');
    await expect(panel).toContainText('Potential financial effect');
    await expect(panel).toContainText('No amount provided');

    await panel.getByRole('link', { name: 'Review relationship' }).first().click();
    await expect(page).toHaveURL(new RegExp(`/destinations/${GOAL_ID}$`));
    await expect(h1(page)).toHaveText(GOAL_TITLE);
  });

  test('flow G: completing the application Steps celebrates the Waypoint', async ({ page }) => {
    await page.goto('/awards?mock=sample');
    const main = page.getByRole('main');
    await expect(h1(page)).toHaveText('Milestone Awards');
    await expect(main.getByText('0 Earned')).toBeVisible();

    for (const id of ['draft-statement', 'review-checklist', 'submit-the-application']) {
      await page.evaluate((path) => {
        history.pushState(null, '', path);
        dispatchEvent(new PopStateEvent('popstate'));
      }, step(id));
      await main.getByRole('button', { name: 'Mark complete' }).click();
      await expect(main.getByRole('button', { name: 'Reopen Step' })).toBeVisible();
    }

    await page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: /Awards/ })
      .click();
    await expect(h1(page)).toHaveText('Milestone Awards');
    await expect(main.getByRole('heading', { name: 'A meaningful step forward' })).toBeVisible();
    await expect(main.getByText('Submit application is complete.')).toBeVisible();
    await expect(
      main.getByText('No points. Graduation celebration remains planned.'),
    ).toBeVisible();
  });

  test.describe('on mobile', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('flow H: More, Life Dimensions, Career and its Destination', async ({ page }) => {
      await page.goto('/atlas?mock=sample');
      await page
        .getByRole('navigation', { name: 'Primary' })
        .getByRole('link', { name: 'More' })
        .click();
      await expect(page).toHaveURL(/\/more$/);

      const main = page.getByRole('main');
      await main.getByRole('link', { name: 'Life Dimensions' }).click();
      await expect(h1(page)).toHaveText('Life, in your own direction.');

      await main.getByRole('link', { name: 'View Career' }).click();
      await expect(page).toHaveURL(/\/dimensions\/career$/);
      await expect(h1(page)).toHaveText('Career');

      await main.getByRole('link', { name: GOAL_TITLE }).first().click();
      await expect(page).toHaveURL(new RegExp(`/destinations/${GOAL_ID}$`));
      await expect(h1(page)).toHaveText(GOAL_TITLE);
    });
  });
});

const PAGES = [
  { path: '/journey', heading: 'Journey Overview' },
  { path: '/connections', heading: 'Connections' },
  { path: '/awards', heading: 'Milestone Awards' },
  { path: '/dimensions', heading: 'Life, in your own direction.' },
  { path: '/dimensions/career', heading: 'Career' },
  { path: '/settings', heading: 'Settings' },
] as const;

const LAYOUTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'rail', width: 768, height: 1024 },
  { name: 'sidebar', width: 1440, height: 900 },
] as const;

for (const layout of LAYOUTS) {
  test.describe(`at ${layout.width} px`, () => {
    test.use({ viewport: { width: layout.width, height: layout.height } });

    for (const theme of ['light', 'dark'] as const) {
      for (const { path, heading } of PAGES) {
        test(`${path} meets WCAG 2.2 AA without overflow (${theme})`, async ({
          page,
        }, testInfo) => {
          test.skip(
            testInfo.project.name !== 'desktop-chromium' && layout.name !== 'sidebar',
            'Other projects cover the desktop layout; Chromium covers every width.',
          );
          await page.addInitScript((value) => localStorage.setItem('atlas.theme', value), theme);
          await page.goto(`${path}?mock=sample`);
          await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
          await expect(h1(page)).toHaveText(heading);
          await expectNoHorizontalOverflow(page);
          await expectNoAxeViolations(page);
        });
      }
    }
  });
}

for (const path of ['/journey', '/connections', '/awards', '/dimensions']) {
  test(`${path} empty state meets WCAG 2.2 AA`, async ({ page }) => {
    await page.goto(`${path}?mock=empty`);
    await expect(h1(page)).toBeVisible();
    await expect(page.getByRole('main').getByRole('heading', { level: 2 }).first()).toBeVisible();
    await expectNoAxeViolations(page);
  });
}
