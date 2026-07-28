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
  { key: 'earnings-config', label: 'Earnings Config' },
  { key: 'payouts', label: 'Payout Disbursements' },
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
  const [earningsStats, setEarningsStats] = useState<any>(null);
  const [pendingPayouts, setPendingPayouts] = useState<any[]>([]);
  const [configForm, setConfigForm] = useState({ ratePerAction: '0.1', maxActionsPerDay: '100', minPayoutThreshold: '50', enabled: true });
  const [savingConfig, setSavingConfig] = useState(false);
  const [disburseModal, setDisburseModal] = useState<{ visible: boolean; payoutId: string; amount: number; momo: string }>({ visible: false, payoutId: '', amount: 0, momo: '' });
  const [disburseRef, setDisburseRef] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [subsRes, statsRes, earnCfgRes, earnStatsRes, payoutsRes] = await Promise.all([
        apiClient.get<SubscriptionRecord[]>('/subscriptions'),
        apiClient.get<SubscriptionStats>('/subscriptions/stats'),
        apiClient.get<any>('/earnings/config').catch(() => null),
        apiClient.get<any>('/earnings/stats').catch(() => null),
        apiClient.get<any[]>('/earnings/pending-payouts').catch(() => []),
      ]);
      setSubscriptions(subsRes || []);
      setStats(statsRes || null);
      if (earnCfgRes) {
        setConfigForm({
          ratePerAction: String(earnCfgRes.ratePerAction),
          maxActionsPerDay: String(earnCfgRes.maxActionsPerDay),
          minPayoutThreshold: String(earnCfgRes.minPayoutThreshold),
          enabled: earnCfgRes.enabled,
        });
      }
      if (earnStatsRes) setEarningsStats(earnStatsRes);
      setPendingPayouts(payoutsRes || []);
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

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      await apiClient.post('/earnings/config', {
        ratePerAction: parseFloat(configForm.ratePerAction),
        maxActionsPerDay: parseInt(configForm.maxActionsPerDay, 10),
        minPayoutThreshold: parseFloat(configForm.minPayoutThreshold),
        enabled: configForm.enabled,
      });
      Alert.alert('Success', 'Earnings configuration saved');
      loadData();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save config');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleDisburse = async () => {
    if (!disburseRef.trim()) {
      Alert.alert('Error', 'Please enter a payment reference');
      return;
    }
    try {
      await apiClient.post(`/earnings/disburse?payoutId=${disburseModal.payoutId}`, { reference: disburseRef.trim() });
      Alert.alert('Success', 'Payout disbursed successfully');
      setDisburseModal({ visible: false, payoutId: '', amount: 0, momo: '' });
      setDisburseRef('');
      loadData();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to disburse payout');
    }
  };

  const handleCancelPayout = (payoutId: string) => {
    Alert.alert(
      'Cancel Payout',
      'Are you sure you want to cancel this payout? The credits will be returned to the user.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.post(`/earnings/cancel-payout?payoutId=${payoutId}`);
              Alert.alert('Success', 'Payout cancelled');
              loadData();
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to cancel payout');
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

      {activePage === 'earnings-config' && (
        <View>
          <Text style={styles.pageTitle}>Earnings Configuration</Text>
          <Text style={styles.pageSubtitle}>Configure how portal users earn credits for activity</Text>

          {earningsStats && (
            <CardGrid>
              <StatCard label="Total Earned" value={`GHS ${Number(earningsStats.totalEarned || 0).toFixed(2)}`} accentColor={colors.success} />
              <StatCard label="Total Disbursed" value={`GHS ${Number(earningsStats.totalDisbursed || 0).toFixed(2)}`} accentColor={colors.primary} />
              <StatCard label="Pending Payouts" value={earningsStats.pendingPayouts || 0} accentColor={colors.warning} />
              <StatCard label="Active Users" value={earningsStats.uniqueUsers || 0} accentColor={colors.info} />
            </CardGrid>
          )}

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Earning Rules</Text>

            <Text style={styles.inputLabel}>Rate Per Action (GHS)</Text>
            <TextInput
              style={styles.input}
              value={configForm.ratePerAction}
              onChangeText={(v) => setConfigForm({ ...configForm, ratePerAction: v })}
              placeholder="0.10"
              placeholderTextColor={colors.textLight}
              keyboardType="decimal-pad"
            />

            <Text style={styles.inputLabel}>Max Actions Per Day</Text>
            <TextInput
              style={styles.input}
              value={configForm.maxActionsPerDay}
              onChangeText={(v) => setConfigForm({ ...configForm, maxActionsPerDay: v })}
              placeholder="100"
              placeholderTextColor={colors.textLight}
              keyboardType="number-pad"
            />

            <Text style={styles.inputLabel}>Minimum Payout Threshold (GHS)</Text>
            <TextInput
              style={styles.input}
              value={configForm.minPayoutThreshold}
              onChangeText={(v) => setConfigForm({ ...configForm, minPayoutThreshold: v })}
              placeholder="50"
              placeholderTextColor={colors.textLight}
              keyboardType="decimal-pad"
            />

            <TouchableOpacity
              style={[styles.selectChip, { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md }]}
              onPress={() => setConfigForm({ ...configForm, enabled: !configForm.enabled })}
            >
              <Text style={{ fontSize: fontSize.md, color: configForm.enabled ? colors.success : colors.textLight }}>
                {configForm.enabled ? '✓' : '○'}
              </Text>
              <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>
                Earnings program {configForm.enabled ? 'enabled' : 'disabled'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnSubmit, { marginTop: spacing.lg, opacity: savingConfig ? 0.6 : 1 }]}
              onPress={handleSaveConfig}
              disabled={savingConfig}
            >
              <Text style={styles.modalBtnTextLight}>{savingConfig ? 'Saving...' : 'Save Configuration'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Excluded Roles</Text>
            <Text style={styles.infoText}>The following roles do not earn credits:</Text>
            <Text style={styles.infoText}>• Parent • Student • PTA • Board of Governors</Text>
          </View>
        </View>
      )}

      {activePage === 'payouts' && (
        <View>
          <Text style={styles.pageTitle}>Payout Disbursements</Text>
          <Text style={styles.pageSubtitle}>Review and disburse pending payout claims</Text>

          {pendingPayouts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No pending payouts. All claims have been processed.</Text>
            </View>
          ) : (
            pendingPayouts.map((payout) => (
              <View key={payout.id} style={styles.infoCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
                  <Text style={styles.infoTitle}>GHS {Number(payout.amount).toFixed(2)}</Text>
                  <Text style={{ fontSize: fontSize.xs, color: colors.warning }}>PENDING</Text>
                </View>
                <Text style={styles.infoText}>User: {payout.userId}</Text>
                <Text style={styles.infoText}>Mobile Money: {payout.mobileMoneyNumber}</Text>
                <Text style={styles.infoText}>Requested: {new Date(payout.createdAt).toLocaleDateString()}</Text>

                <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.modalBtnSubmit, { flex: 1 }]}
                    onPress={() => {
                      setDisburseModal({ visible: true, payoutId: payout.id, amount: Number(payout.amount), momo: payout.mobileMoneyNumber });
                      setDisburseRef('');
                    }}
                  >
                    <Text style={styles.modalBtnTextLight}>Disburse</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.modalBtnCancel, { flex: 1 }]}
                    onPress={() => handleCancelPayout(payout.id)}
                  >
                    <Text style={styles.modalBtnTextDark}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
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

      <Modal visible={disburseModal.visible} animationType="slide" transparent onRequestClose={() => setDisburseModal({ visible: false, payoutId: '', amount: 0, momo: '' })}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Disburse Payout</Text>
            <Text style={styles.modalSubtitle}>Amount: GHS {disburseModal.amount.toFixed(2)}</Text>
            <Text style={styles.infoText}>Mobile Money: {disburseModal.momo}</Text>

            <Text style={styles.inputLabel}>Payment Reference</Text>
            <TextInput
              style={styles.input}
              value={disburseRef}
              onChangeText={setDisburseRef}
              placeholder="e.g. MM-TRAN-12345"
              placeholderTextColor={colors.textLight}
            />

            <Text style={styles.infoText}>Enter the transaction reference from your mobile money payment to this user.</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setDisburseModal({ visible: false, payoutId: '', amount: 0, momo: '' })}
              >
                <Text style={styles.modalBtnTextDark}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleDisburse}>
                <Text style={styles.modalBtnTextLight}>Confirm Disbursement</Text>
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
  selectChip: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border },
});
