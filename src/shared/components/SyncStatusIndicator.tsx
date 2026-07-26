import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSyncStore } from '@store/syncStore';
import { useConnectionStatus } from '@shared/hooks/useConnectionStatus';
import { colors, spacing, fontSize, fontWeight, radius, shadows } from '@theme/index';

export function SyncStatusIndicator() {
  const { status, pendingCount, lastSyncedAt, triggerSync } = useSyncStore();
  const { isOnline } = useConnectionStatus();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const { refreshPendingCount } = useSyncStore.getState();
    refreshPendingCount();
    const interval = setInterval(() => {
      refreshPendingCount();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        dotColor: '#ef4444',
        label: 'Offline',
        icon: '●',
        bgColor: 'rgba(239, 68, 68, 0.12)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
      };
    }
    switch (status) {
      case 'syncing':
        return {
          dotColor: '#f59e0b',
          label: 'Syncing...',
          icon: '⟳',
          bgColor: 'rgba(245, 158, 11, 0.12)',
          borderColor: 'rgba(245, 158, 11, 0.3)',
        };
      case 'synced':
        return {
          dotColor: '#22c55e',
          label: 'Synced',
          icon: '✓',
          bgColor: 'rgba(34, 197, 94, 0.12)',
          borderColor: 'rgba(34, 197, 94, 0.3)',
        };
      case 'error':
        return {
          dotColor: '#ef4444',
          label: 'Sync Error',
          icon: '⚠',
          bgColor: 'rgba(239, 68, 68, 0.12)',
          borderColor: 'rgba(239, 68, 68, 0.3)',
        };
      default:
        return {
          dotColor: '#94a3b8',
          label: 'Idle',
          icon: '○',
          bgColor: 'rgba(148, 163, 184, 0.12)',
          borderColor: 'rgba(148, 163, 184, 0.3)',
        };
    }
  };

  const config = getStatusConfig();

  const formatLastSync = () => {
    if (!lastSyncedAt) return 'Never';
    const date = new Date(lastSyncedAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <View style={[styles.container, Platform.OS === 'web' && { position: 'fixed' as any, bottom: 16, right: 16, zIndex: 9999 }]}>
      <TouchableOpacity
        style={[styles.badge, { backgroundColor: config.bgColor, borderColor: config.borderColor }]}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <Text style={[styles.dot, { color: config.dotColor }]}>{config.icon}</Text>
        <Text style={[styles.label, { color: config.dotColor }]}>{config.label}</Text>
        {pendingCount > 0 && (
          <View style={styles.pendingPill}>
            <Text style={styles.pendingText}>{pendingCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {expanded && (
        <View style={[styles.dropdown, shadows.lg]}>
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownTitle}>Sync Status</Text>
            <TouchableOpacity onPress={() => setExpanded(false)}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dropdownRow}>
            <Text style={styles.dropdownLabel}>Connection</Text>
            <Text style={[styles.dropdownValue, { color: isOnline ? '#22c55e' : '#ef4444' }]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>

          <View style={styles.dropdownRow}>
            <Text style={styles.dropdownLabel}>Last Sync</Text>
            <Text style={styles.dropdownValue}>{formatLastSync()}</Text>
          </View>

          <View style={styles.dropdownRow}>
            <Text style={styles.dropdownLabel}>Pending Changes</Text>
            <Text style={[styles.dropdownValue, { color: pendingCount > 0 ? '#f59e0b' : colors.textSecondary }]}>
              {pendingCount} {pendingCount === 1 ? 'item' : 'items'}
            </Text>
          </View>

          {pendingCount > 0 && (
            <View style={styles.dropdownRow}>
              <Text style={styles.dropdownLabel}>Queue</Text>
              <Text style={styles.dropdownValue}>Will sync when online</Text>
            </View>
          )}

          {isOnline && (pendingCount > 0 || status === 'error') && (
            <TouchableOpacity
              style={styles.syncBtn}
              onPress={() => {
                triggerSync();
                setExpanded(false);
              }}
            >
              <Text style={styles.syncBtnText}>Sync Now</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: 20,
    borderWidth: 1,
    ...shadows.sm,
  },
  dot: {
    fontSize: 12,
    fontWeight: fontWeight.bold,
  },
  label: {
    fontSize: 11,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.3,
  },
  pendingPill: {
    backgroundColor: '#f59e0b',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: 'center',
  },
  pendingText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: '#fff',
  },
  dropdown: {
    marginTop: spacing.xs,
    backgroundColor: '#fff',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 117, 0.08)',
    minWidth: 240,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 76, 117, 0.06)',
  },
  dropdownTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  closeBtn: {
    fontSize: 14,
    color: colors.textSecondary,
    padding: 4,
  },
  dropdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  dropdownLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  dropdownValue: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  syncBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  syncBtnText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: '#fff',
    letterSpacing: 0.5,
  },
});
