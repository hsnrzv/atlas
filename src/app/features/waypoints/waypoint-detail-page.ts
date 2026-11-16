import { Component, computed, effect, inject, input, LOCALE_ID } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { Router, RouterLink } from '@angular/router';
import { GoalPlanStore } from '../../core/data-access/goal-plan.store';
import { AtlasTitleStrategy } from '../../core/layout/atlas-title-strategy';
import { AWARDS, DESTINATIONS, STEPS, WAYPOINTS } from '../../core/layout/navigation';
import { destinationLink, nodeLink, stepLink, waypointLink } from '../../core/layout/plan-links';
import type { GoalNode } from '../../core/models/goal-node';
import { ancestorsOf, childrenOf, findNode, isWaypoint } from '../../core/models/goal-tree';
import { PlanEditor } from '../../core/plan/plan-editor';
import { AtlasIcon } from '../../shared/icons/atlas-icon';
import { AtlasStatusBadge } from '../../shared/ui/badge/status-badge';
import { AtlasBlockedPanel } from '../../shared/ui/blocked-panel/blocked-panel';
import type { AtlasBreadcrumb } from '../../shared/ui/breadcrumbs/breadcrumbs';
import { AtlasBreadcrumbs } from '../../shared/ui/breadcrumbs/breadcrumbs';
import { AtlasFeedbackState } from '../../shared/ui/feedback-state/feedback-state';
import { AtlasIconButton } from '../../shared/ui/icon-button/icon-button';
import { AtlasNotesPanel } from '../../shared/ui/notes-panel/notes-panel';
import { AtlasPageHeader } from '../../shared/ui/page-header/page-header';
import { AtlasPlanAlert } from '../../shared/ui/plan-alert/plan-alert';
import { AtlasProgress } from '../../shared/ui/progress/progress';
import { AtlasStepRow } from '../../shared/ui/step-row/step-row';
import { AtlasWaypointRoute } from '../../shared/ui/waypoint-route/waypoint-route';
import { keepHeadingFocus } from '../../shared/utils/heading-focus';
import {
  completedText,
  isBlocked,
  nodeStatusKey,
  plannedDateText,
  rewardText,
} from '../../shared/utils/plan-format';
import {
  toBlockedReasons,
  toNoteVm,
  toStepRow,
  toWaypointStops,
} from '../../shared/utils/plan-view';
import { percentValue } from '../../shared/utils/progress-format';

export type WaypointDetailState = 'loading' | 'ready' | 'not-found' | 'error';

/**
 * Waypoint detail at any depth (F2-6, Figma page 07): breadcrumbs from the Destination down, progress from the
 * backend, Blocked availability with its prerequisites, nested Waypoints and Steps with reorder, edit and delete
 * (F3-2), and notes (F3-3). A Step id opens Step detail instead.
 */
@Component({
  selector: 'atlas-waypoint-detail-page',
  imports: [
    AtlasBlockedPanel,
    AtlasBreadcrumbs,
    AtlasFeedbackState,
    AtlasIcon,
    AtlasIconButton,
    AtlasNotesPanel,
    AtlasPageHeader,
    AtlasPlanAlert,
    AtlasProgress,
    AtlasStatusBadge,
    AtlasStepRow,
    AtlasWaypointRoute,
    MatButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    RouterLink,
  ],
  templateUrl: './waypoint-detail-page.html',
  styleUrl: './waypoint-detail-page.scss',
})
export class WaypointDetailPage {
  readonly goalId = input.required<string>();
  readonly nodeId = input.required<string>();

  protected readonly store = inject(GoalPlanStore);
  protected readonly editor = inject(PlanEditor);
  private readonly router = inject(Router);
  private readonly titles = inject(AtlasTitleStrategy);
  private readonly locale = inject(LOCALE_ID);
  protected readonly destinations = DESTINATIONS;

  private readonly node = computed(() => findNode(this.store.nodes(), this.nodeId()) ?? null);
  protected readonly state = computed<WaypointDetailState>(() => {
    const state = this.store.state();
    if (state === 'ready') {
      return this.node() ? 'ready' : 'not-found';
    }
    return state === 'idle' ? 'loading' : state;
  });

  protected readonly vm = computed(() => {
    const goal = this.store.goal();
    const node = this.node();
    if (!goal || !node) {
      return null;
    }
    const nodes = this.store.nodes();
    const ancestors = ancestorsOf(nodes, node.id);
    const parent = ancestors.at(-1) ?? null;
    const breadcrumbs: AtlasBreadcrumb[] = [
      { label: DESTINATIONS.label, path: DESTINATIONS.path },
      { label: goal.title, path: destinationLink(goal.id) },
      ...ancestors.map((ancestor) => ({
        label: ancestor.title,
        path: waypointLink(goal.id, ancestor.id),
      })),
      { label: node.title },
    ];
    const children = childrenOf(nodes, node.id);
    const steps = children.filter((child) => !isWaypoint(child));
    const waitsFor = this.store
      .prerequisitesOf(node.id)
      .map((id) => findNode(nodes, id))
      .filter((item): item is GoalNode => !!item);
    return {
      goal,
      node,
      breadcrumbs,
      back: parent
        ? { label: `Back to ${parent.title}`, link: waypointLink(goal.id, parent.id) }
        : { label: 'Back to Waypoints', link: WAYPOINTS.path, query: { destination: goal.id } },
      status: nodeStatusKey(node),
      achieved: node.status === 'COMPLETED',
      blocked: isBlocked(node),
      blockedReasons: toBlockedReasons(node, nodes),
      goalPercent: percentValue(goal.progress),
      percent: percentValue(node.progress),
      progressDetail: completedText(node.progress, 'Steps') ?? undefined,
      stops: toWaypointStops(goal, nodes, node.id, this.locale),
      steps: steps.map((step, index) => ({
        node: step,
        row: toStepRow(step, this.locale),
        first: index === 0,
        last: index === steps.length - 1,
      })),
      stepsQuery: { destination: goal.id, waypoint: node.id },
      due: plannedDateText(node.dueDate, this.locale),
      start: node.startDate ? plannedDateText(node.startDate, this.locale) : null,
      reward: rewardText(node.reward),
      waitsFor: waitsFor.map((item) => ({ id: item.id, title: item.title, link: nodeLink(item) })),
    };
  });
  protected readonly notes = computed(() =>
    this.store.notes().map((note) => toNoteVm(note, this.locale)),
  );
  protected readonly stepsPath = STEPS.path;
  protected readonly awardsPath = AWARDS.path;

  constructor() {
    effect(() => {
      this.store.goalId.set(this.goalId());
      this.store.notesNodeId.set(this.nodeId());
    });
    effect(() => {
      const node = this.node();
      if (node?.nodeType === 'TASK') {
        void this.router.navigateByUrl(stepLink(node.goalId, node.id), { replaceUrl: true });
      } else if (node) {
        this.titles.describePage(node.title);
      }
    });
    keepHeadingFocus(this.state);
  }

  protected async remove(node: GoalNode): Promise<void> {
    const back = this.vm()?.back;
    if ((await this.editor.remove(node)) && back) {
      await this.router.navigate([back.link], { queryParams: back.query });
    }
  }
}
