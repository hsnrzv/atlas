import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AtlasDataError } from '../data-error';
import { MockDashboardRepository } from './mock-dashboard.repository';
import { MockGoalRepository } from './mock-goal.repository';
import { MOCK_LATENCY_MS, readMockMode } from './mock-responder';
import {
  SAMPLE_GOAL_DRAFT,
  SAMPLE_GOAL_ID,
  SAMPLE_GOAL_TITLE,
  SAMPLE_NODE_IDS as N,
  SAMPLE_NODES,
} from './sample-plan';
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
    expect(tree.nodes).toEqual(SAMPLE_NODES);
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

  async function reason(promise: Promise<unknown>): Promise<string> {
    return settle(
      promise.then(() => 'ok').catch((error: AtlasDataError) => error.code ?? error.reason),
    );
  }

  it('creates, filters, sorts, updates and deletes Destinations in the session', async () => {
    const { goals } = setup();
    const created = await settle(
      firstValueFrom(
        goals.create({ ...SAMPLE_GOAL_DRAFT, title: ' Learn Japanese ', reward: 'Trip' }),
      ),
    );
    expect(created).toMatchObject({
      title: 'Learn Japanese',
      version: 1,
      reward: { description: 'Trip', status: 'PLANNED' },
      progress: null,
    });

    const titles = async (query = {}) =>
      (await settle(firstValueFrom(goals.list(query)))).map((goal) => goal.title);
    expect(await titles({ sort: 'title' })).toEqual([SAMPLE_GOAL_TITLE, 'Learn Japanese']);
    expect(await titles({ q: 'japan' })).toEqual(['Learn Japanese']);
    expect(await titles({ area: 'HEALTH' })).toEqual([]);

    const updated = await settle(
      firstValueFrom(goals.update(created.id, 1, { ...SAMPLE_GOAL_DRAFT, title: 'Learn Korean' })),
    );
    expect(updated).toMatchObject({ title: 'Learn Korean', version: 2 });
    expect(await reason(firstValueFrom(goals.update(created.id, 1, SAMPLE_GOAL_DRAFT)))).toBe(
      'VERSION_CONFLICT',
    );

    await settle(firstValueFrom(goals.remove(created.id, 2)));
    expect(await titles()).toEqual([SAMPLE_GOAL_TITLE]);
    const archived = await settle(firstValueFrom(goals.archive(SAMPLE_GOAL_ID)));
    expect(archived.status).toBe('ARCHIVED');
    expect(await titles()).toEqual([]);
    expect(await titles({ status: 'ARCHIVED' })).toEqual([SAMPLE_GOAL_TITLE]);
  });

  it('adds, moves and deletes Waypoints and Steps', async () => {
    const { goals } = setup();
    const waypoint = await settle(
      firstValueFrom(
        goals.createNode(SAMPLE_GOAL_ID, {
          parentId: null,
          nodeType: 'MILESTONE',
          title: 'Prepare finances',
          outcome: null,
          description: null,
          dueDate: null,
        }),
      ),
    );
    expect(waypoint).toMatchObject({ sortOrder: 8, childCount: 0, progress: null, version: 1 });
    const step = await settle(
      firstValueFrom(
        goals.createNode(SAMPLE_GOAL_ID, {
          parentId: waypoint.id,
          nodeType: 'TASK',
          title: 'Open savings plan',
          outcome: null,
          description: null,
          dueDate: null,
        }),
      ),
    );
    expect(step.sortOrder).toBe(1);

    await settle(
      firstValueFrom(goals.updateNode(SAMPLE_GOAL_ID, waypoint.id, 1, { sortOrder: 1 })),
    );
    const tree = await settle(firstValueFrom(goals.tree(SAMPLE_GOAL_ID)));
    const top = tree.nodes
      .filter((node) => node.parentId === null)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    expect(top[0].id).toBe(waypoint.id);
    expect(top.map((node) => node.sortOrder)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(tree.nodes.find((node) => node.id === waypoint.id)?.childCount).toBe(1);

    expect(
      await reason(firstValueFrom(goals.removeNode(SAMPLE_GOAL_ID, waypoint.id, 2, false))),
    ).toBe('NODE_HAS_CHILDREN');
    await settle(firstValueFrom(goals.removeNode(SAMPLE_GOAL_ID, waypoint.id, 2, true)));
    const after = await settle(firstValueFrom(goals.tree(SAMPLE_GOAL_ID)));
    expect(after.nodes.some((node) => node.id === step.id)).toBe(false);
  });

  it('swaps in the Flow D values when the draft Step is completed and back on reopen', async () => {
    const { goals, dashboard } = setup();
    const done = await settle(firstValueFrom(goals.completeNode(SAMPLE_GOAL_ID, N.draftStatement)));
    expect(done.status).toBe('COMPLETED');
    const goal = await settle(firstValueFrom(goals.get(SAMPLE_GOAL_ID)));
    expect(goal.progress).toMatchObject({ percent: '30.0', countedWeight: '3' });
    const tree = await settle(firstValueFrom(goals.tree(SAMPLE_GOAL_ID)));
    expect(tree.nodes.find((node) => node.id === N.submitApplication)?.progress).toMatchObject({
      percent: '60.0',
      countedWeight: '3',
    });
    const board = await settle(firstValueFrom(dashboard.dashboard()));
    expect(board.lifeBalance.find((area) => area.areaKey === 'CAREER')?.progress?.percent).toBe(
      '30.0',
    );
    expect(board.inProgress).toEqual([]);
    expect(board.recentAchievements[0].nodeId).toBe(N.draftStatement);

    const reopened = await settle(
      firstValueFrom(goals.reopenNode(SAMPLE_GOAL_ID, N.draftStatement)),
    );
    expect(reopened.status).toBe('IN_PROGRESS');
    expect((await settle(firstValueFrom(goals.get(SAMPLE_GOAL_ID)))).progress?.percent).toBe(
      '20.0',
    );
  });

  it('refuses to complete a blocked Step and rejects dependency loops', async () => {
    const { goals } = setup();
    expect(
      await reason(firstValueFrom(goals.completeNode(SAMPLE_GOAL_ID, N.submitTheApplication))),
    ).toBe('NODE_LOCKED');
    const deps = await settle(firstValueFrom(goals.dependencies(SAMPLE_GOAL_ID)));
    expect(deps).toEqual([
      expect.objectContaining({
        prerequisiteNodeId: N.reviewChecklist,
        dependentNodeId: N.submitTheApplication,
      }),
    ]);
    expect(
      await reason(
        firstValueFrom(
          goals.addDependency(SAMPLE_GOAL_ID, N.submitTheApplication, N.reviewChecklist),
        ),
      ),
    ).toBe('DEPENDENCY_CYCLE');
  });

  it('keeps goal-level and node notes apart', async () => {
    const { goals } = setup();
    await settle(firstValueFrom(goals.addNote(SAMPLE_GOAL_ID, null, 'Goal note')));
    const nodeNote = await settle(
      firstValueFrom(goals.addNote(SAMPLE_GOAL_ID, N.draftStatement, 'Draft v2')),
    );
    expect(
      (await settle(firstValueFrom(goals.notes(SAMPLE_GOAL_ID, null)))).map((n) => n.body),
    ).toEqual(['Goal note']);
    expect(nodeNote).toMatchObject({ format: 'PLAIN', version: 1 });
    const edited = await settle(
      firstValueFrom(goals.updateNote(SAMPLE_GOAL_ID, nodeNote.id, 1, 'Draft v3')),
    );
    expect(edited.version).toBe(2);
    expect(
      await reason(firstValueFrom(goals.updateNote(SAMPLE_GOAL_ID, nodeNote.id, 1, 'Stale'))),
    ).toBe('VERSION_CONFLICT');
    expect(
      (await settle(firstValueFrom(goals.notes(SAMPLE_GOAL_ID, N.draftStatement)))).map(
        (n) => n.body,
      ),
    ).toEqual(['Draft v3']);
    expect(await reason(firstValueFrom(goals.removeNote(SAMPLE_GOAL_ID, nodeNote.id, 1)))).toBe(
      'VERSION_CONFLICT',
    );
    await settle(firstValueFrom(goals.removeNote(SAMPLE_GOAL_ID, nodeNote.id, 2)));
    expect(await settle(firstValueFrom(goals.notes(SAMPLE_GOAL_ID, N.draftStatement)))).toEqual([]);
  });

  it('never changes the session in error mode', async () => {
    const { goals } = setup('?mock=error');
    expect(await reason(firstValueFrom(goals.create(SAMPLE_GOAL_DRAFT)))).toBe('network');
  });
});
