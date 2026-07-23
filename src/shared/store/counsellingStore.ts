import { create } from 'zustand';

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

const INITIAL_CASES: CounsellingCase[] = [
  { id: '1', caseId: 'C-045', studentName: 'Student A', studentClass: 'Form 2B', category: 'Academic stress', type: 'Academic', description: 'Student struggling with multiple subjects, anxiety before exams', openedDate: '2026-07-05', status: 'Active', priority: 'High', assignedCounsellor: 'Mr. Osei', notes: 'Initial assessment completed. Student shows signs of exam anxiety.', followUpDate: '2026-07-12', confidential: true },
  { id: '2', caseId: 'C-044', studentName: 'Student B', studentClass: 'Form 1A', category: 'Homesickness', type: 'Psychosocial', description: 'Boarding student missing family, affecting sleep and appetite', openedDate: '2026-07-03', status: 'Active', priority: 'Medium', assignedCounsellor: 'Mrs. Mensah', notes: 'Supportive counselling sessions ongoing. Housemaster informed.', followUpDate: '2026-07-10', confidential: true },
  { id: '3', caseId: 'C-043', studentName: 'Student C', studentClass: 'Form 3C', category: 'Behavioral', type: 'Psychosocial', description: 'Disruptive behavior in class, possible underlying issues', openedDate: '2026-06-28', status: 'Monitor', priority: 'Medium', assignedCounsellor: 'Mrs. Mensah', notes: 'Referred to clinical psychologist for assessment.', followUpDate: '2026-07-15', confidential: true },
  { id: '4', caseId: 'C-042', studentName: 'Student D', studentClass: 'Form 3A', category: 'Career guidance', type: 'Academic', description: 'Uncertain about subject selection for WASSCE', openedDate: '2026-06-20', status: 'Closed', priority: 'Low', assignedCounsellor: 'Mr. Osei', notes: 'Career assessment completed. Student decided on Science track.', followUpDate: '', confidential: false },
  { id: '5', caseId: 'C-041', studentName: 'Student E', studentClass: 'Form 2A', category: 'Subject choice', type: 'Academic', description: 'Needs guidance on elective subjects', openedDate: '2026-06-18', status: 'Active', priority: 'Low', assignedCounsellor: 'Mr. Osei', notes: 'Exploring interest in Business vs Arts.', followUpDate: '2026-07-14', confidential: false },
  { id: '6', caseId: 'C-040', studentName: 'Student F', studentClass: 'Form 1B', category: 'Peer conflict', type: 'Psychosocial', description: 'Bullying concerns reported by class teacher', openedDate: '2026-06-15', status: 'Referred', priority: 'High', assignedCounsellor: 'Mrs. Mensah', notes: 'Referred to speech therapist. School discipline team involved.', followUpDate: '2026-07-08', confidential: true },
];

const INITIAL_SESSIONS: SessionLog[] = [
  { id: '1', caseId: '1', date: '2026-07-05', counsellor: 'Mr. Osei', type: 'Academic', summary: 'Initial assessment', notes: 'Student expressed anxiety about upcoming exams. Discussed study strategies and relaxation techniques.', nextAction: 'Follow-up session to review study plan', nextSessionDate: '2026-07-12' },
  { id: '2', caseId: '2', date: '2026-07-03', counsellor: 'Mrs. Mensah', type: 'Psychosocial', summary: 'Initial counselling session', notes: 'Student shared feelings of loneliness. Explored coping mechanisms and social activities.', nextAction: 'Encourage participation in house activities', nextSessionDate: '2026-07-10' },
  { id: '3', caseId: '2', date: '2026-07-08', counsellor: 'Mrs. Mensah', type: 'Psychosocial', summary: 'Follow-up session', notes: 'Student reports slightly better sleep. Joined the reading club.', nextAction: 'Continue monitoring, involve housemaster', nextSessionDate: '2026-07-15' },
  { id: '4', caseId: '4', date: '2026-06-20', counsellor: 'Mr. Osei', type: 'Academic', summary: 'Career assessment', notes: 'Administered interest inventory. Student leans toward Science.', nextAction: 'None — case closed', nextSessionDate: '' },
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  { id: '1', date: todayISO(), time: '10:00', studentName: 'Student A', studentClass: 'Form 2B', type: 'Academic', counsellor: 'Mr. Osei', reason: 'Follow-up on exam anxiety', status: 'Scheduled', notes: '' },
  { id: '2', date: todayISO(), time: '11:00', studentName: 'Student E', studentClass: 'Form 2A', type: 'Academic', counsellor: 'Mr. Osei', reason: 'Subject choice discussion', status: 'Scheduled', notes: '' },
  { id: '3', date: todayISO(), time: '14:00', studentName: 'Student B', studentClass: 'Form 1A', type: 'Psychosocial', counsellor: 'Mrs. Mensah', reason: 'Homesickness follow-up', status: 'Scheduled', notes: '' },
  { id: '4', date: '2026-07-07', time: '14:00', studentName: 'Student B', studentClass: 'Form 1A', type: 'Psychosocial', counsellor: 'Mrs. Mensah', reason: 'Counselling session', status: 'Completed', notes: 'Went well, student more settled' },
];

