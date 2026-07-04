// Custom cursor (augments, never replaces, the native cursor) + magnetic CTAs.
// Skipped entirely on touch devices and under reduced motion.
import gsap from 'gsap';
import { prefersReduced, isTouch } from './motion';

let teardowns: (() => void)[] = [];

function setupCursor() {
  const dot = document.createElement('div');
  const ring = document.createElement('div');
  dot.className = 'cur-dot';
  ring.className = 'cur-ring';
  ring.innerHTML = '<span class="cur-plus" aria-hidden="true">+</span>';
  document.body.append(dot, ring);

  const style = document.createElement('style');
  style.textContent = `
    .cur-dot, .cur-ring {
      position: fixed; top: 0; left: 0; z-index: 9999;
      pointer-events: none; border-radius: 50%;
      mix-blend-mode: multiply;
      translate: -50% -50%;
    }
    .cur-dot { width: 8px; height: 8px; background: var(--teal); }
    .cur-ring {
      width: 30px; height: 30px;
      border: 1.4px solid var(--teal);
      display: grid; place-items: center;
      transition: scale 0.25s cubic-bezier(0.16,1,0.3,1);
    }
    .cur-plus {
      font: 500 13px/1 'IBM Plex Sans', sans-serif;
      color: var(--teal); opacity: 0;
      transition: opacity 0.2s ease;
    }
    .cur-ring.is-link { scale: 1.4; }
    .cur-ring.is-expand { scale: 1.8; }
    .cur-ring.is-expand .cur-plus { opacity: 1; }
  `;
  document.head.append(style);

  const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power2.out' });
  const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power2.out' });
  const ringX = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power2.out' });
  const ringY = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power2.out' });

  const onMove = (e: PointerEvent) => {
    dotX(e.clientX); dotY(e.clientY);
    ringX(e.clientX); ringY(e.clientY);
    const t = e.target as Element | null;
    const expand = t?.closest?.('[data-cursor="expand"]');
    const link = t?.closest?.('a, button');
    ring.classList.toggle('is-expand', !!expand);
    ring.classList.toggle('is-link', !expand && !!link);
  };
  window.addEventListener('pointermove', onMove, { passive: true });

  teardowns.push(() => {
    window.removeEventListener('pointermove', onMove);
    dot.remove(); ring.remove(); style.remove();
  });
}

function setupMagnetic() {
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      xTo(Math.max(-8, Math.min(8, dx * 0.2)));
      yTo(Math.max(-8, Math.min(8, dy * 0.2)));
    };
    const onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    teardowns.push(() => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      gsap.set(el, { clearProps: 'x,y' });
    });
  });
}

export function initCursor() {
  if (prefersReduced() || isTouch()) return;
  setupCursor();
  setupMagnetic();
}

export function destroyCursor() {
  teardowns.forEach((fn) => fn());
  teardowns = [];
}
