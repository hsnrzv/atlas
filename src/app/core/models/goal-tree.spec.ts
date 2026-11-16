import type { GoalNode } from './goal-node';
import { ancestorsOf, childrenOf, descendantIds, findNode, isWaypoint, stepsOf } from './goal-tree';

const node = (
  id: string,
  parentId: string | null,
  sortOrder: number,
  nodeType: GoalNode['nodeType'] = 'TASK',
) => ({ id, parentId, sortOrder, nodeType }) as GoalNode;

const NODES = [
  node('b', null, 2, 'MILESTONE'),
  node('a', null, 1, 'MILESTONE'),
  node('a2', 'a', 2),
  node('a1', 'a', 1, 'CHECKPOINT'),
  node('a1x', 'a1', 1),
];

describe('goal tree lookups', () => {
  it('finds nodes and lists children in sort order', () => {
    expect(findNode(NODES, 'a1')?.id).toBe('a1');
    expect(findNode(NODES, 'missing')).toBeUndefined();
    expect(childrenOf(NODES, null).map((n) => n.id)).toEqual(['a', 'b']);
    expect(childrenOf(NODES, 'a').map((n) => n.id)).toEqual(['a1', 'a2']);
  });

  it('walks ancestors top-down and collects descendants', () => {
    expect(ancestorsOf(NODES, 'a1x').map((n) => n.id)).toEqual(['a', 'a1']);
    expect(ancestorsOf(NODES, 'a')).toEqual([]);
    expect([...descendantIds(NODES, 'a')].sort()).toEqual(['a1', 'a1x', 'a2']);
  });

  it('tells Waypoints from Steps', () => {
    expect(isWaypoint(node('m', null, 1, 'MILESTONE'))).toBe(true);
    expect(isWaypoint(node('c', null, 1, 'CHECKPOINT'))).toBe(true);
    expect(isWaypoint(node('t', null, 1, 'TASK'))).toBe(false);
  });

  it('orders Steps by due date, undated last, ties in sort order', () => {
    const due = (id: string, sortOrder: number, date: string | null): GoalNode =>
      ({
        ...node(id, 'w', sortOrder),
        dueDate: date ? { date, precision: 'DAY' } : null,
      }) as GoalNode;
    const steps = [
      due('undated', 1, null),
      due('late', 2, '2026-12-20'),
      due('early', 3, '2026-11-20'),
      due('early-tie', 4, '2026-11-20'),
      node('sub', 'w', 0, 'CHECKPOINT'),
    ];
    expect(stepsOf(steps, 'w').map((n) => n.id)).toEqual(['early', 'early-tie', 'late', 'undated']);
  });
});
