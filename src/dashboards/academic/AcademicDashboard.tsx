import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, ScrollView } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid, DataTable, RequisitionModal } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useAuthStore } from '@store/authStore';
import { useRequisitionStore } from '@store/requisitionStore';
import { usePLCStore } from '@store/plcStore';
import { useAcademicStore } from '@store/academicStore';
import {
  RESULTS_ENTRY_STATUSES, SPIP_PRIORITIES, SPIP_FOCUS_AREAS, SPIP_GOAL_STATUSES,
  CURRICULUM_STATUSES, CALENDAR_EVENT_TYPES, TERM_NAMES,
} from '@store/academicStore';

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Academic Overview' },
  { key: 'monitor', label: 'Academic Monitor' },
  { key: 'insights', label: 'Insights & Analytics' },
  { key: 'timetable', label: 'Timetable Manager' },
  { key: 'exams', label: 'Exam Management' },
  { key: 'reports', label: 'Report Cards' },
  { key: 'transcripts', label: 'Transcripts' },
  { key: 'spip', label: 'School Improvement Plan' },
  { key: 'curriculum', label: 'Curriculum Tracker' },
  { key: 'calendar', label: 'Academic Calendar' },
  { key: 'hod', label: 'HOD Approvals' },
  { key: 'supplies', label: 'Stationery Requests' },
  { key: 'plc', label: 'PLC Requisitions' },
  { key: 'academic-reports', label: 'Reports & PDF' },
];

