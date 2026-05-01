import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import { sanitizeUrl } from './url-utils';

type HastProperties = {
  href?: unknown;
  src?: unknown;
};

type HastNode = {
  type?: string;
  tagName?: string;
  value?: string;
  properties?: HastProperties;
  children?: HastNode[];
};

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
          node.properties.href = sanitizeUrl(href);
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
  const result = await processor.process(markdown);
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
