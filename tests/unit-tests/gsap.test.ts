import { describe, it, expect, vi, beforeEach } from 'vitest';

const gsapSpies = vi.hoisted(() => ({
  from: vi.fn(),
  to: vi.fn(),
  registerPlugin: vi.fn(),
}));

vi.mock('gsap', () => ({
  default: {
    from: gsapSpies.from,
    to: gsapSpies.to,
    registerPlugin: gsapSpies.registerPlugin,
  },
}));

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: { name: 'ScrollTriggerMock' },
}));

import {
  EASE,
  STAGGER_CARD,
  STAGGER_TEXT,
  fadeUpFrom,
  wordReveal,
  magneticHover,
} from '@/lib/gsap';

describe('gsap helpers', () => {
  beforeEach(() => {
    gsapSpies.from.mockClear();
    gsapSpies.to.mockClear();
    gsapSpies.registerPlugin.mockClear();
  });

  it('exports expected easing and stagger constants', () => {
    expect(EASE).toBe('power3.out');
    expect(STAGGER_TEXT).toBe(0.08);
    expect(STAGGER_CARD).toBe(0.15);
  });

  it('fadeUpFrom forwards defaults to gsap.from', () => {
    const targets = ['.card-1', '.card-2'];

    fadeUpFrom(targets);

    expect(gsapSpies.from).toHaveBeenCalledWith(
      targets,
      expect.objectContaining({
        y: 48,
        opacity: 0,
        duration: 0.9,
        ease: EASE,
        stagger: STAGGER_CARD,
        scrollTrigger: undefined,
      }),
    );
  });

  it('fadeUpFrom includes scrollTrigger when trigger provided', () => {
    fadeUpFrom('.card', '#section', 0.2);

    expect(gsapSpies.from).toHaveBeenCalledWith(
      '.card',
      expect.objectContaining({
        stagger: 0.2,
        scrollTrigger: {
          trigger: '#section',
          start: 'top 82%',
          once: true,
        },
      }),
    );
  });

  it('wordReveal wraps words and animates spans', () => {
    const spans = [{ id: 1 }, { id: 2 }];
    const element = {
      textContent: 'Hello World',
      innerHTML: '',
      querySelectorAll: vi.fn().mockReturnValue(spans),
    } as unknown as HTMLElement;

    wordReveal(element);

    expect(element.innerHTML).toContain('<span class="inline-block">Hello&nbsp;</span>');
    expect(element.innerHTML).toContain('<span class="inline-block">World&nbsp;</span>');
    expect(gsapSpies.from).toHaveBeenCalledWith(
      spans,
      expect.objectContaining({
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
      }),
    );
  });

  it('magneticHover moves element on mousemove and resets on leave/cleanup', () => {
    const listeners: Record<string, (event: MouseEvent) => void> = {};
    const removeEventListener = vi.fn();
    const element = {
      getBoundingClientRect: () => ({
        left: 10,
        top: 10,
        width: 100,
        height: 100,
      }),
      addEventListener: (eventName: string, handler: (event: MouseEvent) => void) => {
        listeners[eventName] = handler;
      },
      removeEventListener,
    } as unknown as HTMLElement;

    const cleanup = magneticHover(element, 0.5);

    listeners.mousemove({ clientX: 70, clientY: 80 } as MouseEvent);
    expect(gsapSpies.to).toHaveBeenCalledWith(
      element,
      expect.objectContaining({
        x: 5,
        y: 10,
        duration: 0.4,
        ease: EASE,
      }),
    );

    listeners.mouseleave({} as MouseEvent);
    expect(gsapSpies.to).toHaveBeenCalledWith(
      element,
      expect.objectContaining({
        x: 0,
        y: 0,
        duration: 0.6,
        ease: EASE,
      }),
    );

    cleanup();

    expect(removeEventListener).toHaveBeenCalledTimes(2);
    expect(gsapSpies.to).toHaveBeenCalledWith(
      element,
      expect.objectContaining({
        x: 0,
        y: 0,
        duration: 0,
      }),
    );
  });
});
