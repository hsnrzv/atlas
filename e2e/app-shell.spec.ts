import { expect, test, type Page } from '@playwright/test';
import { expectNoAxeViolations, expectNoHorizontalOverflow } from './support/a11y';
import { pressTab } from './support/keyboard';

/** Gate 3: the shell at the three Figma frame widths (page 04) in both themes. */
const LAYOUTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'rail', width: 768, height: 1024 },
  { name: 'sidebar', width: 1440, height: 900 },
] as const;
const THEMES = ['light', 'dark'] as const;

const primaryNav = (page: Page) => page.getByRole('navigation', { name: 'Primary' });

for (const layout of LAYOUTS) {
  test.describe(`app shell at ${layout.width} px (${layout.name})`, () => {
    test.use({ viewport: { width: layout.width, height: layout.height } });

    test.beforeEach(async ({ page }, testInfo) => {
      test.skip(
        testInfo.project.name === 'mobile-chromium' && layout.name !== 'mobile',
        'The mobile project only covers the mobile layout.',
      );
      await page.goto('/');
      await expect(page).toHaveURL(/\/atlas$/);
      await expect(
        page.getByRole('heading', { level: 1, name: 'Your next chapter.' }),
      ).toBeVisible();
    });

    test('renders the landmarks for this layout', async ({ page }) => {
      await expect(page.locator('[data-layout]')).toHaveAttribute('data-layout', layout.name);
      await expect(page.getByRole('banner')).toBeVisible();
      await expect(page.getByRole('main')).toBeVisible();
      await expect(primaryNav(page)).toBeVisible();
      const current = primaryNav(page).locator('[aria-current="page"]');
      await expect(current).toHaveCount(1);
      await expect(current).toHaveAccessibleName('My Atlas');
      await expect(page).toHaveTitle('My Atlas · IKIGAI ATLAS');
    });

    test('starts keyboard navigation with the skip link', async ({ page }) => {
      await pressTab(page);
      const skipLink = page.getByRole('link', { name: 'Skip to main content' });
      await expect(skipLink).toBeFocused();
      await expect(skipLink).toBeInViewport();
      await page.keyboard.press('Enter');
      await expect(page.getByRole('main')).toBeFocused();
      await expect(page).toHaveURL(/\/atlas$/);
    });

    test('moves focus to the new page heading after navigation', async ({ page }) => {
      await primaryNav(page).getByRole('link', { name: 'Destinations' }).click();
      await expect(page).toHaveURL(/\/destinations$/);
      const heading = page.getByRole('heading', { level: 1, name: 'Choose what matters' });
      await expect(heading).toBeFocused();
      await expect(page).toHaveTitle('Destinations · IKIGAI ATLAS');
      await expect(primaryNav(page).locator('[aria-current="page"]')).toHaveAccessibleName(
        'Destinations',
      );
    });

    for (const theme of THEMES) {
      test(`meets WCAG 2.2 AA without horizontal overflow (${theme})`, async ({ page }) => {
        await page.evaluate((value) => localStorage.setItem('atlas.theme', value), theme);
        await page.reload();
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        await expectNoHorizontalOverflow(page);
        await expectNoAxeViolations(page);
      });
    }
  });
}

test.describe('app shell behaviour', () => {
  test('keeps the appearance choice across reloads', async ({ page }) => {
    await page.goto('/atlas');
    await page.getByRole('button', { name: 'Account and appearance' }).click();
    const dark = page.getByRole('menuitemradio', { name: 'Dark' });
    await expect(page.getByRole('menuitemradio', { name: 'Match device' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await dark.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.getByRole('button', { name: 'Account and appearance' }).click();
    await expect(page.getByRole('menuitemradio', { name: 'Dark' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await page.getByRole('menuitemradio', { name: 'Match device' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('reaches the remaining areas through More on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/atlas');
    await primaryNav(page).getByRole('link', { name: 'More' }).click();
    await expect(page).toHaveURL(/\/more$/);
    await expect(page.getByRole('heading', { level: 1, name: 'More of your Atlas' })).toBeFocused();

    await page.getByRole('main').getByRole('link', { name: 'Waypoints' }).click();
    await expect(page).toHaveURL(/\/waypoints$/);
    await expect(primaryNav(page).locator('[aria-current="true"]')).toHaveAccessibleName('More');

    await page.goto('/more');
    await expectNoAxeViolations(page);
    await page.getByRole('link', { name: 'Back to My Atlas' }).click();
    await expect(page).toHaveURL(/\/atlas$/);
  });

  test('shows a not-found page inside the shell', async ({ page }) => {
    await page.goto('/no-such-area');
    await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page).toHaveTitle('Page not found · IKIGAI ATLAS');
    await page.getByRole('main').getByRole('link', { name: 'Go to My Atlas' }).click();
    await expect(page).toHaveURL(/\/atlas$/);
  });
});
