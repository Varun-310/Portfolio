import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenis = null;

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Smooth, unhurried wheel scrolling. Touch devices keep native scrolling.
export function startSmoothScroll() {
  if (prefersReducedMotion()) return () => {};
  lenis = new Lenis({
    lerp: 0.085,
    wheelMultiplier: 0.9,
    smoothWheel: true,
    syncTouch: false,
  });
  lenis.on('scroll', ScrollTrigger.update);
  const raf = (time) => lenis && lenis.raf(time * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  return () => {
    gsap.ticker.remove(raf);
    lenis?.destroy();
    lenis = null;
  };
}

// Freeze the page behind an overlay (and let the overlay scroll on its own).
export function pauseScroll() {
  lenis?.stop();
  document.documentElement.classList.add('is-locked');
}
export function resumeScroll() {
  document.documentElement.classList.remove('is-locked');
  lenis?.start();
}

const NAV_OFFSET = 0;

export function scrollToId(id) {
  const el = id === 'top' ? 0 : document.getElementById(id);
  if (el === null) return;
  if (lenis) {
    lenis.scrollTo(el, { offset: NAV_OFFSET, duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
  } else {
    const y = el === 0 ? 0 : el.getBoundingClientRect().top + window.scrollY + NAV_OFFSET;
    window.scrollTo({ top: y, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }
  // Move focus for keyboard and screen reader users without jumping the page.
  if (el && el !== 0) {
    el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  }
}
