import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  MOCK_LATENCY_MS,
  providePlanTesting,
  type MockMode,
} from '../../core/data-access/testing/plan-testing';
import { JourneyStore } from './data-access/journey.store';
import { JourneyPage } from './journey-page';

const text = (element: Element | null | undefined) =>
  element?.textContent?.replace(/\s+/g, ' ').trim();

describe('JourneyPage', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  async function render(mode: MockMode = 'sample', inputs: Record<string, string> = {}) {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), ...providePlanTesting(mode), JourneyStore],
    });
    const fixture = TestBed.createComponent(JourneyPage);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
    for (let i = 0; i < 4; i++) {
      TestBed.tick();
      await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
    }
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('places the sample Waypoints in time', async () => {
    const root = await render();

    expect(text(root.querySelector('h1'))).toBe('Journey Overview');
    expect(text(root.querySelector('h2'))).toBe(
      'Complete an online Master’s degree in Computer Science / AI',
    );
    expect(Array.from(root.querySelectorAll('atlas-journey-timeline .title'), text)).toEqual([
      'Submit application',
      'Start studying',
      'Graduate',
    ]);
    expect(Array.from(root.querySelectorAll('.unplaced-title'), text)).toContain(
      'Receive admission decision',
    );
    expect(root.querySelector('atlas-next-waypoint-card')).not.toBeNull();
    const whole = Array.from(root.querySelectorAll('.ranges button')).find(
      (button) => text(button) === 'All, Whole plan',
    );
    expect(whole?.getAttribute('aria-pressed')).toBe('true');
  });

  it('asks the backend for the chosen range only', async () => {
    const root = await render('sample', { range: '3m' });

    expect(Array.from(root.querySelectorAll('atlas-journey-timeline .title'), text)).toEqual([
      'Submit application',
      'Start studying',
    ]);
  });

  it('invites a first plan when nothing is planned', async () => {
    const root = await render('empty');

    expect(text(root.querySelector('atlas-feedback-state h2'))).toBe(
      'Nothing planned in this range',
    );
  });

  it('offers a retry when the Journey cannot load', async () => {
    const root = await render('error');

    expect(text(root.querySelector('atlas-feedback-state h2'))).toBe('Journey could not load');
  });
});
