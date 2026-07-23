import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useDynamicDashboardStore } from '@store/dynamicDashboardStore';

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'audits', label: 'Audit Schedule' },
  { key: 'findings', label: 'Audit Findings' },
  { key: 'compliance', label: 'Compliance Review' },
  { key: 'financial', label: 'Financial Audit' },
  { key: 'reports', label: 'Reports' },
];

export function InternalAuditorDashboard() {
  const [activePage, setActivePage] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const store = useDynamicDashboardStore();

  const [auditForm, setAuditForm] = useState<{ title: string; type: 'Financial' | 'Compliance' | 'Operational' | 'IT'; startDate: string; endDate: string; auditor: string; status: 'Planned' | 'In Progress' | 'Completed' | 'Flagged' }>({ title: '', type: 'Financial', startDate: '', endDate: '', auditor: '', status: 'Planned' });
  const [findingForm, setFindingForm] = useState<{ auditTitle: string; severity: 'Low' | 'Medium' | 'High' | 'Critical'; finding: string; recommendation: string; status: 'Open' | 'Addressed' | 'Closed'; date: string }>({ auditTitle: '', severity: 'Medium', finding: '', recommendation: '', status: 'Open', date: '' });

  const openModal = (type: string) => { setModalType(type); setShowModal(true); };
  const closeModal = () => setShowModal(false);

  const statusColor = (s: string) => s === 'Completed' || s === 'Closed' ? colors.success : s === 'In Progress' ? colors.primary : s === 'Planned' || s === 'Open' ? colors.warning : s === 'Flagged' ? colors.danger : colors.textSecondary;
  const severityColor = (s: string) => s === 'Critical' ? colors.danger : s === 'High' ? '#FF6B6B' : s === 'Medium' ? colors.warning : colors.info;

  const renderInput = (label: string, value: string, onChange: (v: string) => void, placeholder?: string, multiline?: boolean) => (
    <View><Text style={styles.inputLabel}>{label}</Text>
      <TextInput style={[styles.textInput, multiline && styles.textArea]} value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={colors.textSecondary} multiline={multiline} />
    </View>
  );

  const renderSelect = (label: string, value: string, options: readonly string[], onSelect: (v: string) => void) => (
    <View><Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.selectRow}>
        {options.map((opt) => (
          <TouchableOpacity key={opt} style={[styles.selectChip, value === opt && styles.selectChipActive]} onPress={() => onSelect(opt)}>
            <Text style={[styles.selectChipText, value === opt && styles.selectChipTextActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const handleSaveAudit = () => {
    if (!auditForm.title.trim() || !auditForm.startDate.trim()) { Alert.alert('Error', 'Title and start date are required'); return; }
    store.addAudit({ ...auditForm, title: auditForm.title.trim(), auditor: auditForm.auditor.trim() });
    setAuditForm({ title: '', type: 'Financial', startDate: '', endDate: '', auditor: '', status: 'Planned' });
    closeModal();
  };

  const handleSaveFinding = () => {
    if (!findingForm.finding.trim() || !findingForm.date.trim()) { Alert.alert('Error', 'Finding and date are required'); return; }
    store.addFinding({ ...findingForm, auditTitle: findingForm.auditTitle.trim(), finding: findingForm.finding.trim(), recommendation: findingForm.recommendation.trim() });
    setFindingForm({ auditTitle: '', severity: 'Medium', finding: '', recommendation: '', status: 'Open', date: '' });
    closeModal();
  };

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Audits" value={store.audits.length} accentColor={colors.primary} />
              <StatCard label="In Progress" value={store.audits.filter(a => a.status === 'In Progress').length} accentColor={colors.info} />
              <StatCard label="Open Findings" value={store.auditFindings.filter(f => f.status === 'Open').length} accentColor={colors.danger} />
              <StatCard label="Closed" value={store.auditFindings.filter(f => f.status === 'Closed').length} accentColor={colors.success} />
            </CardGrid>
            <Text style={styles.sectionTitle}>Active Audits</Text>
            {store.audits.filter(a => a.status === 'In Progress' || a.status === 'Planned').map((a) => (
              <View key={a.id} style={[styles.card, { borderLeftColor: statusColor(a.status) }]}>
                <Text style={styles.cardTitle}>{a.title}</Text>
                <Text style={styles.cardMeta}>{a.type} | {a.startDate} to {a.endDate}</Text>
              </View>
            ))}
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.primary }]} onPress={() => openModal('audit')}><Text style={styles.quickBtnText}>+ Audit</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.danger }]} onPress={() => openModal('finding')}><Text style={styles.quickBtnText}>+ Finding</Text></TouchableOpacity>
            </View>
          </View>
        );
      case 'audits':
        return (
          <View>
            <Text style={styles.pageTitle}>Audit Schedule</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('audit')}><Text style={styles.actionBtnText}>+ New Audit</Text></TouchableOpacity>
            {store.audits.map((a) => (
              <View key={a.id} style={[styles.card, { borderLeftColor: statusColor(a.status) }]}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.row}><Text style={styles.cardTitle}>{a.title}</Text>
                      <View style={[styles.badge, { backgroundColor: statusColor(a.status) + '20' }]}><Text style={[styles.badgeText, { color: statusColor(a.status) }]}>{a.status}</Text></View>
                    </View>
                    <Text style={styles.cardMeta}>{a.type} | {a.startDate} to {a.endDate}</Text>
                    <Text style={styles.cardMeta}>Auditor: {a.auditor}</Text>
                  </View>
                  <TouchableOpacity onPress={() => Alert.alert('Delete', 'Delete this audit?', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => store.deleteAudit(a.id) }])}><Text style={styles.deleteBtn}>✕</Text></TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );
      case 'findings':
        return (
          <View>
            <Text style={styles.pageTitle}>Audit Findings</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('finding')}><Text style={styles.actionBtnText}>+ New Finding</Text></TouchableOpacity>
            {store.auditFindings.map((f) => (
              <View key={f.id} style={[styles.card, { borderLeftColor: severityColor(f.severity) }]}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.row}>
                      <Text style={styles.cardTitle}>{f.auditTitle}</Text>
                      <View style={[styles.badge, { backgroundColor: severityColor(f.severity) + '20' }]}><Text style={[styles.badgeText, { color: severityColor(f.severity) }]}>{f.severity}</Text></View>
                      <View style={[styles.badge, { backgroundColor: statusColor(f.status) + '20' }]}><Text style={[styles.badgeText, { color: statusColor(f.status) }]}>{f.status}</Text></View>
                    </View>
                    <Text style={styles.cardMeta}>{f.date}</Text>
                    <Text style={styles.cardBody}>{f.finding}</Text>
                    {f.recommendation ? <Text style={styles.cardNotes}>Recommendation: {f.recommendation}</Text> : null}
                    {f.status !== 'Closed' && (
                      <View style={styles.actionRow}>
                        {f.status === 'Open' && <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.primary }]} onPress={() => store.updateFindingStatus(f.id, 'Addressed')}><Text style={styles.smallBtnText}>Mark Addressed</Text></TouchableOpacity>}
                        <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.success }]} onPress={() => store.updateFindingStatus(f.id, 'Closed')}><Text style={styles.smallBtnText}>Close</Text></TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        );
      case 'compliance':
        return <View><Text style={styles.pageTitle}>Compliance Review</Text><Text style={styles.pageSubtitle}>Review school compliance with regulations and policies</Text>
          <CardGrid>
            <StatCard label="Compliance Audits" value={store.audits.filter(a => a.type === 'Compliance').length} accentColor={colors.primary} />
            <StatCard label="Open Findings" value={store.auditFindings.filter(f => f.status === 'Open').length} accentColor={colors.danger} />
            <StatCard label="Addressed" value={store.auditFindings.filter(f => f.status === 'Addressed').length} accentColor={colors.warning} />
            <StatCard label="Closed" value={store.auditFindings.filter(f => f.status === 'Closed').length} accentColor={colors.success} />
          </CardGrid>
        </View>;
      case 'financial':
        return <View><Text style={styles.pageTitle}>Financial Audit</Text><Text style={styles.pageSubtitle}>Financial auditing and expenditure review</Text>
          {store.audits.filter(a => a.type === 'Financial').map((a) => (<View key={a.id} style={styles.card}><Text style={styles.cardTitle}>{a.title}</Text><Text style={styles.cardMeta}>{a.startDate} to {a.endDate} | {a.status}</Text></View>))}
          {store.auditFindings.filter(f => f.auditTitle.includes('Financial')).map((f) => (<View key={f.id} style={styles.card}><Text style={styles.cardBody}>{f.finding}</Text></View>))}
        </View>;
      case 'reports':
        return <View>
          <Text style={styles.pageTitle}>Reports & Analytics</Text>
          <CardGrid>
            <StatCard label="Total Audits" value={store.audits.length} accentColor={colors.primary} />
            <StatCard label="Completed" value={store.audits.filter(a => a.status === 'Completed').length} accentColor={colors.success} />
            <StatCard label="Total Findings" value={store.auditFindings.length} accentColor={colors.info} />
            <StatCard label="Open Findings" value={store.auditFindings.filter(f => f.status === 'Open').length} accentColor={colors.danger} />
          </CardGrid>
          <Text style={styles.sectionTitle}>Audit Summary</Text>
          {store.audits.map((a) => (<View key={a.id} style={styles.card}><Text style={styles.cardTitle}>{a.title}</Text><Text style={styles.cardMeta}>{a.type} | {a.status} | {a.startDate}</Text></View>))}
        </View>;
      default: return null;
    }
  };

  const renderModal = () => {
    let title = '';
    let content: React.ReactNode = null;
    if (modalType === 'audit') {
      title = 'New Audit';
      content = (<ScrollView>
        {renderInput('Title', auditForm.title, (v) => setAuditForm({ ...auditForm, title: v }))}
        {renderSelect('Type', auditForm.type, ['Financial', 'Compliance', 'Operational', 'IT'], (v) => setAuditForm({ ...auditForm, type: v as 'Financial' | 'Compliance' | 'Operational' | 'IT' }))}
        {renderInput('Start Date (YYYY-MM-DD)', auditForm.startDate, (v) => setAuditForm({ ...auditForm, startDate: v }))}
        {renderInput('End Date (YYYY-MM-DD)', auditForm.endDate, (v) => setAuditForm({ ...auditForm, endDate: v }))}
        {renderInput('Auditor', auditForm.auditor, (v) => setAuditForm({ ...auditForm, auditor: v }))}
      </ScrollView>);
    } else if (modalType === 'finding') {
      title = 'New Audit Finding';
      content = (<ScrollView>
        {renderInput('Audit Title', findingForm.auditTitle, (v) => setFindingForm({ ...findingForm, auditTitle: v }))}
        {renderSelect('Severity', findingForm.severity, ['Low', 'Medium', 'High', 'Critical'], (v) => setFindingForm({ ...findingForm, severity: v as 'Low' | 'Medium' | 'High' | 'Critical' }))}
        {renderInput('Date (YYYY-MM-DD)', findingForm.date, (v) => setFindingForm({ ...findingForm, date: v }))}
        {renderInput('Finding', findingForm.finding, (v) => setFindingForm({ ...findingForm, finding: v }), '', true)}
        {renderInput('Recommendation', findingForm.recommendation, (v) => setFindingForm({ ...findingForm, recommendation: v }), '', true)}
      </ScrollView>);
    }
    const handleSave = () => { if (modalType === 'audit') handleSaveAudit(); else if (modalType === 'finding') handleSaveFinding(); };
    return (
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
          <View style={styles.modalHeader}><Text style={styles.modalTitle}>{title}</Text><TouchableOpacity onPress={closeModal}><Text style={styles.closeBtn}>✕</Text></TouchableOpacity></View>
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>{content}</ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}><Text style={styles.saveBtnText}>Save</Text></TouchableOpacity>
          </View>
        </View></View>
      </Modal>
    );
  };

  return (
    <DashboardLayout title="Internal Auditor" navItems={NAV_ITEMS} activeKey={activePage} onNavigate={setActivePage}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>{renderPage()}</ScrollView>
      {renderModal()}
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xs },
  pageSubtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.md },
  sectionTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: 4 },
  cardMeta: { fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: 2 },
  cardBody: { fontSize: fontSize.sm, color: colors.text, marginTop: spacing.xs, lineHeight: 20 },
  cardNotes: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 4, fontStyle: 'italic' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  badge: { borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: fontWeight.bold },
  deleteBtn: { fontSize: fontSize.md, color: colors.danger, fontWeight: fontWeight.bold, padding: spacing.xs },
  actionBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.md, alignSelf: 'flex-start', marginBottom: spacing.md },
  actionBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  quickBtn: { borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  quickBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  smallBtn: { borderRadius: radius.md, paddingVertical: spacing.xs + 2, paddingHorizontal: spacing.md },
  smallBtnText: { color: colors.white, fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  modalContent: { backgroundColor: colors.surface, borderRadius: radius.lg, width: '100%', maxWidth: 600, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  closeBtn: { fontSize: fontSize.lg, color: colors.textSecondary, padding: spacing.xs },
  modalBody: { padding: spacing.md },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  cancelBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  cancelBtnText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  saveBtn: { backgroundColor: colors.primary, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: radius.md },
  saveBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  inputLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.textSecondary, marginBottom: spacing.xs, marginTop: spacing.sm },
  textInput: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, fontSize: fontSize.sm, color: colors.text, backgroundColor: colors.background },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  selectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  selectChip: { backgroundColor: colors.background, borderRadius: radius.pill, paddingVertical: spacing.xs + 2, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border },
  selectChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  selectChipText: { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: fontWeight.medium },
  selectChipTextActive: { color: colors.white, fontWeight: fontWeight.semibold },
});
