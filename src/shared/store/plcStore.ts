import { create } from 'zustand';
import { apiClient } from '@shared/api/apiClient';

// ── Types ──

export type MeetingStatus = 'Scheduled' | 'Completed' | 'Cancelled';
export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused';
export type ActionItemStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Overdue';
export type DutyDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
export type ObservationRating = 'Excellent' | 'Good' | 'Satisfactory' | 'Needs Improvement' | 'Unsatisfactory';
export type PLCReqStatus = 'Pending' | 'Approved' | 'Rejected' | 'Fulfilled';

export interface AttendanceRecord {
  teacherName: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface PLCMeeting {
  id: string;
  date: string;
  topic: string;
  facilitator: string;
  location: string;
  startTime: string;
  endTime: string;
  status: MeetingStatus;
  agenda: string;
  minutes: string;
  attendance: AttendanceRecord[];
  createdBy: string;
}

export interface DutyRosterEntry {
  id: string;
  coordinator: string;
  day: DutyDay;
  responsibility: string;
  timeSlot: string;
  notes: string;
}

export interface CriticalFriendObservation {
  id: string;
  date: string;
  teacherName: string;
  observedTeacher: string;
  subject: string;
  classForm: string;
  lessonTopic: string;
  observerName: string;
  rating: ObservationRating;
  strengths: string;
  improvements: string;
  questionsRaised: string;
  studentEngagement: ObservationRating;
  classroomManagement: ObservationRating;
  instructionalClarity: ObservationRating;
  recommendations: string;
  followUpAction: string;
  status: 'Submitted' | 'Reviewed' | 'Discussed';
  submittedAt: string;
}

export interface PLCLessonStudy {
  id: string;
  date: string;
  teacherObserved: string;
  subject: string;
  observer: string;
  notes: string;
  meetingId?: string;
}

export interface PLCPerformanceReview {
  id: string;
  date: string;
  focusArea: string;
  keyFinding: string;
  dataSummary: string;
  meetingId?: string;
}

export interface PLCResource {
  id: string;
  title: string;
  sharedBy: string;
  date: string;
  category: string;
  description: string;
}

export interface PLCActionItem {
  id: string;
  session: string;
  action: string;
  owner: string;
  due: string;
  status: ActionItemStatus;
  meetingId?: string;
}

export interface PLCRequisition {
  id: string;
  date: string;
  itemName: string;
  quantity: number;
  unit: string;
  purpose: string;
  requestedBy: string;
  status: PLCReqStatus;
  approvedBy: string;
  approvedDate: string;
  notes: string;
}

// ── Constants ──

export const MEETING_STATUSES: MeetingStatus[] = ['Scheduled', 'Completed', 'Cancelled'];
export const ATTENDANCE_STATUSES: AttendanceStatus[] = ['Present', 'Absent', 'Late', 'Excused'];
export const ACTION_ITEM_STATUSES: ActionItemStatus[] = ['Not Started', 'In Progress', 'Completed', 'Overdue'];
export const DUTY_DAYS: DutyDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const OBSERVATION_RATINGS: ObservationRating[] = ['Excellent', 'Good', 'Satisfactory', 'Needs Improvement', 'Unsatisfactory'];
export const PLC_REQ_STATUSES: PLCReqStatus[] = ['Pending', 'Approved', 'Rejected', 'Fulfilled'];
export const RESOURCE_CATEGORIES = ['Lesson Plan', 'Worksheet', 'Assessment', 'Strategy', 'Reference', 'Other'];

let idCounter = 0;
const nextId = () => `plc-${++idCounter}`;
const todayISO = () => new Date().toISOString().slice(0, 10);

// ── Initial Data ──

const INITIAL_MEETINGS: PLCMeeting[] = [];

const INITIAL_DUTY: DutyRosterEntry[] = [];

const INITIAL_OBSERVATIONS: CriticalFriendObservation[] = [];

const INITIAL_LESSON_STUDIES: PLCLessonStudy[] = [];

const INITIAL_PERFORMANCE: PLCPerformanceReview[] = [];

const INITIAL_RESOURCES: PLCResource[] = [];

const INITIAL_ACTIONS: PLCActionItem[] = [];

const INITIAL_REQUISITIONS: PLCRequisition[] = [];

// ── Store ──

interface PLCState {
  meetings: PLCMeeting[];
  dutyRoster: DutyRosterEntry[];
  observations: CriticalFriendObservation[];
  lessonStudies: PLCLessonStudy[];
  performanceReviews: PLCPerformanceReview[];
  resources: PLCResource[];
  actionItems: PLCActionItem[];
  requisitions: PLCRequisition[];

