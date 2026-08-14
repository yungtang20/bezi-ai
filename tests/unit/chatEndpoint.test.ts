import { describe, expect, it } from 'vitest';
import { resolveChatEndpoint } from '../../src/api/chatEndpoint';

describe('chat endpoint resolution', () => {
  it('uses the same-origin Express route for local full-stack deployments', () => {
    expect(resolveChatEndpoint()).toBe('/api/chat');
    expect(resolveChatEndpoint('  ')).toBe('/api/chat');
  });

  it('targets a separately hosted HTTPS API for GitHub Pages', () => {
    expect(resolveChatEndpoint('https://api.example.com/')).toBe(
      'https://api.example.com/api/chat',
    );
  });

  it('allows local HTTP but rejects insecure public or credentialed URLs', () => {
    expect(resolveChatEndpoint('http://127.0.0.1:3000')).toBe(
      'http://127.0.0.1:3000/api/chat',
    );
    expect(() => resolveChatEndpoint('http://api.example.com')).toThrow(/HTTPS/);
    expect(() => resolveChatEndpoint('https://user:pass@api.example.com')).toThrow(/credentials/);
  });
});
