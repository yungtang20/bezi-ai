// src/storage.ts
import { PartnerChart } from './matchmaking';
import { PatternScores } from './pattern';
import {
  addDaysToDateKey,
  compareDateKeys,
  isFutureDateKey,
  taipeiDateKey,
} from './lib/civilDate';
// 每日打卡記錄結構
export interface DailyLog {
  id?: number;
  date: string; // YYYY-MM-DD
  health: 'good' | 'bad' | null;
  career: 'good' | 'bad' | null;
  romance: 'good' | 'bad' | null;
  wealth: 'good' | 'bad' | null;
  family?: 'good' | 'bad' | null;
  friends?: 'good' | 'bad' | null;
  note: string; // 文字備註
  theoreticalOutcome: string; // 當天的理論好壞（大好/小吉/平穩/不順）
  dayTenGodType?: string; // 當天的十神類型
  createdAt: string; // ISO 時間戳
  rulesVersion?: string; // 生成時的校準規則版本（追溯用）
}
export class FutureDateLogError extends Error {
  code = 'FUTURE_DATE';
  constructor(
    public readonly date: string,
    public readonly today: string
  ) {
    super(`${date} 尚未到來，不得寫入打卡紀錄（今日 ${today}）。`);
    this.name = 'FutureDateLogError';
  }
}

/**
 * 未來日期寫入被拒絕時的結果類型；check-in 流程鎖定欄位，不寫入任何資料。
 */
export interface SubmitRejection {
  reason: 'FUTURE_DATE';
  date: string;
  today: string;
}

/**
 * 未來日期寫入被拒絕時的結果類型；check-in 流程鎖定欄位，不寫入任何資料。
 */
export interface SubmitRejection {
  reason: 'FUTURE_DATE';
  date: string;
  today: string;
}

// 打開 IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('BaziJournalDB', 5);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('dailyLogs')) {
        const logStore = db.createObjectStore('dailyLogs', {
          keyPath: 'id',
          autoIncrement: true,
        });
        logStore.createIndex('date', 'date', { unique: true });
      }
      if (!db.objectStoreNames.contains('patternScores'))
        db.createObjectStore('patternScores', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('notifications')) {
        const ns = db.createObjectStore('notifications', {
          keyPath: 'id',
          autoIncrement: true,
        });
        ns.createIndex('read', 'read', { unique: false });
      }
      if (!db.objectStoreNames.contains('partners'))
        db.createObjectStore('partners', { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () =>
      reject(
        new Error('IndexedDB blocked — please close other tabs using this app')
      );
  });
}

/** Typed IndexedDB wrappers — one paved road per operation, no dynamic method dispatch. */
function storePut<T>(store: IDBObjectStore, value: T): Promise<IDBValidKey> {
  const { promise, resolve, reject } = Promise.withResolvers<IDBValidKey>();
  const req = store.put(value);
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
  return promise;
}

function storeGet<T>(
  source: IDBObjectStore | IDBIndex,
  key: IDBValidKey
): Promise<T | undefined> {
  const { promise, resolve, reject } = Promise.withResolvers<T | undefined>();
  const req = source.get(key);
  req.onsuccess = () => resolve(req.result as T | undefined);
  req.onerror = () => reject(req.error);
  return promise;
}

function storeGetAll<T>(store: IDBObjectStore): Promise<T[]> {
  const { promise, resolve, reject } = Promise.withResolvers<T[]>();
  const req = store.getAll();
  req.onsuccess = () => resolve(req.result as T[]);
  req.onerror = () => reject(req.error);
  return promise;
}

