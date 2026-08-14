export interface RuntimeConfig {
  isProduction: boolean;
  port: number;
  allowedOrigins: ReadonlySet<string>;
  allowServerApiKey: boolean;
  serverApiKey: string;
  geminiModel: string;
  trustProxyHops: number;
  rateLimitWindowMs: number;
  rateLimitMax: number;
}

function readInteger(
  env: NodeJS.ProcessEnv,
  name: string,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  const raw = env[name]?.trim();
  if (!raw) return fallback;

  const value = Number(raw);
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${name} must be an integer between ${minimum} and ${maximum}`);
  }
  return value;
}

function readBoolean(env: NodeJS.ProcessEnv, name: string): boolean {
  const raw = env[name]?.trim().toLowerCase();
  if (!raw) return false;
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  throw new Error(`${name} must be true or false`);
}

/**
 * Parse and validate the complete server runtime configuration at startup.
 * Callers receive normalized values and never need to interpret environment
 * strings themselves.
 */
export function loadRuntimeConfig(env: NodeJS.ProcessEnv): RuntimeConfig {
  const isProduction = env.NODE_ENV === 'production';
  const configuredOrigins = (env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const allowServerApiKey = readBoolean(env, 'ALLOW_SERVER_API_KEY');
  const serverApiKey = env.GEMINI_API_KEY?.trim() ?? '';
  const geminiModel = env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash';

  if (allowServerApiKey && !serverApiKey) {
    throw new Error('GEMINI_API_KEY is required when ALLOW_SERVER_API_KEY=true');
  }
  if (!/^[A-Za-z0-9._/-]{1,200}$/.test(geminiModel)) {
    throw new Error('GEMINI_MODEL contains unsupported characters');
  }

  return {
    isProduction,
    port: readInteger(env, 'PORT', 3000, 1, 65_535),
    allowedOrigins: new Set(
      configuredOrigins.length > 0
        ? configuredOrigins
        : isProduction
          ? []
          : [
              'http://localhost:3000',
              'http://127.0.0.1:3000',
              'http://localhost:5173',
            ],
    ),
    allowServerApiKey,
    serverApiKey,
    geminiModel,
    trustProxyHops: readInteger(env, 'TRUST_PROXY_HOPS', 0, 0, 10),
    rateLimitWindowMs: readInteger(
      env,
      'RATE_LIMIT_WINDOW_MS',
      60_000,
      1_000,
      3_600_000,
    ),
    rateLimitMax: readInteger(env, 'RATE_LIMIT_MAX', 30, 1, 10_000),
  };
}
