import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useDynamicDashboardStore } from '@store/dynamicDashboardStore';

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'appointments', label: 'Appointments' },
  { key: 'correspondence', label: 'Correspondence' },
  { key: 'filing', label: 'Filing & Records' },
  { key: 'visitors', label: 'Visitor Log' },
  { key: 'tasks', label: 'Task Tracker' },
  { key: 'reports', label: 'Reports' },
];

export function HeadmasterSecretaryDashboard() {
  const [activePage, setActivePage] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const store = useDynamicDashboardStore();

  const [appointmentForm, setAppointmentForm] = useState<{ date: string; time: string; visitorName: string; purpose: string; status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'; notes: string }>({ date: '', time: '', visitorName: '', purpose: '', status: 'Pending', notes: '' });
  const [correspondenceForm, setCorrespondenceForm] = useState<{ date: string; type: 'Incoming' | 'Outgoing'; from: string; to: string; subject: string; status: 'Pending' | 'Forwarded' | 'Filed' | 'Replied' }>({ date: '', type: 'Incoming', from: '', to: '', subject: '', status: 'Pending' });
  const [visitorForm, setVisitorForm] = useState({ date: '', timeIn: '', timeOut: '', visitorName: '', purpose: '', contact: '' });
  const [taskForm, setTaskForm] = useState<{ title: string; priority: 'High' | 'Medium' | 'Low'; status: 'Pending' | 'In Progress' | 'Completed'; dueDate: string; assignedBy: string; notes: string }>({ title: '', priority: 'Medium', status: 'Pending', dueDate: '', assignedBy: 'Headmaster', notes: '' });

  const openModal = (type: string) => { setModalType(type); setShowModal(true); };
  const closeModal = () => setShowModal(false);

  const statusColor = (s: string) => s === 'Completed' || s === 'Filed' || s === 'Replied' ? colors.success : s === 'Confirmed' || s === 'In Progress' || s === 'Forwarded' ? colors.primary : s === 'Pending' || s === 'Cancelled' ? colors.warning : colors.textSecondary;
  const priorityColor = (p: string) => p === 'High' ? colors.danger : p === 'Medium' ? colors.warning : colors.info;

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

  const handleSaveAppointment = () => {
    if (!appointmentForm.visitorName.trim() || !appointmentForm.date.trim()) { Alert.alert('Error', 'Visitor name and date are required'); return; }
    store.addAppointment({ ...appointmentForm, visitorName: appointmentForm.visitorName.trim(), purpose: appointmentForm.purpose.trim(), notes: appointmentForm.notes.trim() });
    setAppointmentForm({ date: '', time: '', visitorName: '', purpose: '', status: 'Pending', notes: '' });
    closeModal();
  };

  const handleSaveCorrespondence = () => {
    if (!correspondenceForm.subject.trim() || !correspondenceForm.date.trim()) { Alert.alert('Error', 'Subject and date are required'); return; }
    store.addCorrespondence({ ...correspondenceForm, from: correspondenceForm.from.trim(), to: correspondenceForm.to.trim(), subject: correspondenceForm.subject.trim() });
    setCorrespondenceForm({ date: '', type: 'Incoming', from: '', to: '', subject: '', status: 'Pending' });
    closeModal();
  };

  const handleSaveVisitor = () => {
    if (!visitorForm.visitorName.trim() || !visitorForm.date.trim()) { Alert.alert('Error', 'Visitor name and date are required'); return; }
    store.addVisitor({ ...visitorForm, visitorName: visitorForm.visitorName.trim(), purpose: visitorForm.purpose.trim(), contact: visitorForm.contact.trim() });
    setVisitorForm({ date: '', timeIn: '', timeOut: '', visitorName: '', purpose: '', contact: '' });
    closeModal();
  };

  const handleSaveTask = () => {
    if (!taskForm.title.trim() || !taskForm.dueDate.trim()) { Alert.alert('Error', 'Title and due date are required'); return; }
    store.addTask({ ...taskForm, title: taskForm.title.trim(), notes: taskForm.notes.trim() });
    setTaskForm({ title: '', priority: 'Medium', status: 'Pending', dueDate: '', assignedBy: 'Headmaster', notes: '' });
    closeModal();
  };

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return (
          <View>
            <CardGrid>
              <StatCard label="Appointments" value={store.appointments.filter(a => a.status === 'Pending' || a.status === 'Confirmed').length} subtitle="Upcoming" accentColor={colors.primary} />
              <StatCard label="Correspondence" value={store.correspondence.filter(c => c.status === 'Pending').length} subtitle="Pending" accentColor={colors.warning} />
              <StatCard label="Visitors Today" value={store.visitors.filter(v => v.date === new Date().toISOString().slice(0, 10)).length} accentColor={colors.info} />
              <StatCard label="Open Tasks" value={store.secretaryTasks.filter(t => t.status !== 'Completed').length} accentColor={colors.danger} />
            </CardGrid>
            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
            {store.appointments.filter(a => a.status === 'Pending' || a.status === 'Confirmed').map((a) => (
              <View key={a.id} style={[styles.card, { borderLeftColor: statusColor(a.status) }]}>
                <Text style={styles.cardTitle}>{a.visitorName}</Text>
                <Text style={styles.cardMeta}>{a.date} at {a.time} | {a.purpose}</Text>
              </View>
            ))}
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.primary }]} onPress={() => openModal('appointment')}><Text style={styles.quickBtnText}>+ Appointment</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.info }]} onPress={() => openModal('correspondence')}><Text style={styles.quickBtnText}>+ Correspondence</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.accent }]} onPress={() => openModal('visitor')}><Text style={styles.quickBtnText}>+ Visitor</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.success }]} onPress={() => openModal('task')}><Text style={styles.quickBtnText}>+ Task</Text></TouchableOpacity>
            </View>
          </View>
        );
      case 'appointments':
        return (
          <View>
            <Text style={styles.pageTitle}>Appointments</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('appointment')}><Text style={styles.actionBtnText}>+ New Appointment</Text></TouchableOpacity>
            {store.appointments.map((a) => (
              <View key={a.id} style={[styles.card, { borderLeftColor: statusColor(a.status) }]}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.row}><Text style={styles.cardTitle}>{a.visitorName}</Text>
                      <View style={[styles.badge, { backgroundColor: statusColor(a.status) + '20' }]}><Text style={[styles.badgeText, { color: statusColor(a.status) }]}>{a.status}</Text></View>
                    </View>
                    <Text style={styles.cardMeta}>{a.date} at {a.time}</Text>
                    <Text style={styles.cardBody}>{a.purpose}</Text>
                    {a.notes ? <Text style={styles.cardNotes}>{a.notes}</Text> : null}
                    {a.status !== 'Completed' && a.status !== 'Cancelled' && (
                      <View style={styles.actionRow}>
                        {a.status === 'Pending' && <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.primary }]} onPress={() => store.updateAppointmentStatus(a.id, 'Confirmed')}><Text style={styles.smallBtnText}>Confirm</Text></TouchableOpacity>}
                        <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.success }]} onPress={() => store.updateAppointmentStatus(a.id, 'Completed')}><Text style={styles.smallBtnText}>Complete</Text></TouchableOpacity>
                        <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.danger }]} onPress={() => store.updateAppointmentStatus(a.id, 'Cancelled')}><Text style={styles.smallBtnText}>Cancel</Text></TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        );
      case 'correspondence':
        return (
          <View>
            <Text style={styles.pageTitle}>Correspondence</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('correspondence')}><Text style={styles.actionBtnText}>+ New Correspondence</Text></TouchableOpacity>
            {store.correspondence.map((c) => (
              <View key={c.id} style={[styles.card, { borderLeftColor: c.type === 'Incoming' ? colors.info : colors.accent }]}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.row}>
                      <Text style={styles.cardTitle}>{c.subject}</Text>
                      <View style={[styles.badge, { backgroundColor: (c.type === 'Incoming' ? colors.info : colors.accent) + '20' }]}><Text style={[styles.badgeText, { color: c.type === 'Incoming' ? colors.info : colors.accent }]}>{c.type}</Text></View>
                      <View style={[styles.badge, { backgroundColor: statusColor(c.status) + '20' }]}><Text style={[styles.badgeText, { color: statusColor(c.status) }]}>{c.status}</Text></View>
                    </View>
                    <Text style={styles.cardMeta}>{c.date} | From: {c.from} → To: {c.to}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        );
      case 'filing':
        return <View><Text style={styles.pageTitle}>Filing & Records</Text><Text style={styles.pageSubtitle}>Manage filing system and official records</Text>
          <CardGrid>
            <StatCard label="Filed" value={store.correspondence.filter(c => c.status === 'Filed').length} accentColor={colors.success} />
            <StatCard label="Pending" value={store.correspondence.filter(c => c.status === 'Pending').length} accentColor={colors.warning} />
            <StatCard label="Forwarded" value={store.correspondence.filter(c => c.status === 'Forwarded').length} accentColor={colors.primary} />
            <StatCard label="Replied" value={store.correspondence.filter(c => c.status === 'Replied').length} accentColor={colors.info} />
          </CardGrid>
        </View>;
      case 'visitors':
        return (
          <View>
            <Text style={styles.pageTitle}>Visitor Log</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('visitor')}><Text style={styles.actionBtnText}>+ Log Visitor</Text></TouchableOpacity>
            {store.visitors.map((v) => (
              <View key={v.id} style={[styles.card, { borderLeftColor: colors.accent }]}>
                <Text style={styles.cardTitle}>{v.visitorName}</Text>
                <Text style={styles.cardMeta}>{v.date} | In: {v.timeIn} | Out: {v.timeOut}</Text>
                <Text style={styles.cardMeta}>Purpose: {v.purpose} | Contact: {v.contact}</Text>
              </View>
            ))}
          </View>
        );
      case 'tasks':
        return (
          <View>
            <Text style={styles.pageTitle}>Task Tracker</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('task')}><Text style={styles.actionBtnText}>+ New Task</Text></TouchableOpacity>
            {store.secretaryTasks.map((t) => (
              <View key={t.id} style={[styles.card, { borderLeftColor: priorityColor(t.priority) }]}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.row}>
                      <Text style={styles.cardTitle}>{t.title}</Text>
                      <View style={[styles.badge, { backgroundColor: priorityColor(t.priority) + '20' }]}><Text style={[styles.badgeText, { color: priorityColor(t.priority) }]}>{t.priority}</Text></View>
                      <View style={[styles.badge, { backgroundColor: statusColor(t.status) + '20' }]}><Text style={[styles.badgeText, { color: statusColor(t.status) }]}>{t.status}</Text></View>
                    </View>
                    <Text style={styles.cardMeta}>Due: {t.dueDate} | Assigned by: {t.assignedBy}</Text>
                    {t.notes ? <Text style={styles.cardNotes}>{t.notes}</Text> : null}
                    {t.status !== 'Completed' && (
                      <View style={styles.actionRow}>
                        {t.status === 'Pending' && <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.primary }]} onPress={() => store.updateTaskStatus(t.id, 'In Progress')}><Text style={styles.smallBtnText}>Start</Text></TouchableOpacity>}
                        <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.success }]} onPress={() => store.updateTaskStatus(t.id, 'Completed')}><Text style={styles.smallBtnText}>Complete</Text></TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        );
      case 'reports':
        return <View>
          <Text style={styles.pageTitle}>Reports & Analytics</Text>
          <CardGrid>
            <StatCard label="Appointments" value={store.appointments.length} accentColor={colors.primary} />
            <StatCard label="Correspondence" value={store.correspondence.length} accentColor={colors.info} />
            <StatCard label="Visitors" value={store.visitors.length} accentColor={colors.accent} />
            <StatCard label="Tasks" value={store.secretaryTasks.length} accentColor={colors.success} />
          </CardGrid>
          <Text style={styles.sectionTitle}>Task Summary</Text>
          {store.secretaryTasks.map((t) => (<View key={t.id} style={styles.card}><Text style={styles.cardTitle}>{t.title}</Text><Text style={styles.cardMeta}>Priority: {t.priority} | Status: {t.status} | Due: {t.dueDate}</Text></View>))}
        </View>;
      default: return null;
    }
  };

  const renderModal = () => {
    let title = '';
    let content: React.ReactNode = null;
    if (modalType === 'appointment') {
      title = 'New Appointment';
      content = (<ScrollView>
        {renderInput('Date (YYYY-MM-DD)', appointmentForm.date, (v) => setAppointmentForm({ ...appointmentForm, date: v }))}
        {renderInput('Time', appointmentForm.time, (v) => setAppointmentForm({ ...appointmentForm, time: v }))}
        {renderInput('Visitor Name', appointmentForm.visitorName, (v) => setAppointmentForm({ ...appointmentForm, visitorName: v }))}
        {renderInput('Purpose', appointmentForm.purpose, (v) => setAppointmentForm({ ...appointmentForm, purpose: v }), '', true)}
        {renderInput('Notes', appointmentForm.notes, (v) => setAppointmentForm({ ...appointmentForm, notes: v }), '', true)}
      </ScrollView>);
    } else if (modalType === 'correspondence') {
      title = 'New Correspondence';
      content = (<ScrollView>
        {renderInput('Date (YYYY-MM-DD)', correspondenceForm.date, (v) => setCorrespondenceForm({ ...correspondenceForm, date: v }))}
        {renderSelect('Type', correspondenceForm.type, ['Incoming', 'Outgoing'], (v) => setCorrespondenceForm({ ...correspondenceForm, type: v as 'Incoming' | 'Outgoing' }))}
        {renderInput('From', correspondenceForm.from, (v) => setCorrespondenceForm({ ...correspondenceForm, from: v }))}
        {renderInput('To', correspondenceForm.to, (v) => setCorrespondenceForm({ ...correspondenceForm, to: v }))}
        {renderInput('Subject', correspondenceForm.subject, (v) => setCorrespondenceForm({ ...correspondenceForm, subject: v }))}
      </ScrollView>);
    } else if (modalType === 'visitor') {
      title = 'Log Visitor';
      content = (<ScrollView>
        {renderInput('Date (YYYY-MM-DD)', visitorForm.date, (v) => setVisitorForm({ ...visitorForm, date: v }))}
        {renderInput('Time In', visitorForm.timeIn, (v) => setVisitorForm({ ...visitorForm, timeIn: v }))}
        {renderInput('Time Out', visitorForm.timeOut, (v) => setVisitorForm({ ...visitorForm, timeOut: v }))}
        {renderInput('Visitor Name', visitorForm.visitorName, (v) => setVisitorForm({ ...visitorForm, visitorName: v }))}
        {renderInput('Purpose', visitorForm.purpose, (v) => setVisitorForm({ ...visitorForm, purpose: v }))}
        {renderInput('Contact', visitorForm.contact, (v) => setVisitorForm({ ...visitorForm, contact: v }))}
      </ScrollView>);
    } else if (modalType === 'task') {
      title = 'New Task';
      content = (<ScrollView>
        {renderInput('Title', taskForm.title, (v) => setTaskForm({ ...taskForm, title: v }))}
        {renderSelect('Priority', taskForm.priority, ['High', 'Medium', 'Low'], (v) => setTaskForm({ ...taskForm, priority: v as 'High' | 'Medium' | 'Low' }))}
        {renderInput('Due Date (YYYY-MM-DD)', taskForm.dueDate, (v) => setTaskForm({ ...taskForm, dueDate: v }))}
        {renderInput('Assigned By', taskForm.assignedBy, (v) => setTaskForm({ ...taskForm, assignedBy: v }))}
        {renderInput('Notes', taskForm.notes, (v) => setTaskForm({ ...taskForm, notes: v }), '', true)}
      </ScrollView>);
    }
    const handleSave = () => {
      if (modalType === 'appointment') handleSaveAppointment();
      else if (modalType === 'correspondence') handleSaveCorrespondence();
      else if (modalType === 'visitor') handleSaveVisitor();
      else if (modalType === 'task') handleSaveTask();
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
    <DashboardLayout title="Headmaster Secretary" navItems={NAV_ITEMS} activeKey={activePage} onNavigate={setActivePage}>
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
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, flexWrap: 'wrap' },
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
