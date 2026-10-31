// src/storage.ts
import { PartnerChart } from './matchmaking';
import { PatternScores } from './pattern';

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
export async function saveDailyLog(log: DailyLog): Promise<void> {
  const db = await openDB();
  const store = db
    .transaction('dailyLogs', 'readwrite')
    .objectStore('dailyLogs');
  const existing = await storeGet<DailyLog>(store.index('date'), log.date);
  const saved = { ...existing, ...log };
  await storePut(store, saved);
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

export async function getWeekLogs(): Promise<DailyLog[]> {
  const db = await openDB();
  const store = db
    .transaction('dailyLogs', 'readonly')
    .objectStore('dailyLogs');
  const all = await storeGetAll<DailyLog>(store);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  return all.filter((log) => log.date >= cutoff.toISOString().split('T')[0]);
}

// 取得所有打卡記錄（連續天數／整體準確率用）
export async function getAllLogs(): Promise<DailyLog[]> {
  const db = await openDB();
  const store = db
    .transaction('dailyLogs', 'readonly')
    .objectStore('dailyLogs');
  return await storeGetAll<DailyLog>(store);
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
  const store = db
    .transaction('patternScores', 'readwrite')
    .objectStore('patternScores');
  await storePut(store, { id: 'current', scores });
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
  const tx = db.transaction('notifications', 'readwrite');
  const store = tx.objectStore('notifications');
  const all = await storeGetAll<AppNotification>(store);
  const target = all.find((n) => n.createdAt === createdAt);
  if (!target) return;
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
