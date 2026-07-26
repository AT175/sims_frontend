import { create } from 'zustand';
import { apiClient } from '@shared/api/apiClient';

// ── Types ──

export type MaterialType = 'Note' | 'Slide' | 'Past Q' | 'Worksheet' | 'Video' | 'Audio' | 'Document';
export type AVType = 'Audio' | 'Video';
export type LiveSessionStatus = 'Scheduled' | 'Live' | 'Ended' | 'Cancelled';
export type AssignmentStatus = 'Draft' | 'Published' | 'Closed';
export type SubmissionStatus = 'Not Submitted' | 'Submitted' | 'Graded' | 'Late';
export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused';
export type AnnouncementPriority = 'Normal' | 'Important' | 'Urgent';
export type LessonPlanStatus = 'Planned' | 'Taught' | 'Rescheduled';
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
export type SyllabusStatus = 'Not Started' | 'In Progress' | 'Completed';

export interface SubjectClass {
  id: string;
  subject: string;
  classForm: string;
  students: number;
  hod: string;
  isElective: boolean;
}

export interface LessonMaterial {
  id: string;
  title: string;
  type: MaterialType;
  classForm: string;
  subject: string;
  topic: string;
  description: string;
  dateUploaded: string;
  uploadedBy: string;
  fileUrl?: string;
}

export interface AVRecording {
  id: string;
  title: string;
  type: AVType;
  duration: string;
  classForm: string;
  subject: string;
  topic: string;
  dateRecorded: string;
  recordedBy: string;
  url?: string;
}

export interface LiveSession {
  id: string;
  subject: string;
  classForm: string;
  scheduledTime: string;
  status: LiveSessionStatus;
  topic: string;
  startedBy: string;
  participants: number;
  recordingUrl?: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  classForm: string;
  subject: string;
  dueDate: string;
  expiryDate?: string;
  dateCreated: string;
  maxScore: number;
  status: AssignmentStatus;
  createdBy: string;
  submissions: AssignmentSubmission[];
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentName: string;
  admNo: string;
  submittedDate: string;
  status: SubmissionStatus;
  score?: number;
  feedback?: string;
}

export interface GradebookEntry {
  id: string;
  studentName: string;
  admNo: string;
  classForm: string;
  subject: string;
  term: string;
  classwork: number;
  classworkMax: number;
  homework: number;
  homeworkMax: number;
  test: number;
  testMax: number;
  exam: number;
  examMax: number;
  total: number;
  totalMax: number;
  grade: string;
}

