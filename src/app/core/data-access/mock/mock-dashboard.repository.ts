import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Dashboard, LifeBalanceEntry } from '../../models/dashboard';
import type { IkigaiAreaKey } from '../../models/life-dimension';
import { DashboardRepository } from '../ports/dashboard.repository';
import { MockResponder } from './mock-responder';
import { SAMPLE_COMPLETED_AT, SAMPLE_PROGRESS, SAMPLE_SUMMARY } from './sample-fixtures';
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

const nodeById = (id: string) => SAMPLE_NODES.find((node) => node.id === id)!;

function lifeBalance(withSample: boolean): LifeBalanceEntry[] {
  return AREAS.map(([areaKey, label]) => {
    const active = withSample && areaKey === SAMPLE_GOAL.primaryAreaKey;
    return {
      areaKey,
      label,
      activeGoals: active ? 1 : 0,
      progress: active ? SAMPLE_PROGRESS.career : null,
    };
  });
}

export function sampleDashboard(): Dashboard {
  const next = nodeById(N.submitApplication);
  const ref = (id: string) => {
    const node = nodeById(id);
    return { goalId: SAMPLE_GOAL_ID, nodeId: node.id, title: node.title, nodeType: node.nodeType };
  };
  const keyDate = (id: string) => {
    const node = nodeById(id);
    return { nodeId: node.id, title: node.title, date: node.dueDate };
  };
  return {
    today: SAMPLE_TODAY,
    focus: null,
    lifeBalance: lifeBalance(true),
    activeGoals: [
      {
        id: SAMPLE_GOAL.id,
        title: SAMPLE_GOAL.title,
        primaryAreaKey: SAMPLE_GOAL.primaryAreaKey,
        progress: SAMPLE_GOAL.progress,
        targetDate: SAMPLE_GOAL.targetDate,
        reward: SAMPLE_GOAL.reward,
        achievedWaypoints: SAMPLE_SUMMARY.achievedWaypoints,
        nextNode: {
          id: next.id,
          title: next.title,
          nodeType: next.nodeType,
          status: next.status,
          availability: { state: next.availability.state },
          dueDate: next.dueDate,
          progress: next.progress,
        },
        keyDates: [keyDate(N.admissionDecision), keyDate(N.startStudying), keyDate(N.graduate)],
      },
    ],
    upcomingDeadlines: [
      { goalId: SAMPLE_GOAL_ID, nodeId: next.id, title: next.title, dueDate: next.dueDate! },
    ],
    moneySnapshot: null,
    timeCapacity: null,
    recentAchievements: [
      { ...ref(N.confirmRequirements), completedAt: SAMPLE_COMPLETED_AT.confirmRequirements },
      { ...ref(N.gatherRecords), completedAt: SAMPLE_COMPLETED_AT.gatherRecords },
    ],
    inProgress: [ref(N.draftStatement)],
    summary: SAMPLE_SUMMARY,
  };
}

export function emptyDashboard(): Dashboard {
  return {
    today: SAMPLE_TODAY,
    focus: null,
    lifeBalance: lifeBalance(false),
    activeGoals: [],
    upcomingDeadlines: [],
    moneySnapshot: null,
    timeCapacity: null,
    recentAchievements: [],
    inProgress: [],
    summary: { activeGoals: 0, achievedWaypoints: 0 },
  };
}

/** Dev-only dashboard adapter (F2-2). Never referenced by production builds. */
@Injectable({ providedIn: 'root' })
export class MockDashboardRepository extends DashboardRepository {
  readonly source = ATLAS_MOCK_SENTINEL;
  private readonly responder = inject(MockResponder);

  dashboard(): Observable<Dashboard> {
    return this.responder.respond('dashboard', sampleDashboard, emptyDashboard);
  }
}
