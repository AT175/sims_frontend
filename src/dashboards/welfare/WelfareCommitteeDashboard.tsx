import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid, DataTable } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useAuthStore } from '@store/authStore';

const NAV_ITEMS: NavItem[] = [
  { key: 'ledger', label: 'Welfare Fund Ledger' },
  { key: 'support', label: 'Support Requests' },
  { key: 'disbursement', label: 'Disbursement Approvals' },
  { key: 'membership', label: 'Membership Register' },
];

export function WelfareCommitteeDashboard() {
  const [activePage, setActivePage] = useState('ledger');
  const { logout } = useAuthStore();

  const renderPage = () => {
    switch (activePage) {
      case 'ledger':
        return (
          <View>
            <CardGrid>
              <StatCard label="Fund Balance" value="GH₵ 42,500" accentColor={colors.success} />
              <StatCard label="Contributions (Month)" value="GH₵ 3,480" accentColor={colors.primary} />
              <StatCard label="Disbursements (Month)" value="GH₵ 1,200" accentColor={colors.warning} />
            </CardGrid>
            <Text style={styles.pageTitle}>Welfare Fund Ledger</Text>
            <DataTable
              columns={[
                { key: 'date', label: 'Date', render: (i) => i.date },
                { key: 'description', label: 'Description', render: (i) => i.description },
                { key: 'type', label: 'Type', render: (i) => i.type },
                { key: 'amount', label: 'Amount', render: (i) => i.amount },
              ]}
              data={[
                { date: '2026-07-05', description: 'Monthly contributions - 87 staff', type: 'Income', amount: 'GH₵ 3,480' },
                { date: '2026-07-03', description: 'Bereavement support - Mr. Asante', type: 'Disbursement', amount: 'GH₵ 1,200' },
                { date: '2026-06-28', description: 'Medical assistance - Mrs. Owusu', type: 'Disbursement', amount: 'GH₵ 800' },
                { date: '2026-06-05', description: 'Monthly contributions - 85 staff', type: 'Income', amount: 'GH₵ 3,400' },
              ]}
            />
          </View>
        );
      case 'support':
        return (
          <View>
            <Text style={styles.pageTitle}>Support Requests</Text>
            <Text style={styles.pageSubtitle}>Staff applications for welfare assistance</Text>
            <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionBtnText}>+ Submit Support Request</Text></TouchableOpacity>
            <DataTable
              columns={[
                { key: 'date', label: 'Date', render: (i) => i.date },
                { key: 'applicant', label: 'Applicant', render: (i) => i.applicant },
                { key: 'reason', label: 'Reason', render: (i) => i.reason },
                { key: 'amount', label: 'Amount', render: (i) => i.amount },
                { key: 'status', label: 'Status', render: (i) => i.status },
              ]}
              data={[
                { date: '2026-07-05', applicant: 'Mr. Asante', reason: 'Bereavement', amount: 'GH₵ 1,200', status: 'Approved' },
                { date: '2026-07-02', applicant: 'Mrs. Owusu', reason: 'Medical bills', amount: 'GH₵ 800', status: 'Approved' },
                { date: '2026-06-28', applicant: 'Mr. Tetteh', reason: 'Funeral support', amount: 'GH₵ 500', status: 'Pending' },
              ]}
            />
          </View>
        );
      case 'disbursement':
        return (
          <View>
            <Text style={styles.pageTitle}>Disbursement Approvals</Text>
            <Text style={styles.pageSubtitle}>Committee reviews and approves/declines payouts</Text>
            {[
              { id: '1', applicant: 'Mr. Tetteh', reason: 'Funeral support', amount: 'GH₵ 500', status: 'Pending' },
              { id: '2', applicant: 'Ms. Adjei', reason: 'Hospital bills', amount: 'GH₵ 1,000', status: 'Pending' },
            ].map((item) => (
              <View key={item.id} style={styles.approvalCard}>
                <Text style={styles.approvalApplicant}>{item.applicant}</Text>
                <Text style={styles.approvalReason}>{item.reason} — {item.amount}</Text>
                <View style={styles.approvalActions}>
                  <TouchableOpacity style={styles.approveBtn}><Text style={styles.approveText}>Approve</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.rejectBtn}><Text style={styles.rejectText}>Decline</Text></TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );
      case 'membership':
        return (
          <View>
            <Text style={styles.pageTitle}>Membership Register</Text>
            <CardGrid>
              <StatCard label="Contributing Members" value="87" accentColor={colors.primary} />
              <StatCard label="Non-Contributing" value="5" accentColor={colors.warning} />
            </CardGrid>
            <DataTable
              columns={[
                { key: 'name', label: 'Name', render: (i) => i.name },
                { key: 'position', label: 'Position', render: (i) => i.position },
                { key: 'contributions', label: 'Contributions', render: (i) => i.contributions },
                { key: 'status', label: 'Status', render: (i) => i.status },
              ]}
              data={[
                { name: 'J. Mensah', position: 'Senior Teacher', contributions: 'Up to date', status: 'Active' },
                { name: 'G. Adjei', position: 'HOD Science', contributions: 'Up to date', status: 'Active' },
                { name: 'F. Boateng', position: 'Teacher', contributions: '2 months behind', status: 'Arrears' },
              ]}
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout title="Welfare Committee" navItems={NAV_ITEMS} activeKey={activePage} onNavigate={setActivePage}
      headerRight={<TouchableOpacity onPress={logout} style={styles.logoutBtn}><Text style={styles.logoutText}>Logout</Text></TouchableOpacity>}>
      {renderPage()}
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
  pageSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  actionBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm + 4, alignItems: 'center', marginBottom: spacing.lg },
  actionBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  approvalCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  approvalApplicant: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  approvalReason: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.md },
  approvalActions: { flexDirection: 'row', gap: spacing.sm },
  approveBtn: { backgroundColor: colors.success, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  approveText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  rejectBtn: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.danger },
  rejectText: { color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  logoutBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  logoutText: { color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
});
