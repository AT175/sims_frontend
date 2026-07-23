import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useAuthStore } from '@store/authStore';
import {
  useBoardingStore,
  ROLL_CALL_STATUSES, DISCIPLINE_SEVERITIES,
} from '@store/boardingStore';
import type { DisciplineSeverity } from '@store/boardingStore';
import { useRequisitionStore } from '@store/requisitionStore';
import { useExeatStore } from '@store/exeatStore';

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'assignments', label: 'House Assignments' },
  { key: 'approvals', label: 'Requisition Approvals' },
  { key: 'exeats', label: 'Exeat Approvals' },
  { key: 'houses', label: 'Houses' },
  { key: 'rollcall', label: 'Roll Call Summary' },
  { key: 'discipline', label: 'Discipline Log' },
  { key: 'welfare', label: 'Welfare Overview' },
  { key: 'reports', label: 'Reports' },
];

const todayStr = () => new Date().toISOString().slice(0, 10);

export function SeniorHousemasterDashboard() {
  const [activePage, setActivePage] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const { user, logout } = useAuthStore();
  const recordedBy = user?.displayName ?? 'Senior Housemaster';

  const {
    houses, students, rooms, rollCalls, discipline, welfare,
    addStudent, deleteStudent,
    addRoom, deleteRoom,
    updateRollCallStatus, deleteRollCall, startRollCall,
    addDiscipline, deleteDiscipline, escalateDiscipline,
    addWelfare, deleteWelfare, resolveWelfare,
    assignHousemaster,
  } = useBoardingStore();

  const {
    getPendingSeniorHousemaster, approveBySeniorHousemaster, rejectRequisition,
  } = useRequisitionStore();

  const pendingApprovals = getPendingSeniorHousemaster();

  const {
    exeats, getPending: getPendingExeats, approveExeat, rejectExeat,
  } = useExeatStore();
  const pendingExeats = getPendingExeats();

  const [studentForm, setStudentForm] = useState({ admNo: '', name: '', class: '', house: houses[0]?.name || '', room: '', bed: '' });
  const [roomForm, setRoomForm] = useState({ house: houses[0]?.name || '', room: '', beds: '4', studentNames: '' });
  const [disciplineForm, setDisciplineForm] = useState({ studentName: '', house: houses[0]?.name || '', incident: '', severity: 'Minor' as DisciplineSeverity, actionTaken: '' });
  const [welfareForm, setWelfareForm] = useState({ studentName: '', house: houses[0]?.name || '', note: '' });
  const [assignForm, setAssignForm] = useState({ houseId: houses[0]?.id || '', housemasterName: '', phone: '' });

  const openModal = (type: string) => { setModalType(type); setShowModal(true); };
  const closeModal = () => { setShowModal(false); };

  // ── Computed ──
  const totalStudents = students.length;
  const totalRooms = rooms.length;
  const todayRollCalls = rollCalls.filter(r => r.date === todayStr());
  const present = todayRollCalls.filter(r => r.status === 'Present').length;
  const absent = todayRollCalls.filter(r => r.status === 'Absent').length;
  const excused = todayRollCalls.filter(r => r.status === 'Excused').length;
  const late = todayRollCalls.filter(r => r.status === 'Late').length;
  const unresolvedWelfare = welfare.filter(w => !w.resolved);
  const escalatedDiscipline = discipline.filter(d => d.escalated);

  const statusColor = (s: string) =>
    s === 'Present' ? colors.success : s === 'Absent' ? colors.danger :
    s === 'Excused' ? colors.info : s === 'Late' ? colors.warning :
    s === 'Minor' ? colors.textSecondary : s === 'Moderate' ? colors.warning :
    s === 'Serious' || s === 'Critical' ? colors.danger : colors.primary;

  const severityColor = (s: DisciplineSeverity) =>
    s === 'Critical' || s === 'Serious' ? colors.danger : s === 'Moderate' ? colors.warning : colors.textSecondary;

  const handleSaveStudent = () => {
    if (!studentForm.name.trim() || !studentForm.admNo.trim()) { Alert.alert('Error', 'Name and admission number are required'); return; }
    addStudent({ admNo: studentForm.admNo.trim(), name: studentForm.name.trim(), class: studentForm.class.trim(), house: studentForm.house, room: studentForm.room.trim(), bed: studentForm.bed.trim() || undefined });
    setStudentForm({ admNo: '', name: '', class: '', house: houses[0]?.name || '', room: '', bed: '' });
    closeModal();
  };

  const handleSaveRoom = () => {
    if (!roomForm.room.trim()) { Alert.alert('Error', 'Room number is required'); return; }
    const names = roomForm.studentNames.split(',').map((s) => s.trim()).filter(Boolean);
    addRoom({ house: roomForm.house, room: roomForm.room.trim(), beds: parseInt(roomForm.beds) || 4, occupied: names.length, studentNames: names });
    setRoomForm({ house: houses[0]?.name || '', room: '', beds: '4', studentNames: '' });
    closeModal();
  };

  const handleSaveDiscipline = () => {
    if (!disciplineForm.studentName.trim() || !disciplineForm.incident.trim()) { Alert.alert('Error', 'Student name and incident are required'); return; }
    addDiscipline({ date: todayStr(), house: disciplineForm.house, studentName: disciplineForm.studentName.trim(), incident: disciplineForm.incident.trim(), severity: disciplineForm.severity, actionTaken: disciplineForm.actionTaken.trim() || 'Pending', recordedBy, escalated: false });
    setDisciplineForm({ studentName: '', house: houses[0]?.name || '', incident: '', severity: 'Minor', actionTaken: '' });
    closeModal();
  };

  const handleSaveWelfare = () => {
    if (!welfareForm.studentName.trim() || !welfareForm.note.trim()) { Alert.alert('Error', 'Student name and note are required'); return; }
    addWelfare({ date: todayStr(), house: welfareForm.house, studentName: welfareForm.studentName.trim(), note: welfareForm.note.trim(), recordedBy, resolved: false });
    setWelfareForm({ studentName: '', house: houses[0]?.name || '', note: '' });
    closeModal();
  };

  const handleSaveAssignment = () => {
    if (!assignForm.housemasterName.trim()) { Alert.alert('Error', 'Housemaster name is required'); return; }
    assignHousemaster(assignForm.houseId, assignForm.housemasterName.trim(), assignForm.phone.trim());
    const house = houses.find(h => h.id === assignForm.houseId);
    Alert.alert('Success', `${assignForm.housemasterName.trim()} assigned to ${house?.name ?? ''} House.\n\nWhen this user logs in with the housemaster role and their display name matches "${assignForm.housemasterName.trim()}", they will see the ${house?.name ?? ''} House dashboard.`);
    setAssignForm({ houseId: houses[0]?.id || '', housemasterName: '', phone: '' });
    closeModal();
  };

  const handleDelete = (id: string, type: string, name: string) =>
    Alert.alert('Delete', `Delete this ${type}${name ? ` (${name})` : ''}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        if (type === 'student') deleteStudent(id);
        else if (type === 'room') deleteRoom(id);
        else if (type === 'roll call') deleteRollCall(id);
        else if (type === 'discipline') deleteDiscipline(id);
        else if (type === 'welfare') deleteWelfare(id);
      } },
    ]);

  // ── PDF Generation ──
  const generatePDF = (reportType: string) => {
    const now = new Date().toLocaleString();
    let body = '';
    let title = '';

    if (reportType === 'full' || reportType === 'overview') {
      title = 'Boarding Overview — All Houses';
      body += `<h2>Overview</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px">
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Total Houses</td><td style="padding:8px 12px;border:1px solid #ddd">${houses.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Total Students</td><td style="padding:8px 12px;border:1px solid #ddd">${totalStudents}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Total Rooms</td><td style="padding:8px 12px;border:1px solid #ddd">${totalRooms}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Present Today</td><td style="padding:8px 12px;border:1px solid #ddd">${present}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Absent</td><td style="padding:8px 12px;border:1px solid #ddd">${absent}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Excused</td><td style="padding:8px 12px;border:1px solid #ddd">${excused}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Late</td><td style="padding:8px 12px;border:1px solid #ddd">${late}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Discipline Incidents</td><td style="padding:8px 12px;border:1px solid #ddd">${discipline.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Escalated</td><td style="padding:8px 12px;border:1px solid #ddd">${escalatedDiscipline.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Welfare (Unresolved)</td><td style="padding:8px 12px;border:1px solid #ddd">${unresolvedWelfare.length}</td></tr>
      </table>`;
    }

    if (reportType === 'full' || reportType === 'houses') {
      title = reportType === 'full' ? title : 'House Summary Report';
      body += `<h2>House Summary</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">House</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Type</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Housemaster</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Phone</th><th style="padding:6px 8px;border:1px solid #ddd">Capacity</th><th style="padding:6px 8px;border:1px solid #ddd">Occupied</th><th style="padding:6px 8px;border:1px solid #ddd">Students</th>
      </tr></thead><tbody>`;
      houses.forEach(h => {
        const hStudents = students.filter(s => s.house === h.name).length;
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${h.name}</td><td style="padding:4px 8px;border:1px solid #ddd">${h.type}</td><td style="padding:4px 8px;border:1px solid #ddd">${h.housemaster}</td><td style="padding:4px 8px;border:1px solid #ddd">${h.phone || '-'}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${h.capacity}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${h.occupied}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${hStudents}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'rollcall') {
      title = reportType === 'full' ? title : 'Roll Call Summary — All Houses';
      body += `<h2>Roll Call Summary — ${todayStr()}</h2>`;
      houses.forEach(h => {
        const hRollCalls = todayRollCalls.filter(r => r.house === h.name);
        const hPresent = hRollCalls.filter(r => r.status === 'Present').length;
        const hAbsent = hRollCalls.filter(r => r.status === 'Absent').length;
        body += `<h3>${h.name} House</h3><p style="font-size:12px;margin-bottom:8px">Present: ${hPresent} | Absent: ${hAbsent}</p><table style="border-collapse:collapse;width:100%;margin-bottom:15px;font-size:12px"><thead><tr style="background:#f0f0f0"><th style="padding:4px 8px;border:1px solid #ddd;text-align:left">Student</th><th style="padding:4px 8px;border:1px solid #ddd;text-align:left">Room</th><th style="padding:4px 8px;border:1px solid #ddd">Status</th><th style="padding:4px 8px;border:1px solid #ddd;text-align:left">Notes</th></tr></thead><tbody>`;
        hRollCalls.forEach(r => { body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${r.studentName}</td><td style="padding:4px 8px;border:1px solid #ddd">${r.room}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${r.status}</td><td style="padding:4px 8px;border:1px solid #ddd">${r.notes || '-'}</td></tr>`; });
        body += `</tbody></table>`;
      });
    }

    if (reportType === 'full' || reportType === 'discipline') {
      title = reportType === 'full' ? title : 'Discipline Log — All Houses';
      body += `<h2>Discipline Log — All Houses</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Date</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">House</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Student</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Incident</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Severity</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Action</th><th style="padding:6px 8px;border:1px solid #ddd">Esc.</th>
      </tr></thead><tbody>`;
      discipline.forEach(d => { body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${d.date}</td><td style="padding:4px 8px;border:1px solid #ddd">${d.house}</td><td style="padding:4px 8px;border:1px solid #ddd">${d.studentName}</td><td style="padding:4px 8px;border:1px solid #ddd">${d.incident}</td><td style="padding:4px 8px;border:1px solid #ddd">${d.severity}</td><td style="padding:4px 8px;border:1px solid #ddd">${d.actionTaken}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${d.escalated ? 'Yes' : 'No'}</td></tr>`; });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'welfare') {
      title = reportType === 'full' ? 'Comprehensive Boarding Report — All Houses' : 'Welfare Overview — All Houses';
      body += `<h2>Welfare Notes — All Houses</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Date</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">House</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Student</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Note</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">By</th><th style="padding:6px 8px;border:1px solid #ddd">Resolved</th>
      </tr></thead><tbody>`;
      welfare.forEach(w => { body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${w.date}</td><td style="padding:4px 8px;border:1px solid #ddd">${w.house}</td><td style="padding:4px 8px;border:1px solid #ddd">${w.studentName}</td><td style="padding:4px 8px;border:1px solid #ddd">${w.note}</td><td style="padding:4px 8px;border:1px solid #ddd">${w.recordedBy}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${w.resolved ? 'Yes' : 'No'}</td></tr>`; });
      body += `</tbody></table>`;
    }

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
      <style>*{font-family:'Segoe UI',Arial,sans-serif}body{padding:40px;color:#1A1A2E;max-width:900px;margin:0 auto}h1{color:#0F4C75;border-bottom:3px solid #0F4C75;padding-bottom:10px}h2{color:#2D3142;margin-top:30px}h3{color:#3282B8;margin-top:20px}.header{display:flex;justify-content:space-between;margin-bottom:20px;font-size:12px;color:#888}.confidential{background:#FDECEC;border-left:4px solid #E5484D;padding:10px 15px;margin:15px 0;font-size:13px;color:#991111}table{font-size:13px}th{font-weight:600}.footer{margin-top:40px;padding-top:15px;border-top:1px solid #ddd;font-size:11px;color:#aaa;text-align:center}@media print{body{padding:20px}}</style></head><body>
      <div class="header"><span>SIMS — Senior Housemaster</span><span>Generated: ${now}</span></div>
      <h1>${title}</h1><div class="confidential">BOARDING CONFIDENTIAL — Contains student welfare and discipline data across all houses. Restricted to authorised senior house staff and administration.</div>${body}
      <div class="footer">SIMS — Boarding Report — ${todayStr()}</div>
      <script>window.onload=function(){window.print()}</script></body></html>`;

    const printWin = window.open('', '_blank');
    if (printWin) { printWin.document.write(html); printWin.document.close(); }
    else { Alert.alert('Popup Blocked', 'Please allow popups to generate PDF reports.'); }
  };

  const renderBadge = (text: string, color: string) => (
    <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}><Text style={[styles.statusText, { color }]}>{text}</Text></View>
  );

  const renderSelect = (label: string, value: string, options: readonly string[], onSelect: (v: string) => void) => (
    <View><Text style={styles.inputLabel}>{label}</Text><View style={styles.selectRow}>
      {options.map((opt) => (<TouchableOpacity key={opt} style={[styles.selectChip, value === opt && styles.selectChipActive]} onPress={() => onSelect(opt)}><Text style={[styles.selectChipText, value === opt && styles.selectChipTextActive]}>{opt}</Text></TouchableOpacity>))}
    </View></View>
  );

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Students" value={totalStudents} subtitle={`${houses.length} houses`} accentColor={colors.primary} />
              <StatCard label="Present Today" value={present} subtitle={`${absent} absent`} accentColor={colors.success} />
              <StatCard label="Escalated" value={escalatedDiscipline.length} subtitle="discipline" accentColor={escalatedDiscipline.length > 0 ? colors.danger : colors.success} />
              <StatCard label="Welfare Open" value={unresolvedWelfare.length} subtitle="unresolved" accentColor={unresolvedWelfare.length > 0 ? colors.warning : colors.success} />
            </CardGrid>

            {escalatedDiscipline.length > 0 && (
              <View style={[styles.alertCard, { borderLeftColor: colors.danger }]}>
                <Text style={[styles.alertTitle, { color: colors.danger }]}>Escalated Discipline ({escalatedDiscipline.length})</Text>
                {escalatedDiscipline.map((d) => (<Text key={d.id} style={styles.alertText}>{d.house} — {d.studentName}: {d.incident} ({d.severity})</Text>))}
              </View>
            )}

            {unresolvedWelfare.length > 0 && (
              <View style={[styles.alertCard, { borderLeftColor: colors.warning }]}>
                <Text style={[styles.alertTitle, { color: colors.warning }]}>Unresolved Welfare ({unresolvedWelfare.length})</Text>
                {unresolvedWelfare.map((w) => (<Text key={w.id} style={styles.alertText}>{w.house} — {w.studentName}: {w.note.slice(0, 50)}{w.note.length > 50 ? '...' : ''}</Text>))}
              </View>
            )}

            <Text style={styles.sectionTitle}>House Summary</Text>
            {houses.map((h) => {
              const hStudents = students.filter(s => s.house === h.name).length;
              const hPresent = todayRollCalls.filter(r => r.house === h.name && r.status === 'Present').length;
              const hAbsent = todayRollCalls.filter(r => r.house === h.name && r.status === 'Absent').length;
              return (
                <View key={h.id} style={styles.houseCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.houseName}>{h.name} House ({h.type})</Text>
                    <Text style={styles.houseMeta}>Housemaster: {h.housemaster} | {h.occupied}/{h.capacity} capacity</Text>
                    <Text style={styles.houseMeta}>Students: {hStudents} | Present: {hPresent} | Absent: {hAbsent}</Text>
                  </View>
                </View>
              );
            })}

            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.primary }]} onPress={() => { setStudentForm({ admNo: '', name: '', class: '', house: houses[0]?.name || '', room: '', bed: '' }); openModal('student'); }}><Text style={styles.quickBtnText}>+ Add Student</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.danger }]} onPress={() => { setDisciplineForm({ studentName: '', house: houses[0]?.name || '', incident: '', severity: 'Minor', actionTaken: '' }); openModal('discipline'); }}><Text style={styles.quickBtnText}>+ Log Incident</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.info }]} onPress={() => { setWelfareForm({ studentName: '', house: houses[0]?.name || '', note: '' }); openModal('welfare'); }}><Text style={styles.quickBtnText}>+ Welfare Note</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.purple }]} onPress={() => { setAssignForm({ houseId: houses[0]?.id || '', housemasterName: '', phone: '' }); openModal('assignment'); }}><Text style={styles.quickBtnText}>+ Assign Housemaster</Text></TouchableOpacity>
            </View>
          </View>
        );

      case 'assignments':
        return (
          <View>
            <CardGrid>
              <StatCard label="Houses" value={houses.length} accentColor={colors.primary} />
              <StatCard label="Assigned" value={houses.filter(h => h.housemaster && h.housemaster !== 'Unassigned').length} accentColor={colors.success} />
              <StatCard label="Unassigned" value={houses.filter(h => !h.housemaster || h.housemaster === 'Unassigned').length} accentColor={colors.danger} />
              <StatCard label="Total Students" value={totalStudents} accentColor={colors.info} />
            </CardGrid>

            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.purple }]} onPress={() => { setAssignForm({ houseId: houses[0]?.id || '', housemasterName: '', phone: '' }); openModal('assignment'); }}>
              <Text style={styles.actionBtnText}>+ Assign Housemaster</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>House Assignments</Text>
            <View style={styles.assignInfoCard}>
              <Text style={styles.assignInfoText}>Assign a housemaster to each house. When a user logs in with the "Housemaster" or "Housemistress" role, their display name is matched against the housemaster name to determine which house dashboard they see.</Text>
            </View>

            {houses.map((h) => {
              const hStudents = students.filter(s => s.house === h.name).length;
              const isAssigned = h.housemaster && h.housemaster !== 'Unassigned';
              return (
                <View key={h.id} style={[styles.houseCard, { borderLeftColor: isAssigned ? colors.success : colors.danger }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.houseName}>{h.name} House ({h.type})</Text>
                    <Text style={styles.houseMeta}>Housemaster: {h.housemaster || 'Unassigned'}</Text>
                    {h.phone && <Text style={styles.houseMeta}>Phone: {h.phone}</Text>}
                    <Text style={styles.houseMeta}>Students: {hStudents} | Capacity: {h.occupied}/{h.capacity}</Text>
                  </View>
                  <View style={styles.welfareRight}>
                    {renderBadge(isAssigned ? 'Assigned' : 'Unassigned', isAssigned ? colors.success : colors.danger)}
                    <TouchableOpacity onPress={() => { setAssignForm({ houseId: h.id, housemasterName: h.housemaster !== 'Unassigned' ? h.housemaster : '', phone: h.phone }); openModal('assignment'); }}>
                      <Text style={styles.actionLink}>{isAssigned ? 'Reassign' : 'Assign'} →</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        );

      case 'approvals':
        return (
          <View>
            <CardGrid>
              <StatCard label="Pending" value={pendingApprovals.length} accentColor={pendingApprovals.length > 0 ? colors.warning : colors.success} />
              <StatCard label="Urgent" value={pendingApprovals.filter(r => r.priority === 'Urgent').length} accentColor={colors.danger} />
              <StatCard label="Normal" value={pendingApprovals.filter(r => r.priority === 'Normal').length} accentColor={colors.info} />
              <StatCard label="Low" value={pendingApprovals.filter(r => r.priority === 'Low').length} accentColor={colors.textSecondary} />
            </CardGrid>

            <Text style={styles.pageTitle}>Requisition Approvals</Text>
            <Text style={styles.pageSubtitle}>Requisitions from housemasters awaiting your approval before forwarding to Asst. Headmaster (Domestic)</Text>

            {pendingApprovals.length === 0 && <Text style={styles.emptyText}>No pending requisitions. All caught up!</Text>}

            {pendingApprovals.map((r) => (
              <View key={r.id} style={[styles.disciplineCard, { borderLeftColor: r.priority === 'Urgent' ? colors.danger : colors.warning }]}>
                <View style={styles.disciplineHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.disciplineStudent}>{r.itemName} — {r.quantity} {r.unit}</Text>
                    <Text style={styles.disciplineMeta}>From: {r.requestedBy}{r.house ? ` | ${r.house} House` : ''}</Text>
                    <Text style={styles.disciplineMeta}>Date: {r.date} | Priority: {r.priority}</Text>
                    {r.notes && <Text style={styles.disciplineMeta}>Notes: {r.notes}</Text>}
                  </View>
                  <View style={styles.disciplineBadges}>
                    {renderBadge(r.priority, r.priority === 'Urgent' ? colors.danger : r.priority === 'Normal' ? colors.info : colors.textSecondary)}
                  </View>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => { approveBySeniorHousemaster(r.id, recordedBy); Alert.alert('Approved', `${r.itemName} approved and forwarded to Asst. Headmaster (Domestic).`); }}>
                    <Text style={styles.actionLink}>Approve &amp; Forward →</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { rejectRequisition(r.id, 'senior_housemaster', recordedBy); Alert.alert('Rejected', `${r.itemName} requisition rejected.`); }}>
                    <Text style={styles.deleteLink}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );

      case 'exeats':
        return (
          <View>
            <CardGrid>
              <StatCard label="Pending" value={pendingExeats.length} accentColor={pendingExeats.length > 0 ? colors.warning : colors.success} />
              <StatCard label="Approved" value={exeats.filter(e => e.status === 'Approved' || e.status === 'Checked Out').length} accentColor={colors.success} />
              <StatCard label="Active" value={exeats.filter(e => e.status === 'Checked Out').length} subtitle="currently out" accentColor={colors.info} />
              <StatCard label="Rejected" value={exeats.filter(e => e.status === 'Rejected').length} accentColor={colors.danger} />
            </CardGrid>

            <Text style={styles.pageTitle}>Exeat Approvals</Text>
            <Text style={styles.pageSubtitle}>Student exeat requests from housemasters — approve to generate a gate pass</Text>

            {pendingExeats.length === 0 && <Text style={styles.emptyText}>No pending exeat requests.</Text>}

            {pendingExeats.map((e) => (
              <View key={e.id} style={[styles.disciplineCard, { borderLeftColor: colors.warning }]}>
                <View style={styles.disciplineHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.disciplineStudent}>{e.studentName} ({e.admissionNo})</Text>
                    <Text style={styles.disciplineMeta}>{e.exeatNo} | {e.house} House | Issued by {e.issuedBy}</Text>
                    <Text style={styles.disciplineMeta}>Reason: {e.reason} — {e.reasonDetail}</Text>
                    <Text style={styles.disciplineMeta}>Destination: {e.destination}</Text>
                    <Text style={styles.disciplineMeta}>Departure: {e.departureDate} | Return: {e.returnDate}</Text>
                    <Text style={styles.disciplineMeta}>Guardian: {e.guardianName} ({e.guardianPhone || 'N/A'}) | Transport: {e.transportMode}</Text>
                  </View>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => { approveExeat(e.id, recordedBy); Alert.alert('Approved', `${e.studentName}'s exeat approved. The housemaster can now print the gate pass.`); }}>
                    <Text style={styles.actionLink}>Approve →</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { rejectExeat(e.id, recordedBy); Alert.alert('Rejected', `${e.studentName}'s exeat request rejected.`); }}>
                    <Text style={styles.deleteLink}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <Text style={styles.sectionTitle}>All Exeats</Text>
            {exeats.filter(e => e.status !== 'Pending').map((e) => (
              <View key={e.id} style={[styles.disciplineCard, { borderLeftColor: e.status === 'Rejected' ? colors.danger : e.status === 'Checked Out' ? colors.info : e.status === 'Checked In' ? colors.success : colors.primaryLight }]}>
                <View style={styles.disciplineHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.disciplineStudent}>{e.studentName} ({e.admissionNo})</Text>
                    <Text style={styles.disciplineMeta}>{e.exeatNo} | {e.house} | {e.date}</Text>
                    <Text style={styles.disciplineMeta}>Departure: {e.departureDate} | Return: {e.returnDate}</Text>
                    {e.approvedBy && <Text style={styles.disciplineMeta}>Approved by: {e.approvedBy} on {e.approvedDate}</Text>}
                    {e.checkedOutAt && <Text style={styles.disciplineMeta}>Checked out: {new Date(e.checkedOutAt).toLocaleString()}</Text>}
                    {e.checkedInAt && <Text style={styles.disciplineMeta}>Checked in: {new Date(e.checkedInAt).toLocaleString()}</Text>}
                  </View>
                  <View style={styles.disciplineBadges}>
                    {renderBadge(e.status, e.status === 'Checked In' ? colors.success : e.status === 'Checked Out' ? colors.info : e.status === 'Rejected' ? colors.danger : colors.primaryLight)}
                  </View>
                </View>
              </View>
            ))}
          </View>
        );

      case 'houses':
        return (
          <View>
            <CardGrid>
              <StatCard label="Houses" value={houses.length} accentColor={colors.primary} />
              <StatCard label="Students" value={totalStudents} accentColor={colors.info} />
              <StatCard label="Rooms" value={totalRooms} accentColor={colors.success} />
              <StatCard label="Capacity" value={houses.reduce((s, h) => s + h.capacity, 0)} accentColor={colors.warning} />
            </CardGrid>
            <Text style={styles.sectionTitle}>All Houses</Text>
            {houses.map((h) => {
              const hStudents = students.filter(s => s.house === h.name);
              const hRooms = rooms.filter(r => r.house === h.name);
              return (
                <View key={h.id} style={[styles.houseCard, { borderLeftColor: colors.primary }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.houseName}>{h.name} House — {h.type}</Text>
                    <Text style={styles.houseMeta}>Housemaster: {h.housemaster} | Phone: {h.phone}</Text>
                    <Text style={styles.houseMeta}>Capacity: {h.occupied}/{h.capacity} | Since: {h.since}</Text>
                    <Text style={styles.houseMeta}>Students: {hStudents.length} | Rooms: {hRooms.length}</Text>
                  </View>
                </View>
              );
            })}
            <Text style={styles.sectionTitle}>All Students</Text>
            {students.map((s) => (
              <View key={s.id} style={styles.studentCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.studentName}>{s.name}</Text>
                  <Text style={styles.studentMeta}>{s.house} | Adm: {s.admNo} | Class: {s.class} | Room: {s.room}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(s.id, 'student', s.name)}><Text style={styles.deleteLink}>Delete</Text></TouchableOpacity>
              </View>
            ))}
          </View>
        );

      case 'rollcall':
        return (
          <View>
            <CardGrid>
              <StatCard label="Present" value={present} accentColor={colors.success} />
              <StatCard label="Absent" value={absent} accentColor={colors.danger} />
              <StatCard label="Excused" value={excused} accentColor={colors.info} />
              <StatCard label="Late" value={late} accentColor={colors.warning} />
            </CardGrid>
            {houses.map((h) => {
              const hRollCalls = todayRollCalls.filter(r => r.house === h.name);
              return (
                <View key={h.id}>
                  <View style={styles.houseRollHeader}>
                    <Text style={styles.houseRollTitle}>{h.name} House ({hRollCalls.length})</Text>
                    {hRollCalls.length === 0 && <TouchableOpacity onPress={() => startRollCall(h.name, recordedBy)}><Text style={styles.actionLink}>Start Roll Call</Text></TouchableOpacity>}
                  </View>
                  {hRollCalls.map((r) => (
                    <View key={r.id} style={styles.rollCallCard}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rollCallName}>{r.studentName}</Text>
                        <Text style={styles.rollCallMeta}>Room: {r.room}{r.notes ? ` | ${r.notes}` : ''}</Text>
                      </View>
                      <View style={styles.rollCallActions}>
                        {ROLL_CALL_STATUSES.map((st) => (
                          <TouchableOpacity key={st} onPress={() => updateRollCallStatus(r.id, st)}>
                            <Text style={[styles.rollCallChip, r.status === st && { color: statusColor(st), fontWeight: fontWeight.bold }]}>{st}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        );

      case 'discipline':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total" value={discipline.length} accentColor={colors.primary} />
              <StatCard label="Escalated" value={escalatedDiscipline.length} accentColor={colors.danger} />
              <StatCard label="Serious+" value={discipline.filter(d => d.severity === 'Serious' || d.severity === 'Critical').length} accentColor={colors.warning} />
              <StatCard label="Resolved" value={discipline.filter(d => d.actionTaken !== 'Pending').length} accentColor={colors.success} />
            </CardGrid>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.danger }]} onPress={() => { setDisciplineForm({ studentName: '', house: houses[0]?.name || '', incident: '', severity: 'Minor', actionTaken: '' }); openModal('discipline'); }}><Text style={styles.actionBtnText}>+ Log Incident</Text></TouchableOpacity>
            <Text style={styles.sectionTitle}>All Discipline Logs</Text>
            {discipline.map((d) => (
              <View key={d.id} style={[styles.disciplineCard, { borderLeftColor: severityColor(d.severity) }]}>
                <View style={styles.disciplineHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.disciplineStudent}>{d.house} — {d.studentName}: {d.incident}</Text>
                    <Text style={styles.disciplineMeta}>{d.date} | By {d.recordedBy}</Text>
                    <Text style={styles.disciplineMeta}>Action: {d.actionTaken}</Text>
                  </View>
                  <View style={styles.disciplineBadges}>
                    {renderBadge(d.severity, severityColor(d.severity))}
                    {d.escalated && renderBadge('Escalated', colors.danger)}
                  </View>
                </View>
                <View style={styles.cardActions}>
                  {!d.escalated && <TouchableOpacity onPress={() => escalateDiscipline(d.id)}><Text style={styles.actionLink}>Escalate →</Text></TouchableOpacity>}
                  <TouchableOpacity onPress={() => handleDelete(d.id, 'discipline', '')}><Text style={styles.deleteLink}>Delete</Text></TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );

      case 'welfare':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total" value={welfare.length} accentColor={colors.primary} />
              <StatCard label="Unresolved" value={unresolvedWelfare.length} accentColor={colors.danger} />
              <StatCard label="Resolved" value={welfare.filter(w => w.resolved).length} accentColor={colors.success} />
              <StatCard label="Students" value={new Set(welfare.map(w => w.studentName)).size} accentColor={colors.info} />
            </CardGrid>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.info }]} onPress={() => { setWelfareForm({ studentName: '', house: houses[0]?.name || '', note: '' }); openModal('welfare'); }}><Text style={styles.actionBtnText}>+ Add Welfare Note</Text></TouchableOpacity>
            <Text style={styles.sectionTitle}>All Welfare Notes</Text>
            {welfare.map((w) => (
              <View key={w.id} style={[styles.welfareCard, { borderLeftColor: w.resolved ? colors.success : colors.warning }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.welfareStudent}>{w.house} — {w.studentName}</Text>
                  <Text style={styles.welfareNote}>{w.note}</Text>
                  <Text style={styles.welfareMeta}>{w.date} | By {w.recordedBy}</Text>
                </View>
                <View style={styles.welfareRight}>
                  {renderBadge(w.resolved ? 'Resolved' : 'Active', w.resolved ? colors.success : colors.warning)}
                  {!w.resolved && <TouchableOpacity onPress={() => resolveWelfare(w.id)}><Text style={styles.actionLink}>Resolve →</Text></TouchableOpacity>}
                  <TouchableOpacity onPress={() => handleDelete(w.id, 'welfare', '')}><Text style={styles.deleteLink}>Delete</Text></TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );

      case 'reports':
        return (
          <View>
            <Text style={styles.pageTitle}>Reports & Analytics</Text>
            <Text style={styles.pageSubtitle}>Cross-house boarding data insights</Text>
            <CardGrid>
              <StatCard label="Students" value={totalStudents} accentColor={colors.primary} />
              <StatCard label="Present" value={present} accentColor={colors.success} />
              <StatCard label="Discipline" value={discipline.length} accentColor={colors.danger} />
              <StatCard label="Welfare" value={welfare.length} accentColor={colors.info} />
            </CardGrid>
            <TouchableOpacity style={styles.pdfFullBtn} onPress={() => generatePDF('full')}><Text style={styles.pdfFullBtnText}>Generate Full Report (PDF)</Text></TouchableOpacity>
            <View style={styles.pdfBtnRow}>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.primary }]} onPress={() => generatePDF('overview')}><Text style={styles.pdfBtnText}>Overview</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.info }]} onPress={() => generatePDF('houses')}><Text style={styles.pdfBtnText}>House Summary</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.success }]} onPress={() => generatePDF('rollcall')}><Text style={styles.pdfBtnText}>Roll Call</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.danger }]} onPress={() => generatePDF('discipline')}><Text style={styles.pdfBtnText}>Discipline</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.warning }]} onPress={() => generatePDF('welfare')}><Text style={styles.pdfBtnText}>Welfare</Text></TouchableOpacity>
            </View>

            <View style={styles.reportHeaderRow}><Text style={styles.sectionTitle}>Roll Call by House</Text><TouchableOpacity onPress={() => generatePDF('rollcall')}><Text style={styles.pdfLink}>PDF</Text></TouchableOpacity></View>
            <View style={styles.reportSectionCard}>
              {houses.map((h) => {
                const hRollCalls = todayRollCalls.filter(r => r.house === h.name);
                const hPresent = hRollCalls.filter(r => r.status === 'Present').length;
                const pct = hRollCalls.length > 0 ? Math.round((hPresent / hRollCalls.length) * 100) : 0;
                return (<View key={h.id} style={styles.reportBarRow}><Text style={styles.reportBarLabel}>{h.name}</Text><View style={styles.reportBarTrack}><View style={[styles.reportBarFill, { width: `${pct}%`, backgroundColor: colors.success }]} /></View><Text style={styles.reportBarCount}>{hPresent}/{hRollCalls.length}</Text></View>);
              })}
            </View>

            <View style={styles.reportHeaderRow}><Text style={styles.sectionTitle}>Discipline by Severity</Text><TouchableOpacity onPress={() => generatePDF('discipline')}><Text style={styles.pdfLink}>PDF</Text></TouchableOpacity></View>
            <View style={styles.reportSectionCard}>
              {DISCIPLINE_SEVERITIES.map((sev) => { const count = discipline.filter(d => d.severity === sev).length; const pct = discipline.length > 0 ? Math.round((count / discipline.length) * 100) : 0; return (
                <View key={sev} style={styles.reportBarRow}><Text style={styles.reportBarLabel}>{sev}</Text><View style={styles.reportBarTrack}><View style={[styles.reportBarFill, { width: `${pct}%`, backgroundColor: severityColor(sev) }]} /></View><Text style={styles.reportBarCount}>{count}</Text></View>
              ); })}
            </View>

            <View style={styles.reportHeaderRow}><Text style={styles.sectionTitle}>Discipline by House</Text></View>
            <View style={styles.reportSectionCard}>
              {houses.map((h) => { const count = discipline.filter(d => d.house === h.name).length; const pct = discipline.length > 0 ? Math.round((count / discipline.length) * 100) : 0; return (
                <View key={h.id} style={styles.reportBarRow}><Text style={styles.reportBarLabel}>{h.name}</Text><View style={styles.reportBarTrack}><View style={[styles.reportBarFill, { width: `${pct}%`, backgroundColor: colors.danger }]} /></View><Text style={styles.reportBarCount}>{count}</Text></View>
              ); })}
            </View>

            <View style={styles.reportHeaderRow}><Text style={styles.sectionTitle}>Welfare by House</Text><TouchableOpacity onPress={() => generatePDF('welfare')}><Text style={styles.pdfLink}>PDF</Text></TouchableOpacity></View>
            <View style={styles.reportSectionCard}>
              {houses.map((h) => { const count = welfare.filter(w => w.house === h.name).length; const pct = welfare.length > 0 ? Math.round((count / welfare.length) * 100) : 0; return (
                <View key={h.id} style={styles.reportBarRow}><Text style={styles.reportBarLabel}>{h.name}</Text><View style={styles.reportBarTrack}><View style={[styles.reportBarFill, { width: `${pct}%`, backgroundColor: colors.warning }]} /></View><Text style={styles.reportBarCount}>{count}</Text></View>
              ); })}
            </View>
          </View>
        );

      default: return null;
    }
  };

  const renderModal = () => {
    const titles: Record<string, string> = { student: 'Add Student', room: 'Add Room', discipline: 'Log Discipline Incident', welfare: 'Add Welfare Note', assignment: 'Assign Housemaster' };
    return (
      <Modal visible={showModal} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}><ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.modalTitle}>{titles[modalType] || ''}</Text>

          {modalType === 'student' && (
            <View>
              <Text style={styles.inputLabel}>Admission Number *</Text>
              <TextInput style={styles.input} placeholder="e.g. 2026/001" placeholderTextColor={colors.textLight} value={studentForm.admNo} onChangeText={(v) => setStudentForm({ ...studentForm, admNo: v })} />
              <Text style={styles.inputLabel}>Student Name *</Text>
              <TextInput style={styles.input} placeholder="Full name" placeholderTextColor={colors.textLight} value={studentForm.name} onChangeText={(v) => setStudentForm({ ...studentForm, name: v })} />
              {renderSelect('House', studentForm.house, houses.map(h => h.name), (v) => setStudentForm({ ...studentForm, house: v }))}
              <Text style={styles.inputLabel}>Class</Text>
              <TextInput style={styles.input} placeholder="e.g. SHS2 Sci A" placeholderTextColor={colors.textLight} value={studentForm.class} onChangeText={(v) => setStudentForm({ ...studentForm, class: v })} />
              <Text style={styles.inputLabel}>Room</Text>
              <TextInput style={styles.input} placeholder="e.g. A-12" placeholderTextColor={colors.textLight} value={studentForm.room} onChangeText={(v) => setStudentForm({ ...studentForm, room: v })} />
              <Text style={styles.inputLabel}>Bed</Text>
              <TextInput style={styles.input} placeholder="e.g. 1" placeholderTextColor={colors.textLight} value={studentForm.bed} onChangeText={(v) => setStudentForm({ ...studentForm, bed: v })} />
            </View>
          )}

          {modalType === 'room' && (
            <View>
              {renderSelect('House', roomForm.house, houses.map(h => h.name), (v) => setRoomForm({ ...roomForm, house: v }))}
              <Text style={styles.inputLabel}>Room Number *</Text>
              <TextInput style={styles.input} placeholder="e.g. A-12" placeholderTextColor={colors.textLight} value={roomForm.room} onChangeText={(v) => setRoomForm({ ...roomForm, room: v })} />
              <Text style={styles.inputLabel}>Beds</Text>
              <TextInput style={styles.input} placeholder="4" placeholderTextColor={colors.textLight} value={roomForm.beds} onChangeText={(v) => setRoomForm({ ...roomForm, beds: v })} keyboardType="numeric" />
              <Text style={styles.inputLabel}>Student Names (comma-separated)</Text>
              <TextInput style={[styles.input, styles.textArea]} placeholder="K. Asante, Y. Mensah" placeholderTextColor={colors.textLight} value={roomForm.studentNames} onChangeText={(v) => setRoomForm({ ...roomForm, studentNames: v })} multiline />
            </View>
          )}

          {modalType === 'discipline' && (
            <View>
              {renderSelect('House', disciplineForm.house, houses.map(h => h.name), (v) => setDisciplineForm({ ...disciplineForm, house: v }))}
              <Text style={styles.inputLabel}>Student Name *</Text>
              <TextInput style={styles.input} placeholder="Student name" placeholderTextColor={colors.textLight} value={disciplineForm.studentName} onChangeText={(v) => setDisciplineForm({ ...disciplineForm, studentName: v })} />
              <Text style={styles.inputLabel}>Incident *</Text>
              <TextInput style={styles.input} placeholder="e.g. Bullying" placeholderTextColor={colors.textLight} value={disciplineForm.incident} onChangeText={(v) => setDisciplineForm({ ...disciplineForm, incident: v })} />
              {renderSelect('Severity', disciplineForm.severity, DISCIPLINE_SEVERITIES, (v) => setDisciplineForm({ ...disciplineForm, severity: v as DisciplineSeverity }))}
              <Text style={styles.inputLabel}>Action Taken</Text>
              <TextInput style={styles.input} placeholder="e.g. Warning given" placeholderTextColor={colors.textLight} value={disciplineForm.actionTaken} onChangeText={(v) => setDisciplineForm({ ...disciplineForm, actionTaken: v })} />
            </View>
          )}

          {modalType === 'welfare' && (
            <View>
              {renderSelect('House', welfareForm.house, houses.map(h => h.name), (v) => setWelfareForm({ ...welfareForm, house: v }))}
              <Text style={styles.inputLabel}>Student Name *</Text>
              <TextInput style={styles.input} placeholder="Student name" placeholderTextColor={colors.textLight} value={welfareForm.studentName} onChangeText={(v) => setWelfareForm({ ...welfareForm, studentName: v })} />
              <Text style={styles.inputLabel}>Note *</Text>
              <TextInput style={[styles.input, styles.textArea]} placeholder="Welfare observation" placeholderTextColor={colors.textLight} value={welfareForm.note} onChangeText={(v) => setWelfareForm({ ...welfareForm, note: v })} multiline />
            </View>
          )}

          {modalType === 'assignment' && (
            <View>
              {renderSelect('House', houses.find(h => h.id === assignForm.houseId)?.name ?? houses[0]?.name ?? '', houses.map(h => h.name), (v) => { const h = houses.find(hh => hh.name === v); if (h) setAssignForm({ ...assignForm, houseId: h.id }); })}
              <Text style={styles.inputLabel}>Housemaster Name *</Text>
              <TextInput style={styles.input} placeholder="e.g. Mr. Owusu" placeholderTextColor={colors.textLight} value={assignForm.housemasterName} onChangeText={(v) => setAssignForm({ ...assignForm, housemasterName: v })} />
              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput style={styles.input} placeholder="e.g. 024-111-2222" placeholderTextColor={colors.textLight} value={assignForm.phone} onChangeText={(v) => setAssignForm({ ...assignForm, phone: v })} />
              <View style={styles.assignHintCard}><Text style={styles.assignHintText}>The housemaster will see this house's dashboard when they log in with the Housemaster/Housemistress role and their display name matches the name entered above.</Text></View>
            </View>
          )}

          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={closeModal}><Text style={styles.modalBtnTextDark}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={() => { if (modalType === 'student') handleSaveStudent(); else if (modalType === 'room') handleSaveRoom(); else if (modalType === 'discipline') handleSaveDiscipline(); else if (modalType === 'welfare') handleSaveWelfare(); else if (modalType === 'assignment') handleSaveAssignment(); }}><Text style={styles.modalBtnTextLight}>Save</Text></TouchableOpacity>
          </View>
        </ScrollView></View></View>
      </Modal>
    );
  };

  return (
    <DashboardLayout title="Senior Housemaster" navItems={NAV_ITEMS} activeKey={activePage} onNavigate={setActivePage}
      headerRight={<TouchableOpacity onPress={logout} style={styles.logoutBtn}><Text style={styles.logoutText}>Logout</Text></TouchableOpacity>}>
      {renderPage()}{renderModal()}
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
  pageSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  emptyText: { fontSize: fontSize.md, color: colors.textLight, textAlign: 'center', paddingVertical: spacing.xl },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.md },
  actionBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm + 4, alignItems: 'center', marginBottom: spacing.lg },
  actionBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  logoutBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  logoutText: { color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.medium },

  assignInfoCard: { backgroundColor: colors.infoBg, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg, borderLeftWidth: 4, borderLeftColor: colors.info },
  assignInfoText: { fontSize: fontSize.sm, color: colors.info, lineHeight: 20 },
  assignHintCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, padding: spacing.sm, marginTop: spacing.sm },
  assignHintText: { fontSize: fontSize.xs, color: colors.textSecondary, lineHeight: 18 },

  alertCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg, borderLeftWidth: 4 },
  alertTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, marginBottom: spacing.xs },
  alertText: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs },

  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  quickBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, marginBottom: spacing.sm },
  quickBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },

  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  statusText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },

  houseCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm, borderLeftWidth: 4, borderLeftColor: colors.primary },
  houseName: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  houseMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },

  houseRollHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md, marginBottom: spacing.sm },
  houseRollTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.primary },

  studentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  studentName: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  studentMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },

  rollCallCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  rollCallName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  rollCallMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  rollCallActions: { flexDirection: 'row', gap: spacing.sm },
  rollCallChip: { fontSize: fontSize.xs, color: colors.textLight, paddingHorizontal: spacing.xs },

  disciplineCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm, borderLeftWidth: 4 },
  disciplineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  disciplineStudent: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  disciplineMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  disciplineBadges: { flexDirection: 'column', alignItems: 'flex-end', gap: 4 },

  welfareCard: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm, borderLeftWidth: 4 },
  welfareStudent: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  welfareNote: { fontSize: fontSize.sm, color: colors.text, marginTop: spacing.xs },
  welfareMeta: { fontSize: fontSize.xs, color: colors.textLight, marginTop: spacing.xs },
  welfareRight: { alignItems: 'flex-end', gap: 6 },

  cardActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm, flexWrap: 'wrap' },
  actionLink: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.primary },
  deleteLink: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.danger },

  reportHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pdfLink: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.danger, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, backgroundColor: colors.danger + '15', borderRadius: radius.sm },
  pdfFullBtn: { backgroundColor: colors.danger, borderRadius: radius.md, paddingVertical: spacing.sm + 4, alignItems: 'center', marginBottom: spacing.md },
  pdfFullBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.bold },
  pdfBtnRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  pdfBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, marginBottom: spacing.xs },
  pdfBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  reportSectionCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  reportBarRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  reportBarLabel: { fontSize: fontSize.sm, color: colors.textSecondary, width: 120 },
  reportBarTrack: { flex: 1, height: 8, backgroundColor: colors.surfaceAlt, borderRadius: 4 },
  reportBarFill: { height: 8, borderRadius: 4 },
  reportBarCount: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.text, width: 50, textAlign: 'right' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  modalContent: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, width: '100%', maxWidth: 500 },
  modalTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.md },
  inputLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xs },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md, color: colors.text, marginBottom: spacing.sm },
  textArea: { minHeight: 60, textAlignVertical: 'top' },
  selectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  selectChip: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  selectChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  selectChipText: { fontSize: fontSize.xs, color: colors.textSecondary },
  selectChipTextActive: { color: colors.white, fontWeight: fontWeight.semibold },
  modalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  modalBtn: { flex: 1, borderRadius: radius.md, paddingVertical: spacing.sm + 2, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  modalBtnSubmit: { backgroundColor: colors.primary },
  modalBtnTextDark: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  modalBtnTextLight: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.white },
});
