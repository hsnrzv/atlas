import type { Goal } from '../../core/models/goal';
import type { GoalNode, NodeId } from '../../core/models/goal-node';
import type { GoalNote } from '../../core/models/goal-note';
import {
  ancestorsOf,
  childrenOf,
  findNode,
  isWaypoint,
  stepsOf,
} from '../../core/models/goal-tree';
import { nodeLink } from '../../core/layout/plan-links';
import type { NoteVm } from '../ui/notes-panel/notes-panel';
import type { StepRowVm } from '../ui/step-row/step-row';
import type { BlockedReasonVm } from '../ui/blocked-panel/blocked-panel';
import type { WaypointStopVm } from '../ui/waypoint-route/waypoint-route';
import {
  isBlocked,
  NODE_STATUS_OPTIONS,
  nodeStatusKey,
  plannedDateText,
  progressLine,
} from './plan-format';

/**
 * Display models for the plan pages (Figma pages 06–08). Formatting only: progress, availability and the next
 * focus all come from the backend (frontend.md §6.3).
 */

export function toNoteVm(note: GoalNote, locale: string): NoteVm {
  const text = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(note.updatedAt),
  );
  return { id: note.id, body: note.body, updated: { datetime: note.updatedAt, text } };
}

/** The node at `parentId`'s level that is, or contains, the backend's next available node. */
export function currentChildId(
  nodes: readonly GoalNode[],
  next: Goal['nextAvailableNode'],
  parentId: NodeId | null,
): NodeId | null {
  if (!next) {
    return null;
  }
  const path = [...ancestorsOf(nodes, next.id), nodes.find((node) => node.id === next.id)];
  return path.find((node) => node && node.parentId === parentId)?.id ?? null;
}

/** Waypoints directly under `parentId` (the Destination when `null`), as stops on the route. */
export function toWaypointStops(
  goal: Pick<Goal, 'nextAvailableNode'>,
  nodes: readonly GoalNode[],
  parentId: NodeId | null,
  locale: string,
): WaypointStopVm[] {
  const current = currentChildId(nodes, goal.nextAvailableNode, parentId);
  return childrenOf(nodes, parentId)
    .filter(isWaypoint)
    .map((node) => ({
      id: node.id,
      title: node.title,
      status: nodeStatusKey(node),
      blocked: isBlocked(node),
      dateText: plannedDateText(node.dueDate, locale),
      detail: node.progress ? progressLine(node.progress, locale, 'Steps') : node.outcome,
      link: nodeLink(node),
      current: node.id === current,
    }));
}

/** Steps directly under `parentId`, by due date. */
export function toStepRows(
  nodes: readonly GoalNode[],
  parentId: NodeId | null,
  locale: string,
): StepRowVm[] {
  return stepsOf(nodes, parentId).map((node) => toStepRow(node, locale));
}

export function toStepRow(node: GoalNode, locale: string): StepRowVm {
  const due = node.dueDate ? plannedDateText(node.dueDate, locale) : 'Not set';
  return {
    id: node.id,
    title: node.title,
    status: nodeStatusKey(node),
    blocked: isBlocked(node),
    meta: `Due: ${due}`,
    link: nodeLink(node),
  };
}

const NODE_STATUS_LABEL = new Map(
  NODE_STATUS_OPTIONS.map((option) => [option.value, option.label]),
);

/** Why the backend locked a node: each incomplete prerequisite with a link to it. */
export function toBlockedReasons(node: GoalNode, nodes: readonly GoalNode[]): BlockedReasonVm[] {
  if (!isBlocked(node)) {
    return [];
  }
  return node.availability.reasons.map((reason) => {
    const prerequisite = findNode(nodes, reason.prerequisiteNodeId);
    return {
      id: reason.prerequisiteNodeId,
      title: reason.title,
      status: NODE_STATUS_LABEL.get(reason.status) ?? reason.status,
      link: prerequisite ? nodeLink(prerequisite) : null,
    };
  });
}
