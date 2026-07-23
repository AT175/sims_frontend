import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useAuthStore } from '@store/authStore';
import {
  useSecurityStore,
  INCIDENT_TYPES, INCIDENT_SEVERITIES, INCIDENT_STATUSES,
  SHIFT_NAMES, GATE_STATUSES, CHECKLIST_CATEGORIES,
} from '@store/securityStore';
import type {
  IncidentSeverity, IncidentType,
  ShiftName,
} from '@store/securityStore';
import { useExeatStore } from '@store/exeatStore';

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'gate', label: 'Gate Log' },
  { key: 'exeats', label: 'Exeat Verification' },
  { key: 'incidents', label: 'Incident Reports' },
  { key: 'patrol', label: 'Patrol Schedule' },
  { key: 'visitors', label: 'Visitor Pre-Reg' },
  { key: 'checklist', label: 'Daily Checklist' },
  { key: 'guards', label: 'Guards' },
  { key: 'reports', label: 'Reports' },
];

const nowTime = () => new Date().toTimeString().slice(0, 5);
const todayStr = () => new Date().toISOString().slice(0, 10);

export function SecurityDashboard() {
  const [activePage, setActivePage] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const { user, logout } = useAuthStore();
  const guardName = user?.displayName ?? 'Security Officer';

  const {
    guards, incidents, patrolShifts, visitors, checklist,
    addGateLog, updateGateStatus, deleteGateLog, getTodayGateLogs, getCurrentlyIn,
    addIncident, updateIncidentStatus, deleteIncident, getActiveIncidents, getCriticalIncidents,
    addPatrolShift, updatePatrolShift, deletePatrolShift,
    addVisitor, updateVisitorStatus, deleteVisitor, getExpectedVisitors,
    toggleChecklistItem, addChecklistItem, deleteChecklistItem, getPendingChecklist, getChecklistProgress,
    addGuard, updateGuard, deleteGuard,
  } = useSecurityStore();

  const {
    exeats, getActiveAtGate, checkOut, checkIn,
  } = useExeatStore();
  const [exeatSearch, setExeatSearch] = useState('');

  // ── Form state ──
  const [gateForm, setGateForm] = useState({ visitorName: '', vehiclePlate: '', purpose: '', host: '' });
  const [incidentForm, setIncidentForm] = useState({
    type: 'Theft' as IncidentType, location: '', description: '',
    severity: 'Low' as IncidentSeverity, reportedBy: '', witnesses: '',
  });
  const [patrolForm, setPatrolForm] = useState({
    shift: 'Morning' as ShiftName, startTime: '06:00', endTime: '14:00',
    guardName: guards[0]?.name || '', zone: '', notes: '',
  });
  const [visitorForm, setVisitorForm] = useState({
    name: '', expectedDate: todayStr(), expectedTime: '10:00',
    purpose: '', host: '', phone: '', vehiclePlate: '',
  });
  const [checklistForm, setChecklistForm] = useState({ item: '', category: 'Perimeter', requiredTime: '08:00' });
  const [guardForm, setGuardForm] = useState({ name: '', phone: '', shift: 'Morning' as ShiftName, zone: '', onLeave: false });

  const openModal = (type: string) => { setModalType(type); setShowModal(true); };
  const closeModal = () => { setShowModal(false); };

  // ── Handlers ──
  const handleSaveGate = () => {
    if (!gateForm.visitorName.trim()) { Alert.alert('Error', 'Visitor name is required'); return; }
    addGateLog({
      time: nowTime(), date: todayStr(), visitorName: gateForm.visitorName.trim(),
      vehiclePlate: gateForm.vehiclePlate.trim() || '-', purpose: gateForm.purpose.trim(),
      host: gateForm.host.trim() || '-', status: 'In', checkInTime: nowTime(),
    });
    setGateForm({ visitorName: '', vehiclePlate: '', purpose: '', host: '' });
    closeModal();
  };

  const handleSaveIncident = () => {
    if (!incidentForm.location.trim() || !incidentForm.description.trim()) { Alert.alert('Error', 'Location and description are required'); return; }
    const count = incidents.length + 1;
    addIncident({
      incidentId: `INC-2026-${String(count).padStart(3, '0')}`,
      date: todayStr(), time: nowTime(),
      type: incidentForm.type, location: incidentForm.location.trim(),
      description: incidentForm.description.trim(), severity: incidentForm.severity,
      status: 'Reported', reportedBy: incidentForm.reportedBy.trim() || 'Security Officer',
      witnesses: incidentForm.witnesses.trim() || undefined,
    });
    setIncidentForm({ type: 'Theft', location: '', description: '', severity: 'Low', reportedBy: '', witnesses: '' });
    closeModal();
  };

  const handleSavePatrol = () => {
    if (!patrolForm.guardName || !patrolForm.zone.trim()) { Alert.alert('Error', 'Guard and zone are required'); return; }
    addPatrolShift({
      shift: patrolForm.shift, startTime: patrolForm.startTime, endTime: patrolForm.endTime,
      guardName: patrolForm.guardName, zone: patrolForm.zone.trim(), notes: patrolForm.notes.trim(), completed: false,
    });
    setPatrolForm({ shift: 'Morning', startTime: '06:00', endTime: '14:00', guardName: guards[0]?.name || '', zone: '', notes: '' });
    closeModal();
  };

  const handleSaveVisitor = () => {
    if (!visitorForm.name.trim() || !visitorForm.host.trim()) { Alert.alert('Error', 'Visitor name and host are required'); return; }
    addVisitor({
      name: visitorForm.name.trim(), expectedDate: visitorForm.expectedDate,
      expectedTime: visitorForm.expectedTime, purpose: visitorForm.purpose.trim(),
      host: visitorForm.host.trim(), phone: visitorForm.phone.trim(),
      vehiclePlate: visitorForm.vehiclePlate.trim() || undefined, status: 'Expected',
    });
    setVisitorForm({ name: '', expectedDate: todayStr(), expectedTime: '10:00', purpose: '', host: '', phone: '', vehiclePlate: '' });
    closeModal();
  };

  const handleSaveChecklist = () => {
    if (!checklistForm.item.trim()) { Alert.alert('Error', 'Checklist item is required'); return; }
    addChecklistItem({ item: checklistForm.item.trim(), category: checklistForm.category, requiredTime: checklistForm.requiredTime });
    setChecklistForm({ item: '', category: 'Perimeter', requiredTime: '08:00' });
    closeModal();
  };

  const handleSaveGuard = () => {
    if (!guardForm.name.trim()) { Alert.alert('Error', 'Guard name is required'); return; }
    addGuard({ name: guardForm.name.trim(), phone: guardForm.phone.trim(), shift: guardForm.shift, zone: guardForm.zone.trim(), onLeave: guardForm.onLeave });
    setGuardForm({ name: '', phone: '', shift: 'Morning', zone: '', onLeave: false });
    closeModal();
  };

  const handleDelete = (id: string, type: string, name: string) =>
    Alert.alert('Delete', `Delete this ${type}${name ? ` (${name})` : ''}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        if (type === 'gate log') deleteGateLog(id);
        else if (type === 'incident') deleteIncident(id);
        else if (type === 'patrol shift') deletePatrolShift(id);
        else if (type === 'visitor') deleteVisitor(id);
        else if (type === 'checklist item') deleteChecklistItem(id);
        else if (type === 'guard') deleteGuard(id);
      } },
    ]);

  // ── Computed ──
  const todayLogs = getTodayGateLogs();
  const currentlyIn = getCurrentlyIn();
  const activeIncidents = getActiveIncidents();
  const criticalIncidents = getCriticalIncidents();
  const expectedVisitors = getExpectedVisitors();
  const pendingChecklist = getPendingChecklist();
  const checklistProgress = getChecklistProgress();
  const activeGuards = guards.filter(g => !g.onLeave);

  const statusColor = (s: string) =>
    s === 'In' || s === 'Arrived' ? colors.success :
    s === 'Out' || s === 'Departed' ? colors.textSecondary :
    s === 'Denied' || s === 'Cancelled' || s === 'Escalated' ? colors.danger :
    s === 'Expected' || s === 'Reported' ? colors.warning :
    s === 'Under Investigation' ? colors.info :
    s === 'Resolved' || s === 'Completed' ? colors.success :
    s === 'Critical' || s === 'High' ? colors.danger :
    s === 'Medium' ? colors.warning : s === 'Low' ? colors.textSecondary : colors.primary;

  const severityColor = (s: IncidentSeverity) =>
    s === 'Critical' ? colors.danger : s === 'High' ? colors.warning : s === 'Medium' ? colors.info : colors.textSecondary;

  // ── PDF Generation ──
  const generatePDF = (reportType: string) => {
    const now = new Date().toLocaleString();
    const dateStr = todayStr();
    let body = '';
    let title = '';

    if (reportType === 'full' || reportType === 'activity') {
      title = 'Security Activity Summary';
      body += `<h2>Overview</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px">
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Total Gate Entries Today</td><td style="padding:8px 12px;border:1px solid #ddd">${todayLogs.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Currently On Premises</td><td style="padding:8px 12px;border:1px solid #ddd">${currentlyIn.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Active Incidents</td><td style="padding:8px 12px;border:1px solid #ddd">${activeIncidents.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Critical/High Incidents</td><td style="padding:8px 12px;border:1px solid #ddd">${criticalIncidents.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Expected Visitors</td><td style="padding:8px 12px;border:1px solid #ddd">${expectedVisitors.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Checklist Progress</td><td style="padding:8px 12px;border:1px solid #ddd">${checklistProgress.done}/${checklistProgress.total} (${checklistProgress.pct}%)</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Active Guards</td><td style="padding:8px 12px;border:1px solid #ddd">${activeGuards.length}</td></tr>
      </table>`;
    }

    if (reportType === 'full' || reportType === 'gate') {
      title = reportType === 'full' ? title : 'Gate Log Report';
      body += `<h2>Gate Log (Today)</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Time</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Visitor</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Vehicle</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Purpose</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Host</th>
        <th style="padding:6px 8px;border:1px solid #ddd">Status</th>
      </tr></thead><tbody>`;
      todayLogs.forEach(g => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${g.time}</td><td style="padding:4px 8px;border:1px solid #ddd">${g.visitorName}</td><td style="padding:4px 8px;border:1px solid #ddd">${g.vehiclePlate}</td><td style="padding:4px 8px;border:1px solid #ddd">${g.purpose}</td><td style="padding:4px 8px;border:1px solid #ddd">${g.host}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${g.status}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'incidents') {
      title = reportType === 'full' ? title : 'Incident Report';
      body += `<h2>Incidents</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">ID</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Date</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Type</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Location</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Severity</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Status</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Reported By</th>
      </tr></thead><tbody>`;
      incidents.forEach(i => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${i.incidentId}</td><td style="padding:4px 8px;border:1px solid #ddd">${i.date}</td><td style="padding:4px 8px;border:1px solid #ddd">${i.type}</td><td style="padding:4px 8px;border:1px solid #ddd">${i.location}</td><td style="padding:4px 8px;border:1px solid #ddd">${i.severity}</td><td style="padding:4px 8px;border:1px solid #ddd">${i.status}</td><td style="padding:4px 8px;border:1px solid #ddd">${i.reportedBy}</td></tr>`;
      });
      body += `</tbody></table>`;
      body += `<h2>Incident Details</h2>`;
      incidents.forEach(i => {
        body += `<div style="margin-bottom:15px;padding:10px;border-left:4px solid #ccc;background:#f9f9f9">
          <strong>${i.incidentId}</strong> — ${i.type} (${i.severity})<br/>
          <em>${i.date} at ${i.time}, ${i.location}</em><br/>
          ${i.description}<br/>
          <strong>Status:</strong> ${i.status} | <strong>Reported by:</strong> ${i.reportedBy}${i.assignedTo ? ` | <strong>Assigned to:</strong> ${i.assignedTo}` : ''}<br/>
          ${i.resolution ? `<strong>Resolution:</strong> ${i.resolution}` : ''}${i.witnesses ? `<br/><strong>Witnesses:</strong> ${i.witnesses}` : ''}
        </div>`;
      });
    }

    if (reportType === 'full' || reportType === 'patrol') {
      title = reportType === 'full' ? title : 'Patrol Schedule Report';
      body += `<h2>Patrol Schedule</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Shift</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Time</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Guard</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Zone</th>
        <th style="padding:6px 8px;border:1px solid #ddd">Done</th>
      </tr></thead><tbody>`;
      patrolShifts.forEach(p => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${p.shift}</td><td style="padding:4px 8px;border:1px solid #ddd">${p.startTime}-${p.endTime}</td><td style="padding:4px 8px;border:1px solid #ddd">${p.guardName}</td><td style="padding:4px 8px;border:1px solid #ddd">${p.zone}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${p.completed ? 'Yes' : 'No'}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'visitors') {
      title = reportType === 'full' ? title : 'Visitor Report';
      body += `<h2>Pre-Registered Visitors</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Name</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Expected</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Purpose</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Host</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Phone</th>
        <th style="padding:6px 8px;border:1px solid #ddd">Status</th>
      </tr></thead><tbody>`;
      visitors.forEach(v => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${v.name}</td><td style="padding:4px 8px;border:1px solid #ddd">${v.expectedDate} ${v.expectedTime}</td><td style="padding:4px 8px;border:1px solid #ddd">${v.purpose}</td><td style="padding:4px 8px;border:1px solid #ddd">${v.host}</td><td style="padding:4px 8px;border:1px solid #ddd">${v.phone}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${v.status}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'checklist') {
      title = reportType === 'full' ? title : 'Daily Checklist Report';
      body += `<h2>Daily Checklist (${checklistProgress.done}/${checklistProgress.total} completed)</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Item</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Category</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Required By</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Completed</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">By</th>
      </tr></thead><tbody>`;
      checklist.forEach(c => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${c.item}</td><td style="padding:4px 8px;border:1px solid #ddd">${c.category}</td><td style="padding:4px 8px;border:1px solid #ddd">${c.requiredTime}</td><td style="padding:4px 8px;border:1px solid #ddd">${c.done ? c.completedTime || '-' : 'PENDING'}</td><td style="padding:4px 8px;border:1px solid #ddd">${c.completedBy || '-'}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'guards') {
      title = reportType === 'full' ? 'Comprehensive Security Report' : 'Guard Roster Report';
      body += `<h2>Guard Roster</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Name</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Phone</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Shift</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Zone</th>
        <th style="padding:6px 8px;border:1px solid #ddd">On Leave</th>
      </tr></thead><tbody>`;
      guards.forEach(g => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${g.name}</td><td style="padding:4px 8px;border:1px solid #ddd">${g.phone}</td><td style="padding:4px 8px;border:1px solid #ddd">${g.shift}</td><td style="padding:4px 8px;border:1px solid #ddd">${g.zone}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${g.onLeave ? 'Yes' : 'No'}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
      <style>
        * { font-family: 'Segoe UI', Arial, sans-serif; }
        body { padding: 40px; color: #1A1A2E; max-width: 900px; margin: 0 auto; }
        h1 { color: #0F4C75; border-bottom: 3px solid #0F4C75; padding-bottom: 10px; }
        h2 { color: #2D3142; margin-top: 30px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px; color: #888; }
        .confidential { background: #FDECEC; border-left: 4px solid #E5484D; padding: 10px 15px; margin: 15px 0; font-size: 13px; color: #991111; }
        table { font-size: 13px; }
        th { font-weight: 600; }
        .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 11px; color: #aaa; text-align: center; }
        @media print { body { padding: 20px; } }
      </style></head><body>
      <div class="header"><span>SIMS — Security Unit</span><span>Generated: ${now}</span></div>
      <h1>${title}</h1>
      <div class="confidential">SECURITY CONFIDENTIAL — This report contains security operational data. Access is restricted to authorised security staff and school administration only.</div>
      ${body}
      <div class="footer">School Information Management System (SIMS) — Security Unit Report — ${dateStr}</div>
      <script>window.onload = function() { window.print(); }</script>
      </body></html>`;

    const printWin = window.open('', '_blank');
    if (printWin) { printWin.document.write(html); printWin.document.close(); }
    else { Alert.alert('Popup Blocked', 'Please allow popups to generate PDF reports.'); }
  };

  // ── Render helpers ──
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

  const renderBadge = (text: string, color: string) => (
    <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
      <Text style={[styles.statusText, { color }]}>{text}</Text>
    </View>
  );

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return (
          <View>
            <CardGrid>
              <StatCard label="Visitors Today" value={todayLogs.length} subtitle={`${currentlyIn.length} on premises`} accentColor={colors.primary} />
              <StatCard label="Active Incidents" value={activeIncidents.length} subtitle={`${criticalIncidents.length} critical`} accentColor={activeIncidents.length > 0 ? colors.danger : colors.success} />
              <StatCard label="Expected Visitors" value={expectedVisitors.length} subtitle="Upcoming" accentColor={colors.info} />
              <StatCard label="Checklist" value={`${checklistProgress.pct}%`} subtitle={`${checklistProgress.done}/${checklistProgress.total} done`} accentColor={checklistProgress.pct === 100 ? colors.success : colors.warning} />
            </CardGrid>

            {criticalIncidents.length > 0 && (
              <View style={[styles.alertCard, { borderLeftColor: colors.danger }]}>
                <Text style={[styles.alertTitle, { color: colors.danger }]}>Critical/High Incidents ({criticalIncidents.length})</Text>
                {criticalIncidents.map((i) => (
                  <TouchableOpacity key={i.id} onPress={() => setActivePage('incidents')}>
                    <Text style={[styles.alertText, { color: colors.danger }]}>{i.incidentId} — {i.type} at {i.location} | {i.severity} | {i.status}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {pendingChecklist.length > 0 && (
              <View style={[styles.alertCard, { borderLeftColor: colors.warning }]}>
                <Text style={[styles.alertTitle, { color: colors.warning }]}>{pendingChecklist.length} Checklist Items Pending</Text>
                {pendingChecklist.slice(0, 4).map((c) => (
                  <Text key={c.id} style={styles.alertText}>{c.item} — required by {c.requiredTime}</Text>
                ))}
                {pendingChecklist.length > 4 && <Text style={styles.alertText}>...and {pendingChecklist.length - 4} more</Text>}
              </View>
            )}

            {expectedVisitors.length > 0 && (
              <View style={[styles.alertCard, { borderLeftColor: colors.info }]}>
                <Text style={[styles.alertTitle, { color: colors.info }]}>Expected Visitors ({expectedVisitors.length})</Text>
                {expectedVisitors.map((v) => (
                  <Text key={v.id} style={styles.alertText}>{v.name} — {v.expectedDate} at {v.expectedTime} | Host: {v.host}</Text>
                ))}
              </View>
            )}

            {currentlyIn.length > 0 && (
              <View style={[styles.alertCard, { borderLeftColor: colors.success }]}>
                <Text style={[styles.alertTitle, { color: colors.success }]}>Currently On Premises ({currentlyIn.length})</Text>
                {currentlyIn.map((g) => (
                  <Text key={g.id} style={styles.alertText}>{g.visitorName} — {g.purpose} | In since {g.checkInTime}</Text>
                ))}
              </View>
            )}

            <Text style={styles.sectionTitle}>Patrol Status</Text>
            {patrolShifts.map((p) => (
              <View key={p.id} style={styles.patrolCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.patrolShift}>{p.shift} ({p.startTime} - {p.endTime})</Text>
                  <Text style={styles.patrolGuard}>{p.guardName} — {p.zone}</Text>
                </View>
                {renderBadge(p.completed ? 'Completed' : 'Active', p.completed ? colors.success : colors.warning)}
              </View>
            ))}

            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.primary }]} onPress={() => { setGateForm({ visitorName: '', vehiclePlate: '', purpose: '', host: '' }); openModal('gate'); }}>
                <Text style={styles.quickBtnText}>+ Log Entry</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.danger }]} onPress={() => { setIncidentForm({ type: 'Theft', location: '', description: '', severity: 'Low', reportedBy: '', witnesses: '' }); openModal('incident'); }}>
                <Text style={styles.quickBtnText}>+ Report Incident</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.info }]} onPress={() => { setVisitorForm({ name: '', expectedDate: todayStr(), expectedTime: '10:00', purpose: '', host: '', phone: '', vehiclePlate: '' }); openModal('visitor'); }}>
                <Text style={styles.quickBtnText}>+ Pre-Register</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.success }]} onPress={() => setActivePage('checklist')}>
                <Text style={styles.quickBtnText}>View Checklist</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'gate':
        return (
          <View>
            <CardGrid>
              <StatCard label="Entries Today" value={todayLogs.length} accentColor={colors.primary} />
              <StatCard label="Currently In" value={currentlyIn.length} accentColor={colors.success} />
              <StatCard label="Denied" value={todayLogs.filter(g => g.status === 'Denied').length} accentColor={colors.danger} />
              <StatCard label="Checked Out" value={todayLogs.filter(g => g.status === 'Out').length} accentColor={colors.textSecondary} />
            </CardGrid>

            <TouchableOpacity style={styles.actionBtn} onPress={() => { setGateForm({ visitorName: '', vehiclePlate: '', purpose: '', host: '' }); openModal('gate'); }}>
              <Text style={styles.actionBtnText}>+ Log New Entry</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Today's Log ({todayLogs.length})</Text>
            {todayLogs.length === 0 ? (
              <Text style={styles.emptyText}>No entries logged today.</Text>
            ) : (
              todayLogs.map((g) => (
                <View key={g.id} style={styles.gateCard}>
                  <View style={styles.gateHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.gateTime}>{g.time} — {g.visitorName}</Text>
                      <Text style={styles.gateMeta}>Vehicle: {g.vehiclePlate} | Host: {g.host}</Text>
                      <Text style={styles.gateMeta}>Purpose: {g.purpose}</Text>
                      {g.checkInTime && <Text style={styles.gateMeta}>In: {g.checkInTime}{g.checkOutTime ? ` | Out: ${g.checkOutTime}` : ''}</Text>}
                      {g.notes && <Text style={styles.gateNotes}>{g.notes}</Text>}
                    </View>
                    <View style={styles.gateActions}>
                      {renderBadge(g.status, statusColor(g.status))}
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    {g.status === 'In' && (
                      <TouchableOpacity onPress={() => updateGateStatus(g.id, 'Out')}>
                        <Text style={styles.actionLink}>Check Out</Text>
                      </TouchableOpacity>
                    )}
                    {g.status === 'Out' && (
                      <TouchableOpacity onPress={() => updateGateStatus(g.id, 'In')}>
                        <Text style={styles.actionLink}>Check Back In</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => handleDelete(g.id, 'gate log', g.visitorName)}>
                      <Text style={styles.deleteLink}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        );

      case 'exeats': {
        const activeExeats = getActiveAtGate();
        const checkedOutExeats = activeExeats.filter(e => e.status === 'Checked Out');
        const approvedExeats = activeExeats.filter(e => e.status === 'Approved');
        const recentlyReturned = exeats.filter(e => e.status === 'Checked In');
        const allExeats = exeats;
        const searchResult = exeatSearch.trim() ? allExeats.find(e =>
          e.exeatNo.toLowerCase().includes(exeatSearch.toLowerCase()) ||
          e.admissionNo.toLowerCase().includes(exeatSearch.toLowerCase()) ||
          e.studentName.toLowerCase().includes(exeatSearch.toLowerCase())
        ) : null;
        return (
          <View>
            <CardGrid>
              <StatCard label="Approved (Ready)" value={approvedExeats.length} subtitle="can check out" accentColor={colors.warning} />
              <StatCard label="Checked Out" value={checkedOutExeats.length} subtitle="currently outside" accentColor={colors.info} />
              <StatCard label="Total Active" value={activeExeats.length} accentColor={colors.primary} />
              <StatCard label="Returned" value={recentlyReturned.length} accentColor={colors.success} />
            </CardGrid>

            <Text style={styles.pageTitle}>Exeat Verification — Gate Check</Text>
            <Text style={styles.pageSubtitle}>All approved exeats are listed below — verify and check students in/out at the gate</Text>

            <View style={styles.exeatSearchBox}>
              <TextInput
                style={styles.exeatSearchInput}
                placeholder="Search by Exeat No, Admission No, or Student Name..."
                placeholderTextColor={colors.textLight}
                value={exeatSearch}
                onChangeText={setExeatSearch}
              />
            </View>

            {exeatSearch.trim() && searchResult && (
              <View style={[styles.exeatResultCard, { borderLeftColor: searchResult.status === 'Approved' ? colors.warning : searchResult.status === 'Checked Out' ? colors.info : searchResult.status === 'Checked In' ? colors.success : searchResult.status === 'Rejected' ? colors.danger : colors.textSecondary }]}>
                <Text style={styles.exeatResultTitle}>{searchResult.studentName} ({searchResult.admissionNo})</Text>
                <Text style={styles.exeatResultMeta}>Exeat No: {searchResult.exeatNo} | {searchResult.house} House | Class: {searchResult.class || '-'}</Text>
                <Text style={styles.exeatResultMeta}>Destination: {searchResult.destination}</Text>
                <Text style={styles.exeatResultMeta}>Departure: {searchResult.departureDate} | Return: {searchResult.returnDate}</Text>
                <Text style={styles.exeatResultMeta}>Reason: {searchResult.reason} — {searchResult.reasonDetail}</Text>
                <Text style={styles.exeatResultMeta}>Guardian: {searchResult.guardianName} ({searchResult.guardianPhone || 'N/A'})</Text>
                <Text style={styles.exeatResultMeta}>Transport: {searchResult.transportMode}</Text>
                <Text style={styles.exeatResultMeta}>Issued by: {searchResult.issuedBy} | Approved by: {searchResult.approvedBy || 'N/A'} on {searchResult.approvedDate || 'N/A'}</Text>
                {searchResult.checkedOutAt && <Text style={styles.exeatResultMeta}>Checked out: {new Date(searchResult.checkedOutAt).toLocaleString()} by {searchResult.checkedOutBy}</Text>}
                {searchResult.checkedInAt && <Text style={styles.exeatResultMeta}>Checked in: {new Date(searchResult.checkedInAt).toLocaleString()} by {searchResult.checkedInBy}</Text>}
                <Text style={[styles.exeatResultStatus, { color: searchResult.status === 'Approved' ? colors.warning : searchResult.status === 'Checked Out' ? colors.info : searchResult.status === 'Checked In' ? colors.success : searchResult.status === 'Rejected' ? colors.danger : colors.textSecondary }]}>Status: {searchResult.status}</Text>
                {searchResult.status === 'Approved' && (
                  <TouchableOpacity style={styles.exeatCheckOutBtn} onPress={() => { checkOut(searchResult.id, guardName); setExeatSearch(''); Alert.alert('Checked Out', `${searchResult.studentName} has been checked out at the gate.`); }}>
                    <Text style={styles.exeatBtnText}>Check Out Student →</Text>
                  </TouchableOpacity>
                )}
                {searchResult.status === 'Checked Out' && (
                  <TouchableOpacity style={styles.exeatCheckInBtn} onPress={() => { checkIn(searchResult.id, guardName); setExeatSearch(''); Alert.alert('Checked In', `${searchResult.studentName} has been checked back in.`); }}>
                    <Text style={styles.exeatBtnText}>Check In Student →</Text>
                  </TouchableOpacity>
                )}
                {(searchResult.status === 'Pending' || searchResult.status === 'Rejected' || searchResult.status === 'Expired') && (
                  <Text style={styles.exeatInvalidText}>This exeat is {searchResult.status.toLowerCase()} — student cannot leave campus.</Text>
                )}
              </View>
            )}

            {exeatSearch.trim() && !searchResult && (
              <View style={styles.exeatNotFound}><Text style={styles.exeatNotFoundText}>No exeat found matching "{exeatSearch}"</Text></View>
            )}

            <Text style={styles.sectionTitle}>Approved — Ready for Check Out ({approvedExeats.length})</Text>
            {approvedExeats.length === 0 && <Text style={styles.emptyText}>No students awaiting check out.</Text>}
            {approvedExeats.map((e) => (
              <View key={e.id} style={[styles.gateCard, { borderLeftColor: colors.warning, borderLeftWidth: 4 }]}>
                <View style={styles.gateHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.gateTime}>{e.studentName} ({e.admissionNo})</Text>
                    <Text style={styles.gateMeta}>Exeat: {e.exeatNo} | {e.house} House | Class: {e.class || '-'}</Text>
                    <Text style={styles.gateMeta}>Destination: {e.destination} | Return: {e.returnDate}</Text>
                    <Text style={styles.gateMeta}>Reason: {e.reason} — {e.reasonDetail}</Text>
                    <Text style={styles.gateMeta}>Guardian: {e.guardianName} ({e.guardianPhone || 'N/A'}) | Transport: {e.transportMode}</Text>
                    <Text style={styles.gateMeta}>Approved by: {e.approvedBy} on {e.approvedDate}</Text>
                  </View>
                  <View style={styles.gateActions}>
                    <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.info }]} onPress={() => { checkOut(e.id, guardName); Alert.alert('Checked Out', `${e.studentName} checked out at gate.`); }}>
                      <Text style={styles.smallBtnTextLight}>Check Out →</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Checked Out — Awaiting Return ({checkedOutExeats.length})</Text>
            {checkedOutExeats.length === 0 && <Text style={styles.emptyText}>No students currently outside.</Text>}
            {checkedOutExeats.map((e) => (
              <View key={e.id} style={[styles.gateCard, { borderLeftColor: colors.info, borderLeftWidth: 4 }]}>
                <View style={styles.gateHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.gateTime}>{e.studentName} ({e.admissionNo})</Text>
                    <Text style={styles.gateMeta}>Exeat: {e.exeatNo} | {e.house} House</Text>
                    <Text style={styles.gateMeta}>Destination: {e.destination}</Text>
                    <Text style={styles.gateMeta}>Left: {new Date(e.checkedOutAt).toLocaleString()} by {e.checkedOutBy}</Text>
                    <Text style={styles.gateMeta}>Expected return: {e.returnDate} | Guardian: {e.guardianName} ({e.guardianPhone || 'N/A'})</Text>
                  </View>
                  <View style={styles.gateActions}>
                    <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.success }]} onPress={() => { checkIn(e.id, guardName); Alert.alert('Checked In', `${e.studentName} checked back in.`); }}>
                      <Text style={styles.smallBtnTextLight}>Check In →</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

            {recentlyReturned.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Recently Returned ({recentlyReturned.length})</Text>
                {recentlyReturned.map((e) => (
                  <View key={e.id} style={[styles.gateCard, { borderLeftColor: colors.success, borderLeftWidth: 4, opacity: 0.8 }]}>
                    <View style={styles.gateHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.gateTime}>{e.studentName} ({e.admissionNo})</Text>
                        <Text style={styles.gateMeta}>Exeat: {e.exeatNo} | {e.house} House</Text>
                        <Text style={styles.gateMeta}>Returned: {new Date(e.checkedInAt).toLocaleString()} by {e.checkedInBy}</Text>
                        <Text style={styles.gateMeta}>Was at: {e.destination} | Reason: {e.reason}</Text>
                      </View>
                      <View style={styles.gateActions}>
                        {renderBadge('Returned', colors.success)}
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>
        );
      }

      case 'incidents':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Incidents" value={incidents.length} accentColor={colors.primary} />
              <StatCard label="Active" value={activeIncidents.length} accentColor={colors.warning} />
              <StatCard label="Critical/High" value={criticalIncidents.length} accentColor={colors.danger} />
              <StatCard label="Resolved" value={incidents.filter(i => i.status === 'Resolved').length} accentColor={colors.success} />
            </CardGrid>

            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.danger }]} onPress={() => { setIncidentForm({ type: 'Theft', location: '', description: '', severity: 'Low', reportedBy: '', witnesses: '' }); openModal('incident'); }}>
              <Text style={styles.actionBtnText}>+ Report Incident</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>All Incidents</Text>
            {incidents.length === 0 ? (
              <Text style={styles.emptyText}>No incidents reported.</Text>
            ) : (
              incidents.map((i) => (
                <View key={i.id} style={[styles.incidentCard, { borderLeftColor: severityColor(i.severity) }]}>
                  <View style={styles.incidentHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.incidentId}>{i.incidentId}</Text>
                      <Text style={styles.incidentTitle}>{i.type} at {i.location}</Text>
                      <Text style={styles.incidentMeta}>{i.date} at {i.time} | Reported by {i.reportedBy}</Text>
                    </View>
                    <View style={styles.incidentBadges}>
                      {renderBadge(i.severity, severityColor(i.severity))}
                      {renderBadge(i.status, statusColor(i.status))}
                    </View>
                  </View>
                  <Text style={styles.incidentDesc}>{i.description}</Text>
                  {i.witnesses && <Text style={styles.incidentWitness}>Witnesses: {i.witnesses}</Text>}
                  {i.assignedTo && <Text style={styles.incidentMeta}>Assigned to: {i.assignedTo}</Text>}
                  {i.resolution && <Text style={styles.incidentResolution}>Resolution: {i.resolution}</Text>}
                  <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => {
                      const idx = INCIDENT_STATUSES.indexOf(i.status);
                      const next = INCIDENT_STATUSES[(idx + 1) % INCIDENT_STATUSES.length];
                      updateIncidentStatus(i.id, next);
                    }}>
                      <Text style={styles.actionLink}>Status: {i.status} →</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(i.id, 'incident', i.incidentId)}>
                      <Text style={styles.deleteLink}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        );

      case 'patrol':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Shifts" value={patrolShifts.length} accentColor={colors.primary} />
              <StatCard label="Completed" value={patrolShifts.filter(p => p.completed).length} accentColor={colors.success} />
              <StatCard label="Active" value={patrolShifts.filter(p => !p.completed).length} accentColor={colors.warning} />
              <StatCard label="Guards" value={activeGuards.length} accentColor={colors.info} />
            </CardGrid>

            <TouchableOpacity style={styles.actionBtn} onPress={() => { setPatrolForm({ shift: 'Morning', startTime: '06:00', endTime: '14:00', guardName: guards[0]?.name || '', zone: '', notes: '' }); openModal('patrol'); }}>
              <Text style={styles.actionBtnText}>+ Add Patrol Shift</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Patrol Roster</Text>
            {patrolShifts.map((p) => (
              <View key={p.id} style={styles.patrolCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.patrolShift}>{p.shift} ({p.startTime} - {p.endTime})</Text>
                  <Text style={styles.patrolGuard}>{p.guardName} — {p.zone}</Text>
                  {p.notes && <Text style={styles.patrolNotes}>{p.notes}</Text>}
                </View>
                <View style={styles.patrolRight}>
                  {renderBadge(p.completed ? 'Done' : 'Active', p.completed ? colors.success : colors.warning)}
                  <TouchableOpacity onPress={() => updatePatrolShift(p.id, { completed: !p.completed })}>
                    <Text style={styles.actionLink}>{p.completed ? 'Reopen' : 'Complete'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(p.id, 'patrol shift', '')}>
                    <Text style={styles.deleteLink}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );

      case 'visitors':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total" value={visitors.length} accentColor={colors.primary} />
              <StatCard label="Expected" value={expectedVisitors.length} accentColor={colors.warning} />
              <StatCard label="Arrived" value={visitors.filter(v => v.status === 'Arrived').length} accentColor={colors.success} />
              <StatCard label="Departed" value={visitors.filter(v => v.status === 'Departed').length} accentColor={colors.textSecondary} />
            </CardGrid>

            <TouchableOpacity style={styles.actionBtn} onPress={() => { setVisitorForm({ name: '', expectedDate: todayStr(), expectedTime: '10:00', purpose: '', host: '', phone: '', vehiclePlate: '' }); openModal('visitor'); }}>
              <Text style={styles.actionBtnText}>+ Pre-Register Visitor</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Visitors</Text>
            {visitors.length === 0 ? (
              <Text style={styles.emptyText}>No visitors registered.</Text>
            ) : (
              visitors.map((v) => (
                <View key={v.id} style={styles.visitorCard}>
                  <View style={styles.visitorHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.visitorName}>{v.name}</Text>
                      <Text style={styles.visitorMeta}>Expected: {v.expectedDate} at {v.expectedTime}</Text>
                      <Text style={styles.visitorMeta}>Purpose: {v.purpose} | Host: {v.host}</Text>
                      <Text style={styles.visitorMeta}>Phone: {v.phone}{v.vehiclePlate ? ` | Vehicle: ${v.vehiclePlate}` : ''}</Text>
                      {v.actualArrivalTime && <Text style={styles.visitorMeta}>Arrived: {v.actualArrivalTime}</Text>}
                    </View>
                    {renderBadge(v.status, statusColor(v.status))}
                  </View>
                  <View style={styles.cardActions}>
                    {v.status === 'Expected' && (
                      <TouchableOpacity onPress={() => updateVisitorStatus(v.id, 'Arrived', nowTime())}>
                        <Text style={styles.actionLink}>Mark Arrived</Text>
                      </TouchableOpacity>
                    )}
                    {v.status === 'Arrived' && (
                      <TouchableOpacity onPress={() => updateVisitorStatus(v.id, 'Departed')}>
                        <Text style={styles.actionLink}>Mark Departed</Text>
                      </TouchableOpacity>
                    )}
                    {v.status !== 'Cancelled' && v.status !== 'Departed' && (
                      <TouchableOpacity onPress={() => updateVisitorStatus(v.id, 'Cancelled')}>
                        <Text style={styles.cancelLink}>Cancel</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => handleDelete(v.id, 'visitor', v.name)}>
                      <Text style={styles.deleteLink}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        );

      case 'checklist':
        return (
          <View>
            <CardGrid>
              <StatCard label="Completed" value={checklistProgress.done} accentColor={colors.success} />
              <StatCard label="Pending" value={pendingChecklist.length} accentColor={colors.warning} />
              <StatCard label="Progress" value={`${checklistProgress.pct}%`} accentColor={checklistProgress.pct === 100 ? colors.success : colors.primary} />
              <StatCard label="Total Items" value={checklistProgress.total} accentColor={colors.info} />
            </CardGrid>

            <TouchableOpacity style={styles.actionBtn} onPress={() => { setChecklistForm({ item: '', category: 'Perimeter', requiredTime: '08:00' }); openModal('checklist'); }}>
              <Text style={styles.actionBtnText}>+ Add Checklist Item</Text>
            </TouchableOpacity>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${checklistProgress.pct}%`, backgroundColor: checklistProgress.pct === 100 ? colors.success : colors.primary }]} />
            </View>

            <Text style={styles.sectionTitle}>Checklist Items</Text>
            {CHECKLIST_CATEGORIES.map((cat) => {
              const items = checklist.filter(c => c.category === cat);
              if (items.length === 0) return null;
              return (
                <View key={cat}>
                  <Text style={styles.categoryTitle}>{cat}</Text>
                  {items.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={styles.checklistItem}
                      onPress={() => toggleChecklistItem(c.id, 'Security Officer')}
                    >
                      <View style={[styles.checkbox, c.done && styles.checkboxDone]}>
                        {c.done && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.checklistText, c.done && styles.checklistTextDone]}>{c.item}</Text>
                        <Text style={styles.checklistMeta}>Required by {c.requiredTime}{c.completedTime ? ` | Done at ${c.completedTime} by ${c.completedBy}` : ''}</Text>
                      </View>
                      <TouchableOpacity onPress={() => handleDelete(c.id, 'checklist item', '')}>
                        <Text style={styles.deleteLink}>Delete</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              );
            })}
          </View>
        );

      case 'guards':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Guards" value={guards.length} accentColor={colors.primary} />
              <StatCard label="Active" value={activeGuards.length} accentColor={colors.success} />
              <StatCard label="On Leave" value={guards.filter(g => g.onLeave).length} accentColor={colors.warning} />
              <StatCard label="Shifts Today" value={patrolShifts.length} accentColor={colors.info} />
            </CardGrid>

            <TouchableOpacity style={styles.actionBtn} onPress={() => { setGuardForm({ name: '', phone: '', shift: 'Morning', zone: '', onLeave: false }); openModal('guard'); }}>
              <Text style={styles.actionBtnText}>+ Add Guard</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Guard Roster</Text>
            {guards.map((g) => (
              <View key={g.id} style={[styles.guardCard, { borderLeftColor: g.onLeave ? colors.warning : colors.success }]}>
                <View style={styles.guardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.guardName}>{g.name}</Text>
                    <Text style={styles.guardMeta}>Phone: {g.phone}</Text>
                    <Text style={styles.guardMeta}>Shift: {g.shift} | Zone: {g.zone}</Text>
                  </View>
                  {renderBadge(g.onLeave ? 'On Leave' : 'Active', g.onLeave ? colors.warning : colors.success)}
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => updateGuard(g.id, { onLeave: !g.onLeave })}>
                    <Text style={styles.actionLink}>{g.onLeave ? 'Mark Active' : 'Mark On Leave'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(g.id, 'guard', g.name)}>
                    <Text style={styles.deleteLink}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );

      case 'reports':
        return (
          <View>
            <Text style={styles.pageTitle}>Reports & Analytics</Text>
            <Text style={styles.pageSubtitle}>Real-time security data insights</Text>
            <CardGrid>
              <StatCard label="Gate Entries Today" value={todayLogs.length} accentColor={colors.primary} />
              <StatCard label="Total Incidents" value={incidents.length} accentColor={colors.danger} />
              <StatCard label="Active Incidents" value={activeIncidents.length} accentColor={colors.warning} />
              <StatCard label="Checklist" value={`${checklistProgress.pct}%`} accentColor={colors.success} />
            </CardGrid>

            <TouchableOpacity style={styles.pdfFullBtn} onPress={() => generatePDF('full')}>
              <Text style={styles.pdfFullBtnText}>Generate Full Report (PDF)</Text>
            </TouchableOpacity>

            <View style={styles.pdfBtnRow}>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.primary }]} onPress={() => generatePDF('activity')}>
                <Text style={styles.pdfBtnText}>Activity Summary</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.info }]} onPress={() => generatePDF('gate')}>
                <Text style={styles.pdfBtnText}>Gate Log</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.danger }]} onPress={() => generatePDF('incidents')}>
                <Text style={styles.pdfBtnText}>Incidents</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.warning }]} onPress={() => generatePDF('patrol')}>
                <Text style={styles.pdfBtnText}>Patrol Schedule</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.success }]} onPress={() => generatePDF('visitors')}>
                <Text style={styles.pdfBtnText}>Visitors</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.purple }]} onPress={() => generatePDF('checklist')}>
                <Text style={styles.pdfBtnText}>Checklist</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.textSecondary }]} onPress={() => generatePDF('guards')}>
                <Text style={styles.pdfBtnText}>Guard Roster</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.reportHeaderRow}>
              <Text style={styles.sectionTitle}>Incident Severity Breakdown</Text>
              <TouchableOpacity onPress={() => generatePDF('incidents')}><Text style={styles.pdfLink}>PDF</Text></TouchableOpacity>
            </View>
            <View style={styles.reportSectionCard}>
              {INCIDENT_SEVERITIES.map((sev) => {
                const count = incidents.filter(i => i.severity === sev).length;
                const pct = incidents.length > 0 ? Math.round((count / incidents.length) * 100) : 0;
                return (
                  <View key={sev} style={styles.reportBarRow}>
                    <Text style={styles.reportBarLabel}>{sev}</Text>
                    <View style={styles.reportBarTrack}>
                      <View style={[styles.reportBarFill, { width: `${pct}%`, backgroundColor: severityColor(sev) }]} />
                    </View>
                    <Text style={styles.reportBarCount}>{count}</Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.reportHeaderRow}>
              <Text style={styles.sectionTitle}>Incident Status Breakdown</Text>
            </View>
            <View style={styles.reportSectionCard}>
              {INCIDENT_STATUSES.map((st) => {
                const count = incidents.filter(i => i.status === st).length;
                const pct = incidents.length > 0 ? Math.round((count / incidents.length) * 100) : 0;
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

            <View style={styles.reportHeaderRow}>
              <Text style={styles.sectionTitle}>Incident Types</Text>
            </View>
            <View style={styles.reportSectionCard}>
              {INCIDENT_TYPES.map((t) => {
                const count = incidents.filter(i => i.type === t).length;
                if (count === 0) return null;
                const pct = incidents.length > 0 ? Math.round((count / incidents.length) * 100) : 0;
                return (
                  <View key={t} style={styles.reportBarRow}>
                    <Text style={styles.reportBarLabel}>{t}</Text>
                    <View style={styles.reportBarTrack}>
                      <View style={[styles.reportBarFill, { width: `${pct}%`, backgroundColor: colors.primary }]} />
                    </View>
                    <Text style={styles.reportBarCount}>{count}</Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.reportHeaderRow}>
              <Text style={styles.sectionTitle}>Gate Entry Status Today</Text>
              <TouchableOpacity onPress={() => generatePDF('gate')}><Text style={styles.pdfLink}>PDF</Text></TouchableOpacity>
            </View>
            <View style={styles.reportSectionCard}>
              {GATE_STATUSES.map((st) => {
                const count = todayLogs.filter(g => g.status === st).length;
                const pct = todayLogs.length > 0 ? Math.round((count / todayLogs.length) * 100) : 0;
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

            <View style={styles.reportHeaderRow}>
              <Text style={styles.sectionTitle}>Checklist by Category</Text>
              <TouchableOpacity onPress={() => generatePDF('checklist')}><Text style={styles.pdfLink}>PDF</Text></TouchableOpacity>
            </View>
            <View style={styles.reportSectionCard}>
              {CHECKLIST_CATEGORIES.map((cat) => {
                const items = checklist.filter(c => c.category === cat);
                if (items.length === 0) return null;
                const done = items.filter(c => c.done).length;
                const pct = Math.round((done / items.length) * 100);
                return (
                  <View key={cat} style={styles.reportBarRow}>
                    <Text style={styles.reportBarLabel}>{cat}</Text>
                    <View style={styles.reportBarTrack}>
                      <View style={[styles.reportBarFill, { width: `${pct}%`, backgroundColor: pct === 100 ? colors.success : colors.warning }]} />
                    </View>
                    <Text style={styles.reportBarCount}>{done}/{items.length}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const renderModal = () => {
    const titles: Record<string, string> = {
      gate: 'Log Gate Entry', incident: 'Report Incident', patrol: 'Add Patrol Shift',
      visitor: 'Pre-Register Visitor', checklist: 'Add Checklist Item', guard: 'Add Guard',
    };

    return (
      <Modal visible={showModal} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{titles[modalType] || ''}</Text>

              {modalType === 'gate' && (
                <View>
                  <Text style={styles.inputLabel}>Visitor Name *</Text>
                  <TextInput style={styles.input} placeholder="Enter visitor name" placeholderTextColor={colors.textLight} value={gateForm.visitorName} onChangeText={(v) => setGateForm({ ...gateForm, visitorName: v })} />
                  <Text style={styles.inputLabel}>Vehicle Plate</Text>
                  <TextInput style={styles.input} placeholder="e.g. GE-2345-1" placeholderTextColor={colors.textLight} value={gateForm.vehiclePlate} onChangeText={(v) => setGateForm({ ...gateForm, vehiclePlate: v })} autoCapitalize="none" />
                  <Text style={styles.inputLabel}>Purpose of Visit</Text>
                  <TextInput style={styles.input} placeholder="e.g. PTA meeting" placeholderTextColor={colors.textLight} value={gateForm.purpose} onChangeText={(v) => setGateForm({ ...gateForm, purpose: v })} />
                  <Text style={styles.inputLabel}>Host</Text>
                  <TextInput style={styles.input} placeholder="e.g. Headmaster" placeholderTextColor={colors.textLight} value={gateForm.host} onChangeText={(v) => setGateForm({ ...gateForm, host: v })} />
                </View>
              )}

              {modalType === 'incident' && (
                <View>
                  {renderSelect('Incident Type', incidentForm.type, INCIDENT_TYPES, (v) => setIncidentForm({ ...incidentForm, type: v as IncidentType }))}
                  {renderSelect('Severity', incidentForm.severity, INCIDENT_SEVERITIES, (v) => setIncidentForm({ ...incidentForm, severity: v as IncidentSeverity }))}
                  <Text style={styles.inputLabel}>Location *</Text>
                  <TextInput style={styles.input} placeholder="e.g. Boys dorm B" placeholderTextColor={colors.textLight} value={incidentForm.location} onChangeText={(v) => setIncidentForm({ ...incidentForm, location: v })} />
                  <Text style={styles.inputLabel}>Description *</Text>
                  <TextInput style={[styles.input, styles.textArea]} placeholder="What happened?" placeholderTextColor={colors.textLight} value={incidentForm.description} onChangeText={(v) => setIncidentForm({ ...incidentForm, description: v })} multiline />
                  <Text style={styles.inputLabel}>Reported By</Text>
                  <TextInput style={styles.input} placeholder="Your name" placeholderTextColor={colors.textLight} value={incidentForm.reportedBy} onChangeText={(v) => setIncidentForm({ ...incidentForm, reportedBy: v })} />
                  <Text style={styles.inputLabel}>Witnesses</Text>
                  <TextInput style={styles.input} placeholder="Names of witnesses (optional)" placeholderTextColor={colors.textLight} value={incidentForm.witnesses} onChangeText={(v) => setIncidentForm({ ...incidentForm, witnesses: v })} />
                </View>
              )}

              {modalType === 'patrol' && (
                <View>
                  {renderSelect('Shift', patrolForm.shift, SHIFT_NAMES, (v) => setPatrolForm({ ...patrolForm, shift: v as ShiftName }))}
                  <Text style={styles.inputLabel}>Start Time</Text>
                  <TextInput style={styles.input} placeholder="06:00" placeholderTextColor={colors.textLight} value={patrolForm.startTime} onChangeText={(v) => setPatrolForm({ ...patrolForm, startTime: v })} />
                  <Text style={styles.inputLabel}>End Time</Text>
                  <TextInput style={styles.input} placeholder="14:00" placeholderTextColor={colors.textLight} value={patrolForm.endTime} onChangeText={(v) => setPatrolForm({ ...patrolForm, endTime: v })} />
                  {renderSelect('Guard', patrolForm.guardName, guards.map(g => g.name), (v) => setPatrolForm({ ...patrolForm, guardName: v }))}
                  <Text style={styles.inputLabel}>Zone *</Text>
                  <TextInput style={styles.input} placeholder="e.g. Main gate + perimeter" placeholderTextColor={colors.textLight} value={patrolForm.zone} onChangeText={(v) => setPatrolForm({ ...patrolForm, zone: v })} />
                  <Text style={styles.inputLabel}>Notes</Text>
                  <TextInput style={[styles.input, styles.textArea]} placeholder="Patrol notes" placeholderTextColor={colors.textLight} value={patrolForm.notes} onChangeText={(v) => setPatrolForm({ ...patrolForm, notes: v })} multiline />
                </View>
              )}

              {modalType === 'visitor' && (
                <View>
                  <Text style={styles.inputLabel}>Visitor Name *</Text>
                  <TextInput style={styles.input} placeholder="Full name" placeholderTextColor={colors.textLight} value={visitorForm.name} onChangeText={(v) => setVisitorForm({ ...visitorForm, name: v })} />
                  <Text style={styles.inputLabel}>Expected Date</Text>
                  <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} value={visitorForm.expectedDate} onChangeText={(v) => setVisitorForm({ ...visitorForm, expectedDate: v })} />
                  <Text style={styles.inputLabel}>Expected Time</Text>
                  <TextInput style={styles.input} placeholder="10:00" placeholderTextColor={colors.textLight} value={visitorForm.expectedTime} onChangeText={(v) => setVisitorForm({ ...visitorForm, expectedTime: v })} />
                  <Text style={styles.inputLabel}>Purpose</Text>
                  <TextInput style={styles.input} placeholder="e.g. Inspection visit" placeholderTextColor={colors.textLight} value={visitorForm.purpose} onChangeText={(v) => setVisitorForm({ ...visitorForm, purpose: v })} />
                  <Text style={styles.inputLabel}>Host *</Text>
                  <TextInput style={styles.input} placeholder="e.g. Headmaster" placeholderTextColor={colors.textLight} value={visitorForm.host} onChangeText={(v) => setVisitorForm({ ...visitorForm, host: v })} />
                  <Text style={styles.inputLabel}>Phone</Text>
                  <TextInput style={styles.input} placeholder="Phone number" placeholderTextColor={colors.textLight} value={visitorForm.phone} onChangeText={(v) => setVisitorForm({ ...visitorForm, phone: v })} />
                  <Text style={styles.inputLabel}>Vehicle Plate</Text>
                  <TextInput style={styles.input} placeholder="Optional" placeholderTextColor={colors.textLight} value={visitorForm.vehiclePlate} onChangeText={(v) => setVisitorForm({ ...visitorForm, vehiclePlate: v })} autoCapitalize="none" />
                </View>
              )}

              {modalType === 'checklist' && (
                <View>
                  <Text style={styles.inputLabel}>Checklist Item *</Text>
                  <TextInput style={styles.input} placeholder="e.g. Main gate locked" placeholderTextColor={colors.textLight} value={checklistForm.item} onChangeText={(v) => setChecklistForm({ ...checklistForm, item: v })} />
                  {renderSelect('Category', checklistForm.category, CHECKLIST_CATEGORIES, (v) => setChecklistForm({ ...checklistForm, category: v }))}
                  <Text style={styles.inputLabel}>Required By Time</Text>
                  <TextInput style={styles.input} placeholder="e.g. 22:00" placeholderTextColor={colors.textLight} value={checklistForm.requiredTime} onChangeText={(v) => setChecklistForm({ ...checklistForm, requiredTime: v })} />
                </View>
              )}

              {modalType === 'guard' && (
                <View>
                  <Text style={styles.inputLabel}>Guard Name *</Text>
                  <TextInput style={styles.input} placeholder="Full name" placeholderTextColor={colors.textLight} value={guardForm.name} onChangeText={(v) => setGuardForm({ ...guardForm, name: v })} />
                  <Text style={styles.inputLabel}>Phone</Text>
                  <TextInput style={styles.input} placeholder="Phone number" placeholderTextColor={colors.textLight} value={guardForm.phone} onChangeText={(v) => setGuardForm({ ...guardForm, phone: v })} />
                  {renderSelect('Shift', guardForm.shift, SHIFT_NAMES, (v) => setGuardForm({ ...guardForm, shift: v as ShiftName }))}
                  <Text style={styles.inputLabel}>Zone</Text>
                  <TextInput style={styles.input} placeholder="Assigned zone" placeholderTextColor={colors.textLight} value={guardForm.zone} onChangeText={(v) => setGuardForm({ ...guardForm, zone: v })} />
                </View>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={closeModal}>
                  <Text style={styles.modalBtnTextDark}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnSubmit]}
                  onPress={() => {
                    if (modalType === 'gate') handleSaveGate();
                    else if (modalType === 'incident') handleSaveIncident();
                    else if (modalType === 'patrol') handleSavePatrol();
                    else if (modalType === 'visitor') handleSaveVisitor();
                    else if (modalType === 'checklist') handleSaveChecklist();
                    else if (modalType === 'guard') handleSaveGuard();
                  }}
                >
                  <Text style={styles.modalBtnTextLight}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <DashboardLayout
      title="Security"
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
      {renderModal()}
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
  pageSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.md },
  emptyText: { fontSize: fontSize.md, color: colors.textLight, textAlign: 'center', paddingVertical: spacing.xl },
  exeatSearchBox: { marginBottom: spacing.lg },
  exeatSearchInput: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md, color: colors.text, backgroundColor: colors.surfaceAlt },
  exeatResultCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg, borderLeftWidth: 4 },
  exeatResultTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xs },
  exeatResultMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs },
  exeatResultStatus: { fontSize: fontSize.md, fontWeight: fontWeight.bold, marginTop: spacing.sm, marginBottom: spacing.sm },
  exeatCheckOutBtn: { backgroundColor: colors.info, borderRadius: radius.md, paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.sm },
  exeatCheckInBtn: { backgroundColor: colors.success, borderRadius: radius.md, paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.sm },
  exeatBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  exeatInvalidText: { fontSize: fontSize.sm, color: colors.danger, fontWeight: fontWeight.medium, marginTop: spacing.sm },
  exeatNotFound: { backgroundColor: colors.dangerBg, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.lg, alignItems: 'center' },
  exeatNotFoundText: { fontSize: fontSize.md, color: colors.danger, fontWeight: fontWeight.medium },
  smallBtn: { borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  smallBtnTextLight: { color: colors.white, fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  categoryTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textSecondary, marginTop: spacing.md, marginBottom: spacing.sm },
  actionBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm + 4, alignItems: 'center', marginBottom: spacing.lg },
  actionBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  logoutBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  logoutText: { color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.medium },

  alertCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg, borderLeftWidth: 4 },
  alertTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, marginBottom: spacing.xs },
  alertText: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs },

  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  quickBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, marginBottom: spacing.sm },
  quickBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },

  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  statusText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },

  gateCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  gateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  gateTime: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  gateMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  gateNotes: { fontSize: fontSize.xs, color: colors.textLight, fontStyle: 'italic', marginTop: spacing.xs },
  gateActions: { alignItems: 'flex-end' },

  incidentCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm, borderLeftWidth: 4 },
  incidentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  incidentId: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.primary },
  incidentTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, marginTop: 2 },
  incidentMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  incidentDesc: { fontSize: fontSize.sm, color: colors.text, marginTop: spacing.xs },
  incidentWitness: { fontSize: fontSize.xs, color: colors.textLight, marginTop: spacing.xs },
  incidentResolution: { fontSize: fontSize.sm, color: colors.success, marginTop: spacing.xs, fontStyle: 'italic' },
  incidentBadges: { flexDirection: 'column', alignItems: 'flex-end', gap: 4 },

  patrolCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.md },
  patrolShift: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  patrolGuard: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  patrolNotes: { fontSize: fontSize.xs, color: colors.textLight, marginTop: 2 },
  patrolRight: { alignItems: 'flex-end', gap: 4 },

  visitorCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  visitorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  visitorName: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  visitorMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },

  checklistItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.md },
  checkbox: { width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxDone: { backgroundColor: colors.success, borderColor: colors.success },
  checkmark: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  checklistText: { fontSize: fontSize.md, color: colors.text, flex: 1 },
  checklistTextDone: { color: colors.textSecondary, textDecorationLine: 'line-through' },
  checklistMeta: { fontSize: fontSize.xs, color: colors.textLight, marginTop: 2 },

  guardCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm, borderLeftWidth: 4 },
  guardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  guardName: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  guardMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },

  progressTrack: { height: 8, backgroundColor: colors.surfaceAlt, borderRadius: 4, marginBottom: spacing.lg, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4 },

  cardActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm, flexWrap: 'wrap' },
  actionLink: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.primary },
  cancelLink: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.warning },
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
  reportBarLabel: { fontSize: fontSize.sm, color: colors.textSecondary, width: 130 },
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
