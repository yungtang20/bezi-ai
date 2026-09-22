// src/config.ts — 前端核心環境設定與 Storage Key 定義
import { resolveChatEndpoint } from './api/chatEndpoint';

export const CLIENT_CONFIG = {
  API: {
    CHAT_ENDPOINT: resolveChatEndpoint(import.meta.env.VITE_API_BASE_URL),
  },
  STORAGE_KEYS: {
    NAME: 'bazi_name',
    GENDER: 'bazi_gender',
    DATE: 'bazi_date',
    TIME: 'bazi_time',
    CURRENT_STEP: 'bazi_current_step',
    CALIBRATIONS: 'bazi_calibrations',
    CHAT_SESSION_TOKEN: 'bezi_chat_session_token',
  },
  DEFAULT_VALUES: {
    DEFAULT_GENDER: '男' as const,
    MAX_MESSAGES_HISTORY: 30,
  },
};

function resolveApiEndpoint(pathname: string): string {
  const chatEndpoint = CLIENT_CONFIG.API.CHAT_ENDPOINT;
  return chatEndpoint.startsWith('http') ? new URL(pathname, chatEndpoint).toString() : pathname;
}

export function getChatAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = window.sessionStorage.getItem(CLIENT_CONFIG.STORAGE_KEYS.CHAT_SESSION_TOKEN);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getChatRecordId(): string {
  if (typeof window === 'undefined') return '';
  return window.sessionStorage.getItem('bezi_chat_record_id') || '';
}

export interface ChatRecordSummary { record_id: string; birth: string; gender: string; }

export async function fetchChatRecords(): Promise<ChatRecordSummary[]> {
  const response = await fetch(resolveApiEndpoint('/api/records'), { headers: getChatAuthHeaders() });
  if (response.status === 401) throw new Error('unauthorized');
  if (!response.ok) throw new Error('records unavailable');
  return await response.json() as ChatRecordSummary[];
}

export async function requestChatSession(clientSecret: string): Promise<void> {
  const response = await fetch(resolveApiEndpoint('/api/auth/token'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_secret: clientSecret }),
  });
  if (!response.ok) throw new Error('unauthorized');
  const payload = await response.json() as { token?: string };
  if (!payload.token) throw new Error('session unavailable');
  window.sessionStorage.setItem(CLIENT_CONFIG.STORAGE_KEYS.CHAT_SESSION_TOKEN, payload.token);
}
