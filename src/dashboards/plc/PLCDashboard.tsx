import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useAuthStore } from '@store/authStore';
import {
  usePLCStore,
  MEETING_STATUSES, ATTENDANCE_STATUSES, ACTION_ITEM_STATUSES,
  DUTY_DAYS, OBSERVATION_RATINGS, RESOURCE_CATEGORIES,
} from '@store/plcStore';
import type {
  MeetingStatus, AttendanceStatus, ActionItemStatus,
  DutyDay, ObservationRating,
} from '@store/plcStore';

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'meetings', label: 'Meetings & Attendance' },
  { key: 'duty', label: 'Coordinator Duty Roster' },
  { key: 'observations', label: 'Critical Friend' },
  { key: 'lesson', label: 'Lesson Study Log' },
  { key: 'performance', label: 'Performance Review' },
  { key: 'resources', label: 'Resource Sharing' },
  { key: 'action', label: 'Action Plan Tracker' },
  { key: 'requisitions', label: 'PLC Requisitions' },
  { key: 'reports', label: 'Reports' },
];

const todayStr = () => new Date().toISOString().slice(0, 10);

export function PLCDashboard() {
  const [activePage, setActivePage] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const { user, logout } = useAuthStore();
  const coordinatorName = user?.displayName ?? 'PLC Coordinator';

  const {
    meetings, dutyRoster, observations, lessonStudies, performanceReviews,
    resources, actionItems, requisitions,
    addMeeting, deleteMeeting, markAttendance, recordMinutes,
    addDuty, deleteDuty,
    addObservation, updateObservationStatus, deleteObservation,
    addLessonStudy, deleteLessonStudy,
    addPerformance, deletePerformance,
    addResource, deleteResource,
    addActionItem, updateActionStatus, deleteActionItem,
    addRequisition, approveRequisition, rejectRequisition, deleteRequisition,
  } = usePLCStore();

  const [meetingForm, setMeetingForm] = useState({
    date: todayStr(), topic: '', facilitator: coordinatorName, location: 'Staff Common Room',
    startTime: '15:30', endTime: '17:00', status: 'Scheduled' as MeetingStatus, agenda: '',
  });
  const [dutyForm, setDutyForm] = useState({
    coordinator: coordinatorName, day: 'Monday' as DutyDay, responsibility: '', timeSlot: '', notes: '',
  });
  const [obsForm, setObsForm] = useState({
    date: todayStr(), teacherName: coordinatorName, observedTeacher: '', subject: '', classForm: '',
    lessonTopic: '', observerName: coordinatorName, rating: 'Good' as ObservationRating,
    strengths: '', improvements: '', questionsRaised: '',
    studentEngagement: 'Good' as ObservationRating, classroomManagement: 'Good' as ObservationRating,
    instructionalClarity: 'Good' as ObservationRating,
    recommendations: '', followUpAction: '',
  });
  const [lessonForm, setLessonForm] = useState({
    date: todayStr(), teacherObserved: '', subject: '', observer: coordinatorName, notes: '',
  });
  const [perfForm, setPerfForm] = useState({
    date: todayStr(), focusArea: '', keyFinding: '', dataSummary: '',
  });
  const [resourceForm, setResourceForm] = useState({
    title: '', sharedBy: coordinatorName, date: todayStr(), category: 'Lesson Plan', description: '',
  });
  const [actionForm, setActionForm] = useState({
    session: '', action: '', owner: '', due: todayStr(), status: 'Not Started' as ActionItemStatus,
  });
  const [reqForm, setReqForm] = useState({
    date: todayStr(), itemName: '', quantity: '', unit: 'packs', purpose: '', requestedBy: coordinatorName,
  });
  const [minutesModal, setMinutesModal] = useState<{ id: string; minutes: string } | null>(null);
  const [attendanceModal, setAttendanceModal] = useState<{ meetingId: string; meetingTopic: string } | null>(null);
  const [attendanceInput, setAttendanceInput] = useState({ teacherName: '', status: 'Present' as AttendanceStatus, notes: '' });

  const openModal = (type: string) => { setModalType(type); setShowModal(true); };
  const closeModal = () => { setShowModal(false); };

  const renderSelect = (label: string, value: string, options: readonly string[], onSelect: (v: string) => void) => (
    <View>
      {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
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
    <View style={[styles.badge, { backgroundColor: color + '20' }]}>
      <Text style={[styles.badgeText, { color }]}>{text}</Text>
    </View>
  );

  const statusColor = (s: string) =>
    s === 'Completed' ? colors.success : s === 'Scheduled' ? colors.warning :
    s === 'Cancelled' ? colors.danger : s === 'Approved' ? colors.success :
    s === 'Rejected' ? colors.danger : s === 'Pending' ? colors.warning :
    s === 'Fulfilled' ? colors.info : s === 'In Progress' ? colors.info :
    s === 'Overdue' ? colors.danger : s === 'Not Started' ? colors.textSecondary :
    s === 'Discussed' ? colors.success : s === 'Reviewed' ? colors.info :
    s === 'Submitted' ? colors.warning : s === 'Excellent' ? colors.success :
    s === 'Good' ? colors.primaryLight : s === 'Satisfactory' ? colors.warning :
    s === 'Needs Improvement' ? colors.danger : s === 'Unsatisfactory' ? colors.danger :
    s === 'Present' ? colors.success : s === 'Late' ? colors.warning :
    s === 'Absent' ? colors.danger : s === 'Excused' ? colors.info :
    colors.textSecondary;

  const handleSaveMeeting = () => {
    if (!meetingForm.topic.trim()) { Alert.alert('Error', 'Topic is required'); return; }
    addMeeting({ ...meetingForm, createdBy: coordinatorName });
    setMeetingForm({ date: todayStr(), topic: '', facilitator: coordinatorName, location: 'Staff Common Room', startTime: '15:30', endTime: '17:00', status: 'Scheduled', agenda: '' });
    closeModal();
    Alert.alert('Success', 'PLC meeting scheduled!');
  };

  const handleSaveDuty = () => {
    if (!dutyForm.responsibility.trim()) { Alert.alert('Error', 'Responsibility is required'); return; }
    addDuty(dutyForm);
    setDutyForm({ coordinator: coordinatorName, day: 'Monday', responsibility: '', timeSlot: '', notes: '' });
    closeModal();
  };

  const handleSaveObservation = () => {
    if (!obsForm.observedTeacher.trim() || !obsForm.observerName.trim()) { Alert.alert('Error', 'Observed teacher and observer are required'); return; }
    if (!obsForm.subject.trim() || !obsForm.lessonTopic.trim()) { Alert.alert('Error', 'Subject and lesson topic are required'); return; }
    addObservation(obsForm);
    setObsForm({
      date: todayStr(), teacherName: coordinatorName, observedTeacher: '', subject: '', classForm: '',
      lessonTopic: '', observerName: coordinatorName, rating: 'Good',
      strengths: '', improvements: '', questionsRaised: '',
      studentEngagement: 'Good', classroomManagement: 'Good', instructionalClarity: 'Good',
      recommendations: '', followUpAction: '',
    });
    closeModal();
    Alert.alert('Submitted', 'Critical friend observation submitted successfully.');
  };

  const handleSaveLesson = () => {
    if (!lessonForm.teacherObserved.trim()) { Alert.alert('Error', 'Teacher observed is required'); return; }
    addLessonStudy(lessonForm);
    setLessonForm({ date: todayStr(), teacherObserved: '', subject: '', observer: coordinatorName, notes: '' });
    closeModal();
  };

  const handleSavePerf = () => {
    if (!perfForm.focusArea.trim()) { Alert.alert('Error', 'Focus area is required'); return; }
    addPerformance(perfForm);
    setPerfForm({ date: todayStr(), focusArea: '', keyFinding: '', dataSummary: '' });
    closeModal();
  };

  const handleSaveResource = () => {
    if (!resourceForm.title.trim()) { Alert.alert('Error', 'Resource title is required'); return; }
    addResource(resourceForm);
    setResourceForm({ title: '', sharedBy: coordinatorName, date: todayStr(), category: 'Lesson Plan', description: '' });
    closeModal();
  };

  const handleSaveAction = () => {
    if (!actionForm.action.trim() || !actionForm.owner.trim()) { Alert.alert('Error', 'Action item and owner are required'); return; }
    addActionItem(actionForm);
    setActionForm({ session: '', action: '', owner: '', due: todayStr(), status: 'Not Started' });
    closeModal();
  };

  const handleSaveReq = () => {
    if (!reqForm.itemName.trim() || !reqForm.quantity.trim()) { Alert.alert('Error', 'Item name and quantity are required'); return; }
    const qty = parseInt(reqForm.quantity);
    if (isNaN(qty) || qty <= 0) { Alert.alert('Error', 'Invalid quantity'); return; }
    addRequisition({ date: reqForm.date, itemName: reqForm.itemName.trim(), quantity: qty, unit: reqForm.unit, purpose: reqForm.purpose.trim(), requestedBy: reqForm.requestedBy });
    setReqForm({ date: todayStr(), itemName: '', quantity: '', unit: 'packs', purpose: '', requestedBy: coordinatorName });
    closeModal();
    Alert.alert('Submitted', 'PLC requisition submitted to Academic Office for approval.');
  };

  const handleMarkAttendance = () => {
    if (!attendanceInput.teacherName.trim()) { Alert.alert('Error', 'Teacher name is required'); return; }
    if (attendanceModal) {
      markAttendance(attendanceModal.meetingId, attendanceInput.teacherName.trim(), attendanceInput.status, attendanceInput.notes.trim());
      setAttendanceInput({ teacherName: '', status: 'Present', notes: '' });
      Alert.alert('Recorded', 'Attendance marked.');
    }
  };

  const handleRecordMinutes = () => {
    if (minutesModal) {
      recordMinutes(minutesModal.id, minutesModal.minutes);
      setMinutesModal(null);
      Alert.alert('Saved', 'Minutes recorded and meeting marked as completed.');
    }
  };

  const handleDelete = (id: string, type: string) =>
    Alert.alert('Delete', `Delete this ${type}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        if (type === 'meeting') deleteMeeting(id);
        else if (type === 'duty') deleteDuty(id);
        else if (type === 'observation') deleteObservation(id);
        else if (type === 'lesson study') deleteLessonStudy(id);
        else if (type === 'performance') deletePerformance(id);
        else if (type === 'resource') deleteResource(id);
        else if (type === 'action item') deleteActionItem(id);
        else if (type === 'requisition') deleteRequisition(id);
      } },
    ]);

  const scheduledMeetings = meetings.filter(m => m.status === 'Scheduled');
  const completedMeetings = meetings.filter(m => m.status === 'Completed');
  const pendingObservations = observations.filter(o => o.status === 'Submitted');
  const pendingReqs = requisitions.filter(r => r.status === 'Pending');
  const inProgressActions = actionItems.filter(a => a.status === 'In Progress');

  const generateReport = (type: string) => {
    let title = '';
    let body = '';

    if (type === 'full' || type === 'overview') {
      title = 'PLC — Comprehensive Report';
      body += `<h2>Overview</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px">
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Total Meetings</td><td style="padding:8px 12px;border:1px solid #ddd">${meetings.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Completed</td><td style="padding:8px 12px;border:1px solid #ddd">${completedMeetings.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Scheduled</td><td style="padding:8px 12px;border:1px solid #ddd">${scheduledMeetings.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Critical Friend Observations</td><td style="padding:8px 12px;border:1px solid #ddd">${observations.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Action Items (In Progress)</td><td style="padding:8px 12px;border:1px solid #ddd">${inProgressActions.length}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Pending Requisitions</td><td style="padding:8px 12px;border:1px solid #ddd">${pendingReqs.length}</td></tr>
      </table>`;
    }

    if (type === 'full' || type === 'meetings') {
      title = title || 'PLC — Meeting Report';
      body += `<h2>Meeting Schedule & Attendance</h2>`;
      body += `<table style="border-collapse:collapse;width:100%;margin-bottom:20px"><tr style="background:#0F4C75;color:#fff"><th style="padding:8px;border:1px solid #ddd">Date</th><th style="padding:8px;border:1px solid #ddd">Topic</th><th style="padding:8px;border:1px solid #ddd">Facilitator</th><th style="padding:8px;border:1px solid #ddd">Status</th><th style="padding:8px;border:1px solid #ddd">Present</th><th style="padding:8px;border:1px solid #ddd">Absent</th></tr>`;
      meetings.forEach(m => {
        const present = m.attendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
        const absent = m.attendance.filter(a => a.status === 'Absent').length;
        body += `<tr><td style="padding:6px 8px;border:1px solid #ddd">${m.date}</td><td style="padding:6px 8px;border:1px solid #ddd">${m.topic}</td><td style="padding:6px 8px;border:1px solid #ddd">${m.facilitator}</td><td style="padding:6px 8px;border:1px solid #ddd">${m.status}</td><td style="padding:6px 8px;border:1px solid #ddd;text-align:center">${present}</td><td style="padding:6px 8px;border:1px solid #ddd;text-align:center">${absent}</td></tr>`;
      });
      body += `</table>`;
    }

    if (type === 'full' || type === 'observations') {
      title = title || 'PLC — Critical Friend Observations';
      body += `<h2>Critical Friend Observations</h2>`;
      observations.forEach(o => {
        body += `<div style="background:#f9f9f9;border-left:4px solid #0F4C75;padding:12px;margin-bottom:15px">
          <strong>${o.observedTeacher}</strong> — ${o.subject} (${o.classForm}) | ${o.date}<br/>
          <em>Observer: ${o.observerName} | Overall: ${o.rating}</em><br/>
          <strong>Strengths:</strong> ${o.strengths}<br/>
          <strong>Improvements:</strong> ${o.improvements}<br/>
          <strong>Recommendations:</strong> ${o.recommendations}<br/>
          <strong>Follow-up:</strong> ${o.followUpAction}<br/>
          <strong>Status:</strong> ${o.status}
        </div>`;
      });
    }

    if (type === 'full' || type === 'actions') {
      title = title || 'PLC — Action Plan Tracker';
      body += `<h2>Action Items</h2><table style="border-collapse:collapse;width:100%"><tr style="background:#0F4C75;color:#fff"><th style="padding:8px;border:1px solid #ddd">Session</th><th style="padding:8px;border:1px solid #ddd">Action</th><th style="padding:8px;border:1px solid #ddd">Owner</th><th style="padding:8px;border:1px solid #ddd">Due</th><th style="padding:8px;border:1px solid #ddd">Status</th></tr>`;
      actionItems.forEach(a => {
        body += `<tr><td style="padding:6px 8px;border:1px solid #ddd">${a.session}</td><td style="padding:6px 8px;border:1px solid #ddd">${a.action}</td><td style="padding:6px 8px;border:1px solid #ddd">${a.owner}</td><td style="padding:6px 8px;border:1px solid #ddd">${a.due}</td><td style="padding:6px 8px;border:1px solid #ddd">${a.status}</td></tr>`;
      });
      body += `</table>`;
    }

    if (type === 'full' || type === 'requisitions') {
      title = title || 'PLC — Requisitions';
      body += `<h2>PLC Requisitions</h2><table style="border-collapse:collapse;width:100%"><tr style="background:#0F4C75;color:#fff"><th style="padding:8px;border:1px solid #ddd">Date</th><th style="padding:8px;border:1px solid #ddd">Item</th><th style="padding:8px;border:1px solid #ddd">Qty</th><th style="padding:8px;border:1px solid #ddd">Purpose</th><th style="padding:8px;border:1px solid #ddd">Requested By</th><th style="padding:8px;border:1px solid #ddd">Status</th></tr>`;
      requisitions.forEach(r => {
        body += `<tr><td style="padding:6px 8px;border:1px solid #ddd">${r.date}</td><td style="padding:6px 8px;border:1px solid #ddd">${r.itemName}</td><td style="padding:6px 8px;border:1px solid #ddd">${r.quantity} ${r.unit}</td><td style="padding:6px 8px;border:1px solid #ddd">${r.purpose}</td><td style="padding:6px 8px;border:1px solid #ddd">${r.requestedBy}</td><td style="padding:6px 8px;border:1px solid #ddd">${r.status}</td></tr>`;
      });
      body += `</table>`;
    }

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
      <style>*{font-family:'Segoe UI',Arial,sans-serif}body{padding:30px;color:#1A1A2E;max-width:900px;margin:0 auto}
      h1{color:#0F4C75;border-bottom:3px solid #0F4C75;padding-bottom:10px}
      h2{color:#0F4C75;margin-top:25px}table{font-size:13px}
      .confidential{background:#FEF6E7;border-left:4px solid #F59E0B;padding:10px;margin:15px 0;font-size:12px;color:#92400E}
      @media print{body{padding:15px}}</style></head><body>
      <h1>${title}</h1>
      <div class="confidential">Generated: ${new Date().toLocaleString()} | PLC Coordinator: ${coordinatorName}</div>
      ${body}
      <script>window.onload=function(){window.print()}</script></body></html>`;
    const printWin = window.open('', '_blank');
    if (printWin) { printWin.document.write(html); printWin.document.close(); }
    else { Alert.alert('Popup Blocked', 'Please allow popups to generate the report.'); }
  };

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Meetings" value={meetings.length} accentColor={colors.primary} />
              <StatCard label="Scheduled" value={scheduledMeetings.length} accentColor={colors.warning} />
              <StatCard label="Observations" value={observations.length} subtitle={`${pendingObservations.length} pending review`} accentColor={colors.info} />
              <StatCard label="Action Items" value={actionItems.length} subtitle={`${inProgressActions.length} in progress`} accentColor={colors.purple} />
              <StatCard label="Resources" value={resources.length} accentColor={colors.success} />
              <StatCard label="Pending Reqs" value={pendingReqs.length} accentColor={colors.danger} />
            </CardGrid>

            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.primary }]} onPress={() => { setMeetingForm({ date: todayStr(), topic: '', facilitator: coordinatorName, location: 'Staff Common Room', startTime: '15:30', endTime: '17:00', status: 'Scheduled', agenda: '' }); openModal('meeting'); }}>
                <Text style={styles.quickBtnText}>+ Schedule Meeting</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.info }]} onPress={() => { setObsForm({ date: todayStr(), teacherName: coordinatorName, observedTeacher: '', subject: '', classForm: '', lessonTopic: '', observerName: coordinatorName, rating: 'Good', strengths: '', improvements: '', questionsRaised: '', studentEngagement: 'Good', classroomManagement: 'Good', instructionalClarity: 'Good', recommendations: '', followUpAction: '' }); openModal('observation'); }}>
                <Text style={styles.quickBtnText}>+ Critical Friend Form</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.purple }]} onPress={() => { setReqForm({ date: todayStr(), itemName: '', quantity: '', unit: 'packs', purpose: '', requestedBy: coordinatorName }); openModal('requisition'); }}>
                <Text style={styles.quickBtnText}>+ PLC Requisition</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.success }]} onPress={() => generateReport('full')}>
                <Text style={styles.quickBtnText}>Generate Report</Text>
              </TouchableOpacity>
            </View>

            {pendingObservations.length > 0 && (
              <View style={[styles.alertCard, { borderLeftColor: colors.warning }]}>
                <Text style={styles.alertTitle}>{pendingObservations.length} Observation(s) Pending Review</Text>
                {pendingObservations.map(o => (
                  <Text key={o.id} style={styles.alertText}>{o.observedTeacher} — {o.subject} | Submitted by {o.observerName}</Text>
                ))}
              </View>
            )}

            {pendingReqs.length > 0 && (
              <View style={[styles.alertCard, { borderLeftColor: colors.danger }]}>
                <Text style={styles.alertTitle}>{pendingReqs.length} Requisition(s) Pending Academic Approval</Text>
                {pendingReqs.map(r => (
                  <Text key={r.id} style={styles.alertText}>{r.itemName} — {r.quantity} {r.unit} | By {r.requestedBy}</Text>
                ))}
              </View>
            )}

            <Text style={styles.sectionTitle}>Upcoming Meetings</Text>
            {scheduledMeetings.length === 0 && <Text style={styles.emptyText}>No scheduled meetings.</Text>}
            {scheduledMeetings.map(m => (
              <View key={m.id} style={[styles.card, { borderLeftColor: colors.warning }]}>
                <Text style={styles.cardTitle}>{m.topic}</Text>
                <Text style={styles.cardMeta}>{m.date} | {m.startTime}–{m.endTime} | {m.location}</Text>
                <Text style={styles.cardMeta}>Facilitator: {m.facilitator}</Text>
                <Text style={styles.cardMeta}>Registered: {m.attendance.length} teachers</Text>
              </View>
            ))}
          </View>
        );

      case 'meetings':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total" value={meetings.length} accentColor={colors.primary} />
              <StatCard label="Scheduled" value={scheduledMeetings.length} accentColor={colors.warning} />
              <StatCard label="Completed" value={completedMeetings.length} accentColor={colors.success} />
              <StatCard label="Avg Attendance" value={meetings.length > 0 ? Math.round(meetings.reduce((s, m) => s + m.attendance.filter(a => a.status === 'Present' || a.status === 'Late').length, 0) / meetings.length) : 0} subtitle="per meeting" accentColor={colors.info} />
            </CardGrid>

            <TouchableOpacity style={styles.actionBtn} onPress={() => { setMeetingForm({ date: todayStr(), topic: '', facilitator: coordinatorName, location: 'Staff Common Room', startTime: '15:30', endTime: '17:00', status: 'Scheduled', agenda: '' }); openModal('meeting'); }}>
              <Text style={styles.actionBtnText}>+ Schedule PLC Session</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>All Meetings</Text>
            {meetings.map((m) => (
              <View key={m.id} style={[styles.card, { borderLeftColor: statusColor(m.status) }]}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{m.topic}</Text>
                    <Text style={styles.cardMeta}>{m.date} | {m.startTime}–{m.endTime} | {m.location}</Text>
                    <Text style={styles.cardMeta}>Facilitator: {m.facilitator}</Text>
                    {m.agenda ? <Text style={styles.cardNotes}>Agenda: {m.agenda}</Text> : null}
                    {m.minutes ? <Text style={styles.cardNotes}>Minutes: {m.minutes}</Text> : null}
                  </View>
                  {renderBadge(m.status, statusColor(m.status))}
                </View>

                <View style={styles.attendanceSection}>
                  <Text style={styles.attendanceTitle}>Attendance ({m.attendance.length})</Text>
                  {m.attendance.map((a, i) => (
                    <View key={i} style={styles.attendanceRow}>
                      <Text style={styles.attendanceName}>{a.teacherName}</Text>
                      {renderBadge(a.status, statusColor(a.status))}
                      {a.notes ? <Text style={styles.attendanceNotes}> — {a.notes}</Text> : null}
                    </View>
                  ))}
                  {m.attendance.length === 0 && <Text style={styles.emptyText}>No attendance recorded yet.</Text>}
                  <TouchableOpacity onPress={() => { setAttendanceModal({ meetingId: m.id, meetingTopic: m.topic }); setAttendanceInput({ teacherName: '', status: 'Present', notes: '' }); }}>
                    <Text style={styles.actionLink}>+ Mark Attendance</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.cardActions}>
                  {m.status !== 'Completed' && (
                    <TouchableOpacity onPress={() => setMinutesModal({ id: m.id, minutes: m.minutes })}>
                      <Text style={styles.actionLink}>Record Minutes →</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => handleDelete(m.id, 'meeting')}>
                    <Text style={styles.deleteLink}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );

      case 'duty':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Duties" value={dutyRoster.length} accentColor={colors.primary} />
              <StatCard label="Coordinators" value={new Set(dutyRoster.map(d => d.coordinator)).size} accentColor={colors.info} />
              <StatCard label="Days Covered" value={new Set(dutyRoster.map(d => d.day)).size} subtitle="of 5" accentColor={colors.warning} />
              <StatCard label="This Week" value={dutyRoster.length} accentColor={colors.success} />
            </CardGrid>

            <TouchableOpacity style={styles.actionBtn} onPress={() => { setDutyForm({ coordinator: coordinatorName, day: 'Monday', responsibility: '', timeSlot: '', notes: '' }); openModal('duty'); }}>
              <Text style={styles.actionBtnText}>+ Assign Duty</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Weekly Duty Roster</Text>
            {DUTY_DAYS.map(day => {
              const dayDuties = dutyRoster.filter(d => d.day === day);
              if (dayDuties.length === 0) return null;
              return (
                <View key={day}>
                  <Text style={styles.dayHeader}>{day}</Text>
                  {dayDuties.map(d => (
                    <View key={d.id} style={[styles.card, { borderLeftColor: colors.primaryLight }]}>
                      <View style={styles.cardHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.cardTitle}>{d.responsibility}</Text>
                          <Text style={styles.cardMeta}>Coordinator: {d.coordinator} | {d.timeSlot}</Text>
                          {d.notes ? <Text style={styles.cardNotes}>{d.notes}</Text> : null}
                        </View>
                        <TouchableOpacity onPress={() => handleDelete(d.id, 'duty')}>
                          <Text style={styles.deleteLink}>Remove</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        );

      case 'observations':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total" value={observations.length} accentColor={colors.primary} />
              <StatCard label="Pending Review" value={pendingObservations.length} accentColor={colors.warning} />
              <StatCard label="Discussed" value={observations.filter(o => o.status === 'Discussed').length} accentColor={colors.success} />
              <StatCard label="Reviewed" value={observations.filter(o => o.status === 'Reviewed').length} accentColor={colors.info} />
            </CardGrid>

            <TouchableOpacity style={styles.actionBtn} onPress={() => { setObsForm({ date: todayStr(), teacherName: coordinatorName, observedTeacher: '', subject: '', classForm: '', lessonTopic: '', observerName: coordinatorName, rating: 'Good', strengths: '', improvements: '', questionsRaised: '', studentEngagement: 'Good', classroomManagement: 'Good', instructionalClarity: 'Good', recommendations: '', followUpAction: '' }); openModal('observation'); }}>
              <Text style={styles.actionBtnText}>+ Submit Critical Friend Observation</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Critical Friend Observations</Text>
            <Text style={styles.pageSubtitle}>Forms received from teachers who observed a colleague's lesson</Text>

            {observations.map((o) => (
              <View key={o.id} style={[styles.card, { borderLeftColor: statusColor(o.status) }]}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{o.observedTeacher} — {o.subject} ({o.classForm})</Text>
                    <Text style={styles.cardMeta}>Date: {o.date} | Observer: {o.observerName}</Text>
                    <Text style={styles.cardMeta}>Lesson Topic: {o.lessonTopic}</Text>
                    <Text style={styles.cardMeta}>Overall Rating: {o.rating}</Text>
                    <Text style={styles.cardNotes}>Strengths: {o.strengths}</Text>
                    <Text style={styles.cardNotes}>Improvements: {o.improvements}</Text>
                    <Text style={styles.cardNotes}>Questions: {o.questionsRaised}</Text>
                    <Text style={styles.cardMeta}>Engagement: {o.studentEngagement} | Management: {o.classroomManagement} | Clarity: {o.instructionalClarity}</Text>
                    <Text style={styles.cardNotes}>Recommendations: {o.recommendations}</Text>
                    <Text style={styles.cardNotes}>Follow-up: {o.followUpAction}</Text>
                  </View>
                  {renderBadge(o.status, statusColor(o.status))}
                </View>
                <View style={styles.cardActions}>
                  {o.status === 'Submitted' && (
                    <TouchableOpacity onPress={() => updateObservationStatus(o.id, 'Reviewed')}>
                      <Text style={styles.actionLink}>Mark Reviewed →</Text>
                    </TouchableOpacity>
                  )}
                  {o.status === 'Reviewed' && (
                    <TouchableOpacity onPress={() => updateObservationStatus(o.id, 'Discussed')}>
                      <Text style={styles.actionLink}>Mark Discussed →</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => handleDelete(o.id, 'observation')}>
                    <Text style={styles.deleteLink}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );

      case 'lesson':
        return (
          <View>
            <TouchableOpacity style={styles.actionBtn} onPress={() => { setLessonForm({ date: todayStr(), teacherObserved: '', subject: '', observer: coordinatorName, notes: '' }); openModal('lesson'); }}>
              <Text style={styles.actionBtnText}>+ Log Lesson Study</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>Lesson Study Log</Text>
            <Text style={styles.pageSubtitle}>Shared observations and teaching strategies</Text>
            {lessonStudies.map(l => (
              <View key={l.id} style={[styles.card, { borderLeftColor: colors.info }]}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{l.teacherObserved} — {l.subject}</Text>
                    <Text style={styles.cardMeta}>{l.date} | Observer: {l.observer}</Text>
                    {l.notes ? <Text style={styles.cardNotes}>{l.notes}</Text> : null}
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(l.id, 'lesson study')}>
                    <Text style={styles.deleteLink}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );

      case 'performance':
        return (
          <View>
            <TouchableOpacity style={styles.actionBtn} onPress={() => { setPerfForm({ date: todayStr(), focusArea: '', keyFinding: '', dataSummary: '' }); openModal('performance'); }}>
              <Text style={styles.actionBtnText}>+ Add Performance Review</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>Performance Data Review</Text>
            <Text style={styles.pageSubtitle}>Student performance data discussed in sessions</Text>
            {performanceReviews.map(p => (
              <View key={p.id} style={[styles.card, { borderLeftColor: colors.info }]}>
                <Text style={styles.cardTitle}>{p.focusArea}</Text>
                <Text style={styles.cardMeta}>Date: {p.date}</Text>
                <Text style={styles.cardNotes}>Finding: {p.keyFinding}</Text>
                {p.dataSummary ? <Text style={styles.cardNotes}>Data: {p.dataSummary}</Text> : null}
                <TouchableOpacity onPress={() => handleDelete(p.id, 'performance')}>
                  <Text style={styles.deleteLink}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        );

      case 'resources':
        return (
          <View>
            <TouchableOpacity style={styles.actionBtn} onPress={() => { setResourceForm({ title: '', sharedBy: coordinatorName, date: todayStr(), category: 'Lesson Plan', description: '' }); openModal('resource'); }}>
              <Text style={styles.actionBtnText}>+ Share Resource</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>Resource Sharing</Text>
            <Text style={styles.pageSubtitle}>Materials and best practices shared among teachers</Text>
            {resources.map(r => (
              <View key={r.id} style={[styles.card, { borderLeftColor: colors.success }]}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{r.title}</Text>
                    <Text style={styles.cardMeta}>{r.category} | Shared by {r.sharedBy} | {r.date}</Text>
                    {r.description ? <Text style={styles.cardNotes}>{r.description}</Text> : null}
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(r.id, 'resource')}>
                    <Text style={styles.deleteLink}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );

      case 'action':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total" value={actionItems.length} accentColor={colors.primary} />
              <StatCard label="In Progress" value={inProgressActions.length} accentColor={colors.info} />
              <StatCard label="Completed" value={actionItems.filter(a => a.status === 'Completed').length} accentColor={colors.success} />
              <StatCard label="Overdue" value={actionItems.filter(a => a.status === 'Overdue').length} accentColor={colors.danger} />
            </CardGrid>

            <TouchableOpacity style={styles.actionBtn} onPress={() => { setActionForm({ session: '', action: '', owner: '', due: todayStr(), status: 'Not Started' }); openModal('action'); }}>
              <Text style={styles.actionBtnText}>+ Add Action Item</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Action Plan Tracker</Text>
            {actionItems.map(a => (
              <View key={a.id} style={[styles.card, { borderLeftColor: statusColor(a.status) }]}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{a.action}</Text>
                    <Text style={styles.cardMeta}>Session: {a.session} | Owner: {a.owner} | Due: {a.due}</Text>
                  </View>
                  {renderBadge(a.status, statusColor(a.status))}
                </View>
                <View style={styles.cardActions}>
                  {renderSelect('', a.status, ACTION_ITEM_STATUSES, (v) => updateActionStatus(a.id, v as ActionItemStatus))}
                  <TouchableOpacity onPress={() => handleDelete(a.id, 'action item')}>
                    <Text style={styles.deleteLink}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );

      case 'requisitions':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total" value={requisitions.length} accentColor={colors.primary} />
              <StatCard label="Pending" value={pendingReqs.length} accentColor={colors.warning} />
              <StatCard label="Approved" value={requisitions.filter(r => r.status === 'Approved').length} accentColor={colors.success} />
              <StatCard label="Rejected" value={requisitions.filter(r => r.status === 'Rejected').length} accentColor={colors.danger} />
            </CardGrid>

            <TouchableOpacity style={styles.actionBtn} onPress={() => { setReqForm({ date: todayStr(), itemName: '', quantity: '', unit: 'packs', purpose: '', requestedBy: coordinatorName }); openModal('requisition'); }}>
              <Text style={styles.actionBtnText}>+ New PLC Requisition</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>PLC Requisitions</Text>
            <Text style={styles.pageSubtitle}>Requisitions for PLC materials — routed through Academic Office for approval</Text>

            {requisitions.map(r => (
              <View key={r.id} style={[styles.card, { borderLeftColor: statusColor(r.status) }]}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{r.itemName} — {r.quantity} {r.unit}</Text>
                    <Text style={styles.cardMeta}>Date: {r.date} | Requested by: {r.requestedBy}</Text>
                    <Text style={styles.cardNotes}>Purpose: {r.purpose}</Text>
                    {r.approvedBy && <Text style={styles.cardMeta}>Approved by: {r.approvedBy} on {r.approvedDate}</Text>}
                  </View>
                  {renderBadge(r.status, statusColor(r.status))}
                </View>
                <View style={styles.cardActions}>
                  {r.status === 'Pending' && (
                    <>
                      <TouchableOpacity onPress={() => { approveRequisition(r.id, coordinatorName); Alert.alert('Approved', 'Requisition approved by PLC Coordinator. Forwarded to Academic Office.'); }}>
                        <Text style={styles.actionLink}>Approve →</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => { rejectRequisition(r.id, coordinatorName); Alert.alert('Rejected', 'Requisition rejected.'); }}>
                        <Text style={styles.deleteLink}>Reject</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  <TouchableOpacity onPress={() => handleDelete(r.id, 'requisition')}>
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
            <Text style={styles.pageTitle}>PLC Reports</Text>
            <Text style={styles.pageSubtitle}>Generate printable PDF reports for meetings, observations, and action items</Text>

            <View style={styles.reportGrid}>
              <TouchableOpacity style={[styles.reportCard, { borderLeftColor: colors.primary }]} onPress={() => generateReport('full')}>
                <Text style={styles.reportTitle}>Comprehensive Report</Text>
                <Text style={styles.reportDesc}>Full overview: meetings, attendance, observations, action items, requisitions</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.reportCard, { borderLeftColor: colors.info }]} onPress={() => generateReport('meetings')}>
                <Text style={styles.reportTitle}>Meeting Report</Text>
                <Text style={styles.reportDesc}>All meetings with attendance summary and minutes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.reportCard, { borderLeftColor: colors.purple }]} onPress={() => generateReport('observations')}>
                <Text style={styles.reportTitle}>Critical Friend Report</Text>
                <Text style={styles.reportDesc}>All observation forms with ratings and recommendations</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.reportCard, { borderLeftColor: colors.success }]} onPress={() => generateReport('actions')}>
                <Text style={styles.reportTitle}>Action Plan Report</Text>
                <Text style={styles.reportDesc}>All action items with status and owners</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.reportCard, { borderLeftColor: colors.warning }]} onPress={() => generateReport('requisitions')}>
                <Text style={styles.reportTitle}>Requisition Report</Text>
                <Text style={styles.reportDesc}>All PLC requisitions with approval status</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      default: return null;
    }
  };

  const renderModal = () => {
    const titles: Record<string, string> = {
      meeting: 'Schedule PLC Meeting', duty: 'Assign Duty', observation: 'Critical Friend Observation Form',
      lesson: 'Log Lesson Study', performance: 'Add Performance Review', resource: 'Share Resource',
      action: 'Add Action Item', requisition: 'New PLC Requisition',
    };
    return (
      <Modal visible={showModal} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}><ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.modalTitle}>{titles[modalType] || ''}</Text>

          {modalType === 'meeting' && (
            <View>
              <Text style={styles.inputLabel}>Date *</Text>
              <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} value={meetingForm.date} onChangeText={(v) => setMeetingForm({ ...meetingForm, date: v })} />
              <Text style={styles.inputLabel}>Topic *</Text>
              <TextInput style={styles.input} placeholder="e.g. Improving Math literacy" placeholderTextColor={colors.textLight} value={meetingForm.topic} onChangeText={(v) => setMeetingForm({ ...meetingForm, topic: v })} />
              <Text style={styles.inputLabel}>Facilitator</Text>
              <TextInput style={styles.input} placeholder="Facilitator name" placeholderTextColor={colors.textLight} value={meetingForm.facilitator} onChangeText={(v) => setMeetingForm({ ...meetingForm, facilitator: v })} />
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput style={styles.input} placeholder="e.g. Staff Common Room" placeholderTextColor={colors.textLight} value={meetingForm.location} onChangeText={(v) => setMeetingForm({ ...meetingForm, location: v })} />
              <Text style={styles.inputLabel}>Start Time</Text>
              <TextInput style={styles.input} placeholder="15:30" placeholderTextColor={colors.textLight} value={meetingForm.startTime} onChangeText={(v) => setMeetingForm({ ...meetingForm, startTime: v })} />
              <Text style={styles.inputLabel}>End Time</Text>
              <TextInput style={styles.input} placeholder="17:00" placeholderTextColor={colors.textLight} value={meetingForm.endTime} onChangeText={(v) => setMeetingForm({ ...meetingForm, endTime: v })} />
              {renderSelect('Status', meetingForm.status, MEETING_STATUSES, (v) => setMeetingForm({ ...meetingForm, status: v as MeetingStatus }))}
              <Text style={styles.inputLabel}>Agenda</Text>
              <TextInput style={[styles.input, styles.textArea]} placeholder="Meeting agenda items..." placeholderTextColor={colors.textLight} value={meetingForm.agenda} onChangeText={(v) => setMeetingForm({ ...meetingForm, agenda: v })} multiline />
            </View>
          )}

          {modalType === 'duty' && (
            <View>
              <Text style={styles.inputLabel}>Coordinator</Text>
              <TextInput style={styles.input} placeholder="Coordinator name" placeholderTextColor={colors.textLight} value={dutyForm.coordinator} onChangeText={(v) => setDutyForm({ ...dutyForm, coordinator: v })} />
              {renderSelect('Day', dutyForm.day, DUTY_DAYS, (v) => setDutyForm({ ...dutyForm, day: v as DutyDay }))}
              <Text style={styles.inputLabel}>Responsibility *</Text>
              <TextInput style={styles.input} placeholder="e.g. Coordinate Math PLC session" placeholderTextColor={colors.textLight} value={dutyForm.responsibility} onChangeText={(v) => setDutyForm({ ...dutyForm, responsibility: v })} />
              <Text style={styles.inputLabel}>Time Slot</Text>
              <TextInput style={styles.input} placeholder="e.g. 15:30 - 17:00" placeholderTextColor={colors.textLight} value={dutyForm.timeSlot} onChangeText={(v) => setDutyForm({ ...dutyForm, timeSlot: v })} />
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput style={[styles.input, styles.textArea]} placeholder="Additional notes..." placeholderTextColor={colors.textLight} value={dutyForm.notes} onChangeText={(v) => setDutyForm({ ...dutyForm, notes: v })} multiline />
            </View>
          )}

          {modalType === 'observation' && (
            <View>
              <Text style={styles.inputLabel}>Date *</Text>
              <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} value={obsForm.date} onChangeText={(v) => setObsForm({ ...obsForm, date: v })} />
              <Text style={styles.inputLabel}>Teacher Observed (Colleague) *</Text>
              <TextInput style={styles.input} placeholder="Name of the teacher whose lesson was observed" placeholderTextColor={colors.textLight} value={obsForm.observedTeacher} onChangeText={(v) => setObsForm({ ...obsForm, observedTeacher: v })} />
              <Text style={styles.inputLabel}>Observer (Critical Friend) *</Text>
              <TextInput style={styles.input} placeholder="Your name (the observer)" placeholderTextColor={colors.textLight} value={obsForm.observerName} onChangeText={(v) => setObsForm({ ...obsForm, observerName: v })} />
              <Text style={styles.inputLabel}>Subject *</Text>
              <TextInput style={styles.input} placeholder="e.g. Elect. Math" placeholderTextColor={colors.textLight} value={obsForm.subject} onChangeText={(v) => setObsForm({ ...obsForm, subject: v })} />
              <Text style={styles.inputLabel}>Class/Form</Text>
              <TextInput style={styles.input} placeholder="e.g. SHS2 Sci A" placeholderTextColor={colors.textLight} value={obsForm.classForm} onChangeText={(v) => setObsForm({ ...obsForm, classForm: v })} />
              <Text style={styles.inputLabel}>Lesson Topic *</Text>
              <TextInput style={styles.input} placeholder="e.g. Quadratic equations" placeholderTextColor={colors.textLight} value={obsForm.lessonTopic} onChangeText={(v) => setObsForm({ ...obsForm, lessonTopic: v })} />
              {renderSelect('Overall Rating', obsForm.rating, OBSERVATION_RATINGS, (v) => setObsForm({ ...obsForm, rating: v as ObservationRating }))}
              <Text style={styles.inputLabel}>Strengths Observed</Text>
              <TextInput style={[styles.input, styles.textArea]} placeholder="What did the teacher do well?" placeholderTextColor={colors.textLight} value={obsForm.strengths} onChangeText={(v) => setObsForm({ ...obsForm, strengths: v })} multiline />
              <Text style={styles.inputLabel}>Areas for Improvement</Text>
              <TextInput style={[styles.input, styles.textArea]} placeholder="What could be improved?" placeholderTextColor={colors.textLight} value={obsForm.improvements} onChangeText={(v) => setObsForm({ ...obsForm, improvements: v })} multiline />
              <Text style={styles.inputLabel}>Questions Raised</Text>
              <TextInput style={[styles.input, styles.textArea]} placeholder="Questions for discussion" placeholderTextColor={colors.textLight} value={obsForm.questionsRaised} onChangeText={(v) => setObsForm({ ...obsForm, questionsRaised: v })} multiline />
              {renderSelect('Student Engagement', obsForm.studentEngagement, OBSERVATION_RATINGS, (v) => setObsForm({ ...obsForm, studentEngagement: v as ObservationRating }))}
              {renderSelect('Classroom Management', obsForm.classroomManagement, OBSERVATION_RATINGS, (v) => setObsForm({ ...obsForm, classroomManagement: v as ObservationRating }))}
              {renderSelect('Instructional Clarity', obsForm.instructionalClarity, OBSERVATION_RATINGS, (v) => setObsForm({ ...obsForm, instructionalClarity: v as ObservationRating }))}
              <Text style={styles.inputLabel}>Recommendations</Text>
              <TextInput style={[styles.input, styles.textArea]} placeholder="Suggestions for the teacher" placeholderTextColor={colors.textLight} value={obsForm.recommendations} onChangeText={(v) => setObsForm({ ...obsForm, recommendations: v })} multiline />
              <Text style={styles.inputLabel}>Follow-up Action</Text>
              <TextInput style={[styles.input, styles.textArea]} placeholder="What should happen next?" placeholderTextColor={colors.textLight} value={obsForm.followUpAction} onChangeText={(v) => setObsForm({ ...obsForm, followUpAction: v })} multiline />
            </View>
          )}

          {modalType === 'lesson' && (
            <View>
              <Text style={styles.inputLabel}>Date *</Text>
              <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} value={lessonForm.date} onChangeText={(v) => setLessonForm({ ...lessonForm, date: v })} />
              <Text style={styles.inputLabel}>Teacher Observed *</Text>
              <TextInput style={styles.input} placeholder="Teacher name" placeholderTextColor={colors.textLight} value={lessonForm.teacherObserved} onChangeText={(v) => setLessonForm({ ...lessonForm, teacherObserved: v })} />
              <Text style={styles.inputLabel}>Subject</Text>
              <TextInput style={styles.input} placeholder="e.g. Core Math" placeholderTextColor={colors.textLight} value={lessonForm.subject} onChangeText={(v) => setLessonForm({ ...lessonForm, subject: v })} />
              <Text style={styles.inputLabel}>Observer</Text>
              <TextInput style={styles.input} placeholder="Observer name" placeholderTextColor={colors.textLight} value={lessonForm.observer} onChangeText={(v) => setLessonForm({ ...lessonForm, observer: v })} />
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput style={[styles.input, styles.textArea]} placeholder="Observation notes" placeholderTextColor={colors.textLight} value={lessonForm.notes} onChangeText={(v) => setLessonForm({ ...lessonForm, notes: v })} multiline />
            </View>
          )}

          {modalType === 'performance' && (
            <View>
              <Text style={styles.inputLabel}>Date *</Text>
              <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} value={perfForm.date} onChangeText={(v) => setPerfForm({ ...perfForm, date: v })} />
              <Text style={styles.inputLabel}>Focus Area *</Text>
              <TextInput style={styles.input} placeholder="e.g. SHS1 Math scores" placeholderTextColor={colors.textLight} value={perfForm.focusArea} onChangeText={(v) => setPerfForm({ ...perfForm, focusArea: v })} />
              <Text style={styles.inputLabel}>Key Finding</Text>
              <TextInput style={styles.input} placeholder="e.g. 30% below 50% threshold" placeholderTextColor={colors.textLight} value={perfForm.keyFinding} onChangeText={(v) => setPerfForm({ ...perfForm, keyFinding: v })} />
              <Text style={styles.inputLabel}>Data Summary</Text>
              <TextInput style={[styles.input, styles.textArea]} placeholder="Summary of data reviewed" placeholderTextColor={colors.textLight} value={perfForm.dataSummary} onChangeText={(v) => setPerfForm({ ...perfForm, dataSummary: v })} multiline />
            </View>
          )}

          {modalType === 'resource' && (
            <View>
              <Text style={styles.inputLabel}>Resource Title *</Text>
              <TextInput style={styles.input} placeholder="e.g. Visual aids for quadratic equations" placeholderTextColor={colors.textLight} value={resourceForm.title} onChangeText={(v) => setResourceForm({ ...resourceForm, title: v })} />
              <Text style={styles.inputLabel}>Shared By</Text>
              <TextInput style={styles.input} placeholder="Your name" placeholderTextColor={colors.textLight} value={resourceForm.sharedBy} onChangeText={(v) => setResourceForm({ ...resourceForm, sharedBy: v })} />
              <Text style={styles.inputLabel}>Date</Text>
              <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} value={resourceForm.date} onChangeText={(v) => setResourceForm({ ...resourceForm, date: v })} />
              {renderSelect('Category', resourceForm.category, RESOURCE_CATEGORIES, (v) => setResourceForm({ ...resourceForm, category: v }))}
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput style={[styles.input, styles.textArea]} placeholder="Brief description" placeholderTextColor={colors.textLight} value={resourceForm.description} onChangeText={(v) => setResourceForm({ ...resourceForm, description: v })} multiline />
            </View>
          )}

          {modalType === 'action' && (
            <View>
              <Text style={styles.inputLabel}>Session *</Text>
              <TextInput style={styles.input} placeholder="e.g. Jun 26" placeholderTextColor={colors.textLight} value={actionForm.session} onChangeText={(v) => setActionForm({ ...actionForm, session: v })} />
              <Text style={styles.inputLabel}>Action Item *</Text>
              <TextInput style={styles.input} placeholder="e.g. Create remedial Math worksheets" placeholderTextColor={colors.textLight} value={actionForm.action} onChangeText={(v) => setActionForm({ ...actionForm, action: v })} />
              <Text style={styles.inputLabel}>Owner *</Text>
              <TextInput style={styles.input} placeholder="Responsible teacher" placeholderTextColor={colors.textLight} value={actionForm.owner} onChangeText={(v) => setActionForm({ ...actionForm, owner: v })} />
              <Text style={styles.inputLabel}>Due Date</Text>
              <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} value={actionForm.due} onChangeText={(v) => setActionForm({ ...actionForm, due: v })} />
              {renderSelect('Status', actionForm.status, ACTION_ITEM_STATUSES, (v) => setActionForm({ ...actionForm, status: v as ActionItemStatus }))}
            </View>
          )}

          {modalType === 'requisition' && (
            <View>
              <Text style={styles.inputLabel}>Date</Text>
              <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} value={reqForm.date} onChangeText={(v) => setReqForm({ ...reqForm, date: v })} />
              <Text style={styles.inputLabel}>Item Name *</Text>
              <TextInput style={styles.input} placeholder="e.g. A4 Paper (reams)" placeholderTextColor={colors.textLight} value={reqForm.itemName} onChangeText={(v) => setReqForm({ ...reqForm, itemName: v })} />
              <Text style={styles.inputLabel}>Quantity *</Text>
              <TextInput style={styles.input} placeholder="e.g. 5" placeholderTextColor={colors.textLight} value={reqForm.quantity} onChangeText={(v) => setReqForm({ ...reqForm, quantity: v })} keyboardType="numeric" />
              <Text style={styles.inputLabel}>Unit</Text>
              <TextInput style={styles.input} placeholder="e.g. reams, packs" placeholderTextColor={colors.textLight} value={reqForm.unit} onChangeText={(v) => setReqForm({ ...reqForm, unit: v })} />
              <Text style={styles.inputLabel}>Purpose</Text>
              <TextInput style={[styles.input, styles.textArea]} placeholder="What is this needed for?" placeholderTextColor={colors.textLight} value={reqForm.purpose} onChangeText={(v) => setReqForm({ ...reqForm, purpose: v })} multiline />
              <Text style={styles.inputLabel}>Requested By</Text>
              <TextInput style={styles.input} placeholder="Your name" placeholderTextColor={colors.textLight} value={reqForm.requestedBy} onChangeText={(v) => setReqForm({ ...reqForm, requestedBy: v })} />
            </View>
          )}

          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={closeModal}><Text style={styles.modalBtnTextDark}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={() => {
              if (modalType === 'meeting') handleSaveMeeting();
              else if (modalType === 'duty') handleSaveDuty();
              else if (modalType === 'observation') handleSaveObservation();
              else if (modalType === 'lesson') handleSaveLesson();
              else if (modalType === 'performance') handleSavePerf();
              else if (modalType === 'resource') handleSaveResource();
              else if (modalType === 'action') handleSaveAction();
              else if (modalType === 'requisition') handleSaveReq();
            }}><Text style={styles.modalBtnTextLight}>Save</Text></TouchableOpacity>
          </View>
        </ScrollView></View></View>
      </Modal>
    );
  };

  const renderAttendanceModal = () => {
    if (!attendanceModal) return null;
    return (
      <Modal visible={!!attendanceModal} transparent animationType="fade" onRequestClose={() => setAttendanceModal(null)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Mark Attendance — {attendanceModal.meetingTopic}</Text>
          <Text style={styles.inputLabel}>Teacher Name *</Text>
          <TextInput style={styles.input} placeholder="Teacher name" placeholderTextColor={colors.textLight} value={attendanceInput.teacherName} onChangeText={(v) => setAttendanceInput({ ...attendanceInput, teacherName: v })} />
          {renderSelect('Status', attendanceInput.status, ATTENDANCE_STATUSES, (v) => setAttendanceInput({ ...attendanceInput, status: v as AttendanceStatus }))}
          <Text style={styles.inputLabel}>Notes (optional)</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="e.g. Arrived 10 min late" placeholderTextColor={colors.textLight} value={attendanceInput.notes} onChangeText={(v) => setAttendanceInput({ ...attendanceInput, notes: v })} multiline />
          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setAttendanceModal(null)}><Text style={styles.modalBtnTextDark}>Close</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleMarkAttendance}><Text style={styles.modalBtnTextLight}>Mark</Text></TouchableOpacity>
          </View>
        </View></View>
      </Modal>
    );
  };

  const renderMinutesModal = () => {
    if (!minutesModal) return null;
    return (
      <Modal visible={!!minutesModal} transparent animationType="fade" onRequestClose={() => setMinutesModal(null)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Record Meeting Minutes</Text>
          <TextInput style={[styles.input, styles.textArea, { minHeight: 200 }]} placeholder="Type the meeting minutes here..." placeholderTextColor={colors.textLight} value={minutesModal.minutes} onChangeText={(v) => setMinutesModal({ ...minutesModal, minutes: v })} multiline />
          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setMinutesModal(null)}><Text style={styles.modalBtnTextDark}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={handleRecordMinutes}><Text style={styles.modalBtnTextLight}>Save & Complete</Text></TouchableOpacity>
          </View>
        </View></View>
      </Modal>
    );
  };

  return (
    <DashboardLayout title="PLC" navItems={NAV_ITEMS} activeKey={activePage} onNavigate={setActivePage}
      headerRight={<TouchableOpacity onPress={logout} style={styles.logoutBtn}><Text style={styles.logoutText}>Logout</Text></TouchableOpacity>}>
      {renderPage()}
      {renderModal()}
      {renderAttendanceModal()}
      {renderMinutesModal()}
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
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, borderLeftWidth: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xs },
  cardMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  cardNotes: { fontSize: fontSize.sm, color: colors.text, marginTop: spacing.xs },
  cardActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm, alignItems: 'center' },
  actionLink: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.semibold },
  deleteLink: { fontSize: fontSize.sm, color: colors.danger, fontWeight: fontWeight.medium },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  badgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  emptyText: { fontSize: fontSize.md, color: colors.textLight, fontStyle: 'italic', paddingVertical: spacing.md },
  alertCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg, borderLeftWidth: 4 },
  alertTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, marginBottom: spacing.xs },
  alertText: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  quickBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, marginBottom: spacing.sm },
  quickBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  attendanceSection: { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.borderLight },
  attendanceTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xs },
  attendanceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  attendanceName: { fontSize: fontSize.sm, color: colors.text, fontWeight: fontWeight.medium },
  attendanceNotes: { fontSize: fontSize.xs, color: colors.textLight, fontStyle: 'italic' },
  dayHeader: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.primary, marginTop: spacing.md, marginBottom: spacing.sm },
  reportGrid: { gap: spacing.md },
  reportCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderLeftWidth: 4 },
  reportTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xs },
  reportDesc: { fontSize: fontSize.sm, color: colors.textSecondary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  modalContent: { backgroundColor: colors.surface, borderRadius: radius.xl, width: '100%', maxWidth: 480, padding: spacing.xl, maxHeight: '90%' },
  modalTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.lg },
  inputLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textSecondary, marginBottom: spacing.xs, marginTop: spacing.sm },
  input: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md, color: colors.text, marginBottom: spacing.sm, backgroundColor: colors.surfaceAlt },
  textArea: { minHeight: 60 },
  selectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  selectChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.sm, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surfaceAlt },
  selectChipActive: { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
  selectChipText: { fontSize: fontSize.xs, color: colors.textSecondary },
  selectChipTextActive: { color: colors.primary, fontWeight: fontWeight.bold },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  modalBtn: { flex: 1, paddingVertical: spacing.sm + 2, borderRadius: radius.md, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: colors.surfaceAlt },
  modalBtnSubmit: { backgroundColor: colors.primary },
  modalBtnTextDark: { color: colors.text, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  modalBtnTextLight: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
});
