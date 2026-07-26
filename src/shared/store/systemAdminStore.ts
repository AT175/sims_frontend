import { create } from 'zustand';
import type { RoleId } from '@shared/types';
import { apiClient } from '@shared/api/apiClient';

// ── Types ──

export type UserStatus = 'Active' | 'Suspended' | 'Locked' | 'Inactive';
export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
export type BackupStatus = 'Success' | 'Failed' | 'In Progress';
export type SyncHealthStatus = 'Healthy' | 'Degraded' | 'Offline';

export interface SystemUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  roles: RoleId[];
  status: UserStatus;
  lastLogin: string | null;
  createdAt: string;
  tenantId: string;
  failedAttempts: number;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: string;
  message: string;
  user?: string;
}

export interface TenantConfig {
  id: string;
  schoolName: string;
  schoolCode: string;
  region: string;
  district: string;
  address: string;
  phone: string;
  email: string;
  logoUrl: string | null;
  academicYear: string;
  term: string;
  maxStudents: number;
  maxStaff: number;
  subscriptionPlan: 'Basic' | 'Standard' | 'Premium';
  subscriptionExpiry: string;
  enabledModules: string[];
}

export interface BackupRecord {
  id: string;
  timestamp: string;
  type: 'Auto' | 'Manual';
  size: string;
  status: BackupStatus;
  performedBy: string;
}

export interface ModuleStatus {
  id: string;
  name: string;
  enabled: boolean;
  version: string;
  lastUpdated: string;
  health: SyncHealthStatus;
}

export interface DatabaseHealth {
  status: SyncHealthStatus;
  connectionLatency: string;
  activeConnections: number;
  totalRecords: number;
  lastSync: string;
  pendingChanges: number;
  failedSyncs: number;
  storageUsed: string;
}

// ── Initial Data ──

const INITIAL_TENANT: TenantConfig = {
  id: 'tenant-001',
  schoolName: 'Ghana Senior High School',
  schoolCode: 'GSHS-001',
  region: 'Greater Accra',
  district: 'Accra Metropolitan',
  address: 'P.O. Box 1234, Accra',
  phone: '+233 30 255 0123',
  email: 'info@gshs.edu.gh',
  logoUrl: null,
  academicYear: '2026/2027',
  term: 'Term 1',
  maxStudents: 2000,
  maxStaff: 150,
  subscriptionPlan: 'Premium',
  subscriptionExpiry: '2027-12-31',
  enabledModules: ['Academic', 'Bursary', 'Registry', 'Admissions', 'Boarding', 'Health', 'Transport', 'Catering', 'Security', 'Library', 'Sports', 'PTA', 'Counselling'],
};

const INITIAL_BACKUPS: BackupRecord[] = [];

const INITIAL_MODULES: ModuleStatus[] = [];

const INITIAL_DB_HEALTH: DatabaseHealth = {
  status: 'Healthy',
  connectionLatency: '12ms',
  activeConnections: 8,
  totalRecords: 12453,
  lastSync: '2026-07-13 09:05:18',
  pendingChanges: 0,
  failedSyncs: 1,
  storageUsed: '2.4 GB',
};

// ── Store ──

export interface SystemAdminState {
  users: SystemUser[];
  logs: SystemLog[];
  tenant: TenantConfig;
  backups: BackupRecord[];
  modules: ModuleStatus[];
  dbHealth: DatabaseHealth;

  loadUsers: (tenantId?: string) => Promise<void>;
  addUser: (user: Omit<SystemUser, 'id' | 'createdAt' | 'lastLogin' | 'failedAttempts'>) => Promise<any>;
  updateUserStatus: (id: string, status: UserStatus) => void;
  updateUserRoles: (id: string, roles: RoleId[]) => void;
  deleteUser: (id: string) => void;
  resetUserPassword: (id: string, newPassword?: string) => Promise<any>;
  unlockUser: (id: string) => void;

  updateTenant: (config: Partial<TenantConfig>) => void;
  saveTenantConfig: () => Promise<void>;
  loadTenantFromBackend: (tenantKey: string) => Promise<void>;
  _tenantsCache: any[] | null;
  _tenantsCacheTime: number;
  _isSavingTenant: boolean;
  _getTenantsCached: () => Promise<any[]>;

