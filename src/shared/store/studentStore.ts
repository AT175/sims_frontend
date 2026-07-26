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
  isLoading: boolean;

  loadProfile: () => Promise<void>;
  loadClasses: () => Promise<void>;
  loadMaterials: () => Promise<void>;
  loadAssignments: () => Promise<void>;
  loadResults: () => Promise<void>;
  loadAttendance: () => Promise<void>;
  loadHealth: () => Promise<void>;
  loadFeedback: () => Promise<void>;
  loadAll: () => Promise<void>;

  submitAssignment: (assignmentId: string, content?: string, fileUrl?: string) => Promise<void>;
  createFeedback: (subject: string, body: string, routedTo: string) => Promise<void>;
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
}));
