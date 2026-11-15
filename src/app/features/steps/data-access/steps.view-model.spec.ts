import type { GoalNode } from '../../../core/models/goal-node';
import { defaultWaypointId, waypointOptions } from './steps.view-model';

const node = (partial: Partial<GoalNode> & Pick<GoalNode, 'id' | 'title'>): GoalNode =>
  ({ parentId: null, nodeType: 'MILESTONE', sortOrder: 0, ...partial }) as GoalNode;

const NODES = [
  node({ id: 'w1', title: 'Apply', sortOrder: 1 }),
  node({ id: 'w2', title: 'Study', sortOrder: 2 }),
  node({ id: 'w3', title: 'Thesis', parentId: 'w2', sortOrder: 1 }),
  node({ id: 's1', title: 'Write', parentId: 'w3', nodeType: 'TASK', sortOrder: 1 }),
];

describe('steps.view-model', () => {
  it('lists every Waypoint in tree order with its path', () => {
    expect(waypointOptions(NODES)).toEqual([
      { id: 'w1', label: 'Apply' },
      { id: 'w2', label: 'Study' },
      { id: 'w3', label: 'Study › Thesis' },
    ]);
  });

  it('defaults to the Waypoint holding the next available node', () => {
    expect(defaultWaypointId({ nextAvailableNode: { id: 's1', title: 'Write' } }, NODES)).toBe(
      'w3',
    );
    expect(defaultWaypointId({ nextAvailableNode: { id: 'w1', title: 'Apply' } }, NODES)).toBe(
      'w1',
    );
  });

  it('falls back to the first Waypoint with Steps', () => {
    expect(defaultWaypointId({ nextAvailableNode: null }, NODES)).toBe('w3');
    expect(defaultWaypointId({ nextAvailableNode: null }, NODES.slice(0, 2))).toBe('w1');
    expect(defaultWaypointId({ nextAvailableNode: null }, [])).toBeNull();
  });
});
