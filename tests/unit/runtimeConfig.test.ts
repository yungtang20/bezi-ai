import { describe, expect, it } from 'vitest';
import { loadRuntimeConfig } from '../../src/server/runtimeConfig';

describe('runtime configuration', () => {
  it('fails closed when a shared provider key is enabled but absent', () => {
    expect(() => loadRuntimeConfig({
      NODE_ENV: 'production',
      ALLOW_SERVER_API_KEY: 'true',
    })).toThrow(/GEMINI_API_KEY is required/);
  });

  it('rejects malformed booleans and unsafe numeric ranges', () => {
    expect(() => loadRuntimeConfig({ ALLOW_SERVER_API_KEY: 'yes' }))
      .toThrow(/true or false/);
    expect(() => loadRuntimeConfig({ TRUST_PROXY_HOPS: '-1' }))
      .toThrow(/TRUST_PROXY_HOPS/);
    expect(() => loadRuntimeConfig({ RATE_LIMIT_MAX: '0' }))
      .toThrow(/RATE_LIMIT_MAX/);
  });

  it('has no implicit production CORS origins', () => {
    const config = loadRuntimeConfig({ NODE_ENV: 'production' });
    expect([...config.allowedOrigins]).toEqual([]);
  });

  it('normalizes explicit deployment values in one place', () => {
    const config = loadRuntimeConfig({
      NODE_ENV: 'production',
      PORT: '8080',
      ALLOWED_ORIGINS: ' https://app.example,https://admin.example ',
      TRUST_PROXY_HOPS: '1',
      RATE_LIMIT_WINDOW_MS: '120000',
      RATE_LIMIT_MAX: '50',
      GEMINI_MODEL: 'gemini-2.5-pro',
    });

    expect(config.port).toBe(8080);
    expect([...config.allowedOrigins]).toEqual([
      'https://app.example',
      'https://admin.example',
    ]);
    expect(config.trustProxyHops).toBe(1);
    expect(config.rateLimitWindowMs).toBe(120_000);
    expect(config.rateLimitMax).toBe(50);
    expect(config.geminiModel).toBe('gemini-2.5-pro');
  });

  it('uses the stable Gemini model default and rejects malformed model ids', () => {
    expect(loadRuntimeConfig({}).geminiModel).toBe('gemini-2.5-flash');
    expect(() => loadRuntimeConfig({ GEMINI_MODEL: 'https://attacker.example/model' }))
      .toThrow(/GEMINI_MODEL/);
  });
});
