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

const INITIAL_NOTICES: StaffNotice[] = [
  { id: '1', title: 'Staff Meeting — July 10, 3pm', body: 'All teaching staff are required to attend the mid-term review meeting in the main hall. Agenda includes exam preparation, curriculum alignment, and student welfare updates.', date: '2026-07-06', priority: 'Important', postedBy: 'Headmaster' },
  { id: '2', title: 'Term 3 Exam Timetable Published', body: 'The exam schedule for Term 3 has been published. Please review your invigilation duties and confirm availability with the Academic Office by July 8.', date: '2026-07-04', priority: 'Urgent', postedBy: 'Academic Office' },
  { id: '3', title: 'Professional Development Workshop', body: 'A workshop on digital teaching tools and e-learning platforms will be held on July 15. All staff are encouraged to attend. Certificates will be issued.', date: '2026-06-28', priority: 'Normal', postedBy: 'Staff Development' },
  { id: '4', title: 'End of Term Staff Appraisal', body: 'Staff appraisal forms are now available. Please complete self-assessment by July 20 and submit to your HOD for review.', date: '2026-06-25', priority: 'Important', postedBy: 'HR Office' },
  { id: '5', title: 'School Calendar Update — Term 1 2026/2027', body: 'The approved calendar for Term 1 has been circulated. Opening date for staff is September 7, 2026. Students report September 10.', date: '2026-06-20', priority: 'Normal', postedBy: 'Headmaster' },
];

const INITIAL_MINUTES: MeetingMinutes[] = [
  { id: '1', date: '2026-06-20', topic: 'End of Term 2 Review', attendees: 62, facilitator: 'Headmaster', location: 'Main Hall', keyDecisions: 'Term 2 exams completed successfully; 3 students flagged for academic support; staff appraisal timeline approved.', actionItems: 'HODs to submit term reports by June 25; Counselling team to follow up on flagged students.', minutes: 'Meeting opened at 3:00pm with a prayer. Headmaster welcomed all staff. Academic performance review presented by Vice Principal. 92% pass rate achieved. Discipline report showed 15% reduction in incidents. Financial report presented by Accountant. Meeting adjourned at 4:30pm.' },
  { id: '2', date: '2026-05-15', topic: 'Exam Preparation Strategy', attendees: 58, facilitator: 'Vice Principal (Academic)', location: 'Staff Common Room', keyDecisions: 'Exam question format standardized; invigilation roster finalized; remedial classes approved for struggling students.', actionItems: 'All teachers to submit questions by May 20; Department heads to coordinate invigilation schedule.', minutes: 'Meeting commenced at 2:30pm. Vice Principal outlined exam preparation timeline. Standardized question format discussed and adopted. Invigilation duties assigned across departments. Remedial classes scheduled for Saturdays. Meeting ended at 4:00pm.' },
  { id: '3', date: '2026-04-10', topic: 'Curriculum Planning — Term 3', attendees: 65, facilitator: 'Headmaster', location: 'Main Hall', keyDecisions: 'New ICT curriculum integration approved; cross-curricular reading program launched; assessment weights adjusted.', actionItems: 'ICT HOD to prepare implementation plan; English department to design reading program framework.', minutes: 'Meeting started at 3:00pm. Curriculum coordinator presented Term 3 plan. ICT integration discussed extensively — approved with minor revisions. Reading program received unanimous support. Assessment weights adjusted to 40% continuous, 60% exam. Meeting closed at 4:45pm.' },
  { id: '4', date: '2026-03-05', topic: 'Staff Welfare & Development', attendees: 60, facilitator: 'Staff Development Officer', location: 'Staff Common Room', keyDecisions: 'Mentorship program for new staff approved; professional development budget increased by 15%; staff lounge renovation approved.', actionItems: 'HR to pair mentors with mentees by March 15; Facilities to begin lounge renovation during Easter break.', minutes: 'Meeting opened at 2:00pm. Welfare committee presented survey results. Staff satisfaction at 78%. Mentorship program designed and approved. Budget increase approved by Headmaster. Renovation plans reviewed. Meeting adjourned at 3:30pm.' },
];

const INITIAL_RESOURCES: StaffResource[] = [
  { id: '1', name: 'Lesson Plan Template', type: 'Template', uploaded: '2026-06-15', uploadedBy: 'Academic Office', description: 'Standard lesson plan format with learning objectives, activities, and assessment sections.', size: '45 KB' },
  { id: '2', name: 'Report Card Format', type: 'Form', uploaded: '2026-06-10', uploadedBy: 'Academic Office', description: 'Official report card template for end-of-term grades and comments.', size: '120 KB' },
  { id: '3', name: 'GES Curriculum Guide', type: 'Document', uploaded: '2026-05-20', uploadedBy: 'Curriculum Coordinator', description: 'Ghana Education Service curriculum guide for senior high schools.', size: '3.2 MB' },
  { id: '4', name: 'Exam Question Template', type: 'Template', uploaded: '2026-05-15', uploadedBy: 'Academic Office', description: 'Standardized exam question paper template with header, sections, and marking scheme.', size: '68 KB' },
  { id: '5', name: 'Staff Code of Conduct', type: 'Policy', uploaded: '2026-01-10', uploadedBy: 'HR Office', description: 'Official staff code of conduct and professional ethics guidelines.', size: '210 KB' },
  { id: '6', name: 'Digital Teaching Tools Guide', type: 'Document', uploaded: '2026-06-28', uploadedBy: 'Staff Development', description: 'Guide on using digital platforms for teaching, including Google Classroom and Zoom.', size: '1.8 MB' },
  { id: '7', name: 'Invigilation Guidelines', type: 'Policy', uploaded: '2026-07-01', uploadedBy: 'Academic Office', description: 'Rules and procedures for exam invigilation duties.', size: '95 KB' },
];

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
}));
