import { create } from 'zustand';
import { apiClient } from '@shared/api/apiClient';

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

// ── New Types for GES Responsibilities ──

export type CorrespondenceDirection = 'Incoming' | 'Outgoing';
export type CorrespondenceStatus = 'Received' | 'Minuted' | 'Forwarded' | 'Actioned' | 'Filed';

export interface Correspondence {
  id: string;
  refNo: string;
  direction: CorrespondenceDirection;
  date: string;
  from: string;
  to: string;
  subject: string;
  status: CorrespondenceStatus;
  minutedTo?: string;
  minuteNote?: string;
  forwardedDate?: string;
  filedBy?: string;
  notes: string;
}

export type BoardMeetingStatus = 'Scheduled' | 'Completed' | 'Cancelled';

export interface BoardMeeting {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  chairperson: string;
  agenda: string;
  attendees: number;
  status: BoardMeetingStatus;
  minutes?: string;
  keyDecisions?: string;
  actionItems?: string;
  policyDocuments?: string;
}

export type DocumentType = 'Testimonial' | 'Letter of Consent' | 'Introductory Letter' | 'Assurance' | 'Reference Letter' | 'Recommendation Letter';
export type DocumentStatus = 'Draft' | 'Approved' | 'Issued';

export interface DraftDocument {
  id: string;
  type: DocumentType;
  date: string;
  recipient: string;
  subject: string;
  body: string;
  status: DocumentStatus;
  draftedBy: string;
  approvedBy?: string;
  issuedDate?: string;
}

export type FunctionStatus = 'Planning' | 'Confirmed' | 'Completed' | 'Cancelled';

export interface OfficialFunction {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  type: string;
  status: FunctionStatus;
  expectedAttendees: number;
  logistics: string;
  budget: number;
  coordinator: string;
  notes: string;
}

export type SRCRequestStatus = 'Pending' | 'Approved' | 'Rejected';
export type SRCRequestType = 'Event' | 'Budget' | 'Grievance' | 'Initiative';

export interface SRCActivity {
  id: string;
  date: string;
  type: SRCRequestType;
  title: string;
  description: string;
  requestedBy: string;
  status: SRCRequestStatus;
  amount?: number;
  reviewedBy?: string;
  reviewNote?: string;
}

export type DisciplineSeverity = 'Minor' | 'Moderate' | 'Major' | 'Critical';
export type DisciplineStatus = 'Reported' | 'Under Review' | 'Actioned' | 'Escalated' | 'Resolved';

export interface DisciplineCase {
  id: string;
  date: string;
  studentName: string;
  admissionNo: string;
  class: string;
  house: string;
  incident: string;
  severity: DisciplineSeverity;
  status: DisciplineStatus;
  reportedBy: string;
  actionTaken: string;
  escalatedTo?: string;
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

export const CORRESPONDENCE_DIRECTIONS: CorrespondenceDirection[] = ['Incoming', 'Outgoing'];
export const CORRESPONDENCE_STATUSES: CorrespondenceStatus[] = ['Received', 'Minuted', 'Forwarded', 'Actioned', 'Filed'];
export const BOARD_MEETING_STATUSES: BoardMeetingStatus[] = ['Scheduled', 'Completed', 'Cancelled'];
export const DOCUMENT_TYPES: DocumentType[] = ['Testimonial', 'Letter of Consent', 'Introductory Letter', 'Assurance', 'Reference Letter', 'Recommendation Letter'];
export const DOCUMENT_STATUSES: DocumentStatus[] = ['Draft', 'Approved', 'Issued'];
export const FUNCTION_STATUSES: FunctionStatus[] = ['Planning', 'Confirmed', 'Completed', 'Cancelled'];
export const SRC_REQUEST_TYPES: SRCRequestType[] = ['Event', 'Budget', 'Grievance', 'Initiative'];
export const SRC_REQUEST_STATUSES: SRCRequestStatus[] = ['Pending', 'Approved', 'Rejected'];
export const DISCIPLINE_SEVERITIES: DisciplineSeverity[] = ['Minor', 'Moderate', 'Major', 'Critical'];
export const DISCIPLINE_STATUSES: DisciplineStatus[] = ['Reported', 'Under Review', 'Actioned', 'Escalated', 'Resolved'];

// ── Helpers ──

let idCounter = 0;
const nextId = () => `adm-${++idCounter}`;
const todayISO = () => new Date().toISOString().slice(0, 10);

// ── Initial Data ──

const INITIAL_COMPLIANCE: ComplianceItem[] = [];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [];

const INITIAL_FACILITIES: FacilityIssue[] = [];

const INITIAL_MEETINGS: AdminMeeting[] = [];

const INITIAL_TASKS: TaskAssignment[] = [];

const INITIAL_CORRESPONDENCE: Correspondence[] = [];
const INITIAL_BOARD_MEETINGS: BoardMeeting[] = [];
const INITIAL_DOCUMENTS: DraftDocument[] = [];
const INITIAL_FUNCTIONS: OfficialFunction[] = [];
const INITIAL_SRC_ACTIVITIES: SRCActivity[] = [];
const INITIAL_DISCIPLINE_CASES: DisciplineCase[] = [];

// ── Store ──

interface AdminState {
  compliance: ComplianceItem[];
  announcements: Announcement[];
  facilities: FacilityIssue[];
  meetings: AdminMeeting[];
  tasks: TaskAssignment[];
  correspondence: Correspondence[];
  boardMeetings: BoardMeeting[];
  documents: DraftDocument[];
  functions: OfficialFunction[];
  srcActivities: SRCActivity[];
  disciplineCases: DisciplineCase[];

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

