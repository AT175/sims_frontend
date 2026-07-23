import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useAuthStore } from '@store/authStore';
import { KitchenMenuWidget } from '@components/index';
import {
  useBoardingStore,
  ROLL_CALL_STATUSES, DISCIPLINE_SEVERITIES,
} from '@store/boardingStore';
import type {
  DisciplineSeverity,
} from '@store/boardingStore';
import { useRequisitionStore } from '@store/requisitionStore';
import { RequisitionModal } from '@components/RequisitionModal';
import { useExeatStore, EXEAT_REASONS, TRANSPORT_MODES } from '@store/exeatStore';
import type { ExeatReason } from '@store/exeatStore';

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'roster', label: 'House Roster' },
  { key: 'rooms', label: 'Room Allocation' },
  { key: 'rollcall', label: 'Roll Call' },
  { key: 'discipline', label: 'Discipline Log' },
  { key: 'welfare', label: 'Welfare Check' },
  { key: 'exeats', label: 'Exeats' },
  { key: 'requisitions', label: 'Requisitions' },
  { key: 'menu', label: "Today's Menu" },
  { key: 'reports', label: 'Reports' },
];

const todayStr = () => new Date().toISOString().slice(0, 10);

export function HouseDashboard() {
  const [activePage, setActivePage] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [showReqModal, setShowReqModal] = useState(false);
  const { user, logout } = useAuthStore();
  const recordedBy = user?.displayName ?? 'Housemaster';

  const {
    houses,
    addStudent, deleteStudent, getStudentsByHouse,
    addRoom, deleteRoom, getRoomsByHouse,
    updateRollCallStatus, deleteRollCall, getTodayRollCalls, startRollCall,
    addDiscipline, deleteDiscipline, getDisciplineByHouse, escalateDiscipline,
    addWelfare, deleteWelfare, getWelfareByHouse, resolveWelfare,
    getHouseByHousemaster,
  } = useBoardingStore();

  const {
    getByHouse, getPendingHouse, receiveByHouse, deleteRequisition,
  } = useRequisitionStore();

  const {
    getByHouse: getExeatsByHouse, createExeat, deleteExeat,
  } = useExeatStore();

  // Determine assigned house based on logged-in user's display name
  const assignedHouse = getHouseByHousemaster(user?.displayName ?? '');
  const HOUSE_NAME = assignedHouse?.name ?? houses[0]?.name ?? 'Unassigned';

  const houseStudents = getStudentsByHouse(HOUSE_NAME);
  const houseRooms = getRoomsByHouse(HOUSE_NAME);
  const todayRollCalls = getTodayRollCalls(HOUSE_NAME);
  const houseDiscipline = getDisciplineByHouse(HOUSE_NAME);
  const houseWelfare = getWelfareByHouse(HOUSE_NAME);
  const houseRequisitions = getByHouse(HOUSE_NAME);
  const pendingReceipts = getPendingHouse(HOUSE_NAME);
  const houseExeats = getExeatsByHouse(HOUSE_NAME);

  const [studentForm, setStudentForm] = useState({ admNo: '', name: '', class: '', room: '', bed: '' });
  const [roomForm, setRoomForm] = useState({ room: '', beds: '4', studentNames: '' });
  const [disciplineForm, setDisciplineForm] = useState({ studentName: '', incident: '', severity: 'Minor' as DisciplineSeverity, actionTaken: '' });
  const [welfareForm, setWelfareForm] = useState({ studentName: '', note: '' });
  const [exeatForm, setExeatForm] = useState({
    studentName: '', admissionNo: '', class: '', reason: 'Medical' as ExeatReason, reasonDetail: '',
    destination: '', departureDate: todayStr(), returnDate: todayStr(),
    guardianName: '', guardianPhone: '', transportMode: 'Private Car',
  });

  const openModal = (type: string) => { setModalType(type); setShowModal(true); };
  const closeModal = () => { setShowModal(false); };

  const handleSaveStudent = () => {
    if (!studentForm.name.trim() || !studentForm.admNo.trim()) { Alert.alert('Error', 'Name and admission number are required'); return; }
    addStudent({ admNo: studentForm.admNo.trim(), name: studentForm.name.trim(), class: studentForm.class.trim(), house: HOUSE_NAME, room: studentForm.room.trim(), bed: studentForm.bed.trim() || undefined });
    setStudentForm({ admNo: '', name: '', class: '', room: '', bed: '' });
    closeModal();
  };

  const handleSaveRoom = () => {
    if (!roomForm.room.trim()) { Alert.alert('Error', 'Room number is required'); return; }
    const names = roomForm.studentNames.split(',').map((s) => s.trim()).filter(Boolean);
    addRoom({ house: HOUSE_NAME, room: roomForm.room.trim(), beds: parseInt(roomForm.beds) || 4, occupied: names.length, studentNames: names });
    setRoomForm({ room: '', beds: '4', studentNames: '' });
    closeModal();
  };

  const handleSaveDiscipline = () => {
    if (!disciplineForm.studentName.trim() || !disciplineForm.incident.trim()) { Alert.alert('Error', 'Student name and incident are required'); return; }
    addDiscipline({ date: todayStr(), house: HOUSE_NAME, studentName: disciplineForm.studentName.trim(), incident: disciplineForm.incident.trim(), severity: disciplineForm.severity, actionTaken: disciplineForm.actionTaken.trim() || 'Pending', recordedBy, escalated: false });
    setDisciplineForm({ studentName: '', incident: '', severity: 'Minor', actionTaken: '' });
    closeModal();
  };

  const handleSaveWelfare = () => {
    if (!welfareForm.studentName.trim() || !welfareForm.note.trim()) { Alert.alert('Error', 'Student name and note are required'); return; }
    addWelfare({ date: todayStr(), house: HOUSE_NAME, studentName: welfareForm.studentName.trim(), note: welfareForm.note.trim(), recordedBy, resolved: false });
    setWelfareForm({ studentName: '', note: '' });
    closeModal();
  };

  const handleSaveExeat = () => {
    if (!exeatForm.studentName.trim() || !exeatForm.admissionNo.trim()) { Alert.alert('Error', 'Student name and admission number are required'); return; }
    if (!exeatForm.destination.trim()) { Alert.alert('Error', 'Destination is required'); return; }
    if (!exeatForm.guardianName.trim()) { Alert.alert('Error', 'Guardian name is required'); return; }
    createExeat({
      studentName: exeatForm.studentName.trim(), admissionNo: exeatForm.admissionNo.trim(),
      house: HOUSE_NAME, class: exeatForm.class.trim(),
      reason: exeatForm.reason, reasonDetail: exeatForm.reasonDetail.trim(),
      destination: exeatForm.destination.trim(), departureDate: exeatForm.departureDate, returnDate: exeatForm.returnDate,
      guardianName: exeatForm.guardianName.trim(), guardianPhone: exeatForm.guardianPhone.trim(),
      transportMode: exeatForm.transportMode, issuedBy: recordedBy,
    });
    setExeatForm({ studentName: '', admissionNo: '', class: '', reason: 'Medical', reasonDetail: '', destination: '', departureDate: todayStr(), returnDate: todayStr(), guardianName: '', guardianPhone: '', transportMode: 'Private Car' });
    closeModal();
    Alert.alert('Exeat Issued', 'Exeat request submitted for Senior Housemaster approval. The student will receive a pass once approved.');
  };

  const generateExeatPass = (exeatId: string) => {
    const exeat = houseExeats.find(e => e.id === exeatId);
    if (!exeat) return;
    if (exeat.status !== 'Approved' && exeat.status !== 'Checked Out') { Alert.alert('Cannot Print', 'Exeat must be approved before printing a pass.'); return; }
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Exeat Pass — ${exeat.exeatNo}</title>
      <style>*{font-family:'Segoe UI',Arial,sans-serif}body{padding:30px;color:#1A1A2E;max-width:650px;margin:0 auto}
      .header{text-align:center;border-bottom:3px solid #0F4C75;padding-bottom:15px;margin-bottom:20px}
      .school-name{font-size:20px;font-weight:bold;color:#0F4C75}
      .pass-title{font-size:28px;font-weight:bold;color:#0F4C75;margin:15px 0}
      .pass-no{font-size:14px;color:#888;text-align:right;margin-bottom:15px}
      .student-info{background:#F7F8FA;border-radius:10px;padding:20px;margin-bottom:20px}
      .info-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #E4E7EC}
      .info-label{font-weight:600;color:#5C6370;font-size:13px}
      .info-value{font-size:14px;color:#1A1A2E;font-weight:500}
      .reason-box{background:#FEF6E7;border-left:4px solid #F59E0B;padding:15px;margin-bottom:20px}
      .reason-title{font-weight:bold;font-size:13px;color:#F59E0B;margin-bottom:5px}
      .reason-text{font-size:14px;color:#1A1A2E}
      .qr-placeholder{text-align:center;margin:20px 0}
      .qr-box{display:inline-block;border:2px dashed #0F4C75;padding:30px 40px;border-radius:8px}
      .qr-text{font-size:12px;color:#888;margin-top:8px}
      .signatures{display:flex;justify-content:space-between;margin-top:40px}
      .sig-block{text-align:center;width:45%}
      .sig-line{border-top:1px solid #333;margin-top:40px;padding-top:5px;font-size:12px;color:#5C6370}
      .status-stamp{display:inline-block;padding:8px 20px;border:2px solid #0BA37A;color:#0BA37A;font-weight:bold;font-size:16px;border-radius:4px;transform:rotate(-3deg);margin:10px 0}
      .footer{margin-top:30px;padding-top:15px;border-top:1px solid #ddd;font-size:11px;color:#aaa;text-align:center}
      @media print{body{padding:15px}}</style></head><body>
      <div class="header"><div class="school-name">SIMS — Senior High School</div><div style="font-size:12px;color:#888">Boarding Exeat Permission Pass</div></div>
      <div class="pass-no">Exeat No: ${exeat.exeatNo}</div>
      <div style="text-align:center"><div class="pass-title">STUDENT EXEAT PASS</div><div class="status-stamp">${exeat.status === 'Checked Out' ? 'CHECKED OUT' : 'APPROVED'}</div></div>
      <div class="student-info">
        <div class="info-row"><span class="info-label">Student Name</span><span class="info-value">${exeat.studentName}</span></div>
        <div class="info-row"><span class="info-label">Admission No.</span><span class="info-value">${exeat.admissionNo}</span></div>
        <div class="info-row"><span class="info-label">House</span><span class="info-value">${exeat.house}</span></div>
        <div class="info-row"><span class="info-label">Class</span><span class="info-value">${exeat.class || '-'}</span></div>
        <div class="info-row"><span class="info-label">Destination</span><span class="info-value">${exeat.destination}</span></div>
        <div class="info-row"><span class="info-label">Departure Date</span><span class="info-value">${exeat.departureDate}</span></div>
        <div class="info-row"><span class="info-label">Expected Return</span><span class="info-value">${exeat.returnDate}</span></div>
        <div class="info-row"><span class="info-label">Transport Mode</span><span class="info-value">${exeat.transportMode}</span></div>
        <div class="info-row"><span class="info-label">Guardian</span><span class="info-value">${exeat.guardianName} (${exeat.guardianPhone || 'N/A'})</span></div>
      </div>
      <div class="reason-box"><div class="reason-title">REASON FOR EXEAT</div><div class="reason-text"><strong>${exeat.reason}:</strong> ${exeat.reasonDetail || 'N/A'}</div></div>
      <div class="qr-placeholder"><div class="qr-box"><div style="font-size:40px">📋</div></div><div class="qr-text">Exeat No: ${exeat.exeatNo}</div></div>
      <div class="signatures">
        <div class="sig-block"><div class="sig-line">Housemaster: ${exeat.issuedBy}</div></div>
        <div class="sig-block"><div class="sig-line">Senior Housemaster: ${exeat.approvedBy || 'Pending'}</div></div>
      </div>
      <div class="footer">SIMS — Exeat Pass — Issued: ${exeat.date} | Approved: ${exeat.approvedDate || 'N/A'} | This pass must be presented at the gate for verification.</div>
      <script>window.onload=function(){window.print()}</script></body></html>`;
    const printWin = window.open('', '_blank');
    if (printWin) { printWin.document.write(html); printWin.document.close(); }
    else { Alert.alert('Popup Blocked', 'Please allow popups to print the exeat pass.'); }
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
        else if (type === 'exeat') deleteExeat(id);
      } },
    ]);

  // ── Computed ──
  const present = todayRollCalls.filter(r => r.status === 'Present').length;
  const absent = todayRollCalls.filter(r => r.status === 'Absent').length;
  const excused = todayRollCalls.filter(r => r.status === 'Excused').length;
  const late = todayRollCalls.filter(r => r.status === 'Late').length;
  const unresolvedWelfare = houseWelfare.filter(w => !w.resolved);
  const escalatedDiscipline = houseDiscipline.filter(d => d.escalated);

  const statusColor = (s: string) =>
    s === 'Present' ? colors.success :
    s === 'Absent' ? colors.danger :
    s === 'Excused' ? colors.info :
    s === 'Late' ? colors.warning :
    s === 'Minor' ? colors.textSecondary :
    s === 'Moderate' ? colors.warning :
    s === 'Serious' ? colors.danger :
    s === 'Critical' ? colors.danger : colors.primary;

  const severityColor = (s: DisciplineSeverity) =>
    s === 'Critical' ? colors.danger : s === 'Serious' ? colors.danger : s === 'Moderate' ? colors.warning : colors.textSecondary;

  const reqStatusColor = (s: string) =>
    s === 'Received' ? colors.success :
    s === 'Issued' ? colors.info :
    s === 'Domestic Approved' ? colors.purple :
    s === 'Senior Housemaster Approved' ? colors.primaryLight :
    s === 'Rejected' ? colors.danger :
    s === 'Pending' ? colors.warning : colors.textSecondary;

  const exeatStatusColor = (s: string) =>
    s === 'Checked In' ? colors.success :
    s === 'Checked Out' ? colors.info :
    s === 'Approved' ? colors.primaryLight :
    s === 'Rejected' ? colors.danger :
    s === 'Expired' ? colors.textSecondary :
    s === 'Pending' ? colors.warning : colors.primary;

  // ── PDF Generation ──
  const generatePDF = (reportType: string) => {
    const now = new Date().toLocaleString();
    let body = '';
    let title = '';

    if (reportType === 'full' || reportType === 'overview') {
      title = `${HOUSE_NAME} House — Activity Summary`;
      body += `<h2>Overview</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px">
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Total Students</td><td style="padding:8px 12px;border:1px solid #ddd">${houseStudents.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Rooms</td><td style="padding:8px 12px;border:1px solid #ddd">${houseRooms.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Present Today</td><td style="padding:8px 12px;border:1px solid #ddd">${present}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Absent</td><td style="padding:8px 12px;border:1px solid #ddd">${absent}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Excused</td><td style="padding:8px 12px;border:1px solid #ddd">${excused}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Late</td><td style="padding:8px 12px;border:1px solid #ddd">${late}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Discipline Incidents</td><td style="padding:8px 12px;border:1px solid #ddd">${houseDiscipline.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Welfare Notes (Unresolved)</td><td style="padding:8px 12px;border:1px solid #ddd">${unresolvedWelfare.length}</td></tr>
      </table>`;
    }

    if (reportType === 'full' || reportType === 'roster') {
      title = reportType === 'full' ? title : `${HOUSE_NAME} House — Student Roster`;
      body += `<h2>Student Roster</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Adm No</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Name</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Class</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Room</th><th style="padding:6px 8px;border:1px solid #ddd">Bed</th>
      </tr></thead><tbody>`;
      houseStudents.forEach(s => { body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${s.admNo}</td><td style="padding:4px 8px;border:1px solid #ddd">${s.name}</td><td style="padding:4px 8px;border:1px solid #ddd">${s.class}</td><td style="padding:4px 8px;border:1px solid #ddd">${s.room}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${s.bed || '-'}</td></tr>`; });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'rollcall') {
      title = reportType === 'full' ? title : `${HOUSE_NAME} House — Roll Call (${todayStr()})`;
      body += `<h2>Roll Call — ${todayStr()}</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Student</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Room</th><th style="padding:6px 8px;border:1px solid #ddd">Status</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Notes</th>
      </tr></thead><tbody>`;
      todayRollCalls.forEach(r => { body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${r.studentName}</td><td style="padding:4px 8px;border:1px solid #ddd">${r.room}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${r.status}</td><td style="padding:4px 8px;border:1px solid #ddd">${r.notes || '-'}</td></tr>`; });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'discipline') {
      title = reportType === 'full' ? title : `${HOUSE_NAME} House — Discipline Log`;
      body += `<h2>Discipline Log</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Date</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Student</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Incident</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Severity</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Action</th><th style="padding:6px 8px;border:1px solid #ddd">Escalated</th>
      </tr></thead><tbody>`;
      houseDiscipline.forEach(d => { body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${d.date}</td><td style="padding:4px 8px;border:1px solid #ddd">${d.studentName}</td><td style="padding:4px 8px;border:1px solid #ddd">${d.incident}</td><td style="padding:4px 8px;border:1px solid #ddd">${d.severity}</td><td style="padding:4px 8px;border:1px solid #ddd">${d.actionTaken}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${d.escalated ? 'Yes' : 'No'}</td></tr>`; });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'welfare') {
      title = reportType === 'full' ? `${HOUSE_NAME} House — Comprehensive Report` : `${HOUSE_NAME} House — Welfare Notes`;
      body += `<h2>Welfare Notes</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Date</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Student</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Note</th><th style="padding:6px 8px;border:1px solid #ddd;text-align:left">By</th><th style="padding:6px 8px;border:1px solid #ddd">Resolved</th>
      </tr></thead><tbody>`;
      houseWelfare.forEach(w => { body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${w.date}</td><td style="padding:4px 8px;border:1px solid #ddd">${w.studentName}</td><td style="padding:4px 8px;border:1px solid #ddd">${w.note}</td><td style="padding:4px 8px;border:1px solid #ddd">${w.recordedBy}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${w.resolved ? 'Yes' : 'No'}</td></tr>`; });
      body += `</tbody></table>`;
    }

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
      <style>*{font-family:'Segoe UI',Arial,sans-serif}body{padding:40px;color:#1A1A2E;max-width:900px;margin:0 auto}h1{color:#0F4C75;border-bottom:3px solid #0F4C75;padding-bottom:10px}h2{color:#2D3142;margin-top:30px}.header{display:flex;justify-content:space-between;margin-bottom:20px;font-size:12px;color:#888}.confidential{background:#FDECEC;border-left:4px solid #E5484D;padding:10px 15px;margin:15px 0;font-size:13px;color:#991111}table{font-size:13px}th{font-weight:600}.footer{margin-top:40px;padding-top:15px;border-top:1px solid #ddd;font-size:11px;color:#aaa;text-align:center}@media print{body{padding:20px}}</style></head><body>
      <div class="header"><span>SIMS — ${HOUSE_NAME} House</span><span>Generated: ${now}</span></div>
      <h1>${title}</h1><div class="confidential">BOARDING CONFIDENTIAL — Contains student welfare and discipline data. Restricted to authorised house staff and administration.</div>${body}
      <div class="footer">SIMS — ${HOUSE_NAME} House Report — ${todayStr()}</div>
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
              <StatCard label="Students" value={houseStudents.length} accentColor={colors.primary} />
              <StatCard label="Present Today" value={present} subtitle={`${absent} absent`} accentColor={colors.success} />
              <StatCard label="Discipline" value={houseDiscipline.length} subtitle={`${escalatedDiscipline.length} escalated`} accentColor={houseDiscipline.length > 0 ? colors.warning : colors.success} />
              <StatCard label="Welfare" value={unresolvedWelfare.length} subtitle="unresolved" accentColor={unresolvedWelfare.length > 0 ? colors.danger : colors.success} />
            </CardGrid>

            {unresolvedWelfare.length > 0 && (
              <View style={[styles.alertCard, { borderLeftColor: colors.danger }]}>
                <Text style={[styles.alertTitle, { color: colors.danger }]}>Unresolved Welfare Notes ({unresolvedWelfare.length})</Text>
                {unresolvedWelfare.map((w) => (<Text key={w.id} style={styles.alertText}>{w.studentName} — {w.note.slice(0, 60)}{w.note.length > 60 ? '...' : ''}</Text>))}
              </View>
            )}

            {escalatedDiscipline.length > 0 && (
              <View style={[styles.alertCard, { borderLeftColor: colors.warning }]}>
                <Text style={[styles.alertTitle, { color: colors.warning }]}>Escalated Discipline ({escalatedDiscipline.length})</Text>
                {escalatedDiscipline.map((d) => (<Text key={d.id} style={styles.alertText}>{d.studentName} — {d.incident} ({d.severity})</Text>))}
              </View>
            )}

            {absent > 0 && (
              <View style={[styles.alertCard, { borderLeftColor: colors.danger }]}>
                <Text style={[styles.alertTitle, { color: colors.danger }]}>Absent Today ({absent})</Text>
                {todayRollCalls.filter(r => r.status === 'Absent').map((r) => (<Text key={r.id} style={styles.alertText}>{r.studentName} — Room {r.room}</Text>))}
              </View>
            )}

            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.primary }]} onPress={() => { startRollCall(HOUSE_NAME, recordedBy); setActivePage('rollcall'); }}><Text style={styles.quickBtnText}>Start Roll Call</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.danger }]} onPress={() => { setDisciplineForm({ studentName: '', incident: '', severity: 'Minor', actionTaken: '' }); openModal('discipline'); }}><Text style={styles.quickBtnText}>+ Log Incident</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.info }]} onPress={() => { setWelfareForm({ studentName: '', note: '' }); openModal('welfare'); }}><Text style={styles.quickBtnText}>+ Welfare Note</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.success }]} onPress={() => { setStudentForm({ admNo: '', name: '', class: '', room: '', bed: '' }); openModal('student'); }}><Text style={styles.quickBtnText}>+ Add Student</Text></TouchableOpacity>
            </View>
          </View>
        );

      case 'roster':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total" value={houseStudents.length} accentColor={colors.primary} />
              <StatCard label="Rooms" value={houseRooms.length} accentColor={colors.info} />
              <StatCard label="Beds" value={houseRooms.reduce((s, r) => s + r.beds, 0)} accentColor={colors.success} />
              <StatCard label="Occupied" value={houseRooms.reduce((s, r) => s + r.occupied, 0)} accentColor={colors.warning} />
            </CardGrid>
            <TouchableOpacity style={styles.actionBtn} onPress={() => { setStudentForm({ admNo: '', name: '', class: '', room: '', bed: '' }); openModal('student'); }}><Text style={styles.actionBtnText}>+ Add Student</Text></TouchableOpacity>
            <Text style={styles.sectionTitle}>House Roster ({houseStudents.length})</Text>
            {houseStudents.map((s) => (
              <View key={s.id} style={styles.studentCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.studentName}>{s.name}</Text>
                  <Text style={styles.studentMeta}>Adm: {s.admNo} | Class: {s.class}</Text>
                  <Text style={styles.studentMeta}>Room: {s.room}{s.bed ? ` | Bed: ${s.bed}` : ''}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(s.id, 'student', s.name)}><Text style={styles.deleteLink}>Delete</Text></TouchableOpacity>
              </View>
            ))}
          </View>
        );

      case 'rooms':
        return (
          <View>
            <CardGrid>
              <StatCard label="Rooms" value={houseRooms.length} accentColor={colors.primary} />
              <StatCard label="Total Beds" value={houseRooms.reduce((s, r) => s + r.beds, 0)} accentColor={colors.info} />
              <StatCard label="Occupied" value={houseRooms.reduce((s, r) => s + r.occupied, 0)} accentColor={colors.warning} />
              <StatCard label="Vacant" value={houseRooms.reduce((s, r) => s + (r.beds - r.occupied), 0)} accentColor={colors.success} />
            </CardGrid>
            <TouchableOpacity style={styles.actionBtn} onPress={() => { setRoomForm({ room: '', beds: '4', studentNames: '' }); openModal('room'); }}><Text style={styles.actionBtnText}>+ Add Room</Text></TouchableOpacity>
            <Text style={styles.sectionTitle}>Room Allocation</Text>
            {houseRooms.map((r) => (
              <View key={r.id} style={styles.roomCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.roomTitle}>Room {r.room}</Text>
                  <Text style={styles.roomMeta}>{r.occupied}/{r.beds} beds occupied</Text>
                  {r.studentNames.map((n, i) => (<Text key={i} style={styles.roomStudent}>• {n}</Text>))}
                </View>
                <View style={styles.roomRight}>
                  {renderBadge(`${r.beds - r.occupied} vacant`, r.beds - r.occupied === 0 ? colors.danger : colors.success)}
                  <TouchableOpacity onPress={() => handleDelete(r.id, 'room', r.room)}><Text style={styles.deleteLink}>Delete</Text></TouchableOpacity>
                </View>
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
            {todayRollCalls.length === 0 ? (
              <TouchableOpacity style={styles.actionBtn} onPress={() => startRollCall(HOUSE_NAME, recordedBy)}><Text style={styles.actionBtnText}>Start Roll Call</Text></TouchableOpacity>
            ) : (
              <Text style={styles.sectionTitle}>Roll Call — {todayStr()} ({todayRollCalls.length})</Text>
            )}
            {todayRollCalls.map((r) => (
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

      case 'discipline':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total" value={houseDiscipline.length} accentColor={colors.primary} />
              <StatCard label="Escalated" value={escalatedDiscipline.length} accentColor={colors.danger} />
              <StatCard label="Serious+" value={houseDiscipline.filter(d => d.severity === 'Serious' || d.severity === 'Critical').length} accentColor={colors.warning} />
              <StatCard label="Minor" value={houseDiscipline.filter(d => d.severity === 'Minor').length} accentColor={colors.textSecondary} />
            </CardGrid>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.danger }]} onPress={() => { setDisciplineForm({ studentName: '', incident: '', severity: 'Minor', actionTaken: '' }); openModal('discipline'); }}><Text style={styles.actionBtnText}>+ Log Incident</Text></TouchableOpacity>
            <Text style={styles.sectionTitle}>Discipline Log</Text>
            {houseDiscipline.map((d) => (
              <View key={d.id} style={[styles.disciplineCard, { borderLeftColor: severityColor(d.severity) }]}>
                <View style={styles.disciplineHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.disciplineStudent}>{d.studentName} — {d.incident}</Text>
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
              <StatCard label="Total" value={houseWelfare.length} accentColor={colors.primary} />
              <StatCard label="Unresolved" value={unresolvedWelfare.length} accentColor={colors.danger} />
              <StatCard label="Resolved" value={houseWelfare.filter(w => w.resolved).length} accentColor={colors.success} />
              <StatCard label="Students" value={new Set(houseWelfare.map(w => w.studentName)).size} accentColor={colors.info} />
            </CardGrid>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.info }]} onPress={() => { setWelfareForm({ studentName: '', note: '' }); openModal('welfare'); }}><Text style={styles.actionBtnText}>+ Add Welfare Note</Text></TouchableOpacity>
            <Text style={styles.sectionTitle}>Welfare Check Log</Text>
            {houseWelfare.map((w) => (
              <View key={w.id} style={[styles.welfareCard, { borderLeftColor: w.resolved ? colors.success : colors.warning }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.welfareStudent}>{w.studentName}</Text>
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

      case 'exeats':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total" value={houseExeats.length} accentColor={colors.primary} />
              <StatCard label="Pending" value={houseExeats.filter(e => e.status === 'Pending').length} accentColor={colors.warning} />
              <StatCard label="Approved" value={houseExeats.filter(e => e.status === 'Approved' || e.status === 'Checked Out').length} accentColor={colors.success} />
              <StatCard label="Active" value={houseExeats.filter(e => e.status === 'Checked Out').length} subtitle="currently out" accentColor={colors.info} />
            </CardGrid>

            <TouchableOpacity style={styles.actionBtn} onPress={() => { setExeatForm({ studentName: '', admissionNo: '', class: '', reason: 'Medical', reasonDetail: '', destination: '', departureDate: todayStr(), returnDate: todayStr(), guardianName: '', guardianPhone: '', transportMode: 'Private Car' }); openModal('exeat'); }}>
              <Text style={styles.actionBtnText}>+ Issue Exeat</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Exeat History — {HOUSE_NAME} House</Text>
            {houseExeats.length === 0 && <Text style={styles.emptyText}>No exeats issued yet.</Text>}
            {houseExeats.map((e) => (
              <View key={e.id} style={[styles.disciplineCard, { borderLeftColor: exeatStatusColor(e.status) }]}>
                <View style={styles.disciplineHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.disciplineStudent}>{e.studentName} ({e.admissionNo})</Text>
                    <Text style={styles.disciplineMeta}>{e.exeatNo} | {e.date}</Text>
                    <Text style={styles.disciplineMeta}>Reason: {e.reason} — {e.reasonDetail}</Text>
                    <Text style={styles.disciplineMeta}>Destination: {e.destination}</Text>
                    <Text style={styles.disciplineMeta}>Departure: {e.departureDate} | Return: {e.returnDate}</Text>
                    <Text style={styles.disciplineMeta}>Guardian: {e.guardianName} ({e.guardianPhone || 'N/A'})</Text>
                    {e.status === 'Approved' && <Text style={styles.disciplineMeta}>Approved by: {e.approvedBy} on {e.approvedDate}</Text>}
                    {e.status === 'Checked Out' && <Text style={styles.disciplineMeta}>Checked out: {new Date(e.checkedOutAt).toLocaleString()} by {e.checkedOutBy}</Text>}
                    {e.status === 'Checked In' && <Text style={styles.disciplineMeta}>Checked in: {new Date(e.checkedInAt).toLocaleString()} by {e.checkedInBy}</Text>}
                  </View>
                  <View style={styles.disciplineBadges}>
                    {renderBadge(e.status, exeatStatusColor(e.status))}
                  </View>
                </View>
                <View style={styles.cardActions}>
                  {(e.status === 'Approved' || e.status === 'Checked Out') && (
                    <TouchableOpacity onPress={() => generateExeatPass(e.id)}><Text style={styles.actionLink}>Print Pass →</Text></TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => handleDelete(e.id, 'exeat', e.studentName)}><Text style={styles.deleteLink}>Delete</Text></TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );

      case 'requisitions':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total" value={houseRequisitions.length} accentColor={colors.primary} />
              <StatCard label="Pending" value={houseRequisitions.filter(r => r.status === 'Pending').length} accentColor={colors.warning} />
              <StatCard label="In Transit" value={pendingReceipts.length} subtitle="issued, awaiting receipt" accentColor={colors.info} />
              <StatCard label="Received" value={houseRequisitions.filter(r => r.status === 'Received').length} accentColor={colors.success} />
            </CardGrid>

            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowReqModal(true)}>
              <Text style={styles.actionBtnText}>+ New Requisition</Text>
            </TouchableOpacity>

            {pendingReceipts.length > 0 && (
              <View style={[styles.alertCard, { borderLeftColor: colors.info }]}>
                <Text style={[styles.alertTitle, { color: colors.info }]}>Items Issued — Confirm Receipt ({pendingReceipts.length})</Text>
                {pendingReceipts.map((r) => (
                  <View key={r.id} style={styles.reqAlertRow}>
                    <Text style={styles.alertText}>{r.itemName} ({r.quantity} {r.unit})</Text>
                    <TouchableOpacity onPress={() => { receiveByHouse(r.id, recordedBy); Alert.alert('Received', `${r.itemName} confirmed received.`); }}>
                      <Text style={styles.actionLink}>Confirm Receipt →</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.sectionTitle}>Requisition History — {HOUSE_NAME} House</Text>
            {houseRequisitions.length === 0 && <Text style={styles.emptyText}>No requisitions yet. Submit one to request items from Stores.</Text>}
            {houseRequisitions.map((r) => (
              <View key={r.id} style={[styles.disciplineCard, { borderLeftColor: reqStatusColor(r.status) }]}>
                <View style={styles.disciplineHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.disciplineStudent}>{r.itemName} — {r.quantity} {r.unit}</Text>
                    <Text style={styles.disciplineMeta}>{r.date} | Priority: {r.priority} | By {r.requestedBy}</Text>
                    {r.notes && <Text style={styles.disciplineMeta}>{r.notes}</Text>}
                    {r.approvals.length > 0 && (
                      <Text style={styles.disciplineMeta}>Approvals: {r.approvals.map(a => `${a.step}: ${a.action}`).join(' → ')}</Text>
                    )}
                  </View>
                  <View style={styles.disciplineBadges}>
                    {renderBadge(r.status, reqStatusColor(r.status))}
                  </View>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => deleteRequisition(r.id)}><Text style={styles.deleteLink}>Delete</Text></TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );

      case 'menu':
        return (
          <View>
            <Text style={styles.pageTitle}>Today's Menu</Text>
            <Text style={styles.pageSubtitle}>From the Kitchen/Catering unit</Text>
            <KitchenMenuWidget />
          </View>
        );

      case 'reports':
        return (
          <View>
            <Text style={styles.pageTitle}>Reports & Analytics</Text>
            <Text style={styles.pageSubtitle}>Real-time boarding data insights — {HOUSE_NAME} House</Text>
            <CardGrid>
              <StatCard label="Students" value={houseStudents.length} accentColor={colors.primary} />
              <StatCard label="Present Today" value={present} accentColor={colors.success} />
              <StatCard label="Discipline" value={houseDiscipline.length} accentColor={colors.danger} />
              <StatCard label="Welfare" value={houseWelfare.length} accentColor={colors.info} />
            </CardGrid>
            <TouchableOpacity style={styles.pdfFullBtn} onPress={() => generatePDF('full')}><Text style={styles.pdfFullBtnText}>Generate Full Report (PDF)</Text></TouchableOpacity>
            <View style={styles.pdfBtnRow}>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.primary }]} onPress={() => generatePDF('overview')}><Text style={styles.pdfBtnText}>Activity Summary</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.info }]} onPress={() => generatePDF('roster')}><Text style={styles.pdfBtnText}>Student Roster</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.success }]} onPress={() => generatePDF('rollcall')}><Text style={styles.pdfBtnText}>Roll Call</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.danger }]} onPress={() => generatePDF('discipline')}><Text style={styles.pdfBtnText}>Discipline Log</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.warning }]} onPress={() => generatePDF('welfare')}><Text style={styles.pdfBtnText}>Welfare Notes</Text></TouchableOpacity>
            </View>

            <View style={styles.reportHeaderRow}><Text style={styles.sectionTitle}>Roll Call Summary</Text><TouchableOpacity onPress={() => generatePDF('rollcall')}><Text style={styles.pdfLink}>PDF</Text></TouchableOpacity></View>
            <View style={styles.reportSectionCard}>
              {ROLL_CALL_STATUSES.map((st) => { const count = todayRollCalls.filter(r => r.status === st).length; const pct = todayRollCalls.length > 0 ? Math.round((count / todayRollCalls.length) * 100) : 0; return (
                <View key={st} style={styles.reportBarRow}><Text style={styles.reportBarLabel}>{st}</Text><View style={styles.reportBarTrack}><View style={[styles.reportBarFill, { width: `${pct}%`, backgroundColor: statusColor(st) }]} /></View><Text style={styles.reportBarCount}>{count}</Text></View>
              ); })}
            </View>

            <View style={styles.reportHeaderRow}><Text style={styles.sectionTitle}>Discipline by Severity</Text><TouchableOpacity onPress={() => generatePDF('discipline')}><Text style={styles.pdfLink}>PDF</Text></TouchableOpacity></View>
            <View style={styles.reportSectionCard}>
              {DISCIPLINE_SEVERITIES.map((sev) => { const count = houseDiscipline.filter(d => d.severity === sev).length; const pct = houseDiscipline.length > 0 ? Math.round((count / houseDiscipline.length) * 100) : 0; return (
                <View key={sev} style={styles.reportBarRow}><Text style={styles.reportBarLabel}>{sev}</Text><View style={styles.reportBarTrack}><View style={[styles.reportBarFill, { width: `${pct}%`, backgroundColor: severityColor(sev) }]} /></View><Text style={styles.reportBarCount}>{count}</Text></View>
              ); })}
            </View>

            <View style={styles.reportHeaderRow}><Text style={styles.sectionTitle}>Room Occupancy</Text></View>
            <View style={styles.reportSectionCard}>
              {houseRooms.map((r) => { const pct = Math.round((r.occupied / r.beds) * 100); return (
                <View key={r.id} style={styles.reportBarRow}><Text style={styles.reportBarLabel}>Room {r.room}</Text><View style={styles.reportBarTrack}><View style={[styles.reportBarFill, { width: `${pct}%`, backgroundColor: pct === 100 ? colors.danger : colors.success }]} /></View><Text style={styles.reportBarCount}>{r.occupied}/{r.beds}</Text></View>
              ); })}
            </View>
          </View>
        );

      default: return null;
    }
  };

  const renderModal = () => {
    const titles: Record<string, string> = { student: 'Add Student', room: 'Add Room', discipline: 'Log Discipline Incident', welfare: 'Add Welfare Note', exeat: 'Issue Exeat' };
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
              <Text style={styles.inputLabel}>Class</Text>
              <TextInput style={styles.input} placeholder="e.g. SHS2 Sci A" placeholderTextColor={colors.textLight} value={studentForm.class} onChangeText={(v) => setStudentForm({ ...studentForm, class: v })} />
              <Text style={styles.inputLabel}>Room</Text>
              <TextInput style={styles.input} placeholder="e.g. A-12" placeholderTextColor={colors.textLight} value={studentForm.room} onChangeText={(v) => setStudentForm({ ...studentForm, room: v })} />
              <Text style={styles.inputLabel}>Bed Number</Text>
              <TextInput style={styles.input} placeholder="e.g. 1" placeholderTextColor={colors.textLight} value={studentForm.bed} onChangeText={(v) => setStudentForm({ ...studentForm, bed: v })} />
            </View>
          )}

          {modalType === 'room' && (
            <View>
              <Text style={styles.inputLabel}>Room Number *</Text>
              <TextInput style={styles.input} placeholder="e.g. A-12" placeholderTextColor={colors.textLight} value={roomForm.room} onChangeText={(v) => setRoomForm({ ...roomForm, room: v })} />
              <Text style={styles.inputLabel}>Number of Beds</Text>
              <TextInput style={styles.input} placeholder="e.g. 4" placeholderTextColor={colors.textLight} value={roomForm.beds} onChangeText={(v) => setRoomForm({ ...roomForm, beds: v })} keyboardType="numeric" />
              <Text style={styles.inputLabel}>Student Names (comma-separated)</Text>
              <TextInput style={[styles.input, styles.textArea]} placeholder="K. Asante, Y. Mensah" placeholderTextColor={colors.textLight} value={roomForm.studentNames} onChangeText={(v) => setRoomForm({ ...roomForm, studentNames: v })} multiline />
            </View>
          )}

          {modalType === 'discipline' && (
            <View>
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
              <Text style={styles.inputLabel}>Student Name *</Text>
              <TextInput style={styles.input} placeholder="Student name" placeholderTextColor={colors.textLight} value={welfareForm.studentName} onChangeText={(v) => setWelfareForm({ ...welfareForm, studentName: v })} />
              <Text style={styles.inputLabel}>Note *</Text>
              <TextInput style={[styles.input, styles.textArea]} placeholder="Welfare observation" placeholderTextColor={colors.textLight} value={welfareForm.note} onChangeText={(v) => setWelfareForm({ ...welfareForm, note: v })} multiline />
            </View>
          )}

          {modalType === 'exeat' && (
            <View>
              <Text style={styles.inputLabel}>Student Name *</Text>
              <TextInput style={styles.input} placeholder="Full name" placeholderTextColor={colors.textLight} value={exeatForm.studentName} onChangeText={(v) => setExeatForm({ ...exeatForm, studentName: v })} />
              <Text style={styles.inputLabel}>Admission Number *</Text>
              <TextInput style={styles.input} placeholder="e.g. 2026/001" placeholderTextColor={colors.textLight} value={exeatForm.admissionNo} onChangeText={(v) => setExeatForm({ ...exeatForm, admissionNo: v })} />
              <Text style={styles.inputLabel}>Class</Text>
              <TextInput style={styles.input} placeholder="e.g. SHS2 Sci A" placeholderTextColor={colors.textLight} value={exeatForm.class} onChangeText={(v) => setExeatForm({ ...exeatForm, class: v })} />
              {renderSelect('Reason', exeatForm.reason, EXEAT_REASONS, (v) => setExeatForm({ ...exeatForm, reason: v as ExeatReason }))}
              <Text style={styles.inputLabel}>Reason Details</Text>
              <TextInput style={[styles.input, styles.textArea]} placeholder="e.g. Hospital appointment for eye checkup" placeholderTextColor={colors.textLight} value={exeatForm.reasonDetail} onChangeText={(v) => setExeatForm({ ...exeatForm, reasonDetail: v })} multiline />
              <Text style={styles.inputLabel}>Destination *</Text>
              <TextInput style={styles.input} placeholder="e.g. Korle-Bu Teaching Hospital" placeholderTextColor={colors.textLight} value={exeatForm.destination} onChangeText={(v) => setExeatForm({ ...exeatForm, destination: v })} />
              <Text style={styles.inputLabel}>Departure Date</Text>
              <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} value={exeatForm.departureDate} onChangeText={(v) => setExeatForm({ ...exeatForm, departureDate: v })} />
              <Text style={styles.inputLabel}>Expected Return Date</Text>
              <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} value={exeatForm.returnDate} onChangeText={(v) => setExeatForm({ ...exeatForm, returnDate: v })} />
              <Text style={styles.inputLabel}>Guardian Name *</Text>
              <TextInput style={styles.input} placeholder="e.g. Mr. K. Asante Sr." placeholderTextColor={colors.textLight} value={exeatForm.guardianName} onChangeText={(v) => setExeatForm({ ...exeatForm, guardianName: v })} />
              <Text style={styles.inputLabel}>Guardian Phone</Text>
              <TextInput style={styles.input} placeholder="e.g. 024-111-2222" placeholderTextColor={colors.textLight} value={exeatForm.guardianPhone} onChangeText={(v) => setExeatForm({ ...exeatForm, guardianPhone: v })} />
              {renderSelect('Transport Mode', exeatForm.transportMode, TRANSPORT_MODES, (v) => setExeatForm({ ...exeatForm, transportMode: v }))}
            </View>
          )}

          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={closeModal}><Text style={styles.modalBtnTextDark}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={() => { if (modalType === 'student') handleSaveStudent(); else if (modalType === 'room') handleSaveRoom(); else if (modalType === 'discipline') handleSaveDiscipline(); else if (modalType === 'welfare') handleSaveWelfare(); else if (modalType === 'exeat') handleSaveExeat(); }}><Text style={styles.modalBtnTextLight}>Save</Text></TouchableOpacity>
          </View>
        </ScrollView></View></View>
      </Modal>
    );
  };

  return (
    <DashboardLayout title={`${HOUSE_NAME} House`} navItems={NAV_ITEMS} activeKey={activePage} onNavigate={setActivePage}
      headerRight={<TouchableOpacity onPress={logout} style={styles.logoutBtn}><Text style={styles.logoutText}>Logout</Text></TouchableOpacity>}>
      {renderPage()}{renderModal()}
      <RequisitionModal
        visible={showReqModal}
        onClose={() => setShowReqModal(false)}
        department="Boarding"
        requestedBy={recordedBy}
        house={HOUSE_NAME}
      />
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
  pageSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.md },
  actionBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm + 4, alignItems: 'center', marginBottom: spacing.lg },
  actionBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  logoutBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  logoutText: { color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  emptyText: { fontSize: fontSize.md, color: colors.textLight, textAlign: 'center', paddingVertical: spacing.xl },

  alertCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg, borderLeftWidth: 4 },
  alertTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, marginBottom: spacing.xs },
  alertText: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs },
  reqAlertRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },

  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  quickBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, marginBottom: spacing.sm },
  quickBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },

  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  statusText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },

  studentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  studentName: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  studentMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },

  roomCard: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  roomTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  roomMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2, marginBottom: spacing.xs },
  roomStudent: { fontSize: fontSize.sm, color: colors.textSecondary, marginLeft: spacing.sm },
  roomRight: { alignItems: 'flex-end', gap: 6 },

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
  reportBarCount: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.text, width: 40, textAlign: 'right' },

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
