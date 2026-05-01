export function sanitizeUrl(url: string): string {
  if (!url) return '';

  let decodedUrl: string;
  try {
    decodedUrl = decodeURIComponent(url).toLowerCase().replace(/\s+/g, '');
  } catch (e) {
    // If decoding fails, still try to check the raw URL for common patterns
    decodedUrl = url.toLowerCase().replace(/\s+/g, '');
  }

  // Also handle null bytes which can be used to bypass some checks
  const sanitizedDecodedUrl = decodedUrl.replace(/\0/g, '');

  if (
    sanitizedDecodedUrl.startsWith('javascript:') ||
    sanitizedDecodedUrl.startsWith('data:') ||
    sanitizedDecodedUrl.startsWith('vbscript:')
  ) {
    return 'about:blank';
  }
  return url.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
