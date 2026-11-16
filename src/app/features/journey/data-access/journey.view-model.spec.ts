import type { Dashboard } from '../../../core/models/dashboard';
import type { TimelineItem } from '../../../core/models/timeline';
import { toJourneyVm } from './journey.view-model';

const base = {
  goalId: 'g1',
  goalTitle: 'Master’s degree',
  parentId: null,
  areaKey: 'CAREER',
} as const;

const items: TimelineItem[] = [
  {
    ...base,
    nodeId: 'w1',
    nodeType: 'MILESTONE',
    title: 'Submit application',
    status: 'IN_PROGRESS',
    date: { date: '2026-12-01', precision: 'MONTH' },
    progress: { percent: '40.0', countedWeight: '2', totalWeight: '5' },
  },
  {
    ...base,
    nodeId: null,
    nodeType: null,
    title: 'Master’s degree',
    status: 'ACTIVE',
    date: { date: '2030-01-01', precision: 'YEAR' },
    progress: { percent: '20.0', countedWeight: '2', totalWeight: '10' },
  },
  {
    ...base,
    nodeId: 'w2',
    nodeType: 'MILESTONE',
    title: 'Graduate',
    status: 'NOT_STARTED',
    date: { date: '2030-01-01', precision: 'YEAR' },
    progress: null,
  },
  {
    ...base,
    nodeId: 's1',
    nodeType: 'TASK',
    title: 'Write motivation letter',
    status: 'NOT_STARTED',
    date: { date: '2026-11-20', precision: 'DAY' },
    progress: null,
  },
  {
    ...base,
    nodeId: 'w3',
    nodeType: 'MILESTONE',
    title: 'Receive admission decision',
    status: 'NOT_STARTED',
    date: null,
    progress: null,
  },
];

const dashboard = {
  today: '2026-11-12',
  activeGoals: [
    {
      id: 'g1',
      title: 'Master’s degree',
      primaryAreaKey: 'CAREER',
      progress: { percent: '20.0', countedWeight: '2', totalWeight: '10' },
      nextNode: null,
      targetDate: null,
      reward: null,
      achievedWaypoints: 0,
      keyDates: [],
    },
  ],
} as unknown as Dashboard;

describe('journey view model', () => {
  const vm = toJourneyVm({ range: 'all', dashboard, timeline: { items } }, null, 'en-US', true);

  it('labels the sample with the backend date', () => {
    expect(vm.description).toBe('Sample plan · November 12, 2026');
    expect(vm.today.label).toBe('Today · Nov 12, 2026');
  });

  it('places dated Waypoints only, solid for month targets and dashed for coarse ones', () => {
    const [group] = vm.groups;

    expect(group.lanes.map((lane) => [lane.label, lane.caption, lane.marker])).toEqual([
      ['Submit application', 'Dec 2026 · month', 'solid'],
      ['Graduate', '2030 · year', 'dashed'],
    ]);
    expect(group.lanes[0].accessibleName).toBe(
      'Submit application, December 2026, month precision, In progress',
    );
    expect(group.caption).toBe('2 of 10 steps completed · 0 Waypoints achieved');
    expect(group.progress.detail).toBe('20% · 2 of 10');
  });

  it('keeps undated Waypoints out of the calendar', () => {
    expect(vm.groups[0].unplaced.map((item) => item.title)).toEqual(['Receive admission decision']);
    expect(vm.groups[0].agenda[0].line).toBe('Month precision · 40% · 2 of 5 steps');
  });

  it('filters by dimension without hiding why the page is empty', () => {
    const finance = toJourneyVm(
      { range: 'all', dashboard, timeline: { items } },
      'FINANCE',
      'en-US',
      false,
    );

    expect(finance.filteredOut).toBe(true);
    expect(finance.dimensionOptions).toEqual([{ value: 'CAREER', label: 'Career' }]);
  });
});
