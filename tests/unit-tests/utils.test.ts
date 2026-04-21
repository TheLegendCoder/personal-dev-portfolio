import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

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