  // Meeting actions
  addMeeting: (meeting: Omit<PLCMeeting, 'id' | 'attendance' | 'minutes'>) => void;
  updateMeeting: (id: string, updates: Partial<PLCMeeting>) => void;
  deleteMeeting: (id: string) => void;
  markAttendance: (meetingId: string, teacherName: string, status: AttendanceStatus, notes?: string) => void;
  recordMinutes: (meetingId: string, minutes: string) => void;

  // Duty roster
  addDuty: (duty: Omit<DutyRosterEntry, 'id'>) => void;
  updateDuty: (id: string, updates: Partial<DutyRosterEntry>) => void;
  deleteDuty: (id: string) => void;

  // Observations
  addObservation: (obs: Omit<CriticalFriendObservation, 'id' | 'submittedAt' | 'status'>) => void;
  updateObservationStatus: (id: string, status: 'Submitted' | 'Reviewed' | 'Discussed') => void;
  deleteObservation: (id: string) => void;

  // Lesson study
  addLessonStudy: (ls: Omit<PLCLessonStudy, 'id'>) => void;
  deleteLessonStudy: (id: string) => void;

  // Performance
  addPerformance: (p: Omit<PLCPerformanceReview, 'id'>) => void;
  deletePerformance: (id: string) => void;

  // Resources
  addResource: (r: Omit<PLCResource, 'id'>) => void;
  deleteResource: (id: string) => void;

  // Action items
  addActionItem: (a: Omit<PLCActionItem, 'id'>) => void;
  updateActionStatus: (id: string, status: ActionItemStatus) => void;
  deleteActionItem: (id: string) => void;

  // Requisitions
  addRequisition: (r: Omit<PLCRequisition, 'id' | 'status' | 'approvedBy' | 'approvedDate' | 'notes'>) => void;
  approveRequisition: (id: string, approvedBy: string) => void;
  rejectRequisition: (id: string, approvedBy: string) => void;
  deleteRequisition: (id: string) => void;

