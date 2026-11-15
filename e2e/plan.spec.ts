import { expect, test, type Page } from '@playwright/test';
import { expectNoAxeViolations, expectNoHorizontalOverflow } from './support/a11y';

/** Gate 5: Destinations, Waypoints and Steps (Figma pages 06–08), flows B–D and every page in both themes. */
const GOAL_ID = 'sample-goal-masters';
const GOAL_TITLE = 'Complete an online Master’s degree in Computer Science / AI';
const WAYPOINT = `/destinations/${GOAL_ID}/waypoints/sample-node-submit-application`;
const STEP = `/destinations/${GOAL_ID}/steps/sample-node-draft-statement`;

const h1 = (page: Page) => page.getByRole('main').getByRole('heading', { level: 1 });

test.describe('Destinations, Waypoints and Steps', () => {
  test('flow C: from a Destination down to a Step and back', async ({ page }) => {
    await page.goto('/destinations?mock=sample');
    const main = page.getByRole('main');
    await expect(h1(page)).toHaveText('Choose what matters');

    await main.getByRole('link', { name: GOAL_TITLE, exact: true }).click();
    await expect(h1(page)).toHaveText(GOAL_TITLE);
    await expect(main.getByRole('progressbar', { name: 'Destination progress' })).toHaveAttribute(
      'aria-valuetext',
      /^20% · /,
    );

    await main.getByRole('link', { name: 'Submit application' }).click();
    await expect(page).toHaveURL(new RegExp(`${WAYPOINT}$`));
    await expect(h1(page)).toHaveText('Submit application');
    await expect(page).toHaveTitle('Submit application · Waypoint · IKIGAI ATLAS');

    await main.getByRole('link', { name: 'Draft personal statement' }).click();
    await expect(page).toHaveURL(new RegExp(`${STEP}$`));
    await expect(h1(page)).toHaveText('Draft personal statement');

    await main.getByRole('link', { name: 'Back to Steps' }).click();
    await expect(page).toHaveURL(/\/steps\?/);
    await expect(main.getByRole('heading', { level: 2, name: 'Submit application' })).toBeVisible();
    await expect(main.getByRole('status').filter({ hasText: 'Showing' })).toHaveText(
      'Showing 5 of 5 Steps',
    );
  });

  test('flow B: create a Destination from the sample details', async ({ page }) => {
    await page.goto('/destinations?mock=sample');
    await page.getByRole('button', { name: 'Add destination' }).first().click();

    const dialog = page.getByRole('dialog', { name: 'Create destination' });
    await dialog.getByRole('button', { name: 'Use sample details' }).click();
    const name = await dialog.getByRole('textbox', { name: 'Name' }).inputValue();
    expect(name).not.toBe('');
    await dialog.getByRole('button', { name: 'Create destination' }).click();

    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/\/destinations\/[^/?]+$/);
    await expect(h1(page)).toHaveText(name);
  });

  test('adds and edits a Step on its Waypoint', async ({ page }) => {
    await page.goto(`${WAYPOINT}?mock=sample`);
    const main = page.getByRole('main');
    await expect(h1(page)).toHaveText('Submit application');

    await main.getByRole('button', { name: 'Add Step' }).click();
    const add = page.getByRole('dialog', { name: 'Add Step' });
    await add.getByRole('textbox', { name: 'Title' }).fill('Book a proofreader');
    await add.getByRole('button', { name: 'Save' }).click();
    await expect(add).toBeHidden();
    await expect(main.getByRole('link', { name: 'Book a proofreader' })).toBeVisible();

    await main.getByRole('button', { name: 'Edit Book a proofreader' }).click();
    const edit = page.getByRole('dialog', { name: 'Edit Step' });
    await edit.getByRole('textbox', { name: 'Title' }).fill('Book a proofreader early');
    await edit.getByRole('button', { name: 'Save' }).click();
    await expect(edit).toBeHidden();
    await expect(main.getByRole('link', { name: 'Book a proofreader early' })).toBeVisible();
  });

  test('drills into a nested Waypoint and back', async ({ page }) => {
    await page.goto(`${WAYPOINT}?mock=sample`);
    const main = page.getByRole('main');
    await expect(h1(page)).toHaveText('Submit application');

    await main.getByRole('button', { name: 'Add Waypoint' }).click();
    const add = page.getByRole('dialog', { name: 'Add Waypoint' });
    await add.getByRole('textbox', { name: 'Title' }).fill('Prepare references');
    await add.getByRole('button', { name: 'Save' }).click();
    await expect(add).toBeHidden();

    await main.getByRole('link', { name: 'Prepare references' }).click();
    await expect(h1(page)).toHaveText('Prepare references');
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText(
      'Submit application',
    );

    await main.getByRole('link', { name: 'Back to Submit application' }).click();
    await expect(page).toHaveURL(new RegExp(`${WAYPOINT}$`));
    await expect(h1(page)).toHaveText('Submit application');
  });

  test('flow D: mark a Step complete and see the derived progress', async ({ page }) => {
    await page.goto(`${STEP}?mock=sample`);
    const main = page.getByRole('main');
    await expect(h1(page)).toHaveText('Draft personal statement');

    await main.getByRole('button', { name: 'Mark complete' }).click();
    await expect(
      main.getByText(
        'Draft personal statement marked complete. Submit application is now 60%. Destination progress is now 30%.',
      ),
    ).toBeVisible();
    await expect(main.getByRole('button', { name: 'Reopen Step' })).toBeVisible();

    await main.getByRole('link', { name: 'View updated waypoint' }).click();
    await expect(h1(page)).toHaveText('Submit application');
    await expect(main.getByRole('progressbar', { name: 'Waypoint progress' })).toHaveAttribute(
      'aria-valuetext',
      /^60% · /,
    );
  });

  test('explains why a Step is blocked', async ({ page }) => {
    await page.goto(
      `/destinations/${GOAL_ID}/steps/sample-node-submit-the-application?mock=sample`,
    );
    const main = page.getByRole('main');
    await expect(h1(page)).toHaveText('Submit the application');
    await expect(main.getByRole('button', { name: 'Mark complete' })).toHaveCount(0);
    await expect(main.getByText('Review application checklist').first()).toBeVisible();
  });
});

const PAGES = [
  { path: '/destinations', heading: 'Choose what matters' },
  { path: `/destinations/${GOAL_ID}`, heading: GOAL_TITLE },
  { path: '/waypoints', heading: 'Move toward your goal' },
  { path: WAYPOINT, heading: 'Submit application' },
  { path: '/steps', heading: 'Take the next step' },
  { path: STEP, heading: 'Draft personal statement' },
] as const;

for (const theme of ['light', 'dark'] as const) {
  for (const { path, heading } of PAGES) {
    test(`${path} meets WCAG 2.2 AA without overflow (${theme})`, async ({ page }) => {
      await page.addInitScript((value) => localStorage.setItem('atlas.theme', value), theme);
      await page.goto(`${path}?mock=sample`);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expect(h1(page)).toHaveText(heading);
      await expectNoHorizontalOverflow(page);
      await expectNoAxeViolations(page);
    });
  }
}

for (const path of ['/destinations', '/waypoints', '/steps']) {
  test(`${path} empty state meets WCAG 2.2 AA`, async ({ page }) => {
    await page.goto(`${path}?mock=empty`);
    await expect(page.getByRole('heading', { name: 'No Destinations yet' })).toBeVisible();
    await expectNoAxeViolations(page);
  });
}
