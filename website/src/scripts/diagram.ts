// Scroll-drawn value-chain flow + accessible node tooltips.
// The static SVG is complete without this module; everything here is enhancement.
import gsap from 'gsap';
import { prefersReduced } from './motion';

const TIER_ORDER = ['feedstock', 'process', 'division', 'market'] as const;

type TipData = Record<string, { label: string; products: string[] }>;

let teardowns: (() => void)[] = [];

function setupDraw(section: HTMLElement) {
  if (prefersReduced()) return;

  section.querySelectorAll<SVGSVGElement>('.vc-svg').forEach((svg) => {
    // Only the orientation visible at this breakpoint gets animated —
    // setting dash/transform state on the hidden one doubles init cost for nothing.
    if (getComputedStyle(svg).display === 'none') return;
    const edges = [...svg.querySelectorAll<SVGPathElement>('.vc-edge')];
    const nodes = [...svg.querySelectorAll<SVGGElement | SVGAElement>('.vc-node')];

    const tierOf = (id: string) =>
      (svg.querySelector(`[data-node="${id}"]`) as HTMLElement | null)?.dataset.tier ?? 'feedstock';
    const edgeOrder = (e: SVGPathElement) => TIER_ORDER.indexOf(tierOf(e.dataset.from!) as any);

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: section, start: 'top 70%', end: 'top 15%', scrub: 1 },
    });

    // Nodes pop tier by tier; edges sourced from a tier draw right after its nodes land.
    TIER_ORDER.forEach((tier, i) => {
      const tierNodes = nodes.filter((n) => n.dataset.tier === tier);
      const tierEdges = edges.filter((e) => edgeOrder(e) === i);
      gsap.set(tierNodes, { scale: 0, transformOrigin: 'center', transformBox: 'fill-box' });
      gsap.set(tierEdges, { strokeDasharray: 1, strokeDashoffset: 1 });
      tl.to(tierNodes, { scale: 1, duration: 0.5, stagger: 0.08 }, i * 0.9);
      tl.to(tierEdges, { strokeDashoffset: 0, duration: 0.8, stagger: 0.06 }, i * 0.9 + 0.3);
    });

    teardowns.push(() => {
      tl.scrollTrigger?.kill();
      tl.kill();
      gsap.set([...edges, ...nodes], { clearProps: 'all' });
    });
  });
}

function setupTooltips(section: HTMLElement) {
  const tip = section.querySelector<HTMLDivElement>('.vc-tip');
  const wrap = section.querySelector<HTMLElement>('.vc-wrap');
  const dataEl = section.querySelector('.vc-data');
  if (!tip || !wrap || !dataEl) return;

  const data: TipData = JSON.parse(dataEl.textContent ?? '{}');
  let openNode: Element | null = null;

  const hide = () => {
    tip.hidden = true;
    openNode?.setAttribute('aria-expanded', 'false');
    section.querySelectorAll('.vc-edge.is-active').forEach((e) => e.classList.remove('is-active'));
    openNode = null;
  };

  const show = (node: Element) => {
    const id = (node as HTMLElement).dataset.node!;
    const entry = data[id];
    if (!entry) return;

    const strong = document.createElement('strong');
    strong.textContent = entry.label;
    const ul = document.createElement('ul');
    for (const p of entry.products) {
      const li = document.createElement('li');
      li.textContent = p;
      ul.append(li);
    }
    tip.replaceChildren(strong, ul);
    tip.hidden = false;

    // Highlight connected edges
    section.querySelectorAll('.vc-edge.is-active').forEach((e) => e.classList.remove('is-active'));
    section
      .querySelectorAll(`.vc-edge[data-from="${id}"], .vc-edge[data-to="${id}"]`)
      .forEach((e) => e.classList.add('is-active'));

    // Position near the node's dot, flipped when close to the wrap's edge
    const dot = node.querySelector('.vc-dot')!;
    const dotRect = dot.getBoundingClientRect();
    const wrapRect = wrap.getBoundingClientRect();
    const tipRect = tip.getBoundingClientRect();
    let x = dotRect.left - wrapRect.left + dotRect.width / 2 + 16;
    let y = dotRect.top - wrapRect.top - tipRect.height / 2;
    if (x + tipRect.width > wrapRect.width) x = x - tipRect.width - 32;
    y = Math.max(8, Math.min(y, wrapRect.height - tipRect.height - 8));
    tip.style.insetInlineStart = 'auto';
    tip.style.left = `${x}px`;
    tip.style.top = `${y}px`;

    openNode?.setAttribute('aria-expanded', 'false');
    node.setAttribute('aria-expanded', 'true');
    openNode = node;
  };

  const nodes = section.querySelectorAll<SVGGElement | SVGAElement>('.vc-node');
  const listeners: [Element | Document, string, EventListener][] = [];
  const on = (el: Element | Document, ev: string, fn: EventListener) => {
    el.addEventListener(ev, fn);
    listeners.push([el, ev, fn]);
  };

  nodes.forEach((node) => {
    on(node, 'mouseenter', () => show(node));
    on(node, 'mouseleave', hide);
    on(node, 'focus', () => show(node));
    on(node, 'blur', hide);
    if (!(node instanceof SVGAElement)) {
      on(node, 'click', () => (openNode === node ? hide() : show(node)));
      on(node, 'keydown', ((e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openNode === node ? hide() : show(node);
        }
      }) as EventListener);
    }
  });
  on(document, 'keydown', ((e: KeyboardEvent) => {
    if (e.key === 'Escape') hide();
  }) as EventListener);

  teardowns.push(() => {
    listeners.forEach(([el, ev, fn]) => el.removeEventListener(ev, fn));
    hide();
  });
}

export function initDiagram() {
  const section = document.querySelector<HTMLElement>('.vc-section');
  if (!section) return;
  setupDraw(section);
  setupTooltips(section);
}

export function destroyDiagram() {
  teardowns.forEach((fn) => fn());
  teardowns = [];
}
