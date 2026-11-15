import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { GoalPlanStore } from '../../core/data-access/goal-plan.store';
import {
  MOCK_LATENCY_MS,
  providePlanTesting,
  type MockMode,
} from '../../core/data-access/testing/plan-testing';
import { PlanEditor } from '../../core/plan/plan-editor';
import { WaypointsPage } from './waypoints-page';

const text = (element: Element | null | undefined) =>
  element?.textContent?.replace(/\s+/g, ' ').trim();

describe('WaypointsPage', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  async function render(mode: MockMode = 'sample', destination?: string) {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), ...providePlanTesting(mode), GoalPlanStore, PlanEditor],
    });
    const fixture = TestBed.createComponent(WaypointsPage);
    fixture.componentRef.setInput('destination', destination);
    fixture.detectChanges();
    for (let i = 0; i < 5; i++) {
      TestBed.tick();
      await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
    }
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows the route of the first Destination when none is chosen', async () => {
    const root = await render();

    expect(text(root.querySelector('h1'))).toBe('Move toward your goal');
    expect(text(root.querySelector('#atlas-waypoints-destination'))).toBe(
      'Complete an online Master’s degree in Computer Science / AI',
    );
    expect(text(root.querySelector('#atlas-waypoints-route'))).toMatch(/major Waypoints$/);
    expect(text(root.querySelector('atlas-waypoint-route'))).toContain('Submit application');
    expect(text(root.querySelector('#atlas-next-focus'))).toBe('Next focus');
  });

  it('invites the first Destination when there are none', async () => {
    const root = await render('empty');

    expect(text(root.querySelector('atlas-feedback-state h2'))).toBe('No Destinations yet');
  });

  it('explains when the chosen Destination does not exist', async () => {
    const root = await render('sample', 'missing-goal');

    expect(text(root.querySelector('atlas-feedback-state h2'))).toBe(
      'This Destination is not in your Atlas',
    );
  });

  it('offers a retry when the plan cannot load', async () => {
    const root = await render('error');

    expect(text(root.querySelector('atlas-feedback-state h2'))).toBe('Waypoints could not load');
  });
});
