import { describe, it, expect } from 'vitest';
import { primaryNav, footerNav, isNavItemActive } from '@/lib/nav';

function navItem(name: string) {
  const item = primaryNav.find((entry) => entry.name === name);
  if (!item) throw new Error(`No nav item named ${name}`);
  return item;
}

describe('primaryNav', () => {
  it('exposes the narrative IA in order', () => {
    expect(primaryNav.map((item) => item.name)).toEqual([
      'Home',
      'About',
      'Work',
      'Writing',
      'Now',
      'Contact',
    ]);
  });

  it('groups the legacy sections under Work and Writing', () => {
    expect(navItem('Work').matchPaths).toContain('/projects');
    expect(navItem('Writing').matchPaths).toEqual(
      expect.arrayContaining(['/blog', '/tutorials'])
    );
  });

  it('keeps every legacy URL reachable from the footer', () => {
    const paths = footerNav.map((link) => link.path);
    expect(paths).toEqual(
      expect.arrayContaining(['/projects', '/blog', '/tutorials', '/privacy'])
    );
  });
});

describe('isNavItemActive()', () => {
  it('matches a section on its own path', () => {
    expect(isNavItemActive('/writing', navItem('Writing'))).toBe(true);
    expect(isNavItemActive('/work', navItem('Work'))).toBe(true);
  });

  it('matches detail pages beneath a section', () => {
    // The old check was `pathname === link.path`, so nothing highlighted on a
    // detail page. These are the cases that regression guards.
    expect(isNavItemActive('/writing/topic/dotnet', navItem('Writing'))).toBe(true);
    expect(isNavItemActive('/about/anything', navItem('About'))).toBe(true);
  });

  it('maps legacy routes onto their new parent', () => {
    expect(isNavItemActive('/blog', navItem('Writing'))).toBe(true);
    expect(isNavItemActive('/blog/some-post', navItem('Writing'))).toBe(true);
    expect(isNavItemActive('/tutorials/some-guide', navItem('Writing'))).toBe(true);
    expect(isNavItemActive('/projects', navItem('Work'))).toBe(true);
    expect(isNavItemActive('/projects/abc-123', navItem('Work'))).toBe(true);
  });

  it('does not let one section claim another', () => {
    expect(isNavItemActive('/blog', navItem('Work'))).toBe(false);
    expect(isNavItemActive('/projects', navItem('Writing'))).toBe(false);
    expect(isNavItemActive('/contact', navItem('About'))).toBe(false);
  });

  it('matches on whole segments, not string prefixes', () => {
    expect(isNavItemActive('/workshop', navItem('Work'))).toBe(false);
    expect(isNavItemActive('/nowhere', navItem('Now'))).toBe(false);
  });

  it('treats Home as exact-match only', () => {
    expect(isNavItemActive('/', navItem('Home'))).toBe(true);
    expect(isNavItemActive('/about', navItem('Home'))).toBe(false);
    expect(isNavItemActive('/blog/post', navItem('Home'))).toBe(false);
  });

  it('ignores query strings and hashes on the configured path', () => {
    expect(
      isNavItemActive('/projects', { path: '/projects?category=personal' })
    ).toBe(true);
  });
});
