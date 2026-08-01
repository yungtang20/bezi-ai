import { describe, it, expect } from 'vitest';
import {
  BaziError,
  ValidationError,
  APIError,
  formatErrorResponse,
} from '../../src/errors';

describe('Errors Module (BaziError, ValidationError, APIError, formatting)', () => {
  it('creates BaziError with correct code and status', () => {
    const err = new BaziError('測試錯誤', 'CUSTOM_CODE', 404);
    expect(err.name).toBe('BaziError');
    expect(err.message).toBe('測試錯誤');
    expect(err.code).toBe('CUSTOM_CODE');
    expect(err.status).toBe(404);
  });

  it('creates ValidationError with code VALIDATION_ERROR and status 422', () => {
    const err = new ValidationError('格式不正確');
    expect(err.name).toBe('ValidationError');
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.status).toBe(422);
  });

  it('creates APIError with default status 500', () => {
    const err = new APIError('伺服器異常');
    expect(err.name).toBe('APIError');
    expect(err.code).toBe('API_ERROR');
    expect(err.status).toBe(500);
  });

  it('formats BaziError correctly', () => {
    const err = new BaziError('錯誤訊息', 'TEST_CODE', 400);
    const formatted = formatErrorResponse(err);
    expect(formatted.error).toBe('錯誤訊息');
    expect(formatted.code).toBe('TEST_CODE');
    expect(typeof formatted.timestamp).toBe('number');
  });

  it('formats standard Error correctly', () => {
    const err = new Error('一般標準錯誤');
    const formatted = formatErrorResponse(err);
    expect(formatted.error).toBe('一般標準錯誤');
    expect(formatted.code).toBe('UNEXPECTED_ERROR');
  });

  it('formats unknown error value correctly', () => {
    const formatted = formatErrorResponse('非 Error 物件');
    expect(formatted.error).toBe('發生未知錯誤');
    expect(formatted.code).toBe('UNKNOWN_ERROR');
  });
});
