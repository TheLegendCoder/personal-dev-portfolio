import test from 'node:test';
import assert from 'node:assert';
import { sanitizeUrl } from '../../src/lib/url-utils.ts';

test('sanitizeUrl', async (t) => {
  await t.test('returns empty string for empty input', () => {
    assert.strictEqual(sanitizeUrl(''), '');
    // @ts-ignore
    assert.strictEqual(sanitizeUrl(null), '');
    // @ts-ignore
    assert.strictEqual(sanitizeUrl(undefined), '');
  });

  await t.test('allows safe URLs', () => {
    assert.strictEqual(sanitizeUrl('https://example.com'), 'https://example.com');
    assert.strictEqual(sanitizeUrl('http://example.com/path?query=1'), 'http://example.com/path?query=1');
    assert.strictEqual(sanitizeUrl('/relative/path'), '/relative/path');
    assert.strictEqual(sanitizeUrl('#anchor'), '#anchor');
    assert.strictEqual(sanitizeUrl('mailto:user@example.com'), 'mailto:user@example.com');
  });

  await t.test('blocks malicious protocols', () => {
    assert.strictEqual(sanitizeUrl('javascript:alert(1)'), 'about:blank');
    assert.strictEqual(sanitizeUrl('data:text/html,<script>alert(1)</script>'), 'about:blank');
    assert.strictEqual(sanitizeUrl('vbscript:msgbox("hello")'), 'about:blank');
  });

  await t.test('blocks malicious protocols with case variations', () => {
    assert.strictEqual(sanitizeUrl('JAVASCRIPT:alert(1)'), 'about:blank');
    assert.strictEqual(sanitizeUrl('javaScript:alert(1)'), 'about:blank');
    assert.strictEqual(sanitizeUrl('DaTa:text/plain,hello'), 'about:blank');
  });

  await t.test('blocks malicious protocols with whitespace', () => {
    assert.strictEqual(sanitizeUrl(' javascript:alert(1)'), 'about:blank');
    assert.strictEqual(sanitizeUrl('javascript :alert(1)'), 'about:blank');
    assert.strictEqual(sanitizeUrl('\njavascript:alert(1)'), 'about:blank');
    assert.strictEqual(sanitizeUrl('java\nscript:alert(1)'), 'about:blank');
  });

  await t.test('handles URL encoding in protocols (e.g. %73 for s)', () => {
    // javascript: alert(1) encoded
    assert.strictEqual(sanitizeUrl('java%73cript:alert(1)'), 'about:blank');
  });

  await t.test('blocks protocols with null bytes', () => {
    // %00 is a null byte, often used in bypasses
    assert.strictEqual(sanitizeUrl('javascript%00:alert(1)'), 'about:blank');
  });

  await t.test('escapes quotes for HTML attributes', () => {
    assert.strictEqual(sanitizeUrl('https://example.com?q="quote"'), 'https://example.com?q=&quot;quote&quot;');
    assert.strictEqual(sanitizeUrl("https://example.com?q='single'"), 'https://example.com?q=&#39;single&#39;');
  });
});
