import type { Goal } from '../../models/goal';
import type { GoalDependency } from '../../models/goal-commands';
import type { GoalNode, NodeStatus } from '../../models/goal-node';
import { areaProgress, recalculate } from './mock-recalculation';
import { SAMPLE_PROGRESS } from './sample-fixtures';
import { SAMPLE_GOAL, SAMPLE_NODE_IDS as N, SAMPLE_NODES } from './sample-plan';

const SAMPLE_DEPENDENCY: GoalDependency = {
  id: 'dep',
  goalId: SAMPLE_GOAL.id,
  prerequisiteNodeId: N.reviewChecklist,
  dependentNodeId: N.submitTheApplication,
};

const withStatus = (nodes: readonly GoalNode[], statuses: Record<string, NodeStatus>) =>
  nodes.map((node) => (statuses[node.id] ? { ...node, status: statuses[node.id] } : node));

const find = (nodes: readonly GoalNode[], id: string) => nodes.find((node) => node.id === id)!;

describe('mock recalculation', () => {
  it('reproduces the Figma sample values (page 05)', () => {
    const { goal, nodes } = recalculate(SAMPLE_GOAL, SAMPLE_NODES, [SAMPLE_DEPENDENCY]);
    expect(goal.progress).toEqual(SAMPLE_PROGRESS.goal);
    expect(find(nodes, N.submitApplication).progress).toEqual(
      SAMPLE_PROGRESS.nodes[N.submitApplication],
    );
    expect(find(nodes, N.submitApplication).status).toBe('IN_PROGRESS');
    expect(find(nodes, N.submitTheApplication).availability).toEqual(
      find(SAMPLE_NODES, N.submitTheApplication).availability,
    );
    expect(goal.nextAvailableNode).toEqual({
      id: N.submitApplication,
      title: 'Submit application',
    });
  });

  it('gives Flow D 60 % · 3 of 5 and 30 % · 3 of 10', () => {
    const { goal, nodes } = recalculate(
      SAMPLE_GOAL,
      withStatus(SAMPLE_NODES, { [N.draftStatement]: 'COMPLETED' }),
      [SAMPLE_DEPENDENCY],
    );
    expect(find(nodes, N.submitApplication).progress?.percent).toBe('60.0');
    expect(find(nodes, N.submitApplication).progress?.countedWeight).toBe('3');
    expect(goal.progress.percent).toBe('30.0');
    expect(goal.progress.countedWeight).toBe('3');
  });

  it('achieves the Waypoint in Flow G and moves the next Waypoint on', () => {
    const { goal, nodes } = recalculate(
      SAMPLE_GOAL,
      withStatus(SAMPLE_NODES, {
        [N.draftStatement]: 'COMPLETED',
        [N.reviewChecklist]: 'COMPLETED',
        [N.submitTheApplication]: 'COMPLETED',
      }),
      [SAMPLE_DEPENDENCY],
    );
    expect(find(nodes, N.submitApplication).status).toBe('COMPLETED');
    expect(goal.progress.percent).toBe('50.0');
    expect(goal.nextAvailableNode?.id).toBe(N.admissionDecision);
  });

  describe('a Destination created in the session', () => {
    const goal: Goal = { ...SAMPLE_GOAL, id: 'g', progress: { percent: '0.0' } };
    const base = (id: string, extra: Partial<GoalNode>): GoalNode => ({
      ...SAMPLE_NODES[1],
      goalId: 'g',
      id,
      title: id,
      status: 'NOT_STARTED',
      progress: null,
      availability: { state: 'AVAILABLE', reasons: [], override: null },
      ...extra,
    });
    const nodes = [
      base('cardio', { nodeType: 'MILESTONE', parentId: null, sortOrder: 1 }),
      base('start', { parentId: 'cardio', sortOrder: 1 }),
      base('warm', { parentId: 'cardio', sortOrder: 2 }),
    ];
    const dependency: GoalDependency = {
      id: 'd',
      goalId: 'g',
      prerequisiteNodeId: 'start',
      dependentNodeId: 'warm',
    };

    it('blocks a Step until its prerequisite is completed', () => {
      const locked = recalculate(goal, nodes, [dependency]).nodes;
      expect(find(locked, 'warm').availability).toEqual({
        state: 'LOCKED',
        reasons: [{ prerequisiteNodeId: 'start', title: 'start', status: 'NOT_STARTED' }],
        override: null,
      });
      const open = recalculate(goal, withStatus(nodes, { start: 'COMPLETED' }), [dependency]);
      expect(find(open.nodes, 'warm').availability.state).toBe('AVAILABLE');
    });

    it('moves the Waypoint status with its Steps', () => {
      const idle = recalculate(goal, nodes, []);
      expect(find(idle.nodes, 'cardio').status).toBe('NOT_STARTED');
      expect(find(idle.nodes, 'cardio').progress).toMatchObject({
        percent: '0.0',
        countedWeight: '0',
        totalWeight: '2',
      });
      const started = recalculate(goal, withStatus(nodes, { start: 'IN_PROGRESS' }), []);
      expect(find(started.nodes, 'cardio').status).toBe('IN_PROGRESS');
      const done = recalculate(
        goal,
        withStatus(nodes, { start: 'COMPLETED', warm: 'COMPLETED' }),
        [],
      );
      expect(find(done.nodes, 'cardio').status).toBe('COMPLETED');
      expect(done.goal.progress.percent).toBe('100.0');
      expect(done.goal.nextAvailableNode).toBeNull();
    });

    it('rolls area progress up over all leaves', () => {
      expect(areaProgress([])).toBeNull();
      expect(areaProgress([withStatus(nodes, { start: 'COMPLETED' }), SAMPLE_NODES])?.percent).toBe(
        `${((3 / 12) * 100).toFixed(1)}`,
      );
    });
  });
});
