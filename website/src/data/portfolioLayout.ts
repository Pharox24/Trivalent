// Deterministic layered (Sugiyama-style) layout for a portfolio diagram.
// Columns are assigned by longest-path depth from the roots so the flow reads
// left-to-right; rows within a column are ordered by the barycenter of each
// node's neighbours to reduce edge crossings. Runs at build time.
import type { Diagram, PNode } from './portfolio';

export interface LaidNode extends PNode {
  col: number;
  row: number;
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface LaidEdge {
  from: string;
  to: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
export interface LaidDiagram {
  id: string;
  titleEn: string;
  titleZh: string;
  nodes: LaidNode[];
  edges: LaidEdge[];
  width: number;
  height: number;
}

const COL_W = 250; // horizontal spacing between columns
const ROW_H = 46; // vertical spacing between rows
const NODE_W = 190;
const NODE_H = 30;
const PAD = 60;

export function layout(dia: Diagram): LaidDiagram {
  const ids = dia.nodes.map((n) => n.id);
  const idSet = new Set(ids);
  const edges = dia.edges.filter((e) => idSet.has(e.from) && idSet.has(e.to));

  const outAdj = new Map<string, string[]>();
  const inAdj = new Map<string, string[]>();
  ids.forEach((id) => {
    outAdj.set(id, []);
    inAdj.set(id, []);
  });
  for (const { from, to } of edges) {
    outAdj.get(from)!.push(to);
    inAdj.get(to)!.push(from);
  }

  // Column = longest path from any root (node with no incoming edges).
  // Computed via memoised DFS with cycle guard (graph is a near-DAG).
  const depth = new Map<string, number>();
  const visiting = new Set<string>();
  const computeDepth = (id: string): number => {
    if (depth.has(id)) return depth.get(id)!;
    if (visiting.has(id)) return 0; // break any accidental cycle
    visiting.add(id);
    const parents = inAdj.get(id)!;
    const d = parents.length === 0 ? 0 : 1 + Math.max(...parents.map(computeDepth));
    visiting.delete(id);
    depth.set(id, d);
    return d;
  };
  ids.forEach(computeDepth);

  const maxCol = Math.max(...ids.map((id) => depth.get(id)!));
  const cols: string[][] = Array.from({ length: maxCol + 1 }, () => []);
  // Initial order: keep declaration order (stable, mirrors PDF top-to-bottom).
  dia.nodes.forEach((node) => cols[depth.get(node.id)!].push(node.id));

  const rowOf = new Map<string, number>();
  const setRows = () => cols.forEach((col) => col.forEach((id, i) => rowOf.set(id, i)));
  setRows();

  // Barycenter ordering sweeps to reduce crossings.
  const bary = (id: string, adj: Map<string, string[]>): number => {
    const nb = adj.get(id)!.filter((x) => rowOf.has(x));
    if (nb.length === 0) return rowOf.get(id)!;
    return nb.reduce((s, x) => s + rowOf.get(x)!, 0) / nb.length;
  };
  for (let pass = 0; pass < 6; pass++) {
    const forward = pass % 2 === 0;
    const range = forward ? [...cols.keys()] : [...cols.keys()].reverse();
    for (const c of range) {
      const adj = forward ? inAdj : outAdj;
      cols[c] = [...cols[c]].sort((a, b) => bary(a, adj) - bary(b, adj));
      cols[c].forEach((id, i) => rowOf.set(id, i));
    }
  }

  const maxRows = Math.max(...cols.map((c) => c.length));
  const height = PAD * 2 + (maxRows - 1) * ROW_H + NODE_H;
  const width = PAD * 2 + maxCol * COL_W + NODE_W;

  const laidNodes: LaidNode[] = [];
  const pos = new Map<string, LaidNode>();
  cols.forEach((col, c) => {
    // Vertically centre each column within the tallest one.
    const offset = ((maxRows - col.length) * ROW_H) / 2;
    col.forEach((id, r) => {
      const src = dia.nodes.find((nn) => nn.id === id)!;
      const ln: LaidNode = {
        ...src,
        col: c,
        row: r,
        x: PAD + c * COL_W,
        y: PAD + offset + r * ROW_H,
        w: NODE_W,
        h: NODE_H,
      };
      laidNodes.push(ln);
      pos.set(id, ln);
    });
  });

  const laidEdges: LaidEdge[] = edges.map(({ from, to }) => {
    const a = pos.get(from)!;
    const b = pos.get(to)!;
    return {
      from,
      to,
      x1: a.x + a.w,
      y1: a.y + a.h / 2,
      x2: b.x,
      y2: b.y + b.h / 2,
    };
  });

  return { id: dia.id, titleEn: dia.titleEn, titleZh: dia.titleZh, nodes: laidNodes, edges: laidEdges, width, height };
}
