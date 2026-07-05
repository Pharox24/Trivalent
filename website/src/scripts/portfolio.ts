// Pan/zoom + neighbour-highlight interaction for portfolio flow diagrams.
// Progressive enhancement: the SVG is fully rendered and readable without it.
import { prefersReduced } from './motion';

interface View { x: number; y: number; scale: number }

let teardowns: (() => void)[] = [];

function setupStage(stage: HTMLElement) {
  const pan = stage.querySelector<HTMLElement>('[data-pf-pan]');
  const svg = stage.querySelector<SVGSVGElement>('.pf-svg');
  if (!pan || !svg) return;

  const contentW = Number(svg.getAttribute('width'));
  const contentH = Number(svg.getAttribute('height'));

  const view: View = { x: 0, y: 0, scale: 1 };
  const MIN = 0.2;
  const MAX = 2.5;

  const apply = () => {
    pan.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`;
  };

  const fit = () => {
    const rect = stage.getBoundingClientRect();
    const s = Math.min(rect.width / contentW, rect.height / contentH) * 0.98;
    view.scale = Math.max(MIN, Math.min(MAX, s));
    view.x = (rect.width - contentW * view.scale) / 2;
    view.y = (rect.height - contentH * view.scale) / 2;
    apply();
  };
  fit();

  const clampScale = (s: number) => Math.max(MIN, Math.min(MAX, s));

  const zoomAt = (cx: number, cy: number, factor: number) => {
    const next = clampScale(view.scale * factor);
    const k = next / view.scale;
    view.x = cx - (cx - view.x) * k;
    view.y = cy - (cy - view.y) * k;
    view.scale = next;
    apply();
  };

  // Wheel zoom toward cursor
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const rect = stage.getBoundingClientRect();
    zoomAt(e.clientX - rect.left, e.clientY - rect.top, e.deltaY < 0 ? 1.12 : 1 / 1.12);
  };
  stage.addEventListener('wheel', onWheel, { passive: false });

  // Pointer drag to pan (+ pinch zoom)
  const pointers = new Map<number, { x: number; y: number }>();
  let lastPinch = 0;
  let dragged = false;

  const onDown = (e: PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    dragged = false;
    if (pointers.size === 1) stage.classList.add('is-grabbing');
  };
  const onMove = (e: PointerEvent) => {
    if (!pointers.has(e.pointerId)) return;
    const prev = pointers.get(e.pointerId)!;
    const cur = { x: e.clientX, y: e.clientY };
    pointers.set(e.pointerId, cur);

    if (pointers.size === 1) {
      view.x += cur.x - prev.x;
      view.y += cur.y - prev.y;
      if (Math.abs(cur.x - prev.x) + Math.abs(cur.y - prev.y) > 2) dragged = true;
      apply();
    } else if (pointers.size === 2) {
      const pts = [...pointers.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (lastPinch) {
        const rect = stage.getBoundingClientRect();
        const mx = (pts[0].x + pts[1].x) / 2 - rect.left;
        const my = (pts[0].y + pts[1].y) / 2 - rect.top;
        zoomAt(mx, my, dist / lastPinch);
      }
      lastPinch = dist;
    }
  };
  const onUp = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) lastPinch = 0;
    if (pointers.size === 0) stage.classList.remove('is-grabbing');
  };
  stage.addEventListener('pointerdown', onDown);
  stage.addEventListener('pointermove', onMove);
  stage.addEventListener('pointerup', onUp);
  stage.addEventListener('pointercancel', onUp);

  // Neighbour highlight on node tap/hover
  const nodes = [...svg.querySelectorAll<SVGGElement>('.pf-node')];
  const edges = [...svg.querySelectorAll<SVGPathElement>('.pf-edge')];
  const adj = new Map<string, Set<string>>();
  edges.forEach((ed) => {
    const f = ed.dataset.from!;
    const t = ed.dataset.to!;
    (adj.get(f) ?? adj.set(f, new Set()).get(f)!).add(t);
    (adj.get(t) ?? adj.set(t, new Set()).get(t)!).add(f);
  });

  const clearHi = () => {
    nodes.forEach((nd) => nd.classList.remove('is-dim', 'is-focus'));
    edges.forEach((ed) => ed.classList.remove('is-lit'));
  };
  const highlight = (id: string) => {
    const keep = new Set<string>([id, ...(adj.get(id) ?? [])]);
    nodes.forEach((nd) => {
      const nid = nd.dataset.node!;
      nd.classList.toggle('is-dim', !keep.has(nid));
      nd.classList.toggle('is-focus', nid === id);
    });
    edges.forEach((ed) => ed.classList.toggle('is-lit', ed.dataset.from === id || ed.dataset.to === id));
  };

  nodes.forEach((nd) => {
    const enter = () => highlight(nd.dataset.node!);
    nd.addEventListener('mouseenter', enter);
    nd.addEventListener('click', (e) => {
      if (dragged) return; // ignore clicks that were really drags
      e.stopPropagation();
      highlight(nd.dataset.node!);
    });
  });
  stage.addEventListener('mouseleave', clearHi);
  stage.addEventListener('click', (e) => {
    if (e.target === stage || (e.target as Element).closest('.pf-pan') === pan && !(e.target as Element).closest('.pf-node')) clearHi();
  });

  // Toolbar controls (buttons live in the page, scoped by data-pf-controls id)
  const controls = stage.closest('[data-pf-group]')?.querySelector('[data-pf-controls]');
  const onControl = (e: Event) => {
    const act = (e.target as HTMLElement).closest('[data-act]')?.getAttribute('data-act');
    if (!act) return;
    const rect = stage.getBoundingClientRect();
    if (act === 'in') zoomAt(rect.width / 2, rect.height / 2, 1.25);
    if (act === 'out') zoomAt(rect.width / 2, rect.height / 2, 1 / 1.25);
    if (act === 'reset') { clearHi(); fit(); }
  };
  controls?.addEventListener('click', onControl);

  const onResize = () => fit();
  window.addEventListener('resize', onResize);

  teardowns.push(() => {
    stage.removeEventListener('wheel', onWheel);
    stage.removeEventListener('pointerdown', onDown);
    stage.removeEventListener('pointermove', onMove);
    stage.removeEventListener('pointerup', onUp);
    stage.removeEventListener('pointercancel', onUp);
    controls?.removeEventListener('click', onControl);
    window.removeEventListener('resize', onResize);
  });
}

export function initPortfolio() {
  const stages = document.querySelectorAll<HTMLElement>('[data-pf-stage]');
  if (!stages.length) return;
  // Even under reduced motion the pan/zoom is fine (no animation); just wire it.
  void prefersReduced;
  stages.forEach(setupStage);
}

export function destroyPortfolio() {
  teardowns.forEach((fn) => fn());
  teardowns = [];
}
