import { create } from 'zustand';

// ── Types ──

export type ComplianceStatus = 'Not Started' | 'In Progress' | 'Submitted' | 'Overdue';
export type AnnouncementPriority = 'Normal' | 'Important' | 'Urgent';
export type AnnouncementAudience = 'All Staff' | 'Teaching Staff' | 'Non-Teaching Staff' | 'All Students' | 'Parents';
export type FacilityPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type FacilityStatus = 'Reported' | 'Assigned' | 'In Progress' | 'Resolved';
export type MeetingStatus = 'Scheduled' | 'Completed' | 'Cancelled';

export interface ComplianceItem {
  id: string;
  document: string;
  authority: string;
  dueDate: string;
  status: ComplianceStatus;
  submittedDate?: string;
  submittedBy?: string;
  notes: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  date: string;
  priority: AnnouncementPriority;
  audience: AnnouncementAudience;
  postedBy: string;
}

export interface FacilityIssue {
  id: string;
  title: string;
  location: string;
  category: 'Electrical' | 'Plumbing' | 'Furniture' | 'Building' | 'Equipment' | 'Grounds' | 'Other';
  priority: FacilityPriority;
  status: FacilityStatus;
  reportedDate: string;
  reportedBy: string;
  assignedTo?: string;
  resolvedDate?: string;
  resolutionNotes?: string;
  description: string;
}

export interface AdminMeeting {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  facilitator: string;
  agenda: string;
  attendees: number;
  status: MeetingStatus;
  minutes?: string;
  keyDecisions?: string;
  actionItems?: string;
}

export interface TaskAssignment {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  department: string;
  dueDate: string;
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  assignedBy: string;
  completedDate?: string;
  notes: string;
}

// ── Constants ──

export const COMPLIANCE_STATUSES: ComplianceStatus[] = ['Not Started', 'In Progress', 'Submitted', 'Overdue'];
export const ANNOUNCEMENT_PRIORITIES: AnnouncementPriority[] = ['Normal', 'Important', 'Urgent'];
export const ANNOUNCEMENT_AUDIENCES: AnnouncementAudience[] = ['All Staff', 'Teaching Staff', 'Non-Teaching Staff', 'All Students', 'Parents'];
export const FACILITY_PRIORITIES: FacilityPriority[] = ['Low', 'Medium', 'High', 'Critical'];
export const FACILITY_STATUSES: FacilityStatus[] = ['Reported', 'Assigned', 'In Progress', 'Resolved'];
export const FACILITY_CATEGORIES = ['Electrical', 'Plumbing', 'Furniture', 'Building', 'Equipment', 'Grounds', 'Other'];
export const ADMIN_MEETING_STATUSES: MeetingStatus[] = ['Scheduled', 'Completed', 'Cancelled'];
export const TASK_PRIORITIES = ['Low', 'Normal', 'High', 'Urgent'];
export const TASK_STATUSES = ['Pending', 'In Progress', 'Completed', 'Overdue'];

// ── Helpers ──

let idCounter = 0;
const nextId = () => `adm-${++idCounter}`;
const todayISO = () => new Date().toISOString().slice(0, 10);

// ── Initial Data ──

