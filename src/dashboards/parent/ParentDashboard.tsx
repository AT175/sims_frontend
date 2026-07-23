import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, ScrollView, Alert } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid, DataTable } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useAuthStore } from '@store/authStore';
import { useRegistryStore } from '@store/registryStore';
import {
  usePTAStore, PAYMENT_METHODS, PAYMENT_CATEGORIES, PAYMENT_RECIPIENTS,
} from '@store/ptaStore';
import { useExeatStore, EXEAT_REASONS, TRANSPORT_MODES } from '@store/exeatStore';
import { useBoardingStore } from '@store/boardingStore';

const NAV_ITEMS: NavItem[] = [
  { key: 'wards', label: 'My Children' },
  { key: 'academic', label: 'Academic Reports' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'exeats', label: 'Exeats' },
  { key: 'discipline', label: 'Discipline & Welfare' },
  { key: 'health', label: 'Health Records' },
  { key: 'announcements', label: 'Announcements' },
  { key: 'meetings', label: 'Meetings & RSVP' },
  { key: 'payments', label: 'Payments' },
  { key: 'fundraising', label: 'Fundraising' },
  { key: 'feedback', label: 'Feedback' },
  { key: 'directory', label: 'Parent Directory' },
];

export function ParentDashboard() {
  const [activePage, setActivePage] = useState('wards');
  const { user, logout } = useAuthStore();
  const parentName = user?.displayName ?? 'Parent';

  return (
    <DashboardLayout
      title="Parent Portal"
      navItems={NAV_ITEMS}
      activeKey={activePage}
      onNavigate={setActivePage}
      headerRight={
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      }
    >
      {activePage === 'wards' && <WardsPage />}
      {activePage === 'academic' && <AcademicReportsPage />}
      {activePage === 'attendance' && <AttendancePage />}
      {activePage === 'exeats' && <ExeatsPage parentName={parentName} />}
      {activePage === 'discipline' && <DisciplineWelfarePage />}
      {activePage === 'health' && <HealthPage />}
      {activePage === 'announcements' && <AnnouncementsPage />}
      {activePage === 'meetings' && <MeetingsPage />}
      {activePage === 'payments' && <PaymentsPage parentName={parentName} />}
      {activePage === 'fundraising' && <FundraisingPage parentName={parentName} />}
      {activePage === 'feedback' && <FeedbackPage />}
      {activePage === 'directory' && <DirectoryPage />}
    </DashboardLayout>
  );
}

// ── Wards Page ──

