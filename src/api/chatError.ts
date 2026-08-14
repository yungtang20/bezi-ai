export async function readChatHttpError(response: Response): Promise<string> {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.toLowerCase().includes('application/json')) {
    try {
      const body = await response.json() as unknown;
      if (
        typeof body === 'object'
        && body !== null
        && 'error' in body
        && typeof body.error === 'string'
        && body.error.trim()
      ) {
        return body.error.trim().slice(0, 500);
      }
    } catch {
      // Keep the stable status fallback when an upstream response claims to be
      // JSON but contains an invalid or truncated body.
    }
  }

  return `HTTP 錯誤 ${response.status}`;
}
