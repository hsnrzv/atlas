import { expect, test, type Page } from '@playwright/test';
import { expectNoHorizontalOverflow } from './support/a11y';
import { pressTab } from './support/keyboard';

/**
 * A-1 (phase 7): WCAG 2.2 AA checks that axe cannot make, on every route. Axe, contrast and overflow at
 * 390/768/1440 px in both themes are covered by the page suites; this adds reflow at 320 px (1.4.10), text
 * spacing (1.4.12), a visible and unobscured focus indicator (2.4.7, 2.4.11), forced colours, reduced motion
 * (2.3.3) and touch targets (2.5.8, Figma page 13 asks for 44 px).
 */
const GOAL = '/destinations/sample-goal-masters';
const ROUTES = [
  { path: '/welcome', mock: 'new' },
  { path: '/welcome/setup', mock: 'new' },
  { path: '/atlas', mock: 'sample' },
  { path: '/destinations', mock: 'sample' },
  { path: GOAL, mock: 'sample' },
  { path: `${GOAL}/waypoints/sample-node-submit-application`, mock: 'sample' },
  { path: `${GOAL}/steps/sample-node-draft-statement`, mock: 'sample' },
  { path: '/waypoints', mock: 'sample' },
  { path: '/steps', mock: 'sample' },
  { path: '/journey', mock: 'sample' },
  { path: '/connections', mock: 'sample' },
  { path: '/awards', mock: 'sample' },
  { path: '/dimensions', mock: 'sample' },
  { path: '/dimensions/career', mock: 'sample' },
  { path: '/settings', mock: 'sample' },
  { path: '/settings/companion', mock: 'sample' },
  { path: '/more', mock: 'sample' },
  { path: '/no-such-area', mock: 'sample' },
] as const;

/** Enough stops to pass the shell and reach the page content. */
const MAX_TAB_STOPS = 40;

/** WCAG 1.4.12 values, applied with !important as a user style sheet would. */
const TEXT_SPACING = `
  * { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }
  p { margin-bottom: 2em !important; }
`;

async function open(page: Page, path: string, mock: string): Promise<void> {
  await page.goto(`${path}?mock=${mock}`);
  await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toBeVisible();
}

/** Text that no longer fits its box and is cut off (not ellipsised or scrollable). */
async function clippedText(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('main *, header *, nav *')]
      .filter((element) => {
        const style = getComputedStyle(element);
        const clipsX = ['hidden', 'clip'].includes(style.overflowX);
        const clipsY = ['hidden', 'clip'].includes(style.overflowY);
        if (!(clipsX || clipsY) || style.textOverflow === 'ellipsis') return false;
        if (element.clientWidth <= 1 || element.clientHeight <= 1) return false;
        const hasText = [...element.childNodes].some(
          (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
        );
        return (
          hasText &&
          ((clipsX && element.scrollWidth > element.clientWidth + 1) ||
            (clipsY && element.scrollHeight > element.clientHeight + 1))
        );
      })
      .map((element) => `${element.tagName.toLowerCase()}.${element.className}`),
  );
}

interface FocusStop {
  name: string;
  /** An outline or a box-shadow ring. */
  visible: boolean;
  /** Forced colours drop box-shadow, so only an outline survives there. */
  outline: boolean;
  obscured: boolean;
}

/** Describes the focused element: whether it shows an indicator and whether something covers it. */
async function focusStop(page: Page): Promise<FocusStop | null> {
  return page.evaluate(() => {
    const element = document.activeElement as HTMLElement | null;
    if (!element || element === document.body) return null;
    const style = getComputedStyle(element);
    // Material draws its strong focus indicator as a `::before` border, and focused form fields thicken their
    // outlined border; both are real borders, so they also survive forced colours.
    const indicators = [element, ...element.querySelectorAll(':scope > .mat-focus-indicator')];
    const materialRing = indicators.some((candidate) => {
      const ring = getComputedStyle(candidate, '::before');
      return (
        ring.content !== 'none' &&
        ring.display !== 'none' &&
        parseFloat(ring.borderTopWidth) > 0 &&
        ring.borderTopColor !== 'rgba(0, 0, 0, 0)'
      );
    });
    const focusedField = !!element.closest('.mat-mdc-form-field.mat-focused');
    // Stretched-link cards draw the ring on the card around the focused link.
    let cardRing = false;
    for (let parent = element.parentElement, depth = 0; parent && depth < 4; depth++) {
      const parentStyle = getComputedStyle(parent);
      cardRing ||= parentStyle.outlineStyle !== 'none' && parseFloat(parentStyle.outlineWidth) > 0;
      parent = parent.parentElement;
    }
    const outline =
      (style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0) ||
      materialRing ||
      focusedField ||
      cardRing;
    const visible = outline || style.boxShadow !== 'none';
    element.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    const rect = element.getBoundingClientRect();
    const x = Math.min(Math.max(rect.left + rect.width / 2, 0), innerWidth - 1);
    const y = Math.min(Math.max(rect.top + rect.height / 2, 0), innerHeight - 1);
    const hit = document.elementFromPoint(x, y);
    // A form field's own floating label is part of the control, not something covering it.
    const ownField = element.closest('.mat-mdc-form-field');
    const obscured =
      !!hit && !element.contains(hit) && !hit.contains(element) && !ownField?.contains(hit);
    const name =
      element.getAttribute('aria-label') ??
      element.textContent?.trim().slice(0, 40) ??
      element.tagName.toLowerCase();
    return { name: `${element.tagName.toLowerCase()} "${name}"`, visible, outline, obscured };
  });
}

