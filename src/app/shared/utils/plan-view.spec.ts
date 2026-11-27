import type { GoalNode } from '../../core/models/goal-node';
import {
  currentChildId,
  toBlockedReasons,
  toNoteVm,
  toStepRows,
  toWaypointStops,
} from './plan-view';

function node(partial: Partial<GoalNode> & Pick<GoalNode, 'id' | 'title'>): GoalNode {
  return {
    goalId: 'g1',
    parentId: null,
    nodeType: 'MILESTONE',
    outcome: null,
    description: null,
    status: 'NOT_STARTED',
    startDate: null,
    dueDate: null,
    progressWeight: '1',
    sortOrder: 0,
    availability: { state: 'AVAILABLE', reasons: [], override: null },
    progress: null,
    reward: null,
    childCount: 0,
    version: 1,
    ...partial,
  };
}

const NODES: GoalNode[] = [
  node({
    id: 'w1',
    title: 'Submit application',
    status: 'IN_PROGRESS',
    sortOrder: 1,
    dueDate: { date: '2026-12-01', precision: 'MONTH' },
    progress: { percent: '40.0', countedWeight: '2', totalWeight: '5' },
  }),
  node({ id: 'w2', title: 'Graduate', sortOrder: 2, outcome: 'Degree awarded' }),
  node({ id: 's1', title: 'Draft statement', nodeType: 'TASK', parentId: 'w1', sortOrder: 1 }),
  node({
    id: 's2',
    title: 'Submit',
    nodeType: 'TASK',
    parentId: 'w1',
    sortOrder: 2,
    availability: {
      state: 'LOCKED',
      reasons: [{ prerequisiteNodeId: 's1', title: 'Draft statement', status: 'NOT_STARTED' }],
      override: null,
    },
  }),
];

describe('plan-view', () => {
  it('finds the stop that holds the next focus', () => {
    const next = { id: 's1', title: 'Draft statement' };
    expect(currentChildId(NODES, next, null)).toBe('w1');
    expect(currentChildId(NODES, next, 'w1')).toBe('s1');
    expect(currentChildId(NODES, null, null)).toBeNull();
  });

  it('maps Waypoints to route stops with backend progress or the outcome', () => {
    const stops = toWaypointStops(
      { nextAvailableNode: { id: 's1', title: 'Draft statement' } },
      NODES,
      null,
      'en-US',
    );
    expect(stops.map((stop) => stop.id)).toEqual(['w1', 'w2']);
    expect(stops[0]).toEqual({
      id: 'w1',
      title: 'Submit application',
      status: 'in-progress',
      blocked: false,
      dateText: 'December 2026 · month precision',
      detail: '40% · 2 of 5 Steps completed',
      link: '/destinations/g1/waypoints/w1',
      current: true,
    });
    expect(stops[1].detail).toBe('Degree awarded');
    expect(stops[1].dateText).toBe('Date not set');
  });

  it('maps Steps with availability kept apart from status', () => {
    const rows = toStepRows(NODES, 'w1', 'en-US');
    expect(rows.map((row) => [row.id, row.status, row.blocked, row.meta])).toEqual([
      ['s1', 'not-started', false, 'Due: Not set'],
      ['s2', 'not-started', true, 'Due: Not set'],
    ]);
    expect(rows[0].link).toBe('/destinations/g1/steps/s1');
  });

  it('formats a note with its last update', () => {
    const vm = toNoteVm(
      {
        id: 'n1',
        goalId: 'g1',
        nodeId: null,
        body: 'Ask for references',
        format: 'PLAIN',
        createdAt: '2026-11-12T09:00:00Z',
        updatedAt: '2026-11-12T09:00:00Z',
        version: 1,
      },
      'en-US',
    );
    expect(vm.body).toBe('Ask for references');
    expect(vm.updated.datetime).toBe('2026-11-12T09:00:00Z');
    expect(vm.updated.text).toContain('Nov 12, 2026');
  });

  it('explains Blocked availability with links to the prerequisites', () => {
    expect(toBlockedReasons(NODES[3], NODES)).toEqual([
      {
        id: 's1',
        title: 'Draft statement',
        status: 'Not started',
        link: '/destinations/g1/steps/s1',
      },
    ]);
    expect(toBlockedReasons(NODES[2], NODES)).toEqual([]);
  });
});
