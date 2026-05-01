import { describe, it, expect } from 'vitest';
import { sanitizeUrl } from '@/lib/url-utils';

describe('sanitizeUrl()', () => {
  it('returns empty string for empty input values', () => {
    expect(sanitizeUrl('')).toBe('');
    expect(sanitizeUrl(null as unknown as string)).toBe('');
    expect(sanitizeUrl(undefined as unknown as string)).toBe('');
  });

  it('allows safe urls', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
    expect(sanitizeUrl('http://example.com/path?query=1')).toBe('http://example.com/path?query=1');
    expect(sanitizeUrl('/relative/path')).toBe('/relative/path');
    expect(sanitizeUrl('#anchor')).toBe('#anchor');
    expect(sanitizeUrl('mailto:user@example.com')).toBe('mailto:user@example.com');
  });

  it('blocks malicious protocols', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('about:blank');
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('about:blank');
    expect(sanitizeUrl('vbscript:msgbox("hello")')).toBe('about:blank');
  });

  it('blocks malicious protocols with case variations and whitespace', () => {
    expect(sanitizeUrl('JAVASCRIPT:alert(1)')).toBe('about:blank');
    expect(sanitizeUrl('javaScript:alert(1)')).toBe('about:blank');
    expect(sanitizeUrl('DaTa:text/plain,hello')).toBe('about:blank');
    expect(sanitizeUrl(' javascript:alert(1)')).toBe('about:blank');
    expect(sanitizeUrl('javascript :alert(1)')).toBe('about:blank');
    expect(sanitizeUrl('\njavascript:alert(1)')).toBe('about:blank');
    expect(sanitizeUrl('java\nscript:alert(1)')).toBe('about:blank');
  });

  it('blocks encoded and null-byte payloads', () => {
    expect(sanitizeUrl('java%73cript:alert(1)')).toBe('about:blank');
    expect(sanitizeUrl('javascript%00:alert(1)')).toBe('about:blank');
  });

  it('escapes quotes for html attributes', () => {
    expect(sanitizeUrl('https://example.com?q="quote"')).toBe('https://example.com?q=&quot;quote&quot;');
    expect(sanitizeUrl("https://example.com?q='single'")).toBe('https://example.com?q=&#39;single&#39;');
  });

  it('falls back to raw value when decodeURIComponent fails', () => {
    expect(sanitizeUrl('%E0%A4%A')).toBe('%E0%A4%A');
  });
});
