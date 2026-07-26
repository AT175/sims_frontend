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

const INITIAL_COMPLIANCE: ComplianceItem[] = [];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [];

const INITIAL_FACILITIES: FacilityIssue[] = [];

const INITIAL_MEETINGS: AdminMeeting[] = [];

const INITIAL_TASKS: TaskAssignment[] = [];

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

}));
