import type { Page } from '@playwright/test';

/**
 * Moves focus to the next stop like a keyboard user. WebKit follows the macOS default, where Tab
 * skips links unless Option is held, so links are reached with Alt+Tab there.
 */
export async function pressTab(page: Page): Promise<void> {
  const isWebKit = page.context().browser()?.browserType().name() === 'webkit';
  await page.keyboard.press(isWebKit ? 'Alt+Tab' : 'Tab');
}
