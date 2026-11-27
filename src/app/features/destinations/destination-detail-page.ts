import { Component, computed, effect, inject, input, LOCALE_ID } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { Router, RouterLink } from '@angular/router';
import { failureOf, GoalPlanStore, messageOf } from '../../core/data-access/goal-plan.store';
import { AtlasTitleStrategy } from '../../core/layout/atlas-title-strategy';
import { DESTINATIONS } from '../../core/layout/navigation';
import { PlanEditor } from '../../core/plan/plan-editor';
import { isSettableGoalStatus, type Goal } from '../../core/models/goal';
import type { GoalDraft } from '../../core/models/goal-commands';
import { lifeDimensionByApiKey } from '../../shared/design-system/life-dimensions';
import { AtlasIcon } from '../../shared/icons/atlas-icon';
import { AtlasDimensionBadge } from '../../shared/ui/badge/dimension-badge';
import { AtlasStatusBadge } from '../../shared/ui/badge/status-badge';
import { AtlasBreadcrumbs } from '../../shared/ui/breadcrumbs/breadcrumbs';
import { openConfirm } from '../../shared/ui/confirm-dialog/confirm-dialog';
import { AtlasFeedbackState } from '../../shared/ui/feedback-state/feedback-state';
import { AtlasIconButton } from '../../shared/ui/icon-button/icon-button';
import { AtlasNotesPanel } from '../../shared/ui/notes-panel/notes-panel';
import { AtlasPageHeader } from '../../shared/ui/page-header/page-header';
import { AtlasPlanAlert } from '../../shared/ui/plan-alert/plan-alert';
import { AtlasProgress } from '../../shared/ui/progress/progress';
import { AtlasToast } from '../../shared/ui/toast/atlas-toast';
import { AtlasWaypointRoute } from '../../shared/ui/waypoint-route/waypoint-route';
import { keepHeadingFocus } from '../../shared/utils/heading-focus';
import {
  completedText,
  excludedText,
  goalStatusBadge,
  plannedDateText,
  rewardText,
} from '../../shared/utils/plan-format';
import { toNoteVm, toWaypointStops } from '../../shared/utils/plan-view';
import { percentValue } from '../../shared/utils/progress-format';
import { openGoalForm } from './components/goal-form-dialog/goal-form-dialog';

const toDraft = (goal: Goal): GoalDraft => ({
  title: goal.title,
  outcome: goal.outcome,
  description: goal.description,
  primaryAreaKey: goal.primaryAreaKey,
  status: isSettableGoalStatus(goal.status) ? goal.status : null,
  targetDate: goal.targetDate,
  reward: goal.reward?.description ?? null,
});

/**
 * Destination detail (F2-5, Figma page 06): progress from the backend, the route of major Waypoints, purpose,
 * dates, reward and notes; edit, archive and delete (F2-7); add a Waypoint (F3-2).
 */
@Component({
  selector: 'atlas-destination-detail-page',
  imports: [
    AtlasBreadcrumbs,
    AtlasDimensionBadge,
    AtlasFeedbackState,
    AtlasIcon,
    AtlasIconButton,
    AtlasNotesPanel,
    AtlasPageHeader,
    AtlasPlanAlert,
    AtlasProgress,
    AtlasStatusBadge,
    AtlasWaypointRoute,
    MatButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    RouterLink,
  ],
  templateUrl: './destination-detail-page.html',
  styleUrl: './destination-detail-page.scss',
})
export class DestinationDetailPage {
  readonly goalId = input.required<string>();

  protected readonly store = inject(GoalPlanStore);
  protected readonly editor = inject(PlanEditor);
  private readonly locale = inject(LOCALE_ID);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(AtlasToast);
  private readonly router = inject(Router);
  private readonly titles = inject(AtlasTitleStrategy);
  protected readonly destinations = DESTINATIONS;

  protected readonly vm = computed(() => {
    const goal = this.store.goal();
    if (!goal) {
      return null;
    }
    const nodes = this.store.nodes();
    return {
      goal,
      breadcrumbs: [{ label: DESTINATIONS.label, path: DESTINATIONS.path }, { label: goal.title }],
      dimension: lifeDimensionByApiKey(goal.primaryAreaKey)?.key ?? 'career',
      status: goalStatusBadge(goal.status),
      percent: percentValue(goal.progress),
      progressDetail: completedText(goal.progress, 'Steps') ?? undefined,
      excluded: excludedText(goal.progress),
      stops: toWaypointStops(goal, nodes, null, this.locale),
      target: plannedDateText(goal.targetDate, this.locale),
      start: goal.startDate ? plannedDateText(goal.startDate, this.locale) : null,
      reward: rewardText(goal.reward),
    };
  });
  protected readonly notes = computed(() =>
    this.store.notes().map((note) => toNoteVm(note, this.locale)),
  );

  constructor() {
    this.store.enter();
    effect(() => {
      this.store.goalId.set(this.goalId());
      this.store.notesNodeId.set(null);
    });
    effect(() => {
      const title = this.store.goal()?.title;
      if (title) {
        this.titles.describePage(title);
      }
    });
    keepHeadingFocus(this.store.state);
  }

  protected async edit(goal: Goal): Promise<void> {
    const saved = await openGoalForm(this.dialog, {
      mode: 'edit',
      initial: toDraft(goal),
      sample: null,
      save: async (draft) => failureOf(await this.store.updateGoal(draft, goal.version)),
    });
    if (saved) {
      this.toast.show('Destination saved.');
    }
  }

  protected async archive(goal: Goal): Promise<void> {
    const confirmed = await openConfirm(this.dialog, {
      title: 'Archive destination?',
      message: `${goal.title} leaves your active plan. Its Waypoints, Steps and notes are kept.`,
      confirmLabel: 'Archive destination',
    });
    if (confirmed) {
      await this.leave(
        this.editor.settle(messageOf(await this.store.archiveGoal()), 'Destination archived.'),
      );
    }
  }

  protected async remove(goal: Goal): Promise<void> {
    const confirmed = await openConfirm(this.dialog, {
      title: 'Delete destination?',
      message: `${goal.title} and all its Waypoints, Steps and notes will be deleted. This cannot be undone.`,
      confirmLabel: 'Delete destination',
      destructive: true,
    });
    if (confirmed) {
      await this.leave(
        this.editor.settle(messageOf(await this.store.removeGoal()), 'Destination deleted.'),
      );
    }
  }

  private async leave(done: boolean): Promise<void> {
    if (done) {
      await this.router.navigateByUrl(DESTINATIONS.path);
    }
  }
}
