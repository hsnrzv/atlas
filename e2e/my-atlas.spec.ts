import { expect, test, type Page } from '@playwright/test';
import { expectNoAxeViolations, expectNoHorizontalOverflow } from './support/a11y';

/** Gate 4: My Atlas (Figma page 05) in its Overview, Empty, Loading and Error states, both themes. */
const THEMES = ['light', 'dark'] as const;

const STATES = [
  { mode: 'sample', heading: 'Your next chapter.' },
  { mode: 'empty', heading: 'Your next chapter.' },
  { mode: 'loading', heading: 'Opening your Atlas.' },
  { mode: 'error', heading: 'Your plan is still yours.' },
] as const;

const h1 = (page: Page) => page.getByRole('main').getByRole('heading', { level: 1 });

async function openAtlas(page: Page, mode: string, theme?: (typeof THEMES)[number]) {
  if (theme) {
    await page.addInitScript((value) => localStorage.setItem('atlas.theme', value), theme);
  }
  await page.goto(`/atlas?mock=${mode}`);
  if (theme) {
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  }
}

test.describe('My Atlas', () => {
  test('shows the sample plan', async ({ page }) => {
    await openAtlas(page, 'sample');
    const main = page.getByRole('main');

    await expect(h1(page)).toHaveText('Your next chapter.');
    await expect(main.getByText('Sample plan ·')).toBeVisible();
    await expect(
      main.getByRole('heading', {
        name: 'Complete an online Master’s degree in Computer Science / AI',
      }),
    ).toBeVisible();
    await expect(
      main.getByRole('progressbar', { name: 'Destination progress' }).first(),
    ).toHaveAttribute('aria-valuetext', '20% · 2 of 10');
    await expect(main.getByRole('heading', { level: 3, name: 'Submit application' })).toBeVisible();
    await expect(main.getByRole('region', { name: 'At a glance' })).toContainText(
      'Active destination',
    );
    await expect(
      main.getByRole('heading', { level: 3 }).filter({ hasNotText: 'Submit' }),
    ).toHaveCount(7);
    await expect(main.getByText('Confirm programme requirements')).toBeVisible();

    await main.getByRole('link', { name: 'Explore next waypoint' }).click();
    await expect(page).toHaveURL(/\/waypoints$/);
  });

  test('offers the first Destination when there is none', async ({ page }) => {
    await openAtlas(page, 'empty');
    await expect(page.getByRole('heading', { name: 'No Destinations yet' })).toBeVisible();
    await page.getByRole('link', { name: 'Create Destination' }).click();
    await expect(page).toHaveURL(/\/destinations$/);
  });

  test('announces loading', async ({ page }) => {
    await openAtlas(page, 'loading');
    await expect(h1(page)).toHaveText('Opening your Atlas.');
    await expect(page.getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });

  test('shows the error with Retry', async ({ page }) => {
    await openAtlas(page, 'error');
    await expect(page.getByRole('alert')).toContainText('We couldn’t refresh your Atlas');
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  });

  test('keeps the last saved plan when a refresh fails', async ({ page }) => {
    await openAtlas(page, 'refresh-error');
    await expect(h1(page)).toHaveText('Your next chapter.');

    const nav = page.getByRole('navigation', { name: 'Primary' });
    await nav.getByRole('link', { name: 'Destinations' }).click();
    await expect(page).toHaveURL(/\/destinations$/);
    await nav.getByRole('link', { name: 'My Atlas' }).click();

    await expect(h1(page)).toHaveText('Your plan is still yours.');
    await expect(h1(page)).toBeFocused();
    const saved = page.getByRole('region', { name: /Complete an online Master’s degree/ });
    await expect(saved).toContainText('Last saved plan');
    await expect(saved).toContainText('Next: Submit application · December 2026');
  });

  test('keeps focus on the heading when the plan arrives', async ({ page }) => {
    await page.goto('/destinations?mock=sample');
    await page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: 'My Atlas' })
      .click();
    await expect(h1(page)).toHaveText('Your next chapter.');
    await expect(h1(page)).toBeFocused();
  });
});

for (const theme of THEMES) {
  for (const state of STATES) {
    test(`My Atlas ${state.mode} meets WCAG 2.2 AA without overflow (${theme})`, async ({
      page,
    }) => {
      await openAtlas(page, state.mode, theme);
      await expect(h1(page)).toHaveText(state.heading);
      await expectNoHorizontalOverflow(page);
      await expectNoAxeViolations(page);
    });
  }
}

test.describe('My Atlas at tablet width', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('fits without horizontal overflow and meets WCAG 2.2 AA', async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile-chromium',
      'The mobile project covers the phone layout.',
    );
    await openAtlas(page, 'sample');
    await expect(h1(page)).toHaveText('Your next chapter.');
    await expectNoHorizontalOverflow(page);
    await expectNoAxeViolations(page);
  });
});
