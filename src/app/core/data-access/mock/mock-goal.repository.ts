import { inject, Injectable } from '@angular/core';
import { map, type Observable } from 'rxjs';
import type { Goal, GoalId, GoalSummary } from '../../models/goal';
import type {
  GoalDependency,
  GoalDraft,
  GoalQuery,
  NodeDraft,
  NodePatch,
} from '../../models/goal-commands';
import type { GoalNode, GoalTree, NodeId } from '../../models/goal-node';
import type { GoalNote } from '../../models/goal-note';
import { childrenOf, descendantIds } from '../../models/goal-tree';
import { AtlasDataError } from '../data-error';
import { GoalRepository } from '../ports/goal.repository';
import { MockPlanState } from './mock-plan-state';
import { MockResponder } from './mock-responder';
import { MOCK_NEW_GOAL_PROGRESS } from './sample-fixtures';
import { ATLAS_MOCK_SENTINEL } from './sentinel';

function summary(goal: Goal): GoalSummary {
  const { id, title, primaryAreaKey, status, targetDate, progress, nextAvailableNode, reward } =
    goal;
  return { id, title, primaryAreaKey, status, targetDate, progress, nextAvailableNode, reward };
}

function matches(goal: Goal, query: GoalQuery): boolean {
  const q = query.q?.trim().toLocaleLowerCase();
  const target = goal.targetDate?.date;
  return (
    (!q || goal.title.toLocaleLowerCase().includes(q)) &&
    (!query.status || goal.status === query.status) &&
    (!query.area || goal.primaryAreaKey === query.area) &&
    (!query.targetFrom || (!!target && target >= query.targetFrom)) &&
    (!query.targetTo || (!!target && target <= query.targetTo))
  );
}

function compare(sort: GoalQuery['sort']): (a: Goal, b: Goal) => number {
  switch (sort) {
    case 'title':
      return (a, b) => a.title.localeCompare(b.title);
    case 'updatedAt':
      return (a, b) => b.updatedAt.localeCompare(a.updatedAt);
    default:
      // Undated Destinations last, like the backend's `NULLS LAST`.
      return (a, b) =>
        (a.targetDate?.date ?? '9999').localeCompare(b.targetDate?.date ?? '9999') ||
        a.title.localeCompare(b.title);
  }
}

const trimmed = (value: string | null): string | null => value?.trim() || null;

/**
 * Dev-only goal adapter (F2-2, F3-1, F3-2) over the session's `MockPlanState`. Reads and writes go through the
 * `?mock=` responder, so latency and error modes apply to both. Never referenced by production builds.
 */
@Injectable({ providedIn: 'root' })
export class MockGoalRepository extends GoalRepository {
  readonly source = ATLAS_MOCK_SENTINEL;
  private readonly responder = inject(MockResponder);
  private readonly state = inject(MockPlanState);

  list(query: GoalQuery = {}): Observable<readonly GoalSummary[]> {
    const read = () =>
      this.state.goals
        .filter((goal) => !this.state.archived.has(goal.id) && matches(goal, query))
        .sort(compare(query.sort))
        .map(summary);
    return this.responder.respond('goals', read, read);
  }

  get(goalId: GoalId): Observable<Goal> {
    return this.answer(`goal:${goalId}`, () => this.state.goal(goalId));
  }

  tree(goalId: GoalId): Observable<GoalTree> {
    return this.answer(`tree:${goalId}`, () => {
      this.state.goal(goalId);
      const nodes = this.state.nodesOf(goalId);
      return { goalId, nodes };
    });
  }

