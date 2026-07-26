import { create } from 'zustand';
import { apiClient } from '@shared/api/apiClient';

// ══════════════════════════════════════════════
// ACADEMIC BOARD
// ══════════════════════════════════════════════

export type MeetingStatus = 'Scheduled' | 'Completed' | 'Cancelled';
export type PolicyStatus = 'Draft' | 'Approved' | 'Under Review' | 'Active';

export interface BoardMeeting {
  id: string;
  title: string;
  date: string;
  attendees: string;
  agenda: string;
  status: MeetingStatus;
  minutes: string;
}

export interface AcademicPolicy {
  id: string;
  title: string;
  category: string;
  status: PolicyStatus;
  dateApproved: string | null;
  description: string;
}

export interface DepartmentReport {
  id: string;
  department: string;
  head: string;
  reportDate: string;
  summary: string;
  performanceRating: 'Excellent' | 'Good' | 'Average' | 'Needs Improvement';
}

const INITIAL_MEETINGS: BoardMeeting[] = [];

const INITIAL_POLICIES: AcademicPolicy[] = [];

const INITIAL_DEPT_REPORTS: DepartmentReport[] = [];

// ══════════════════════════════════════════════
// DINING HALL MASTER
// ══════════════════════════════════════════════

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Supper';
export type HygieneRating = 'Excellent' | 'Good' | 'Fair' | 'Poor';

export interface MealAttendance {
  id: string;
  date: string;
  meal: MealType;
  expected: number;
  present: number;
  absentees: string;
}

export interface HygieneInspection {
  id: string;
  date: string;
  area: string;
  rating: HygieneRating;
  inspector: string;
  notes: string;
}

export interface StudentFeedback {
  id: string;
  date: string;
  studentName: string;
  meal: string;
  rating: number;
  comment: string;
}

export interface SeatingPlan {
  id: string;
  house: string;
  table: string;
  form: string;
  capacity: number;
  students: string;
  date: string;
}

export interface MenuItem {
  id: string;
  date: string;
  meal: 'Breakfast' | 'Lunch' | 'Supper';
  mainDish: string;
  side: string;
  drink: string;
  status: 'Draft' | 'Approved' | 'Served';
  approvedBy?: string;
}

export interface SupplyItem {
  id: string;
  item: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  lastUpdated: string;
}

const INITIAL_MEAL_ATTENDANCE: MealAttendance[] = [];

const INITIAL_HYGIENE: HygieneInspection[] = [];

const INITIAL_MENU: MenuItem[] = [];

const INITIAL_SUPPLIES: SupplyItem[] = [];

// ══════════════════════════════════════════════
// EXAMINATION COMMITTEE
// ══════════════════════════════════════════════

export type ExamStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
export type PaperStatus = 'Drafted' | 'Reviewed' | 'Approved' | 'Printed';
export type MalpracticeType = 'Cheating' | 'Impersonation' | 'Leakage' | 'Collusion' | 'Other';

export interface ExamSchedule {
  id: string;
  examName: string;
  subject: string;
  date: string;
  time: string;
  duration: string;
  venue: string;
  status: ExamStatus;
}

export interface QuestionPaper {
  id: string;
  subject: string;
  examiner: string;
  status: PaperStatus;
  dateSubmitted: string;
  notes: string;
}

export interface InvigilationDuty {
  id: string;
  examName: string;
  date: string;
  time: string;
  venue: string;
  invigilator: string;
}

export interface MalpracticeCase {
  id: string;
  studentName: string;
  studentClass: string;
  exam: string;
  type: MalpracticeType;
  date: string;
  description: string;
  action: string;
}

export interface ExamResult {
  id: string;
  examName: string;
  subject: string;
  completed: number;
  passed: number;
  failed: number;
  averageScore: number;
  remarks: string;
  date: string;
}

const INITIAL_EXAMS: ExamSchedule[] = [];

// ══════════════════════════════════════════════
// SAFE SPACE
// ══════════════════════════════════════════════

