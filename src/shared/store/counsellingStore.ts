import { create } from 'zustand';
import { apiClient } from '@shared/api/apiClient';

// ── Counsellor Types ──

export type CounsellorType = 'Academic' | 'Psychosocial';

export interface Counsellor {
  id: string;
  name: string;
  type: CounsellorType;
  title: string;
  phone: string;
  email: string;
  room: string;
  availability: string;
}

// ── Case Types ──

export type CaseStatus = 'Active' | 'Monitor' | 'Closed' | 'Referred';
export type CasePriority = 'High' | 'Medium' | 'Low';

export interface CounsellingCase {
  id: string;
  caseId: string;
  studentName: string;
  studentClass: string;
  category: string;
  type: CounsellorType;
  description: string;
  openedDate: string;
  status: CaseStatus;
  priority: CasePriority;
  assignedCounsellor: string;
  notes: string;
  followUpDate: string;
  confidential: boolean;
}

export interface SessionLog {
  id: string;
  caseId: string;
  date: string;
  counsellor: string;
  type: CounsellorType;
  summary: string;
  notes: string;
  nextAction: string;
  nextSessionDate: string;
}

// ── Appointment Types ──

export type AppointmentStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'No Show';

export interface Appointment {
  id: string;
  date: string;
  time: string;
  studentName: string;
  studentClass: string;
  type: CounsellorType;
  counsellor: string;
  reason: string;
  status: AppointmentStatus;
  notes: string;
}

// ── Referral Types ──

export type ReferralStatus = 'Pending' | 'Ongoing' | 'Completed';

export interface Referral {
  id: string;
  date: string;
  studentName: string;
  studentClass: string;
  referredTo: string;
  reason: string;
  type: CounsellorType;
  status: ReferralStatus;
  notes: string;
}

// ── Career Resource Types ──

export interface CareerResource {
  id: string;
  title: string;
  category: string;
  description: string;
  updated: string;
  link: string;
}

// ── Helpers ──

let idCounter = 200;
const nextId = () => String(++idCounter);
const todayISO = () => new Date().toISOString().slice(0, 10);

// ── Initial Data ──

const COUNSELLORS: Counsellor[] = [
  { id: '1', name: 'Mr. Osei', type: 'Academic', title: 'Academic Guidance Coordinator', phone: '024 100 2000', email: 'osei@sims.edu', room: 'Counselling Room 1', availability: 'Mon-Fri, 08:00 - 16:00' },
  { id: '2', name: 'Mrs. Mensah', type: 'Psychosocial', title: 'Psychosocial Support Coordinator', phone: '024 300 4000', email: 'mensah@sims.edu', room: 'Counselling Room 2', availability: 'Mon-Fri, 08:00 - 16:00' },
];

const INITIAL_CASES: CounsellingCase[] = [];

const INITIAL_SESSIONS: SessionLog[] = [];

const INITIAL_APPOINTMENTS: Appointment[] = [];

const INITIAL_REFERRALS: Referral[] = [];

const INITIAL_RESOURCES: CareerResource[] = [];

// ── Store ──

interface CounsellingState {
  counsellors: Counsellor[];
  cases: CounsellingCase[];
  sessions: SessionLog[];
  appointments: Appointment[];
  referrals: Referral[];
  resources: CareerResource[];

  // Cases
  addCase: (c: Omit<CounsellingCase, 'id' | 'caseId' | 'openedDate' | 'status'>) => void;
  updateCaseStatus: (id: string, status: CaseStatus) => void;
  updateCase: (id: string, updates: Partial<CounsellingCase>) => void;
  deleteCase: (id: string) => void;
  getCasesByType: (type: CounsellorType) => CounsellingCase[];
  getCasesByCounsellor: (name: string) => CounsellingCase[];
  getCaseById: (id: string) => CounsellingCase | undefined;
  getActiveCases: () => CounsellingCase[];
  getFollowUpsDue: () => CounsellingCase[];

  // Sessions
  addSession: (s: Omit<SessionLog, 'id'>) => void;
  deleteSession: (id: string) => void;
  getSessionsByCase: (caseId: string) => SessionLog[];

  // Appointments
  addAppointment: (a: Omit<Appointment, 'id' | 'status'>) => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  deleteAppointment: (id: string) => void;
  getTodayAppointments: () => Appointment[];
  getUpcomingAppointments: () => Appointment[];
  getAppointmentsByType: (type: CounsellorType) => Appointment[];

  // Referrals
  addReferral: (r: Omit<Referral, 'id' | 'date' | 'status'>) => void;
  updateReferralStatus: (id: string, status: ReferralStatus) => void;
  deleteReferral: (id: string) => void;

  // Resources
  addResource: (r: Omit<CareerResource, 'id'>) => void;
  updateResource: (id: string, updates: Partial<CareerResource>) => void;
  deleteResource: (id: string) => void;

  // API
  loadCases: () => Promise<void>;
  loadAppointments: () => Promise<void>;
  loadAll: () => Promise<void>;
}

