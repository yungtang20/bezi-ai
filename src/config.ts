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
  },
  DEFAULT_VALUES: {
    DEFAULT_GENDER: '男' as const,
    MAX_MESSAGES_HISTORY: 30,
  },
};
