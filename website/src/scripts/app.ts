// Global client lifecycle — the single wiring point for
// astro:page-load (init) and astro:before-swap (teardown).
import { initMotion, destroyMotion } from './motion';
import { initShader, destroyShader } from './shader';
import { initDiagram, destroyDiagram } from './diagram';
import { initCursor, destroyCursor } from './cursor';
import { initMolecule, destroyMolecule } from './molecule';
import { initHero3D, destroyHero3D } from './hero3d';

function updateScrollState() {
  document.documentElement.classList.toggle('is-scrolled', window.scrollY > 8);
}

window.addEventListener('scroll', updateScrollState, { passive: true });

const nextTask = () => new Promise<void>((r) => setTimeout(r, 0));

// astro:page-load also fires on initial load. Init is spread across
// macrotasks so no single long task blocks the main thread on mobile.
document.addEventListener('astro:page-load', async () => {
  updateScrollState();
  initMotion();
  await nextTask();
  initDiagram();
  await nextTask();
  // Desktop gets the Three.js physically-lit molecule (lazy chunk);
  // touch devices and WebGL failures fall back to the 2D canvas version.
  if (!(await initHero3D())) initMolecule();
  await nextTask();
  initShader();
  initCursor();
});

document.addEventListener('astro:before-swap', () => {
  destroyMotion();
  destroyShader();
  destroyDiagram();
  destroyCursor();
  destroyMolecule();
  destroyHero3D();
});
