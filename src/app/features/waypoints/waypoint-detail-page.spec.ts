import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { GoalPlanStore } from '../../core/data-access/goal-plan.store';
import {
  MOCK_LATENCY_MS,
  providePlanTesting,
  SAMPLE_GOAL_ID,
  SAMPLE_NODE_IDS as N,
} from '../../core/data-access/testing/plan-testing';
import { PlanEditor } from '../../core/plan/plan-editor';
import { WaypointDetailPage } from './waypoint-detail-page';

const text = (element: Element | null | undefined) =>
  element?.textContent?.replace(/\s+/g, ' ').trim();

describe('WaypointDetailPage', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  async function settle(fixture: { detectChanges(): void }) {
    for (let i = 0; i < 4; i++) {
      TestBed.tick();
      await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
    }
    fixture.detectChanges();
  }

  async function render(nodeId: string) {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), ...providePlanTesting(), GoalPlanStore, PlanEditor],
    });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(WaypointDetailPage);
    fixture.componentRef.setInput('goalId', SAMPLE_GOAL_ID);
    fixture.componentRef.setInput('nodeId', nodeId);
    fixture.detectChanges();
    await settle(fixture);
    return { fixture, root: fixture.nativeElement as HTMLElement, navigate };
  }

  const stepTitles = (root: HTMLElement) =>
    Array.from(root.querySelectorAll('atlas-step-row .title'), text);

  it('shows the Waypoint with both progress bars, its Steps and details', async () => {
    const { root } = await render(N.submitApplication);

    expect(text(root.querySelector('h1'))).toBe('Submit application');
    expect(
      Array.from(root.querySelectorAll('atlas-progress [role="progressbar"]'), (bar) =>
        bar.getAttribute('aria-label'),
      ),
    ).toEqual(['Destination progress', 'Waypoint progress']);
    expect(stepTitles(root)).toHaveLength(5);
    expect(text(root.querySelector('#atlas-waypoint-policy'))).toBe('Progress policy');
    expect(text(root.querySelector('a.back'))).toBe('Back to Waypoints');
    expect(root.querySelector('a[href="/awards"]')).toBeNull();
  });

  it('links an achieved Waypoint to its milestone completion', async () => {
    const { fixture, root } = await render(N.submitApplication);
    const store = TestBed.inject(GoalPlanStore);
    for (const step of [
      N.confirmRequirements,
      N.gatherRecords,
      N.draftStatement,
      N.reviewChecklist,
      N.submitTheApplication,
    ]) {
      const node = store.nodes().find((item) => item.id === step)!;
      if (node.status !== 'COMPLETED') {
        void store.completeNode(node);
        await settle(fixture);
      }
    }

    expect(text(root.querySelector('a[href="/awards"]'))).toBe('View milestone completion');
  });

  it('moves a Step down the list', async () => {
    const { fixture, root } = await render(N.submitApplication);
    const [first, second] = stepTitles(root);

    root.querySelector<HTMLButtonElement>(`[aria-label="Move ${first} down"]`)!.click();
    await settle(fixture);

    expect(stepTitles(root).slice(0, 2)).toEqual([second, first]);
    expect(
      root.querySelector<HTMLButtonElement>(`[aria-label="Move ${second} up"]`)!.disabled,
    ).toBe(true);
  });

  it('sends a Step to its own page', async () => {
    const { navigate } = await render(N.draftStatement);

    expect(navigate).toHaveBeenCalledWith(
      `/destinations/${SAMPLE_GOAL_ID}/steps/${N.draftStatement}`,
      { replaceUrl: true },
    );
  });

  it('explains when the Waypoint is not in this Destination', async () => {
    const { root } = await render('missing-node');

    expect(text(root.querySelector('h1'))).toBe('Waypoint not found');
  });
});
