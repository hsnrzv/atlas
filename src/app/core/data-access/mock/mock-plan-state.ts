import { inject, Injectable } from '@angular/core';
import type { Goal, GoalId } from '../../models/goal';
import type { GoalDependency } from '../../models/goal-commands';
import type { GoalNode, NodeId, NodeStatus } from '../../models/goal-node';
import type { GoalNote } from '../../models/goal-note';
import { AtlasDataError } from '../data-error';
import { MockResponder } from './mock-responder';
import { SAMPLE_PROGRESS, SAMPLE_PROGRESS_AFTER_DRAFT } from './sample-fixtures';
import { SAMPLE_GOAL, SAMPLE_GOAL_ID, SAMPLE_NODE_IDS as N, SAMPLE_NODES } from './sample-plan';

/** Seed of the session: deep copies, so the frozen sample constants never change. */
const copy = <T>(value: T): T => structuredClone(value);

/**
 * In-memory plan of the dev mock (F3-1, F3-2). Writes change it for the browser session only; a reload restores the
 * §10.5 sample. It applies the contract's structural rules (ids, order, version, same-goal dependencies, no cycles)
 * and swaps in the Flow D fixture, but never derives progress or availability (frontend.md §6.3–§6.4).
 */
@Injectable({ providedIn: 'root' })
export class MockPlanState {
  readonly goals: Goal[];
  nodes: GoalNode[];
  dependencies: GoalDependency[] = [];
  notes: GoalNote[] = [];
  readonly archived = new Set<GoalId>();
  /** Work status before `complete`, so `reopen` can restore it (the reopen target is FQ-10). */
  readonly statusBeforeComplete = new Map<NodeId, NodeStatus>();
  private sequence = 0;
  private writes = 0;

  constructor() {
    const seeded = inject(MockResponder).mode !== 'empty';
    this.goals = seeded ? [copy(SAMPLE_GOAL)] : [];
    this.nodes = seeded ? copy([...SAMPLE_NODES]) : [];
    if (seeded) {
      // The §10.5 sample's one explicit prerequisite (Figma page 08 Blocked detail).
      this.dependencies = [
        {
          id: 'sample-dependency-review-before-submit',
          goalId: SAMPLE_GOAL_ID,
          prerequisiteNodeId: N.reviewChecklist,
          dependentNodeId: N.submitTheApplication,
        },
      ];
    }
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
      throw new AtlasDataError(
        'This was changed elsewhere. Reload to see the latest version, then try again.',
        'conflict',
        { code: 'VERSION_CONFLICT' },
      );
    }
  }

  /**
   * Flow D (Figma page 08 Updated scenario): when "Draft personal statement" is completed, the backend would report
   * 60 % for the application and 30 % for the Destination. The mock swaps between the two fixture sets by that one
   * status; any other change keeps the current values.
   */
  applySampleFixtures(): void {
    const draft = this.nodes.find((node) => node.id === N.draftStatement);
    if (!draft || !this.goals.some((goal) => goal.id === SAMPLE_GOAL_ID)) {
      return;
    }
    const after = draft.status === 'COMPLETED';
    const application = after
      ? SAMPLE_PROGRESS_AFTER_DRAFT.submitApplication
      : SAMPLE_PROGRESS.nodes[N.submitApplication];
    const goalProgress = after ? SAMPLE_PROGRESS_AFTER_DRAFT.goal : SAMPLE_PROGRESS.goal;
    this.nodes = this.nodes.map((node) =>
      node.id === N.submitApplication ? { ...node, progress: application } : node,
    );
    const goal = this.goal(SAMPLE_GOAL_ID);
    this.replaceGoal({ ...goal, progress: goalProgress });
  }

  /** Whether the sample's Flow D post-state is active, for the dashboard's Career value. */
  sampleAfterDraft(): boolean {
    return this.nodes.some((node) => node.id === N.draftStatement && node.status === 'COMPLETED');
  }
}
