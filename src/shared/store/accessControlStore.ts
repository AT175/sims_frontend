import { create } from 'zustand';
import type { NavItem } from '@shared/components/DashboardLayout';
import { useNotificationStore } from './notificationStore';

export interface PageAccessGrant {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  dashboardKey: string;
  dashboardLabel: string;
  allowedPages: string[] | 'all';
  grantedBy: string;
  grantedAt: string;
}

export interface AccessActivity {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  dashboardKey: string;
  dashboardLabel: string;
  pageKey: string;
  pageLabel: string;
  action: string;
  timestamp: string;
}

export interface AccessNotification {
  id: string;
  userId: string;
  displayName: string;
  dashboardKey: string;
  dashboardLabel: string;
  pageKey: string;
  pageLabel: string;
  message: string;
  timestamp: string;
  read: boolean;
  forRole: string;
}

interface AccessControlState {
  grants: PageAccessGrant[];
  activities: AccessActivity[];
  notifications: AccessNotification[];
  assignAccess: (grant: Omit<PageAccessGrant, 'id' | 'grantedAt'>) => void;
  revokeAccess: (id: string) => void;
  revokeAllForUser: (userId: string) => void;
  getGrantsForUser: (userId: string) => PageAccessGrant[];
  getGrantForUserDashboard: (userId: string, dashboardKey: string) => PageAccessGrant | undefined;
  getFilteredNavItems: (userId: string, dashboardKey: string, allNavItems: NavItem[]) => NavItem[];
  getAssignedDashboardRoles: (userId: string) => string[];
  getAssigneesForDashboard: (dashboardKey: string) => PageAccessGrant[];
  logActivity: (activity: Omit<AccessActivity, 'id' | 'timestamp'>) => void;
  getActivitiesForDashboard: (dashboardKey: string) => AccessActivity[];
  getActivitiesForUser: (userId: string) => AccessActivity[];
  getNotificationsForRole: (role: string) => AccessNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (role: string) => void;
}

const nowISO = () => new Date().toISOString();

export const useAccessControlStore = create<AccessControlState>((set, get) => ({
  grants: [],
  activities: [],
  notifications: [],

  assignAccess: (grant) => {
    const existing = get().grants.find(
      (g) => g.userId === grant.userId && g.dashboardKey === grant.dashboardKey
    );
    if (existing) {
      set((st) => ({
        grants: st.grants.map((g) =>
          g.id === existing.id
            ? { ...g, allowedPages: grant.allowedPages, grantedBy: grant.grantedBy, grantedAt: nowISO() }
            : g
        ),
      }));
    } else {
      const id = String(get().grants.length + 1);
      set((st) => ({
        grants: [...st.grants, { ...grant, id, grantedAt: nowISO() }],
      }));
    }

    // Generate notification for the role that owns this dashboard
    useNotificationStore.getState().addNotification({
      title: 'Dashboard access assigned',
      message: `${grant.displayName} has been assigned to ${grant.dashboardLabel}`,
      type: 'info',
    });

    const dashDef = getDashboardDef(grant.dashboardKey);
    if (dashDef) {
      const notifId = String(get().notifications.length + 1);
      const pagesLabel = grant.allowedPages === 'all'
        ? 'all pages'
        : `${grant.allowedPages.length} page(s)`;
      set((st) => ({
        notifications: [{
          id: notifId,
          userId: grant.userId,
          displayName: grant.displayName,
          dashboardKey: grant.dashboardKey,
          dashboardLabel: grant.dashboardLabel,
          pageKey: grant.allowedPages === 'all' ? 'all' : grant.allowedPages[0] ?? '',
          pageLabel: pagesLabel,
          message: `${grant.displayName} has been assigned to ${grant.dashboardLabel} (${pagesLabel})`,
          timestamp: nowISO(),
          read: false,
          forRole: dashDef.role,
        }, ...st.notifications],
      }));
    }
  },

  revokeAccess: (id) => {
    const grant = get().grants.find((g) => g.id === id);
    set((st) => ({ grants: st.grants.filter((g) => g.id !== id) }));
    if (grant) {
      useNotificationStore.getState().addNotification({
        title: 'Dashboard access revoked',
        message: `${grant.displayName}'s access to ${grant.dashboardLabel} has been revoked`,
        type: 'warning',
      });
    }
  },

  revokeAllForUser: (userId) => {
    set((st) => ({ grants: st.grants.filter((g) => g.userId !== userId) }));
  },

  getGrantsForUser: (userId) => {
    return get().grants.filter((g) => g.userId === userId);
  },

  getGrantForUserDashboard: (userId, dashboardKey) => {
    return get().grants.find((g) => g.userId === userId && g.dashboardKey === dashboardKey);
  },

  getFilteredNavItems: (userId, dashboardKey, allNavItems) => {
    const grant = get().grants.find((g) => g.userId === userId && g.dashboardKey === dashboardKey);
    if (!grant) return allNavItems;
    if (grant.allowedPages === 'all') return allNavItems;
    return allNavItems.filter((item) => grant.allowedPages.includes(item.key));
  },

  getAssignedDashboardRoles: (userId) => {
    return get().grants
      .filter((g) => g.userId === userId)
      .map((g) => g.dashboardKey);
  },

  getAssigneesForDashboard: (dashboardKey) => {
    return get().grants.filter((g) => g.dashboardKey === dashboardKey);
  },

  logActivity: (activity) => {
    const id = String(get().activities.length + 1);
    set((st) => ({
      activities: [{ ...activity, id, timestamp: nowISO() }, ...st.activities].slice(0, 200),
    }));
    useNotificationStore.getState().addNotification({
      title: 'Activity logged',
      message: `${activity.displayName} ${activity.action} on ${activity.pageLabel}`,
      type: 'system',
    });
  },

  getActivitiesForDashboard: (dashboardKey) => {
    return get().activities.filter((a) => a.dashboardKey === dashboardKey);
  },

  getActivitiesForUser: (userId) => {
    return get().activities.filter((a) => a.userId === userId);
  },

  getNotificationsForRole: (role) => {
    return get().notifications.filter((n) => n.forRole === role);
  },

  markNotificationRead: (id) => {
    set((st) => ({
      notifications: st.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
    }));
  },

  markAllNotificationsRead: (role) => {
    set((st) => ({
      notifications: st.notifications.map((n) => n.forRole === role ? { ...n, read: true } : n),
    }));
  },
}));

// Helper to get dashboard role from dashboardKey without circular import
let _dashboardDefCache: Record<string, { role: string }> | null = null;
function getDashboardDef(key: string): { role: string } | undefined {
  if (!_dashboardDefCache) {
    // Lazy load to avoid circular dependency
    try {
      const catalog = require('@shared/navigation/dashboardCatalog');
      _dashboardDefCache = catalog.DASHBOARD_MAP;
    } catch {
      return undefined;
    }
  }
  const cache = _dashboardDefCache;
  return cache ? cache[key] : undefined;
}
