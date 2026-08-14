const LOCAL_HTTP_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

/** Resolve one deployment setting into the complete chat endpoint. */
export function resolveChatEndpoint(apiBaseUrl?: string): string {
  const normalizedBase = apiBaseUrl?.trim();
  if (!normalizedBase) return '/api/chat';

  let parsed: URL;
  try {
    parsed = new URL(normalizedBase);
  } catch {
    throw new Error('VITE_API_BASE_URL must be an absolute URL');
  }

  const isLocalHttp = parsed.protocol === 'http:' && LOCAL_HTTP_HOSTS.has(parsed.hostname);
  if (parsed.protocol !== 'https:' && !isLocalHttp) {
    throw new Error('VITE_API_BASE_URL must use HTTPS outside local development');
  }
  if (parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error('VITE_API_BASE_URL must not include credentials, query, or fragment');
  }

  parsed.pathname = `${parsed.pathname.replace(/\/+$/, '')}/api/chat`;
  return parsed.toString();
}
