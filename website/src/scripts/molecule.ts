// Hero centerpiece: the C60 wireframe assembles bond-by-bond, tumbles slowly,
// and steers toward the pointer. Pure canvas 2D — no library. The static SVG
// snapshot in Hero.astro remains the no-JS / reduced-motion rendering.
import { c60, assemblyOrder, labelIndices, LABELS, project } from '../data/molecule3d';
import { prefersReduced, isTouch } from './motion';

let raf = 0;
let cleanup: (() => void) | null = null;

export function initMolecule() {
  const canvas = document.querySelector<HTMLCanvasElement>('.hero-mol3d');
  if (!canvas || prefersReduced()) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const css = getComputedStyle(document.documentElement);
  const TEAL = css.getPropertyValue('--teal').trim() || '#0d6b6b';
  const INK = css.getPropertyValue('--ink').trim() || '#10151c';
  const PAPER = css.getPropertyValue('--paper').trim() || '#f7f8fa';
  const SOFT = css.getPropertyValue('--ink-soft').trim() || '#5b6773';

  const { verts, edges } = c60();
  const order = assemblyOrder(verts.length, edges);
  const edgeSlot = new Array(edges.length).fill(0);
  order.forEach((ei, slot) => (edgeSlot[ei] = slot));
  const labeled = labelIndices(verts);
  // An atom fades in with the wave that first reaches it.
  const nodeSlot = verts.map((_, vi) => {
    const touching = edges
      .map((e, i) => ({ e, i }))
      .filter(({ e }) => e[0] === vi || e[1] === vi)
      .map(({ i }) => edgeSlot[i]);
    return Math.min(...touching);
  });

  const touch = isTouch();
  const dpr = Math.min(devicePixelRatio, touch ? 1.5 : 2);
  let W = 0, H = 0;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  // Pointer steering with inertia (desktop only)
  const steer = { x: 0, y: 0, tx: 0, ty: 0 };
  const onMove = (e: PointerEvent) => {
    steer.tx = (e.clientX / innerWidth - 0.5) * 0.7;
    steer.ty = (e.clientY / innerHeight - 0.5) * 0.45;
  };
  if (!touch) window.addEventListener('pointermove', onMove, { passive: true });

  let visible = true;
  const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
  io.observe(canvas);

  // Assembly starts on first visible frame.
  const ASSEMBLY_MS = 2400;
  const WAVE = 14; // how many bonds draw concurrently
  let start = 0;
  let frame = 0;

  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    if (!visible) return;
    if (touch && ++frame % 2) return; // 30fps is plenty on phones
    if (!start) start = now;

    const t = Math.min(1, (now - start) / ASSEMBLY_MS);
    const wave = easeOut(t) * (order.length + WAVE);
    const ry = now / 12000 + steer.x;
    const rx = -0.35 + Math.sin(now / 9000) * 0.08 + steer.y;
    steer.x += (steer.tx - steer.x) * 0.04;
    steer.y += (steer.ty - steer.y) * 0.04;

    const R = Math.min(W, H) * 0.38;
    const p = verts.map((v) => project(v, rx, ry, R, W / 2, H / 2));

    ctx.clearRect(0, 0, W, H);

    // Bonds, back to front, each drawing in as its wave slot arrives
    const byDepth = edges
      .map((e, i) => ({ e, i, z: (p[e[0]].z + p[e[1]].z) / 2 }))
      .sort((a, b) => a.z - b.z);
    for (const { e, i, z } of byDepth) {
      const prog = Math.max(0, Math.min(1, (wave - edgeSlot[i]) / WAVE));
      if (prog === 0) continue;
      const a = p[e[0]], b = p[e[1]];
      const depth = (z + 1) / 2; // 0 far → 1 near
      ctx.strokeStyle = TEAL;
      ctx.globalAlpha = (0.14 + depth * 0.66) * prog;
      ctx.lineWidth = 0.7 + depth * 0.9;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(a.x + (b.x - a.x) * prog, a.y + (b.y - a.y) * prog);
      ctx.stroke();
    }

    // Atoms: hollow when far, filled when near; the frontmost few in ink
    for (let vi = 0; vi < verts.length; vi++) {
      const prog = Math.max(0, Math.min(1, (wave - nodeSlot[vi]) / WAVE));
      if (prog === 0) continue;
      const pt = p[vi];
      const depth = (pt.z + 1) / 2;
      const r = (1.6 + depth * 2.6) * prog;
      ctx.globalAlpha = (0.25 + depth * 0.75) * prog;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
      if (depth > 0.82) {
        ctx.fillStyle = INK;
        ctx.fill();
      } else if (depth > 0.45) {
        ctx.fillStyle = TEAL;
        ctx.fill();
      } else {
        ctx.fillStyle = PAPER;
        ctx.fill();
        ctx.strokeStyle = TEAL;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Product-formula labels on front-facing labeled atoms
    ctx.font = '500 12.5px "IBM Plex Sans", sans-serif';
    ctx.textBaseline = 'middle';
    labeled.forEach((vi, li) => {
      const pt = p[vi];
      if (pt.z < 0.15) return;
      const prog = Math.max(0, Math.min(1, (wave - nodeSlot[vi]) / WAVE));
      const a = Math.min(1, (pt.z - 0.15) / 0.5) * prog;
      if (a <= 0) return;
      ctx.globalAlpha = a * 0.9;
      ctx.strokeStyle = SOFT;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(pt.x + 6, pt.y - 6);
      ctx.lineTo(pt.x + 16, pt.y - 16);
      ctx.stroke();
      ctx.fillStyle = SOFT;
      ctx.fillText(LABELS[li], pt.x + 20, pt.y - 16);
    });
    ctx.globalAlpha = 1;
  };
  raf = requestAnimationFrame(loop);
  canvas.closest('.hero')?.classList.add('molecule-live');

  cleanup = () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    if (!touch) window.removeEventListener('pointermove', onMove);
    io.disconnect();
  };
}

export function destroyMolecule() {
  cleanup?.();
  cleanup = null;
}