  // Correspondence
  addCorrespondence: (c: Omit<Correspondence, 'id'>) => void;
  updateCorrespondence: (id: string, updates: Partial<Correspondence>) => void;
  minuteCorrespondence: (id: string, minutedTo: string, minuteNote: string, by: string) => void;
  deleteCorrespondence: (id: string) => void;
  getPendingCorrespondence: () => Correspondence[];

  // Board Meetings
  addBoardMeeting: (m: Omit<BoardMeeting, 'id' | 'status' | 'attendees'>) => void;
  completeBoardMeeting: (id: string, minutes: string, decisions: string, actions: string, attendees: number, policyDocs: string) => void;
  cancelBoardMeeting: (id: string) => void;
  deleteBoardMeeting: (id: string) => void;

  // Documents
  addDocument: (d: Omit<DraftDocument, 'id' | 'date' | 'status'>) => void;
  approveDocument: (id: string, approvedBy: string) => void;
  issueDocument: (id: string) => void;
  deleteDocument: (id: string) => void;
  getDraftDocuments: () => DraftDocument[];

  // Official Functions
  addFunction: (f: Omit<OfficialFunction, 'id' | 'status'>) => void;
  updateFunction: (id: string, updates: Partial<OfficialFunction>) => void;
  deleteFunction: (id: string) => void;
  getUpcomingFunctions: () => OfficialFunction[];

  // SRC Activities
  addSRCActivity: (a: Omit<SRCActivity, 'id' | 'date' | 'status'>) => void;
  reviewSRCActivity: (id: string, status: 'Approved' | 'Rejected', reviewedBy: string, note: string) => void;
  deleteSRCActivity: (id: string) => void;
  getPendingSRC: () => SRCActivity[];

  // Discipline Cases
  addDisciplineCase: (d: Omit<DisciplineCase, 'id' | 'date' | 'status'>) => void;
  updateDisciplineCase: (id: string, updates: Partial<DisciplineCase>) => void;
  escalateDisciplineCase: (id: string, escalatedTo: string) => void;
  deleteDisciplineCase: (id: string) => void;
  getEscalatedCases: () => DisciplineCase[];

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

  // Backend load methods
  loadCompliance: () => Promise<void>;
  loadFacilities: () => Promise<void>;
  loadTasks: () => Promise<void>;
  loadAll: () => Promise<void>;
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

  loadCompliance: async () => {
    try {
      const data = await apiClient.get<any[]>('/admin/compliance');
      set({ compliance: (data || []).map((d) => ({ ...d, id: d.id || `adm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` })) });
    } catch {}
  },
  loadFacilities: async () => {
    try {
      const data = await apiClient.get<any[]>('/admin/facilities');
      set({ facilities: (data || []).map((d) => ({ ...d, id: d.id || `adm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` })) });
    } catch {}
  },
  loadTasks: async () => {
    try {
      const data = await apiClient.get<any[]>('/admin/tasks');
      set({ tasks: (data || []).map((d) => ({ ...d, id: d.id || `adm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` })) });
    } catch {}
  },
  loadAll: async () => {
    await Promise.all([
      get().loadCompliance(),
      get().loadFacilities(),
      get().loadTasks(),
    ]);
  },

  // ── Correspondence ──
  correspondence: INITIAL_CORRESPONDENCE,
  addCorrespondence: (c) => {
    set((s) => ({ correspondence: [{ ...c, id: nextId() }, ...s.correspondence] }));
  },
  updateCorrespondence: (id, updates) => {
    set((s) => ({ correspondence: s.correspondence.map((c) => (c.id === id ? { ...c, ...updates } : c)) }));
  },
  minuteCorrespondence: (id, minutedTo, minuteNote, by) => {
    set((s) => ({ correspondence: s.correspondence.map((c) => (c.id === id ? { ...c, status: 'Minuted', minutedTo, minuteNote, forwardedDate: todayISO(), filedBy: by } : c)) }));
  },
  deleteCorrespondence: (id) => {
    set((s) => ({ correspondence: s.correspondence.filter((c) => c.id !== id) }));
  },
  getPendingCorrespondence: () => {
    return get().correspondence.filter((c) => c.status === 'Received' || c.status === 'Minuted');
  },

