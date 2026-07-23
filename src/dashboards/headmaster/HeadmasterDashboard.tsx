import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput, Alert } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid, DataTable, KitchenMenuWidget } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useAuthStore } from '@store/authStore';
import { useHeadmasterStore } from '@store/headmasterStore';
import type { ApprovalCategory, BroadcastAudience, BroadcastPriority, DisciplineSeverity } from '@store/headmasterStore';
import { useStaffStore } from '@store/staffStore';
import { useRegistryStore } from '@store/registryStore';
import { useBursaryStore } from '@store/bursaryStore';
import { useSystemAdminStore } from '@store/systemAdminStore';
import type { SystemUser, UserStatus } from '@store/systemAdminStore';
import { useAccessControlStore } from '@store/accessControlStore';
import { DASHBOARD_CATALOG, DASHBOARD_MAP } from '@shared/navigation/dashboardCatalog';
import { ROLE_LABELS } from '@shared/navigation/roleMap';
import type { RoleId } from '@shared/types';

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Executive Overview' },
  { key: 'oversight', label: 'School-Wide Oversight' },
  { key: 'staff', label: 'Staff Directory & Appraisal' },
  { key: 'approvals', label: 'Approvals Inbox' },
  { key: 'reports', label: 'Reports & Analytics' },
  { key: 'communication', label: 'Communication' },
  { key: 'discipline', label: 'Discipline Case Log' },
  { key: 'users', label: 'User Management' },
  { key: 'access', label: 'Access Control' },
  { key: 'menu', label: "Today's Menu" },
  { key: 'sync', label: 'Sync & Data Health' },
];

const APPROVAL_CATEGORIES: ApprovalCategory[] = ['Budget Revision', 'Procurement', 'Discipline Escalation', 'Policy Change', 'Other'];
const BROADCAST_AUDIENCES: BroadcastAudience[] = ['Everyone', 'All Staff', 'Teaching Staff', 'Non-Teaching Staff', 'All Students', 'Parents'];
const BROADCAST_PRIORITIES: BroadcastPriority[] = ['Normal', 'Important', 'Urgent'];
const DISCIPLINE_SEVERITIES: DisciplineSeverity[] = ['minor', 'serious', 'critical'];
const HOUSES = ['Aggrey', 'Mensah', 'Sarbah', 'Danquah'];
const USER_STATUSES: UserStatus[] = ['Active', 'Suspended', 'Locked', 'Inactive'];
const ALL_ROLES: { id: RoleId; label: string }[] = [
  { id: 'headmaster', label: 'Headmaster' },
  { id: 'asst_headmaster_academic', label: 'Asst. Headmaster (Academic)' },
  { id: 'asst_headmaster_admin', label: 'Asst. Headmaster (Admin)' },
  { id: 'asst_headmaster_domestic', label: 'Asst. Headmaster (Domestic)' },
  { id: 'teacher', label: 'Teacher' },
  { id: 'subject_hod', label: 'Subject HOD' },
  { id: 'senior_housemaster', label: 'Senior Housemaster' },
  { id: 'senior_housemistress', label: 'Senior Housemistress' },
  { id: 'housemaster', label: 'Housemaster' },
  { id: 'housemistress', label: 'Housemistress' },
  { id: 'bursary', label: 'Bursary' },
  { id: 'accountant', label: 'Accountant' },
  { id: 'stores', label: 'Stores' },
  { id: 'registry', label: 'Registry' },
  { id: 'security', label: 'Security' },
  { id: 'catering', label: 'Catering' },
  { id: 'health', label: 'Health Centre' },
  { id: 'transport', label: 'Transport' },
  { id: 'cleaning', label: 'Cleaning' },
  { id: 'library_ict', label: 'Library & ICT' },
  { id: 'sports_clubs', label: 'Sports & Clubs' },
  { id: 'counselling', label: 'Counselling' },
  { id: 'plc', label: 'PLC' },
  { id: 'staff', label: 'General Staff' },
  { id: 'student', label: 'Student' },
  { id: 'parent', label: 'Parent' },
  { id: 'system_admin', label: 'System Admin' },
];

