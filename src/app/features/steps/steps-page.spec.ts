import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { GoalPlanStore } from '../../core/data-access/goal-plan.store';
import {
  MOCK_LATENCY_MS,
  providePlanTesting,
  type MockMode,
} from '../../core/data-access/testing/plan-testing';
import { PlanEditor } from '../../core/plan/plan-editor';
import { StepsPage } from './steps-page';

const text = (element: Element | null | undefined) =>
  element?.textContent?.replace(/\s+/g, ' ').trim();

describe('StepsPage', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  async function render(mode: MockMode = 'sample', inputs: Record<string, string> = {}) {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), ...providePlanTesting(mode), GoalPlanStore, PlanEditor],
    });
    const fixture = TestBed.createComponent(StepsPage);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
    for (let i = 0; i < 5; i++) {
      TestBed.tick();
      await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
    }
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  const rows = (root: HTMLElement) => Array.from(root.querySelectorAll('atlas-step-row h3'), text);

  it('shows the Steps of the next available Waypoint with what blocks them', async () => {
    const root = await render();

    expect(text(root.querySelector('h1'))).toBe('Take the next step');
    expect(text(root.querySelector('#atlas-steps-waypoint'))).toBe('Submit application');
    expect(rows(root)).toHaveLength(5);
    expect(text(root.querySelector('.count[role="status"]'))).toBe('Showing 5 of 5 Steps');
    expect(text(root.querySelector('atlas-blocked-panel [role="heading"]'))).toBe(
      'Submit the application is blocked',
    );
    expect(text(root.querySelector('#atlas-steps-parent'))).toBe('Parent waypoint and destination');
  });

  it('filters the Steps by status from the query string', async () => {
    const root = await render('sample', { status: 'blocked' });

    expect(rows(root)).toEqual(['Submit the application']);
    expect(text(root.querySelector('.count[role="status"]'))).toBe('Showing 1 of 5 Steps');
  });

  it('offers to clear filters that match nothing', async () => {
    const root = await render('sample', { status: 'SKIPPED' });

    expect(text(root.querySelector('atlas-feedback-state h2'))).toBe(
      'No Steps match these filters',
    );
    expect(text(root.querySelector('atlas-feedback-state button'))).toBe('Clear filters');
  });

  it('explains when the chosen Waypoint is not in the Destination', async () => {
    const root = await render('sample', { waypoint: 'missing-node' });

    expect(text(root.querySelector('atlas-feedback-state h2'))).toBe(
      'This Waypoint is not in this Destination',
    );
  });

  it('invites the first Destination when there are none', async () => {
    const root = await render('empty');

    expect(text(root.querySelector('atlas-feedback-state h2'))).toBe('No Destinations yet');
  });
});
