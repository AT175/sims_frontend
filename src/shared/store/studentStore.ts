import { create } from 'zustand';
import { apiClient } from '@shared/api/apiClient';

// ── Types ──

export interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  admissionNumber: string;
  classSection: string;
  house: string | null;
  guardianName: string;
  guardianPhone: string;
  photoUrl: string | null;
  dateOfBirth: string;
  gender: string;
  status: string;
}

export interface StudentClass {
  id: string;
  subject: string;
  teacher: string;
  nextSession: string | null;
  classForm: string | null;
}

export interface StudentMaterial {
  id: string;
  title: string;
  subject: string;
  type: string;
  downloaded: boolean;
  fileUrl: string | null;
}

export interface StudentAssignment {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  subject: string;
  dueDate: string;
  status: string;
  score: number | null;
  maxScore: number;
  content: string | null;
  fileUrl: string | null;
  feedback: string | null;
  submittedAt: string | null;
}

export interface StudentResult {
  id: string;
  subject: string;
  term: string;
  score: number;
  maxScore: number;
  grade: string;
  classPosition: number | null;
  classSize: number | null;
  termAverage: number | null;
}

export interface StudentAttendance {
  id: string;
  date: string;
  type: string;
  subject: string;
  status: string;
}

export interface HealthRecord {
  id: string;
  date: string;
  reason: string;
  treatment: string;
  notes: string | null;
  conditions: string | null;
  allergies: string | null;
}

export interface FeedbackEntry {
  id: string;
  date: string;
  subject: string;
  body: string;
  routedTo: string;
  status: string;
}

export interface ExeatRequest {
  id: string;
  exeatNo: string;
  date: string;
  studentName: string;
  admissionNo: string;
  house: string | null;
  class: string | null;
  reason: string;
  reasonDetail: string;
  destination: string | null;
  departureDate: string;
  returnDate: string;
  guardianName: string | null;
  guardianPhone: string | null;
  transportMode: string | null;
  status: string;
  approvedBy: string | null;
  approvedDate: string | null;
}

export interface TeacherAnnouncement {
  id: string;
  title: string;
  body: string;
  classForm: string;
  date: string;
  postedBy: string;
  priority: string;
}

export interface TeacherMaterial {
  id: string;
  title: string;
  type: string;
  classForm: string;
  subject: string;
  topic: string;
  description: string;
  dateUploaded: string;
  uploadedBy: string;
  fileUrl: string | null;
}

export interface LiveSession {
  id: string;
  subject: string;
  classForm: string;
  scheduledTime: string;
  status: string;
  topic: string;
  startedBy: string;
  participants: number;
  recordingUrl: string | null;
}

export interface AVRecording {
  id: string;
  title: string;
  type: string;
  duration: string;
  classForm: string;
  subject: string;
  topic: string;
  dateRecorded: string;
  recordedBy: string;
  url: string | null;
}

export interface SharedResource {
  id: string;
  title: string;
  subject: string;
  type: string;
  sharedBy: string;
  sharedDate: string;
  description: string;
  classForm: string;
  fileUrl: string | null;
}

export interface StudentQuiz {
  id: string;
  title: string;
  subject: string;
  classForm: string;
  totalMarks: number;
  duration: number;
  dueDate: string;
  expiryDate: string;
  status: string;
}

export interface RollCallRecord {
  id: string;
  date: string;
  house: string;
  studentName: string;
  room: string | null;
  status: string;
  notes: string | null;
  recordedBy: string;
}

export interface DisciplineRecord {
  id: string;
  date: string;
  house: string;
  studentName: string;
  incident: string;
  severity: string;
  actionTaken: string;
  recordedBy: string;
  escalated: boolean;
}

export interface StudentMessage {
  id: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  recipientType: string;
  recipientName: string;
  subject: string;
  body: string;
  status: string;
  reply: string | null;
  replyDate: string | null;
  replyBy: string | null;
  createdAt: string;
}

// ── Store ──

interface StudentState {
  profile: StudentProfile | null;
  classes: StudentClass[];
  materials: StudentMaterial[];
  assignments: StudentAssignment[];
  results: StudentResult[];
  attendance: StudentAttendance[];
  healthRecords: HealthRecord[];
  feedback: FeedbackEntry[];
  exeats: ExeatRequest[];
  announcements: TeacherAnnouncement[];
  teacherMaterials: TeacherMaterial[];
  liveSessions: LiveSession[];
  avRecordings: AVRecording[];
  sharedResources: SharedResource[];
  quizzes: StudentQuiz[];
  rollCalls: RollCallRecord[];
  disciplineRecords: DisciplineRecord[];
  messages: StudentMessage[];
  isLoading: boolean;

  loadProfile: () => Promise<void>;
  loadClasses: () => Promise<void>;
  loadMaterials: () => Promise<void>;
  loadAssignments: () => Promise<void>;
  loadResults: () => Promise<void>;
  loadAttendance: () => Promise<void>;
  loadHealth: () => Promise<void>;
  loadFeedback: () => Promise<void>;
  loadExeats: () => Promise<void>;
  loadAnnouncements: () => Promise<void>;
  loadTeacherMaterials: () => Promise<void>;
  loadLiveSessions: () => Promise<void>;
  loadAVRecordings: () => Promise<void>;
  loadSharedResources: () => Promise<void>;
  loadQuizzes: () => Promise<void>;
  loadRollCalls: () => Promise<void>;
  loadDiscipline: () => Promise<void>;
  loadMessages: () => Promise<void>;
  loadAll: () => Promise<void>;

