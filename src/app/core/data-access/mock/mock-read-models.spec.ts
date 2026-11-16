import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, type Observable } from 'rxjs';
import { AtlasDataError } from '../data-error';
import { MockAwardRepository } from './mock-award.repository';
import { MockConnectionRepository } from './mock-connection.repository';
import { MockDashboardRepository } from './mock-dashboard.repository';
import { MockGoalRepository } from './mock-goal.repository';
import { MockOnboardingRepository } from './mock-onboarding.repository';
import { MockPlanState } from './mock-plan-state';
import { MOCK_LATENCY_MS } from './mock-responder';
import { MockTimelineRepository } from './mock-timeline.repository';
import { SAMPLE_GOAL_ID, SAMPLE_NODE_IDS as N } from './sample-plan';

function setup(search = '') {
  TestBed.configureTestingModule({
    providers: [{ provide: DOCUMENT, useValue: { location: { search } } }],
  });
  return {
    awards: TestBed.inject(MockAwardRepository),
    connections: TestBed.inject(MockConnectionRepository),
    dashboard: TestBed.inject(MockDashboardRepository),
    goals: TestBed.inject(MockGoalRepository),
    onboarding: TestBed.inject(MockOnboardingRepository),
    state: TestBed.inject(MockPlanState),
    timeline: TestBed.inject(MockTimelineRepository),
  };
}

describe('mock read models (dev only)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  async function get<T>(source: Observable<T>): Promise<T> {
    const promise = firstValueFrom(source);
    await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
    return promise;
  }

  async function reason(source: Observable<unknown>): Promise<string> {
    const promise = firstValueFrom(source)
      .then(() => 'ok')
      .catch((error: AtlasDataError) => error.code ?? error.reason);
    await vi.advanceTimersByTimeAsync(MOCK_LATENCY_MS);
    return promise;
  }

  it('walks Flow G: the application Waypoint is achieved at 5 of 5 and the Destination reads 50 %', async () => {
    const { goals, dashboard, awards } = setup();
    await get(goals.completeNode(SAMPLE_GOAL_ID, N.draftStatement));
    await get(goals.completeNode(SAMPLE_GOAL_ID, N.reviewChecklist));
    let tree = await get(goals.tree(SAMPLE_GOAL_ID));
    const submit = tree.nodes.find((node) => node.id === N.submitTheApplication);
    expect(submit?.availability.state).toBe('AVAILABLE');
    expect(tree.nodes.find((node) => node.id === N.submitApplication)?.progress?.percent).toBe(
      '80.0',
    );

    await get(goals.completeNode(SAMPLE_GOAL_ID, N.submitTheApplication));
    tree = await get(goals.tree(SAMPLE_GOAL_ID));
    expect(tree.nodes.find((node) => node.id === N.submitApplication)).toMatchObject({
      status: 'COMPLETED',
      progress: { percent: '100.0', countedWeight: '5', totalWeight: '5' },
    });
    const goal = await get(goals.get(SAMPLE_GOAL_ID));
    expect(goal.progress).toMatchObject({ percent: '50.0', countedWeight: '5', totalWeight: '10' });
    expect(goal.nextAvailableNode?.id).toBe(N.admissionDecision);
    expect(goal.reward?.status).toBe('PLANNED');

    const board = await get(dashboard.dashboard());
    expect(board.summary.achievedWaypoints).toBe(1);
    expect(board.activeGoals[0].nextNode?.id).toBe(N.admissionDecision);
    expect(board.recentAchievements[0].nodeId).toBe(N.submitApplication);

    const list = await get(awards.awards());
    expect(list.achievedWaypoints.map((item) => item.nodeId)).toEqual([N.submitApplication]);
    expect(list.summary).toEqual({ earned: 0, planned: 1, redeemed: 0 });

    await get(goals.reopenNode(SAMPLE_GOAL_ID, N.reviewChecklist));
    tree = await get(goals.tree(SAMPLE_GOAL_ID));
    expect(tree.nodes.find((node) => node.id === N.submitTheApplication)?.availability.state).toBe(
      'LOCKED',
    );
  });

  it('serves the Journey with undated items last and filters like the backend', async () => {
    const { timeline } = setup();
    const all = await get(timeline.timeline());
    const dated = all.items.filter((item) => item.date);
    expect(dated[0]).toMatchObject({ nodeId: N.submitApplication, nodeType: 'MILESTONE' });
    expect(all.items.at(-1)?.date).toBeNull();
    expect(all.items.find((item) => item.nodeId === null)?.title).toContain('Master');

    const year = await get(timeline.timeline({ from: '2026-11-12', to: '2027-11-12' }));
    expect(year.items.some((item) => item.nodeId === N.graduate)).toBe(false);
    expect(year.items.some((item) => item.nodeId === N.thesis && item.date === null)).toBe(true);

    const waypoints = await get(timeline.timeline({ nodeType: 'MILESTONE' }));
    expect(waypoints.items.every((item) => item.nodeType === 'MILESTONE')).toBe(true);
  });

  it('serves the primary Career association and the unverified Finance impact without an amount', async () => {
    const { connections } = setup();
    const list = await get(connections.connections());
    expect(list.map((item) => [item.areaKey, item.kind, item.primary, item.verified])).toEqual([
      ['CAREER', 'ASSOCIATION', true, true],
      ['FINANCE', 'POSSIBLE_IMPACT', false, false],
    ]);
    expect(list[1].impact?.money).toBeNull();
  });

  it('only redeems earned Milestone Awards', async () => {
    const { awards } = setup();
    const list = await get(awards.awards());
    expect(list.rewards).toEqual([
      expect.objectContaining({ nodeId: null, description: 'Graduation celebration' }),
    ]);
    expect(await reason(awards.redeem(list.rewards[0]))).toBe('REWARD_NOT_EARNED');
  });

  it('starts a first visit with ?mock=new and seeds the sample on request', async () => {
    const { onboarding, goals, state } = setup('?mock=new');
    expect((await get(onboarding.onboarding())).status).toBe('NOT_STARTED');
    expect(await get(goals.list())).toEqual([]);

    expect((await get(onboarding.saveAreas({ areaKeys: ['CAREER'] }))).status).toBe('IN_PROGRESS');
    const done = await get(onboarding.complete());
    expect(done.status).toBe('COMPLETED');
    expect(done.completedAt).not.toBeNull();
    expect((await get(onboarding.reopen())).status).toBe('IN_PROGRESS');

    state.seedSample();
    expect((await get(goals.list())).map((goal) => goal.id)).toEqual([SAMPLE_GOAL_ID]);
  });

  it('treats every other mode as a finished setup', async () => {
    const { onboarding } = setup('?mock=empty');
    expect((await get(onboarding.onboarding())).status).toBe('COMPLETED');
  });
});
