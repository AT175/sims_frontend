import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSyncStore } from '@store/syncStore';
import { colors, spacing, fontSize, radius } from '@theme/index';

export function SyncStatusIndicator() {
  const { status, lastSyncedAt, pendingCount } = useSyncStore();

  const statusColor =
    status === 'synced'
      ? colors.success
      : status === 'syncing'
        ? colors.info
        : status === 'error'
          ? colors.danger
          : colors.warning;

  const statusBg =
    status === 'synced'
      ? colors.successBg
      : status === 'syncing'
        ? colors.infoBg
        : status === 'error'
          ? colors.dangerBg
          : colors.warningBg;

  const statusLabel =
    status === 'synced'
      ? 'Synced'
      : status === 'syncing'
        ? 'Syncing...'
        : status === 'error'
          ? 'Sync error'
          : 'Offline';

  const timeLabel = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Never';

  return (
    <View style={[styles.container, { backgroundColor: statusBg }]}>
      <View style={[styles.dot, { backgroundColor: statusColor }]} />
      <Text style={[styles.label, { color: statusColor }]}>{statusLabel}</Text>
      <Text style={styles.separator}>·</Text>
      <Text style={styles.detail}>{timeLabel}</Text>
      {pendingCount > 0 && (
        <>
          <Text style={styles.separator}>·</Text>
          <View style={styles.pendingBadge}>
            <Text style={styles.pending}>{pendingCount}</Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 1,
    borderRadius: radius.pill,
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  separator: {
    fontSize: fontSize.xs,
    color: colors.textLight,
  },
  detail: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  pendingBadge: {
    backgroundColor: colors.warning,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xs + 1,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
  },
  pending: {
    fontSize: fontSize.xs,
    color: colors.white,
    fontWeight: '700',
  },
});
