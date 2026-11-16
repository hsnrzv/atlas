import { GRAPH_WIDTH, layoutConnectionGraph } from './connection-graph-layout';

describe('layoutConnectionGraph', () => {
  it('places sources left and targets right, centred vertically', () => {
    const layout = layoutConnectionGraph(['goal'], ['career', 'finance'], []);
    const [goal, career, finance] = layout.nodes;

    expect(goal.column).toBe('source');
    expect(goal.x).toBeLessThan(career.x);
    expect(career.x + layout.nodeWidth).toBeLessThan(GRAPH_WIDTH);
    expect(goal.y + layout.nodeHeight / 2).toBeCloseTo(layout.height / 2);
    expect(finance.y).toBeGreaterThan(career.y + layout.nodeHeight);
  });

  it('draws a curve from the right edge of the source to the left edge of the target', () => {
    const layout = layoutConnectionGraph(
      ['goal'],
      ['career'],
      [{ id: 'e1', source: 'goal', target: 'career' }],
    );
    const [goal, career] = layout.nodes;
    const y = goal.y + layout.nodeHeight / 2;

    expect(layout.edges[0].path).toBe(
      `M ${goal.x + layout.nodeWidth} ${y} C 500 ${y}, 500 ${y}, ${career.x} ${y}`,
    );
  });

  it('spreads parallel edges and skips edges to unknown nodes', () => {
    const layout = layoutConnectionGraph(
      ['goal'],
      ['finance'],
      [
        { id: 'a', source: 'goal', target: 'finance' },
        { id: 'b', source: 'goal', target: 'finance' },
        { id: 'c', source: 'goal', target: 'health' },
      ],
    );

    expect(layout.edges.map((edge) => edge.id)).toEqual(['a', 'b']);
    expect(layout.edges[0].path).not.toBe(layout.edges[1].path);
  });

  it('grows with the longest column', () => {
    const small = layoutConnectionGraph(['g'], ['a'], []);
    const large = layoutConnectionGraph(['g'], ['a', 'b', 'c', 'd'], []);
    expect(large.height).toBeGreaterThan(small.height);
  });
});
