// C60 (buckminsterfullerene) wireframe geometry, shared by the build-time
// static SVG fallback and the client-side canvas animation.
export type Vec3 = [number, number, number];

const PHI = (1 + Math.sqrt(5)) / 2;

export function c60(): { verts: Vec3[]; edges: [number, number][] } {
  // Truncated-icosahedron vertices: cyclic permutations of three base
  // triples under all sign choices, normalized to the unit sphere.
  const base: Vec3[] = [
    [0, 1, 3 * PHI],
    [1, 2 + PHI, 2 * PHI],
    [PHI, 2, 2 * PHI + 1],
  ];
  const set = new Map<string, Vec3>();
  for (const [a, b, c] of base) {
    const cyclic: Vec3[] = [[a, b, c], [b, c, a], [c, a, b]];
    for (const [x, y, z] of cyclic)
      for (const sx of [1, -1])
        for (const sy of [1, -1])
          for (const sz of [1, -1]) {
            const v: Vec3 = [x * sx, y * sy, z * sz];
            set.set(v.map((n) => n.toFixed(4)).join(','), v);
          }
  }
  const raw = [...set.values()];
  const r = Math.hypot(...raw[0]);
  const verts = raw.map(([x, y, z]) => [x / r, y / r, z / r] as Vec3);

  // Edges join vertex pairs at the minimal (bond) distance.
  const bond = 2 / r;
  const edges: [number, number][] = [];
  for (let i = 0; i < verts.length; i++)
    for (let j = i + 1; j < verts.length; j++) {
      const d = Math.hypot(
        verts[i][0] - verts[j][0],
        verts[i][1] - verts[j][1],
        verts[i][2] - verts[j][2]
      );
      if (Math.abs(d - bond) < 0.01) edges.push([i, j]);
    }
  return { verts, edges };
}

// BFS over the bond graph from one atom: the order bonds appear during the
// self-assembly animation, so the molecule grows organically from a seed.
export function assemblyOrder(vertCount: number, edges: [number, number][]): number[] {
  const adj: number[][] = Array.from({ length: vertCount }, () => []);
  edges.forEach(([a, b], i) => {
    adj[a].push(i);
    adj[b].push(i);
  });
  const seenV = new Set<number>([0]);
  const seenE = new Set<number>();
  const order: number[] = [];
  const queue = [0];
  while (queue.length) {
    const v = queue.shift()!;
    for (const ei of adj[v]) {
      if (seenE.has(ei)) continue;
      seenE.add(ei);
      order.push(ei);
      const [a, b] = edges[ei];
      const w = a === v ? b : a;
      if (!seenV.has(w)) {
        seenV.add(w);
        queue.push(w);
      }
    }
  }
  return order;
}

// Six well-separated atoms carry product labels — chemical formulas are
// language-neutral, so no i18n entries are needed.
export const LABELS = ['BaSO₄', 'TiO₂', 'K₂SO₄', 'PU', 'NPK', 'C₃H₈NO₅P'];

export function labelIndices(verts: Vec3[], count = LABELS.length): number[] {
  const dist = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const picked = [0];
  while (picked.length < count) {
    let best = -1;
    let bestD = -1;
    for (let i = 0; i < verts.length; i++) {
      if (picked.includes(i)) continue;
      const d = Math.min(...picked.map((p) => dist(verts[p], verts[i])));
      if (d > bestD) {
        bestD = d;
        best = i;
      }
    }
    picked.push(best);
  }
  return picked;
}

// Rotate (Y then X) and perspective-project a unit-sphere vertex.
export function project(
  v: Vec3,
  rx: number,
  ry: number,
  R: number,
  cx: number,
  cy: number
): { x: number; y: number; z: number } {
  const [x0, y0, z0] = v;
  const cosY = Math.cos(ry), sinY = Math.sin(ry);
  const x1 = x0 * cosY + z0 * sinY;
  const z1 = -x0 * sinY + z0 * cosY;
  const cosX = Math.cos(rx), sinX = Math.sin(rx);
  const y2 = y0 * cosX - z1 * sinX;
  const z2 = y0 * sinX + z1 * cosX;
  const persp = 3.2 / (3.2 - z2);
  return { x: cx + x1 * R * persp, y: cy + y2 * R * persp, z: z2 };
}
