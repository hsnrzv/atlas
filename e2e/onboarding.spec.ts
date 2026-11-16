import { expect, test, type Page } from '@playwright/test';
import { expectNoAxeViolations, expectNoHorizontalOverflow } from './support/a11y';

/** Gate 6, flow A: a new person reaches My Atlas through Welcome and the optional setup (Figma pages 03 and 15). */
const h1 = (page: Page) => page.getByRole('heading', { level: 1 });

test.describe('onboarding', () => {
  test('flow A: Welcome, setup and an empty My Atlas', async ({ page }) => {
    await page.goto('/?mock=new');
    await expect(page).toHaveURL(/\/welcome$/);
    await expect(h1(page)).toHaveText('Your life, mapped with purpose.');
    await expect(page).toHaveTitle('Welcome · IKIGAI ATLAS');

    await page.getByRole('link', { name: 'Get started' }).click();
    await expect(page).toHaveURL(/\/welcome\/setup$/);
    await expect(h1(page)).toHaveText('A little direction. Your pace.');

    const career = page.getByRole('option', { name: 'Career' });
    await career.click();
    await expect(career).toHaveAttribute('aria-selected', 'true');
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page).toHaveURL(/\/atlas$/);
    await expect(page.getByRole('heading', { name: 'No Destinations yet' })).toBeVisible();

    await page.goto('/');
    await expect(page).toHaveURL(/\/atlas$/);
  });

  test('flow A: explore the sample plan from Welcome', async ({ page }) => {
    await page.goto('/welcome?mock=new');
    await page.getByRole('button', { name: 'Explore sample plan' }).click();
    await expect(page).toHaveURL(/\/atlas$/);
    await expect(h1(page)).toHaveText('Your next chapter.');
    await expect(page.getByRole('heading', { name: 'No Destinations yet' })).toHaveCount(0);
  });

  test('skips setup and keeps it reachable from Settings', async ({ page }) => {
    await page.goto('/welcome?mock=new');
    await page.getByRole('button', { name: 'Skip for now' }).click();
    await expect(page).toHaveURL(/\/atlas$/);
  });

  for (const theme of ['light', 'dark'] as const) {
    for (const { path, heading } of [
      { path: '/welcome', heading: 'Your life, mapped with purpose.' },
      { path: '/welcome/setup', heading: 'A little direction. Your pace.' },
    ]) {
      test(`${path} meets WCAG 2.2 AA without overflow (${theme})`, async ({ page }) => {
        await page.addInitScript((value) => localStorage.setItem('atlas.theme', value), theme);
        await page.goto(`${path}?mock=new`);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        await expect(h1(page)).toHaveText(heading);
        await expectNoHorizontalOverflow(page);
        await expectNoAxeViolations(page);
      });
    }
  }
});
