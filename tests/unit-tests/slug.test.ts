import { describe, it, expect } from 'vitest';
import { slugify, isValidSlug, SLUG_PATTERN } from '@/lib/slug';

describe('slugify()', () => {
  it('lowercases and hyphenates a title', () => {
    expect(slugify('Clean Architecture Generator')).toBe('clean-architecture-generator');
  });

  it('collapses runs of punctuation and whitespace into one hyphen', () => {
    expect(slugify('Next.js  15 —  App   Router!')).toBe('next-js-15-app-router');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  ...Hello World???  ')).toBe('hello-world');
  });

  it('strips accents rather than dropping the letter', () => {
    expect(slugify('Café Déjà Vu')).toBe('cafe-deja-vu');
  });

  it('keeps digits', () => {
    expect(slugify('Project 2026 v2')).toBe('project-2026-v2');
  });

  it('preserves an already-valid slug unchanged', () => {
    expect(slugify('portfolio-website')).toBe('portfolio-website');
  });

  it('returns an empty string when there is nothing usable', () => {
    expect(slugify('!!!')).toBe('');
    expect(slugify('')).toBe('');
  });

  it('always produces output the database CHECK constraint accepts', () => {
    const titles = [
      'Clean Architecture Generator',
      'Next.js 15 — App Router!',
      'Café Déjà Vu',
      'WriteOnce',
      '  spaced  out  ',
    ];

    for (const title of titles) {
      expect(SLUG_PATTERN.test(slugify(title))).toBe(true);
    }
  });
});

describe('isValidSlug()', () => {
  it.each(['portfolio-website', 'writeonce', 'v2', 'a-1-b'])('accepts %s', (value) => {
    expect(isValidSlug(value)).toBe(true);
  });

  it.each([
    ['', 'empty'],
    ['Portfolio-Website', 'uppercase'],
    ['my project', 'a space'],
    ['my_project', 'an underscore'],
    ['my.project', 'a dot'],
    ['café', 'an accent'],
  ])('rejects %s (%s)', (value) => {
    expect(isValidSlug(value)).toBe(false);
  });
});
