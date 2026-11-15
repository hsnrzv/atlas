import { LiveAnnouncer } from '@angular/cdk/a11y';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { GoalPlanStore } from '../../core/data-access/goal-plan.store';
import {
  MOCK_LATENCY_MS,
  providePlanTesting,
  SAMPLE_GOAL_ID,
  SAMPLE_NODE_IDS as N,
  type MockMode,
} from '../../core/data-access/testing/plan-testing';
import { PlanEditor } from '../../core/plan/plan-editor';
import { StepDetailPage } from './step-detail-page';

const text = (element: Element | null | undefined) =>
  element?.textContent?.replace(/\s+/g, ' ').trim();

describe('StepDetailPage', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  async function settle(fixture: { detectChanges(): void }) {
    for (let i = 0; i < 5; i++) {
      TestBed.tick();
      await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
    }
    fixture.detectChanges();
  }

  async function render(nodeId: string, mode: MockMode = 'sample') {
    const announce = vi.fn().mockResolvedValue(undefined);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        ...providePlanTesting(mode),
        GoalPlanStore,
        PlanEditor,
        { provide: LiveAnnouncer, useValue: { announce } },
      ],
    });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(StepDetailPage);
    fixture.componentRef.setInput('goalId', SAMPLE_GOAL_ID);
    fixture.componentRef.setInput('nodeId', nodeId);
    fixture.detectChanges();
    await settle(fixture);
    return { fixture, root: fixture.nativeElement as HTMLElement, announce, navigate };
  }

  const button = (root: HTMLElement, label: string) =>
    Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find(
      (item) => text(item) === label,
    );

  it('shows the Step with its context, description and outcome', async () => {
    const { root } = await render(N.draftStatement);

    expect(text(root.querySelector('h1'))).toBe('Draft personal statement');
    expect(text(root.querySelector('a.back'))).toBe('Back to Steps');
    expect(text(root.querySelector('#atlas-step-about'))).toBe('About this Step');
    expect(
      Array.from(root.querySelectorAll('.multiline'), (item) => item.textContent).at(-1),
    ).toContain('1. I have explained my motivation for studying Computer Science / AI.\n2.');
    expect(button(root, 'Mark complete')).toBeDefined();
    expect(root.querySelector('atlas-blocked-panel')).toBeNull();
  });

  it('marks the Step complete and reports the progress the backend derived', async () => {
    const { fixture, root, announce } = await render(N.draftStatement);

    button(root, 'Mark complete')!.click();
    await settle(fixture);

    const message =
      'Draft personal statement marked complete. Submit application is now 60%. Destination progress is now 30%.';
    expect(text(root.querySelector('.update p'))).toBe(message);
    expect(announce).toHaveBeenCalledWith(message, 'polite');
    expect(Array.from(root.querySelectorAll('.update a'), text)).toEqual([
      'View updated waypoint',
      'View updated destination',
    ]);
    expect(button(root, 'Reopen Step')).toBeDefined();
    expect(button(root, 'Mark complete')).toBeUndefined();
  });

  it('explains a blocked Step instead of offering to complete it', async () => {
    const { root } = await render(N.submitTheApplication);

    expect(button(root, 'Mark complete')).toBeUndefined();
    expect(text(root.querySelector('atlas-blocked-panel'))).toContain(
      'Review application checklist',
    );
  });

  it('sends a Waypoint to its own page', async () => {
    const { navigate } = await render(N.submitApplication);

    expect(navigate).toHaveBeenCalledWith(
      `/destinations/${SAMPLE_GOAL_ID}/waypoints/${N.submitApplication}`,
      { replaceUrl: true },
    );
  });

  it('explains when the Step is not in this Destination', async () => {
    const { root } = await render('missing-node');

    expect(text(root.querySelector('h1'))).toBe('Step not found');
  });

  it('offers a retry when the Step cannot load', async () => {
    const { root } = await render(N.draftStatement, 'error');

    expect(text(root.querySelector('h1'))).toBe('Step could not load');
    expect(button(root, 'Retry')).toBeDefined();
  });
});
