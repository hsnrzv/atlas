import type { Goal } from '../../models/goal';
import type { GoalDependency } from '../../models/goal-commands';
import type {
  GoalNode,
  GoalNodeRef,
  LockReason,
  NodeAvailability,
  NodeId,
  NodeStatus,
} from '../../models/goal-node';
import type { Progress } from '../../models/progress';

/**
 * Dev-only stand-in for the backend's recalculation after a write (production-readiness §2.1), so a Destination
 * created in the session behaves like the sample. It applies the documented defaults of project-instruction §5.4
 * and §5.5 (leaf roll-up, weight 1, all prerequisites required) plus the provisional assumptions marked below; the
 * backend owns the real rules (roadmap R-12, frontend.md §6.3). Production code never imports it, and it is deleted
 * with the mock (F4-7). It reproduces the Figma sample values: 40 % · 2 of 5 and 20 % · 2 of 10.
 */

/** Provisional (R-12, project-instruction §21 #6): skipped and cancelled work leaves the denominator. */
const EXCLUDED: readonly NodeStatus[] = ['SKIPPED', 'CANCELLED'];
/** Provisional: a skipped or cancelled prerequisite no longer blocks. */
const SATISFIED: readonly NodeStatus[] = ['COMPLETED', 'SKIPPED', 'CANCELLED'];
const STARTED: readonly NodeStatus[] = ['IN_PROGRESS', 'COMPLETED'];

const AVAILABLE: NodeAvailability = { state: 'AVAILABLE', reasons: [], override: null };

interface Tally {
  readonly counted: number;
  readonly total: number;
  readonly leaves: readonly GoalNode[];
  readonly excluded: readonly GoalNode[];
}

const byOrder = (a: GoalNode, b: GoalNode) => a.sortOrder - b.sortOrder;

function leavesBelow(nodes: readonly GoalNode[], parentId: NodeId | null): GoalNode[] {
  return nodes
    .filter((node) => node.parentId === parentId)
    .sort(byOrder)
    .flatMap((node) => {
      const below = leavesBelow(nodes, node.id);
      return below.length ? below : [node];
    });
}

function tally(leaves: readonly GoalNode[]): Tally {
  const excluded = leaves.filter(
    (leaf) => EXCLUDED.includes(leaf.status) || Number(leaf.progressWeight) === 0,
  );
  const counting = leaves.filter((leaf) => !excluded.includes(leaf));
  const weight = (node: GoalNode) => Number(node.progressWeight) || 0;
  return {
    counted: counting
      .filter((leaf) => leaf.status === 'COMPLETED')
      .reduce((sum, leaf) => sum + weight(leaf), 0),
    total: counting.reduce((sum, leaf) => sum + weight(leaf), 0),
    leaves: counting,
    excluded,
  };
}

const decimal = (value: number) => String(Math.round(value * 1000) / 1000);

export function progressOf(
  counted: number,
  total: number,
  excluded: readonly GoalNode[] = [],
): Progress {
  return {
    percent: (total ? (counted / total) * 100 : 0).toFixed(1),
    policy: 'DERIVED',
    countedWeight: decimal(counted),
    totalWeight: decimal(total),
    ...(excluded.length
      ? { excludedNodes: excluded.map((node) => ({ nodeId: node.id, title: node.title })) }
      : {}),
  };
}

/** §5.5: blocked while any prerequisite is open; an override (none in the mock UI) keeps the node open. */
function availabilityOf(
  node: GoalNode,
  nodes: readonly GoalNode[],
  dependencies: readonly GoalDependency[],
): NodeAvailability {
  if (node.availability.override) {
    return node.availability;
  }
  const reasons = dependencies
    .filter((dependency) => dependency.dependentNodeId === node.id)
    .map((dependency) => nodes.find((item) => item.id === dependency.prerequisiteNodeId))
    .filter((prerequisite): prerequisite is GoalNode => !!prerequisite)
    .filter((prerequisite) => !SATISFIED.includes(prerequisite.status))
    .map((prerequisite): LockReason => ({
      prerequisiteNodeId: prerequisite.id,
      title: prerequisite.title,
      status: prerequisite.status,
    }));
  return reasons.length ? { state: 'LOCKED', reasons, override: null } : AVAILABLE;
}

/**
 * Provisional (FQ-18): a Waypoint with Steps follows them. All counted Steps completed → Completed; any started →
 * In progress; none started → the stored status, except that a no-longer-complete Waypoint returns to Not started.
 * Skipped and cancelled Waypoints keep their status.
 */
function waypointStatus(node: GoalNode, work: Tally): NodeStatus {
  if (EXCLUDED.includes(node.status) || !work.leaves.length) {
    return node.status;
  }
  if (work.leaves.every((leaf) => leaf.status === 'COMPLETED')) {
    return 'COMPLETED';
  }
  if (work.leaves.some((leaf) => STARTED.includes(leaf.status))) {
    return 'IN_PROGRESS';
  }
  return node.status === 'COMPLETED' ? 'NOT_STARTED' : node.status;
}

/** The first open top-level Waypoint in plan order (FQ-1: the backend's "next available"). */
export function nextOpenWaypoint(nodes: readonly GoalNode[]): GoalNode | undefined {
  return nodes
    .filter((node) => node.parentId === null && node.nodeType !== 'TASK')
    .sort(byOrder)
    .find((node) => !SATISFIED.includes(node.status));
}

/** One Destination's tree and goal after a write: availability, Waypoint status and progress. */
export function recalculate(
  goal: Goal,
  nodes: readonly GoalNode[],
  dependencies: readonly GoalDependency[],
): { readonly goal: Goal; readonly nodes: GoalNode[] } {
  // Statuses first (deepest Waypoints first), then availability reads the updated statuses.
  const depth = (node: GoalNode): number => {
    const parent = nodes.find((item) => item.id === node.parentId);
    return parent ? depth(parent) + 1 : 0;
  };
  let current = [...nodes];
  const parents = current
    .filter((node) => current.some((child) => child.parentId === node.id))
    .sort((a, b) => depth(b) - depth(a));
  for (const parent of parents) {
    const work = tally(leavesBelow(current, parent.id));
    const status = waypointStatus(parent, work);
    current = current.map((node) =>
      node.id === parent.id
        ? { ...node, status, progress: progressOf(work.counted, work.total) }
        : node,
    );
  }
  current = current.map((node) => {
    const hasChildren = current.some((child) => child.parentId === node.id);
    return {
      ...node,
      childCount: current.filter((child) => child.parentId === node.id).length,
      progress: hasChildren ? node.progress : null,
      availability: availabilityOf(node, current, dependencies),
    };
  });
  const work = tally(leavesBelow(current, null));
  const next = nextOpenWaypoint(current);
  const nextRef: GoalNodeRef | null = next ? { id: next.id, title: next.title } : null;
  return {
    goal: {
      ...goal,
      progress: progressOf(work.counted, work.total, work.excluded),
      nextAvailableNode: nextRef,
    },
    nodes: current,
  };
}

/** Area progress over all its Destinations' leaves (provisional FQ-2 rule; one Destination = its own progress). */
export function areaProgress(trees: readonly (readonly GoalNode[])[]): Progress | null {
  if (!trees.length) {
    return null;
  }
  const work = trees.map((nodes) => tally(leavesBelow(nodes, null)));
  const { percent } = progressOf(
    work.reduce((sum, item) => sum + item.counted, 0),
    work.reduce((sum, item) => sum + item.total, 0),
  );
  return { percent };
}
