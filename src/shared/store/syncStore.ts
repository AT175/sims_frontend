import { create } from 'zustand';
import { SyncStatus, PendingChange } from '@shared/types';
import { SyncEngine } from '@db/syncEngine';
import { getCachedBranding, getPendingOfflineCount } from '@db/indexedDBAdapter';
import type { SchoolBranding } from '@shared/api/apiClient';

interface SyncState {
  status: SyncStatus;
  lastSyncedAt: string | null;
  pendingCount: number;
  pendingChanges: PendingChange[];
  syncEngine: SyncEngine | null;
  isOnline: boolean;
  brandingCache: SchoolBranding | null;
  initEngine: (engine: SyncEngine) => void;
  enqueueChange: (change: Omit<PendingChange, 'id' | 'timestamp' | 'deviceId'>) => void;
  triggerSync: () => Promise<void>;
  setSyncStatus: (status: SyncStatus) => void;
  setLastSyncedAt: (timestamp: string) => void;
  clearPending: () => void;
  setOnline: (isOnline: boolean) => void;
  connectionTransitionedOnline: () => void;
  loadBrandingFromCache: (tenantKey: string) => Promise<void>;
  refreshPendingCount: () => Promise<void>;
}

const DEVICE_ID = 'device-' + Math.random().toString(36).substring(2, 11);

export const useSyncStore = create<SyncState>((set, get) => ({
  status: 'offline',
  lastSyncedAt: null,
  pendingCount: 0,
  pendingChanges: [],
  syncEngine: null,
  isOnline: true,
  brandingCache: null,

  initEngine: (engine) => {
    set({ syncEngine: engine });
    engine.startPolling();
  },

  enqueueChange: (change) => {
    const pendingChange: PendingChange = {
      ...change,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      deviceId: DEVICE_ID,
    };
    set((state) => ({
      pendingChanges: [...state.pendingChanges, pendingChange],
      pendingCount: state.pendingCount + 1,
      status: 'offline',
    }));

    const engine = get().syncEngine;
    if (engine) {
      SyncEngine.enqueue(
        engine['database'],
        change.entityId,
        change.entityType,
        change.operation,
        change.payload,
        DEVICE_ID
      ).catch((err) => console.error('[SyncStore] Enqueue failed:', err));
    }
  },

  triggerSync: async () => {
    const engine = get().syncEngine;
    if (!engine) {
      console.log('[SyncStore] No sync engine initialized');
      return;
    }

    set({ status: 'syncing' });
    try {
      const { pushed, pulled } = await engine.sync();
      const pendingCount = await engine.getPendingCount();
      const offlinePending = await getPendingOfflineCount();
      set({
        status: 'synced',
        lastSyncedAt: new Date().toISOString(),
        pendingCount: Math.max(pendingCount, offlinePending),
      });
      console.log(`[SyncStore] Sync done: ${pushed} pushed, ${pulled} pulled`);
    } catch (error) {
      set({ status: 'error' });
      console.error('[SyncStore] Sync failed:', error);
    }
  },

  setSyncStatus: (status) => set({ status }),

  setLastSyncedAt: (timestamp) =>
    set({ lastSyncedAt: timestamp, status: 'synced' }),

  clearPending: () => set({ pendingChanges: [], pendingCount: 0 }),

  setOnline: (isOnline) => set({ isOnline }),

  connectionTransitionedOnline: () => {
    set({ isOnline: true });
    get().triggerSync();
  },

  loadBrandingFromCache: async (tenantKey: string) => {
    try {
      const cached = await getCachedBranding(tenantKey);
      if (cached) {
        set({ brandingCache: cached });
      }
    } catch (err) {
      console.warn('[SyncStore] Failed to load branding from cache:', err);
    }
  },

  refreshPendingCount: async () => {
    try {
      const count = await getPendingOfflineCount();
      set({ pendingCount: count });
    } catch {
      // ignore
    }
  },
}));
