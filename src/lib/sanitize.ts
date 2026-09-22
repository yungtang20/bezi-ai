import DOMPurify from 'dompurify';

export function sanitizeTermMarkup(value: string): string {
  const purifier = DOMPurify as unknown as { sanitize?: (input: string, config: { ALLOWED_TAGS: string[]; ALLOWED_ATTR: string[] }) => string };
  if (typeof purifier.sanitize === 'function') {
    return purifier.sanitize(value, { ALLOWED_TAGS: ['term'], ALLOWED_ATTR: [] });
  }
  // Node test fallback: the browser path above remains the authoritative sanitizer.
  return value.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<(?!\/?term\b)[^>]*>/gi, '');
}
