import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import { sanitizeUrl } from './url-utils';

type HastProperties = {
  href?: unknown;
  src?: unknown;
  target?: string;
  rel?: string;
};

type HastNode = {
  type?: string;
  tagName?: string;
  value?: string;
  properties?: HastProperties;
  children?: HastNode[];
};

function escapeMarkdownLinkText(text: string): string {
  return text.replace(/[\\[\]]/g, '\\$&');
}

function escapeMarkdownLinkDestination(url: string): string {
  return url.replace(/[()]/g, '\\$&');
}

// Convert raw HTML anchors into markdown links so pasted anchor snippets are supported.
function normalizeHtmlAnchorsToMarkdown(markdown: string): string {
  return markdown.replace(/<a\s+([^>]*?)>([\s\S]*?)<\/a>/gi, (fullMatch, rawAttrs: string, rawText: string) => {
    const hrefMatch = rawAttrs.match(/\bhref\s*=\s*(["'])(.*?)\1/i);
    const href = hrefMatch?.[2]?.trim();

    if (!href) {
      return fullMatch;
    }

    const plainText = rawText.replace(/<[^>]+>/g, '').trim();
    if (!plainText) {
      return fullMatch;
    }

    const text = escapeMarkdownLinkText(plainText);
    const destination = escapeMarkdownLinkDestination(href);
    return `[${text}](${destination})`;
  });
}

// Simple rehype plugin to open external links in a new tab safely
function rehypeExternalLinks() {
  return (tree: HastNode) => {
    const walk = (node: HastNode) => {
      if (
        node.tagName === 'a' &&
        node.properties &&
        typeof node.properties.href === 'string' &&
        /^https?:\/\//.test(node.properties.href)
      ) {
        node.properties.target = '_blank';
        node.properties.rel = 'noopener noreferrer';
      }
      if (node.children) {
        node.children.forEach(walk);
      }
    };
    walk(tree);
  };
}

// Simple rehype plugin to sanitize URLs in attributes
function rehypeSanitizeUrls() {
  return (tree: HastNode) => {
    const walk = (node: HastNode) => {
      if (node.properties) {
        if (typeof node.properties.href === 'string') {
          const href = node.properties.href;
          if (
            node.tagName === 'a' &&
            href.startsWith('http://www.') &&
            Array.isArray(node.children) &&
            node.children.length === 1 &&
            node.children[0]?.type === 'text' &&
            node.children[0]?.value === href.replace(/^http:\/\//, '')
          ) {
            node.properties.href = href.replace(/^http:\/\//, 'https://');
          }
          node.properties.href = sanitizeUrl(node.properties.href as string);
        }
        if (typeof node.properties.src === 'string') {
          node.properties.src = sanitizeUrl(node.properties.src);
        }
      }
      if (node.children) {
        node.children.forEach(walk);
      }
    };
    walk(tree);
  };
}

// Configure the markdown processor with syntax highlighting
// Fixed pipeline: remark → remark-gfm → remark-rehype → rehype-sanitize-urls → rehype-highlight → rehype-stringify
const processor = remark()
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSanitizeUrls)
  .use(rehypeExternalLinks)
  .use(rehypeHighlight, {
    detect: true,
    ignoreMissing: true,
    aliases: {
      'csharp': ['cs', 'c#'],
      'sql': ['tsql', 'mssql', 'plsql'],
      'javascript': ['js'],
      'typescript': ['ts']
    }
  })
  .use(rehypeStringify);

export async function markdownToHtml(markdown: string): Promise<string> {
  const normalizedMarkdown = normalizeHtmlAnchorsToMarkdown(markdown);
  const result = await processor.process(normalizedMarkdown);
  return result.toString();
}

// Simple synchronous fallback — escapes HTML entities only.
export function markdownToHtmlSync(markdown: string): string {
  return markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
