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
  summary: { earned: 1, planned: 1, redeemed: 0 },
  rewards: [
    reward({}),
    reward({
      nodeId: 'w1',
      sourceTitle: 'Submit application',
      description: 'Dinner out',
      status: 'EARNED',
      earnedAt: '2026-11-10T18:00:00Z',
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
      planned: '1 Planned · Graduation celebration',
      message: '0 of 1 earned award celebrated.',
    });
  });

  it('separates planned and earned celebrations', () => {
    expect(
      vm.awards.map((item) => [item.eyebrow, item.status, item.date, item.redeemable]),
    ).toEqual([
      [
        'Planned celebration',
        'Planned · not earned',
        'Celebration date: Not set · not earned',
        false,
      ],
      ['Earned celebration', 'Earned · ready to celebrate', 'Earned: November 10, 2026', true],
    ]);
    expect(vm.awards[1].linkName).toBe('View Waypoint: Submit application');
    expect(vm.awards[0].link).toBe('/destinations/g1');
  });

  it('links the Destination with its key dates and next milestone', () => {
    expect(vm.destinations[0]).toMatchObject({
      eyebrow: 'Linked Destination · Career',
      progress: 'Active · 50% · 5 of 10 steps complete',
      achieved: '1 Waypoint achieved.',
      keyDates: ['Graduate · 2030 · year precision'],
    });
    expect(vm.next).toMatchObject({
      title: 'Next milestone · Receive admission decision',
      line: '0 of 1 steps complete · March 2027 · month precision',
      value: 0,
    });
  });

  it('records achievements without inventing dates', () => {
    expect(vm.history[0].line).toBe('Career · Completion date: Not provided');
    expect(vm.celebration).toMatchObject({
      body: 'Submit application is complete.',
      note: 'No points. Graduation celebration remains planned.',
    });
  });
});
