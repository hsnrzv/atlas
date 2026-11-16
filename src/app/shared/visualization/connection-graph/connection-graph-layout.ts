/**
 * Layout of the Connections graph (F2-9, Figma page 09): sources (Destinations) in the left column, targets (Life
 * Dimensions) in the right column, cubic curves between them. Pure and unit-free: the component scales the result
 * with a viewBox and percentage positions. Native SVG/HTML instead of a chart library (P-V1, ADR-0004).
 */
export interface GraphEdgeInput {
  readonly id: string;
  readonly source: string;
  readonly target: string;
}

export interface GraphNodeBox {
  readonly id: string;
  readonly column: 'source' | 'target';
  readonly x: number;
  readonly y: number;
}

export interface GraphEdgePath {
  readonly id: string;
  readonly path: string;
}

export interface GraphLayout {
  readonly width: number;
  readonly height: number;
  readonly nodeWidth: number;
  readonly nodeHeight: number;
  readonly nodes: readonly GraphNodeBox[];
  readonly edges: readonly GraphEdgePath[];
}

export const GRAPH_WIDTH = 1000;
const NODE_WIDTH = 230;
const NODE_HEIGHT = 96;
const GAP = 40;
const PADDING = 40;
const MIN_HEIGHT = 320;
/** Vertical spread of parallel edges between the same two nodes. */
const PARALLEL_OFFSET = 14;

function column(ids: readonly string[], side: 'source' | 'target', height: number) {
  const span = ids.length * NODE_HEIGHT + Math.max(ids.length - 1, 0) * GAP;
  const top = (height - span) / 2;
  const x = side === 'source' ? PADDING : GRAPH_WIDTH - PADDING - NODE_WIDTH;
  return ids.map((id, index) => ({ id, column: side, x, y: top + index * (NODE_HEIGHT + GAP) }));
}

export function layoutConnectionGraph(
  sources: readonly string[],
  targets: readonly string[],
  edges: readonly GraphEdgeInput[],
): GraphLayout {
  const rows = Math.max(sources.length, targets.length, 1);
  const height = Math.max(MIN_HEIGHT, PADDING * 2 + rows * NODE_HEIGHT + (rows - 1) * GAP);
  const nodes = [...column(sources, 'source', height), ...column(targets, 'target', height)];
  const byId = new Map(nodes.map((node) => [node.id, node]));

  const pairs = new Map<string, GraphEdgeInput[]>();
  for (const edge of edges) {
    const key = `${edge.source}→${edge.target}`;
    pairs.set(key, [...(pairs.get(key) ?? []), edge]);
  }

  const paths = edges.flatMap((edge): GraphEdgePath[] => {
    const source = byId.get(edge.source);
    const target = byId.get(edge.target);
    if (!source || !target) {
      return [];
    }
    const siblings = pairs.get(`${edge.source}→${edge.target}`)!;
    const offset = (siblings.indexOf(edge) - (siblings.length - 1) / 2) * PARALLEL_OFFSET;
    const x1 = source.x + NODE_WIDTH;
    const y1 = source.y + NODE_HEIGHT / 2 + offset;
    const x2 = target.x;
    const y2 = target.y + NODE_HEIGHT / 2 + offset;
    const middle = (x1 + x2) / 2;
    return [{ id: edge.id, path: `M ${x1} ${y1} C ${middle} ${y1}, ${middle} ${y2}, ${x2} ${y2}` }];
  });

  return {
    width: GRAPH_WIDTH,
    height,
    nodeWidth: NODE_WIDTH,
    nodeHeight: NODE_HEIGHT,
    nodes,
    edges: paths,
  };
}