const INITIAL_COMPLIANCE: ComplianceItem[] = [
  { id: '1', document: 'Termly Enrollment Return', authority: 'GES', dueDate: '2026-07-15', status: 'Submitted', submittedDate: '2026-07-10', submittedBy: 'Registrar', notes: 'Submitted via GES portal.' },
  { id: '2', document: 'Staff Establishment Report', authority: 'GES', dueDate: '2026-07-20', status: 'In Progress', notes: 'Awaiting updated staff list from HR.' },
  { id: '3', document: 'School Improvement Plan (SIP)', authority: 'GES', dueDate: '2026-08-01', status: 'Not Started', notes: 'Draft to be prepared by Academic Office.' },
  { id: '4', document: 'Annual Safety Audit', authority: 'Ghana Education Service', dueDate: '2026-08-15', status: 'Not Started', notes: 'External auditor to be engaged.' },
  { id: '5', document: 'Free SHS Capitation Report', authority: 'Ministry of Education', dueDate: '2026-07-31', status: 'In Progress', notes: 'Bursary compiling expenditure data.' },
  { id: '6', document: 'PTA Annual Report', authority: 'Internal', dueDate: '2026-09-05', status: 'Not Started', notes: 'To be presented at AGM.' },
  { id: '7', document: 'Staff Performance Appraisal Summary', authority: 'GES', dueDate: '2026-07-25', status: 'In Progress', notes: 'HODs submitting appraisals.' },
  { id: '8', document: 'Internal Audit Report — Q3', authority: 'Internal', dueDate: '2026-07-12', status: 'Overdue', notes: 'Audit committee meeting postponed.' },
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  { id: '1', title: 'Staff General Meeting — July 12', body: 'All staff are required to attend the general meeting on Friday, July 12 at 3:00pm in the main hall. Agenda: Term 3 exam preparation, compliance deadlines, and budget review.', date: '2026-07-08', priority: 'Urgent', audience: 'All Staff', postedBy: 'Asst. Headmaster (Admin)' },
  { id: '2', title: 'Compliance Deadline Reminder', body: 'Several GES compliance reports are due this month. Department heads should submit their inputs by July 18. See compliance tracker for details.', date: '2026-07-06', priority: 'Important', audience: 'All Staff', postedBy: 'Asst. Headmaster (Admin)' },
  { id: '3', title: 'Facility Maintenance Window', body: 'Scheduled maintenance will take place July 15-19. Please report any outstanding facility issues to the admin office by July 12.', date: '2026-07-04', priority: 'Normal', audience: 'All Staff', postedBy: 'Admin Office' },
];

const INITIAL_FACILITIES: FacilityIssue[] = [
  { id: '1', title: 'Broken classroom door — Room B12', location: 'Block B, Room 12', category: 'Building', priority: 'Medium', status: 'Assigned', reportedDate: '2026-07-05', reportedBy: 'Mr. Mensah', assignedTo: 'Maintenance Team', description: 'Door hinge broken, door cannot close properly.' },
  { id: '2', title: 'Electrical fault in Science Lab', location: 'Science Block, Lab 2', category: 'Electrical', priority: 'High', status: 'In Progress', reportedDate: '2026-07-03', reportedBy: 'Mr. Adjei', assignedTo: 'Electrician', description: 'Power outlets not working at demonstration bench. Electrician contacted.' },
  { id: '3', title: 'Leaking pipe in boys washroom', location: 'Block A, Ground Floor', category: 'Plumbing', priority: 'High', status: 'Reported', reportedDate: '2026-07-08', reportedBy: 'Cleaning Supervisor', description: 'Water leaking from pipe joint, causing water pooling on floor.' },
  { id: '4', title: 'Damaged desks — SHS1 Sci A', location: 'Block C, Room 5', category: 'Furniture', priority: 'Low', status: 'Reported', reportedDate: '2026-07-06', reportedBy: 'Mr. Owusu', description: '5 desks with broken legs need repair or replacement.' },
  { id: '5', title: 'Projector not working — ICT Lab', location: 'ICT Block, Lab 1', category: 'Equipment', priority: 'Medium', status: 'Resolved', reportedDate: '2026-06-28', reportedBy: 'Mr. Owusu', assignedTo: 'ICT Technician', resolvedDate: '2026-07-02', resolutionNotes: 'Lamp replaced. Projector tested and working.', description: 'Projector lamp burned out during lesson.' },
];

const INITIAL_MEETINGS: AdminMeeting[] = [
  { id: '1', title: 'Term 3 Mid-Term Review', date: '2026-07-12', time: '15:00', location: 'Main Hall', facilitator: 'Headmaster', agenda: '1. Academic performance review\n2. Compliance deadlines\n3. Budget status\n4. Facility maintenance\n5. Staff welfare', attendees: 0, status: 'Scheduled' },
  { id: '2', title: 'Department Heads Strategy Meeting', date: '2026-07-15', time: '14:00', location: 'Conference Room', facilitator: 'Asst. Headmaster (Admin)', agenda: '1. Department budget submissions\n2. Staff appraisal progress\n3. Term 3 preparation', attendees: 0, status: 'Scheduled' },
  { id: '3', title: 'End of Term 2 Staff Meeting', date: '2026-06-20', time: '15:00', location: 'Main Hall', facilitator: 'Headmaster', agenda: '1. Term 2 review\n2. Exam results analysis\n3. Holiday schedule', attendees: 62, status: 'Completed', minutes: 'Meeting opened at 3:00pm. Term 2 exams completed successfully with 92% pass rate. Discipline incidents down 15%. Financial report presented. Meeting adjourned at 4:30pm.', keyDecisions: 'Term 2 exams passed; 3 students flagged for support; appraisal timeline approved.', actionItems: 'HODs to submit term reports by June 25; Counselling to follow up on flagged students.' },
];

