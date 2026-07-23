import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput, Alert } from 'react-native';
import { DashboardLayout, NavItem, StatCard, CardGrid, DataTable } from '@components/index';
import { colors, spacing, fontSize, fontWeight, radius } from '@theme/index';
import { useAuthStore } from '@store/authStore';
import { useStaffStore } from '@store/staffStore';
import { useRequisitionStore } from '@store/requisitionStore';
import { useRegistryStore, PROGRAMMES, CLASS_SECTIONS, DOCUMENT_CHECKLIST, autoAssignHouse, autoAssignClass, generateAdmissionNumber } from '@store/registryStore';
import type { Programme } from '@store/registryStore';
import { useSecurityStore } from '@store/securityStore';
import { useExeatStore } from '@store/exeatStore';
import { useBursarStore } from '@store/bursarStore';
import { useAdminStore } from '@store/adminStore';
import type { FacilityIssue } from '@store/adminStore';
import type { AnnouncementPriority, AnnouncementAudience } from '@store/adminStore';

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Admin Overview' },
  { key: 'approvals', label: 'Approvals' },
  { key: 'compliance', label: 'Compliance Tracker' },
  { key: 'admissions', label: 'Admissions' },
  { key: 'cssps-upload', label: 'CSSPS Placement Upload' },
  { key: 'prospectus', label: 'Prospectus Publishing' },
  { key: 'admissions-config', label: 'Admission Form Config' },
  { key: 'scratch-cards', label: 'Scratch Cards' },
  { key: 'id-cards', label: 'Student ID Cards' },
  { key: 'staff', label: 'Staff Management' },
  { key: 'facilities', label: 'Facilities' },
  { key: 'meetings', label: 'Meetings' },
  { key: 'tasks', label: 'Task Assignments' },
  { key: 'communication', label: 'Communication' },
  { key: 'reports', label: 'Reports' },
];

const STATUS_COLORS: Record<string, string> = {
  'Pending': colors.warning,
  'Approved': colors.success,
  'Rejected': colors.danger,
  'Submitted': colors.success,
  'In Progress': colors.info,
  'Not Started': colors.textLight,
  'Overdue': colors.danger,
  'Reported': colors.warning,
  'Assigned': colors.info,
  'Resolved': colors.success,
  'Scheduled': colors.info,
  'Completed': colors.success,
  'Cancelled': colors.danger,
};

const FACILITY_CATEGORY_OPTIONS: ('Electrical' | 'Plumbing' | 'Furniture' | 'Building' | 'Equipment' | 'Grounds' | 'Other')[] = ['Electrical', 'Plumbing', 'Furniture', 'Building', 'Equipment', 'Grounds', 'Other'];
const FACILITY_PRIORITY_OPTIONS: ('Low' | 'Medium' | 'High' | 'Critical')[] = ['Low', 'Medium', 'High', 'Critical'];
const TASK_PRIORITY_OPTIONS: ('Low' | 'Normal' | 'High' | 'Urgent')[] = ['Low', 'Normal', 'High', 'Urgent'];
const ANNOUNCEMENT_PRIORITY_OPTIONS: AnnouncementPriority[] = ['Normal', 'Important', 'Urgent'];
const ANNOUNCEMENT_AUDIENCE_OPTIONS: AnnouncementAudience[] = ['All Staff', 'Teaching Staff', 'Non-Teaching Staff', 'All Students', 'Parents'];

function statusColor(status: string): string {
  return STATUS_COLORS[status] ?? colors.textSecondary;
}

