import { Platform } from 'react-native';
import type { SchoolBranding } from '@shared/api/apiClient';
import type { PendingChange } from '@shared/types';

// Web implementation uses IndexedDB via idb
import * as offlineDB from './offlineDB';

// Native fallback uses AsyncStorage
let AsyncStorage: any = null;
if (Platform.OS !== 'web') {
  try {
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
  } catch {
    // AsyncStorage not available — will use in-memory fallback
  }
}

// In-memory fallback for environments without IndexedDB or AsyncStorage
const memoryStore: Record<string, any> = {};
const memoryQueue: PendingChange[] = [];

function isWeb(): boolean {
  return Platform.OS === 'web' && typeof indexedDB !== 'undefined';
}

// ── School Branding ──

export async function cacheBranding(tenantKey: string, data: SchoolBranding): Promise<void> {
  if (isWeb()) {
    return offlineDB.cacheBranding(tenantKey, data);
  }
  const key = `branding_${tenantKey}`;
  const payload = JSON.stringify({ ...data, _cachedAt: Date.now() });
  if (AsyncStorage) {
    await AsyncStorage.setItem(key, payload);
  } else {
    memoryStore[key] = payload;
  }
}

export async function getCachedBranding(tenantKey: string): Promise<SchoolBranding | null> {
  if (isWeb()) {
    return offlineDB.getCachedBranding(tenantKey);
  }
  const key = `branding_${tenantKey}`;
  let raw: string | null = null;
  if (AsyncStorage) {
    raw = await AsyncStorage.getItem(key);
  } else {
    raw = memoryStore[key] ?? null;
  }
  if (!raw) return null;
  const { _cachedAt, ...branding } = JSON.parse(raw);
  return branding as SchoolBranding;
}

export async function clearBrandingCache(tenantKey: string): Promise<void> {
  if (isWeb()) {
    return offlineDB.clearBrandingCache(tenantKey);
  }
  const key = `branding_${tenantKey}`;
  if (AsyncStorage) {
    await AsyncStorage.removeItem(key);
  } else {
    delete memoryStore[key];
  }
}

export async function getBrandingCacheAge(tenantKey: string): Promise<number | null> {
  if (isWeb()) {
    return offlineDB.getBrandingCacheAge(tenantKey);
  }
  const key = `branding_${tenantKey}`;
  let raw: string | null = null;
  if (AsyncStorage) {
    raw = await AsyncStorage.getItem(key);
  } else {
    raw = memoryStore[key] ?? null;
  }
  if (!raw) return null;
  const { _cachedAt } = JSON.parse(raw);
  return _cachedAt ?? null;
}

// ── Sync Queue ──

export async function enqueueOfflineChange(change: PendingChange): Promise<void> {
  if (isWeb()) {
    return offlineDB.enqueueOfflineChange(change);
  }
  memoryQueue.push(change);
}

export async function getPendingOfflineChanges(): Promise<PendingChange[]> {
  if (isWeb()) {
    return offlineDB.getPendingOfflineChanges();
  }
  return [...memoryQueue];
}

export async function clearOfflineChange(id: string): Promise<void> {
  if (isWeb()) {
    return offlineDB.clearOfflineChange(id);
  }
  const idx = memoryQueue.findIndex((c) => c.id === id);
  if (idx >= 0) memoryQueue.splice(idx, 1);
}

export async function markOfflineChangeFailed(id: string, error: string): Promise<void> {
  if (isWeb()) {
    return offlineDB.markOfflineChangeFailed(id, error);
  }
  // In-memory: no-op (changes are transient)
}

export async function getPendingOfflineCount(): Promise<number> {
  if (isWeb()) {
    return offlineDB.getPendingOfflineCount();
  }
  return memoryQueue.length;
}

// ── Generic key-value cache ──

export async function setCacheValue(key: string, value: any): Promise<void> {
  if (isWeb()) {
    return offlineDB.setCacheValue(key, value);
  }
  if (AsyncStorage) {
    await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(value));
  } else {
    memoryStore[`cache_${key}`] = JSON.stringify(value);
  }
}

export async function getCacheValue(key: string): Promise<any> {
  if (isWeb()) {
    return offlineDB.getCacheValue(key);
  }
  let raw: string | null = null;
  if (AsyncStorage) {
    raw = await AsyncStorage.getItem(`cache_${key}`);
  } else {
    raw = memoryStore[`cache_${key}`] ?? null;
  }
  if (!raw) return null;
  return JSON.parse(raw);
}

export async function deleteCacheValue(key: string): Promise<void> {
  if (isWeb()) {
    return offlineDB.deleteCacheValue(key);
  }
  if (AsyncStorage) {
    await AsyncStorage.removeItem(`cache_${key}`);
  } else {
    delete memoryStore[`cache_${key}`];
  }
}
