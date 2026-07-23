import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { colors, spacing, fontSize, fontWeight, layout, shadows, radius } from '@theme/index';
import { useAuthStore } from '@store/authStore';
import { ROLE_LABELS, ROLE_DASHBOARD_MAP } from '@shared/navigation/roleMap';
import type { RoleId } from '@shared/types';
import { useAccessControlStore } from '@store/accessControlStore';
import { DASHBOARD_MAP } from '@shared/navigation/dashboardCatalog';
import { AssignedRolesPage } from './AssignedRolesPage';
import { UserProfileModal } from './UserProfileModal';
import { NotificationCenter } from './NotificationCenter';

export interface NavItem {
  key: string;
  label: string;
  icon?: string;
}

interface DashboardLayoutProps {
  title: string;
  navItems: NavItem[];
  activeKey: string;
  onNavigate: (key: string) => void;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}

export function DashboardLayout({
  title,
  navItems,
  activeKey,
  onNavigate,
  children,
  headerRight,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout, switchRole } = useAuthStore();
  const accessStore = useAccessControlStore();

  const currentDashboardKey = user ? ROLE_DASHBOARD_MAP[user.activeRole as RoleId] : '';
  const baseFilteredNavItems = user
    ? accessStore.getFilteredNavItems(user.id, currentDashboardKey, navItems)
    : navItems;

  // Inject "Assigned Roles" as the first nav item in every dashboard
  const assignedRolesItem: NavItem = { key: 'assigned-roles', label: 'Assigned Roles', icon: '★' };
  const filteredNavItems: NavItem[] = [assignedRolesItem, ...baseFilteredNavItems];

  const assignedDashboardKeys = user ? accessStore.getAssignedDashboardRoles(user.id) : [];
  const hasMultipleRoles = user && (user.roles.length > 1 || assignedDashboardKeys.length > 0);

  useEffect(() => {
    if (filteredNavItems.length > 0 && !filteredNavItems.some((n) => n.key === activeKey)) {
      onNavigate(filteredNavItems[0].key);
    }
  }, [filteredNavItems, activeKey, onNavigate]);

  const handleNavigate = (key: string) => {
    // Log activity if user is on an assigned dashboard (not their own basic mandate)
    if (user && key !== 'assigned-roles') {
      const grant = accessStore.getGrantForUserDashboard(user.id, currentDashboardKey);
      if (grant) {
        const navItem = navItems.find((n) => n.key === key);
        const dashDef = DASHBOARD_MAP[currentDashboardKey];
        accessStore.logActivity({
          userId: user.id,
          username: user.username,
          displayName: user.displayName,
          dashboardKey: currentDashboardKey,
          dashboardLabel: dashDef?.label ?? title,
          pageKey: key,
          pageLabel: navItem?.label ?? key,
          action: 'Viewed page',
        });
      }
    }
    onNavigate(key);
    setSidebarOpen(false);
  };

  const sidebarContent = (
    <View style={styles.sidebarInner}>
      {/* Brand / Logo header */}
      <View style={styles.sidebarHeader}>
        <View style={styles.sidebarLogoRow}>
          <View style={styles.sidebarLogo}>
            <Text style={styles.sidebarLogoText}>SIMS</Text>
          </View>
          <View style={styles.sidebarBrandText}>
            <Text style={styles.sidebarBrandTitle}>SIMS</Text>
            <Text style={styles.sidebarBrandSub}>School Management</Text>
          </View>
        </View>
      </View>

      {/* Dashboard title */}
      <View style={styles.sidebarSectionLabel}>
        <Text style={styles.sidebarSectionText}>{title}</Text>
      </View>

      {/* Nav items */}
      <ScrollView style={styles.navList} showsVerticalScrollIndicator={false}>
        {filteredNavItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            onPress={() => handleNavigate(item.key)}
            style={[
              styles.navItem,
              activeKey === item.key && styles.navItemActive,
            ]}
            activeOpacity={0.7}
          >
            {activeKey === item.key && <View style={styles.navActiveDot} />}
            <Text
              style={[
                styles.navItemText,
                activeKey === item.key && styles.navItemTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* User profile footer */}
      <TouchableOpacity style={styles.sidebarFooter} onPress={() => setProfileOpen(true)} activeOpacity={0.8}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>
            {(user?.displayName ?? 'U').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>{user?.displayName ?? 'User'}</Text>
          <Text style={styles.userRole} numberOfLines={1}>{user?.activeRole ? ROLE_LABELS[user.activeRole as RoleId] : title}</Text>
        </View>
        {hasMultipleRoles && (
          <TouchableOpacity onPress={(e) => { e.stopPropagation(); setRoleSwitcherOpen(true); }} style={styles.switchRoleBtn}>
            <Text style={styles.switchRoleIcon}>⇄</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={(e) => { e.stopPropagation(); logout(); }} style={styles.logoutIconBtn}>
          <Text style={styles.logoutIcon}>⏻</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setSidebarOpen(true)}
          style={styles.hamburger}
          activeOpacity={0.6}
        >
          <View style={styles.hamburgerLine} />
          <View style={[styles.hamburgerLine, { width: 16 }]} />
          <View style={styles.hamburgerLine} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {filteredNavItems.find((n) => n.key === activeKey)?.label ?? title}
        </Text>
        <View style={styles.headerRight}>
          {headerRight}
          <NotificationCenter />
          <SyncStatusIndicator />
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ padding: spacing.lg }}>
        {activeKey === 'assigned-roles'
          ? <AssignedRolesPage currentDashboardTitle={title} />
          : children
        }
      </ScrollView>

      {/* Sidebar overlay — auto-hides on nav click */}
      <Modal
        visible={sidebarOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setSidebarOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setSidebarOpen(false)}>
          <Pressable style={styles.sidebarDrawer} onPress={(e) => e.stopPropagation()}>
            {sidebarContent}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Role Switcher Modal */}
      <Modal
        visible={roleSwitcherOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setRoleSwitcherOpen(false)}
      >
        <Pressable style={styles.roleOverlay} onPress={() => setRoleSwitcherOpen(false)}>
          <Pressable style={styles.roleModal} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.roleModalTitle}>Switch Role</Text>
            <Text style={styles.roleModalSub}>Select a role to switch dashboards</Text>
            <ScrollView style={styles.roleList} showsVerticalScrollIndicator={false}>
              {user?.roles.map((role) => {
                const dashKey = ROLE_DASHBOARD_MAP[role as RoleId];
                const grant = accessStore.getGrantForUserDashboard(user.id, dashKey);
                const pageLabel = grant && grant.allowedPages !== 'all'
                  ? ` (${grant.allowedPages.length} page${grant.allowedPages.length > 1 ? 's' : ''})`
                  : '';
                return (
                <TouchableOpacity
                  key={role}
                  onPress={() => {
                    if (role !== user.activeRole) {
                      switchRole(role as RoleId);
                    }
                    setRoleSwitcherOpen(false);
                  }}
                  style={[
                    styles.roleItem,
                    user.activeRole === role && styles.roleItemActive,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.roleItemText,
                      user.activeRole === role && styles.roleItemTextActive,
                    ]}
                  >
                    {ROLE_LABELS[role as RoleId] ?? role}{pageLabel}
                  </Text>
                  {user.activeRole === role && (
                    <Text style={styles.roleItemCheck}>✓</Text>
                  )}
                </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setRoleSwitcherOpen(false)}
              style={styles.roleCancelBtn}
            >
              <Text style={styles.roleCancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* User Profile Modal */}
      <UserProfileModal visible={profileOpen} onClose={() => setProfileOpen(false)} title={title} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sidebarInner: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  sidebarHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  sidebarLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  sidebarLogo: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.glow,
  },
  sidebarLogoText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.extrabold,
    color: colors.primaryDark,
    letterSpacing: 0.5,
  },
  sidebarBrandText: {
    flexDirection: 'column',
  },
  sidebarBrandTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.white,
    letterSpacing: 0.5,
  },
  sidebarBrandSub: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    marginTop: 1,
  },
  sidebarSectionLabel: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  sidebarSectionText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.accent,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  navList: {
    flex: 1,
    paddingTop: spacing.xs,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.sm,
    borderRadius: radius.md,
    marginBottom: 2,
  },
  navItemActive: {
    backgroundColor: 'rgba(50, 130, 184, 0.25)',
  },
  navActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginRight: spacing.sm + 2,
  },
  navItemText: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: fontWeight.medium,
  },
  navItemTextActive: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
  sidebarFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    gap: spacing.sm,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  userAvatarText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  userRole: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    marginTop: 1,
  },
  logoutIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(229, 72, 77, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIcon: {
    fontSize: fontSize.md,
    color: colors.danger,
    fontWeight: fontWeight.bold,
  },
  switchRoleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(50, 130, 184, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchRoleIcon: {
    fontSize: fontSize.md,
    color: colors.accent,
    fontWeight: fontWeight.bold,
  },
  roleOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  roleModal: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.xl,
  },
  roleModalTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
  },
  roleModalSub: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  roleList: {
    maxHeight: 320,
  },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
    backgroundColor: colors.background,
  },
  roleItemActive: {
    backgroundColor: colors.primaryLight,
  },
  roleItemText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  roleItemTextActive: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
  roleItemCheck: {
    fontSize: fontSize.md,
    color: colors.accent,
    fontWeight: fontWeight.bold,
  },
  roleCancelBtn: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  roleCancelText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  header: {
    height: layout.headerHeight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadows.sm,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    flex: 1,
    marginLeft: spacing.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  content: {
    flex: 1,
  },
  hamburger: {
    padding: spacing.xs,
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: 44,
    height: 44,
    borderRadius: radius.md,
  },
  hamburgerLine: {
    width: 22,
    height: 2.5,
    backgroundColor: colors.text,
    borderRadius: 2,
    marginVertical: 2.5,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    flexDirection: 'row',
  },
  sidebarDrawer: {
    width: layout.sidebarWidth,
    height: '100%',
    backgroundColor: colors.primaryDark,
    ...shadows.xl,
  },
});
