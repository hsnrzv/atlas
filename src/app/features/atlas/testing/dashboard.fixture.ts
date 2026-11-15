import type { Dashboard, DashboardGoal } from '../../../core/models/dashboard';

/** Small dashboard for feature specs. Feature code must not import the mock (eslint), so specs build their own. */
export function testGoal(overrides: Partial<DashboardGoal> = {}): DashboardGoal {
  return {
    id: 'g1',
    title: 'Run a marathon',
    primaryAreaKey: 'HEALTH',
    progress: {
      percent: '30.0',
      policy: 'DERIVED',
      countedWeight: '3',
      totalWeight: '10',
      excludedNodes: [{ nodeId: 'n9', title: 'Optional race' }],
    },
    nextNode: {
      id: 'n1',
      title: 'Finish a half marathon',
      nodeType: 'MILESTONE',
      status: 'IN_PROGRESS',
      availability: { state: 'AVAILABLE' },
      dueDate: { date: '2027-03-01', precision: 'MONTH' },
      progress: { percent: '50.0', countedWeight: '1', totalWeight: '2' },
    },
    targetDate: { date: '2028-01-01', precision: 'YEAR' },
    reward: null,
    achievedWaypoints: 1,
    keyDates: [
      { nodeId: 'n2', title: 'Register for the race', date: null },
      { nodeId: 'n3', title: 'Race day', date: { date: '2028-01-01', precision: 'YEAR' } },
    ],
    ...overrides,
  };
}

export function testDashboard(overrides: Partial<Dashboard> = {}): Dashboard {
  return {
    today: '2026-11-12',
    focus: null,
    lifeBalance: [
      { areaKey: 'HEALTH', label: 'Health', activeGoals: 1, progress: { percent: '30.0' } },
      { areaKey: 'FINANCE', label: 'Finance', activeGoals: 0, progress: null },
    ],
    activeGoals: [testGoal()],
    upcomingDeadlines: [
      {
        goalId: 'g1',
        nodeId: 'n1',
        title: 'Finish a half marathon',
        dueDate: { date: '2027-03-01', precision: 'MONTH' },
      },
    ],
    moneySnapshot: null,
    timeCapacity: null,
    recentAchievements: [
      {
        goalId: 'g1',
        nodeId: 's1',
        title: 'Buy running shoes',
        completedAt: '2026-11-10T08:00:00Z',
        nodeType: 'TASK',
      },
      {
        goalId: 'g1',
        nodeId: 'w1',
        title: 'Run 10 km',
        completedAt: '2026-11-01T08:00:00Z',
        nodeType: 'MILESTONE',
      },
    ],
    inProgress: [{ goalId: 'g1', nodeId: 's2', title: 'Weekly long run', nodeType: 'TASK' }],
    summary: { activeGoals: 1, achievedWaypoints: 1 },
    ...overrides,
  };
}

export function emptyDashboard(): Dashboard {
  return testDashboard({
    activeGoals: [],
    upcomingDeadlines: [],
    recentAchievements: [],
    inProgress: [],
    lifeBalance: [],
    summary: { activeGoals: 0, achievedWaypoints: 0 },
  });
}