async function tabThroughPage(page: Page): Promise<FocusStop[]> {
  const stops: FocusStop[] = [];
  for (let index = 0; index < MAX_TAB_STOPS; index++) {
    await pressTab(page);
    const stop = await focusStop(page);
    if (!stop) continue;
    // Focus has wrapped around to the first stop.
    if (stops.length > 1 && stop.name === stops[0].name) break;
    stops.push(stop);
  }
  return stops;
}

for (const { path, mock } of ROUTES) {
  test.describe(`${path} accessibility`, () => {
    test('reflows at 320 px and keeps text with WCAG text spacing', async ({ page }, testInfo) => {
      test.skip(testInfo.project.name === 'mobile-chromium', 'The viewport is set explicitly.');
      await page.setViewportSize({ width: 320, height: 640 });
      await open(page, path, mock);
      await expectNoHorizontalOverflow(page);

      await page.addStyleTag({ content: TEXT_SPACING });
      await expectNoHorizontalOverflow(page);
      expect(await clippedText(page)).toEqual([]);
    });

    test('shows an unobscured focus indicator on every stop', async ({ page }, testInfo) => {
      test.skip(
        testInfo.project.name === 'mobile-chromium',
        'Keyboard checks run at desktop size.',
      );
      await open(page, path, mock);
      const stops = await tabThroughPage(page);
      expect(stops.length).toBeGreaterThan(0);
      const hidden = stops.filter((stop) => !stop.visible).map((stop) => stop.name);
      expect(hidden, 'stops without a focus indicator').toEqual([]);
      const obscured = stops.filter((stop) => stop.obscured).map((stop) => stop.name);
      expect(obscured, 'stops covered by other content').toEqual([]);
    });

    test('keeps focus visible in forced colours', async ({ page, browserName }, testInfo) => {
      test.skip(
        browserName !== 'chromium' || testInfo.project.name === 'mobile-chromium',
        'Only Chromium emulates forced colours.',
      );
      await page.emulateMedia({ forcedColors: 'active' });
      await open(page, path, mock);
      const stops = await tabThroughPage(page);
      expect(stops.length).toBeGreaterThan(0);
      const withoutOutline = stops.filter((stop) => !stop.outline).map((stop) => stop.name);
      expect(withoutOutline, 'stops without an outline').toEqual([]);
    });

    test('stops motion when reduced motion is requested', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await open(page, path, mock);
      await expect
        .poll(() =>
          page.evaluate(
            () =>
              document.getAnimations().filter((animation) => animation.playState === 'running')
                .length,
          ),
        )
        .toBe(0);
    });

    test('gives touch targets at least 44 px', async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'mobile-chromium', 'Touch targets are a mobile check.');
      await open(page, path, mock);
      const small = await page.evaluate(() =>
        [
          ...document.querySelectorAll<HTMLElement>(
            'a[href], button, input, select, textarea, [role="button"], [role="link"], [role="tab"], [role="radio"], [role="checkbox"], [role="switch"], [tabindex="0"]',
          ),
        ]
          .filter((element) => {
            const rect = element.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return false;
            if (element.closest('.atlas-visually-hidden, .atlas-skip-link')) return false;
            // Links inside running text are exempt (2.5.8 "inline").
            if (element.tagName === 'A' && element.closest('p, li > span')) return false;
            // Native inputs inside a Material form field or toggle use the larger field as the target.
            if (
              element.closest(
                '.mat-mdc-form-field, .mat-mdc-slide-toggle, .mdc-radio, .mdc-checkbox',
              )
            )
              return false;
            return rect.width < 43.5 || rect.height < 43.5;
          })
          .map((element) => {
            const rect = element.getBoundingClientRect();
            const name = element.getAttribute('aria-label') ?? element.textContent?.trim();
            return `${element.tagName.toLowerCase()} "${name?.slice(0, 30)}" ${Math.round(rect.width)}×${Math.round(rect.height)}`;
          }),
      );
      expect(small).toEqual([]);
    });
  });
}
