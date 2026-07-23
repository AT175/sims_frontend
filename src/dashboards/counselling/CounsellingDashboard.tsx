import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useAuthStore } from '@store/authStore';
import {
  useCounsellingStore,
  CASE_CATEGORIES_ACADEMIC, CASE_CATEGORIES_PSYCHO,
  REFERRAL_STATUSES, APPOINTMENT_STATUSES, CASE_STATUSES, CASE_PRIORITIES,
} from '@store/counsellingStore';
import type { CounsellorType, CasePriority } from '@store/counsellingStore';

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'cases', label: 'Case Log' },
  { key: 'caseDetail', label: 'Case Details' },
  { key: 'appointments', label: 'Appointments' },
  { key: 'referrals', label: 'Referral Tracker' },
  { key: 'career', label: 'Career Resources' },
  { key: 'counsellors', label: 'Our Counsellors' },
  { key: 'reports', label: 'Reports' },
];

const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
const RESOURCE_CATEGORIES = ['University', 'Scholarship', 'Course Guide', 'Academic', 'Career', 'Vocational'];

export function CounsellingDashboard() {
  const [activePage, setActivePage] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [caseFilter, setCaseFilter] = useState<'All' | CounsellorType>('All');
  const [apptFilter, setApptFilter] = useState<'All' | CounsellorType>('All');
  const { logout } = useAuthStore();

  const {
    counsellors, cases, sessions, appointments, referrals, resources,
    addCase, updateCaseStatus, updateCase, deleteCase, getActiveCases, getFollowUpsDue, getCaseById,
    addSession, deleteSession, getSessionsByCase,
    addAppointment, updateAppointmentStatus, deleteAppointment, getTodayAppointments,
    addReferral, updateReferralStatus, deleteReferral,
    addResource, deleteResource,
  } = useCounsellingStore();

  // ── Form state ──
  const [caseForm, setCaseForm] = useState({
    studentName: '', studentClass: '', category: CASE_CATEGORIES_ACADEMIC[0],
    type: 'Academic' as CounsellorType, description: '', priority: 'Medium' as string,
    assignedCounsellor: counsellors[0]?.name || '', notes: '', followUpDate: '', confidential: true,
  });
  const [sessionForm, setSessionForm] = useState({
    caseId: '', counsellor: '', type: 'Academic' as CounsellorType,
    summary: '', notes: '', nextAction: '', nextSessionDate: '',
  });
  const [apptForm, setApptForm] = useState({
    date: '', time: '10:00', studentName: '', studentClass: '',
    type: 'Academic' as CounsellorType, counsellor: counsellors[0]?.name || '', reason: '',
  });
  const [referralForm, setReferralForm] = useState({
    studentName: '', studentClass: '', referredTo: '', reason: '',
    type: 'Psychosocial' as CounsellorType, notes: '',
  });
  const [resourceForm, setResourceForm] = useState({
    title: '', category: 'University', description: '', link: '',
  });

  const openModal = (type: string) => { setModalType(type); setShowModal(true); };
  const closeModal = () => { setShowModal(false); };

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

  // ── Computed values ──
  const activeCases = getActiveCases();
  const followUpsDue = getFollowUpsDue();
  const todayAppts = getTodayAppointments();
  const academicCases = cases.filter(c => c.type === 'Academic');
  const psychoCases = cases.filter(c => c.type === 'Psychosocial');
  const academicCounsellor = counsellors.find(c => c.type === 'Academic');
  const psychoCounsellor = counsellors.find(c => c.type === 'Psychosocial');

  const statusColor = (s: string) => s === 'Active' || s === 'Ongoing' ? colors.warning : s === 'Closed' || s === 'Completed' ? colors.success : s === 'Referred' ? colors.info : s === 'Monitor' || s === 'Pending' || s === 'Scheduled' ? colors.primary : s === 'Cancelled' || s === 'No Show' || s === 'Failed' ? colors.danger : colors.textSecondary;
  const priorityColor = (p: string) => p === 'High' ? colors.danger : p === 'Medium' ? colors.warning : colors.info;
  const typeColor = (t: string) => t === 'Academic' ? colors.info : colors.purple;

  const filteredCases = caseFilter === 'All' ? cases : cases.filter(c => c.type === caseFilter);
  const filteredAppts = apptFilter === 'All' ? appointments : appointments.filter(a => a.type === apptFilter);

  const selectedCase = selectedCaseId ? getCaseById(selectedCaseId) : null;
  const selectedCaseSessions = selectedCaseId ? getSessionsByCase(selectedCaseId) : [];

  // ── Handlers ──
  const handleSaveCase = () => {
    if (!caseForm.studentName.trim() || !caseForm.description.trim()) { Alert.alert('Error', 'Enter student name and description'); return; }
    const counsellor = counsellors.find(c => c.type === caseForm.type);
    addCase({
      studentName: caseForm.studentName.trim(), studentClass: caseForm.studentClass.trim(),
      category: caseForm.category, type: caseForm.type, description: caseForm.description.trim(),
      priority: caseForm.priority as CasePriority,
      assignedCounsellor: counsellor?.name || caseForm.assignedCounsellor,
      notes: caseForm.notes.trim(), followUpDate: caseForm.followUpDate, confidential: caseForm.confidential,
    });
    setCaseForm({ studentName: '', studentClass: '', category: CASE_CATEGORIES_ACADEMIC[0], type: 'Academic', description: '', priority: 'Medium', assignedCounsellor: counsellors[0]?.name || '', notes: '', followUpDate: '', confidential: true });
    closeModal();
  };

  const handleSaveSession = () => {
    if (!sessionForm.summary.trim() || !sessionForm.counsellor.trim()) { Alert.alert('Error', 'Enter session summary and counsellor'); return; }
    addSession({
      caseId: sessionForm.caseId, date: new Date().toISOString().slice(0, 10),
      counsellor: sessionForm.counsellor, type: sessionForm.type,
      summary: sessionForm.summary.trim(), notes: sessionForm.notes.trim(),
      nextAction: sessionForm.nextAction.trim(), nextSessionDate: sessionForm.nextSessionDate,
    });
    if (sessionForm.nextSessionDate) {
      updateCase(sessionForm.caseId, { followUpDate: sessionForm.nextSessionDate });
    }
    setSessionForm({ caseId: '', counsellor: '', type: 'Academic', summary: '', notes: '', nextAction: '', nextSessionDate: '' });
    closeModal();
  };

  const handleSaveAppt = () => {
    if (!apptForm.studentName.trim() || !apptForm.date.trim()) { Alert.alert('Error', 'Enter student name and date'); return; }
    const counsellor = counsellors.find(c => c.type === apptForm.type);
    addAppointment({
      date: apptForm.date, time: apptForm.time, studentName: apptForm.studentName.trim(),
      studentClass: apptForm.studentClass.trim(), type: apptForm.type,
      counsellor: counsellor?.name || apptForm.counsellor, reason: apptForm.reason.trim(), notes: '',
    });
    setApptForm({ date: '', time: '10:00', studentName: '', studentClass: '', type: 'Academic', counsellor: counsellors[0]?.name || '', reason: '' });
    closeModal();
  };

  const handleSaveReferral = () => {
    if (!referralForm.studentName.trim() || !referralForm.referredTo.trim()) { Alert.alert('Error', 'Enter student name and referral target'); return; }
    addReferral({
      studentName: referralForm.studentName.trim(), studentClass: referralForm.studentClass.trim(),
      referredTo: referralForm.referredTo.trim(), reason: referralForm.reason.trim(),
      type: referralForm.type, notes: referralForm.notes.trim(),
    });
    setReferralForm({ studentName: '', studentClass: '', referredTo: '', reason: '', type: 'Psychosocial', notes: '' });
    closeModal();
  };

  const handleSaveResource = () => {
    if (!resourceForm.title.trim()) { Alert.alert('Error', 'Enter resource title'); return; }
    addResource({ title: resourceForm.title.trim(), category: resourceForm.category, description: resourceForm.description.trim(), updated: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), link: resourceForm.link.trim() });
    setResourceForm({ title: '', category: 'University', description: '', link: '' });
    closeModal();
  };

  const handleDeleteCase = (id: string) => Alert.alert('Delete', 'Delete this case and all its sessions?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => { deleteCase(id); if (selectedCaseId === id) { setSelectedCaseId(null); setActivePage('cases'); } } }]);
  const handleDeleteSession = (id: string) => Alert.alert('Delete', 'Delete this session log?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => deleteSession(id) }]);
  const handleDeleteAppt = (id: string) => Alert.alert('Delete', 'Delete this appointment?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => deleteAppointment(id) }]);
  const handleDeleteReferral = (id: string) => Alert.alert('Delete', 'Delete this referral?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => deleteReferral(id) }]);
  const handleDeleteResource = (id: string) => Alert.alert('Delete', 'Delete this resource?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => deleteResource(id) }]);

  const openCaseDetail = (caseId: string) => { setSelectedCaseId(caseId); setActivePage('caseDetail'); };

  // ── PDF Generation (via browser print) ──
  const generatePDF = (reportType: string) => {
    const now = new Date().toLocaleString();
    const dateStr = new Date().toISOString().slice(0, 10);

    const buildBarRow = (label: string, count: number, total: number) => {
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
      return `<tr><td style="padding:6px 12px;border:1px solid #ddd">${label}</td><td style="text-align:center;padding:6px 12px;border:1px solid #ddd">${count}</td><td style="text-align:center;padding:6px 12px;border:1px solid #ddd">${pct}%</td></tr>`;
    };

    let body = '';
    let title = '';

    if (reportType === 'full' || reportType === 'activity') {
      title = reportType === 'full' ? 'Counselling Activity Summary' : 'Counselling Activity Summary';
      body += `
        <h2>Overview</h2>
        <table style="border-collapse:collapse;width:100%;margin-bottom:20px">
          <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Total Cases</td><td style="padding:8px 12px;border:1px solid #ddd">${cases.length}</td></tr>
          <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Active Cases</td><td style="padding:8px 12px;border:1px solid #ddd">${cases.filter(c => c.status === 'Active').length}</td></tr>
          <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Monitor Cases</td><td style="padding:8px 12px;border:1px solid #ddd">${cases.filter(c => c.status === 'Monitor').length}</td></tr>
          <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Closed Cases</td><td style="padding:8px 12px;border:1px solid #ddd">${cases.filter(c => c.status === 'Closed').length}</td></tr>
          <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Referred Cases</td><td style="padding:8px 12px;border:1px solid #ddd">${cases.filter(c => c.status === 'Referred').length}</td></tr>
          <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Total Sessions</td><td style="padding:8px 12px;border:1px solid #ddd">${sessions.length}</td></tr>
          <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Total Appointments</td><td style="padding:8px 12px;border:1px solid #ddd">${appointments.length}</td></tr>
          <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Total Referrals</td><td style="padding:8px 12px;border:1px solid #ddd">${referrals.length}</td></tr>
        </table>`;
    }

    if (reportType === 'full' || reportType === 'categories') {
      title = reportType === 'full' ? title : 'Case Category Trends';
      const categories = [...new Set(cases.map(c => c.category))];
      body += `<h2>Case Category Breakdown</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px"><thead><tr style="background:#f0f0f0"><th style="padding:6px 12px;border:1px solid #ddd;text-align:left">Category</th><th style="padding:6px 12px;border:1px solid #ddd">Count</th><th style="padding:6px 12px;border:1px solid #ddd">Percentage</th></tr></thead><tbody>`;
      categories.forEach(cat => {
        const count = cases.filter(c => c.category === cat).length;
        body += buildBarRow(cat, count, cases.length);
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'priority') {
      title = reportType === 'full' ? title : 'Priority Breakdown Report';
      body += `<h2>Priority Breakdown</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px"><thead><tr style="background:#f0f0f0"><th style="padding:6px 12px;border:1px solid #ddd;text-align:left">Priority</th><th style="padding:6px 12px;border:1px solid #ddd">Count</th><th style="padding:6px 12px;border:1px solid #ddd">Percentage</th></tr></thead><tbody>`;
      CASE_PRIORITIES.forEach(pri => {
        const count = cases.filter(c => c.priority === pri).length;
        body += buildBarRow(pri + ' Priority', count, cases.length);
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'workload') {
      title = reportType === 'full' ? title : 'Counsellor Workload Report';
      body += `<h2>Counsellor Workload</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px"><thead><tr style="background:#f0f0f0"><th style="padding:6px 12px;border:1px solid #ddd;text-align:left">Counsellor</th><th style="padding:6px 12px;border:1px solid #ddd">Type</th><th style="padding:6px 12px;border:1px solid #ddd">Active</th><th style="padding:6px 12px;border:1px solid #ddd">Total</th><th style="padding:6px 12px;border:1px solid #ddd">Sessions</th><th style="padding:6px 12px;border:1px solid #ddd">Appts</th></tr></thead><tbody>`;
      counsellors.forEach(c => {
        const total = cases.filter(cs => cs.assignedCounsellor === c.name).length;
        const active = cases.filter(cs => cs.assignedCounsellor === c.name && (cs.status === 'Active' || cs.status === 'Monitor')).length;
        const sess = sessions.filter(s => s.counsellor === c.name).length;
        const appts = appointments.filter(a => a.counsellor === c.name).length;
        body += `<tr><td style="padding:6px 12px;border:1px solid #ddd">${c.name}</td><td style="padding:6px 12px;border:1px solid #ddd">${c.type}</td><td style="text-align:center;padding:6px 12px;border:1px solid #ddd">${active}</td><td style="text-align:center;padding:6px 12px;border:1px solid #ddd">${total}</td><td style="text-align:center;padding:6px 12px;border:1px solid #ddd">${sess}</td><td style="text-align:center;padding:6px 12px;border:1px solid #ddd">${appts}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'referrals') {
      title = reportType === 'full' ? title : 'Referral Outcomes Report';
      body += `<h2>Referral Outcomes</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px"><thead><tr style="background:#f0f0f0"><th style="padding:6px 12px;border:1px solid #ddd;text-align:left">Status</th><th style="padding:6px 12px;border:1px solid #ddd">Count</th><th style="padding:6px 12px;border:1px solid #ddd">Percentage</th></tr></thead><tbody>`;
      REFERRAL_STATUSES.forEach(st => {
        const count = referrals.filter(r => r.status === st).length;
        body += buildBarRow(st, count, referrals.length);
      });
      body += `</tbody></table>`;

      body += `<h2>Referral Details</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px"><thead><tr style="background:#f0f0f0"><th style="padding:6px 12px;border:1px solid #ddd;text-align:left">Date</th><th style="padding:6px 12px;border:1px solid #ddd;text-align:left">Student</th><th style="padding:6px 12px;border:1px solid #ddd;text-align:left">Referred To</th><th style="padding:6px 12px;border:1px solid #ddd;text-align:left">Reason</th><th style="padding:6px 12px;border:1px solid #ddd">Status</th></tr></thead><tbody>`;
      referrals.forEach(r => {
        body += `<tr><td style="padding:6px 12px;border:1px solid #ddd">${r.date}</td><td style="padding:6px 12px;border:1px solid #ddd">${r.studentName}</td><td style="padding:6px 12px;border:1px solid #ddd">${r.referredTo}</td><td style="padding:6px 12px;border:1px solid #ddd">${r.reason}</td><td style="text-align:center;padding:6px 12px;border:1px solid #ddd">${r.status}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'comparison') {
      title = reportType === 'full' ? title : 'Academic vs Psychosocial Comparison';
      body += `<h2>Academic vs Psychosocial</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px"><thead><tr style="background:#f0f0f0"><th style="padding:6px 12px;border:1px solid #ddd;text-align:left">Metric</th><th style="padding:6px 12px;border:1px solid #ddd">Academic</th><th style="padding:6px 12px;border:1px solid #ddd">Psychosocial</th></tr></thead><tbody>`;
      body += `<tr><td style="padding:6px 12px;border:1px solid #ddd">Total Cases</td><td style="text-align:center;padding:6px 12px;border:1px solid #ddd">${academicCases.length}</td><td style="text-align:center;padding:6px 12px;border:1px solid #ddd">${psychoCases.length}</td></tr>`;
      body += `<tr><td style="padding:6px 12px;border:1px solid #ddd">Active Cases</td><td style="text-align:center;padding:6px 12px;border:1px solid #ddd">${academicCases.filter(c => c.status === 'Active' || c.status === 'Monitor').length}</td><td style="text-align:center;padding:6px 12px;border:1px solid #ddd">${psychoCases.filter(c => c.status === 'Active' || c.status === 'Monitor').length}</td></tr>`;
      body += `<tr><td style="padding:6px 12px;border:1px solid #ddd">Closed Cases</td><td style="text-align:center;padding:6px 12px;border:1px solid #ddd">${academicCases.filter(c => c.status === 'Closed').length}</td><td style="text-align:center;padding:6px 12px;border:1px solid #ddd">${psychoCases.filter(c => c.status === 'Closed').length}</td></tr>`;
      body += `<tr><td style="padding:6px 12px;border:1px solid #ddd">Sessions Logged</td><td style="text-align:center;padding:6px 12px;border:1px solid #ddd">${sessions.filter(s => s.type === 'Academic').length}</td><td style="text-align:center;padding:6px 12px;border:1px solid #ddd">${sessions.filter(s => s.type === 'Psychosocial').length}</td></tr>`;
      body += `<tr><td style="padding:6px 12px;border:1px solid #ddd">Appointments</td><td style="text-align:center;padding:6px 12px;border:1px solid #ddd">${appointments.filter(a => a.type === 'Academic').length}</td><td style="text-align:center;padding:6px 12px;border:1px solid #ddd">${appointments.filter(a => a.type === 'Psychosocial').length}</td></tr>`;
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'sessions') {
      title = reportType === 'full' ? title : 'Recent Sessions Report';
      body += `<h2>Recent Sessions</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px"><thead><tr style="background:#f0f0f0"><th style="padding:6px 12px;border:1px solid #ddd;text-align:left">Date</th><th style="padding:6px 12px;border:1px solid #ddd;text-align:left">Case</th><th style="padding:6px 12px;border:1px solid #ddd;text-align:left">Student</th><th style="padding:6px 12px;border:1px solid #ddd;text-align:left">Summary</th><th style="padding:6px 12px;border:1px solid #ddd;text-align:left">Counsellor</th><th style="padding:6px 12px;border:1px solid #ddd">Type</th></tr></thead><tbody>`;
      sessions.slice(0, 10).forEach(s => {
        const caseInfo = cases.find(c => c.id === s.caseId);
        body += `<tr><td style="padding:6px 12px;border:1px solid #ddd">${s.date}</td><td style="padding:6px 12px;border:1px solid #ddd">${caseInfo?.caseId || 'Unknown'}</td><td style="padding:6px 12px;border:1px solid #ddd">${caseInfo?.studentName || 'Unknown'}</td><td style="padding:6px 12px;border:1px solid #ddd">${s.summary}</td><td style="padding:6px 12px;border:1px solid #ddd">${s.counsellor}</td><td style="text-align:center;padding:6px 12px;border:1px solid #ddd">${s.type}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'cases') {
      title = reportType === 'full' ? 'Comprehensive Counselling Report' : 'Case Log Report';
      body += `<h2>Case Log</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px"><thead><tr style="background:#f0f0f0"><th style="padding:6px 12px;border:1px solid #ddd;text-align:left">Case ID</th><th style="padding:6px 12px;border:1px solid #ddd;text-align:left">Student</th><th style="padding:6px 12px;border:1px solid #ddd;text-align:left">Class</th><th style="padding:6px 12px;border:1px solid #ddd;text-align:left">Category</th><th style="padding:6px 12px;border:1px solid #ddd;text-align:left">Type</th><th style="padding:6px 12px;border:1px solid #ddd;text-align:left">Priority</th><th style="padding:6px 12px;border:1px solid #ddd;text-align:left">Counsellor</th><th style="padding:6px 12px;border:1px solid #ddd;text-align:left">Opened</th><th style="padding:6px 12px;border:1px solid #ddd">Status</th></tr></thead><tbody>`;
      cases.forEach(c => {
        body += `<tr><td style="padding:6px 12px;border:1px solid #ddd">${c.caseId}</td><td style="padding:6px 12px;border:1px solid #ddd">${c.studentName}</td><td style="padding:6px 12px;border:1px solid #ddd">${c.studentClass}</td><td style="padding:6px 12px;border:1px solid #ddd">${c.category}</td><td style="padding:6px 12px;border:1px solid #ddd">${c.type}</td><td style="padding:6px 12px;border:1px solid #ddd">${c.priority}</td><td style="padding:6px 12px;border:1px solid #ddd">${c.assignedCounsellor}</td><td style="padding:6px 12px;border:1px solid #ddd">${c.openedDate}</td><td style="text-align:center;padding:6px 12px;border:1px solid #ddd">${c.status}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
      <style>
        * { font-family: 'Segoe UI', Arial, sans-serif; }
        body { padding: 40px; color: #1A1A2E; max-width: 900px; margin: 0 auto; }
        h1 { color: #4A6FA5; border-bottom: 3px solid #4A6FA5; padding-bottom: 10px; }
        h2 { color: #2D3142; margin-top: 30px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px; color: #888; }
        .confidential { background: #FEF6E7; border-left: 4px solid #E6A900; padding: 10px 15px; margin: 15px 0; font-size: 13px; color: #8B6914; }
        table { font-size: 13px; }
        th { font-weight: 600; }
        .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 11px; color: #aaa; text-align: center; }
        @media print { body { padding: 20px; } .no-print { display: none; } }
      </style></head><body>
      <div class="header"><span>SIMS — Counselling Unit</span><span>Generated: ${now}</span></div>
      <h1>${title}</h1>
      <div class="confidential">CONFIDENTIAL — This report contains sensitive counselling data. Access is restricted to authorised counselling staff and school administration only.</div>
      ${body}
      <div class="footer">School Information Management System (SIMS) — Counselling Unit Report — ${dateStr}</div>
      <script>window.onload = function() { window.print(); }</script>
      </body></html>`;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(html);
      printWin.document.close();
    } else {
      Alert.alert('Popup Blocked', 'Please allow popups to generate PDF reports.');
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return (
          <View>
            <CardGrid>
              <StatCard label="Active Cases" value={activeCases.length} subtitle="Needs attention" accentColor={colors.warning} />
              <StatCard label="Today's Appts" value={todayAppts.length} subtitle="Scheduled" accentColor={colors.primary} />
              <StatCard label="Follow-ups Due" value={followUpsDue.length} subtitle="Overdue/due" accentColor={followUpsDue.length > 0 ? colors.danger : colors.success} />
              <StatCard label="Pending Referrals" value={referrals.filter(r => r.status === 'Pending' || r.status === 'Ongoing').length} accentColor={colors.info} />
              <StatCard label="Academic Cases" value={academicCases.length} subtitle={academicCounsellor?.name} accentColor={colors.info} />
              <StatCard label="Psychosocial" value={psychoCases.length} subtitle={psychoCounsellor?.name} accentColor={colors.purple} />
              <StatCard label="Total Cases" value={cases.length} subtitle="All time" accentColor={colors.accent} />
              <StatCard label="Resources" value={resources.length} subtitle="Career guides" accentColor={colors.success} />
            </CardGrid>

            {followUpsDue.length > 0 && (
              <View style={[styles.alertCard, { borderLeftColor: colors.danger }]}>
                <Text style={[styles.alertTitle, { color: colors.danger }]}>⚠ {followUpsDue.length} Follow-up{followUpsDue.length > 1 ? 's' : ''} Due</Text>
                {followUpsDue.map((c) => (
                  <TouchableOpacity key={c.id} onPress={() => openCaseDetail(c.id)}>
                    <Text style={[styles.alertText, { color: colors.danger }]}>{c.caseId} — {c.studentName} ({c.category}) | Due: {c.followUpDate}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {todayAppts.length > 0 && (
              <View style={[styles.alertCard, { borderLeftColor: colors.primary }]}>
                <Text style={[styles.alertTitle, { color: colors.primary }]}>📅 Today's Appointments ({todayAppts.length})</Text>
                {todayAppts.map((a) => (
                  <Text key={a.id} style={styles.alertText}>{a.time} — {a.studentName} ({a.type}) with {a.counsellor}</Text>
                ))}
              </View>
            )}

            <Text style={styles.sectionTitle}>Counsellor Workload</Text>
            {counsellors.map((c) => {
              const counsellorCases = cases.filter(cs => cs.assignedCounsellor === c.name);
              const counsellorActive = counsellorCases.filter(cs => cs.status === 'Active' || cs.status === 'Monitor').length;
              const counsellorAppts = appointments.filter(a => a.counsellor === c.name && a.status === 'Scheduled').length;
              return (
                <View key={c.id} style={[styles.counsellorCard, { borderLeftColor: typeColor(c.type) }]}>
                  <View style={styles.counsellorHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.counsellorName}>{c.name}</Text>
                      <Text style={styles.counsellorTitle}>{c.title}</Text>
                      <Text style={styles.counsellorMeta}>{c.room} | {c.phone}</Text>
                    </View>
                    <View style={[styles.typeBadge, { backgroundColor: typeColor(c.type) + '20' }]}>
                      <Text style={[styles.typeText, { color: typeColor(c.type) }]}>{c.type}</Text>
                    </View>
                  </View>
                  <View style={styles.workloadRow}>
                    <Text style={styles.workloadStat}>Active: {counsellorActive}</Text>
                    <Text style={styles.workloadStat}>Total: {counsellorCases.length}</Text>
                    <Text style={styles.workloadStat}>Appts: {counsellorAppts}</Text>
                  </View>
                </View>
              );
            })}

            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.primary }]} onPress={() => { setCaseForm({ studentName: '', studentClass: '', category: CASE_CATEGORIES_ACADEMIC[0], type: 'Academic', description: '', priority: 'Medium', assignedCounsellor: counsellors[0]?.name || '', notes: '', followUpDate: '', confidential: true }); openModal('case'); }}>
                <Text style={styles.quickBtnText}>+ New Case</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.info }]} onPress={() => { setApptForm({ date: '', time: '10:00', studentName: '', studentClass: '', type: 'Academic', counsellor: counsellors[0]?.name || '', reason: '' }); openModal('appointment'); }}>
                <Text style={styles.quickBtnText}>+ Book Appt</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.danger }]} onPress={() => { setReferralForm({ studentName: '', studentClass: '', referredTo: '', reason: '', type: 'Psychosocial', notes: '' }); openModal('referral'); }}>
                <Text style={styles.quickBtnText}>+ Refer Student</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.success }]} onPress={() => { setResourceForm({ title: '', category: 'University', description: '', link: '' }); openModal('resource'); }}>
                <Text style={styles.quickBtnText}>+ Add Resource</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 'cases':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Cases" value={cases.length} accentColor={colors.primary} />
              <StatCard label="Active" value={cases.filter(c => c.status === 'Active').length} accentColor={colors.warning} />
              <StatCard label="Monitor" value={cases.filter(c => c.status === 'Monitor').length} accentColor={colors.info} />
              <StatCard label="Closed" value={cases.filter(c => c.status === 'Closed').length} accentColor={colors.success} />
            </CardGrid>
            <Text style={styles.pageTitle}>Case Log</Text>
            <Text style={styles.pageSubtitle}>Confidential — access restricted to counselling staff</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => { setCaseForm({ studentName: '', studentClass: '', category: CASE_CATEGORIES_ACADEMIC[0], type: 'Academic', description: '', priority: 'Medium', assignedCounsellor: counsellors[0]?.name || '', notes: '', followUpDate: '', confidential: true }); openModal('case'); }}>
              <Text style={styles.actionBtnText}>+ Open New Case</Text>
            </TouchableOpacity>

            <View style={styles.filterRow}>
              <TouchableOpacity style={[styles.filterChip, caseFilter === 'All' && styles.filterChipActive]} onPress={() => setCaseFilter('All')}>
                <Text style={[styles.filterText, caseFilter === 'All' && styles.filterTextActive]}>All ({cases.length})</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.filterChip, caseFilter === 'Academic' && styles.filterChipActive]} onPress={() => setCaseFilter('Academic')}>
                <Text style={[styles.filterText, caseFilter === 'Academic' && styles.filterTextActive]}>Academic ({academicCases.length})</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.filterChip, caseFilter === 'Psychosocial' && styles.filterChipActive]} onPress={() => setCaseFilter('Psychosocial')}>
                <Text style={[styles.filterText, caseFilter === 'Psychosocial' && styles.filterTextActive]}>Psychosocial ({psychoCases.length})</Text>
              </TouchableOpacity>
            </View>

            {filteredCases.length === 0 ? (
              <Text style={styles.emptyText}>No cases found.</Text>
            ) : (
              filteredCases.map((c) => (
                <TouchableOpacity key={c.id} style={styles.caseCard} onPress={() => openCaseDetail(c.id)}>
                  <View style={styles.caseHeader}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.caseIdRow}>
                        <Text style={styles.caseId}>{c.caseId}</Text>
                        {c.confidential && <Text style={styles.confidentialTag}>🔒 Confidential</Text>}
                      </View>
                      <Text style={styles.caseStudent}>{c.studentName} — {c.studentClass}</Text>
                      <Text style={styles.caseMeta}>{c.category} | Opened: {c.openedDate} | {c.assignedCounsellor}</Text>
                      {c.description ? <Text style={styles.caseDesc} numberOfLines={2}>{c.description}</Text> : null}
                    </View>
                    <View style={styles.caseBadges}>
                      <View style={[styles.typeBadge, { backgroundColor: typeColor(c.type) + '20' }]}>
                        <Text style={[styles.typeText, { color: typeColor(c.type) }]}>{c.type}</Text>
                      </View>
                      <View style={[styles.priorityBadge, { backgroundColor: priorityColor(c.priority) + '20' }]}>
                        <Text style={[styles.priorityText, { color: priorityColor(c.priority) }]}>{c.priority}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: statusColor(c.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: statusColor(c.status) }]}>{c.status}</Text>
                      </View>
                    </View>
                  </View>
                  {c.followUpDate && (c.status === 'Active' || c.status === 'Monitor') && (
                    <Text style={[styles.followUpText, c.followUpDate <= new Date().toISOString().slice(0, 10) && { color: colors.danger }]}>Follow-up: {c.followUpDate}</Text>
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        );
      case 'caseDetail':
        if (!selectedCase) {
          return (
            <View>
              <Text style={styles.emptyText}>No case selected. Go to Case Log and tap a case.</Text>
              <TouchableOpacity style={styles.actionBtn} onPress={() => setActivePage('cases')}>
                <Text style={styles.actionBtnText}>← Back to Case Log</Text>
              </TouchableOpacity>
            </View>
          );
        }
        return (
          <View>
            <TouchableOpacity onPress={() => setActivePage('cases')}>
              <Text style={styles.backLink}>← Back to Case Log</Text>
            </TouchableOpacity>
            <View style={[styles.detailCard, { borderLeftColor: typeColor(selectedCase.type) }]}>
              <View style={styles.detailHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.caseIdRow}>
                    <Text style={styles.detailCaseId}>{selectedCase.caseId}</Text>
                    {selectedCase.confidential && <Text style={styles.confidentialTag}>🔒 Confidential</Text>}
                  </View>
                  <Text style={styles.detailStudent}>{selectedCase.studentName} — {selectedCase.studentClass}</Text>
                  <Text style={styles.detailMeta}>Category: {selectedCase.category} | Type: {selectedCase.type}</Text>
                  <Text style={styles.detailMeta}>Counsellor: {selectedCase.assignedCounsellor} | Opened: {selectedCase.openedDate}</Text>
                </View>
                <View style={styles.caseBadges}>
                  <View style={[styles.priorityBadge, { backgroundColor: priorityColor(selectedCase.priority) + '20' }]}>
                    <Text style={[styles.priorityText, { color: priorityColor(selectedCase.priority) }]}>{selectedCase.priority}</Text>
                  </View>
                  <TouchableOpacity style={[styles.statusBadge, { backgroundColor: statusColor(selectedCase.status) + '20' }]} onPress={() => {
                    const idx = CASE_STATUSES.indexOf(selectedCase.status);
                    updateCaseStatus(selectedCase.id, CASE_STATUSES[(idx + 1) % CASE_STATUSES.length]);
                  }}>
                    <Text style={[styles.statusText, { color: statusColor(selectedCase.status) }]}>{selectedCase.status}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {selectedCase.description ? <Text style={styles.detailDesc}>{selectedCase.description}</Text> : null}
              {selectedCase.notes ? <Text style={styles.detailNotes}>Notes: {selectedCase.notes}</Text> : null}
              {selectedCase.followUpDate ? <Text style={[styles.followUpText, selectedCase.followUpDate <= new Date().toISOString().slice(0, 10) && { color: colors.danger }]}>Next follow-up: {selectedCase.followUpDate}</Text> : null}
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => { setSessionForm({ caseId: selectedCase.id, counsellor: selectedCase.assignedCounsellor, type: selectedCase.type, summary: '', notes: '', nextAction: '', nextSessionDate: '' }); openModal('session'); }}>
                  <Text style={styles.editLink}>+ Log Session</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteCase(selectedCase.id)}>
                  <Text style={styles.deleteLink}>Delete Case</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Session History ({selectedCaseSessions.length})</Text>
            {selectedCaseSessions.length === 0 ? (
              <Text style={styles.emptyText}>No sessions logged yet.</Text>
            ) : (
              selectedCaseSessions.map((s) => (
                <View key={s.id} style={styles.sessionCard}>
                  <View style={styles.sessionHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sessionDate}>{s.date} — {s.summary}</Text>
                      <Text style={styles.sessionMeta}>Counsellor: {s.counsellor} | Type: {s.type}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteSession(s.id)}>
                      <Text style={styles.deleteLink}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                  {s.notes ? <Text style={styles.sessionNotes}>{s.notes}</Text> : null}
                  {s.nextAction ? <Text style={styles.sessionNext}>Next: {s.nextAction}</Text> : null}
                  {s.nextSessionDate ? <Text style={styles.sessionNextDate}>Next session: {s.nextSessionDate}</Text> : null}
                </View>
              ))
            )}
          </View>
        );
      case 'appointments':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total" value={appointments.length} accentColor={colors.primary} />
              <StatCard label="Scheduled" value={appointments.filter(a => a.status === 'Scheduled').length} accentColor={colors.warning} />
              <StatCard label="Completed" value={appointments.filter(a => a.status === 'Completed').length} accentColor={colors.success} />
              <StatCard label="Today" value={todayAppts.length} accentColor={colors.info} />
            </CardGrid>
            <Text style={styles.pageTitle}>Appointment Scheduler</Text>
            <Text style={styles.pageSubtitle}>Book and track counselling sessions</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => { setApptForm({ date: '', time: '10:00', studentName: '', studentClass: '', type: 'Academic', counsellor: counsellors[0]?.name || '', reason: '' }); openModal('appointment'); }}>
              <Text style={styles.actionBtnText}>+ Book Appointment</Text>
            </TouchableOpacity>

            <View style={styles.filterRow}>
              <TouchableOpacity style={[styles.filterChip, apptFilter === 'All' && styles.filterChipActive]} onPress={() => setApptFilter('All')}>
                <Text style={[styles.filterText, apptFilter === 'All' && styles.filterTextActive]}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.filterChip, apptFilter === 'Academic' && styles.filterChipActive]} onPress={() => setApptFilter('Academic')}>
                <Text style={[styles.filterText, apptFilter === 'Academic' && styles.filterTextActive]}>Academic</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.filterChip, apptFilter === 'Psychosocial' && styles.filterChipActive]} onPress={() => setApptFilter('Psychosocial')}>
                <Text style={[styles.filterText, apptFilter === 'Psychosocial' && styles.filterTextActive]}>Psychosocial</Text>
              </TouchableOpacity>
            </View>

            {filteredAppts.length === 0 ? (
              <Text style={styles.emptyText}>No appointments found.</Text>
            ) : (
              filteredAppts.map((a) => (
                <View key={a.id} style={styles.apptCard}>
                  <View style={styles.apptHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.apptDateTime}>{a.date} at {a.time}</Text>
                      <Text style={styles.apptStudent}>{a.studentName} — {a.studentClass}</Text>
                      <Text style={styles.apptMeta}>{a.reason} | {a.counsellor}</Text>
                      {a.notes ? <Text style={styles.apptNotes}>{a.notes}</Text> : null}
                    </View>
                    <View style={styles.caseBadges}>
                      <View style={[styles.typeBadge, { backgroundColor: typeColor(a.type) + '20' }]}>
                        <Text style={[styles.typeText, { color: typeColor(a.type) }]}>{a.type}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.apptActions}>
                    <TouchableOpacity style={[styles.statusBadge, { backgroundColor: statusColor(a.status) + '20' }]} onPress={() => {
                      const idx = APPOINTMENT_STATUSES.indexOf(a.status);
                      updateAppointmentStatus(a.id, APPOINTMENT_STATUSES[(idx + 1) % APPOINTMENT_STATUSES.length]);
                    }}>
                      <Text style={[styles.statusText, { color: statusColor(a.status) }]}>{a.status}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteAppt(a.id)}>
                      <Text style={styles.deleteLink}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        );
      case 'referrals':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total" value={referrals.length} accentColor={colors.primary} />
              <StatCard label="Pending" value={referrals.filter(r => r.status === 'Pending').length} accentColor={colors.warning} />
              <StatCard label="Ongoing" value={referrals.filter(r => r.status === 'Ongoing').length} accentColor={colors.info} />
              <StatCard label="Completed" value={referrals.filter(r => r.status === 'Completed').length} accentColor={colors.success} />
            </CardGrid>
            <Text style={styles.pageTitle}>Referral Tracker</Text>
            <Text style={styles.pageSubtitle}>Cases referred to external professionals</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => { setReferralForm({ studentName: '', studentClass: '', referredTo: '', reason: '', type: 'Psychosocial', notes: '' }); openModal('referral'); }}>
              <Text style={styles.actionBtnText}>+ New Referral</Text>
            </TouchableOpacity>
            {referrals.length === 0 ? (
              <Text style={styles.emptyText}>No referrals recorded.</Text>
            ) : (
              referrals.map((r) => (
                <View key={r.id} style={styles.referralCard}>
                  <View style={styles.referralHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.referralStudent}>{r.studentName} — {r.studentClass}</Text>
                      <Text style={styles.referralMeta}>Referred to: {r.referredTo} | {r.date}</Text>
                      <Text style={styles.referralReason}>Reason: {r.reason}</Text>
                      {r.notes ? <Text style={styles.referralNotes}>{r.notes}</Text> : null}
                    </View>
                    <View style={styles.caseBadges}>
                      <View style={[styles.typeBadge, { backgroundColor: typeColor(r.type) + '20' }]}>
                        <Text style={[styles.typeText, { color: typeColor(r.type) }]}>{r.type}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.apptActions}>
                    <TouchableOpacity style={[styles.statusBadge, { backgroundColor: statusColor(r.status) + '20' }]} onPress={() => {
                      const idx = REFERRAL_STATUSES.indexOf(r.status);
                      updateReferralStatus(r.id, REFERRAL_STATUSES[(idx + 1) % REFERRAL_STATUSES.length]);
                    }}>
                      <Text style={[styles.statusText, { color: statusColor(r.status) }]}>{r.status}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteReferral(r.id)}>
                      <Text style={styles.deleteLink}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        );
      case 'career':
        return (
          <View>
            <CardGrid>
              <StatCard label="Resources" value={resources.length} accentColor={colors.primary} />
              <StatCard label="Categories" value={new Set(resources.map(r => r.category)).size} accentColor={colors.info} />
              <StatCard label="Universities" value={resources.filter(r => r.category === 'University').length} accentColor={colors.success} />
              <StatCard label="Scholarships" value={resources.filter(r => r.category === 'Scholarship').length} accentColor={colors.accent} />
            </CardGrid>
            <Text style={styles.pageTitle}>Career Guidance Resources</Text>
            <Text style={styles.pageSubtitle}>University, course, and scholarship information</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => { setResourceForm({ title: '', category: 'University', description: '', link: '' }); openModal('resource'); }}>
              <Text style={styles.actionBtnText}>+ Add Resource</Text>
            </TouchableOpacity>
            {resources.length === 0 ? (
              <Text style={styles.emptyText}>No resources available.</Text>
            ) : (
              resources.map((r) => (
                <View key={r.id} style={styles.resourceCard}>
                  <View style={styles.resourceHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.resourceTitle}>{r.title}</Text>
                      <Text style={styles.resourceMeta}>{r.category} | Updated: {r.updated}</Text>
                      {r.description ? <Text style={styles.resourceDesc}>{r.description}</Text> : null}
                      {r.link ? <Text style={styles.resourceLink}>🔗 {r.link}</Text> : null}
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => handleDeleteResource(r.id)}>
                      <Text style={styles.deleteLink}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        );
      case 'counsellors':
        return (
          <View>
            <Text style={styles.pageTitle}>Our Counsellors</Text>
            <Text style={styles.pageSubtitle}>Two coordinators — Academic and Psychosocial</Text>
            {counsellors.map((c) => {
              const counsellorCases = cases.filter(cs => cs.assignedCounsellor === c.name);
              const counsellorActive = counsellorCases.filter(cs => cs.status === 'Active' || cs.status === 'Monitor').length;
              const counsellorSessions = sessions.filter(s => s.counsellor === c.name).length;
              const counsellorAppts = appointments.filter(a => a.counsellor === c.name).length;
              return (
                <View key={c.id} style={[styles.counsellorProfileCard, { borderLeftColor: typeColor(c.type) }]}>
                  <View style={styles.counsellorHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.counsellorName}>{c.name}</Text>
                      <Text style={styles.counsellorTitle}>{c.title}</Text>
                    </View>
                    <View style={[styles.typeBadge, { backgroundColor: typeColor(c.type) + '20' }]}>
                      <Text style={[styles.typeText, { color: typeColor(c.type) }]}>{c.type}</Text>
                    </View>
                  </View>
                  <Text style={styles.counsellorDetail}>📞 {c.phone}</Text>
                  <Text style={styles.counsellorDetail}>✉️ {c.email}</Text>
                  <Text style={styles.counsellorDetail}>📍 {c.room}</Text>
                  <Text style={styles.counsellorDetail}>🕐 {c.availability}</Text>
                  <View style={styles.workloadRow}>
                    <View style={styles.workloadBox}>
                      <Text style={styles.workloadNum}>{counsellorActive}</Text>
                      <Text style={styles.workloadLabel}>Active Cases</Text>
                    </View>
                    <View style={styles.workloadBox}>
                      <Text style={styles.workloadNum}>{counsellorCases.length}</Text>
                      <Text style={styles.workloadLabel}>Total Cases</Text>
                    </View>
                    <View style={styles.workloadBox}>
                      <Text style={styles.workloadNum}>{counsellorSessions}</Text>
                      <Text style={styles.workloadLabel}>Sessions</Text>
                    </View>
                    <View style={styles.workloadBox}>
                      <Text style={styles.workloadNum}>{counsellorAppts}</Text>
                      <Text style={styles.workloadLabel}>Appts</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        );
      case 'reports':
        return (
          <View>
            <Text style={styles.pageTitle}>Reports & Analytics</Text>
            <Text style={styles.pageSubtitle}>Real-time data insights from counselling activities</Text>
            <CardGrid>
              <StatCard label="Total Cases" value={cases.length} accentColor={colors.primary} />
              <StatCard label="Total Sessions" value={sessions.length} accentColor={colors.info} />
              <StatCard label="Academic Cases" value={academicCases.length} accentColor={colors.info} />
              <StatCard label="Psychosocial Cases" value={psychoCases.length} accentColor={colors.purple} />
            </CardGrid>

            {/* Generate Full Report */}
            <TouchableOpacity style={styles.pdfFullBtn} onPress={() => generatePDF('full')}>
              <Text style={styles.pdfFullBtnText}>Generate Full Report (PDF)</Text>
            </TouchableOpacity>

            {/* Individual Report Buttons */}
            <View style={styles.pdfBtnRow}>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.primary }]} onPress={() => generatePDF('activity')}>
                <Text style={styles.pdfBtnText}>Activity Summary</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.info }]} onPress={() => generatePDF('categories')}>
                <Text style={styles.pdfBtnText}>Category Trends</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.warning }]} onPress={() => generatePDF('priority')}>
                <Text style={styles.pdfBtnText}>Priority Report</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.purple }]} onPress={() => generatePDF('workload')}>
                <Text style={styles.pdfBtnText}>Workload Report</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.danger }]} onPress={() => generatePDF('referrals')}>
                <Text style={styles.pdfBtnText}>Referral Outcomes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.success }]} onPress={() => generatePDF('comparison')}>
                <Text style={styles.pdfBtnText}>Type Comparison</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.accent }]} onPress={() => generatePDF('sessions')}>
                <Text style={styles.pdfBtnText}>Sessions Log</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.textSecondary }]} onPress={() => generatePDF('cases')}>
                <Text style={styles.pdfBtnText}>Case Log</Text>
              </TouchableOpacity>
            </View>

            {/* Case Status Distribution */}
            <View style={styles.reportHeaderRow}>
              <Text style={styles.sectionTitle}>Case Status Distribution</Text>
              <TouchableOpacity onPress={() => generatePDF('activity')}><Text style={styles.pdfLink}>PDF</Text></TouchableOpacity>
            </View>
            <View style={styles.reportSectionCard}>
              {CASE_STATUSES.map((st) => {
                const count = cases.filter(c => c.status === st).length;
                const pct = cases.length > 0 ? Math.round((count / cases.length) * 100) : 0;
                return (
                  <View key={st} style={styles.reportBarRow}>
                    <Text style={styles.reportBarLabel}>{st}</Text>
                    <View style={styles.reportBarTrack}>
                      <View style={[styles.reportBarFill, { width: `${pct}%`, backgroundColor: statusColor(st) }]} />
                    </View>
                    <Text style={styles.reportBarCount}>{count}</Text>
                  </View>
                );
              })}
            </View>

            {/* Case Category Breakdown */}
            <View style={styles.reportHeaderRow}>
              <Text style={styles.sectionTitle}>Case Categories</Text>
              <TouchableOpacity onPress={() => generatePDF('categories')}><Text style={styles.pdfLink}>PDF</Text></TouchableOpacity>
            </View>
            <View style={styles.reportSectionCard}>
              {[...new Set(cases.map(c => c.category))].map((cat) => {
                const count = cases.filter(c => c.category === cat).length;
                const pct = cases.length > 0 ? Math.round((count / cases.length) * 100) : 0;
                const catType = cases.find(c => c.category === cat)?.type || 'Academic';
                return (
                  <View key={cat} style={styles.reportBarRow}>
                    <Text style={styles.reportBarLabel}>{cat}</Text>
                    <View style={styles.reportBarTrack}>
                      <View style={[styles.reportBarFill, { width: `${pct}%`, backgroundColor: typeColor(catType) }]} />
                    </View>
                    <Text style={styles.reportBarCount}>{count}</Text>
                  </View>
                );
              })}
            </View>

            {/* Priority Breakdown */}
            <View style={styles.reportHeaderRow}>
              <Text style={styles.sectionTitle}>Priority Breakdown</Text>
              <TouchableOpacity onPress={() => generatePDF('priority')}><Text style={styles.pdfLink}>PDF</Text></TouchableOpacity>
            </View>
            <View style={styles.reportSectionCard}>
              {CASE_PRIORITIES.map((pri) => {
                const count = cases.filter(c => c.priority === pri).length;
                const pct = cases.length > 0 ? Math.round((count / cases.length) * 100) : 0;
                return (
                  <View key={pri} style={styles.reportBarRow}>
                    <Text style={styles.reportBarLabel}>{pri} Priority</Text>
                    <View style={styles.reportBarTrack}>
                      <View style={[styles.reportBarFill, { width: `${pct}%`, backgroundColor: priorityColor(pri) }]} />
                    </View>
                    <Text style={styles.reportBarCount}>{count}</Text>
                  </View>
                );
              })}
            </View>

            {/* Counsellor Workload Comparison */}
            <View style={styles.reportHeaderRow}>
              <Text style={styles.sectionTitle}>Counsellor Workload Comparison</Text>
              <TouchableOpacity onPress={() => generatePDF('workload')}><Text style={styles.pdfLink}>PDF</Text></TouchableOpacity>
            </View>
            <View style={styles.reportSectionCard}>
              {counsellors.map((c) => {
                const total = cases.filter(cs => cs.assignedCounsellor === c.name).length;
                const active = cases.filter(cs => cs.assignedCounsellor === c.name && (cs.status === 'Active' || cs.status === 'Monitor')).length;
                const sess = sessions.filter(s => s.counsellor === c.name).length;
                const appts = appointments.filter(a => a.counsellor === c.name).length;
                return (
                  <View key={c.id} style={styles.workloadCompareRow}>
                    <View style={styles.workloadCompareHeader}>
                      <Text style={styles.workloadCompareName}>{c.name}</Text>
                      <View style={[styles.typeBadge, { backgroundColor: typeColor(c.type) + '20' }]}>
                        <Text style={[styles.typeText, { color: typeColor(c.type) }]}>{c.type}</Text>
                      </View>
                    </View>
                    <View style={styles.workloadCompareStats}>
                      <View style={styles.workloadBox}>
                        <Text style={styles.workloadNum}>{active}</Text>
                        <Text style={styles.workloadLabel}>Active</Text>
                      </View>
                      <View style={styles.workloadBox}>
                        <Text style={styles.workloadNum}>{total}</Text>
                        <Text style={styles.workloadLabel}>Total</Text>
                      </View>
                      <View style={styles.workloadBox}>
                        <Text style={styles.workloadNum}>{sess}</Text>
                        <Text style={styles.workloadLabel}>Sessions</Text>
                      </View>
                      <View style={styles.workloadBox}>
                        <Text style={styles.workloadNum}>{appts}</Text>
                        <Text style={styles.workloadLabel}>Appts</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Referral Outcomes */}
            <View style={styles.reportHeaderRow}>
              <Text style={styles.sectionTitle}>Referral Outcomes</Text>
              <TouchableOpacity onPress={() => generatePDF('referrals')}><Text style={styles.pdfLink}>PDF</Text></TouchableOpacity>
            </View>
            <View style={styles.reportSectionCard}>
              {referrals.length === 0 ? (
                <Text style={styles.emptyText}>No referrals recorded.</Text>
              ) : (
                REFERRAL_STATUSES.map((st) => {
                  const count = referrals.filter(r => r.status === st).length;
                  const pct = referrals.length > 0 ? Math.round((count / referrals.length) * 100) : 0;
                  return (
                    <View key={st} style={styles.reportBarRow}>
                      <Text style={styles.reportBarLabel}>{st}</Text>
                      <View style={styles.reportBarTrack}>
                        <View style={[styles.reportBarFill, { width: `${pct}%`, backgroundColor: statusColor(st) }]} />
                      </View>
                      <Text style={styles.reportBarCount}>{count}</Text>
                    </View>
                  );
                })
              )}
            </View>

            {/* Appointment Status Summary */}
            <View style={styles.reportHeaderRow}>
              <Text style={styles.sectionTitle}>Appointment Status Summary</Text>
              <TouchableOpacity onPress={() => generatePDF('activity')}><Text style={styles.pdfLink}>PDF</Text></TouchableOpacity>
            </View>
            <View style={styles.reportSectionCard}>
              {APPOINTMENT_STATUSES.map((st) => {
                const count = appointments.filter(a => a.status === st).length;
                const pct = appointments.length > 0 ? Math.round((count / appointments.length) * 100) : 0;
                return (
                  <View key={st} style={styles.reportBarRow}>
                    <Text style={styles.reportBarLabel}>{st}</Text>
                    <View style={styles.reportBarTrack}>
                      <View style={[styles.reportBarFill, { width: `${pct}%`, backgroundColor: statusColor(st) }]} />
                    </View>
                    <Text style={styles.reportBarCount}>{count}</Text>
                  </View>
                );
              })}
            </View>

            {/* Academic vs Psychosocial Comparison */}
            <View style={styles.reportHeaderRow}>
              <Text style={styles.sectionTitle}>Academic vs Psychosocial</Text>
              <TouchableOpacity onPress={() => generatePDF('comparison')}><Text style={styles.pdfLink}>PDF</Text></TouchableOpacity>
            </View>
            <View style={styles.reportSectionCard}>
              <View style={styles.compareRow}>
                <View style={[styles.compareCol, { borderLeftColor: colors.info }]}>
                  <Text style={[styles.compareHeader, { color: colors.info }]}>Academic</Text>
                  <Text style={styles.compareStat}>Cases: {academicCases.length}</Text>
                  <Text style={styles.compareStat}>Active: {academicCases.filter(c => c.status === 'Active' || c.status === 'Monitor').length}</Text>
                  <Text style={styles.compareStat}>Closed: {academicCases.filter(c => c.status === 'Closed').length}</Text>
                  <Text style={styles.compareStat}>Sessions: {sessions.filter(s => s.type === 'Academic').length}</Text>
                  <Text style={styles.compareStat}>Appts: {appointments.filter(a => a.type === 'Academic').length}</Text>
                </View>
                <View style={[styles.compareCol, { borderLeftColor: colors.purple }]}>
                  <Text style={[styles.compareHeader, { color: colors.purple }]}>Psychosocial</Text>
                  <Text style={styles.compareStat}>Cases: {psychoCases.length}</Text>
                  <Text style={styles.compareStat}>Active: {psychoCases.filter(c => c.status === 'Active' || c.status === 'Monitor').length}</Text>
                  <Text style={styles.compareStat}>Closed: {psychoCases.filter(c => c.status === 'Closed').length}</Text>
                  <Text style={styles.compareStat}>Sessions: {sessions.filter(s => s.type === 'Psychosocial').length}</Text>
                  <Text style={styles.compareStat}>Appts: {appointments.filter(a => a.type === 'Psychosocial').length}</Text>
                </View>
              </View>
            </View>

            {/* Recent Sessions Log */}
            <View style={styles.reportHeaderRow}>
              <Text style={styles.sectionTitle}>Recent Sessions (Last 5)</Text>
              <TouchableOpacity onPress={() => generatePDF('sessions')}><Text style={styles.pdfLink}>PDF</Text></TouchableOpacity>
            </View>
            <View style={styles.reportSectionCard}>
              {sessions.length === 0 ? (
                <Text style={styles.emptyText}>No sessions logged.</Text>
              ) : (
                sessions.slice(0, 5).map((s) => {
                  const caseInfo = cases.find(c => c.id === s.caseId);
                  return (
                    <View key={s.id} style={styles.recentSessionRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.recentSessionDate}>{s.date}</Text>
                        <Text style={styles.recentSessionSummary}>{s.summary}</Text>
                        <Text style={styles.recentSessionMeta}>{caseInfo?.caseId || 'Unknown'} — {caseInfo?.studentName || 'Unknown'} | {s.counsellor}</Text>
                      </View>
                      <View style={[styles.typeBadge, { backgroundColor: typeColor(s.type) + '20' }]}>
                        <Text style={[styles.typeText, { color: typeColor(s.type) }]}>{s.type}</Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout title="Counselling Unit" navItems={NAV_ITEMS} activeKey={activePage} onNavigate={setActivePage}
      headerRight={<TouchableOpacity onPress={logout} style={styles.logoutBtn}><Text style={styles.logoutText}>Logout</Text></TouchableOpacity>}>
      {renderPage()}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent} contentContainerStyle={{ paddingBottom: spacing.xl }}>
            {modalType === 'case' && (
              <>
                <Text style={styles.modalTitle}>Open New Case</Text>
                <Text style={styles.inputLabel}>Student Name</Text>
                <TextInput style={styles.input} value={caseForm.studentName} onChangeText={(v) => setCaseForm({ ...caseForm, studentName: v })} placeholder="e.g. John Mensah" placeholderTextColor={colors.textLight} />
                <Text style={styles.inputLabel}>Student Class</Text>
                <TextInput style={styles.input} value={caseForm.studentClass} onChangeText={(v) => setCaseForm({ ...caseForm, studentClass: v })} placeholder="e.g. Form 2B" placeholderTextColor={colors.textLight} />
                {renderSelect('Counsellor Type', caseForm.type, ['Academic', 'Psychosocial'] as readonly string[], (v) => {
                  const cat = v === 'Academic' ? CASE_CATEGORIES_ACADEMIC[0] : CASE_CATEGORIES_PSYCHO[0];
                  const counsellor = counsellors.find(c => c.type === v);
                  setCaseForm({ ...caseForm, type: v as CounsellorType, category: cat, assignedCounsellor: counsellor?.name || '' });
                })}
                {renderSelect('Category', caseForm.category, caseForm.type === 'Academic' ? CASE_CATEGORIES_ACADEMIC : CASE_CATEGORIES_PSYCHO, (v) => setCaseForm({ ...caseForm, category: v }))}
                {renderSelect('Priority', caseForm.priority, CASE_PRIORITIES, (v) => setCaseForm({ ...caseForm, priority: v }))}
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput style={[styles.input, styles.textArea]} value={caseForm.description} onChangeText={(v) => setCaseForm({ ...caseForm, description: v })} placeholder="Brief description of the issue..." placeholderTextColor={colors.textLight} multiline numberOfLines={3} />
                <Text style={styles.inputLabel}>Notes (optional)</Text>
                <TextInput style={[styles.input, styles.textArea]} value={caseForm.notes} onChangeText={(v) => setCaseForm({ ...caseForm, notes: v })} placeholder="Initial assessment notes..." placeholderTextColor={colors.textLight} multiline numberOfLines={3} />
                <Text style={styles.inputLabel}>Follow-up Date (YYYY-MM-DD)</Text>
                <TextInput style={styles.input} value={caseForm.followUpDate} onChangeText={(v) => setCaseForm({ ...caseForm, followUpDate: v })} placeholder="e.g. 2026-07-15" placeholderTextColor={colors.textLight} />
                <TouchableOpacity style={styles.checkboxRow} onPress={() => setCaseForm({ ...caseForm, confidential: !caseForm.confidential })}>
                  <View style={[styles.checkbox, caseForm.confidential && styles.checkboxDone]}>{caseForm.confidential ? <Text style={styles.checkmark}>✓</Text> : null}</View>
                  <Text style={styles.checkboxLabel}>Mark as Confidential</Text>
                </TouchableOpacity>
              </>
            )}
            {modalType === 'session' && (
              <>
                <Text style={styles.modalTitle}>Log Counselling Session</Text>
                <Text style={styles.inputLabel}>Case: {selectedCase?.caseId} — {selectedCase?.studentName}</Text>
                <Text style={styles.inputLabel}>Counsellor</Text>
                <TextInput style={styles.input} value={sessionForm.counsellor} onChangeText={(v) => setSessionForm({ ...sessionForm, counsellor: v })} placeholder="Counsellor name" placeholderTextColor={colors.textLight} />
                {renderSelect('Type', sessionForm.type, ['Academic', 'Psychosocial'] as readonly string[], (v) => setSessionForm({ ...sessionForm, type: v as CounsellorType }))}
                <Text style={styles.inputLabel}>Session Summary</Text>
                <TextInput style={styles.input} value={sessionForm.summary} onChangeText={(v) => setSessionForm({ ...sessionForm, summary: v })} placeholder="e.g. Follow-up assessment" placeholderTextColor={colors.textLight} />
                <Text style={styles.inputLabel}>Session Notes</Text>
                <TextInput style={[styles.input, styles.textArea]} value={sessionForm.notes} onChangeText={(v) => setSessionForm({ ...sessionForm, notes: v })} placeholder="Detailed notes from the session..." placeholderTextColor={colors.textLight} multiline numberOfLines={4} />
                <Text style={styles.inputLabel}>Next Action</Text>
                <TextInput style={styles.input} value={sessionForm.nextAction} onChangeText={(v) => setSessionForm({ ...sessionForm, nextAction: v })} placeholder="e.g. Schedule parent meeting" placeholderTextColor={colors.textLight} />
                <Text style={styles.inputLabel}>Next Session Date (YYYY-MM-DD)</Text>
                <TextInput style={styles.input} value={sessionForm.nextSessionDate} onChangeText={(v) => setSessionForm({ ...sessionForm, nextSessionDate: v })} placeholder="e.g. 2026-07-20" placeholderTextColor={colors.textLight} />
              </>
            )}
            {modalType === 'appointment' && (
              <>
                <Text style={styles.modalTitle}>Book Appointment</Text>
                {renderSelect('Counsellor Type', apptForm.type, ['Academic', 'Psychosocial'] as readonly string[], (v) => {
                  const counsellor = counsellors.find(c => c.type === v);
                  setApptForm({ ...apptForm, type: v as CounsellorType, counsellor: counsellor?.name || '' });
                })}
                <Text style={styles.inputLabel}>Assigned Counsellor: {apptForm.counsellor}</Text>
                <Text style={styles.inputLabel}>Student Name</Text>
                <TextInput style={styles.input} value={apptForm.studentName} onChangeText={(v) => setApptForm({ ...apptForm, studentName: v })} placeholder="Student name" placeholderTextColor={colors.textLight} />
                <Text style={styles.inputLabel}>Student Class</Text>
                <TextInput style={styles.input} value={apptForm.studentClass} onChangeText={(v) => setApptForm({ ...apptForm, studentClass: v })} placeholder="e.g. Form 2B" placeholderTextColor={colors.textLight} />
                <Text style={styles.inputLabel}>Date (YYYY-MM-DD)</Text>
                <TextInput style={styles.input} value={apptForm.date} onChangeText={(v) => setApptForm({ ...apptForm, date: v })} placeholder="e.g. 2026-07-10" placeholderTextColor={colors.textLight} />
                {renderSelect('Time', apptForm.time, TIME_SLOTS, (v) => setApptForm({ ...apptForm, time: v }))}
                <Text style={styles.inputLabel}>Reason for Visit</Text>
                <TextInput style={[styles.input, styles.textArea]} value={apptForm.reason} onChangeText={(v) => setApptForm({ ...apptForm, reason: v })} placeholder="Brief reason for the appointment..." placeholderTextColor={colors.textLight} multiline numberOfLines={2} />
              </>
            )}
            {modalType === 'referral' && (
              <>
                <Text style={styles.modalTitle}>New Referral</Text>
                <Text style={styles.inputLabel}>Student Name</Text>
                <TextInput style={styles.input} value={referralForm.studentName} onChangeText={(v) => setReferralForm({ ...referralForm, studentName: v })} placeholder="Student name" placeholderTextColor={colors.textLight} />
                <Text style={styles.inputLabel}>Student Class</Text>
                <TextInput style={styles.input} value={referralForm.studentClass} onChangeText={(v) => setReferralForm({ ...referralForm, studentClass: v })} placeholder="e.g. Form 3C" placeholderTextColor={colors.textLight} />
                {renderSelect('Counsellor Type', referralForm.type, ['Academic', 'Psychosocial'] as readonly string[], (v) => setReferralForm({ ...referralForm, type: v as CounsellorType }))}
                <Text style={styles.inputLabel}>Referred To</Text>
                <TextInput style={styles.input} value={referralForm.referredTo} onChangeText={(v) => setReferralForm({ ...referralForm, referredTo: v })} placeholder="e.g. Clinical Psychologist" placeholderTextColor={colors.textLight} />
                <Text style={styles.inputLabel}>Reason</Text>
                <TextInput style={[styles.input, styles.textArea]} value={referralForm.reason} onChangeText={(v) => setReferralForm({ ...referralForm, reason: v })} placeholder="Reason for referral..." placeholderTextColor={colors.textLight} multiline numberOfLines={2} />
                <Text style={styles.inputLabel}>Notes (optional)</Text>
                <TextInput style={[styles.input, styles.textArea]} value={referralForm.notes} onChangeText={(v) => setReferralForm({ ...referralForm, notes: v })} placeholder="Additional notes..." placeholderTextColor={colors.textLight} multiline numberOfLines={2} />
              </>
            )}
            {modalType === 'resource' && (
              <>
                <Text style={styles.modalTitle}>Add Career Resource</Text>
                <Text style={styles.inputLabel}>Resource Title</Text>
                <TextInput style={styles.input} value={resourceForm.title} onChangeText={(v) => setResourceForm({ ...resourceForm, title: v })} placeholder="e.g. UG Admission Requirements" placeholderTextColor={colors.textLight} />
                {renderSelect('Category', resourceForm.category, RESOURCE_CATEGORIES, (v) => setResourceForm({ ...resourceForm, category: v }))}
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput style={[styles.input, styles.textArea]} value={resourceForm.description} onChangeText={(v) => setResourceForm({ ...resourceForm, description: v })} placeholder="Brief description..." placeholderTextColor={colors.textLight} multiline numberOfLines={2} />
                <Text style={styles.inputLabel}>Link (optional)</Text>
                <TextInput style={styles.input} value={resourceForm.link} onChangeText={(v) => setResourceForm({ ...resourceForm, link: v })} placeholder="https://..." placeholderTextColor={colors.textLight} />
              </>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={closeModal}>
                <Text style={styles.modalBtnTextDark}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={() => {
                switch (modalType) {
                  case 'case': handleSaveCase(); break;
                  case 'session': handleSaveSession(); break;
                  case 'appointment': handleSaveAppt(); break;
                  case 'referral': handleSaveReferral(); break;
                  case 'resource': handleSaveResource(); break;
                }
              }}>
                <Text style={styles.modalBtnTextLight}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
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

  // Alerts
  alertCard: { backgroundColor: colors.warningBg, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg, borderLeftWidth: 4, borderLeftColor: colors.warning },
  alertTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, marginBottom: spacing.xs },
  alertText: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs },

  // Quick actions
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  quickBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, marginBottom: spacing.sm },
  quickBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },

  // Badges
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  statusText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  typeBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  typeText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  priorityBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm },
  priorityText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },

  // Filter chips
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  filterChip: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: fontSize.xs, color: colors.textSecondary },
  filterTextActive: { color: colors.white, fontWeight: fontWeight.semibold },

  // Case cards
  caseCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  caseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  caseIdRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  caseId: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.primary },
  confidentialTag: { fontSize: fontSize.xs, color: colors.danger, fontWeight: fontWeight.semibold },
  caseStudent: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, marginTop: spacing.xs },
  caseMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  caseDesc: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs, fontStyle: 'italic' },
  caseBadges: { flexDirection: 'column', alignItems: 'flex-end', gap: 4 },
  followUpText: { fontSize: fontSize.xs, color: colors.warning, fontWeight: fontWeight.semibold, marginTop: spacing.sm },

  // Case detail
  backLink: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.semibold, marginBottom: spacing.md },
  detailCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg, borderLeftWidth: 4 },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  detailCaseId: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.primary },
  detailStudent: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, marginTop: spacing.xs },
  detailMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  detailDesc: { fontSize: fontSize.sm, color: colors.text, marginTop: spacing.sm },
  detailNotes: { fontSize: fontSize.xs, color: colors.textLight, fontStyle: 'italic', marginTop: spacing.sm },

  // Session cards
  sessionCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderLeftWidth: 3, borderLeftColor: colors.info },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  sessionDate: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text },
  sessionMeta: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  sessionNotes: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  sessionNext: { fontSize: fontSize.xs, color: colors.primary, fontWeight: fontWeight.semibold, marginTop: spacing.xs },
  sessionNextDate: { fontSize: fontSize.xs, color: colors.info, marginTop: 2 },

  // Appointment cards
  apptCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  apptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  apptDateTime: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  apptStudent: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  apptMeta: { fontSize: fontSize.xs, color: colors.textLight, marginTop: 2 },
  apptNotes: { fontSize: fontSize.xs, color: colors.textLight, fontStyle: 'italic', marginTop: spacing.xs },
  apptActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },

  // Referral cards
  referralCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  referralHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  referralStudent: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  referralMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  referralReason: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  referralNotes: { fontSize: fontSize.xs, color: colors.textLight, fontStyle: 'italic', marginTop: spacing.xs },

  // Resource cards
  resourceCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  resourceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  resourceTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  resourceMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  resourceDesc: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  resourceLink: { fontSize: fontSize.sm, color: colors.info, marginTop: spacing.xs },

  // Counsellor cards
  counsellorCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderLeftWidth: 4 },
  counsellorProfileCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg, borderLeftWidth: 4 },
  counsellorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  counsellorName: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  counsellorTitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  counsellorMeta: { fontSize: fontSize.xs, color: colors.textLight, marginTop: 2 },
  counsellorDetail: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  workloadRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  workloadStat: { fontSize: fontSize.sm, color: colors.textSecondary, backgroundColor: colors.surfaceAlt, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  workloadBox: { alignItems: 'center', backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: spacing.sm, minWidth: 70 },
  workloadNum: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.primary },
  workloadLabel: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },

  // Card actions
  cardActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  editLink: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.primary },
  deleteLink: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.danger },

  // Reports
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
  reportBarCount: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.text, width: 30, textAlign: 'right' },
  workloadCompareRow: { marginBottom: spacing.md, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  workloadCompareHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  workloadCompareName: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  workloadCompareStats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  compareRow: { flexDirection: 'row', gap: spacing.md },
  compareCol: { flex: 1, backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: spacing.md, borderLeftWidth: 4 },
  compareHeader: { fontSize: fontSize.md, fontWeight: fontWeight.bold, marginBottom: spacing.sm },
  compareStat: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  recentSessionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: spacing.sm, marginBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  recentSessionDate: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.text },
  recentSessionSummary: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  recentSessionMeta: { fontSize: fontSize.xs, color: colors.textLight, marginTop: 2 },

  // Modal
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
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  checkbox: { width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxDone: { backgroundColor: colors.success, borderColor: colors.success },
  checkmark: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  checkboxLabel: { fontSize: fontSize.sm, color: colors.text },
  modalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  modalBtn: { flex: 1, borderRadius: radius.md, paddingVertical: spacing.sm + 2, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  modalBtnSubmit: { backgroundColor: colors.primary },
  modalBtnTextDark: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  modalBtnTextLight: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.white },
});
