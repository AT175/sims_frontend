import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid, DataTable } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { apiClient } from '@shared/api/apiClient';

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'subscriptions', label: 'All Subscriptions' },
  { key: 'payments', label: 'Payment Records' },
  { key: 'expired', label: 'Expired & Inactive' },
  { key: 'reports', label: 'Reports' },
];

interface SubscriptionRecord {
  id: string;
  userId: string;
  tenantId: string;
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
  amount: number;
  currency: string;
  paymentMethod: string | null;
  paymentReference: string | null;
  paymentStatus: string | null;
  studentName: string | null;
  studentAdmissionNumber: string | null;
  createdAt: string;
}

interface SubscriptionStats {
  total: number;
  active: number;
  trial: number;
  annual: number;
  expired: number;
  revenue: number;
}

export function SubscriptionDashboard() {
  const [activePage, setActivePage] = useState('overview');
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [extendModal, setExtendModal] = useState<{ visible: boolean; userId: string; displayName: string }>({ visible: false, userId: '', displayName: '' });
  const [extendDays, setExtendDays] = useState('7');

  const loadData = useCallback(async () => {
    try {
      const [subsRes, statsRes] = await Promise.all([
        apiClient.get<SubscriptionRecord[]>('/subscriptions'),
        apiClient.get<SubscriptionStats>('/subscriptions/stats'),
      ]);
      setSubscriptions(subsRes || []);
      setStats(statsRes || null);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to load subscription data');
    } finally {
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExtend = async () => {
    const days = parseInt(extendDays, 10);
    if (!days || days <= 0) {
      Alert.alert('Error', 'Please enter a valid number of days');
      return;
    }
    try {
      await apiClient.post(`/subscriptions/extend?userId=${extendModal.userId}`, { days });
      Alert.alert('Success', `Subscription extended by ${days} days`);
      setExtendModal({ visible: false, userId: '', displayName: '' });
      setExtendDays('7');
      loadData();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to extend subscription');
    }
  };

  const handleCancel = (userId: string, name: string) => {
    Alert.alert(
      'Cancel Subscription',
      `Are you sure you want to cancel the subscription for ${name}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.post(`/subscriptions/cancel?userId=${userId}`, {});
              Alert.alert('Success', 'Subscription cancelled');
              loadData();
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to cancel subscription');
            }
          },
        },
      ],
    );
  };

  const activeSubs = subscriptions.filter((s) => s.status === 'active');
  const expiredSubs = subscriptions.filter((s) => s.status === 'expired' || s.status === 'cancelled');
  const paidSubs = subscriptions.filter((s) => s.paymentStatus === 'paid' || s.plan === 'annual');

  return (
    <DashboardLayout
      title="Subscription & Payment"
      navItems={NAV_ITEMS}
      activeKey={activePage}
      onNavigate={setActivePage}
    >
      {activePage === 'overview' && (
        <View>
          <CardGrid>
            <StatCard label="Total Subscriptions" value={stats?.total ?? 0} accentColor={colors.primary} />
            <StatCard label="Active" value={stats?.active ?? 0} accentColor={colors.success} />
            <StatCard label="Trial" value={stats?.trial ?? 0} accentColor={colors.info} />
            <StatCard label="Annual" value={stats?.annual ?? 0} accentColor={colors.warning} />
          </CardGrid>
          <CardGrid>
            <StatCard label="Expired" value={stats?.expired ?? 0} accentColor={colors.danger} />
            <StatCard label="Revenue (GHS)" value={stats?.revenue ?? 0} accentColor={colors.success} />
          </CardGrid>

          <Text style={styles.pageTitle}>Subscription Overview</Text>
          <Text style={styles.pageSubtitle}>Manage parent subscriptions and payments</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>How It Works</Text>
            <Text style={styles.infoText}>• Parents get a 30-day free trial when they set up their account</Text>
            <Text style={styles.infoText}>• After the trial, they must upgrade to annual (GHS 100/year)</Text>
            <Text style={styles.infoText}>• Parents who haven't upgraded cannot access the portal</Text>
            <Text style={styles.infoText}>• Use this dashboard to manage and monitor all subscriptions</Text>
          </View>

          <Text style={styles.sectionTitle}>Recent Subscriptions</Text>
          {activeSubs.slice(0, 5).map((sub) => (
            <View key={sub.id} style={styles.subCard}>
              <View style={styles.subHeader}>
                <Text style={styles.subName}>{sub.studentName || sub.userId}</Text>
                <Text style={[styles.badge, sub.plan === 'annual' ? styles.badgeAnnual : styles.badgeTrial]}>
                  {sub.plan.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.subDetail}>Status: {sub.status}</Text>
              <Text style={styles.subDetail}>Valid: {sub.startDate} → {sub.endDate}</Text>
              {sub.studentAdmissionNumber && <Text style={styles.subDetail}>Adm No: {sub.studentAdmissionNumber}</Text>}
            </View>
          ))}
        </View>
      )}

      {activePage === 'subscriptions' && (
        <View>
          <CardGrid>
            <StatCard label="Total" value={subscriptions.length} accentColor={colors.primary} />
            <StatCard label="Active" value={activeSubs.length} accentColor={colors.success} />
            <StatCard label="Expired" value={expiredSubs.length} accentColor={colors.danger} />
          </CardGrid>

          <Text style={styles.pageTitle}>All Subscriptions</Text>
          <Text style={styles.pageSubtitle}>View and manage all parent subscriptions</Text>

          {subscriptions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No subscriptions found.</Text>
            </View>
          ) : (
            <DataTable
              columns={[
                { key: 'studentName', label: 'Parent/Ward', render: (i: any) => i.studentName || i.userId },
                { key: 'plan', label: 'Plan', render: (i: any) => i.plan?.toUpperCase() },
                { key: 'status', label: 'Status', render: (i: any) => i.status },
                { key: 'endDate', label: 'Expires', render: (i: any) => i.endDate },
                { key: 'actions', label: 'Actions', render: (i: any) => (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.extendBtn}
                      onPress={() => setExtendModal({ visible: true, userId: i.userId, displayName: i.studentName || i.userId })}
                    >
                      <Text style={styles.extendBtnText}>Extend</Text>
                    </TouchableOpacity>
                    {i.status === 'active' && (
                      <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => handleCancel(i.userId, i.studentName || i.userId)}
                      >
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )},
              ]}
              data={subscriptions as any}
            />
          )}
        </View>
      )}

      {activePage === 'payments' && (
        <View>
          <CardGrid>
            <StatCard label="Paid Subscriptions" value={paidSubs.length} accentColor={colors.success} />
            <StatCard label="Total Revenue" value={`GHS ${stats?.revenue ?? 0}`} accentColor={colors.primary} />
          </CardGrid>

          <Text style={styles.pageTitle}>Payment Records</Text>
          <Text style={styles.pageSubtitle}>Track all subscription payments</Text>

          {paidSubs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No payment records found.</Text>
            </View>
          ) : (
            <DataTable
              columns={[
                { key: 'studentName', label: 'Parent/Ward', render: (i: any) => i.studentName || i.userId },
                { key: 'amount', label: 'Amount', render: (i: any) => `${i.currency} ${i.amount}` },
                { key: 'paymentMethod', label: 'Method', render: (i: any) => i.paymentMethod || '-' },
                { key: 'paymentReference', label: 'Reference', render: (i: any) => i.paymentReference || '-' },
                { key: 'endDate', label: 'Valid Until', render: (i: any) => i.endDate },
              ]}
              data={paidSubs as any}
            />
          )}
        </View>
      )}

      {activePage === 'expired' && (
        <View>
          <CardGrid>
            <StatCard label="Expired" value={expiredSubs.filter((s) => s.status === 'expired').length} accentColor={colors.danger} />
            <StatCard label="Cancelled" value={expiredSubs.filter((s) => s.status === 'cancelled').length} accentColor={colors.warning} />
          </CardGrid>

          <Text style={styles.pageTitle}>Expired & Inactive</Text>
          <Text style={styles.pageSubtitle}>Parents with expired or cancelled subscriptions</Text>

          {expiredSubs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No expired or cancelled subscriptions.</Text>
            </View>
          ) : (
            expiredSubs.map((sub) => (
              <View key={sub.id} style={styles.subCard}>
                <View style={styles.subHeader}>
                  <Text style={styles.subName}>{sub.studentName || sub.userId}</Text>
                  <Text style={[styles.badge, styles.badgeExpired]}>{sub.status.toUpperCase()}</Text>
                </View>
                <Text style={styles.subDetail}>Plan: {sub.plan}</Text>
                <Text style={styles.subDetail}>Expired: {sub.endDate}</Text>
                {sub.studentAdmissionNumber && <Text style={styles.subDetail}>Adm No: {sub.studentAdmissionNumber}</Text>}
                <TouchableOpacity
                  style={styles.extendBtn}
                  onPress={() => setExtendModal({ visible: true, userId: sub.userId, displayName: sub.studentName || sub.userId })}
                >
                  <Text style={styles.extendBtnText}>Reactivate / Extend</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      )}

      {activePage === 'reports' && (
        <View>
          <Text style={styles.pageTitle}>Reports</Text>
          <Text style={styles.pageSubtitle}>Subscription analytics and summaries</Text>

          <CardGrid>
            <StatCard label="Total Parents" value={stats?.total ?? 0} accentColor={colors.primary} />
            <StatCard label="Active" value={stats?.active ?? 0} accentColor={colors.success} />
            <StatCard label="Conversion Rate" value={stats && stats.total > 0 ? `${Math.round((stats.annual / stats.total) * 100)}%` : '0%'} accentColor={colors.info} />
            <StatCard label="Revenue" value={`GHS ${stats?.revenue ?? 0}`} accentColor={colors.success} />
          </CardGrid>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Summary</Text>
            <Text style={styles.infoText}>Total Subscriptions: {stats?.total ?? 0}</Text>
            <Text style={styles.infoText}>Active: {stats?.active ?? 0}</Text>
            <Text style={styles.infoText}>Trial: {stats?.trial ?? 0}</Text>
            <Text style={styles.infoText}>Annual (Paid): {stats?.annual ?? 0}</Text>
            <Text style={styles.infoText}>Expired: {stats?.expired ?? 0}</Text>
            <Text style={styles.infoText}>Total Revenue: GHS {stats?.revenue ?? 0}</Text>
          </View>
        </View>
      )}

      <Modal visible={extendModal.visible} animationType="slide" transparent onRequestClose={() => setExtendModal({ visible: false, userId: '', displayName: '' })}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Extend Subscription</Text>
            <Text style={styles.modalSubtitle}>{extendModal.displayName}</Text>

            <Text style={styles.inputLabel}>Days to extend</Text>
            <TextInput
              style={styles.input}
              value={extendDays}
              onChangeText={setExtendDays}
              placeholder="e.g. 7"
              placeholderTextColor={colors.textLight}
              keyboardType="numeric"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setExtendModal({ visible: false, userId: '', displayName: '' })}
              >
                <Text style={styles.modalBtnTextDark}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleExtend}>
                <Text style={styles.modalBtnTextLight}>Extend</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xs },
  pageSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  infoCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  infoTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
  infoText: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs },
  subCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  subHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  subName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  subDetail: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: 2 },
  badge: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.sm },
  badgeTrial: { backgroundColor: colors.info + '20', color: colors.info },
  badgeAnnual: { backgroundColor: colors.success + '20', color: colors.success },
  badgeExpired: { backgroundColor: colors.danger + '20', color: colors.danger },
  actionRow: { flexDirection: 'row', gap: spacing.xs },
  extendBtn: { backgroundColor: colors.primary + '20', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  extendBtnText: { fontSize: fontSize.xs, color: colors.primary, fontWeight: fontWeight.semibold },
  cancelBtn: { backgroundColor: colors.danger + '20', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  cancelBtnText: { fontSize: fontSize.xs, color: colors.danger, fontWeight: fontWeight.semibold },
  emptyState: { backgroundColor: colors.surfaceAlt, borderRadius: radius.lg, padding: spacing.xl, alignItems: 'center', marginTop: spacing.md },
  emptyStateText: { fontSize: fontSize.md, color: colors.textLight, textAlign: 'center' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: spacing.lg },
  modalContent: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, width: '100%', maxWidth: 400 },
  modalTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xs },
  modalSubtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.md },
  inputLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textSecondary, marginBottom: spacing.xs, marginTop: spacing.sm },
  input: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md, color: colors.text, marginBottom: spacing.sm, backgroundColor: colors.surfaceAlt },
  modalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  modalBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: colors.surfaceAlt },
  modalBtnSubmit: { backgroundColor: colors.primary },
  modalBtnTextDark: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  modalBtnTextLight: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.white },
});