  // ── Board Meetings ──
  boardMeetings: INITIAL_BOARD_MEETINGS,
  addBoardMeeting: (m) => {
    set((s) => ({ boardMeetings: [...s.boardMeetings, { ...m, id: nextId(), status: 'Scheduled', attendees: 0 }] }));
  },
  completeBoardMeeting: (id, minutes, decisions, actions, attendees, policyDocs) => {
    set((s) => ({ boardMeetings: s.boardMeetings.map((m) => (m.id === id ? { ...m, status: 'Completed', minutes, keyDecisions: decisions, actionItems: actions, attendees, policyDocuments: policyDocs } : m)) }));
  },
  cancelBoardMeeting: (id) => {
    set((s) => ({ boardMeetings: s.boardMeetings.map((m) => (m.id === id ? { ...m, status: 'Cancelled' } : m)) }));
  },
  deleteBoardMeeting: (id) => {
    set((s) => ({ boardMeetings: s.boardMeetings.filter((m) => m.id !== id) }));
  },

  // ── Documents ──
  documents: INITIAL_DOCUMENTS,
  addDocument: (d) => {
    set((s) => ({ documents: [{ ...d, id: nextId(), date: todayISO(), status: 'Draft' }, ...s.documents] }));
  },
  approveDocument: (id, approvedBy) => {
    set((s) => ({ documents: s.documents.map((d) => (d.id === id ? { ...d, status: 'Approved', approvedBy } : d)) }));
  },
  issueDocument: (id) => {
    set((s) => ({ documents: s.documents.map((d) => (d.id === id ? { ...d, status: 'Issued', issuedDate: todayISO() } : d)) }));
  },
  deleteDocument: (id) => {
    set((s) => ({ documents: s.documents.filter((d) => d.id !== id) }));
  },
  getDraftDocuments: () => {
    return get().documents.filter((d) => d.status === 'Draft');
  },

  // ── Official Functions ──
  functions: INITIAL_FUNCTIONS,
  addFunction: (f) => {
    set((s) => ({ functions: [{ ...f, id: nextId(), status: 'Planning' }, ...s.functions] }));
  },
  updateFunction: (id, updates) => {
    set((s) => ({ functions: s.functions.map((f) => (f.id === id ? { ...f, ...updates } : f)) }));
  },
  deleteFunction: (id) => {
    set((s) => ({ functions: s.functions.filter((f) => f.id !== id) }));
  },
  getUpcomingFunctions: () => {
    return get().functions.filter((f) => f.status === 'Planning' || f.status === 'Confirmed');
  },

  // ── SRC Activities ──
  srcActivities: INITIAL_SRC_ACTIVITIES,
  addSRCActivity: (a) => {
    set((s) => ({ srcActivities: [{ ...a, id: nextId(), date: todayISO(), status: 'Pending' }, ...s.srcActivities] }));
  },
  reviewSRCActivity: (id, status, reviewedBy, note) => {
    set((s) => ({ srcActivities: s.srcActivities.map((a) => (a.id === id ? { ...a, status, reviewedBy, reviewNote: note } : a)) }));
  },
  deleteSRCActivity: (id) => {
    set((s) => ({ srcActivities: s.srcActivities.filter((a) => a.id !== id) }));
  },
  getPendingSRC: () => {
    return get().srcActivities.filter((a) => a.status === 'Pending');
  },

  // ── Discipline Cases ──
  disciplineCases: INITIAL_DISCIPLINE_CASES,
  addDisciplineCase: (d) => {
    set((s) => ({ disciplineCases: [{ ...d, id: nextId(), date: todayISO(), status: 'Reported' }, ...s.disciplineCases] }));
  },
  updateDisciplineCase: (id, updates) => {
    set((s) => ({ disciplineCases: s.disciplineCases.map((d) => (d.id === id ? { ...d, ...updates } : d)) }));
  },
  escalateDisciplineCase: (id, escalatedTo) => {
    set((s) => ({ disciplineCases: s.disciplineCases.map((d) => (d.id === id ? { ...d, status: 'Escalated', escalatedTo } : d)) }));
  },
  deleteDisciplineCase: (id) => {
    set((s) => ({ disciplineCases: s.disciplineCases.filter((d) => d.id !== id) }));
  },
  getEscalatedCases: () => {
    return get().disciplineCases.filter((d) => d.status === 'Escalated');
  },

}));
