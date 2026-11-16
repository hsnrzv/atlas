import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GoalPlanStore } from './goal-plan.store';
import { MockGoalRepository } from './mock/mock-goal.repository';
import { MOCK_LATENCY_MS, MockResponder, type MockMode } from './mock/mock-responder';
import { SAMPLE_GOAL_ID, SAMPLE_NODE_IDS as N } from './mock/sample-plan';
import { GoalRepository } from './ports/goal.repository';

describe('GoalPlanStore', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function setup(mode: MockMode = 'sample') {
    TestBed.configureTestingModule({
      providers: [GoalPlanStore, { provide: GoalRepository, useExisting: MockGoalRepository }],
    });
    Object.assign(TestBed.inject(MockResponder), { mode });
    return TestBed.inject(GoalPlanStore);
  }

  async function flush(): Promise<void> {
    TestBed.tick();
    await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
    TestBed.tick();
  }

  async function settle<T>(promise: Promise<T>): Promise<T> {
    for (let i = 0; i < 6; i++) {
      await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
    }
    TestBed.tick();
    return promise;
  }

  async function ready() {
    const store = setup();
    expect(store.state()).toBe('idle');
    store.goalId.set(SAMPLE_GOAL_ID);
    TestBed.tick();
    expect(store.state()).toBe('loading');
    await flush();
    return store;
  }

  it('loads the goal, tree, prerequisites and goal notes', async () => {
    const store = await ready();
    expect(store.state()).toBe('ready');
    expect(store.goal()?.id).toBe(SAMPLE_GOAL_ID);
    expect(store.nodes().length).toBeGreaterThan(10);
    expect(store.prerequisitesOf(N.submitTheApplication)).toEqual([N.reviewChecklist]);
    expect(store.notes()).toEqual([]);
  });

  it('refreshes on a later visit and keeps the shown plan meanwhile', async () => {
    const store = await ready();
    store.enter();
    const get = vi.spyOn(TestBed.inject(MockGoalRepository), 'get');
    const tree = vi.spyOn(TestBed.inject(MockGoalRepository), 'tree');
    store.enter();
    TestBed.tick();
    expect(store.state()).toBe('ready');
    expect(store.goal()?.id).toBe(SAMPLE_GOAL_ID);
    await flush();
    expect(get).toHaveBeenCalledWith(SAMPLE_GOAL_ID);
    expect(tree).toHaveBeenCalledWith(SAMPLE_GOAL_ID);
    expect(store.state()).toBe('ready');
  });

  it('reports a missing Destination as not-found', async () => {
    const store = setup();
    store.goalId.set('missing');
    await flush();
    expect(store.state()).toBe('not-found');
  });

  it('reports a failed read as error', async () => {
    const store = setup('error');
    store.goalId.set(SAMPLE_GOAL_ID);
    await flush();
    expect(store.state()).toBe('error');
  });

  it('completes a Step and refreshes backend-derived progress (Flow D)', async () => {
    const store = await ready();
    const draft = store.nodes().find((node) => node.id === N.draftStatement)!;
    const result = await settle(store.completeNode(draft));
    expect(result.ok).toBe(true);
    expect(store.nodes().find((node) => node.id === N.draftStatement)?.status).toBe('COMPLETED');
    expect(store.nodes().find((node) => node.id === N.submitApplication)?.progress?.percent).toBe(
      '60.0',
    );
    expect(store.goal()?.progress.percent).toBe('30.0');
    expect(store.saving()).toBe(false);
  });

  it('returns a typed error for a locked Step and keeps state', async () => {
    const store = await ready();
    const submit = store.nodes().find((node) => node.id === N.submitTheApplication)!;
    const result = await settle(store.completeNode(submit));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('NODE_LOCKED');
    }
  });

  it('creates a Step with prerequisites, then syncs them on edit', async () => {
    const store = await ready();
    const created = await settle(
      store.createNode(
        {
          parentId: N.submitApplication,
          nodeType: 'TASK',
          title: 'Pay the fee',
          outcome: null,
          description: null,
          dueDate: null,
        },
        [N.reviewChecklist],
      ),
    );
    expect(created.ok).toBe(true);
    if (!created.ok) {
      return;
    }
    expect(store.nodes().some((node) => node.title === 'Pay the fee')).toBe(true);
    expect(store.prerequisitesOf(created.value.id)).toEqual([N.reviewChecklist]);

    const node = store.nodes().find((item) => item.id === created.value.id)!;
    await settle(store.updateNode(node, { title: 'Pay the application fee' }, []));
    expect(store.prerequisitesOf(node.id)).toEqual([]);
    expect(store.nodes().find((item) => item.id === node.id)?.title).toBe(
      'Pay the application fee',
    );
  });

  it('adds, edits and removes goal notes', async () => {
    const store = await ready();
    const added = await settle(store.addNote('Ask for references'));
    expect(added.ok).toBe(true);
    await flush();
    expect(store.notes().map((note) => note.body)).toEqual(['Ask for references']);
    if (!added.ok) {
      return;
    }
    await settle(store.updateNote(added.value.id, 'Ask two references'));
    await flush();
    expect(store.notes()[0].body).toBe('Ask two references');
    await settle(store.removeNote(added.value.id));
    await flush();
    expect(store.notes()).toEqual([]);
  });

  it('lists Destinations only when asked', async () => {
    const store = setup();
    TestBed.tick();
    expect(store.goals()).toBeUndefined();
    store.loadGoalList();
    await flush();
    expect(store.goals()?.map((goal) => goal.id)).toEqual([SAMPLE_GOAL_ID]);
  });

  it('scopes an overview to the chosen Destination, else the first one', async () => {
    const store = setup();
    const chosen = signal<string | undefined>(undefined);
    const state = TestBed.runInInjectionContext(() => store.scopeTo(chosen));
    expect(state()).toBe('loading');
    await flush();
    await flush();
    expect(store.goalId()).toBe(SAMPLE_GOAL_ID);
    expect(state()).toBe('ready');

    chosen.set('missing');
    await flush();
    expect(state()).toBe('not-found');
  });

  it('scopes an overview to the empty state when there are no Destinations', async () => {
    const store = setup('empty');
    const state = TestBed.runInInjectionContext(() => store.scopeTo(() => undefined));
    await flush();
    expect(state()).toBe('empty');
  });
});
