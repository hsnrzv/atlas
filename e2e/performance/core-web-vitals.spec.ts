import { expect, test, type CDPSession, type Page } from '@playwright/test';

/**
 * P-N2: Core Web Vitals budgets (frontend.md §17) for the key pages on a mid-range phone: Chrome DevTools' Fast 4G
 * preset (150 ms round trip, 9 Mbit/s down, 1.5 Mbit/s up) with a 4× CPU slowdown. Total Blocking Time is the lab
 * proxy for INP. Timings include the mock adapter's simulated 400 ms API latency.
 */
const BUDGET = { lcp: 2500, cls: 0.1, tbt: 200 } as const;

const GOAL = '/destinations/sample-goal-masters';
const PAGES = [
  { name: 'Welcome', path: '/welcome?mock=new' },
  { name: 'My Atlas', path: '/atlas' },
  { name: 'Destinations', path: '/destinations' },
  { name: 'Destination', path: GOAL },
  { name: 'Waypoint', path: `${GOAL}/waypoints/sample-node-submit-application` },
  { name: 'Journey', path: '/journey' },
  { name: 'Connections', path: '/connections' },
  { name: 'Awards', path: '/awards' },
  { name: 'Life Dimensions', path: '/dimensions' },
  { name: 'Settings', path: '/settings' },
] as const;

interface Vitals {
  readonly fcp: number;
  readonly lcp: number;
  readonly cls: number;
  readonly tbt: number;
}

/** Collects paint, layout-shift and long-task entries from the first byte on. */
function observeVitals(): void {
  const store = { lcp: 0, cls: 0, longTasks: [] as { start: number; duration: number }[] };
  (window as unknown as { __atlasVitals: typeof store }).__atlasVitals = store;
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      store.lcp = entry.startTime;
    }
  }).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as (PerformanceEntry & {
      value: number;
      hadRecentInput: boolean;
    })[]) {
      if (!entry.hadRecentInput) {
        store.cls += entry.value;
      }
    }
  }).observe({ type: 'layout-shift', buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      store.longTasks.push({ start: entry.startTime, duration: entry.duration });
    }
  }).observe({ type: 'longtask', buffered: true });
}

async function throttle(page: Page): Promise<CDPSession> {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: (9 * 1000 * 1000) / 8,
    uploadThroughput: (1.5 * 1000 * 1000) / 8,
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  return cdp;
}

async function readVitals(page: Page): Promise<Vitals> {
  return page.evaluate(() => {
    const store = (
      window as unknown as {
        __atlasVitals: {
          lcp: number;
          cls: number;
          longTasks: { start: number; duration: number }[];
        };
      }
    ).__atlasVitals;
    const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0;
    const tbt = store.longTasks
      .filter((task) => task.start + task.duration > fcp)
      .reduce((sum, task) => sum + Math.max(0, task.duration - 50), 0);
    return { fcp, lcp: store.lcp, cls: store.cls, tbt };
  });
}

for (const { name, path } of PAGES) {
  test(`${name} stays within the Core Web Vitals budget`, async ({ page }, testInfo) => {
    await page.addInitScript(observeVitals);
    await throttle(page);
    await page.goto(path.includes('mock=') ? path : `${path}?mock=sample`);
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 30_000 });
    await page.waitForLoadState('networkidle');
    // Let late layout shifts and long tasks land before reading the totals.
    await page.waitForTimeout(2000);

    const vitals = await readVitals(page);
    await testInfo.attach('vitals', {
      body: JSON.stringify(vitals, null, 2),
      contentType: 'application/json',
    });
    console.log(
      `${name}: FCP ${Math.round(vitals.fcp)} ms · LCP ${Math.round(vitals.lcp)} ms · ` +
        `TBT ${Math.round(vitals.tbt)} ms · CLS ${vitals.cls.toFixed(3)}`,
    );

    expect.soft(vitals.lcp, 'Largest Contentful Paint (ms)').toBeLessThan(BUDGET.lcp);
    expect.soft(vitals.tbt, 'Total Blocking Time (ms)').toBeLessThan(BUDGET.tbt);
    expect.soft(vitals.cls, 'Cumulative Layout Shift').toBeLessThan(BUDGET.cls);
  });
}
