import { create } from 'zustand';
import { SyncStatus, PendingChange } from '@shared/types';
import { SyncEngine } from '@db/syncEngine';

interface SyncState {
  status: SyncStatus;
  lastSyncedAt: string | null;
  pendingCount: number;
  pendingChanges: PendingChange[];
  syncEngine: SyncEngine | null;
  initEngine: (engine: SyncEngine) => void;
  enqueueChange: (change: Omit<PendingChange, 'id' | 'timestamp' | 'deviceId'>) => void;
  triggerSync: () => Promise<void>;
  setSyncStatus: (status: SyncStatus) => void;
  setLastSyncedAt: (timestamp: string) => void;
  clearPending: () => void;
}

const DEVICE_ID = 'device-' + Math.random().toString(36).substring(2, 11);

export const useSyncStore = create<SyncState>((set, get) => ({
  status: 'offline',
  lastSyncedAt: null,
  pendingCount: 0,
  pendingChanges: [],
  syncEngine: null,

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
      set({
        status: 'synced',
        lastSyncedAt: new Date().toISOString(),
        pendingCount,
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
}));
