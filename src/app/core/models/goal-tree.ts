import type { GoalNode, NodeId } from './goal-node';

/**
 * Pure lookups over the flat tree the backend returns (`GET …/tree`, ordered by `parentId` + `sortOrder`). They
 * only navigate the structure; they never derive progress or availability.
 */
export function findNode(nodes: readonly GoalNode[], nodeId: NodeId): GoalNode | undefined {
  return nodes.find((node) => node.id === nodeId);
}

/** Direct children of `parentId` (`null` for the top level), in `sortOrder`. */
export function childrenOf(nodes: readonly GoalNode[], parentId: NodeId | null): GoalNode[] {
  return nodes
    .filter((node) => node.parentId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Steps (non-Waypoint children) of `parentId`, ordered by due date ascending: undated Steps last, ties in
 * `sortOrder`. ISO dates compare lexically; the backend normalises coarse precisions to the period start.
 */
export function stepsOf(nodes: readonly GoalNode[], parentId: NodeId | null): GoalNode[] {
  return childrenOf(nodes, parentId)
    .filter((node) => !isWaypoint(node))
    .sort((a, b) => dueKey(a).localeCompare(dueKey(b)));
}

const dueKey = (node: GoalNode): string => node.dueDate?.date ?? '\uffff';

/** Ancestors from the top level down to the parent of `nodeId`. */
export function ancestorsOf(nodes: readonly GoalNode[], nodeId: NodeId): GoalNode[] {
  const ancestors: GoalNode[] = [];
  const seen = new Set<NodeId>();
  let current = findNode(nodes, nodeId);
  while (current?.parentId && !seen.has(current.parentId)) {
    seen.add(current.parentId);
    current = findNode(nodes, current.parentId);
    if (current) {
      ancestors.unshift(current);
    }
  }
  return ancestors;
}

/** Ids of every node below `nodeId`. */
export function descendantIds(nodes: readonly GoalNode[], nodeId: NodeId): Set<NodeId> {
  const result = new Set<NodeId>();
  const queue = [nodeId];
  while (queue.length) {
    const parent = queue.shift()!;
    for (const node of nodes) {
      if (node.parentId === parent && !result.has(node.id)) {
        result.add(node.id);
        queue.push(node.id);
      }
    }
  }
  return result;
}

/** Waypoints (MILESTONE, CHECKPOINT) are containers; Steps (TASK) are leaves in the UI vocabulary (ADR-0006). */
export const isWaypoint = (node: Pick<GoalNode, 'nodeType'>): boolean => node.nodeType !== 'TASK';