export function HeadmasterDashboard() {
  const [activePage, setActivePage] = useState('overview');
  const { logout, user } = useAuthStore();
  const hmStore = useHeadmasterStore();
  const staffStore = useStaffStore();
  const registryStore = useRegistryStore();
  const bursaryStore = useBursaryStore();
  const sysAdminStore = useSystemAdminStore();
  const accessStore = useAccessControlStore();

  const pendingLeave = staffStore.getPendingLeave();
  const pendingHmApprovals = hmStore.getPendingApprovals();
  const totalPendingApprovals = pendingLeave.length + pendingHmApprovals.length;
  const totalCollected = bursaryStore.getTotalCollected();
  const totalOutstanding = bursaryStore.getTotalOutstanding();
  const feeCollectionRate = totalCollected + totalOutstanding > 0
    ? Math.round((totalCollected / (totalCollected + totalOutstanding)) * 100)
    : 0;

  // ── Modal state ──
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalForm, setApprovalForm] = useState({ category: 'Other' as ApprovalCategory, requester: '', department: '', details: '' });

  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({ title: '', body: '', audience: 'Everyone' as BroadcastAudience, priority: 'Normal' as BroadcastPriority });

  const [showDisciplineModal, setShowDisciplineModal] = useState(false);
  const [disciplineForm, setDisciplineForm] = useState({ student: '', house: HOUSES[0], incident: '', severity: 'minor' as DisciplineSeverity });

  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: '', role: 'Teacher' as any, position: '', department: '', phone: '', email: '' });

  const [showResolveModal, setShowResolveModal] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({ username: '', displayName: '', email: '', roles: [] as RoleId[], status: 'Active' as UserStatus, tenantId: 'tenant_001' });
  const [showRoleModal, setShowRoleModal] = useState<SystemUser | null>(null);
  const [roleDraft, setRoleDraft] = useState<RoleId[]>([]);

  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessForm, setAccessForm] = useState({ userId: '', dashboardKey: '', allowedPages: [] as string[], fullAccess: false });
  const [accessSearch, setAccessSearch] = useState('');
  const [editingGrantId, setEditingGrantId] = useState<string | null>(null);
  const [accessFilter, setAccessFilter] = useState<'all' | 'full' | 'page'>('all');
  const [selectedAccessUser, setSelectedAccessUser] = useState<string | null>(null);

  const handleAddApproval = () => {
    if (!approvalForm.requester.trim() || !approvalForm.details.trim()) {
      Alert.alert('Error', 'Requester and details are required.');
      return;
    }
    hmStore.addApproval({ category: approvalForm.category, requester: approvalForm.requester.trim(), department: approvalForm.department.trim() || 'General', details: approvalForm.details.trim() });
    setApprovalForm({ category: 'Other', requester: '', department: '', details: '' });
    setShowApprovalModal(false);
    Alert.alert('Success', 'Approval request logged.');
  };

  const handleAddBroadcast = () => {
    if (!broadcastForm.title.trim() || !broadcastForm.body.trim()) {
      Alert.alert('Error', 'Title and message body are required.');
      return;
    }
    hmStore.addBroadcast({ ...broadcastForm, title: broadcastForm.title.trim(), body: broadcastForm.body.trim(), postedBy: user?.displayName || 'Headmaster' });
    setBroadcastForm({ title: '', body: '', audience: 'Everyone', priority: 'Normal' });
    setShowBroadcastModal(false);
    Alert.alert('Success', 'Broadcast sent successfully.');
  };

  const handleAddDiscipline = () => {
    if (!disciplineForm.student.trim() || !disciplineForm.incident.trim()) {
      Alert.alert('Error', 'Student name and incident are required.');
      return;
    }
    hmStore.addDisciplineCase({ ...disciplineForm, student: disciplineForm.student.trim(), incident: disciplineForm.incident.trim(), date: new Date().toISOString().slice(0, 10), reportedBy: user?.displayName || 'Headmaster' });
    setDisciplineForm({ student: '', house: HOUSES[0], incident: '', severity: 'minor' });
    setShowDisciplineModal(false);
    Alert.alert('Success', 'Discipline case logged.');
  };

  const handleAddUser = () => {
    if (!userForm.username.trim() || !userForm.displayName.trim()) {
      Alert.alert('Error', 'Username and display name are required.');
      return;
    }
    if (userForm.roles.length === 0) {
      Alert.alert('Error', 'At least one role must be assigned.');
      return;
    }
    sysAdminStore.addUser({ username: userForm.username.trim(), displayName: userForm.displayName.trim(), email: userForm.email.trim(), roles: userForm.roles, status: userForm.status, tenantId: userForm.tenantId });
    setUserForm({ username: '', displayName: '', email: '', roles: [], status: 'Active', tenantId: 'tenant_001' });
    setShowUserModal(false);
    Alert.alert('Success', 'User account created.');
  };

  const toggleRoleInForm = (role: RoleId) => {
    setUserForm((f) => ({
      ...f,
      roles: f.roles.includes(role) ? f.roles.filter((r) => r !== role) : [...f.roles, role],
    }));
  };

  const toggleRoleInDraft = (role: RoleId) => {
    setRoleDraft((d) => d.includes(role) ? d.filter((r) => r !== role) : [...d, role]);
  };

  const handleSaveRoles = () => {
    if (showRoleModal) {
      sysAdminStore.updateUserRoles(showRoleModal.id, roleDraft);
      Alert.alert('Success', `Roles updated for ${showRoleModal.displayName}.`);
      setShowRoleModal(null);
    }
  };

  const handleAssignAccess = () => {
    if (!accessForm.userId || !accessForm.dashboardKey) {
      Alert.alert('Error', 'Select a user and a dashboard.');
      return;
    }
    if (!accessForm.fullAccess && accessForm.allowedPages.length === 0) {
      Alert.alert('Error', 'Select at least one page or grant full access.');
      return;
    }
    const targetUser = sysAdminStore.users.find((u) => u.id === accessForm.userId);
    if (!targetUser) {
      Alert.alert('Error', 'User not found.');
      return;
    }
    const dashDef = DASHBOARD_MAP[accessForm.dashboardKey];
    if (!dashDef) {
      Alert.alert('Error', 'Dashboard not found.');
      return;
    }
    const roleToAdd = dashDef.role;
    const updatedRoles = targetUser.roles.includes(roleToAdd) ? targetUser.roles : [...targetUser.roles, roleToAdd];
    if (updatedRoles.length !== targetUser.roles.length) {
      sysAdminStore.updateUserRoles(targetUser.id, updatedRoles);
    }
    const isEditing = !!editingGrantId;
    accessStore.assignAccess({
      userId: targetUser.id,
      username: targetUser.username,
      displayName: targetUser.displayName,
      dashboardKey: accessForm.dashboardKey,
      dashboardLabel: dashDef.label,
      allowedPages: accessForm.fullAccess ? 'all' : accessForm.allowedPages,
      grantedBy: user?.displayName || 'Headmaster',
    });
    setAccessForm({ userId: '', dashboardKey: '', allowedPages: [], fullAccess: false });
    setEditingGrantId(null);
    setShowAccessModal(false);
    Alert.alert('Success', isEditing ? 'Access assignment updated.' : `Access assigned to ${targetUser.displayName}.`);
  };

  const togglePageInAccessForm = (pageKey: string) => {
    setAccessForm((f) => ({
      ...f,
      allowedPages: f.allowedPages.includes(pageKey)
        ? f.allowedPages.filter((p) => p !== pageKey)
        : [...f.allowedPages, pageKey],
    }));
  };

  const handleRevokeAccess = (grantId: string) => {
    const grant = accessStore.grants.find((g) => g.id === grantId);
    if (!grant) return;
    Alert.alert(
      'Revoke Access',
      `Remove ${grant.displayName}'s access to ${grant.dashboardLabel}?`,
      [
        { text: 'Cancel' },
        {
          text: 'Revoke',
          onPress: () => {
            accessStore.revokeAccess(grantId);
            if (selectedAccessUser === grantId) setSelectedAccessUser(null);
            Alert.alert('Revoked', 'Access has been removed.');
          },
        },
      ]
    );
  };

  const handleEditAccess = (grantId: string) => {
    const grant = accessStore.grants.find((g) => g.id === grantId);
    if (!grant) return;
    setEditingGrantId(grantId);
    setAccessForm({
      userId: grant.userId,
      dashboardKey: grant.dashboardKey,
      allowedPages: grant.allowedPages === 'all' ? [] : [...grant.allowedPages],
      fullAccess: grant.allowedPages === 'all',
    });
    setShowAccessModal(true);
  };

  const openNewAccessModal = () => {
    setEditingGrantId(null);
    setAccessForm({ userId: '', dashboardKey: '', allowedPages: [], fullAccess: false });
    setShowAccessModal(true);
  };

  const filteredGrants = accessStore.grants.filter((g) => {
    if (accessFilter === 'full' && g.allowedPages !== 'all') return false;
    if (accessFilter === 'page' && g.allowedPages === 'all') return false;
    if (selectedAccessUser && g.userId !== selectedAccessUser) return false;
    if (accessSearch.trim()) {
      const q = accessSearch.toLowerCase();
      return g.displayName.toLowerCase().includes(q) || g.dashboardLabel.toLowerCase().includes(q);
    }
    return true;
  });

  const grantsByUser = filteredGrants.reduce((acc, g) => {
    if (!acc[g.userId]) acc[g.userId] = { displayName: g.displayName, username: g.username, grants: [] };
    acc[g.userId].grants.push(g);
    return acc;
  }, {} as Record<string, { displayName: string; username: string; grants: typeof accessStore.grants }>);

  const DASHBOARD_CATEGORIES: { label: string; dashboards: typeof DASHBOARD_CATALOG }[] = [
    { label: 'Leadership & Administration', dashboards: DASHBOARD_CATALOG.filter(d => ['Headmaster', 'Academic', 'Admin', 'Domestic', 'GoverningBoard', 'SystemAdmin', 'AcademicBoard', 'InternalAuditor', 'HeadmasterSecretary'].includes(d.key)) },
    { label: 'Finance', dashboards: DASHBOARD_CATALOG.filter(d => ['Bursary', 'Accountant', 'Stores'].includes(d.key)) },
    { label: 'Academic & Teaching', dashboards: DASHBOARD_CATALOG.filter(d => ['Teacher', 'SubjectHOD', 'PLC', 'Student', 'ExamCommittee'].includes(d.key)) },
    { label: 'Student Welfare & Services', dashboards: DASHBOARD_CATALOG.filter(d => ['Health', 'Counselling', 'Catering', 'Cleaning', 'Transport', 'Security', 'LibraryICT', 'SportsClubs', 'Chaplain', 'DiningHall', 'SafeSpace'].includes(d.key)) },
    { label: 'Boarding & Houses', dashboards: DASHBOARD_CATALOG.filter(d => ['House', 'SeniorHousemaster'].includes(d.key)) },
    { label: 'Records & Registry', dashboards: DASHBOARD_CATALOG.filter(d => ['Registry'].includes(d.key)) },
    { label: 'Community & Engagement', dashboards: DASHBOARD_CATALOG.filter(d => ['Parent', 'PTA', 'SRC', 'ElectoralCommission', 'WelfareCommittee', 'Staff'].includes(d.key)) },
  ];

  const handleAddStaff = () => {
    if (!staffForm.name.trim() || !staffForm.position.trim()) {
      Alert.alert('Error', 'Name and position are required.');
      return;
    }
    staffStore.addDirectoryEntry({ ...staffForm, name: staffForm.name.trim(), position: staffForm.position.trim(), department: staffForm.department.trim() || 'General', status: 'Active' });
    setStaffForm({ name: '', role: 'Teacher', position: '', department: '', phone: '', email: '' });
    setShowStaffModal(false);
    Alert.alert('Success', 'Staff member added to directory.');
  };

  const generatePDF = (reportType: string) => {
    const now = new Date().toLocaleString('en-GB');
    const html = `<html><head><meta charset="utf-8"><style>
      body { font-family: Arial, sans-serif; color: #1A1A2E; margin: 40px; }
      h1 { color: #0F4C75; font-size: 22px; border-bottom: 3px solid #0F4C75; padding-bottom: 8px; }
      table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 12px; }
      th { background: #0F4C75; color: white; padding: 8px; text-align: left; }
      td { padding: 8px; border-bottom: 1px solid #E4E7EC; }
      .stat { display: inline-block; width: 22%; background: #F0F2F5; border-radius: 8px; padding: 12px; margin: 5px; text-align: center; }
      .stat b { display: block; font-size: 18px; color: #0F4C75; }
    </style></head><body>
      <h1>${reportType}</h1>
      <p>Generated: ${now}</p>
      <div>
        <div class="stat"><b>${registryStore.students.length}</b>Total Students</div>
        <div class="stat"><b>${staffStore.directory.length}</b>Total Staff</div>
        <div class="stat"><b>${feeCollectionRate}%</b>Fee Collection</div>
        <div class="stat"><b>${totalPendingApprovals}</b>Pending Approvals</div>
      </div>
      <h1>Staff Directory</h1>
      <table><tr><th>Name</th><th>Position</th><th>Department</th><th>Status</th></tr>
      ${staffStore.directory.map((s) => `<tr><td>${s.name}</td><td>${s.position}</td><td>${s.department}</td><td>${s.status}</td></tr>`).join('')}
      </table>
    </body></html>`;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 400);
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return (
          <ScrollView>
            <Text style={styles.pageTitle}>Executive Overview</Text>
            <Text style={styles.pageSubtitle}>Live snapshot of the entire school</Text>
            <CardGrid>
              <StatCard label="Total Enrollment" value={registryStore.students.length} subtitle="Active students" accentColor={colors.primary} />
              <StatCard label="Staff Count" value={staffStore.directory.length} subtitle="Teaching + non-teaching" accentColor={colors.primaryLight} />
              <StatCard label="Fee Collection" value={`${feeCollectionRate}%`} subtitle="Collected vs. billed" accentColor={colors.accent} />
              <StatCard label="Pending Approvals" value={totalPendingApprovals} subtitle="Awaiting your action" accentColor={colors.warning} onPress={() => setActivePage('approvals')} />
              <StatCard label="Open Discipline Cases" value={hmStore.disciplineCases.filter((d) => d.status !== 'Resolved').length} subtitle="Requiring attention" accentColor={colors.danger} onPress={() => setActivePage('discipline')} />
              <StatCard label="Pending Admissions" value={registryStore.admissions.filter((a) => a.status !== 'Approved' && a.status !== 'Rejected').length} subtitle="Under review" accentColor={colors.info} />
            </CardGrid>

            <Text style={styles.sectionTitle}>Awaiting Your Approval</Text>
            {totalPendingApprovals === 0 ? (
              <Text style={styles.emptyText}>No pending approvals. All caught up.</Text>
            ) : (
              <>
                {pendingLeave.slice(0, 3).map((l) => (
                  <View key={l.id} style={styles.quickApprovalRow}>
                    <Text style={styles.quickApprovalText}>Leave Request — {l.staffName} ({l.type})</Text>
                  </View>
                ))}
                {pendingHmApprovals.slice(0, 3).map((a) => (
                  <View key={a.id} style={styles.quickApprovalRow}>
                    <Text style={styles.quickApprovalText}>{a.category} — {a.requester}</Text>
                  </View>
                ))}
                <TouchableOpacity style={styles.viewAllBtn} onPress={() => setActivePage('approvals')}>
                  <Text style={styles.viewAllBtnText}>Go to Approvals Inbox →</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        );

      case 'oversight':
        return (
          <ScrollView>
            <Text style={styles.pageTitle}>School-Wide Oversight</Text>
            <Text style={styles.pageSubtitle}>Cross-department control center — monitor every unit of the school in one place</Text>

            <Text style={styles.sectionTitle}>Academics & Admissions (Registry)</Text>
            <CardGrid>
              <StatCard label="Total Students" value={registryStore.students.length} accentColor={colors.primary} />
              <StatCard label="Admissions Pending" value={registryStore.admissions.filter((a) => a.status !== 'Approved' && a.status !== 'Rejected').length} accentColor={colors.warning} />
              <StatCard label="Admissions Approved" value={registryStore.admissions.filter((a) => a.status === 'Approved').length} accentColor={colors.success} />
            </CardGrid>

            <Text style={styles.sectionTitle}>Human Resources (Staff)</Text>
            <CardGrid>
              <StatCard label="Total Staff" value={staffStore.directory.length} accentColor={colors.primary} />
              <StatCard label="On Leave" value={staffStore.directory.filter((d) => d.status === 'On Leave').length} accentColor={colors.info} />
              <StatCard label="Pending Leave Requests" value={pendingLeave.length} accentColor={colors.warning} onPress={() => setActivePage('approvals')} />
            </CardGrid>

            <Text style={styles.sectionTitle}>Finance (Bursary)</Text>
            <CardGrid>
              <StatCard label="Total Collected" value={`GH₵${totalCollected.toLocaleString()}`} accentColor={colors.success} />
              <StatCard label="Outstanding" value={`GH₵${totalOutstanding.toLocaleString()}`} accentColor={colors.danger} />
              <StatCard label="Collection Rate" value={`${feeCollectionRate}%`} accentColor={colors.accent} />
            </CardGrid>

            <Text style={styles.sectionTitle}>System & IT Health</Text>
            <CardGrid>
              <StatCard label="DB Status" value={sysAdminStore.dbHealth.status} accentColor={sysAdminStore.dbHealth.status === 'Healthy' ? colors.success : colors.warning} />
              <StatCard label="System Users" value={sysAdminStore.users.length} accentColor={colors.info} />
              <StatCard label="Pending Syncs" value={sysAdminStore.dbHealth.pendingChanges} accentColor={sysAdminStore.dbHealth.pendingChanges > 0 ? colors.warning : colors.success} />
            </CardGrid>

            <Text style={styles.sectionTitle}>Discipline & Welfare</Text>
            <CardGrid>
              <StatCard label="Open Cases" value={hmStore.disciplineCases.filter((d) => d.status === 'Open').length} accentColor={colors.warning} />
              <StatCard label="Escalated" value={hmStore.disciplineCases.filter((d) => d.status === 'Escalated').length} accentColor={colors.danger} />
              <StatCard label="Resolved" value={hmStore.disciplineCases.filter((d) => d.status === 'Resolved').length} accentColor={colors.success} />
            </CardGrid>
          </ScrollView>
        );

      case 'staff':
        return (
          <ScrollView>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.pageTitle}>Staff Directory & Appraisal</Text>
                <Text style={styles.pageSubtitle}>Full staff roster across all departments</Text>
              </View>
              <TouchableOpacity style={styles.addBtn} onPress={() => setShowStaffModal(true)}>
                <Text style={styles.addBtnText}>+ Add Staff</Text>
              </TouchableOpacity>
            </View>
            <CardGrid>
              <StatCard label="Total Staff" value={staffStore.directory.length} accentColor={colors.primary} />
              <StatCard label="Active" value={staffStore.directory.filter((d) => d.status === 'Active').length} accentColor={colors.success} />
              <StatCard label="On Leave" value={staffStore.directory.filter((d) => d.status === 'On Leave').length} accentColor={colors.warning} />
            </CardGrid>
            <DataTable
              columns={[
                { key: 'name', label: 'Name', render: (i: any) => i.name },
                { key: 'position', label: 'Position', render: (i: any) => i.position },
                { key: 'department', label: 'Department', render: (i: any) => i.department },
                { key: 'status', label: 'Status', render: (i: any) => i.status },
              ]}
              data={staffStore.directory as any}
            />
          </ScrollView>
        );

      case 'approvals':
        return (
          <ScrollView>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.pageTitle}>Approvals Inbox</Text>
                <Text style={styles.pageSubtitle}>Pending requests from all departments</Text>
              </View>
              <TouchableOpacity style={styles.addBtn} onPress={() => setShowApprovalModal(true)}>
                <Text style={styles.addBtnText}>+ Log Approval</Text>
              </TouchableOpacity>
            </View>

            {totalPendingApprovals === 0 ? (
              <Text style={styles.emptyText}>No pending approvals.</Text>
            ) : null}

            {pendingLeave.map((item) => (
              <View key={`leave-${item.id}`} style={styles.approvalCard}>
                <View style={styles.approvalHeader}>
                  <Text style={styles.approvalType}>Leave Request ({item.type})</Text>
                  <Text style={styles.approvalDate}>{item.dateSubmitted}</Text>
                </View>
                <Text style={styles.approvalRequester}>{item.staffName} — {item.staffRole}</Text>
                <Text style={styles.approvalDetails}>{item.reason} ({item.startDate} to {item.endDate})</Text>
                <View style={styles.approvalActions}>
                  <TouchableOpacity style={styles.approveBtn} onPress={() => { staffStore.reviewLeave(item.id, 'Approved', user?.displayName || 'Headmaster', ''); Alert.alert('Approved', `Leave request for ${item.staffName} approved.`); }}>
                    <Text style={styles.approveText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rejectBtn} onPress={() => { staffStore.reviewLeave(item.id, 'Rejected', user?.displayName || 'Headmaster', ''); Alert.alert('Rejected', `Leave request for ${item.staffName} rejected.`); }}>
                    <Text style={styles.rejectText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {pendingHmApprovals.map((item) => (
              <View key={`hm-${item.id}`} style={styles.approvalCard}>
                <View style={styles.approvalHeader}>
                  <Text style={styles.approvalType}>{item.category}</Text>
                  <Text style={styles.approvalDate}>{item.date}</Text>
                </View>
                <Text style={styles.approvalRequester}>{item.requester} — {item.department}</Text>
                <Text style={styles.approvalDetails}>{item.details}</Text>
                <View style={styles.approvalActions}>
                  <TouchableOpacity style={styles.approveBtn} onPress={() => { hmStore.reviewApproval(item.id, 'Approved', user?.displayName || 'Headmaster'); Alert.alert('Approved', `${item.category} request approved.`); }}>
                    <Text style={styles.approveText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rejectBtn} onPress={() => { hmStore.reviewApproval(item.id, 'Rejected', user?.displayName || 'Headmaster'); Alert.alert('Rejected', `${item.category} request rejected.`); }}>
                    <Text style={styles.rejectText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        );

      case 'reports':
        return (
          <ScrollView>
            <Text style={styles.pageTitle}>Reports & Analytics</Text>
            <Text style={styles.pageSubtitle}>Generate termly/annual reports</Text>
            {['Academic Performance Report', 'Financial Summary', 'Attendance Report', 'Welfare Report', 'Boarding Operations Report'].map((report) => (
              <TouchableOpacity key={report} style={styles.reportCard} onPress={() => generatePDF(report)}>
                <Text style={styles.reportTitle}>{report}</Text>
                <Text style={styles.reportAction}>Generate (PDF)</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        );

      case 'communication':
        return (
          <ScrollView>
            <Text style={styles.pageTitle}>Communication</Text>
            <Text style={styles.pageSubtitle}>Broadcast messages to staff, students, or parents</Text>
            <TouchableOpacity style={styles.composeBtn} onPress={() => setShowBroadcastModal(true)}>
              <Text style={styles.composeText}>+ Compose New Broadcast</Text>
            </TouchableOpacity>
            {hmStore.broadcasts.map((msg) => (
              <View key={msg.id} style={styles.messageCard}>
                <Text style={styles.messageTitle}>{msg.title}</Text>
                <Text style={styles.messagePreview}>{msg.body}</Text>
                <Text style={styles.messageMeta}>Sent to: {msg.audience} | {msg.date} | {msg.priority}</Text>
              </View>
            ))}
          </ScrollView>
        );

      case 'discipline':
        return (
          <ScrollView>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.pageTitle}>Discipline Case Log</Text>
                <Text style={styles.pageSubtitle}>Serious matters escalated from Counselling & Boarding</Text>
              </View>
              <TouchableOpacity style={styles.addBtn} onPress={() => setShowDisciplineModal(true)}>
                <Text style={styles.addBtnText}>+ Log Case</Text>
              </TouchableOpacity>
            </View>
            {hmStore.disciplineCases.map((item) => (
              <View key={item.id} style={styles.disciplineCard}>
                <View style={styles.disciplineHeader}>
                  <Text style={styles.disciplineStudent}>{item.student}</Text>
                  <View style={[styles.severityBadge,
                    item.severity === 'critical' ? { backgroundColor: colors.danger } :
                    item.severity === 'serious' ? { backgroundColor: colors.warning } :
                    { backgroundColor: colors.info }
                  ]}>
                    <Text style={styles.severityText}>{item.severity}</Text>
                  </View>
                </View>
                <Text style={styles.disciplineDetail}>Incident: {item.incident}</Text>
                <Text style={styles.disciplineDetail}>House: {item.house} | Date: {item.date} | Status: {item.status}</Text>
                {item.resolutionNotes && <Text style={styles.disciplineDetail}>Resolution: {item.resolutionNotes}</Text>}
                {item.status !== 'Resolved' && (
                  <View style={styles.approvalActions}>
                    {item.status !== 'Escalated' && (
                      <TouchableOpacity style={styles.rejectBtn} onPress={() => hmStore.escalateDisciplineCase(item.id)}>
                        <Text style={styles.rejectText}>Escalate</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.approveBtn} onPress={() => { setResolutionNotes(''); setShowResolveModal(item.id); }}>
                      <Text style={styles.approveText}>Resolve</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        );

      case 'users':
        return (
          <ScrollView>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.pageTitle}>User Management</Text>
                <Text style={styles.pageSubtitle}>Create and manage all system user accounts</Text>
              </View>
              <TouchableOpacity style={styles.addBtn} onPress={() => setShowUserModal(true)}>
                <Text style={styles.addBtnText}>+ Add User</Text>
              </TouchableOpacity>
            </View>
            <CardGrid>
              <StatCard label="Total Users" value={sysAdminStore.users.length} accentColor={colors.primary} />
              <StatCard label="Active" value={sysAdminStore.users.filter((u) => u.status === 'Active').length} accentColor={colors.success} />
              <StatCard label="Suspended" value={sysAdminStore.users.filter((u) => u.status === 'Suspended').length} accentColor={colors.warning} />
              <StatCard label="Locked" value={sysAdminStore.users.filter((u) => u.status === 'Locked').length} accentColor={colors.danger} />
            </CardGrid>
            <DataTable
              columns={[
                { key: 'displayName', label: 'Name', render: (i: any) => i.displayName },
                { key: 'username', label: 'Username', render: (i: any) => i.username },
                { key: 'roles', label: 'Roles', render: (i: any) => (i.roles || []).map((r: string) => ALL_ROLES.find((ar) => ar.id === r)?.label || r).join(', ') },
                { key: 'status', label: 'Status', render: (i: any) => i.status },
                { key: 'lastLogin', label: 'Last Login', render: (i: any) => i.lastLogin || 'Never' },
              ]}
              data={sysAdminStore.users as any}
            />
            {sysAdminStore.users.map((u) => (
              <View key={u.id} style={styles.userActionRow}>
                <View style={styles.userActionInfo}>
                  <Text style={styles.userActionName}>{u.displayName}</Text>
                  <Text style={styles.userActionSub}>{u.username} — {u.status}{u.failedAttempts > 0 ? ` (${u.failedAttempts} failed attempts)` : ''}</Text>
                </View>
                <View style={styles.userActionButtons}>
                  <TouchableOpacity style={styles.userMiniBtn} onPress={() => { setRoleDraft([...u.roles]); setShowRoleModal(u); }}>
                    <Text style={styles.userMiniBtnText}>Roles</Text>
                  </TouchableOpacity>
                  {u.status === 'Locked' && (
                    <TouchableOpacity style={styles.userMiniBtn} onPress={() => { sysAdminStore.unlockUser(u.id); Alert.alert('Unlocked', `${u.displayName} has been unlocked.`); }}>
                      <Text style={styles.userMiniBtnText}>Unlock</Text>
                    </TouchableOpacity>
                  )}
                  {u.status === 'Suspended' ? (
                    <TouchableOpacity style={styles.userMiniBtn} onPress={() => { sysAdminStore.updateUserStatus(u.id, 'Active'); Alert.alert('Activated', `${u.displayName} reactivated.`); }}>
                      <Text style={styles.userMiniBtnText}>Activate</Text>
                    </TouchableOpacity>
                  ) : u.status === 'Active' && (
                    <TouchableOpacity style={styles.userMiniBtnDanger} onPress={() => { sysAdminStore.updateUserStatus(u.id, 'Suspended'); Alert.alert('Suspended', `${u.displayName} suspended.`); }}>
                      <Text style={styles.userMiniBtnText}>Suspend</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.userMiniBtn} onPress={() => { sysAdminStore.resetUserPassword(u.id); Alert.alert('Password Reset', `Password reset link sent to ${u.displayName}.`); }}>
                    <Text style={styles.userMiniBtnText}>Reset PW</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.userMiniBtnDanger} onPress={() => Alert.alert('Delete User', `Permanently delete ${u.displayName}?`, [{ text: 'Cancel' }, { text: 'Delete', onPress: () => { sysAdminStore.deleteUser(u.id); Alert.alert('Deleted', `${u.displayName} removed.`); } }])}>
                    <Text style={styles.userMiniBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        );

      case 'access':
        return (
          <ScrollView>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.pageTitle}>Access Control</Text>
                <Text style={styles.pageSubtitle}>Assign dashboards or specific pages to any user</Text>
              </View>
              <TouchableOpacity style={styles.addBtn} onPress={openNewAccessModal}>
                <Text style={styles.addBtnText}>+ Assign Access</Text>
              </TouchableOpacity>
            </View>

            <CardGrid>
              <StatCard label="Total Grants" value={accessStore.grants.length} accentColor={colors.primary} />
              <StatCard label="Full Dashboard" value={accessStore.grants.filter((g) => g.allowedPages === 'all').length} accentColor={colors.success} />
              <StatCard label="Page-Level" value={accessStore.grants.filter((g) => g.allowedPages !== 'all').length} accentColor={colors.info} />
              <StatCard label="Users with Grants" value={new Set(accessStore.grants.map((g) => g.userId)).size} accentColor={colors.warning} />
            </CardGrid>

            {/* Search bar */}
            <View style={styles.accessSearchRow}>
              <TextInput
                style={styles.accessSearchInput}
                placeholder="Search by user or dashboard..."
                value={accessSearch}
                onChangeText={setAccessSearch}
              />
            </View>

            {/* Filter tabs */}
            <View style={styles.accessFilterRow}>
              <TouchableOpacity style={[styles.accessFilterTab, accessFilter === 'all' && styles.accessFilterTabActive]} onPress={() => setAccessFilter('all')}>
                <Text style={[styles.accessFilterTabText, accessFilter === 'all' && styles.accessFilterTabTextActive]}>All ({accessStore.grants.length})</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.accessFilterTab, accessFilter === 'full' && styles.accessFilterTabActive]} onPress={() => setAccessFilter('full')}>
                <Text style={[styles.accessFilterTabText, accessFilter === 'full' && styles.accessFilterTabTextActive]}>Full Dashboard ({accessStore.grants.filter((g) => g.allowedPages === 'all').length})</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.accessFilterTab, accessFilter === 'page' && styles.accessFilterTabActive]} onPress={() => setAccessFilter('page')}>
                <Text style={[styles.accessFilterTabText, accessFilter === 'page' && styles.accessFilterTabTextActive]}>Page-Level ({accessStore.grants.filter((g) => g.allowedPages !== 'all').length})</Text>
              </TouchableOpacity>
            </View>

            {accessStore.grants.length === 0 && (
              <View style={styles.accessEmptyState}>
                <Text style={styles.accessEmptyTitle}>No Access Assignments Yet</Text>
                <Text style={styles.accessEmptyDesc}>
                  Click "+ Assign Access" to grant a user access to a full dashboard or specific pages within a dashboard.
                  Users will see assigned dashboards in their "Assigned Roles" page.
                </Text>
              </View>
            )}

            {/* Grants grouped by user */}
            {Object.entries(grantsByUser).map(([uid, info]) => {
              const targetUser = sysAdminStore.users.find((u) => u.id === uid);
              return (
                <View key={uid} style={styles.accessUserGroup}>
                  <View style={styles.accessUserHeader}>
                    <View style={styles.accessUserAvatar}>
                      <Text style={styles.accessUserAvatarText}>{info.displayName.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.accessUserInfo}>
                      <Text style={styles.accessUserGroupName}>{info.displayName}</Text>
                      <Text style={styles.accessUserMeta}>
                        @{info.username} · {targetUser?.roles.map((r) => ROLE_LABELS[r as RoleId] ?? r).join(', ') || 'No roles'}
                      </Text>
                    </View>
                    <View style={styles.accessUserBadge}>
                      <Text style={styles.accessUserBadgeText}>{info.grants.length} grant{info.grants.length > 1 ? 's' : ''}</Text>
                    </View>
                  </View>
                  {info.grants.map((grant) => (
                    <View key={grant.id} style={styles.accessGrantCard}>
                      <View style={styles.accessGrantLeft}>
                        <View style={styles.accessGrantIconRow}>
                          <Text style={styles.accessGrantDashName}>{grant.dashboardLabel}</Text>
                          {grant.allowedPages === 'all' ? (
                            <View style={styles.accessFullBadge}>
                              <Text style={styles.accessFullBadgeText}>FULL ACCESS</Text>
                            </View>
                          ) : (
                            <View style={styles.accessPageBadge}>
                              <Text style={styles.accessPageBadgeText}>{grant.allowedPages.length} PAGE{grant.allowedPages.length > 1 ? 'S' : ''}</Text>
                            </View>
                          )}
                        </View>
                        {grant.allowedPages !== 'all' && (
                          <View style={styles.accessPageChips}>
                            {grant.allowedPages.map((pk) => {
                              const pageDef = DASHBOARD_MAP[grant.dashboardKey]?.pages.find((p) => p.key === pk);
                              return (
                                <View key={pk} style={styles.accessPageChip}>
                                  <Text style={styles.accessPageChipText}>{pageDef?.label ?? pk}</Text>
                                </View>
                              );
                            })}
                          </View>
                        )}
                        <Text style={styles.grantMeta}>Granted by {grant.grantedBy} on {grant.grantedAt.slice(0, 10)}</Text>
                      </View>
                      <View style={styles.accessGrantActions}>
                        <TouchableOpacity style={styles.userMiniBtn} onPress={() => handleEditAccess(grant.id)}>
                          <Text style={styles.userMiniBtnText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.userMiniBtnDanger} onPress={() => handleRevokeAccess(grant.id)}>
                          <Text style={styles.userMiniBtnText}>Revoke</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              );
            })}
          </ScrollView>
        );

      case 'menu':
        return (
          <View>
            <KitchenMenuWidget role="Headmaster" />
          </View>
        );
      case 'sync':
        return (
          <ScrollView>
            <Text style={styles.pageTitle}>Sync & Data Health</Text>
            <Text style={styles.pageSubtitle}>Database and device sync status across the school</Text>
            <CardGrid>
              <StatCard label="DB Status" value={sysAdminStore.dbHealth.status} accentColor={sysAdminStore.dbHealth.status === 'Healthy' ? colors.success : colors.warning} />
              <StatCard label="Last Sync" value={sysAdminStore.dbHealth.lastSync.split(' ')[1] || sysAdminStore.dbHealth.lastSync} accentColor={colors.info} />
              <StatCard label="Pending Changes" value={sysAdminStore.dbHealth.pendingChanges} accentColor={sysAdminStore.dbHealth.pendingChanges > 0 ? colors.warning : colors.success} />
              <StatCard label="Failed Syncs" value={sysAdminStore.dbHealth.failedSyncs} accentColor={sysAdminStore.dbHealth.failedSyncs > 0 ? colors.danger : colors.success} />
            </CardGrid>
            <Text style={styles.sectionTitle}>Device Sync Log</Text>
            <DataTable
              columns={[
                { key: 'device', label: 'Device', render: (i: any) => i.device },
                { key: 'role', label: 'Role', render: (i: any) => i.role },
                { key: 'lastSync', label: 'Last Synced', render: (i: any) => i.lastSync },
                { key: 'pending', label: 'Pending', render: (i: any) => i.pending },
              ]}
              data={[
                { device: 'Office Desktop', role: 'Bursary', lastSync: '2 min ago', pending: '0' },
                { device: 'Registry PC', role: 'Registry', lastSync: '5 min ago', pending: '0' },
                { device: 'Security Tablet', role: 'Security', lastSync: '1 hr ago', pending: '3' },
                { device: 'Aggrey House Phone', role: 'Housemaster', lastSync: '3 hr ago', pending: '12' },
              ]}
            />
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      title="Headmaster"
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

      {/* ── Log Approval Modal ── */}
      <Modal visible={showApprovalModal} transparent animationType="fade" onRequestClose={() => setShowApprovalModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Log Approval Request</Text>
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.chipRow}>
                {APPROVAL_CATEGORIES.map((c) => (
                  <TouchableOpacity key={c} style={[styles.chip, approvalForm.category === c && styles.chipActive]} onPress={() => setApprovalForm((f) => ({ ...f, category: c }))}>
                    <Text style={[styles.chipText, approvalForm.category === c && styles.chipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.inputLabel}>Requester</Text>
              <TextInput style={styles.textInput} value={approvalForm.requester} onChangeText={(v) => setApprovalForm((f) => ({ ...f, requester: v }))} placeholder="e.g. Bursary" />
              <Text style={styles.inputLabel}>Department</Text>
              <TextInput style={styles.textInput} value={approvalForm.department} onChangeText={(v) => setApprovalForm((f) => ({ ...f, department: v }))} placeholder="e.g. Bursary" />
              <Text style={styles.inputLabel}>Details</Text>
              <TextInput style={[styles.textInput, { height: 80 }]} multiline value={approvalForm.details} onChangeText={(v) => setApprovalForm((f) => ({ ...f, details: v }))} placeholder="Describe the request" />
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalApproveBtn} onPress={handleAddApproval}>
                  <Text style={styles.modalBtnTextWhite}>Log Request</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowApprovalModal(false)}>
                  <Text style={styles.modalBtnTextSecondary}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Compose Broadcast Modal ── */}
      <Modal visible={showBroadcastModal} transparent animationType="fade" onRequestClose={() => setShowBroadcastModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Compose New Broadcast</Text>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput style={styles.textInput} value={broadcastForm.title} onChangeText={(v) => setBroadcastForm((f) => ({ ...f, title: v }))} placeholder="Broadcast title" />
              <Text style={styles.inputLabel}>Message</Text>
              <TextInput style={[styles.textInput, { height: 80 }]} multiline value={broadcastForm.body} onChangeText={(v) => setBroadcastForm((f) => ({ ...f, body: v }))} placeholder="Message body" />
              <Text style={styles.inputLabel}>Audience</Text>
              <View style={styles.chipRow}>
                {BROADCAST_AUDIENCES.map((a) => (
                  <TouchableOpacity key={a} style={[styles.chip, broadcastForm.audience === a && styles.chipActive]} onPress={() => setBroadcastForm((f) => ({ ...f, audience: a }))}>
                    <Text style={[styles.chipText, broadcastForm.audience === a && styles.chipTextActive]}>{a}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.inputLabel}>Priority</Text>
              <View style={styles.chipRow}>
                {BROADCAST_PRIORITIES.map((p) => (
                  <TouchableOpacity key={p} style={[styles.chip, broadcastForm.priority === p && styles.chipActive]} onPress={() => setBroadcastForm((f) => ({ ...f, priority: p }))}>
                    <Text style={[styles.chipText, broadcastForm.priority === p && styles.chipTextActive]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalApproveBtn} onPress={handleAddBroadcast}>
                  <Text style={styles.modalBtnTextWhite}>Send Broadcast</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowBroadcastModal(false)}>
                  <Text style={styles.modalBtnTextSecondary}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Log Discipline Case Modal ── */}
      <Modal visible={showDisciplineModal} transparent animationType="fade" onRequestClose={() => setShowDisciplineModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Log Discipline Case</Text>
              <Text style={styles.inputLabel}>Student Name</Text>
              <TextInput style={styles.textInput} value={disciplineForm.student} onChangeText={(v) => setDisciplineForm((f) => ({ ...f, student: v }))} placeholder="Student full name" />
              <Text style={styles.inputLabel}>House</Text>
              <View style={styles.chipRow}>
                {HOUSES.map((h) => (
                  <TouchableOpacity key={h} style={[styles.chip, disciplineForm.house === h && styles.chipActive]} onPress={() => setDisciplineForm((f) => ({ ...f, house: h }))}>
                    <Text style={[styles.chipText, disciplineForm.house === h && styles.chipTextActive]}>{h}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.inputLabel}>Incident</Text>
              <TextInput style={[styles.textInput, { height: 80 }]} multiline value={disciplineForm.incident} onChangeText={(v) => setDisciplineForm((f) => ({ ...f, incident: v }))} placeholder="Describe the incident" />
              <Text style={styles.inputLabel}>Severity</Text>
              <View style={styles.chipRow}>
                {DISCIPLINE_SEVERITIES.map((s) => (
                  <TouchableOpacity key={s} style={[styles.chip, disciplineForm.severity === s && styles.chipActive]} onPress={() => setDisciplineForm((f) => ({ ...f, severity: s }))}>
                    <Text style={[styles.chipText, disciplineForm.severity === s && styles.chipTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalApproveBtn} onPress={handleAddDiscipline}>
                  <Text style={styles.modalBtnTextWhite}>Log Case</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowDisciplineModal(false)}>
                  <Text style={styles.modalBtnTextSecondary}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Resolve Discipline Case Modal ── */}
      <Modal visible={!!showResolveModal} transparent animationType="fade" onRequestClose={() => setShowResolveModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Resolve Discipline Case</Text>
            <Text style={styles.inputLabel}>Resolution Notes</Text>
            <TextInput style={[styles.textInput, { height: 80 }]} multiline value={resolutionNotes} onChangeText={setResolutionNotes} placeholder="Describe how this case was resolved" />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalApproveBtn} onPress={() => { if (showResolveModal) { hmStore.resolveDisciplineCase(showResolveModal, resolutionNotes); } setShowResolveModal(null); }}>
                <Text style={styles.modalBtnTextWhite}>Mark Resolved</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowResolveModal(null)}>
                <Text style={styles.modalBtnTextSecondary}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Add Staff Modal ── */}
      <Modal visible={showStaffModal} transparent animationType="fade" onRequestClose={() => setShowStaffModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Add Staff Member</Text>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput style={styles.textInput} value={staffForm.name} onChangeText={(v) => setStaffForm((f) => ({ ...f, name: v }))} placeholder="Full name" />
              <Text style={styles.inputLabel}>Position</Text>
              <TextInput style={styles.textInput} value={staffForm.position} onChangeText={(v) => setStaffForm((f) => ({ ...f, position: v }))} placeholder="e.g. Senior Teacher" />
              <Text style={styles.inputLabel}>Department</Text>
              <TextInput style={styles.textInput} value={staffForm.department} onChangeText={(v) => setStaffForm((f) => ({ ...f, department: v }))} placeholder="e.g. Mathematics" />
              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput style={styles.textInput} value={staffForm.phone} onChangeText={(v) => setStaffForm((f) => ({ ...f, phone: v }))} placeholder="Phone number" />
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput style={styles.textInput} value={staffForm.email} onChangeText={(v) => setStaffForm((f) => ({ ...f, email: v }))} placeholder="Email address" />
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalApproveBtn} onPress={handleAddStaff}>
                  <Text style={styles.modalBtnTextWhite}>Add Staff</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowStaffModal(false)}>
                  <Text style={styles.modalBtnTextSecondary}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Add User Modal ── */}
      <Modal visible={showUserModal} transparent animationType="fade" onRequestClose={() => setShowUserModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Create New User Account</Text>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput style={styles.textInput} value={userForm.username} onChangeText={(v) => setUserForm((f) => ({ ...f, username: v }))} placeholder="e.g. jmensah" autoCapitalize="none" />
              <Text style={styles.inputLabel}>Display Name</Text>
              <TextInput style={styles.textInput} value={userForm.displayName} onChangeText={(v) => setUserForm((f) => ({ ...f, displayName: v }))} placeholder="e.g. John Mensah" />
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput style={styles.textInput} value={userForm.email} onChangeText={(v) => setUserForm((f) => ({ ...f, email: v }))} placeholder="e.g. jmensah@sims.edu" autoCapitalize="none" />
              <Text style={styles.inputLabel}>Status</Text>
              <View style={styles.chipRow}>
                {USER_STATUSES.map((s) => (
                  <TouchableOpacity key={s} style={[styles.chip, userForm.status === s && styles.chipActive]} onPress={() => setUserForm((f) => ({ ...f, status: s }))}>
                    <Text style={[styles.chipText, userForm.status === s && styles.chipTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.inputLabel}>Roles (select one or more)</Text>
              <View style={styles.chipRow}>
                {ALL_ROLES.map((r) => (
                  <TouchableOpacity key={r.id} style={[styles.chip, userForm.roles.includes(r.id) && styles.chipActive]} onPress={() => toggleRoleInForm(r.id)}>
                    <Text style={[styles.chipText, userForm.roles.includes(r.id) && styles.chipTextActive]}>{r.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalApproveBtn} onPress={handleAddUser}>
                  <Text style={styles.modalBtnTextWhite}>Create User</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowUserModal(false)}>
                  <Text style={styles.modalBtnTextSecondary}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Edit Roles Modal ── */}
      <Modal visible={!!showRoleModal} transparent animationType="fade" onRequestClose={() => setShowRoleModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Edit Roles — {showRoleModal?.displayName}</Text>
              <Text style={styles.inputLabel}>Assigned Roles</Text>
              <View style={styles.chipRow}>
                {ALL_ROLES.map((r) => (
                  <TouchableOpacity key={r.id} style={[styles.chip, roleDraft.includes(r.id) && styles.chipActive]} onPress={() => toggleRoleInDraft(r.id)}>
                    <Text style={[styles.chipText, roleDraft.includes(r.id) && styles.chipTextActive]}>{r.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalApproveBtn} onPress={handleSaveRoles}>
                  <Text style={styles.modalBtnTextWhite}>Save Roles</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowRoleModal(null)}>
                  <Text style={styles.modalBtnTextSecondary}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Access Control Assignment Modal ── */}
      <Modal visible={showAccessModal} transparent animationType="fade" onRequestClose={() => setShowAccessModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{editingGrantId ? 'Edit Access Assignment' : 'Assign Dashboard Access'}</Text>

              {/* Step 1: Select User */}
              <Text style={styles.accessStepLabel}>Step 1 — Select User</Text>
              {accessForm.userId ? (
                <View style={styles.accessSelectedUserCard}>
                  <View style={styles.accessSelectedUserLeft}>
                    <View style={styles.accessSelectedUserAvatar}>
                      <Text style={styles.accessSelectedUserAvatarText}>
                        {sysAdminStore.users.find((u) => u.id === accessForm.userId)?.displayName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.accessSelectedUserName}>
                        {sysAdminStore.users.find((u) => u.id === accessForm.userId)?.displayName}
                      </Text>
                      <Text style={styles.accessSelectedUserRoles}>
                        @{sysAdminStore.users.find((u) => u.id === accessForm.userId)?.username} · {' '}
                        {sysAdminStore.users.find((u) => u.id === accessForm.userId)?.roles.map((r) => ROLE_LABELS[r as RoleId] ?? r).join(', ') || 'No roles'}
                      </Text>
                      <Text style={[
                        styles.accessSelectedUserStatus,
                        { color: sysAdminStore.users.find((u) => u.id === accessForm.userId)?.status === 'Active' ? colors.success : colors.danger },
                      ]}>
                        {sysAdminStore.users.find((u) => u.id === accessForm.userId)?.status}
                      </Text>
                    </View>
                  </View>
                  {!editingGrantId && (
                    <TouchableOpacity onPress={() => setAccessForm((f) => ({ ...f, userId: '' }))}>
                      <Text style={styles.accessChangeLink}>Change</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View>
                  <TextInput
                    style={styles.accessSearchInput}
                    placeholder="Search users by name or username..."
                    value={accessSearch}
                    onChangeText={setAccessSearch}
                  />
                  <View style={styles.accessUserList}>
                    {sysAdminStore.users
                      .filter((u) => {
                        if (!accessSearch.trim()) return true;
                        const q = accessSearch.toLowerCase();
                        return u.displayName.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
                      })
                      .map((u) => (
                        <TouchableOpacity
                          key={u.id}
                          style={styles.accessUserListItem}
                          onPress={() => { setAccessForm((f) => ({ ...f, userId: u.id })); setAccessSearch(''); }}
                        >
                          <View style={styles.accessUserListItemAvatar}>
                            <Text style={styles.accessUserListItemAvatarText}>{u.displayName.charAt(0).toUpperCase()}</Text>
                          </View>
                          <View style={styles.accessUserListItemInfo}>
                            <Text style={styles.accessUserListItemName}>{u.displayName}</Text>
                            <Text style={styles.accessUserListItemRoles}>
                              @{u.username} · {u.roles.map((r) => ROLE_LABELS[r as RoleId] ?? r).join(', ')}
                            </Text>
                          </View>
                          <Text style={[styles.accessUserListItemStatus, { color: u.status === 'Active' ? colors.success : colors.danger }]}>
                            {u.status}
                          </Text>
                        </TouchableOpacity>
                      ))}
                  </View>
                </View>
              )}

              {/* Step 2: Select Dashboard */}
              {accessForm.userId ? (
                <>
                  <Text style={styles.accessStepLabel}>Step 2 — Select Dashboard</Text>
                  {accessForm.dashboardKey ? (
                    <View style={styles.accessSelectedDashCard}>
                      <View>
                        <Text style={styles.accessSelectedDashName}>
                          {DASHBOARD_MAP[accessForm.dashboardKey]?.label}
                        </Text>
                        <Text style={styles.accessSelectedDashPages}>
                          {DASHBOARD_MAP[accessForm.dashboardKey]?.pages.length} pages available · Role: {ROLE_LABELS[DASHBOARD_MAP[accessForm.dashboardKey]?.role as RoleId] ?? 'N/A'}
                        </Text>
                      </View>
                      {!editingGrantId && (
                        <TouchableOpacity onPress={() => setAccessForm((f) => ({ ...f, dashboardKey: '', allowedPages: [] }))}>
                          <Text style={styles.accessChangeLink}>Change</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ) : (
                    <View>
                      {DASHBOARD_CATEGORIES.map((cat) => (
                        <View key={cat.label} style={styles.accessDashCategory}>
                          <Text style={styles.accessDashCategoryLabel}>{cat.label}</Text>
                          <View style={styles.chipRow}>
                            {cat.dashboards.map((d) => (
                              <TouchableOpacity
                                key={d.key}
                                style={[styles.chip, accessForm.dashboardKey === d.key && styles.chipActive]}
                                onPress={() => setAccessForm((f) => ({ ...f, dashboardKey: d.key, allowedPages: [] }))}
                              >
                                <Text style={[styles.chipText, accessForm.dashboardKey === d.key && styles.chipTextActive]}>{d.label}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </>
              ) : null}

              {/* Step 3: Access Scope */}
              {accessForm.dashboardKey ? (
                <>
                  <Text style={styles.accessStepLabel}>Step 3 — Access Scope</Text>
                  <View style={styles.accessScopeRow}>
                    <TouchableOpacity
                      style={[styles.accessScopeCard, accessForm.fullAccess && styles.accessScopeCardActive]}
                      onPress={() => setAccessForm((f) => ({ ...f, fullAccess: true, allowedPages: [] }))}
                    >
                      <Text style={styles.accessScopeCardIcon}>📊</Text>
                      <Text style={[styles.accessScopeCardTitle, accessForm.fullAccess && styles.accessScopeCardTitleActive]}>Full Dashboard</Text>
                      <Text style={styles.accessScopeCardDesc}>Grant access to all {DASHBOARD_MAP[accessForm.dashboardKey]?.pages.length} pages</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.accessScopeCard, !accessForm.fullAccess && styles.accessScopeCardActive]}
                      onPress={() => setAccessForm((f) => ({ ...f, fullAccess: false }))}
                    >
                      <Text style={styles.accessScopeCardIcon}>📄</Text>
                      <Text style={[styles.accessScopeCardTitle, !accessForm.fullAccess && styles.accessScopeCardTitleActive]}>Specific Pages</Text>
                      <Text style={styles.accessScopeCardDesc}>Choose individual pages to grant</Text>
                    </TouchableOpacity>
                  </View>

                  {!accessForm.fullAccess && (
                    <View style={styles.accessPageSelection}>
                      <View style={styles.accessPageSelectHeader}>
                        <Text style={styles.accessPageSelectTitle}>Select Pages</Text>
                        <View style={styles.accessPageSelectActions}>
                          <TouchableOpacity onPress={() => setAccessForm((f) => ({ ...f, allowedPages: DASHBOARD_MAP[f.dashboardKey]?.pages.map((p) => p.key) || [] }))}>
                            <Text style={styles.accessSelectAllLink}>Select All</Text>
                          </TouchableOpacity>
                          <Text style={styles.accessPageSelectSep}>·</Text>
                          <TouchableOpacity onPress={() => setAccessForm((f) => ({ ...f, allowedPages: [] }))}>
                            <Text style={styles.accessClearAllLink}>Clear</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      {DASHBOARD_MAP[accessForm.dashboardKey]?.pages.map((p) => {
                        const isSelected = accessForm.allowedPages.includes(p.key);
                        return (
                          <TouchableOpacity
                            key={p.key}
                            style={[styles.accessPageSelectItem, isSelected && styles.accessPageSelectItemActive]}
                            onPress={() => togglePageInAccessForm(p.key)}
                          >
                            <View style={[styles.accessPageCheckbox, isSelected && styles.accessPageCheckboxActive]}>
                              {isSelected && <Text style={styles.accessPageCheckmark}>✓</Text>}
                            </View>
                            <Text style={[styles.accessPageSelectLabel, isSelected && styles.accessPageSelectLabelActive]}>{p.label}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </>
              ) : null}

              {/* Summary */}
              {accessForm.userId && accessForm.dashboardKey && (accessForm.fullAccess || accessForm.allowedPages.length > 0) ? (
                <View style={styles.accessSummary}>
                  <Text style={styles.accessSummaryTitle}>📋 Assignment Summary</Text>
                  <Text style={styles.accessSummaryLine}>
                    <Text style={styles.accessSummaryLabel}>User: </Text>
                    {sysAdminStore.users.find((u) => u.id === accessForm.userId)?.displayName}
                  </Text>
                  <Text style={styles.accessSummaryLine}>
                    <Text style={styles.accessSummaryLabel}>Dashboard: </Text>
                    {DASHBOARD_MAP[accessForm.dashboardKey]?.label}
                  </Text>
                  <Text style={styles.accessSummaryLine}>
                    <Text style={styles.accessSummaryLabel}>Access: </Text>
                    {accessForm.fullAccess
                      ? `Full Dashboard (${DASHBOARD_MAP[accessForm.dashboardKey]?.pages.length} pages)`
                      : `${accessForm.allowedPages.length} page${accessForm.allowedPages.length > 1 ? 's' : ''} — ${accessForm.allowedPages.map((pk) => DASHBOARD_MAP[accessForm.dashboardKey]?.pages.find((p) => p.key === pk)?.label || pk).join(', ')}`}
                  </Text>
                  <Text style={styles.accessSummaryLine}>
                    <Text style={styles.accessSummaryLabel}>Role to add: </Text>
                    {ROLE_LABELS[DASHBOARD_MAP[accessForm.dashboardKey]?.role as RoleId] ?? 'N/A'}
                  </Text>
                </View>
              ) : null}

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalApproveBtn} onPress={handleAssignAccess}>
                  <Text style={styles.modalBtnTextWhite}>{editingGrantId ? 'Update Access' : 'Assign Access'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => { setShowAccessModal(false); setEditingGrantId(null); }}>
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
  pageTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  pageSubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  addBtnText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textLight,
    fontStyle: 'italic',
    paddingVertical: spacing.md,
  },
  quickApprovalRow: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  quickApprovalText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  viewAllBtn: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  viewAllBtnText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  approvalDetails: {
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.md,
  },
  grantRow: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grantInfo: {
    flex: 1,
  },
  grantUserName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  grantDashName: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
    marginTop: 2,
  },
  grantPages: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 4,
  },
  grantMeta: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
    opacity: 0.7,
  },
  userActionRow: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  userActionInfo: {
    flex: 1,
    minWidth: 150,
  },
  userActionName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  userActionSub: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  userActionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  userMiniBtn: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userMiniBtnDanger: {
    backgroundColor: colors.danger,
    borderRadius: radius.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  userMiniBtnText: {
    fontSize: fontSize.xs,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  chipTextActive: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalApproveBtn: {
    backgroundColor: colors.success,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flex: 1,
    alignItems: 'center',
  },
  modalCancelBtn: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flex: 1,
    alignItems: 'center',
  },
  modalBtnTextWhite: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  modalBtnTextSecondary: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  approvalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  approvalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  approvalType: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  approvalDate: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  approvalRequester: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  approvalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  approveBtn: {
    backgroundColor: colors.success,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  approveText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  rejectBtn: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  rejectText: {
    color: colors.danger,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  reportCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  reportAction: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  composeBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  composeText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  messageCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  messageTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  messagePreview: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  messageMeta: {
    fontSize: fontSize.xs,
    color: colors.textLight,
  },
  disciplineCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  disciplineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  disciplineStudent: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  severityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  severityText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'capitalize',
  },
  disciplineDetail: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  logoutBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  logoutText: {
    color: colors.danger,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  // ── Access Control Page Styles ──
  accessSearchRow: {
    marginBottom: spacing.sm,
  },
  accessSearchInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  accessFilterRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  accessFilterTab: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  accessFilterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  accessFilterTabText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  accessFilterTabTextActive: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
  accessEmptyState: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  accessEmptyTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  accessEmptyDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  accessUserGroup: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  accessUserHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.sm,
  },
  accessUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  accessUserAvatarText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  accessUserInfo: {
    flex: 1,
  },
  accessUserGroupName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  accessUserMeta: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  accessUserBadge: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  accessUserBadgeText: {
    fontSize: fontSize.xs,
    color: colors.accent,
    fontWeight: fontWeight.semibold,
  },
  accessGrantCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  accessGrantLeft: {
    flex: 1,
  },
  accessGrantIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  accessGrantDashName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  accessFullBadge: {
    backgroundColor: 'rgba(34, 139, 34, 0.15)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  accessFullBadgeText: {
    fontSize: 10,
    color: colors.success,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
  accessPageBadge: {
    backgroundColor: 'rgba(50, 130, 184, 0.15)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  accessPageBadgeText: {
    fontSize: 10,
    color: colors.info,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
  accessPageChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  accessPageChip: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  accessPageChipText: {
    fontSize: fontSize.xs,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  accessGrantActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  // ── Access Control Modal Styles ──
  accessStepLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  accessSelectedUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  accessSelectedUserLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accessSelectedUserAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  accessSelectedUserAvatarText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.primaryDark,
  },
  accessSelectedUserName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  accessSelectedUserRoles: {
    fontSize: fontSize.xs,
    color: colors.accent,
    marginTop: 2,
  },
  accessSelectedUserStatus: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    marginTop: 2,
  },
  accessChangeLink: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  accessUserList: {
    maxHeight: 250,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  accessUserListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  accessUserListItemAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  accessUserListItemAvatarText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  accessUserListItemInfo: {
    flex: 1,
  },
  accessUserListItemName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  accessUserListItemRoles: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  accessUserListItemStatus: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  accessSelectedDashCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  accessSelectedDashName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  accessSelectedDashPages: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  accessDashCategory: {
    marginBottom: spacing.sm,
  },
  accessDashCategoryLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  accessScopeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  accessScopeCard: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  accessScopeCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  accessScopeCardIcon: {
    fontSize: fontSize.xl,
    marginBottom: spacing.xs,
  },
  accessScopeCardTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  accessScopeCardTitleActive: {
    color: colors.primary,
  },
  accessScopeCardDesc: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  accessPageSelection: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  accessPageSelectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  accessPageSelectTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  accessPageSelectActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  accessSelectAllLink: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  accessPageSelectSep: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  accessClearAllLink: {
    fontSize: fontSize.xs,
    color: colors.danger,
    fontWeight: fontWeight.semibold,
  },
  accessPageSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.sm,
    marginBottom: 2,
  },
  accessPageSelectItemActive: {
    backgroundColor: colors.primaryLight,
  },
  accessPageCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  accessPageCheckboxActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  accessPageCheckmark: {
    fontSize: 12,
    color: colors.white,
    fontWeight: fontWeight.bold,
  },
  accessPageSelectLabel: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  accessPageSelectLabelActive: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
  accessSummary: {
    backgroundColor: 'rgba(50, 130, 184, 0.08)',
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(50, 130, 184, 0.2)',
  },
  accessSummaryTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  accessSummaryLine: {
    fontSize: fontSize.xs,
    color: colors.text,
    marginTop: 4,
    lineHeight: 18,
  },
  accessSummaryLabel: {
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
});
