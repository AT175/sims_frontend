import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useKitchenStore } from '@store/kitchenStore';

interface KitchenMenuWidgetProps {
  role?: string;
  personName?: string;
}

export function KitchenMenuWidget({ role, personName }: KitchenMenuWidgetProps) {
  const { customMenus, getTodayMenu } = useKitchenStore();
  const todayMenu = getTodayMenu();

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const myCustomMenus = customMenus.filter((c) => {
    if (!c.active) return false;
    if (personName && c.personName === personName) return true;
    if (role && c.personRole === role) return true;
    return false;
  });

  return (
    <View style={styles.widget}>
      <View style={styles.header}>
        <Text style={styles.title}>🍽️ Today's Menu</Text>
        <Text style={styles.day}>{today}</Text>
      </View>

      {todayMenu ? (
        <View style={styles.meals}>
          <View style={styles.mealRow}>
            <Text style={styles.mealIcon}>🌅</Text>
            <View style={styles.mealContent}>
              <Text style={styles.mealLabel}>Breakfast</Text>
              <Text style={styles.mealValue}>{todayMenu.breakfast || '—'}</Text>
            </View>
          </View>
          <View style={styles.mealRow}>
            <Text style={styles.mealIcon}>☀</Text>
            <View style={styles.mealContent}>
              <Text style={styles.mealLabel}>Lunch</Text>
              <Text style={styles.mealValue}>{todayMenu.lunch || '—'}</Text>
            </View>
          </View>
          <View style={styles.mealRow}>
            <Text style={styles.mealIcon}>🌙</Text>
            <View style={styles.mealContent}>
              <Text style={styles.mealLabel}>Dinner</Text>
              <Text style={styles.mealValue}>{todayMenu.dinner || '—'}</Text>
            </View>
          </View>
        </View>
      ) : (
        <Text style={styles.emptyText}>No menu set for {today}.</Text>
      )}

      {myCustomMenus.length > 0 && (
        <View style={styles.customSection}>
          <Text style={styles.customTitle}>📋 Your Special Menu</Text>
          {myCustomMenus.map((c) => (
            <View key={c.id} style={styles.customCard}>
              <Text style={styles.customReason}>{c.reason}</Text>
              <Text style={styles.customMeal}>B: {c.breakfast || '—'}</Text>
              <Text style={styles.customMeal}>L: {c.lunch || '—'}</Text>
              <Text style={styles.customMeal}>D: {c.dinner || '—'}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.footer}>Managed by Catering / Kitchen Department</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  widget: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  day: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  meals: {
    gap: spacing.sm,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  mealIcon: {
    fontSize: fontSize.md,
    width: 24,
  },
  mealContent: {
    flex: 1,
  },
  mealLabel: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  mealValue: {
    fontSize: fontSize.sm,
    color: colors.text,
    marginTop: 2,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    fontStyle: 'italic' as const,
    paddingVertical: spacing.md,
  },
  customSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  customTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.purple,
    marginBottom: spacing.xs,
  },
  customCard: {
    backgroundColor: colors.purpleBg,
    borderRadius: radius.md,
    padding: spacing.sm + 2,
    marginBottom: spacing.xs,
  },
  customReason: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.purple,
    marginBottom: spacing.xs,
  },
  customMeal: {
    fontSize: fontSize.xs,
    color: colors.text,
    marginTop: 2,
  },
  footer: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    marginTop: spacing.md,
    textAlign: 'center' as const,
  },
});
