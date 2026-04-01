import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';

export function sanitizeUrl(url: string): string {
  if (!url) return '';
  const decodedUrl = decodeURIComponent(url).toLowerCase().replace(/\s+/g, '');
  if (
    decodedUrl.startsWith('javascript:') ||
    decodedUrl.startsWith('data:') ||
    decodedUrl.startsWith('vbscript:')
  ) {
    return 'about:blank';
  }
  return url.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Simple rehype plugin to sanitize URLs in attributes
function rehypeSanitizeUrls() {
  return (tree: any) => {
    const walk = (node: any) => {
      if (node.properties) {
        if (typeof node.properties.href === 'string') {
          node.properties.href = sanitizeUrl(node.properties.href);
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

// Alternative simpler approach using basic remark for fallback
export function markdownToHtmlSync(markdown: string): string {
  // First, escape HTML to prevent XSS from raw HTML
  const escapedMarkdown = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Enhanced markdown to HTML converter with better code block support
  return escapedMarkdown
    // Headers with proper IDs
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold mt-8 mb-4 text-foreground">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-10 mb-6 text-foreground">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-12 mb-8 text-foreground">$1</h1>')
    
    // Code blocks with language support
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      // Normalize language names for better highlighting
      const languageMap: Record<string, string> = {
        'cs': 'csharp',
        'c#': 'csharp',
        'tsql': 'sql',
        'mssql': 'sql',
        'plsql': 'sql',
        'js': 'javascript',
        'ts': 'typescript'
      };
      
      const normalizedLang = lang ? (languageMap[lang.toLowerCase()] || lang.toLowerCase()) : 'text';
      const escapedCode = code; // Already escaped & < >
      
      // Language display names for the header
      const displayNames: Record<string, string> = {
        'csharp': 'C#',
        'sql': 'SQL',
        'javascript': 'JavaScript',
        'typescript': 'TypeScript',
        'json': 'JSON',
        'bash': 'Bash',
        'powershell': 'PowerShell',
        'html': 'HTML',
        'css': 'CSS',
        'markdown': 'Markdown',
        'yaml': 'YAML',
        'xml': 'XML'
      };
      
      const displayName = displayNames[normalizedLang] || normalizedLang.toUpperCase();
      
      return `<div class="relative my-6">
        <div class="bg-gray-800 text-gray-100 text-xs px-4 py-2 border-b border-gray-600 font-mono rounded-t-lg">
          ${displayName}
        </div>
        <pre class="bg-gray-900 text-gray-100 p-4 rounded-b-lg overflow-x-auto font-mono text-sm leading-relaxed"><code class="language-${normalizedLang}">${escapedCode}</code></pre>
      </div>`;
    })
    
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono text-red-600 dark:text-red-400">$1</code>')
    
    // Blockquotes
    .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-primary pl-4 py-2 my-4 bg-muted/50 italic text-muted-foreground">$1</blockquote>')
    
    // Lists (unordered)
    .replace(/^\* (.*$)/gm, '<li class="ml-4 mb-2">$1</li>')
    .replace(/(<li.*?>.*?<\/li>)/g, '<ul class="list-disc list-inside space-y-2 my-4">$1</ul>')
    
    // Lists (ordered)
    .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 mb-2">$1</li>')
    
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
      const safeUrl = sanitizeUrl(url);
      return `<a href="${safeUrl}" class="text-primary hover:text-primary/80 underline transition-colors" target="_blank" rel="noopener noreferrer">${text}</a>`;
    })
    
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    
    // Horizontal rules
    .replace(/^---$/gm, '<hr class="my-8 border-border" />')
    
    // Paragraphs - handle this last
    .split('\n\n')
    .map(paragraph => {
      // Skip if it's already wrapped in HTML tags
      if (paragraph.startsWith('<')) {
        return paragraph;
      }
      // Skip empty paragraphs
      if (paragraph.trim() === '') {
        return '';
      }
      return `<p class="mb-4 text-muted-foreground leading-relaxed">${paragraph.replace(/\n/g, ' ')}</p>`;
    })
    .join('\n');
}
