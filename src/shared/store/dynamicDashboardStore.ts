import { create } from 'zustand';

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

const INITIAL_MEETINGS: BoardMeeting[] = [
  { id: '1', title: 'Term Planning Meeting', date: '2026-09-01', attendees: '12', agenda: 'Term academic plan, exam schedule', status: 'Scheduled', minutes: '' },
  { id: '2', title: 'Mid-Term Review', date: '2026-10-15', attendees: '14', agenda: 'Review progress, address gaps', status: 'Scheduled', minutes: '' },
  { id: '3', title: 'Curriculum Review', date: '2026-06-20', attendees: '10', agenda: 'Curriculum updates for new term', status: 'Completed', minutes: 'Approved new curriculum framework' },
];

const INITIAL_POLICIES: AcademicPolicy[] = [
  { id: '1', title: 'Continuous Assessment Policy', category: 'Assessment', status: 'Active', dateApproved: '2026-01-15', description: '40% CA + 60% End of term' },
  { id: '2', title: 'Homework Submission Policy', category: 'Academic', status: 'Active', dateApproved: '2026-01-20', description: 'Strict deadlines, late penalty 10%' },
  { id: '3', title: 'Remedial Classes Policy', category: 'Support', status: 'Draft', dateApproved: null, description: 'Free remedial for struggling students' },
];

const INITIAL_DEPT_REPORTS: DepartmentReport[] = [
  { id: '1', department: 'Science', head: 'Mr. Osei', reportDate: '2026-07-10', summary: 'Strong performance in practicals', performanceRating: 'Excellent' },
  { id: '2', department: 'Mathematics', head: 'Mrs. Adjei', reportDate: '2026-07-10', summary: 'Improvement in core topics', performanceRating: 'Good' },
  { id: '3', department: 'Languages', head: 'Mr. Boateng', reportDate: '2026-07-10', summary: 'Need more oral practice sessions', performanceRating: 'Average' },
];

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

const INITIAL_MEAL_ATTENDANCE: MealAttendance[] = [
  { id: '1', date: '2026-07-13', meal: 'Breakfast', expected: 850, present: 820, absentees: '30 (sick/excused)' },
  { id: '2', date: '2026-07-13', meal: 'Lunch', expected: 850, present: 845, absentees: '5' },
  { id: '3', date: '2026-07-12', meal: 'Dinner', expected: 850, present: 830, absentees: '20' },
];

const INITIAL_HYGIENE: HygieneInspection[] = [
  { id: '1', date: '2026-07-10', area: 'Main Dining Hall', rating: 'Good', inspector: 'Dining Hall Master', notes: 'Floors clean, tables sanitized' },
  { id: '2', date: '2026-07-10', area: 'Kitchen', rating: 'Excellent', inspector: 'Health Officer', notes: 'Food storage compliant' },
  { id: '3', date: '2026-07-08', area: 'Store Room', rating: 'Fair', inspector: 'Dining Hall Master', notes: 'Needs better organization' },
]

const INITIAL_FEEDBACK: StudentFeedback[] = [
  { id: '1', date: '2026-07-12', studentName: 'Kwesi M.', meal: 'Lunch', rating: 4, comment: 'Rice and stew was good' },
  { id: '2', date: '2026-07-11', studentName: 'Ama S.', meal: 'Breakfast', rating: 3, comment: 'Tea was cold' },
  { id: '3', date: '2026-07-10', studentName: 'Yaw B.', meal: 'Dinner', rating: 5, comment: 'Best meal this week!' },
]

export interface SeatingPlan {
  id: string;
  table: string;
  house: string;
  form: string;
  capacity: number;
  students: string;
}

export interface MenuItem {
  id: string;
  date: string;
  meal: MealType;
  mainDish: string;
  side: string;
  drink: string;
  status: 'Draft' | 'Approved' | 'Served';
}

