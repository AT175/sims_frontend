import { create } from 'zustand';

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

const INITIAL_MEETINGS: PLCMeeting[] = [
  {
    id: 'plc-1', date: '2026-07-10', topic: 'Improving Math literacy', facilitator: 'Mr. Owusu',
    location: 'Staff Common Room', startTime: '15:30', endTime: '17:00', status: 'Scheduled',
    agenda: '1. Review SHS1 Math scores\n2. Share differentiated instruction strategies\n3. Plan remedial worksheets',
    minutes: '',
    attendance: [
      { teacherName: 'Mr. Mensah', status: 'Present' },
      { teacherName: 'Mrs. Adjei', status: 'Present' },
      { teacherName: 'Mrs. Boateng', status: 'Present' },
      { teacherName: 'Mr. Adjei', status: 'Present' },
    ],
    createdBy: 'PLC Coordinator',
  },
  {
    id: 'plc-2', date: '2026-06-26', topic: 'Differentiated instruction', facilitator: 'Mrs. Adjei',
    location: 'Staff Common Room', startTime: '15:30', endTime: '17:00', status: 'Completed',
    agenda: '1. Differentiated instruction techniques\n2. Peer observation feedback\n3. Action items',
    minutes: 'Discussed tiered assignments and flexible grouping. Teachers shared examples from their classes. Agreed to pair up for peer observations.',
    attendance: [
      { teacherName: 'Mr. Mensah', status: 'Present' },
      { teacherName: 'Mrs. Adjei', status: 'Present' },
      { teacherName: 'Mrs. Boateng', status: 'Present' },
      { teacherName: 'Mr. Adjei', status: 'Late' },
      { teacherName: 'Mr. Owusu', status: 'Present' },
    ],
    createdBy: 'PLC Coordinator',
  },
  {
    id: 'plc-3', date: '2026-06-12', topic: 'Assessment strategies', facilitator: 'Mrs. Boateng',
    location: 'Staff Common Room', startTime: '15:30', endTime: '17:00', status: 'Completed',
    agenda: '1. Formative vs summative assessment\n2. Rubric design\n3. Data review',
    minutes: 'Reviewed assessment data. Discussed creating common rubrics. Agreed to update assessment rubrics by Jul 1.',
    attendance: [
      { teacherName: 'Mr. Mensah', status: 'Present' },
      { teacherName: 'Mrs. Adjei', status: 'Excused' },
      { teacherName: 'Mrs. Boateng', status: 'Present' },
      { teacherName: 'Mr. Adjei', status: 'Present' },
    ],
    createdBy: 'PLC Coordinator',
  },
];

const INITIAL_DUTY: DutyRosterEntry[] = [
  { id: 'plc-10', coordinator: 'Mr. Owusu', day: 'Monday', responsibility: 'Coordinate Math PLC session', timeSlot: '15:30 - 17:00', notes: 'Bring SHS1 score data' },
  { id: 'plc-11', coordinator: 'Mrs. Adjei', day: 'Tuesday', responsibility: 'Peer observation follow-up', timeSlot: '10:00 - 12:00', notes: 'Observe Mr. Mensah - Elect. Math' },
  { id: 'plc-12', coordinator: 'Mrs. Boateng', day: 'Wednesday', responsibility: 'Resource library update', timeSlot: '13:00 - 14:00', notes: 'Upload new worksheets' },
  { id: 'plc-13', coordinator: 'Mr. Adjei', day: 'Thursday', responsibility: 'Action item monitoring', timeSlot: '09:00 - 10:00', notes: 'Check overdue items' },
  { id: 'plc-14', coordinator: 'Mr. Owusu', day: 'Friday', responsibility: 'Weekly report to Headmaster', timeSlot: '14:00 - 15:00', notes: 'Compile attendance and action items' },
];

