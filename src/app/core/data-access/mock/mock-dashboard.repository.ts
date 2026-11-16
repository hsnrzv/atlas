import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Dashboard, DashboardGoal, LifeBalanceEntry } from '../../models/dashboard';
import type { Goal } from '../../models/goal';
import type { GoalNode } from '../../models/goal-node';
import type { IkigaiAreaKey } from '../../models/life-dimension';
import type { IsoDate } from '../../models/planned-date';
import { DashboardRepository } from '../ports/dashboard.repository';
import { MockPlanState } from './mock-plan-state';
import { MockResponder } from './mock-responder';
import { areaProgress, nextOpenWaypoint } from './mock-recalculation';
import { SAMPLE_COMPLETION_TIMES } from './sample-fixtures';
import { SAMPLE_GOAL, SAMPLE_GOAL_ID, SAMPLE_NODE_IDS as N, SAMPLE_NODES } from './sample-plan';
import { ATLAS_MOCK_SENTINEL } from './sentinel';

/** Ikigai areas in API order with their contract labels (API-CONTRACT §9.4). */
export const SAMPLE_AREAS: readonly (readonly [IkigaiAreaKey, string])[] = [
  ['CAREER', 'Career'],
  ['FINANCE', 'Finance'],
  ['HEALTH', 'Health'],
  ['LOVE', 'Love'],
  ['PASSION', 'Passion'],
  ['FRIENDSHIP', 'Friendship'],
  ['FAMILY', 'Family'],
];

/** The sample's key dates as drawn in Figma page 05; other Destinations list their later dated Waypoints. */
const SAMPLE_KEY_DATES: readonly string[] = [N.admissionDecision, N.startStudying, N.graduate];

/** The user's local calendar date: the backend's `today` for this user (FQ-14). */
export function localToday(now = new Date()): IsoDate {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

interface MockGoalPlan {
  readonly goal: Goal;
  readonly nodes: readonly GoalNode[];
}

function lifeBalance(plans: readonly MockGoalPlan[]): LifeBalanceEntry[] {
  return SAMPLE_AREAS.map(([areaKey, label]) => {
    const inArea = plans.filter((plan) => plan.goal.primaryAreaKey === areaKey);
    return {
      areaKey,
      label,
      activeGoals: inArea.length,
      progress: areaProgress(inArea.map((plan) => plan.nodes)),
    };
  });
}

function dashboardGoal({ goal, nodes }: MockGoalPlan): DashboardGoal {
  const next = nextOpenWaypoint(nodes);
  const waypoints = nodes
    .filter((node) => node.parentId === null && node.nodeType !== 'TASK')
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const later = next ? waypoints.slice(waypoints.indexOf(next) + 1) : [];
  const keyDates =
    goal.id === SAMPLE_GOAL_ID
      ? SAMPLE_KEY_DATES.map((id) => nodes.find((node) => node.id === id)).filter((node) => !!node)
      : later.filter((node) => node.dueDate);
  return {
    id: goal.id,
    title: goal.title,
    primaryAreaKey: goal.primaryAreaKey,
    progress: goal.progress,
    targetDate: goal.targetDate,
    reward: goal.reward,
    achievedWaypoints: waypoints.filter((node) => node.status === 'COMPLETED').length,
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
    keyDates: keyDates.map((node) => ({ nodeId: node.id, title: node.title, date: node.dueDate })),
  };
}

/**
 * The dashboard of the session's Destinations, oldest first so the §10.5 sample stays the My Atlas focus. Progress,
 * Waypoint statuses and the next Waypoint come from the simulated recalculation (`mock-recalculation.ts`).
 */
export function mockDashboard(
  plans: readonly MockGoalPlan[],
  completedAt: (nodeId: string) => string | null = () => null,
  today: IsoDate = localToday(),
): Dashboard {
  const goals = plans.map(dashboardGoal);
  const ref = (goal: Goal, node: GoalNode) => ({
    goalId: goal.id,
    nodeId: node.id,
    title: node.title,
    nodeType: node.nodeType,
  });
  const all = plans.flatMap(({ goal, nodes }) =>
    [...nodes].sort((a, b) => a.sortOrder - b.sortOrder).map((node) => ({ goal, node })),
  );
  return {
    today,
    focus: null,
    lifeBalance: lifeBalance(plans),
    activeGoals: goals,
    upcomingDeadlines: goals
      .flatMap((goal) =>
        goal.nextNode?.dueDate
          ? [
              {
                goalId: goal.id,
                nodeId: goal.nextNode.id,
                title: goal.nextNode.title,
                dueDate: goal.nextNode.dueDate,
              },
            ]
          : [],
      )
      .sort((a, b) => a.dueDate.date.localeCompare(b.dueDate.date)),
    moneySnapshot: null,
    timeCapacity: null,
    recentAchievements: all
      .filter(({ node }) => node.status === 'COMPLETED')
      .map(({ goal, node }) => ({ ...ref(goal, node), completedAt: completedAt(node.id) }))
      .filter((item): item is typeof item & { completedAt: string } => !!item.completedAt)
      .sort((a, b) => b.completedAt.localeCompare(a.completedAt)),
    inProgress: all
      .filter(({ node }) => node.nodeType === 'TASK' && node.status === 'IN_PROGRESS')
      .map(({ goal, node }) => ref(goal, node)),
    summary: {
      activeGoals: goals.length,
      achievedWaypoints: goals.reduce((sum, goal) => sum + goal.achievedWaypoints, 0),
    },
  };
}

/** The untouched §10.5 sample's dashboard (Figma page 05). */
export function sampleDashboard(today?: IsoDate): Dashboard {
  return mockDashboard(
    [{ goal: SAMPLE_GOAL, nodes: SAMPLE_NODES }],
    (id) => SAMPLE_COMPLETION_TIMES[id] ?? null,
    today,
  );
}

export function emptyDashboard(today?: IsoDate): Dashboard {
  return mockDashboard([], undefined, today);
}

/**
 * Dev-only dashboard adapter (F2-2). Built from the session's `MockPlanState`, so every session Destination and its
 * writes show on My Atlas, Life Dimensions, Journey and Milestone Awards. `today` is the user's local date. Never
 * referenced by production builds.
 */
@Injectable({ providedIn: 'root' })
export class MockDashboardRepository extends DashboardRepository {
  readonly source = ATLAS_MOCK_SENTINEL;
  private readonly responder = inject(MockResponder);
  private readonly state = inject(MockPlanState);

  dashboard(): Observable<Dashboard> {
    const current = () =>
      mockDashboard(
        this.state.goals
          .filter((goal) => !this.state.archived.has(goal.id))
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
          .map((goal) => ({ goal, nodes: this.state.nodesOf(goal.id) })),
        (id) => this.state.completedAt(id),
      );
    return this.responder.respond('dashboard', current, () => emptyDashboard());
  }
}
