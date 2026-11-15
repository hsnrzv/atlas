import type { GoalId } from '../models/goal';
import type { GoalNode, NodeId } from '../models/goal-node';
import { DESTINATIONS } from './navigation';

/** Router links for a Destination plan (frontend.md §5); one place so features never hard-code paths. */
export const destinationLink = (goalId: GoalId): string => `${DESTINATIONS.path}/${goalId}`;

export const waypointLink = (goalId: GoalId, nodeId: NodeId): string =>
  `${destinationLink(goalId)}/waypoints/${nodeId}`;

export const stepLink = (goalId: GoalId, nodeId: NodeId): string =>
  `${destinationLink(goalId)}/steps/${nodeId}`;

/** A Waypoint opens its detail page; a Step opens Step detail. */
export const nodeLink = (node: Pick<GoalNode, 'goalId' | 'id' | 'nodeType'>): string =>
  node.nodeType === 'TASK' ? stepLink(node.goalId, node.id) : waypointLink(node.goalId, node.id);
