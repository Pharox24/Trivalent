// Global client lifecycle — the single wiring point for
// astro:page-load (init) and astro:before-swap (teardown).
import { initMotion, destroyMotion } from './motion';
import { initShader, destroyShader } from './shader';
import { initDiagram, destroyDiagram } from './diagram';
import { initCursor, destroyCursor } from './cursor';

function updateScrollState() {
  document.documentElement.classList.toggle('is-scrolled', window.scrollY > 8);
}

window.addEventListener('scroll', updateScrollState, { passive: true });

// astro:page-load also fires on initial load.
document.addEventListener('astro:page-load', () => {
  updateScrollState();
  initMotion();
  initShader();
  initDiagram();
  initCursor();
});

document.addEventListener('astro:before-swap', () => {
  destroyMotion();
  destroyShader();
  destroyDiagram();
  destroyCursor();
});
