import type { AvailabilityState, NodeStatus } from './goal-node';

/** UI progress status (`ATLAS_STATUSES`). `skipped` and `cancelled` are neutral and never imply failure. */
export type UiStatus =
  | 'success'
  | 'in-progress'
  | 'upcoming'
  | 'at-risk'
  | 'blocked'
  | 'not-started'
  | 'skipped'
  | 'cancelled';

export interface StatusSource {
  readonly status: NodeStatus;
  readonly availability?: { readonly state: AvailabilityState } | null;
  /** Backend-derived flags only (D14); the UI never infers risk or urgency from dates. */
  readonly atRisk?: boolean;
  readonly dueSoon?: boolean;
}

/**
 * Maps a node's stored status and derived availability to the UI status (PLAN-FRONTEND D14). Finished states win
 * over locks; a lock wins over "in progress" so the user sees why they cannot continue.
 */
export function statusForNode(node: StatusSource): UiStatus {
  switch (node.status) {
    case 'COMPLETED':
      return 'success';
    case 'SKIPPED':
      return 'skipped';
    case 'CANCELLED':
      return 'cancelled';
  }
  if (node.availability?.state === 'LOCKED') {
    return 'blocked';
  }
  if (node.atRisk) {
    return 'at-risk';
  }
  if (node.status === 'IN_PROGRESS') {
    return 'in-progress';
  }
  return node.dueSoon ? 'upcoming' : 'not-started';
}
