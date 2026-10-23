// src/config.ts — 前端核心環境設定與 Storage Key 定義

export const CLIENT_CONFIG = {
  API: {
    CHAT_ENDPOINT: '/api/chat',
  },
  STORAGE_KEYS: {
    NAME: 'bazi_name',
    GENDER: 'bazi_gender',
    DATE: 'bazi_date',
    TIME: 'bazi_time',
    CURRENT_STEP: 'bazi_current_step',
    CALIBRATIONS: 'bazi_calibrations',
    CHAT_SESSION_TOKEN: 'bezi_chat_session_token',
    LONGITUDE: 'bezi_longitude',          // [P2] 真太陽時出生地經度
    MY_PEOPLE: 'bezi_my_people',          // [P2] 我的人 v1
    CHART_CODEX: 'bezi_chart_codex',      // [P1] 命盤圖鑑收集格
  },
  DEFAULT_VALUES: {
    DEFAULT_GENDER: '男' as const,
    MAX_MESSAGES_HISTORY: 30,
  },
};

export function getChatAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = window.sessionStorage.getItem(CLIENT_CONFIG.STORAGE_KEYS.CHAT_SESSION_TOKEN);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getChatRecordId(): string {
  if (typeof window === 'undefined') return '';
  return window.sessionStorage.getItem('bezi_chat_record_id') || '';
}

export interface ChatRecordSummary { record_id: string; birth: string; gender: string; source?: 'current' | 'demo'; time_known?: boolean; }

export async function fetchChatRecords(): Promise<ChatRecordSummary[]> {
  const response = await fetch('/api/records', { headers: getChatAuthHeaders() });
  if (response.status === 401) throw new Error('unauthorized');
  if (!response.ok) throw new Error('records unavailable');
  return (await response.json() as ChatRecordSummary[]).map(record => ({ ...record, source: record.source || 'demo' }));
}

export async function createCurrentEvidence(input: { birthDate: string; birthTime: string; gender: 'male' | 'female' }): Promise<ChatRecordSummary> {
  const response = await fetch('/api/evidence/current', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getChatAuthHeaders() },
    body: JSON.stringify(input),
  });
  if (response.status === 401) throw new Error('unauthorized');
  if (!response.ok) throw new Error('current evidence unavailable');
  return await response.json() as ChatRecordSummary;
}

export async function requestChatSession(clientSecret: string = ''): Promise<void> {
  const response = await fetch('/api/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clientSecret ? { client_secret: clientSecret } : {}),
  });
  if (!response.ok) throw new Error('unauthorized');
  const payload = await response.json() as { token?: string };
  if (!payload.token) throw new Error('session unavailable');
  window.sessionStorage.setItem(CLIENT_CONFIG.STORAGE_KEYS.CHAT_SESSION_TOKEN, payload.token);
}
