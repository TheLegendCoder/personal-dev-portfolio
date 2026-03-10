/**
 * Centralised GSAP configuration and helpers.
 * Import `gsap` and `ScrollTrigger` only from this module throughout the app
 * to ensure consistent defaults per the design spec.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register plugins once — safe to call multiple times
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// ─── Default easing (spec: power3.out) ───────────────────────────────────────
export const EASE = 'power3.out';

// ─── Stagger defaults (spec) ──────────────────────────────────────────────────
export const STAGGER_TEXT = 0.08;
export const STAGGER_CARD = 0.15;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Fade-up reveal for a set of elements, optionally scroll-triggered.
 * @param targets  GSAP selector string, element, or element array
 * @param trigger  ScrollTrigger trigger element (defaults to targets[0] parent)
 * @param stagger  Per-item stagger in seconds
 */
export function fadeUpFrom(
  targets: gsap.TweenTarget,
  trigger?: Element | string,
  stagger = STAGGER_CARD
) {
  return gsap.from(targets, {
    y: 48,
    opacity: 0,
    duration: 0.9,
    ease: EASE,
    stagger,
    scrollTrigger: trigger
      ? {
          trigger,
          start: 'top 82%',
          once: true,
        }
      : undefined,
  });
}

/**
 * Word-by-word reveal: wraps each word in a <span> and staggers them in.
 * Mutates the DOM of `element` — call once on mount.
 */
export function wordReveal(element: HTMLElement) {
  const text = element.textContent ?? '';
  element.innerHTML = text
    .split(' ')
    .map((word) => `<span class="inline-block">${word}&nbsp;</span>`)
    .join('');

  return gsap.from(element.querySelectorAll('span'), {
    y: 24,
    opacity: 0,
    duration: 0.7,
    ease: EASE,
    stagger: STAGGER_TEXT,
    scrollTrigger: {
      trigger: element,
      start: 'top 80%',
      once: true,
    },
  });
}

/**
 * Magnetic-button hover effect.
 * Attach once to a button/link element. Returns a cleanup function.
 */
export function magneticHover(element: HTMLElement, strength = 0.35) {
  function onMove(e: MouseEvent) {
    const rect = element.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * strength;
    const y = (e.clientY - rect.top - rect.height / 2) * strength;
    gsap.to(element, { x, y, duration: 0.4, ease: EASE });
  }

  function onLeave() {
    gsap.to(element, { x: 0, y: 0, duration: 0.6, ease: EASE });
  }

  element.addEventListener('mousemove', onMove);
  element.addEventListener('mouseleave', onLeave);

  return () => {
    element.removeEventListener('mousemove', onMove);
    element.removeEventListener('mouseleave', onLeave);
    gsap.to(element, { x: 0, y: 0, duration: 0 });
  };
}

export { gsap, ScrollTrigger };
