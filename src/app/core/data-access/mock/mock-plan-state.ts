import { inject, Injectable } from '@angular/core';
import type { Goal, GoalId } from '../../models/goal';
import type { GoalDependency } from '../../models/goal-commands';
import type { GoalNode, NodeAvailability, NodeId, NodeStatus } from '../../models/goal-node';
import type { GoalNote } from '../../models/goal-note';
import { AtlasDataError } from '../data-error';
import { MockResponder } from './mock-responder';
import { SAMPLE_STAGES, type SampleStage } from './sample-fixtures';
import { SAMPLE_GOAL, SAMPLE_GOAL_ID, SAMPLE_NODE_IDS as N, SAMPLE_NODES } from './sample-plan';

/** Seed of the session: deep copies, so the frozen sample constants never change. */
const copy = <T>(value: T): T => structuredClone(value);

/** The five Steps of "Submit application"; their completed count selects the fixture stage. */
const APPLICATION_STEPS: readonly NodeId[] = [
  N.confirmRequirements,
  N.gatherRecords,
  N.draftStatement,
  N.reviewChecklist,
  N.submitTheApplication,
];

/** The sample's one explicit prerequisite (Figma page 08 Blocked detail). */
const SAMPLE_DEPENDENCY_ID = 'sample-dependency-review-before-submit';

const AVAILABLE: NodeAvailability = { state: 'AVAILABLE', reasons: [], override: null };
const SUBMIT_LOCKED = SAMPLE_NODES.find((node) => node.id === N.submitTheApplication)
  ?.availability as NodeAvailability;

/**
 * In-memory plan of the dev mock (F3-1, F3-2). Writes change it for the browser session only; a reload restores the
 * §10.5 sample. It applies the contract's structural rules (ids, order, version, same-goal dependencies, no cycles)
 * and swaps in the Flow D fixture, but never derives progress or availability (frontend.md §6.3–§6.4).
 */
@Injectable({ providedIn: 'root' })
export class MockPlanState {
  readonly goals: Goal[] = [];
  nodes: GoalNode[] = [];
  dependencies: GoalDependency[] = [];
  notes: GoalNote[] = [];
  readonly archived = new Set<GoalId>();
  /** Work status before `complete`, so `reopen` can restore it (the reopen target is FQ-10). */
  readonly statusBeforeComplete = new Map<NodeId, NodeStatus>();
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
    this.archived.clear();
    this.statusBeforeComplete.clear();
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
   * Flows D and G (Figma page 08 Updated scenario, page 14 Milestone example): the backend recalculates progress,
   * unlocks and the Waypoint status after every Step change. The mock swaps in the fixture stage for the number of
   * completed application Steps (`SAMPLE_STAGES`) and the sample's two availability fixtures for "Submit the
   * application"; any other change keeps the current values. Nothing is computed.
   */
  applySampleFixtures(): void {
    if (!this.goals.some((goal) => goal.id === SAMPLE_GOAL_ID)) {
      return;
    }
    const stage = this.sampleStage();
    const review = this.nodes.find((node) => node.id === N.reviewChecklist);
    const dependency = this.dependencies.some((dep) => dep.id === SAMPLE_DEPENDENCY_ID);
    this.nodes = this.nodes.map((node) => {
      if (node.id === N.submitTheApplication && review && dependency) {
        return {
          ...node,
          availability: review.status === 'COMPLETED' ? AVAILABLE : SUBMIT_LOCKED,
        };
      }
      if (node.id === N.submitApplication && stage) {
        return { ...node, progress: stage.application, status: stage.applicationStatus };
      }
      return node;
    });
    if (stage) {
      const goal = this.goal(SAMPLE_GOAL_ID);
      const next = stage.achievedWaypoints
        ? this.nodes.find((node) => node.id === N.admissionDecision)
        : this.nodes.find((node) => node.id === N.submitApplication);
      this.replaceGoal({
        ...goal,
        progress: stage.goal,
        nextAvailableNode: next ? { id: next.id, title: next.title } : goal.nextAvailableNode,
      });
    }
  }

  /** The fixture stage of the sample, or `null` when no stage matches (e.g. a reopened sample Step). */
  sampleStage(): SampleStage | null {
    const done = this.nodes.filter(
      (node) => APPLICATION_STEPS.includes(node.id) && node.status === 'COMPLETED',
    ).length;
    return SAMPLE_STAGES[done] ?? null;
  }
}