const INITIAL_REFERRALS: Referral[] = [
  { id: '1', date: '2026-07-02', studentName: 'Student C', studentClass: 'Form 3C', referredTo: 'Clinical Psychologist', reason: 'Behavioral assessment', type: 'Psychosocial', status: 'Ongoing', notes: 'Assessment in progress, awaiting report' },
  { id: '2', date: '2026-06-15', studentName: 'Student F', studentClass: 'Form 1B', referredTo: 'Speech Therapist', reason: 'Speech evaluation', type: 'Psychosocial', status: 'Completed', notes: 'Evaluation complete, no issues found' },
];

const INITIAL_RESOURCES: CareerResource[] = [
  { id: '1', title: 'KNUST Admission Requirements 2026/27', category: 'University', description: 'Comprehensive guide to KNUST admission requirements for all programmes', updated: 'Jun 2026', link: 'https://knust.edu.gh/admissions' },
  { id: '2', title: 'Scholarship Opportunities - Ghana', category: 'Scholarship', description: 'List of available scholarships for Ghanaian students', updated: 'Jun 2026', link: 'https://scholarships.gov.gh' },
  { id: '3', title: 'Engineering Programmes Guide', category: 'Course Guide', description: 'Overview of engineering programmes across Ghanaian universities', updated: 'May 2026', link: '' },
  { id: '4', title: 'Nursing Schools Directory', category: 'Course Guide', description: 'Directory of accredited nursing schools in Ghana', updated: 'May 2026', link: '' },
  { id: '5', title: 'WASSCE Subject Selection Guide', category: 'Academic', description: 'Guide to help students choose appropriate elective subjects', updated: 'Jun 2026', link: '' },
];

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
}

export const useCounsellingStore = create<CounsellingState>((set, get) => ({
  counsellors: COUNSELLORS,
  cases: INITIAL_CASES,
  sessions: INITIAL_SESSIONS,
  appointments: INITIAL_APPOINTMENTS,
  referrals: INITIAL_REFERRALS,
  resources: INITIAL_RESOURCES,

  // ── Cases ──
  addCase: (c) => {
    const caseNum = get().cases.length + 46;
    set((state) => ({
      cases: [{ ...c, id: nextId(), caseId: `C-${String(caseNum).padStart(3, '0')}`, openedDate: todayISO(), status: 'Active' }, ...state.cases],
    }));
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
  addAppointment: (a) => {
    set((state) => ({ appointments: [{ ...a, id: nextId(), status: 'Scheduled' }, ...state.appointments] }));
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
}));

export const CASE_CATEGORIES_ACADEMIC = ['Academic stress', 'Subject choice', 'Career guidance', 'Study skills', 'Exam preparation', 'Underperformance'];
export const CASE_CATEGORIES_PSYCHO = ['Homesickness', 'Behavioral', 'Peer conflict', 'Anxiety', 'Depression', 'Family issues', 'Self-esteem', 'Trauma'];
export const REFERRAL_STATUSES = ['Pending', 'Ongoing', 'Completed'] as const;
export const APPOINTMENT_STATUSES = ['Scheduled', 'Completed', 'Cancelled', 'No Show'] as const;
export const CASE_STATUSES = ['Active', 'Monitor', 'Closed', 'Referred'] as const;
export const CASE_PRIORITIES = ['High', 'Medium', 'Low'] as const;
