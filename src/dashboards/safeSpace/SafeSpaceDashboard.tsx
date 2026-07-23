import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useDynamicDashboardStore } from '@store/dynamicDashboardStore';

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'incidents', label: 'Safety Incidents' },
  { key: 'inspections', label: 'Safety Inspections' },
  { key: 'relationships', label: 'Relationship Management' },
  { key: 'environment', label: 'Environment Audit' },
  { key: 'training', label: 'Safety Training' },
  { key: 'reports', label: 'Reports' },
];

export function SafeSpaceDashboard() {
  const [activePage, setActivePage] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const store = useDynamicDashboardStore();

  const [incidentForm, setIncidentForm] = useState<{ date: string; location: string; severity: 'Low' | 'Medium' | 'High' | 'Critical'; status: 'Reported' | 'Investigating' | 'Resolved' | 'Escalated'; description: string; reportedBy: string; action: string }>({ date: '', location: '', severity: 'Medium', status: 'Reported', description: '', reportedBy: '', action: '' });
  const [inspectionForm, setInspectionForm] = useState<{ date: string; area: string; finding: string; riskLevel: 'Safe' | 'Minor Risk' | 'Major Risk' | 'Hazard'; recommendation: string; resolved: boolean }>({ date: '', area: '', finding: '', riskLevel: 'Safe', recommendation: '', resolved: false });
  const [relationshipForm, setRelationshipForm] = useState<{ date: string; parties: string; issue: string; status: 'Open' | 'Mediated' | 'Resolved' | 'Escalated'; mediator: string; notes: string }>({ date: '', parties: '', issue: '', status: 'Open', mediator: '', notes: '' });

  const openModal = (type: string) => { setModalType(type); setShowModal(true); };
  const closeModal = () => setShowModal(false);

  const severityColor = (s: string) => s === 'Critical' ? colors.danger : s === 'High' ? '#FF6B6B' : s === 'Medium' ? colors.warning : colors.info;
  const statusColor = (s: string) => s === 'Resolved' || s === 'Closed' ? colors.success : s === 'Open' || s === 'Reported' ? colors.warning : s === 'Investigating' || s === 'Mediated' ? colors.primary : s === 'Escalated' ? colors.danger : colors.textSecondary;
  const riskColor = (r: string) => r === 'Safe' ? colors.success : r === 'Minor Risk' ? colors.info : r === 'Major Risk' ? colors.warning : colors.danger;

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

  const handleSaveIncident = () => {
    if (!incidentForm.location.trim() || !incidentForm.date.trim()) { Alert.alert('Error', 'Location and date are required'); return; }
    store.addIncident({ ...incidentForm, location: incidentForm.location.trim(), description: incidentForm.description.trim(), action: incidentForm.action.trim() });
    setIncidentForm({ date: '', location: '', severity: 'Medium', status: 'Reported', description: '', reportedBy: '', action: '' });
    closeModal();
  };

  const handleSaveInspection = () => {
    if (!inspectionForm.area.trim() || !inspectionForm.date.trim()) { Alert.alert('Error', 'Area and date are required'); return; }
    store.addSafetyInspection({ ...inspectionForm, area: inspectionForm.area.trim(), finding: inspectionForm.finding.trim(), recommendation: inspectionForm.recommendation.trim() });
    setInspectionForm({ date: '', area: '', finding: '', riskLevel: 'Safe', recommendation: '', resolved: false });
    closeModal();
  };

  const handleSaveRelationship = () => {
    if (!relationshipForm.parties.trim() || !relationshipForm.date.trim()) { Alert.alert('Error', 'Parties and date are required'); return; }
    store.addRelationshipCase({ ...relationshipForm, parties: relationshipForm.parties.trim(), issue: relationshipForm.issue.trim(), notes: relationshipForm.notes.trim() });
    setRelationshipForm({ date: '', parties: '', issue: '', status: 'Open', mediator: '', notes: '' });
    closeModal();
  };

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return (
          <View>
            <CardGrid>
              <StatCard label="Open Incidents" value={store.incidents.filter(i => i.status !== 'Resolved').length} accentColor={colors.danger} />
              <StatCard label="Inspections" value={store.safetyInspections.length} subtitle={`${store.safetyInspections.filter(s => !s.resolved).length} unresolved`} accentColor={colors.warning} />
              <StatCard label="Relationship Cases" value={store.relationshipCases.filter(r => r.status !== 'Resolved').length} accentColor={colors.info} />
              <StatCard label="Resolved" value={store.incidents.filter(i => i.status === 'Resolved').length} accentColor={colors.success} />
            </CardGrid>
            <Text style={styles.sectionTitle}>Recent Incidents</Text>
            {store.incidents.slice(0, 3).map((i) => (
              <View key={i.id} style={[styles.card, { borderLeftColor: severityColor(i.severity) }]}>
                <Text style={styles.cardTitle}>{i.location}</Text>
                <Text style={styles.cardMeta}>{i.date} | Severity: {i.severity}</Text>
                <Text style={styles.cardBody}>{i.description}</Text>
              </View>
            ))}
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.danger }]} onPress={() => openModal('incident')}><Text style={styles.quickBtnText}>+ Incident</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.warning }]} onPress={() => openModal('inspection')}><Text style={styles.quickBtnText}>+ Inspection</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.info }]} onPress={() => openModal('relationship')}><Text style={styles.quickBtnText}>+ Relationship Case</Text></TouchableOpacity>
            </View>
          </View>
        );
      case 'incidents':
        return (
          <View>
            <Text style={styles.pageTitle}>Safety Incidents</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('incident')}><Text style={styles.actionBtnText}>+ Report Incident</Text></TouchableOpacity>
            {store.incidents.map((i) => (
              <View key={i.id} style={[styles.card, { borderLeftColor: severityColor(i.severity) }]}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.row}>
                      <Text style={styles.cardTitle}>{i.location}</Text>
                      <View style={[styles.badge, { backgroundColor: severityColor(i.severity) + '20' }]}><Text style={[styles.badgeText, { color: severityColor(i.severity) }]}>{i.severity}</Text></View>
                      <View style={[styles.badge, { backgroundColor: statusColor(i.status) + '20' }]}><Text style={[styles.badgeText, { color: statusColor(i.status) }]}>{i.status}</Text></View>
                    </View>
                    <Text style={styles.cardMeta}>{i.date} | Reported by: {i.reportedBy}</Text>
                    <Text style={styles.cardBody}>{i.description}</Text>
                    {i.action ? <Text style={styles.cardNotes}>Action: {i.action}</Text> : null}
                    {i.status !== 'Resolved' && (
                      <View style={styles.actionRow}>
                        {i.status === 'Reported' && <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.primary }]} onPress={() => store.updateIncidentStatus(i.id, 'Investigating')}><Text style={styles.smallBtnText}>Investigate</Text></TouchableOpacity>}
                        <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.success }]} onPress={() => store.updateIncidentStatus(i.id, 'Resolved')}><Text style={styles.smallBtnText}>Resolve</Text></TouchableOpacity>
                        <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.danger }]} onPress={() => store.updateIncidentStatus(i.id, 'Escalated')}><Text style={styles.smallBtnText}>Escalate</Text></TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        );
      case 'inspections':
        return (
          <View>
            <Text style={styles.pageTitle}>Safety Inspections</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('inspection')}><Text style={styles.actionBtnText}>+ New Inspection</Text></TouchableOpacity>
            {store.safetyInspections.map((s) => (
              <View key={s.id} style={[styles.card, { borderLeftColor: riskColor(s.riskLevel) }]}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.row}>
                      <Text style={styles.cardTitle}>{s.area}</Text>
                      <View style={[styles.badge, { backgroundColor: riskColor(s.riskLevel) + '20' }]}><Text style={[styles.badgeText, { color: riskColor(s.riskLevel) }]}>{s.riskLevel}</Text></View>
                      {s.resolved && <View style={[styles.badge, { backgroundColor: colors.success + '20' }]}><Text style={[styles.badgeText, { color: colors.success }]}>✓ Resolved</Text></View>}
                    </View>
                    <Text style={styles.cardMeta}>{s.date}</Text>
                    <Text style={styles.cardBody}>{s.finding}</Text>
                    {s.recommendation ? <Text style={styles.cardNotes}>Recommendation: {s.recommendation}</Text> : null}
                  </View>
                </View>
              </View>
            ))}
          </View>
        );
      case 'relationships':
        return (
          <View>
            <Text style={styles.pageTitle}>Relationship Management</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openModal('relationship')}><Text style={styles.actionBtnText}>+ New Case</Text></TouchableOpacity>
            {store.relationshipCases.map((r) => (
              <View key={r.id} style={[styles.card, { borderLeftColor: statusColor(r.status) }]}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.row}>
                      <Text style={styles.cardTitle}>{r.parties}</Text>
                      <View style={[styles.badge, { backgroundColor: statusColor(r.status) + '20' }]}><Text style={[styles.badgeText, { color: statusColor(r.status) }]}>{r.status}</Text></View>
                    </View>
                    <Text style={styles.cardMeta}>{r.date} | Mediator: {r.mediator}</Text>
                    <Text style={styles.cardBody}>{r.issue}</Text>
                    {r.notes ? <Text style={styles.cardNotes}>{r.notes}</Text> : null}
                    {r.status !== 'Resolved' && (
                      <View style={styles.actionRow}>
                        {r.status === 'Open' && <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.primary }]} onPress={() => store.updateRelationshipStatus(r.id, 'Mediated')}><Text style={styles.smallBtnText}>Mark Mediated</Text></TouchableOpacity>}
                        <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.success }]} onPress={() => store.updateRelationshipStatus(r.id, 'Resolved')}><Text style={styles.smallBtnText}>Resolve</Text></TouchableOpacity>
                        <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.danger }]} onPress={() => store.updateRelationshipStatus(r.id, 'Escalated')}><Text style={styles.smallBtnText}>Escalate</Text></TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        );
      case 'environment':
        return <View><Text style={styles.pageTitle}>Environment Audit</Text><Text style={styles.pageSubtitle}>School environment safety and health audits</Text>
          {store.safetyInspections.map((s) => (<View key={s.id} style={styles.card}><Text style={styles.cardTitle}>{s.area}</Text><Text style={styles.cardMeta}>Risk: {s.riskLevel} | {s.date}</Text><Text style={styles.cardBody}>{s.finding}</Text></View>))}
        </View>;
      case 'training':
        return (
          <View>
            <Text style={styles.pageTitle}>Safety Training</Text>
            <Text style={styles.pageSubtitle}>Safety training programs and drills</Text>
            <CardGrid>
              <StatCard label="Trainings" value={store.trainingRecords.length} accentColor={colors.primary} />
              <StatCard label="Total Participants" value={store.trainingRecords.reduce((s, t) => s + t.participants, 0)} accentColor={colors.info} />
              <StatCard label="Fire Drills" value={store.trainingRecords.filter(t => t.type === 'Fire Drill').length} accentColor={colors.warning} />
              <StatCard label="First Aid" value={store.trainingRecords.filter(t => t.type === 'First Aid').length} accentColor={colors.success} />
            </CardGrid>
            {store.trainingRecords.map((t) => (
              <View key={t.id} style={[styles.card, { borderLeftColor: colors.info }]}>
                <View style={styles.row}><Text style={styles.cardTitle}>{t.title}</Text>
                  <View style={[styles.badge, { backgroundColor: colors.info + '20' }]}><Text style={[styles.badgeText, { color: colors.info }]}>{t.type}</Text></View>
                </View>
                <Text style={styles.cardMeta}>{t.date} | Trainer: {t.trainer} | Participants: {t.participants}</Text>
              </View>
            ))}
          </View>
        );
      case 'reports':
        return <View>
          <Text style={styles.pageTitle}>Reports & Analytics</Text>
          <CardGrid>
            <StatCard label="Total Incidents" value={store.incidents.length} accentColor={colors.danger} />
            <StatCard label="Resolved" value={store.incidents.filter(i => i.status === 'Resolved').length} accentColor={colors.success} />
            <StatCard label="Inspections" value={store.safetyInspections.length} accentColor={colors.warning} />
            <StatCard label="Relationship Cases" value={store.relationshipCases.length} accentColor={colors.info} />
          </CardGrid>
          <Text style={styles.sectionTitle}>Incident Summary</Text>
          {store.incidents.map((i) => (<View key={i.id} style={styles.card}><Text style={styles.cardTitle}>{i.location}</Text><Text style={styles.cardMeta}>{i.severity} | {i.status} | {i.date}</Text></View>))}
        </View>;
      default: return null;
    }
  };

  const renderModal = () => {
    let title = '';
    let content: React.ReactNode = null;
    if (modalType === 'incident') {
      title = 'Report Safety Incident';
      content = (<ScrollView>
        {renderInput('Date (YYYY-MM-DD)', incidentForm.date, (v) => setIncidentForm({ ...incidentForm, date: v }))}
        {renderInput('Location', incidentForm.location, (v) => setIncidentForm({ ...incidentForm, location: v }))}
        {renderSelect('Severity', incidentForm.severity, ['Low', 'Medium', 'High', 'Critical'], (v) => setIncidentForm({ ...incidentForm, severity: v as 'Low' | 'Medium' | 'High' | 'Critical' }))}
        {renderInput('Reported By', incidentForm.reportedBy, (v) => setIncidentForm({ ...incidentForm, reportedBy: v }))}
        {renderInput('Description', incidentForm.description, (v) => setIncidentForm({ ...incidentForm, description: v }), '', true)}
        {renderInput('Action Taken', incidentForm.action, (v) => setIncidentForm({ ...incidentForm, action: v }), '', true)}
      </ScrollView>);
    } else if (modalType === 'inspection') {
      title = 'New Safety Inspection';
      content = (<ScrollView>
        {renderInput('Date (YYYY-MM-DD)', inspectionForm.date, (v) => setInspectionForm({ ...inspectionForm, date: v }))}
        {renderInput('Area', inspectionForm.area, (v) => setInspectionForm({ ...inspectionForm, area: v }))}
        {renderInput('Finding', inspectionForm.finding, (v) => setInspectionForm({ ...inspectionForm, finding: v }), '', true)}
        {renderSelect('Risk Level', inspectionForm.riskLevel, ['Safe', 'Minor Risk', 'Major Risk', 'Hazard'], (v) => setInspectionForm({ ...inspectionForm, riskLevel: v as 'Safe' | 'Minor Risk' | 'Major Risk' | 'Hazard' }))}
        {renderInput('Recommendation', inspectionForm.recommendation, (v) => setInspectionForm({ ...inspectionForm, recommendation: v }), '', true)}
      </ScrollView>);
    } else if (modalType === 'relationship') {
      title = 'New Relationship Case';
      content = (<ScrollView>
        {renderInput('Date (YYYY-MM-DD)', relationshipForm.date, (v) => setRelationshipForm({ ...relationshipForm, date: v }))}
        {renderInput('Parties Involved', relationshipForm.parties, (v) => setRelationshipForm({ ...relationshipForm, parties: v }))}
        {renderInput('Issue', relationshipForm.issue, (v) => setRelationshipForm({ ...relationshipForm, issue: v }), '', true)}
        {renderInput('Mediator', relationshipForm.mediator, (v) => setRelationshipForm({ ...relationshipForm, mediator: v }))}
        {renderInput('Notes', relationshipForm.notes, (v) => setRelationshipForm({ ...relationshipForm, notes: v }), '', true)}
      </ScrollView>);
    }
    const handleSave = () => {
      if (modalType === 'incident') handleSaveIncident();
      else if (modalType === 'inspection') handleSaveInspection();
      else if (modalType === 'relationship') handleSaveRelationship();
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
    <DashboardLayout title="Safe Space" navItems={NAV_ITEMS} activeKey={activePage} onNavigate={setActivePage}>
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
