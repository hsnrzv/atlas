import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** No finite animation may run for this long, so content that arrives with the data has finished entering. */
const QUIET_MS = 500;

/**
 * Lets finite CSS animations and transitions settle, so contrast is not measured halfway through a theme change or
 * an enter animation (for example the companion card, which mounts only when the plan has loaded).
 */
async function settleAnimations(page: Page): Promise<void> {
  await page.evaluate(async (quietMs) => {
    const busy = () =>
      document
        .getAnimations()
        .some(
          (animation) =>
            animation.playState === 'running' &&
            animation.effect?.getTiming().iterations !== Infinity,
        );
    let quietSince = performance.now();
    while (performance.now() - quietSince < quietMs) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      if (busy()) quietSince = performance.now();
    }
  }, QUIET_MS);
}

const ARIA_ELEMENT_REFLECTION = [
  'ariaActiveDescendantElement',
  'ariaControlsElements',
  'ariaDescribedByElements',
  'ariaDetailsElements',
  'ariaErrorMessageElements',
  'ariaFlowToElements',
  'ariaLabelledByElements',
  'ariaOwnsElements',
];

/**
 * Playwright's Firefox build crashes the page when axe reads ARIA element reflection
 * (`ariaLabelledByElements`) on Angular Material selects. The app never uses these properties, so
 * hiding them lets axe resolve the same `aria-*` id references from the attributes instead.
 */
async function hideAriaElementReflection(page: Page): Promise<void> {
  if (page.context().browser()?.browserType().name() !== 'firefox') return;
  await page.evaluate((props) => {
    for (const prop of props) {
      Object.defineProperty(Element.prototype, prop, { configurable: true, get: () => null });
    }
  }, ARIA_ELEMENT_REFLECTION);
}

export async function expectNoAxeViolations(page: Page): Promise<void> {
  await settleAnimations(page);
  await hideAriaElementReflection(page);
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  const summary = results.violations.map(
    (v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`,
  );
  expect(summary).toEqual([]);
}

export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
}
