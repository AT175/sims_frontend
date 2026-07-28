import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { apiClient } from '@shared/api/apiClient';

interface EarningRecord {
  id: string;
  userId: string;
  type: string;
  amount: number;
  currency: string;
  action: string | null;
  resource: string | null;
  status: string;
  mobileMoneyNumber: string | null;
  payoutReference: string | null;
  createdAt: string;
}

interface EarningsData {
  balance: number;
  totalEarned: number;
  totalClaimed: number;
  recent: EarningRecord[];
}

export function EarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [mobileMoney, setMobileMoney] = useState('');
  const [claiming, setClaiming] = useState(false);

  const loadEarnings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<EarningsData>('/earnings/me');
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEarnings();
  }, [loadEarnings]);

  const handleClaim = async () => {
    if (!mobileMoney.trim() || mobileMoney.trim().length < 10) {
      Alert.alert('Error', 'Please enter a valid mobile money number (at least 10 digits)');
      return;
    }
    setClaiming(true);
    try {
      await apiClient.post('/earnings/claim', { mobileMoneyNumber: mobileMoney.trim() });
      Alert.alert('Success', 'Your payout claim has been submitted. You will receive your payment via mobile money soon.');
      setShowClaimModal(false);
      setMobileMoney('');
      loadEarnings();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to claim earnings';
      Alert.alert('Error', msg);
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <View>
        <Text style={styles.pageTitle}>Earnings</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Loading...</Text>
        </View>
      </View>
    );
  }

  const balance = data?.balance ?? 0;
  const totalEarned = data?.totalEarned ?? 0;
  const totalClaimed = data?.totalClaimed ?? 0;
  const recent = data?.recent ?? [];

  return (
    <View>
      <Text style={styles.pageTitle}>Earnings</Text>
      <Text style={styles.pageSubtitle}>Earn money based on your portal activity</Text>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceAmount}>GHS {balance.toFixed(2)}</Text>
        <TouchableOpacity
          style={[styles.claimBtn, { opacity: balance < 1 ? 0.5 : 1 }]}
          onPress={() => setShowClaimModal(true)}
          disabled={balance < 1}
        >
          <Text style={styles.claimBtnText}>Claim Earnings</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>GHS {totalEarned.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Total Earned</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>GHS {totalClaimed.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Total Claimed</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>How Earnings Work</Text>
        <Text style={styles.infoText}>• You earn credits for every action you perform on the portal</Text>
        <Text style={styles.infoText}>• The more actively you use the portal, the more you earn</Text>
        <Text style={styles.infoText}>• When your balance reaches the minimum threshold, you can claim</Text>
        <Text style={styles.infoText}>• Enter your mobile money number to receive your payout</Text>
      </View>

      <Text style={styles.sectionTitle}>Recent Activity</Text>
      {recent.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No earnings activity yet. Start using the portal to earn!</Text>
        </View>
      ) : (
        recent.map((item) => (
          <View key={item.id} style={styles.earningItem}>
            <View style={styles.earningLeft}>
              <Text style={styles.earningAction}>{item.action || item.type}</Text>
              <Text style={styles.earningDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            <View style={styles.earningRight}>
              <Text style={[styles.earningAmount, item.type === 'credit' ? styles.creditText : styles.debitText]}>
                {item.type === 'credit' ? '+' : '-'} GHS {Number(item.amount).toFixed(2)}
              </Text>
              <Text style={[styles.earningStatus, (styles as any)[`status_${item.status}`] || styles.status_pending]}>
                {item.status}
              </Text>
            </View>
          </View>
        ))
      )}

      <Modal visible={showClaimModal} animationType="slide" transparent onRequestClose={() => setShowClaimModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Claim Earnings</Text>
            <Text style={styles.modalSubtitle}>Current Balance: GHS {balance.toFixed(2)}</Text>

            <Text style={styles.inputLabel}>Mobile Money Number</Text>
            <TextInput
              style={styles.input}
              value={mobileMoney}
              onChangeText={setMobileMoney}
              placeholder="e.g. 0241234567"
              placeholderTextColor={colors.textLight}
              keyboardType="phone-pad"
            />

            <Text style={styles.modalHint}>
              Enter the mobile money number where you want to receive your payout. Your claim will be reviewed and processed by the subscription & payment team.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowClaimModal(false)}>
                <Text style={styles.modalBtnTextDark}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSubmit, { opacity: claiming ? 0.6 : 1 }]}
                onPress={handleClaim}
                disabled={claiming}
              >
                <Text style={styles.modalBtnTextLight}>{claiming ? 'Submitting...' : 'Submit Claim'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xs },
  pageSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  balanceCard: { backgroundColor: colors.primary, borderRadius: radius.xl, padding: spacing.xl, marginBottom: spacing.lg, alignItems: 'center' },
  balanceLabel: { fontSize: fontSize.md, color: colors.white, opacity: 0.8, marginBottom: spacing.xs },
  balanceAmount: { fontSize: fontSize.xxl, fontWeight: fontWeight.extrabold, color: colors.white, marginBottom: spacing.md },
  claimBtn: { backgroundColor: colors.white, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.lg },
  claimBtnText: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.primary },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  statBox: { flex: 1, backgroundColor: colors.surfaceAlt, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statValue: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text },
  statLabel: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  infoCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  infoTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
  infoText: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.sm },
  emptyState: { backgroundColor: colors.surfaceAlt, borderRadius: radius.lg, padding: spacing.xl, alignItems: 'center' },
  emptyStateText: { fontSize: fontSize.md, color: colors.textLight, textAlign: 'center' },
  earningItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  earningLeft: { flex: 1 },
  earningAction: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text },
  earningDate: { fontSize: fontSize.xs, color: colors.textLight, marginTop: 2 },
  earningRight: { alignItems: 'flex-end' },
  earningAmount: { fontSize: fontSize.md, fontWeight: fontWeight.bold },
  creditText: { color: colors.success },
  debitText: { color: colors.danger },
  earningStatus: { fontSize: fontSize.xs, marginTop: 2, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm, overflow: 'hidden' },
  status_pending: { backgroundColor: colors.warning + '20', color: colors.warning },
  status_claimed: { backgroundColor: colors.info + '20', color: colors.info },
  status_disbursed: { backgroundColor: colors.success + '20', color: colors.success },
  status_cancelled: { backgroundColor: colors.danger + '20', color: colors.danger },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: spacing.lg },
  modalContent: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl, width: '100%', maxWidth: 400 },
  modalTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xs },
  modalSubtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.md },
  inputLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textSecondary, marginBottom: spacing.xs },
  input: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md, color: colors.text, marginBottom: spacing.sm, backgroundColor: colors.surfaceAlt },
  modalHint: { fontSize: fontSize.xs, color: colors.textLight, marginBottom: spacing.md },
  modalActions: { flexDirection: 'row', gap: spacing.sm },
  modalBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: colors.surfaceAlt },
  modalBtnSubmit: { backgroundColor: colors.primary },
  modalBtnTextDark: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  modalBtnTextLight: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.white },
});
