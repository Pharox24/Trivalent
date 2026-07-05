import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

export const prefersReduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isTouch = () => matchMedia('(pointer: coarse)').matches;

let lenis: Lenis | null = null;
let splits: SplitText[] = [];

export function initMotion() {
  if (prefersReduced()) return;

  if (!isTouch() && !lenis) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis!.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Masked line-by-line headline reveals.
  // Arabic gets a plain fade-up instead: the line masks (overflow: hidden)
  // clip harakat and descenders that extend beyond the line box.
  // Touch devices also take the fade path — SplitText's measuring is the
  // single most expensive init step on throttled mobile CPUs.
  const useFade = document.documentElement.lang === 'ar' || isTouch();
  document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    if (useFade) {
      gsap.from(el, {
        y: 32,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%' },
      });
      return;
    }
    const split = SplitText.create(el, { type: 'lines', mask: 'lines' });
    splits.push(split);
    gsap.from(split.lines, {
      yPercent: 110,
      duration: 1.1,
      ease: 'expo.out',
      stagger: 0.09,
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });

  // Simple fade-up reveals
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: 28,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      delay: Number(el.dataset.revealDelay ?? 0),
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });
}

export function destroyMotion() {
  ScrollTrigger.getAll().forEach((st) => st.kill());
  splits.forEach((s) => s.revert());
  splits = [];
}