export interface AttendanceRecord {
  id: string;
  studentName: string;
  admNo: string;
  classForm: string;
  subject: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface StudentRosterEntry {
  id: string;
  name: string;
  admNo: string;
  classForm: string;
  avgScore: string;
  attendancePct: string;
  lastGrade: string;
  guardianName: string;
  guardianPhone: string;
  email?: string;
}

export interface ClassAnnouncement {
  id: string;
  title: string;
  body: string;
  classForm: string;
  date: string;
  postedBy: string;
  priority: AnnouncementPriority;
}

export interface LessonPlan {
  id: string;
  subject: string;
  classForm: string;
  date: string;
  topic: string;
  objectives: string;
  teachingMethods: string;
  resources: string;
  activities: string;
  assessment: string;
  homework: string;
  status: LessonPlanStatus;
  reflection?: string;
  fileUrl?: string;
  fileName?: string;
}

export interface TimetableEntry {
  id: string;
  day: DayOfWeek;
  period: number;
  startTime: string;
  endTime: string;
  subject: string;
  classForm: string;
  room: string;
}

export interface SyllabusTopic {
  id: string;
  subject: string;
  classForm: string;
  topic: string;
  subTopics: string;
  week: number;
  status: SyllabusStatus;
  dateTaught?: string;
  notes?: string;
}

export interface RemedialStudent {
  id: string;
  studentName: string;
  admNo: string;
  classForm: string;
  subject: string;
  area: string;
  intervention: string;
  dateStarted: string;
  progress: 'Just Started' | 'Improving' | 'On Track' | 'Needs More Help';
  notes: string;
}

// ── New Types: Enhanced Features ──

export interface AssignmentRubric {
  id: string;
  criteria: string;
  maxMarks: number;
  description: string;
}

export interface QuestionBankItem {
  id: string;
  subject: string;
  topic: string;
  type: 'MCQ' | 'Short Answer' | 'Essay' | 'True/False' | 'Fill in the Blank';
  question: string;
  options?: string[];
  correctAnswer: string;
  marks: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  classForm: string;
  questionIds: string[];
  totalMarks: number;
  duration: number;
  dueDate: string;
  expiryDate: string;
  status: 'Draft' | 'Published' | 'Closed' | 'Expired';
  createdAt: string;
}

export interface ParentCommunication {
  id: string;
  studentName: string;
  admNo: string;
  classForm: string;
  guardianName: string;
  guardianPhone: string;
  channel: 'Phone Call' | 'SMS' | 'Email' | 'In-Person' | 'WhatsApp';
  direction: 'Outgoing' | 'Incoming';
  subject: string;
  notes: string;
  date: string;
  followUpNeeded: boolean;
  followUpDate?: string;
}

export type BehaviorType = 'Positive' | 'Negative' | 'Neutral';
export type BehaviorSeverity = 'Low' | 'Medium' | 'High';

export interface BehaviorNote {
  id: string;
  studentName: string;
  admNo: string;
  classForm: string;
  date: string;
  type: BehaviorType;
  severity: BehaviorSeverity;
  category: string;
  description: string;
  actionTaken: string;
  reportedBy: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: 'Lesson' | 'Assignment Due' | 'Meeting' | 'Deadline' | 'Exam' | 'Personal';
  subject?: string;
  classForm?: string;
  notes?: string;
}

export interface TeacherNotification {
  id: string;
  title: string;
  message: string;
  type: 'Submission' | 'Parent Reply' | 'HOD Feedback' | 'Meeting' | 'Deadline' | 'System';
  date: string;
  read: boolean;
  actionUrl?: string;
}

export interface SharedResource {
  id: string;
  title: string;
  subject: string;
  type: 'Lesson Plan' | 'Material' | 'Worksheet' | 'Past Questions' | 'Notes';
  sharedBy: string;
  sharedDate: string;
  description: string;
  classForm: string;
  fileUrl?: string;
}

export interface WhiteboardState {
  pages: string[];
  currentPage: number;
  tool: 'pen' | 'eraser' | 'text' | 'highlighter';
  color: string;
  strokeWidth: number;
}

export interface VirtualClassroomState {
  sessionId: string;
  cameraOn: boolean;
  micOn: boolean;
  screenSharing: boolean;
  whiteboardActive: boolean;
  whiteboard: WhiteboardState;
  chatMessages: { id: string; sender: string; message: string; timestamp: string }[];
  raisedHands: { id: string; studentName: string }[];
  participants: { id: string; name: string; cameraOn: boolean; micOn: boolean }[];
}

export interface AILessonPlanRequest {
  subject: string;
  classForm: string;
  topic: string;
  duration: string;
  objectives?: string;
  teachingStyle?: string;
}

export interface AILessonPlanResponse {
  objectives: string;
  teachingMethods: string;
  resources: string;
  activities: string;
  assessment: string;
  homework: string;
  introduction: string;
  mainActivity: string;
  conclusion: string;
  differentiation: string;
}

// ── Constants ──

export const MATERIAL_TYPES: MaterialType[] = ['Note', 'Slide', 'Past Q', 'Worksheet', 'Video', 'Audio', 'Document'];
export const AV_TYPES: AVType[] = ['Audio', 'Video'];
export const LIVE_SESSION_STATUSES: LiveSessionStatus[] = ['Scheduled', 'Live', 'Ended', 'Cancelled'];
export const ASSIGNMENT_STATUSES: AssignmentStatus[] = ['Draft', 'Published', 'Closed'];
export const SUBMISSION_STATUSES: SubmissionStatus[] = ['Not Submitted', 'Submitted', 'Graded', 'Late'];
export const ATTENDANCE_STATUSES: AttendanceStatus[] = ['Present', 'Absent', 'Late', 'Excused'];
export const ANNOUNCEMENT_PRIORITIES: AnnouncementPriority[] = ['Normal', 'Important', 'Urgent'];
export const LESSON_PLAN_STATUSES: LessonPlanStatus[] = ['Planned', 'Taught', 'Rescheduled'];
export const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const SYLLABUS_STATUSES: SyllabusStatus[] = ['Not Started', 'In Progress', 'Completed'];
export const REMEDIAL_PROGRESS = ['Just Started', 'Improving', 'On Track', 'Needs More Help'] as const;

export const TERMS = ['Term 1 2026/2027', 'Term 2 2026/2027', 'Term 3 2025/2026'];

export const QUESTION_TYPES = ['MCQ', 'Short Answer', 'Essay', 'True/False', 'Fill in the Blank'] as const;
export const QUESTION_DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;
export const QUIZ_STATUSES = ['Draft', 'Published', 'Closed', 'Expired'] as const;
export const BEHAVIOR_TYPES = ['Positive', 'Negative', 'Neutral'] as const;
export const BEHAVIOR_SEVERITIES = ['Low', 'Medium', 'High'] as const;
export const COMMUNICATION_CHANNELS = ['Phone Call', 'SMS', 'Email', 'In-Person', 'WhatsApp'] as const;
export const CALENDAR_EVENT_TYPES = ['Lesson', 'Assignment Due', 'Meeting', 'Deadline', 'Exam', 'Personal'] as const;
export const NOTIFICATION_TYPES = ['Submission', 'Parent Reply', 'HOD Feedback', 'Meeting', 'Deadline', 'System'] as const;
export const SHARED_RESOURCE_TYPES = ['Lesson Plan', 'Material', 'Worksheet', 'Past Questions', 'Notes'] as const;
export const WHITEBOARD_TOOLS = ['pen', 'eraser', 'text', 'highlighter'] as const;
export const WHITEBOARD_COLORS = ['#1a1a2e', '#e63946', '#2a9d8f', '#457b9d', '#f4a261', '#e76f51', '#9b5de6', '#00bbf9'];

// ── Helpers ──

let idCounter = 0;
const nextId = () => `tch-${++idCounter}`;
const todayISO = () => new Date().toISOString().slice(0, 10);

const calcGrade = (total: number, max: number): string => {
  if (max === 0) return '—';
  const pct = (total / max) * 100;
  if (pct >= 80) return 'A1';
  if (pct >= 70) return 'B2';
  if (pct >= 65) return 'B3';
  if (pct >= 60) return 'C4';
  if (pct >= 55) return 'C5';
  if (pct >= 50) return 'C6';
  if (pct >= 45) return 'D7';
  if (pct >= 40) return 'E8';
  return 'F9';
};

// ── Initial Data (empty — all data loaded from backend) ──

// ── Store ──

interface TeacherState {
  subjects: SubjectClass[];
  materials: LessonMaterial[];
  avRecordings: AVRecording[];
  liveSessions: LiveSession[];
  assignments: Assignment[];
  gradebook: GradebookEntry[];
  attendance: AttendanceRecord[];
  roster: StudentRosterEntry[];
  announcements: ClassAnnouncement[];
  lessonPlans: LessonPlan[];
  timetable: TimetableEntry[];
  syllabus: SyllabusTopic[];
  remedial: RemedialStudent[];
  questionBank: QuestionBankItem[];
  quizzes: Quiz[];
  parentComms: ParentCommunication[];
  behaviorNotes: BehaviorNote[];
  calendarEvents: CalendarEvent[];
  teacherNotifications: TeacherNotification[];
  sharedResources: SharedResource[];
  virtualClassroom: VirtualClassroomState | null;

  // Materials
  addMaterial: (m: Omit<LessonMaterial, 'id' | 'dateUploaded'>) => void;
  deleteMaterial: (id: string) => void;

  // AV
  addAV: (a: Omit<AVRecording, 'id' | 'dateRecorded'>) => void;
  deleteAV: (id: string) => void;

