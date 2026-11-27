import { inject, Injectable } from '@angular/core';
import type { Goal, GoalId } from '../../models/goal';
import type { GoalDependency } from '../../models/goal-commands';
import type { GoalNode, NodeId } from '../../models/goal-node';
import type { GoalNote } from '../../models/goal-note';
import { AtlasDataError, VERSION_CONFLICT_MESSAGE } from '../data-error';
import { MockResponder } from './mock-responder';
import { recalculate } from './mock-recalculation';
import { SAMPLE_COMPLETION_TIMES } from './sample-fixtures';
import { SAMPLE_GOAL, SAMPLE_GOAL_ID, SAMPLE_NODE_IDS as N, SAMPLE_NODES } from './sample-plan';

/** Seed of the session: deep copies, so the frozen sample constants never change. */
const copy = <T>(value: T): T => structuredClone(value);

/** The sample's one explicit prerequisite (Figma page 08 Blocked detail). */
const SAMPLE_DEPENDENCY_ID = 'sample-dependency-review-before-submit';

/**
 * In-memory plan of the dev mock (F3-1, F3-2). Writes change it for the browser session only; a reload restores the
 * §10.5 sample. It applies the contract's structural rules (ids, order, version, same-goal dependencies, no cycles)
 * and simulates the backend's recalculation (`recalculate`, provisional rules in `mock-recalculation.ts`).
 */
@Injectable({ providedIn: 'root' })
export class MockPlanState {
  readonly goals: Goal[] = [];
  nodes: GoalNode[] = [];
  dependencies: GoalDependency[] = [];
  notes: GoalNote[] = [];
  private readonly completionTimes = new Map<NodeId, string>();
  private sequence = 0;
  private writes = 0;

  constructor() {
    const mode = inject(MockResponder).mode;
    // `empty` is a user without Destinations; `new` is a first visit before onboarding (Flow A).
    if (mode !== 'empty' && mode !== 'new') {
      this.seedSample();
    }
  }

  /** Replaces the session plan with the §10.5 sample (start-up, and onboarding's dev-only "Explore sample plan"). */
  seedSample(): void {
    this.goals.splice(0, this.goals.length, copy(SAMPLE_GOAL));
    this.nodes = copy([...SAMPLE_NODES]);
    this.dependencies = [
      {
        id: SAMPLE_DEPENDENCY_ID,
        goalId: SAMPLE_GOAL_ID,
        prerequisiteNodeId: N.reviewChecklist,
        dependentNodeId: N.submitTheApplication,
      },
    ];
    this.notes = [];
    this.completionTimes.clear();
    this.recalculate();
  }

  /** Unique `?mock=` resource key per write, so `refresh-error` never fails a first write. */
  nextWrite(): string {
    this.writes += 1;
    return `write:${this.writes}`;
  }

  nextId(prefix: string): string {
    this.sequence += 1;
    return `mock-${prefix}-${this.sequence}`;
  }

  now(): string {
    return new Date().toISOString();
  }

  goal(goalId: GoalId): Goal {
    const goal = this.goals.find((item) => item.id === goalId);
    if (!goal) {
      throw new AtlasDataError(`No Destination ${goalId}.`, 'not-found');
    }
    return goal;
  }

  node(goalId: GoalId, nodeId: NodeId): GoalNode {
    const node = this.nodes.find((item) => item.id === nodeId && item.goalId === goalId);
    if (!node) {
      throw new AtlasDataError('This Waypoint or Step no longer exists.', 'not-found');
    }
    return node;
  }

  nodesOf(goalId: GoalId): GoalNode[] {
    return this.nodes.filter((node) => node.goalId === goalId);
  }

  replaceGoal(goal: Goal): Goal {
    const index = this.goals.findIndex((item) => item.id === goal.id);
    this.goals[index] = goal;
    return goal;
  }

  replaceNode(node: GoalNode): GoalNode {
    this.nodes = this.nodes.map((item) => (item.id === node.id ? node : item));
    return node;
  }

  /** `412 VERSION_CONFLICT` when the client edited an outdated copy (API-CONTRACT §4). */
  checkVersion(current: { readonly version: number }, version: number): void {
    if (current.version !== version) {
      throw new AtlasDataError(VERSION_CONFLICT_MESSAGE, 'conflict', { code: 'VERSION_CONFLICT' });
    }
  }

  /**
   * The backend's recalculation after a write (progress, availability, Waypoint status, next Waypoint), simulated
   * by `mock-recalculation.ts` for every Destination. The sample reproduces its Figma values (Flows D and G).
   */
  recalculate(goalId?: GoalId): void {
    for (const goal of this.goals.filter((item) => !goalId || item.id === goalId)) {
      const result = recalculate(
        goal,
        this.nodesOf(goal.id),
        this.dependencies.filter((dep) => dep.goalId === goal.id),
      );
      const updated = new Map(result.nodes.map((node) => [node.id, node]));
      this.nodes = this.nodes.map((node) => {
        const next = updated.get(node.id) ?? node;
        if ((node.status === 'COMPLETED') !== (next.status === 'COMPLETED')) {
          this.markCompleted(node.id, next.status === 'COMPLETED');
        }
        return next;
      });
      this.replaceGoal(result.goal);
    }
  }

  /** When a node was completed: this session's completion, else the sample's fixture time. */
  completedAt(nodeId: NodeId): string | null {
    return this.completionTimes.get(nodeId) ?? SAMPLE_COMPLETION_TIMES[nodeId] ?? null;
  }

  /** Records a status change into or out of Completed. */
  markCompleted(nodeId: NodeId, completed: boolean): void {
    if (completed) {
      this.completionTimes.set(nodeId, this.now());
    } else {
      this.completionTimes.delete(nodeId);
    }
  }
}
