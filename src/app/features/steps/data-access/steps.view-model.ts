import type { Goal } from '../../../core/models/goal';
import type { GoalNode, NodeId } from '../../../core/models/goal-node';
import { ancestorsOf, childrenOf, findNode, isWaypoint } from '../../../core/models/goal-tree';

export interface WaypointOption {
  readonly id: NodeId;
  /** The Waypoint with its ancestors, e.g. "Study › Thesis". */
  readonly label: string;
}

/** Every Waypoint of the Destination, in tree order, labelled with its path. */
export function waypointOptions(nodes: readonly GoalNode[]): WaypointOption[] {
  const result: WaypointOption[] = [];
  const visit = (parentId: NodeId | null): void => {
    for (const node of childrenOf(nodes, parentId).filter(isWaypoint)) {
      const path = [...ancestorsOf(nodes, node.id), node].map((item) => item.title);
      result.push({ id: node.id, label: path.join(' › ') });
      visit(node.id);
    }
  };
  visit(null);
  return result;
}

/**
 * The Waypoint to show when none is chosen: the one holding the backend's next available node, else the first
 * Waypoint that has Steps, else the first Waypoint.
 */
export function defaultWaypointId(
  goal: Pick<Goal, 'nextAvailableNode'>,
  nodes: readonly GoalNode[],
): NodeId | null {
  const next = goal.nextAvailableNode ? findNode(nodes, goal.nextAvailableNode.id) : undefined;
  if (next) {
    return next.nodeType === 'TASK' ? next.parentId : next.id;
  }
  const waypoints = nodes.filter(isWaypoint);
  const withSteps = waypoints.find((node) =>
    childrenOf(nodes, node.id).some((child) => !isWaypoint(child)),
  );
  return (withSteps ?? waypoints[0])?.id ?? null;
}