export interface SupplyItem {
  id: string;
  item: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

const INITIAL_SEATING: SeatingPlan[] = [
  { id: '1', table: 'Table A1', house: 'Kings House', form: 'Form 1', capacity: 10, students: '8 assigned' },
  { id: '2', table: 'Table A2', house: 'Kings House', form: 'Form 1', capacity: 10, students: '10 assigned' },
  { id: '3', table: 'Table B1', house: 'Queens House', form: 'Form 2', capacity: 10, students: '7 assigned' },
];

const INITIAL_MENU: MenuItem[] = [
  { id: '1', date: '2026-07-14', meal: 'Breakfast', mainDish: 'Bread & Eggs', side: 'Porridge', drink: 'Tea', status: 'Approved' },
  { id: '2', date: '2026-07-14', meal: 'Lunch', mainDish: 'Jollof Rice', side: 'Salad', drink: 'Water', status: 'Approved' },
  { id: '3', date: '2026-07-14', meal: 'Dinner', mainDish: 'Banku & Tilapia', side: 'Pepper', drink: 'Water', status: 'Draft' },
];

const INITIAL_SUPPLIES: SupplyItem[] = [
  { id: '1', item: 'Rice', category: 'Food', quantity: 120, unit: 'kg', minStock: 50, status: 'In Stock' },
  { id: '2', item: 'Cooking Oil', category: 'Food', quantity: 20, unit: 'litres', minStock: 30, status: 'Low Stock' },
  { id: '3', item: 'Plastic Plates', category: 'Cutlery', quantity: 0, unit: 'pieces', minStock: 100, status: 'Out of Stock' },
];

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

const INITIAL_EXAMS: ExamSchedule[] = [
  { id: '1', examName: 'End of Term 2 Exams', subject: 'Mathematics', date: '2026-09-20', time: '08:00', duration: '2h 30m', venue: 'Assembly Hall', status: 'Scheduled' },
  { id: '2', examName: 'End of Term 2 Exams', subject: 'English', date: '2026-09-22', time: '08:00', duration: '2h 30m', venue: 'Assembly Hall', status: 'Scheduled' },
  { id: '3', examName: 'Mid-Term Assessment', subject: 'Science', date: '2026-08-15', time: '10:00', duration: '1h 30m', venue: 'Classrooms', status: 'Completed' },
]

const INITIAL_PAPERS: QuestionPaper[] = [
  { id: '1', subject: 'Mathematics', examiner: 'Mrs. Adjei', status: 'Approved', dateSubmitted: '2026-09-01', notes: 'Core + elective sections' },
  { id: '2', subject: 'English', examiner: 'Mr. Boateng', status: 'Reviewed', dateSubmitted: '2026-09-03', notes: 'Essay + comprehension' },
  { id: '3', subject: 'Science', examiner: 'Mr. Osei', status: 'Drafted', dateSubmitted: '2026-09-05', notes: 'Practical + theory' },
]

const INITIAL_INVIGILATION: InvigilationDuty[] = [
  { id: '1', examName: 'End of Term 2', date: '2026-09-20', time: '08:00', venue: 'Hall A', invigilator: 'Mr. Osei' },
  { id: '2', examName: 'End of Term 2', date: '2026-09-20', time: '08:00', venue: 'Hall B', invigilator: 'Mrs. Adjei' },
  { id: '3', examName: 'End of Term 2', date: '2026-09-22', time: '08:00', venue: 'Hall A', invigilator: 'Mr. Boateng' },
]

const INITIAL_MALPRACTICE: MalpracticeCase[] = [
  { id: '1', studentName: 'Kofi A.', studentClass: 'Form 3B', exam: 'Mid-Term Science', type: 'Cheating', date: '2026-08-15', description: 'Found with notes in pocket', action: 'Paper cancelled, warning issued' },
]

export interface ExamResult {
  id: string;
  examName: string;
  subject: string;
  completed: number;
  passed: number;
  failed: number;
  averageScore: number;
  remarks: string;
}

const INITIAL_RESULTS: ExamResult[] = [
  { id: '1', examName: 'Mid-Term Assessment', subject: 'Science', completed: 120, passed: 95, failed: 25, averageScore: 68, remarks: 'Practical scores need improvement' },
  { id: '2', examName: 'Mid-Term Assessment', subject: 'Mathematics', completed: 118, passed: 88, failed: 30, averageScore: 64, remarks: 'Extra revision recommended' },
];

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

const INITIAL_INCIDENTS: SafetyIncident[] = [
  { id: '1', date: '2026-07-12', location: 'Dormitory B', severity: 'Medium', status: 'Investigating', description: 'Student altercation', reportedBy: 'Housemaster', action: 'Mediation scheduled' },
  { id: '2', date: '2026-07-10', location: 'Science Lab', severity: 'Low', status: 'Resolved', description: 'Broken equipment', reportedBy: 'Lab Assistant', action: 'Replaced, safety briefing done' },
  { id: '3', date: '2026-07-08', location: 'Playground', severity: 'High', status: 'Resolved', description: 'Student injury during sports', reportedBy: 'Sports Master', action: 'First aid, parent notified' },
]

const INITIAL_INSPECTIONS: SafetyInspection[] = [
  { id: '1', date: '2026-07-10', area: 'Dormitories', finding: 'Fire extinguisher expired', riskLevel: 'Major Risk', recommendation: 'Replace immediately', resolved: false },
  { id: '2', date: '2026-07-10', area: 'Kitchen', finding: 'Clean and compliant', riskLevel: 'Safe', recommendation: 'Maintain standards', resolved: true },
  { id: '3', date: '2026-07-05', area: 'Classrooms', finding: 'Loose window pane', riskLevel: 'Minor Risk', recommendation: 'Repair window', resolved: true },
]

const INITIAL_RELATIONSHIPS: RelationshipCase[] = [
  { id: '1', date: '2026-07-11', parties: 'Student A vs Student B', issue: 'Bullying allegation', status: 'Mediated', mediator: 'Counsellor', notes: 'Both students counseled' },
  { id: '2', date: '2026-07-09', parties: 'Student C vs Teacher', issue: 'Disrespect complaint', status: 'Open', mediator: 'Safe Space Officer', notes: 'Investigation ongoing' },
]

export interface TrainingRecord {
  id: string;
  title: string;
  date: string;
  trainer: string;
  participants: number;
  type: 'Fire Drill' | 'First Aid' | 'Emergency Response' | 'Safety Awareness';
}

const INITIAL_TRAINING: TrainingRecord[] = [
  { id: '1', title: 'Fire Evacuation Drill', date: '2026-07-05', trainer: 'Fire Safety Officer', participants: 850, type: 'Fire Drill' },
  { id: '2', title: 'Basic First Aid Training', date: '2026-06-20', trainer: 'School Nurse', participants: 45, type: 'First Aid' },
  { id: '3', title: 'Emergency Response Briefing', date: '2026-06-15', trainer: 'Safe Space Officer', participants: 120, type: 'Emergency Response' },
];

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

const INITIAL_AUDITS: AuditSchedule[] = [
  { id: '1', title: 'Q2 Financial Audit', type: 'Financial', startDate: '2026-07-01', endDate: '2026-07-15', auditor: 'Internal Auditor', status: 'In Progress' },
  { id: '2', title: 'Procurement Compliance', type: 'Compliance', startDate: '2026-08-01', endDate: '2026-08-10', auditor: 'Internal Auditor', status: 'Planned' },
  { id: '3', title: 'IT Systems Audit', type: 'IT', startDate: '2026-06-01', endDate: '2026-06-15', auditor: 'Internal Auditor', status: 'Completed' },
]

const INITIAL_FINDINGS: AuditFinding[] = [
  { id: '1', auditTitle: 'Q2 Financial Audit', severity: 'Medium', finding: 'Missing receipts for 3 transactions', recommendation: 'Obtain receipts, update filing', status: 'Open', date: '2026-07-05' },
  { id: '2', auditTitle: 'IT Systems Audit', severity: 'High', finding: 'User access not reviewed quarterly', recommendation: 'Implement quarterly access review', status: 'Addressed', date: '2026-06-15' },
  { id: '3', auditTitle: 'Q1 Financial Audit', severity: 'Low', finding: 'Minor rounding discrepancies', recommendation: 'Use automated calculations', status: 'Closed', date: '2026-04-20' },
]

// ══════════════════════════════════════════════
// HEADMASTER SECRETARY
// ══════════════════════════════════════════════

export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
export type CorrespondenceType = 'Incoming' | 'Outgoing';
export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

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
  type: CorrespondenceType;
  from: string;
  to: string;
  subject: string;
  status: 'Pending' | 'Forwarded' | 'Filed' | 'Replied';
}

