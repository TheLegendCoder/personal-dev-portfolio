import { describe, it, expect } from 'vitest';
import { isKonamiKeyMatch } from '@/lib/easter-egg-utils';

describe('isKonamiKeyMatch()', () => {
  it('returns false when either key is not a string', () => {
    expect(isKonamiKeyMatch(undefined, 'ArrowUp')).toBe(false);
    expect(isKonamiKeyMatch('ArrowUp', undefined)).toBe(false);
    expect(isKonamiKeyMatch(null, 'ArrowUp')).toBe(false);
    expect(isKonamiKeyMatch('ArrowUp', null)).toBe(false);
    expect(isKonamiKeyMatch(1, 'ArrowUp')).toBe(false);
    expect(isKonamiKeyMatch('ArrowUp', 1)).toBe(false);
  });

  it('returns false when either key is an empty string', () => {
    expect(isKonamiKeyMatch('', 'ArrowUp')).toBe(false);
    expect(isKonamiKeyMatch('ArrowUp', '')).toBe(false);
    expect(isKonamiKeyMatch('', '')).toBe(false);
  });

  it('returns true on exact matches', () => {
    expect(isKonamiKeyMatch('ArrowUp', 'ArrowUp')).toBe(true);
    expect(isKonamiKeyMatch('A', 'A')).toBe(true);
  });

  it('returns true for case-insensitive matches', () => {
    expect(isKonamiKeyMatch('a', 'A')).toBe(true);
    expect(isKonamiKeyMatch('B', 'b')).toBe(true);
    expect(isKonamiKeyMatch('arrowup', 'ArrowUp')).toBe(true);
  });

  it('returns false for different keys', () => {
    expect(isKonamiKeyMatch('ArrowLeft', 'ArrowRight')).toBe(false);
    expect(isKonamiKeyMatch('x', 'b')).toBe(false);
  });
});
