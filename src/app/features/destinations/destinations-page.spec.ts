import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  MOCK_LATENCY_MS,
  providePlanTesting,
  TEST_ADAPTERS,
  type MockMode,
} from '../../core/data-access/testing/plan-testing';
import { DestinationsStore } from './data-access/destinations.store';
import { DestinationsPage } from './destinations-page';

const text = (element: Element | null | undefined) =>
  element?.textContent?.replace(/\s+/g, ' ').trim();

describe.each(TEST_ADAPTERS)('DestinationsPage (%s adapter)', (adapter) => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  async function render(mode: MockMode = 'sample', inputs: Record<string, string> = {}) {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), ...providePlanTesting(mode, adapter), DestinationsStore],
    });
    const fixture = TestBed.createComponent(DestinationsPage);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
    for (let i = 0; i < 3; i++) {
      TestBed.tick();
      await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
    }
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('lists the Destinations with their context', async () => {
    const root = await render();

    expect(text(root.querySelector('h1'))).toBe('Choose what matters');
    expect(Array.from(root.querySelectorAll('atlas-destination-card h3'), text)).toEqual([
      'Complete an online Master’s degree in Computer Science / AI',
    ]);
    expect(text(root.querySelector('[role="status"]'))).toMatch(/1 Destination/);
    expect(text(root.querySelector('#atlas-destination-context'))).toBe('Destination context');
  });

  it('shows a way back when nothing matches the search', async () => {
    const root = await render('sample', { q: 'marathon' });

    expect(text(root.querySelector('atlas-feedback-state h2'))).toBe('No Destinations match');
    expect(text(root.querySelector('atlas-feedback-state button'))).toBe('Clear filters');
  });

  it('invites the first Destination when there are none', async () => {
    const root = await render('empty');

    expect(text(root.querySelector('atlas-feedback-state h2'))).toBe('No Destinations yet');
    expect(text(root.querySelector('atlas-feedback-state button'))).toBe('Add destination');
  });

  it('offers a retry when the list cannot load', async () => {
    const root = await render('error');

    expect(text(root.querySelector('atlas-feedback-state h2'))).toBe('Destinations could not load');
    expect(text(root.querySelector('atlas-feedback-state button'))).toBe('Retry');
  });

  it('opens Create destination with the Life Dimension from ?create=', async () => {
    await render('sample', { create: 'HEALTH' });
    await vi.advanceTimersByTimeAsync(500);

    const dialog = document.querySelector('atlas-goal-form-dialog');
    expect(text(dialog?.querySelector('h2'))).toBe('Create destination');
    expect(text(dialog?.querySelector('mat-select .mat-mdc-select-value'))).toBe('Health');
  });
});
