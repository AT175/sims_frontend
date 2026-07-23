import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid, DataTable } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useAuthStore, useRegistryStore } from '@store/index';
import {
  CERTIFICATE_TYPES, CORRESPONDENCE_DIRECTIONS, CORRESPONDENCE_PRIORITIES,
  STAFF_STATUSES, DOCUMENT_CHECKLIST, CLASS_SECTIONS, HOUSES,
} from '@store/index';

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'students', label: 'Student Records' },
  { key: 'admissions', label: 'Admissions' },
  { key: 'certificates', label: 'Certificates & Documents' },
  { key: 'correspondence', label: 'Correspondence Log' },
  { key: 'staff', label: 'Staff Records' },
  { key: 'reports', label: 'Reports' },
];

export function RegistryDashboard() {
  const [activePage, setActivePage] = useState('overview');
  const { user, logout } = useAuthStore();
  const userName = user?.displayName ?? 'Registry';

  const store = useRegistryStore();
  const { students, placements, admissions, certificates, correspondence, staff } = store;

  const activeStudents = students.filter((s) => s.status === 'Active');
  const pendingAdmissions = admissions.filter((a) => a.status === 'Received' || a.status === 'Under Review');
  const approvedAdmissions = admissions.filter((a) => a.status === 'Approved');
  const unmatchedPlacements = placements.filter((p) => !p.matched);
  const urgentCorrespondence = correspondence.filter((c) => c.priority === 'Urgent');
  const activeStaff = staff.filter((s) => s.status === 'Active');

  const renderBadge = (text: string, color: string) => (
    <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
      <Text style={[styles.statusText, { color }]}>{text}</Text>
    </View>
  );

  const generatePDF = (reportType: string) => {
    const now = new Date().toLocaleString();
    const dateStr = new Date().toISOString().slice(0, 10);
    let body = '';
    let title = '';

    if (reportType === 'full' || reportType === 'overview') {
      title = 'Registry Operations Overview';
      body += `<h2>Summary</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px">
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Total Students</td><td style="padding:8px 12px;border:1px solid #ddd">${students.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Active Students</td><td style="padding:8px 12px;border:1px solid #ddd">${activeStudents.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Graduated</td><td style="padding:8px 12px;border:1px solid #ddd">${students.filter((s: any) => s.status === 'Graduated').length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Pending Admissions</td><td style="padding:8px 12px;border:1px solid #ddd">${pendingAdmissions.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Approved Admissions</td><td style="padding:8px 12px;border:1px solid #ddd">${approvedAdmissions.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Unmatched Placements</td><td style="padding:8px 12px;border:1px solid #ddd">${unmatchedPlacements.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Certificates Issued</td><td style="padding:8px 12px;border:1px solid #ddd">${certificates.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Correspondence Logged</td><td style="padding:8px 12px;border:1px solid #ddd">${correspondence.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Staff Records</td><td style="padding:8px 12px;border:1px solid #ddd">${staff.length}</td></tr>
      </table>`;
    }

    if (reportType === 'full' || reportType === 'students') {
      title = reportType === 'full' ? title : 'Student Records Report';
      body += `<h2>Student Records</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Adm No</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Name</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Class</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">House</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Guardian</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Phone</th><th style="padding:6px 8px;border:1px solid #ddd">Status</th>
      </tr></thead><tbody>`;
      students.forEach((s: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${s.admNo}</td><td style="padding:4px 8px;border:1px solid #ddd">${s.firstName} ${s.lastName}</td><td style="padding:4px 8px;border:1px solid #ddd">${s.class}</td><td style="padding:4px 8px;border:1px solid #ddd">${s.house}</td><td style="padding:4px 8px;border:1px solid #ddd">${s.guardianName}</td><td style="padding:4px 8px;border:1px solid #ddd">${s.guardianPhone}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${s.status}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'admissions') {
      title = reportType === 'full' ? title : 'Admissions Report';
      body += `<h2>Admission Applications</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Applicant</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Parent</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Date</th><th style="padding:6px 8px;border:1px solid #ddd">Docs Verified</th><th style="padding:6px 8px;border:1px solid #ddd">Status</th>
      </tr></thead><tbody>`;
      admissions.forEach((a: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${a.applicantName}</td><td style="padding:4px 8px;border:1px solid #ddd">${a.parentName}</td><td style="padding:4px 8px;border:1px solid #ddd">${a.dateApplied}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${a.documentsVerified ? 'Yes' : 'No'}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${a.status}</td></tr>`;
      });
      body += `</tbody></table>`;
      body += `<h2>Pre-loaded Placements</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Name</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">CSSPS Ref</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Intended Class</th><th style="padding:6px 8px;border:1px solid #ddd">Matched</th>
      </tr></thead><tbody>`;
      placements.forEach((p: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${p.fullName}</td><td style="padding:4px 8px;border:1px solid #ddd">${p.csspsRef}</td><td style="padding:4px 8px;border:1px solid #ddd">${p.intendedClass}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${p.matched ? 'Yes' : 'No'}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'certificates') {
      title = reportType === 'full' ? title : 'Certificates Report';
      body += `<h2>Certificates Issued</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Student</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Adm No</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Type</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Date</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Purpose</th>
      </tr></thead><tbody>`;
      certificates.forEach((c: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${c.studentName}</td><td style="padding:4px 8px;border:1px solid #ddd">${c.admNo}</td><td style="padding:4px 8px;border:1px solid #ddd">${c.type}</td><td style="padding:4px 8px;border:1px solid #ddd">${c.dateIssued}</td><td style="padding:4px 8px;border:1px solid #ddd">${c.purpose}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'correspondence') {
      title = reportType === 'full' ? title : 'Correspondence Log Report';
      body += `<h2>Correspondence Log</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Date</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Direction</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Subject</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Counterparty</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Priority</th>
      </tr></thead><tbody>`;
      correspondence.forEach((c: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${c.date}</td><td style="padding:4px 8px;border:1px solid #ddd">${c.direction}</td><td style="padding:4px 8px;border:1px solid #ddd">${c.subject}</td><td style="padding:4px 8px;border:1px solid #ddd">${c.counterparty}</td><td style="padding:4px 8px;border:1px solid #ddd">${c.priority}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'staff') {
      title = reportType === 'full' ? 'Comprehensive Registry Report' : 'Staff Records Report';
      body += `<h2>Staff Records</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Name</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Position</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Department</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Qualifications</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Employed</th><th style="padding:6px 8px;border:1px solid #ddd">Status</th>
      </tr></thead><tbody>`;
      staff.forEach((s: any) => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${s.name}</td><td style="padding:4px 8px;border:1px solid #ddd">${s.position}</td><td style="padding:4px 8px;border:1px solid #ddd">${s.department}</td><td style="padding:4px 8px;border:1px solid #ddd">${s.qualifications}</td><td style="padding:4px 8px;border:1px solid #ddd">${s.dateOfEmployment}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${s.status}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
      <style>*{font-family:'Segoe UI',Arial,sans-serif}body{padding:40px;color:#1A1A2E;max-width:900px;margin:0 auto}h1{color:#0F4C75;border-bottom:3px solid #0F4C75;padding-bottom:10px}h2{color:#2D3142;margin-top:30px}.header{display:flex;justify-content:space-between;margin-bottom:20px;font-size:12px;color:#888}.confidential{background:#FEF6E7;border-left:4px solid #F59E0B;padding:10px 15px;margin:15px 0;font-size:13px;color:#92400E}table{font-size:13px}th{font-weight:600}.footer{margin-top:40px;padding-top:15px;border-top:1px solid #ddd;font-size:11px;color:#aaa;text-align:center}@media print{body{padding:20px}}</style></head><body>
      <div class="header"><span>SIMS — Registry</span><span>Generated: ${now}</span></div>
      <h1>${title}</h1><div class="confidential">CONFIDENTIAL — This report contains student and staff records for school administration purposes only.</div>${body}
      <div class="footer">SIMS — Registry Report — ${dateStr}</div>
      <script>window.onload=function(){window.print()}</script></body></html>`;

    const printWin = window.open('', '_blank');
    if (printWin) { printWin.document.write(html); printWin.document.close(); }
    else { Alert.alert('Popup Blocked', 'Please allow popups to generate PDF reports.'); }
  };

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return (
          <ScrollView>
            <Text style={styles.pageTitle}>Registry Overview</Text>
            <Text style={styles.pageSubtitle}>Welcome, {userName}</Text>
            <CardGrid>
              <StatCard label="Total Students" value={students.length} subtitle={`${activeStudents.length} active`} accentColor={colors.primary} />
              <StatCard label="Pending Admissions" value={pendingAdmissions.length} subtitle={`${approvedAdmissions.length} approved`} accentColor={colors.warning} />
              <StatCard label="Unmatched Placements" value={unmatchedPlacements.length} accentColor={colors.danger} />
              <StatCard label="Certificates Issued" value={certificates.length} accentColor={colors.success} />
              <StatCard label="Correspondence" value={correspondence.length} subtitle={`${urgentCorrespondence.length} urgent`} accentColor={colors.info} />
              <StatCard label="Staff Records" value={staff.length} subtitle={`${activeStaff.length} active`} accentColor={colors.purple} />
            </CardGrid>

            {pendingAdmissions.length > 0 && (
              <View style={{ marginTop: spacing.lg }}>
                <Text style={styles.sectionTitle}>Admission Pipeline</Text>
                {pendingAdmissions.map((a) => {
                  const submittedDocs = a.documents.filter((d) => d.submitted).length;
                  const pct = Math.round((submittedDocs / DOCUMENT_CHECKLIST.length) * 100);
                  return (
                    <View key={a.id} style={styles.pipelineCard}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.pipelineName}>{a.applicantName}</Text>
                        <Text style={styles.pipelineMeta}>{a.dateApplied} — {a.parentName}</Text>
                        <View style={styles.pipelineBarRow}>
                          <View style={styles.pipelineBarTrack}>
                            <View style={[styles.pipelineBarFill, { width: `${pct}%`, backgroundColor: pct === 100 ? colors.success : colors.warning }]} />
                          </View>
                          <Text style={styles.pipelineBarText}>{submittedDocs}/{DOCUMENT_CHECKLIST.length} docs</Text>
                        </View>
                      </View>
                      {renderBadge(a.status, a.status === 'Approved' ? colors.success : a.status === 'Under Review' ? colors.info : colors.warning)}
                    </View>
                  );
                })}
              </View>
            )}

            {urgentCorrespondence.length > 0 && (
              <View style={{ marginTop: spacing.lg }}>
                <Text style={styles.sectionTitle}>Urgent Correspondence</Text>
                {urgentCorrespondence.map((c) => (
                  <View key={c.id} style={styles.urgentCard}>
                    <Text style={styles.urgentTitle}>{c.subject}</Text>
                    <Text style={styles.urgentMeta}>{c.date} — {c.direction} — {c.counterparty}</Text>
                    <Text style={styles.urgentNotes}>{c.notes}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        );

      case 'students':
        return <StudentsPage students={students} store={store} renderBadge={renderBadge} />;

      case 'admissions':
        return <AdmissionsPage admissions={admissions} placements={placements} store={store} renderBadge={renderBadge} />;

      case 'certificates':
        return <CertificatesPage certificates={certificates} store={store} />;

      case 'correspondence':
        return <CorrespondencePage correspondence={correspondence} store={store} renderBadge={renderBadge} />;

      case 'staff':
        return <StaffPage staff={staff} store={store} renderBadge={renderBadge} />;

      case 'reports':
        return <ReportsPage store={store} generatePDF={generatePDF} />;

      default:
        return null;
    }
  };

  return (
    <DashboardLayout title="Registry" navItems={NAV_ITEMS} activeKey={activePage} onNavigate={setActivePage}
      headerRight={<TouchableOpacity onPress={logout} style={styles.logoutBtn}><Text style={styles.logoutText}>Logout</Text></TouchableOpacity>}>
      {renderPage()}
    </DashboardLayout>
  );
}

// ── Students Page ──

function StudentsPage({ students, store, renderBadge }: any) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    admNo: '', firstName: '', lastName: '', dateOfBirth: '', gender: 'Male',
    programme: 'Science' as 'Science' | 'Arts' | 'Business',
    class: CLASS_SECTIONS[0], house: HOUSES[0], guardianName: '', guardianPhone: '', guardianAddress: '',
    photoUrl: null as string | null, csspsRef: '',
  });

  const statusColor = (s: string) => s === 'Active' ? colors.success : s === 'Graduated' ? colors.info : s === 'Withdrawn' ? colors.warning : colors.textLight;

  const filtered = store.searchStudents(search).filter((s: any) => filterStatus === 'All' || s.status === filterStatus);

  const handleAdd = () => {
    if (!form.admNo || !form.firstName || !form.lastName) {
      Alert.alert('Error', 'Admission number and name are required.');
      return;
    }
    store.addStudent({ ...form, photoUrl: form.photoUrl, csspsRef: form.csspsRef || null, admissionDate: new Date().toISOString().slice(0, 10), status: 'Active' });
    setForm({ admNo: '', firstName: '', lastName: '', dateOfBirth: '', gender: 'Male', programme: 'Science', class: CLASS_SECTIONS[0], house: HOUSES[0], guardianName: '', guardianPhone: '', guardianAddress: '', photoUrl: null, csspsRef: '' });
    setShowAdd(false);
    Alert.alert('Success', 'Student record added.');
  };

  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Student Records</Text>
      <Text style={styles.pageSubtitle}>{students.length} students enrolled</Text>

      <View style={styles.searchRow}>
        <TextInput style={styles.searchInput} placeholder="Search by name, adm no, class, house..." placeholderTextColor={colors.textLight} value={search} onChangeText={setSearch} />
      </View>

      <View style={styles.filterRow}>
        {['All', 'Active', 'Graduated', 'Withdrawn', 'Transferred'].map((s) => (
          <TouchableOpacity key={s} style={[styles.filterChip, filterStatus === s && styles.filterChipActive]} onPress={() => setFilterStatus(s)}>
            <Text style={[styles.filterChipText, filterStatus === s && styles.filterChipTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.actionBtn} onPress={() => setShowAdd(true)}>
        <Text style={styles.actionBtnText}>+ Add Student Record</Text>
      </TouchableOpacity>

      <Modal visible={showAdd} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Add Student Record</Text>
              <Text style={styles.inputLabel}>Admission Number</Text>
              <TextInput style={styles.textInput} value={form.admNo} onChangeText={(v) => setForm({ ...form, admNo: v })} placeholder="2026/005" />
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput style={styles.textInput} value={form.firstName} onChangeText={(v) => setForm({ ...form, firstName: v })} />
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput style={styles.textInput} value={form.lastName} onChangeText={(v) => setForm({ ...form, lastName: v })} />
              <Text style={styles.inputLabel}>Date of Birth (YYYY-MM-DD)</Text>
              <TextInput style={styles.textInput} value={form.dateOfBirth} onChangeText={(v) => setForm({ ...form, dateOfBirth: v })} placeholder="2009-03-15" />
              <Text style={styles.inputLabel}>Gender</Text>
              <View style={styles.pickerRow}>
                {['Male', 'Female'].map((g) => (
                  <TouchableOpacity key={g} style={[styles.pickerChip, form.gender === g && styles.pickerChipActive]} onPress={() => setForm({ ...form, gender: g })}>
                    <Text style={[styles.pickerChipText, form.gender === g && styles.pickerChipTextActive]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.inputLabel}>Class</Text>
              <View style={styles.pickerRow}>
                {CLASS_SECTIONS.map((c) => (
                  <TouchableOpacity key={c} style={[styles.pickerChip, form.class === c && styles.pickerChipActive]} onPress={() => setForm({ ...form, class: c })}>
                    <Text style={[styles.pickerChipText, form.class === c && styles.pickerChipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.inputLabel}>House</Text>
              <View style={styles.pickerRow}>
                {HOUSES.map((h) => (
                  <TouchableOpacity key={h} style={[styles.pickerChip, form.house === h && styles.pickerChipActive]} onPress={() => setForm({ ...form, house: h })}>
                    <Text style={[styles.pickerChipText, form.house === h && styles.pickerChipTextActive]}>{h}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.inputLabel}>Guardian Name</Text>
              <TextInput style={styles.textInput} value={form.guardianName} onChangeText={(v) => setForm({ ...form, guardianName: v })} />
              <Text style={styles.inputLabel}>Guardian Phone</Text>
              <TextInput style={styles.textInput} value={form.guardianPhone} onChangeText={(v) => setForm({ ...form, guardianPhone: v })} placeholder="024-XXX-XXXX" />
              <Text style={styles.inputLabel}>Guardian Address</Text>
              <TextInput style={styles.textInput} value={form.guardianAddress} onChangeText={(v) => setForm({ ...form, guardianAddress: v })} />
              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowAdd(false)}>
                  <Text style={styles.modalBtnTextCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleAdd}>
                  <Text style={styles.modalBtnTextSubmit}>Add Student</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <DataTable
        columns={[
          { key: 'admNo', label: 'Adm No', render: (i: any) => i.admNo },
          { key: 'name', label: 'Name', render: (i: any) => `${i.firstName} ${i.lastName}` },
          { key: 'class', label: 'Class', render: (i: any) => i.class },
          { key: 'house', label: 'House', render: (i: any) => i.house },
          { key: 'status', label: 'Status', render: (i: any) => renderBadge(i.status, statusColor(i.status)) },
        ]}
        data={filtered}
      />
      {filtered.length === 0 && <Text style={styles.emptyText}>No students found.</Text>}
    </ScrollView>
  );
}

// ── Admissions Page ──

function AdmissionsPage({ admissions, placements, store, renderBadge }: any) {
  const [showAddPlacement, setShowAddPlacement] = useState(false);
  const [showDetail, setShowDetail] = useState<string | null>(null);
  const [placementForm, setPlacementForm] = useState({ fullName: '', csspsRef: '', intendedClass: CLASS_SECTIONS[0] });

  const statusColor = (s: string) => s === 'Approved' ? colors.success : s === 'Rejected' ? colors.danger : s === 'Under Review' ? colors.info : colors.warning;

  const handleAddPlacement = () => {
    if (!placementForm.fullName.trim()) {
      Alert.alert('Error', 'Student name is required.');
      return;
    }
    store.addPlacement({ ...placementForm, preloadedBy: 'Registry Clerk' });
    setPlacementForm({ fullName: '', csspsRef: '', intendedClass: CLASS_SECTIONS[0] });
    setShowAddPlacement(false);
    Alert.alert('Success', 'Placement record added.');
  };

  const detailApp = admissions.find((a: any) => a.id === showDetail);

  const handleApprove = (id: string) => {
    store.updateAdmissionStatus(id, 'Approved', 'Registrar');
    Alert.alert('Success', 'Admission approved.');
    setShowDetail(null);
  };
  const handleReject = (id: string) => {
    store.updateAdmissionStatus(id, 'Rejected', 'Registrar');
    Alert.alert('Success', 'Admission rejected.');
    setShowDetail(null);
  };
  const handleReview = (id: string) => {
    store.updateAdmissionStatus(id, 'Under Review', 'Registrar');
    setShowDetail(null);
  };

  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Admissions</Text>
      <Text style={styles.pageSubtitle}>New student intake processing</Text>

      <TouchableOpacity style={styles.actionBtn} onPress={() => setShowAddPlacement(true)}>
        <Text style={styles.actionBtnText}>+ Pre-load Placement Record</Text>
      </TouchableOpacity>

      <Modal visible={showAddPlacement} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pre-load Placement Record</Text>
            <Text style={styles.inputLabel}>Student Full Name</Text>
            <TextInput style={styles.textInput} value={placementForm.fullName} onChangeText={(v) => setPlacementForm({ ...placementForm, fullName: v })} />
            <Text style={styles.inputLabel}>CSSPS Placement Ref</Text>
            <TextInput style={styles.textInput} value={placementForm.csspsRef} onChangeText={(v) => setPlacementForm({ ...placementForm, csspsRef: v })} placeholder="CSSPS/2026/XXXX" />
            <Text style={styles.inputLabel}>Intended Class</Text>
            <View style={styles.pickerRow}>
              {CLASS_SECTIONS.map((c) => (
                <TouchableOpacity key={c} style={[styles.pickerChip, placementForm.intendedClass === c && styles.pickerChipActive]} onPress={() => setPlacementForm({ ...placementForm, intendedClass: c })}>
                  <Text style={[styles.pickerChipText, placementForm.intendedClass === c && styles.pickerChipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowAddPlacement(false)}>
                <Text style={styles.modalBtnTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleAddPlacement}>
                <Text style={styles.modalBtnTextSubmit}>Add Placement</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Text style={styles.sectionTitle}>Pending Applications</Text>
      {admissions.map((a: any) => {
        const submittedDocs = a.documents.filter((d: any) => d.submitted).length;
        return (
          <View key={a.id} style={styles.admissionCard}>
            <TouchableOpacity onPress={() => setShowDetail(a.id)}>
              <View style={styles.admissionHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.admissionName}>{a.applicantName}</Text>
                  <Text style={styles.admissionMeta}>{a.dateApplied} — {a.parentName} — {a.parentPhone}</Text>
                  <View style={styles.docProgressRow}>
                    <View style={styles.docProgressBar}>
                      <View style={[styles.docProgressFill, { width: `${Math.round((submittedDocs / DOCUMENT_CHECKLIST.length) * 100)}%`, backgroundColor: submittedDocs === DOCUMENT_CHECKLIST.length ? colors.success : colors.warning }]} />
                    </View>
                    <Text style={styles.docProgressText}>{submittedDocs}/{DOCUMENT_CHECKLIST.length} docs</Text>
                  </View>
                </View>
                {renderBadge(a.status, statusColor(a.status))}
              </View>
            </TouchableOpacity>
          </View>
        );
      })}

      {detailApp && (
        <Modal visible animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView>
                <Text style={styles.modalTitle}>{detailApp.applicantName}</Text>
                <Text style={styles.detailMeta}>Applied: {detailApp.dateApplied}</Text>
                <Text style={styles.detailMeta}>Parent: {detailApp.parentName} ({detailApp.parentPhone})</Text>
                <Text style={styles.detailMeta}>Email: {detailApp.parentEmail}</Text>
                <Text style={styles.detailMeta}>Status: {detailApp.status}</Text>
                <Text style={styles.detailMeta}>Docs Verified: {detailApp.documentsVerified ? 'Yes' : 'No'}</Text>

                <Text style={styles.inputLabel}>Document Checklist</Text>
                {detailApp.documents.map((doc: any) => (
                  <TouchableOpacity key={doc.type} style={styles.checklistRow} onPress={() => store.toggleDocument(detailApp.id, doc.type)}>
                    <View style={[styles.checkbox, doc.submitted && styles.checkboxChecked]}>
                      <Text style={styles.checkboxText}>{doc.submitted ? '✓' : ''}</Text>
                    </View>
                    <Text style={styles.checklistText}>{doc.type}</Text>
                  </TouchableOpacity>
                ))}

                <Text style={styles.inputLabel}>Notes</Text>
                <Text style={styles.detailNotes}>{detailApp.notes}</Text>

                {!detailApp.documentsVerified && (
                  <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.info, marginBottom: spacing.sm }]} onPress={() => store.verifyDocuments(detailApp.id)}>
                    <Text style={styles.modalBtnTextSubmit}>Verify Documents</Text>
                  </TouchableOpacity>
                )}

                <View style={styles.modalBtnRow}>
                  {detailApp.status !== 'Under Review' && detailApp.status !== 'Approved' && detailApp.status !== 'Rejected' && (
                    <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.info }]} onPress={() => handleReview(detailApp.id)}>
                      <Text style={styles.modalBtnTextSubmit}>Mark Under Review</Text>
                    </TouchableOpacity>
                  )}
                  {detailApp.status !== 'Approved' && (
                    <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.success }]} onPress={() => handleApprove(detailApp.id)}>
                      <Text style={styles.modalBtnTextSubmit}>Approve</Text>
                    </TouchableOpacity>
                  )}
                  {detailApp.status !== 'Rejected' && (
                    <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.danger }]} onPress={() => handleReject(detailApp.id)}>
                      <Text style={styles.modalBtnTextSubmit}>Reject</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel, { marginTop: spacing.sm }]} onPress={() => setShowDetail(null)}>
                  <Text style={styles.modalBtnTextCancel}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      <Text style={styles.sectionTitle}>Pre-loaded Placements</Text>
      <DataTable
        columns={[
          { key: 'name', label: 'Name', render: (i: any) => i.fullName },
          { key: 'ref', label: 'CSSPS Ref', render: (i: any) => i.csspsRef },
          { key: 'class', label: 'Intended Class', render: (i: any) => i.intendedClass },
          { key: 'matched', label: 'Matched', render: (i: any) => renderBadge(i.matched ? 'Yes' : 'No', i.matched ? colors.success : colors.warning) },
        ]}
        data={placements}
      />
    </ScrollView>
  );
}

// ── Certificates Page ──

function CertificatesPage({ certificates, store }: any) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ studentName: '', admNo: '', type: CERTIFICATE_TYPES[0], purpose: '' });

  const typeColor = (t: string) => t === 'Transcript' ? colors.info : t === 'Testimonial' ? colors.success : t === 'Transfer Letter' ? colors.warning : t === 'Character Reference' ? colors.purple : colors.textSecondary;

  const handleIssue = () => {
    if (!form.studentName || !form.admNo) {
      Alert.alert('Error', 'Student name and admission number are required.');
      return;
    }
    store.issueCertificate({ ...form, issuedBy: 'Registrar' });
    setForm({ studentName: '', admNo: '', type: CERTIFICATE_TYPES[0], purpose: '' });
    setShowForm(false);
    Alert.alert('Success', 'Certificate issued.');
  };

  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Certificates & Documents</Text>
      <Text style={styles.pageSubtitle}>{certificates.length} certificates issued</Text>

      <TouchableOpacity style={styles.actionBtn} onPress={() => setShowForm(true)}>
        <Text style={styles.actionBtnText}>+ Issue Certificate</Text>
      </TouchableOpacity>

      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Issue Certificate</Text>
            <Text style={styles.inputLabel}>Student Name</Text>
            <TextInput style={styles.textInput} value={form.studentName} onChangeText={(v) => setForm({ ...form, studentName: v })} />
            <Text style={styles.inputLabel}>Admission Number</Text>
            <TextInput style={styles.textInput} value={form.admNo} onChangeText={(v) => setForm({ ...form, admNo: v })} placeholder="2026/001" />
            <Text style={styles.inputLabel}>Certificate Type</Text>
            <View style={styles.pickerRow}>
              {CERTIFICATE_TYPES.map((t) => (
                <TouchableOpacity key={t} style={[styles.pickerChip, form.type === t && styles.pickerChipActive]} onPress={() => setForm({ ...form, type: t })}>
                  <Text style={[styles.pickerChipText, form.type === t && styles.pickerChipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.inputLabel}>Purpose</Text>
            <TextInput style={[styles.textInput, { minHeight: 50 }]} value={form.purpose} onChangeText={(v) => setForm({ ...form, purpose: v })} placeholder="Reason for issuance..." multiline />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowForm(false)}>
                <Text style={styles.modalBtnTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleIssue}>
                <Text style={styles.modalBtnTextSubmit}>Issue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {certificates.map((c: any) => (
        <View key={c.id} style={styles.certCard}>
          <View style={styles.certHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.certStudent}>{c.studentName}</Text>
              <Text style={styles.certMeta}>{c.admNo} — {c.dateIssued}</Text>
              <Text style={styles.certPurpose}>{c.purpose}</Text>
            </View>
            <View style={[styles.typeBadge, { backgroundColor: typeColor(c.type) + '20' }]}>
              <Text style={[styles.typeText, { color: typeColor(c.type) }]}>{c.type}</Text>
            </View>
          </View>
          <Text style={styles.certIssuedBy}>Issued by {c.issuedBy}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

// ── Correspondence Page ──

function CorrespondencePage({ correspondence, store, renderBadge }: any) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ direction: 'Incoming' as any, subject: '', counterparty: '', priority: 'Normal' as any, notes: '' });

  const priorityColor = (p: string) => p === 'Urgent' ? colors.danger : p === 'Important' ? colors.warning : colors.textSecondary;
  const directionColor = (d: string) => d === 'Incoming' ? colors.info : colors.success;

  const handleLog = () => {
    if (!form.subject || !form.counterparty) {
      Alert.alert('Error', 'Subject and counterparty are required.');
      return;
    }
    store.logCorrespondence(form);
    setForm({ direction: 'Incoming', subject: '', counterparty: '', priority: 'Normal', notes: '' });
    setShowForm(false);
    Alert.alert('Success', 'Correspondence logged.');
  };

  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Correspondence Log</Text>
      <Text style={styles.pageSubtitle}>{correspondence.length} entries logged</Text>

      <TouchableOpacity style={styles.actionBtn} onPress={() => setShowForm(true)}>
        <Text style={styles.actionBtnText}>+ Log Correspondence</Text>
      </TouchableOpacity>

      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log Correspondence</Text>
            <Text style={styles.inputLabel}>Direction</Text>
            <View style={styles.pickerRow}>
              {CORRESPONDENCE_DIRECTIONS.map((d) => (
                <TouchableOpacity key={d} style={[styles.pickerChip, form.direction === d && styles.pickerChipActive]} onPress={() => setForm({ ...form, direction: d })}>
                  <Text style={[styles.pickerChipText, form.direction === d && styles.pickerChipTextActive]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.inputLabel}>Subject</Text>
            <TextInput style={styles.textInput} value={form.subject} onChangeText={(v) => setForm({ ...form, subject: v })} />
            <Text style={styles.inputLabel}>From / To</Text>
            <TextInput style={styles.textInput} value={form.counterparty} onChangeText={(v) => setForm({ ...form, counterparty: v })} placeholder="GES HQ, Regional Office..." />
            <Text style={styles.inputLabel}>Priority</Text>
            <View style={styles.pickerRow}>
              {CORRESPONDENCE_PRIORITIES.map((p) => (
                <TouchableOpacity key={p} style={[styles.pickerChip, form.priority === p && styles.pickerChipActive]} onPress={() => setForm({ ...form, priority: p })}>
                  <Text style={[styles.pickerChipText, form.priority === p && styles.pickerChipTextActive]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput style={[styles.textInput, { minHeight: 60 }]} value={form.notes} onChangeText={(v) => setForm({ ...form, notes: v })} placeholder="Brief description..." multiline />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowForm(false)}>
                <Text style={styles.modalBtnTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleLog}>
                <Text style={styles.modalBtnTextSubmit}>Log</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {correspondence.map((c: any) => (
        <View key={c.id} style={styles.correspCard}>
          <View style={styles.correspHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.correspSubject}>{c.subject}</Text>
              <Text style={styles.correspMeta}>{c.date} — {c.counterparty}</Text>
              <Text style={styles.correspNotes}>{c.notes}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              {renderBadge(c.direction, directionColor(c.direction))}
              {renderBadge(c.priority, priorityColor(c.priority))}
            </View>
          </View>
          <Text style={styles.correspLoggedBy}>Logged by {c.loggedBy}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

// ── Staff Records Page ──

function StaffPage({ staff, store, renderBadge }: any) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', position: '', role: '', department: '', dateOfEmployment: '', qualifications: '', phone: '', status: 'Active' as any });

  const statusColor = (s: string) => s === 'Active' ? colors.success : s === 'On Leave' ? colors.warning : s === 'Retired' ? colors.info : colors.textLight;

  const handleAdd = () => {
    if (!form.name || !form.position) {
      Alert.alert('Error', 'Name and position are required.');
      return;
    }
    store.addStaff(form);
    setForm({ name: '', position: '', role: '', department: '', dateOfEmployment: '', qualifications: '', phone: '', status: 'Active' });
    setShowForm(false);
    Alert.alert('Success', 'Staff record added.');
  };

  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Staff Records</Text>
      <Text style={styles.pageSubtitle}>{staff.length} staff records</Text>

      <TouchableOpacity style={styles.actionBtn} onPress={() => setShowForm(true)}>
        <Text style={styles.actionBtnText}>+ Add Staff Record</Text>
      </TouchableOpacity>

      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Add Staff Record</Text>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput style={styles.textInput} value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />
              <Text style={styles.inputLabel}>Position</Text>
              <TextInput style={styles.textInput} value={form.position} onChangeText={(v) => setForm({ ...form, position: v })} />
              <Text style={styles.inputLabel}>Role</Text>
              <TextInput style={styles.textInput} value={form.role} onChangeText={(v) => setForm({ ...form, role: v })} placeholder="hod_academic, bursary, admin..." />
              <Text style={styles.inputLabel}>Department</Text>
              <TextInput style={styles.textInput} value={form.department} onChangeText={(v) => setForm({ ...form, department: v })} />
              <Text style={styles.inputLabel}>Date of Employment (YYYY-MM-DD)</Text>
              <TextInput style={styles.textInput} value={form.dateOfEmployment} onChangeText={(v) => setForm({ ...form, dateOfEmployment: v })} placeholder="2020-09-01" />
              <Text style={styles.inputLabel}>Qualifications</Text>
              <TextInput style={styles.textInput} value={form.qualifications} onChangeText={(v) => setForm({ ...form, qualifications: v })} placeholder="B.Ed, M.Ed..." />
              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput style={styles.textInput} value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} placeholder="024-XXX-XXXX" />
              <Text style={styles.inputLabel}>Status</Text>
              <View style={styles.pickerRow}>
                {STAFF_STATUSES.map((s) => (
                  <TouchableOpacity key={s} style={[styles.pickerChip, form.status === s && styles.pickerChipActive]} onPress={() => setForm({ ...form, status: s })}>
                    <Text style={[styles.pickerChipText, form.status === s && styles.pickerChipTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowForm(false)}>
                  <Text style={styles.modalBtnTextCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleAdd}>
                  <Text style={styles.modalBtnTextSubmit}>Add Staff</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {staff.map((s: any) => (
        <View key={s.id} style={styles.staffCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.staffName}>{s.name}</Text>
            <Text style={styles.staffPosition}>{s.position} — {s.department}</Text>
            <Text style={styles.staffMeta}>Employed: {s.dateOfEmployment}</Text>
            <Text style={styles.staffQuals}>{s.qualifications}</Text>
            <Text style={styles.staffPhone}>📞 {s.phone}</Text>
          </View>
          {renderBadge(s.status, statusColor(s.status))}
        </View>
      ))}
    </ScrollView>
  );
}

// ── Reports Page ──

function ReportsPage({ store, generatePDF }: any) {
  const { students, admissions, placements, certificates, correspondence, staff } = store;
  const activeStudents = students.filter((s: any) => s.status === 'Active');
  const pendingAdmissions = admissions.filter((a: any) => a.status === 'Received' || a.status === 'Under Review');
  const approvedAdmissions = admissions.filter((a: any) => a.status === 'Approved');
  const activeStaff = staff.filter((s: any) => s.status === 'Active');

  const reportTypes = [
    { key: 'overview', name: 'Operations Overview', desc: `${students.length} students, ${admissions.length} admissions`, color: colors.primary },
    { key: 'students', name: 'Student Records', desc: `${students.length} total, ${activeStudents.length} active`, color: colors.info },
    { key: 'admissions', name: 'Admissions Report', desc: `${pendingAdmissions.length} pending, ${approvedAdmissions.length} approved`, color: colors.warning },
    { key: 'certificates', name: 'Certificates', desc: `${certificates.length} issued`, color: colors.success },
    { key: 'correspondence', name: 'Correspondence', desc: `${correspondence.length} entries`, color: colors.purple },
    { key: 'staff', name: 'Staff Records', desc: `${staff.length} records, ${activeStaff.length} active`, color: colors.accent },
  ];

  const activePct = students.length > 0 ? Math.round((activeStudents.length / students.length) * 100) : 0;
  const pendingPct = admissions.length > 0 ? Math.round((pendingAdmissions.length / admissions.length) * 100) : 0;
  const approvedPct = admissions.length > 0 ? Math.round((approvedAdmissions.length / admissions.length) * 100) : 0;
  const matchedPct = placements.length > 0 ? Math.round((placements.filter((p: any) => p.matched).length / placements.length) * 100) : 0;
  const activeStaffPct = staff.length > 0 ? Math.round((activeStaff.length / staff.length) * 100) : 0;

  return (
    <ScrollView>
      <Text style={styles.pageTitle}>Registry Reports</Text>
      <Text style={styles.pageSubtitle}>Generate printable PDF reports for registry operations</Text>

      <TouchableOpacity style={styles.pdfFullBtn} onPress={() => generatePDF('full')}>
        <Text style={styles.pdfFullBtnText}>Generate Full Report (PDF)</Text>
      </TouchableOpacity>

      <View style={styles.pdfBtnRow}>
        {reportTypes.map((r) => (
          <TouchableOpacity key={r.key} style={[styles.pdfBtn, { backgroundColor: r.color }]} onPress={() => generatePDF(r.key)}>
            <Text style={styles.pdfBtnText}>{r.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.reportHeaderRow}>
        <Text style={styles.sectionTitle}>Student Status</Text>
        <TouchableOpacity onPress={() => generatePDF('students')}><Text style={styles.pdfLink}>PDF</Text></TouchableOpacity>
      </View>
      <View style={styles.reportSectionCard}>
        <View style={styles.reportBarRow}>
          <Text style={styles.reportBarLabel}>Active</Text>
          <View style={styles.reportBarTrack}>
            <View style={[styles.reportBarFill, { width: `${activePct}%`, backgroundColor: colors.success }]} />
          </View>
          <Text style={styles.reportBarCount}>{activeStudents.length}/{students.length}</Text>
        </View>
      </View>

      <View style={styles.reportHeaderRow}>
        <Text style={styles.sectionTitle}>Admission Pipeline</Text>
        <TouchableOpacity onPress={() => generatePDF('admissions')}><Text style={styles.pdfLink}>PDF</Text></TouchableOpacity>
      </View>
      <View style={styles.reportSectionCard}>
        <View style={styles.reportBarRow}>
          <Text style={styles.reportBarLabel}>Pending</Text>
          <View style={styles.reportBarTrack}>
            <View style={[styles.reportBarFill, { width: `${pendingPct}%`, backgroundColor: colors.warning }]} />
          </View>
          <Text style={styles.reportBarCount}>{pendingAdmissions.length}</Text>
        </View>
        <View style={styles.reportBarRow}>
          <Text style={styles.reportBarLabel}>Approved</Text>
          <View style={styles.reportBarTrack}>
            <View style={[styles.reportBarFill, { width: `${approvedPct}%`, backgroundColor: colors.success }]} />
          </View>
          <Text style={styles.reportBarCount}>{approvedAdmissions.length}</Text>
        </View>
        <View style={styles.reportBarRow}>
          <Text style={styles.reportBarLabel}>Matched Placements</Text>
          <View style={styles.reportBarTrack}>
            <View style={[styles.reportBarFill, { width: `${matchedPct}%`, backgroundColor: colors.info }]} />
          </View>
          <Text style={styles.reportBarCount}>{placements.filter((p: any) => p.matched).length}/{placements.length}</Text>
        </View>
      </View>

      <View style={styles.reportHeaderRow}>
        <Text style={styles.sectionTitle}>Staff Status</Text>
        <TouchableOpacity onPress={() => generatePDF('staff')}><Text style={styles.pdfLink}>PDF</Text></TouchableOpacity>
      </View>
      <View style={styles.reportSectionCard}>
        <View style={styles.reportBarRow}>
          <Text style={styles.reportBarLabel}>Active</Text>
          <View style={styles.reportBarTrack}>
            <View style={[styles.reportBarFill, { width: `${activeStaffPct}%`, backgroundColor: colors.success }]} />
          </View>
          <Text style={styles.reportBarCount}>{activeStaff.length}/{staff.length}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
  pageSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  emptyText: { fontSize: fontSize.md, color: colors.textLight, textAlign: 'center', paddingVertical: spacing.xl },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },

  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  statusText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },

  // Search & Filter
  searchRow: { marginBottom: spacing.sm },
  searchInput: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md, color: colors.text, backgroundColor: colors.surface },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xs },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { fontSize: fontSize.sm, color: colors.textSecondary },
  filterChipTextActive: { color: colors.white, fontWeight: fontWeight.semibold },

  // Action
  actionBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm + 4, alignItems: 'center', marginBottom: spacing.lg },
  actionBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  modalContent: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, width: '100%', maxWidth: 500, maxHeight: '90%' },
  modalTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.md },
  inputLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xs },
  textInput: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md, color: colors.text, marginBottom: spacing.sm },
  pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  pickerChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xs },
  pickerChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pickerChipText: { fontSize: fontSize.sm, color: colors.textSecondary },
  pickerChipTextActive: { color: colors.white, fontWeight: fontWeight.semibold },
  modalBtnRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  modalBtn: { flex: 1, borderRadius: radius.md, paddingVertical: spacing.sm + 2, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  modalBtnSubmit: { backgroundColor: colors.primary },
  modalBtnTextCancel: { color: colors.textSecondary, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  modalBtnTextSubmit: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },

  // Overview — Pipeline
  pipelineCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pipelineName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  pipelineMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  pipelineBarRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs, gap: spacing.sm },
  pipelineBarTrack: { flex: 1, height: 8, backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, overflow: 'hidden' },
  pipelineBarFill: { height: '100%', borderRadius: radius.sm },
  pipelineBarText: { fontSize: fontSize.xs, color: colors.textLight, fontWeight: fontWeight.medium },

  urgentCard: { backgroundColor: colors.dangerBg, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderLeftWidth: 4, borderLeftColor: colors.danger },
  urgentTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.danger },
  urgentMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  urgentNotes: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },

  // Admissions
  admissionCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  admissionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  admissionName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  admissionMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  docProgressRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs, gap: spacing.sm },
  docProgressBar: { flex: 1, height: 8, backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, overflow: 'hidden' },
  docProgressFill: { height: '100%', borderRadius: radius.sm },
  docProgressText: { fontSize: fontSize.xs, color: colors.textLight, fontWeight: fontWeight.medium },

  // Detail modal
  detailMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  detailNotes: { fontSize: fontSize.sm, color: colors.text, marginTop: spacing.xs },
  checklistRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs, gap: spacing.sm },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: colors.success, borderColor: colors.success },
  checkboxText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  checklistText: { fontSize: fontSize.sm, color: colors.text },

  // Certificates
  certCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  certHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  certStudent: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  certMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  certPurpose: { fontSize: fontSize.sm, color: colors.textLight, marginTop: 2 },
  certIssuedBy: { fontSize: fontSize.xs, color: colors.textLight, marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.borderLight },
  typeBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  typeText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },

  // Correspondence
  correspCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  correspHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  correspSubject: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, flex: 1, marginRight: spacing.sm },
  correspMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  correspNotes: { fontSize: fontSize.sm, color: colors.textLight, marginTop: spacing.xs },
  correspLoggedBy: { fontSize: fontSize.xs, color: colors.textLight, marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.borderLight },

  // Staff
  staffCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  staffName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  staffPosition: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  staffMeta: { fontSize: fontSize.xs, color: colors.textLight, marginTop: 2 },
  staffQuals: { fontSize: fontSize.xs, color: colors.textLight, marginTop: 2 },
  staffPhone: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },

  // Reports
  pdfFullBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, marginBottom: spacing.md, alignItems: 'center' },
  pdfFullBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.bold },
  pdfBtnRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  pdfBtn: { borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, marginBottom: spacing.xs },
  pdfBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  pdfLink: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.bold },
  reportHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.sm },
  reportSectionCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  reportBarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  reportBarLabel: { fontSize: fontSize.sm, color: colors.textSecondary, width: 120, flexShrink: 0 },
  reportBarTrack: { flex: 1, height: 12, backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, marginHorizontal: spacing.sm, overflow: 'hidden' },
  reportBarFill: { height: '100%', borderRadius: radius.sm },
  reportBarCount: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text, width: 50, textAlign: 'right' },

  logoutBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  logoutText: { color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
});
