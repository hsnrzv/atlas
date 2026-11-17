import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  MOCK_LATENCY_MS,
  providePlanTesting,
  TEST_ADAPTERS,
  type MockMode,
} from '../../core/data-access/testing/plan-testing';
import { DimensionsStore } from './data-access/dimensions.store';
import { DimensionsPage } from './dimensions-page';

const text = (element: Element | null | undefined) =>
  element?.textContent?.replace(/\s+/g, ' ').trim();

describe.each(TEST_ADAPTERS)('DimensionsPage (%s adapter)', (adapter) => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  async function render(mode: MockMode = 'sample') {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), ...providePlanTesting(mode, adapter), DimensionsStore],
    });
    const fixture = TestBed.createComponent(DimensionsPage);
    fixture.detectChanges();
    for (let i = 0; i < 4; i++) {
      TestBed.tick();
      await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
    }
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows all seven dimensions without a life score', async () => {
    const root = await render();

    expect(text(root.querySelector('h1'))).toBe('Life, in your own direction.');
    expect(root.querySelectorAll('atlas-dimension-card')).toHaveLength(7);
    const career = root.querySelector('a[aria-label="View Career"]');
    expect(career?.getAttribute('href')).toBe('/dimensions/career');
    const health = root.querySelector('a[aria-label="Add intention for Health"]');
    expect(health?.getAttribute('href')).toBe('/destinations?create=HEALTH');
    expect(text(root)).toContain('Progress follows your Destinations, not your worth.');
    expect(text(root)).not.toMatch(/score:/i);
  });

  it('offers an intention for every dimension of an empty Atlas', async () => {
    const root = await render('empty');

    expect(root.querySelectorAll('a[aria-label^="Add intention for "]')).toHaveLength(7);
    expect(text(root)).toContain('No dimension has a Destination yet.');
  });

  it('offers a retry when the dimensions cannot load', async () => {
    const root = await render('error');

    expect(text(root.querySelector('atlas-feedback-state h2'))).toBe(
      'Life Dimensions could not load',
    );
  });
});