  // Backend load methods
  loadMeetings: () => Promise<void>;
  loadRequisitions: () => Promise<void>;
  loadResources: () => Promise<void>;
  loadAll: () => Promise<void>;
}

export const usePLCStore = create<PLCState>((set, get) => ({
  meetings: INITIAL_MEETINGS,
  dutyRoster: INITIAL_DUTY,
  observations: INITIAL_OBSERVATIONS,
  lessonStudies: INITIAL_LESSON_STUDIES,
  performanceReviews: INITIAL_PERFORMANCE,
  resources: INITIAL_RESOURCES,
  actionItems: INITIAL_ACTIONS,
  requisitions: INITIAL_REQUISITIONS,

  addMeeting: (meeting) => {
    const id = nextId();
    set((s) => ({ meetings: [{ ...meeting, id, attendance: [], minutes: '' }, ...s.meetings] }));
  },
  updateMeeting: (id, updates) => {
    set((s) => ({ meetings: s.meetings.map(m => m.id === id ? { ...m, ...updates } : m) }));
  },
  deleteMeeting: (id) => {
    set((s) => ({ meetings: s.meetings.filter(m => m.id !== id) }));
  },
  markAttendance: (meetingId, teacherName, status, notes) => {
    set((s) => ({
      meetings: s.meetings.map(m => {
        if (m.id !== meetingId) return m;
        const existing = m.attendance.find(a => a.teacherName === teacherName);
        if (existing) {
          return { ...m, attendance: m.attendance.map(a => a.teacherName === teacherName ? { ...a, status, notes } : a) };
        }
        return { ...m, attendance: [...m.attendance, { teacherName, status, notes }] };
      }),
    }));
  },
  recordMinutes: (meetingId, minutes) => {
    set((s) => ({ meetings: s.meetings.map(m => m.id === meetingId ? { ...m, minutes, status: 'Completed' as MeetingStatus } : m) }));
  },

  addDuty: (duty) => {
    const id = nextId();
    set((s) => ({ dutyRoster: [...s.dutyRoster, { ...duty, id }] }));
  },
  updateDuty: (id, updates) => {
    set((s) => ({ dutyRoster: s.dutyRoster.map(d => d.id === id ? { ...d, ...updates } : d) }));
  },
  deleteDuty: (id) => {
    set((s) => ({ dutyRoster: s.dutyRoster.filter(d => d.id !== id) }));
  },

  addObservation: (obs) => {
    const id = nextId();
    set((s) => ({ observations: [{ ...obs, id, submittedAt: new Date().toISOString(), status: 'Submitted' }, ...s.observations] }));
  },
  updateObservationStatus: (id, status) => {
    set((s) => ({ observations: s.observations.map(o => o.id === id ? { ...o, status } : o) }));
  },
  deleteObservation: (id) => {
    set((s) => ({ observations: s.observations.filter(o => o.id !== id) }));
  },

  addLessonStudy: (ls) => {
    const id = nextId();
    set((s) => ({ lessonStudies: [{ ...ls, id }, ...s.lessonStudies] }));
  },
  deleteLessonStudy: (id) => {
    set((s) => ({ lessonStudies: s.lessonStudies.filter(l => l.id !== id) }));
  },

  addPerformance: (p) => {
    const id = nextId();
    set((s) => ({ performanceReviews: [{ ...p, id }, ...s.performanceReviews] }));
  },
  deletePerformance: (id) => {
    set((s) => ({ performanceReviews: s.performanceReviews.filter(p => p.id !== id) }));
  },

  addResource: (r) => {
    const id = nextId();
    set((s) => ({ resources: [{ ...r, id }, ...s.resources] }));
  },
  deleteResource: (id) => {
    set((s) => ({ resources: s.resources.filter(r => r.id !== id) }));
  },

  addActionItem: (a) => {
    const id = nextId();
    set((s) => ({ actionItems: [{ ...a, id }, ...s.actionItems] }));
  },
  updateActionStatus: (id, status) => {
    set((s) => ({ actionItems: s.actionItems.map(a => a.id === id ? { ...a, status } : a) }));
  },
  deleteActionItem: (id) => {
    set((s) => ({ actionItems: s.actionItems.filter(a => a.id !== id) }));
  },

  addRequisition: (r) => {
    const id = nextId();
    set((s) => ({ requisitions: [{ ...r, id, status: 'Pending' as PLCReqStatus, approvedBy: '', approvedDate: '', notes: '' }, ...s.requisitions] }));
  },
  approveRequisition: (id, approvedBy) => {
    set((s) => ({ requisitions: s.requisitions.map(r => r.id === id ? { ...r, status: 'Approved' as PLCReqStatus, approvedBy, approvedDate: todayISO() } : r) }));
  },
  rejectRequisition: (id, approvedBy) => {
    set((s) => ({ requisitions: s.requisitions.map(r => r.id === id ? { ...r, status: 'Rejected' as PLCReqStatus, approvedBy, approvedDate: todayISO() } : r) }));
  },
  deleteRequisition: (id) => {
    set((s) => ({ requisitions: s.requisitions.filter(r => r.id !== id) }));
  },

  loadMeetings: async () => {
    try {
      const data = await apiClient.get<any[]>('/plc/meetings');
      set({ meetings: (data || []).map((d) => ({ ...d, id: d.id || `plc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` })) });
    } catch {}
  },
  loadRequisitions: async () => {
    try {
      const data = await apiClient.get<any[]>('/plc/requisitions');
      set({ requisitions: (data || []).map((d) => ({ ...d, id: d.id || `plc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` })) });
    } catch {}
  },
  loadResources: async () => {
    try {
      const data = await apiClient.get<any[]>('/plc/resources');
      set({ resources: (data || []).map((d) => ({ ...d, id: d.id || `plc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` })) });
    } catch {}
  },
  loadAll: async () => {
    await Promise.all([
      get().loadMeetings(),
      get().loadRequisitions(),
      get().loadResources(),
    ]);
  },

}));
