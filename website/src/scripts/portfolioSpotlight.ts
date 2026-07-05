// Spotlight portfolio explorer: one product centred, with what it's made from
// on one side and what it produces / its uses on the other. Search-driven,
// click a neighbour to re-centre. Never shows more than one node's
// neighbourhood, so it can't clutter.
import { prefersReduced } from './motion';

interface GNode {
  id: string;
  label: string;
  sub: string;
  search: string;
  coverage: 'daily' | 'tracked' | 'unit' | 'app';
  parents: string[];
  children: string[];
}

let teardowns: (() => void)[] = [];

function setup(root: HTMLElement) {
  const dataEl = root.querySelector<HTMLScriptElement>('[data-graph]');
  const stage = root.querySelector<HTMLElement>('[data-pf2-stage]');
  const inner = root.querySelector<HTMLElement>('[data-pf2-inner]');
  const svg = root.querySelector<SVGSVGElement>('[data-pf2-svg]');
  const searchInput = root.querySelector<HTMLInputElement>('[data-pf2-search]');
  const results = root.querySelector<HTMLElement>('[data-pf2-results]');
  const backBtn = root.querySelector<HTMLButtonElement>('[data-pf2-back]');
  if (!dataEl || !stage || !inner || !svg || !searchInput || !results || !backBtn) return;

  const strings = {
    madeFrom: root.dataset.madeFrom ?? 'Made from',
    produces: root.dataset.produces ?? 'Produces & uses',
    noResults: root.dataset.noResults ?? 'No products match',
    root: root.dataset.root ?? 'Feedstock',
  };

  const list: GNode[] = JSON.parse(dataEl.textContent ?? '[]');
  const byId = new Map(list.map((g) => [g.id, g]));
  const reduce = prefersReduced();

  let focus = root.dataset.focus ?? list[0]?.id;
  const history: string[] = [];

  const nodeEl = (g: GNode, kind: 'focus' | 'parent' | 'child') => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `pf2-node pf2-node--${g.coverage} pf2-node--${kind}`;
    btn.dataset.id = g.id;
    const label = document.createElement('span');
    label.className = 'pf2-label';
    label.textContent = g.label;
    btn.appendChild(label);
    if (g.sub) {
      const sub = document.createElement('span');
      sub.className = 'pf2-sub';
      sub.textContent = g.sub;
      btn.appendChild(sub);
    }
    if (kind === 'focus') btn.setAttribute('aria-current', 'true');
    return btn;
  };

  const render = () => {
    const g = byId.get(focus);
    if (!g) return;
    backBtn.disabled = history.length === 0;

    // Build columns
    inner.querySelectorAll('.pf2-col, .pf2-focuswrap').forEach((n) => n.remove());

    const parents = g.parents.map((id) => byId.get(id)).filter(Boolean) as GNode[];
    const children = g.children.map((id) => byId.get(id)).filter(Boolean) as GNode[];

    const makeCol = (side: 'left' | 'right', label: string, items: GNode[]) => {
      const col = document.createElement('div');
      col.className = `pf2-col pf2-col--${side}`;
      if (items.length) {
        const h = document.createElement('span');
        h.className = 'pf2-colhead';
        h.textContent = label;
        col.appendChild(h);
      }
      items.forEach((it) => col.appendChild(nodeEl(it, side === 'left' ? 'parent' : 'child')));
      return col;
    };

    const leftCol = makeCol('left', strings.madeFrom, parents);
    const focusWrap = document.createElement('div');
    focusWrap.className = 'pf2-focuswrap';
    focusWrap.appendChild(nodeEl(g, 'focus'));
    if (g.parents.length === 0) {
      const chip = document.createElement('span');
      chip.className = 'pf2-rootchip';
      chip.textContent = strings.root;
      focusWrap.appendChild(chip);
    }
    const rightCol = makeCol('right', strings.produces, children);

    inner.append(leftCol, focusWrap, rightCol);

    drawConnectors(g, parents, children);
    if (!reduce) animateIn();
  };

  const drawConnectors = (g: GNode, parents: GNode[], children: GNode[]) => {
    const innerRect = inner.getBoundingClientRect();
    svg.setAttribute('width', String(inner.scrollWidth));
    svg.setAttribute('height', String(inner.scrollHeight));
    svg.setAttribute('viewBox', `0 0 ${inner.scrollWidth} ${inner.scrollHeight}`);
    svg.innerHTML = '';

    const focusBtn = inner.querySelector<HTMLElement>('.pf2-node--focus')!;
    const center = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return {
        cx: r.left - innerRect.left + inner.scrollLeft,
        cy: r.top - innerRect.top + inner.scrollTop,
        w: r.width,
        h: r.height,
      };
    };
    const f = center(focusBtn);
    const fLeft = { x: f.cx, y: f.cy + f.h / 2 };
    const fRight = { x: f.cx + f.w, y: f.cy + f.h / 2 };

    const curve = (x1: number, y1: number, x2: number, y2: number) => {
      const mx = (x1 + x2) / 2;
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`);
      p.setAttribute('class', 'pf2-edge');
      svg.appendChild(p);
      return p;
    };

    inner.querySelectorAll<HTMLElement>('.pf2-col--left .pf2-node').forEach((el) => {
      const c = center(el);
      curve(c.cx + c.w, c.cy + c.h / 2, fLeft.x, fLeft.y);
    });
    inner.querySelectorAll<HTMLElement>('.pf2-col--right .pf2-node').forEach((el) => {
      const c = center(el);
      curve(fRight.x, fRight.y, c.cx, c.cy + c.h / 2);
    });
  };

  const animateIn = () => {
    const nodes = [...inner.querySelectorAll<HTMLElement>('.pf2-node')];
    const edges = [...svg.querySelectorAll<SVGPathElement>('.pf2-edge')];
    nodes.forEach((el) => {
      el.style.transition = 'none';
      el.style.opacity = '0';
      el.style.transform = 'translateY(8px)';
    });
    edges.forEach((p) => {
      const len = p.getTotalLength();
      p.style.transition = 'none';
      p.style.strokeDasharray = String(len);
      p.style.strokeDashoffset = String(len);
    });
    // Force a reflow so the initial state is committed before we transition.
    void inner.offsetHeight;
    nodes.forEach((el, i) => {
      el.style.transition = `opacity .4s ease ${i * 0.012}s, transform .5s cubic-bezier(.16,1,.3,1) ${i * 0.012}s`;
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    edges.forEach((p) => {
      p.style.transition = 'stroke-dashoffset .6s ease .1s';
      p.style.strokeDashoffset = '0';
    });
  };

  const setFocus = (id: string, pushHistory = true) => {
    if (!byId.has(id) || id === focus) return;
    if (pushHistory) history.push(focus);
    focus = id;
    render();
    stage.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

  // Click a neighbour → re-centre
  const onStageClick = (e: MouseEvent) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('.pf2-node');
    if (!btn || btn.classList.contains('pf2-node--focus')) return;
    setFocus(btn.dataset.id!);
  };
  stage.addEventListener('click', onStageClick);

  const onBack = () => {
    const prev = history.pop();
    if (prev) setFocus(prev, false);
  };
  backBtn.addEventListener('click', onBack);

  // Search
  const renderResults = (q: string) => {
    const term = q.trim().toLowerCase();
    if (!term) {
      results.hidden = true;
      results.innerHTML = '';
      return;
    }
    const matches = list
      .filter((g) => g.search.includes(term))
      .slice(0, 8);
    results.innerHTML = '';
    if (!matches.length) {
      const li = document.createElement('div');
      li.className = 'pf2-noresult';
      li.textContent = strings.noResults;
      results.appendChild(li);
    } else {
      matches.forEach((g) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = `pf2-resitem pf2-dot--${g.coverage}`;
        b.textContent = g.sub ? `${g.label} · ${g.sub}` : g.label;
        b.addEventListener('click', () => {
          setFocus(g.id);
          searchInput.value = '';
          results.hidden = true;
        });
        results.appendChild(b);
      });
    }
    results.hidden = false;
  };
  const onInput = () => renderResults(searchInput.value);
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      searchInput.value = '';
      results.hidden = true;
    }
    if (e.key === 'Enter') {
      const first = results.querySelector<HTMLButtonElement>('.pf2-resitem');
      first?.click();
    }
  };
  searchInput.addEventListener('input', onInput);
  searchInput.addEventListener('keydown', onKey);
  const onDocClick = (e: MouseEvent) => {
    if (!results.contains(e.target as Node) && e.target !== searchInput) results.hidden = true;
  };
  document.addEventListener('click', onDocClick);

  const onResize = () => {
    const g = byId.get(focus);
    if (g) {
      const parents = g.parents.map((id) => byId.get(id)).filter(Boolean) as GNode[];
      const children = g.children.map((id) => byId.get(id)).filter(Boolean) as GNode[];
      drawConnectors(g, parents, children);
    }
  };
  window.addEventListener('resize', onResize);

  root.classList.add('pf2-ready');
  render();

  teardowns.push(() => {
    stage.removeEventListener('click', onStageClick);
    backBtn.removeEventListener('click', onBack);
    searchInput.removeEventListener('input', onInput);
    searchInput.removeEventListener('keydown', onKey);
    document.removeEventListener('click', onDocClick);
    window.removeEventListener('resize', onResize);
  });
}

export function initPortfolioSpotlight() {
  const root = document.querySelector<HTMLElement>('[data-pf2-root]');
  if (root) setup(root);
}

export function destroyPortfolioSpotlight() {
  teardowns.forEach((fn) => fn());
  teardowns = [];
}
