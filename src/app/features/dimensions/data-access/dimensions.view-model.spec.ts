import type { Dashboard } from '../../../core/models/dashboard';
import { toDimensionDetailVm, toDimensionsVm } from './dimensions.view-model';

const progress = { percent: '20.0', countedWeight: '2', totalWeight: '10' };

const dashboard = {
  today: '2026-11-15',
  lifeBalance: [
    { areaKey: 'CAREER', label: 'Career', activeGoals: 1, progress },
    { areaKey: 'HEALTH', label: 'Health', activeGoals: 0, progress: null },
  ],
  activeGoals: [
    {
      id: 'goal-1',
      title: 'Complete a Master’s degree',
      primaryAreaKey: 'CAREER',
      progress,
      nextNode: {
        id: 'node-1',
        title: 'Submit application',
        dueDate: { date: '2026-12-01', precision: 'MONTH' },
        progress: { percent: '40.0', countedWeight: '2', totalWeight: '5' },
      },
      targetDate: { date: '2030-01-01', precision: 'YEAR' },
      reward: { description: 'Graduation celebration', status: 'PLANNED' },
      achievedWaypoints: 0,
      keyDates: [
        { nodeId: 'node-3', title: 'Graduate', date: { date: '2030-01-01', precision: 'YEAR' } },
      ],
    },
  ],
} as unknown as Dashboard;

describe('dimensions view model', () => {
  it('lists the seven dimensions and links only those with Destinations', () => {
    const vm = toDimensionsVm(dashboard, 'en-US', true);

    expect(vm.cards.map((card) => card.key)).toEqual([
      'career',
      'finance',
      'health',
      'love',
      'passion',
      'friendship',
      'family',
    ]);
    expect(vm.cards[0]).toMatchObject({
      destinations: 1,
      progress: 20,
      action: { label: 'View Career', path: '/dimensions/career', query: null },
    });
    expect(vm.cards[2]).toMatchObject({
      destinations: 0,
      progress: null,
      action: { label: 'Add intention', path: '/destinations', query: { create: 'HEALTH' } },
    });
    expect(vm.meta).toBe('Sample plan · November 15, 2026 · 1 active Destination');
    expect(vm.summary).toContain('Career: 1 Destination · 20% complete.');
  });

  it('describes one dimension with its Destinations and next step', () => {
    const vm = toDimensionDetailVm('career', dashboard, 'en-US', false)!;

    expect(vm.dimension.label).toBe('Career');
    expect(vm.description).toBe('A direction for learning, work and what comes next.');
    expect(vm.meta).toBeNull();
    expect(vm.goals).toHaveLength(1);
    expect(vm.goals[0]).toMatchObject({
      title: 'Complete a Master’s degree',
      link: '/destinations/goal-1',
      achieved: '0 Waypoints achieved',
    });
    expect(vm.goals[0].next?.link).toBe('/destinations/goal-1/waypoints/node-1');
    expect(vm.nextLines[0]).toBe('Submit application · December 2026 · month precision');
    expect(vm.caption).toContain('Progress reflects completed Steps, not a life score.');
  });

  it('has no Destinations for an unused dimension and no view for an unknown key', () => {
    expect(toDimensionDetailVm('health', dashboard, 'en-US', false)?.goals).toEqual([]);
    expect(toDimensionDetailVm('wealth', dashboard, 'en-US', false)).toBeNull();
  });
});
