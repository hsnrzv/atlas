import { expect, test } from '@playwright/test';
import { expectNoAxeViolations, expectNoHorizontalOverflow } from './support/a11y';

test.describe('design foundation (/_design)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/_design');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('renders the brand, token-driven sections and shared UI', async ({ page }) => {
    await expect(page).toHaveTitle('Design foundation · IKIGAI ATLAS');
    await expect(page.getByRole('img', { name: 'IKIGAI ATLAS' }).first()).toBeVisible();
    for (const label of ['Career / Profession', 'Finance', 'Health', 'Love / Partnership']) {
      await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
    }
    await expect(page.getByRole('progressbar', { name: 'Destination progress' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible();
  });

  test('has no horizontal overflow', async ({ page }) => {
    await expectNoHorizontalOverflow(page);
  });

  test('exposes a skip link as the first focus stop that focuses main', async ({ page }) => {
    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
    await expect(page).toHaveURL(/\/_design$/);
  });

  test('opens the popover and returns focus on Escape', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'How progress works' });
    await trigger.click();
    await expect(page.getByRole('dialog', { name: 'How progress works' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(trigger).toBeFocused();
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
