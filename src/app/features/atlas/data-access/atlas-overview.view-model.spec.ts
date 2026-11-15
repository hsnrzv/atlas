import { testDashboard, testGoal } from '../testing/dashboard.fixture';
import { percentValue, progressDetail, toAtlasOverviewVm } from './atlas-overview.view-model';

const options = { locale: 'en-US', sample: false };

describe('toAtlasOverviewVm', () => {
  it('formats the first active Destination without recalculating progress', () => {
    const vm = toAtlasOverviewVm(testDashboard(), options);

    expect(vm.today).toEqual({ datetime: '2026-11-12', text: 'November 12, 2026' });
    expect(vm.destination).toEqual({
      title: 'Run a marathon',
      dimensionLabel: 'Health',
      percent: 30,
      percentText: '30%',
      detail: '3 of 10',
    });
    expect(vm.achievedText).toBe('1 Waypoint achieved');
  });

  it('maps the next Waypoint with its backend status, date and progress', () => {
    const vm = toAtlasOverviewVm(testDashboard(), options);

    expect(vm.nextWaypoint).toEqual({
      id: 'n1',
      title: 'Finish a half marathon',
      dimension: 'health',
      status: 'in-progress',
      plannedDate: { date: '2027-03-01', precision: 'MONTH' },
      progress: { value: 50, detail: '1 of 2' },
      link: '/waypoints',
    });
  });

  it('shows a locked next Waypoint as blocked and omits it when there is none', () => {
    const locked = testGoal({
      nextNode: {
        ...testGoal().nextNode!,
        status: 'NOT_STARTED',
        availability: { state: 'LOCKED' },
        progress: null,
      },
    });
    expect(
      toAtlasOverviewVm(testDashboard({ activeGoals: [locked] }), options).nextWaypoint,
    ).toMatchObject({
      status: 'blocked',
      progress: null,
    });

    const none = testGoal({ nextNode: null });
    expect(
      toAtlasOverviewVm(testDashboard({ activeGoals: [none] }), options).nextWaypoint,
    ).toBeNull();
  });

  it('builds At a glance from the backend summary and the first deadline', () => {
    expect(toAtlasOverviewVm(testDashboard(), options).glance).toEqual([
      { value: '1', label: 'Active destination' },
      { value: '1', label: 'Waypoint achieved' },
      { value: 'March 2027', label: 'Next planned deadline' },
    ]);

    const plural = toAtlasOverviewVm(
      testDashboard({ upcomingDeadlines: [], summary: { activeGoals: 2, achievedWaypoints: 0 } }),
      options,
    );
    expect(plural.glance).toEqual([
      { value: '2', label: 'Active destinations' },
      { value: '0', label: 'Waypoints achieved' },
      { value: 'Not set', label: 'Next planned deadline' },
    ]);
  });

  it('maps life dimensions, recent progress and Steps in progress', () => {
    const vm = toAtlasOverviewVm(testDashboard(), options);

    expect(vm.dimensions).toEqual([
      { key: 'health', destinations: 1, progress: 30 },
      { key: 'finance', destinations: 0, progress: null },
    ]);
    expect(vm.recent).toEqual([
      { id: 's1', kind: 'Completed · Step', title: 'Buy running shoes' },
      { id: 'w1', kind: 'Completed · Waypoint', title: 'Run 10 km' },
    ]);
    expect(vm.inProgress).toEqual(['Weekly long run · In progress']);
  });

  it('writes the timing, progress and policy captions', () => {
    const vm = toAtlasOverviewVm(testDashboard(), options);

    expect(vm.timing).toBe(
      'Register for the race · date not set. Race day · 2028 · year precision.',
    );
    expect(vm.progressCaption).toBe(
      'Progress: 3 of 10 Steps complete (30%). Finish a half marathon: 1 of 2 Steps complete (50%). 1 Waypoint achieved.',
    );
    expect(vm.policyCaption).toBe(
      'Optional race is excluded from progress. Progress reflects completed Steps.',
    );
  });

  it('labels sample data and drops captions that have nothing to say', () => {
    const goal = testGoal({ keyDates: [], progress: { percent: '0.0' } });
    const vm = toAtlasOverviewVm(testDashboard({ activeGoals: [goal] }), {
      ...options,
      sample: true,
    });

    expect(vm.sample).toBe(true);
    expect(vm.timing).toBeNull();
    expect(vm.policyCaption).toBeNull();
    expect(vm.progressCaption.startsWith('Sample progress: 0%.')).toBe(true);
  });

  it('summarises the last saved plan for the Error state', () => {
    expect(toAtlasOverviewVm(testDashboard(), options).savedLines).toEqual([
      '30% · 3 of 10 Steps complete',
      'Next: Finish a half marathon · March 2027',
      '50% · 1 of 2 Steps of Finish a half marathon',
      '1 active Destination · 1 Waypoint achieved',
    ]);
  });
});

describe('progress helpers', () => {
  it('reads the backend percent and weight as given', () => {
    expect(percentValue({ percent: '42.5' })).toBe(42.5);
    expect(percentValue(null)).toBe(0);
    expect(progressDetail({ percent: '0', countedWeight: '0', totalWeight: '4' })).toBe('0 of 4');
    expect(progressDetail({ percent: '0' })).toBeUndefined();
  });
});
