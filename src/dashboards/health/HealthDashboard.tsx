import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid, DataTable, RequisitionModal } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useAuthStore } from '@store/authStore';
import { useRequisitionStore } from '@store/requisitionStore';

const NAV_ITEMS: NavItem[] = [
  { key: 'patients', label: 'Patient Log' },
  { key: 'inventory', label: 'Medical Inventory' },
  { key: 'referrals', label: 'Referral Tracker' },
  { key: 'records', label: 'Health Records' },
  { key: 'reports', label: 'Health Reports' },
];

export function HealthDashboard() {
  const [activePage, setActivePage] = useState('patients');
  const [showReqModal, setShowReqModal] = useState(false);
  const { logout, user } = useAuthStore();
  const { getByDepartment } = useRequisitionStore();
  const myRequisitions = getByDepartment('Health Centre');
  const reqStatusColor = (s: string) => s === 'Issued' ? colors.success : s === 'Approved' ? colors.info : s === 'Rejected' ? colors.danger : colors.warning;

  const [patientName, setPatientName] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [treatment, setTreatment] = useState('');

  const handleLogVisit = () => {
    if (!patientName.trim()) {
      Alert.alert('Error', 'Patient name is required');
      return;
    }
    // TODO: Create patient log entry in local DB (offline-capable)
    setPatientName('');
    setSymptoms('');
    setTreatment('');
    Alert.alert('Success', 'Visit logged (will sync when online)');
  };

  const renderPage = () => {
    switch (activePage) {
      case 'patients':
        return (
          <View>
            <CardGrid>
              <StatCard label="Visits Today" value="17" accentColor={colors.warning} />
              <StatCard label="Active Referrals" value="3" accentColor={colors.danger} />
              <StatCard label="Students Enrolled" value="1,247" accentColor={colors.primary} />
            </CardGrid>
            <Text style={styles.pageTitle}>Patient Log</Text>
            <Text style={styles.pageSubtitle}>Visits, symptoms, treatment — offline-capable</Text>

            <View style={styles.quickEntryCard}>
              <Text style={styles.quickEntryTitle}>Log New Visit</Text>
              <TextInput style={styles.input} placeholder="Patient name (student/staff)" placeholderTextColor={colors.textLight} value={patientName} onChangeText={setPatientName} />
              <TextInput style={styles.input} placeholder="Symptoms / complaint" placeholderTextColor={colors.textLight} value={symptoms} onChangeText={setSymptoms} multiline />
              <TextInput style={styles.input} placeholder="Treatment given" placeholderTextColor={colors.textLight} value={treatment} onChangeText={setTreatment} multiline />
              <TouchableOpacity style={styles.logBtn} onPress={handleLogVisit}>
                <Text style={styles.logBtnText}>Log Visit</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Today's Visits</Text>
            <DataTable
              columns={[
                { key: 'time', label: 'Time', render: (i) => i.time },
                { key: 'patient', label: 'Patient', render: (i) => i.patient },
                { key: 'symptoms', label: 'Symptoms', render: (i) => i.symptoms },
                { key: 'treatment', label: 'Treatment', render: (i) => i.treatment },
              ]}
              data={[
                { time: '14:20', patient: 'K. Asante (SHS2)', symptoms: 'Headache, fever', treatment: 'Paracetamol, rest' },
                { time: '13:00', patient: 'A. Owusu (SHS1)', symptoms: 'Stomach pain', treatment: 'Antacid, observation' },
                { time: '11:30', patient: 'Mr. Tetteh (Staff)', symptoms: 'BP check', treatment: 'BP 120/80, normal' },
              ]}
            />
          </View>
        );
      case 'inventory':
        return (
          <View>
            <CardGrid>
              <StatCard label="Requests to Stores" value={myRequisitions.length} accentColor={colors.primary} />
              <StatCard label="Pending" value={myRequisitions.filter(r => r.status === 'Pending').length} accentColor={colors.warning} />
              <StatCard label="Issued" value={myRequisitions.filter(r => r.status === 'Issued').length} accentColor={colors.success} />
            </CardGrid>
            <Text style={styles.pageTitle}>Medical Inventory</Text>
            <Text style={styles.pageSubtitle}>Request medical supplies from Stores</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowReqModal(true)}>
              <Text style={styles.actionBtnText}>+ Request Supplies from Stores</Text>
            </TouchableOpacity>
            {myRequisitions.length > 0 && (
              <View>
                <Text style={styles.sectionTitle}>My Requisitions</Text>
                {myRequisitions.map((req) => (
                  <View key={req.id} style={styles.reqCard}>
                    <View style={styles.reqHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reqTitle}>{req.itemName}</Text>
                        <Text style={styles.reqMeta}>{req.date} | {req.quantity} {req.unit} | Priority: {req.priority}</Text>
                        {req.notes ? <Text style={styles.reqNotes}>{req.notes}</Text> : null}
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: reqStatusColor(req.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: reqStatusColor(req.status) }]}>{req.status}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
            <Text style={styles.sectionTitle}>Current Stock</Text>
            <DataTable
              columns={[
                { key: 'item', label: 'Item', render: (i) => i.item },
                { key: 'qty', label: 'Quantity', render: (i) => i.qty },
                { key: 'expiry', label: 'Expiry', render: (i) => i.expiry },
                { key: 'status', label: 'Status', render: (i) => i.status },
              ]}
              data={[
                { item: 'Paracetamol 500mg', qty: '450 tabs', expiry: '2027-03', status: 'OK' },
                { item: 'Amoxicillin 250mg', qty: '80 caps', expiry: '2026-09', status: 'Low' },
                { item: 'ORS sachets', qty: '120', expiry: '2027-06', status: 'OK' },
                { item: 'Bandages', qty: '15 rolls', expiry: '-', status: 'OK' },
                { item: 'Antacid', qty: '5 bottles', expiry: '2026-08', status: 'Low' },
              ]}
            />
          </View>
        );
      case 'referrals':
        return (
          <View>
            <Text style={styles.pageTitle}>Referral Tracker</Text>
            <Text style={styles.pageSubtitle}>Cases sent to hospital</Text>
            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>+ New Referral</Text>
            </TouchableOpacity>
            <DataTable
              columns={[
                { key: 'date', label: 'Date', render: (i) => i.date },
                { key: 'patient', label: 'Patient', render: (i) => i.patient },
                { key: 'hospital', label: 'Hospital', render: (i) => i.hospital },
                { key: 'reason', label: 'Reason', render: (i) => i.reason },
                { key: 'status', label: 'Status', render: (i) => i.status },
              ]}
              data={[
                { date: '2026-07-05', patient: 'D. Osei (SHS1)', hospital: 'KATH', reason: 'Severe malaria', status: 'Admitted' },
                { date: '2026-07-02', patient: 'G. Opoku (SHS2)', hospital: 'Regional Hosp.', reason: 'Appendicitis', status: 'Discharged' },
                { date: '2026-06-28', patient: 'P. Agyei (SHS2)', hospital: 'KATH', reason: 'Fracture', status: 'Follow-up' },
              ]}
            />
          </View>
        );
      case 'records':
        return (
          <View>
            <Text style={styles.pageTitle}>Health Records</Text>
            <Text style={styles.pageSubtitle}>Chronic conditions and allergies flagged per student</Text>
            <DataTable
              columns={[
                { key: 'student', label: 'Student', render: (i) => i.student },
                { key: 'condition', label: 'Condition', render: (i) => i.condition },
                { key: 'allergies', label: 'Allergies', render: (i) => i.allergies },
                { key: 'notes', label: 'Notes', render: (i) => i.notes },
              ]}
              data={[
                { student: 'K. Asante', condition: 'Asthma', allergies: 'None', notes: 'Inhaler in sick bay' },
                { student: 'A. Owusu', condition: 'None', allergies: 'Penicillin', notes: 'Use alternative antibiotics' },
                { student: 'D. Osei', condition: 'Sickle cell', allergies: 'None', notes: 'Monitor during exams' },
              ]}
            />
          </View>
        );
      case 'reports':
        return (
          <View>
            <Text style={styles.pageTitle}>Health Reports</Text>
            <Text style={styles.pageSubtitle}>Outbreak or trend monitoring for the Headmaster</Text>
            <CardGrid>
              <StatCard label="Top Complaint" value="Headache" subtitle="32 visits this term" accentColor={colors.warning} />
              <StatCard label="Malaria Cases" value="8" subtitle="This term" accentColor={colors.danger} />
            </CardGrid>
            {['Weekly Health Summary', 'Outbreak Alert Report', 'Termly Health Trends'].map((r) => (
              <TouchableOpacity key={r} style={styles.reportCard}>
                <Text style={styles.reportTitle}>{r}</Text>
                <Text style={styles.reportAction}>Generate (PDF)</Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      title="Health / Sick Bay"
      navItems={NAV_ITEMS}
      activeKey={activePage}
      onNavigate={setActivePage}
      headerRight={
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      }
    >
      {renderPage()}
      <RequisitionModal
        visible={showReqModal}
        onClose={() => setShowReqModal(false)}
        department="Health Centre"
        requestedBy={user?.displayName || 'Health Officer'}
      />
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
  pageSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  quickEntryCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  quickEntryTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.md },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, fontSize: fontSize.md, color: colors.text, marginBottom: spacing.sm },
  logBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm + 4, alignItems: 'center' },
  logBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  actionBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm + 4, alignItems: 'center', marginBottom: spacing.lg },
  actionBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  reportCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reportTitle: { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.text },
  reportAction: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.semibold },
  logoutBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  logoutText: { color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  reqCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  reqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  reqTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  reqMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  reqNotes: { fontSize: fontSize.xs, color: colors.textLight, fontStyle: 'italic', marginTop: spacing.xs },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  statusText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
});
