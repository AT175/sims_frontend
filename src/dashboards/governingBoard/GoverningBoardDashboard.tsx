import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid, DataTable } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useAuthStore } from '@store/authStore';

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'policy', label: 'Policy Documents' },
  { key: 'budget', label: 'Budget Approvals' },
  { key: 'minutes', label: 'Meeting Minutes' },
  { key: 'reports', label: 'Reports' },
];

export function GoverningBoardDashboard() {
  const [activePage, setActivePage] = useState('overview');
  const { logout } = useAuthStore();

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return (
          <View>
            <CardGrid>
              <StatCard label="Enrollment" value="1,247" accentColor={colors.primary} />
              <StatCard label="Attendance" value="94.2%" accentColor={colors.success} />
              <StatCard label="Avg Exam Score" value="68.5%" accentColor={colors.info} />
              <StatCard label="Fee Collection" value="82%" accentColor={colors.accent} />
            </CardGrid>
            <Text style={styles.pageTitle}>Pending Board Actions</Text>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionTitle}>2 Policy Documents for Review</Text>
              <Text style={styles.actionSubtitle}>Submitted by Headmaster</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionTitle}>1 Budget Awaiting Approval</Text>
              <Text style={styles.actionSubtitle}>Term 3, 2026/2027</Text>
            </TouchableOpacity>
          </View>
        );
      case 'policy':
        return (
          <View>
            <Text style={styles.pageTitle}>Policy Documents</Text>
            <Text style={styles.pageSubtitle}>View and approve/reject draft policies</Text>
            {[
              { title: 'Student Code of Conduct (Revised)', submitted: 'Jul 01', status: 'Pending Review' },
              { title: 'Staff Leave Policy Amendment', submitted: 'Jun 25', status: 'Pending Review' },
              { title: 'Boarding House Rules Update', submitted: 'Jun 15', status: 'Approved' },
            ].map((item, i) => (
              <View key={i} style={styles.policyCard}>
                <Text style={styles.policyTitle}>{item.title}</Text>
                <Text style={styles.policyMeta}>Submitted: {item.submitted} | {item.status}</Text>
                {item.status === 'Pending Review' && (
                  <View style={styles.policyActions}>
                    <TouchableOpacity style={styles.approveBtn}><Text style={styles.approveText}>Approve</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.rejectBtn}><Text style={styles.rejectText}>Reject</Text></TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        );
      case 'budget':
        return (
          <View>
            <Text style={styles.pageTitle}>Budget Approvals</Text>
            <Text style={styles.pageSubtitle}>Review submitted termly/annual budgets</Text>
            <DataTable
              columns={[
                { key: 'department', label: 'Department', render: (i) => i.department },
                { key: 'allocated', label: 'Allocated', render: (i) => i.allocated },
                { key: 'spent', label: 'Spent', render: (i) => i.spent },
                { key: 'status', label: 'Status', render: (i) => i.status },
              ]}
              data={[
                { department: 'Academic', allocated: 'GH₵ 45,000', spent: 'GH₵ 28,000', status: 'Submitted' },
                { department: 'Domestic/Boarding', allocated: 'GH₵ 80,000', spent: 'GH₵ 52,000', status: 'Submitted' },
                { department: 'Administration', allocated: 'GH₵ 30,000', spent: 'GH₵ 18,500', status: 'Approved' },
              ]}
            />
            <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionBtnText}>Approve All Submitted</Text></TouchableOpacity>
          </View>
        );
      case 'minutes':
        return (
          <View>
            <Text style={styles.pageTitle}>Meeting Minutes</Text>
            <Text style={styles.pageSubtitle}>Past board meeting records and resolutions</Text>
            <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionBtnText}>+ Log Meeting Minutes</Text></TouchableOpacity>
            <DataTable
              columns={[
                { key: 'date', label: 'Date', render: (i) => i.date },
                { key: 'topic', label: 'Topic', render: (i) => i.topic },
                { key: 'resolutions', label: 'Resolutions', render: (i) => i.resolutions },
              ]}
              data={[
                { date: '2026-06-15', topic: 'Term 2 Review', resolutions: '3 passed' },
                { date: '2026-04-20', topic: 'Budget Approval', resolutions: '5 passed' },
                { date: '2026-02-10', topic: 'Annual Planning', resolutions: '7 passed' },
              ]}
            />
          </View>
        );
      case 'reports':
        return (
          <View>
            <Text style={styles.pageTitle}>Reports</Text>
            <Text style={styles.pageSubtitle}>Termly/annual reports compiled for board review</Text>
            {['Term 2 Academic Report', 'Term 2 Financial Summary', 'Annual School Performance Report', 'Boarding Operations Report'].map((r) => (
              <TouchableOpacity key={r} style={styles.reportCard}>
                <Text style={styles.reportTitle}>{r}</Text>
                <Text style={styles.reportAction}>View (PDF)</Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout title="Governing Board" navItems={NAV_ITEMS} activeKey={activePage} onNavigate={setActivePage}
      headerRight={<TouchableOpacity onPress={logout} style={styles.logoutBtn}><Text style={styles.logoutText}>Logout</Text></TouchableOpacity>}>
      {renderPage()}
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
  pageSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  actionCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  actionTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  actionSubtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  actionBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm + 4, alignItems: 'center', marginBottom: spacing.lg },
  actionBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  policyCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  policyTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  policyMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.md },
  policyActions: { flexDirection: 'row', gap: spacing.sm },
  approveBtn: { backgroundColor: colors.success, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  approveText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  rejectBtn: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.danger },
  rejectText: { color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  reportCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reportTitle: { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.text },
  reportAction: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.semibold },
  logoutBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  logoutText: { color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
});
