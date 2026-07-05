// Flattens the three portfolio diagrams into one searchable graph for the
// spotlight explorer: a node index plus parent/child adjacency.
import { diagrams, type PNode } from './portfolio';

export interface GraphNode extends PNode {
  parents: string[]; // what it is made from
  children: string[]; // what it produces / its uses
}

export function buildGraph(): { nodes: GraphNode[]; index: Record<string, GraphNode> } {
  const index: Record<string, GraphNode> = {};
  for (const dia of diagrams) {
    for (const nd of dia.nodes) {
      // ids are unique across diagrams (c_/p_ prefixes); first wins if not.
      if (!index[nd.id]) index[nd.id] = { ...nd, parents: [], children: [] };
    }
  }
  for (const dia of diagrams) {
    for (const { from, to } of dia.edges) {
      if (index[from] && index[to]) {
        index[from].children.push(to);
        index[to].parents.push(from);
      }
    }
  }
  return { nodes: Object.values(index), index };
}

// A sensible default focus for server render / first paint.
export const DEFAULT_FOCUS = 'ethylene';