const INITIAL_TASKS: TaskAssignment[] = [
  { id: '1', title: 'Compile Staff Establishment Report', description: 'Gather updated staff list, qualifications, and positions for GES submission.', assignedTo: 'Registrar', department: 'Registry', dueDate: '2026-07-18', priority: 'Urgent', status: 'In Progress', assignedBy: 'Asst. Headmaster (Admin)', notes: 'GES deadline July 20.' },
  { id: '2', title: 'Prepare Safety Audit RFP', description: 'Draft request for proposal for external safety auditor.', assignedTo: 'Admin Officer', department: 'Administration', dueDate: '2026-07-25', priority: 'Normal', status: 'Pending', assignedBy: 'Asst. Headmaster (Admin)', notes: 'Audit due August 15.' },
  { id: '3', title: 'Submit Capitation Report Data', description: 'Compile expenditure data for Free SHS capitation report.', assignedTo: 'Accountant', department: 'Finance', dueDate: '2026-07-20', priority: 'Urgent', status: 'In Progress', assignedBy: 'Asst. Headmaster (Admin)', notes: 'MoE deadline July 31.' },
  { id: '4', title: 'Repair Science Lab Electrical Fault', description: 'Fix power outlets at demonstration bench in Lab 2.', assignedTo: 'Maintenance Team', department: 'Maintenance', dueDate: '2026-07-10', priority: 'High', status: 'In Progress', assignedBy: 'Asst. Headmaster (Admin)', notes: 'Electrician contacted, awaiting parts.' },
  { id: '5', title: 'Update Staff Directory', description: 'Add new staff entries and update contact information.', assignedTo: 'HR Officer', department: 'Administration', dueDate: '2026-07-15', priority: 'Normal', status: 'Pending', assignedBy: 'Asst. Headmaster (Admin)', notes: '' },
];

// ── Store ──

interface AdminState {
  compliance: ComplianceItem[];
  announcements: Announcement[];
  facilities: FacilityIssue[];
  meetings: AdminMeeting[];
  tasks: TaskAssignment[];

  // Compliance
  addCompliance: (item: Omit<ComplianceItem, 'id'>) => void;
  updateCompliance: (id: string, updates: Partial<ComplianceItem>) => void;
  deleteCompliance: (id: string) => void;
  getOverdueCompliance: () => ComplianceItem[];

  // Announcements
  addAnnouncement: (a: Omit<Announcement, 'id' | 'date'>) => void;
  deleteAnnouncement: (id: string) => void;

  // Facilities
  addFacility: (f: Omit<FacilityIssue, 'id' | 'reportedDate' | 'status'>) => void;
  updateFacility: (id: string, updates: Partial<FacilityIssue>) => void;
  deleteFacility: (id: string) => void;
  getOpenFacilities: () => FacilityIssue[];

  // Meetings
  addMeeting: (m: Omit<AdminMeeting, 'id' | 'status' | 'attendees'>) => void;
  completeMeeting: (id: string, minutes: string, decisions: string, actions: string, attendees: number) => void;
  cancelMeeting: (id: string) => void;
  deleteMeeting: (id: string) => void;

  // Tasks
  addTask: (t: Omit<TaskAssignment, 'id' | 'status'>) => void;
  updateTaskStatus: (id: string, status: TaskAssignment['status']) => void;
  deleteTask: (id: string) => void;
  getOverdueTasks: () => TaskAssignment[];
  getPendingTasks: () => TaskAssignment[];

