import { describe, it, expect } from 'vitest';
import { markdownToHtml, markdownToHtmlSync } from '@/lib/markdown';

describe('markdown utilities', () => {
  it('markdownToHtml renders headings and strong text', async () => {
    const html = await markdownToHtml('# Title\n\n**bold** text');

    expect(html).toContain('<h1>Title</h1>');
    expect(html).toContain('<strong>bold</strong>');
  });

  it('markdownToHtml sanitizes malicious links via sanitizeUrl plugin', async () => {
    const html = await markdownToHtml('[click me](javascript:alert(1))');

    expect(html).toContain('<a>click me</a>');
    expect(html).not.toContain('javascript:');
  });

  it('markdownToHtmlSync escapes raw html characters', () => {
    const html = markdownToHtmlSync('<script>alert(1)</script>');

    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).not.toContain('<script>alert(1)</script>');
  });

  it('markdownToHtmlSync preserves plain markdown text in current fallback mode', () => {
    const html = markdownToHtmlSync('**bold** and `code`');

    expect(html).toContain('**bold** and `code`');
  });
});