export function AcademicDashboard() {
  const [activePage, setActivePage] = useState('overview');
  const [showReqModal, setShowReqModal] = useState(false);
  const { logout, user } = useAuthStore();
  const { getByDepartment } = useRequisitionStore();
  const myRequisitions = getByDepartment('Academic');
  const reqStatusColor = (s: string) => s === 'Issued' ? colors.success : s === 'Approved' ? colors.info : s === 'Rejected' ? colors.danger : colors.warning;

  const {
    requisitions: plcRequisitions, approveRequisition, rejectRequisition,
  } = usePLCStore();
  const plcPending = plcRequisitions.filter(r => r.status === 'Pending');
  const plcApproved = plcRequisitions.filter(r => r.status === 'Approved');
  const plcRejected = plcRequisitions.filter(r => r.status === 'Rejected');
  const academicOfficer = user?.displayName ?? 'Academic Office';

  const aStore = useAcademicStore();
  const {
    exams, timetables, hodApprovals, reportCards, transcripts, spips,
    curriculum, calendar, terms, subjectPerformance, teacherActivity, admissionInsights,
    addExam, updateExam, deleteExam, updateExamResultsStatus,
    addTimetable, deleteTimetable, publishTimetable,
    approveHOD, deferHOD, rejectHOD,
    generateReportCards, reviewReportCard, releaseReportCard, releaseAllForClass, deleteReportCard, getReportCardsByClass,
    generateTranscript, approveTranscript, rejectTranscript, releaseTranscript, deleteTranscript,
    addSPIP, updateSPIP, deleteSPIP,
    addSPIPGoal, updateSPIPGoal, addSPIPActionItem, toggleSPIPActionItem,
    addSPIPMilestone, addSPIPReview,
    addCurriculum, updateCurriculum, deleteCurriculum,
    addCalendarEvent, deleteCalendarEvent,
    setCurrentTerm,
    getOverallStats,
  } = aStore;

  const stats = getOverallStats();

  // Modal states
  const [showExamModal, setShowExamModal] = useState(false);
  const [showTimetableModal, setShowTimetableModal] = useState(false);
  const [showSPIPModal, setShowSPIPModal] = useState(false);
  const [showSPIPGoalModal, setShowSPIPGoalModal] = useState<string | null>(null);
  const [showSPIPActionModal, setShowSPIPActionModal] = useState<string | null>(null);
  const [showSPIPMilestoneModal, setShowSPIPMilestoneModal] = useState<string | null>(null);
  const [showSPIPReviewModal, setShowSPIPReviewModal] = useState<string | null>(null);
  const [showCurriculumModal, setShowCurriculumModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [hodReview, setHODReview] = useState<{ id: string; action: 'approve' | 'defer' | 'reject' } | null>(null);
  const [hodNotes, setHODNotes] = useState('');
  const [reportClass, setReportClass] = useState('SHS1 Sci A');
  const [transcriptReject, setTranscriptReject] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Form states
  const [examForm, setExamForm] = useState({ title: '', subject: '', classForm: '', date: '', startTime: '', endTime: '', venue: '', maxScore: 50, invigilator: '', term: 'Term 3' as any });
  const [timetableForm, setTimetableForm] = useState({ classForm: '', day: 'Monday', period: 1, startTime: '', endTime: '', subject: '', teacher: '', room: '' });
  const [spipForm, setSPIPForm] = useState({ title: '', academicYear: '2024/2025', planLead: '', priority: 'Medium' as any, startDate: '', endDate: '', strengths: '', weaknesses: '', rootCauses: '', priorityAreas: '', vision: '', teamMembers: '' });
  const [spipGoalForm, setSPIPGoalForm] = useState({ title: '', focusArea: 'Instruction' as any, description: '', baseline: '', target: '', currentProgress: '', status: 'Not Started' as any, responsible: '', deadline: '' });
  const [spipActionForm, setSPIPActionForm] = useState({ description: '', focusArea: 'Instruction' as any, responsible: '', timeline: '' });
  const [spipMilestoneForm, setSPIPMilestoneForm] = useState({ title: '', targetDate: '' });
  const [spipReviewForm, setSPIPReviewForm] = useState({ summary: '', outcomes: '' });
  const [curriculumForm, setCurriculumForm] = useState({ subject: '', department: '', hod: '', classForm: '', syllabusTopics: 0, topicsCovered: 0, status: 'Not Started' as any, notes: '' });
  const [calendarForm, setCalendarForm] = useState({ title: '', type: 'Event' as any, date: '', endDate: '', description: '', term: 'Term 3' as any });
  const [transcriptForm, setTranscriptForm] = useState({ studentName: '', admNo: '', classForm: '', academicYear: '2024/2025', termsCovered: [] as any[], cumulativeAverage: 0, overallPosition: '', conduct: '', attendance: '' });

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      'Pending': colors.warning, 'Approved': colors.success, 'Rejected': colors.danger, 'Deferred': colors.info,
      'Scheduled': colors.info, 'Ongoing': colors.warning, 'Completed': colors.success, 'Cancelled': colors.danger,
      'Published': colors.success, 'Draft': colors.warning, 'Archived': colors.textLight,
      'Released': colors.success, 'Generated': colors.info, 'Under Review': colors.warning, 'Not Generated': colors.textLight,
      'Active': colors.success, 'Monitoring': colors.info, 'Discontinued': colors.danger,
      'Not Started': colors.textLight, 'In Progress': colors.warning, 'Revised': colors.info,
    };
    return map[s] ?? colors.textSecondary;
  };

  const renderBadge = (status: string, color: string) => (
    <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
      <Text style={[styles.statusText, { color }]}>{status}</Text>
    </View>
  );

  const generatePDF = (reportType: string) => {
    const now = new Date().toLocaleString();
    const dateStr = new Date().toISOString().slice(0, 10);
    let body = '';
    let title = '';

    if (reportType === 'full' || reportType === 'overview') {
      title = 'Academic Operations Overview';
      body += `<h2>Summary</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px">
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Total Students</td><td style="padding:8px 12px;border:1px solid #ddd">${stats.totalStudents}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Total Teachers</td><td style="padding:8px 12px;border:1px solid #ddd">${stats.totalTeachers}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Total Subjects</td><td style="padding:8px 12px;border:1px solid #ddd">${stats.totalSubjects}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Avg Syllabus Coverage</td><td style="padding:8px 12px;border:1px solid #ddd">${stats.avgCoverage}%</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Avg Pass Rate</td><td style="padding:8px 12px;border:1px solid #ddd">${stats.avgPassRate}%</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Pending Report Cards</td><td style="padding:8px 12px;border:1px solid #ddd">${stats.pendingReportCards}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Pending Transcripts</td><td style="padding:8px 12px;border:1px solid #ddd">${stats.pendingTranscripts}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Active Improvement Plans</td><td style="padding:8px 12px;border:1px solid #ddd">${stats.activeSPIPs}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Pending HOD Approvals</td><td style="padding:8px 12px;border:1px solid #ddd">${stats.pendingHODApprovals}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Scheduled Exams</td><td style="padding:8px 12px;border:1px solid #ddd">${stats.scheduledExams}</td></tr>
      </table>`;
    }

    if (reportType === 'full' || reportType === 'exams') {
      title = reportType === 'full' ? title : 'Exam Management Report';
      body += `<h2>Exams</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Title</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Subject</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Class</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Date</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Time</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Venue</th>
        <th style="padding:6px 8px;border:1px solid #ddd">Status</th>
      </tr></thead><tbody>`;
      exams.forEach(e => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${e.title}</td><td style="padding:4px 8px;border:1px solid #ddd">${e.subject}</td><td style="padding:4px 8px;border:1px solid #ddd">${e.classForm}</td><td style="padding:4px 8px;border:1px solid #ddd">${e.date}</td><td style="padding:4px 8px;border:1px solid #ddd">${e.startTime}-${e.endTime}</td><td style="padding:4px 8px;border:1px solid #ddd">${e.venue}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${e.status}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'reportcards') {
      title = reportType === 'full' ? title : 'Report Cards Report';
      body += `<h2>Report Cards</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Student</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Adm No</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Class</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Term</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Year</th>
        <th style="padding:6px 8px;border:1px solid #ddd">Average</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Position</th>
        <th style="padding:6px 8px;border:1px solid #ddd">Status</th>
      </tr></thead><tbody>`;
      reportCards.forEach(r => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${r.studentName}</td><td style="padding:4px 8px;border:1px solid #ddd">${r.admNo}</td><td style="padding:4px 8px;border:1px solid #ddd">${r.classForm}</td><td style="padding:4px 8px;border:1px solid #ddd">${r.term}</td><td style="padding:4px 8px;border:1px solid #ddd">${r.academicYear}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${r.average}</td><td style="padding:4px 8px;border:1px solid #ddd">${r.classPosition}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${r.status}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'transcripts') {
      title = reportType === 'full' ? title : 'Transcripts Report';
      body += `<h2>Transcripts</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Student</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Adm No</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Class</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Year</th>
        <th style="padding:6px 8px;border:1px solid #ddd">Cum. Avg</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Position</th>
        <th style="padding:6px 8px;border:1px solid #ddd">Status</th>
      </tr></thead><tbody>`;
      transcripts.forEach(t => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${t.studentName}</td><td style="padding:4px 8px;border:1px solid #ddd">${t.admNo}</td><td style="padding:4px 8px;border:1px solid #ddd">${t.classForm}</td><td style="padding:4px 8px;border:1px solid #ddd">${t.academicYear}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${t.cumulativeAverage}</td><td style="padding:4px 8px;border:1px solid #ddd">${t.overallPosition}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${t.status}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'spip') {
      title = reportType === 'full' ? title : 'School Improvement Plan Report';
      spips.forEach(s => {
        body += `<h2>${s.title}</h2>`;
        body += `<table style="border-collapse:collapse;width:100%;margin-bottom:20px">
          <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Academic Year</td><td style="padding:8px 12px;border:1px solid #ddd">${s.academicYear}</td></tr>
          <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Plan Lead</td><td style="padding:8px 12px;border:1px solid #ddd">${s.planLead}</td></tr>
          <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Priority</td><td style="padding:8px 12px;border:1px solid #ddd">${s.priority}</td></tr>
          <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Status</td><td style="padding:8px 12px;border:1px solid #ddd">${s.status}</td></tr>
          <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Period</td><td style="padding:8px 12px;border:1px solid #ddd">${s.startDate} to ${s.endDate}</td></tr>
          <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Vision</td><td style="padding:8px 12px;border:1px solid #ddd">${s.vision}</td></tr>
          <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Strengths</td><td style="padding:8px 12px;border:1px solid #ddd">${s.strengths}</td></tr>
          <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Weaknesses</td><td style="padding:8px 12px;border:1px solid #ddd">${s.weaknesses}</td></tr>
          <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Root Causes</td><td style="padding:8px 12px;border:1px solid #ddd">${s.rootCauses}</td></tr>
          <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Priority Areas</td><td style="padding:8px 12px;border:1px solid #ddd">${s.priorityAreas}</td></tr>
          <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold">Team</td><td style="padding:8px 12px;border:1px solid #ddd">${s.teamMembers.join(', ')}</td></tr>
        </table>`;
        body += `<h3>SMARTIE Goals</h3><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
          <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Goal</th>
          <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Focus</th>
          <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Baseline</th>
          <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Target</th>
          <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Current</th>
          <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Responsible</th>
          <th style="padding:6px 8px;border:1px solid #ddd">Status</th>
        </tr></thead><tbody>`;
        s.goals.forEach(g => {
          body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${g.title}</td><td style="padding:4px 8px;border:1px solid #ddd">${g.focusArea}</td><td style="padding:4px 8px;border:1px solid #ddd">${g.baseline}</td><td style="padding:4px 8px;border:1px solid #ddd">${g.target}</td><td style="padding:4px 8px;border:1px solid #ddd">${g.currentProgress}</td><td style="padding:4px 8px;border:1px solid #ddd">${g.responsible}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${g.status}</td></tr>`;
        });
        body += `</tbody></table>`;
        body += `<h3>Action Items</h3><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
          <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Description</th>
          <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Focus</th>
          <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Responsible</th>
          <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Timeline</th>
          <th style="padding:6px 8px;border:1px solid #ddd">Done</th>
        </tr></thead><tbody>`;
        s.actionItems.forEach(a => {
          body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${a.description}</td><td style="padding:4px 8px;border:1px solid #ddd">${a.focusArea}</td><td style="padding:4px 8px;border:1px solid #ddd">${a.responsible}</td><td style="padding:4px 8px;border:1px solid #ddd">${a.timeline}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${a.completed ? 'Yes' : 'No'}</td></tr>`;
        });
        body += `</tbody></table>`;
        if (s.milestones.length > 0) {
          body += `<h3>Milestones</h3><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
            <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Title</th>
            <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Target Date</th>
            <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Achieved</th>
            <th style="padding:6px 8px;border:1px solid #ddd">Status</th>
          </tr></thead><tbody>`;
          s.milestones.forEach(m => {
            body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${m.title}</td><td style="padding:4px 8px;border:1px solid #ddd">${m.targetDate}</td><td style="padding:4px 8px;border:1px solid #ddd">${m.achievedDate || '-'}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${m.status}</td></tr>`;
          });
          body += `</tbody></table>`;
        }
        if (s.progressReviews.length > 0) {
          body += `<h3>Progress Reviews</h3>`;
          s.progressReviews.forEach(p => {
            body += `<div style="margin-bottom:15px;padding:10px;border-left:4px solid #3B82F6;background:#f9f9f9"><strong>${p.date}</strong> (by ${p.recordedBy})<br/>${p.summary}<br/><em>Outcomes: ${p.outcomes}</em></div>`;
          });
        }
      });
    }

    if (reportType === 'full' || reportType === 'curriculum') {
      title = reportType === 'full' ? title : 'Curriculum Coverage Report';
      body += `<h2>Curriculum Coverage</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Subject</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Department</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">HOD</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Class</th>
        <th style="padding:6px 8px;border:1px solid #ddd">Topics</th>
        <th style="padding:6px 8px;border:1px solid #ddd">Covered</th>
        <th style="padding:6px 8px;border:1px solid #ddd">Coverage %</th>
        <th style="padding:6px 8px;border:1px solid #ddd">Status</th>
      </tr></thead><tbody>`;
      curriculum.forEach(c => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${c.subject}</td><td style="padding:4px 8px;border:1px solid #ddd">${c.department}</td><td style="padding:4px 8px;border:1px solid #ddd">${c.hod}</td><td style="padding:4px 8px;border:1px solid #ddd">${c.classForm}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${c.syllabusTopics}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${c.topicsCovered}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${c.coveragePct}%</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${c.status}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'subjects') {
      title = reportType === 'full' ? title : 'Subject Performance Report';
      body += `<h2>Subject Performance</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Subject</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Department</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">HOD</th>
        <th style="padding:6px 8px;border:1px solid #ddd">Teachers</th>
        <th style="padding:6px 8px;border:1px solid #ddd">Students</th>
        <th style="padding:6px 8px;border:1px solid #ddd">Avg Score</th>
        <th style="padding:6px 8px;border:1px solid #ddd">Coverage</th>
        <th style="padding:6px 8px;border:1px solid #ddd">Pass Rate</th>
        <th style="padding:6px 8px;border:1px solid #ddd">Trend</th>
      </tr></thead><tbody>`;
      subjectPerformance.forEach(sp => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${sp.subject}</td><td style="padding:4px 8px;border:1px solid #ddd">${sp.department}</td><td style="padding:4px 8px;border:1px solid #ddd">${sp.hod}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${sp.teacherCount}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${sp.studentCount}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${sp.avgScore}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${sp.coveragePct}%</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${sp.passRate}%</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${sp.trend}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    if (reportType === 'full' || reportType === 'teachers') {
      title = reportType === 'full' ? 'Comprehensive Academic Report' : 'Teacher Activity Report';
      body += `<h2>Teacher Activity</h2><table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:12px"><thead><tr style="background:#f0f0f0">
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Teacher</th>
        <th style="padding:6px 8px;border:1px solid #ddd;text-align:left">Department</th>
        <th style="padding:6px 8px;border:1px solid #ddd">Lesson Plans</th>
        <th style="padding:6px 8px;border:1px solid #ddd">Materials</th>
        <th style="padding:6px 8px;border:1px solid #ddd">Assignments</th>
        <th style="padding:6px 8px;border:1px solid #ddd">Att. Marked</th>
        <th style="padding:6px 8px;border:1px solid #ddd">Coverage</th>
        <th style="padding:6px 8px;border:1px solid #ddd">Last Active</th>
        <th style="padding:6px 8px;border:1px solid #ddd">Status</th>
      </tr></thead><tbody>`;
      teacherActivity.forEach(t => {
        body += `<tr><td style="padding:4px 8px;border:1px solid #ddd">${t.teacherName}</td><td style="padding:4px 8px;border:1px solid #ddd">${t.department}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${t.lessonPlansThisTerm}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${t.materialsUploaded}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${t.assignmentsCreated}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${t.attendanceMarkedPct}%</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${t.syllabusCoverage}%</td><td style="padding:4px 8px;border:1px solid #ddd">${t.lastActive}</td><td style="text-align:center;padding:4px 8px;border:1px solid #ddd">${t.status}</td></tr>`;
      });
      body += `</tbody></table>`;
    }

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
      <style>
        * { font-family: 'Segoe UI', Arial, sans-serif; }
        body { padding: 40px; color: #1A1A2E; max-width: 900px; margin: 0 auto; }
        h1 { color: #0F4C75; border-bottom: 3px solid #0F4C75; padding-bottom: 10px; }
        h2 { color: #2D3142; margin-top: 30px; }
        h3 { color: #3282B8; margin-top: 20px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px; color: #888; }
        .confidential { background: #FEF6E7; border-left: 4px solid #F59E0B; padding: 10px 15px; margin: 15px 0; font-size: 13px; color: #92400E; }
        table { font-size: 13px; }
        th { font-weight: 600; }
        .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 11px; color: #aaa; text-align: center; }
        @media print { body { padding: 20px; } }
      </style></head><body>
      <div class="header"><span>SIMS — Academic Office</span><span>Generated: ${now}</span></div>
      <h1>${title}</h1>
      <div class="confidential">INTERNAL USE — This report contains academic operational data for school administration purposes.</div>
      ${body}
      <div class="footer">School Information Management System (SIMS) — Academic Report — ${dateStr}</div>
      <script>window.onload = function() { window.print(); }</script>
      </body></html>`;

    const printWin = window.open('', '_blank');
    if (printWin) { printWin.document.write(html); printWin.document.close(); }
    else { Alert.alert('Popup Blocked', 'Please allow popups to generate PDF reports.'); }
  };

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Students" value={stats.totalStudents} accentColor={colors.primary} />
              <StatCard label="Teachers" value={stats.totalTeachers} accentColor={colors.info} />
              <StatCard label="Subjects" value={stats.totalSubjects} accentColor={colors.purple} />
              <StatCard label="Avg Coverage" value={`${stats.avgCoverage}%`} accentColor={colors.success} />
              <StatCard label="Avg Pass Rate" value={`${stats.avgPassRate}%`} accentColor={colors.warning} />
              <StatCard label="Scheduled Exams" value={stats.scheduledExams} accentColor={colors.info} />
              <StatCard label="Pending HOD" value={stats.pendingHODApprovals} accentColor={colors.danger} />
              <StatCard label="Active SPIPs" value={stats.activeSPIPs} accentColor={colors.warning} />
            </CardGrid>
            <Text style={styles.pageTitle}>Subject Performance Summary</Text>
            <DataTable
              columns={[
                { key: 'subject', label: 'Subject', render: (i: any) => i.subject },
                { key: 'avgScore', label: 'Avg Score', render: (i: any) => `${i.avgScore}%` },
                { key: 'coverage', label: 'Coverage', render: (i: any) => `${i.coveragePct}%` },
                { key: 'passRate', label: 'Pass Rate', render: (i: any) => `${i.passRate}%` },
                { key: 'hod', label: 'HOD', render: (i: any) => i.hod },
                { key: 'trend', label: 'Trend', render: (i: any) => i.trend === 'up' ? '↑' : i.trend === 'down' ? '↓' : '→' },
              ]}
              data={subjectPerformance}
            />
          </View>
        );
      case 'timetable':
        return (
          <View>
            <Text style={styles.pageTitle}>Timetable Manager</Text>
            <Text style={styles.pageSubtitle}>Build and publish class/teacher schedules</Text>
            <View style={styles.rowBtns}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => setShowTimetableModal(true)}>
                <Text style={styles.actionBtnText}>+ Add Timetable Entry</Text>
              </TouchableOpacity>
            </View>
            {timetables.length === 0 && <Text style={styles.emptyText}>No timetable entries yet.</Text>}
            {timetables.map((t) => (
              <View key={t.id} style={styles.reqCard}>
                <View style={styles.reqHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reqTitle}>P{t.period}: {t.subject}</Text>
                    <Text style={styles.reqMeta}>{t.classForm} | {t.day} | {t.startTime}–{t.endTime} | Room {t.room} | {t.teacher}</Text>
                  </View>
                  {renderBadge(t.status, statusColor(t.status))}
                </View>
                {t.status === 'Draft' && (
                  <View style={styles.rowBtns}>
                    <TouchableOpacity style={styles.smallBtn} onPress={() => { publishTimetable(t.classForm); Alert.alert('Published', `Timetable for ${t.classForm} published.`); }}>
                      <Text style={styles.smallBtnText}>Publish</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.danger }]} onPress={() => { deleteTimetable(t.id); Alert.alert('Deleted', 'Entry removed.'); }}>
                      <Text style={styles.smallBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {t.status === 'Published' && (
                  <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.danger }]} onPress={() => { deleteTimetable(t.id); Alert.alert('Deleted', 'Entry removed.'); }}>
                    <Text style={styles.smallBtnText}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        );
      case 'exams':
        return (
          <View>
            <Text style={styles.pageTitle}>Exam Management</Text>
            <Text style={styles.pageSubtitle}>Schedule and track examinations</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowExamModal(true)}>
              <Text style={styles.actionBtnText}>+ Schedule Exam</Text>
            </TouchableOpacity>
            {exams.length === 0 && <Text style={styles.emptyText}>No exams scheduled.</Text>}
            {exams.map((e) => (
              <View key={e.id} style={styles.reqCard}>
                <View style={styles.reqHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reqTitle}>{e.title}</Text>
                    <Text style={styles.reqMeta}>{e.subject} — {e.classForm} | {e.date} | {e.startTime}–{e.endTime} | {e.venue}</Text>
                    <Text style={styles.reqMeta}>Invigilator: {e.invigilator} | Max: {e.maxScore} | {e.term}</Text>
                  </View>
                  {renderBadge(e.status, statusColor(e.status))}
                </View>
                <View style={styles.rowBtns}>
                  {renderBadge(`Results: ${e.resultsStatus}`, statusColor(e.resultsStatus))}
                  <TouchableOpacity style={styles.smallBtn} onPress={() => {
                    const next = RESULTS_ENTRY_STATUSES[(RESULTS_ENTRY_STATUSES.indexOf(e.resultsStatus) + 1) % RESULTS_ENTRY_STATUSES.length];
                    updateExamResultsStatus(e.id, next);
                  }}>
                    <Text style={styles.smallBtnText}>Advance Results</Text>
                  </TouchableOpacity>
                  {e.status === 'Scheduled' && (
                    <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.warning }]} onPress={() => updateExam(e.id, { status: 'Ongoing' })}>
                      <Text style={styles.smallBtnText}>Start</Text>
                    </TouchableOpacity>
                  )}
                  {e.status === 'Ongoing' && (
                    <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.success }]} onPress={() => updateExam(e.id, { status: 'Completed' })}>
                      <Text style={styles.smallBtnText}>Complete</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.danger }]} onPress={() => { deleteExam(e.id); Alert.alert('Deleted', 'Exam removed.'); }}>
                    <Text style={styles.smallBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );
      case 'supplies':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total Requests" value={myRequisitions.length} accentColor={colors.primary} />
              <StatCard label="Pending" value={myRequisitions.filter(r => r.status === 'Pending').length} accentColor={colors.warning} />
              <StatCard label="Issued" value={myRequisitions.filter(r => r.status === 'Issued').length} accentColor={colors.success} />
            </CardGrid>
            <Text style={styles.pageTitle}>Stationery Requests</Text>
            <Text style={styles.pageSubtitle}>Request stationery & exam materials from Stores</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowReqModal(true)}>
              <Text style={styles.actionBtnText}>+ Request from Stores</Text>
            </TouchableOpacity>
            {myRequisitions.length === 0 ? (
              <Text style={styles.emptyText}>No requests yet. Tap above to request items from Stores.</Text>
            ) : (
              myRequisitions.map((req) => (
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
              ))
            )}
          </View>
        );
      case 'hod':
        return (
          <View>
            <Text style={styles.pageTitle}>HOD Approvals</Text>
            <Text style={styles.pageSubtitle}>Reports/requests from subject HODs</Text>
            {hodApprovals.length === 0 && <Text style={styles.emptyText}>No approval requests.</Text>}
            {hodApprovals.map((item) => (
              <View key={item.id} style={[styles.approvalCard, { borderLeftWidth: 4, borderLeftColor: statusColor(item.status) }]}>
                <Text style={styles.approvalType}>{item.type}</Text>
                <Text style={styles.approvalFrom}>From: {item.from} ({item.department})</Text>
                <Text style={styles.approvalDetail}>{item.detail}</Text>
                <Text style={styles.reqMeta}>Date: {item.date}</Text>
                {item.reviewNotes ? <Text style={[styles.reqMeta, { fontStyle: 'italic' as const }]}>Review notes: {item.reviewNotes}</Text> : null}
                <View style={styles.reqHeader}>
                  {renderBadge(item.status, statusColor(item.status))}
                </View>
                {item.status === 'Pending' && (
                  <View style={styles.approvalActions}>
                    <TouchableOpacity style={styles.approveBtn} onPress={() => { setHODReview({ id: item.id, action: 'approve' }); setHODNotes(''); }}>
                      <Text style={styles.approveText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rejectBtn} onPress={() => { setHODReview({ id: item.id, action: 'defer' }); setHODNotes(''); }}>
                      <Text style={styles.rejectText}>Defer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.rejectBtn, { borderColor: colors.danger }]} onPress={() => { setHODReview({ id: item.id, action: 'reject' }); setHODNotes(''); }}>
                      <Text style={[styles.rejectText, { color: colors.danger }]}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        );
      case 'plc':
        return (
          <View>
            <CardGrid>
              <StatCard label="Total" value={plcRequisitions.length} accentColor={colors.primary} />
              <StatCard label="Pending" value={plcPending.length} accentColor={colors.warning} />
              <StatCard label="Approved" value={plcApproved.length} accentColor={colors.success} />
              <StatCard label="Rejected" value={plcRejected.length} accentColor={colors.danger} />
            </CardGrid>

            <Text style={styles.pageTitle}>PLC Requisitions</Text>
            <Text style={styles.pageSubtitle}>Approve or reject PLC material requests from the PLC Coordinator</Text>

            {plcPending.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Pending Approval ({plcPending.length})</Text>
                {plcPending.map(r => (
                  <View key={r.id} style={[styles.reqCard, { borderLeftWidth: 4, borderLeftColor: colors.warning }]}>
                    <View style={styles.reqHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reqTitle}>{r.itemName} — {r.quantity} {r.unit}</Text>
                        <Text style={styles.reqMeta}>Date: {r.date} | Requested by: {r.requestedBy}</Text>
                        <Text style={styles.reqNotes}>Purpose: {r.purpose}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: colors.warning + '20' }]}>
                        <Text style={[styles.statusText, { color: colors.warning }]}>{r.status}</Text>
                      </View>
                    </View>
                    <View style={styles.approvalActions}>
                      <TouchableOpacity style={styles.approveBtn} onPress={() => { approveRequisition(r.id, academicOfficer); Alert.alert('Approved', `${r.itemName} approved. PLC Coordinator can collect from Stores.`); }}>
                        <Text style={styles.approveText}>Approve →</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.rejectBtn} onPress={() => { rejectRequisition(r.id, academicOfficer); Alert.alert('Rejected', `${r.itemName} requisition rejected.`); }}>
                        <Text style={styles.rejectText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </>
            )}

            <Text style={styles.sectionTitle}>All PLC Requisitions</Text>
            {plcRequisitions.filter(r => r.status !== 'Pending').length === 0 && <Text style={styles.emptyText}>No processed requisitions.</Text>}
            {plcRequisitions.filter(r => r.status !== 'Pending').map(r => (
              <View key={r.id} style={[styles.reqCard, { borderLeftWidth: 4, borderLeftColor: r.status === 'Approved' ? colors.success : r.status === 'Rejected' ? colors.danger : colors.info }]}>
                <View style={styles.reqHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reqTitle}>{r.itemName} — {r.quantity} {r.unit}</Text>
                    <Text style={styles.reqMeta}>Date: {r.date} | By: {r.requestedBy}</Text>
                    <Text style={styles.reqNotes}>Purpose: {r.purpose}</Text>
                    {r.approvedBy && <Text style={styles.reqMeta}>Approved by: {r.approvedBy} on {r.approvedDate}</Text>}
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: (r.status === 'Approved' ? colors.success : r.status === 'Rejected' ? colors.danger : colors.info) + '20' }]}>
                    <Text style={[styles.statusText, { color: r.status === 'Approved' ? colors.success : r.status === 'Rejected' ? colors.danger : colors.info }]}>{r.status}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        );
      case 'reports':
        return (
          <View>
            <Text style={styles.pageTitle}>Report Cards</Text>
            <Text style={styles.pageSubtitle}>Generate, review, and approve before release to parents</Text>
            <CardGrid>
              <StatCard label="Total" value={reportCards.length} accentColor={colors.primary} />
              <StatCard label="Under Review" value={reportCards.filter(r => r.status === 'Under Review').length} accentColor={colors.warning} />
              <StatCard label="Released" value={reportCards.filter(r => r.status === 'Released').length} accentColor={colors.success} />
              <StatCard label="Generated" value={reportCards.filter(r => r.status === 'Generated').length} accentColor={colors.info} />
            </CardGrid>
            <Text style={styles.inputLabel}>Select Class</Text>
            <View style={styles.pickerRow}>
              {['SHS1 Sci A', 'SHS2 Sci A', 'SHS3 Sci A', 'SHS1 Arts B'].map((c) => (
                <TouchableOpacity key={c} style={[styles.pickerChip, reportClass === c && styles.pickerChipActive]} onPress={() => setReportClass(c)}>
                  <Text style={[styles.pickerChipText, reportClass === c && styles.pickerChipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.rowBtns}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => { generateReportCards(reportClass, 'Term 3', '2024/2025'); Alert.alert('Generated', `Report cards for ${reportClass} generated.`); }}>
                <Text style={styles.actionBtnText}>Generate Report Cards</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.success }]} onPress={() => { releaseAllForClass(reportClass); Alert.alert('Released', `All under-review report cards for ${reportClass} released.`); }}>
                <Text style={styles.actionBtnText}>Release All</Text>
              </TouchableOpacity>
            </View>
            {getReportCardsByClass(reportClass).length === 0 && <Text style={styles.emptyText}>No report cards for {reportClass}.</Text>}
            {getReportCardsByClass(reportClass).map((r) => (
              <View key={r.id} style={styles.reqCard}>
                <View style={styles.reqHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reqTitle}>{r.studentName} — {r.admNo}</Text>
                    <Text style={styles.reqMeta}>{r.classForm} | {r.term} | {r.academicYear}</Text>
                    <Text style={styles.reqMeta}>Average: {r.average} | Position: {r.classPosition} | Conduct: {r.conduct}</Text>
                    {r.generatedDate ? <Text style={styles.reqMeta}>Generated: {r.generatedDate}</Text> : null}
                  </View>
                  {renderBadge(r.status, statusColor(r.status))}
                </View>
                <View style={styles.rowBtns}>
                  {r.status === 'Generated' && (
                    <TouchableOpacity style={styles.smallBtn} onPress={() => { reviewReportCard(r.id, academicOfficer); Alert.alert('Under Review', 'Report card now under review.'); }}>
                      <Text style={styles.smallBtnText}>Review</Text>
                    </TouchableOpacity>
                  )}
                  {r.status === 'Under Review' && (
                    <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.success }]} onPress={() => { releaseReportCard(r.id); Alert.alert('Released', 'Report card released to parents.'); }}>
                      <Text style={styles.smallBtnText}>Release</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.danger }]} onPress={() => { deleteReportCard(r.id); Alert.alert('Deleted', 'Report card removed.'); }}>
                    <Text style={styles.smallBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );
      case 'monitor':
        return (
          <View>
            <Text style={styles.pageTitle}>Academic Monitor</Text>
            <Text style={styles.pageSubtitle}>Real-time monitoring of all academic activities</Text>
            <CardGrid>
              <StatCard label="Scheduled Exams" value={stats.scheduledExams} accentColor={colors.info} />
              <StatCard label="Pending HOD" value={stats.pendingHODApprovals} accentColor={colors.danger} />
              <StatCard label="Pending Reports" value={stats.pendingReportCards} accentColor={colors.warning} />
              <StatCard label="Pending Transcripts" value={stats.pendingTranscripts} accentColor={colors.warning} />
              <StatCard label="Active SPIPs" value={stats.activeSPIPs} accentColor={colors.danger} />
              <StatCard label="Avg Coverage" value={`${stats.avgCoverage}%`} accentColor={colors.success} />
            </CardGrid>
            <Text style={styles.sectionTitle}>Teacher Activity Monitor</Text>
            {teacherActivity.map((t) => (
              <View key={t.id} style={styles.reqCard}>
                <View style={styles.reqHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reqTitle}>{t.teacherName} — {t.department}</Text>
                    <Text style={styles.reqMeta}>Lesson Plans: {t.lessonPlansThisTerm} | Materials: {t.materialsUploaded} | Assignments: {t.assignmentsCreated}</Text>
                    <Text style={styles.reqMeta}>Attendance Marked: {t.attendanceMarkedPct}% | Syllabus Coverage: {t.syllabusCoverage}%</Text>
                    <Text style={styles.reqMeta}>Last Active: {t.lastActive}</Text>
                  </View>
                  {renderBadge(t.status, t.status === 'Active' ? colors.success : t.status === 'On Leave' ? colors.warning : colors.textLight)}
                </View>
              </View>
            ))}
            <Text style={styles.sectionTitle}>Curriculum Coverage Alerts</Text>
            {curriculum.filter((c) => c.coveragePct < 70).map((c) => (
              <View key={c.id} style={styles.alertCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.alertTitle}>{c.subject} — {c.classForm}</Text>
                  <Text style={styles.alertText}>Coverage: {c.coveragePct}% | HOD: {c.hod}</Text>
                  <Text style={styles.alertText}>{c.notes}</Text>
                </View>
              </View>
            ))}
            {curriculum.filter((c) => c.coveragePct < 70).length === 0 && <Text style={styles.emptyText}>No coverage alerts. All subjects on track.</Text>}
          </View>
        );
      case 'insights':
        return (
          <View>
            <Text style={styles.pageTitle}>Insights & Analytics</Text>
            <Text style={styles.pageSubtitle}>Admission, student, and teacher insights</Text>
            <Text style={styles.sectionTitle}>Admission Insights</Text>
            <DataTable
              columns={[
                { key: 'classForm', label: 'Class', render: (i: any) => i.classForm },
                { key: 'applied', label: 'Applied', render: (i: any) => i.applied },
                { key: 'admitted', label: 'Admitted', render: (i: any) => i.admitted },
                { key: 'pending', label: 'Pending', render: (i: any) => i.pending },
                { key: 'capacity', label: 'Capacity', render: (i: any) => i.capacity },
                { key: 'filled', label: 'Filled', render: (i: any) => i.filled },
              ]}
              data={admissionInsights}
            />
            <Text style={styles.sectionTitle}>Subject Performance Trends</Text>
            {subjectPerformance.map((s) => (
              <View key={s.id} style={styles.reqCard}>
                <View style={styles.reqHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reqTitle}>{s.subject} {s.trend === 'up' ? '↑' : s.trend === 'down' ? '↓' : '→'}</Text>
                    <Text style={styles.reqMeta}>Dept: {s.department} | HOD: {s.hod}</Text>
                    <Text style={styles.reqMeta}>Avg: {s.avgScore}% | Pass Rate: {s.passRate}% | Coverage: {s.coveragePct}%</Text>
                    <Text style={styles.reqMeta}>Teachers: {s.teacherCount} | Students: {s.studentCount}</Text>
                  </View>
                </View>
              </View>
            ))}
            <Text style={styles.sectionTitle}>Teacher Productivity</Text>
            <DataTable
              columns={[
                { key: 'teacherName', label: 'Teacher', render: (i: any) => i.teacherName },
                { key: 'department', label: 'Dept', render: (i: any) => i.department },
                { key: 'lessonPlansThisTerm', label: 'Plans', render: (i: any) => i.lessonPlansThisTerm },
                { key: 'materialsUploaded', label: 'Materials', render: (i: any) => i.materialsUploaded },
                { key: 'attendanceMarkedPct', label: 'Att%', render: (i: any) => `${i.attendanceMarkedPct}%` },
                { key: 'syllabusCoverage', label: 'Cov%', render: (i: any) => `${i.syllabusCoverage}%` },
              ]}
              data={teacherActivity}
            />
          </View>
        );
      case 'transcripts':
        return (
          <View>
            <Text style={styles.pageTitle}>Student Transcripts</Text>
            <Text style={styles.pageSubtitle}>Generate, approve, and release academic transcripts</Text>
            <CardGrid>
              <StatCard label="Total" value={transcripts.length} accentColor={colors.primary} />
              <StatCard label="Pending Review" value={transcripts.filter(t => t.status === 'Pending Review').length} accentColor={colors.warning} />
              <StatCard label="Approved" value={transcripts.filter(t => t.status === 'Approved').length} accentColor={colors.success} />
              <StatCard label="Released" value={transcripts.filter(t => t.status === 'Released').length} accentColor={colors.info} />
            </CardGrid>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowTranscriptModal(true)}>
              <Text style={styles.actionBtnText}>+ Generate Transcript</Text>
            </TouchableOpacity>
            {transcripts.length === 0 && <Text style={styles.emptyText}>No transcripts yet.</Text>}
            {transcripts.map((t) => (
              <View key={t.id} style={styles.reqCard}>
                <View style={styles.reqHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reqTitle}>{t.studentName} — {t.admNo}</Text>
                    <Text style={styles.reqMeta}>{t.classForm} | {t.academicYear} | Terms: {t.termsCovered.join(', ')}</Text>
                    <Text style={styles.reqMeta}>Cumulative Avg: {t.cumulativeAverage} | Position: {t.overallPosition}</Text>
                    <Text style={styles.reqMeta}>Conduct: {t.conduct} | Attendance: {t.attendance}</Text>
                    <Text style={styles.reqMeta}>Generated: {t.generatedDate}</Text>
                    {t.approvedBy ? <Text style={styles.reqMeta}>Approved by: {t.approvedBy} on {t.approvedDate}</Text> : null}
                    {t.rejectionReason ? <Text style={[styles.reqMeta, { color: colors.danger }]}>Rejected: {t.rejectionReason}</Text> : null}
                  </View>
                  {renderBadge(t.status, statusColor(t.status))}
                </View>
                <View style={styles.rowBtns}>
                  {t.status === 'Pending Review' && (
                    <>
                      <TouchableOpacity style={styles.smallBtn} onPress={() => { approveTranscript(t.id, academicOfficer); Alert.alert('Approved', 'Transcript approved.'); }}>
                        <Text style={styles.smallBtnText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.danger }]} onPress={() => { setTranscriptReject(t.id); setRejectReason(''); }}>
                        <Text style={styles.smallBtnText}>Reject</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {t.status === 'Approved' && (
                    <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.success }]} onPress={() => { releaseTranscript(t.id); Alert.alert('Released', 'Transcript released.'); }}>
                      <Text style={styles.smallBtnText}>Release</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.danger }]} onPress={() => { deleteTranscript(t.id); Alert.alert('Deleted', 'Transcript removed.'); }}>
                    <Text style={styles.smallBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );
      case 'spip':
        return (
          <View>
            <Text style={styles.pageTitle}>School Improvement Planning</Text>
            <Text style={styles.pageSubtitle}>Comprehensive plans for whole-school improvement — needs assessment, SMARTIE goals, action plans & monitoring</Text>
            <CardGrid>
              <StatCard label="Active Plans" value={spips.filter(s => s.status === 'Active' || s.status === 'Monitoring').length} accentColor={colors.primary} />
              <StatCard label="Draft" value={spips.filter(s => s.status === 'Draft').length} accentColor={colors.warning} />
              <StatCard label="Completed" value={spips.filter(s => s.status === 'Completed').length} accentColor={colors.success} />
              <StatCard label="Total Goals" value={spips.reduce((sum, s) => sum + s.goals.length, 0)} accentColor={colors.info} />
            </CardGrid>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowSPIPModal(true)}>
              <Text style={styles.actionBtnText}>+ Create Improvement Plan</Text>
            </TouchableOpacity>
            {spips.length === 0 && <Text style={styles.emptyText}>No improvement plans yet.</Text>}
            {spips.map((s) => (
              <View key={s.id} style={[styles.reqCard, { borderLeftWidth: 4, borderLeftColor: statusColor(s.status) }]}>
                <View style={styles.reqHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reqTitle}>{s.title}</Text>
                    <Text style={styles.reqMeta}>{s.academicYear} | Lead: {s.planLead} | Priority: {s.priority}</Text>
                    <Text style={styles.reqMeta}>Period: {s.startDate} → {s.endDate}</Text>
                  </View>
                  {renderBadge(s.status, statusColor(s.status))}
                </View>

                <Text style={styles.sectionTitle}>Vision</Text>
                <Text style={styles.reqMeta}>{s.vision}</Text>

                <Text style={[styles.sectionTitle, { marginTop: spacing.sm }]}>Needs Assessment</Text>
                <Text style={styles.reqMeta}><Text style={{ fontWeight: fontWeight.semibold as any }}>Strengths:</Text> {s.strengths}</Text>
                <Text style={styles.reqMeta}><Text style={{ fontWeight: fontWeight.semibold as any }}>Weaknesses:</Text> {s.weaknesses}</Text>
                <Text style={styles.reqMeta}><Text style={{ fontWeight: fontWeight.semibold as any }}>Root Causes:</Text> {s.rootCauses}</Text>
                <Text style={styles.reqMeta}><Text style={{ fontWeight: fontWeight.semibold as any }}>Priority Areas:</Text> {s.priorityAreas}</Text>

                <Text style={[styles.sectionTitle, { marginTop: spacing.sm }]}>SMARTIE Goals ({s.goals.length})</Text>
                {s.goals.map((g) => (
                  <View key={g.id} style={[styles.reqCard, { marginTop: spacing.xs, borderLeftWidth: 3, borderLeftColor: g.focusArea === 'People' ? colors.purple : g.focusArea === 'Instruction' ? colors.primaryLight : colors.info }]}>
                    <View style={styles.reqHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reqTitle}>{g.title}</Text>
                        <Text style={styles.reqMeta}>{g.focusArea} | {g.description}</Text>
                        <Text style={styles.reqMeta}>Baseline: {g.baseline}</Text>
                        <Text style={styles.reqMeta}>Target: {g.target}</Text>
                        <Text style={styles.reqMeta}>Current: {g.currentProgress}</Text>
                        <Text style={styles.reqMeta}>Responsible: {g.responsible} | Deadline: {g.deadline}</Text>
                      </View>
                      {renderBadge(g.status, statusColor(g.status))}
                    </View>
                    {(g.status !== 'Achieved') && (
                      <View style={styles.rowBtns}>
                        {SPIP_GOAL_STATUSES.filter(gs => gs !== g.status).map((gs) => (
                          <TouchableOpacity key={gs} style={[styles.smallBtn, { backgroundColor: statusColor(gs) }]} onPress={() => { updateSPIPGoal(s.id, g.id, { status: gs }); Alert.alert('Updated', `Goal status changed to ${gs}.`); }}>
                            <Text style={styles.smallBtnText}>→ {gs}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                ))}

                <Text style={[styles.sectionTitle, { marginTop: spacing.sm }]}>Action Items ({s.actionItems.length})</Text>
                {s.actionItems.map((a) => (
                  <TouchableOpacity key={a.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs }} onPress={() => toggleSPIPActionItem(s.id, a.id)}>
                    <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: a.completed ? colors.success : colors.border, backgroundColor: a.completed ? colors.success : 'transparent', marginRight: spacing.sm, justifyContent: 'center', alignItems: 'center' }}>
                      {a.completed && <Text style={{ color: colors.white, fontSize: 10, fontWeight: fontWeight.bold as any }}>✓</Text>}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.reqMeta, { textDecorationLine: a.completed ? 'line-through' : 'none', color: a.completed ? colors.textLight : colors.text }]}>{a.description}</Text>
                      <Text style={styles.reqMeta}>{a.focusArea} | {a.responsible} | {a.timeline}</Text>
                    </View>
                  </TouchableOpacity>
                ))}

                <Text style={[styles.sectionTitle, { marginTop: spacing.sm }]}>Milestones ({s.milestones.length})</Text>
                {s.milestones.map((m) => (
                  <View key={m.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs }}>
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: m.status === 'Achieved' ? colors.success : m.status === 'Missed' ? colors.danger : colors.warning, marginRight: spacing.sm }} />
                    <Text style={styles.reqMeta}>{m.title} — Target: {m.targetDate}{m.achievedDate ? ` | Achieved: ${m.achievedDate}` : ''} ({m.status})</Text>
                  </View>
                ))}

                {s.progressReviews.length > 0 && (
                  <View style={{ marginTop: spacing.sm }}>
                    <Text style={styles.sectionTitle}>Progress Reviews ({s.progressReviews.length})</Text>
                    {s.progressReviews.map((p, idx) => (
                      <View key={idx} style={[styles.reqCard, { marginTop: spacing.xs }]}>
                        <Text style={styles.reqMeta}><Text style={{ fontWeight: fontWeight.semibold as any }}>{p.date}</Text> (by {p.recordedBy})</Text>
                        <Text style={styles.reqMeta}>{p.summary}</Text>
                        <Text style={[styles.reqMeta, { color: colors.info }]}>Outcomes: {p.outcomes}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <Text style={[styles.sectionTitle, { marginTop: spacing.sm }]}>Stakeholder Team</Text>
                <Text style={styles.reqMeta}>{s.teamMembers.join(', ')}</Text>

                <View style={styles.rowBtns}>
                  <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.primaryLight }]} onPress={() => { setShowSPIPGoalModal(s.id); setSPIPGoalForm({ title: '', focusArea: 'Instruction', description: '', baseline: '', target: '', currentProgress: '', status: 'Not Started', responsible: '', deadline: '' }); }}>
                    <Text style={styles.smallBtnText}>+ Add Goal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.purple }]} onPress={() => { setShowSPIPActionModal(s.id); setSPIPActionForm({ description: '', focusArea: 'Instruction', responsible: '', timeline: '' }); }}>
                    <Text style={styles.smallBtnText}>+ Add Action</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.info }]} onPress={() => { setShowSPIPMilestoneModal(s.id); setSPIPMilestoneForm({ title: '', targetDate: '' }); }}>
                    <Text style={styles.smallBtnText}>+ Add Milestone</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.success }]} onPress={() => { setShowSPIPReviewModal(s.id); setSPIPReviewForm({ summary: '', outcomes: '' }); }}>
                    <Text style={styles.smallBtnText}>+ Add Review</Text>
                  </TouchableOpacity>
                  {s.status !== 'Completed' && s.status !== 'Archived' && (
                    <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.warning }]} onPress={() => { const next = s.status === 'Draft' ? 'Active' : s.status === 'Active' ? 'Monitoring' : 'Completed'; updateSPIP(s.id, { status: next }); Alert.alert('Updated', `Plan status changed to ${next}.`); }}>
                      <Text style={styles.smallBtnText}>Advance Status</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.danger }]} onPress={() => { deleteSPIP(s.id); Alert.alert('Deleted', 'Improvement plan removed.'); }}>
                    <Text style={styles.smallBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );
      case 'curriculum':
        return (
          <View>
            <Text style={styles.pageTitle}>Curriculum Tracker</Text>
            <Text style={styles.pageSubtitle}>Monitor syllabus coverage across all subjects and classes</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowCurriculumModal(true)}>
              <Text style={styles.actionBtnText}>+ Add Curriculum Entry</Text>
            </TouchableOpacity>
            {curriculum.length === 0 && <Text style={styles.emptyText}>No curriculum entries.</Text>}
            {curriculum.map((c) => (
              <View key={c.id} style={styles.reqCard}>
                <View style={styles.reqHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reqTitle}>{c.subject} — {c.classForm}</Text>
                    <Text style={styles.reqMeta}>Dept: {c.department} | HOD: {c.hod}</Text>
                    <Text style={styles.reqMeta}>Topics: {c.topicsCovered}/{c.syllabusTopics} ({c.coveragePct}%)</Text>
                    <Text style={styles.reqMeta}>Last Updated: {c.lastUpdated}</Text>
                    {c.notes ? <Text style={styles.reqMeta}>Notes: {c.notes}</Text> : null}
                  </View>
                  {renderBadge(c.status, statusColor(c.status))}
                </View>
                <View style={styles.rowBtns}>
                  <TouchableOpacity style={styles.smallBtn} onPress={() => { updateCurriculum(c.id, { topicsCovered: Math.min(c.topicsCovered + 1, c.syllabusTopics) }); }}>
                    <Text style={styles.smallBtnText}>+1 Topic</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.danger }]} onPress={() => { deleteCurriculum(c.id); Alert.alert('Deleted', 'Entry removed.'); }}>
                    <Text style={styles.smallBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );
      case 'calendar':
        return (
          <View>
            <Text style={styles.pageTitle}>Academic Calendar</Text>
            <Text style={styles.pageSubtitle}>Term dates, exams, holidays, and deadlines</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowCalendarModal(true)}>
              <Text style={styles.actionBtnText}>+ Add Event</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>Academic Terms</Text>
            {terms.map((t) => (
              <View key={t.id} style={styles.reqCard}>
                <View style={styles.reqHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reqTitle}>{t.term} — {t.academicYear}</Text>
                    <Text style={styles.reqMeta}>{t.startDate} to {t.endDate} | Mid-term: {t.midTermBreak}</Text>
                  </View>
                  {t.isCurrent ? renderBadge('Current', colors.success) : (
                    <TouchableOpacity style={styles.smallBtn} onPress={() => setCurrentTerm(t.id)}>
                      <Text style={styles.smallBtnText}>Set Current</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
            <Text style={styles.sectionTitle}>Calendar Events</Text>
            {calendar.length === 0 && <Text style={styles.emptyText}>No events.</Text>}
            {calendar.map((e) => (
              <View key={e.id} style={styles.reqCard}>
                <View style={styles.reqHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reqTitle}>{e.title}</Text>
                    <Text style={styles.reqMeta}>{e.type} | {e.date}{e.endDate ? ` to ${e.endDate}` : ''} | {e.term}</Text>
                    {e.description ? <Text style={styles.reqMeta}>{e.description}</Text> : null}
                  </View>
                  <TouchableOpacity onPress={() => { deleteCalendarEvent(e.id); Alert.alert('Deleted', 'Event removed.'); }}>
                    <Text style={{ color: colors.danger, fontSize: fontSize.sm }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );
      case 'academic-reports':
        return (
          <View>
            <Text style={styles.pageTitle}>Reports & PDF Generation</Text>
            <Text style={styles.pageSubtitle}>Generate printable PDF reports for academic operations</Text>

            <TouchableOpacity style={styles.pdfFullBtn} onPress={() => generatePDF('full')}>
              <Text style={styles.pdfFullBtnText}>Generate Full Academic Report (All Sections)</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Individual Reports</Text>
            <View style={styles.pdfBtnRow}>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.primary }]} onPress={() => generatePDF('overview')}>
                <Text style={styles.pdfBtnText}>Academic Overview</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.info }]} onPress={() => generatePDF('exams')}>
                <Text style={styles.pdfBtnText}>Exam Schedule</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.success }]} onPress={() => generatePDF('reportcards')}>
                <Text style={styles.pdfBtnText}>Report Cards</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.purple }]} onPress={() => generatePDF('transcripts')}>
                <Text style={styles.pdfBtnText}>Transcripts</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.warning }]} onPress={() => generatePDF('spip')}>
                <Text style={styles.pdfBtnText}>School Improvement Plans</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.info }]} onPress={() => generatePDF('curriculum')}>
                <Text style={styles.pdfBtnText}>Curriculum Coverage</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.primary }]} onPress={() => generatePDF('subjects')}>
                <Text style={styles.pdfBtnText}>Subject Performance</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pdfBtn, { backgroundColor: colors.success }]} onPress={() => generatePDF('teachers')}>
                <Text style={styles.pdfBtnText}>Teacher Activity</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Quick Stats Summary</Text>
            <View style={styles.reportSectionCard}>
              <View style={styles.reportBarRow}>
                <Text style={styles.reportBarLabel}>Total Students</Text>
                <View style={styles.reportBarTrack}><View style={[styles.reportBarFill, { width: `${Math.min(stats.totalStudents / 10, 100)}%`, backgroundColor: colors.primary }]} /></View>
                <Text style={styles.reportBarCount}>{stats.totalStudents}</Text>
              </View>
              <View style={styles.reportBarRow}>
                <Text style={styles.reportBarLabel}>Total Teachers</Text>
                <View style={styles.reportBarTrack}><View style={[styles.reportBarFill, { width: `${Math.min(stats.totalTeachers * 2, 100)}%`, backgroundColor: colors.info }]} /></View>
                <Text style={styles.reportBarCount}>{stats.totalTeachers}</Text>
              </View>
              <View style={styles.reportBarRow}>
                <Text style={styles.reportBarLabel}>Avg Coverage</Text>
                <View style={styles.reportBarTrack}><View style={[styles.reportBarFill, { width: `${stats.avgCoverage}%`, backgroundColor: colors.success }]} /></View>
                <Text style={styles.reportBarCount}>{stats.avgCoverage}%</Text>
              </View>
              <View style={styles.reportBarRow}>
                <Text style={styles.reportBarLabel}>Avg Pass Rate</Text>
                <View style={styles.reportBarTrack}><View style={[styles.reportBarFill, { width: `${stats.avgPassRate}%`, backgroundColor: colors.warning }]} /></View>
                <Text style={styles.reportBarCount}>{stats.avgPassRate}%</Text>
              </View>
              <View style={styles.reportBarRow}>
                <Text style={styles.reportBarLabel}>Active SPIPs</Text>
                <View style={styles.reportBarTrack}><View style={[styles.reportBarFill, { width: `${Math.min(stats.activeSPIPs * 20, 100)}%`, backgroundColor: colors.purple }]} /></View>
                <Text style={styles.reportBarCount}>{stats.activeSPIPs}</Text>
              </View>
              <View style={styles.reportBarRow}>
                <Text style={styles.reportBarLabel}>Scheduled Exams</Text>
                <View style={styles.reportBarTrack}><View style={[styles.reportBarFill, { width: `${Math.min(stats.scheduledExams * 10, 100)}%`, backgroundColor: colors.danger }]} /></View>
                <Text style={styles.reportBarCount}>{stats.scheduledExams}</Text>
              </View>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      title="Asst. Headmaster (Academic)"
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
        department="Academic"
        requestedBy={user?.displayName || 'Academic Office'}
      />

      {/* Exam Modal */}
      <Modal visible={showExamModal} transparent animationType="fade" onRequestClose={() => setShowExamModal(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}><ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.modalTitle}>Schedule Exam</Text>
          <Text style={styles.inputLabel}>Title *</Text>
          <TextInput style={styles.input} placeholder="e.g. Mid-Sem Chemistry" placeholderTextColor={colors.textLight} value={examForm.title} onChangeText={(v) => setExamForm({ ...examForm, title: v })} />
          <Text style={styles.inputLabel}>Subject</Text>
          <TextInput style={styles.input} placeholder="e.g. Chemistry" placeholderTextColor={colors.textLight} value={examForm.subject} onChangeText={(v) => setExamForm({ ...examForm, subject: v })} />
          <Text style={styles.inputLabel}>Class</Text>
          <TextInput style={styles.input} placeholder="e.g. SHS2 Sci A" placeholderTextColor={colors.textLight} value={examForm.classForm} onChangeText={(v) => setExamForm({ ...examForm, classForm: v })} />
          <Text style={styles.inputLabel}>Date</Text>
          <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} value={examForm.date} onChangeText={(v) => setExamForm({ ...examForm, date: v })} />
          <Text style={styles.inputLabel}>Start Time</Text>
          <TextInput style={styles.input} placeholder="08:00" placeholderTextColor={colors.textLight} value={examForm.startTime} onChangeText={(v) => setExamForm({ ...examForm, startTime: v })} />
          <Text style={styles.inputLabel}>End Time</Text>
          <TextInput style={styles.input} placeholder="10:00" placeholderTextColor={colors.textLight} value={examForm.endTime} onChangeText={(v) => setExamForm({ ...examForm, endTime: v })} />
          <Text style={styles.inputLabel}>Venue</Text>
          <TextInput style={styles.input} placeholder="e.g. Hall A" placeholderTextColor={colors.textLight} value={examForm.venue} onChangeText={(v) => setExamForm({ ...examForm, venue: v })} />
          <Text style={styles.inputLabel}>Invigilator</Text>
          <TextInput style={styles.input} placeholder="e.g. Mr. Mensah" placeholderTextColor={colors.textLight} value={examForm.invigilator} onChangeText={(v) => setExamForm({ ...examForm, invigilator: v })} />
          <Text style={styles.inputLabel}>Max Score</Text>
          <TextInput style={styles.input} placeholder="50" keyboardType="numeric" placeholderTextColor={colors.textLight} value={String(examForm.maxScore)} onChangeText={(v) => setExamForm({ ...examForm, maxScore: parseInt(v) || 0 })} />
          <Text style={styles.inputLabel}>Term</Text>
          <View style={styles.pickerRow}>
            {TERM_NAMES.map((t) => (
              <TouchableOpacity key={t} style={[styles.pickerChip, examForm.term === t && styles.pickerChipActive]} onPress={() => setExamForm({ ...examForm, term: t })}>
                <Text style={[styles.pickerChipText, examForm.term === t && styles.pickerChipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowExamModal(false)}><Text style={styles.modalBtnTextDark}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={() => { if (!examForm.title.trim()) { Alert.alert('Error', 'Title is required'); return; } addExam({ ...examForm, status: 'Scheduled', resultsStatus: 'Not Started' }); setExamForm({ title: '', subject: '', classForm: '', date: '', startTime: '', endTime: '', venue: '', maxScore: 50, invigilator: '', term: 'Term 3' }); setShowExamModal(false); Alert.alert('Success', 'Exam scheduled.'); }}><Text style={styles.modalBtnTextLight}>Schedule</Text></TouchableOpacity>
          </View>
        </ScrollView></View></View>
      </Modal>

      {/* Timetable Modal */}
      <Modal visible={showTimetableModal} transparent animationType="fade" onRequestClose={() => setShowTimetableModal(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}><ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.modalTitle}>Add Timetable Entry</Text>
          <Text style={styles.inputLabel}>Class</Text>
          <TextInput style={styles.input} placeholder="e.g. SHS1 Sci A" placeholderTextColor={colors.textLight} value={timetableForm.classForm} onChangeText={(v) => setTimetableForm({ ...timetableForm, classForm: v })} />
          <Text style={styles.inputLabel}>Day</Text>
          <View style={styles.pickerRow}>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((d) => (
              <TouchableOpacity key={d} style={[styles.pickerChip, timetableForm.day === d && styles.pickerChipActive]} onPress={() => setTimetableForm({ ...timetableForm, day: d })}>
                <Text style={[styles.pickerChipText, timetableForm.day === d && styles.pickerChipTextActive]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.inputLabel}>Period</Text>
          <TextInput style={styles.input} placeholder="1" keyboardType="numeric" placeholderTextColor={colors.textLight} value={String(timetableForm.period)} onChangeText={(v) => setTimetableForm({ ...timetableForm, period: parseInt(v) || 1 })} />
          <Text style={styles.inputLabel}>Start Time</Text>
          <TextInput style={styles.input} placeholder="07:30" placeholderTextColor={colors.textLight} value={timetableForm.startTime} onChangeText={(v) => setTimetableForm({ ...timetableForm, startTime: v })} />
          <Text style={styles.inputLabel}>End Time</Text>
          <TextInput style={styles.input} placeholder="08:20" placeholderTextColor={colors.textLight} value={timetableForm.endTime} onChangeText={(v) => setTimetableForm({ ...timetableForm, endTime: v })} />
          <Text style={styles.inputLabel}>Subject</Text>
          <TextInput style={styles.input} placeholder="e.g. Core Mathematics" placeholderTextColor={colors.textLight} value={timetableForm.subject} onChangeText={(v) => setTimetableForm({ ...timetableForm, subject: v })} />
          <Text style={styles.inputLabel}>Teacher</Text>
          <TextInput style={styles.input} placeholder="e.g. Mr. Mensah" placeholderTextColor={colors.textLight} value={timetableForm.teacher} onChangeText={(v) => setTimetableForm({ ...timetableForm, teacher: v })} />
          <Text style={styles.inputLabel}>Room</Text>
          <TextInput style={styles.input} placeholder="e.g. A1" placeholderTextColor={colors.textLight} value={timetableForm.room} onChangeText={(v) => setTimetableForm({ ...timetableForm, room: v })} />
          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowTimetableModal(false)}><Text style={styles.modalBtnTextDark}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={() => { if (!timetableForm.classForm.trim() || !timetableForm.subject.trim()) { Alert.alert('Error', 'Class and subject are required'); return; } addTimetable({ ...timetableForm, status: 'Draft' }); setTimetableForm({ classForm: '', day: 'Monday', period: 1, startTime: '', endTime: '', subject: '', teacher: '', room: '' }); setShowTimetableModal(false); Alert.alert('Success', 'Timetable entry added.'); }}><Text style={styles.modalBtnTextLight}>Add</Text></TouchableOpacity>
          </View>
        </ScrollView></View></View>
      </Modal>

      {/* SPIP Create Modal */}
      <Modal visible={showSPIPModal} transparent animationType="fade" onRequestClose={() => setShowSPIPModal(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}><ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.modalTitle}>Create School Improvement Plan</Text>
          <Text style={styles.inputLabel}>Plan Title *</Text>
          <TextInput style={styles.input} placeholder="e.g. 2025/2026 Academic Excellence Plan" placeholderTextColor={colors.textLight} value={spipForm.title} onChangeText={(v) => setSPIPForm({ ...spipForm, title: v })} />
          <Text style={styles.inputLabel}>Academic Year</Text>
          <TextInput style={styles.input} placeholder="e.g. 2025/2026" placeholderTextColor={colors.textLight} value={spipForm.academicYear} onChangeText={(v) => setSPIPForm({ ...spipForm, academicYear: v })} />
          <Text style={styles.inputLabel}>Plan Lead</Text>
          <TextInput style={styles.input} placeholder="e.g. Mr. Osei (Academic Officer)" placeholderTextColor={colors.textLight} value={spipForm.planLead} onChangeText={(v) => setSPIPForm({ ...spipForm, planLead: v })} />
          <Text style={styles.inputLabel}>Priority</Text>
          <View style={styles.pickerRow}>
            {SPIP_PRIORITIES.map((p) => (
              <TouchableOpacity key={p} style={[styles.pickerChip, spipForm.priority === p && styles.pickerChipActive]} onPress={() => setSPIPForm({ ...spipForm, priority: p })}>
                <Text style={[styles.pickerChipText, spipForm.priority === p && styles.pickerChipTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.inputLabel}>Start Date</Text>
          <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} value={spipForm.startDate} onChangeText={(v) => setSPIPForm({ ...spipForm, startDate: v })} />
          <Text style={styles.inputLabel}>End Date</Text>
          <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} value={spipForm.endDate} onChangeText={(v) => setSPIPForm({ ...spipForm, endDate: v })} />
          <Text style={styles.inputLabel}>Vision Statement</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Overall vision for school improvement" placeholderTextColor={colors.textLight} value={spipForm.vision} onChangeText={(v) => setSPIPForm({ ...spipForm, vision: v })} multiline />
          <Text style={styles.inputLabel}>Strengths (Needs Assessment)</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="What are the school's strengths?" placeholderTextColor={colors.textLight} value={spipForm.strengths} onChangeText={(v) => setSPIPForm({ ...spipForm, strengths: v })} multiline />
          <Text style={styles.inputLabel}>Weaknesses (Needs Assessment)</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="What areas need improvement?" placeholderTextColor={colors.textLight} value={spipForm.weaknesses} onChangeText={(v) => setSPIPForm({ ...spipForm, weaknesses: v })} multiline />
          <Text style={styles.inputLabel}>Root Causes</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Identified root causes of weaknesses" placeholderTextColor={colors.textLight} value={spipForm.rootCauses} onChangeText={(v) => setSPIPForm({ ...spipForm, rootCauses: v })} multiline />
          <Text style={styles.inputLabel}>Priority Areas</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="e.g. 1. Maths pass rate 2. English writing 3. Teacher PD" placeholderTextColor={colors.textLight} value={spipForm.priorityAreas} onChangeText={(v) => setSPIPForm({ ...spipForm, priorityAreas: v })} multiline />
          <Text style={styles.inputLabel}>Stakeholder Team (comma-separated)</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="e.g. Mr. Osei, Mr. Mensah, Mrs. Boateng" placeholderTextColor={colors.textLight} value={spipForm.teamMembers} onChangeText={(v) => setSPIPForm({ ...spipForm, teamMembers: v })} multiline />
          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowSPIPModal(false)}><Text style={styles.modalBtnTextDark}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={() => { if (!spipForm.title.trim()) { Alert.alert('Error', 'Plan title is required'); return; } addSPIP({ ...spipForm, teamMembers: spipForm.teamMembers.split(',').map((t: string) => t.trim()).filter(Boolean) }); setSPIPForm({ title: '', academicYear: '2024/2025', planLead: '', priority: 'Medium', startDate: '', endDate: '', strengths: '', weaknesses: '', rootCauses: '', priorityAreas: '', vision: '', teamMembers: '' }); setShowSPIPModal(false); Alert.alert('Success', 'Improvement plan created.'); }}><Text style={styles.modalBtnTextLight}>Create</Text></TouchableOpacity>
          </View>
        </ScrollView></View></View>
      </Modal>

      {/* SPIP Goal Modal */}
      <Modal visible={!!showSPIPGoalModal} transparent animationType="fade" onRequestClose={() => setShowSPIPGoalModal(null)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}><ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.modalTitle}>Add SMARTIE Goal</Text>
          <Text style={styles.inputLabel}>Goal Title *</Text>
          <TextInput style={styles.input} placeholder="e.g. Raise Core Maths pass rate" placeholderTextColor={colors.textLight} value={spipGoalForm.title} onChangeText={(v) => setSPIPGoalForm({ ...spipGoalForm, title: v })} />
          <Text style={styles.inputLabel}>Focus Area</Text>
          <View style={styles.pickerRow}>
            {SPIP_FOCUS_AREAS.map((f) => (
              <TouchableOpacity key={f} style={[styles.pickerChip, spipGoalForm.focusArea === f && styles.pickerChipActive]} onPress={() => setSPIPGoalForm({ ...spipGoalForm, focusArea: f })}>
                <Text style={[styles.pickerChipText, spipGoalForm.focusArea === f && styles.pickerChipTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="What specifically are you trying to accomplish?" placeholderTextColor={colors.textLight} value={spipGoalForm.description} onChangeText={(v) => setSPIPGoalForm({ ...spipGoalForm, description: v })} multiline />
          <Text style={styles.inputLabel}>Baseline</Text>
          <TextInput style={styles.input} placeholder="e.g. 58% pass rate (Term 1)" placeholderTextColor={colors.textLight} value={spipGoalForm.baseline} onChangeText={(v) => setSPIPGoalForm({ ...spipGoalForm, baseline: v })} />
          <Text style={styles.inputLabel}>Target</Text>
          <TextInput style={styles.input} placeholder="e.g. 75% pass rate by year end" placeholderTextColor={colors.textLight} value={spipGoalForm.target} onChangeText={(v) => setSPIPGoalForm({ ...spipGoalForm, target: v })} />
          <Text style={styles.inputLabel}>Current Progress</Text>
          <TextInput style={styles.input} placeholder="e.g. 67% (Term 2 exams)" placeholderTextColor={colors.textLight} value={spipGoalForm.currentProgress} onChangeText={(v) => setSPIPGoalForm({ ...spipGoalForm, currentProgress: v })} />
          <Text style={styles.inputLabel}>Responsible Person</Text>
          <TextInput style={styles.input} placeholder="e.g. Mr. Mensah (HOD Maths)" placeholderTextColor={colors.textLight} value={spipGoalForm.responsible} onChangeText={(v) => setSPIPGoalForm({ ...spipGoalForm, responsible: v })} />
          <Text style={styles.inputLabel}>Deadline</Text>
          <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} value={spipGoalForm.deadline} onChangeText={(v) => setSPIPGoalForm({ ...spipGoalForm, deadline: v })} />
          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowSPIPGoalModal(null)}><Text style={styles.modalBtnTextDark}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={() => { if (!showSPIPGoalModal) return; if (!spipGoalForm.title.trim()) { Alert.alert('Error', 'Goal title is required'); return; } addSPIPGoal(showSPIPGoalModal, spipGoalForm); setSPIPGoalForm({ title: '', focusArea: 'Instruction', description: '', baseline: '', target: '', currentProgress: '', status: 'Not Started', responsible: '', deadline: '' }); setShowSPIPGoalModal(null); Alert.alert('Success', 'Goal added.'); }}><Text style={styles.modalBtnTextLight}>Add Goal</Text></TouchableOpacity>
          </View>
        </ScrollView></View></View>
      </Modal>

      {/* SPIP Action Item Modal */}
      <Modal visible={!!showSPIPActionModal} transparent animationType="fade" onRequestClose={() => setShowSPIPActionModal(null)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Action Item</Text>
          <Text style={styles.inputLabel}>Description *</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="e.g. After-school remedial Maths sessions twice weekly" placeholderTextColor={colors.textLight} value={spipActionForm.description} onChangeText={(v) => setSPIPActionForm({ ...spipActionForm, description: v })} multiline />
          <Text style={styles.inputLabel}>Focus Area</Text>
          <View style={styles.pickerRow}>
            {SPIP_FOCUS_AREAS.map((f) => (
              <TouchableOpacity key={f} style={[styles.pickerChip, spipActionForm.focusArea === f && styles.pickerChipActive]} onPress={() => setSPIPActionForm({ ...spipActionForm, focusArea: f })}>
                <Text style={[styles.pickerChipText, spipActionForm.focusArea === f && styles.pickerChipTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.inputLabel}>Responsible Person</Text>
          <TextInput style={styles.input} placeholder="e.g. Mr. Mensah" placeholderTextColor={colors.textLight} value={spipActionForm.responsible} onChangeText={(v) => setSPIPActionForm({ ...spipActionForm, responsible: v })} />
          <Text style={styles.inputLabel}>Timeline</Text>
          <TextInput style={styles.input} placeholder="e.g. Term 2-3" placeholderTextColor={colors.textLight} value={spipActionForm.timeline} onChangeText={(v) => setSPIPActionForm({ ...spipActionForm, timeline: v })} />
          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowSPIPActionModal(null)}><Text style={styles.modalBtnTextDark}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={() => { if (!showSPIPActionModal) return; if (!spipActionForm.description.trim()) { Alert.alert('Error', 'Description is required'); return; } addSPIPActionItem(showSPIPActionModal, { ...spipActionForm, completed: false }); setSPIPActionForm({ description: '', focusArea: 'Instruction', responsible: '', timeline: '' }); setShowSPIPActionModal(null); Alert.alert('Success', 'Action item added.'); }}><Text style={styles.modalBtnTextLight}>Add</Text></TouchableOpacity>
          </View>
        </View></View>
      </Modal>

      {/* SPIP Milestone Modal */}
      <Modal visible={!!showSPIPMilestoneModal} transparent animationType="fade" onRequestClose={() => setShowSPIPMilestoneModal(null)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Milestone</Text>
          <Text style={styles.inputLabel}>Milestone Title *</Text>
          <TextInput style={styles.input} placeholder="e.g. Term 2 exam pass rate ≥65%" placeholderTextColor={colors.textLight} value={spipMilestoneForm.title} onChangeText={(v) => setSPIPMilestoneForm({ ...spipMilestoneForm, title: v })} />
          <Text style={styles.inputLabel}>Target Date</Text>
          <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} value={spipMilestoneForm.targetDate} onChangeText={(v) => setSPIPMilestoneForm({ ...spipMilestoneForm, targetDate: v })} />
          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowSPIPMilestoneModal(null)}><Text style={styles.modalBtnTextDark}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={() => { if (!showSPIPMilestoneModal) return; if (!spipMilestoneForm.title.trim()) { Alert.alert('Error', 'Title is required'); return; } addSPIPMilestone(showSPIPMilestoneModal, { ...spipMilestoneForm, status: 'Pending' }); setSPIPMilestoneForm({ title: '', targetDate: '' }); setShowSPIPMilestoneModal(null); Alert.alert('Success', 'Milestone added.'); }}><Text style={styles.modalBtnTextLight}>Add</Text></TouchableOpacity>
          </View>
        </View></View>
      </Modal>

      {/* SPIP Review Modal */}
      <Modal visible={!!showSPIPReviewModal} transparent animationType="fade" onRequestClose={() => setShowSPIPReviewModal(null)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}><ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.modalTitle}>Add Progress Review</Text>
          <Text style={styles.inputLabel}>Summary *</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="What progress has been observed? Summarize findings." placeholderTextColor={colors.textLight} value={spipReviewForm.summary} onChangeText={(v) => setSPIPReviewForm({ ...spipReviewForm, summary: v })} multiline />
          <Text style={styles.inputLabel}>Outcomes & Next Steps</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="What actions or decisions resulted from this review?" placeholderTextColor={colors.textLight} value={spipReviewForm.outcomes} onChangeText={(v) => setSPIPReviewForm({ ...spipReviewForm, outcomes: v })} multiline />
          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowSPIPReviewModal(null)}><Text style={styles.modalBtnTextDark}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={() => { if (!showSPIPReviewModal) return; if (!spipReviewForm.summary.trim()) { Alert.alert('Error', 'Summary is required'); return; } addSPIPReview(showSPIPReviewModal, { summary: spipReviewForm.summary, recordedBy: academicOfficer, outcomes: spipReviewForm.outcomes }); setSPIPReviewForm({ summary: '', outcomes: '' }); setShowSPIPReviewModal(null); Alert.alert('Success', 'Progress review added.'); }}><Text style={styles.modalBtnTextLight}>Add Review</Text></TouchableOpacity>
          </View>
        </ScrollView></View></View>
      </Modal>

      {/* Curriculum Modal */}
      <Modal visible={showCurriculumModal} transparent animationType="fade" onRequestClose={() => setShowCurriculumModal(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}><ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.modalTitle}>Add Curriculum Entry</Text>
          <Text style={styles.inputLabel}>Subject</Text>
          <TextInput style={styles.input} placeholder="e.g. Biology" placeholderTextColor={colors.textLight} value={curriculumForm.subject} onChangeText={(v) => setCurriculumForm({ ...curriculumForm, subject: v })} />
          <Text style={styles.inputLabel}>Department</Text>
          <TextInput style={styles.input} placeholder="e.g. Science" placeholderTextColor={colors.textLight} value={curriculumForm.department} onChangeText={(v) => setCurriculumForm({ ...curriculumForm, department: v })} />
          <Text style={styles.inputLabel}>HOD</Text>
          <TextInput style={styles.input} placeholder="e.g. Mr. Adjei" placeholderTextColor={colors.textLight} value={curriculumForm.hod} onChangeText={(v) => setCurriculumForm({ ...curriculumForm, hod: v })} />
          <Text style={styles.inputLabel}>Class</Text>
          <TextInput style={styles.input} placeholder="e.g. SHS2 Sci A" placeholderTextColor={colors.textLight} value={curriculumForm.classForm} onChangeText={(v) => setCurriculumForm({ ...curriculumForm, classForm: v })} />
          <Text style={styles.inputLabel}>Syllabus Topics</Text>
          <TextInput style={styles.input} placeholder="45" keyboardType="numeric" placeholderTextColor={colors.textLight} value={String(curriculumForm.syllabusTopics)} onChangeText={(v) => setCurriculumForm({ ...curriculumForm, syllabusTopics: parseInt(v) || 0 })} />
          <Text style={styles.inputLabel}>Topics Covered</Text>
          <TextInput style={styles.input} placeholder="0" keyboardType="numeric" placeholderTextColor={colors.textLight} value={String(curriculumForm.topicsCovered)} onChangeText={(v) => setCurriculumForm({ ...curriculumForm, topicsCovered: parseInt(v) || 0 })} />
          <Text style={styles.inputLabel}>Status</Text>
          <View style={styles.pickerRow}>
            {CURRICULUM_STATUSES.map((s) => (
              <TouchableOpacity key={s} style={[styles.pickerChip, curriculumForm.status === s && styles.pickerChipActive]} onPress={() => setCurriculumForm({ ...curriculumForm, status: s })}>
                <Text style={[styles.pickerChipText, curriculumForm.status === s && styles.pickerChipTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.inputLabel}>Notes</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Any notes..." placeholderTextColor={colors.textLight} value={curriculumForm.notes} onChangeText={(v) => setCurriculumForm({ ...curriculumForm, notes: v })} multiline />
          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowCurriculumModal(false)}><Text style={styles.modalBtnTextDark}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={() => { if (!curriculumForm.subject.trim()) { Alert.alert('Error', 'Subject is required'); return; } addCurriculum(curriculumForm); setCurriculumForm({ subject: '', department: '', hod: '', classForm: '', syllabusTopics: 0, topicsCovered: 0, status: 'Not Started', notes: '' }); setShowCurriculumModal(false); Alert.alert('Success', 'Curriculum entry added.'); }}><Text style={styles.modalBtnTextLight}>Add</Text></TouchableOpacity>
          </View>
        </ScrollView></View></View>
      </Modal>

      {/* Calendar Modal */}
      <Modal visible={showCalendarModal} transparent animationType="fade" onRequestClose={() => setShowCalendarModal(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}><ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.modalTitle}>Add Calendar Event</Text>
          <Text style={styles.inputLabel}>Title *</Text>
          <TextInput style={styles.input} placeholder="e.g. End of Term Exam" placeholderTextColor={colors.textLight} value={calendarForm.title} onChangeText={(v) => setCalendarForm({ ...calendarForm, title: v })} />
          <Text style={styles.inputLabel}>Type</Text>
          <View style={styles.pickerRow}>
            {CALENDAR_EVENT_TYPES.map((t) => (
              <TouchableOpacity key={t} style={[styles.pickerChip, calendarForm.type === t && styles.pickerChipActive]} onPress={() => setCalendarForm({ ...calendarForm, type: t })}>
                <Text style={[styles.pickerChipText, calendarForm.type === t && styles.pickerChipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.inputLabel}>Date</Text>
          <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} value={calendarForm.date} onChangeText={(v) => setCalendarForm({ ...calendarForm, date: v })} />
          <Text style={styles.inputLabel}>End Date (optional)</Text>
          <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textLight} value={calendarForm.endDate} onChangeText={(v) => setCalendarForm({ ...calendarForm, endDate: v })} />
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Event details..." placeholderTextColor={colors.textLight} value={calendarForm.description} onChangeText={(v) => setCalendarForm({ ...calendarForm, description: v })} multiline />
          <Text style={styles.inputLabel}>Term</Text>
          <View style={styles.pickerRow}>
            {TERM_NAMES.map((t) => (
              <TouchableOpacity key={t} style={[styles.pickerChip, calendarForm.term === t && styles.pickerChipActive]} onPress={() => setCalendarForm({ ...calendarForm, term: t })}>
                <Text style={[styles.pickerChipText, calendarForm.term === t && styles.pickerChipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowCalendarModal(false)}><Text style={styles.modalBtnTextDark}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={() => { if (!calendarForm.title.trim() || !calendarForm.date.trim()) { Alert.alert('Error', 'Title and date are required'); return; } addCalendarEvent(calendarForm); setCalendarForm({ title: '', type: 'Event', date: '', endDate: '', description: '', term: 'Term 3' }); setShowCalendarModal(false); Alert.alert('Success', 'Event added.'); }}><Text style={styles.modalBtnTextLight}>Add</Text></TouchableOpacity>
          </View>
        </ScrollView></View></View>
      </Modal>

      {/* Transcript Modal */}
      <Modal visible={showTranscriptModal} transparent animationType="fade" onRequestClose={() => setShowTranscriptModal(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}><ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.modalTitle}>Generate Transcript</Text>
          <Text style={styles.inputLabel}>Student Name *</Text>
          <TextInput style={styles.input} placeholder="e.g. Kwame Asante" placeholderTextColor={colors.textLight} value={transcriptForm.studentName} onChangeText={(v) => setTranscriptForm({ ...transcriptForm, studentName: v })} />
          <Text style={styles.inputLabel}>Admission No</Text>
          <TextInput style={styles.input} placeholder="e.g. SHS1001" placeholderTextColor={colors.textLight} value={transcriptForm.admNo} onChangeText={(v) => setTranscriptForm({ ...transcriptForm, admNo: v })} />
          <Text style={styles.inputLabel}>Class</Text>
          <TextInput style={styles.input} placeholder="e.g. SHS1 Sci A" placeholderTextColor={colors.textLight} value={transcriptForm.classForm} onChangeText={(v) => setTranscriptForm({ ...transcriptForm, classForm: v })} />
          <Text style={styles.inputLabel}>Academic Year</Text>
          <TextInput style={styles.input} placeholder="2024/2025" placeholderTextColor={colors.textLight} value={transcriptForm.academicYear} onChangeText={(v) => setTranscriptForm({ ...transcriptForm, academicYear: v })} />
          <Text style={styles.inputLabel}>Cumulative Average</Text>
          <TextInput style={styles.input} placeholder="69" keyboardType="numeric" placeholderTextColor={colors.textLight} value={String(transcriptForm.cumulativeAverage)} onChangeText={(v) => setTranscriptForm({ ...transcriptForm, cumulativeAverage: parseInt(v) || 0 })} />
          <Text style={styles.inputLabel}>Overall Position</Text>
          <TextInput style={styles.input} placeholder="e.g. 5th" placeholderTextColor={colors.textLight} value={transcriptForm.overallPosition} onChangeText={(v) => setTranscriptForm({ ...transcriptForm, overallPosition: v })} />
          <Text style={styles.inputLabel}>Conduct</Text>
          <TextInput style={styles.input} placeholder="e.g. Very Good" placeholderTextColor={colors.textLight} value={transcriptForm.conduct} onChangeText={(v) => setTranscriptForm({ ...transcriptForm, conduct: v })} />
          <Text style={styles.inputLabel}>Attendance</Text>
          <TextInput style={styles.input} placeholder="e.g. 95%" placeholderTextColor={colors.textLight} value={transcriptForm.attendance} onChangeText={(v) => setTranscriptForm({ ...transcriptForm, attendance: v })} />
          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowTranscriptModal(false)}><Text style={styles.modalBtnTextDark}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={() => { if (!transcriptForm.studentName.trim()) { Alert.alert('Error', 'Student name is required'); return; } generateTranscript({ ...transcriptForm, yearSummary: [], termsCovered: ['Term 1', 'Term 2'] }); setTranscriptForm({ studentName: '', admNo: '', classForm: '', academicYear: '2024/2025', termsCovered: [], cumulativeAverage: 0, overallPosition: '', conduct: '', attendance: '' }); setShowTranscriptModal(false); Alert.alert('Success', 'Transcript generated. Status: Draft.'); }}><Text style={styles.modalBtnTextLight}>Generate</Text></TouchableOpacity>
          </View>
        </ScrollView></View></View>
      </Modal>

      {/* HOD Review Modal */}
      <Modal visible={!!hodReview} transparent animationType="fade" onRequestClose={() => setHODReview(null)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{hodReview?.action === 'approve' ? 'Approve Request' : hodReview?.action === 'defer' ? 'Defer Request' : 'Reject Request'}</Text>
          <Text style={styles.inputLabel}>Review Notes</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Add review notes..." placeholderTextColor={colors.textLight} value={hodNotes} onChangeText={setHODNotes} multiline />
          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setHODReview(null)}><Text style={styles.modalBtnTextDark}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={() => { if (!hodReview) return; if (hodReview.action === 'approve') approveHOD(hodReview.id, academicOfficer, hodNotes); else if (hodReview.action === 'defer') deferHOD(hodReview.id, academicOfficer, hodNotes); else rejectHOD(hodReview.id, academicOfficer, hodNotes); setHODReview(null); setHODNotes(''); Alert.alert('Done', `Request ${hodReview.action}d.`); }}><Text style={styles.modalBtnTextLight}>Confirm</Text></TouchableOpacity>
          </View>
        </View></View>
      </Modal>

      {/* Transcript Reject Modal */}
      <Modal visible={!!transcriptReject} transparent animationType="fade" onRequestClose={() => setTranscriptReject(null)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Reject Transcript</Text>
          <Text style={styles.inputLabel}>Rejection Reason</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Why is this transcript rejected?" placeholderTextColor={colors.textLight} value={rejectReason} onChangeText={setRejectReason} multiline />
          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setTranscriptReject(null)}><Text style={styles.modalBtnTextDark}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={() => { if (!transcriptReject) return; if (!rejectReason.trim()) { Alert.alert('Error', 'Reason is required'); return; } rejectTranscript(transcriptReject, rejectReason); setTranscriptReject(null); setRejectReason(''); Alert.alert('Rejected', 'Transcript rejected.'); }}><Text style={styles.modalBtnTextLight}>Reject</Text></TouchableOpacity>
          </View>
        </View></View>
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
  approvalCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  approvalType: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  approvalFrom: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  approvalDetail: { fontSize: fontSize.sm, color: colors.text, marginTop: spacing.sm },
  approvalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  approveBtn: { backgroundColor: colors.success, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  approveText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  rejectBtn: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.warning },
  rejectText: { color: colors.warning, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  logoutBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  logoutText: { color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  reqCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  reqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  reqTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  reqMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  reqNotes: { fontSize: fontSize.xs, color: colors.textLight, fontStyle: 'italic', marginTop: spacing.xs },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  statusText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  emptyText: { fontSize: fontSize.md, color: colors.textLight, textAlign: 'center', paddingVertical: spacing.xl },
  rowBtns: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, flexWrap: 'wrap' },
  smallBtn: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2 },
  smallBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  modalContent: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, width: '100%', maxWidth: 560, maxHeight: '85%' },
  modalTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
  modalSubtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.md },
  inputLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xs },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md, color: colors.text, marginBottom: spacing.sm },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  pickerChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceAlt },
  pickerChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pickerChipText: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: fontWeight.medium },
  pickerChipTextActive: { color: colors.white, fontWeight: fontWeight.semibold },
  modalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  modalBtn: { flex: 1, borderRadius: radius.md, paddingVertical: spacing.sm + 2, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  modalBtnSubmit: { backgroundColor: colors.primary },
  modalBtnTextDark: { color: colors.text, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  modalBtnTextLight: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  alertCard: { backgroundColor: colors.warningBg, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderLeftWidth: 4, borderLeftColor: colors.warning },
  alertTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  alertText: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  // Reports
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
  reportBarCount: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.text, width: 60, textAlign: 'right' },
});
