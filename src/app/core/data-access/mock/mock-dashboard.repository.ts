import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Dashboard, LifeBalanceEntry } from '../../models/dashboard';
import type { Goal } from '../../models/goal';
import type { GoalNode } from '../../models/goal-node';
import type { IkigaiAreaKey } from '../../models/life-dimension';
import { DashboardRepository } from '../ports/dashboard.repository';
import { MockPlanState } from './mock-plan-state';
import { MockResponder } from './mock-responder';
import {
  SAMPLE_COMPLETED_AT,
  SAMPLE_PROGRESS,
  SAMPLE_PROGRESS_AFTER_DRAFT,
  SAMPLE_SUMMARY,
} from './sample-fixtures';
import {
  SAMPLE_GOAL,
  SAMPLE_GOAL_ID,
  SAMPLE_NODE_IDS as N,
  SAMPLE_NODES,
  SAMPLE_TODAY,
} from './sample-plan';
import { ATLAS_MOCK_SENTINEL } from './sentinel';

/** Ikigai areas in API order with their contract labels (API-CONTRACT §9.4). */
const AREAS: readonly (readonly [IkigaiAreaKey, string])[] = [
  ['CAREER', 'Career'],
  ['FINANCE', 'Finance'],
  ['HEALTH', 'Health'],
  ['LOVE', 'Love'],
  ['PASSION', 'Passion'],
  ['FRIENDSHIP', 'Friendship'],
  ['FAMILY', 'Family'],
];

function lifeBalance(career: Dashboard['lifeBalance'][number]['progress']): LifeBalanceEntry[] {
  return AREAS.map(([areaKey, label]) => {
    const active = career !== null && areaKey === SAMPLE_GOAL.primaryAreaKey;
    return {
      areaKey,
      label,
      activeGoals: active ? 1 : 0,
      progress: active ? career : null,
    };
  });
}

/**
 * The §10.5 dashboard for the current sample goal and nodes (default: the untouched sample). `afterDraft` swaps in
 * the Flow D Career value; nothing is derived here.
 */
export function sampleDashboard(
  goal: Goal = SAMPLE_GOAL,
  nodes: readonly GoalNode[] = SAMPLE_NODES,
  afterDraft = false,
): Dashboard {
  const present = (ids: readonly string[]) =>
    ids.map((id) => nodes.find((node) => node.id === id)).filter((node) => !!node);
  const [next] = present([N.submitApplication]);
  const ref = (node: GoalNode) => ({
    goalId: goal.id,
    nodeId: node.id,
    title: node.title,
    nodeType: node.nodeType,
  });
  const completedAt: Readonly<Record<string, string>> = {
    [N.confirmRequirements]: SAMPLE_COMPLETED_AT.confirmRequirements,
    [N.gatherRecords]: SAMPLE_COMPLETED_AT.gatherRecords,
    [N.draftStatement]: SAMPLE_COMPLETED_AT.draftStatement,
  };
  const achieved = present([N.draftStatement, N.gatherRecords, N.confirmRequirements]).filter(
    (node) => node.status === 'COMPLETED',
  );
  return {
    today: SAMPLE_TODAY,
    focus: null,
    lifeBalance: lifeBalance(
      afterDraft ? SAMPLE_PROGRESS_AFTER_DRAFT.career : SAMPLE_PROGRESS.career,
    ),
    activeGoals: [
      {
        id: goal.id,
        title: goal.title,
        primaryAreaKey: goal.primaryAreaKey,
        progress: goal.progress,
        targetDate: goal.targetDate,
        reward: goal.reward,
        achievedWaypoints: SAMPLE_SUMMARY.achievedWaypoints,
        nextNode: next
          ? {
              id: next.id,
              title: next.title,
              nodeType: next.nodeType,
              status: next.status,
              availability: { state: next.availability.state },
              dueDate: next.dueDate,
              progress: next.progress,
            }
          : null,
        keyDates: present([N.admissionDecision, N.startStudying, N.graduate]).map((node) => ({
          nodeId: node.id,
          title: node.title,
          date: node.dueDate,
        })),
      },
    ],
    upcomingDeadlines: next?.dueDate
      ? [{ goalId: goal.id, nodeId: next.id, title: next.title, dueDate: next.dueDate }]
      : [],
    moneySnapshot: null,
    timeCapacity: null,
    recentAchievements: achieved.map((node) => ({
      ...ref(node),
      completedAt: completedAt[node.id],
    })),
    inProgress: present([N.draftStatement])
      .filter((node) => node.status === 'IN_PROGRESS')
      .map(ref),
    summary: SAMPLE_SUMMARY,
  };
}

export function emptyDashboard(): Dashboard {
  return {
    today: SAMPLE_TODAY,
    focus: null,
    lifeBalance: lifeBalance(null),
    activeGoals: [],
    upcomingDeadlines: [],
    moneySnapshot: null,
    timeCapacity: null,
    recentAchievements: [],
    inProgress: [],
    summary: { activeGoals: 0, achievedWaypoints: 0 },
  };
}

/**
 * Dev-only dashboard adapter (F2-2). Built from the session's `MockPlanState`, so Destination writes and Flow D show
 * on My Atlas. Only the §10.5 sample has a dashboard; other mock Destinations are not summarised (production-readiness
 * §2.1). Never referenced by production builds.
 */
@Injectable({ providedIn: 'root' })
export class MockDashboardRepository extends DashboardRepository {
  readonly source = ATLAS_MOCK_SENTINEL;
  private readonly responder = inject(MockResponder);
  private readonly state = inject(MockPlanState);

  dashboard(): Observable<Dashboard> {
    const current = () => {
      const goal = this.state.goals.find((item) => item.id === SAMPLE_GOAL_ID);
      return goal && !this.state.archived.has(goal.id)
        ? sampleDashboard(goal, this.state.nodesOf(goal.id), this.state.sampleAfterDraft())
        : emptyDashboard();
    };
    return this.responder.respond('dashboard', current, emptyDashboard);
  }
}
