// Global client lifecycle. Motion modules land in later tasks;
// this file stays the single wiring point for astro:page-load / astro:before-swap.

function updateScrollState() {
  document.documentElement.classList.toggle('is-scrolled', window.scrollY > 8);
}

window.addEventListener('scroll', updateScrollState, { passive: true });
document.addEventListener('astro:page-load', () => {
  updateScrollState();
});