export type IncidentSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type IncidentStatus = 'Reported' | 'Investigating' | 'Resolved' | 'Escalated';

export interface SafetyIncident {
  id: string;
  date: string;
  location: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  description: string;
  reportedBy: string;
  action: string;
}

export interface SafetyInspection {
  id: string;
  date: string;
  area: string;
  finding: string;
  riskLevel: 'Safe' | 'Minor Risk' | 'Major Risk' | 'Hazard';
  recommendation: string;
  resolved: boolean;
}

export interface RelationshipCase {
  id: string;
  date: string;
  parties: string;
  issue: string;
  status: 'Open' | 'Mediated' | 'Resolved' | 'Escalated';
  mediator: string;
  notes: string;
}

export interface TrainingRecord {
  id: string;
  title: string;
  date: string;
  trainer: string;
  participants: number;
  type: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

const INITIAL_INCIDENTS: SafetyIncident[] = [];

// ══════════════════════════════════════════════
// INTERNAL AUDITOR
// ══════════════════════════════════════════════

export type AuditStatus = 'Planned' | 'In Progress' | 'Completed' | 'Flagged';
export type FindingSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface AuditSchedule {
  id: string;
  title: string;
  type: 'Financial' | 'Compliance' | 'Operational' | 'IT';
  startDate: string;
  endDate: string;
  auditor: string;
  status: AuditStatus;
}

export interface AuditFinding {
  id: string;
  auditTitle: string;
  severity: FindingSeverity;
  finding: string;
  recommendation: string;
  status: 'Open' | 'Addressed' | 'Closed';
  date: string;
}

const INITIAL_AUDITS: AuditSchedule[] = [];

const INITIAL_FINDINGS: AuditFinding[] = [];

// ══════════════════════════════════════════════
// HEADMASTER SECRETARY
// ══════════════════════════════════════════════

export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'No-show';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type CorrespondenceStatus = 'Pending' | 'Forwarded' | 'Filed' | 'Replied';
export type TaskPriority = 'Low' | 'Medium' | 'High';
export type CorrespondenceType = 'Incoming' | 'Outgoing';

export interface Appointment {
  id: string;
  date: string;
  time: string;
  visitorName: string;
  purpose: string;
  status: AppointmentStatus;
  notes: string;
}

export interface Correspondence {
  id: string;
  date: string;
  type: 'Incoming' | 'Outgoing';
  from: string;
  to: string;
  subject: string;
  status: CorrespondenceStatus;
}

export interface VisitorLog {
  id: string;
  date: string;
  timeIn: string;
  timeOut?: string;
  visitorName: string;
  purpose: string;
  contact: string;
}

export interface SecretaryTask {
  id: string;
  title: string;
  priority: 'Low' | 'Medium' | 'High';
  status: TaskStatus;
  dueDate: string;
  assignedBy: string;
  notes: string;
}

const INITIAL_FEEDBACK: StudentFeedback[] = [];
const INITIAL_SEATING: SeatingPlan[] = [];
const INITIAL_PAPERS: QuestionPaper[] = [];
const INITIAL_INVIGILATION: InvigilationDuty[] = [];
const INITIAL_MALPRACTICE: MalpracticeCase[] = [];
const INITIAL_RESULTS: ExamResult[] = [];
const INITIAL_INSPECTIONS: SafetyInspection[] = [];
const INITIAL_RELATIONSHIPS: RelationshipCase[] = [];
const INITIAL_TRAINING: TrainingRecord[] = [];
const INITIAL_APPOINTMENTS: Appointment[] = [];
const INITIAL_CORRESPONDENCE: Correspondence[] = [];
const INITIAL_VISITORS: VisitorLog[] = [];
const INITIAL_TASKS: SecretaryTask[] = [];

// ══════════════════════════════════════════════
// GOVERNING BOARD
// ══════════════════════════════════════════════

export interface BoardPolicy {
  id: string;
  title: string;
  submitted: string;
  status: string;
  category?: string;
  description?: string;
}

export interface BoardBudget {
  id: string;
  title: string;
  amount: number;
  fiscalYear: string;
  status: string;
}

export interface BoardMinutes {
  id: string;
  title: string;
  date: string;
  attendees: string;
  summary: string;
}

// ══════════════════════════════════════════════
// SRC
// ══════════════════════════════════════════════

export interface SRCAnnouncement {
  id: string;
  title: string;
  body: string;
  date: string;
  author: string;
  pinned: boolean;
  views: number;
}

export interface SRCGrievance {
  id: string;
  date: string;
  from: string;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: string;
}

export interface SRCInitiative {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: string;
  date: string;
}

export interface SRCPrefect {
  id: string;
  name: string;
  role: string;
  form: string;
  house: string;
}

export interface SRCEvent {
  id: string;
  event: string;
  date: string;
  status: string;
  budget: string;
}

export interface SRCTransaction {
  id: string;
  date: string;
  description: string;
  amount: string;
  type: 'Income' | 'Expense';
}

export interface SRCFeedback {
  id: string;
  category: string;
  rating: number;
  comment: string;
  date: string;
  from: string;
}

// ══════════════════════════════════════════════
// WELFARE
// ══════════════════════════════════════════════

export interface WelfareLedgerEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'Credit' | 'Debit';
  balance: number;
}