function WardsPage() {
  const { wards } = usePTAStore();
  const { user } = useAuthStore();
  const registryStore = useRegistryStore();

  const parentAccount = registryStore.parentAccounts.find(
    (a) => a.parentName === user?.displayName || a.username === user?.username
  );

  return (
    <View>
      <CardGrid>
        <StatCard label="Children" value={wards.length + (parentAccount ? 1 : 0)} accentColor={colors.primary} />
        <StatCard label="Fees Cleared" value={wards.filter((w) => w.feesStatus === 'Cleared').length} accentColor={colors.success} />
        <StatCard label="Avg Attendance" value={wards.length > 0 ? `${(wards.reduce((s, w) => s + parseFloat(w.attendance), 0) / wards.length).toFixed(1)}%` : '0%'} accentColor={colors.info} />
      </CardGrid>

      <Text style={styles.pageTitle}>My Children</Text>
      <Text style={styles.pageSubtitle}>View your children's academic records</Text>

      {parentAccount && (
        <View style={[styles.wardCard, { borderLeftWidth: 4, borderLeftColor: colors.success }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.wardName}>{parentAccount.wardName}</Text>
            <Text style={[styles.wardStatValue, { color: colors.success, fontSize: fontSize.xs }]}>Newly Admitted</Text>
          </View>
          <Text style={styles.wardDetail}>Adm No: {parentAccount.wardAdmNo} | {parentAccount.wardClass} | {parentAccount.wardHouse} House</Text>
          <Text style={styles.wardDetail}>Programme: {parentAccount.wardProgramme}</Text>
          <View style={styles.wardStats}>
            <View style={styles.wardStat}>
              <Text style={styles.wardStatLabel}>Admission</Text>
              <Text style={styles.wardStatValue}>Approved</Text>
            </View>
            <View style={styles.wardStat}>
              <Text style={styles.wardStatLabel}>Status</Text>
              <Text style={[styles.wardStatValue, { color: colors.success }]}>Active</Text>
            </View>
          </View>
          {(() => {
            const prospectusList = registryStore.getProspectusForParent(parentAccount.username);
            if (prospectusList.length > 0) {
              return (
                <TouchableOpacity
                  style={styles.viewReportBtn}
                  onPress={() => {
                    const p = prospectusList[0];
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`<html><head><meta charset='utf-8'><style>body{font-family:Arial,sans-serif;margin:40px;color:#1A1A2E;}h1{color:#0F4C75;border-bottom:2px solid #0F4C75;padding-bottom:8px;}pre{white-space:pre-wrap;font-size:14px;line-height:1.6;}</style></head><body><h1>${p.title}</h1><p style='color:#5C6370;font-size:12px;'>Academic Year: ${p.academicYear} | Published: ${p.datePublished}</p><pre>${p.content}</pre></body></html>`);
                      printWindow.document.close();
                      printWindow.focus();
                      setTimeout(() => printWindow.print(), 500);
                    }
                  }}
                >
                  <Text style={styles.viewReportText}>⬇ Download Prospectus</Text>
                </TouchableOpacity>
              );
            }
            return null;
          })()}
        </View>
      )}

      {wards.map((ward) => (
        <View key={ward.id} style={styles.wardCard}>
          <Text style={styles.wardName}>{ward.name}</Text>
          <Text style={styles.wardDetail}>{ward.className} | {ward.house} House</Text>
          <View style={styles.wardStats}>
            <View style={styles.wardStat}>
              <Text style={styles.wardStatLabel}>Attendance</Text>
              <Text style={styles.wardStatValue}>{ward.attendance}</Text>
            </View>
            <View style={styles.wardStat}>
              <Text style={styles.wardStatLabel}>Avg Score</Text>
              <Text style={styles.wardStatValue}>{ward.avgScore}</Text>
            </View>
            <View style={styles.wardStat}>
              <Text style={styles.wardStatLabel}>Fees</Text>
              <Text style={[styles.wardStatValue, { color: ward.feesStatus === 'Cleared' ? colors.success : colors.danger }]}>{ward.feesStatus}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.viewReportBtn}
            onPress={() => Alert.alert('Report Card', `Report card for ${ward.name} would open here.`)}
          >
            <Text style={styles.viewReportText}>View Report Card</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

// ── Academic Reports Page ──

function AcademicReportsPage() {
  const { wards, reportCards } = usePTAStore();
  const [selectedWard, setSelectedWard] = useState<string | null>(null);

  const wardNames = wards.map((w) => w.name);
  const wardReportCards = selectedWard
    ? reportCards.filter((rc) => rc.wardName === selectedWard)
    : reportCards.filter((rc) => wardNames.includes(rc.wardName));

  return (
    <View>
      <CardGrid>
        <StatCard label="Report Cards" value={wardReportCards.length} accentColor={colors.primary} />
        <StatCard label="Terms Published" value={new Set(wardReportCards.map((r) => `${r.term} ${r.academicYear}`)).size} accentColor={colors.info} />
      </CardGrid>

      <Text style={styles.pageTitle}>Academic Reports</Text>
      <Text style={styles.pageSubtitle}>View your children's report cards and grades</Text>

      <View style={styles.selectRow}>
        <TouchableOpacity style={[styles.selectChip, !selectedWard && styles.selectChipActive]} onPress={() => setSelectedWard(null)}>
          <Text style={[styles.selectChipText, !selectedWard && styles.selectChipTextActive]}>All Children</Text>
        </TouchableOpacity>
        {wardNames.map((name) => (
          <TouchableOpacity key={name} style={[styles.selectChip, selectedWard === name && styles.selectChipActive]} onPress={() => setSelectedWard(name)}>
            <Text style={[styles.selectChipText, selectedWard === name && styles.selectChipTextActive]}>{name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {wardReportCards.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No report cards published yet.</Text>
        </View>
      )}

      {wardReportCards.map((rc) => (
        <View key={rc.id} style={styles.reportCard}>
          <View style={styles.reportCardHeader}>
            <View>
              <Text style={styles.reportCardWard}>{rc.wardName}</Text>
              <Text style={styles.reportCardTerm}>{rc.term} — {rc.academicYear}</Text>
            </View>
            <View style={styles.reportCardGradeBadge}>
              <Text style={styles.reportCardGradeText}>{rc.overallGrade ?? '-'}</Text>
            </View>
          </View>

          <View style={styles.reportCardMeta}>
            <View style={styles.reportCardMetaItem}>
              <Text style={styles.reportCardMetaLabel}>Class Teacher</Text>
              <Text style={styles.reportCardMetaValue}>{rc.classTeacher}</Text>
            </View>
            <View style={styles.reportCardMetaItem}>
              <Text style={styles.reportCardMetaLabel}>Attendance</Text>
              <Text style={styles.reportCardMetaValue}>{rc.attendancePct}</Text>
            </View>
            <View style={styles.reportCardMetaItem}>
              <Text style={styles.reportCardMetaLabel}>Position</Text>
              <Text style={styles.reportCardMetaValue}>{rc.overallPosition ?? '-'}</Text>
            </View>
          </View>

          <DataTable
            columns={[
              { key: 'subject', label: 'Subject', render: (i: any) => i.subject },
              { key: 'ca', label: 'CA (30)', render: (i: any) => String(i.caScore) },
              { key: 'exam', label: 'Exam (70)', render: (i: any) => String(i.examScore) },
              { key: 'total', label: 'Total', render: (i: any) => String(i.total) },
              { key: 'grade', label: 'Grade', render: (i: any) => i.grade },
              { key: 'position', label: 'Pos.', render: (i: any) => i.position ?? '-' },
              { key: 'remark', label: 'Remark', render: (i: any) => i.remark ?? '-' },
            ]}
            data={rc.subjects}
          />

          {rc.teacherRemark && (
            <View style={styles.remarkBox}>
              <Text style={styles.remarkLabel}>Teacher's Remark:</Text>
              <Text style={styles.remarkText}>{rc.teacherRemark}</Text>
            </View>
          )}
          {rc.headmasterRemark && (
            <View style={styles.remarkBox}>
              <Text style={styles.remarkLabel}>Headmaster's Remark:</Text>
              <Text style={styles.remarkText}>{rc.headmasterRemark}</Text>
            </View>
          )}
          <Text style={styles.reportCardDate}>Published: {rc.publishedDate}</Text>
        </View>
      ))}
    </View>
  );
}

// ── Attendance Page ──

function AttendancePage() {
  const { wards } = usePTAStore();
  const { rollCalls } = useBoardingStore();
  const [selectedWard, setSelectedWard] = useState<string | null>(null);

  const wardNames = wards.map((w) => w.name);
  const wardRollCalls = (selectedWard
    ? rollCalls.filter((rc) => rc.studentName === selectedWard)
    : rollCalls.filter((rc) => wardNames.includes(rc.studentName))
  ).sort((a, b) => b.date.localeCompare(a.date));

  const presentCount = wardRollCalls.filter((r) => r.status === 'Present').length;
  const absentCount = wardRollCalls.filter((r) => r.status === 'Absent').length;
  const lateCount = wardRollCalls.filter((r) => r.status === 'Late').length;

  return (
    <View>
      <CardGrid>
        <StatCard label="Records" value={wardRollCalls.length} accentColor={colors.primary} />
        <StatCard label="Present" value={presentCount} accentColor={colors.success} />
        <StatCard label="Absent" value={absentCount} accentColor={colors.danger} />
        <StatCard label="Late" value={lateCount} accentColor={colors.warning} />
      </CardGrid>

      <Text style={styles.pageTitle}>Attendance</Text>
      <Text style={styles.pageSubtitle}>Daily roll call records for your children</Text>

      <View style={styles.selectRow}>
        <TouchableOpacity style={[styles.selectChip, !selectedWard && styles.selectChipActive]} onPress={() => setSelectedWard(null)}>
          <Text style={[styles.selectChipText, !selectedWard && styles.selectChipTextActive]}>All Children</Text>
        </TouchableOpacity>
        {wardNames.map((name) => (
          <TouchableOpacity key={name} style={[styles.selectChip, selectedWard === name && styles.selectChipActive]} onPress={() => setSelectedWard(name)}>
            <Text style={[styles.selectChipText, selectedWard === name && styles.selectChipTextActive]}>{name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {wardRollCalls.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No attendance records found for your children.</Text>
        </View>
      ) : (
        <DataTable
          columns={[
            { key: 'date', label: 'Date', render: (i: any) => i.date },
            { key: 'student', label: 'Student', render: (i: any) => i.studentName },
            { key: 'house', label: 'House', render: (i: any) => i.house },
            { key: 'room', label: 'Room', render: (i: any) => i.room },
            { key: 'status', label: 'Status', render: (i: any) => i.status },
            { key: 'notes', label: 'Notes', render: (i: any) => i.notes ?? '-' },
          ]}
          data={wardRollCalls}
        />
      )}
    </View>
  );
}

// ── Exeats Page ──

function ExeatsPage({ parentName }: { parentName: string }) {
  const { wards } = usePTAStore();
  const { exeats, createExeat } = useExeatStore();
  const [showRequest, setShowRequest] = useState(false);
  const [form, setForm] = useState({
    studentName: '', admissionNo: '', house: '', class: '',
    reason: EXEAT_REASONS[0] as string, reasonDetail: '', destination: '',
    departureDate: '', returnDate: '', guardianName: '', guardianPhone: '',
    transportMode: TRANSPORT_MODES[0], issuedBy: '',
  });

  const wardNames = wards.map((w) => w.name);
  const wardExeats = exeats.filter((e) => wardNames.includes(e.studentName));

  const handleRequest = () => {
    if (!form.studentName || !form.reasonDetail.trim() || !form.destination.trim() || !form.departureDate.trim() || !form.returnDate.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    createExeat({
      studentName: form.studentName,
      admissionNo: form.admissionNo,
      house: form.house,
      class: form.class,
      reason: form.reason as any,
      reasonDetail: form.reasonDetail.trim(),
      destination: form.destination.trim(),
      departureDate: form.departureDate.trim(),
      returnDate: form.returnDate.trim(),
      guardianName: form.guardianName || parentName,
      guardianPhone: form.guardianPhone,
      transportMode: form.transportMode,
      issuedBy: parentName,
    });
    setForm({
      studentName: '', admissionNo: '', house: '', class: '',
      reason: EXEAT_REASONS[0] as string, reasonDetail: '', destination: '',
      departureDate: '', returnDate: '', guardianName: '', guardianPhone: '',
      transportMode: TRANSPORT_MODES[0], issuedBy: '',
    });
    setShowRequest(false);
    Alert.alert('Success', 'Exeat request submitted. Pending approval from Senior Housemaster.');
  };

  const selectWard = (wardName: string) => {
    const ward = wards.find((w) => w.name === wardName);
    if (ward) {
      setForm({
        ...form,
        studentName: ward.name,
        house: ward.house,
        class: ward.className,
        admissionNo: '',
      });
    }
  };

  return (
    <View>
      <CardGrid>
        <StatCard label="Total Exeats" value={wardExeats.length} accentColor={colors.primary} />
        <StatCard label="Pending" value={wardExeats.filter((e) => e.status === 'Pending').length} accentColor={colors.warning} />
        <StatCard label="Approved" value={wardExeats.filter((e) => e.status === 'Approved' || e.status === 'Checked Out').length} accentColor={colors.success} />
      </CardGrid>

      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Exeats</Text>
          <Text style={styles.pageSubtitle}>Request and track exeat permits for your children</Text>
        </View>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowRequest(true)}>
          <Text style={styles.actionBtnText}>+ Request Exeat</Text>
        </TouchableOpacity>
      </View>

      {wardExeats.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No exeat records for your children.</Text>
        </View>
      ) : (
        wardExeats.map((exeat) => (
          <View key={exeat.id} style={styles.exeatCard}>
            <View style={styles.exeatHeader}>
              <View>
                <Text style={styles.exeatNo}>{exeat.exeatNo}</Text>
                <Text style={styles.exeatStudent}>{exeat.studentName}</Text>
              </View>
              <Text style={[styles.exeatBadge,
                exeat.status === 'Approved' && styles.exeatBadgeApproved,
                exeat.status === 'Pending' && styles.exeatBadgePending,
                exeat.status === 'Rejected' && styles.exeatBadgeRejected,
                exeat.status === 'Checked Out' && styles.exeatBadgeCheckedOut,
                exeat.status === 'Checked In' && styles.exeatBadgeCheckedIn,
                exeat.status === 'Expired' && styles.exeatBadgeExpired,
              ]}>{exeat.status}</Text>
            </View>
            <Text style={styles.exeatReason}>{exeat.reason}: {exeat.reasonDetail}</Text>
            <Text style={styles.exeatDetail}>Destination: {exeat.destination}</Text>
            <Text style={styles.exeatDetail}>Departure: {exeat.departureDate} | Return: {exeat.returnDate}</Text>
            <Text style={styles.exeatDetail}>Transport: {exeat.transportMode}</Text>
            {exeat.approvedBy && <Text style={styles.exeatDetail}>Approved by: {exeat.approvedBy} on {exeat.approvedDate}</Text>}
            {exeat.checkedOutAt && <Text style={styles.exeatDetail}>Checked out: {exeat.checkedOutBy} at {exeat.checkedOutAt.slice(0, 10)}</Text>}
            {exeat.checkedInAt && <Text style={styles.exeatDetail}>Checked in: {exeat.checkedInBy} at {exeat.checkedInAt.slice(0, 10)}</Text>}
          </View>
        ))
      )}

      <Modal visible={showRequest} animationType="slide" transparent onRequestClose={() => setShowRequest(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Request Exeat</Text>
              <Text style={styles.modalSubtitle}>Submit a new exeat request for your child</Text>

              <Text style={styles.inputLabel}>Select Child</Text>
              <View style={styles.selectRow}>
                {wards.map((w) => (
                  <TouchableOpacity key={w.id} style={[styles.selectChip, form.studentName === w.name && styles.selectChipActive]} onPress={() => selectWard(w.name)}>
                    <Text style={[styles.selectChipText, form.studentName === w.name && styles.selectChipTextActive]}>{w.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Reason</Text>
              <View style={styles.selectRow}>
                {EXEAT_REASONS.map((r) => (
                  <TouchableOpacity key={r} style={[styles.selectChip, form.reason === r && styles.selectChipActive]} onPress={() => setForm({ ...form, reason: r })}>
                    <Text style={[styles.selectChipText, form.reason === r && styles.selectChipTextActive]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Reason Details</Text>
              <TextInput style={[styles.input, styles.textArea]} value={form.reasonDetail} onChangeText={(v) => setForm({ ...form, reasonDetail: v })} placeholder="Explain the reason..." placeholderTextColor={colors.textLight} multiline numberOfLines={2} />

              <Text style={styles.inputLabel}>Destination</Text>
              <TextInput style={styles.input} value={form.destination} onChangeText={(v) => setForm({ ...form, destination: v })} placeholder="e.g. Korle-Bu Teaching Hospital" placeholderTextColor={colors.textLight} />

              <Text style={styles.inputLabel}>Departure Date</Text>
              <TextInput style={styles.input} value={form.departureDate} onChangeText={(v) => setForm({ ...form, departureDate: v })} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} />

              <Text style={styles.inputLabel}>Return Date</Text>
              <TextInput style={styles.input} value={form.returnDate} onChangeText={(v) => setForm({ ...form, returnDate: v })} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} />

              <Text style={styles.inputLabel}>Guardian Phone</Text>
              <TextInput style={styles.input} value={form.guardianPhone} onChangeText={(v) => setForm({ ...form, guardianPhone: v })} placeholder="e.g. 024-XXX-XXXX" placeholderTextColor={colors.textLight} />

              <Text style={styles.inputLabel}>Transport Mode</Text>
              <View style={styles.selectRow}>
                {TRANSPORT_MODES.map((m) => (
                  <TouchableOpacity key={m} style={[styles.selectChip, form.transportMode === m && styles.selectChipActive]} onPress={() => setForm({ ...form, transportMode: m })}>
                    <Text style={[styles.selectChipText, form.transportMode === m && styles.selectChipTextActive]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.requesterInfo}>Requested by: {parentName}</Text>

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowRequest(false)}>
                  <Text style={styles.modalBtnTextDark}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleRequest}>
                  <Text style={styles.modalBtnTextLight}>Submit Request</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

// ── Discipline & Welfare Page ──

function DisciplineWelfarePage() {
  const { wards } = usePTAStore();
  const { discipline, welfare } = useBoardingStore();
  const [subPage, setSubPage] = useState<'discipline' | 'welfare'>('discipline');

  const wardNames = wards.map((w) => w.name);
  const wardDiscipline = discipline.filter((d) => wardNames.includes(d.studentName));
  const wardWelfare = welfare.filter((w) => wardNames.includes(w.studentName));

  return (
    <View>
      <CardGrid>
        <StatCard label="Discipline" value={wardDiscipline.length} accentColor={colors.danger} />
        <StatCard label="Escalated" value={wardDiscipline.filter((d) => d.escalated).length} accentColor={colors.danger} />
        <StatCard label="Welfare Notes" value={wardWelfare.length} accentColor={colors.warning} />
        <StatCard label="Unresolved" value={wardWelfare.filter((w) => !w.resolved).length} accentColor={colors.warning} />
      </CardGrid>

      <View style={styles.subTabRow}>
        <TouchableOpacity style={[styles.subTab, subPage === 'discipline' && styles.subTabActive]} onPress={() => setSubPage('discipline')}>
          <Text style={[styles.subTabText, subPage === 'discipline' && styles.subTabTextActive]}>Discipline</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.subTab, subPage === 'welfare' && styles.subTabActive]} onPress={() => setSubPage('welfare')}>
          <Text style={[styles.subTabText, subPage === 'welfare' && styles.subTabTextActive]}>Welfare</Text>
        </TouchableOpacity>
      </View>

      {subPage === 'discipline' && (
        <View>
          <Text style={styles.pageTitle}>Discipline Records</Text>
          <Text style={styles.pageSubtitle}>Incidents involving your children</Text>

          {wardDiscipline.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No discipline records. Great!</Text>
            </View>
          ) : (
            wardDiscipline.map((d) => (
              <View key={d.id} style={styles.disciplineCard}>
                <View style={styles.disciplineHeader}>
                  <Text style={styles.disciplineStudent}>{d.studentName}</Text>
                  <Text style={[styles.severityBadge,
                    d.severity === 'Minor' && styles.severityMinor,
                    d.severity === 'Moderate' && styles.severityModerate,
                    d.severity === 'Serious' && styles.severitySerious,
                    d.severity === 'Critical' && styles.severityCritical,
                  ]}>{d.severity}</Text>
                </View>
                <Text style={styles.disciplineDate}>{d.date} | {d.house} House</Text>
                <Text style={styles.disciplineIncident}>Incident: {d.incident}</Text>
                <Text style={styles.disciplineAction}>Action: {d.actionTaken}</Text>
                <Text style={styles.disciplineBy}>Recorded by: {d.recordedBy}</Text>
                {d.escalated && <Text style={styles.escalatedTag}>ESCALATED TO HEADMASTER</Text>}
              </View>
            ))
          )}
        </View>
      )}

      {subPage === 'welfare' && (
        <View>
          <Text style={styles.pageTitle}>Welfare Notes</Text>
          <Text style={styles.pageSubtitle}>Wellbeing observations by house staff</Text>

          {wardWelfare.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No welfare notes. Your children are doing well!</Text>
            </View>
          ) : (
            wardWelfare.map((w) => (
              <View key={w.id} style={styles.welfareCard}>
                <View style={styles.disciplineHeader}>
                  <Text style={styles.disciplineStudent}>{w.studentName}</Text>
                  <Text style={[styles.severityBadge, w.resolved ? styles.severityMinor : styles.severityModerate]}>
                    {w.resolved ? 'Resolved' : 'Active'}
                  </Text>
                </View>
                <Text style={styles.disciplineDate}>{w.date} | {w.house} House</Text>
                <Text style={styles.welfareNote}>{w.note}</Text>
                <Text style={styles.disciplineBy}>Recorded by: {w.recordedBy}</Text>
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
}

// ── Health Records Page ──

function HealthPage() {
  const { wards, healthVisits } = usePTAStore();
  const [selectedWard, setSelectedWard] = useState<string | null>(null);

  const wardNames = wards.map((w) => w.name);
  const wardVisits = (selectedWard
    ? healthVisits.filter((h) => h.wardName === selectedWard)
    : healthVisits.filter((h) => wardNames.includes(h.wardName))
  ).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <View>
      <CardGrid>
        <StatCard label="Visits" value={wardVisits.length} accentColor={colors.primary} />
        <StatCard label="Resolved" value={wardVisits.filter((v) => v.resolved).length} accentColor={colors.success} />
        <StatCard label="Follow-up" value={wardVisits.filter((v) => v.followUpRequired && !v.resolved).length} accentColor={colors.warning} />
        <StatCard label="Hospital Ref." value={wardVisits.filter((v) => v.referredToHospital).length} accentColor={colors.danger} />
      </CardGrid>

      <Text style={styles.pageTitle}>Health Records</Text>
      <Text style={styles.pageSubtitle}>Sick bay visits and medical records for your children</Text>

      <View style={styles.selectRow}>
        <TouchableOpacity style={[styles.selectChip, !selectedWard && styles.selectChipActive]} onPress={() => setSelectedWard(null)}>
          <Text style={[styles.selectChipText, !selectedWard && styles.selectChipTextActive]}>All Children</Text>
        </TouchableOpacity>
        {wardNames.map((name) => (
          <TouchableOpacity key={name} style={[styles.selectChip, selectedWard === name && styles.selectChipActive]} onPress={() => setSelectedWard(name)}>
            <Text style={[styles.selectChipText, selectedWard === name && styles.selectChipTextActive]}>{name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {wardVisits.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No health records. Your children are healthy!</Text>
        </View>
      ) : (
        wardVisits.map((v) => (
          <View key={v.id} style={styles.healthCard}>
            <View style={styles.healthHeader}>
              <View>
                <Text style={styles.healthWard}>{v.wardName}</Text>
                <Text style={styles.healthDate}>{v.date}</Text>
              </View>
              <View style={styles.healthBadges}>
                {v.referredToHospital && <Text style={[styles.healthBadge, styles.healthBadgeHospital]}>Hospital Ref.</Text>}
                {v.followUpRequired && !v.resolved && <Text style={[styles.healthBadge, styles.healthBadgeFollowUp]}>Follow-up</Text>}
                <Text style={[styles.healthBadge, v.resolved ? styles.healthBadgeResolved : styles.healthBadgeActive]}>
                  {v.resolved ? 'Resolved' : 'Active'}
                </Text>
              </View>
            </View>

            <View style={styles.healthGrid}>
              <View style={styles.healthGridItem}>
                <Text style={styles.healthGridLabel}>Complaint</Text>
                <Text style={styles.healthGridValue}>{v.complaint}</Text>
              </View>
              <View style={styles.healthGridItem}>
                <Text style={styles.healthGridLabel}>Diagnosis</Text>
                <Text style={styles.healthGridValue}>{v.diagnosis}</Text>
              </View>
              <View style={styles.healthGridItem}>
                <Text style={styles.healthGridLabel}>Treatment</Text>
                <Text style={styles.healthGridValue}>{v.treatment}</Text>
              </View>
              {v.medication && (
                <View style={styles.healthGridItem}>
                  <Text style={styles.healthGridLabel}>Medication</Text>
                  <Text style={styles.healthGridValue}>{v.medication}</Text>
                </View>
              )}
              {v.temperature && (
                <View style={styles.healthGridItem}>
                  <Text style={styles.healthGridLabel}>Temperature</Text>
                  <Text style={styles.healthGridValue}>{v.temperature}</Text>
                </View>
              )}
              {v.bloodPressure && (
                <View style={styles.healthGridItem}>
                  <Text style={styles.healthGridLabel}>Blood Pressure</Text>
                  <Text style={styles.healthGridValue}>{v.bloodPressure}</Text>
                </View>
              )}
            </View>

            <Text style={styles.healthAttendant}>Attendant: {v.attendant}</Text>
            {v.followUpDate && <Text style={styles.healthFollowUp}>Follow-up date: {v.followUpDate}</Text>}
          </View>
        ))
      )}
    </View>
  );
}

// ── Announcements Page (read-only for parents) ──

function AnnouncementsPage() {
  const { announcements } = usePTAStore();

  return (
    <View>
      <CardGrid>
        <StatCard label="Announcements" value={announcements.length} accentColor={colors.primary} />
        <StatCard label="Latest" value={announcements[0]?.date ?? '-'} accentColor={colors.info} />
      </CardGrid>

      <Text style={styles.pageTitle}>Announcements</Text>
      <Text style={styles.pageSubtitle}>School messages for parents</Text>

      {announcements.map((item) => (
        <View key={item.id} style={styles.announcementCard}>
          <Text style={styles.announcementTitle}>{item.title}</Text>
          <Text style={styles.announcementBody}>{item.body}</Text>
          <Text style={styles.announcementDate}>{item.date} | {item.author}</Text>
        </View>
      ))}
    </View>
  );
}

// ── Meetings Page (RSVP for parents) ──

function MeetingsPage() {
  const { meetings, setRSVP } = usePTAStore();

  return (
    <View>
      <CardGrid>
        <StatCard label="Upcoming" value={meetings.length} accentColor={colors.primary} />
        <StatCard label="Will Attend" value={meetings.filter((m) => m.rsvp === 'Will Attend').length} accentColor={colors.success} />
        <StatCard label="Not Responded" value={meetings.filter((m) => m.rsvp === 'Not Responded').length} accentColor={colors.warning} />
      </CardGrid>

      <Text style={styles.pageTitle}>Meetings & RSVP</Text>
      <Text style={styles.pageSubtitle}>Upcoming PTA meeting dates — please RSVP</Text>

      {meetings.map((item) => (
        <View key={item.id} style={styles.meetingCard}>
          <Text style={styles.meetingDate}>{item.date} at {item.time}</Text>
          <Text style={styles.meetingTopic}>{item.topic}</Text>
          <Text style={styles.meetingLocation}>Location: {item.location}</Text>
          <Text style={styles.rsvpStatus}>RSVP: {item.rsvp}</Text>
          <View style={styles.rsvpActions}>
            <TouchableOpacity
              style={[styles.rsvpYesBtn, item.rsvp === 'Will Attend' && styles.rsvpActive]}
              onPress={() => setRSVP(item.id, 'Will Attend')}
            >
              <Text style={styles.rsvpYesText}>Will Attend</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.rsvpNoBtn, item.rsvp === 'Cannot Attend' && styles.rsvpNoActive]}
              onPress={() => setRSVP(item.id, 'Cannot Attend')}
            >
              <Text style={styles.rsvpNoText}>Cannot Attend</Text>
            </TouchableOpacity>
            {item.rsvp !== 'Not Responded' && (
              <TouchableOpacity onPress={() => setRSVP(item.id, 'Not Responded')}>
                <Text style={styles.resetRsvpText}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

// ── Payments Page ──

function PaymentsPage({ parentName }: { parentName: string }) {
  const { payments, payPayment } = usePTAStore();
  const [activeCat, setActiveCat] = useState<string>('All');
  const [showPay, setShowPay] = useState<string | null>(null);
  const [form, setForm] = useState({ amount: '', method: PAYMENT_METHODS[0], recipient: 'School Accountant' as 'School Accountant' | 'PTA' });

  const handlePay = () => {
    if (!showPay) return;
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Invalid amount');
      return;
    }
    payPayment(showPay, amount, form.method, form.recipient);
    setForm({ amount: '', method: PAYMENT_METHODS[0], recipient: 'School Accountant' as 'School Accountant' | 'PTA' });
    setShowPay(null);
    Alert.alert('Success', 'Payment recorded');
  };

  const filtered = activeCat === 'All' ? payments : payments.filter((p) => p.category === activeCat);
  const totalOwing = filtered.filter((p) => p.status !== 'Paid').reduce((s, p) => s + (p.amount - p.amountPaid), 0);
  const totalPaid = filtered.reduce((s, p) => s + p.amountPaid, 0);

  const tabs = ['All', ...PAYMENT_CATEGORIES];

  return (
    <View>
      <CardGrid>
        <StatCard label="Total Paid" value={`GH₵${totalPaid.toLocaleString()}`} accentColor={colors.success} />
        <StatCard label="Outstanding" value={`GH₵${totalOwing.toLocaleString()}`} accentColor={colors.danger} />
        <StatCard label="Items" value={filtered.length} accentColor={colors.primary} />
      </CardGrid>

      <Text style={styles.pageTitle}>Payments</Text>
      <Text style={styles.pageSubtitle}>School fees, PTA dues, and special levies for your children</Text>

      <View style={styles.subTabRow}>
        {tabs.map((tab) => (
          <TouchableOpacity key={tab} style={[styles.subTab, activeCat === tab && styles.subTabActive]} onPress={() => setActiveCat(tab)}>
            <Text style={[styles.subTabText, activeCat === tab && styles.subTabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No payment items in this category.</Text>
        </View>
      ) : (
        filtered.map((item) => (
          <View key={item.id} style={styles.dueCard}>
            <View style={styles.dueHeader}>
              <View>
                <Text style={styles.dueTerm}>{item.description}</Text>
                <Text style={styles.paymentWardName}>{item.wardName} | {item.term}</Text>
              </View>
              <Text style={[styles.dueBadge, item.status === 'Paid' && styles.dueBadgePaid, item.status === 'Owing' && styles.dueBadgeOwing, item.status === 'Partial' && styles.dueBadgePartial]}>
                {item.status}
              </Text>
            </View>
            <Text style={styles.dueAmount}>Amount: GH₵{item.amount.toLocaleString()}</Text>
            <Text style={styles.duePaid}>Paid: GH₵{item.amountPaid.toLocaleString()}</Text>
            {item.status !== 'Paid' && (
              <Text style={styles.dueRemaining}>Remaining: GH₵{(item.amount - item.amountPaid).toLocaleString()}</Text>
            )}
            <Text style={styles.dueDueDate}>Due: {item.dueDate}</Text>
            {item.recipient && <Text style={styles.paymentRecipient}>Received by: {item.recipient}</Text>}
            {item.paidDate && <Text style={styles.duePaidDate}>Paid on: {item.paidDate} via {item.method}</Text>}

            {item.status !== 'Paid' && (
              <TouchableOpacity style={styles.payBtn} onPress={() => setShowPay(item.id)}>
                <Text style={styles.payBtnText}>Make Payment</Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      )}

      <Modal visible={showPay !== null} animationType="slide" transparent onRequestClose={() => setShowPay(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Make Payment</Text>
            <Text style={styles.modalSubtitle}>Record a payment for this item</Text>

            <Text style={styles.inputLabel}>Amount (GH₵)</Text>
            <TextInput style={styles.input} value={form.amount} onChangeText={(v) => setForm({ ...form, amount: v })} placeholder="e.g. 200" placeholderTextColor={colors.textLight} keyboardType="numeric" />

            <Text style={styles.inputLabel}>Payment Method</Text>
            <View style={styles.selectRow}>
              {PAYMENT_METHODS.map((m) => (
                <TouchableOpacity key={m} style={[styles.selectChip, form.method === m && styles.selectChipActive]} onPress={() => setForm({ ...form, method: m })}>
                  <Text style={[styles.selectChipText, form.method === m && styles.selectChipTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Received By</Text>
            <View style={styles.selectRow}>
              {PAYMENT_RECIPIENTS.map((r) => (
                <TouchableOpacity key={r} style={[styles.selectChip, form.recipient === r && styles.selectChipActive]} onPress={() => setForm({ ...form, recipient: r })}>
                  <Text style={[styles.selectChipText, form.recipient === r && styles.selectChipTextActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.requesterInfo}>Paid by: {parentName}</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowPay(null)}>
                <Text style={styles.modalBtnTextDark}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handlePay}>
                <Text style={styles.modalBtnTextLight}>Pay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── Fundraising Page (contribute only) ──

function FundraisingPage({ parentName }: { parentName: string }) {
  const { fundraising, contribute } = usePTAStore();
  const [showContribute, setShowContribute] = useState<string | null>(null);
  const [contribForm, setContribForm] = useState({ amount: '' });

  const handleContribute = () => {
    if (!showContribute) return;
    const amount = parseFloat(contribForm.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Invalid amount');
      return;
    }
    contribute(showContribute, parentName, amount);
    setContribForm({ amount: '' });
    setShowContribute(null);
    Alert.alert('Success', 'Contribution recorded. Thank you!');
  };

  return (
    <View>
      <CardGrid>
        <StatCard label="Projects" value={fundraising.length} accentColor={colors.primary} />
        <StatCard label="Total Raised" value={`GH₵${fundraising.reduce((s, p) => s + p.raisedAmount, 0).toLocaleString()}`} accentColor={colors.success} />
        <StatCard label="Total Target" value={`GH₵${fundraising.reduce((s, p) => s + p.targetAmount, 0).toLocaleString()}`} accentColor={colors.info} />
      </CardGrid>

      <Text style={styles.pageTitle}>Fundraising Projects</Text>
      <Text style={styles.pageSubtitle}>Support school improvement initiatives</Text>

      {fundraising.map((item) => {
        const pct = item.targetAmount > 0 ? Math.round((item.raisedAmount / item.targetAmount) * 100) : 0;
        return (
          <View key={item.id} style={styles.fundraisingCard}>
            <Text style={styles.fundraisingTitle}>{item.project}</Text>
            {item.description ? <Text style={styles.fundraisingDesc}>{item.description}</Text> : null}
            <Text style={styles.fundraisingAmount}>Raised: GH₵{item.raisedAmount.toLocaleString()} / GH₵{item.targetAmount.toLocaleString()}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(pct, 100)}%` }]} />
            </View>
            <Text style={styles.fundraisingPct}>{pct}% funded</Text>
            <TouchableOpacity style={styles.contributeBtn} onPress={() => setShowContribute(item.id)}>
              <Text style={styles.contributeBtnText}>Contribute</Text>
            </TouchableOpacity>
            {item.contributions.length > 0 && (
              <View style={styles.contribList}>
                <Text style={styles.contribTitle}>Recent Contributions</Text>
                {item.contributions.slice(0, 3).map((c) => (
                  <Text key={c.id} style={styles.contribItem}>{c.contributorName}: GH₵{c.amount.toLocaleString()} ({c.date})</Text>
                ))}
              </View>
            )}
          </View>
        );
      })}

      <Modal visible={showContribute !== null} animationType="slide" transparent onRequestClose={() => setShowContribute(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Contribute</Text>
            <Text style={styles.modalSubtitle}>Support this fundraising project</Text>

            <Text style={styles.inputLabel}>Amount (GH₵)</Text>
            <TextInput style={styles.input} value={contribForm.amount} onChangeText={(v) => setContribForm({ amount: v })} placeholder="e.g. 500" placeholderTextColor={colors.textLight} keyboardType="numeric" />

            <Text style={styles.requesterInfo}>Contributor: {parentName}</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowContribute(null)}>
                <Text style={styles.modalBtnTextDark}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleContribute}>
                <Text style={styles.modalBtnTextLight}>Contribute</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── Feedback Page ──

function FeedbackPage() {
  const { feedback, submitFeedback } = usePTAStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ subject: '', body: '' });

  const handleSubmit = () => {
    if (!form.subject.trim() || !form.body.trim()) {
      Alert.alert('Error', 'Subject and details are required');
      return;
    }
    submitFeedback(form.subject.trim(), form.body.trim());
    setForm({ subject: '', body: '' });
    setShowAdd(false);
    Alert.alert('Success', 'Feedback submitted to Headmaster');
  };

  return (
    <View>
      <CardGrid>
        <StatCard label="Submissions" value={feedback.length} accentColor={colors.primary} />
        <StatCard label="Acknowledged" value={feedback.filter((f) => f.status === 'Acknowledged' || f.status === 'Actioned').length} accentColor={colors.success} />
        <StatCard label="Pending" value={feedback.filter((f) => f.status === 'Received').length} accentColor={colors.warning} />
      </CardGrid>

      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Feedback / Suggestions</Text>
          <Text style={styles.pageSubtitle}>Your input routed to the Headmaster</Text>
        </View>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowAdd(true)}>
          <Text style={styles.actionBtnText}>+ Submit Feedback</Text>
        </TouchableOpacity>
      </View>

      {feedback.map((item) => (
        <View key={item.id} style={styles.feedbackCard}>
          <Text style={styles.feedbackSubject}>{item.subject}</Text>
          <Text style={styles.feedbackBody}>{item.body}</Text>
          <Text style={styles.feedbackMeta}>{item.date} | {item.status}</Text>
          {item.response && (
            <View style={styles.feedbackResponse}>
              <Text style={styles.feedbackResponseLabel}>Response:</Text>
              <Text style={styles.feedbackResponseText}>{item.response}</Text>
            </View>
          )}
        </View>
      ))}

      <Modal visible={showAdd} animationType="slide" transparent onRequestClose={() => setShowAdd(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Submit Feedback</Text>

              <Text style={styles.inputLabel}>Subject</Text>
              <TextInput style={styles.input} value={form.subject} onChangeText={(v) => setForm({ ...form, subject: v })} placeholder="Brief subject" placeholderTextColor={colors.textLight} />

              <Text style={styles.inputLabel}>Details</Text>
              <TextInput style={[styles.input, styles.textArea]} value={form.body} onChangeText={(v) => setForm({ ...form, body: v })} placeholder="Your feedback or suggestion..." placeholderTextColor={colors.textLight} multiline numberOfLines={4} />

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowAdd(false)}>
                  <Text style={styles.modalBtnTextDark}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleSubmit}>
                  <Text style={styles.modalBtnTextLight}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

// ── Directory Page (read-only for parents) ──

function DirectoryPage() {
  const { directory } = usePTAStore();

  return (
    <View>
      <CardGrid>
        <StatCard label="Parents" value={directory.length} accentColor={colors.primary} />
        <StatCard label="Executives" value={directory.filter((d) => d.ptaRole !== 'Member').length} accentColor={colors.info} />
      </CardGrid>

      <Text style={styles.pageTitle}>Parent Directory</Text>
      <Text style={styles.pageSubtitle}>Contact list — no student academic data visible</Text>

      <DataTable
        columns={[
          { key: 'name', label: 'Parent Name', render: (i: any) => i.name },
          { key: 'phone', label: 'Phone', render: (i: any) => i.phone },
          { key: 'ptaRole', label: 'PTA Role', render: (i: any) => i.ptaRole },
          { key: 'wardNames', label: 'Wards', render: (i: any) => i.wardNames },
        ]}
        data={directory}
      />
    </View>
  );
}

// ── Styles ──

const styles = StyleSheet.create({
  pageTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xs },
  pageSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg },
  actionBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.lg, alignItems: 'center' },
  actionBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  logoutBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  logoutText: { color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  wardCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  wardName: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text },
  wardDetail: { fontSize: fontSize.md, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.md },
  wardStats: { flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.md },
  wardStat: { flex: 1 },
  wardStatLabel: { fontSize: fontSize.xs, color: colors.textLight },
  wardStatValue: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, marginTop: spacing.xs },
  viewReportBtn: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingVertical: spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: colors.primary },
  viewReportText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  announcementCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  announcementTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  announcementBody: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  announcementDate: { fontSize: fontSize.xs, color: colors.textLight, marginTop: spacing.sm },
  meetingCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  meetingDate: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.primary },
  meetingTopic: { fontSize: fontSize.sm, color: colors.text, marginTop: spacing.xs, marginBottom: spacing.xs },
  meetingLocation: { fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: spacing.xs },
  rsvpStatus: { fontSize: fontSize.xs, color: colors.textLight, fontWeight: fontWeight.medium, marginBottom: spacing.sm },
  rsvpActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rsvpYesBtn: { backgroundColor: colors.success, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  rsvpActive: { borderWidth: 2, borderColor: colors.primary },
  rsvpYesText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  rsvpNoBtn: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border },
  rsvpNoActive: { borderColor: colors.danger, borderWidth: 2 },
  rsvpNoText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  resetRsvpText: { fontSize: fontSize.xs, color: colors.textLight, fontWeight: fontWeight.medium },
  dueCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  dueHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  dueTerm: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  paymentWardName: { fontSize: fontSize.xs, color: colors.textLight, marginTop: 2 },
  dueBadge: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  dueBadgePaid: { backgroundColor: colors.success + '20', color: colors.success },
  dueBadgeOwing: { backgroundColor: colors.danger + '20', color: colors.danger },
  dueBadgePartial: { backgroundColor: colors.warning + '20', color: colors.warning },
  dueAmount: { fontSize: fontSize.sm, color: colors.text, marginBottom: 2 },
  duePaid: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: 2 },
  dueRemaining: { fontSize: fontSize.sm, color: colors.danger, fontWeight: fontWeight.medium, marginBottom: 2 },
  dueDueDate: { fontSize: fontSize.xs, color: colors.textLight, marginBottom: 2 },
  paymentRecipient: { fontSize: fontSize.xs, color: colors.info, fontWeight: fontWeight.medium, marginBottom: 2 },
  duePaidDate: { fontSize: fontSize.xs, color: colors.success, marginBottom: spacing.sm },
  payBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.sm },
  payBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  fundraisingCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  fundraisingTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.xs },
  fundraisingDesc: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs },
  fundraisingAmount: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm },
  progressBar: { height: 8, backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, marginBottom: spacing.xs },
  progressFill: { height: 8, backgroundColor: colors.success, borderRadius: radius.sm },
  fundraisingPct: { fontSize: fontSize.xs, color: colors.success, fontWeight: fontWeight.semibold, marginBottom: spacing.sm },
  contributeBtn: { backgroundColor: colors.success, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, alignItems: 'center', alignSelf: 'flex-start' },
  contributeBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  contribList: { marginTop: spacing.md, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  contribTitle: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.textSecondary, marginBottom: spacing.xs },
  contribItem: { fontSize: fontSize.xs, color: colors.textLight, marginBottom: 2 },
  feedbackCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  feedbackSubject: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  feedbackBody: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  feedbackMeta: { fontSize: fontSize.xs, color: colors.textLight, marginTop: spacing.sm },
  feedbackResponse: { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  feedbackResponseLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.primary, marginBottom: 2 },
  feedbackResponseText: { fontSize: fontSize.sm, color: colors.textSecondary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  modalScroll: { width: '100%', maxHeight: '90%' },
  modalScrollContent: { alignItems: 'center' },
  modalContent: { backgroundColor: colors.surface, borderRadius: radius.xl, width: '100%', maxWidth: 480, padding: spacing.xl },
  modalTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xs },
  modalSubtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.lg },
  inputLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textSecondary, marginBottom: spacing.xs, marginTop: spacing.sm },
  input: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md, color: colors.text, marginBottom: spacing.sm, backgroundColor: colors.surfaceAlt },
  textArea: { minHeight: 80 },
  selectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  selectChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.sm, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surfaceAlt },
  selectChipActive: { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
  selectChipText: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: fontWeight.medium },
  selectChipTextActive: { color: colors.primary, fontWeight: fontWeight.bold },
  requesterInfo: { fontSize: fontSize.xs, color: colors.textLight, marginTop: spacing.sm, marginBottom: spacing.sm },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  modalBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: colors.surfaceAlt },
  modalBtnSubmit: { backgroundColor: colors.primary },
  modalBtnTextDark: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  modalBtnTextLight: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.white },
  // ── Academic Report styles ──
  reportCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  reportCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  reportCardWard: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text },
  reportCardTerm: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  reportCardGradeBadge: { backgroundColor: colors.primary + '20', borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  reportCardGradeText: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.primary },
  reportCardMeta: { flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.md, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  reportCardMetaItem: { flex: 1 },
  reportCardMetaLabel: { fontSize: fontSize.xs, color: colors.textLight },
  reportCardMetaValue: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text, marginTop: 2 },
  remarkBox: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.sm },
  remarkLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.textSecondary, marginBottom: 2 },
  remarkText: { fontSize: fontSize.sm, color: colors.text },
  reportCardDate: { fontSize: fontSize.xs, color: colors.textLight, marginTop: spacing.sm, textAlign: 'right' },
  // ── Exeat styles ──
  exeatCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  exeatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  exeatNo: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.primary },
  exeatStudent: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text, marginTop: 2 },
  exeatBadge: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt, color: colors.textSecondary },
  exeatBadgeApproved: { backgroundColor: colors.success + '20', color: colors.success },
  exeatBadgePending: { backgroundColor: colors.warning + '20', color: colors.warning },
  exeatBadgeRejected: { backgroundColor: colors.danger + '20', color: colors.danger },
  exeatBadgeCheckedOut: { backgroundColor: colors.info + '20', color: colors.info },
  exeatBadgeCheckedIn: { backgroundColor: colors.success + '20', color: colors.success },
  exeatBadgeExpired: { backgroundColor: colors.textLight + '20', color: colors.textLight },
  exeatReason: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.text, marginBottom: spacing.xs },
  exeatDetail: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: 2 },
  // ── Discipline & Welfare styles ──
  subTabRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  subTab: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surfaceAlt },
  subTabActive: { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
  subTabText: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: fontWeight.medium },
  subTabTextActive: { color: colors.primary, fontWeight: fontWeight.bold },
  disciplineCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  disciplineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  disciplineStudent: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  disciplineDate: { fontSize: fontSize.xs, color: colors.textLight, marginBottom: spacing.xs },
  disciplineIncident: { fontSize: fontSize.sm, color: colors.text, marginBottom: 2 },
  disciplineAction: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: 2 },
  disciplineBy: { fontSize: fontSize.xs, color: colors.textLight },
  severityBadge: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.sm },
  severityMinor: { backgroundColor: colors.success + '20', color: colors.success },
  severityModerate: { backgroundColor: colors.warning + '20', color: colors.warning },
  severitySerious: { backgroundColor: colors.danger + '20', color: colors.danger },
  severityCritical: { backgroundColor: colors.danger + '30', color: colors.danger },
  escalatedTag: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.danger, marginTop: spacing.xs, letterSpacing: 0.5 },
  welfareCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  welfareNote: { fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs, fontStyle: 'italic' },
  // ── Health styles ──
  healthCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  healthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  healthWard: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text },
  healthDate: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  healthBadges: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap', justifyContent: 'flex-end' },
  healthBadge: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  healthBadgeResolved: { backgroundColor: colors.success + '20', color: colors.success },
  healthBadgeActive: { backgroundColor: colors.warning + '20', color: colors.warning },
  healthBadgeFollowUp: { backgroundColor: colors.warning + '30', color: colors.warning },
  healthBadgeHospital: { backgroundColor: colors.danger + '20', color: colors.danger },
  healthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.sm },
  healthGridItem: { flex: 1, minWidth: '45%', backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: spacing.sm },
  healthGridLabel: { fontSize: fontSize.xs, color: colors.textLight, marginBottom: 2 },
  healthGridValue: { fontSize: fontSize.sm, color: colors.text, fontWeight: fontWeight.medium },
  healthAttendant: { fontSize: fontSize.xs, color: colors.textLight, marginTop: spacing.xs },
  healthFollowUp: { fontSize: fontSize.xs, color: colors.warning, fontWeight: fontWeight.medium },
  // ── Empty state ──
  emptyState: { backgroundColor: colors.surfaceAlt, borderRadius: radius.lg, padding: spacing.xl, alignItems: 'center', marginTop: spacing.md },
  emptyStateText: { fontSize: fontSize.md, color: colors.textLight, textAlign: 'center' },
});
