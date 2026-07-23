import { create } from 'zustand';

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

const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  { id: '1', staffName: 'J. Mensah', staffRole: 'Senior Teacher', dateSubmitted: '2026-07-05', startDate: '2026-07-15', endDate: '2026-07-20', type: 'Annual', reason: 'Family vacation planned during mid-term break.', status: 'Pending' },
  { id: '2', staffName: 'G. Adjei', staffRole: 'HOD', dateSubmitted: '2026-05-10', startDate: '2026-05-20', endDate: '2026-05-25', type: 'Sick', reason: 'Medical procedure and recovery period.', status: 'Approved', reviewedBy: 'Headmaster', reviewDate: '2026-05-12', reviewNotes: 'Approved. Arrangements made for class coverage.' },
  { id: '3', staffName: 'F. Boateng', staffRole: 'Teacher', dateSubmitted: '2026-03-01', startDate: '2026-03-10', endDate: '2026-03-15', type: 'Personal', reason: 'Personal family matters requiring attention.', status: 'Approved', reviewedBy: 'Headmaster', reviewDate: '2026-03-03', reviewNotes: 'Approved with coverage arrangements.' },
  { id: '4', staffName: 'A. Tetteh', staffRole: 'Accountant', dateSubmitted: '2026-06-15', startDate: '2026-07-01', endDate: '2026-07-30', type: 'Study', reason: 'Professional certification course in financial management.', status: 'Approved', reviewedBy: 'Headmaster', reviewDate: '2026-06-18', reviewNotes: 'Approved. Temp cover arranged from finance office.' },
  { id: '5', staffName: 'M. Owusu', staffRole: 'Teacher', dateSubmitted: '2026-07-08', startDate: '2026-07-12', endDate: '2026-07-14', type: 'Sick', reason: 'Severe malaria diagnosis, doctor recommends rest.', status: 'Pending' },
];

const INITIAL_DIRECTORY: StaffDirectoryEntry[] = [
  { id: '1', name: 'J. Mensah', role: 'Senior Teacher', position: 'Senior Teacher (Mathematics)', department: 'Mathematics', phone: '024-100-2001', email: 'j.mensah@sims.edu', status: 'Active' },
  { id: '2', name: 'G. Adjei', role: 'HOD', position: 'HOD Science', department: 'Science', phone: '027-100-2002', email: 'g.adjei@sims.edu', status: 'Active' },
  { id: '3', name: 'F. Boateng', role: 'Teacher', position: 'Teacher (English)', department: 'English', phone: '020-100-2003', email: 'f.boateng@sims.edu', status: 'Active' },
  { id: '4', name: 'A. Tetteh', role: 'Accountant', position: 'School Accountant', department: 'Finance', phone: '055-100-2004', email: 'a.tetteh@sims.edu', status: 'On Leave' },
  { id: '5', name: 'M. Owusu', role: 'Teacher', position: 'Teacher (ICT)', department: 'ICT', phone: '024-100-2005', email: 'm.owusu@sims.edu', status: 'Active' },
  { id: '6', name: 'D. Asante', role: 'Counsellor', position: 'School Counsellor', department: 'Counselling', phone: '027-100-2006', email: 'd.asante@sims.edu', status: 'Active' },
  { id: '7', name: 'C. Dankwah', role: 'Coach', position: 'Sports Coach', department: 'Physical Education', phone: '020-100-2007', email: 'c.dankwah@sims.edu', status: 'Active' },
  { id: '8', name: 'L. Frimpong', role: 'Librarian', position: 'School Librarian', department: 'Library', phone: '055-100-2008', email: 'l.frimpong@sims.edu', status: 'Active' },
  { id: '9', name: 'P. Nyarko', role: 'HOD', position: 'HOD Arts', department: 'Arts & Humanities', phone: '024-100-2009', email: 'p.nyarko@sims.edu', status: 'Active' },
  { id: '10', name: 'R. Amponsah', role: 'Administrator', position: 'Assistant Headmaster (Academic)', department: 'Administration', phone: '027-100-2010', email: 'r.amponsah@sims.edu', status: 'Active' },
];

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

  submitLeave: (req) => {
    const newReq: LeaveRequest = {
      ...req,
      id: nextId(),
      dateSubmitted: todayISO(),
      status: 'Pending',
    };
    set((s) => ({ leaveRequests: [newReq, ...s.leaveRequests] }));
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

  addDirectoryEntry: (entry) => {
    set((s) => ({ directory: [...s.directory, { ...entry, id: nextId() }] }));
  },
  deleteDirectoryEntry: (id) => {
    set((s) => ({ directory: s.directory.filter((d) => d.id !== id) }));
  },
}));