export interface WelfareSupportRequest {
  id: string;
  date: string;
  requester: string;
  category: string;
  amount: number;
  status: string;
  description: string;
}

export interface WelfareMember {
  id: string;
  name: string;
  role: string;
  contribution: number;
  joinedDate: string;
}

const genId = (arr: { id: string }[]) => String(arr.length + 1);

interface DynamicDashboardState {
  // Academic Board
  meetings: BoardMeeting[];
  policies: AcademicPolicy[];
  deptReports: DepartmentReport[];
  addMeeting: (m: Omit<BoardMeeting, 'id'>) => void;
  deleteMeeting: (id: string) => void;
  addPolicy: (p: Omit<AcademicPolicy, 'id'>) => void;
  deletePolicy: (id: string) => void;
  addDeptReport: (r: Omit<DepartmentReport, 'id'>) => void;
  deleteDeptReport: (id: string) => void;

  // Dining Hall
  mealAttendance: MealAttendance[];
  hygieneInspections: HygieneInspection[];
  studentFeedback: StudentFeedback[];
  seatingPlans: SeatingPlan[];
  menuItems: MenuItem[];
  supplies: SupplyItem[];
  addMealAttendance: (m: Omit<MealAttendance, 'id'>) => void;
  addHygieneInspection: (h: Omit<HygieneInspection, 'id'>) => void;
  addStudentFeedback: (f: Omit<StudentFeedback, 'id'>) => void;
  deleteHygieneInspection: (id: string) => void;
  addSeatingPlan: (s: Omit<SeatingPlan, 'id'>) => void;
  deleteSeatingPlan: (id: string) => void;
  addMenuItem: (m: Omit<MenuItem, 'id'>) => void;
  updateMenuItemStatus: (id: string, status: 'Draft' | 'Approved' | 'Served') => void;
  deleteMenuItem: (id: string) => void;
  addSupply: (s: Omit<SupplyItem, 'id'>) => void;
  updateSupplyStatus: (id: string, status: 'In Stock' | 'Low Stock' | 'Out of Stock') => void;
  deleteSupply: (id: string) => void;

  // Exam Committee
  exams: ExamSchedule[];
  questionPapers: QuestionPaper[];
  invigilation: InvigilationDuty[];
  malpractice: MalpracticeCase[];
  examResults: ExamResult[];
  addExam: (e: Omit<ExamSchedule, 'id'>) => void;
  deleteExam: (id: string) => void;
  addPaper: (p: Omit<QuestionPaper, 'id'>) => void;
  updatePaperStatus: (id: string, status: PaperStatus) => void;
  addInvigilation: (i: Omit<InvigilationDuty, 'id'>) => void;
  deleteInvigilation: (id: string) => void;
  addMalpractice: (m: Omit<MalpracticeCase, 'id'>) => void;
  addExamResult: (r: Omit<ExamResult, 'id'>) => void;
  deleteExamResult: (id: string) => void;

