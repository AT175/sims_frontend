import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, fontSize, fontWeight, radius, shadows } from '@theme/index';
import { useAuthStore } from '@store/authStore';
import { useAccessControlStore } from '@store/accessControlStore';
import { DASHBOARD_MAP } from '@shared/navigation/dashboardCatalog';
import { ROLE_LABELS, ROLE_DASHBOARD_MAP } from '@shared/navigation/roleMap';
import type { RoleId } from '@shared/types';

interface AssignedRolesPageProps {
  currentDashboardTitle: string;
}

export function AssignedRolesPage({ currentDashboardTitle }: AssignedRolesPageProps) {
  const { user, switchRole } = useAuthStore();
  const accessStore = useAccessControlStore();
  const [activeTab, setActiveTab] = useState<'mine' | 'assignees' | 'activity' | 'alerts'>('mine');

  if (!user) return null;

  const grants = accessStore.getGrantsForUser(user.id);
  const currentDashboardKey = ROLE_DASHBOARD_MAP[user.activeRole as RoleId];
  const assignees = accessStore.getAssigneesForDashboard(currentDashboardKey);
  const activities = accessStore.getActivitiesForDashboard(currentDashboardKey);
  const notifications = accessStore.getNotificationsForRole(user.activeRole as string);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSwitchToDashboard = (dashboardKey: string) => {
    const dashDef = DASHBOARD_MAP[dashboardKey];
    if (!dashDef) return;
    const role = dashDef.role;
    if (role !== user.activeRole) {
      switchRole(role);
    }
  };

  const formatTimestamp = (iso: string) => {
    const d = new Date(iso);
    const date = d.toISOString().slice(0, 10);
    const time = d.toTimeString().slice(0, 5);
    return `${date} ${time}`;
  };

  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Roles & Access Center</Text>
      <Text style={styles.pageSubtitle}>
        View your assignments, people on your dashboard, activity logs, and alerts
      </Text>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, activeTab === 'mine' && styles.tabActive]} onPress={() => setActiveTab('mine')}>
          <Text style={[styles.tabText, activeTab === 'mine' && styles.tabTextActive]}>My Assignments ({grants.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'assignees' && styles.tabActive]} onPress={() => setActiveTab('assignees')}>
          <Text style={[styles.tabText, activeTab === 'assignees' && styles.tabTextActive]}>On My Dashboard ({assignees.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'activity' && styles.tabActive]} onPress={() => setActiveTab('activity')}>
          <Text style={[styles.tabText, activeTab === 'activity' && styles.tabTextActive]}>Activity ({activities.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'alerts' && styles.tabActive]} onPress={() => setActiveTab('alerts')}>
          <Text style={[styles.tabText, activeTab === 'alerts' && styles.tabTextActive]}>
            Alerts{unreadCount > 0 ? ` (${unreadCount})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── TAB: My Assignments ── */}
      {activeTab === 'mine' && (
        <View>
          {/* Current Role / Basic Mandate */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Basic Mandate</Text>
          </View>
          <View style={styles.currentRoleCard}>
            <View style={styles.currentRoleIcon}>
              <Text style={styles.currentRoleIconText}>★</Text>
            </View>
            <View style={styles.currentRoleInfo}>
              <Text style={styles.currentRoleName}>{currentDashboardTitle}</Text>
              <Text style={styles.currentRoleLabel}>
                {ROLE_LABELS[user.activeRole as RoleId] ?? user.activeRole}
              </Text>
              <Text style={styles.currentRoleStatus}>Active — this is your primary dashboard</Text>
            </View>
          </View>

          {/* Assigned Dashboards */}
          {grants.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Additional Assignments</Text>
              <Text style={styles.emptyText}>
                You have no extra dashboard or page assignments beyond your basic mandate.
                The Headmaster can assign you additional dashboards or specific pages from the Access Control page.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Assigned Dashboards & Pages ({grants.length})</Text>
              </View>
              {grants.map((grant) => {
                const dashDef = DASHBOARD_MAP[grant.dashboardKey];
                const isCurrentDashboard = grant.dashboardKey === currentDashboardKey;
                return (
                  <View key={grant.id} style={styles.grantCard}>
                    <View style={styles.grantCardHeader}>
                      <View style={styles.grantCardHeaderLeft}>
                        <Text style={styles.grantDashLabel}>{grant.dashboardLabel}</Text>
                        {isCurrentDashboard ? (
                          <View style={styles.activeBadge}>
                            <Text style={styles.activeBadgeText}>CURRENT</Text>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={styles.switchBtn}
                            onPress={() => handleSwitchToDashboard(grant.dashboardKey)}
                          >
                            <Text style={styles.switchBtnText}>Switch to →</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>

                    {grant.allowedPages === 'all' ? (
                      <View style={styles.fullAccessBanner}>
                        <Text style={styles.fullAccessText}>✓ Full Dashboard Access — all pages</Text>
                      </View>
                    ) : (
                      <View style={styles.pagesContainer}>
                        <Text style={styles.pagesLabel}>
                          Granted Pages ({grant.allowedPages.length}):
                        </Text>
                        <View style={styles.pageChipsRow}>
                          {grant.allowedPages.map((pageKey) => {
                            const pageDef = dashDef?.pages.find((p) => p.key === pageKey);
                            return (
                              <View key={pageKey} style={styles.pageChip}>
                                <Text style={styles.pageChipText}>
                                  {pageDef?.label ?? pageKey}
                                </Text>
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    )}

                    <Text style={styles.grantMeta}>
                      Granted by {grant.grantedBy} on {grant.grantedAt.slice(0, 10)}
                    </Text>
                  </View>
                );
              })}
            </>
          )}
        </View>
      )}

      {/* ── TAB: People Assigned to My Dashboard ── */}
      {activeTab === 'assignees' && (
        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>People Assigned to {currentDashboardTitle}</Text>
            <Text style={styles.sectionDesc}>
              These users have been granted access to your dashboard or specific pages within it by the Headmaster
            </Text>
          </View>

          {assignees.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No External Assignees</Text>
              <Text style={styles.emptyText}>
                No one has been assigned to your dashboard yet. When the Headmaster assigns someone
                to your dashboard or specific pages, they will appear here with their access scope and activity.
              </Text>
            </View>
          ) : (
            assignees.map((assignee) => (
              <View key={assignee.id} style={styles.assigneeCard}>
                <View style={styles.assigneeHeader}>
                  <View style={styles.assigneeAvatar}>
                    <Text style={styles.assigneeAvatarText}>{assignee.displayName.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.assigneeInfo}>
                    <Text style={styles.assigneeName}>{assignee.displayName}</Text>
                    <Text style={styles.assigneeMeta}>@{assignee.username}</Text>
                  </View>
                  {assignee.allowedPages === 'all' ? (
                    <View style={styles.fullAccessBadge}>
                      <Text style={styles.fullAccessBadgeText}>FULL ACCESS</Text>
                    </View>
                  ) : (
                    <View style={styles.pageAccessBadge}>
                      <Text style={styles.pageAccessBadgeText}>{assignee.allowedPages.length} PAGE{assignee.allowedPages.length > 1 ? 'S' : ''}</Text>
                    </View>
                  )}
                </View>

                {assignee.allowedPages !== 'all' && (
                  <View style={styles.pageChipsRow}>
                    {assignee.allowedPages.map((pk) => {
                      const pageDef = DASHBOARD_MAP[currentDashboardKey]?.pages.find((p) => p.key === pk);
                      return (
                        <View key={pk} style={styles.pageChip}>
                          <Text style={styles.pageChipText}>{pageDef?.label ?? pk}</Text>
                        </View>
                      );
                    })}
                  </View>
                )}

                <Text style={styles.assigneeMeta}>
                  Granted by {assignee.grantedBy} on {assignee.grantedAt.slice(0, 10)}
                </Text>

                {/* Recent activity for this assignee on this dashboard */}
                {(() => {
                  const userActs = activities.filter((a) => a.userId === assignee.userId).slice(0, 3);
                  if (userActs.length === 0) return null;
                  return (
                    <View style={styles.assigneeActivityPreview}>
                      <Text style={styles.assigneeActivityLabel}>Recent activity:</Text>
                      {userActs.map((act) => (
                        <View key={act.id} style={styles.activityItem}>
                          <View style={styles.activityDot} />
                          <Text style={styles.activityText}>
                            {act.action} on {act.pageLabel}
                          </Text>
                          <Text style={styles.activityTime}>{formatTimestamp(act.timestamp)}</Text>
                        </View>
                      ))}
                    </View>
                  );
                })()}
              </View>
            ))
          )}
        </View>
      )}

      {/* ── TAB: Activity Feed ── */}
      {activeTab === 'activity' && (
        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Activity Log — {currentDashboardTitle}</Text>
            <Text style={styles.sectionDesc}>
              Timestamped log of all actions performed by assigned users on your dashboard and pages
            </Text>
          </View>

          {activities.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Activity Yet</Text>
              <Text style={styles.emptyText}>
                When assigned users navigate to pages or perform actions on your dashboard,
                their activities will be logged here with timestamps.
              </Text>
            </View>
          ) : (
            <View style={styles.activityTimeline}>
              {activities.map((act) => (
                <View key={act.id} style={styles.timelineItem}>
                  <View style={styles.timelineDot} />
                  <View style={styles.timelineLine} />
                  <View style={styles.timelineContent}>
                    <View style={styles.timelineHeader}>
                      <Text style={styles.timelineUser}>{act.displayName}</Text>
                      <Text style={styles.timelineAction}>{act.action}</Text>
                    </View>
                    <Text style={styles.timelinePage}>📄 {act.pageLabel}</Text>
                    <Text style={styles.timelineTime}>🕒 {formatTimestamp(act.timestamp)}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* ── TAB: Alerts / Notifications ── */}
      {activeTab === 'alerts' && (
        <View>
          <View style={styles.sectionHeader}>
            <View style={styles.alertsHeaderRow}>
              <Text style={styles.sectionTitle}>Access Alerts</Text>
              {unreadCount > 0 && (
                <TouchableOpacity
                  style={styles.markAllReadBtn}
                  onPress={() => accessStore.markAllNotificationsRead(user.activeRole as string)}
                >
                  <Text style={styles.markAllReadText}>Mark All Read</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.sectionDesc}>
              Notifications when someone is assigned to functions on your dashboard that fall under your role's mandate
            </Text>
          </View>

          {notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Alerts</Text>
              <Text style={styles.emptyText}>
                You will be notified here when the Headmaster assigns someone from another role
                to your dashboard or specific pages within it.
              </Text>
            </View>
          ) : (
            notifications.map((notif) => (
              <View
                key={notif.id}
                style={[styles.notifCard, !notif.read && styles.notifCardUnread]}
              >
                <View style={styles.notifIconRow}>
                  <View style={[styles.notifIcon, !notif.read && styles.notifIconUnread]}>
                    <Text style={styles.notifIconText}>{!notif.read ? '🔔' : '📭'}</Text>
                  </View>
                  <View style={styles.notifContent}>
                    <Text style={styles.notifMessage}>{notif.message}</Text>
                    <Text style={styles.notifTime}>🕒 {formatTimestamp(notif.timestamp)}</Text>
                  </View>
                  {!notif.read && (
                    <TouchableOpacity
                      style={styles.notifReadBtn}
                      onPress={() => accessStore.markNotificationRead(notif.id)}
                    >
                      <Text style={styles.notifReadBtnText}>✓</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pageTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  pageSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  tabBar: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  tab: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  tabTextActive: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
  sectionHeader: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  sectionDesc: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  currentRoleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  currentRoleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  currentRoleIconText: {
    fontSize: fontSize.xl,
    color: colors.primaryDark,
    fontWeight: fontWeight.bold,
  },
  currentRoleInfo: {
    flex: 1,
  },
  currentRoleName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  currentRoleLabel: {
    fontSize: fontSize.sm,
    color: colors.accent,
    marginTop: 2,
  },
  currentRoleStatus: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    marginTop: 4,
  },
  emptyContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  grantCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  grantCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  grantCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  grantDashLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    flex: 1,
  },
  activeBadge: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  activeBadgeText: {
    fontSize: fontSize.xs,
    color: colors.accent,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
  switchBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  switchBtnText: {
    fontSize: fontSize.xs,
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
  fullAccessBanner: {
    backgroundColor: 'rgba(34, 139, 34, 0.1)',
    borderRadius: radius.md,
    padding: spacing.sm + 2,
    marginBottom: spacing.sm,
  },
  fullAccessText: {
    fontSize: fontSize.sm,
    color: colors.success,
    fontWeight: fontWeight.medium,
  },
  pagesContainer: {
    marginBottom: spacing.sm,
  },
  pagesLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: fontWeight.medium,
  },
  pageChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  pageChip: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 1,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pageChipText: {
    fontSize: fontSize.xs,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  grantMeta: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    opacity: 0.7,
  },
  // ── Assignee card styles ──
  assigneeCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  assigneeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  assigneeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  assigneeAvatarText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  assigneeInfo: {
    flex: 1,
  },
  assigneeName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  assigneeMeta: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  fullAccessBadge: {
    backgroundColor: 'rgba(34, 139, 34, 0.15)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  fullAccessBadgeText: {
    fontSize: 10,
    color: colors.success,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
  pageAccessBadge: {
    backgroundColor: 'rgba(50, 130, 184, 0.15)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  pageAccessBadgeText: {
    fontSize: 10,
    color: colors.info,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
  assigneeActivityPreview: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  assigneeActivityLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  // ── Activity timeline styles ──
  activityTimeline: {
    marginTop: spacing.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginTop: 4,
    marginRight: spacing.sm,
  },
  timelineLine: {
    width: 2,
    backgroundColor: colors.border,
    marginLeft: -6,
    marginTop: 14,
    marginBottom: -spacing.sm,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm + 2,
    ...shadows.sm,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4,
  },
  timelineUser: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  timelineAction: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  timelinePage: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  timelineTime: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    fontWeight: fontWeight.medium,
  },
  // ── Activity preview in assignee card ──
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: spacing.xs,
  },
  activityText: {
    fontSize: fontSize.xs,
    color: colors.text,
    flex: 1,
  },
  activityTime: {
    fontSize: 10,
    color: colors.textLight,
  },
  // ── Notification styles ──
  alertsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  markAllReadBtn: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  markAllReadText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  notifCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  notifCardUnread: {
    backgroundColor: 'rgba(50, 130, 184, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(50, 130, 184, 0.2)',
  },
  notifIconRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notifIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  notifIconUnread: {
    backgroundColor: 'rgba(50, 130, 184, 0.15)',
  },
  notifIconText: {
    fontSize: fontSize.md,
  },
  notifContent: {
    flex: 1,
  },
  notifMessage: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.medium,
    lineHeight: 18,
  },
  notifTime: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    marginTop: 4,
  },
  notifReadBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifReadBtnText: {
    fontSize: fontSize.sm,
    color: colors.white,
    fontWeight: fontWeight.bold,
  },
});
