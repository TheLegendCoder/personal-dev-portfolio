import { describe, it, expect } from 'vitest';
import { markdownToHtml, markdownToHtmlSync } from '@/lib/markdown';

describe('markdown utilities', () => {
  it('markdownToHtml renders headings and strong text', async () => {
    const html = await markdownToHtml('# Title\n\n**bold** text');

    expect(html).toContain('<h1>Title</h1>');
    expect(html).toContain('<strong>bold</strong>');
  });

  it('markdownToHtml autolinks plain https URLs', async () => {
    const html = await markdownToHtml('Visit https://example.com for more');

    expect(html).toContain('<a href="https://example.com"');
    expect(html).toContain('>https://example.com</a>');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('markdownToHtml autolinks plain www URLs', async () => {
    const html = await markdownToHtml('Visit www.example.com for more');

    expect(html).toContain('<a href="https://www.example.com"');
    expect(html).toContain('>www.example.com</a>');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('markdownToHtml renders raw HTML anchor snippets as clickable links', async () => {
    const html = await markdownToHtml(
      '<a href="https://github.com/TheLegendCoder/personal-dev-portfolio" target="_blank" rel="noopener noreferrer">project </a>'
    );

    expect(html).toContain('<a href="https://github.com/TheLegendCoder/personal-dev-portfolio"');
    expect(html).toContain('>project</a>');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('markdownToHtml sanitizes malicious links via sanitizeUrl plugin', async () => {
    const html = await markdownToHtml('[click me](javascript:alert(1))');

    // rehypeSanitizeUrls rewrites dangerous schemes to about:blank rather than
    // stripping the href entirely, so the link is rendered but points nowhere harmful.
    expect(html).toContain('click me');
    expect(html).not.toContain('javascript:');
    expect(html).toContain('about:blank');
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