export const useCounsellingStore = create<CounsellingState>((set, get) => ({
  counsellors: COUNSELLORS,
  cases: INITIAL_CASES,
  sessions: INITIAL_SESSIONS,
  appointments: INITIAL_APPOINTMENTS,
  referrals: INITIAL_REFERRALS,
  resources: INITIAL_RESOURCES,

  // ── Cases ──
  addCase: async (c) => {
    const caseNum = get().cases.length + 46;
    const newCase: CounsellingCase = { ...c, id: nextId(), caseId: `C-${String(caseNum).padStart(3, '0')}`, openedDate: todayISO(), status: 'Active' };
    try {
      const created = await apiClient.post<any>('/counselling/cases', c);
      set((state) => ({ cases: [{ ...newCase, id: created.id || nextId() }, ...state.cases] }));
    } catch {
      set((state) => ({ cases: [newCase, ...state.cases] }));
    }
  },

  updateCaseStatus: (id, status) => {
    set((state) => ({ cases: state.cases.map((c) => (c.id === id ? { ...c, status } : c)) }));
  },

  updateCase: (id, updates) => {
    set((state) => ({ cases: state.cases.map((c) => (c.id === id ? { ...c, ...updates } : c)) }));
  },

  deleteCase: (id) => {
    set((state) => ({ cases: state.cases.filter((c) => c.id !== id) }));
  },

  getCasesByType: (type) => get().cases.filter((c) => c.type === type),

  getCasesByCounsellor: (name) => get().cases.filter((c) => c.assignedCounsellor === name),

  getCaseById: (id) => get().cases.find((c) => c.id === id),

  getActiveCases: () => get().cases.filter((c) => c.status === 'Active' || c.status === 'Monitor'),

  getFollowUpsDue: () => {
    const today = todayISO();
    return get().cases.filter((c) => c.followUpDate && c.followUpDate <= today && (c.status === 'Active' || c.status === 'Monitor'));
  },

  // ── Sessions ──
  addSession: (s) => {
    set((state) => ({ sessions: [{ ...s, id: nextId() }, ...state.sessions] }));
  },

  deleteSession: (id) => {
    set((state) => ({ sessions: state.sessions.filter((s) => s.id !== id) }));
  },

  getSessionsByCase: (caseId) => get().sessions.filter((s) => s.caseId === caseId).sort((a, b) => b.date.localeCompare(a.date)),

  // ── Appointments ──
  addAppointment: async (a) => {
    try {
      const created = await apiClient.post<any>('/counselling/appointments', a);
      set((state) => ({ appointments: [{ ...a, id: created.id || nextId(), status: 'Scheduled' }, ...state.appointments] }));
    } catch {
      set((state) => ({ appointments: [{ ...a, id: nextId(), status: 'Scheduled' }, ...state.appointments] }));
    }
  },

  updateAppointmentStatus: (id, status) => {
    set((state) => ({ appointments: state.appointments.map((a) => (a.id === id ? { ...a, status } : a)) }));
  },

  deleteAppointment: (id) => {
    set((state) => ({ appointments: state.appointments.filter((a) => a.id !== id) }));
  },

  getTodayAppointments: () => {
    const today = todayISO();
    return get().appointments.filter((a) => a.date === today && a.status === 'Scheduled');
  },

  getUpcomingAppointments: () => {
    const today = todayISO();
    return get().appointments.filter((a) => a.date >= today && a.status === 'Scheduled').sort((a, b) => a.date.localeCompare(b.date));
  },

  getAppointmentsByType: (type) => get().appointments.filter((a) => a.type === type),

  // ── Referrals ──
  addReferral: (r) => {
    set((state) => ({ referrals: [{ ...r, id: nextId(), date: todayISO(), status: 'Pending' }, ...state.referrals] }));
  },

  updateReferralStatus: (id, status) => {
    set((state) => ({ referrals: state.referrals.map((r) => (r.id === id ? { ...r, status } : r)) }));
  },

  deleteReferral: (id) => {
    set((state) => ({ referrals: state.referrals.filter((r) => r.id !== id) }));
  },

  // ── Resources ──
  addResource: (r) => {
    set((state) => ({ resources: [{ ...r, id: nextId() }, ...state.resources] }));
  },

  updateResource: (id, updates) => {
    set((state) => ({ resources: state.resources.map((r) => (r.id === id ? { ...r, ...updates } : r)) }));
  },

  deleteResource: (id) => {
    set((state) => ({ resources: state.resources.filter((r) => r.id !== id) }));
  },

  loadCases: async () => {
    try {
      const data = await apiClient.get<any[]>('/counselling/cases');
      set({ cases: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadAppointments: async () => {
    try {
      const data = await apiClient.get<any[]>('/counselling/appointments');
      set({ appointments: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadAll: async () => {
    await Promise.all([
      get().loadCases(),
      get().loadAppointments(),
    ]);
  },
}));

export const CASE_CATEGORIES_ACADEMIC = ['Academic stress', 'Subject choice', 'Career guidance', 'Study skills', 'Exam preparation', 'Underperformance'];
export const CASE_CATEGORIES_PSYCHO = ['Homesickness', 'Behavioral', 'Peer conflict', 'Anxiety', 'Depression', 'Family issues', 'Self-esteem', 'Trauma'];
export const REFERRAL_STATUSES = ['Pending', 'Ongoing', 'Completed'] as const;
export const APPOINTMENT_STATUSES = ['Scheduled', 'Completed', 'Cancelled', 'No Show'] as const;
export const CASE_STATUSES = ['Active', 'Monitor', 'Closed', 'Referred'] as const;
export const CASE_PRIORITIES = ['High', 'Medium', 'Low'] as const;