  // Safe Space
  incidents: SafetyIncident[];
  safetyInspections: SafetyInspection[];
  relationshipCases: RelationshipCase[];
  trainingRecords: TrainingRecord[];
  addIncident: (i: Omit<SafetyIncident, 'id'>) => void;
  updateIncidentStatus: (id: string, status: IncidentStatus) => void;
  addSafetyInspection: (s: Omit<SafetyInspection, 'id'>) => void;
  addRelationshipCase: (r: Omit<RelationshipCase, 'id'>) => void;
  updateRelationshipStatus: (id: string, status: 'Open' | 'Mediated' | 'Resolved' | 'Escalated') => void;
  addTrainingRecord: (t: Omit<TrainingRecord, 'id'>) => void;
  deleteTrainingRecord: (id: string) => void;

  // Internal Auditor
  audits: AuditSchedule[];
  auditFindings: AuditFinding[];
  addAudit: (a: Omit<AuditSchedule, 'id'>) => void;
  deleteAudit: (id: string) => void;
  addFinding: (f: Omit<AuditFinding, 'id'>) => void;
  updateFindingStatus: (id: string, status: 'Open' | 'Addressed' | 'Closed') => void;

  // Headmaster Secretary
  appointments: Appointment[];
  correspondence: Correspondence[];
  visitors: VisitorLog[];
  secretaryTasks: SecretaryTask[];
  addAppointment: (a: Omit<Appointment, 'id'>) => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  addCorrespondence: (c: Omit<Correspondence, 'id'>) => void;
  addVisitor: (v: Omit<VisitorLog, 'id'>) => void;
  addTask: (t: Omit<SecretaryTask, 'id'>) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;

  // Backend load methods — Academic Board
  loadBoardMeetings: () => Promise<void>;
  loadDeptReports: () => Promise<void>;
  // Backend load methods — Exam Committee
  loadExamSchedules: () => Promise<void>;
  loadExamResults: () => Promise<void>;
  // Backend load methods — Internal Auditor
  loadAudits: () => Promise<void>;
  loadAuditFindings: () => Promise<void>;
  // Backend load methods — Headmaster Secretary
  loadAppointments: () => Promise<void>;
  loadSecretaryTasks: () => Promise<void>;
  // Backend load methods — Dining Hall
  loadMenuItems: () => Promise<void>;
  loadMealAttendance: () => Promise<void>;
  loadSupplies: () => Promise<void>;
  // Backend load methods — Safe Space
  loadSafetyIncidents: () => Promise<void>;
  loadTrainingRecords: () => Promise<void>;

  // Governing Board
  boardPolicies: BoardPolicy[];
  boardBudgets: BoardBudget[];
  boardMinutes: BoardMinutes[];

  // SRC
  srcAnnouncements: SRCAnnouncement[];
  srcGrievances: SRCGrievance[];
  srcInitiatives: SRCInitiative[];
  srcPrefects: SRCPrefect[];
  srcEvents: SRCEvent[];
  srcTransactions: SRCTransaction[];
  srcFeedback: SRCFeedback[];

  // Welfare
  welfareLedger: WelfareLedgerEntry[];
  welfareSupportRequests: WelfareSupportRequest[];
  welfareMembers: WelfareMember[];

  // Backend load methods — Governing Board
  loadBoardPolicies: () => Promise<void>;
  loadBoardBudgets: () => Promise<void>;
  loadBoardMinutes: () => Promise<void>;
  // Backend load methods — SRC
  loadSRCAnnouncements: () => Promise<void>;
  loadSRCGrievances: () => Promise<void>;
  loadSRCInitiatives: () => Promise<void>;
  loadSRCPrefects: () => Promise<void>;
  loadSRCEvents: () => Promise<void>;
  loadSRCTransactions: () => Promise<void>;
  loadSRCFeedback: () => Promise<void>;
  // Backend load methods — Welfare
  loadWelfareLedger: () => Promise<void>;
  loadWelfareSupportRequests: () => Promise<void>;
  loadWelfareMembers: () => Promise<void>;
  loadAll: () => Promise<void>;
}

