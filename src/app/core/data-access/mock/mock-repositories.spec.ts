import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AtlasDataError } from '../data-error';
import { MockDashboardRepository } from './mock-dashboard.repository';
import { MockGoalRepository } from './mock-goal.repository';
import { MOCK_LATENCY_MS, readMockMode } from './mock-responder';
import { SAMPLE_GOAL_ID, SAMPLE_GOAL_TITLE, SAMPLE_NODES } from './sample-plan';
import { ATLAS_MOCK_SENTINEL } from './sentinel';

function setup(search = '') {
  TestBed.configureTestingModule({
    providers: [{ provide: DOCUMENT, useValue: { location: { search } } }],
  });
  return {
    dashboard: TestBed.inject(MockDashboardRepository),
    goals: TestBed.inject(MockGoalRepository),
  };
}

describe('mock repositories (dev only)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  async function settle<T>(promise: Promise<T>): Promise<T> {
    await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
    return promise;
  }

  it('reads the ?mock= flag and falls back to the sample', () => {
    expect(readMockMode('?mock=empty')).toBe('empty');
    expect(readMockMode('?mock=refresh-error')).toBe('refresh-error');
    expect(readMockMode('?mock=nonsense')).toBe('sample');
    expect(readMockMode('')).toBe('sample');
  });

  it('serves exactly the one §10.5 sample with fixture progress', async () => {
    const { dashboard, goals } = setup();
    expect(dashboard.source).toBe(ATLAS_MOCK_SENTINEL);

    const value = await settle(firstValueFrom(dashboard.dashboard()));
    expect(value.activeGoals).toHaveLength(1);
    const [goal] = value.activeGoals;
    expect(goal.title).toBe(SAMPLE_GOAL_TITLE);
    expect(goal.progress).toMatchObject({ percent: '20.0', countedWeight: '2', totalWeight: '10' });
    expect(goal.nextNode).toMatchObject({
      title: 'Submit application',
      status: 'IN_PROGRESS',
      dueDate: { date: '2026-12-01', precision: 'MONTH' },
      progress: { percent: '40.0', countedWeight: '2', totalWeight: '5' },
    });
    expect(value.summary).toEqual({ activeGoals: 1, achievedWaypoints: 0 });
    expect(
      value.lifeBalance.filter((area) => area.activeGoals > 0).map((area) => area.areaKey),
    ).toEqual(['CAREER']);

    expect(await settle(firstValueFrom(goals.list()))).toHaveLength(1);
    const tree = await settle(firstValueFrom(goals.tree(SAMPLE_GOAL_ID)));
    expect(tree.nodes).toBe(SAMPLE_NODES);
  });

  it('never invents a day for month or year precision', () => {
    for (const node of SAMPLE_NODES) {
      if (node.dueDate && node.dueDate.precision !== 'DAY') {
        expect(node.dueDate.date).toMatch(/-01$/);
      }
    }
  });

  it('answers empty and error modes', async () => {
    const empty = setup('?mock=empty');
    expect((await settle(firstValueFrom(empty.dashboard.dashboard()))).activeGoals).toEqual([]);

    TestBed.resetTestingModule();
    const failing = setup('?mock=error');
    const result = firstValueFrom(failing.dashboard.dashboard()).catch((error: unknown) => error);
    expect(await settle(result)).toBeInstanceOf(AtlasDataError);
  });

  it('fails only the refresh in refresh-error mode', async () => {
    const { dashboard } = setup('?mock=refresh-error');
    expect((await settle(firstValueFrom(dashboard.dashboard()))).activeGoals).toHaveLength(1);
    const second = firstValueFrom(dashboard.dashboard()).catch((error: unknown) => error);
    expect(await settle(second)).toBeInstanceOf(AtlasDataError);
  });

  it('reports unknown Destinations as not found', async () => {
    const { goals } = setup();
    const result = firstValueFrom(goals.get('missing')).catch(
      (error: AtlasDataError) => error.reason,
    );
    expect(await settle(result)).toBe('not-found');
  });
});