  create(draft: GoalDraft): Observable<Goal> {
    return this.write(() => {
      const now = this.state.now();
      const goal: Goal = {
        id: this.state.nextId('goal'),
        title: draft.title.trim(),
        outcome: trimmed(draft.outcome),
        description: trimmed(draft.description),
        primaryAreaKey: draft.primaryAreaKey,
        secondaryAreas: [],
        priority: null,
        status: draft.status,
        startDate: null,
        targetDate: draft.targetDate,
        progress: MOCK_NEW_GOAL_PROGRESS,
        nextAvailableNode: null,
        reward: trimmed(draft.reward)
          ? { description: draft.reward!.trim(), status: 'PLANNED' }
          : null,
        expectedWeeklyEffortMinutes: null,
        createdAt: now,
        updatedAt: now,
        version: 1,
      };
      this.state.goals.push(goal);
      return goal;
    });
  }

  update(goalId: GoalId, version: number, draft: GoalDraft): Observable<Goal> {
    return this.write(() => {
      const goal = this.state.goal(goalId);
      this.state.checkVersion(goal, version);
      const reward = trimmed(draft.reward);
      return this.state.replaceGoal({
        ...goal,
        title: draft.title.trim(),
        outcome: trimmed(draft.outcome),
        description: trimmed(draft.description),
        primaryAreaKey: draft.primaryAreaKey,
        status: draft.status,
        targetDate: draft.targetDate,
        reward: reward ? { description: reward, status: goal.reward?.status ?? 'PLANNED' } : null,
        updatedAt: this.state.now(),
        version: goal.version + 1,
      });
    });
  }

  archive(goalId: GoalId): Observable<Goal> {
    return this.write(() => {
      const goal = this.state.goal(goalId);
      this.state.archived.add(goalId);
      return goal;
    });
  }

  remove(goalId: GoalId, version: number): Observable<void> {
    return this.write(() => {
      this.state.checkVersion(this.state.goal(goalId), version);
      this.state.goals.splice(
        this.state.goals.findIndex((goal) => goal.id === goalId),
        1,
      );
      this.state.nodes = this.state.nodes.filter((node) => node.goalId !== goalId);
      this.state.dependencies = this.state.dependencies.filter((dep) => dep.goalId !== goalId);
      this.state.notes = this.state.notes.filter((note) => note.goalId !== goalId);
      this.state.archived.delete(goalId);
    });
  }

  createNode(goalId: GoalId, draft: NodeDraft): Observable<GoalNode> {
    return this.write(() => {
      this.state.goal(goalId);
      const nodes = this.state.nodesOf(goalId);
      if (draft.parentId) {
        const parent = this.state.node(goalId, draft.parentId);
        this.state.replaceNode({ ...parent, childCount: parent.childCount + 1 });
      }
      const siblings = childrenOf(nodes, draft.parentId);
      const node: GoalNode = {
        id: this.state.nextId('node'),
        goalId,
        parentId: draft.parentId,
        nodeType: draft.nodeType,
        title: draft.title.trim(),
        outcome: trimmed(draft.outcome),
        description: trimmed(draft.description),
        status: 'NOT_STARTED',
        startDate: null,
        dueDate: draft.dueDate,
        progressWeight: '1',
        sortOrder: (siblings.at(-1)?.sortOrder ?? 0) + 1,
        availability: { state: 'AVAILABLE', reasons: [], override: null },
        progress: null,
        reward: null,
        childCount: 0,
        version: 1,
      };
      this.state.nodes = [...this.state.nodes, node];
      return node;
    });
  }

  updateNode(
    goalId: GoalId,
    nodeId: NodeId,
    version: number,
    patch: NodePatch,
  ): Observable<GoalNode> {
    return this.write(() => {
      const node = this.state.node(goalId, nodeId);
      this.state.checkVersion(node, version);
      if (patch.sortOrder !== undefined) {
        this.reorder(goalId, node, patch.sortOrder);
      }
      const current = this.state.node(goalId, nodeId);
      // Order and parent are applied above or not supported by this adapter; the rest are field edits.
      const fields = { ...patch };
      delete fields.sortOrder;
      delete fields.parentId;
      const updated = this.state.replaceNode({
        ...current,
        ...fields,
        title: patch.title?.trim() ?? current.title,
        version: current.version + 1,
      });
      this.state.applySampleFixtures();
      return this.state.node(goalId, updated.id);
    });
  }

