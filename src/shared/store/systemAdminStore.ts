import { create } from 'zustand';
import type { RoleId } from '@shared/types';

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

const INITIAL_USERS: SystemUser[] = [
  { id: '1', username: 'admin', displayName: 'System Administrator', email: 'admin@sims.edu', roles: ['system_admin'], status: 'Active', lastLogin: '2026-07-13 08:45', createdAt: '2026-01-01', tenantId: 'tenant_001', failedAttempts: 0 },
  { id: '2', username: 'headmaster', displayName: 'John Mensah', email: 'headmaster@sims.edu', roles: ['headmaster'], status: 'Active', lastLogin: '2026-07-13 07:30', createdAt: '2026-01-05', tenantId: 'tenant_001', failedAttempts: 0 },
  { id: '3', username: 'bursar', displayName: 'Sarah Owusu', email: 'bursar@sims.edu', roles: ['bursary'], status: 'Active', lastLogin: '2026-07-12 16:20', createdAt: '2026-01-05', tenantId: 'tenant_001', failedAttempts: 0 },
  { id: '4', username: 'registrar', displayName: 'Michael Boateng', email: 'registrar@sims.edu', roles: ['registry'], status: 'Active', lastLogin: '2026-07-13 09:00', createdAt: '2026-01-06', tenantId: 'tenant_001', failedAttempts: 0 },
  { id: '5', username: 'teacher1', displayName: 'Grace Adjei', email: 'gadjei@sims.edu', roles: ['teacher'], status: 'Active', lastLogin: '2026-07-12 15:10', createdAt: '2026-01-10', tenantId: 'tenant_001', failedAttempts: 0 },
  { id: '6', username: 'parent_addo', displayName: 'Mr. Addo', email: 'addo@email.com', roles: ['parent'], status: 'Active', lastLogin: '2026-07-10 14:00', createdAt: '2024-09-12', tenantId: 'tenant_001', failedAttempts: 0 },
  { id: '7', username: 'staff1', displayName: 'Kwame Asante', email: 'kasante@sims.edu', roles: ['staff'], status: 'Suspended', lastLogin: '2026-06-28 10:00', createdAt: '2026-02-01', tenantId: 'tenant_001', failedAttempts: 3 },
  { id: '8', username: 'security1', displayName: 'Daniel Tuffour', email: 'dtuffour@sims.edu', roles: ['security'], status: 'Active', lastLogin: '2026-07-13 06:00', createdAt: '2026-01-15', tenantId: 'tenant_001', failedAttempts: 0 },
  { id: '9', username: 'chaplain', displayName: 'Rev. Emmanuel Mensah', email: 'chaplain@sims.edu', roles: ['chaplain'], status: 'Active', lastLogin: '2026-07-13 07:00', createdAt: '2026-01-08', tenantId: 'tenant_001', failedAttempts: 0 },
];

const INITIAL_LOGS: SystemLog[] = [
  { id: '1', timestamp: '2026-07-13 09:12:34', level: 'INFO', source: 'Auth', message: 'User admin logged in successfully', user: 'admin' },
  { id: '2', timestamp: '2026-07-13 09:05:18', level: 'INFO', source: 'Sync', message: 'Full sync completed - 1,247 records synced', user: 'admin' },
  { id: '3', timestamp: '2026-07-13 08:45:02', level: 'INFO', source: 'Auth', message: 'User registrar logged in successfully', user: 'registrar' },
  { id: '4', timestamp: '2026-07-13 07:30:15', level: 'INFO', source: 'Auth', message: 'User headmaster logged in successfully', user: 'headmaster' },
  { id: '5', timestamp: '2026-07-12 23:00:00', level: 'INFO', source: 'Backup', message: 'Automatic backup completed - 45.2 MB', user: 'system' },
  { id: '6', timestamp: '2026-07-12 18:32:44', level: 'WARN', source: 'Auth', message: 'Failed login attempt for staff1 - 3rd attempt', user: 'staff1' },
  { id: '7', timestamp: '2026-07-12 18:31:20', level: 'WARN', source: 'Auth', message: 'Failed login attempt for staff1 - 2nd attempt', user: 'staff1' },
  { id: '8', timestamp: '2026-07-12 18:30:05', level: 'WARN', source: 'Auth', message: 'Failed login attempt for staff1 - 1st attempt', user: 'staff1' },
  { id: '9', timestamp: '2026-07-12 16:20:33', level: 'INFO', source: 'Auth', message: 'User bursar logged in successfully', user: 'bursar' },
  { id: '10', timestamp: '2026-07-12 14:15:00', level: 'ERROR', source: 'Sync', message: 'Sync failed for device_003 - connection timeout', user: 'system' },
  { id: '11', timestamp: '2026-07-12 12:00:00', level: 'INFO', source: 'System', message: 'Module Academic updated to v2.1.0', user: 'admin' },
  { id: '12', timestamp: '2026-07-11 23:00:00', level: 'INFO', source: 'Backup', message: 'Automatic backup completed - 44.8 MB', user: 'system' },
];

