import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, computed, effect, inject, input, LOCALE_ID, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatOption, MatSelect } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { GoalPlanStore, messageOf } from '../../core/data-access/goal-plan.store';
import { AtlasTitleStrategy } from '../../core/layout/atlas-title-strategy';
import { DESTINATIONS, STEPS } from '../../core/layout/navigation';
import { destinationLink, waypointLink } from '../../core/layout/plan-links';
import type { SettableNodeStatus } from '../../core/models/goal-commands';
import type { GoalNode } from '../../core/models/goal-node';
import { ancestorsOf, findNode } from '../../core/models/goal-tree';
import { PlanEditor } from '../../core/plan/plan-editor';
import { AtlasIcon } from '../../shared/icons/atlas-icon';
import { AtlasStatusBadge } from '../../shared/ui/badge/status-badge';
import { AtlasBlockedPanel } from '../../shared/ui/blocked-panel/blocked-panel';
import { AtlasBreadcrumbs, type AtlasBreadcrumb } from '../../shared/ui/breadcrumbs/breadcrumbs';
import { AtlasFeedbackState } from '../../shared/ui/feedback-state/feedback-state';
import { AtlasIconButton } from '../../shared/ui/icon-button/icon-button';
import { AtlasNotesPanel } from '../../shared/ui/notes-panel/notes-panel';
import { AtlasPageHeader } from '../../shared/ui/page-header/page-header';
import { AtlasPlanAlert } from '../../shared/ui/plan-alert/plan-alert';
import { keepHeadingFocus } from '../../shared/utils/heading-focus';
import {
  isBlocked,
  NODE_STATUS_OPTIONS,
  nodeStatusKey,
  plannedDateText,
} from '../../shared/utils/plan-format';
import { toBlockedReasons, toNoteVm } from '../../shared/utils/plan-view';
import { formatPercent } from '../../shared/utils/progress-format';

export type StepDetailState = 'loading' | 'ready' | 'not-found' | 'error';

/** What changed after the last status write, with links to the updated parents (Figma flow D). */
interface StepUpdate {
  readonly message: string;
  readonly waypointLink: string | null;
  readonly destinationLink: string;
}

const SETTABLE: readonly SettableNodeStatus[] = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'SKIPPED',
  'CANCELLED',
];

/**
 * Step detail (F2-7, Figma page 08): status change through the repository port, Blocked availability with its
 * prerequisites, Mark complete and Reopen, and the backend's updated Waypoint and Destination progress announced in
 * a live region (flow D). A full page rather than the Figma side sheet; see frontend.md §6.5.
 */
@Component({
  selector: 'atlas-step-detail-page',
  imports: [
    AtlasBlockedPanel,
    AtlasBreadcrumbs,
    AtlasFeedbackState,
    AtlasIcon,
    AtlasIconButton,
    AtlasNotesPanel,
    AtlasPageHeader,
    AtlasPlanAlert,
    AtlasStatusBadge,
    MatButton,
    MatFormField,
    MatLabel,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatOption,
    MatSelect,
    RouterLink,
  ],
  templateUrl: './step-detail-page.html',
  styleUrl: './step-detail-page.scss',
})
export class StepDetailPage {
  readonly goalId = input.required<string>();
  readonly nodeId = input.required<string>();

  protected readonly store = inject(GoalPlanStore);
  protected readonly editor = inject(PlanEditor);
  private readonly router = inject(Router);
  private readonly titles = inject(AtlasTitleStrategy);
  private readonly announcer = inject(LiveAnnouncer);
  private readonly locale = inject(LOCALE_ID);
  protected readonly destinations = DESTINATIONS;
  protected readonly statusOptions = NODE_STATUS_OPTIONS.filter((option) =>
    (SETTABLE as readonly string[]).includes(option.value),
  );

  /** The result of the last Mark complete, Reopen or status change on this page. */
  protected readonly update = signal<StepUpdate | null>(null);

  private readonly node = computed(() => findNode(this.store.nodes(), this.nodeId()) ?? null);
  protected readonly state = computed<StepDetailState>(() => {
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
    return {
      goal,
      node,
      parent,
      breadcrumbs,
      back: parent
        ? {
            label: 'Back to Steps',
            link: STEPS.path,
            query: { destination: goal.id, waypoint: parent.id } as Record<string, string>,
          }
        : { label: `Back to ${goal.title}`, link: destinationLink(goal.id), query: {} },
      status: nodeStatusKey(node),
      completed: node.status === 'COMPLETED',
      blocked: isBlocked(node),
      blockedReasons: toBlockedReasons(node, nodes),
      due: node.dueDate ? plannedDateText(node.dueDate, this.locale) : 'Not set',
      context: parent ? `Step in ${parent.title}` : `Step in ${goal.title}`,
    };
  });
  protected readonly notes = computed(() =>
    this.store.notes().map((note) => toNoteVm(note, this.locale)),
  );

  constructor() {
    this.store.enter();
    effect(() => {
      this.store.goalId.set(this.goalId());
      this.store.notesNodeId.set(this.nodeId());
    });
    effect(() => {
      const node = this.node();
      if (node && node.nodeType !== 'TASK') {
        void this.router.navigateByUrl(waypointLink(node.goalId, node.id), { replaceUrl: true });
      } else if (node) {
        this.titles.describePage(node.title);
      }
    });
    keepHeadingFocus(this.state);
  }

  protected async complete(node: GoalNode): Promise<void> {
    await this.afterWrite(
      node,
      messageOf(await this.store.completeNode(node)),
      `${node.title} marked complete.`,
    );
  }

  protected async reopen(node: GoalNode): Promise<void> {
    await this.afterWrite(
      node,
      messageOf(await this.store.reopenNode(node)),
      `${node.title} reopened.`,
    );
  }

  protected async setStatus(node: GoalNode, status: SettableNodeStatus): Promise<void> {
    if (status === node.status) {
      return;
    }
    const label = this.statusOptions.find((option) => option.value === status)?.label ?? status;
    await this.afterWrite(
      node,
      messageOf(await this.store.setNodeStatus(node, status)),
      `${node.title} set to ${label}.`,
    );
  }

  protected async remove(node: GoalNode): Promise<void> {
    const back = this.vm()?.back;
    if ((await this.editor.remove(node)) && back) {
      await this.router.navigate([back.link], { queryParams: back.query });
    }
  }

  /** Reports the write and the backend's recalculated progress; the frontend never derives it (frontend.md §6.3). */
  private async afterWrite(node: GoalNode, error: string | null, done: string): Promise<void> {
    // The live region announces success; a toast as well would repeat it.
    this.editor.error.set(error);
    if (error) {
      this.update.set(null);
      return;
    }
    const goal = this.store.goal();
    const parent = node.parentId ? findNode(this.store.nodes(), node.parentId) : undefined;
    const parts = [done];
    if (parent?.progress) {
      parts.push(`${parent.title} is now ${formatPercent(parent.progress, this.locale)}.`);
    }
    if (goal?.progress) {
      parts.push(`Destination progress is now ${formatPercent(goal.progress, this.locale)}.`);
    }
    const message = parts.join(' ');
    this.update.set({
      message,
      waypointLink: parent ? waypointLink(node.goalId, parent.id) : null,
      destinationLink: destinationLink(node.goalId),
    });
    await this.announcer.announce(message, 'polite');
  }
}
