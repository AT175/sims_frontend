import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput, Alert } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid, DataTable } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useAuthStore } from '@store/authStore';
import { useSystemAdminStore } from '@store/systemAdminStore';
import type { SystemUser, UserStatus } from '@store/systemAdminStore';
import { ROLE_LABELS } from '@shared/navigation/roleMap';
import type { RoleId } from '@shared/types';

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'System Overview' },
  { key: 'users', label: 'User Management' },
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
  const { logout } = useAuthStore();
  const store = useSystemAdminStore();

  // User modal state
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [userForm, setUserForm] = useState({ username: '', displayName: '', email: '', roles: [] as RoleId[] });

  const handleAddUser = () => {
    setEditingUser(null);
    setUserForm({ username: '', displayName: '', email: '', roles: [] });
    setShowUserModal(true);
  };

  const handleEditUser = (user: SystemUser) => {
    setEditingUser(user);
    setUserForm({ username: user.username, displayName: user.displayName, email: user.email, roles: [...user.roles] });
    setShowUserModal(true);
  };

  const handleSaveUser = () => {
    if (!userForm.username.trim() || !userForm.displayName.trim()) {
      Alert.alert('Error', 'Username and display name are required');
      return;
    }
    if (editingUser) {
      store.updateUserRoles(editingUser.id, userForm.roles);
      Alert.alert('Success', 'User updated successfully');
    } else {
      store.addUser({
        username: userForm.username.trim(),
        displayName: userForm.displayName.trim(),
        email: userForm.email.trim(),
        roles: userForm.roles.length > 0 ? userForm.roles : ['staff'],
        status: 'Active',
        tenantId: store.tenant.id,
      });
      Alert.alert('Success', 'User created successfully');
    }
    setShowUserModal(false);
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

            <Text style={styles.sectionTitle}>All Users</Text>
            <DataTable
              columns={[
                { key: 'username', label: 'Username', render: (u: any) => u.username },
                { key: 'displayName', label: 'Name', render: (u: any) => u.displayName },
                { key: 'roles', label: 'Roles', render: (u: any) => u.roles.map((r: RoleId) => ROLE_LABELS[r]).join(', ') },
                { key: 'status', label: 'Status', render: (u: any) => u.status },
                { key: 'lastLogin', label: 'Last Login', render: (u: any) => u.lastLogin || 'Never' },
              ]}
              data={store.users as any}
            />

            <Text style={styles.sectionTitle}>User Actions</Text>
            {store.users.map((user) => (
              <View key={user.id} style={styles.userActionRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userActionName}>{user.displayName} ({user.username})</Text>
                  <Text style={[styles.userActionStatus, { color: STATUS_COLORS[user.status] }]}>{user.status}{user.failedAttempts > 0 ? ` · ${user.failedAttempts} failed attempts` : ''}</Text>
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
                  <TouchableOpacity style={styles.miniBtn} onPress={() => { store.resetUserPassword(user.id); Alert.alert('Success', `Password reset for ${user.username}. Temporary password sent to ${user.email}.`); }}>
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

      case 'tenant':
        return (
          <ScrollView>
            <Text style={styles.pageTitle}>School Configuration</Text>
            <Text style={styles.pageSubtitle}>Manage tenant/school settings and subscription</Text>

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

            <Text style={styles.sectionTitle}>Subscription</Text>
            <View style={styles.infoCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.infoText}>Plan: <Text style={{ fontWeight: fontWeight.bold, color: colors.primary }}>{store.tenant.subscriptionPlan}</Text></Text>
                <Text style={styles.infoText}>Expires: {store.tenant.subscriptionExpiry}</Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.infoText}>Max Students: {store.tenant.maxStudents}</Text>
                <Text style={styles.infoText}>Max Staff: {store.tenant.maxStaff}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={() => Alert.alert('Saved', 'School configuration saved successfully.')}>
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

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalApproveBtn} onPress={handleSaveUser}>
                  <Text style={styles.modalBtnTextWhite}>{editingUser ? 'Update' : 'Create'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowUserModal(false)}>
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
});
