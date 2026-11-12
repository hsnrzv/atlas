import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  const summary = results.violations.map(
    (v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`,
  );
  expect(summary).toEqual([]);
}

test.describe('design foundation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('renders the brand and token-driven sections', async ({ page }) => {
    await expect(page).toHaveTitle(/IKIGAI ATLAS/);
    await expect(page.getByRole('img', { name: 'IKIGAI ATLAS' }).first()).toBeVisible();
    for (const label of ['Career / Profession', 'Finance', 'Health', 'Love / Partnership']) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }
  });

  test('has no horizontal overflow', async ({ page }) => {
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });

  test('exposes a skip link as the first focus stop', async ({ page }) => {
    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeInViewport();
  });

  test('meets WCAG 2.2 AA (axe) in the light theme', async ({ page }) => {
    await expectNoAxeViolations(page);
  });

  test('meets WCAG 2.2 AA (axe) in the dark theme', async ({ page }) => {
    await page.getByRole('switch', { name: 'Dark theme' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expectNoAxeViolations(page);
  });
});
