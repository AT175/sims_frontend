import React from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import { colors, spacing, fontSize, fontWeight, radius, shadows } from '@theme/index';

interface DataTableColumn<T> {
  key: keyof T | string;
  label: string;
  width?: number | string;
  render?: (item: T) => string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  emptyMessage = 'No records found',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconWrap}>
          <Text style={styles.emptyIcon}>∅</Text>
        </View>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.tableContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ minWidth: '100%' }}>
          <View style={styles.headerRow}>
            {columns.map((col) => (
              <Text
                key={String(col.key)}
                style={[styles.headerCell, col.width ? { width: col.width as number } : { flex: 1, minWidth: 100 }]}
              >
                {col.label}
              </Text>
            ))}
          </View>
          <FlatList
            data={data}
            keyExtractor={(_, index) => String(index)}
            renderItem={({ item, index }) => (
              <View style={[styles.dataRow, index % 2 === 1 && styles.dataRowAlt]}>
                {columns.map((col) => {
                  const value = col.render
                    ? col.render(item)
                    : String(item[col.key as keyof T] ?? '');
                  return (
                    <Text
                      key={String(col.key)}
                      style={[styles.dataCell, col.width ? { width: col.width as number } : { flex: 1, minWidth: 100 }]}
                    >
                      {value}
                    </Text>
                  );
                })}
              </View>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tableContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: colors.primaryDark,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
  },
  headerCell: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: spacing.xs,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  dataRowAlt: {
    backgroundColor: colors.surfaceAlt,
  },
  dataCell: {
    fontSize: fontSize.sm,
    color: colors.text,
    paddingHorizontal: spacing.xs,
    fontWeight: fontWeight.medium,
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
  emptyContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    ...shadows.sm,
  },
  emptyIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyIcon: {
    fontSize: fontSize.xl,
    color: colors.textLight,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textLight,
    fontWeight: fontWeight.medium,
  },
});
