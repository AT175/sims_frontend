import { create } from 'zustand';
import { apiClient } from '@shared/api/apiClient';

// ── Types ──

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';
export type LeaveType = 'Annual' | 'Sick' | 'Personal' | 'Maternity' | 'Study' | 'Compassionate';
export type NoticePriority = 'Normal' | 'Important' | 'Urgent';
export type ResourceType = 'Template' | 'Form' | 'Document' | 'Policy' | 'Video' | 'Link';
export type StaffRole = 'Teacher' | 'HOD' | 'Senior Teacher' | 'Administrator' | 'Accountant' | 'Librarian' | 'Counsellor' | 'Coach';

export interface StaffNotice {
  id: string;
  title: string;
  body: string;
  date: string;
  priority: NoticePriority;
  postedBy: string;
}

export interface MeetingMinutes {
  id: string;
  date: string;
  topic: string;
  attendees: number;
  facilitator: string;
  location: string;
  keyDecisions: string;
  actionItems: string;
  minutes: string;
}

export interface StaffResource {
  id: string;
  name: string;
  type: ResourceType;
  uploaded: string;
  uploadedBy: string;
  description: string;
  size: string;
}

export interface LeaveRequest {
  id: string;
  staffName: string;
  staffRole: StaffRole;
  dateSubmitted: string;
  startDate: string;
  endDate: string;
  type: LeaveType;
  reason: string;
  status: LeaveStatus;
  reviewedBy?: string;
  reviewDate?: string;
  reviewNotes?: string;
}

export interface StaffDirectoryEntry {
  id: string;
  name: string;
  role: StaffRole;
  position: string;
  department: string;
  phone: string;
  email: string;
  status: 'Active' | 'On Leave' | 'Inactive';
}

// ── Constants ──

export const LEAVE_STATUSES: LeaveStatus[] = ['Pending', 'Approved', 'Rejected'];
export const LEAVE_TYPES: LeaveType[] = ['Annual', 'Sick', 'Personal', 'Maternity', 'Study', 'Compassionate'];
export const NOTICE_PRIORITIES: NoticePriority[] = ['Normal', 'Important', 'Urgent'];
export const RESOURCE_TYPES: ResourceType[] = ['Template', 'Form', 'Document', 'Policy', 'Video', 'Link'];
export const STAFF_ROLES: StaffRole[] = ['Teacher', 'HOD', 'Senior Teacher', 'Administrator', 'Accountant', 'Librarian', 'Counsellor', 'Coach'];

// ── Helpers ──

let idCounter = 500;
const nextId = () => String(++idCounter);
const todayISO = () => new Date().toISOString().slice(0, 10);

// ── Initial Data ──

const INITIAL_NOTICES: StaffNotice[] = [];

const INITIAL_MINUTES: MeetingMinutes[] = [];

const INITIAL_RESOURCES: StaffResource[] = [];

const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [];

const INITIAL_DIRECTORY: StaffDirectoryEntry[] = [];

// ── Store ──

interface StaffState {
  notices: StaffNotice[];
  minutes: MeetingMinutes[];
  resources: StaffResource[];
  leaveRequests: LeaveRequest[];
  directory: StaffDirectoryEntry[];

  // Notices
  addNotice: (notice: Omit<StaffNotice, 'id'>) => void;
  deleteNotice: (id: string) => void;

  // Minutes
  addMinutes: (minutes: Omit<MeetingMinutes, 'id'>) => void;
  deleteMinutes: (id: string) => void;

  // Resources
  addResource: (resource: Omit<StaffResource, 'id'>) => void;
  deleteResource: (id: string) => void;

  // Leave
  submitLeave: (req: Omit<LeaveRequest, 'id' | 'dateSubmitted' | 'status'>) => void;
  reviewLeave: (id: string, status: LeaveStatus, reviewedBy: string, notes: string) => void;
  deleteLeave: (id: string) => void;
  getPendingLeave: () => LeaveRequest[];

  // Directory
  addDirectoryEntry: (entry: Omit<StaffDirectoryEntry, 'id'>) => void;
  deleteDirectoryEntry: (id: string) => void;

  // API
  loadDirectory: () => Promise<void>;
  loadLeaveRequests: () => Promise<void>;
  loadAll: () => Promise<void>;
}

export const useStaffStore = create<StaffState>((set, get) => ({
  notices: INITIAL_NOTICES,
  minutes: INITIAL_MINUTES,
  resources: INITIAL_RESOURCES,
  leaveRequests: INITIAL_LEAVE_REQUESTS,
  directory: INITIAL_DIRECTORY,

  addNotice: (notice) => {
    set((s) => ({ notices: [{ ...notice, id: nextId() }, ...s.notices] }));
  },
  deleteNotice: (id) => {
    set((s) => ({ notices: s.notices.filter((n) => n.id !== id) }));
  },

  addMinutes: (minutes) => {
    set((s) => ({ minutes: [{ ...minutes, id: nextId() }, ...s.minutes] }));
  },
  deleteMinutes: (id) => {
    set((s) => ({ minutes: s.minutes.filter((m) => m.id !== id) }));
  },

  addResource: (resource) => {
    set((s) => ({ resources: [{ ...resource, id: nextId() }, ...s.resources] }));
  },
  deleteResource: (id) => {
    set((s) => ({ resources: s.resources.filter((r) => r.id !== id) }));
  },

  submitLeave: async (req) => {
    const newReq: LeaveRequest = { ...req, id: nextId(), dateSubmitted: todayISO(), status: 'Pending' };
    try {
      const created = await apiClient.post<any>('/staff/leave', req);
      set((s) => ({ leaveRequests: [{ ...newReq, id: created.id || nextId() }, ...s.leaveRequests] }));
    } catch {
      set((s) => ({ leaveRequests: [newReq, ...s.leaveRequests] }));
    }
  },
  reviewLeave: (id, status, reviewedBy, notes) => {
    set((s) => ({
      leaveRequests: s.leaveRequests.map((r) =>
        r.id === id ? { ...r, status, reviewedBy, reviewDate: todayISO(), reviewNotes: notes } : r
      ),
    }));
  },
  deleteLeave: (id) => {
    set((s) => ({ leaveRequests: s.leaveRequests.filter((r) => r.id !== id) }));
  },
  getPendingLeave: () => {
    return get().leaveRequests.filter((r) => r.status === 'Pending');
  },

  addDirectoryEntry: async (entry) => {
    try {
      const created = await apiClient.post<any>('/staff', entry);
      set((s) => ({ directory: [...s.directory, { ...entry, id: created.id || nextId() }] }));
    } catch {
      set((s) => ({ directory: [...s.directory, { ...entry, id: nextId() }] }));
    }
  },
  deleteDirectoryEntry: (id) => {
    set((s) => ({ directory: s.directory.filter((d) => d.id !== id) }));
  },

  loadDirectory: async () => {
    try {
      const data = await apiClient.get<any[]>('/staff');
      set({ directory: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadLeaveRequests: async () => {
    try {
      const data = await apiClient.get<any[]>('/staff/leave');
      set({ leaveRequests: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadAll: async () => {
    await Promise.all([
      get().loadDirectory(),
      get().loadLeaveRequests(),
    ]);
  },

}));