  // Live sessions
  startLiveSession: (id: string, startedBy: string) => void;
  endLiveSession: (id: string) => void;
  scheduleLiveSession: (s: Omit<LiveSession, 'id' | 'status' | 'startedBy' | 'participants'>) => void;
  cancelLiveSession: (id: string) => void;

  // Virtual Classroom
  joinVirtualClassroom: (sessionId: string) => void;
  leaveVirtualClassroom: () => void;
  toggleCamera: () => void;
  toggleMic: () => void;
  toggleScreenShare: () => void;
  toggleWhiteboard: () => void;
  setWhiteboardTool: (tool: WhiteboardState['tool']) => void;
  setWhiteboardColor: (color: string) => void;
  setWhiteboardStrokeWidth: (width: number) => void;
  addWhiteboardPage: () => void;
  setWhiteboardPage: (page: number) => void;
  sendChatMessage: (sender: string, message: string) => void;
  raiseHand: (studentName: string) => void;
  lowerHand: (id: string) => void;

  // Assignments
  addAssignment: (a: Omit<Assignment, 'id' | 'dateCreated' | 'status' | 'submissions' | 'createdBy'>) => void;
  publishAssignment: (id: string) => void;
  closeAssignment: (id: string) => void;
  deleteAssignment: (id: string) => void;
  submitAssignment: (assignmentId: string, studentName: string, admNo: string) => void;
  gradeSubmission: (submissionId: string, score: number, feedback: string) => void;
  bulkGrade: (assignmentId: string, grades: { submissionId: string; score: number; feedback?: string }[]) => void;
  duplicateAssignment: (id: string, newClassForm: string) => void;

  // Gradebook
  addGradeEntry: (g: Omit<GradebookEntry, 'id' | 'total' | 'totalMax' | 'grade'>) => void;
  updateGradeEntry: (id: string, updates: Partial<GradebookEntry>) => void;
  deleteGradeEntry: (id: string) => void;
  getGradebookForClass: (classForm: string, subject: string) => GradebookEntry[];
  getClassAnalytics: (classForm: string, subject: string) => {
    average: number; max: number; min: number; passRate: number;
    gradeDistribution: Record<string, number>;
    atRiskStudents: GradebookEntry[];
    topPerformers: GradebookEntry[];
  };

  // Attendance
  markAttendance: (records: Omit<AttendanceRecord, 'id'>[]) => void;
  getAttendanceForDate: (classForm: string, date: string) => AttendanceRecord[];
  getAttendanceStats: (classForm: string) => { present: number; absent: number; late: number; excused: number };
  getAttendanceAnalytics: (classForm: string) => {
    perStudent: { studentName: string; admNo: string; present: number; absent: number; late: number; excused: number; rate: number }[];
    patterns: { frequentAbsentees: { studentName: string; admNo: string; absentCount: number }[] };
  };

  // Roster
  addRosterEntry: (r: Omit<StudentRosterEntry, 'id'>) => void;
  updateRosterEntry: (id: string, updates: Partial<StudentRosterEntry>) => void;
  getStudentProfile: (admNo: string) => {
    roster: StudentRosterEntry | undefined;
    grades: GradebookEntry[];
    attendance: AttendanceRecord[];
    behavior: BehaviorNote[];
    remedial: RemedialStudent | undefined;
    parentComms: ParentCommunication[];
    assignments: { assignment: Assignment; submission?: AssignmentSubmission }[];
  };

  // Announcements
  addAnnouncement: (a: Omit<ClassAnnouncement, 'id' | 'date'>) => void;
  deleteAnnouncement: (id: string) => void;

  // Lesson plans
  addLessonPlan: (lp: Omit<LessonPlan, 'id' | 'status'>) => void;
  updateLessonPlan: (id: string, updates: Partial<LessonPlan>) => void;
  deleteLessonPlan: (id: string) => void;
  markLessonTaught: (id: string, reflection: string) => void;

  // AI Lesson Plan
  generateAILessonPlan: (req: AILessonPlanRequest) => Promise<AILessonPlanResponse>;

  // Timetable
  addTimetableEntry: (t: Omit<TimetableEntry, 'id'>) => void;
  deleteTimetableEntry: (id: string) => void;
  getTodayTimetable: (day: DayOfWeek) => TimetableEntry[];

  // Syllabus
  addSyllabusTopic: (s: Omit<SyllabusTopic, 'id' | 'status'>) => void;
  updateSyllabusTopic: (id: string, updates: Partial<SyllabusTopic>) => void;
  deleteSyllabusTopic: (id: string) => void;
  getSyllabusProgress: (subject: string, classForm: string) => { completed: number; total: number; pct: number };

  // Remedial
  addRemedialStudent: (r: Omit<RemedialStudent, 'id'>) => void;
  updateRemedialProgress: (id: string, progress: RemedialStudent['progress'], notes: string) => void;
  deleteRemedialStudent: (id: string) => void;

  // Question Bank
  addQuestion: (q: Omit<QuestionBankItem, 'id'>) => void;
  updateQuestion: (id: string, updates: Partial<QuestionBankItem>) => void;
  deleteQuestion: (id: string) => void;

  // Quizzes
  addQuiz: (q: Omit<Quiz, 'id' | 'createdAt' | 'status' | 'totalMarks'>) => void;
  publishQuiz: (id: string) => void;
  closeQuiz: (id: string) => void;
  deleteQuiz: (id: string) => void;

  // Parent Communication
  addParentComm: (c: Omit<ParentCommunication, 'id'>) => void;
  deleteParentComm: (id: string) => void;
  getFollowUps: () => ParentCommunication[];

  // Behavior Notes
  addBehaviorNote: (b: Omit<BehaviorNote, 'id'>) => void;
  deleteBehaviorNote: (id: string) => void;

  // Calendar
  addCalendarEvent: (e: Omit<CalendarEvent, 'id'>) => void;
  deleteCalendarEvent: (id: string) => void;
  getCalendarForDate: (date: string) => CalendarEvent[];
  getCalendarForMonth: (year: number, month: number) => CalendarEvent[];

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  getUnreadNotificationCount: () => number;

