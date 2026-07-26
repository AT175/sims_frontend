import { openDB, type IDBPDatabase } from 'idb';
import type { SchoolBranding } from '@shared/api/apiClient';
import type { PendingChange } from '@shared/types';

const DB_NAME = 'simsgh-offline';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase | null = null;

async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('school_branding')) {
        db.createObjectStore('school_branding', { keyPath: 'tenantKey' });
      }
      if (!db.objectStoreNames.contains('sync_queue')) {
        const store = db.createObjectStore('sync_queue', { keyPath: 'id' });
        store.createIndex('by-entity', 'entityType');
        store.createIndex('by-status', 'status');
      }
      if (!db.objectStoreNames.contains('offline_cache')) {
        db.createObjectStore('offline_cache', { keyPath: 'key' });
      }
    },
  });

  return dbInstance;
}

// ── School Branding cache ──

export async function cacheBranding(tenantKey: string, data: SchoolBranding): Promise<void> {
  const db = await getDB();
  await db.put('school_branding', { ...data, tenantKey, _cachedAt: Date.now() });
}

export async function getCachedBranding(tenantKey: string): Promise<SchoolBranding | null> {
  const db = await getDB();
  const record = await db.get('school_branding', tenantKey);
  if (!record) return null;
  const { _cachedAt, ...branding } = record as any;
  return branding as SchoolBranding;
}

export async function clearBrandingCache(tenantKey: string): Promise<void> {
  const db = await getDB();
  await db.delete('school_branding', tenantKey);
}

export async function getBrandingCacheAge(tenantKey: string): Promise<number | null> {
  const db = await getDB();
  const record = await db.get('school_branding', tenantKey);
  if (!record) return null;
  return (record as any)._cachedAt ?? null;
}

// ── Sync Queue ──

export async function enqueueOfflineChange(change: PendingChange): Promise<void> {
  const db = await getDB();
  await db.put('sync_queue', { ...change, status: 'pending' });
}

export async function getPendingOfflineChanges(): Promise<PendingChange[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('sync_queue', 'by-status', 'pending');
  return all as PendingChange[];
}

export async function clearOfflineChange(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('sync_queue', id);
}

export async function markOfflineChangeFailed(id: string, error: string): Promise<void> {
  const db = await getDB();
  const record = await db.get('sync_queue', id);
  if (record) {
    await db.put('sync_queue', { ...record, status: 'failed', lastError: error });
  }
}

export async function getPendingOfflineCount(): Promise<number> {
  const db = await getDB();
  const all = await db.getAllFromIndex('sync_queue', 'by-status', 'pending');
  return all.length;
}

// ── Generic key-value cache ──

export async function setCacheValue(key: string, value: any): Promise<void> {
  const db = await getDB();
  await db.put('offline_cache', { key, value, _cachedAt: Date.now() });
}

export async function getCacheValue(key: string): Promise<any> {
  const db = await getDB();
  const record = await db.get('offline_cache', key);
  if (!record) return null;
  return (record as any).value;
}

export async function deleteCacheValue(key: string): Promise<void> {
  const db = await getDB();
  await db.delete('offline_cache', key);
}