  // Stats
  getAdminStats: () => {
    pendingLeave: number;
    pendingRequisitions: number;
    pendingProcurement: number;
    pendingExeats: number;
    openFacilities: number;
    overdueCompliance: number;
    pendingTasks: number;
    scheduledMeetings: number;
    totalStaff: number;
    activeStudents: number;
    openIncidents: number;
  };
}

export const useAdminStore = create<AdminState>((set, get) => ({
  compliance: INITIAL_COMPLIANCE,
  announcements: INITIAL_ANNOUNCEMENTS,
  facilities: INITIAL_FACILITIES,
  meetings: INITIAL_MEETINGS,
  tasks: INITIAL_TASKS,

  // Compliance
  addCompliance: (item) => {
    set((s) => ({ compliance: [...s.compliance, { ...item, id: nextId() }] }));
  },
  updateCompliance: (id, updates) => {
    set((s) => ({ compliance: s.compliance.map((c) => (c.id === id ? { ...c, ...updates } : c)) }));
  },
  deleteCompliance: (id) => {
    set((s) => ({ compliance: s.compliance.filter((c) => c.id !== id) }));
  },
  getOverdueCompliance: () => {
    return get().compliance.filter((c) => c.status === 'Overdue' || (c.status !== 'Submitted' && c.dueDate < todayISO()));
  },

  // Announcements
  addAnnouncement: (a) => {
    set((s) => ({ announcements: [{ ...a, id: nextId(), date: todayISO() }, ...s.announcements] }));
  },
  deleteAnnouncement: (id) => {
    set((s) => ({ announcements: s.announcements.filter((a) => a.id !== id) }));
  },

  // Facilities
  addFacility: (f) => {
    set((s) => ({ facilities: [{ ...f, id: nextId(), reportedDate: todayISO(), status: 'Reported' }, ...s.facilities] }));
  },
  updateFacility: (id, updates) => {
    set((s) => ({ facilities: s.facilities.map((f) => (f.id === id ? { ...f, ...updates } : f)) }));
  },
  deleteFacility: (id) => {
    set((s) => ({ facilities: s.facilities.filter((f) => f.id !== id) }));
  },
  getOpenFacilities: () => {
    return get().facilities.filter((f) => f.status !== 'Resolved');
  },

  // Meetings
  addMeeting: (m) => {
    set((s) => ({ meetings: [...s.meetings, { ...m, id: nextId(), status: 'Scheduled', attendees: 0 }] }));
  },
  completeMeeting: (id, minutes, decisions, actions, attendees) => {
    set((s) => ({
      meetings: s.meetings.map((m) =>
        m.id === id ? { ...m, status: 'Completed', minutes, keyDecisions: decisions, actionItems: actions, attendees } : m
      ),
    }));
  },
  cancelMeeting: (id) => {
    set((s) => ({ meetings: s.meetings.map((m) => (m.id === id ? { ...m, status: 'Cancelled' } : m)) }));
  },
  deleteMeeting: (id) => {
    set((s) => ({ meetings: s.meetings.filter((m) => m.id !== id) }));
  },

  // Tasks
  addTask: (t) => {
    set((s) => ({ tasks: [{ ...t, id: nextId(), status: 'Pending' }, ...s.tasks] }));
  },
  updateTaskStatus: (id, status) => {
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, status, completedDate: status === 'Completed' ? todayISO() : t.completedDate } : t
      ),
    }));
  },
  deleteTask: (id) => {
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
  },
  getOverdueTasks: () => {
    return get().tasks.filter((t) => t.status === 'Overdue' || (t.status !== 'Completed' && t.dueDate < todayISO()));
  },
  getPendingTasks: () => {
    return get().tasks.filter((t) => t.status === 'Pending');
  },

  // Stats — populated by dashboard with cross-store data
  getAdminStats: () => {
    const s = get();
    return {
      pendingLeave: 0,
      pendingRequisitions: 0,
      pendingProcurement: 0,
      pendingExeats: 0,
      openFacilities: s.getOpenFacilities().length,
      overdueCompliance: s.getOverdueCompliance().length,
      pendingTasks: s.getPendingTasks().length,
      scheduledMeetings: s.meetings.filter((m) => m.status === 'Scheduled').length,
      totalStaff: 0,
      activeStudents: 0,
      openIncidents: 0,
    };
  },
}));