/** Wait for an IndexedDB transaction to complete */
function txComplete(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// 儲存打卡記錄
export interface SaveDailyLogOptions {
  /** 測試/遷移用指定當下；預設為系統時鐘。 */
  now?: Date;
}

export async function saveDailyLog(
  log: DailyLog,
  options?: SaveDailyLogOptions
): Promise<void> {
  const now = options?.now ?? new Date();
  const db = await openDB();
  const { id: suppliedId, ...fields } = log;
  const existing = await (async () => {
    const s = db.transaction('dailyLogs', 'readonly').objectStore('dailyLogs');
    return storeGet<DailyLog>(s.index('date'), log.date);
  })();
  const resolvedId = suppliedId ?? existing?.id;
  const createdAt =
    existing &&
    suppliedId === undefined &&
    sameDailyLogContent(existing, fields)
      ? existing.createdAt
      : now.toISOString();
  const saved: DailyLog =
    resolvedId === undefined
      ? { ...existing, ...fields, createdAt }
      : { ...existing, ...fields, id: resolvedId, createdAt };
  const tx = db.transaction('dailyLogs', 'readwrite');
  const committed = txComplete(tx);
  await storePut(tx.objectStore('dailyLogs'), saved);
  await committed;
}

/** 同一天紀錄的欄位內容是否完全相同（用於判斷是否等冪重複提交）。 */
function sameDailyLogContent(
  a: DailyLog,
  b: Omit<DailyLog, 'id'> & { createdAt?: string }
): boolean {
  return (
    a.date === b.date &&
    a.health === b.health &&
    a.career === b.career &&
    a.romance === b.romance &&
    a.wealth === b.wealth &&
    a.family === b.family &&
    a.friends === b.friends &&
    a.note === b.note &&
    a.theoreticalOutcome === b.theoreticalOutcome &&
    a.dayTenGodType === b.dayTenGodType &&
    a.rulesVersion === b.rulesVersion
  );
}

// 取得特定日期的打卡記錄
export async function getDailyLog(date: string): Promise<DailyLog | null> {
  const db = await openDB();
  const store = db
    .transaction('dailyLogs', 'readonly')
    .objectStore('dailyLogs');
  return (await storeGet<DailyLog>(store.index('date'), date)) || null;
}

// 取得本月所有打卡記錄
export async function getMonthLogs(
  year: number,
  month: number
): Promise<DailyLog[]> {
  const db = await openDB();
  const store = db
    .transaction('dailyLogs', 'readonly')
    .objectStore('dailyLogs');
  const all = await storeGetAll<DailyLog>(store);
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return all.filter((log) => log.date?.startsWith(prefix));
}

export async function getWeekLogs(todayKey?: string): Promise<DailyLog[]> {
  const db = await openDB();
  const store = db
    .transaction('dailyLogs', 'readonly')
    .objectStore('dailyLogs');
  const all = await storeGetAll<DailyLog>(store);
  const today = todayKey ?? taipeiDateKey(new Date());
  const start = addDaysToDateKey(today, -6);
  return all.filter(
    (log) =>
      compareDateKeys(log.date, start) >= 0 &&
      compareDateKeys(log.date, today) <= 0
  );
}

// 取得所有打卡記錄（連續天數／整體準確率用）
export async function getAllLogs(): Promise<DailyLog[]> {
  const db = await openDB();
  const store = db
    .transaction('dailyLogs', 'readonly')
    .objectStore('dailyLogs');
  return await storeGetAll<DailyLog>(store);
}

/** 只讀取，不刪除：重算前查出會被「未來日期」規則跳過的紀錄。 */
export async function getFutureLogs(): Promise<DailyLog[]> {
  const db = await openDB();
  const store = db
    .transaction('dailyLogs', 'readonly')
    .objectStore('dailyLogs');
  const all = await storeGetAll<DailyLog>(store);
  const today = taipeiDateKey(new Date());
  return all.filter((log) => isFutureDateKey(log.date, today));
}

// 通知記錄結構
export interface AppNotification {
  date: string;
  type: 'pattern_switch';
  title: string;
  message: string;
  oldPattern: string;
  newPattern: string;
  createdAt: string;
  read: boolean;
}

// 儲存格局分數
export async function savePatternScores(scores: PatternScores): Promise<void> {
  const db = await openDB();
  const tx = db.transaction('patternScores', 'readwrite');
  const committed = txComplete(tx);
  await storePut(tx.objectStore('patternScores'), { id: 'current', scores });
  await committed;
}
// 校準基準紀錄（儲存在 patternScores store，key 'calibration-base'）
export type CalibrationProvenance =
  'chart_derived' | 'legacy_anchor' | 'user_calibrated';

export interface CalibrationBaseRecord {
  id: 'calibration-base';
  provenance: CalibrationProvenance;
  /** 基準分數（在日誌回饋疊加之前）。 */
  scores: PatternScores;
  /** 此基準是否可完全追溯到命盤規則；legacy 遺留與未知校準殘差則為 false。 */
  exact: boolean;
  /** legacy_anchor：已寫入 base.scores 的舊紀錄日期集合，重算時跳過，避免重複累加。 */
  coveredDates?: string[];
  /** 不可歸因差額：紀錄與 replay(base) 的差距，標記為估算而非規則重算。 */
  residual?: PatternScores;
  /** 使用者校準（歷史校準/快速校準）軌跡：{at, year, value, pattern}。 */
  adjustments?: { at: string; year: string; value: string; pattern: string }[];
  createdAt: string; // ISO 時間戳
  updatedAt: string; // ISO 時間戳
}

const CALIBRATION_BASE_ID = 'calibration-base';

export async function getCalibrationBase(): Promise<CalibrationBaseRecord | null> {
  const db = await openDB();
  const store = db
    .transaction('patternScores', 'readonly')
    .objectStore('patternScores');
  return (
    (await storeGet<CalibrationBaseRecord>(store, CALIBRATION_BASE_ID)) || null
  );
}

export async function saveCalibrationBase(
  record: CalibrationBaseRecord
): Promise<void> {
  const db = await openDB();
  const tx = db.transaction('patternScores', 'readwrite');
  const committed = txComplete(tx);
  await storePut(tx.objectStore('patternScores'), record);
  await committed;
}

// 讀取格局分數
export async function getPatternScores(): Promise<PatternScores | null> {
  const db = await openDB();
  const store = db
    .transaction('patternScores', 'readonly')
    .objectStore('patternScores');
  const result = await storeGet<{ scores: PatternScores }>(store, 'current');
  return result?.scores || null;
}

// 儲存通知
export async function saveNotification(
  notification: AppNotification
): Promise<void> {
  const db = await openDB();
  const tx = db.transaction('notifications', 'readwrite');
  tx.objectStore('notifications').put(notification);
  await txComplete(tx);
}

// 讀取所有通知（用於校準面板顯示因果鏈）
export async function getAllNotifications(): Promise<AppNotification[]> {
  const db = await openDB();
  const store = db
    .transaction('notifications', 'readonly')
    .objectStore('notifications');
  const all = await storeGetAll<AppNotification>(store);
  return all.sort((a, b) =>
    a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0
  );
}

export async function markNotificationRead(createdAt: string): Promise<void> {
  const db = await openDB();
  const all = await (async () => {
    const s = db
      .transaction('notifications', 'readonly')
      .objectStore('notifications');
    return storeGetAll<AppNotification>(s);
  })();
  const target = all.find((n) => n.createdAt === createdAt);
  if (!target) return;
  const tx = db.transaction('notifications', 'readwrite');
  const store = tx.objectStore('notifications');
  await storePut(store, { ...target, read: true });
  await txComplete(tx);
}

// 標記通知為已讀

// [AI MOD] getAllNotifications / getUnreadNotifications 已移除 — dead export（無外部消費者）
// ------------------- 伴侶命盤管理 -------------------

// [AI MOD] exportAllData / importAllData 已移除 — dead export（無外部消費者）

export async function savePartner(partner: PartnerChart): Promise<void> {
  const db = await openDB();
  const tx = db.transaction('partners', 'readwrite');
  tx.objectStore('partners').put(partner);
  await txComplete(tx);
}

export async function getPartners(): Promise<PartnerChart[]> {
  const db = await openDB();
  return storeGetAll<PartnerChart>(
    db.transaction('partners', 'readonly').objectStore('partners')
  );
}

export async function deletePartner(id: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction('partners', 'readwrite');
  tx.objectStore('partners').delete(id);
  await txComplete(tx);
}
