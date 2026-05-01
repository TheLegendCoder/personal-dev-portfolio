import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

import confetti from 'canvas-confetti';
import {
  cn,
  triggerCelebration,
  triggerCelebrationAt,
  triggerCelebrationFrom,
  triggerMilestoneCelebration,
} from '@/lib/utils';

describe('cn()', () => {
  it('returns an empty string when called with no arguments', () => {
    expect(cn()).toBe('');
  });

  it('merges two class strings with a space', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('filters out falsy values (undefined, null, false)', () => {
    expect(cn('a', undefined, null, false, 'b')).toBe('a b');
  });

  it('handles conditional class objects', () => {
    expect(cn({ 'text-red-500': true, 'text-blue-500': false })).toBe('text-red-500');
  });

  it('accepts an array of class names', () => {
    expect(cn(['px-4', 'py-2'])).toBe('px-4 py-2');
  });

  it('resolves Tailwind conflicts — last background color wins', () => {
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });

  it('resolves Tailwind conflicts — last padding wins', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('resolves Tailwind conflicts — last text size wins', () => {
    expect(cn('text-sm', 'text-lg')).toBe('text-lg');
  });

  it('keeps non-conflicting utilities from both arguments', () => {
    const result = cn('flex items-center', 'gap-4 text-red-500');
    expect(result).toBe('flex items-center gap-4 text-red-500');
  });

  it('handles mixed arrays, objects, and strings', () => {
    const result = cn('base', ['arr-class'], { conditional: true }, 'final');
    expect(result).toBe('base arr-class conditional final');
  });
});

describe('celebration utils', () => {
  const confettiMock = vi.mocked(confetti);
  const originalWindow = globalThis.window;
  const originalRaf = globalThis.requestAnimationFrame;

  beforeEach(() => {
    confettiMock.mockClear();
  });

  afterEach(() => {
    if (originalWindow === undefined) {
      Reflect.deleteProperty(globalThis, 'window');
    } else {
      Object.defineProperty(globalThis, 'window', {
        value: originalWindow,
        configurable: true,
        writable: true,
      });
    }

    if (originalRaf === undefined) {
      Reflect.deleteProperty(globalThis, 'requestAnimationFrame');
    } else {
      Object.defineProperty(globalThis, 'requestAnimationFrame', {
        value: originalRaf,
        configurable: true,
        writable: true,
      });
    }
  });

  it('triggerCelebration uses medium defaults', () => {
    triggerCelebration();

    expect(confettiMock).toHaveBeenCalledTimes(1);
    expect(confettiMock).toHaveBeenCalledWith(
      expect.objectContaining({
        particleCount: 50,
        origin: { x: 0.5, y: 0.6 },
        scalar: 0.8,
      }),
    );
  });

  it('triggerCelebration uses custom intensity and colors', () => {
    triggerCelebration({ intensity: 'low', colors: ['#111111', '#222222'] });

    expect(confettiMock).toHaveBeenCalledWith(
      expect.objectContaining({
        particleCount: 30,
        colors: ['#111111', '#222222'],
      }),
    );
  });

  it('triggerCelebrationAt uses passed coordinates and high intensity', () => {
    triggerCelebrationAt(0.2, 0.8, { intensity: 'high' });

    expect(confettiMock).toHaveBeenCalledWith(
      expect.objectContaining({
        particleCount: 80,
        origin: { x: 0.2, y: 0.8 },
      }),
    );
  });

  it('triggerCelebrationFrom computes origin from element center', () => {
    Object.defineProperty(globalThis, 'window', {
      value: { innerWidth: 1000, innerHeight: 500 },
      configurable: true,
      writable: true,
    });

    const element = {
      getBoundingClientRect: () => ({
        left: 100,
        top: 50,
        width: 200,
        height: 100,
      }),
    } as unknown as HTMLElement;

    triggerCelebrationFrom(element, { intensity: 'low' });

    expect(confettiMock).toHaveBeenCalledWith(
      expect.objectContaining({
        origin: { x: 0.2, y: 0.2 },
      }),
    );
  });

  it('triggerMilestoneCelebration fires two bursts immediately', () => {
    const nowSpy = vi.spyOn(Date, 'now');
    nowSpy.mockReturnValueOnce(1000).mockReturnValueOnce(1600);
    const rafSpy = vi.fn();

    Object.defineProperty(globalThis, 'requestAnimationFrame', {
      value: rafSpy,
      configurable: true,
      writable: true,
    });

    triggerMilestoneCelebration();

    expect(confettiMock).toHaveBeenCalledTimes(2);
    expect(rafSpy).not.toHaveBeenCalled();
    nowSpy.mockRestore();
  });

  it('triggerMilestoneCelebration schedules another frame within time window', () => {
    const nowSpy = vi.spyOn(Date, 'now');
    nowSpy.mockReturnValueOnce(1000).mockReturnValueOnce(1200);
    const rafSpy = vi.fn();

    Object.defineProperty(globalThis, 'requestAnimationFrame', {
      value: rafSpy,
      configurable: true,
      writable: true,
    });

    triggerMilestoneCelebration();

    expect(rafSpy).toHaveBeenCalledTimes(1);
    nowSpy.mockRestore();
  });
});