  removeNode(goalId: GoalId, nodeId: NodeId, version: number, cascade: boolean): Observable<void> {
    return this.write(() => {
      const node = this.state.node(goalId, nodeId);
      this.state.checkVersion(node, version);
      const removed = descendantIds(this.state.nodesOf(goalId), nodeId);
      if (removed.size && !cascade) {
        throw new AtlasDataError('This Waypoint has Steps or Waypoints below it.', 'conflict', {
          code: 'NODE_HAS_CHILDREN',
        });
      }
      removed.add(nodeId);
      this.state.nodes = this.state.nodes.filter((item) => !removed.has(item.id));
      if (node.parentId) {
        const parent = this.state.node(goalId, node.parentId);
        this.state.replaceNode({ ...parent, childCount: Math.max(parent.childCount - 1, 0) });
      }
      this.state.dependencies = this.state.dependencies.filter(
        (dep) => !removed.has(dep.prerequisiteNodeId) && !removed.has(dep.dependentNodeId),
      );
      this.state.notes = this.state.notes.filter(
        (note) => !note.nodeId || !removed.has(note.nodeId),
      );
      const goal = this.state.goal(goalId);
      if (goal.nextAvailableNode && removed.has(goal.nextAvailableNode.id)) {
        this.state.replaceGoal({ ...goal, nextAvailableNode: null });
      }
    });
  }

  completeNode(goalId: GoalId, nodeId: NodeId): Observable<GoalNode> {
    return this.write(() => {
      const node = this.state.node(goalId, nodeId);
      if (node.availability.state === 'LOCKED') {
        const reason = node.availability.reasons[0];
        throw new AtlasDataError(
          reason
            ? `Complete “${reason.title}” first. This Step is blocked by it.`
            : 'This Step is blocked by an open prerequisite.',
          'conflict',
          { code: 'NODE_LOCKED' },
        );
      }
      if (node.status !== 'COMPLETED') {
        this.state.statusBeforeComplete.set(nodeId, node.status);
        this.state.replaceNode({ ...node, status: 'COMPLETED', version: node.version + 1 });
        this.state.applySampleFixtures();
      }
      return this.state.node(goalId, nodeId);
    });
  }

  reopenNode(goalId: GoalId, nodeId: NodeId): Observable<GoalNode> {
    return this.write(() => {
      const node = this.state.node(goalId, nodeId);
      if (node.status === 'COMPLETED') {
        const status = this.state.statusBeforeComplete.get(nodeId) ?? 'IN_PROGRESS';
        this.state.replaceNode({ ...node, status, version: node.version + 1 });
        this.state.applySampleFixtures();
      }
      return this.state.node(goalId, nodeId);
    });
  }

  dependencies(goalId: GoalId): Observable<readonly GoalDependency[]> {
    return this.answer(`dependencies:${goalId}`, () => {
      this.state.goal(goalId);
      return this.state.dependencies.filter((dep) => dep.goalId === goalId);
    });
  }

  addDependency(
    goalId: GoalId,
    prerequisiteNodeId: NodeId,
    dependentNodeId: NodeId,
  ): Observable<GoalDependency> {
    return this.write(() => {
      this.state.node(goalId, prerequisiteNodeId);
      this.state.node(goalId, dependentNodeId);
      const edges = this.state.dependencies.filter((dep) => dep.goalId === goalId);
      if (
        prerequisiteNodeId === dependentNodeId ||
        this.reaches(edges, dependentNodeId, prerequisiteNodeId)
      ) {
        throw new AtlasDataError(
          'That prerequisite would create a loop. Choose a different one.',
          'conflict',
          { code: 'DEPENDENCY_CYCLE' },
        );
      }
      const existing = edges.find(
        (dep) =>
          dep.prerequisiteNodeId === prerequisiteNodeId && dep.dependentNodeId === dependentNodeId,
      );
      if (existing) {
        return existing;
      }
      const dependency: GoalDependency = {
        id: this.state.nextId('dependency'),
        goalId,
        prerequisiteNodeId,
        dependentNodeId,
      };
      this.state.dependencies = [...this.state.dependencies, dependency];
      return dependency;
    });
  }