export const useDynamicDashboardStore = create<DynamicDashboardState>((set, get) => ({
  // ── Academic Board ──
  meetings: INITIAL_MEETINGS,
  policies: INITIAL_POLICIES,
  deptReports: INITIAL_DEPT_REPORTS,
  addMeeting: (m) => set((st) => ({ meetings: [{ ...m, id: genId(st.meetings) }, ...st.meetings] })),
  deleteMeeting: (id) => set((st) => ({ meetings: st.meetings.filter((x) => x.id !== id) })),
  addPolicy: (p) => set((st) => ({ policies: [{ ...p, id: genId(st.policies) }, ...st.policies] })),
  deletePolicy: (id) => set((st) => ({ policies: st.policies.filter((x) => x.id !== id) })),
  addDeptReport: (r) => set((st) => ({ deptReports: [{ ...r, id: genId(st.deptReports) }, ...st.deptReports] })),
  deleteDeptReport: (id) => set((st) => ({ deptReports: st.deptReports.filter((x) => x.id !== id) })),

  // ── Dining Hall ──
  mealAttendance: INITIAL_MEAL_ATTENDANCE,
  hygieneInspections: INITIAL_HYGIENE,
  studentFeedback: INITIAL_FEEDBACK,
  seatingPlans: INITIAL_SEATING,
  menuItems: INITIAL_MENU,
  supplies: INITIAL_SUPPLIES,
  addMealAttendance: (m) => set((st) => ({ mealAttendance: [{ ...m, id: genId(st.mealAttendance) }, ...st.mealAttendance] })),
  addHygieneInspection: (h) => set((st) => ({ hygieneInspections: [{ ...h, id: genId(st.hygieneInspections) }, ...st.hygieneInspections] })),
  addStudentFeedback: (f) => set((st) => ({ studentFeedback: [{ ...f, id: genId(st.studentFeedback) }, ...st.studentFeedback] })),
  deleteHygieneInspection: (id) => set((st) => ({ hygieneInspections: st.hygieneInspections.filter((x) => x.id !== id) })),
  addSeatingPlan: (s) => set((st) => ({ seatingPlans: [{ ...s, id: genId(st.seatingPlans) }, ...st.seatingPlans] })),
  deleteSeatingPlan: (id) => set((st) => ({ seatingPlans: st.seatingPlans.filter((x) => x.id !== id) })),
  addMenuItem: (m) => set((st) => ({ menuItems: [{ ...m, id: genId(st.menuItems) }, ...st.menuItems] })),
  updateMenuItemStatus: (id, status) => set((st) => ({ menuItems: st.menuItems.map((x) => x.id === id ? { ...x, status } : x) })),
  deleteMenuItem: (id) => set((st) => ({ menuItems: st.menuItems.filter((x) => x.id !== id) })),
  addSupply: (s) => set((st) => ({ supplies: [{ ...s, id: genId(st.supplies) }, ...st.supplies] })),
  updateSupplyStatus: (id, status) => set((st) => ({ supplies: st.supplies.map((x) => x.id === id ? { ...x, status } : x) })),
  deleteSupply: (id) => set((st) => ({ supplies: st.supplies.filter((x) => x.id !== id) })),

  // ── Exam Committee ──
  exams: INITIAL_EXAMS,
  questionPapers: INITIAL_PAPERS,
  invigilation: INITIAL_INVIGILATION,
  malpractice: INITIAL_MALPRACTICE,
  examResults: INITIAL_RESULTS,
  addExam: (e) => set((st) => ({ exams: [{ ...e, id: genId(st.exams) }, ...st.exams] })),
  deleteExam: (id) => set((st) => ({ exams: st.exams.filter((x) => x.id !== id) })),
  addPaper: (p) => set((st) => ({ questionPapers: [{ ...p, id: genId(st.questionPapers) }, ...st.questionPapers] })),
  updatePaperStatus: (id, status) => set((st) => ({ questionPapers: st.questionPapers.map((x) => x.id === id ? { ...x, status } : x) })),
  addInvigilation: (i) => set((st) => ({ invigilation: [{ ...i, id: genId(st.invigilation) }, ...st.invigilation] })),
  deleteInvigilation: (id) => set((st) => ({ invigilation: st.invigilation.filter((x) => x.id !== id) })),
  addMalpractice: (m) => set((st) => ({ malpractice: [{ ...m, id: genId(st.malpractice) }, ...st.malpractice] })),
  addExamResult: (r) => set((st) => ({ examResults: [{ ...r, id: genId(st.examResults) }, ...st.examResults] })),
  deleteExamResult: (id) => set((st) => ({ examResults: st.examResults.filter((x) => x.id !== id) })),

  // ── Safe Space ──
  incidents: INITIAL_INCIDENTS,
  safetyInspections: INITIAL_INSPECTIONS,
  relationshipCases: INITIAL_RELATIONSHIPS,
  trainingRecords: INITIAL_TRAINING,
  addIncident: (i) => set((st) => ({ incidents: [{ ...i, id: genId(st.incidents) }, ...st.incidents] })),
  updateIncidentStatus: (id, status) => set((st) => ({ incidents: st.incidents.map((x) => x.id === id ? { ...x, status } : x) })),
  addSafetyInspection: (s) => set((st) => ({ safetyInspections: [{ ...s, id: genId(st.safetyInspections) }, ...st.safetyInspections] })),
  addRelationshipCase: (r) => set((st) => ({ relationshipCases: [{ ...r, id: genId(st.relationshipCases) }, ...st.relationshipCases] })),
  updateRelationshipStatus: (id, status) => set((st) => ({ relationshipCases: st.relationshipCases.map((x) => x.id === id ? { ...x, status } : x) })),
  addTrainingRecord: (t) => set((st) => ({ trainingRecords: [{ ...t, id: genId(st.trainingRecords) }, ...st.trainingRecords] })),
  deleteTrainingRecord: (id) => set((st) => ({ trainingRecords: st.trainingRecords.filter((x) => x.id !== id) })),

  // ── Internal Auditor ──
  audits: INITIAL_AUDITS,
  auditFindings: INITIAL_FINDINGS,
  addAudit: (a) => set((st) => ({ audits: [{ ...a, id: genId(st.audits) }, ...st.audits] })),
  deleteAudit: (id) => set((st) => ({ audits: st.audits.filter((x) => x.id !== id) })),
  addFinding: (f) => set((st) => ({ auditFindings: [{ ...f, id: genId(st.auditFindings) }, ...st.auditFindings] })),
  updateFindingStatus: (id, status) => set((st) => ({ auditFindings: st.auditFindings.map((x) => x.id === id ? { ...x, status } : x) })),

  // ── Headmaster Secretary ──
  appointments: INITIAL_APPOINTMENTS,
  correspondence: INITIAL_CORRESPONDENCE,
  visitors: INITIAL_VISITORS,
  secretaryTasks: INITIAL_TASKS,
  addAppointment: (a) => set((st) => ({ appointments: [{ ...a, id: genId(st.appointments) }, ...st.appointments] })),
  updateAppointmentStatus: (id, status) => set((st) => ({ appointments: st.appointments.map((x) => x.id === id ? { ...x, status } : x) })),
  addCorrespondence: (c) => set((st) => ({ correspondence: [{ ...c, id: genId(st.correspondence) }, ...st.correspondence] })),
  addVisitor: (v) => set((st) => ({ visitors: [{ ...v, id: genId(st.visitors) }, ...st.visitors] })),
  addTask: (t) => set((st) => ({ secretaryTasks: [{ ...t, id: genId(st.secretaryTasks) }, ...st.secretaryTasks] })),
  updateTaskStatus: (id, status) => set((st) => ({ secretaryTasks: st.secretaryTasks.map((x) => x.id === id ? { ...x, status } : x) })),

  loadBoardMeetings: async () => {
    try {
      const data = await apiClient.get<any[]>('/academic-board/meetings');
      set({ meetings: (data || []).map((d) => ({ ...d, id: d.id || genId([]) })) });
    } catch {}
  },
  loadDeptReports: async () => {
    try {
      const data = await apiClient.get<any[]>('/academic-board/dept-reports');
      set({ deptReports: (data || []).map((d) => ({ ...d, id: d.id || genId([]) })) });
    } catch {}
  },
  loadExamSchedules: async () => {
    try {
      const data = await apiClient.get<any[]>('/exam-committee/exams');
      set({ exams: (data || []).map((d) => ({ ...d, id: d.id || genId([]) })) });
    } catch {}
  },
  loadExamResults: async () => {
    try {
      const data = await apiClient.get<any[]>('/exam-committee/results');
      set({ examResults: (data || []).map((d) => ({ ...d, id: d.id || genId([]) })) });
    } catch {}
  },
  loadAudits: async () => {
    try {
      const data = await apiClient.get<any[]>('/auditor/audits');
      set({ audits: (data || []).map((d) => ({ ...d, id: d.id || genId([]) })) });
    } catch {}
  },
  loadAuditFindings: async () => {
    try {
      const data = await apiClient.get<any[]>('/auditor/findings');
      set({ auditFindings: (data || []).map((d) => ({ ...d, id: d.id || genId([]) })) });
    } catch {}
  },
  loadAppointments: async () => {
    try {
      const data = await apiClient.get<any[]>('/secretary/appointments');
      set({ appointments: (data || []).map((d) => ({ ...d, id: d.id || genId([]) })) });
    } catch {}
  },
  loadSecretaryTasks: async () => {
    try {
      const data = await apiClient.get<any[]>('/secretary/tasks');
      set({ secretaryTasks: (data || []).map((d) => ({ ...d, id: d.id || genId([]) })) });
    } catch {}
  },
  loadMenuItems: async () => {
    try {
      const data = await apiClient.get<any[]>('/dining/menu-items');
      set({ menuItems: (data || []).map((d) => ({ ...d, id: d.id || genId([]) })) });
    } catch {}
  },
  loadMealAttendance: async () => {
    try {
      const data = await apiClient.get<any[]>('/dining/meal-attendance');
      set({ mealAttendance: (data || []).map((d) => ({ ...d, id: d.id || genId([]) })) });
    } catch {}
  },
  loadSupplies: async () => {
    try {
      const data = await apiClient.get<any[]>('/dining/supplies');
      set({ supplies: (data || []).map((d) => ({ ...d, id: d.id || genId([]) })) });
    } catch {}
  },
  loadSafetyIncidents: async () => {
    try {
      const data = await apiClient.get<any[]>('/safe-space/incidents');
      set({ incidents: (data || []).map((d) => ({ ...d, id: d.id || genId([]) })) });
    } catch {}
  },
  loadTrainingRecords: async () => {
    try {
      const data = await apiClient.get<any[]>('/safe-space/training');
      set({ trainingRecords: (data || []).map((d) => ({ ...d, id: d.id || genId([]) })) });
    } catch {}
  },

  // ── Governing Board ──
  boardPolicies: [],
  boardBudgets: [],
  boardMinutes: [],

  // ── SRC ──
  srcAnnouncements: [],
  srcGrievances: [],
  srcInitiatives: [],
  srcPrefects: [],
  srcEvents: [],
  srcTransactions: [],
  srcFeedback: [],

  // ── Welfare ──
  welfareLedger: [],
  welfareSupportRequests: [],
  welfareMembers: [],

  loadBoardPolicies: async () => {
    try {
      const data = await apiClient.get<any[]>('/governing-board/policies');
      set({ boardPolicies: (data || []).map((d) => ({ ...d, id: d.id || genId([]) })) });
    } catch {}
  },
  loadBoardBudgets: async () => {
    try {
      const data = await apiClient.get<any[]>('/governing-board/budgets');
      set({ boardBudgets: (data || []).map((d) => ({ ...d, id: d.id || genId([]) })) });
    } catch {}
  },
  loadBoardMinutes: async () => {
    try {
      const data = await apiClient.get<any[]>('/governing-board/minutes');
      set({ boardMinutes: (data || []).map((d) => ({ ...d, id: d.id || genId([]) })) });
    } catch {}
  },
  loadSRCAnnouncements: async () => {
    try {
      const data = await apiClient.get<any[]>('/src/announcements');
      set({ srcAnnouncements: (data || []).map((d) => ({ ...d, id: d.id || genId([]) })) });
    } catch {}
  },
  loadSRCGrievances: async () => {
    try {
      const data = await apiClient.get<any[]>('/src/grievances');
      set({ srcGrievances: (data || []).map((d) => ({ ...d, id: d.id || genId([]) })) });
    } catch {}
  },
  loadSRCInitiatives: async () => {
    try {
      const data = await apiClient.get<any[]>('/src/initiatives');
      set({ srcInitiatives: (data || []).map((d) => ({ ...d, id: d.id || genId([]) })) });
    } catch {}
  },
  loadSRCPrefects: async () => {
    try {
      const data = await apiClient.get<any[]>('/src/prefects');
      set({ srcPrefects: (data || []).map((d) => ({ ...d, id: d.id || genId([]) })) });
    } catch {}
  },
  loadSRCEvents: async () => {
    try {
      const data = await apiClient.get<any[]>('/src/events');
      set({ srcEvents: (data || []).map((d) => ({ ...d, id: d.id || genId([]) })) });
    } catch {}
  },
  loadSRCTransactions: async () => {
    try {
      const data = await apiClient.get<any[]>('/src/transactions');
      set({ srcTransactions: (data || []).map((d) => ({ ...d, id: d.id || genId([]) })) });
    } catch {}
  },
  loadSRCFeedback: async () => {
    try {
      const data = await apiClient.get<any[]>('/src/feedback');
      set({ srcFeedback: (data || []).map((d) => ({ ...d, id: d.id || genId([]) })) });
    } catch {}
  },
  loadWelfareLedger: async () => {
    try {
      const data = await apiClient.get<any[]>('/welfare/ledger');
      set({ welfareLedger: (data || []).map((d) => ({ ...d, id: d.id || genId([]) })) });
    } catch {}
  },
  loadWelfareSupportRequests: async () => {
    try {
      const data = await apiClient.get<any[]>('/welfare/support-requests');
      set({ welfareSupportRequests: (data || []).map((d) => ({ ...d, id: d.id || genId([]) })) });
    } catch {}
  },
  loadWelfareMembers: async () => {
    try {
      const data = await apiClient.get<any[]>('/welfare/members');
      set({ welfareMembers: (data || []).map((d) => ({ ...d, id: d.id || genId([]) })) });
    } catch {}
  },
  loadAll: async () => {
    await Promise.all([
      get().loadAppointments(),
      get().loadAuditFindings(),
      get().loadAudits(),
      get().loadBoardBudgets(),
      get().loadBoardMeetings(),
      get().loadBoardMinutes(),
      get().loadBoardPolicies(),
      get().loadDeptReports(),
      get().loadExamResults(),
      get().loadExamSchedules(),
      get().loadMealAttendance(),
      get().loadMenuItems(),
      get().loadSafetyIncidents(),
      get().loadSecretaryTasks(),
      get().loadSRCAnnouncements(),
      get().loadSRCEvents(),
      get().loadSRCFeedback(),
      get().loadSRCGrievances(),
      get().loadSRCInitiatives(),
      get().loadSRCPrefects(),
      get().loadSRCTransactions(),
      get().loadSupplies(),
      get().loadTrainingRecords(),
      get().loadWelfareLedger(),
      get().loadWelfareMembers(),
      get().loadWelfareSupportRequests(),
    ]);
  },

}));
