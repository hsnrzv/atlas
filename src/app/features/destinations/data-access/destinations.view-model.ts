import { destinationLink, waypointLink } from '../../../core/layout/plan-links';
import type { GoalSummary } from '../../../core/models/goal';
import { lifeDimensionByApiKey } from '../../../shared/design-system/life-dimensions';
import type { DestinationCardVm } from '../../../shared/ui/destination-card/destination-card';
import { completedText, goalStatusBadge, rewardText } from '../../../shared/utils/plan-format';
import { percentValue } from '../../../shared/utils/progress-format';

/** Card for one Destination (Atlas/V3/DestinationCard): backend progress, formatted only. */
export function toDestinationCard(goal: GoalSummary): DestinationCardVm {
  const badge = goalStatusBadge(goal.status);
  return {
    id: goal.id,
    title: goal.title,
    dimension: lifeDimensionByApiKey(goal.primaryAreaKey)?.key ?? 'career',
    status: badge.status,
    statusLabel: badge.label,
    progress: {
      value: percentValue(goal.progress),
      detail: completedText(goal.progress, 'Steps') ?? undefined,
    },
    nextWaypoint: goal.nextAvailableNode?.title ?? null,
    targetDate: goal.targetDate,
    link: destinationLink(goal.id),
  };
}

/** The context column (Figma page 06 "Destination context") for the first listed Destination. */
export interface DestinationContextVm {
  readonly title: string;
  readonly link: string;
  readonly next: { readonly title: string; readonly link: string } | null;
  readonly reward: { readonly title: string; readonly status: string } | null;
}

export function toDestinationContext(goal: GoalSummary): DestinationContextVm {
  const next = goal.nextAvailableNode;
  return {
    title: goal.title,
    link: destinationLink(goal.id),
    next: next ? { title: next.title, link: waypointLink(goal.id, next.id) } : null,
    reward: rewardText(goal.reward),
  };
}