  addLog: (log: Omit<SystemLog, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;

  createBackup: (performedBy: string) => void;

  toggleModule: (id: string) => void;
}

const todayISO = () => new Date().toISOString().slice(0, 10);
const nowISO = () => new Date().toISOString().replace('T', ' ').slice(0, 19);

export const useSystemAdminStore = create<SystemAdminState>((set, get) => ({
  users: [],
  logs: [],
  tenant: INITIAL_TENANT,
  backups: INITIAL_BACKUPS,
  modules: INITIAL_MODULES,
  dbHealth: INITIAL_DB_HEALTH,
  _tenantsCache: null,
  _tenantsCacheTime: 0,
  _isSavingTenant: false,

  loadUsers: async (tenantId?: string) => {
    try {
      const path = tenantId ? `/auth/users?tenantId=${tenantId}` : '/auth/users';
      const apiUsers = await apiClient.get<any[]>(path);
      const mapped: SystemUser[] = (apiUsers || []).map((u) => ({
        id: u.id,
        username: u.username,
        displayName: u.displayName,
        email: u.email || '',
        roles: (u.roles || []) as RoleId[],
        status: u.lockedUntil && new Date(u.lockedUntil) > new Date() ? 'Locked' : 'Active',
        lastLogin: null,
        createdAt: u.createdAt ? new Date(u.createdAt).toISOString().slice(0, 10) : todayISO(),
        tenantId: u.tenantId || '',
        failedAttempts: u.failedLoginAttempts || 0,
      }));
      set({ users: mapped });
    } catch (err: any) {
      set((st) => ({
        logs: [{ id: String(get().logs.length + 1), timestamp: nowISO(), level: 'ERROR', source: 'User Management', message: `Failed to load users: ${err.message}`, user: 'admin' }, ...st.logs],
      }));
    }
  },
  addUser: async (user) => {
    try {
      const payload: Record<string, unknown> = {
        username: user.username,
        displayName: user.displayName,
        roles: user.roles,
        tenantId: user.tenantId,
      };
      if ((user as any).password && (user as any).password.trim()) {
        payload.password = (user as any).password.trim();
      }
      if (user.email && user.email.trim()) {
        payload.email = user.email.trim();
      }
      const created = await apiClient.post<any>('/auth/users', payload);
      const id = created.id || String(get().users.length + 1);
      set((st) => ({
        users: [...st.users, { ...user, id, createdAt: todayISO(), lastLogin: null, failedAttempts: 0 }],
        logs: [{ id: String(get().logs.length + 1), timestamp: nowISO(), level: 'INFO', source: 'User Management', message: `User ${user.username} created by admin`, user: 'admin' }, ...st.logs],
      }));
      await get().loadUsers(user.tenantId);
      return created;
    } catch (err: any) {
      set((st) => ({
        logs: [{ id: String(get().logs.length + 1), timestamp: nowISO(), level: 'ERROR', source: 'User Management', message: `Failed to create user ${user.username}: ${err.message}`, user: 'admin' }, ...st.logs],
      }));
      throw err;
    }
  },  updateUserStatus: (id, status) => {
    set((st) => ({
      users: st.users.map((u) => (u.id === id ? { ...u, status } : u)),
      logs: [{ id: String(get().logs.length + 1), timestamp: nowISO(), level: 'INFO', source: 'User Management', message: `User ${st.users.find((u) => u.id === id)?.username} status changed to ${status}`, user: 'admin' }, ...st.logs],
    }));
  },

  updateUserRoles: (id, roles) => {
    set((st) => ({
      users: st.users.map((u) => (u.id === id ? { ...u, roles } : u)),
      logs: [{ id: String(get().logs.length + 1), timestamp: nowISO(), level: 'INFO', source: 'User Management', message: `User ${st.users.find((u) => u.id === id)?.username} roles updated`, user: 'admin' }, ...st.logs],
    }));
  },

  deleteUser: (id) => {
    const username = get().users.find((u) => u.id === id)?.username || 'unknown';
    set((st) => ({
      users: st.users.filter((u) => u.id !== id),
      logs: [{ id: String(get().logs.length + 1), timestamp: nowISO(), level: 'WARN', source: 'User Management', message: `User ${username} deleted by admin`, user: 'admin' }, ...st.logs],
    }));
  },

  resetUserPassword: async (id, newPassword?) => {
    const username = get().users.find((u) => u.id === id)?.username || 'unknown';
    try {
      const payload: Record<string, unknown> = {};
      if (newPassword && newPassword.trim()) {
        payload.newPassword = newPassword.trim();
      }
      const result = await apiClient.post<any>(`/auth/users/${id}/reset-password`, payload);
      set((st) => ({
        users: st.users.map((u) => (u.id === id ? { ...u, failedAttempts: 0, status: u.status === 'Locked' ? 'Active' : u.status } : u)),
        logs: [{ id: String(get().logs.length + 1), timestamp: nowISO(), level: 'INFO', source: 'User Management', message: `Password reset for user ${username}`, user: 'admin' }, ...st.logs],
      }));
      return result;
    } catch (err: any) {
      set((st) => ({
        logs: [{ id: String(get().logs.length + 1), timestamp: nowISO(), level: 'ERROR', source: 'User Management', message: `Failed to reset password for ${username}: ${err.message}`, user: 'admin' }, ...st.logs],
      }));
      throw err;
    }
  },

  unlockUser: (id) => {
    const username = get().users.find((u) => u.id === id)?.username || 'unknown';
    set((st) => ({
      users: st.users.map((u) => (u.id === id ? { ...u, status: 'Active', failedAttempts: 0 } : u)),
      logs: [{ id: String(get().logs.length + 1), timestamp: nowISO(), level: 'INFO', source: 'User Management', message: `User ${username} unlocked by admin`, user: 'admin' }, ...st.logs],
    }));
  },

  updateTenant: (config) => {
    set((st) => ({
      tenant: { ...st.tenant, ...config },
    }));
  },

  _getTenantsCached: async () => {
    const now = Date.now();
    const cache = get()._tenantsCache;
    const cacheTime = get()._tenantsCacheTime;
    // Use cache if it's less than 60 seconds old
    if (cache && (now - cacheTime) < 60000) {
      return cache;
    }
    const tenants = await apiClient.getTenants();
    set({ _tenantsCache: tenants, _tenantsCacheTime: now });
    return tenants;
  },

  saveTenantConfig: async () => {
    const t = get().tenant;
    if (get()._isSavingTenant) throw new Error('Already saving. Please wait...');
    set({ _isSavingTenant: true });
    try {
      // Find the tenant in the backend by its key (stored as id in the local config)
      const tenants = await get()._getTenantsCached();
      const backendTenant = tenants.find((bt: any) => bt.tenantKey === t.id);
      if (backendTenant) {
        await apiClient.updateTenant(backendTenant.id, {
          schoolName: t.schoolName,
          schoolCode: t.schoolCode,
          region: t.region,
          district: t.district,
          address: t.address,
          phone: t.phone,
          email: t.email,
          academicYear: t.academicYear,
          term: t.term,
          maxStudents: t.maxStudents,
          maxStaff: t.maxStaff,
          subscriptionPlan: t.subscriptionPlan,
          subscriptionExpiry: t.subscriptionExpiry,
        });
      }
      // Invalidate cache after update
      set({ _tenantsCache: null, _tenantsCacheTime: 0 });
      set((st) => ({
        logs: [{ id: String(get().logs.length + 1), timestamp: nowISO(), level: 'INFO', source: 'System Config', message: `Tenant configuration saved to backend`, user: 'admin' }, ...st.logs],
      }));
    } catch (err: any) {
      set((st) => ({
        logs: [{ id: String(get().logs.length + 1), timestamp: nowISO(), level: 'ERROR', source: 'System Config', message: `Failed to save tenant config: ${err.message}`, user: 'admin' }, ...st.logs],
      }));
      throw err;
    } finally {
      set({ _isSavingTenant: false });
    }
  },

  loadTenantFromBackend: async (tenantKey: string) => {
    try {
      const tenants = await get()._getTenantsCached();
      const bt = tenants.find((t: any) => t.tenantKey === tenantKey);
      if (bt) {
        set({
          tenant: {
            id: bt.tenantKey,
            schoolName: bt.schoolName || '',
            schoolCode: bt.schoolCode || '',
            region: bt.region || '',
            district: bt.district || '',
            address: bt.address || '',
            phone: bt.phone || '',
            email: bt.email || '',
            logoUrl: bt.logoUrl || null,
            academicYear: bt.academicYear || '',
            term: bt.term || '',
            maxStudents: bt.maxStudents || 2000,
            maxStaff: bt.maxStaff || 150,
            subscriptionPlan: bt.subscriptionPlan || 'Standard',
            subscriptionExpiry: bt.subscriptionExpiry || '',
            enabledModules: bt.enabledModules || [],
          },
        });
      }
    } catch (err: any) {
      console.error('[SystemAdminStore] Failed to load tenant from backend:', err.message);
    }
  },

  addLog: (log) => {
    set((st) => ({
      logs: [{ ...log, id: String(get().logs.length + 1), timestamp: nowISO() }, ...st.logs],
    }));
  },

  clearLogs: () => {
    set({ logs: [] });
  },

  createBackup: (performedBy) => {
    const size = `${(44 + Math.random() * 2).toFixed(1)} MB`;
    set((st) => ({
      backups: [{ id: String(get().backups.length + 1), timestamp: nowISO(), type: 'Manual', size, status: 'Success', performedBy }, ...st.backups],
      logs: [{ id: String(get().logs.length + 1), timestamp: nowISO(), level: 'INFO', source: 'Backup', message: `Manual backup created - ${size}`, user: performedBy }, ...st.logs],
    }));
  },

  toggleModule: (id) => {
    set((st) => ({
      modules: st.modules.map((m) => (m.id === id ? { ...m, enabled: !m.enabled, health: !m.enabled ? 'Healthy' : 'Offline' } : m)),
      logs: [{ id: String(get().logs.length + 1), timestamp: nowISO(), level: 'INFO', source: 'Modules', message: `Module ${st.modules.find((m) => m.id === id)?.name} ${st.modules.find((m) => m.id === id)?.enabled ? 'disabled' : 'enabled'}`, user: 'admin' }, ...st.logs],
    }));
  },
}));
