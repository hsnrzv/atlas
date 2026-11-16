import { Component, computed, inject, input, LOCALE_ID } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { GoalPlanStore } from '../../core/data-access/goal-plan.store';
import { DESTINATIONS, WAYPOINTS } from '../../core/layout/navigation';
import { destinationLink, waypointLink } from '../../core/layout/plan-links';
import { findNode, isWaypoint, stepsOf } from '../../core/models/goal-tree';
import { PlanEditor } from '../../core/plan/plan-editor';
import { AtlasIcon } from '../../shared/icons/atlas-icon';
import { AtlasBlockedPanel } from '../../shared/ui/blocked-panel/blocked-panel';
import { AtlasDestinationPicker } from '../../shared/ui/destination-picker/destination-picker';
import { AtlasFeedbackState } from '../../shared/ui/feedback-state/feedback-state';
import { AtlasPageHeader } from '../../shared/ui/page-header/page-header';
import { AtlasPlanAlert } from '../../shared/ui/plan-alert/plan-alert';
import { AtlasProgress } from '../../shared/ui/progress/progress';
import { AtlasStepRow } from '../../shared/ui/step-row/step-row';
import { keepHeadingFocus } from '../../shared/utils/heading-focus';
import { completedText, plannedDateText } from '../../shared/utils/plan-format';
import { toBlockedReasons, toStepRow } from '../../shared/utils/plan-view';
import { percentValue } from '../../shared/utils/progress-format';
import {
  DEFAULT_STEP_FILTERS,
  matchesStepFilters,
  parseStepFilters,
  STEP_DUE_OPTIONS,
  STEP_STATUS_OPTIONS,
  stepFilterParams,
  type StepFilters,
} from './data-access/steps.filters';
import { defaultWaypointId, waypointOptions } from './data-access/steps.view-model';

/**
 * Steps overview (F2-7, Figma page 08): the Steps of one Waypoint with Status and Due filters, the Waypoint's
 * backend progress, its parent context and why Steps are Blocked. Query: `destination`, `waypoint`, `status`, `due`.
 */
@Component({
  selector: 'atlas-steps-page',
  imports: [
    AtlasBlockedPanel,
    AtlasDestinationPicker,
    AtlasFeedbackState,
    AtlasIcon,
    AtlasPageHeader,
    AtlasPlanAlert,
    AtlasProgress,
    AtlasStepRow,
    MatButton,
    MatFormField,
    MatLabel,
    MatOption,
    MatSelect,
    RouterLink,
  ],
  templateUrl: './steps-page.html',
  styleUrl: './steps-page.scss',
})
export class StepsPage {
  // Bound from the query string (withComponentInputBinding).
  readonly destination = input<string>();
  readonly waypoint = input<string>();
  readonly status = input<string>();
  readonly due = input<string>();

  protected readonly store = inject(GoalPlanStore);
  protected readonly editor = inject(PlanEditor);
  private readonly router = inject(Router);
  private readonly locale = inject(LOCALE_ID);
  protected readonly destinations = DESTINATIONS;
  protected readonly waypoints = WAYPOINTS;
  protected readonly statusOptions = STEP_STATUS_OPTIONS;
  protected readonly dueOptions = STEP_DUE_OPTIONS;

  protected readonly scope = this.store.scopeTo(() => this.destination());
  protected readonly filters = computed(() =>
    parseStepFilters({ status: this.status(), due: this.due() }),
  );
  protected readonly options = computed(() =>
    (this.store.goals() ?? []).map(({ id, title }) => ({ id, title })),
  );
  protected readonly waypointChoices = computed(() => waypointOptions(this.store.nodes()));

  private readonly parent = computed(() => {
    const goal = this.store.goal();
    if (!goal) {
      return null;
    }
    const nodes = this.store.nodes();
    const chosen = this.waypoint();
    const id = chosen ?? defaultWaypointId(goal, nodes);
    const node = id ? findNode(nodes, id) : undefined;
    return node && isWaypoint(node) ? node : null;
  });

  protected readonly state = computed(() => {
    const scope = this.scope();
    if (scope !== 'ready') {
      return scope;
    }
    if (this.parent()) {
      return 'ready';
    }
    return this.waypoint() ? 'not-found' : 'no-waypoints';
  });

  protected readonly vm = computed(() => {
    const goal = this.store.goal();
    const parent = this.parent();
    if (!goal || !parent) {
      return null;
    }
    const nodes = this.store.nodes();
    const all = stepsOf(nodes, parent.id);
    const filters = this.filters();
    const shown = all.filter((step) => matchesStepFilters(step, filters));
    return {
      goal,
      parent,
      goalLink: destinationLink(goal.id),
      parentLink: waypointLink(goal.id, parent.id),
      summary: completedText(parent.progress, 'Steps') ?? undefined,
      percent: percentValue(parent.progress),
      rows: shown.map((step) => toStepRow(step, this.locale)),
      total: all.length,
      countText: `Showing ${shown.length} of ${all.length} Steps`,
      blocked: all
        .map((step) => ({ step, reasons: toBlockedReasons(step, nodes) }))
        .filter((item) => item.reasons.length),
      due: plannedDateText(parent.dueDate, this.locale),
      goalTarget: plannedDateText(goal.targetDate, this.locale),
      filtered: filters.status !== 'all' || filters.due !== 'all',
    };
  });

  constructor() {
    this.store.enter();
    keepHeadingFocus(this.state);
  }

  protected chooseDestination(goalId: string): void {
    void this.router.navigate([], { queryParams: { destination: goalId } });
  }

  protected chooseWaypoint(nodeId: string): void {
    this.navigate({ waypoint: nodeId });
  }

  protected setFilter<K extends keyof StepFilters>(key: K, value: StepFilters[K]): void {
    this.navigate(stepFilterParams({ ...this.filters(), [key]: value }));
  }

  protected clearFilters(): void {
    this.navigate(stepFilterParams(DEFAULT_STEP_FILTERS));
  }

  private navigate(queryParams: Record<string, string | null>): void {
    void this.router.navigate([], { queryParams, queryParamsHandling: 'merge', replaceUrl: true });
  }
}