  // Shared Resources
  addSharedResource: (r: Omit<SharedResource, 'id' | 'sharedDate'>) => void;
  deleteSharedResource: (id: string) => void;

  // Backend load methods
  loadAll: () => Promise<void>;
  loadLessonPlans: () => Promise<void>;
  loadAssignments: () => Promise<void>;
  loadGradebook: () => Promise<void>;
  loadAttendance: () => Promise<void>;
  loadSyllabus: () => Promise<void>;
  loadMaterials: () => Promise<void>;
  loadAV: () => Promise<void>;
  loadLiveSessions: () => Promise<void>;
  loadAnnouncements: () => Promise<void>;
  loadQuestions: () => Promise<void>;
  loadQuizzes: () => Promise<void>;
  loadParentComms: () => Promise<void>;
  loadBehaviorNotes: () => Promise<void>;
  loadCalendarEvents: () => Promise<void>;
  loadNotifications: () => Promise<void>;
  loadSharedResources: () => Promise<void>;
  loadRemedial: () => Promise<void>;
  isLoading: boolean;
}

export const useTeacherStore = create<TeacherState>((set, get) => ({
  subjects: [],
  materials: [],
  avRecordings: [],
  liveSessions: [],
  assignments: [],
  gradebook: [],
  attendance: [],
  roster: [],
  announcements: [],
  lessonPlans: [],
  timetable: [],
  syllabus: [],
  remedial: [],
  questionBank: [],
  quizzes: [],
  parentComms: [],
  behaviorNotes: [],
  calendarEvents: [],
  teacherNotifications: [],
  sharedResources: [],
  virtualClassroom: null,
  isLoading: false,

  addMaterial: async (m) => {
    try { const created = await apiClient.post<any>('/teacher/materials', m); set((s) => ({ materials: [created, ...s.materials] })); }
    catch { set((s) => ({ materials: [{ ...m, id: nextId(), dateUploaded: todayISO() }, ...s.materials] })); }
  },
  deleteMaterial: (id) => {
    apiClient.delete(`/teacher/materials/${id}`).catch(() => {});
    set((s) => ({ materials: s.materials.filter((m) => m.id !== id) }));
  },

  addAV: async (a) => {
    try { const created = await apiClient.post<any>('/teacher/av-recordings', a); set((s) => ({ avRecordings: [created, ...s.avRecordings] })); }
    catch { set((s) => ({ avRecordings: [{ ...a, id: nextId(), dateRecorded: todayISO() }, ...s.avRecordings] })); }
  },
  deleteAV: (id) => {
    apiClient.delete(`/teacher/av-recordings/${id}`).catch(() => {});
    set((s) => ({ avRecordings: s.avRecordings.filter((a) => a.id !== id) }));
  },

  startLiveSession: (id, startedBy) => {
    apiClient.post(`/teacher/live-sessions/${id}/start`).catch(() => {});
    set((s) => ({ liveSessions: s.liveSessions.map((l) => l.id === id ? { ...l, status: 'Live', startedBy } : l) }));
  },
  endLiveSession: (id) => {
    apiClient.post(`/teacher/live-sessions/${id}/end`).catch(() => {});
    set((s) => ({ liveSessions: s.liveSessions.map((l) => l.id === id ? { ...l, status: 'Ended' } : l) }));
  },
  scheduleLiveSession: async (sess) => {
    try { const created = await apiClient.post<any>('/teacher/live-sessions', sess); set((s) => ({ liveSessions: [...s.liveSessions, created] })); }
    catch { set((s) => ({ liveSessions: [...s.liveSessions, { ...sess, id: nextId(), status: 'Scheduled', startedBy: '', participants: 0 }] })); }
  },
  cancelLiveSession: (id) => {
    apiClient.post(`/teacher/live-sessions/${id}/cancel`).catch(() => {});
    set((s) => ({ liveSessions: s.liveSessions.map((l) => l.id === id ? { ...l, status: 'Cancelled' } : l) }));
  },

  addAssignment: async (a) => {
    try { const created = await apiClient.post<any>('/teacher/assignments', a); set((s) => ({ assignments: [created, ...s.assignments] })); }
    catch { set((s) => ({ assignments: [{ ...a, id: nextId(), dateCreated: todayISO(), status: 'Draft', submissions: [], createdBy: 'Teacher' }, ...s.assignments] })); }
  },
  publishAssignment: (id) => {
    apiClient.post(`/teacher/assignments/${id}/publish`).catch(() => {});
    set((s) => ({ assignments: s.assignments.map((a) => a.id === id ? { ...a, status: 'Published' } : a) }));
  },
  closeAssignment: (id) => {
    apiClient.post(`/teacher/assignments/${id}/close`).catch(() => {});
    set((s) => ({ assignments: s.assignments.map((a) => a.id === id ? { ...a, status: 'Closed' } : a) }));
  },
  deleteAssignment: (id) => {
    apiClient.delete(`/teacher/assignments/${id}`).catch(() => {});
    set((s) => ({ assignments: s.assignments.filter((a) => a.id !== id) }));
  },
  submitAssignment: (assignmentId, studentName, admNo) => {
    const assignment = get().assignments.find((a) => a.id === assignmentId);
    if (!assignment) return;
    const isLate = new Date() > new Date(assignment.dueDate);
    const sub: AssignmentSubmission = {
      id: nextId(), assignmentId, studentName, admNo,
      submittedDate: todayISO(), status: isLate ? 'Late' : 'Submitted',
    };
    set((s) => ({
      assignments: s.assignments.map((a) => a.id === assignmentId ? { ...a, submissions: [...a.submissions, sub] } : a),
    }));
  },
  gradeSubmission: (submissionId, score, feedback) => {
    const assignment = get().assignments.find((a) => a.submissions.some((s) => s.id === submissionId));
    if (assignment) { apiClient.post(`/teacher/assignments/${assignment.id}/grade`, { submissionId, score, feedback }).catch(() => {}); }
    set((s) => ({
      assignments: s.assignments.map((a) => ({
        ...a,
        submissions: a.submissions.map((sub) => sub.id === submissionId ? { ...sub, score, feedback, status: 'Graded' } : sub),
      })),
    }));
  },

  addGradeEntry: async (g) => {
    const total = g.classwork + g.homework + g.test + g.exam;
    const totalMax = g.classworkMax + g.homeworkMax + g.testMax + g.examMax;
    const grade = calcGrade(total, totalMax);
    try { const created = await apiClient.post<any>('/teacher/gradebook', { ...g, total, totalMax, grade }); set((s) => ({ gradebook: [...s.gradebook, created] })); }
    catch { set((s) => ({ gradebook: [...s.gradebook, { ...g, id: nextId(), total, totalMax, grade }] })); }
  },
  updateGradeEntry: (id, updates) => {
    set((s) => ({
      gradebook: s.gradebook.map((g) => {
        if (g.id !== id) return g;
        const merged = { ...g, ...updates };
        const total = merged.classwork + merged.homework + merged.test + merged.exam;
        const totalMax = merged.classworkMax + merged.homeworkMax + merged.testMax + merged.examMax;
        return { ...merged, total, totalMax, grade: calcGrade(total, totalMax) };
      }),
    }));
  },
  deleteGradeEntry: (id) => {
    apiClient.delete(`/teacher/gradebook/${id}`).catch(() => {});
    set((s) => ({ gradebook: s.gradebook.filter((g) => g.id !== id) }));
  },
  getGradebookForClass: (classForm, subject) => {
    return get().gradebook.filter((g) => g.classForm === classForm && g.subject === subject);
  },

  markAttendance: async (records) => {
    try { await apiClient.post('/teacher/attendance/bulk', { records }); }
    catch {}
    const newRecords = records.map((r) => ({ ...r, id: nextId() }));
    set((s) => ({ attendance: [...newRecords, ...s.attendance] }));
  },
  getAttendanceForDate: (classForm, date) => {
    return get().attendance.filter((a) => a.classForm === classForm && a.date === date);
  },
  getAttendanceStats: (classForm) => {
    const records = get().attendance.filter((a) => a.classForm === classForm);
    return {
      present: records.filter((a) => a.status === 'Present').length,
      absent: records.filter((a) => a.status === 'Absent').length,
      late: records.filter((a) => a.status === 'Late').length,
      excused: records.filter((a) => a.status === 'Excused').length,
    };
  },

  addRosterEntry: (r) => {
    set((s) => ({ roster: [...s.roster, { ...r, id: nextId() }] }));
  },
  updateRosterEntry: (id, updates) => {
    set((s) => ({ roster: s.roster.map((r) => r.id === id ? { ...r, ...updates } : r) }));
  },

  addAnnouncement: async (a) => {
    try { const created = await apiClient.post<any>('/teacher/announcements', a); set((s) => ({ announcements: [created, ...s.announcements] })); }
    catch { set((s) => ({ announcements: [{ ...a, id: nextId(), date: todayISO() }, ...s.announcements] })); }
  },
  deleteAnnouncement: (id) => {
    apiClient.delete(`/teacher/announcements/${id}`).catch(() => {});
    set((s) => ({ announcements: s.announcements.filter((a) => a.id !== id) }));
  },

  addLessonPlan: async (lp) => {
    try { const created = await apiClient.post<any>('/teacher/lesson-plans', lp); set((s) => ({ lessonPlans: [created, ...s.lessonPlans] })); }
    catch { set((s) => ({ lessonPlans: [{ ...lp, id: nextId(), status: 'Planned' }, ...s.lessonPlans] })); }
  },
  updateLessonPlan: (id, updates) => {
    apiClient.put(`/teacher/lesson-plans/${id}`, updates).catch(() => {});
    set((s) => ({ lessonPlans: s.lessonPlans.map((lp) => lp.id === id ? { ...lp, ...updates } : lp) }));
  },
  deleteLessonPlan: (id) => {
    apiClient.delete(`/teacher/lesson-plans/${id}`).catch(() => {});
    set((s) => ({ lessonPlans: s.lessonPlans.filter((lp) => lp.id !== id) }));
  },
  markLessonTaught: (id, reflection) => {
    apiClient.post(`/teacher/lesson-plans/${id}/mark-taught`, { reflection }).catch(() => {});
    set((s) => ({ lessonPlans: s.lessonPlans.map((lp) => lp.id === id ? { ...lp, status: 'Taught', reflection } : lp) }));
  },

  addTimetableEntry: (t) => {
    set((s) => ({ timetable: [...s.timetable, { ...t, id: nextId() }] }));
  },
  deleteTimetableEntry: (id) => {
    set((s) => ({ timetable: s.timetable.filter((t) => t.id !== id) }));
  },
  getTodayTimetable: (day) => {
    return get().timetable.filter((t) => t.day === day).sort((a, b) => a.period - b.period);
  },

  addSyllabusTopic: async (topic) => {
    try { const created = await apiClient.post<any>('/teacher/syllabus', topic); set((s) => ({ syllabus: [...s.syllabus, created] })); }
    catch { set((s) => ({ syllabus: [...s.syllabus, { ...topic, id: nextId(), status: 'Not Started' }] })); }
  },
  updateSyllabusTopic: (id, updates) => {
    apiClient.put(`/teacher/syllabus/${id}`, updates).catch(() => {});
    set((s) => ({ syllabus: s.syllabus.map((t) => t.id === id ? { ...t, ...updates } : t) }));
  },
  deleteSyllabusTopic: (id) => {
    apiClient.delete(`/teacher/syllabus/${id}`).catch(() => {});
    set((s) => ({ syllabus: s.syllabus.filter((t) => t.id !== id) }));
  },
  getSyllabusProgress: (subject, classForm) => {
    const topics = get().syllabus.filter((t) => t.subject === subject && t.classForm === classForm);
    const completed = topics.filter((t) => t.status === 'Completed').length;
    return { completed, total: topics.length, pct: topics.length > 0 ? Math.round((completed / topics.length) * 100) : 0 };
  },

  addRemedialStudent: async (r) => {
    try { const created = await apiClient.post<any>('/teacher/remedial', r); set((s) => ({ remedial: [created, ...s.remedial] })); }
    catch { set((s) => ({ remedial: [{ ...r, id: nextId() }, ...s.remedial] })); }
  },
  updateRemedialProgress: (id, progress, notes) => {
    apiClient.put(`/teacher/remedial/${id}`, { progress, notes }).catch(() => {});
    set((s) => ({ remedial: s.remedial.map((r) => r.id === id ? { ...r, progress, notes } : r) }));
  },
  deleteRemedialStudent: (id) => {
    apiClient.delete(`/teacher/remedial/${id}`).catch(() => {});
    set((s) => ({ remedial: s.remedial.filter((r) => r.id !== id) }));
  },

  joinVirtualClassroom: (sessionId) => {
    set({ virtualClassroom: {
      sessionId, cameraOn: false, micOn: false, screenSharing: false, whiteboardActive: false,
      whiteboard: { pages: [''], currentPage: 0, tool: 'pen', color: '#1a1a2e', strokeWidth: 3 },
      chatMessages: [], raisedHands: [], participants: [],
    }});
  },
  leaveVirtualClassroom: () => { set({ virtualClassroom: null }); },
  toggleCamera: () => { set((s) => ({ virtualClassroom: s.virtualClassroom ? { ...s.virtualClassroom, cameraOn: !s.virtualClassroom.cameraOn } : null })); },
  toggleMic: () => { set((s) => ({ virtualClassroom: s.virtualClassroom ? { ...s.virtualClassroom, micOn: !s.virtualClassroom.micOn } : null })); },
  toggleScreenShare: () => { set((s) => ({ virtualClassroom: s.virtualClassroom ? { ...s.virtualClassroom, screenSharing: !s.virtualClassroom.screenSharing } : null })); },
  toggleWhiteboard: () => { set((s) => ({ virtualClassroom: s.virtualClassroom ? { ...s.virtualClassroom, whiteboardActive: !s.virtualClassroom.whiteboardActive } : null })); },
  setWhiteboardTool: (tool) => { set((s) => ({ virtualClassroom: s.virtualClassroom ? { ...s.virtualClassroom, whiteboard: { ...s.virtualClassroom.whiteboard, tool } } : null })); },
  setWhiteboardColor: (color) => { set((s) => ({ virtualClassroom: s.virtualClassroom ? { ...s.virtualClassroom, whiteboard: { ...s.virtualClassroom.whiteboard, color } } : null })); },
  setWhiteboardStrokeWidth: (strokeWidth) => { set((s) => ({ virtualClassroom: s.virtualClassroom ? { ...s.virtualClassroom, whiteboard: { ...s.virtualClassroom.whiteboard, strokeWidth } } : null })); },
  addWhiteboardPage: () => { set((s) => ({ virtualClassroom: s.virtualClassroom ? { ...s.virtualClassroom, whiteboard: { ...s.virtualClassroom.whiteboard, pages: [...s.virtualClassroom.whiteboard.pages, ''], currentPage: s.virtualClassroom.whiteboard.pages.length } } : null })); },
  setWhiteboardPage: (page) => { set((s) => ({ virtualClassroom: s.virtualClassroom ? { ...s.virtualClassroom, whiteboard: { ...s.virtualClassroom.whiteboard, currentPage: page } } : null })); },
  sendChatMessage: (sender, message) => {
    set((s) => ({ virtualClassroom: s.virtualClassroom ? {
      ...s.virtualClassroom,
      chatMessages: [...s.virtualClassroom.chatMessages, { id: nextId(), sender, message, timestamp: new Date().toISOString() }],
    } : null }));
  },
  raiseHand: (studentName) => {
    set((s) => ({ virtualClassroom: s.virtualClassroom ? {
      ...s.virtualClassroom,
      raisedHands: [...s.virtualClassroom.raisedHands, { id: nextId(), studentName }],
    } : null }));
  },
  lowerHand: (id) => {
    set((s) => ({ virtualClassroom: s.virtualClassroom ? { ...s.virtualClassroom, raisedHands: s.virtualClassroom.raisedHands.filter((h) => h.id !== id) } : null }));
  },

  bulkGrade: (assignmentId, grades) => {
    apiClient.post(`/teacher/assignments/${assignmentId}/bulk-grade`, { grades }).catch(() => {});
    set((s) => ({
      assignments: s.assignments.map((a) => {
        if (a.id !== assignmentId) return a;
        return {
          ...a,
          submissions: a.submissions.map((sub) => {
            const g = grades.find((gr) => gr.submissionId === sub.id);
            if (!g) return sub;
            return { ...sub, score: g.score, feedback: g.feedback || '', status: 'Graded' };
          }),
        };
      }),
    }));
  },
  duplicateAssignment: async (id, newClassForm) => {
    const orig = get().assignments.find((a) => a.id === id);
    if (!orig) return;
    try { const created = await apiClient.post<any>(`/teacher/assignments/${id}/duplicate`, { classForm: newClassForm }); set((s) => ({ assignments: [created, ...s.assignments] })); }
    catch { set((s) => ({ assignments: [{ ...orig, id: nextId(), classForm: newClassForm, dateCreated: todayISO(), status: 'Draft', submissions: [] }, ...s.assignments] })); }
  },

  getClassAnalytics: (classForm, subject) => {
    const entries = get().gradebook.filter((g) => g.classForm === classForm && g.subject === subject);
    if (entries.length === 0) return { average: 0, max: 0, min: 0, passRate: 0, gradeDistribution: {}, atRiskStudents: [], topPerformers: [] };
    const pcts = entries.map((e) => (e.total / e.totalMax) * 100);
    const average = Math.round(pcts.reduce((a, b) => a + b, 0) / entries.length);
    const max = Math.round(Math.max(...pcts));
    const min = Math.round(Math.min(...pcts));
    const passRate = Math.round((pcts.filter((p) => p >= 50).length / entries.length) * 100);
    const gradeDistribution: Record<string, number> = {};
    entries.forEach((e) => { gradeDistribution[e.grade] = (gradeDistribution[e.grade] || 0) + 1; });
    const atRiskStudents = entries.filter((e) => (e.total / e.totalMax) * 100 < 50);
    const topPerformers = [...entries].sort((a, b) => b.total / b.totalMax - a.total / a.totalMax).slice(0, 3);
    return { average, max, min, passRate, gradeDistribution, atRiskStudents, topPerformers };
  },

  getAttendanceAnalytics: (classForm) => {
    const records = get().attendance.filter((a) => a.classForm === classForm);
    const students = [...new Set(records.map((r) => r.studentName))];
    const perStudent = students.map((name) => {
      const studentRecords = records.filter((r) => r.studentName === name);
      const admNo = studentRecords[0]?.admNo || '';
      const present = studentRecords.filter((r) => r.status === 'Present').length;
      const absent = studentRecords.filter((r) => r.status === 'Absent').length;
      const late = studentRecords.filter((r) => r.status === 'Late').length;
      const excused = studentRecords.filter((r) => r.status === 'Excused').length;
      const total = studentRecords.length;
      const rate = total > 0 ? Math.round((present / total) * 100) : 0;
      return { studentName: name, admNo, present, absent, late, excused, rate };
    });
    const frequentAbsentees = perStudent.filter((s) => s.absent >= 3).map((s) => ({ studentName: s.studentName, admNo: s.admNo, absentCount: s.absent }));
    return { perStudent, patterns: { frequentAbsentees } };
  },

  getStudentProfile: (admNo) => {
    const state = get();
    const roster = state.roster.find((r) => r.admNo === admNo);
    const grades = state.gradebook.filter((g) => g.admNo === admNo);
    const attendance = state.attendance.filter((a) => a.admNo === admNo);
    const behavior = state.behaviorNotes.filter((b) => b.admNo === admNo);
    const remedial = state.remedial.find((r) => r.admNo === admNo);
    const parentComms = state.parentComms.filter((c) => c.admNo === admNo);
    const assignments = state.assignments.map((a) => ({
      assignment: a,
      submission: a.submissions.find((s) => s.admNo === admNo),
    }));
    return { roster, grades, attendance, behavior, remedial, parentComms, assignments };
  },

  addQuestion: async (q) => {
    try { const created = await apiClient.post<any>('/teacher/questions', q); set((s) => ({ questionBank: [created, ...s.questionBank] })); }
    catch { set((s) => ({ questionBank: [{ ...q, id: nextId() }, ...s.questionBank] })); }
  },
  updateQuestion: (id, updates) => { set((s) => ({ questionBank: s.questionBank.map((q) => q.id === id ? { ...q, ...updates } : q) })); },
  deleteQuestion: (id) => {
    apiClient.delete(`/teacher/questions/${id}`).catch(() => {});
    set((s) => ({ questionBank: s.questionBank.filter((q) => q.id !== id) }));
  },

  addQuiz: async (q) => {
    const questions = get().questionBank.filter((qn) => q.questionIds.includes(qn.id));
    const totalMarks = questions.reduce((sum, qn) => sum + qn.marks, 0);
    try { const created = await apiClient.post<any>('/teacher/quizzes', { ...q, totalMarks }); set((s) => ({ quizzes: [created, ...s.quizzes] })); }
    catch { set((s) => ({ quizzes: [{ ...q, id: nextId(), totalMarks, createdAt: todayISO(), status: 'Draft' }, ...s.quizzes] })); }
  },
  publishQuiz: (id) => { apiClient.post(`/teacher/quizzes/${id}/publish`).catch(() => {}); set((s) => ({ quizzes: s.quizzes.map((q) => q.id === id ? { ...q, status: 'Published' } : q) })); },
  closeQuiz: (id) => { apiClient.post(`/teacher/quizzes/${id}/close`).catch(() => {}); set((s) => ({ quizzes: s.quizzes.map((q) => q.id === id ? { ...q, status: 'Closed' } : q) })); },
  deleteQuiz: (id) => { apiClient.delete(`/teacher/quizzes/${id}`).catch(() => {}); set((s) => ({ quizzes: s.quizzes.filter((q) => q.id !== id) })); },

  addParentComm: async (c) => {
    try { const created = await apiClient.post<any>('/teacher/parent-comms', c); set((s) => ({ parentComms: [created, ...s.parentComms] })); }
    catch { set((s) => ({ parentComms: [{ ...c, id: nextId() }, ...s.parentComms] })); }
  },
  deleteParentComm: (id) => { apiClient.delete(`/teacher/parent-comms/${id}`).catch(() => {}); set((s) => ({ parentComms: s.parentComms.filter((c) => c.id !== id) })); },
  getFollowUps: () => get().parentComms.filter((c) => c.followUpNeeded),

  addBehaviorNote: async (b) => {
    try { const created = await apiClient.post<any>('/teacher/behavior-notes', b); set((s) => ({ behaviorNotes: [created, ...s.behaviorNotes] })); }
    catch { set((s) => ({ behaviorNotes: [{ ...b, id: nextId() }, ...s.behaviorNotes] })); }
  },
  deleteBehaviorNote: (id) => { apiClient.delete(`/teacher/behavior-notes/${id}`).catch(() => {}); set((s) => ({ behaviorNotes: s.behaviorNotes.filter((b) => b.id !== id) })); },

  addCalendarEvent: async (e) => {
    try { const created = await apiClient.post<any>('/teacher/calendar-events', e); set((s) => ({ calendarEvents: [...s.calendarEvents, created] })); }
    catch { set((s) => ({ calendarEvents: [...s.calendarEvents, { ...e, id: nextId() }] })); }
  },
  deleteCalendarEvent: (id) => { apiClient.delete(`/teacher/calendar-events/${id}`).catch(() => {}); set((s) => ({ calendarEvents: s.calendarEvents.filter((e) => e.id !== id) })); },
  getCalendarForDate: (date) => get().calendarEvents.filter((e) => e.date === date).sort((a, b) => (a.time || '').localeCompare(b.time || '')),
  getCalendarForMonth: (year, month) => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return get().calendarEvents.filter((e) => e.date.startsWith(prefix)).sort((a, b) => a.date.localeCompare(b.date));
  },

  markNotificationRead: (id) => { apiClient.post(`/teacher/notifications/${id}/read`).catch(() => {}); set((s) => ({ teacherNotifications: s.teacherNotifications.map((n) => n.id === id ? { ...n, read: true } : n) })); },
  markAllNotificationsRead: () => { apiClient.post('/teacher/notifications/read-all').catch(() => {}); set((s) => ({ teacherNotifications: s.teacherNotifications.map((n) => ({ ...n, read: true })) })); },
  getUnreadNotificationCount: () => get().teacherNotifications.filter((n) => !n.read).length,

  addSharedResource: async (r) => {
    try { const created = await apiClient.post<any>('/teacher/shared-resources', r); set((s) => ({ sharedResources: [created, ...s.sharedResources] })); }
    catch { set((s) => ({ sharedResources: [{ ...r, id: nextId(), sharedDate: todayISO() }, ...s.sharedResources] })); }
  },
  deleteSharedResource: (id) => { apiClient.delete(`/teacher/shared-resources/${id}`).catch(() => {}); set((s) => ({ sharedResources: s.sharedResources.filter((r) => r.id !== id) })); },

  generateAILessonPlan: async (req) => {
    try {
      const data = await apiClient.post<any>('/teacher/ai-lesson-plan', { ...req });
      if (data) return data as AILessonPlanResponse;
    } catch {}
    return {
      objectives: `By the end of the lesson, students should be able to understand and apply concepts related to ${req.topic} in ${req.subject}.`,
      teachingMethods: req.teachingStyle || 'Direct instruction with guided practice, group work, and interactive discussion',
      resources: 'Textbook, whiteboard, markers, prepared worksheets, projector (if available)',
      activities: `1. Introduction: Review previous lesson and introduce ${req.topic}\n2. Direct instruction: Explain key concepts with examples\n3. Guided practice: Work through examples together\n4. Independent practice: Students work on exercises\n5. Review and summary`,
      assessment: 'Oral questioning during lesson, exit ticket with 2-3 questions on the topic',
      homework: `Exercise problems on ${req.topic} from textbook`,
      introduction: `Begin with a real-world connection to ${req.topic}. Ask students what they already know. State the lesson objectives clearly.`,
      mainActivity: `Step-by-step explanation of ${req.topic} with worked examples. Break down complex concepts into manageable parts. Use the ${req.teachingStyle || 'direct instruction'} approach.`,
      conclusion: 'Summarize key points. Ask students to share one thing they learned. Preview the next lesson topic.',
      differentiation: 'Provide additional support for struggling students through simplified examples. Challenge advanced students with extension problems.',
    };
  },

  loadLessonPlans: async () => {
    try {
      const data = await apiClient.get<any[]>('/teacher/lesson-plans');
      set({ lessonPlans: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadAssignments: async () => {
    try {
      const data = await apiClient.get<any[]>('/teacher/assignments');
      set({ assignments: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadGradebook: async () => {
    try {
      const data = await apiClient.get<any[]>('/teacher/gradebook');
      set({ gradebook: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadAttendance: async () => {
    try {
      const data = await apiClient.get<any[]>('/teacher/attendance');
      set({ attendance: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadSyllabus: async () => {
    try {
      const data = await apiClient.get<any[]>('/teacher/syllabus');
      set({ syllabus: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadMaterials: async () => {
    try {
      const data = await apiClient.get<any[]>('/teacher/materials');
      set({ materials: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadAV: async () => {
    try { const data = await apiClient.get<any[]>('/teacher/av-recordings'); set({ avRecordings: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) }); } catch {}
  },
  loadLiveSessions: async () => {
    try { const data = await apiClient.get<any[]>('/teacher/live-sessions'); set({ liveSessions: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) }); } catch {}
  },
  loadAnnouncements: async () => {
    try { const data = await apiClient.get<any[]>('/teacher/announcements'); set({ announcements: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) }); } catch {}
  },
  loadQuestions: async () => {
    try { const data = await apiClient.get<any[]>('/teacher/questions'); set({ questionBank: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) }); } catch {}
  },
  loadQuizzes: async () => {
    try { const data = await apiClient.get<any[]>('/teacher/quizzes'); set({ quizzes: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) }); } catch {}
  },
  loadParentComms: async () => {
    try { const data = await apiClient.get<any[]>('/teacher/parent-comms'); set({ parentComms: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) }); } catch {}
  },
  loadBehaviorNotes: async () => {
    try { const data = await apiClient.get<any[]>('/teacher/behavior-notes'); set({ behaviorNotes: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) }); } catch {}
  },
  loadCalendarEvents: async () => {
    try { const data = await apiClient.get<any[]>('/teacher/calendar-events'); set({ calendarEvents: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) }); } catch {}
  },
  loadNotifications: async () => {
    try { const data = await apiClient.get<any[]>('/teacher/notifications'); set({ teacherNotifications: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) }); } catch {}
  },
  loadSharedResources: async () => {
    try { const data = await apiClient.get<any[]>('/teacher/shared-resources'); set({ sharedResources: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) }); } catch {}
  },
  loadRemedial: async () => {
    try { const data = await apiClient.get<any[]>('/teacher/remedial'); set({ remedial: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) }); } catch {}
  },
  loadAll: async () => {
    set({ isLoading: true });
    const s = get();
    await Promise.allSettled([
      s.loadLessonPlans(),
      s.loadAssignments(),
      s.loadGradebook(),
      s.loadAttendance(),
      s.loadSyllabus(),
      s.loadMaterials(),
      s.loadAV(),
      s.loadLiveSessions(),
      s.loadAnnouncements(),
      s.loadQuestions(),
      s.loadQuizzes(),
      s.loadParentComms(),
      s.loadBehaviorNotes(),
      s.loadCalendarEvents(),
      s.loadNotifications(),
      s.loadSharedResources(),
      s.loadRemedial(),
    ]);
    set({ isLoading: false });
  },
}));
