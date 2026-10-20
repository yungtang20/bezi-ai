// src/storage.ts
import { PartnerChart } from './matchmaking';
import { PatternScores } from './pattern';

// 每日打卡記錄結構
export interface DailyLog {
  id?: number;
  date: string;           // YYYY-MM-DD
  health: 'good' | 'bad' | null;
  career: 'good' | 'bad' | null;
  romance: 'good' | 'bad' | null;
  wealth: 'good' | 'bad' | null;
  family?: 'good' | 'bad' | null;
  friends?: 'good' | 'bad' | null;
  note: string;           // 文字備註
  theoreticalOutcome: string; // 當天的理論好壞（大好/小吉/平穩/不順）
  dayTenGodType?: string;     // 當天的十神類型
  createdAt: string;      // ISO 時間戳
}

// 打開 IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('BaziJournalDB', 5);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('dailyLogs')) {
        const logStore = db.createObjectStore('dailyLogs', { keyPath: 'id', autoIncrement: true });
        logStore.createIndex('date', 'date', { unique: true });
      }
      if (!db.objectStoreNames.contains('patternScores')) db.createObjectStore('patternScores', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('notifications')) {
        const ns = db.createObjectStore('notifications', { keyPath: 'id', autoIncrement: true });
        ns.createIndex('read', 'read', { unique: false });
      }
      if (!db.objectStoreNames.contains('partners')) db.createObjectStore('partners', { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('IndexedDB blocked — please close other tabs using this app'));
  });
}

/** Generic IndexedDB request helper — wraps a single store operation into a Promise */
function dbRequest<T>(store: IDBObjectStore, method: 'get' | 'getAll' | 'put' | 'delete' | 'clear', key?: any): Promise<T>;
function dbRequest<T>(store: IDBIndex, method: 'get' | 'getAll', key?: IDBValidKey): Promise<T>;
function dbRequest<T>(store: IDBObjectStore | IDBIndex, method: string, key?: any): Promise<T> {
  return new Promise((resolve, reject) => {
    const isStore = method === 'put' || method === 'delete' || method === 'clear';
    const req = isStore
      ? (store as IDBObjectStore)[method](key)
      : (store as any)[method](key);
    req.onsuccess = () => resolve(req.result as T);
    req.onerror = () => reject(req.error);
  });
}

/** Wait for an IndexedDB transaction to complete */
function txComplete(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); });
}

// 儲存打卡記錄
export async function saveDailyLog(log: DailyLog): Promise<void> {
  const db = await openDB();
  const store = db.transaction('dailyLogs', 'readwrite').objectStore('dailyLogs');
  const existing = await dbRequest<DailyLog | undefined>(store.index('date'), 'get', log.date);
  const saved = { ...existing, ...log };
  await dbRequest(store, 'put', saved);
}

// 取得特定日期的打卡記錄
export async function getDailyLog(date: string): Promise<DailyLog | null> {
  const db = await openDB();
  const store = db.transaction('dailyLogs', 'readonly').objectStore('dailyLogs');
  return (await dbRequest<DailyLog | undefined>(store.index('date'), 'get', date)) || null;
}

// 取得本月所有打卡記錄
export async function getMonthLogs(year: number, month: number): Promise<DailyLog[]> {
  const db = await openDB();
  const store = db.transaction('dailyLogs', 'readonly').objectStore('dailyLogs');
  const all = await dbRequest<DailyLog[]>(store, 'getAll');
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return all.filter(log => log.date?.startsWith(prefix));
}

export async function getWeekLogs(): Promise<DailyLog[]> {
  const db = await openDB();
  const store = db.transaction('dailyLogs', 'readonly').objectStore('dailyLogs');
  const all = await dbRequest<DailyLog[]>(store, 'getAll');
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  return all.filter(log => log.date >= cutoff.toISOString().split('T')[0]);
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
  const store = db.transaction('patternScores', 'readwrite').objectStore('patternScores');
  await dbRequest(store, 'put', { id: 'current', scores });
}

// 讀取格局分數
export async function getPatternScores(): Promise<PatternScores | null> {
  const db = await openDB();
  const store = db.transaction('patternScores', 'readonly').objectStore('patternScores');
  const result = await dbRequest<{ scores: PatternScores } | undefined>(store, 'get', 'current');
  return result?.scores || null;
}

// 儲存通知
export async function saveNotification(notification: AppNotification): Promise<void> {
  const db = await openDB();
  const tx = db.transaction('notifications', 'readwrite');
  tx.objectStore('notifications').put(notification);
  await txComplete(tx);
}

// [AI MOD] getAllNotifications / getUnreadNotifications 已移除 — dead export（無外部消費者）
// 通知資料透過 exportAllData 中的 read('notifications') 序列化

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
  return dbRequest<PartnerChart[]>(db.transaction('partners', 'readonly').objectStore('partners'), 'getAll');
}

export async function deletePartner(id: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction('partners', 'readwrite');
  tx.objectStore('partners').delete(id);
  await txComplete(tx);
}
