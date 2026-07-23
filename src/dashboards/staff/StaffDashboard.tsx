import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { DashboardLayout, NavItem, DataTable, StatCard, CardGrid, KitchenMenuWidget } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useAuthStore, useStaffStore } from '@store/index';
import { staffApi } from '@shared/api/staffApi';
import { LEAVE_TYPES } from '@store/index';

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'notice', label: 'Staff Notice Board' },
  { key: 'minutes', label: 'Meeting Minutes' },
  { key: 'resources', label: 'Resource Library' },
  { key: 'leave', label: 'Leave Requests' },
  { key: 'directory', label: 'Staff Directory' },
  { key: 'menu', label: "Today's Menu" },
  { key: 'reports', label: 'Reports' },
];

export function StaffDashboard() {
  const [activePage, setActivePage] = useState('overview');
  const { user, logout } = useAuthStore();
  const staffName = user?.displayName ?? 'Staff Member';

  const store = useStaffStore();
  const { notices, minutes, resources, leaveRequests, directory } = store;

  const [backendDirectory, setBackendDirectory] = useState<any[]>([]);
  const [backendLeave, setBackendLeave] = useState<any[]>([]);

  useEffect(() => {
    staffApi.getDirectory().then((data) => setBackendDirectory(data)).catch(() => {});
    staffApi.getLeaveRequests().then((data) => setBackendLeave(data)).catch(() => {});
  }, []);

  const allDirectory = backendDirectory.length > 0 ? backendDirectory.map((s: any) => ({
    id: s.id,
    name: s.name,
    role: s.role,
    position: s.position,
    department: s.department,
    phone: s.phone || '',
    email: s.email || '',
    status: s.status,
  })) : directory;

  const allLeaveRequests = backendLeave.length > 0 ? backendLeave.map((l: any) => ({
    id: l.id,
    staffName: l.staffName,
    staffRole: l.staffRole,
    dateSubmitted: l.createdAt ? new Date(l.createdAt).toISOString().slice(0, 10) : '',
    startDate: l.startDate,
    endDate: l.endDate,
    type: l.type,
    reason: l.reason,
    status: l.status,
    reviewedBy: l.reviewedBy,
    reviewDate: l.reviewDate,
    reviewNotes: l.reviewNotes,
  })) : leaveRequests;

  const pendingLeave = allLeaveRequests.filter((r) => r.status === 'Pending');
  const approvedLeave = allLeaveRequests.filter((r) => r.status === 'Approved');
  const onLeaveStaff = allDirectory.filter((d) => d.status === 'On Leave');
  const urgentNotices = notices.filter((n) => n.priority === 'Urgent');

  const renderBadge = (text: string, color: string) => (
    <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
      <Text style={[styles.statusText, { color }]}>{text}</Text>
    </View>
  );

  const generatePDF = (reportType: string) => {
    const now = new Date().toLocaleString();
    const dateStr = new Date().toISOString().slice(0, 10);

    let body = '';
    let title = '';

    if (reportType === 'full' || reportType === 'overview') {
      title = 'Staff Operations Overview';
      body += `<h2>Summary</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px">
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Total Staff</td><td style="padding:8px 12px;border:1px solid #ddd">${directory.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Active Staff</td><td style="padding:8px 12px;border:1px solid #ddd">${directory.filter((d: any) => d.status === 'Active').length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">On Leave</td><td style="padding:8px 12px;border:1px solid #ddd">${onLeaveStaff.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Notices Published</td><td style="padding:8px 12px;border:1px solid #ddd">${notices.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Urgent Notices</td><td style="padding:8px 12px;border:1px solid #ddd">${urgentNotices.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Meeting Minutes Recorded</td><td style="padding:8px 12px;border:1px solid #ddd">${minutes.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Resources Available</td><td style="padding:8px 12px;border:1px solid #ddd">${resources.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Pending Leave Requests</td><td style="padding:8px 12px;border:1px solid #ddd">${pendingLeave.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Approved Leave (Total)</td><td style="padding:8px 12px;border:1px solid #ddd">${approvedLeave.length}</td></tr>
      </table>`;
    }

    if (reportType === 'full' || reportType === 'notices') {
      title = reportType === 'full' ? title : 'Staff Notice Board Report';
      body += `<h2>Staff Notices</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Date</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Title</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Priority</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Posted By</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Body</th>
      </tr></thead><tbody>`;
      notices.forEach((n: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${n.date}</td><td style="padding:4px 8px;border:1px solid #ddd">${n.title}</td><td style="padding:4px 8px;border:1px solid #ddd">${n.priority}</td><td style="padding:4px 8px;border:1px solid #ddd">${n.postedBy}</td><td style="padding:4px 8px;border:1px solid #ddd">${n.body}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'minutes') {
      title = reportType === 'full' ? title : 'Meeting Minutes Report';
      body += `<h2>Meeting Minutes</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Date</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Topic</th><th style="padding:6px 8px;border:1px solid #ddd">Attendees</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Facilitator</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Key Decisions</th>
      </tr></thead><tbody>`;
      minutes.forEach((m: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${m.date}</td><td style="padding:4px 8px;border:1px solid #ddd">${m.topic}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${m.attendees}</td><td style="padding:4px 8px;border:1px solid #ddd">${m.facilitator}</td><td style="padding:4px 8px;border:1px solid #ddd">${m.keyDecisions}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'leave') {
      title = reportType === 'full' ? title : 'Leave Requests Report';
      body += `<h2>Leave Requests</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Staff</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Type</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Start</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">End</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Reason</th><th style="padding:6px 8px;border:1px solid #ddd">Status</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Reviewed By</th>
      </tr></thead><tbody>`;
      leaveRequests.forEach((r: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${r.staffName}</td><td style="padding:4px 8px;border:1px solid #ddd">${r.type}</td><td style="padding:4px 8px;border:1px solid #ddd">${r.startDate}</td><td style="padding:4px 8px;border:1px solid #ddd">${r.endDate}</td><td style="padding:4px 8px;border:1px solid #ddd">${r.reason}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${r.status}</td><td style="padding:4px 8px;border:1px solid #ddd">${r.reviewedBy || '-'}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'directory') {
      title = reportType === 'full' ? 'Comprehensive Staff Report' : 'Staff Directory Report';
      body += `<h2>Staff Directory</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Name</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Position</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Department</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Phone</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Email</th><th style="padding:6px 8px;border:1px solid #ddd">Status</th>
      </tr></thead><tbody>`;
      directory.forEach((d: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${d.name}</td><td style="padding:4px 8px;border:1px solid #ddd">${d.position}</td><td style="padding:4px 8px;border:1px solid #ddd">${d.department}</td><td style="padding:4px 8px;border:1px solid #ddd">${d.phone}</td><td style="padding:4px 8px;border:1px solid #ddd">${d.email}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${d.status}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'resources') {
      title = reportType === 'full' ? 'Comprehensive Staff Report' : 'Resource Library Report';
      body += `<h2>Resource Library</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Name</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Type</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Uploaded</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Uploaded By</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Description</th>
      </tr></thead><tbody>`;
      resources.forEach((r: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${r.name}</td><td style="padding:4px 8px;border:1px solid #ddd">${r.type}</td><td style="padding:4px 8px;border:1px solid #ddd">${r.uploaded}</td><td style="padding:4px 8px;border:1px solid #ddd">${r.uploadedBy}</td><td style="padding:4px 8px;border:1px solid #ddd">${r.description}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
      <style>*{font-family:'Segoe UI',Arial,sans-serif}body{padding:40px;color:#1A1A2E;max-width:900px;margin:0 auto}h1{color:#0F4C75;border-bottom:3px solid #0F4C75;padding-bottom:10px}h2{color:#2D3142;margin-top:30px}.header{display:flex;justify-content:space-between;margin-bottom:20px;font-size:12px;color:#888}.confidential{background:#FEF6E7;border-left:4px solid #F59E0B;padding:10px 15px;margin:15px 0;font-size:13px;color:#92400E}table{font-size:13px}th{font-weight:600}.footer{margin-top:40px;padding-top:15px;border-top:1px solid #ddd;font-size:11px;color:#aaa;text-align:center}@media print{body{padding:20px}}</style></head><body>
      <div class="header"><span>SIMS — Staff Portal</span><span>Generated: ${now}</span></div>
      <h1>${title}</h1><div class="confidential">INTERNAL USE — This report contains staff information for school administration purposes.</div>${body}
      <div class="footer">SIMS — Staff Report — ${dateStr}</div>
      <script>window.onload=function(){window.print()}</script></body></html>`;

    const printWin = window.open('', '_blank');
    if (printWin) { printWin.document.write(html); printWin.document.close(); }
    else { Alert.alert('Popup Blocked', 'Please allow popups to generate PDF reports.'); }
  };

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return (
          <ScrollView>
            <Text style={styles.pageTitle}>Staff Overview</Text>
            <Text style={styles.pageSubtitle}>Welcome, {staffName}</Text>
            <CardGrid>
              <StatCard label="Total Staff" value={allDirectory.length} accentColor={colors.primary} />
              <StatCard label="Active" value={allDirectory.filter((d) => d.status === 'Active').length} accentColor={colors.success} />
              <StatCard label="On Leave" value={onLeaveStaff.length} accentColor={colors.warning} />
              <StatCard label="Pending Leave" value={pendingLeave.length} accentColor={colors.danger} />
              <StatCard label="Notices" value={notices.length} accentColor={colors.info} />
              <StatCard label="Urgent Notices" value={urgentNotices.length} accentColor={colors.danger} />
              <StatCard label="Meeting Minutes" value={minutes.length} accentColor={colors.purple} />
              <StatCard label="Resources" value={resources.length} accentColor={colors.accent} />
            </CardGrid>

            {pendingLeave.length > 0 && (
              <View style={{ marginTop: spacing.lg }}>
                <Text style={styles.sectionTitle}>Pending Leave Requests</Text>
                {pendingLeave.map((r) => (
                  <View key={r.id} style={styles.pendingCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pendingTitle}>{r.staffName} — {r.type} Leave</Text>
                      <Text style={styles.pendingMeta}>{r.startDate} to {r.endDate}</Text>
                      <Text style={styles.pendingReason}>{r.reason}</Text>
                    </View>
                    {renderBadge('Pending', colors.warning)}
                  </View>
                ))}
              </View>
            )}

            {urgentNotices.length > 0 && (
              <View style={{ marginTop: spacing.lg }}>
                <Text style={styles.sectionTitle}>Urgent Notices</Text>
                {urgentNotices.map((n) => (
                  <View key={n.id} style={styles.urgentCard}>
                    <Text style={styles.urgentTitle}>{n.title}</Text>
                    <Text style={styles.noticeBody}>{n.body}</Text>
                    <Text style={styles.noticeDate}>{n.date} — {n.postedBy}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        );

      case 'notice':
        return <NoticePage notices={notices} renderBadge={renderBadge} />;

      case 'minutes':
        return <MinutesPage minutes={minutes} />;

      case 'resources':
        return <ResourcesPage resources={resources} />;

      case 'leave':
        return <LeavePage leaveRequests={allLeaveRequests} store={store} staffName={staffName} renderBadge={renderBadge} />;

      case 'menu':
        return (
          <ScrollView>
            <KitchenMenuWidget role="Staff" />
          </ScrollView>
        );

      case 'directory':
        return <DirectoryPage directory={allDirectory} renderBadge={renderBadge} />;

      case 'reports':
        return <ReportsPage store={store} generatePDF={generatePDF} />;

      default:
        return null;
    }
  };

  return (
    <DashboardLayout title="Staff" navItems={NAV_ITEMS} activeKey={activePage} onNavigate={setActivePage}
      headerRight={<TouchableOpacity onPress={logout} style={styles.logoutBtn}><Text style={styles.logoutText}>Logout</Text></TouchableOpacity>}>
      {renderPage()}
    </DashboardLayout>
  );
}

// ── Notice Page ──

function NoticePage({ notices, renderBadge }: any) {
  const priorityColor = (p: string) => p === 'Urgent' ? colors.danger : p === 'Important' ? colors.warning : colors.info;
  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Staff Notice Board</Text>
      <Text style={styles.pageSubtitle}>Circulars and memos from the administration</Text>
      {notices.length === 0 && <Text style={styles.emptyText}>No notices published.</Text>}
      {notices.map((n: any) => (
        <View key={n.id} style={styles.noticeCard}>
          <View style={styles.noticeHeader}>
            <Text style={styles.noticeTitle}>{n.title}</Text>
            {renderBadge(n.priority, priorityColor(n.priority))}
          </View>
          <Text style={styles.noticeBody}>{n.body}</Text>
          <Text style={styles.noticeDate}>{n.date} — Posted by {n.postedBy}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

// ── Minutes Page ──

function MinutesPage({ minutes }: any) {
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Meeting Minutes</Text>
      <Text style={styles.pageSubtitle}>Records of general staff meetings</Text>
      {minutes.map((m: any) => (
        <View key={m.id} style={styles.minutesCard}>
          <TouchableOpacity onPress={() => setExpanded(expanded === m.id ? null : m.id)}>
            <View style={styles.minutesHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.minutesTitle}>{m.topic}</Text>
                <Text style={styles.minutesMeta}>{m.date} — {m.facilitator} — {m.attendees} attendees — {m.location}</Text>
              </View>
              <Text style={styles.expandToggle}>{expanded === m.id ? '−' : '+'}</Text>
            </View>
          </TouchableOpacity>
          {expanded === m.id && (
            <View style={styles.minutesDetail}>
              <Text style={styles.minutesLabel}>Key Decisions:</Text>
              <Text style={styles.minutesText}>{m.keyDecisions}</Text>
              <Text style={styles.minutesLabel}>Action Items:</Text>
              <Text style={styles.minutesText}>{m.actionItems}</Text>
              <Text style={styles.minutesLabel}>Full Minutes:</Text>
              <Text style={styles.minutesText}>{m.minutes}</Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

// ── Resources Page ──

function ResourcesPage({ resources }: any) {
  const typeColor = (t: string) => t === 'Template' ? colors.info : t === 'Form' ? colors.purple : t === 'Policy' ? colors.danger : t === 'Document' ? colors.success : colors.textSecondary;
  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Resource Library</Text>
      <Text style={styles.pageSubtitle}>Shared forms, templates, and teaching resources</Text>
      {resources.map((r: any) => (
        <View key={r.id} style={styles.resourceCard}>
          <View style={styles.resourceHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.resourceName}>{r.name}</Text>
              <Text style={styles.resourceDesc}>{r.description}</Text>
            </View>
            <View style={[styles.typeBadge, { backgroundColor: typeColor(r.type) + '20' }]}>
              <Text style={[styles.typeText, { color: typeColor(r.type) }]}>{r.type}</Text>
            </View>
          </View>
          <View style={styles.resourceFooter}>
            <Text style={styles.resourceMeta}>Uploaded by {r.uploadedBy} on {r.uploaded}</Text>
            <Text style={styles.resourceSize}>{r.size}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// ── Leave Page ──

function LeavePage({ leaveRequests, store, staffName, renderBadge }: any) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: LEAVE_TYPES[0],
    startDate: '',
    endDate: '',
    reason: '',
  });

  const statusColor = (s: string) => s === 'Approved' ? colors.success : s === 'Rejected' ? colors.danger : colors.warning;

  const handleSubmit = () => {
    if (!form.startDate || !form.endDate || !form.reason) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    store.submitLeave({
      staffName,
      staffRole: 'Teacher',
      startDate: form.startDate,
      endDate: form.endDate,
      type: form.type,
      reason: form.reason,
    });
    setForm({ type: LEAVE_TYPES[0], startDate: '', endDate: '', reason: '' });
    setShowForm(false);
    Alert.alert('Success', 'Leave request submitted successfully.');
  };

  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Leave Requests</Text>
      <Text style={styles.pageSubtitle}>Submit and track leave applications</Text>

      <TouchableOpacity style={styles.actionBtn} onPress={() => setShowForm(true)}>
        <Text style={styles.actionBtnText}>+ Apply for Leave</Text>
      </TouchableOpacity>

      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Apply for Leave</Text>

            <Text style={styles.inputLabel}>Leave Type</Text>
            <View style={styles.pickerRow}>
              {LEAVE_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.pickerChip, form.type === t && styles.pickerChipActive]}
                  onPress={() => setForm({ ...form, type: t })}
                >
                  <Text style={[styles.pickerChipText, form.type === t && styles.pickerChipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Start Date (YYYY-MM-DD)</Text>
            <TextInput style={styles.textInput} value={form.startDate} onChangeText={(v) => setForm({ ...form, startDate: v })} placeholder="2026-07-15" />

            <Text style={styles.inputLabel}>End Date (YYYY-MM-DD)</Text>
            <TextInput style={styles.textInput} value={form.endDate} onChangeText={(v) => setForm({ ...form, endDate: v })} placeholder="2026-07-20" />

            <Text style={styles.inputLabel}>Reason</Text>
            <TextInput style={[styles.textInput, { minHeight: 60 }]} value={form.reason} onChangeText={(v) => setForm({ ...form, reason: v })} placeholder="Brief reason for leave..." multiline />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowForm(false)}>
                <Text style={styles.modalBtnTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleSubmit}>
                <Text style={styles.modalBtnTextSubmit}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <DataTable
        columns={[
          { key: 'staffName', label: 'Staff', render: (i: any) => i.staffName },
          { key: 'type', label: 'Type', render: (i: any) => i.type },
          { key: 'period', label: 'Period', render: (i: any) => `${i.startDate} → ${i.endDate}` },
          { key: 'status', label: 'Status', render: (i: any) => renderBadge(i.status, statusColor(i.status)) },
        ]}
        data={leaveRequests}
      />

      {leaveRequests.filter((r: any) => r.status === 'Approved' && r.reviewNotes).length > 0 && (
        <View style={{ marginTop: spacing.lg }}>
          <Text style={styles.sectionTitle}>Approved Leave Details</Text>
          {leaveRequests.filter((r: any) => r.status === 'Approved').map((r: any) => (
            <View key={r.id} style={styles.reviewCard}>
              <Text style={styles.reviewTitle}>{r.staffName} — {r.type}</Text>
              <Text style={styles.reviewMeta}>{r.startDate} to {r.endDate}</Text>
              <Text style={styles.reviewNotes}>Notes: {r.reviewNotes || 'No notes'}</Text>
              <Text style={styles.reviewBy}>Reviewed by {r.reviewedBy} on {r.reviewDate}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// ── Directory Page ──

function DirectoryPage({ directory, renderBadge }: any) {
  const statusColor = (s: string) => s === 'Active' ? colors.success : s === 'On Leave' ? colors.warning : colors.textLight;
  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Staff Directory</Text>
      <Text style={styles.pageSubtitle}>Internal contact list</Text>
      {directory.map((d: any) => (
        <View key={d.id} style={styles.directoryCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.directoryName}>{d.name}</Text>
            <Text style={styles.directoryPosition}>{d.position}</Text>
            <Text style={styles.directoryDept}>{d.department}</Text>
            <View style={styles.directoryContact}>
              <Text style={styles.directoryPhone}>📞 {d.phone}</Text>
              <Text style={styles.directoryEmail}>✉ {d.email}</Text>
            </View>
          </View>
          {renderBadge(d.status, statusColor(d.status))}
        </View>
      ))}
    </ScrollView>
  );
}

// ── Reports Page ──

function ReportsPage({ store, generatePDF }: any) {
  const { notices, minutes, resources, leaveRequests, directory } = store;
  const pendingLeave = leaveRequests.filter((r: any) => r.status === 'Pending');
  const approvedLeave = leaveRequests.filter((r: any) => r.status === 'Approved');
  const onLeaveStaff = directory.filter((d: any) => d.status === 'On Leave');
  const urgentNotices = notices.filter((n: any) => n.priority === 'Urgent');

  const reportTypes = [
    { key: 'overview', name: 'Operations Overview', desc: `${directory.length} staff, ${notices.length} notices, ${minutes.length} meetings`, color: colors.primary },
    { key: 'notices', name: 'Notice Board', desc: `${notices.length} notices, ${urgentNotices.length} urgent`, color: colors.info },
    { key: 'minutes', name: 'Meeting Minutes', desc: `${minutes.length} meetings recorded`, color: colors.purple },
    { key: 'leave', name: 'Leave Requests', desc: `${pendingLeave.length} pending, ${approvedLeave.length} approved`, color: colors.warning },
    { key: 'directory', name: 'Staff Directory', desc: `${directory.length} entries, ${onLeaveStaff.length} on leave`, color: colors.success },
    { key: 'resources', name: 'Resource Library', desc: `${resources.length} resources available`, color: colors.accent },
  ];

  const activeCount = directory.filter((d: any) => d.status === 'Active').length;
  const activePct = directory.length > 0 ? Math.round((activeCount / directory.length) * 100) : 0;
  const onLeavePct = directory.length > 0 ? Math.round((onLeaveStaff.length / directory.length) * 100) : 0;
  const pendingPct = leaveRequests.length > 0 ? Math.round((pendingLeave.length / leaveRequests.length) * 100) : 0;
  const approvedPct = leaveRequests.length > 0 ? Math.round((approvedLeave.length / leaveRequests.length) * 100) : 0;

  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Staff Reports</Text>
      <Text style={styles.pageSubtitle}>Generate printable PDF reports for staff operations</Text>

      <TouchableOpacity style={styles.pdfFullBtn} onPress={() => generatePDF('full')}>
        <Text style={styles.pdfFullBtnText}>Generate Full Report (PDF)</Text>
      </TouchableOpacity>

      <View style={styles.pdfBtnRow}>
        {reportTypes.map((r) => (
          <TouchableOpacity key={r.key} style={[styles.pdfBtn, { backgroundColor: r.color }]} onPress={() => generatePDF(r.key)}>
            <Text style={styles.pdfBtnText}>{r.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.reportHeaderRow}>
        <Text style={styles.sectionTitle}>Staff Status</Text>
        <TouchableOpacity onPress={() => generatePDF('directory')}><Text style={styles.pdfLink}>PDF</Text></TouchableOpacity>
      </View>
      <View style={styles.reportSectionCard}>
        <View style={styles.reportBarRow}>
          <Text style={styles.reportBarLabel}>Active</Text>
          <View style={styles.reportBarTrack}>
            <View style={[styles.reportBarFill, { width: `${activePct}%`, backgroundColor: colors.success }]} />
          </View>
          <Text style={styles.reportBarCount}>{activeCount}/{directory.length}</Text>
        </View>
        <View style={styles.reportBarRow}>
          <Text style={styles.reportBarLabel}>On Leave</Text>
          <View style={styles.reportBarTrack}>
            <View style={[styles.reportBarFill, { width: `${onLeavePct}%`, backgroundColor: colors.warning }]} />
          </View>
          <Text style={styles.reportBarCount}>{onLeaveStaff.length}</Text>
        </View>
      </View>

      <View style={styles.reportHeaderRow}>
        <Text style={styles.sectionTitle}>Leave Request Status</Text>
        <TouchableOpacity onPress={() => generatePDF('leave')}><Text style={styles.pdfLink}>PDF</Text></TouchableOpacity>
      </View>
      <View style={styles.reportSectionCard}>
        <View style={styles.reportBarRow}>
          <Text style={styles.reportBarLabel}>Pending</Text>
          <View style={styles.reportBarTrack}>
            <View style={[styles.reportBarFill, { width: `${pendingPct}%`, backgroundColor: colors.warning }]} />
          </View>
          <Text style={styles.reportBarCount}>{pendingLeave.length}</Text>
        </View>
        <View style={styles.reportBarRow}>
          <Text style={styles.reportBarLabel}>Approved</Text>
          <View style={styles.reportBarTrack}>
            <View style={[styles.reportBarFill, { width: `${approvedPct}%`, backgroundColor: colors.success }]} />
          </View>
          <Text style={styles.reportBarCount}>{approvedLeave.length}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
  pageSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  emptyText: { fontSize: fontSize.md, color: colors.textLight, textAlign: 'center', paddingVertical: spacing.xl },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.md },

  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  statusText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },

  // Notice
  noticeCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  noticeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  noticeTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, flex: 1, marginRight: spacing.sm },
  noticeBody: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  noticeDate: { fontSize: fontSize.xs, color: colors.textLight, marginTop: spacing.sm },

  // Minutes
  minutesCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  minutesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  minutesTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  minutesMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  expandToggle: { fontSize: fontSize.xl, color: colors.primary, fontWeight: fontWeight.bold, paddingHorizontal: spacing.sm },
  minutesDetail: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  minutesLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text, marginTop: spacing.sm },
  minutesText: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },

  // Resources
  resourceCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  resourceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  resourceName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, flex: 1, marginRight: spacing.sm },
  resourceDesc: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs, flex: 1, marginRight: spacing.sm },
  typeBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  typeText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  resourceFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.borderLight },
  resourceMeta: { fontSize: fontSize.xs, color: colors.textLight },
  resourceSize: { fontSize: fontSize.xs, color: colors.textLight, fontWeight: fontWeight.medium },

  // Leave
  actionBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm + 4, alignItems: 'center', marginBottom: spacing.lg },
  actionBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  reviewCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  reviewTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  reviewMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  reviewNotes: { fontSize: fontSize.sm, color: colors.text, marginTop: spacing.xs },
  reviewBy: { fontSize: fontSize.xs, color: colors.textLight, marginTop: spacing.xs },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  modalContent: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, width: '100%', maxWidth: 500 },
  modalTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.md },
  inputLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xs },
  textInput: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md, color: colors.text, marginBottom: spacing.sm },
  pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  pickerChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xs },
  pickerChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pickerChipText: { fontSize: fontSize.sm, color: colors.textSecondary },
  pickerChipTextActive: { color: colors.white, fontWeight: fontWeight.semibold },
  modalBtnRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  modalBtn: { flex: 1, borderRadius: radius.md, paddingVertical: spacing.sm + 2, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  modalBtnSubmit: { backgroundColor: colors.primary },
  modalBtnTextCancel: { color: colors.textSecondary, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  modalBtnTextSubmit: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },

  // Directory
  directoryCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  directoryName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  directoryPosition: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  directoryDept: { fontSize: fontSize.xs, color: colors.textLight, marginTop: 2 },
  directoryContact: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs },
  directoryPhone: { fontSize: fontSize.sm, color: colors.textSecondary },
  directoryEmail: { fontSize: fontSize.sm, color: colors.textSecondary },

  // Overview
  pendingCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pendingTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  pendingMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  pendingReason: { fontSize: fontSize.sm, color: colors.textLight, marginTop: 2 },
  urgentCard: { backgroundColor: colors.dangerBg, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderLeftWidth: 4, borderLeftColor: colors.danger },
  urgentTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.danger },

  // Reports
  pdfFullBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, marginBottom: spacing.md, alignItems: 'center' },
  pdfFullBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.bold },
  pdfBtnRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  pdfBtn: { borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, marginBottom: spacing.xs },
  pdfBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  pdfLink: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.bold },
  reportHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.sm },
  reportSectionCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  reportBarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  reportBarLabel: { fontSize: fontSize.sm, color: colors.textSecondary, width: 100, flexShrink: 0 },
  reportBarTrack: { flex: 1, height: 12, backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, marginHorizontal: spacing.sm, overflow: 'hidden' },
  reportBarFill: { height: '100%', borderRadius: radius.sm },
  reportBarCount: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text, width: 50, textAlign: 'right' },

  logoutBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  logoutText: { color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
});
