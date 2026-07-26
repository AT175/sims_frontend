export type ConflictStrategy = 'last-write-wins';

export interface ConflictResult<T> {
  resolved: T;
  hadConflict: boolean;
  winner: 'local' | 'server';
}

export function resolveConflict<T extends { updatedAt?: string | Date }>(
  local: T,
  server: T,
  strategy: ConflictStrategy = 'last-write-wins'
): ConflictResult<T> {
  if (strategy === 'last-write-wins') {
    const localTime = local.updatedAt ? new Date(local.updatedAt).getTime() : 0;
    const serverTime = server.updatedAt ? new Date(server.updatedAt).getTime() : 0;

    if (localTime > serverTime) {
      return { resolved: local, hadConflict: true, winner: 'local' };
    } else if (serverTime > localTime) {
      return { resolved: server, hadConflict: true, winner: 'server' };
    } else {
      // Equal timestamps — server wins as authoritative
      return { resolved: server, hadConflict: localTime > 0, winner: 'server' };
    }
  }

  return { resolved: server, hadConflict: false, winner: 'server' };
}

export function resolveBatch<T extends { updatedAt?: string | Date; id?: string }>(
  localRecords: T[],
  serverRecords: T[],
  strategy: ConflictStrategy = 'last-write-wins'
): { resolved: T[]; conflicts: number } {
  const localMap = new Map<string, T>();
  for (const r of localRecords) {
    if (r.id) localMap.set(r.id, r);
  }

  const resolved: T[] = [];
  let conflicts = 0;

  for (const server of serverRecords) {
    const local = server.id ? localMap.get(server.id) : undefined;
    if (local && server.id) {
      const result = resolveConflict(local, server, strategy);
      if (result.hadConflict) conflicts++;
      resolved.push(result.resolved);
      localMap.delete(server.id);
    } else {
      resolved.push(server);
    }
  }

  // Remaining local records (not on server) — keep them
  for (const remaining of localMap.values()) {
    resolved.push(remaining);
  }

  return { resolved, conflicts };
}

export function shouldApplyServerUpdate(
  localUpdatedAt: string | Date | null,
  serverUpdatedAt: string | Date | null
): boolean {
  if (!localUpdatedAt) return true;
  if (!serverUpdatedAt) return false;

  const localTime = new Date(localUpdatedAt).getTime();
  const serverTime = new Date(serverUpdatedAt).getTime();

  return serverTime >= localTime;
}