function formatDate(d: string): string {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatCurrency(amount: number): string {
  return `GH₵ ${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function AdminDashboard() {
  const [activePage, setActivePage] = useState('overview');
  const { logout, user } = useAuthStore();
  const adminName = user?.displayName ?? 'Asst. Headmaster (Admin)';

  // Cross-store data
  const staffStore = useStaffStore();
  const requisitionStore = useRequisitionStore();
  const registryStore = useRegistryStore();
  const securityStore = useSecurityStore();
  const exeatStore = useExeatStore();
  const bursarStore = useBursarStore();
  const adminStore = useAdminStore();

  // Derived data
  const pendingLeave = staffStore.getPendingLeave();
  const pendingRequisitions = requisitionStore.requisitions.filter((r) => r.status === 'Pending');
  const pendingProcurement = bursarStore.procurement.filter((p) => p.status === 'Requisitioned');
  const pendingExeats = exeatStore.getPending();
  const openIncidents = securityStore.incidents.filter((i) => i.status !== 'Resolved');
  const activeStudents = registryStore.students.filter((s) => s.status === 'Active');
  const pendingAdmissions = registryStore.getPendingAdmissions();
  const overdueCompliance = adminStore.getOverdueCompliance();
  const openFacilities = adminStore.getOpenFacilities();
  const pendingTasks = adminStore.getPendingTasks();
  const scheduledMeetings = adminStore.meetings.filter((m) => m.status === 'Scheduled');
  const totalStaff = staffStore.directory.length;

  // Modal states
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showProcurementModal, setShowProcurementModal] = useState(false);
  const [showExeatModal, setShowExeatModal] = useState(false);
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [showFacilityModal, setShowFacilityModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showMeetingDetail, setShowMeetingDetail] = useState(false);
  const [showAdmissionModal, setShowAdmissionModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [csvText, setCsvText] = useState('');

  // CSSPS Upload states
  const [showPlacementModal, setShowPlacementModal] = useState(false);
  const [showBulkPlacementModal, setShowBulkPlacementModal] = useState(false);
  const [placementCsvText, setPlacementCsvText] = useState('');
  const [placementForm, setPlacementForm] = useState({ fullName: '', csspsRef: '', intendedClass: 'SHS1 Sci A', programme: 'Science' as Programme });

  // Prospectus states
  const [showProspectusModal, setShowProspectusModal] = useState(false);
  const [prospectusForm, setProspectusForm] = useState({ title: '', academicYear: '2026/2027', content: '', targetedAdmissionIds: '' });

  // Scratch card states
  const [showScratchCardModal, setShowScratchCardModal] = useState(false);
  const [scratchCardCount, setScratchCardCount] = useState('10');
  const [scratchCardAmount, setScratchCardAmount] = useState('50');
  const [lastGeneratedCards, setLastGeneratedCards] = useState<any[]>([]);


  // Selected items for modals
  const [selectedLeaveId, setSelectedLeaveId] = useState<string | null>(null);
  const [selectedProcurementId, setSelectedProcurementId] = useState<string | null>(null);
  const [selectedExeatId, setSelectedExeatId] = useState<string | null>(null);
  const [selectedComplianceId, setSelectedComplianceId] = useState<string | null>(null);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [selectedAdmissionId, setSelectedAdmissionId] = useState<string | null>(null);

  // Form states
  const [reviewNotes, setReviewNotes] = useState('');
  const [complianceForm, setComplianceForm] = useState({ document: '', authority: '', dueDate: '', notes: '' });
  const [facilityForm, setFacilityForm] = useState<{ title: string; location: string; category: 'Electrical' | 'Plumbing' | 'Furniture' | 'Building' | 'Equipment' | 'Grounds' | 'Other'; priority: 'Low' | 'Medium' | 'High' | 'Critical'; description: string; assignedTo: string; reportedBy: string }>({ title: '', location: '', category: 'Electrical', priority: 'Medium', description: '', assignedTo: '', reportedBy: '' });
  const [meetingForm, setMeetingForm] = useState({ title: '', date: '', time: '', location: '', facilitator: '', agenda: '' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedTo: '', department: '', dueDate: '', priority: 'Normal' as 'Low' | 'Normal' | 'High' | 'Urgent', notes: '' });
  const [announcementForm, setAnnouncementForm] = useState({ title: '', body: '', priority: 'Normal' as AnnouncementPriority, audience: 'All Staff' as AnnouncementAudience });
  const [meetingMinutesForm, setMeetingMinutesForm] = useState({ minutes: '', keyDecisions: '', actionItems: '', attendees: '0' });
  const [studentForm, setStudentForm] = useState({ firstName: '', lastName: '', dateOfBirth: '', gender: 'Male' as 'Male' | 'Female', programme: 'Science' as Programme, guardianName: '', guardianPhone: '', guardianAddress: '', photoUrl: '' as string | null, csspsRef: '' });

  // ── PDF Generation ──
  const generatePDF = useCallback((reportType: string) => {
    const now = new Date().toLocaleString('en-GB');
    let html = '';

    const header = `
      <html><head><meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1A1A2E; margin: 40px; }
        h1 { color: #0F4C75; font-size: 24px; border-bottom: 3px solid #0F4C75; padding-bottom: 10px; }
        h2 { color: #0F4C75; font-size: 18px; margin-top: 30px; }
        h3 { color: #3282B8; font-size: 15px; margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 12px; }
        th { background: #0F4C75; color: white; padding: 8px 10px; text-align: left; }
        td { padding: 8px 10px; border-bottom: 1px solid #E4E7EC; }
        tr:nth-child(even) { background: #F7F8FA; }
        .stat-box { display: inline-block; width: 22%; background: #F0F2F5; border-radius: 8px; padding: 12px; margin: 5px; text-align: center; }
        .stat-value { font-size: 22px; font-weight: bold; color: #0F4C75; }
        .stat-label { font-size: 11px; color: #5C6370; }
        .status-badge { padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
        .footer { margin-top: 40px; border-top: 1px solid #E4E7EC; padding-top: 10px; font-size: 10px; color: #9CA3AF; text-align: center; }
        .confidential { color: #E5484D; font-weight: 600; }
      </style></head><body>
      <h1>SIMS — School Information Management System</h1>
      <p style="font-size:13px;color:#5C6370;">Asst. Headmaster (Administration) — ${reportType}<br/>Generated: ${now}</p>
      <p class="confidential">CONFIDENTIAL — FOR INTERNAL USE ONLY</p>
    `;

    const footer = `<div class="footer">Generated by SIMS — Asst. Headmaster (Administration) Dashboard | ${now}</div></body></html>`;

    if (reportType === 'Full Administrative Report') {
      html = header + `
        <h2>1. Administrative Overview</h2>
        <div>
          <div class="stat-box"><div class="stat-value">${totalStaff}</div><div class="stat-label">Total Staff</div></div>
          <div class="stat-box"><div class="stat-value">${activeStudents.length}</div><div class="stat-label">Active Students</div></div>
          <div class="stat-box"><div class="stat-value">${pendingLeave.length}</div><div class="stat-label">Pending Leave</div></div>
          <div class="stat-box"><div class="stat-value">${pendingRequisitions.length}</div><div class="stat-label">Pending Requisitions</div></div>
          <div class="stat-box"><div class="stat-value">${pendingProcurement.length}</div><div class="stat-label">Pending Procurement</div></div>
          <div class="stat-box"><div class="stat-value">${pendingExeats.length}</div><div class="stat-label">Pending Exeats</div></div>
          <div class="stat-box"><div class="stat-value">${openIncidents.length}</div><div class="stat-label">Open Incidents</div></div>
          <div class="stat-box"><div class="stat-value">${overdueCompliance.length}</div><div class="stat-label">Overdue Compliance</div></div>
        </div>

        <h2>2. Staff Leave Requests</h2>
        <table><tr><th>Staff</th><th>Role</th><th>Type</th><th>Start</th><th>End</th><th>Status</th></tr>
        ${staffStore.leaveRequests.map((r) => `<tr><td>${r.staffName}</td><td>${r.staffRole}</td><td>${r.type}</td><td>${formatDate(r.startDate)}</td><td>${formatDate(r.endDate)}</td><td>${r.status}</td></tr>`).join('')}
        </table>

        <h2>3. Procurement Requests</h2>
        <table><tr><th>Date</th><th>Item</th><th>Dept</th><th>Qty</th><th>Est. Cost</th><th>Status</th></tr>
        ${bursarStore.procurement.map((p) => `<tr><td>${formatDate(p.date)}</td><td>${p.item}</td><td>${p.department}</td><td>${p.quantity} ${p.unit}</td><td>${formatCurrency(p.estimatedCost)}</td><td>${p.status}</td></tr>`).join('')}
        </table>

        <h2>4. Cross-Departmental Requisitions</h2>
        <table><tr><th>Date</th><th>Item</th><th>Dept</th><th>Qty</th><th>Priority</th><th>Status</th></tr>
        ${requisitionStore.requisitions.map((r) => `<tr><td>${formatDate(r.date)}</td><td>${r.itemName}</td><td>${r.department}</td><td>${r.quantity} ${r.unit}</td><td>${r.priority}</td><td>${r.status}</td></tr>`).join('')}
        </table>

        <h2>5. Exeat Approvals</h2>
        <table><tr><th>Exeat No</th><th>Student</th><th>Reason</th><th>Departure</th><th>Return</th><th>Status</th></tr>
        ${exeatStore.exeats.map((e) => `<tr><td>${e.exeatNo}</td><td>${e.studentName}</td><td>${e.reason}</td><td>${formatDate(e.departureDate)}</td><td>${formatDate(e.returnDate)}</td><td>${e.status}</td></tr>`).join('')}
        </table>

        <h2>6. Compliance Tracker</h2>
        <table><tr><th>Document</th><th>Authority</th><th>Due Date</th><th>Status</th><th>Notes</th></tr>
        ${adminStore.compliance.map((c) => `<tr><td>${c.document}</td><td>${c.authority}</td><td>${formatDate(c.dueDate)}</td><td>${c.status}</td><td>${c.notes}</td></tr>`).join('')}
        </table>

        <h2>7. Facility Issues</h2>
        <table><tr><th>Title</th><th>Location</th><th>Category</th><th>Priority</th><th>Status</th></tr>
        ${adminStore.facilities.map((f) => `<tr><td>${f.title}</td><td>${f.location}</td><td>${f.category}</td><td>${f.priority}</td><td>${f.status}</td></tr>`).join('')}
        </table>

        <h2>8. Security Incidents</h2>
        <table><tr><th>Date</th><th>Type</th><th>Location</th><th>Severity</th><th>Status</th></tr>
        ${securityStore.incidents.map((i) => `<tr><td>${formatDate(i.date)}</td><td>${i.type}</td><td>${i.location}</td><td>${i.severity}</td><td>${i.status}</td></tr>`).join('')}
        </table>

        <h2>9. Task Assignments</h2>
        <table><tr><th>Task</th><th>Assigned To</th><th>Dept</th><th>Due Date</th><th>Priority</th><th>Status</th></tr>
        ${adminStore.tasks.map((t) => `<tr><td>${t.title}</td><td>${t.assignedTo}</td><td>${t.department}</td><td>${formatDate(t.dueDate)}</td><td>${t.priority}</td><td>${t.status}</td></tr>`).join('')}
        </table>

        <h2>10. Scheduled Meetings</h2>
        <table><tr><th>Title</th><th>Date</th><th>Time</th><th>Location</th><th>Facilitator</th><th>Status</th></tr>
        ${adminStore.meetings.map((m) => `<tr><td>${m.title}</td><td>${formatDate(m.date)}</td><td>${m.time}</td><td>${m.location}</td><td>${m.facilitator}</td><td>${m.status}</td></tr>`).join('')}
        </table>
      ` + footer;
    } else if (reportType === 'Staff Summary') {
      html = header + `
        <h2>Staff Directory</h2>
        <table><tr><th>Name</th><th>Role</th><th>Position</th><th>Department</th><th>Phone</th><th>Status</th></tr>
        ${staffStore.directory.map((d) => `<tr><td>${d.name}</td><td>${d.role}</td><td>${d.position}</td><td>${d.department}</td><td>${d.phone}</td><td>${d.status}</td></tr>`).join('')}
        </table>
        <h2>Leave Requests</h2>
        <table><tr><th>Staff</th><th>Type</th><th>Start</th><th>End</th><th>Reason</th><th>Status</th><th>Reviewed By</th></tr>
        ${staffStore.leaveRequests.map((r) => `<tr><td>${r.staffName}</td><td>${r.type}</td><td>${formatDate(r.startDate)}</td><td>${formatDate(r.endDate)}</td><td>${r.reason}</td><td>${r.status}</td><td>${r.reviewedBy ?? '—'}</td></tr>`).join('')}
        </table>
        <h2>Summary Statistics</h2>
        <div>
          <div class="stat-box"><div class="stat-value">${totalStaff}</div><div class="stat-label">Total Staff</div></div>
          <div class="stat-box"><div class="stat-value">${staffStore.directory.filter((d) => d.status === 'Active').length}</div><div class="stat-label">Active</div></div>
          <div class="stat-box"><div class="stat-value">${staffStore.directory.filter((d) => d.status === 'On Leave').length}</div><div class="stat-label">On Leave</div></div>
          <div class="stat-box"><div class="stat-value">${pendingLeave.length}</div><div class="stat-label">Pending Leave</div></div>
        </div>
      ` + footer;
    } else if (reportType === 'Procurement Report') {
      html = header + `
        <h2>Procurement Requests</h2>
        <table><tr><th>Date</th><th>Item</th><th>Department</th><th>Qty</th><th>Unit</th><th>Est. Cost</th><th>Supplier</th><th>Status</th></tr>
        ${bursarStore.procurement.map((p) => `<tr><td>${formatDate(p.date)}</td><td>${p.item}</td><td>${p.department}</td><td>${p.quantity}</td><td>${p.unit}</td><td>${formatCurrency(p.estimatedCost)}</td><td>${p.supplier}</td><td>${p.status}</td></tr>`).join('')}
        </table>
        <h2>Cross-Departmental Requisitions</h2>
        <table><tr><th>Date</th><th>Item</th><th>Department</th><th>Qty</th><th>Priority</th><th>Requested By</th><th>Status</th></tr>
        ${requisitionStore.requisitions.map((r) => `<tr><td>${formatDate(r.date)}</td><td>${r.itemName}</td><td>${r.department}</td><td>${r.quantity} ${r.unit}</td><td>${r.priority}</td><td>${r.requestedBy}</td><td>${r.status}</td></tr>`).join('')}
        </table>
        <h2>Petty Cash</h2>
        <table><tr><th>Date</th><th>Description</th><th>Amount</th><th>Requested By</th><th>Status</th></tr>
        ${bursarStore.pettyCash.map((p) => `<tr><td>${formatDate(p.date)}</td><td>${p.description}</td><td>${formatCurrency(p.amount)}</td><td>${p.requestedBy}</td><td>${p.status}</td></tr>`).join('')}
        </table>
        <h2>Imprest Accounts</h2>
        <table><tr><th>Holder</th><th>Department</th><th>Amount</th><th>Date Issued</th><th>Purpose</th><th>Status</th></tr>
        ${bursarStore.imprest.map((i) => `<tr><td>${i.holder}</td><td>${i.department}</td><td>${formatCurrency(i.amount)}</td><td>${formatDate(i.dateIssued)}</td><td>${i.purpose}</td><td>${i.status}</td></tr>`).join('')}
        </table>
      ` + footer;
    } else if (reportType === 'Compliance Status Report') {
      html = header + `
        <h2>Compliance Tracker</h2>
        <table><tr><th>Document</th><th>Authority</th><th>Due Date</th><th>Status</th><th>Submitted Date</th><th>Submitted By</th><th>Notes</th></tr>
        ${adminStore.compliance.map((c) => `<tr><td>${c.document}</td><td>${c.authority}</td><td>${formatDate(c.dueDate)}</td><td>${c.status}</td><td>${c.submittedDate ? formatDate(c.submittedDate) : '—'}</td><td>${c.submittedBy ?? '—'}</td><td>${c.notes}</td></tr>`).join('')}
        </table>
        <h2>Summary</h2>
        <div>
          <div class="stat-box"><div class="stat-value">${adminStore.compliance.filter((c) => c.status === 'Submitted').length}</div><div class="stat-label">Submitted</div></div>
          <div class="stat-box"><div class="stat-value">${adminStore.compliance.filter((c) => c.status === 'In Progress').length}</div><div class="stat-label">In Progress</div></div>
          <div class="stat-box"><div class="stat-value">${adminStore.compliance.filter((c) => c.status === 'Not Started').length}</div><div class="stat-label">Not Started</div></div>
          <div class="stat-box"><div class="stat-value">${overdueCompliance.length}</div><div class="stat-label">Overdue</div></div>
        </div>
      ` + footer;
    } else if (reportType === 'Security Summary') {
      html = header + `
        <h2>Security Incidents</h2>
        <table><tr><th>Date</th><th>Time</th><th>Type</th><th>Location</th><th>Severity</th><th>Status</th><th>Reported By</th></tr>
        ${securityStore.incidents.map((i) => `<tr><td>${formatDate(i.date)}</td><td>${i.time}</td><td>${i.type}</td><td>${i.location}</td><td>${i.severity}</td><td>${i.status}</td><td>${i.reportedBy}</td></tr>`).join('')}
        </table>
        <h2>Gate Log (Recent)</h2>
        <table><tr><th>Date</th><th>Time</th><th>Visitor</th><th>Purpose</th><th>Host</th><th>Status</th></tr>
        ${securityStore.gateLogs.slice(0, 20).map((g) => `<tr><td>${formatDate(g.date)}</td><td>${g.time}</td><td>${g.visitorName}</td><td>${g.purpose}</td><td>${g.host}</td><td>${g.status}</td></tr>`).join('')}
        </table>
        <h2>Summary</h2>
        <div>
          <div class="stat-box"><div class="stat-value">${securityStore.incidents.length}</div><div class="stat-label">Total Incidents</div></div>
          <div class="stat-box"><div class="stat-value">${openIncidents.length}</div><div class="stat-label">Open</div></div>
          <div class="stat-box"><div class="stat-value">${securityStore.incidents.filter((i) => i.severity === 'Critical').length}</div><div class="stat-label">Critical</div></div>
          <div class="stat-box"><div class="stat-value">${securityStore.gateLogs.length}</div><div class="stat-label">Gate Entries</div></div>
        </div>
      ` + footer;
    } else if (reportType === 'Facility Report') {
      html = header + `
        <h2>Facility Issues</h2>
        <table><tr><th>Title</th><th>Location</th><th>Category</th><th>Priority</th><th>Status</th><th>Reported Date</th><th>Assigned To</th></tr>
        ${adminStore.facilities.map((f) => `<tr><td>${f.title}</td><td>${f.location}</td><td>${f.category}</td><td>${f.priority}</td><td>${f.status}</td><td>${formatDate(f.reportedDate)}</td><td>${f.assignedTo ?? '—'}</td></tr>`).join('')}
        </table>
        <h2>Summary</h2>
        <div>
          <div class="stat-box"><div class="stat-value">${adminStore.facilities.length}</div><div class="stat-label">Total Issues</div></div>
          <div class="stat-box"><div class="stat-value">${openFacilities.length}</div><div class="stat-label">Open</div></div>
          <div class="stat-box"><div class="stat-value">${adminStore.facilities.filter((f) => f.priority === 'Critical').length}</div><div class="stat-label">Critical</div></div>
          <div class="stat-box"><div class="stat-value">${adminStore.facilities.filter((f) => f.status === 'Resolved').length}</div><div class="stat-label">Resolved</div></div>
        </div>
      ` + footer;
    } else if (reportType === 'Exeat Report') {
      html = header + `
        <h2>Student Exeats</h2>
        <table><tr><th>Exeat No</th><th>Student</th><th>Class</th><th>House</th><th>Reason</th><th>Departure</th><th>Return</th><th>Status</th></tr>
        ${exeatStore.exeats.map((e) => `<tr><td>${e.exeatNo}</td><td>${e.studentName}</td><td>${e.class}</td><td>${e.house}</td><td>${e.reason}</td><td>${formatDate(e.departureDate)}</td><td>${formatDate(e.returnDate)}</td><td>${e.status}</td></tr>`).join('')}
        </table>
        <h2>Summary</h2>
        <div>
          <div class="stat-box"><div class="stat-value">${exeatStore.exeats.length}</div><div class="stat-label">Total Exeats</div></div>
          <div class="stat-box"><div class="stat-value">${pendingExeats.length}</div><div class="stat-label">Pending</div></div>
          <div class="stat-box"><div class="stat-value">${exeatStore.exeats.filter((e) => e.status === 'Checked Out').length}</div><div class="stat-label">Checked Out</div></div>
          <div class="stat-box"><div class="stat-value">${exeatStore.exeats.filter((e) => e.status === 'Checked In').length}</div><div class="stat-label">Checked In</div></div>
        </div>
      ` + footer;
    } else if (reportType === 'Task Assignment Report') {
      html = header + `
        <h2>Task Assignments</h2>
        <table><tr><th>Task</th><th>Assigned To</th><th>Department</th><th>Due Date</th><th>Priority</th><th>Status</th><th>Assigned By</th></tr>
        ${adminStore.tasks.map((t) => `<tr><td>${t.title}</td><td>${t.assignedTo}</td><td>${t.department}</td><td>${formatDate(t.dueDate)}</td><td>${t.priority}</td><td>${t.status}</td><td>${t.assignedBy}</td></tr>`).join('')}
        </table>
        <h2>Summary</h2>
        <div>
          <div class="stat-box"><div class="stat-value">${adminStore.tasks.length}</div><div class="stat-label">Total Tasks</div></div>
          <div class="stat-box"><div class="stat-value">${pendingTasks.length}</div><div class="stat-label">Pending</div></div>
          <div class="stat-box"><div class="stat-value">${adminStore.tasks.filter((t) => t.status === 'In Progress').length}</div><div class="stat-label">In Progress</div></div>
          <div class="stat-box"><div class="stat-value">${adminStore.tasks.filter((t) => t.status === 'Completed').length}</div><div class="stat-label">Completed</div></div>
        </div>
      ` + footer;
    } else if (reportType === 'Admissions Report') {
      html = header + `
        <h2>Admission Applications</h2>
        <table><tr><th>Applicant</th><th>Parent/Guardian</th><th>Phone</th><th>Date Applied</th><th>Status</th><th>Documents Verified</th></tr>
        ${registryStore.admissions.map((a) => `<tr><td>${a.applicantName}</td><td>${a.parentName}</td><td>${a.parentPhone}</td><td>${formatDate(a.dateApplied)}</td><td>${a.status}</td><td>${a.documentsVerified ? 'Yes' : 'No'}</td></tr>`).join('')}
        </table>
        <h2>CSSPS Placements</h2>
        <table><tr><th>Student Name</th><th>CSSPS Ref</th><th>Intended Class</th><th>Matched</th></tr>
        ${registryStore.placements.map((p) => `<tr><td>${p.fullName}</td><td>${p.csspsRef}</td><td>${p.intendedClass}</td><td>${p.matched ? 'Yes' : 'No'}</td></tr>`).join('')}
        </table>
        <h2>Enrolled Students</h2>
        <table><tr><th>Adm No</th><th>Name</th><th>Class</th><th>House</th><th>Guardian</th><th>Status</th></tr>
        ${registryStore.students.map((s) => `<tr><td>${s.admNo}</td><td>${s.firstName} ${s.lastName}</td><td>${s.class}</td><td>${s.house}</td><td>${s.guardianName}</td><td>${s.status}</td></tr>`).join('')}
        </table>
        <h2>Summary</h2>
        <div>
          <div class="stat-box"><div class="stat-value">${registryStore.admissions.length}</div><div class="stat-label">Total Applications</div></div>
          <div class="stat-box"><div class="stat-value">${pendingAdmissions.length}</div><div class="stat-label">Pending Review</div></div>
          <div class="stat-box"><div class="stat-value">${registryStore.admissions.filter((a) => a.status === 'Approved').length}</div><div class="stat-label">Approved</div></div>
          <div class="stat-box"><div class="stat-value">${activeStudents.length}</div><div class="stat-label">Active Students</div></div>
        </div>
      ` + footer;
    }

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    }
  }, [staffStore, requisitionStore, registryStore, securityStore, exeatStore, bursarStore, adminStore, activeStudents, pendingAdmissions, pendingLeave, pendingRequisitions, pendingProcurement, pendingExeats, openIncidents, overdueCompliance, openFacilities, pendingTasks, totalStaff]);

  // ── Action Handlers ──
  const handleLeaveReview = (id: string, status: 'Approved' | 'Rejected') => {
    staffStore.reviewLeave(id, status, adminName, reviewNotes);
    setShowLeaveModal(false);
    setSelectedLeaveId(null);
    setReviewNotes('');
    Alert.alert('Success', `Leave request ${status.toLowerCase()}.`);
  };

  const handleProcurementAction = (id: string, action: 'approve' | 'reject') => {
    if (action === 'approve') bursarStore.approveProcurement(id);
    else bursarStore.rejectProcurement(id);
    setShowProcurementModal(false);
    setSelectedProcurementId(null);
    Alert.alert('Success', `Procurement request ${action === 'approve' ? 'approved' : 'rejected'}.`);
  };

  const handleExeatAction = (id: string, action: 'approve' | 'reject') => {
    if (action === 'approve') exeatStore.approveExeat(id, adminName);
    else exeatStore.rejectExeat(id, adminName);
    setShowExeatModal(false);
    setSelectedExeatId(null);
    Alert.alert('Success', `Exeat ${action === 'approve' ? 'approved' : 'rejected'}.`);
  };

  const handleComplianceUpdate = (id: string, status: 'Not Started' | 'In Progress' | 'Submitted') => {
    adminStore.updateCompliance(id, { status, submittedDate: status === 'Submitted' ? new Date().toISOString().slice(0, 10) : undefined, submittedBy: status === 'Submitted' ? adminName : undefined });
    setShowComplianceModal(false);
    setSelectedComplianceId(null);
  };

  const handleAddCompliance = () => {
    if (!complianceForm.document || !complianceForm.authority || !complianceForm.dueDate) return;
    adminStore.addCompliance({ ...complianceForm, status: 'Not Started' });
    setComplianceForm({ document: '', authority: '', dueDate: '', notes: '' });
    setShowComplianceModal(false);
  };

  const handleAddFacility = () => {
    if (!facilityForm.title || !facilityForm.location) return;
    adminStore.addFacility({ ...facilityForm, reportedBy: adminName, assignedTo: facilityForm.assignedTo || undefined });
    setFacilityForm({ title: '', location: '', category: 'Electrical', priority: 'Medium', description: '', assignedTo: '', reportedBy: '' });
    setShowFacilityModal(false);
  };

  const handleUpdateFacility = (id: string, status: 'Reported' | 'Assigned' | 'In Progress' | 'Resolved') => {
    const updates: Partial<FacilityIssue> = { status };
    if (status === 'Resolved') updates.resolvedDate = new Date().toISOString().slice(0, 10);
    adminStore.updateFacility(id, updates);
    setShowFacilityModal(false);
    setSelectedFacilityId(null);
  };

  const handleAddMeeting = () => {
    if (!meetingForm.title || !meetingForm.date) return;
    adminStore.addMeeting(meetingForm);
    setMeetingForm({ title: '', date: '', time: '', location: '', facilitator: '', agenda: '' });
    setShowMeetingModal(false);
  };

  const handleCompleteMeeting = (id: string) => {
    adminStore.completeMeeting(id, meetingMinutesForm.minutes, meetingMinutesForm.keyDecisions, meetingMinutesForm.actionItems, parseInt(meetingMinutesForm.attendees, 10) || 0);
    setMeetingMinutesForm({ minutes: '', keyDecisions: '', actionItems: '', attendees: '0' });
    setShowMeetingDetail(false);
    setSelectedMeetingId(null);
  };

  const handleAddTask = () => {
    if (!taskForm.title || !taskForm.assignedTo || !taskForm.dueDate) return;
    adminStore.addTask({ ...taskForm, assignedBy: adminName });
    setTaskForm({ title: '', description: '', assignedTo: '', department: '', dueDate: '', priority: 'Normal', notes: '' });
    setShowTaskModal(false);
  };

  const handleAddAnnouncement = () => {
    if (!announcementForm.title || !announcementForm.body) return;
    adminStore.addAnnouncement({ ...announcementForm, postedBy: adminName });
    setAnnouncementForm({ title: '', body: '', priority: 'Normal', audience: 'All Staff' });
    setShowAnnouncementModal(false);
  };

  const handleApproveAdmission = (id: string) => {
    const admission = registryStore.admissions.find((a) => a.id === id);
    if (!admission) return;
    const allDocsSubmitted = admission.documents.every((d) => d.submitted);
    if (!allDocsSubmitted) {
      Alert.alert('Cannot Approve', 'All documents must be submitted and verified before approval.');
      return;
    }
    registryStore.updateAdmissionStatus(id, 'Approved', adminName);
    const year = registryStore.admissionFormConfig.academicYear;
    const admNo = generateAdmissionNumber(registryStore.students, year);
    const count = registryStore.students.length;
    const house = autoAssignHouse(count);
    const cls = autoAssignClass(admission.programme, count);
    registryStore.addStudent({
      admNo,
      firstName: admission.applicantName.split(' ')[0] || '',
      lastName: admission.applicantName.split(' ').slice(1).join(' ') || '',
      dateOfBirth: '',
      gender: 'Male',
      programme: admission.programme,
      class: cls,
      house,
      guardianName: admission.parentName,
      guardianPhone: admission.parentPhone,
      guardianAddress: '',
      admissionDate: new Date().toISOString().slice(0, 10),
      status: 'Active',
      photoUrl: admission.photoUrl,
      csspsRef: admission.csspsRef,
    });

    const existingAccount = registryStore.getParentAccountByAdmission(id);
    if (!existingAccount) {
      const username = `parent_${admission.applicantName.toLowerCase().replace(/[^a-z]/g, '').slice(0, 10)}`;
      const password = `parent${Math.floor(100 + Math.random() * 900)}`;
      registryStore.addParentAccount({
        username,
        password,
        parentName: admission.parentName,
        parentPhone: admission.parentPhone,
        parentEmail: admission.parentEmail,
        wardName: admission.applicantName,
        wardAdmNo: admNo,
        wardClass: cls,
        wardHouse: house,
        wardProgramme: admission.programme,
        admissionId: id,
      });
      Alert.alert('Success', `Admission approved. Student enrolled as ${admNo}.\nClass: ${cls}\nHouse: ${house}\n\nParent account created:\nUsername: ${username}\nPassword: ${password}`);
    } else {
      Alert.alert('Success', `Admission approved. Student enrolled as ${admNo}.\nClass: ${cls}\nHouse: ${house}`);
    }
    setShowAdmissionModal(false);
  };

  const handleRejectAdmission = (id: string) => {
    registryStore.expireAdmissionCredentials(id);
    Alert.alert('Admission Rejected', 'The application has been rejected. Credentials have been expired.');
    setShowAdmissionModal(false);
  };

  const handleReviewAdmission = (id: string) => {
    registryStore.updateAdmissionStatus(id, 'Under Review', adminName);
    setShowAdmissionModal(false);
  };

  const handleToggleDoc = (admissionId: string, docType: string) => {
    registryStore.toggleDocument(admissionId, docType as any);
  };

  const handleAddStudent = () => {
    if (!studentForm.firstName.trim() || !studentForm.lastName.trim()) {
      Alert.alert('Error', 'First name and last name are required.');
      return;
    }
    const year = registryStore.admissionFormConfig.academicYear;
    const admNo = generateAdmissionNumber(registryStore.students, year);
    const count = registryStore.students.length;
    const house = autoAssignHouse(count);
    const cls = autoAssignClass(studentForm.programme, count);
    registryStore.addStudent({
      ...studentForm,
      admNo,
      class: cls,
      house,
      photoUrl: studentForm.photoUrl || null,
      csspsRef: studentForm.csspsRef || null,
      admissionDate: new Date().toISOString().slice(0, 10),
      status: 'Active',
    });
    setStudentForm({ firstName: '', lastName: '', dateOfBirth: '', gender: 'Male', programme: 'Science', guardianName: '', guardianPhone: '', guardianAddress: '', photoUrl: null, csspsRef: '' });
    setShowAddStudentModal(false);
    Alert.alert('Success', `Student enrolled as ${admNo}.\nClass: ${cls}\nHouse: ${house}`);
  };

  const generateIDCard = useCallback((student: any) => {
    const now = new Date().toLocaleString('en-GB');
    const photoHtml = student.photoUrl
      ? `<img src="${student.photoUrl}" style="width:90px;height:90px;border-radius:8px;object-fit:cover;" />`
      : `<div style="width:90px;height:90px;border-radius:8px;background:#E4E7EC;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:bold;color:#0F4C75;">${(student.firstName || '?').charAt(0)}</div>`;

    const html = `
      <html><head><meta charset="utf-8">
      <style>
        @page { size: landscape; margin: 0; }
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; display: flex; justify-content: center; }
        .card { width: 340px; height: 220px; border: 2px solid #0F4C75; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; }
        .card-header { background: #0F4C75; color: white; padding: 6px 12px; display: flex; justify-content: space-between; align-items: center; }
        .card-school { font-size: 13px; font-weight: bold; }
        .card-logo { font-size: 10px; opacity: 0.8; }
        .card-body { display: flex; padding: 10px; gap: 12px; flex: 1; }
        .card-photo { flex-shrink: 0; }
        .card-info { flex: 1; font-size: 11px; color: #1A1A2E; }
        .card-info-row { margin-bottom: 3px; }
        .card-info-label { font-size: 9px; color: #5C6370; text-transform: uppercase; }
        .card-info-value { font-size: 12px; font-weight: 600; }
        .card-footer { background: #F0F2F5; padding: 4px 12px; font-size: 8px; color: #5C6370; text-align: center; border-top: 1px solid #E4E7EC; }
        .barcode { font-family: 'Libre Barcode 39', monospace; font-size: 20px; letter-spacing: 2px; }
      </style></head><body>
      <div class="card">
        <div class="card-header">
          <div class="card-school">Ghana Senior High School</div>
          <div class="card-logo">SIMS</div>
        </div>
        <div class="card-body">
          <div class="card-photo">${photoHtml}</div>
          <div class="card-info">
            <div class="card-info-row"><div class="card-info-label">Admission No</div><div class="card-info-value">${student.admNo}</div></div>
            <div class="card-info-row"><div class="card-info-label">Name</div><div class="card-info-value">${student.firstName} ${student.lastName}</div></div>
            <div class="card-info-row"><div class="card-info-label">Programme</div><div class="card-info-value">${student.programme || '—'}</div></div>
            <div class="card-info-row"><div class="card-info-label">Class</div><div class="card-info-value">${student.class}</div></div>
            <div class="card-info-row"><div class="card-info-label">House</div><div class="card-info-value">${student.house}</div></div>
            <div class="card-info-row"><div class="card-info-label">Status</div><div class="card-info-value">${student.status}</div></div>
          </div>
        </div>
        <div class="card-footer">Academic Year ${registryStore.admissionFormConfig.academicYear} | Issued: ${now}</div>
      </div>
      </body></html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    }
  }, [registryStore]);

  const generateAllIDCards = useCallback(() => {
    const students = registryStore.students.filter((s) => s.status === 'Active');
    if (students.length === 0) {
      Alert.alert('No Students', 'There are no active students to generate ID cards for.');
      return;
    }
    const now = new Date().toLocaleString('en-GB');
    const cardsHtml = students.map((student) => {
      const photoHtml = student.photoUrl
        ? `<img src="${student.photoUrl}" style="width:90px;height:90px;border-radius:8px;object-fit:cover;" />`
        : `<div style="width:90px;height:90px;border-radius:8px;background:#E4E7EC;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:bold;color:#0F4C75;">${(student.firstName || '?').charAt(0)}</div>`;
      return `
        <div class="card">
          <div class="card-header">
            <div class="card-school">Ghana Senior High School</div>
            <div class="card-logo">SIMS</div>
          </div>
          <div class="card-body">
            <div class="card-photo">${photoHtml}</div>
            <div class="card-info">
              <div class="card-info-row"><div class="card-info-label">Admission No</div><div class="card-info-value">${student.admNo}</div></div>
              <div class="card-info-row"><div class="card-info-label">Name</div><div class="card-info-value">${student.firstName} ${student.lastName}</div></div>
              <div class="card-info-row"><div class="card-info-label">Programme</div><div class="card-info-value">${student.programme}</div></div>
              <div class="card-info-row"><div class="card-info-label">Class</div><div class="card-info-value">${student.class}</div></div>
              <div class="card-info-row"><div class="card-info-label">House</div><div class="card-info-value">${student.house}</div></div>
              <div class="card-info-row"><div class="card-info-label">Status</div><div class="card-info-value">${student.status}</div></div>
            </div>
          </div>
          <div class="card-footer">Academic Year ${registryStore.admissionFormConfig.academicYear} | Issued: ${now}</div>
        </div>
      `;
    }).join('');

    const html = `
      <html><head><meta charset="utf-8">
      <style>
        @page { size: landscape; margin: 10mm; }
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 10px; }
        .cards-grid { display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; }
        .card { width: 340px; height: 220px; border: 2px solid #0F4C75; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; page-break-inside: avoid; }
        .card-header { background: #0F4C75; color: white; padding: 6px 12px; display: flex; justify-content: space-between; align-items: center; }
        .card-school { font-size: 13px; font-weight: bold; }
        .card-logo { font-size: 10px; opacity: 0.8; }
        .card-body { display: flex; padding: 10px; gap: 12px; flex: 1; }
        .card-photo { flex-shrink: 0; }
        .card-info { flex: 1; font-size: 11px; color: #1A1A2E; }
        .card-info-row { margin-bottom: 3px; }
        .card-info-label { font-size: 9px; color: #5C6370; text-transform: uppercase; }
        .card-info-value { font-size: 12px; font-weight: 600; }
        .card-footer { background: #F0F2F5; padding: 4px 12px; font-size: 8px; color: #5C6370; text-align: center; border-top: 1px solid #E4E7EC; }
      </style></head><body>
      <div class="cards-grid">${cardsHtml}</div>
      </body></html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    }
  }, [registryStore]);

  const handleBulkCSVUpload = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      Alert.alert('Error', 'CSV file must have a header row and at least one data row.');
      return;
    }
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const requiredCols = ['firstname', 'lastname', 'programme'];
    for (const col of requiredCols) {
      if (!headers.includes(col)) {
        Alert.alert('Error', `CSV must include column: ${col}. Expected columns: firstName, lastName, dateOfBirth, gender, programme, guardianName, guardianPhone, guardianAddress, csspsRef`);
        return;
      }
    }
    const newStudents: Omit<any, 'id'>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      if (values.length < 3) continue;
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
      const programme = (row['programme'] || 'Science') as Programme;
      if (!PROGRAMMES.includes(programme)) continue;
      newStudents.push({
        admNo: '',
        firstName: row['firstname'] || '',
        lastName: row['lastname'] || '',
        dateOfBirth: row['dateofbirth'] || '',
        gender: (row['gender'] === 'Female' ? 'Female' : 'Male') as 'Male' | 'Female',
        programme,
        class: '',
        house: '',
        guardianName: row['guardianname'] || '',
        guardianPhone: row['guardianphone'] || '',
        guardianAddress: row['guardianaddress'] || '',
        admissionDate: new Date().toISOString().slice(0, 10),
        status: 'Active' as const,
        photoUrl: null,
        csspsRef: row['csspsref'] || null,
      });
    }
    if (newStudents.length === 0) {
      Alert.alert('Error', 'No valid student records found in CSV.');
      return;
    }
    const added = registryStore.bulkAddStudents(newStudents);
    Alert.alert('Success', `${added} students enrolled via bulk upload.`);
    setShowBulkUploadModal(false);
  };

  const downloadCSVTemplate = () => {
    const csv = 'firstName,lastName,dateOfBirth,gender,programme,guardianName,guardianPhone,guardianAddress,csspsRef\n' +
      'Kwame,Asante,2009-05-14,Male,Science,Mr. Kofi Asante,024-555-1001,Kumasi, CSSPS/2026/0100\n' +
      'Ama,Owusu,2009-03-22,Female,Arts,Mrs. Akosua Owusu,027-555-1002,Accra,CSSPS/2026/0101\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_bulk_upload_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return (
          <ScrollView>
            <Text style={styles.pageTitle}>Administrative Overview</Text>
            <Text style={styles.pageSubtitle}>Real-time snapshot of all school administrative operations</Text>

            <Text style={styles.sectionTitle}>Key Metrics</Text>
            <CardGrid>
              <StatCard label="Total Staff" value={String(totalStaff)} subtitle="On payroll" accentColor={colors.primary} />
              <StatCard label="Active Students" value={String(activeStudents.length)} subtitle="Enrolled" accentColor={colors.info} />
              <StatCard label="Pending Leave" value={String(pendingLeave.length)} subtitle="Awaiting review" accentColor={colors.warning} />
              <StatCard label="Pending Exeats" value={String(pendingExeats.length)} subtitle="Awaiting approval" accentColor={colors.warning} />
            </CardGrid>
            <CardGrid>
              <StatCard label="Pending Requisitions" value={String(pendingRequisitions.length)} subtitle="Cross-departmental" accentColor={colors.warning} />
              <StatCard label="Pending Procurement" value={String(pendingProcurement.length)} subtitle="Awaiting approval" accentColor={colors.warning} />
              <StatCard label="Open Incidents" value={String(openIncidents.length)} subtitle="Security" accentColor={colors.danger} />
              <StatCard label="Open Facilities" value={String(openFacilities.length)} subtitle="Maintenance" accentColor={colors.danger} />
            </CardGrid>
            <CardGrid>
              <StatCard label="Overdue Compliance" value={String(overdueCompliance.length)} subtitle="Past due date" accentColor={colors.danger} />
              <StatCard label="Pending Tasks" value={String(pendingTasks.length)} subtitle="Not started" accentColor={colors.warning} />
              <StatCard label="Scheduled Meetings" value={String(scheduledMeetings.length)} subtitle="Upcoming" accentColor={colors.info} />
              <StatCard label="Pending Admissions" value={String(pendingAdmissions.length)} subtitle="Registry" accentColor={colors.warning} />
            </CardGrid>

            {overdueCompliance.length > 0 && (
              <>
                <Text style={styles.alertTitle}>Urgent Alerts</Text>
                {overdueCompliance.map((c) => (
                  <View key={c.id} style={styles.alertCard}>
                    <Text style={styles.alertText}>OVERDUE: {c.document} — Due {formatDate(c.dueDate)} ({c.authority})</Text>
                  </View>
                ))}
              </>
            )}

            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsRow}>
              <TouchableOpacity style={styles.quickBtn} onPress={() => setActivePage('approvals')}>
                <Text style={styles.quickBtnText}>Review Approvals ({pendingLeave.length + pendingProcurement.length + pendingExeats.length})</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickBtn} onPress={() => setActivePage('compliance')}>
                <Text style={styles.quickBtnText}>Compliance Tracker</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickBtn} onPress={() => setActivePage('tasks')}>
                <Text style={styles.quickBtnText}>Assign Task</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickBtn} onPress={() => generatePDF('Full Administrative Report')}>
                <Text style={styles.quickBtnText}>Generate Full Report</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );

      case 'approvals':
        return (
          <ScrollView>
            <Text style={styles.pageTitle}>Approvals</Text>
            <Text style={styles.pageSubtitle}>Staff leave, procurement, exeat, and requisition approvals</Text>

            <Text style={styles.sectionTitle}>Staff Leave Requests ({pendingLeave.length} pending)</Text>
            {pendingLeave.length === 0 ? (
              <Text style={styles.emptyText}>No pending leave requests.</Text>
            ) : (
              <DataTable
                columns={[
                  { key: 'staffName', label: 'Staff', render: (i: any) => i.staffName },
                  { key: 'type', label: 'Type', render: (i: any) => i.type },
                  { key: 'dates', label: 'Dates', render: (i: any) => `${formatDate(i.startDate)} — ${formatDate(i.endDate)}` },
                  { key: 'reason', label: 'Reason', render: (i: any) => i.reason },
                  { key: 'actions', label: 'Actions', render: (i: any) => (
                    <View style={styles.rowGap}>
                      <TouchableOpacity style={styles.miniApproveBtn} onPress={() => { setSelectedLeaveId(i.id); setShowLeaveModal(true); }}>
                        <Text style={styles.miniApproveBtnText}>Review</Text>
                      </TouchableOpacity>
                    </View>
                  ) },
                ]}
                data={pendingLeave}
              />
            )}

            <Text style={styles.sectionTitle}>Procurement Requests ({pendingProcurement.length} pending)</Text>
            {pendingProcurement.length === 0 ? (
              <Text style={styles.emptyText}>No pending procurement requests.</Text>
            ) : (
              <DataTable
                columns={[
                  { key: 'date', label: 'Date', render: (i: any) => formatDate(i.date) },
                  { key: 'item', label: 'Item', render: (i: any) => i.item },
                  { key: 'department', label: 'Dept', render: (i: any) => i.department },
                  { key: 'estimatedCost', label: 'Est. Cost', render: (i: any) => formatCurrency(i.estimatedCost) },
                  { key: 'actions', label: 'Actions', render: (i: any) => (
                    <TouchableOpacity style={styles.miniApproveBtn} onPress={() => { setSelectedProcurementId(i.id); setShowProcurementModal(true); }}>
                      <Text style={styles.miniApproveBtnText}>Review</Text>
                    </TouchableOpacity>
                  ) },
                ]}
                data={pendingProcurement}
              />
            )}

            <Text style={styles.sectionTitle}>Exeat Approvals ({pendingExeats.length} pending)</Text>
            {pendingExeats.length === 0 ? (
              <Text style={styles.emptyText}>No pending exeat requests.</Text>
            ) : (
              <DataTable
                columns={[
                  { key: 'exeatNo', label: 'Exeat No', render: (i: any) => i.exeatNo },
                  { key: 'studentName', label: 'Student', render: (i: any) => i.studentName },
                  { key: 'reason', label: 'Reason', render: (i: any) => i.reason },
                  { key: 'departureDate', label: 'Departure', render: (i: any) => formatDate(i.departureDate) },
                  { key: 'actions', label: 'Actions', render: (i: any) => (
                    <TouchableOpacity style={styles.miniApproveBtn} onPress={() => { setSelectedExeatId(i.id); setShowExeatModal(true); }}>
                      <Text style={styles.miniApproveBtnText}>Review</Text>
                    </TouchableOpacity>
                  ) },
                ]}
                data={pendingExeats}
              />
            )}

            <Text style={styles.sectionTitle}>Cross-Departmental Requisitions ({pendingRequisitions.length} pending)</Text>
            {pendingRequisitions.length === 0 ? (
              <Text style={styles.emptyText}>No pending requisitions.</Text>
            ) : (
              <DataTable
                columns={[
                  { key: 'date', label: 'Date', render: (i: any) => formatDate(i.date) },
                  { key: 'itemName', label: 'Item', render: (i: any) => i.itemName },
                  { key: 'department', label: 'Dept', render: (i: any) => i.department },
                  { key: 'quantity', label: 'Qty', render: (i: any) => `${i.quantity} ${i.unit}` },
                  { key: 'priority', label: 'Priority', render: (i: any) => i.priority },
                  { key: 'status', label: 'Status', render: (i: any) => (
                    <Text style={[styles.statusText, { color: statusColor(i.status) }]}>{i.status}</Text>
                  ) },
                ]}
                data={pendingRequisitions}
              />
            )}
          </ScrollView>
        );

      case 'compliance':
        return (
          <ScrollView>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.pageTitle}>Compliance Tracker</Text>
                <Text style={styles.pageSubtitle}>GES/regulatory documentation deadlines</Text>
              </View>
              <TouchableOpacity style={styles.addBtn} onPress={() => { setComplianceForm({ document: '', authority: '', dueDate: '', notes: '' }); setShowComplianceModal(true); }}>
                <Text style={styles.addBtnText}>+ Add Item</Text>
              </TouchableOpacity>
            </View>

            <DataTable
              columns={[
                { key: 'document', label: 'Document', render: (i: any) => i.document },
                { key: 'authority', label: 'Authority', render: (i: any) => i.authority },
                { key: 'dueDate', label: 'Due Date', render: (i: any) => formatDate(i.dueDate) },
                { key: 'status', label: 'Status', render: (i: any) => (
                  <Text style={[styles.statusText, { color: statusColor(i.status) }]}>{i.status}</Text>
                ) },
                { key: 'actions', label: 'Actions', render: (i: any) => (
                  <TouchableOpacity style={styles.miniBtn} onPress={() => { setSelectedComplianceId(i.id); setShowComplianceModal(true); }}>
                    <Text style={styles.miniBtnText}>Update</Text>
                  </TouchableOpacity>
                ) },
              ]}
              data={adminStore.compliance}
            />

            <TouchableOpacity style={styles.pdfFullBtn} onPress={() => generatePDF('Compliance Status Report')}>
              <Text style={styles.pdfFullBtnText}>Generate Compliance Report (PDF)</Text>
            </TouchableOpacity>
          </ScrollView>
        );

      case 'admissions':
        return (
          <ScrollView>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.pageTitle}>Student Admissions</Text>
                <Text style={styles.pageSubtitle}>Manage admission applications and enroll new students</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <TouchableOpacity style={styles.addBtn} onPress={() => { setStudentForm({ firstName: '', lastName: '', dateOfBirth: '', gender: 'Male', programme: 'Science', guardianName: '', guardianPhone: '', guardianAddress: '', photoUrl: null, csspsRef: '' }); setShowAddStudentModal(true); }}>
                  <Text style={styles.addBtnText}>+ Enroll Student</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addBtn} onPress={() => { setCsvText(''); setShowBulkUploadModal(true); }}>
                  <Text style={styles.addBtnText}>+ Bulk Upload</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Admission Statistics</Text>
            <CardGrid>
              <StatCard label="Total Applications" value={String(registryStore.admissions.length)} subtitle="All time" accentColor={colors.primary} />
              <StatCard label="Pending Review" value={String(pendingAdmissions.length)} subtitle="Received / Under Review" accentColor={colors.warning} />
              <StatCard label="Approved" value={String(registryStore.admissions.filter((a) => a.status === 'Approved').length)} subtitle="Enrolled" accentColor={colors.success} />
              <StatCard label="Active Students" value={String(activeStudents.length)} subtitle="Currently enrolled" accentColor={colors.info} />
            </CardGrid>

            <Text style={styles.sectionTitle}>Admission Applications</Text>
            <DataTable
              columns={[
                { key: 'applicantName', label: 'Applicant', render: (i: any) => i.applicantName },
                { key: 'programme', label: 'Programme', render: (i: any) => i.programme || '—' },
                { key: 'parentName', label: 'Parent/Guardian', render: (i: any) => i.parentName },
                { key: 'dateApplied', label: 'Date', render: (i: any) => formatDate(i.dateApplied) },
                { key: 'status', label: 'Status', render: (i: any) => (
                  <Text style={[styles.statusText, { color: statusColor(i.status) }]}>{i.status}</Text>
                ) },
                { key: 'actions', label: 'Actions', render: (i: any) => (
                  <TouchableOpacity style={styles.miniApproveBtn} onPress={() => { setSelectedAdmissionId(i.id); setShowAdmissionModal(true); }}>
                    <Text style={styles.miniApproveBtnText}>Review</Text>
                  </TouchableOpacity>
                ) },
              ]}
              data={registryStore.admissions}
            />

            <Text style={styles.sectionTitle}>CSSPS Placements</Text>
            <DataTable
              columns={[
                { key: 'fullName', label: 'Student Name', render: (i: any) => i.fullName },
                { key: 'csspsRef', label: 'CSSPS Ref', render: (i: any) => i.csspsRef },
                { key: 'intendedClass', label: 'Intended Class', render: (i: any) => i.intendedClass },
                { key: 'matched', label: 'Matched', render: (i: any) => (
                  <Text style={[styles.statusText, { color: i.matched ? colors.success : colors.warning }]}>{i.matched ? 'Yes' : 'No'}</Text>
                ) },
                { key: 'actions', label: 'Actions', render: (i: any) => (
                  !i.matched ? (
                    <TouchableOpacity style={styles.miniApproveBtn} onPress={() => { registryStore.matchPlacement(i.id); Alert.alert('Success', 'Placement matched.'); }}>
                      <Text style={styles.miniApproveBtnText}>Match</Text>
                    </TouchableOpacity>
                  ) : <Text style={styles.statusText}>—</Text>
                ) },
              ]}
              data={registryStore.placements}
            />

            <Text style={styles.sectionTitle}>Recently Enrolled Students</Text>
            <DataTable
              columns={[
                { key: 'admNo', label: 'Adm No', render: (i: any) => i.admNo },
                { key: 'name', label: 'Name', render: (i: any) => `${i.firstName} ${i.lastName}` },
                { key: 'programme', label: 'Programme', render: (i: any) => i.programme || '—' },
                { key: 'class', label: 'Class', render: (i: any) => i.class },
                { key: 'house', label: 'House', render: (i: any) => i.house },
                { key: 'status', label: 'Status', render: (i: any) => (
                  <Text style={[styles.statusText, { color: i.status === 'Active' ? colors.success : colors.textSecondary }]}>{i.status}</Text>
                ) },
              ]}
              data={activeStudents.slice(0, 10)}
            />

            <TouchableOpacity style={styles.pdfFullBtn} onPress={() => generatePDF('Admissions Report')}>
              <Text style={styles.pdfFullBtnText}>Generate Admissions Report (PDF)</Text>
            </TouchableOpacity>
          </ScrollView>
        );

      case 'cssps-upload':
        return (
          <ScrollView>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.pageTitle}>CSSPS Placement Upload</Text>
                <Text style={styles.pageSubtitle}>Pre-load CSSPS placement records for admission matching</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <TouchableOpacity style={styles.addBtn} onPress={() => { setPlacementForm({ fullName: '', csspsRef: '', intendedClass: 'SHS1 Sci A', programme: 'Science' }); setShowPlacementModal(true); }}>
                  <Text style={styles.addBtnText}>+ Add Placement</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addBtn} onPress={() => { setPlacementCsvText(''); setShowBulkPlacementModal(true); }}>
                  <Text style={styles.addBtnText}>+ Bulk Upload CSV</Text>
                </TouchableOpacity>
              </View>
            </View>

            <CardGrid>
              <StatCard label="Total Placements" value={String(registryStore.placements.length)} accentColor={colors.primary} />
              <StatCard label="Matched" value={String(registryStore.placements.filter((p) => p.matched).length)} accentColor={colors.success} />
              <StatCard label="Unmatched" value={String(registryStore.placements.filter((p) => !p.matched).length)} accentColor={colors.warning} />
            </CardGrid>

            <Text style={styles.sectionTitle}>Placement Records</Text>
            <DataTable
              columns={[
                { key: 'fullName', label: 'Student Name', render: (i: any) => i.fullName },
                { key: 'csspsRef', label: 'CSSPS Ref', render: (i: any) => i.csspsRef },
                { key: 'programme', label: 'Programme', render: (i: any) => i.programme },
                { key: 'intendedClass', label: 'Intended Class', render: (i: any) => i.intendedClass },
                { key: 'datePreloaded', label: 'Date Loaded', render: (i: any) => formatDate(i.datePreloaded) },
                { key: 'matched', label: 'Matched', render: (i: any) => (
                  <Text style={[styles.statusText, { color: i.matched ? colors.success : colors.warning }]}>{i.matched ? 'Yes' : 'No'}</Text>
                ) },
                { key: 'actions', label: 'Actions', render: (i: any) => (
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {!i.matched && (
                      <TouchableOpacity style={styles.miniApproveBtn} onPress={() => { registryStore.matchPlacement(i.id); Alert.alert('Success', 'Placement marked as matched.'); }}>
                        <Text style={styles.miniApproveBtnText}>Match</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.miniCancelBtn} onPress={() => { registryStore.deletePlacement(i.id); Alert.alert('Deleted', 'Placement record removed.'); }}>
                      <Text style={styles.miniApproveBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                ) },
              ]}
              data={registryStore.placements}
            />
          </ScrollView>
        );

      case 'prospectus':
        return (
          <ScrollView>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.pageTitle}>Prospectus Publishing</Text>
                <Text style={styles.pageSubtitle}>Publish prospectus for admitted students</Text>
              </View>
              <TouchableOpacity style={styles.addBtn} onPress={() => { setProspectusForm({ title: '', academicYear: registryStore.admissionFormConfig.academicYear, content: '', targetedAdmissionIds: '' }); setShowProspectusModal(true); }}>
                <Text style={styles.addBtnText}>+ Publish Prospectus</Text>
              </TouchableOpacity>
            </View>

            <CardGrid>
              <StatCard label="Published Prospectus" value={String(registryStore.prospectus.length)} accentColor={colors.primary} />
              <StatCard label="Approved Admissions" value={String(registryStore.admissions.filter((a) => a.status === 'Approved').length)} accentColor={colors.success} />
              <StatCard label="Parent Accounts" value={String(registryStore.parentAccounts.length)} accentColor={colors.info} />
            </CardGrid>

            <Text style={styles.sectionTitle}>Approved Admissions (Eligible for Prospectus)</Text>
            <DataTable
              columns={[
                { key: 'applicantName', label: 'Applicant', render: (i: any) => i.applicantName },
                { key: 'programme', label: 'Programme', render: (i: any) => i.programme },
                { key: 'parentName', label: 'Parent', render: (i: any) => i.parentName },
                { key: 'parentPhone', label: 'Phone', render: (i: any) => i.parentPhone },
                { key: 'parentAccount', label: 'Parent Account', render: (i: any) => {
                  const acct = registryStore.getParentAccountByAdmission(i.id);
                  return <Text style={[styles.statusText, { color: acct ? colors.success : colors.warning }]}>{acct ? `✓ ${acct.username}` : 'Not created'}</Text>;
                } },
              ]}
              data={registryStore.admissions.filter((a) => a.status === 'Approved')}
            />

            <Text style={styles.sectionTitle}>Published Prospectus</Text>
            {registryStore.prospectus.length === 0 ? (
              <Text style={styles.emptyText}>No prospectus published yet.</Text>
            ) : (
              registryStore.prospectus.map((p) => (
                <View key={p.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{p.title}</Text>
                  <Text style={styles.cardMeta}>Academic Year: {p.academicYear}</Text>
                  <Text style={styles.cardMeta}>Published by: {p.publishedBy} on {formatDate(p.datePublished)}</Text>
                  <Text style={styles.cardMeta}>Targeted: {p.targetedAdmissionIds.length} admission(s)</Text>
                  <Text style={styles.cardBody} numberOfLines={3}>{p.content}</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                    <TouchableOpacity style={styles.miniApproveBtn} onPress={() => {
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(`<html><head><meta charset='utf-8'><style>body{font-family:Arial,sans-serif;margin:40px;color:#1A1A2E;}h1{color:#0F4C75;border-bottom:2px solid #0F4C75;padding-bottom:8px;}pre{white-space:pre-wrap;font-size:14px;line-height:1.6;}</style></head><body><h1>${p.title}</h1><p style='color:#5C6370;font-size:12px;'>Academic Year: ${p.academicYear} | Published: ${p.datePublished}</p><pre>${p.content}</pre></body></html>`);
                        printWindow.document.close();
                        printWindow.focus();
                        setTimeout(() => printWindow.print(), 500);
                      }
                    }}>
                      <Text style={styles.miniApproveBtnText}>Print</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.miniCancelBtn} onPress={() => { registryStore.deleteProspectus(p.id); Alert.alert('Deleted', 'Prospectus removed.'); }}>
                      <Text style={styles.miniApproveBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        );

      case 'admissions-config':
        return (
          <ScrollView>
            <Text style={styles.pageTitle}>Admission Form Configuration</Text>
            <Text style={styles.pageSubtitle}>Configure the fields and documents required for admission applications</Text>

            <Text style={styles.sectionTitle}>Academic Year</Text>
            <TextInput
              style={styles.textInput}
              value={registryStore.admissionFormConfig.academicYear}
              onChangeText={(v) => registryStore.updateAdmissionFormConfig({ ...registryStore.admissionFormConfig, academicYear: v })}
              placeholder="e.g. 2026/2027"
            />

            <Text style={styles.sectionTitle}>Photo Requirement</Text>
            <TouchableOpacity
              style={[styles.pickerChip, registryStore.admissionFormConfig.photoRequired && styles.pickerChipActive]}
              onPress={() => registryStore.updateAdmissionFormConfig({ ...registryStore.admissionFormConfig, photoRequired: !registryStore.admissionFormConfig.photoRequired })}
            >
              <Text style={[styles.pickerChipText, registryStore.admissionFormConfig.photoRequired && styles.pickerChipTextActive]}>
                {registryStore.admissionFormConfig.photoRequired ? 'Photo Required' : 'Photo Optional'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Form Fields</Text>
            {registryStore.admissionFormConfig.fields.map((field) => (
              <View key={field.id} style={styles.configRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.configLabel}>{field.label}</Text>
                  <Text style={styles.configSub}>Type: {field.type} | {field.required ? 'Required' : 'Optional'}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.pickerChip, field.enabled && styles.pickerChipActive]}
                  onPress={() => registryStore.toggleFormField(field.id)}
                >
                  <Text style={[styles.pickerChipText, field.enabled && styles.pickerChipTextActive]}>
                    {field.enabled ? 'Enabled' : 'Disabled'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Required Documents</Text>
            {DOCUMENT_CHECKLIST.map((doc) => {
              const isRequired = registryStore.admissionFormConfig.requiredDocuments.includes(doc);
              return (
                <View key={doc} style={styles.configRow}>
                  <Text style={styles.configLabel}>{doc}</Text>
                  <TouchableOpacity
                    style={[styles.pickerChip, isRequired && styles.pickerChipActive]}
                    onPress={() => registryStore.toggleRequiredDoc(doc)}
                  >
                    <Text style={[styles.pickerChipText, isRequired && styles.pickerChipTextActive]}>
                      {isRequired ? 'Required' : 'Not Required'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            <Text style={styles.sectionTitle}>Auto-Assignment Rules</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>• Admission numbers are auto-generated based on academic year (e.g. 2026/001)</Text>
              <Text style={styles.infoText}>• Houses are auto-assigned in round-robin: Aggrey → Mensah → Sarbah → Barton</Text>
              <Text style={styles.infoText}>• Classes are auto-assigned based on programme:</Text>
              <Text style={styles.infoText}>  - Science → SHS1 Sci A / SHS1 Sci B</Text>
              <Text style={styles.infoText}>  - Arts → SHS1 Arts A / SHS1 Arts B</Text>
              <Text style={styles.infoText}>  - Business → SHS1 Bus A</Text>
              <Text style={styles.infoText}>• Admission can proceed without a student photo</Text>
            </View>
          </ScrollView>
        );

      case 'scratch-cards':
        return (
          <ScrollView>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.pageTitle}>Scratch Card Management</Text>
                <Text style={styles.pageSubtitle}>Generate scratch cards for parents to pay application fees</Text>
              </View>
              <TouchableOpacity style={styles.addBtn} onPress={() => { setScratchCardCount('10'); setScratchCardAmount(String(registryStore.applicationFeeAmount)); setLastGeneratedCards([]); setShowScratchCardModal(true); }}>
                <Text style={styles.addBtnText}>+ Generate Cards</Text>
              </TouchableOpacity>
            </View>

            <CardGrid>
              <StatCard label="Total Cards" value={String(registryStore.scratchCards.length)} accentColor={colors.primary} />
              <StatCard label="Available" value={String(registryStore.scratchCards.filter((c) => !c.used).length)} accentColor={colors.success} />
              <StatCard label="Used" value={String(registryStore.scratchCards.filter((c) => c.used).length)} accentColor={colors.warning} />
            </CardGrid>

            <Text style={styles.sectionTitle}>Application Fee Amount</Text>
            <View style={styles.rowBetween}>
              <Text style={styles.infoText}>Current fee: GH₵{registryStore.applicationFeeAmount}</Text>
              <TouchableOpacity style={styles.miniBtn} onPress={() => {
                const newAmt = registryStore.applicationFeeAmount === 50 ? 100 : registryStore.applicationFeeAmount === 100 ? 150 : 50;
                registryStore.setApplicationFeeAmount(newAmt);
              }}>
                <Text style={styles.miniBtnText}>Change Fee</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Scratch Cards</Text>
            <DataTable
              columns={[
                { key: 'serial', label: 'Serial', render: (c: any) => c.serial },
                { key: 'pin', label: 'PIN', render: (c: any) => c.pin },
                { key: 'amount', label: 'Amount', render: (c: any) => `GH₵${c.amount}` },
                { key: 'status', label: 'Status', render: (c: any) => <Text style={[styles.statusText, { color: c.used ? colors.warning : colors.success }]}>{c.used ? 'Used' : 'Available'}</Text> },
                { key: 'usedBy', label: 'Used By', render: (c: any) => c.usedBy || '—' },
                { key: 'generated', label: 'Generated', render: (c: any) => c.generatedAt },
              ]}
              data={registryStore.scratchCards}
            />
          </ScrollView>
        );

      case 'id-cards':
        return (
          <ScrollView>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.pageTitle}>Student ID Cards</Text>
                <Text style={styles.pageSubtitle}>Generate and print ID cards for enrolled students</Text>
              </View>
              <TouchableOpacity style={styles.addBtn} onPress={generateAllIDCards}>
                <Text style={styles.addBtnText}>Print All ID Cards</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Active Students ({activeStudents.length})</Text>
            <DataTable
              columns={[
                { key: 'admNo', label: 'Adm No', render: (i: any) => i.admNo },
                { key: 'name', label: 'Name', render: (i: any) => `${i.firstName} ${i.lastName}` },
                { key: 'programme', label: 'Programme', render: (i: any) => i.programme || '—' },
                { key: 'class', label: 'Class', render: (i: any) => i.class },
                { key: 'house', label: 'House', render: (i: any) => i.house },
                { key: 'photo', label: 'Photo', render: (i: any) => (
                  <Text style={[styles.statusText, { color: i.photoUrl ? colors.success : colors.warning }]}>
                    {i.photoUrl ? 'Yes' : 'No'}
                  </Text>
                ) },
                { key: 'actions', label: 'Actions', render: (i: any) => (
                  <TouchableOpacity style={styles.miniApproveBtn} onPress={() => generateIDCard(i)}>
                    <Text style={styles.miniApproveBtnText}>Print ID Card</Text>
                  </TouchableOpacity>
                ) },
              ]}
              data={activeStudents}
            />
          </ScrollView>
        );

      case 'staff':
        return (
          <ScrollView>
            <Text style={styles.pageTitle}>Staff Management</Text>
            <Text style={styles.pageSubtitle}>Directory, leave requests, and staff resources</Text>

            <Text style={styles.sectionTitle}>Staff Directory ({totalStaff})</Text>
            <DataTable
              columns={[
                { key: 'name', label: 'Name', render: (i: any) => i.name },
                { key: 'role', label: 'Role', render: (i: any) => i.role },
                { key: 'position', label: 'Position', render: (i: any) => i.position },
                { key: 'department', label: 'Dept', render: (i: any) => i.department },
                { key: 'phone', label: 'Phone', render: (i: any) => i.phone },
                { key: 'status', label: 'Status', render: (i: any) => (
                  <Text style={[styles.statusText, { color: i.status === 'Active' ? colors.success : i.status === 'On Leave' ? colors.warning : colors.textLight }]}>{i.status}</Text>
                ) },
              ]}
              data={staffStore.directory}
            />

            <Text style={styles.sectionTitle}>All Leave Requests</Text>
            <DataTable
              columns={[
                { key: 'staffName', label: 'Staff', render: (i: any) => i.staffName },
                { key: 'type', label: 'Type', render: (i: any) => i.type },
                { key: 'dates', label: 'Dates', render: (i: any) => `${formatDate(i.startDate)} — ${formatDate(i.endDate)}` },
                { key: 'status', label: 'Status', render: (i: any) => (
                  <Text style={[styles.statusText, { color: statusColor(i.status) }]}>{i.status}</Text>
                ) },
                { key: 'reviewedBy', label: 'Reviewed By', render: (i: any) => i.reviewedBy ?? '—' },
              ]}
              data={staffStore.leaveRequests}
            />

            <Text style={styles.sectionTitle}>Staff Notices</Text>
            {staffStore.notices.map((n) => (
              <View key={n.id} style={styles.noticeCard}>
                <View style={styles.rowBetween}>
                  <Text style={styles.noticeTitle}>{n.title}</Text>
                  <Text style={[styles.priorityBadge, { color: n.priority === 'Urgent' ? colors.danger : n.priority === 'Important' ? colors.warning : colors.textSecondary }]}>{n.priority}</Text>
                </View>
                <Text style={styles.noticeBody}>{n.body}</Text>
                <Text style={styles.noticeMeta}>Posted by {n.postedBy} • {formatDate(n.date)}</Text>
              </View>
            ))}

            <TouchableOpacity style={styles.pdfFullBtn} onPress={() => generatePDF('Staff Summary')}>
              <Text style={styles.pdfFullBtnText}>Generate Staff Report (PDF)</Text>
            </TouchableOpacity>
          </ScrollView>
        );

      case 'facilities':
        return (
          <ScrollView>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.pageTitle}>Facilities Management</Text>
                <Text style={styles.pageSubtitle}>Maintenance issues and facility tracking</Text>
              </View>
              <TouchableOpacity style={styles.addBtn} onPress={() => { setFacilityForm({ title: '', location: '', category: 'Electrical', priority: 'Medium', description: '', assignedTo: '', reportedBy: '' }); setShowFacilityModal(true); }}>
                <Text style={styles.addBtnText}>+ Report Issue</Text>
              </TouchableOpacity>
            </View>

            <CardGrid>
              <StatCard label="Total Issues" value={String(adminStore.facilities.length)} accentColor={colors.primary} />
              <StatCard label="Open" value={String(openFacilities.length)} accentColor={colors.warning} />
              <StatCard label="Critical" value={String(adminStore.facilities.filter((f) => f.priority === 'Critical').length)} accentColor={colors.danger} />
              <StatCard label="Resolved" value={String(adminStore.facilities.filter((f) => f.status === 'Resolved').length)} accentColor={colors.success} />
            </CardGrid>

            <DataTable
              columns={[
                { key: 'title', label: 'Title', render: (i: any) => i.title },
                { key: 'location', label: 'Location', render: (i: any) => i.location },
                { key: 'category', label: 'Category', render: (i: any) => i.category },
                { key: 'priority', label: 'Priority', render: (i: any) => (
                  <Text style={[styles.statusText, { color: i.priority === 'Critical' ? colors.danger : i.priority === 'High' ? colors.warning : colors.textSecondary }]}>{i.priority}</Text>
                ) },
                { key: 'status', label: 'Status', render: (i: any) => (
                  <Text style={[styles.statusText, { color: statusColor(i.status) }]}>{i.status}</Text>
                ) },
                { key: 'actions', label: 'Actions', render: (i: any) => (
                  <TouchableOpacity style={styles.miniBtn} onPress={() => { setSelectedFacilityId(i.id); setShowFacilityModal(true); }}>
                    <Text style={styles.miniBtnText}>Update</Text>
                  </TouchableOpacity>
                ) },
              ]}
              data={adminStore.facilities}
            />

            <TouchableOpacity style={styles.pdfFullBtn} onPress={() => generatePDF('Facility Report')}>
              <Text style={styles.pdfFullBtnText}>Generate Facility Report (PDF)</Text>
            </TouchableOpacity>
          </ScrollView>
        );

      case 'meetings':
        return (
          <ScrollView>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.pageTitle}>Meetings</Text>
                <Text style={styles.pageSubtitle}>Schedule and record administrative meetings</Text>
              </View>
              <TouchableOpacity style={styles.addBtn} onPress={() => { setMeetingForm({ title: '', date: '', time: '', location: '', facilitator: '', agenda: '' }); setShowMeetingModal(true); }}>
                <Text style={styles.addBtnText}>+ Schedule Meeting</Text>
              </TouchableOpacity>
            </View>

            <CardGrid>
              <StatCard label="Scheduled" value={String(scheduledMeetings.length)} accentColor={colors.info} />
              <StatCard label="Completed" value={String(adminStore.meetings.filter((m) => m.status === 'Completed').length)} accentColor={colors.success} />
              <StatCard label="Cancelled" value={String(adminStore.meetings.filter((m) => m.status === 'Cancelled').length)} accentColor={colors.danger} />
            </CardGrid>

            {adminStore.meetings.map((m) => (
              <View key={m.id} style={styles.meetingCard}>
                <View style={styles.rowBetween}>
                  <Text style={styles.meetingTitle}>{m.title}</Text>
                  <Text style={[styles.statusText, { color: statusColor(m.status) }]}>{m.status}</Text>
                </View>
                <Text style={styles.meetingMeta}>{formatDate(m.date)} at {m.time} • {m.location}</Text>
                <Text style={styles.meetingMeta}>Facilitator: {m.facilitator}</Text>
                {m.agenda ? <Text style={styles.meetingAgenda}>Agenda: {m.agenda}</Text> : null}
                {m.status === 'Completed' && m.minutes ? (
                  <View style={styles.minutesBox}>
                    <Text style={styles.minutesLabel}>Minutes:</Text>
                    <Text style={styles.minutesText}>{m.minutes}</Text>
                    {m.keyDecisions ? <Text style={styles.minutesText}>Decisions: {m.keyDecisions}</Text> : null}
                    {m.actionItems ? <Text style={styles.minutesText}>Actions: {m.actionItems}</Text> : null}
                  </View>
                ) : null}
                {m.status === 'Scheduled' && (
                  <View style={styles.meetingActions}>
                    <TouchableOpacity style={styles.miniApproveBtn} onPress={() => { setSelectedMeetingId(m.id); setMeetingMinutesForm({ minutes: '', keyDecisions: '', actionItems: '', attendees: '0' }); setShowMeetingDetail(true); }}>
                      <Text style={styles.miniBtnText}>Record Minutes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.miniRejectBtn} onPress={() => adminStore.cancelMeeting(m.id)}>
                      <Text style={styles.miniBtnTextDanger}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        );

      case 'tasks':
        return (
          <ScrollView>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.pageTitle}>Task Assignments</Text>
                <Text style={styles.pageSubtitle}>Delegate and track administrative tasks across departments</Text>
              </View>
              <TouchableOpacity style={styles.addBtn} onPress={() => { setTaskForm({ title: '', description: '', assignedTo: '', department: '', dueDate: '', priority: 'Normal', notes: '' }); setShowTaskModal(true); }}>
                <Text style={styles.addBtnText}>+ Assign Task</Text>
              </TouchableOpacity>
            </View>

            <CardGrid>
              <StatCard label="Total Tasks" value={String(adminStore.tasks.length)} accentColor={colors.primary} />
              <StatCard label="Pending" value={String(pendingTasks.length)} accentColor={colors.warning} />
              <StatCard label="In Progress" value={String(adminStore.tasks.filter((t) => t.status === 'In Progress').length)} accentColor={colors.info} />
              <StatCard label="Completed" value={String(adminStore.tasks.filter((t) => t.status === 'Completed').length)} accentColor={colors.success} />
            </CardGrid>

            <DataTable
              columns={[
                { key: 'title', label: 'Task', render: (i: any) => i.title },
                { key: 'assignedTo', label: 'Assigned To', render: (i: any) => i.assignedTo },
                { key: 'department', label: 'Dept', render: (i: any) => i.department },
                { key: 'dueDate', label: 'Due Date', render: (i: any) => formatDate(i.dueDate) },
                { key: 'priority', label: 'Priority', render: (i: any) => (
                  <Text style={[styles.statusText, { color: i.priority === 'Urgent' ? colors.danger : i.priority === 'High' ? colors.warning : colors.textSecondary }]}>{i.priority}</Text>
                ) },
                { key: 'status', label: 'Status', render: (i: any) => (
                  <Text style={[styles.statusText, { color: statusColor(i.status) }]}>{i.status}</Text>
                ) },
                { key: 'actions', label: 'Actions', render: (i: any) => (
                  <View style={styles.rowGap}>
                    {i.status !== 'Completed' && (
                      <TouchableOpacity style={styles.miniApproveBtn} onPress={() => adminStore.updateTaskStatus(i.id, i.status === 'Pending' ? 'In Progress' : 'Completed')}>
                        <Text style={styles.miniBtnText}>{i.status === 'Pending' ? 'Start' : 'Complete'}</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.miniRejectBtn} onPress={() => adminStore.deleteTask(i.id)}>
                      <Text style={styles.miniBtnTextDanger}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                ) },
              ]}
              data={adminStore.tasks}
            />

            <TouchableOpacity style={styles.pdfFullBtn} onPress={() => generatePDF('Task Assignment Report')}>
              <Text style={styles.pdfFullBtnText}>Generate Task Report (PDF)</Text>
            </TouchableOpacity>
          </ScrollView>
        );

      case 'communication':
        return (
          <ScrollView>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.pageTitle}>Communication</Text>
                <Text style={styles.pageSubtitle}>Broadcast announcements to staff, students, and parents</Text>
              </View>
              <TouchableOpacity style={styles.addBtn} onPress={() => { setAnnouncementForm({ title: '', body: '', priority: 'Normal', audience: 'All Staff' }); setShowAnnouncementModal(true); }}>
                <Text style={styles.addBtnText}>+ New Announcement</Text>
              </TouchableOpacity>
            </View>

            {adminStore.announcements.length === 0 ? (
              <Text style={styles.emptyText}>No announcements posted.</Text>
            ) : (
              adminStore.announcements.map((a) => (
                <View key={a.id} style={styles.noticeCard}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.noticeTitle}>{a.title}</Text>
                    <Text style={[styles.priorityBadge, { color: a.priority === 'Urgent' ? colors.danger : a.priority === 'Important' ? colors.warning : colors.textSecondary }]}>{a.priority}</Text>
                  </View>
                  <Text style={styles.noticeBody}>{a.body}</Text>
                  <View style={styles.rowBetween}>
                    <Text style={styles.noticeMeta}>Posted by {a.postedBy} • {formatDate(a.date)}</Text>
                    <TouchableOpacity onPress={() => adminStore.deleteAnnouncement(a.id)}>
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.audienceBadge}>
                    <Text style={styles.audienceText}>Audience: {a.audience}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        );

      case 'reports':
        return (
          <ScrollView>
            <Text style={styles.pageTitle}>Reports</Text>
            <Text style={styles.pageSubtitle}>Generate administrative reports as PDF</Text>

            <Text style={styles.sectionTitle}>Available Reports</Text>
            {[
              { label: 'Full Administrative Report', desc: 'Complete overview of all administrative operations' },
              { label: 'Staff Summary', desc: 'Staff directory, leave requests, and statistics' },
              { label: 'Procurement Report', desc: 'Procurement, requisitions, petty cash, and imprest' },
              { label: 'Compliance Status Report', desc: 'All compliance items with deadlines and status' },
              { label: 'Security Summary', desc: 'Incidents, gate logs, and security statistics' },
              { label: 'Facility Report', desc: 'All facility issues and maintenance status' },
              { label: 'Exeat Report', desc: 'Student exeat records and statistics' },
              { label: 'Task Assignment Report', desc: 'All task assignments and completion status' },
              { label: 'Admissions Report', desc: 'Admission applications, placements, and enrolled students' },
            ].map((r) => (
              <TouchableOpacity key={r.label} style={styles.reportCard} onPress={() => generatePDF(r.label)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reportTitle}>{r.label}</Text>
                  <Text style={styles.reportDesc}>{r.desc}</Text>
                </View>
                <Text style={styles.reportAction}>Generate PDF</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        );

      default:
        return null;
    }
  };

  // ── Modals ──
  const selectedLeave = staffStore.leaveRequests.find((r) => r.id === selectedLeaveId);
  const selectedProcurement = bursarStore.procurement.find((p) => p.id === selectedProcurementId);
  const selectedExeat = exeatStore.exeats.find((e) => e.id === selectedExeatId);
  const selectedCompliance = adminStore.compliance.find((c) => c.id === selectedComplianceId);
  const selectedFacility = adminStore.facilities.find((f) => f.id === selectedFacilityId);
  const selectedMeeting = adminStore.meetings.find((m) => m.id === selectedMeetingId);
  const selectedAdmission = registryStore.admissions.find((a) => a.id === selectedAdmissionId);

  return (
    <DashboardLayout
      title="Asst. Headmaster (Administration)"
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

      {/* Leave Review Modal */}
      <Modal visible={showLeaveModal} transparent animationType="fade" onRequestClose={() => setShowLeaveModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Review Leave Request</Text>
            {selectedLeave && (
              <>
                <Text style={styles.modalInfo}>Staff: {selectedLeave.staffName} ({selectedLeave.staffRole})</Text>
                <Text style={styles.modalInfo}>Type: {selectedLeave.type}</Text>
                <Text style={styles.modalInfo}>Dates: {formatDate(selectedLeave.startDate)} — {formatDate(selectedLeave.endDate)}</Text>
                <Text style={styles.modalInfo}>Reason: {selectedLeave.reason}</Text>
                <Text style={styles.inputLabel}>Review Notes</Text>
                <TextInput style={styles.textArea} value={reviewNotes} onChangeText={setReviewNotes} placeholder="Enter review notes..." multiline numberOfLines={3} />
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalApproveBtn} onPress={() => selectedLeave && handleLeaveReview(selectedLeave.id, 'Approved')}>
                    <Text style={styles.modalBtnTextWhite}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalRejectBtn} onPress={() => selectedLeave && handleLeaveReview(selectedLeave.id, 'Rejected')}>
                    <Text style={styles.modalBtnTextDanger}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowLeaveModal(false)}>
                    <Text style={styles.modalBtnTextSecondary}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Procurement Review Modal */}
      <Modal visible={showProcurementModal} transparent animationType="fade" onRequestClose={() => setShowProcurementModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Review Procurement Request</Text>
            {selectedProcurement && (
              <>
                <Text style={styles.modalInfo}>Item: {selectedProcurement.item}</Text>
                <Text style={styles.modalInfo}>Qty: {selectedProcurement.quantity} {selectedProcurement.unit}</Text>
                <Text style={styles.modalInfo}>Dept: {selectedProcurement.department}</Text>
                <Text style={styles.modalInfo}>Est. Cost: {formatCurrency(selectedProcurement.estimatedCost)}</Text>
                <Text style={styles.modalInfo}>Supplier: {selectedProcurement.supplier}</Text>
                <Text style={styles.modalInfo}>Requested by: {selectedProcurement.requestedBy}</Text>
                {selectedProcurement.notes ? <Text style={styles.modalInfo}>Notes: {selectedProcurement.notes}</Text> : null}
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalApproveBtn} onPress={() => selectedProcurement && handleProcurementAction(selectedProcurement.id, 'approve')}>
                    <Text style={styles.modalBtnTextWhite}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalRejectBtn} onPress={() => selectedProcurement && handleProcurementAction(selectedProcurement.id, 'reject')}>
                    <Text style={styles.modalBtnTextDanger}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowProcurementModal(false)}>
                    <Text style={styles.modalBtnTextSecondary}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Exeat Review Modal */}
      <Modal visible={showExeatModal} transparent animationType="fade" onRequestClose={() => setShowExeatModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Review Exeat Request</Text>
            {selectedExeat && (
              <>
                <Text style={styles.modalInfo}>Exeat No: {selectedExeat.exeatNo}</Text>
                <Text style={styles.modalInfo}>Student: {selectedExeat.studentName} ({selectedExeat.class})</Text>
                <Text style={styles.modalInfo}>House: {selectedExeat.house}</Text>
                <Text style={styles.modalInfo}>Reason: {selectedExeat.reason} — {selectedExeat.reasonDetail}</Text>
                <Text style={styles.modalInfo}>Departure: {formatDate(selectedExeat.departureDate)}</Text>
                <Text style={styles.modalInfo}>Return: {formatDate(selectedExeat.returnDate)}</Text>
                <Text style={styles.modalInfo}>Guardian: {selectedExeat.guardianName} ({selectedExeat.guardianPhone})</Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalApproveBtn} onPress={() => selectedExeat && handleExeatAction(selectedExeat.id, 'approve')}>
                    <Text style={styles.modalBtnTextWhite}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalRejectBtn} onPress={() => selectedExeat && handleExeatAction(selectedExeat.id, 'reject')}>
                    <Text style={styles.modalBtnTextDanger}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowExeatModal(false)}>
                    <Text style={styles.modalBtnTextSecondary}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Compliance Modal (Add / Update) */}
      <Modal visible={showComplianceModal} transparent animationType="fade" onRequestClose={() => setShowComplianceModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedComplianceId ? 'Update Compliance Item' : 'Add Compliance Item'}</Text>
            {selectedComplianceId && selectedCompliance ? (
              <>
                <Text style={styles.modalInfo}>{selectedCompliance.document}</Text>
                <Text style={styles.modalInfo}>Authority: {selectedCompliance.authority}</Text>
                <Text style={styles.modalInfo}>Due: {formatDate(selectedCompliance.dueDate)}</Text>
                <Text style={styles.inputLabel}>Update Status</Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalApproveBtn} onPress={() => selectedCompliance && handleComplianceUpdate(selectedCompliance.id, 'Submitted')}>
                    <Text style={styles.modalBtnTextWhite}>Mark Submitted</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalInfoBtn} onPress={() => selectedCompliance && handleComplianceUpdate(selectedCompliance.id, 'In Progress')}>
                    <Text style={styles.modalBtnTextWhite}>In Progress</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalCancelBtn} onPress={() => { setSelectedComplianceId(null); setShowComplianceModal(false); }}>
                    <Text style={styles.modalBtnTextSecondary}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <ScrollView>
                <Text style={styles.inputLabel}>Document Name</Text>
                <TextInput style={styles.textInput} value={complianceForm.document} onChangeText={(v) => setComplianceForm({ ...complianceForm, document: v })} placeholder="e.g. Termly Enrollment Return" />
                <Text style={styles.inputLabel}>Authority</Text>
                <TextInput style={styles.textInput} value={complianceForm.authority} onChangeText={(v) => setComplianceForm({ ...complianceForm, authority: v })} placeholder="e.g. GES" />
                <Text style={styles.inputLabel}>Due Date (YYYY-MM-DD)</Text>
                <TextInput style={styles.textInput} value={complianceForm.dueDate} onChangeText={(v) => setComplianceForm({ ...complianceForm, dueDate: v })} placeholder="2026-08-15" />
                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput style={styles.textArea} value={complianceForm.notes} onChangeText={(v) => setComplianceForm({ ...complianceForm, notes: v })} placeholder="Additional notes..." multiline numberOfLines={2} />
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalApproveBtn} onPress={handleAddCompliance}>
                    <Text style={styles.modalBtnTextWhite}>Add Item</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowComplianceModal(false)}>
                    <Text style={styles.modalBtnTextSecondary}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Facility Modal (Add / Update) */}
      <Modal visible={showFacilityModal} transparent animationType="fade" onRequestClose={() => setShowFacilityModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedFacilityId ? 'Update Facility Issue' : 'Report Facility Issue'}</Text>
            {selectedFacilityId && selectedFacility ? (
              <View>
                <Text style={styles.modalInfo}>{selectedFacility.title}</Text>
                <Text style={styles.modalInfo}>Location: {selectedFacility.location}</Text>
                <Text style={styles.modalInfo}>Category: {selectedFacility.category}</Text>
                <Text style={styles.modalInfo}>Priority: {selectedFacility.priority}</Text>
                <Text style={styles.modalInfo}>Description: {selectedFacility.description}</Text>
                {selectedFacility.assignedTo ? <Text style={styles.modalInfo}>Assigned to: {selectedFacility.assignedTo}</Text> : null}
                <Text style={styles.inputLabel}>Update Status</Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalInfoBtn} onPress={() => selectedFacility && handleUpdateFacility(selectedFacility.id, 'Assigned')}>
                    <Text style={styles.modalBtnTextWhite}>Assign</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalInfoBtn} onPress={() => selectedFacility && handleUpdateFacility(selectedFacility.id, 'In Progress')}>
                    <Text style={styles.modalBtnTextWhite}>In Progress</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalApproveBtn} onPress={() => selectedFacility && handleUpdateFacility(selectedFacility.id, 'Resolved')}>
                    <Text style={styles.modalBtnTextWhite}>Resolve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalCancelBtn} onPress={() => { setSelectedFacilityId(null); setShowFacilityModal(false); }}>
                    <Text style={styles.modalBtnTextSecondary}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <ScrollView>
                <Text style={styles.inputLabel}>Title</Text>
                <TextInput style={styles.textInput} value={facilityForm.title} onChangeText={(v) => setFacilityForm({ ...facilityForm, title: v })} placeholder="e.g. Broken classroom door" />
                <Text style={styles.inputLabel}>Location</Text>
                <TextInput style={styles.textInput} value={facilityForm.location} onChangeText={(v) => setFacilityForm({ ...facilityForm, location: v })} placeholder="e.g. Block B, Room 12" />
                <Text style={styles.inputLabel}>Category</Text>
                <View style={styles.pickerRow}>
                  {FACILITY_CATEGORY_OPTIONS.map((c) => (
                    <TouchableOpacity key={c} style={[styles.pickerChip, facilityForm.category === c && styles.pickerChipActive]} onPress={() => setFacilityForm({ ...facilityForm, category: c })}>
                      <Text style={[styles.pickerChipText, facilityForm.category === c && styles.pickerChipTextActive]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.inputLabel}>Priority</Text>
                <View style={styles.pickerRow}>
                  {FACILITY_PRIORITY_OPTIONS.map((p) => (
                    <TouchableOpacity key={p} style={[styles.pickerChip, facilityForm.priority === p && styles.pickerChipActive]} onPress={() => setFacilityForm({ ...facilityForm, priority: p })}>
                      <Text style={[styles.pickerChipText, facilityForm.priority === p && styles.pickerChipTextActive]}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput style={styles.textArea} value={facilityForm.description} onChangeText={(v) => setFacilityForm({ ...facilityForm, description: v })} placeholder="Describe the issue..." multiline numberOfLines={3} />
                <Text style={styles.inputLabel}>Assign To (optional)</Text>
                <TextInput style={styles.textInput} value={facilityForm.assignedTo} onChangeText={(v) => setFacilityForm({ ...facilityForm, assignedTo: v })} placeholder="e.g. Maintenance Team" />
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalApproveBtn} onPress={handleAddFacility}>
                    <Text style={styles.modalBtnTextWhite}>Report Issue</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowFacilityModal(false)}>
                    <Text style={styles.modalBtnTextSecondary}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Meeting Modal (Schedule) */}
      <Modal visible={showMeetingModal} transparent animationType="fade" onRequestClose={() => setShowMeetingModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Schedule Meeting</Text>
            <ScrollView>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput style={styles.textInput} value={meetingForm.title} onChangeText={(v) => setMeetingForm({ ...meetingForm, title: v })} placeholder="e.g. Term 3 Review" />
              <Text style={styles.inputLabel}>Date (YYYY-MM-DD)</Text>
              <TextInput style={styles.textInput} value={meetingForm.date} onChangeText={(v) => setMeetingForm({ ...meetingForm, date: v })} placeholder="2026-07-20" />
              <Text style={styles.inputLabel}>Time</Text>
              <TextInput style={styles.textInput} value={meetingForm.time} onChangeText={(v) => setMeetingForm({ ...meetingForm, time: v })} placeholder="15:00" />
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput style={styles.textInput} value={meetingForm.location} onChangeText={(v) => setMeetingForm({ ...meetingForm, location: v })} placeholder="e.g. Main Hall" />
              <Text style={styles.inputLabel}>Facilitator</Text>
              <TextInput style={styles.textInput} value={meetingForm.facilitator} onChangeText={(v) => setMeetingForm({ ...meetingForm, facilitator: v })} placeholder="e.g. Headmaster" />
              <Text style={styles.inputLabel}>Agenda</Text>
              <TextInput style={styles.textArea} value={meetingForm.agenda} onChangeText={(v) => setMeetingForm({ ...meetingForm, agenda: v })} placeholder="Meeting agenda items..." multiline numberOfLines={4} />
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalApproveBtn} onPress={handleAddMeeting}>
                  <Text style={styles.modalBtnTextWhite}>Schedule</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowMeetingModal(false)}>
                  <Text style={styles.modalBtnTextSecondary}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Meeting Detail / Minutes Modal */}
      <Modal visible={showMeetingDetail} transparent animationType="fade" onRequestClose={() => setShowMeetingDetail(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Record Meeting Minutes</Text>
            {selectedMeeting && (
              <>
                <Text style={styles.modalInfo}>{selectedMeeting.title}</Text>
                <Text style={styles.modalInfo}>{formatDate(selectedMeeting.date)} at {selectedMeeting.time}</Text>
                <Text style={styles.inputLabel}>Attendees</Text>
                <TextInput style={styles.textInput} value={meetingMinutesForm.attendees} onChangeText={(v) => setMeetingMinutesForm({ ...meetingMinutesForm, attendees: v })} placeholder="Number of attendees" keyboardType="numeric" />
                <Text style={styles.inputLabel}>Minutes</Text>
                <TextInput style={styles.textArea} value={meetingMinutesForm.minutes} onChangeText={(v) => setMeetingMinutesForm({ ...meetingMinutesForm, minutes: v })} placeholder="Meeting minutes..." multiline numberOfLines={5} />
                <Text style={styles.inputLabel}>Key Decisions</Text>
                <TextInput style={styles.textArea} value={meetingMinutesForm.keyDecisions} onChangeText={(v) => setMeetingMinutesForm({ ...meetingMinutesForm, keyDecisions: v })} placeholder="Key decisions made..." multiline numberOfLines={3} />
                <Text style={styles.inputLabel}>Action Items</Text>
                <TextInput style={styles.textArea} value={meetingMinutesForm.actionItems} onChangeText={(v) => setMeetingMinutesForm({ ...meetingMinutesForm, actionItems: v })} placeholder="Action items..." multiline numberOfLines={3} />
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalApproveBtn} onPress={() => selectedMeeting && handleCompleteMeeting(selectedMeeting.id)}>
                    <Text style={styles.modalBtnTextWhite}>Complete Meeting</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowMeetingDetail(false)}>
                    <Text style={styles.modalBtnTextSecondary}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Task Assignment Modal */}
      <Modal visible={showTaskModal} transparent animationType="fade" onRequestClose={() => setShowTaskModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Assign Task</Text>
            <ScrollView>
              <Text style={styles.inputLabel}>Task Title</Text>
              <TextInput style={styles.textInput} value={taskForm.title} onChangeText={(v) => setTaskForm({ ...taskForm, title: v })} placeholder="e.g. Compile Staff Report" />
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput style={styles.textArea} value={taskForm.description} onChangeText={(v) => setTaskForm({ ...taskForm, description: v })} placeholder="Task details..." multiline numberOfLines={3} />
              <Text style={styles.inputLabel}>Assign To</Text>
              <TextInput style={styles.textInput} value={taskForm.assignedTo} onChangeText={(v) => setTaskForm({ ...taskForm, assignedTo: v })} placeholder="e.g. Registrar" />
              <Text style={styles.inputLabel}>Department</Text>
              <TextInput style={styles.textInput} value={taskForm.department} onChangeText={(v) => setTaskForm({ ...taskForm, department: v })} placeholder="e.g. Registry" />
              <Text style={styles.inputLabel}>Due Date (YYYY-MM-DD)</Text>
              <TextInput style={styles.textInput} value={taskForm.dueDate} onChangeText={(v) => setTaskForm({ ...taskForm, dueDate: v })} placeholder="2026-07-20" />
              <Text style={styles.inputLabel}>Priority</Text>
              <View style={styles.pickerRow}>
                {TASK_PRIORITY_OPTIONS.map((p) => (
                  <TouchableOpacity key={p} style={[styles.pickerChip, taskForm.priority === p && styles.pickerChipActive]} onPress={() => setTaskForm({ ...taskForm, priority: p })}>
                    <Text style={[styles.pickerChipText, taskForm.priority === p && styles.pickerChipTextActive]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput style={styles.textArea} value={taskForm.notes} onChangeText={(v) => setTaskForm({ ...taskForm, notes: v })} placeholder="Additional notes..." multiline numberOfLines={2} />
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalApproveBtn} onPress={handleAddTask}>
                  <Text style={styles.modalBtnTextWhite}>Assign Task</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowTaskModal(false)}>
                  <Text style={styles.modalBtnTextSecondary}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showAnnouncementModal} transparent animationType="fade" onRequestClose={() => setShowAnnouncementModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Announcement</Text>
            <ScrollView>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput style={styles.textInput} value={announcementForm.title} onChangeText={(v) => setAnnouncementForm({ ...announcementForm, title: v })} placeholder="Announcement title" />
              <Text style={styles.inputLabel}>Body</Text>
              <TextInput style={styles.textArea} value={announcementForm.body} onChangeText={(v) => setAnnouncementForm({ ...announcementForm, body: v })} placeholder="Announcement content..." multiline numberOfLines={5} />
              <Text style={styles.inputLabel}>Priority</Text>
              <View style={styles.pickerRow}>
                {ANNOUNCEMENT_PRIORITY_OPTIONS.map((p) => (
                  <TouchableOpacity key={p} style={[styles.pickerChip, announcementForm.priority === p && styles.pickerChipActive]} onPress={() => setAnnouncementForm({ ...announcementForm, priority: p })}>
                    <Text style={[styles.pickerChipText, announcementForm.priority === p && styles.pickerChipTextActive]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.inputLabel}>Audience</Text>
              <View style={styles.pickerRow}>
                {ANNOUNCEMENT_AUDIENCE_OPTIONS.map((a) => (
                  <TouchableOpacity key={a} style={[styles.pickerChip, announcementForm.audience === a && styles.pickerChipActive]} onPress={() => setAnnouncementForm({ ...announcementForm, audience: a })}>
                    <Text style={[styles.pickerChipText, announcementForm.audience === a && styles.pickerChipTextActive]}>{a}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalApproveBtn} onPress={handleAddAnnouncement}>
                  <Text style={styles.modalBtnTextWhite}>Post Announcement</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowAnnouncementModal(false)}>
                  <Text style={styles.modalBtnTextSecondary}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Admission Detail Modal */}
      <Modal visible={showAdmissionModal} transparent animationType="fade" onRequestClose={() => setShowAdmissionModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedAdmission && (
              <>
                <Text style={styles.modalTitle}>Admission Application</Text>
                <Text style={styles.modalInfo}>Applicant: {selectedAdmission.applicantName}</Text>
                <Text style={styles.modalInfo}>Programme: {selectedAdmission.programme || '—'}</Text>
                <Text style={styles.modalInfo}>CSSPS Ref: {selectedAdmission.csspsRef || '—'}</Text>
                <Text style={styles.modalInfo}>Parent/Guardian: {selectedAdmission.parentName}</Text>
                <Text style={styles.modalInfo}>Phone: {selectedAdmission.parentPhone}</Text>
                <Text style={styles.modalInfo}>Email: {selectedAdmission.parentEmail || '—'}</Text>
                <Text style={styles.modalInfo}>Date Applied: {formatDate(selectedAdmission.dateApplied)}</Text>
                <Text style={styles.modalInfo}>Status: {selectedAdmission.status}</Text>
                <Text style={styles.modalInfo}>Notes: {selectedAdmission.notes || '—'}</Text>

                <Text style={styles.inputLabel}>Document Checklist</Text>
                <ScrollView style={{ maxHeight: 200 }}>
                  {selectedAdmission.documents.map((doc) => (
                    <TouchableOpacity
                      key={doc.type}
                      style={styles.docCheckRow}
                      onPress={() => handleToggleDoc(selectedAdmission.id, doc.type)}
                    >
                      <Text style={styles.docCheckText}>{doc.submitted ? '✓' : '○'} {doc.type}</Text>
                      <Text style={[styles.statusText, { color: doc.submitted ? colors.success : colors.warning }]}>
                        {doc.submitted ? 'Submitted' : 'Pending'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.inputLabel}>Actions</Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalApproveBtn} onPress={() => handleApproveAdmission(selectedAdmission.id)}>
                    <Text style={styles.modalBtnTextWhite}>Approve & Enroll</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalInfoBtn} onPress={() => handleReviewAdmission(selectedAdmission.id)}>
                    <Text style={styles.modalBtnTextWhite}>Mark Under Review</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalCancelBtn} onPress={() => handleRejectAdmission(selectedAdmission.id)}>
                    <Text style={styles.modalBtnTextSecondary}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowAdmissionModal(false)}>
                    <Text style={styles.modalBtnTextSecondary}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Add Student Modal */}
      <Modal visible={showAddStudentModal} transparent animationType="fade" onRequestClose={() => setShowAddStudentModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enroll New Student</Text>
            <ScrollView>
              <Text style={styles.inputLabel}>First Name *</Text>
              <TextInput style={styles.textInput} value={studentForm.firstName} onChangeText={(v) => setStudentForm({ ...studentForm, firstName: v })} placeholder="e.g. Kwame" />
              <Text style={styles.inputLabel}>Last Name *</Text>
              <TextInput style={styles.textInput} value={studentForm.lastName} onChangeText={(v) => setStudentForm({ ...studentForm, lastName: v })} placeholder="e.g. Asante" />
              <Text style={styles.inputLabel}>Date of Birth (YYYY-MM-DD)</Text>
              <TextInput style={styles.textInput} value={studentForm.dateOfBirth} onChangeText={(v) => setStudentForm({ ...studentForm, dateOfBirth: v })} placeholder="e.g. 2009-05-14" />
              <Text style={styles.inputLabel}>Gender</Text>
              <View style={styles.pickerRow}>
                {(['Male', 'Female'] as const).map((g) => (
                  <TouchableOpacity key={g} style={[styles.pickerChip, studentForm.gender === g && styles.pickerChipActive]} onPress={() => setStudentForm({ ...studentForm, gender: g })}>
                    <Text style={[styles.pickerChipText, studentForm.gender === g && styles.pickerChipTextActive]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.inputLabel}>Programme of Study *</Text>
              <Text style={styles.autoAssignHint}>Class will be auto-assigned based on programme</Text>
              <View style={styles.pickerRow}>
                {PROGRAMMES.map((p) => (
                  <TouchableOpacity key={p} style={[styles.pickerChip, studentForm.programme === p && styles.pickerChipActive]} onPress={() => setStudentForm({ ...studentForm, programme: p })}>
                    <Text style={[styles.pickerChipText, studentForm.programme === p && styles.pickerChipTextActive]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.inputLabel}>CSSPS Placement Reference</Text>
              <TextInput style={styles.textInput} value={studentForm.csspsRef} onChangeText={(v) => setStudentForm({ ...studentForm, csspsRef: v })} placeholder="e.g. CSSPS/2026/0100" />
              <Text style={styles.inputLabel}>Student Photo URL (optional)</Text>
              <TextInput style={styles.textInput} value={studentForm.photoUrl || ''} onChangeText={(v) => setStudentForm({ ...studentForm, photoUrl: v || null })} placeholder="https://... or leave blank" />
              <Text style={styles.autoAssignHint}>House and admission number will be auto-assigned</Text>
              <Text style={styles.inputLabel}>Guardian Name</Text>
              <TextInput style={styles.textInput} value={studentForm.guardianName} onChangeText={(v) => setStudentForm({ ...studentForm, guardianName: v })} placeholder="e.g. Mr. Kofi Asante" />
              <Text style={styles.inputLabel}>Guardian Phone</Text>
              <TextInput style={styles.textInput} value={studentForm.guardianPhone} onChangeText={(v) => setStudentForm({ ...studentForm, guardianPhone: v })} placeholder="e.g. 024-555-1001" />
              <Text style={styles.inputLabel}>Guardian Address</Text>
              <TextInput style={styles.textArea} value={studentForm.guardianAddress} onChangeText={(v) => setStudentForm({ ...studentForm, guardianAddress: v })} placeholder="Home address..." multiline numberOfLines={2} />
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalApproveBtn} onPress={handleAddStudent}>
                  <Text style={styles.modalBtnTextWhite}>Enroll Student</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowAddStudentModal(false)}>
                  <Text style={styles.modalBtnTextSecondary}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Bulk Upload Modal */}
      <Modal visible={showBulkUploadModal} transparent animationType="fade" onRequestClose={() => setShowBulkUploadModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Bulk Student Enrollment</Text>
            <ScrollView>
              <Text style={styles.inputLabel}>Instructions</Text>
              <Text style={styles.autoAssignHint}>Paste CSV data with columns: firstName, lastName, dateOfBirth, gender, programme, guardianName, guardianPhone, guardianAddress, csspsRef</Text>
              <Text style={styles.autoAssignHint}>Class, house, and admission number will be auto-assigned for each student.</Text>
              <TouchableOpacity style={styles.downloadBtn} onPress={downloadCSVTemplate}>
                <Text style={styles.downloadBtnText}>Download CSV Template</Text>
              </TouchableOpacity>
              <Text style={styles.inputLabel}>CSV Data</Text>
              <TextInput
                style={styles.csvTextArea}
                value={csvText}
                onChangeText={setCsvText}
                placeholder="firstName,lastName,dateOfBirth,gender,programme,guardianName,guardianPhone,guardianAddress,csspsRef&#10;Kwame,Asante,2009-05-14,Male,Science,Mr. Kofi Asante,024-555-1001,Kumasi,CSSPS/2026/0100"
                multiline
                numberOfLines={10}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalApproveBtn} onPress={() => handleBulkCSVUpload(csvText)}>
                  <Text style={styles.modalBtnTextWhite}>Upload & Enroll</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowBulkUploadModal(false)}>
                  <Text style={styles.modalBtnTextSecondary}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Placement Add Modal */}
      <Modal visible={showPlacementModal} transparent animationType="fade" onRequestClose={() => setShowPlacementModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add CSSPS Placement Record</Text>
            <ScrollView>
              <Text style={styles.inputLabel}>Student Full Name *</Text>
              <TextInput style={styles.textInput} value={placementForm.fullName} onChangeText={(v) => setPlacementForm({ ...placementForm, fullName: v })} placeholder="e.g. Kwame Asante" />
              <Text style={styles.inputLabel}>CSSPS Placement Reference *</Text>
              <TextInput style={styles.textInput} value={placementForm.csspsRef} onChangeText={(v) => setPlacementForm({ ...placementForm, csspsRef: v })} placeholder="e.g. CSSPS/2026/0100" />
              <Text style={styles.inputLabel}>Programme</Text>
              <View style={styles.pickerRow}>
                {PROGRAMMES.map((p) => (
                  <TouchableOpacity key={p} style={[styles.pickerChip, placementForm.programme === p && styles.pickerChipActive]} onPress={() => setPlacementForm({ ...placementForm, programme: p })}>
                    <Text style={[styles.pickerChipText, placementForm.programme === p && styles.pickerChipTextActive]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.inputLabel}>Intended Class</Text>
              <View style={styles.pickerRow}>
                {CLASS_SECTIONS.map((c) => (
                  <TouchableOpacity key={c} style={[styles.pickerChip, placementForm.intendedClass === c && styles.pickerChipActive]} onPress={() => setPlacementForm({ ...placementForm, intendedClass: c })}>
                    <Text style={[styles.pickerChipText, placementForm.intendedClass === c && styles.pickerChipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalApproveBtn} onPress={() => {
                  if (!placementForm.fullName.trim() || !placementForm.csspsRef.trim()) {
                    Alert.alert('Error', 'Student name and CSSPS reference are required.');
                    return;
                  }
                  registryStore.addPlacement({ fullName: placementForm.fullName.trim(), csspsRef: placementForm.csspsRef.trim(), intendedClass: placementForm.intendedClass, programme: placementForm.programme, preloadedBy: adminName });
                  setPlacementForm({ fullName: '', csspsRef: '', intendedClass: 'SHS1 Sci A', programme: 'Science' });
                  setShowPlacementModal(false);
                  Alert.alert('Success', 'Placement record added.');
                }}>
                  <Text style={styles.modalBtnTextWhite}>Add Placement</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowPlacementModal(false)}>
                  <Text style={styles.modalBtnTextSecondary}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Bulk Placement CSV Modal */}
      <Modal visible={showBulkPlacementModal} transparent animationType="fade" onRequestClose={() => setShowBulkPlacementModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Bulk CSSPS Placement Upload</Text>
            <ScrollView>
              <Text style={styles.inputLabel}>Instructions</Text>
              <Text style={styles.autoAssignHint}>Paste CSV data with columns: fullName, csspsRef, programme, intendedClass</Text>
              <Text style={styles.autoAssignHint}>Programme must be: Science, Arts, or Business</Text>
              <Text style={styles.inputLabel}>CSV Data</Text>
              <TextInput
                style={styles.csvTextArea}
                value={placementCsvText}
                onChangeText={setPlacementCsvText}
                placeholder={'fullName,csspsRef,programme,intendedClass\nKwame Asante,CSSPS/2026/0100,Science,SHS1 Sci A\nAma Owusu,CSSPS/2026/0101,Arts,SHS1 Arts A'}
                multiline
                numberOfLines={10}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalApproveBtn} onPress={() => {
                  const lines = placementCsvText.trim().split('\n');
                  if (lines.length < 2) {
                    Alert.alert('Error', 'Please paste CSV data with a header row and at least one data row.');
                    return;
                  }
                  const header = lines[0].toLowerCase().replace(/\s/g, '').split(',');
                  const nameIdx = header.indexOf('fullname');
                  const refIdx = header.indexOf('csspsref');
                  const progIdx = header.indexOf('programme');
                  const classIdx = header.indexOf('intendedclass');
                  if (nameIdx === -1 || refIdx === -1) {
                    Alert.alert('Error', 'CSV must include at least fullName and csspsRef columns.');
                    return;
                  }
                  const records: { fullName: string; csspsRef: string; programme: Programme; intendedClass: string; preloadedBy: string }[] = [];
                  for (let i = 1; i < lines.length; i++) {
                    const cols = lines[i].split(',');
                    if (cols.length < 2) continue;
                    const fullName = (cols[nameIdx] || '').trim();
                    const csspsRef = (cols[refIdx] || '').trim();
                    if (!fullName || !csspsRef) continue;
                    const programme = ((cols[progIdx] || 'Science').trim() as Programme);
                    const intendedClass = (cols[classIdx] || 'SHS1 Sci A').trim();
                    records.push({ fullName, csspsRef, programme, intendedClass, preloadedBy: adminName });
                  }
                  if (records.length === 0) {
                    Alert.alert('Error', 'No valid placement records found in CSV.');
                    return;
                  }
                  const added = registryStore.bulkAddPlacements(records);
                  setShowBulkPlacementModal(false);
                  Alert.alert('Success', `${added} placement records uploaded.`);
                }}>
                  <Text style={styles.modalBtnTextWhite}>Upload Placements</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowBulkPlacementModal(false)}>
                  <Text style={styles.modalBtnTextSecondary}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Prospectus Publishing Modal */}
      <Modal visible={showProspectusModal} transparent animationType="fade" onRequestClose={() => setShowProspectusModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Publish Prospectus</Text>
            <ScrollView>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput style={styles.textInput} value={prospectusForm.title} onChangeText={(v) => setProspectusForm({ ...prospectusForm, title: v })} placeholder="e.g. Welcome Prospectus 2026/2027" />
              <Text style={styles.inputLabel}>Academic Year</Text>
              <TextInput style={styles.textInput} value={prospectusForm.academicYear} onChangeText={(v) => setProspectusForm({ ...prospectusForm, academicYear: v })} placeholder="e.g. 2026/2027" />
              <Text style={styles.inputLabel}>Content *</Text>
              <TextInput style={styles.textArea} value={prospectusForm.content} onChangeText={(v) => setProspectusForm({ ...prospectusForm, content: v })} placeholder="Prospectus content..." multiline numberOfLines={8} />
              <Text style={styles.inputLabel}>Target Admission IDs (comma-separated, leave blank for all approved)</Text>
              <TextInput style={styles.textInput} value={prospectusForm.targetedAdmissionIds} onChangeText={(v) => setProspectusForm({ ...prospectusForm, targetedAdmissionIds: v })} placeholder="e.g. 3,5,7 or leave blank for all approved" />
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalApproveBtn} onPress={() => {
                  if (!prospectusForm.title.trim() || !prospectusForm.content.trim()) {
                    Alert.alert('Error', 'Title and content are required.');
                    return;
                  }
                  const approved = registryStore.admissions.filter((a) => a.status === 'Approved');
                  const targetedIds = prospectusForm.targetedAdmissionIds.trim()
                    ? prospectusForm.targetedAdmissionIds.split(',').map((s) => s.trim()).filter(Boolean)
                    : approved.map((a) => a.id);
                  registryStore.publishProspectus({
                    title: prospectusForm.title.trim(),
                    academicYear: prospectusForm.academicYear,
                    content: prospectusForm.content.trim(),
                    publishedBy: adminName,
                    targetedAdmissionIds: targetedIds,
                  });
                  setProspectusForm({ title: '', academicYear: '2026/2027', content: '', targetedAdmissionIds: '' });
                  setShowProspectusModal(false);
                  Alert.alert('Success', `Prospectus published to ${targetedIds.length} admission(s).`);
                }}>
                  <Text style={styles.modalBtnTextWhite}>Publish Prospectus</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowProspectusModal(false)}>
                  <Text style={styles.modalBtnTextSecondary}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Scratch Card Generation Modal ── */}
      <Modal visible={showScratchCardModal} transparent animationType="fade" onRequestClose={() => setShowScratchCardModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Generate Scratch Cards</Text>

              {lastGeneratedCards.length > 0 && (
                <View style={{ backgroundColor: colors.successBg || colors.success + '15', borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md }}>
                  <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.success, marginBottom: spacing.xs }}>
                    ✓ {lastGeneratedCards.length} cards generated successfully!
                  </Text>
                  <TouchableOpacity onPress={() => {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`<html><head><meta charset='utf-8'><style>body{font-family:Arial,sans-serif;margin:40px;}h1{color:#0F4C75;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#0F4C75;color:white;}</style></head><body><h1>Scratch Cards - Batch ${lastGeneratedCards[0]?.batchId}</h1><table><tr><th>Serial</th><th>PIN</th><th>Amount</th></tr>${lastGeneratedCards.map((c) => `<tr><td>${c.serial}</td><td>${c.pin}</td><td>GH₵${c.amount}</td></tr>`).join('')}</table></body></html>`);
                      printWindow.document.close();
                      printWindow.focus();
                      setTimeout(() => printWindow.print(), 500);
                    }
                  }} style={{ marginTop: spacing.xs }}>
                    <Text style={{ color: colors.primary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>⬇ Print / Export Cards</Text>
                  </TouchableOpacity>
                </View>
              )}

              <Text style={styles.inputLabel}>Number of Cards</Text>
              <TextInput
                style={styles.textInput}
                value={scratchCardCount}
                onChangeText={setScratchCardCount}
                placeholder="e.g. 10"
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Amount per Card (GH₵)</Text>
              <TextInput
                style={styles.textInput}
                value={scratchCardAmount}
                onChangeText={setScratchCardAmount}
                placeholder="e.g. 50"
                keyboardType="numeric"
              />

              <Text style={styles.autoAssignHint}>Each card will have a unique serial (SC-XXX) and PIN (XXXX-XXXX). Parents use these to pay the application fee.</Text>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalApproveBtn} onPress={() => {
                  const count = parseInt(scratchCardCount, 10);
                  const amount = parseInt(scratchCardAmount, 10);
                  if (!count || count <= 0) {
                    Alert.alert('Error', 'Please enter a valid number of cards');
                    return;
                  }
                  if (!amount || amount <= 0) {
                    Alert.alert('Error', 'Please enter a valid amount');
                    return;
                  }
                  const cards = registryStore.generateScratchCards(count, amount);
                  setLastGeneratedCards(cards);
                  Alert.alert('Success', `${count} scratch cards generated successfully!`);
                }}>
                  <Text style={styles.modalBtnTextWhite}>Generate</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => { setShowScratchCardModal(false); setLastGeneratedCards([]); }}>
                  <Text style={styles.modalBtnTextSecondary}>Close</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
  pageSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  alertTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.danger, marginTop: spacing.lg, marginBottom: spacing.sm },
  alertCard: { backgroundColor: colors.dangerBg, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.xs, borderLeftWidth: 4, borderLeftColor: colors.danger },
  alertText: { fontSize: fontSize.sm, color: colors.danger, fontWeight: fontWeight.medium },
  emptyText: { fontSize: fontSize.md, color: colors.textLight, fontStyle: 'italic', paddingVertical: spacing.md },
  statusText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowGap: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  quickActionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  quickBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.md, marginBottom: spacing.xs },
  quickBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  addBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  addBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  miniBtn: { backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderWidth: 1, borderColor: colors.border },
  miniBtnText: { color: colors.primary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  miniApproveBtn: { backgroundColor: colors.success, borderRadius: radius.sm, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
  miniApproveBtnText: { color: colors.white, fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  miniCancelBtn: { backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderWidth: 1, borderColor: colors.border },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xs },
  cardMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  cardBody: { fontSize: fontSize.sm, color: colors.text, marginTop: spacing.sm, lineHeight: 20 },
  miniRejectBtn: { backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderWidth: 1, borderColor: colors.danger },
  miniBtnTextDanger: { color: colors.danger, fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  noticeCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  noticeTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, flex: 1 },
  noticeBody: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs, lineHeight: 20 },
  noticeMeta: { fontSize: fontSize.xs, color: colors.textLight, marginTop: spacing.xs },
  priorityBadge: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  audienceBadge: { backgroundColor: colors.infoBg, borderRadius: radius.sm, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, marginTop: spacing.xs, alignSelf: 'flex-start' },
  audienceText: { fontSize: fontSize.xs, color: colors.info, fontWeight: fontWeight.medium },
  meetingCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  meetingTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, flex: 1 },
  meetingMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  meetingAgenda: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs, lineHeight: 20 },
  meetingActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  minutesBox: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.sm },
  minutesLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.primary, marginBottom: spacing.xs },
  minutesText: { fontSize: fontSize.sm, color: colors.text, marginTop: spacing.xs, lineHeight: 20 },
  deleteText: { fontSize: fontSize.xs, color: colors.danger, fontWeight: fontWeight.medium },
  reportCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reportTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  reportDesc: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  reportAction: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.semibold },
  pdfFullBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  pdfFullBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  modalContent: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, width: '100%', maxWidth: 500, maxHeight: '85%' },
  modalTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.md },
  modalInfo: { fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  inputLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text, marginTop: spacing.sm, marginBottom: spacing.xs },
  textInput: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md, color: colors.text, marginBottom: spacing.sm },
  textArea: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md, color: colors.text, marginBottom: spacing.sm, minHeight: 60 },
  pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  pickerChip: { backgroundColor: colors.surfaceAlt, borderRadius: radius.pill, paddingVertical: spacing.xs, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border },
  pickerChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pickerChipText: { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: fontWeight.medium },
  pickerChipTextActive: { color: colors.white, fontWeight: fontWeight.semibold },
  docCheckRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  docCheckText: { fontSize: fontSize.sm, color: colors.text, fontWeight: fontWeight.medium },
  modalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, flexWrap: 'wrap' },
  modalApproveBtn: { backgroundColor: colors.success, borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, flex: 1, minWidth: 80, alignItems: 'center' },
  modalRejectBtn: { backgroundColor: colors.dangerBg, borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, flex: 1, minWidth: 80, alignItems: 'center', borderWidth: 1, borderColor: colors.danger },
  modalInfoBtn: { backgroundColor: colors.info, borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, flex: 1, minWidth: 80, alignItems: 'center' },
  modalCancelBtn: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, flex: 1, minWidth: 80, alignItems: 'center' },
  modalBtnTextWhite: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  modalBtnTextDanger: { color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  modalBtnTextSecondary: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  logoutBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  logoutText: { color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  autoAssignHint: { fontSize: fontSize.xs, color: colors.info, marginBottom: spacing.xs, fontStyle: 'italic' },
  configRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  configLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text },
  configSub: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  infoCard: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.sm },
  infoText: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs },
  downloadBtn: { backgroundColor: colors.info, borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.sm },
  downloadBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  csvTextArea: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.xs, color: colors.text, marginBottom: spacing.sm, minHeight: 200, fontFamily: 'monospace' },
});
