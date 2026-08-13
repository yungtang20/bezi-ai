// src/errors.ts — 統一錯誤型別與訊息處理模組

export class BaziError extends Error {
  public readonly code: string;
  public readonly status: number;

  constructor(message: string, code: string = 'GENERAL_ERROR', status: number = 400) {
    super(message);
    this.name = 'BaziError';
    this.code = code;
    this.status = status;
  }
}

export class ValidationError extends BaziError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 422);
    this.name = 'ValidationError';
  }
}

export class APIError extends BaziError {
  constructor(message: string, status: number = 500) {
    super(message, 'API_ERROR', status);
    this.name = 'APIError';
  }
}

export interface ErrorResponse {
  error: string;
  code?: string;
  timestamp?: number;
}

const PUBLIC_UNEXPECTED_ERROR_MESSAGE = '伺服器處理異常，請稍後再試。';

export function formatErrorResponse(err: unknown): ErrorResponse {
  if (err instanceof BaziError) {
    return {
      error: err.message,
      code: err.code,
      timestamp: Date.now(),
    };
  }
  if (err instanceof Error) {
    return {
      error: err.message || '發生未知錯誤',
      code: 'UNEXPECTED_ERROR',
      timestamp: Date.now(),
    };
  }
  return {
    error: '發生未知錯誤',
    code: 'UNKNOWN_ERROR',
    timestamp: Date.now(),
  };
}

/**
 * Formats errors for an untrusted HTTP/SSE client. Expected BaziError messages
 * are safe to expose; provider, SDK, and programming errors are deliberately
 * reduced to a stable public contract so internal details never cross the API
 * boundary.
 */
export function formatPublicErrorResponse(err: unknown): ErrorResponse {
  if (err instanceof BaziError) {
    return {
      error: err.message,
      code: err.code,
      timestamp: Date.now(),
    };
  }

  return {
    error: PUBLIC_UNEXPECTED_ERROR_MESSAGE,
    code: 'INTERNAL_ERROR',
    timestamp: Date.now(),
  };
}
