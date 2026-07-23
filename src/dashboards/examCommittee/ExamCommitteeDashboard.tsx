import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useDynamicDashboardStore } from '@store/dynamicDashboardStore';

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'schedule', label: 'Exam Schedule' },
  { key: 'papers', label: 'Question Papers' },
  { key: 'invigilation', label: 'Invigilation Duty' },
  { key: 'grading', label: 'Grading & Moderation' },
  { key: 'results', label: 'Results Processing' },
  { key: 'malpractice', label: 'Malpractice Log' },
  { key: 'reports', label: 'Reports' },
];

export function ExamCommitteeDashboard() {
  const [activePage, setActivePage] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const store = useDynamicDashboardStore();

  const [examForm, setExamForm] = useState<{ examName: string; subject: string; date: string; time: string; duration: string; venue: string; status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' }>({ examName: '', subject: '', date: '', time: '08:00', duration: '2h', venue: '', status: 'Scheduled' });
  const [paperForm, setPaperForm] = useState<{ subject: string; examiner: string; status: 'Drafted' | 'Reviewed' | 'Approved' | 'Printed'; dateSubmitted: string; notes: string }>({ subject: '', examiner: '', status: 'Drafted', dateSubmitted: '', notes: '' });
  const [invigilationForm, setInvigilationForm] = useState({ examName: '', date: '', time: '08:00', venue: '', invigilator: '' });
  const [malpracticeForm, setMalpracticeForm] = useState<{ studentName: string; studentClass: string; exam: string; type: 'Cheating' | 'Impersonation' | 'Leakage' | 'Collusion' | 'Other'; date: string; description: string; action: string }>({ studentName: '', studentClass: '', exam: '', type: 'Cheating', date: '', description: '', action: '' });

  const openModal = (type: string) => { setModalType(type); setShowModal(true); };
  const closeModal = () => setShowModal(false);

  const statusColor = (s: string) => s === 'Completed' || s === 'Approved' || s === 'Printed' ? colors.success : s === 'Scheduled' || s === 'Drafted' ? colors.warning : s === 'In Progress' || s === 'Reviewed' ? colors.primary : s === 'Cancelled' ? colors.danger : colors.textSecondary;
  const severityColor = (s: string) => s === 'Critical' || s === 'High' ? colors.danger : s === 'Medium' ? colors.warning : colors.info;

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

  const handleSaveExam = () => {
    if (!examForm.examName.trim() || !examForm.date.trim()) { Alert.alert('Error', 'Exam name and date are required'); return; }
    store.addExam({ ...examForm, examName: examForm.examName.trim(), subject: examForm.subject.trim(), venue: examForm.venue.trim() });
    setExamForm({ examName: '', subject: '', date: '', time: '08:00', duration: '2h', venue: '', status: 'Scheduled' });
    closeModal();
  };

  const handleSavePaper = () => {
    if (!paperForm.subject.trim()) { Alert.alert('Error', 'Subject is required'); return; }
    store.addPaper({ ...paperForm, subject: paperForm.subject.trim(), examiner: paperForm.examiner.trim(), notes: paperForm.notes.trim() });
    setPaperForm({ subject: '', examiner: '', status: 'Drafted', dateSubmitted: '', notes: '' });
    closeModal();
  };

  const handleSaveInvigilation = () => {
    if (!invigilationForm.invigilator.trim() || !invigilationForm.date.trim()) { Alert.alert('Error', 'Invigilator and date are required'); return; }
    store.addInvigilation({ ...invigilationForm, examName: invigilationForm.examName.trim(), venue: invigilationForm.venue.trim(), invigilator: invigilationForm.invigilator.trim() });
    setInvigilationForm({ examName: '', date: '', time: '08:00', venue: '', invigilator: '' });
    closeModal();
  };

  const handleSaveMalpractice = () => {
    if (!malpracticeForm.studentName.trim() || !malpracticeForm.date.trim()) { Alert.alert('Error', 'Student name and date are required'); return; }
    store.addMalpractice({ ...malpracticeForm, studentName: malpracticeForm.studentName.trim(), description: malpracticeForm.description.trim(), action: malpracticeForm.action.trim() });
    setMalpracticeForm({ studentName: '', studentClass: '', exam: '', type: 'Cheating', date: '', description: '', action: '' });
    closeModal();
  };

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return (
          <View>
            <CardGrid>
              <StatCard label="Exams" value={store.exams.length} subtitle={`${store.exams.filter(e => e.status === 'Scheduled').length} upcoming`} accentColor={colors.primary} />
              <StatCard label="Question Papers" value={store.questionPapers.length} accentColor={colors.info} />
              <StatCard label="Invigilators" value={store.invigilation.length} accentColor={colors.accent} />
              <StatCard label="Malpractice" value={store.malpractice.length} accentColor={colors.danger} />
            </CardGrid>
            <Text style={styles.sectionTitle}>Upcoming Exams</Text>
            {store.exams.filter(e => e.status === 'Scheduled').map((e) => (
              <View key={e.id} style={[styles.card, { borderLeftColor: colors.warning }]}>
                <Text style={styles.cardTitle}>{e.subject} — {e.examName}</Text>
                <Text style={styles.cardMeta}>{e.date} at {e.time} | {e.duration} | {e.venue}</Text>
              </View>
            ))}
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.primary }]} onPress={() => openModal('exam')}><Text style={styles.quickBtnText}>+ Exam</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.info }]} onPress={() => openModal('paper')}><Text style={styles.quickBtnText}>+ Question Paper</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.accent }]} onPress={() => openModal('invigilation')}><Text style={styles.quickBtnText}>+ Invigilation</Text></TouchableOpacity>
            </View>
          </View>
        );
      case 'schedule':
        return (
          <View>
            <Text style={styles.pageTitle}>Exam Schedule</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('exam')}><Text style={styles.actionBtnText}>+ Schedule Exam</Text></TouchableOpacity>
            {store.exams.map((e) => (
              <View key={e.id} style={[styles.card, { borderLeftColor: statusColor(e.status) }]}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.row}><Text style={styles.cardTitle}>{e.subject}</Text>
                      <View style={[styles.badge, { backgroundColor: statusColor(e.status) + '20' }]}><Text style={[styles.badgeText, { color: statusColor(e.status) }]}>{e.status}</Text></View>
                    </View>
                    <Text style={styles.cardMeta}>{e.examName} | {e.date} at {e.time}</Text>
                    <Text style={styles.cardMeta}>Duration: {e.duration} | Venue: {e.venue}</Text>
                  </View>
                  <TouchableOpacity onPress={() => Alert.alert('Delete', 'Delete this exam?', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => store.deleteExam(e.id) }])}><Text style={styles.deleteBtn}>✕</Text></TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );
      case 'papers':
        return (
          <View>
            <Text style={styles.pageTitle}>Question Papers</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('paper')}><Text style={styles.actionBtnText}>+ New Paper</Text></TouchableOpacity>
            {store.questionPapers.map((p) => (
              <View key={p.id} style={[styles.card, { borderLeftColor: statusColor(p.status) }]}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.row}><Text style={styles.cardTitle}>{p.subject}</Text>
                      <View style={[styles.badge, { backgroundColor: statusColor(p.status) + '20' }]}><Text style={[styles.badgeText, { color: statusColor(p.status) }]}>{p.status}</Text></View>
                    </View>
                    <Text style={styles.cardMeta}>Examiner: {p.examiner} | Submitted: {p.dateSubmitted}</Text>
                    {p.notes ? <Text style={styles.cardNotes}>{p.notes}</Text> : null}
                    {p.status !== 'Approved' && p.status !== 'Printed' && (
                      <View style={styles.actionRow}>
                        {p.status === 'Drafted' && <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.info }]} onPress={() => store.updatePaperStatus(p.id, 'Reviewed')}><Text style={styles.smallBtnText}>Mark Reviewed</Text></TouchableOpacity>}
                        {p.status === 'Reviewed' && <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.success }]} onPress={() => store.updatePaperStatus(p.id, 'Approved')}><Text style={styles.smallBtnText}>Approve</Text></TouchableOpacity>}
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        );
      case 'invigilation':
        return (
          <View>
            <Text style={styles.pageTitle}>Invigilation Duty</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('invigilation')}><Text style={styles.actionBtnText}>+ Assign Duty</Text></TouchableOpacity>
            {store.invigilation.map((i) => (
              <View key={i.id} style={[styles.card, { borderLeftColor: colors.accent }]}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{i.invigilator}</Text>
                    <Text style={styles.cardMeta}>{i.examName} | {i.date} at {i.time}</Text>
                    <Text style={styles.cardMeta}>Venue: {i.venue}</Text>
                  </View>
                  <TouchableOpacity onPress={() => Alert.alert('Delete', 'Delete this duty?', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => store.deleteInvigilation(i.id) }])}><Text style={styles.deleteBtn}>✕</Text></TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );
      case 'malpractice':
        return (
          <View>
            <Text style={styles.pageTitle}>Malpractice Log</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('malpractice')}><Text style={styles.actionBtnText}>+ Log Case</Text></TouchableOpacity>
            {store.malpractice.map((m) => (
              <View key={m.id} style={[styles.card, { borderLeftColor: severityColor(m.type === 'Cheating' || m.type === 'Impersonation' ? 'High' : 'Medium') }]}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.row}><Text style={styles.cardTitle}>{m.studentName}</Text>
                      <View style={[styles.badge, { backgroundColor: colors.danger + '20' }]}><Text style={[styles.badgeText, { color: colors.danger }]}>{m.type}</Text></View>
                    </View>
                    <Text style={styles.cardMeta}>{m.studentClass} | {m.exam} | {m.date}</Text>
                    <Text style={styles.cardBody}>{m.description}</Text>
                    {m.action ? <Text style={styles.cardNotes}>Action: {m.action}</Text> : null}
                  </View>
                </View>
              </View>
            ))}
          </View>
        );
      case 'grading':
        return <View><Text style={styles.pageTitle}>Grading & Moderation</Text><Text style={styles.pageSubtitle}>Oversee grading and moderation of exam papers</Text>
          <CardGrid>
            <StatCard label="Papers Approved" value={store.questionPapers.filter(p => p.status === 'Approved' || p.status === 'Printed').length} accentColor={colors.success} />
            <StatCard label="Papers Pending" value={store.questionPapers.filter(p => p.status === 'Drafted' || p.status === 'Reviewed').length} accentColor={colors.warning} />
            <StatCard label="Exams Completed" value={store.exams.filter(e => e.status === 'Completed').length} accentColor={colors.info} />
            <StatCard label="Malpractice Cases" value={store.malpractice.length} accentColor={colors.danger} />
          </CardGrid>
        </View>;
      case 'results':
        return (
          <View>
            <Text style={styles.pageTitle}>Results Processing</Text>
            <Text style={styles.pageSubtitle}>Process and review exam results</Text>
            <CardGrid>
              <StatCard label="Results" value={store.examResults.length} accentColor={colors.primary} />
              <StatCard label="Total Completed" value={store.examResults.reduce((s, r) => s + r.completed, 0)} accentColor={colors.info} />
              <StatCard label="Total Passed" value={store.examResults.reduce((s, r) => s + r.passed, 0)} accentColor={colors.success} />
              <StatCard label="Total Failed" value={store.examResults.reduce((s, r) => s + r.failed, 0)} accentColor={colors.danger} />
            </CardGrid>
            {store.examResults.map((r) => (
              <View key={r.id} style={[styles.card, { borderLeftColor: r.averageScore >= 70 ? colors.success : r.averageScore >= 50 ? colors.warning : colors.danger }]}>
                <Text style={styles.cardTitle}>{r.examName} — {r.subject}</Text>
                <Text style={styles.cardMeta}>Completed: {r.completed} | Passed: {r.passed} | Failed: {r.failed}</Text>
                <Text style={styles.cardMeta}>Average Score: {r.averageScore}%</Text>
                <Text style={styles.cardBody}>{r.remarks}</Text>
              </View>
            ))}
          </View>
        );
      case 'reports':
        return <View>
          <Text style={styles.pageTitle}>Reports & Analytics</Text>
          <CardGrid>
            <StatCard label="Total Exams" value={store.exams.length} accentColor={colors.primary} />
            <StatCard label="Question Papers" value={store.questionPapers.length} accentColor={colors.info} />
            <StatCard label="Invigilators" value={store.invigilation.length} accentColor={colors.accent} />
            <StatCard label="Malpractice" value={store.malpractice.length} accentColor={colors.danger} />
          </CardGrid>
          <Text style={styles.sectionTitle}>Exam Summary</Text>
          {store.exams.map((e) => (<View key={e.id} style={styles.card}><Text style={styles.cardTitle}>{e.subject}</Text><Text style={styles.cardMeta}>{e.examName} | {e.date} | {e.status}</Text></View>))}
        </View>;
      default: return null;
    }
  };

  const renderModal = () => {
    let title = '';
    let content: React.ReactNode = null;
    if (modalType === 'exam') {
      title = 'Schedule Exam';
      content = (<ScrollView>
        {renderInput('Exam Name', examForm.examName, (v) => setExamForm({ ...examForm, examName: v }))}
        {renderInput('Subject', examForm.subject, (v) => setExamForm({ ...examForm, subject: v }))}
        {renderInput('Date (YYYY-MM-DD)', examForm.date, (v) => setExamForm({ ...examForm, date: v }))}
        {renderInput('Time', examForm.time, (v) => setExamForm({ ...examForm, time: v }))}
        {renderInput('Duration', examForm.duration, (v) => setExamForm({ ...examForm, duration: v }))}
        {renderInput('Venue', examForm.venue, (v) => setExamForm({ ...examForm, venue: v }))}
      </ScrollView>);
    } else if (modalType === 'paper') {
      title = 'New Question Paper';
      content = (<ScrollView>
        {renderInput('Subject', paperForm.subject, (v) => setPaperForm({ ...paperForm, subject: v }))}
        {renderInput('Examiner', paperForm.examiner, (v) => setPaperForm({ ...paperForm, examiner: v }))}
        {renderSelect('Status', paperForm.status, ['Drafted', 'Reviewed', 'Approved', 'Printed'], (v) => setPaperForm({ ...paperForm, status: v as 'Drafted' | 'Reviewed' | 'Approved' | 'Printed' }))}
        {renderInput('Date Submitted', paperForm.dateSubmitted, (v) => setPaperForm({ ...paperForm, dateSubmitted: v }))}
        {renderInput('Notes', paperForm.notes, (v) => setPaperForm({ ...paperForm, notes: v }), '', true)}
      </ScrollView>);
    } else if (modalType === 'invigilation') {
      title = 'Assign Invigilation';
      content = (<ScrollView>
        {renderInput('Exam Name', invigilationForm.examName, (v) => setInvigilationForm({ ...invigilationForm, examName: v }))}
        {renderInput('Date (YYYY-MM-DD)', invigilationForm.date, (v) => setInvigilationForm({ ...invigilationForm, date: v }))}
        {renderInput('Time', invigilationForm.time, (v) => setInvigilationForm({ ...invigilationForm, time: v }))}
        {renderInput('Venue', invigilationForm.venue, (v) => setInvigilationForm({ ...invigilationForm, venue: v }))}
        {renderInput('Invigilator', invigilationForm.invigilator, (v) => setInvigilationForm({ ...invigilationForm, invigilator: v }))}
      </ScrollView>);
    } else if (modalType === 'malpractice') {
      title = 'Log Malpractice';
      content = (<ScrollView>
        {renderInput('Student Name', malpracticeForm.studentName, (v) => setMalpracticeForm({ ...malpracticeForm, studentName: v }))}
        {renderInput('Class', malpracticeForm.studentClass, (v) => setMalpracticeForm({ ...malpracticeForm, studentClass: v }))}
        {renderInput('Exam', malpracticeForm.exam, (v) => setMalpracticeForm({ ...malpracticeForm, exam: v }))}
        {renderSelect('Type', malpracticeForm.type, ['Cheating', 'Impersonation', 'Leakage', 'Collusion', 'Other'], (v) => setMalpracticeForm({ ...malpracticeForm, type: v as 'Cheating' | 'Impersonation' | 'Leakage' | 'Collusion' | 'Other' }))}
        {renderInput('Date (YYYY-MM-DD)', malpracticeForm.date, (v) => setMalpracticeForm({ ...malpracticeForm, date: v }))}
        {renderInput('Description', malpracticeForm.description, (v) => setMalpracticeForm({ ...malpracticeForm, description: v }), '', true)}
        {renderInput('Action Taken', malpracticeForm.action, (v) => setMalpracticeForm({ ...malpracticeForm, action: v }), '', true)}
      </ScrollView>);
    }
    const handleSave = () => {
      if (modalType === 'exam') handleSaveExam();
      else if (modalType === 'paper') handleSavePaper();
      else if (modalType === 'invigilation') handleSaveInvigilation();
      else if (modalType === 'malpractice') handleSaveMalpractice();
    };
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
    <DashboardLayout title="Examination Committee" navItems={NAV_ITEMS} activeKey={activePage} onNavigate={setActivePage}>
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