  submitAssignment: (assignmentId: string, content?: string, fileUrl?: string) => Promise<void>;
  createFeedback: (subject: string, body: string, routedTo: string) => Promise<void>;
  requestExeat: (reason: string, reasonDetail: string, destination: string, departureDate: string, returnDate: string, transportMode: string) => Promise<void>;
  createMessage: (recipientType: string, recipientName: string, subject: string, body: string) => Promise<void>;
}

export const useStudentStore = create<StudentState>((set, get) => ({
  profile: null,
  classes: [],
  materials: [],
  assignments: [],
  results: [],
  attendance: [],
  healthRecords: [],
  feedback: [],
  exeats: [],
  announcements: [],
  teacherMaterials: [],
  liveSessions: [],
  avRecordings: [],
  sharedResources: [],
  quizzes: [],
  rollCalls: [],
  disciplineRecords: [],
  messages: [],
  isLoading: false,

  loadProfile: async () => {
    try { const data = await apiClient.get<any>('/student/profile'); set({ profile: data }); } catch {}
  },
  loadClasses: async () => {
    try { const data = await apiClient.get<any[]>('/student/classes'); set({ classes: data || [] }); } catch {}
  },
  loadMaterials: async () => {
    try { const data = await apiClient.get<any[]>('/student/materials'); set({ materials: data || [] }); } catch {}
  },
  loadAssignments: async () => {
    try { const data = await apiClient.get<any[]>('/student/assignments'); set({ assignments: data || [] }); } catch {}
  },
  loadResults: async () => {
    try { const data = await apiClient.get<any[]>('/student/results'); set({ results: data || [] }); } catch {}
  },
  loadAttendance: async () => {
    try { const data = await apiClient.get<any[]>('/student/attendance'); set({ attendance: data || [] }); } catch {}
  },
  loadHealth: async () => {
    try { const data = await apiClient.get<any[]>('/student/health'); set({ healthRecords: data || [] }); } catch {}
  },
  loadFeedback: async () => {
    try { const data = await apiClient.get<any[]>('/student/feedback'); set({ feedback: data || [] }); } catch {}
  },
  loadExeats: async () => {
    try { const data = await apiClient.get<any[]>('/student/exeats'); set({ exeats: data || [] }); } catch {}
  },
  loadAnnouncements: async () => {
    try { const data = await apiClient.get<any[]>('/student/announcements'); set({ announcements: data || [] }); } catch {}
  },
  loadTeacherMaterials: async () => {
    try { const data = await apiClient.get<any[]>('/student/teacher-materials'); set({ teacherMaterials: data || [] }); } catch {}
  },
  loadLiveSessions: async () => {
    try { const data = await apiClient.get<any[]>('/student/live-sessions'); set({ liveSessions: data || [] }); } catch {}
  },
  loadAVRecordings: async () => {
    try { const data = await apiClient.get<any[]>('/student/av-recordings'); set({ avRecordings: data || [] }); } catch {}
  },
  loadSharedResources: async () => {
    try { const data = await apiClient.get<any[]>('/student/shared-resources'); set({ sharedResources: data || [] }); } catch {}
  },
  loadQuizzes: async () => {
    try { const data = await apiClient.get<any[]>('/student/quizzes'); set({ quizzes: data || [] }); } catch {}
  },
  loadRollCalls: async () => {
    try { const data = await apiClient.get<any[]>('/student/house/roll-calls'); set({ rollCalls: data || [] }); } catch {}
  },
  loadDiscipline: async () => {
    try { const data = await apiClient.get<any[]>('/student/house/discipline'); set({ disciplineRecords: data || [] }); } catch {}
  },
  loadMessages: async () => {
    try { const data = await apiClient.get<any[]>('/student/messages'); set({ messages: data || [] }); } catch {}
  },
  loadAll: async () => {
    set({ isLoading: true });
    const s = get();
    await Promise.allSettled([
      s.loadProfile(),
      s.loadClasses(),
      s.loadMaterials(),
      s.loadAssignments(),
      s.loadResults(),
      s.loadAttendance(),
      s.loadHealth(),
      s.loadFeedback(),
      s.loadExeats(),
      s.loadAnnouncements(),
      s.loadTeacherMaterials(),
      s.loadLiveSessions(),
      s.loadAVRecordings(),
      s.loadSharedResources(),
      s.loadQuizzes(),
      s.loadRollCalls(),
      s.loadDiscipline(),
      s.loadMessages(),
    ]);
    set({ isLoading: false });
  },

  submitAssignment: async (assignmentId, content, fileUrl) => {
    try {
      await apiClient.post('/student/assignments/submit', { assignmentId, content, fileUrl });
      await get().loadAssignments();
    } catch {}
  },

  createFeedback: async (subject, body, routedTo) => {
    try {
      await apiClient.post('/student/feedback', { subject, body, routedTo });
      await get().loadFeedback();
    } catch {}
  },

  requestExeat: async (reason, reasonDetail, destination, departureDate, returnDate, transportMode) => {
    try {
      await apiClient.post('/student/exeats', { reason, reasonDetail, destination, departureDate, returnDate, transportMode });
      await get().loadExeats();
    } catch {}
  },

  createMessage: async (recipientType, recipientName, subject, body) => {
    try {
      await apiClient.post('/student/messages', { recipientType, recipientName, subject, body });
      await get().loadMessages();
    } catch {}
  },
}));
