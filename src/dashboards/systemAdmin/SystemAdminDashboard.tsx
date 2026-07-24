import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput, Alert } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid, DataTable } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useAuthStore } from '@store/authStore';
import { apiClient } from '@shared/api/apiClient';
import { useSystemAdminStore } from '@store/systemAdminStore';
import type { SystemUser, UserStatus } from '@store/systemAdminStore';
import { ROLE_LABELS } from '@shared/navigation/roleMap';
import type { RoleId } from '@shared/types';

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'System Overview' },
  { key: 'users', label: 'User Management' },
  { key: 'tenants', label: 'Tenants (Schools)' },
  { key: 'tenant', label: 'School Configuration' },
  { key: 'modules', label: 'Modules' },
  { key: 'database', label: 'Database & Sync' },
  { key: 'backups', label: 'Backups' },
  { key: 'logs', label: 'System Logs' },
];

const ALL_ROLES = Object.keys(ROLE_LABELS) as RoleId[];

const STATUS_COLORS: Record<UserStatus, string> = {
  'Active': colors.success,
  'Suspended': colors.warning,
  'Locked': colors.danger,
  'Inactive': colors.textLight,
};

export function SystemAdminDashboard() {
  const [activePage, setActivePage] = useState('overview');
  const { logout, user } = useAuthStore();
  const store = useSystemAdminStore();

  const [connStatus, setConnStatus] = useState<{ ok: boolean | null; message: string }>({ ok: null, message: 'Checking...' });

  useEffect(() => {
    apiClient.healthCheck().then(setConnStatus);
  }, []);

  useEffect(() => {
    if (user?.tenantId) {
      store.loadTenantFromBackend(user.tenantId);
      // Also fetch the headmaster for this tenant
      apiClient.getTenants().then(async (allTenants: any[]) => {
        const bt = allTenants.find((t) => t.tenantKey === user.tenantId);
        if (bt) {
          try {
            const hm = await apiClient.get<any>(`/auth/users/${bt.id}/headmaster`);
            if (hm) {
              setHeadmasterForm({ headmasterId: hm.id, username: hm.username, displayName: hm.displayName, password: '' });
            }
          } catch {
            // No headmaster found — leave form empty
            setHeadmasterForm({ headmasterId: '', username: '', displayName: '', password: '' });
          }
        }
      }).catch(() => {});
    }
  }, [user?.tenantId]);

  // User modal state
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [userForm, setUserForm] = useState({ username: '', displayName: '', email: '', password: '', roles: [] as RoleId[], tenantId: '' });

  // Tenant management state
  const [tenants, setTenants] = useState<any[]>([]);
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [isSavingTenant, setIsSavingTenant] = useState(false);
  const [tenantError, setTenantError] = useState<string | null>(null);
  const [tenantForm, setTenantForm] = useState({
    tenantKey: '',
    schoolName: '',
    schoolCode: '',
    region: '',
    district: '',
    address: '',
    phone: '',
    email: '',
    maxStudents: '2000',
    maxStaff: '150',
    subscriptionPlan: 'Standard',
    subscriptionExpiry: '',
    headmasterUsername: '',
    headmasterPassword: '',
    headmasterDisplayName: '',
  });

  const fetchTenants = async () => {
    try {
      const data = await apiClient.getTenants();
      setTenants(data);
    } catch (err: any) {
      console.error('[SystemAdmin] Failed to fetch tenants:', err.message);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  // Reset password modal state
  const [resetUser, setResetUser] = useState<SystemUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);

  // Headmaster edit state (for School Configuration page)
  const [headmasterForm, setHeadmasterForm] = useState({ headmasterId: '', username: '', displayName: '', password: '' });
  const [isSavingHeadmaster, setIsSavingHeadmaster] = useState(false);
  const [headmasterError, setHeadmasterError] = useState<string | null>(null);

  // Tenant filter for user management
  const [tenantFilter, setTenantFilter] = useState<string>('all');

  const handleAddUser = () => {
    setEditingUser(null);
    setUserForm({ username: '', displayName: '', email: '', password: '', roles: [], tenantId: tenants[0]?.tenantKey || user?.tenantId || '' });
    setUserError(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user: SystemUser) => {
    setEditingUser(user);
    setUserForm({ username: user.username, displayName: user.displayName, email: user.email, password: '', roles: [...user.roles], tenantId: user.tenantId || '' });
    setUserError(null);
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    if (!userForm.username.trim() || !userForm.displayName.trim()) {
      setUserError('Username and display name are required');
      return;
    }
    if (!editingUser && !userForm.password.trim()) {
      setUserError('Password is required for new users');
      return;
    }
    if (editingUser) {
      store.updateUserRoles(editingUser.id, userForm.roles);
      Alert.alert('Success', 'User updated successfully');
      setShowUserModal(false);
    } else {
      setIsSavingUser(true);
      setUserError(null);
      try {
        await store.addUser({
          username: userForm.username.trim(),
          displayName: userForm.displayName.trim(),
          email: userForm.email.trim(),
          roles: userForm.roles.length > 0 ? userForm.roles : ['staff'],
          status: 'Active',
          tenantId: userForm.tenantId || user?.tenantId || store.tenant.id,
          password: userForm.password,
        } as any);
        setShowUserModal(false);
        Alert.alert('Success', 'User created successfully');
      } catch (err: any) {
        setUserError(err.message || 'Failed to create user');
      } finally {
        setIsSavingUser(false);
      }
    }
  };

  const handleToggleRole = (role: RoleId) => {
    setUserForm((f) => ({
      ...f,
      roles: f.roles.includes(role) ? f.roles.filter((r) => r !== role) : [...f.roles, role],
    }));
  };

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return (
          <ScrollView>
            <Text style={styles.pageTitle}>System Overview</Text>
            <Text style={styles.pageSubtitle}>Monitor system health and key metrics</Text>

            <View style={[styles.connBanner, { backgroundColor: (connStatus.ok === null ? colors.info : connStatus.ok ? colors.success : colors.danger) + '15' }]}>
              <Text style={[styles.connBannerText, { color: connStatus.ok === null ? colors.info : connStatus.ok ? colors.success : colors.danger }]}>
                {connStatus.ok === null ? '⏳ Checking backend...' : connStatus.ok ? '✓ Backend connected' : '✗ Backend unreachable'}
              </Text>
              <Text style={styles.connBannerSub}>{connStatus.message}</Text>
            </View>

            <CardGrid>
              <StatCard label="Total Users" value={store.users.length} accentColor={colors.primary} icon="👤" />
              <StatCard label="Active Users" value={store.users.filter((u) => u.status === 'Active').length} accentColor={colors.success} icon="✓" />
              <StatCard label="Suspended" value={store.users.filter((u) => u.status === 'Suspended').length} accentColor={colors.warning} icon="⚠" />
              <StatCard label="Locked" value={store.users.filter((u) => u.status === 'Locked').length} accentColor={colors.danger} icon="🔒" />
            </CardGrid>

            <CardGrid>
              <StatCard label="DB Status" value={store.dbHealth.status} accentColor={store.dbHealth.status === 'Healthy' ? colors.success : colors.warning} icon="🗄" />
              <StatCard label="Total Records" value={store.dbHealth.totalRecords.toLocaleString()} accentColor={colors.info} icon="📊" />
              <StatCard label="Storage Used" value={store.dbHealth.storageUsed} accentColor={colors.primary} icon="💾" />
              <StatCard label="Pending Syncs" value={store.dbHealth.pendingChanges} accentColor={store.dbHealth.pendingChanges > 0 ? colors.warning : colors.success} icon="🔄" />
            </CardGrid>

            <CardGrid>
              <StatCard label="Enabled Modules" value={store.modules.filter((m) => m.enabled).length} accentColor={colors.success} icon="📦" />
              <StatCard label="Disabled Modules" value={store.modules.filter((m) => !m.enabled).length} accentColor={colors.textLight} icon="📦" />
              <StatCard label="Subscription" value={store.tenant.subscriptionPlan} accentColor={colors.primary} icon="⭐" />
              <StatCard label="Backups" value={store.backups.length} accentColor={colors.info} icon="🗃" />
            </CardGrid>

            <Text style={styles.sectionTitle}>Recent System Logs</Text>
            {store.logs.slice(0, 5).map((log) => (
              <View key={log.id} style={styles.logRow}>
                <View style={[styles.logBadge, { backgroundColor: (log.level === 'ERROR' ? colors.danger : log.level === 'WARN' ? colors.warning : log.level === 'DEBUG' ? colors.textLight : colors.info) + '20' }]}>
                  <Text style={[styles.logLevel, { color: log.level === 'ERROR' ? colors.danger : log.level === 'WARN' ? colors.warning : log.level === 'DEBUG' ? colors.textLight : colors.info }]}>{log.level}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.logMessage}>{log.message}</Text>
                  <Text style={styles.logMeta}>{log.timestamp} · {log.source}{log.user ? ` · ${log.user}` : ''}</Text>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.viewAllBtn} onPress={() => setActivePage('logs')}>
              <Text style={styles.viewAllBtnText}>View All Logs →</Text>
            </TouchableOpacity>
          </ScrollView>
        );

      case 'users':
        return (
          <ScrollView>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.pageTitle}>User Management</Text>
                <Text style={styles.pageSubtitle}>Create and manage system users and their roles</Text>
              </View>
              <TouchableOpacity style={styles.addBtn} onPress={handleAddUser}>
                <Text style={styles.addBtnText}>+ Add User</Text>
              </TouchableOpacity>
            </View>

            <CardGrid>
              <StatCard label="Total" value={store.users.length} accentColor={colors.primary} />
              <StatCard label="Active" value={store.users.filter((u) => u.status === 'Active').length} accentColor={colors.success} />
              <StatCard label="Suspended" value={store.users.filter((u) => u.status === 'Suspended').length} accentColor={colors.warning} />
            </CardGrid>

            <Text style={styles.sectionTitle}>Filter by Tenant</Text>
            <View style={styles.rolePickerRow}>
              <TouchableOpacity
                style={[styles.roleChip, tenantFilter === 'all' && styles.roleChipActive]}
                onPress={() => setTenantFilter('all')}
              >
                <Text style={[styles.roleChipText, tenantFilter === 'all' && styles.roleChipTextActive]}>All ({store.users.length})</Text>
              </TouchableOpacity>
              {tenants.map((t) => {
                const count = store.users.filter((u) => u.tenantId === t.tenantKey).length;
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.roleChip, tenantFilter === t.tenantKey && styles.roleChipActive]}
                    onPress={() => setTenantFilter(t.tenantKey)}
                  >
                    <Text style={[styles.roleChipText, tenantFilter === t.tenantKey && styles.roleChipTextActive]}>{t.schoolName} ({count})</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.sectionTitle}>All Users{tenantFilter !== 'all' ? ` — ${tenants.find((t) => t.tenantKey === tenantFilter)?.schoolName || tenantFilter}` : ''}</Text>
            <DataTable
              columns={[
                { key: 'username', label: 'Username', render: (u: any) => u.username },
                { key: 'displayName', label: 'Name', render: (u: any) => u.displayName },
                { key: 'tenantId', label: 'Tenant', render: (u: any) => tenants.find((t) => t.tenantKey === u.tenantId)?.schoolName || u.tenantId },
                { key: 'roles', label: 'Roles', render: (u: any) => u.roles.map((r: RoleId) => ROLE_LABELS[r]).join(', ') },
                { key: 'status', label: 'Status', render: (u: any) => u.status },
                { key: 'lastLogin', label: 'Last Login', render: (u: any) => u.lastLogin || 'Never' },
              ]}
              data={(tenantFilter === 'all' ? store.users : store.users.filter((u) => u.tenantId === tenantFilter)) as any}
            />

            <Text style={styles.sectionTitle}>User Actions</Text>
            {(tenantFilter === 'all' ? store.users : store.users.filter((u) => u.tenantId === tenantFilter)).map((user) => (
              <View key={user.id} style={styles.userActionRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userActionName}>{user.displayName} ({user.username})</Text>
                  <Text style={[styles.userActionStatus, { color: STATUS_COLORS[user.status] }]}>{user.status}{user.failedAttempts > 0 ? ` · ${user.failedAttempts} failed attempts` : ''}</Text>
                  <Text style={styles.logMeta}>{tenants.find((t) => t.tenantKey === user.tenantId)?.schoolName || user.tenantId}</Text>
                </View>
                <View style={styles.userActionBtns}>
                  <TouchableOpacity style={styles.miniBtn} onPress={() => handleEditUser(user)}>
                    <Text style={styles.miniBtnText}>Edit</Text>
                  </TouchableOpacity>
                  {user.status === 'Locked' && (
                    <TouchableOpacity style={styles.miniApproveBtn} onPress={() => store.unlockUser(user.id)}>
                      <Text style={styles.miniApproveBtnText}>Unlock</Text>
                    </TouchableOpacity>
                  )}
                  {user.status === 'Active' ? (
                    <TouchableOpacity style={styles.miniWarnBtn} onPress={() => store.updateUserStatus(user.id, 'Suspended')}>
                      <Text style={styles.miniWarnBtnText}>Suspend</Text>
                    </TouchableOpacity>
                  ) : user.status === 'Suspended' ? (
                    <TouchableOpacity style={styles.miniApproveBtn} onPress={() => store.updateUserStatus(user.id, 'Active')}>
                      <Text style={styles.miniApproveBtnText}>Activate</Text>
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity style={styles.miniBtn} onPress={() => { setResetUser(user); setNewPassword(''); }}>
                    <Text style={styles.miniBtnText}>Reset Pwd</Text>
                  </TouchableOpacity>
                  {user.username !== 'admin' && (
                    <TouchableOpacity style={styles.miniDeleteBtn} onPress={() => {
                      Alert.alert('Confirm Delete', `Delete user "${user.username}"?`, [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => store.deleteUser(user.id) },
                      ]);
                    }}>
                      <Text style={styles.miniDeleteBtnText}>Delete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        );

      case 'tenants':
        return (
          <ScrollView>
            <Text style={styles.pageTitle}>Tenants (Schools)</Text>
            <Text style={styles.pageSubtitle}>Create and manage school tenants in the system</Text>

            <TouchableOpacity style={styles.addBtn} onPress={() => {
              setTenantForm({ tenantKey: '', schoolName: '', schoolCode: '', region: '', district: '', address: '', phone: '', email: '', maxStudents: '2000', maxStaff: '150', subscriptionPlan: 'Standard', subscriptionExpiry: '', headmasterUsername: '', headmasterPassword: '', headmasterDisplayName: '' });
              setTenantError(null);
              setShowTenantModal(true);
            }}>
              <Text style={styles.addBtnText}>+ Add New Tenant</Text>
            </TouchableOpacity>

            {tenants.length === 0 && (
              <Text style={styles.emptyText}>No tenants found. Create one to get started.</Text>
            )}

            {tenants.map((t) => (
              <View key={t.id} style={styles.userActionRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userActionName}>{t.schoolName}</Text>
                  <Text style={styles.userActionStatus}>{t.tenantKey} · {t.region ?? 'N/A'} · {t.subscriptionPlan}</Text>
                  <Text style={styles.logMeta}>{t.active ? 'Active' : 'Inactive'} · {t.maxStudents} students max · {t.maxStaff} staff max</Text>
                </View>
                <View style={styles.userActionBtns}>
                  <TouchableOpacity style={styles.miniBtn} onPress={() => {
                    Alert.alert('Tenant Info', `School: ${t.schoolName}\nKey: ${t.tenantKey}\nCode: ${t.schoolCode ?? 'N/A'}\nRegion: ${t.region ?? 'N/A'}\nPlan: ${t.subscriptionPlan}\nExpiry: ${t.subscriptionExpiry ?? 'N/A'}\nModules: ${(t.enabledModules ?? []).join(', ') || 'None'}`);
                  }}>
                    <Text style={styles.miniBtnText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.miniApproveBtn} onPress={() => {
                    apiClient.updateTenant(t.id, { active: !t.active }).then(() => fetchTenants()).catch((err) => Alert.alert('Error', err.message));
                  }}>
                    <Text style={styles.miniApproveBtnText}>{t.active ? 'Deactivate' : 'Activate'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.miniDeleteBtn} onPress={() => {
                    Alert.alert('Confirm Delete', `Delete tenant "${t.schoolName}"? This will NOT delete associated users.`, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => {
                        apiClient.deleteTenant(t.id).then(() => fetchTenants()).catch((err) => Alert.alert('Error', err.message));
                      }},
                    ]);
                  }}>
                    <Text style={styles.miniDeleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        );

      case 'tenant':
        return (
          <ScrollView>
            <Text style={styles.pageTitle}>School Configuration</Text>
            <Text style={styles.pageSubtitle}>Manage tenant/school settings, subscription and headmaster</Text>

            <Text style={styles.sectionTitle}>School Information</Text>
            <Text style={styles.inputLabel}>School Name</Text>
            <TextInput style={styles.textInput} value={store.tenant.schoolName} onChangeText={(v) => store.updateTenant({ schoolName: v })} />
            <Text style={styles.inputLabel}>School Code</Text>
            <TextInput style={styles.textInput} value={store.tenant.schoolCode} onChangeText={(v) => store.updateTenant({ schoolCode: v })} />
            <Text style={styles.inputLabel}>Region</Text>
            <TextInput style={styles.textInput} value={store.tenant.region} onChangeText={(v) => store.updateTenant({ region: v })} />
            <Text style={styles.inputLabel}>District</Text>
            <TextInput style={styles.textInput} value={store.tenant.district} onChangeText={(v) => store.updateTenant({ district: v })} />
            <Text style={styles.inputLabel}>Address</Text>
            <TextInput style={styles.textInput} value={store.tenant.address} onChangeText={(v) => store.updateTenant({ address: v })} />
            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput style={styles.textInput} value={store.tenant.phone} onChangeText={(v) => store.updateTenant({ phone: v })} />
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput style={styles.textInput} value={store.tenant.email} onChangeText={(v) => store.updateTenant({ email: v })} />

            <Text style={styles.sectionTitle}>Academic Settings</Text>
            <Text style={styles.inputLabel}>Current Academic Year</Text>
            <TextInput style={styles.textInput} value={store.tenant.academicYear} onChangeText={(v) => store.updateTenant({ academicYear: v })} />
            <Text style={styles.inputLabel}>Current Term</Text>
            <TextInput style={styles.textInput} value={store.tenant.term} onChangeText={(v) => store.updateTenant({ term: v })} />

            <Text style={styles.sectionTitle}>Subscription & Limits</Text>
            <Text style={styles.inputLabel}>Subscription Plan</Text>
            <TextInput style={styles.textInput} value={store.tenant.subscriptionPlan} onChangeText={(v) => store.updateTenant({ subscriptionPlan: v as any })} placeholder="Basic / Standard / Premium" />
            <Text style={styles.inputLabel}>Subscription Expiry</Text>
            <TextInput style={styles.textInput} value={store.tenant.subscriptionExpiry} onChangeText={(v) => store.updateTenant({ subscriptionExpiry: v })} placeholder="2027-12-31" />
            <Text style={styles.inputLabel}>Max Students</Text>
            <TextInput style={styles.textInput} value={String(store.tenant.maxStudents)} onChangeText={(v) => store.updateTenant({ maxStudents: parseInt(v) || 0 })} keyboardType="numeric" />
            <Text style={styles.inputLabel}>Max Staff</Text>
            <TextInput style={styles.textInput} value={String(store.tenant.maxStaff)} onChangeText={(v) => store.updateTenant({ maxStaff: parseInt(v) || 0 })} keyboardType="numeric" />

            <Text style={styles.sectionTitle}>Headmaster Credentials</Text>
            <Text style={styles.autoAssignHint}>Update the headmaster account for this tenant</Text>
            <Text style={styles.inputLabel}>Headmaster Display Name</Text>
            <TextInput style={styles.textInput} value={headmasterForm.displayName} onChangeText={(v) => setHeadmasterForm({ ...headmasterForm, displayName: v })} placeholder="e.g. Mr. John Mensah" />
            <Text style={styles.inputLabel}>Headmaster Username</Text>
            <TextInput style={styles.textInput} value={headmasterForm.username} onChangeText={(v) => setHeadmasterForm({ ...headmasterForm, username: v })} placeholder="e.g. headmaster" autoCapitalize="none" />
            <Text style={styles.inputLabel}>New Password (leave blank to keep current)</Text>
            <TextInput style={styles.textInput} value={headmasterForm.password} onChangeText={(v) => setHeadmasterForm({ ...headmasterForm, password: v })} placeholder="Enter new password" secureTextEntry />

            {headmasterError && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{headmasterError}</Text>
              </View>
            )}

            <TouchableOpacity style={[styles.saveBtn, isSavingHeadmaster && styles.modalApproveBtnDisabled]} disabled={isSavingHeadmaster} onPress={async () => {
              if (!headmasterForm.username.trim() || !headmasterForm.displayName.trim()) {
                setHeadmasterError('Username and display name are required.');
                return;
              }
              setIsSavingHeadmaster(true);
              setHeadmasterError(null);
              try {
                if (headmasterForm.headmasterId) {
                  // Update existing headmaster
                  await apiClient.put(`/auth/users/${headmasterForm.headmasterId}`, {
                    displayName: headmasterForm.displayName.trim(),
                    roles: ['headmaster'],
                  });
                  if (headmasterForm.password.trim()) {
                    await apiClient.post(`/auth/users/${headmasterForm.headmasterId}/reset-password`, { newPassword: headmasterForm.password.trim() });
                  }
                  Alert.alert('Success', 'Headmaster credentials updated.');
                } else {
                  Alert.alert('Info', 'No headmaster found for this tenant. Please create one from the Tenants page.');
                }
              } catch (err: any) {
                setHeadmasterError(err.message || 'Failed to update headmaster.');
              } finally {
                setIsSavingHeadmaster(false);
              }
            }}>
              <Text style={styles.saveBtnText}>{isSavingHeadmaster ? 'Saving...' : 'Update Headmaster'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={async () => {
              try {
                await store.saveTenantConfig();
                Alert.alert('Saved', 'School configuration saved successfully.');
              } catch (err: any) {
                Alert.alert('Error', err.message || 'Failed to save configuration.');
              }
            }}>
              <Text style={styles.saveBtnText}>Save Configuration</Text>
            </TouchableOpacity>
          </ScrollView>
        );

      case 'modules':
        return (
          <ScrollView>
            <Text style={styles.pageTitle}>Module Management</Text>
            <Text style={styles.pageSubtitle}>Enable or disable system modules</Text>

            <CardGrid>
              <StatCard label="Enabled" value={store.modules.filter((m) => m.enabled).length} accentColor={colors.success} />
              <StatCard label="Disabled" value={store.modules.filter((m) => !m.enabled).length} accentColor={colors.textLight} />
              <StatCard label="Degraded" value={store.modules.filter((m) => m.health === 'Degraded').length} accentColor={colors.warning} />
            </CardGrid>

            <Text style={styles.sectionTitle}>All Modules</Text>
            {store.modules.map((mod) => (
              <View key={mod.id} style={styles.moduleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.moduleName}>{mod.name}</Text>
                  <Text style={styles.moduleMeta}>v{mod.version} · Updated {mod.lastUpdated}</Text>
                </View>
                <View style={[styles.healthBadge, { backgroundColor: (mod.health === 'Healthy' ? colors.success : mod.health === 'Degraded' ? colors.warning : colors.danger) + '20' }]}>
                  <Text style={[styles.healthText, { color: mod.health === 'Healthy' ? colors.success : mod.health === 'Degraded' ? colors.warning : colors.danger }]}>{mod.health}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggleBtn, mod.enabled ? styles.toggleBtnOn : styles.toggleBtnOff]}
                  onPress={() => store.toggleModule(mod.id)}
                >
                  <Text style={[styles.toggleBtnText, mod.enabled ? styles.toggleBtnTextOn : styles.toggleBtnTextOff]}>
                    {mod.enabled ? 'ON' : 'OFF'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        );

      case 'database':
        return (
          <ScrollView>
            <Text style={styles.pageTitle}>Database & Sync Health</Text>
            <Text style={styles.pageSubtitle}>Monitor database connections and sync status</Text>

            <CardGrid>
              <StatCard label="Status" value={store.dbHealth.status} accentColor={store.dbHealth.status === 'Healthy' ? colors.success : colors.warning} icon="🗄" />
              <StatCard label="Latency" value={store.dbHealth.connectionLatency} accentColor={colors.info} icon="⚡" />
              <StatCard label="Connections" value={store.dbHealth.activeConnections} accentColor={colors.primary} icon="🔗" />
              <StatCard label="Storage" value={store.dbHealth.storageUsed} accentColor={colors.info} icon="💾" />
            </CardGrid>

            <CardGrid>
              <StatCard label="Total Records" value={store.dbHealth.totalRecords.toLocaleString()} accentColor={colors.primary} icon="📊" />
              <StatCard label="Pending Changes" value={store.dbHealth.pendingChanges} accentColor={store.dbHealth.pendingChanges > 0 ? colors.warning : colors.success} icon="🔄" />
              <StatCard label="Failed Syncs" value={store.dbHealth.failedSyncs} accentColor={store.dbHealth.failedSyncs > 0 ? colors.danger : colors.success} icon="⚠" />
            </CardGrid>

            <Text style={styles.sectionTitle}>Sync Details</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>Last Sync: {store.dbHealth.lastSync}</Text>
              <Text style={styles.infoText}>Connection Latency: {store.dbHealth.connectionLatency}</Text>
              <Text style={styles.infoText}>Active Connections: {store.dbHealth.activeConnections}</Text>
              <Text style={styles.infoText}>Total Records: {store.dbHealth.totalRecords.toLocaleString()}</Text>
              <Text style={styles.infoText}>Pending Changes: {store.dbHealth.pendingChanges}</Text>
              <Text style={styles.infoText}>Failed Syncs: {store.dbHealth.failedSyncs}</Text>
              <Text style={styles.infoText}>Storage Used: {store.dbHealth.storageUsed}</Text>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={() => Alert.alert('Sync Started', 'Manual sync has been initiated.')}>
              <Text style={styles.saveBtnText}>Force Sync Now</Text>
            </TouchableOpacity>
          </ScrollView>
        );

      case 'backups':
        return (
          <ScrollView>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.pageTitle}>Database Backups</Text>
                <Text style={styles.pageSubtitle}>View and create database backups</Text>
              </View>
              <TouchableOpacity style={styles.addBtn} onPress={() => { store.createBackup('admin'); Alert.alert('Success', 'Manual backup created successfully.'); }}>
                <Text style={styles.addBtnText}>+ Backup Now</Text>
              </TouchableOpacity>
            </View>

            <CardGrid>
              <StatCard label="Total Backups" value={store.backups.length} accentColor={colors.primary} />
              <StatCard label="Successful" value={store.backups.filter((b) => b.status === 'Success').length} accentColor={colors.success} />
              <StatCard label="Latest Size" value={store.backups[0]?.size || '—'} accentColor={colors.info} />
            </CardGrid>

            <Text style={styles.sectionTitle}>Backup History</Text>
            <DataTable
              columns={[
                { key: 'timestamp', label: 'Timestamp', render: (b: any) => b.timestamp },
                { key: 'type', label: 'Type', render: (b: any) => b.type },
                { key: 'size', label: 'Size', render: (b: any) => b.size },
                { key: 'status', label: 'Status', render: (b: any) => b.status },
                { key: 'performedBy', label: 'By', render: (b: any) => b.performedBy },
              ]}
              data={store.backups as any}
            />

            <Text style={styles.sectionTitle}>Backup Schedule</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>• Automatic backups run daily at 23:00 GMT</Text>
              <Text style={styles.infoText}>• Backups are retained for 30 days</Text>
              <Text style={styles.infoText}>• Manual backups can be created at any time</Text>
              <Text style={styles.infoText}>• Each backup includes all tenant data</Text>
            </View>
          </ScrollView>
        );

      case 'logs':
        return (
          <ScrollView>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.pageTitle}>System Logs</Text>
                <Text style={styles.pageSubtitle}>View system activity and error logs</Text>
              </View>
              <TouchableOpacity style={styles.miniDeleteBtn} onPress={() => { Alert.alert('Confirm', 'Clear all logs?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Clear', onPress: () => store.clearLogs() }]); }}>
                <Text style={styles.miniDeleteBtnText}>Clear Logs</Text>
              </TouchableOpacity>
            </View>

            <CardGrid>
              <StatCard label="Total Logs" value={store.logs.length} accentColor={colors.primary} />
              <StatCard label="Errors" value={store.logs.filter((l) => l.level === 'ERROR').length} accentColor={colors.danger} />
              <StatCard label="Warnings" value={store.logs.filter((l) => l.level === 'WARN').length} accentColor={colors.warning} />
            </CardGrid>

            <Text style={styles.sectionTitle}>All Logs</Text>
            {store.logs.length === 0 ? (
              <Text style={styles.emptyText}>No logs to display.</Text>
            ) : (
              store.logs.map((log) => (
                <View key={log.id} style={styles.logRow}>
                  <View style={[styles.logBadge, { backgroundColor: (log.level === 'ERROR' ? colors.danger : log.level === 'WARN' ? colors.warning : log.level === 'DEBUG' ? colors.textLight : colors.info) + '20' }]}>
                    <Text style={[styles.logLevel, { color: log.level === 'ERROR' ? colors.danger : log.level === 'WARN' ? colors.warning : log.level === 'DEBUG' ? colors.textLight : colors.info }]}>{log.level}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.logMessage}>{log.message}</Text>
                    <Text style={styles.logMeta}>{log.timestamp} · {log.source}{log.user ? ` · ${log.user}` : ''}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      title="System Administrator"
      navItems={NAV_ITEMS}
      activeKey={activePage}
      onNavigate={setActivePage}
      headerRight={
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      }
    >
      {renderPage()}

      {/* ── User Add/Edit Modal ── */}
      <Modal visible={showUserModal} transparent animationType="fade" onRequestClose={() => setShowUserModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>{editingUser ? 'Edit User' : 'Add New User'}</Text>

              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.textInput}
                value={userForm.username}
                onChangeText={(v) => setUserForm((f) => ({ ...f, username: v }))}
                placeholder="e.g. jdoe"
                editable={!editingUser}
              />

              <Text style={styles.inputLabel}>Display Name</Text>
              <TextInput
                style={styles.textInput}
                value={userForm.displayName}
                onChangeText={(v) => setUserForm((f) => ({ ...f, displayName: v }))}
                placeholder="e.g. John Doe"
              />

              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={userForm.email}
                onChangeText={(v) => setUserForm((f) => ({ ...f, email: v }))}
                placeholder="e.g. jdoe@sims.edu"
                keyboardType="email-address"
              />

              <Text style={styles.inputLabel}>Password{editingUser ? ' (leave blank to keep current)' : ''}</Text>
              <TextInput
                style={styles.textInput}
                value={userForm.password}
                onChangeText={(v) => setUserForm((f) => ({ ...f, password: v }))}
                placeholder="Enter password"
                secureTextEntry
              />

              {!editingUser && (
                <>
                  <Text style={styles.inputLabel}>Tenant (School)</Text>
                  <Text style={styles.autoAssignHint}>Select the school this user belongs to</Text>
                  <View style={styles.rolePickerRow}>
                    {tenants.map((t) => (
                      <TouchableOpacity
                        key={t.id}
                        style={[styles.roleChip, userForm.tenantId === t.tenantKey && styles.roleChipActive]}
                        onPress={() => setUserForm((f) => ({ ...f, tenantId: t.tenantKey }))}
                      >
                        <Text style={[styles.roleChipText, userForm.tenantId === t.tenantKey && styles.roleChipTextActive]}>{t.schoolName}</Text>
                      </TouchableOpacity>
                    ))}
                    {tenants.length === 0 && (
                      <Text style={styles.emptyText}>No tenants available. Create a tenant first.</Text>
                    )}
                  </View>
                </>
              )}

              <Text style={styles.inputLabel}>Roles</Text>
              <Text style={styles.autoAssignHint}>Select one or more roles for this user</Text>
              <View style={styles.rolePickerRow}>
                {ALL_ROLES.map((role) => {
                  const active = userForm.roles.includes(role);
                  return (
                    <TouchableOpacity
                      key={role}
                      style={[styles.roleChip, active && styles.roleChipActive]}
                      onPress={() => handleToggleRole(role)}
                    >
                      <Text style={[styles.roleChipText, active && styles.roleChipTextActive]}>
                        {ROLE_LABELS[role]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {userError && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{userError}</Text>
                </View>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalApproveBtn, isSavingUser && styles.modalApproveBtnDisabled]} onPress={handleSaveUser} disabled={isSavingUser}>
                  <Text style={styles.modalBtnTextWhite}>{isSavingUser ? 'Creating...' : editingUser ? 'Update' : 'Create'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowUserModal(false)} disabled={isSavingUser}>
                  <Text style={styles.modalBtnTextSecondary}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Reset Password Modal ── */}
      <Modal visible={resetUser !== null} transparent animationType="fade" onRequestClose={() => setResetUser(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reset Password</Text>
            <Text style={styles.pageSubtitle}>Enter a new password for {resetUser?.displayName} ({resetUser?.username})</Text>
            <Text style={styles.inputLabel}>New Password</Text>
            <TextInput
              style={styles.textInput}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              secureTextEntry
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalApproveBtn} onPress={async () => {
                if (!newPassword.trim()) { Alert.alert('Error', 'Please enter a new password'); return; }
                try {
                  await store.resetUserPassword(resetUser!.id, newPassword.trim());
                  Alert.alert('Success', `Password reset for ${resetUser!.username}`);
                  setResetUser(null);
                  setNewPassword('');
                } catch (err: any) {
                  Alert.alert('Error', err.message || 'Failed to reset password');
                }
              }}>
                <Text style={styles.modalBtnTextWhite}>Reset Password</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => { setResetUser(null); setNewPassword(''); }}>
                <Text style={styles.modalBtnTextSecondary}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Create Tenant Modal ── */}
      <Modal visible={showTenantModal} transparent animationType="fade" onRequestClose={() => setShowTenantModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Create New Tenant (School)</Text>

              <Text style={styles.inputLabel}>Tenant Key (auto-generated)</Text>
              <Text style={styles.autoAssignHint}>A unique key will be generated automatically from the school name</Text>
              <TextInput style={[styles.textInput, { backgroundColor: colors.surfaceAlt }]} value={tenantForm.tenantKey} editable={false} placeholder="Auto-generated from school name" />

              <Text style={styles.inputLabel}>School Name</Text>
              <TextInput style={styles.textInput} value={tenantForm.schoolName} onChangeText={(v) => {
                const slug = v.trim().toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-+|-+$/g, '');
                const autoKey = slug ? `tenant-${slug}` : '';
                setTenantForm({ ...tenantForm, schoolName: v, tenantKey: autoKey });
              }} placeholder="e.g. Tema Senior High School" />

              <Text style={styles.inputLabel}>School Code</Text>
              <TextInput style={styles.textInput} value={tenantForm.schoolCode} onChangeText={(v) => setTenantForm({ ...tenantForm, schoolCode: v })} placeholder="e.g. TSHS-001" />

              <Text style={styles.inputLabel}>Region</Text>
              <TextInput style={styles.textInput} value={tenantForm.region} onChangeText={(v) => setTenantForm({ ...tenantForm, region: v })} placeholder="e.g. Greater Accra" />

              <Text style={styles.inputLabel}>District</Text>
              <TextInput style={styles.textInput} value={tenantForm.district} onChangeText={(v) => setTenantForm({ ...tenantForm, district: v })} placeholder="e.g. Tema Metropolitan" />

              <Text style={styles.inputLabel}>Address</Text>
              <TextInput style={styles.textInput} value={tenantForm.address} onChangeText={(v) => setTenantForm({ ...tenantForm, address: v })} placeholder="P.O. Box ..." />

              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput style={styles.textInput} value={tenantForm.phone} onChangeText={(v) => setTenantForm({ ...tenantForm, phone: v })} placeholder="+233 ..." keyboardType="phone-pad" />

              <Text style={styles.inputLabel}>Email</Text>
              <TextInput style={styles.textInput} value={tenantForm.email} onChangeText={(v) => setTenantForm({ ...tenantForm, email: v })} placeholder="info@school.edu.gh" keyboardType="email-address" autoCapitalize="none" />

              <Text style={styles.inputLabel}>Max Students</Text>
              <TextInput style={styles.textInput} value={tenantForm.maxStudents} onChangeText={(v) => setTenantForm({ ...tenantForm, maxStudents: v })} keyboardType="numeric" />

              <Text style={styles.inputLabel}>Max Staff</Text>
              <TextInput style={styles.textInput} value={tenantForm.maxStaff} onChangeText={(v) => setTenantForm({ ...tenantForm, maxStaff: v })} keyboardType="numeric" />

              <Text style={styles.inputLabel}>Subscription Plan</Text>
              <TextInput style={styles.textInput} value={tenantForm.subscriptionPlan} onChangeText={(v) => setTenantForm({ ...tenantForm, subscriptionPlan: v })} placeholder="Standard / Premium" />

              <Text style={styles.inputLabel}>Subscription Expiry</Text>
              <TextInput style={styles.textInput} value={tenantForm.subscriptionExpiry} onChangeText={(v) => setTenantForm({ ...tenantForm, subscriptionExpiry: v })} placeholder="2027-12-31" />

              <Text style={styles.sectionTitle}>Headmaster Setup</Text>
              <Text style={styles.autoAssignHint}>A headmaster account will be created for this tenant so they can manage the school.</Text>

              <Text style={styles.inputLabel}>Headmaster Display Name</Text>
              <TextInput style={styles.textInput} value={tenantForm.headmasterDisplayName} onChangeText={(v) => setTenantForm({ ...tenantForm, headmasterDisplayName: v })} placeholder="e.g. Mr. John Mensah" />

              <Text style={styles.inputLabel}>Headmaster Username</Text>
              <TextInput style={styles.textInput} value={tenantForm.headmasterUsername} onChangeText={(v) => setTenantForm({ ...tenantForm, headmasterUsername: v })} placeholder="e.g. headmaster.tema" autoCapitalize="none" />

              <Text style={styles.inputLabel}>Headmaster Password</Text>
              <TextInput style={styles.textInput} value={tenantForm.headmasterPassword} onChangeText={(v) => setTenantForm({ ...tenantForm, headmasterPassword: v })} placeholder="Enter a temporary password" secureTextEntry />

              {tenantError && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{tenantError}</Text>
                </View>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalApproveBtn, isSavingTenant && styles.modalApproveBtnDisabled]}
                  disabled={isSavingTenant}
                  onPress={async () => {
                    if (!tenantForm.schoolName.trim()) {
                      setTenantError('School Name is required.');
                      return;
                    }
                    if (!tenantForm.tenantKey) {
                      setTenantError('Could not generate tenant key. Please enter a valid school name.');
                      return;
                    }
                    if (!tenantForm.headmasterUsername.trim() || !tenantForm.headmasterDisplayName.trim()) {
                      setTenantError('Headmaster username and display name are required.');
                      return;
                    }
                    if (!tenantForm.headmasterPassword.trim() || tenantForm.headmasterPassword.length < 6) {
                      setTenantError('Headmaster password must be at least 6 characters.');
                      return;
                    }
                    setIsSavingTenant(true);
                    setTenantError(null);
                    try {
                      // 1. Create the tenant
                      await apiClient.createTenant({
                        tenantKey: tenantForm.tenantKey.trim(),
                        schoolName: tenantForm.schoolName.trim(),
                        schoolCode: tenantForm.schoolCode.trim() || undefined,
                        region: tenantForm.region.trim() || undefined,
                        district: tenantForm.district.trim() || undefined,
                        address: tenantForm.address.trim() || undefined,
                        phone: tenantForm.phone.trim() || undefined,
                        email: tenantForm.email.trim() || undefined,
                        maxStudents: parseInt(tenantForm.maxStudents) || 2000,
                        maxStaff: parseInt(tenantForm.maxStaff) || 150,
                        subscriptionPlan: tenantForm.subscriptionPlan.trim() || 'Standard',
                        subscriptionExpiry: tenantForm.subscriptionExpiry.trim() || undefined,
                      });

                      // 2. Create the headmaster user for this tenant
                      await apiClient.post('/auth/users', {
                        username: tenantForm.headmasterUsername.trim(),
                        password: tenantForm.headmasterPassword.trim(),
                        displayName: tenantForm.headmasterDisplayName.trim(),
                        roles: ['headmaster'],
                        tenantId: tenantForm.tenantKey.trim(),
                      });

                      await fetchTenants();
                      setShowTenantModal(false);
                      Alert.alert(
                        'Success',
                        `Tenant "${tenantForm.schoolName}" created.\nHeadmaster "${tenantForm.headmasterUsername}" can now log in.`
                      );
                    } catch (err: any) {
                      setTenantError(err.message || 'Failed to create tenant and headmaster.');
                    } finally {
                      setIsSavingTenant(false);
                    }
                  }}
                >
                  <Text style={styles.modalBtnTextWhite}>{isSavingTenant ? 'Creating...' : 'Create Tenant'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowTenantModal(false)} disabled={isSavingTenant}>
                  <Text style={styles.modalBtnTextSecondary}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
  pageSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  addBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  miniBtn: { backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderWidth: 1, borderColor: colors.border },
  miniBtnText: { color: colors.primary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  miniApproveBtn: { backgroundColor: colors.success, borderRadius: radius.sm, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
  miniApproveBtnText: { color: colors.white, fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  miniWarnBtn: { backgroundColor: colors.warning, borderRadius: radius.sm, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
  miniWarnBtnText: { color: colors.white, fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  miniDeleteBtn: { backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderWidth: 1, borderColor: colors.danger },
  miniDeleteBtnText: { color: colors.danger, fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  emptyText: { fontSize: fontSize.md, color: colors.textLight, fontStyle: 'italic', paddingVertical: spacing.md },
  infoCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.sm },
  infoText: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs },
  inputLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text, marginTop: spacing.sm, marginBottom: spacing.xs },
  textInput: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md, color: colors.text, marginBottom: spacing.sm },
  autoAssignHint: { fontSize: fontSize.xs, color: colors.info, marginBottom: spacing.xs, fontStyle: 'italic' },
  saveBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.lg },
  saveBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  logoutBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  logoutText: { color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  // Log styles
  logRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, marginBottom: spacing.xs, borderWidth: 1, borderColor: colors.borderLight },
  logBadge: { borderRadius: radius.sm, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, marginRight: spacing.sm },
  logLevel: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  logMessage: { fontSize: fontSize.sm, color: colors.text, fontWeight: fontWeight.medium },
  logMeta: { fontSize: fontSize.xs, color: colors.textLight, marginTop: 2 },
  viewAllBtn: { paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.sm },
  viewAllBtnText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  // User action styles
  userActionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, marginBottom: spacing.xs, borderWidth: 1, borderColor: colors.borderLight },
  userActionName: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text },
  userActionStatus: { fontSize: fontSize.xs, marginTop: 2 },
  userActionBtns: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  // Module styles
  moduleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, marginBottom: spacing.xs, borderWidth: 1, borderColor: colors.borderLight },
  moduleName: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text },
  moduleMeta: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  healthBadge: { borderRadius: radius.sm, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, marginHorizontal: spacing.sm },
  healthText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  toggleBtn: { borderRadius: radius.sm, paddingVertical: spacing.xs, paddingHorizontal: spacing.md, borderWidth: 2 },
  toggleBtnOn: { backgroundColor: colors.success, borderColor: colors.success },
  toggleBtnOff: { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
  toggleBtnText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  toggleBtnTextOn: { color: colors.white },
  toggleBtnTextOff: { color: colors.textSecondary },
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  modalContent: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, width: '100%', maxWidth: 500, maxHeight: '85%' },
  modalTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.md },
  modalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, flexWrap: 'wrap' },
  modalApproveBtn: { backgroundColor: colors.success, borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, flex: 1, minWidth: 80, alignItems: 'center' },
  modalCancelBtn: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, flex: 1, minWidth: 80, alignItems: 'center' },
  modalBtnTextWhite: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  modalBtnTextSecondary: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  // Role picker
  rolePickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  roleChip: { backgroundColor: colors.surfaceAlt, borderRadius: radius.pill, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderWidth: 1, borderColor: colors.border },
  roleChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  roleChipText: { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: fontWeight.medium },
  roleChipTextActive: { color: colors.white, fontWeight: fontWeight.semibold },
  errorBanner: { backgroundColor: colors.danger + '15', borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.sm, width: '100%' },
  errorBannerText: { color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  modalApproveBtnDisabled: { opacity: 0.5 },
  connBanner: { borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  connBannerText: { fontSize: fontSize.md, fontWeight: fontWeight.bold },
  connBannerSub: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 4 },
});
