import { Database, Model } from '@nozbe/watermelondb';
import { SyncQueueModel, SyncedModel } from './models';

const SYNCED_TABLES = [
  'students',
  'placements',
  'admission_applications',
  'parent_accounts',
  'certificates',
  'correspondence_logs',
  'staff',
  'subjects',
  'class_sections',
  'teacher_assignments',
  'enrollments',
  'lesson_materials',
  'live_class_sessions',
  'assignments',
  'submissions',
  'assessments',
  'class_attendance',
  'student_fee_ledgers',
  'fee_payments',
  'payroll_records',
  'expenditure_entries',
  'budget_lines',
  'houses',
  'room_allocations',
  'roll_call_entries',
  'house_discipline_logs',
  'welfare_check_logs',
];

export interface SyncPushResult {
  id: string;
  success: boolean;
  serverId?: string;
  error?: string;
}

export interface SyncPullResult {
  table: string;
  received: number;
  applied: number;
}

export interface SyncEngineConfig {
  apiUrl: string;
  getToken: () => string | null;
  getTenantId: () => string | null;
  deviceId: string;
  pollIntervalMs?: number;
}

export class SyncEngine {
  private database: Database;
  private config: SyncEngineConfig;
  private isSyncing: boolean = false;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private lastSyncAt: Date | null = null;

  constructor(database: Database, config: SyncEngineConfig) {
    this.database = database;
    this.config = config;
  }

  /** Start periodic sync polling */
  startPolling(): void {
    const interval = this.config.pollIntervalMs ?? 30000; // 30s default
    this.pollTimer = setInterval(() => {
      this.sync().catch((err) => console.error('[SyncEngine] Poll sync error:', err));
    }, interval);
  }

  /** Stop periodic sync polling */
  stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  /** Full sync: push local changes, then pull server updates */
  async sync(): Promise<{ pushed: number; pulled: number }> {
    if (this.isSyncing) {
      console.log('[SyncEngine] Sync already in progress, skipping');
      return { pushed: 0, pulled: 0 };
    }

    const token = this.config.getToken();
    if (!token) {
      console.log('[SyncEngine] No auth token, skipping sync');
      return { pushed: 0, pulled: 0 };
    }

    this.isSyncing = true;
    try {
      const pushed = await this.push();
      const pulled = await this.pull();
      this.lastSyncAt = new Date();
      console.log(`[SyncEngine] Sync complete: ${pushed} pushed, ${pulled} pulled`);
      return { pushed, pulled };
    } catch (error) {
      console.error('[SyncEngine] Sync failed:', error);
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  /** Push all pending local changes to the server */
  private async push(): Promise<number> {
    const queue = await this.database.get<SyncQueueModel>('sync_queue').query().fetch();
    if (queue.length === 0) {
      return 0;
    }

    const token = this.config.getToken()!;
    let pushedCount = 0;

    for (const item of queue) {
      try {
        const response = await fetch(`${this.config.apiUrl}/sync/push`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'X-Tenant-Id': this.config.getTenantId() ?? '',
            'X-Device-Id': this.config.deviceId,
          },
          body: JSON.stringify({
            entityId: item.entityId,
            entityType: item.entityType,
            operation: item.operation,
            payload: JSON.parse(item.payload),
            timestamp: item.timestamp.getTime(),
          }),
        });

        if (!response.ok) {
          throw new Error(`Server responded ${response.status}`);
        }

        const result: SyncPushResult = await response.json();

        await this.database.write(async () => {
          if (result.success) {
            // Mark the synced record with syncedAt
            const table = this.database.get(item.entityType);
            const record = await table.find(item.entityId).catch(() => null);
            if (record && record instanceof SyncedModel) {
              await record.update(() => {
                // syncedAt is a readonly date field — WatermelonDB sets it via backend
              });
            }
            // Remove from queue
            await item.destroyPermanently();
            pushedCount++;
          } else {
            // Increment attempts, log error
            await item.update((r) => {
              r.attempts += 1;
              r.lastError = result.error ?? 'Unknown error';
            });
          }
        });
      } catch (error) {
        await this.database.write(async () => {
          await item.update((r) => {
            r.attempts += 1;
            r.lastError = error instanceof Error ? error.message : String(error);
          });
        });
        console.error(`[SyncEngine] Push failed for ${item.entityType}:${item.entityId}`, error);
      }
    }

    return pushedCount;
  }

  /** Pull server changes since last sync for all tables */
  private async pull(): Promise<number> {
    const token = this.config.getToken()!;
    const lastSyncTimestamp = this.lastSyncAt?.toISOString() ?? '1970-01-01T00:00:00.000Z';
    let totalPulled = 0;

    for (const tableName of SYNCED_TABLES) {
      try {
        const response = await fetch(
          `${this.config.apiUrl}/sync/pull?table=${tableName}&since=${encodeURIComponent(lastSyncTimestamp)}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'X-Tenant-Id': this.config.getTenantId() ?? '',
              'X-Device-Id': this.config.deviceId,
            },
          }
        );

        if (!response.ok) {
          console.error(`[SyncEngine] Pull failed for ${tableName}: ${response.status}`);
          continue;
        }

        const body = await response.json();
        const records: Record<string, unknown>[] = body.records ?? [];

        if (records.length > 0) {
          await this.applyServerChanges(tableName, records);
          totalPulled += records.length;
        }
      } catch (error) {
        console.error(`[SyncEngine] Pull error for ${tableName}:`, error);
      }
    }

    return totalPulled;
  }

  /** Apply server-pulled records into the local database */
  private async applyServerChanges(tableName: string, records: Record<string, unknown>[]): Promise<void> {
    const collection = this.database.get(tableName);

    await this.database.write(async () => {
      for ( const serverRecord of records) {
        const id = serverRecord['id'] as string;
        const isDeleted = serverRecord['deletedAt'] != null;

        // Try to find existing record
        const existing = await collection.find(id).catch(() => null);

        if (isDeleted && existing) {
          await existing.destroyPermanently();
          continue;
        }

        if (existing) {
          // Update existing record
          await existing.update((record: Model) => {
            this.mergeServerRecord(record as unknown as Record<string, unknown>, serverRecord);
          });
        } else {
          // Create new record
          await collection.create((record: Model) => {
            this.mergeServerRecord(record as unknown as Record<string, unknown>, serverRecord);
          });
        }
      }
    });
  }

  /** Copy fields from server record into local model */
  private mergeServerRecord(local: Record<string, unknown>, server: Record<string, unknown>): void {
    const skipFields = new Set(['id', 'created_at', 'updated_at']);
    for (const key of Object.keys(server)) {
      if (!skipFields.has(key)) {
        local[key] = server[key];
      }
    }
  }

  /** Enqueue a local change for sync */
  static async enqueue(
    database: Database,
    entityId: string,
    entityType: string,
    operation: 'create' | 'update' | 'delete',
    payload: Record<string, unknown>,
    deviceId: string
  ): Promise<void> {
    await database.write(async () => {
      await database.get<SyncQueueModel>('sync_queue').create((item) => {
        item.entityId = entityId;
        item.entityType = entityType;
        item.operation = operation;
        item.payload = JSON.stringify(payload);
        item.deviceId = deviceId;
        item.attempts = 0;
        item.lastError = null;
      });
    });
  }

  /** Get count of pending changes in the sync queue */
  async getPendingCount(): Promise<number> {
    return await this.database.get<SyncQueueModel>('sync_queue').query().fetch().then((r) => r.length);
  }

  /** Get the last sync timestamp */
  getLastSyncAt(): Date | null {
    return this.lastSyncAt;
  }
}
