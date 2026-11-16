import { Component, computed, inject, input, LOCALE_ID } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { GoalPlanStore } from '../../core/data-access/goal-plan.store';
import { DESTINATIONS } from '../../core/layout/navigation';
import { destinationLink } from '../../core/layout/plan-links';
import { PlanEditor } from '../../core/plan/plan-editor';
import { AtlasIcon } from '../../shared/icons/atlas-icon';
import { AtlasDestinationPicker } from '../../shared/ui/destination-picker/destination-picker';
import { AtlasFeedbackState } from '../../shared/ui/feedback-state/feedback-state';
import { AtlasPageHeader } from '../../shared/ui/page-header/page-header';
import { AtlasPlanAlert } from '../../shared/ui/plan-alert/plan-alert';
import { AtlasProgress } from '../../shared/ui/progress/progress';
import { AtlasWaypointRoute } from '../../shared/ui/waypoint-route/waypoint-route';
import { keepHeadingFocus } from '../../shared/utils/heading-focus';
import { completedText } from '../../shared/utils/plan-format';
import { toWaypointStops } from '../../shared/utils/plan-view';
import { percentValue } from '../../shared/utils/progress-format';

const COUNT_WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];

/**
 * Waypoints overview (F2-6, Figma page 07): the major Waypoints of one Destination along a route, with the
 * backend's next focus. `?destination=` picks the Destination; without it the first by target date is shown.
 */
@Component({
  selector: 'atlas-waypoints-page',
  imports: [
    AtlasDestinationPicker,
    AtlasFeedbackState,
    AtlasIcon,
    AtlasPageHeader,
    AtlasPlanAlert,
    AtlasProgress,
    AtlasWaypointRoute,
    MatButton,
    RouterLink,
  ],
  templateUrl: './waypoints-page.html',
  styleUrl: './waypoints-page.scss',
})
export class WaypointsPage {
  /** Bound from `?destination=` (withComponentInputBinding). */
  readonly destination = input<string>();

  protected readonly store = inject(GoalPlanStore);
  protected readonly editor = inject(PlanEditor);
  private readonly router = inject(Router);
  private readonly locale = inject(LOCALE_ID);
  protected readonly destinations = DESTINATIONS;

  protected readonly state = this.store.scopeTo(() => this.destination());
  protected readonly options = computed(() =>
    (this.store.goals() ?? []).map(({ id, title }) => ({ id, title })),
  );
  protected readonly vm = computed(() => {
    const goal = this.store.goal();
    if (!goal) {
      return null;
    }
    const stops = toWaypointStops(goal, this.store.nodes(), null, this.locale);
    const next = stops.find((stop) => stop.current) ?? null;
    const count = COUNT_WORDS[stops.length] ?? String(stops.length);
    return {
      goal,
      link: destinationLink(goal.id),
      percent: percentValue(goal.progress),
      progressDetail: completedText(goal.progress, 'Steps') ?? undefined,
      stops,
      countText: `${count} major ${stops.length === 1 ? 'Waypoint' : 'Waypoints'}`,
      next,
    };
  });

  constructor() {
    this.store.enter();
    keepHeadingFocus(this.state);
  }

  protected choose(goalId: string): void {
    void this.router.navigate([], { queryParams: { destination: goalId } });
  }
}