export interface VisitorLog {
  id: string;
  date: string;
  timeIn: string;
  timeOut: string;
  visitorName: string;
  purpose: string;
  contact: string;
}

export interface SecretaryTask {
  id: string;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  assignedBy: string;
  notes: string;
}

const INITIAL_APPOINTMENTS: Appointment[] = [
  { id: '1', date: '2026-07-14', time: '10:00', visitorName: 'PTA Chairman', purpose: 'Discuss term calendar', status: 'Confirmed', notes: '' },
  { id: '2', date: '2026-07-15', time: '14:00', visitorName: 'District Director', purpose: 'Official visit', status: 'Pending', notes: 'Awaiting confirmation' },
  { id: '3', date: '2026-07-10', time: '09:00', visitorName: 'Auditor', purpose: 'Audit review meeting', status: 'Completed', notes: 'Minutes filed' },
]

const INITIAL_CORRESPONDENCE: Correspondence[] = [
  { id: '1', date: '2026-07-13', type: 'Incoming', from: 'Ghana Education Service', to: 'Headmaster', subject: 'Term calendar approval', status: 'Forwarded' },
  { id: '2', date: '2026-07-12', type: 'Outgoing', from: 'Headmaster', to: 'All Staff', subject: 'Staff meeting notice', status: 'Filed' },
  { id: '3', date: '2026-07-10', type: 'Incoming', from: 'PTA Exec', to: 'Headmaster', subject: 'Budget proposal', status: 'Pending' },
]

const INITIAL_VISITORS: VisitorLog[] = [
  { id: '1', date: '2026-07-13', timeIn: '10:00', timeOut: '11:30', visitorName: 'Mr. Addo', purpose: 'Parent visit', contact: '024XXXXXXX' },
  { id: '2', date: '2026-07-12', timeIn: '13:00', timeOut: '14:00', visitorName: 'Mrs. Owusu', purpose: 'Fee inquiry', contact: '020XXXXXXX' },
]

const INITIAL_TASKS: SecretaryTask[] = [
  { id: '1', title: 'Prepare term report draft', priority: 'High', status: 'In Progress', dueDate: '2026-07-20', assignedBy: 'Headmaster', notes: '' },
  { id: '2', title: 'File incoming correspondence', priority: 'Medium', status: 'Pending', dueDate: '2026-07-15', assignedBy: 'Headmaster', notes: '3 letters pending' },
  { id: '3', title: 'Schedule staff meeting', priority: 'Low', status: 'Completed', dueDate: '2026-07-10', assignedBy: 'Headmaster', notes: 'Scheduled for Friday' },
]

// ══════════════════════════════════════════════
// STORE
// ══════════════════════════════════════════════

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
}

export const useDynamicDashboardStore = create<DynamicDashboardState>((set) => ({
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
}));
