import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { GoalPlanStore } from '../../core/data-access/goal-plan.store';
import {
  MOCK_LATENCY_MS,
  providePlanTesting,
  SAMPLE_GOAL_ID,
  type MockMode,
} from '../../core/data-access/testing/plan-testing';
import { PlanEditor } from '../../core/plan/plan-editor';
import { AtlasToast } from '../../shared/ui/toast/atlas-toast';
import { DestinationDetailPage } from './destination-detail-page';

const text = (element: Element | null | undefined) =>
  element?.textContent?.replace(/\s+/g, ' ').trim();

describe('DestinationDetailPage', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  async function settle(fixture: { detectChanges(): void }) {
    for (let i = 0; i < 4; i++) {
      TestBed.tick();
      await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
    }
    fixture.detectChanges();
  }

  async function render(goalId = SAMPLE_GOAL_ID, mode: MockMode = 'sample') {
    const dialog = { open: vi.fn(() => ({ afterClosed: () => of(true) })) };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        ...providePlanTesting(mode),
        GoalPlanStore,
        PlanEditor,
        { provide: MatDialog, useValue: dialog },
        { provide: AtlasToast, useValue: { show: vi.fn() } },
      ],
    });
    const fixture = TestBed.createComponent(DestinationDetailPage);
    fixture.componentRef.setInput('goalId', goalId);
    fixture.detectChanges();
    await settle(fixture);
    return { fixture, root: fixture.nativeElement as HTMLElement, dialog };
  }

  it('shows the Destination with its progress, Waypoints and details', async () => {
    const { root } = await render();
    const headings = Array.from(root.querySelectorAll('h1, h2'), text);

    expect(headings[0]).toBe('Complete an online Master’s degree in Computer Science / AI');
    expect(headings).toEqual(
      expect.arrayContaining([
        'Major waypoints',
        'Purpose and success',
        'Dates and commitments',
        'Reward',
      ]),
    );
    expect(
      root.querySelector('atlas-progress [role="progressbar"]')?.getAttribute('aria-label'),
    ).toBe('Destination progress');
    expect(text(root.querySelector('atlas-waypoint-route'))).toContain('Submit application');
  });

  it('explains when the Destination does not exist', async () => {
    const { root } = await render('missing-goal');

    expect(text(root.querySelector('h1'))).toBe('Destination not found');
    expect(text(root.querySelector('atlas-feedback-state h2'))).toBe(
      'This Destination is not in your Atlas',
    );
  });

  it('offers a retry when the Destination cannot load', async () => {
    const { root } = await render(SAMPLE_GOAL_ID, 'error');

    expect(text(root.querySelector('h1'))).toBe('Destination could not load');
  });

  it('returns to Destinations after a confirmed delete', async () => {
    const { fixture, root, dialog } = await render();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    root.querySelector<HTMLButtonElement>('[aria-label="More actions"]')!.click();
    fixture.detectChanges();
    Array.from(document.querySelectorAll<HTMLButtonElement>('[mat-menu-item]'))
      .find((item) => text(item) === 'Delete destination')!
      .click();
    await settle(fixture);

    expect(dialog.open).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('/destinations');
    expect(TestBed.inject(AtlasToast).show).toHaveBeenCalledWith('Destination deleted.');
  });
});
