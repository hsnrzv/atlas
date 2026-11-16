import type { AwardItem, Awards } from '../../../core/models/awards';
import type { Dashboard } from '../../../core/models/dashboard';
import { toAwardsVm } from './awards.view-model';

const progress = { percent: '50.0', countedWeight: '5', totalWeight: '10' };

const dashboard = {
  today: '2026-11-12',
  activeGoals: [
    {
      id: 'g1',
      title: 'Master’s degree',
      primaryAreaKey: 'CAREER',
      progress,
      nextNode: {
        id: 'w2',
        title: 'Receive admission decision',
        status: 'NOT_STARTED',
        availability: { state: 'AVAILABLE', reasons: [], override: null },
        dueDate: { date: '2027-03-01', precision: 'MONTH' },
        progress: { percent: '0.0', countedWeight: '0', totalWeight: '1' },
      },
      targetDate: null,
      reward: null,
      achievedWaypoints: 1,
      keyDates: [
        { nodeId: 'w3', title: 'Graduate', date: { date: '2030-01-01', precision: 'YEAR' } },
      ],
    },
    {
      id: 'g2',
      title: 'Gym session',
      primaryAreaKey: 'HEALTH',
      progress: { percent: '0.0', countedWeight: '0', totalWeight: '2' },
      nextNode: {
        id: 'c1',
        title: 'Cardio',
        status: 'IN_PROGRESS',
        availability: { state: 'LOCKED', reasons: [], override: null },
        dueDate: { date: '2026-11-16', precision: 'DAY' },
        progress: { percent: '0.0', countedWeight: '0', totalWeight: '2' },
      },
      targetDate: null,
      reward: null,
      achievedWaypoints: 0,
      keyDates: [],
    },
  ],
} as unknown as Dashboard;

const reward = (overrides: Partial<AwardItem>): AwardItem => ({
  goalId: 'g1',
  nodeId: null,
  sourceTitle: 'Master’s degree',
  areaKey: 'CAREER',
  description: 'Graduation celebration',
  status: 'PLANNED',
  earnedAt: null,
  redeemedAt: null,
  ...overrides,
});

const awards: Awards = {
  summary: { earned: 1, planned: 2, redeemed: 0 },
  rewards: [
    reward({}),
    reward({
      nodeId: 'w1',
      sourceTitle: 'Submit application',
      description: 'Dinner out',
      status: 'EARNED',
      earnedAt: '2026-11-10T18:00:00Z',
    }),
    reward({
      goalId: 'g2',
      sourceTitle: 'Gym session',
      areaKey: 'HEALTH',
      description: 'Protein shake',
    }),
  ],
  achievedWaypoints: [
    {
      goalId: 'g1',
      nodeId: 'w1',
      title: 'Submit application',
      areaKey: 'CAREER',
      completedAt: null,
      progress,
    },
  ],
};

describe('awards view model', () => {
  const vm = toAwardsVm({ awards, dashboard }, 'en-US', false);

  it('uses the backend counts', () => {
    expect(vm.summary).toEqual({
      heading: '1 Earned',
      planned: '2 Planned · Graduation celebration, Protein shake',
      message: '0 of 1 earned award celebrated.',
    });
  });

  it('separates planned and earned celebrations', () => {
    const awardsOf = vm.groups[0].awards;
    expect(awardsOf.map((item) => [item.eyebrow, item.status, item.date, item.redeemable])).toEqual(
      [
        [
          'Planned celebration',
          'Planned · not earned',
          'Celebration date: Not set · not earned',
          false,
        ],
        ['Earned celebration', 'Earned · ready to celebrate', 'Earned: November 10, 2026', true],
      ],
    );
    expect(awardsOf[1].linkName).toBe('View Waypoint: Submit application');
    expect(awardsOf[0].link).toBe('/destinations/g1');
  });

  it('places each Destination beside its own awards', () => {
    expect(
      vm.groups.map((group) => [
        group.destination?.eyebrow,
        group.awards.map((item) => item.title),
      ]),
    ).toEqual([
      ['Linked Destination · Career', ['Graduation celebration', 'Dinner out']],
      ['Linked Destination · Health', ['Protein shake']],
    ]);
  });

  it('links the Destination with its key dates and lists every next milestone', () => {
    expect(vm.groups[0].destination).toMatchObject({
      eyebrow: 'Linked Destination · Career',
      progress: 'Active · 50% · 5 of 10 steps complete',
      achieved: '1 Waypoint achieved.',
      keyDates: ['Graduate · 2030 · year precision'],
    });
    expect(vm.next).toEqual([
      expect.objectContaining({
        title: 'Receive admission decision',
        destination: 'Master’s degree',
        status: 'not-started',
        blocked: false,
        line: '0% · 0 of 1 steps complete · March 2027 · month precision',
        link: '/destinations/g1/waypoints/w2',
      }),
      expect.objectContaining({
        title: 'Cardio',
        status: 'in-progress',
        blocked: true,
        line: '0% · 0 of 2 steps complete · November 16, 2026',
      }),
    ]);
  });

  it('records achievements without inventing dates', () => {
    expect(vm.history[0].line).toBe('Career · Completion date: Not provided');
    expect(vm.celebration).toMatchObject({
      body: 'Submit application is complete.',
      note: 'No points. Graduation celebration, Protein shake remain planned.',
    });
  });
});