const INITIAL_TENANT: TenantConfig = {
  id: 'tenant_001',
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

const INITIAL_BACKUPS: BackupRecord[] = [
  { id: '1', timestamp: '2026-07-12 23:00:00', type: 'Auto', size: '45.2 MB', status: 'Success', performedBy: 'system' },
  { id: '2', timestamp: '2026-07-11 23:00:00', type: 'Auto', size: '44.8 MB', status: 'Success', performedBy: 'system' },
  { id: '3', timestamp: '2026-07-10 23:00:00', type: 'Auto', size: '44.5 MB', status: 'Success', performedBy: 'system' },
  { id: '4', timestamp: '2026-07-09 14:00:00', type: 'Manual', size: '44.3 MB', status: 'Success', performedBy: 'admin' },
  { id: '5', timestamp: '2026-07-08 23:00:00', type: 'Auto', size: '44.1 MB', status: 'Success', performedBy: 'system' },
];

const INITIAL_MODULES: ModuleStatus[] = [
  { id: '1', name: 'Academic', enabled: true, version: '2.1.0', lastUpdated: '2026-07-12', health: 'Healthy' },
  { id: '2', name: 'Bursary', enabled: true, version: '2.0.5', lastUpdated: '2026-06-28', health: 'Healthy' },
  { id: '3', name: 'Registry', enabled: true, version: '2.1.0', lastUpdated: '2026-07-12', health: 'Healthy' },
  { id: '4', name: 'Admissions', enabled: true, version: '1.5.0', lastUpdated: '2026-07-10', health: 'Healthy' },
  { id: '5', name: 'Boarding', enabled: true, version: '1.8.0', lastUpdated: '2026-06-15', health: 'Healthy' },
  { id: '6', name: 'Health', enabled: true, version: '1.3.0', lastUpdated: '2026-05-20', health: 'Healthy' },
  { id: '7', name: 'Transport', enabled: true, version: '1.2.0', lastUpdated: '2026-05-10', health: 'Degraded' },
  { id: '8', name: 'Catering', enabled: true, version: '1.4.0', lastUpdated: '2026-06-01', health: 'Healthy' },
  { id: '9', name: 'Security', enabled: true, version: '1.6.0', lastUpdated: '2026-06-20', health: 'Healthy' },
  { id: '10', name: 'Library & ICT', enabled: true, version: '1.1.0', lastUpdated: '2026-04-15', health: 'Healthy' },
  { id: '11', name: 'Sports & Clubs', enabled: true, version: '1.0.5', lastUpdated: '2026-03-10', health: 'Healthy' },
  { id: '12', name: 'Counselling', enabled: false, version: '0.9.0', lastUpdated: '2026-02-01', health: 'Offline' },
];

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

  addUser: (user: Omit<SystemUser, 'id' | 'createdAt' | 'lastLogin' | 'failedAttempts'>) => void;
  updateUserStatus: (id: string, status: UserStatus) => void;
  updateUserRoles: (id: string, roles: RoleId[]) => void;
  deleteUser: (id: string) => void;
  resetUserPassword: (id: string) => void;
  unlockUser: (id: string) => void;

  updateTenant: (config: Partial<TenantConfig>) => void;

  addLog: (log: Omit<SystemLog, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;

  createBackup: (performedBy: string) => void;

  toggleModule: (id: string) => void;
}

const todayISO = () => new Date().toISOString().slice(0, 10);
const nowISO = () => new Date().toISOString().replace('T', ' ').slice(0, 19);

export const useSystemAdminStore = create<SystemAdminState>((set, get) => ({
  users: INITIAL_USERS,
  logs: INITIAL_LOGS,
  tenant: INITIAL_TENANT,
  backups: INITIAL_BACKUPS,
  modules: INITIAL_MODULES,
  dbHealth: INITIAL_DB_HEALTH,

  addUser: (user) => {
    const id = String(get().users.length + 1);
    set((st) => ({
      users: [...st.users, { ...user, id, createdAt: todayISO(), lastLogin: null, failedAttempts: 0 }],
      logs: [{ id: String(get().logs.length + 1), timestamp: nowISO(), level: 'INFO', source: 'User Management', message: `User ${user.username} created by admin`, user: 'admin' }, ...st.logs],
    }));
  },

  updateUserStatus: (id, status) => {
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

  resetUserPassword: (id) => {
    const username = get().users.find((u) => u.id === id)?.username || 'unknown';
    set((st) => ({
      users: st.users.map((u) => (u.id === id ? { ...u, failedAttempts: 0, status: u.status === 'Locked' ? 'Active' : u.status } : u)),
      logs: [{ id: String(get().logs.length + 1), timestamp: nowISO(), level: 'INFO', source: 'User Management', message: `Password reset for user ${username}`, user: 'admin' }, ...st.logs],
    }));
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
      logs: [{ id: String(get().logs.length + 1), timestamp: nowISO(), level: 'INFO', source: 'System Config', message: `Tenant configuration updated`, user: 'admin' }, ...st.logs],
    }));
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
