import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useDynamicDashboardStore } from '@store/dynamicDashboardStore';

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'planning', label: 'Academic Planning' },
  { key: 'curriculum', label: 'Curriculum Oversight' },
  { key: 'policy', label: 'Academic Policies' },
  { key: 'departments', label: 'Department Reports' },
  { key: 'assessments', label: 'Assessment Review' },
  { key: 'calendar', label: 'Academic Calendar' },
  { key: 'meetings', label: 'Board Meetings' },
  { key: 'reports', label: 'Reports' },
];

export function AcademicBoardDashboard() {
  const [activePage, setActivePage] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const store = useDynamicDashboardStore();

  const [meetingForm, setMeetingForm] = useState<{ title: string; date: string; attendees: string; agenda: string; status: 'Scheduled' | 'Completed' | 'Cancelled'; minutes: string }>({ title: '', date: '', attendees: '', agenda: '', status: 'Scheduled', minutes: '' });
  const [policyForm, setPolicyForm] = useState<{ title: string; category: string; status: 'Draft' | 'Under Review' | 'Approved' | 'Active'; dateApproved: string; description: string }>({ title: '', category: '', status: 'Draft', dateApproved: '', description: '' });

  const openModal = (type: string) => { setModalType(type); setShowModal(true); };
  const closeModal = () => setShowModal(false);

  const statusColor = (s: string) => s === 'Active' || s === 'Completed' || s === 'Approved' ? colors.success : s === 'Scheduled' || s === 'Draft' || s === 'Under Review' ? colors.warning : s === 'Cancelled' ? colors.danger : colors.primary;
  const ratingColor = (r: string) => r === 'Excellent' ? colors.success : r === 'Good' ? colors.primary : r === 'Average' ? colors.warning : colors.danger;

  const handleSaveMeeting = () => {
    if (!meetingForm.title.trim() || !meetingForm.date.trim()) { Alert.alert('Error', 'Title and date are required'); return; }
    store.addMeeting({ ...meetingForm, title: meetingForm.title.trim(), agenda: meetingForm.agenda.trim(), minutes: meetingForm.minutes.trim() });
    setMeetingForm({ title: '', date: '', attendees: '', agenda: '', status: 'Scheduled', minutes: '' });
    closeModal();
  };

  const handleSavePolicy = () => {
    if (!policyForm.title.trim()) { Alert.alert('Error', 'Title is required'); return; }
    store.addPolicy({ ...policyForm, title: policyForm.title.trim(), description: policyForm.description.trim(), dateApproved: policyForm.dateApproved || null });
    setPolicyForm({ title: '', category: '', status: 'Draft', dateApproved: '', description: '' });
    closeModal();
  };

  const renderInput = (label: string, value: string, onChange: (v: string) => void, placeholder?: string, multiline?: boolean) => (
    <View>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput style={[styles.textInput, multiline && styles.textArea]} value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={colors.textSecondary} multiline={multiline} />
    </View>
  );

  const renderSelect = (label: string, value: string, options: readonly string[], onSelect: (v: string) => void) => (
    <View>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.selectRow}>
        {options.map((opt) => (
          <TouchableOpacity key={opt} style={[styles.selectChip, value === opt && styles.selectChipActive]} onPress={() => onSelect(opt)}>
            <Text style={[styles.selectChipText, value === opt && styles.selectChipTextActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return (
          <View>
            <CardGrid>
              <StatCard label="Board Meetings" value={store.meetings.length} subtitle={`${store.meetings.filter(m => m.status === 'Scheduled').length} upcoming`} accentColor={colors.primary} />
              <StatCard label="Active Policies" value={store.policies.filter(p => p.status === 'Active').length} accentColor={colors.success} />
              <StatCard label="Departments" value={store.deptReports.length} accentColor={colors.info} />
              <StatCard label="Draft Policies" value={store.policies.filter(p => p.status === 'Draft').length} accentColor={colors.warning} />
            </CardGrid>
            <Text style={styles.sectionTitle}>Upcoming Meetings</Text>
            {store.meetings.filter(m => m.status === 'Scheduled').map((m) => (
              <View key={m.id} style={[styles.card, { borderLeftColor: colors.primary }]}>
                <Text style={styles.cardTitle}>{m.title}</Text>
                <Text style={styles.cardMeta}>{m.date} | Attendees: {m.attendees}</Text>
                <Text style={styles.cardMeta}>Agenda: {m.agenda}</Text>
              </View>
            ))}
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.primary }]} onPress={() => openModal('meeting')}><Text style={styles.quickBtnText}>+ Meeting</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.success }]} onPress={() => openModal('policy')}><Text style={styles.quickBtnText}>+ Policy</Text></TouchableOpacity>
            </View>
          </View>
        );
      case 'meetings':
        return (
          <View>
            <Text style={styles.pageTitle}>Board Meetings</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('meeting')}><Text style={styles.actionBtnText}>+ Schedule Meeting</Text></TouchableOpacity>
            {store.meetings.map((m) => (
              <View key={m.id} style={[styles.card, { borderLeftColor: statusColor(m.status) }]}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.row}><Text style={styles.cardTitle}>{m.title}</Text>
                      <View style={[styles.badge, { backgroundColor: statusColor(m.status) + '20' }]}><Text style={[styles.badgeText, { color: statusColor(m.status) }]}>{m.status}</Text></View>
                    </View>
                    <Text style={styles.cardMeta}>{m.date} | Attendees: {m.attendees}</Text>
                    <Text style={styles.cardBody}>{m.agenda}</Text>
                    {m.minutes ? <Text style={styles.cardNotes}>Minutes: {m.minutes}</Text> : null}
                  </View>
                  <TouchableOpacity onPress={() => Alert.alert('Delete', 'Delete this meeting?', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => store.deleteMeeting(m.id) }])}><Text style={styles.deleteBtn}>✕</Text></TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );
      case 'policy':
        return (
          <View>
            <Text style={styles.pageTitle}>Academic Policies</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('policy')}><Text style={styles.actionBtnText}>+ New Policy</Text></TouchableOpacity>
            {store.policies.map((p) => (
              <View key={p.id} style={[styles.card, { borderLeftColor: statusColor(p.status) }]}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.row}><Text style={styles.cardTitle}>{p.title}</Text>
                      <View style={[styles.badge, { backgroundColor: statusColor(p.status) + '20' }]}><Text style={[styles.badgeText, { color: statusColor(p.status) }]}>{p.status}</Text></View>
                    </View>
                    <Text style={styles.cardMeta}>{p.category}{p.dateApproved ? ` | Approved: ${p.dateApproved}` : ''}</Text>
                    <Text style={styles.cardBody}>{p.description}</Text>
                  </View>
                  <TouchableOpacity onPress={() => Alert.alert('Delete', 'Delete this policy?', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => store.deletePolicy(p.id) }])}><Text style={styles.deleteBtn}>✕</Text></TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );
      case 'departments':
        return (
          <View>
            <Text style={styles.pageTitle}>Department Reports</Text>
            {store.deptReports.map((r) => (
              <View key={r.id} style={[styles.card, { borderLeftColor: ratingColor(r.performanceRating) }]}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.row}><Text style={styles.cardTitle}>{r.department}</Text>
                      <View style={[styles.badge, { backgroundColor: ratingColor(r.performanceRating) + '20' }]}><Text style={[styles.badgeText, { color: ratingColor(r.performanceRating) }]}>{r.performanceRating}</Text></View>
                    </View>
                    <Text style={styles.cardMeta}>Head: {r.head} | Date: {r.reportDate}</Text>
                    <Text style={styles.cardBody}>{r.summary}</Text>
                  </View>
                  <TouchableOpacity onPress={() => Alert.alert('Delete', 'Delete this report?', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => store.deleteDeptReport(r.id) }])}><Text style={styles.deleteBtn}>✕</Text></TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );
      case 'planning':
        return (
          <View>
            <Text style={styles.pageTitle}>Academic Planning</Text>
            <Text style={styles.pageSubtitle}>Strategic academic planning and term preparation</Text>
            <CardGrid>
              <StatCard label="Total Policies" value={store.policies.length} accentColor={colors.primary} />
              <StatCard label="Total Meetings" value={store.meetings.length} accentColor={colors.info} />
              <StatCard label="Departments" value={store.deptReports.length} accentColor={colors.success} />
              <StatCard label="Avg Rating" value={store.deptReports.length > 0 ? store.deptReports.filter(r => r.performanceRating === 'Excellent' || r.performanceRating === 'Good').length + '/' + store.deptReports.length : 'N/A'} accentColor={colors.accent} />
            </CardGrid>
          </View>
        );
      case 'curriculum':
        return <View><Text style={styles.pageTitle}>Curriculum Oversight</Text><Text style={styles.pageSubtitle}>Review and approve curriculum changes across departments</Text>
          {store.deptReports.map((r) => (<View key={r.id} style={styles.card}><Text style={styles.cardTitle}>{r.department}</Text><Text style={styles.cardMeta}>Head: {r.head}</Text><Text style={styles.cardBody}>{r.summary}</Text></View>))}
        </View>;
      case 'assessments':
        return <View><Text style={styles.pageTitle}>Assessment Review</Text><Text style={styles.pageSubtitle}>Review assessment policies and results across departments</Text>
          {store.policies.filter(p => p.category === 'Assessment').map((p) => (<View key={p.id} style={styles.card}><Text style={styles.cardTitle}>{p.title}</Text><Text style={styles.cardBody}>{p.description}</Text></View>))}
        </View>;
      case 'calendar':
        return <View><Text style={styles.pageTitle}>Academic Calendar</Text><Text style={styles.pageSubtitle}>Key academic dates and board meetings</Text>
          {store.meetings.map((m) => (<View key={m.id} style={styles.card}><Text style={styles.cardTitle}>{m.title}</Text><Text style={styles.cardMeta}>{m.date} | {m.status}</Text></View>))}
        </View>;
      case 'reports':
        return <View>
          <Text style={styles.pageTitle}>Reports & Analytics</Text>
          <CardGrid>
            <StatCard label="Meetings" value={store.meetings.length} accentColor={colors.primary} />
            <StatCard label="Policies" value={store.policies.length} accentColor={colors.success} />
            <StatCard label="Departments" value={store.deptReports.length} accentColor={colors.info} />
            <StatCard label="Active Policies" value={store.policies.filter(p => p.status === 'Active').length} accentColor={colors.accent} />
          </CardGrid>
          <Text style={styles.sectionTitle}>Department Performance</Text>
          {store.deptReports.map((r) => (<View key={r.id} style={styles.card}><Text style={styles.cardTitle}>{r.department}</Text><Text style={styles.cardMeta}>Rating: {r.performanceRating}</Text></View>))}
        </View>;
      default: return null;
    }
  };

  const renderModal = () => {
    let title = '';
    let content: React.ReactNode = null;
    if (modalType === 'meeting') {
      title = 'Schedule Meeting';
      content = (<ScrollView>
        {renderInput('Title', meetingForm.title, (v) => setMeetingForm({ ...meetingForm, title: v }))}
        {renderInput('Date (YYYY-MM-DD)', meetingForm.date, (v) => setMeetingForm({ ...meetingForm, date: v }))}
        {renderInput('Attendees', meetingForm.attendees, (v) => setMeetingForm({ ...meetingForm, attendees: v }))}
        {renderInput('Agenda', meetingForm.agenda, (v) => setMeetingForm({ ...meetingForm, agenda: v }), '', true)}
        {renderSelect('Status', meetingForm.status, ['Scheduled', 'Completed', 'Cancelled'], (v) => setMeetingForm({ ...meetingForm, status: v as 'Scheduled' | 'Completed' | 'Cancelled' }))}
        {renderInput('Minutes', meetingForm.minutes, (v) => setMeetingForm({ ...meetingForm, minutes: v }), '', true)}
      </ScrollView>);
    } else if (modalType === 'policy') {
      title = 'New Policy';
      content = (<ScrollView>
        {renderInput('Title', policyForm.title, (v) => setPolicyForm({ ...policyForm, title: v }))}
        {renderInput('Category', policyForm.category, (v) => setPolicyForm({ ...policyForm, category: v }))}
        {renderSelect('Status', policyForm.status, ['Draft', 'Under Review', 'Approved', 'Active'], (v) => setPolicyForm({ ...policyForm, status: v as 'Draft' | 'Under Review' | 'Approved' | 'Active' }))}
        {renderInput('Date Approved (YYYY-MM-DD)', policyForm.dateApproved, (v) => setPolicyForm({ ...policyForm, dateApproved: v }))}
        {renderInput('Description', policyForm.description, (v) => setPolicyForm({ ...policyForm, description: v }), '', true)}
      </ScrollView>);
    }
    const handleSave = () => { if (modalType === 'meeting') handleSaveMeeting(); else if (modalType === 'policy') handleSavePolicy(); };
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
    <DashboardLayout title="Academic Board" navItems={NAV_ITEMS} activeKey={activePage} onNavigate={setActivePage}>
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
