import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  MOCK_LATENCY_MS,
  providePlanTesting,
  SAMPLE_GOAL_ID,
  type MockMode,
} from '../../core/data-access/testing/plan-testing';
import { DimensionsStore } from './data-access/dimensions.store';
import { DimensionDetailPage } from './dimension-detail-page';

const text = (element: Element | null | undefined) =>
  element?.textContent?.replace(/\s+/g, ' ').trim();

describe('DimensionDetailPage', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  async function render(dimension: string, mode: MockMode = 'sample') {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), ...providePlanTesting(mode), DimensionsStore],
    });
    const fixture = TestBed.createComponent(DimensionDetailPage);
    fixture.componentRef.setInput('dimension', dimension);
    fixture.detectChanges();
    for (let i = 0; i < 4; i++) {
      TestBed.tick();
      await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
    }
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows the Career Destination with its next step', async () => {
    const root = await render('career');

    expect(text(root.querySelector('h1'))).toBe('Career');
    expect(text(root.querySelector('atlas-breadcrumbs'))).toContain('Life Dimensions');
    expect(text(root.querySelector('.destination h2'))).toBe(
      'Complete an online Master’s degree in Computer Science / AI',
    );
    expect(root.querySelector('a[aria-label^="Destination details"]')?.getAttribute('href')).toBe(
      `/destinations/${SAMPLE_GOAL_ID}`,
    );
    expect(text(root.querySelector('#atlas-dimension-next'))).toBe('One next step');
    expect(
      root.querySelector('a[aria-label="Add intention for Career"]')?.getAttribute('href'),
    ).toBe('/destinations?create=CAREER');
    expect(text(root)).toContain('Progress reflects completed Steps, not a life score.');
  });

  it('invites an intention for a dimension without Destinations', async () => {
    const root = await render('health');

    expect(text(root.querySelector('h1'))).toBe('Health');
    expect(text(root.querySelector('atlas-feedback-state h2'))).toBe('No Health Destinations yet');
    expect(root.querySelector('#atlas-dimension-next')).toBeNull();
  });

  it('explains an unknown dimension', async () => {
    const root = await render('wealth');

    expect(text(root.querySelector('h1'))).toBe('Life Dimension not found');
    expect(root.querySelector('a[href="/dimensions"]')).not.toBeNull();
  });
});