const INITIAL_OBSERVATIONS: CriticalFriendObservation[] = [
  {
    id: 'plc-20', date: '2026-07-03', teacherName: 'Mr. Mensah', observedTeacher: 'Mr. Mensah',
    subject: 'Elect. Math', classForm: 'SHS2 Sci A', lessonTopic: 'Quadratic equations',
    observerName: 'Mr. Owusu', rating: 'Good',
    strengths: 'Strong questioning technique, good use of board work to build concepts step by step',
    improvements: 'Could increase wait time after questions to allow deeper thinking',
    questionsRaised: 'How might we support students who struggle with factoring?',
    studentEngagement: 'Good', classroomManagement: 'Excellent', instructionalClarity: 'Good',
    recommendations: 'Try think-pair-share before answering to increase participation',
    followUpAction: 'Mr. Mensah to try think-pair-share in next lesson and report back',
    status: 'Discussed', submittedAt: '2026-07-03T10:00:00.000Z',
  },
  {
    id: 'plc-21', date: '2026-06-28', teacherName: 'Mrs. Adjei', observedTeacher: 'Mrs. Adjei',
    subject: 'Core Math', classForm: 'SHS1 Arts B', lessonTopic: 'Linear equations',
    observerName: 'Mr. Mensah', rating: 'Excellent',
    strengths: 'Excellent use of visual aids and real-world examples. Students were highly engaged.',
    improvements: 'Some students finished early — could have extension activities ready',
    questionsRaised: 'What extension tasks work well for fast finishers?',
    studentEngagement: 'Excellent', classroomManagement: 'Excellent', instructionalClarity: 'Excellent',
    recommendations: 'Prepare extension task cards for fast finishers',
    followUpAction: 'Mrs. Adjei to share extension task template at next PLC meeting',
    status: 'Discussed', submittedAt: '2026-06-28T10:00:00.000Z',
  },
];

const INITIAL_LESSON_STUDIES: PLCLessonStudy[] = [
  { id: 'plc-30', date: '2026-07-03', teacherObserved: 'Mr. Mensah', subject: 'Elect. Math', observer: 'Mr. Owusu', notes: 'Strong questioning technique' },
  { id: 'plc-31', date: '2026-06-28', teacherObserved: 'Mrs. Adjei', subject: 'Core Math', observer: 'Mr. Mensah', notes: 'Good use of visual aids' },
];

const INITIAL_PERFORMANCE: PLCPerformanceReview[] = [
  { id: 'plc-40', date: '2026-06-26', focusArea: 'SHS1 Math scores', keyFinding: '30% below 50% threshold', dataSummary: 'Class average: 48%. Lowest scoring topic: factoring.' },
  { id: 'plc-41', date: '2026-06-12', focusArea: 'English writing skills', keyFinding: 'Improvement in essay structure', dataSummary: '70% of students showed improvement in essay organisation.' },
];

const INITIAL_RESOURCES: PLCResource[] = [
  { id: 'plc-50', title: 'Visual aids for quadratic equations', sharedBy: 'Mr. Mensah', date: '2026-07-01', category: 'Lesson Plan', description: 'Graphical approach to teaching quadratics' },
  { id: 'plc-51', title: 'Group work strategies handbook', sharedBy: 'Mrs. Boateng', date: '2026-06-20', category: 'Strategy', description: 'Best practices for effective group work' },
  { id: 'plc-52', title: 'Lab safety checklist', sharedBy: 'Mr. Adjei', date: '2026-06-10', category: 'Reference', description: 'Safety procedures for science labs' },
];

const INITIAL_ACTIONS: PLCActionItem[] = [
  { id: 'plc-60', session: 'Jun 26', action: 'Create remedial Math worksheets', owner: 'Mr. Mensah', due: '2026-07-10', status: 'In Progress' },
  { id: 'plc-61', session: 'Jun 26', action: 'Pair teachers for peer observation', owner: 'Mrs. Adjei', due: '2026-07-05', status: 'Completed' },
  { id: 'plc-62', session: 'Jun 12', action: 'Update assessment rubrics', owner: 'Mrs. Boateng', due: '2026-07-01', status: 'Completed' },
];

const INITIAL_REQUISITIONS: PLCRequisition[] = [
  { id: 'plc-70', date: '2026-07-05', itemName: 'A4 Paper (reams)', quantity: 5, unit: 'reams', purpose: 'Printing remedial worksheets for PLC action item', requestedBy: 'Mr. Mensah', status: 'Pending', approvedBy: '', approvedDate: '', notes: '' },
  { id: 'plc-71', date: '2026-06-25', itemName: 'Whiteboard markers', quantity: 10, unit: 'packs', purpose: 'For PLC session demonstrations', requestedBy: 'Mrs. Adjei', status: 'Approved', approvedBy: 'Academic Office', approvedDate: '2026-06-26', notes: 'Collect from Stores' },
];

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
}

export const usePLCStore = create<PLCState>((set) => ({
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
}));