  removeDependency(goalId: GoalId, dependencyId: string): Observable<void> {
    return this.write(() => {
      this.state.goal(goalId);
      this.state.dependencies = this.state.dependencies.filter((dep) => dep.id !== dependencyId);
    });
  }

  notes(goalId: GoalId, nodeId: NodeId | null): Observable<readonly GoalNote[]> {
    return this.answer(`notes:${goalId}:${nodeId ?? ''}`, () => {
      this.state.goal(goalId);
      return this.state.notes.filter((note) => note.goalId === goalId && note.nodeId === nodeId);
    });
  }

  addNote(goalId: GoalId, nodeId: NodeId | null, body: string): Observable<GoalNote> {
    return this.write(() => {
      this.state.goal(goalId);
      if (nodeId) {
        this.state.node(goalId, nodeId);
      }
      const now = this.state.now();
      const note: GoalNote = {
        id: this.state.nextId('note'),
        goalId,
        nodeId,
        body,
        createdAt: now,
        updatedAt: now,
      };
      this.state.notes = [...this.state.notes, note];
      return note;
    });
  }

  updateNote(goalId: GoalId, noteId: string, body: string): Observable<GoalNote> {
    return this.write(() => {
      const note = this.state.notes.find((item) => item.id === noteId && item.goalId === goalId);
      if (!note) {
        throw new AtlasDataError('This note no longer exists.', 'not-found');
      }
      const updated = { ...note, body, updatedAt: this.state.now() };
      this.state.notes = this.state.notes.map((item) => (item.id === noteId ? updated : item));
      return updated;
    });
  }

  removeNote(goalId: GoalId, noteId: string): Observable<void> {
    return this.write(() => {
      this.state.goal(goalId);
      this.state.notes = this.state.notes.filter((note) => note.id !== noteId);
    });
  }

  /** A read with the `?mock=` mode; errors thrown by `read` reach the subscriber. */
  private answer<T>(resource: string, read: () => T): Observable<T> {
    return this.responder
      .respond<() => T>(
        resource,
        () => read,
        () => read,
      )
      .pipe(map((value) => value()));
  }

  /** Writes run after the simulated latency, so a failed mode never changes the session state. */
  private write<T>(apply: () => T): Observable<T> {
    return this.responder
      .respond<() => T>(
        this.state.nextWrite(),
        () => apply,
        () => apply,
      )
      .pipe(map((run) => run()));
  }

  /** Moves `node` to `sortOrder` among its siblings and renumbers them 1…n, as `PATCH sortOrder` does. */
  private reorder(goalId: GoalId, node: GoalNode, sortOrder: number): void {
    const siblings = childrenOf(this.state.nodesOf(goalId), node.parentId).filter(
      (item) => item.id !== node.id,
    );
    const index = Math.min(Math.max(sortOrder - 1, 0), siblings.length);
    siblings.splice(index, 0, node);
    const order = new Map(siblings.map((item, position) => [item.id, position + 1]));
    this.state.nodes = this.state.nodes.map((item) =>
      order.has(item.id) ? { ...item, sortOrder: order.get(item.id)! } : item,
    );
  }

  /** Whether `from` already leads to `to` through prerequisite edges (a new `to → from` edge would loop). */
  private reaches(edges: readonly GoalDependency[], from: NodeId, to: NodeId): boolean {
    const queue = [from];
    const seen = new Set<NodeId>();
    while (queue.length) {
      const current = queue.shift()!;
      if (current === to) {
        return true;
      }
      seen.add(current);
      for (const edge of edges) {
        if (edge.prerequisiteNodeId === current && !seen.has(edge.dependentNodeId)) {
          queue.push(edge.dependentNodeId);
        }
      }
    }
    return false;
  }
}
