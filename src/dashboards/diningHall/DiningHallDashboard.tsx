import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useDynamicDashboardStore } from '@store/dynamicDashboardStore';

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'seating', label: 'Seating Plan' },
  { key: 'menu', label: 'Menu Oversight' },
  { key: 'attendance', label: 'Meal Attendance' },
  { key: 'supplies', label: 'Supplies & Stock' },
  { key: 'hygiene', label: 'Hygiene Inspection' },
  { key: 'feedback', label: 'Student Feedback' },
  { key: 'reports', label: 'Reports' },
];

export function DiningHallDashboard() {
  const [activePage, setActivePage] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const store = useDynamicDashboardStore();

  const [hygieneForm, setHygieneForm] = useState<{ date: string; area: string; rating: 'Excellent' | 'Good' | 'Fair' | 'Poor'; inspector: string; notes: string }>({ date: '', area: '', rating: 'Good', inspector: '', notes: '' });
  const [feedbackForm, setFeedbackForm] = useState({ date: '', studentName: '', meal: '', rating: '3', comment: '' });

  const openModal = (type: string) => { setModalType(type); setShowModal(true); };
  const closeModal = () => setShowModal(false);

  const ratingColor = (r: string) => r === 'Excellent' || r === '5' ? colors.success : r === 'Good' || r === '4' ? colors.primary : r === 'Fair' || r === '3' ? colors.warning : colors.danger;
  const statusColor = (s: string) => s === 'Approved' || s === 'Served' || s === 'In Stock' ? colors.success : s === 'Draft' || s === 'Low Stock' ? colors.warning : s === 'Out of Stock' ? colors.danger : colors.info;

  const handleSaveHygiene = () => {
    if (!hygieneForm.area.trim() || !hygieneForm.date.trim()) { Alert.alert('Error', 'Area and date are required'); return; }
    store.addHygieneInspection({ ...hygieneForm, area: hygieneForm.area.trim(), notes: hygieneForm.notes.trim() });
    setHygieneForm({ date: '', area: '', rating: 'Good', inspector: '', notes: '' });
    closeModal();
  };

  const handleSaveFeedback = () => {
    if (!feedbackForm.studentName.trim() || !feedbackForm.date.trim()) { Alert.alert('Error', 'Student name and date are required'); return; }
    store.addStudentFeedback({ ...feedbackForm, studentName: feedbackForm.studentName.trim(), comment: feedbackForm.comment.trim(), rating: Number(feedbackForm.rating) || 3 });
    setFeedbackForm({ date: '', studentName: '', meal: '', rating: '3', comment: '' });
    closeModal();
  };

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

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return (
          <View>
            <CardGrid>
              <StatCard label="Meal Records" value={store.mealAttendance.length} accentColor={colors.primary} />
              <StatCard label="Avg Attendance" value={store.mealAttendance.length > 0 ? Math.round(store.mealAttendance.reduce((s, m) => s + (m.present / m.expected) * 100, 0) / store.mealAttendance.length) + '%' : 'N/A'} accentColor={colors.success} />
              <StatCard label="Hygiene Checks" value={store.hygieneInspections.length} accentColor={colors.info} />
              <StatCard label="Feedback Items" value={store.studentFeedback.length} accentColor={colors.accent} />
            </CardGrid>
            <Text style={styles.sectionTitle}>Recent Meal Attendance</Text>
            {store.mealAttendance.slice(0, 3).map((m) => (
              <View key={m.id} style={[styles.card, { borderLeftColor: colors.primary }]}>
                <Text style={styles.cardTitle}>{m.meal} — {m.date}</Text>
                <Text style={styles.cardMeta}>Present: {m.present}/{m.expected} | Absent: {m.absentees}</Text>
              </View>
            ))}
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.primary }]} onPress={() => openModal('hygiene')}><Text style={styles.quickBtnText}>+ Hygiene Check</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.accent }]} onPress={() => openModal('feedback')}><Text style={styles.quickBtnText}>+ Feedback</Text></TouchableOpacity>
            </View>
          </View>
        );
      case 'attendance':
        return (
          <View>
            <Text style={styles.pageTitle}>Meal Attendance</Text>
            <Text style={styles.pageSubtitle}>Track boarding student meal attendance</Text>
            {store.mealAttendance.map((m) => (
              <View key={m.id} style={[styles.card, { borderLeftColor: colors.primary }]}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{m.meal} — {m.date}</Text>
                    <Text style={styles.cardMeta}>Expected: {m.expected} | Present: {m.present} | Absent: {m.absentees}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        );
      case 'hygiene':
        return (
          <View>
            <Text style={styles.pageTitle}>Hygiene Inspections</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('hygiene')}><Text style={styles.actionBtnText}>+ New Inspection</Text></TouchableOpacity>
            {store.hygieneInspections.map((h) => (
              <View key={h.id} style={[styles.card, { borderLeftColor: ratingColor(h.rating) }]}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.row}><Text style={styles.cardTitle}>{h.area}</Text>
                      <View style={[styles.badge, { backgroundColor: ratingColor(h.rating) + '20' }]}><Text style={[styles.badgeText, { color: ratingColor(h.rating) }]}>{h.rating}</Text></View>
                    </View>
                    <Text style={styles.cardMeta}>{h.date} | Inspector: {h.inspector}</Text>
                    {h.notes ? <Text style={styles.cardNotes}>{h.notes}</Text> : null}
                  </View>
                  <TouchableOpacity onPress={() => Alert.alert('Delete', 'Delete this inspection?', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => store.deleteHygieneInspection(h.id) }])}><Text style={styles.deleteBtn}>✕</Text></TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );
      case 'feedback':
        return (
          <View>
            <Text style={styles.pageTitle}>Student Feedback</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('feedback')}><Text style={styles.actionBtnText}>+ New Feedback</Text></TouchableOpacity>
            {store.studentFeedback.map((f) => (
              <View key={f.id} style={[styles.card, { borderLeftColor: ratingColor(String(f.rating)) }]}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.row}><Text style={styles.cardTitle}>{f.studentName}</Text>
                      <View style={[styles.badge, { backgroundColor: ratingColor(String(f.rating)) + '20' }]}><Text style={[styles.badgeText, { color: ratingColor(String(f.rating)) }]}>{'★'.repeat(f.rating)}</Text></View>
                    </View>
                    <Text style={styles.cardMeta}>{f.date} | Meal: {f.meal}</Text>
                    <Text style={styles.cardBody}>{f.comment}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        );
      case 'seating':
        return (
          <View>
            <Text style={styles.pageTitle}>Seating Plan</Text>
            <Text style={styles.pageSubtitle}>Manage dining hall seating arrangements for boarding students</Text>
            {store.seatingPlans.map((s) => (
              <View key={s.id} style={[styles.card, { borderLeftColor: colors.info }]}>
                <Text style={styles.cardTitle}>{s.table} — {s.house}</Text>
                <Text style={styles.cardMeta}>{s.form} | Capacity: {s.capacity} | {s.students}</Text>
              </View>
            ))}
          </View>
        );
      case 'menu':
        return (
          <View>
            <Text style={styles.pageTitle}>Menu Oversight</Text>
            <Text style={styles.pageSubtitle}>Review and approve catering menus for boarding students</Text>
            {store.menuItems.map((m) => (
              <View key={m.id} style={[styles.card, { borderLeftColor: statusColor(m.status) }]}>
                <View style={styles.row}><Text style={styles.cardTitle}>{m.meal} — {m.date}</Text>
                  <View style={[styles.badge, { backgroundColor: statusColor(m.status) + '20' }]}><Text style={[styles.badgeText, { color: statusColor(m.status) }]}>{m.status}</Text></View>
                </View>
                <Text style={styles.cardBody}>Main: {m.mainDish} | Side: {m.side} | Drink: {m.drink}</Text>
                {m.status !== 'Served' && (
                  <View style={styles.actionRow}>
                    {m.status === 'Draft' && <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.success }]} onPress={() => store.updateMenuItemStatus(m.id, 'Approved')}><Text style={styles.smallBtnText}>Approve</Text></TouchableOpacity>}
                    {m.status === 'Approved' && <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.accent }]} onPress={() => store.updateMenuItemStatus(m.id, 'Served')}><Text style={styles.smallBtnText}>Mark Served</Text></TouchableOpacity>}
                  </View>
                )}
              </View>
            ))}
          </View>
        );
      case 'supplies':
        return (
          <View>
            <Text style={styles.pageTitle}>Supplies & Stock</Text>
            <Text style={styles.pageSubtitle}>Monitor dining hall supplies and stock levels</Text>
            <CardGrid>
              <StatCard label="Total Items" value={store.supplies.length} accentColor={colors.primary} />
              <StatCard label="Low Stock" value={store.supplies.filter(s => s.status === 'Low Stock').length} accentColor={colors.warning} />
              <StatCard label="Out of Stock" value={store.supplies.filter(s => s.status === 'Out of Stock').length} accentColor={colors.danger} />
              <StatCard label="In Stock" value={store.supplies.filter(s => s.status === 'In Stock').length} accentColor={colors.success} />
            </CardGrid>
            {store.supplies.map((s) => (
              <View key={s.id} style={[styles.card, { borderLeftColor: statusColor(s.status) }]}>
                <View style={styles.row}><Text style={styles.cardTitle}>{s.item}</Text>
                  <View style={[styles.badge, { backgroundColor: statusColor(s.status) + '20' }]}><Text style={[styles.badgeText, { color: statusColor(s.status) }]}>{s.status}</Text></View>
                </View>
                <Text style={styles.cardMeta}>{s.category} | Stock: {s.quantity} {s.unit} (Min: {s.minStock})</Text>
              </View>
            ))}
          </View>
        );
      case 'reports':
        return <View>
          <Text style={styles.pageTitle}>Reports & Analytics</Text>
          <CardGrid>
            <StatCard label="Total Meals" value={store.mealAttendance.length} accentColor={colors.primary} />
            <StatCard label="Hygiene Checks" value={store.hygieneInspections.length} accentColor={colors.info} />
            <StatCard label="Feedback" value={store.studentFeedback.length} accentColor={colors.accent} />
            <StatCard label="Avg Rating" value={store.studentFeedback.length > 0 ? (store.studentFeedback.reduce((s, f) => s + f.rating, 0) / store.studentFeedback.length).toFixed(1) : 'N/A'} accentColor={colors.success} />
          </CardGrid>
          <Text style={styles.sectionTitle}>Hygiene Summary</Text>
          {store.hygieneInspections.map((h) => (<View key={h.id} style={styles.card}><Text style={styles.cardTitle}>{h.area}</Text><Text style={styles.cardMeta}>Rating: {h.rating} | {h.date}</Text></View>))}
        </View>;
      default: return null;
    }
  };

  const renderModal = () => {
    let title = '';
    let content: React.ReactNode = null;
    if (modalType === 'hygiene') {
      title = 'New Hygiene Inspection';
      content = (<ScrollView>
        {renderInput('Date (YYYY-MM-DD)', hygieneForm.date, (v) => setHygieneForm({ ...hygieneForm, date: v }))}
        {renderInput('Area', hygieneForm.area, (v) => setHygieneForm({ ...hygieneForm, area: v }))}
        {renderSelect('Rating', hygieneForm.rating, ['Excellent', 'Good', 'Fair', 'Poor'], (v) => setHygieneForm({ ...hygieneForm, rating: v as 'Excellent' | 'Good' | 'Fair' | 'Poor' }))}
        {renderInput('Inspector', hygieneForm.inspector, (v) => setHygieneForm({ ...hygieneForm, inspector: v }))}
        {renderInput('Notes', hygieneForm.notes, (v) => setHygieneForm({ ...hygieneForm, notes: v }), '', true)}
      </ScrollView>);
    } else if (modalType === 'feedback') {
      title = 'New Student Feedback';
      content = (<ScrollView>
        {renderInput('Date (YYYY-MM-DD)', feedbackForm.date, (v) => setFeedbackForm({ ...feedbackForm, date: v }))}
        {renderInput('Student Name', feedbackForm.studentName, (v) => setFeedbackForm({ ...feedbackForm, studentName: v }))}
        {renderInput('Meal', feedbackForm.meal, (v) => setFeedbackForm({ ...feedbackForm, meal: v }))}
        {renderSelect('Rating', feedbackForm.rating, ['1', '2', '3', '4', '5'], (v) => setFeedbackForm({ ...feedbackForm, rating: v }))}
        {renderInput('Comment', feedbackForm.comment, (v) => setFeedbackForm({ ...feedbackForm, comment: v }), '', true)}
      </ScrollView>);
    }
    const handleSave = () => { if (modalType === 'hygiene') handleSaveHygiene(); else if (modalType === 'feedback') handleSaveFeedback(); };
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
    <DashboardLayout title="Dining Hall Master" navItems={NAV_ITEMS} activeKey={activePage} onNavigate={setActivePage}>
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
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  smallBtn: { borderRadius: radius.sm, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
  smallBtnText: { color: colors.white, fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
});
