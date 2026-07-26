import { create } from 'zustand';
import { apiClient } from '@shared/api/apiClient';

// ── Types ──

export type ExamStatus = 'Scheduled' | 'Ongoing' | 'Completed' | 'Cancelled';
export type ResultsEntryStatus = 'Not Started' | 'In Progress' | 'Submitted' | 'Verified';
export type TimetableStatus = 'Draft' | 'Published' | 'Archived';
export type HODApprovalStatus = 'Pending' | 'Approved' | 'Deferred' | 'Rejected';
export type HODApprovalType = 'Teacher Assignment' | 'Syllabus Coverage Report' | 'Exam Paper Moderation' | 'Curriculum Change' | 'Resource Request';
export type ReportCardStatus = 'Not Generated' | 'Generated' | 'Under Review' | 'Released';
export type TranscriptStatus = 'Draft' | 'Pending Review' | 'Approved' | 'Released' | 'Rejected';
export type SPIPStatus = 'Draft' | 'Active' | 'Monitoring' | 'Completed' | 'Archived';
export type SPIPPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type SPIPFocusArea = 'People' | 'Instruction' | 'Structures';
export type SPIPGoalStatus = 'Not Started' | 'On Track' | 'At Risk' | 'Behind' | 'Achieved';
export type CurriculumStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Revised';
export type CalendarEventType = 'Term Start' | 'Term End' | 'Exam' | 'Holiday' | 'Meeting' | 'Event' | 'Deadline';
export type TermName = 'Term 1' | 'Term 2' | 'Term 3';

export const EXAM_STATUSES: ExamStatus[] = ['Scheduled', 'Ongoing', 'Completed', 'Cancelled'];
export const RESULTS_ENTRY_STATUSES: ResultsEntryStatus[] = ['Not Started', 'In Progress', 'Submitted', 'Verified'];
export const TIMETABLE_STATUSES: TimetableStatus[] = ['Draft', 'Published', 'Archived'];
export const HOD_APPROVAL_STATUSES: HODApprovalStatus[] = ['Pending', 'Approved', 'Deferred', 'Rejected'];
export const HOD_APPROVAL_TYPES: HODApprovalType[] = ['Teacher Assignment', 'Syllabus Coverage Report', 'Exam Paper Moderation', 'Curriculum Change', 'Resource Request'];
export const REPORT_CARD_STATUSES: ReportCardStatus[] = ['Not Generated', 'Generated', 'Under Review', 'Released'];
export const TRANSCRIPT_STATUSES: TranscriptStatus[] = ['Draft', 'Pending Review', 'Approved', 'Released', 'Rejected'];
export const SPIP_STATUSES: SPIPStatus[] = ['Draft', 'Active', 'Monitoring', 'Completed', 'Archived'];
export const SPIP_PRIORITIES: SPIPPriority[] = ['Low', 'Medium', 'High', 'Critical'];
export const SPIP_FOCUS_AREAS: SPIPFocusArea[] = ['People', 'Instruction', 'Structures'];
export const SPIP_GOAL_STATUSES: SPIPGoalStatus[] = ['Not Started', 'On Track', 'At Risk', 'Behind', 'Achieved'];
export const CURRICULUM_STATUSES: CurriculumStatus[] = ['Not Started', 'In Progress', 'Completed', 'Revised'];
export const CALENDAR_EVENT_TYPES: CalendarEventType[] = ['Term Start', 'Term End', 'Exam', 'Holiday', 'Meeting', 'Event', 'Deadline'];
export const TERM_NAMES: TermName[] = ['Term 1', 'Term 2', 'Term 3'];

export interface Exam {
  id: string;
  title: string;
  subject: string;
  classForm: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  maxScore: number;
  status: ExamStatus;
  resultsStatus: ResultsEntryStatus;
  invigilator: string;
  term: TermName;
}

export interface Timetable {
  id: string;
  classForm: string;
  day: string;
  period: number;
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string;
  room: string;
  status: TimetableStatus;
}

export interface HODApproval {
  id: string;
  type: HODApprovalType;
  from: string;
  department: string;
  detail: string;
  date: string;
  status: HODApprovalStatus;
  reviewedBy?: string;
  reviewDate?: string;
  reviewNotes?: string;
}

export interface ReportCardEntry {
  id: string;
  classForm: string;
  studentName: string;
  admNo: string;
  term: TermName;
  academicYear: string;
  subjects: { subject: string; classScore: number; examScore: number; total: number; grade: string; position: string; remark: string }[];
  totalScore: number;
  average: number;
  classPosition: string;
  conduct: string;
  attendance: string;
  remarks: string;
  status: ReportCardStatus;
  generatedDate?: string;
  reviewedBy?: string;
}

export interface Transcript {
  id: string;
  studentName: string;
  admNo: string;
  classForm: string;
  academicYear: string;
  termsCovered: TermName[];
  yearSummary: { term: TermName; subjects: { subject: string; total: number; grade: string; remark: string }[]; average: number; position: string }[];
  cumulativeAverage: number;
  overallPosition: string;
  conduct: string;
  attendance: string;
  status: TranscriptStatus;
  generatedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
}

export interface SPIPGoal {
  id: string;
  title: string;
  focusArea: SPIPFocusArea;
  description: string;
  baseline: string;
  target: string;
  currentProgress: string;
  status: SPIPGoalStatus;
  responsible: string;
  deadline: string;
}

export interface SPIPActionItem {
  id: string;
  description: string;
  focusArea: SPIPFocusArea;
  responsible: string;
  timeline: string;
  completed: boolean;
}

export interface SPIPMilestone {
  id: string;
  title: string;
  targetDate: string;
  achievedDate?: string;
  status: 'Pending' | 'Achieved' | 'Missed';
}

export interface SPIP {
  id: string;
  title: string;
  academicYear: string;
  planLead: string;
  priority: SPIPPriority;
  status: SPIPStatus;
  startDate: string;
  endDate: string;
  // Needs Assessment
  strengths: string;
  weaknesses: string;
  rootCauses: string;
  priorityAreas: string;
  // Goals & Actions
  goals: SPIPGoal[];
  actionItems: SPIPActionItem[];
  // Monitoring
  milestones: SPIPMilestone[];
  progressReviews: { date: string; summary: string; recordedBy: string; outcomes: string }[];
  // Stakeholder team
  teamMembers: string[];
  vision: string;
}

export interface CurriculumSubject {
  id: string;
  subject: string;
  department: string;
  hod: string;
  classForm: string;
  syllabusTopics: number;
  topicsCovered: number;
  coveragePct: number;
  status: CurriculumStatus;
  lastUpdated: string;
  notes: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: CalendarEventType;
  date: string;
  endDate?: string;
  description: string;
  term: TermName;
}

export interface AcademicTerm {
  id: string;
  term: TermName;
  academicYear: string;
  startDate: string;
  endDate: string;
  midTermBreak: string;
  isCurrent: boolean;
}

export interface SubjectPerformance {
  id: string;
  subject: string;
  department: string;
  hod: string;
  avgScore: number;
  coveragePct: number;
  teacherCount: number;
  studentCount: number;
  passRate: number;
  trend: 'up' | 'down' | 'stable';
}

export interface TeacherActivity {
  id: string;
  teacherName: string;
  department: string;
  lessonPlansThisTerm: number;
  materialsUploaded: number;
  assignmentsCreated: number;
  attendanceMarkedPct: number;
  syllabusCoverage: number;
  lastActive: string;
  status: 'Active' | 'Inactive' | 'On Leave';
}

export interface AdmissionInsight {
  id: string;
  classForm: string;
  applied: number;
  admitted: number;
  rejected: number;
  pending: number;
  capacity: number;
  filled: number;
}

// ── New Types for GES Responsibilities ──

export type SubjectSelectionStatus = 'Pending' | 'HOD Consulted' | 'Guidance Consulted' | 'Approved' | 'Rejected';

export interface SubjectSelection {
  id: string;
  date: string;
 studentName: string;
  admNo: string;
  classForm: string;
  programme: string;
  electiveSubjects: string[];
  coreSubjects: string[];
  hodConsultation: string;
  guidanceConsultation: string;
  status: SubjectSelectionStatus;
  reviewedBy?: string;
  reviewNote?: string;
}

export interface ClassListEntry {
  id: string;
  classForm: string;
  programme: string;
  academicYear: string;
  term: TermName;
  students: { admNo: string; studentName: string; gender: 'Male' | 'Female' }[];
  generatedDate: string;
  generatedBy: string;
}

export type ReportSupervisionStatus = 'Assigned' | 'In Progress' | 'Completed' | 'Verified';
export type ReportSupervisionTask = 'Preparation' | 'Printing' | 'Posting' | 'Distribution';

export interface ReportSupervision {
  id: string;
  date: string;
  term: TermName;
  academicYear: string;
  task: ReportSupervisionTask;
  assignedStaff: string;
  status: ReportSupervisionStatus;
  assignedBy: string;
  completedDate?: string;
  verifiedBy?: string;
  notes: string;
}

// ── Helpers ──

const nextId = () => Math.random().toString(36).slice(2, 10);
const todayISO = () => new Date().toISOString().slice(0, 10);

// ── Initial Data ──

const INITIAL_EXAMS: Exam[] = [];

const INITIAL_TIMETABLES: Timetable[] = [];

const INITIAL_HOD_APPROVALS: HODApproval[] = [];

const INITIAL_REPORT_CARDS: ReportCardEntry[] = [];

const INITIAL_TRANSCRIPTS: Transcript[] = [];

const INITIAL_SPIPS: SPIP[] = [];

const INITIAL_CURRICULUM: CurriculumSubject[] = [];

const INITIAL_CALENDAR: CalendarEvent[] = [];

const INITIAL_TERMS: AcademicTerm[] = [];

const INITIAL_SUBJECT_PERFORMANCE: SubjectPerformance[] = [];

const INITIAL_TEACHER_ACTIVITY: TeacherActivity[] = [];

const INITIAL_ADMISSION_INSIGHTS: AdmissionInsight[] = [];

const INITIAL_SUBJECT_SELECTIONS: SubjectSelection[] = [];
const INITIAL_CLASS_LISTS: ClassListEntry[] = [];
const INITIAL_REPORT_SUPERVISIONS: ReportSupervision[] = [];

// ── Store Interface ──

interface AcademicState {
  exams: Exam[];
  timetables: Timetable[];
  hodApprovals: HODApproval[];
  reportCards: ReportCardEntry[];
  transcripts: Transcript[];
  spips: SPIP[];
  curriculum: CurriculumSubject[];
  calendar: CalendarEvent[];
  terms: AcademicTerm[];
  subjectPerformance: SubjectPerformance[];
  teacherActivity: TeacherActivity[];
  admissionInsights: AdmissionInsight[];
  subjectSelections: SubjectSelection[];
  classLists: ClassListEntry[];
  reportSupervisions: ReportSupervision[];

  // Exams
  addExam: (e: Omit<Exam, 'id'>) => void;
  updateExam: (id: string, updates: Partial<Exam>) => void;
  deleteExam: (id: string) => void;
  updateExamResultsStatus: (id: string, status: ResultsEntryStatus) => void;

  // Timetables
  addTimetable: (t: Omit<Timetable, 'id'>) => void;
  deleteTimetable: (id: string) => void;
  publishTimetable: (classForm: string) => void;
  getTimetableForClass: (classForm: string) => Timetable[];

  // HOD Approvals
  approveHOD: (id: string, reviewer: string, notes: string) => void;
  deferHOD: (id: string, reviewer: string, notes: string) => void;
  rejectHOD: (id: string, reviewer: string, notes: string) => void;
  addHODApproval: (a: Omit<HODApproval, 'id' | 'date' | 'status'>) => void;

  // Report Cards
  generateReportCards: (classForm: string, term: TermName, academicYear: string) => void;
  reviewReportCard: (id: string, reviewer: string) => void;
  releaseReportCard: (id: string) => void;
  releaseAllForClass: (classForm: string) => void;
  deleteReportCard: (id: string) => void;
  getReportCardsByClass: (classForm: string) => ReportCardEntry[];

  // Transcripts
  generateTranscript: (t: Omit<Transcript, 'id' | 'generatedDate' | 'status'>) => void;
  approveTranscript: (id: string, approver: string) => void;
  rejectTranscript: (id: string, reason: string) => void;
  releaseTranscript: (id: string) => void;
  deleteTranscript: (id: string) => void;

  // SPIP
  addSPIP: (s: Omit<SPIP, 'id' | 'status' | 'goals' | 'actionItems' | 'milestones' | 'progressReviews'>) => void;
  updateSPIP: (id: string, updates: Partial<SPIP>) => void;
  addSPIPGoal: (spipId: string, goal: Omit<SPIPGoal, 'id'>) => void;
  updateSPIPGoal: (spipId: string, goalId: string, updates: Partial<SPIPGoal>) => void;
  addSPIPActionItem: (spipId: string, item: Omit<SPIPActionItem, 'id'>) => void;
  toggleSPIPActionItem: (spipId: string, itemId: string) => void;
  addSPIPMilestone: (spipId: string, milestone: Omit<SPIPMilestone, 'id'>) => void;
  updateSPIPMilestone: (spipId: string, milestoneId: string, updates: Partial<SPIPMilestone>) => void;
  addSPIPReview: (spipId: string, review: { summary: string; recordedBy: string; outcomes: string }) => void;
  deleteSPIP: (id: string) => void;

  // Curriculum
  addCurriculum: (c: Omit<CurriculumSubject, 'id' | 'coveragePct' | 'lastUpdated'>) => void;
  updateCurriculum: (id: string, updates: Partial<CurriculumSubject>) => void;
  deleteCurriculum: (id: string) => void;

  // Calendar
  addCalendarEvent: (e: Omit<CalendarEvent, 'id'>) => void;
  deleteCalendarEvent: (id: string) => void;

  // Terms
  addTerm: (t: Omit<AcademicTerm, 'id'>) => void;
  setCurrentTerm: (id: string) => void;

  // Insights
  getOverallStats: () => {
    totalStudents: number;
    totalTeachers: number;
    totalSubjects: number;
    avgCoverage: number;
    avgPassRate: number;
    pendingReportCards: number;
    pendingTranscripts: number;
    activeSPIPs: number;
    pendingHODApprovals: number;
    scheduledExams: number;
  };

  // API
  loadExams: () => Promise<void>;
  loadTimetables: () => Promise<void>;
  loadHODApprovals: () => Promise<void>;
  loadReportCards: () => Promise<void>;
  loadTranscripts: () => Promise<void>;
  loadSPIPs: () => Promise<void>;
  loadCurriculum: () => Promise<void>;
  loadCalendar: () => Promise<void>;
  loadTerms: () => Promise<void>;
  loadSubjectPerformance: () => Promise<void>;
  loadTeacherActivity: () => Promise<void>;
  loadAdmissionInsights: () => Promise<void>;

  // Subject Selections
  addSubjectSelection: (s: Omit<SubjectSelection, 'id' | 'date' | 'status'>) => void;
  updateSubjectSelection: (id: string, updates: Partial<SubjectSelection>) => void;
  reviewSubjectSelection: (id: string, status: 'Approved' | 'Rejected', reviewedBy: string, note: string) => void;
  deleteSubjectSelection: (id: string) => void;
  getPendingSubjectSelections: () => SubjectSelection[];

  // Class Lists
  addClassList: (c: Omit<ClassListEntry, 'id' | 'generatedDate'>) => void;
  deleteClassList: (id: string) => void;
  getClassListByClass: (classForm: string) => ClassListEntry[];

  // Report Supervision
  addReportSupervision: (r: Omit<ReportSupervision, 'id' | 'date' | 'status'>) => void;
  updateReportSupervision: (id: string, updates: Partial<ReportSupervision>) => void;
  verifyReportSupervision: (id: string, verifiedBy: string) => void;
  deleteReportSupervision: (id: string) => void;
  getPendingSupervisions: () => ReportSupervision[];

  loadAll: () => Promise<void>;
}

// ── Store ──

export const useAcademicStore = create<AcademicState>((set, get) => ({
  exams: INITIAL_EXAMS,
  timetables: INITIAL_TIMETABLES,
  hodApprovals: INITIAL_HOD_APPROVALS,
  reportCards: INITIAL_REPORT_CARDS,
  transcripts: INITIAL_TRANSCRIPTS,
  spips: INITIAL_SPIPS,
  curriculum: INITIAL_CURRICULUM,
  calendar: INITIAL_CALENDAR,
  terms: INITIAL_TERMS,
  subjectPerformance: INITIAL_SUBJECT_PERFORMANCE,
  teacherActivity: INITIAL_TEACHER_ACTIVITY,
  admissionInsights: INITIAL_ADMISSION_INSIGHTS,
  subjectSelections: INITIAL_SUBJECT_SELECTIONS,
  classLists: INITIAL_CLASS_LISTS,
  reportSupervisions: INITIAL_REPORT_SUPERVISIONS,

  // Exams
  addExam: async (e) => {
    try {
      const created = await apiClient.post<any>('/academic/exams', e);
      set((s) => ({ exams: [...s.exams, { ...e, id: created.id || nextId() }] }));
    } catch {
      set((s) => ({ exams: [...s.exams, { ...e, id: nextId() }] }));
    }
  },
  updateExam: (id, updates) => set((s) => ({ exams: s.exams.map((e) => e.id === id ? { ...e, ...updates } : e) })),
  deleteExam: (id) => set((s) => ({ exams: s.exams.filter((e) => e.id !== id) })),
  updateExamResultsStatus: (id, status) => set((s) => ({ exams: s.exams.map((e) => e.id === id ? { ...e, resultsStatus: status } : e) })),

  // Timetables
  addTimetable: async (t) => {
    try {
      const created = await apiClient.post<any>('/academic/timetables', t);
      set((s) => ({ timetables: [...s.timetables, { ...t, id: created.id || nextId() }] }));
    } catch {
      set((s) => ({ timetables: [...s.timetables, { ...t, id: nextId() }] }));
    }
  },
  deleteTimetable: (id) => set((s) => ({ timetables: s.timetables.filter((t) => t.id !== id) })),
  publishTimetable: (classForm) => set((s) => ({ timetables: s.timetables.map((t) => t.classForm === classForm ? { ...t, status: 'Published' } : t) })),
  getTimetableForClass: (classForm) => get().timetables.filter((t) => t.classForm === classForm),

  // HOD Approvals
  approveHOD: (id, reviewer, notes) => set((s) => ({ hodApprovals: s.hodApprovals.map((h) => h.id === id ? { ...h, status: 'Approved', reviewedBy: reviewer, reviewDate: todayISO(), reviewNotes: notes } : h) })),
  deferHOD: (id, reviewer, notes) => set((s) => ({ hodApprovals: s.hodApprovals.map((h) => h.id === id ? { ...h, status: 'Deferred', reviewedBy: reviewer, reviewDate: todayISO(), reviewNotes: notes } : h) })),
  rejectHOD: (id, reviewer, notes) => set((s) => ({ hodApprovals: s.hodApprovals.map((h) => h.id === id ? { ...h, status: 'Rejected', reviewedBy: reviewer, reviewDate: todayISO(), reviewNotes: notes } : h) })),
  addHODApproval: (a) => set((s) => ({ hodApprovals: [{ ...a, id: nextId(), date: todayISO(), status: 'Pending' }, ...s.hodApprovals] })),

  // Report Cards
  generateReportCards: (classForm, term, academicYear) => {
    const existing = get().reportCards.filter((r) => r.classForm === classForm && r.term === term && r.academicYear === academicYear);
    if (existing.length > 0) {
      set((s) => ({ reportCards: s.reportCards.map((r) => r.classForm === classForm && r.term === term && r.academicYear === academicYear ? { ...r, status: 'Generated', generatedDate: todayISO() } : r) }));
    } else {
      const stub: ReportCardEntry = {
        id: nextId(), classForm, studentName: '—', admNo: '—', term, academicYear,
        subjects: [], totalScore: 0, average: 0, classPosition: '—', conduct: '—', attendance: '—', remarks: 'Auto-generated stub',
        status: 'Generated', generatedDate: todayISO(),
      };
      set((s) => ({ reportCards: [...s.reportCards, stub] }));
    }
  },
  reviewReportCard: (id, reviewer) => set((s) => ({ reportCards: s.reportCards.map((r) => r.id === id ? { ...r, status: 'Under Review', reviewedBy: reviewer } : r) })),
  releaseReportCard: (id) => set((s) => ({ reportCards: s.reportCards.map((r) => r.id === id ? { ...r, status: 'Released' } : r) })),
  releaseAllForClass: (classForm) => set((s) => ({ reportCards: s.reportCards.map((r) => r.classForm === classForm && r.status === 'Under Review' ? { ...r, status: 'Released' } : r) })),
  deleteReportCard: (id) => set((s) => ({ reportCards: s.reportCards.filter((r) => r.id !== id) })),
  getReportCardsByClass: (classForm) => get().reportCards.filter((r) => r.classForm === classForm),

  // Transcripts
  generateTranscript: (t) => set((s) => ({ transcripts: [{ ...t, id: nextId(), generatedDate: todayISO(), status: 'Draft' }, ...s.transcripts] })),
  approveTranscript: (id, approver) => set((s) => ({ transcripts: s.transcripts.map((t) => t.id === id ? { ...t, status: 'Approved', approvedBy: approver, approvedDate: todayISO() } : t) })),
  rejectTranscript: (id, reason) => set((s) => ({ transcripts: s.transcripts.map((t) => t.id === id ? { ...t, status: 'Rejected', rejectionReason: reason } : t) })),
  releaseTranscript: (id) => set((s) => ({ transcripts: s.transcripts.map((t) => t.id === id ? { ...t, status: 'Released' } : t) })),
  deleteTranscript: (id) => set((s) => ({ transcripts: s.transcripts.filter((t) => t.id !== id) })),

  // SPIP
  addSPIP: (sp) => set((s) => ({ spips: [{ ...sp, id: nextId(), status: 'Draft', goals: [], actionItems: [], milestones: [], progressReviews: [] }, ...s.spips] })),
  updateSPIP: (id, updates) => set((s) => ({ spips: s.spips.map((sp) => sp.id === id ? { ...sp, ...updates } : sp) })),
  addSPIPGoal: (spipId, goal) => set((s) => ({ spips: s.spips.map((sp) => sp.id === spipId ? { ...sp, goals: [...sp.goals, { ...goal, id: nextId() }] } : sp) })),
  updateSPIPGoal: (spipId, goalId, updates) => set((s) => ({ spips: s.spips.map((sp) => sp.id === spipId ? { ...sp, goals: sp.goals.map((g) => g.id === goalId ? { ...g, ...updates } : g) } : sp) })),
  addSPIPActionItem: (spipId, item) => set((s) => ({ spips: s.spips.map((sp) => sp.id === spipId ? { ...sp, actionItems: [...sp.actionItems, { ...item, id: nextId() }] } : sp) })),
  toggleSPIPActionItem: (spipId, itemId) => set((s) => ({ spips: s.spips.map((sp) => sp.id === spipId ? { ...sp, actionItems: sp.actionItems.map((a) => a.id === itemId ? { ...a, completed: !a.completed } : a) } : sp) })),
  addSPIPMilestone: (spipId, milestone) => set((s) => ({ spips: s.spips.map((sp) => sp.id === spipId ? { ...sp, milestones: [...sp.milestones, { ...milestone, id: nextId() }] } : sp) })),
  updateSPIPMilestone: (spipId, milestoneId, updates) => set((s) => ({ spips: s.spips.map((sp) => sp.id === spipId ? { ...sp, milestones: sp.milestones.map((m) => m.id === milestoneId ? { ...m, ...updates } : m) } : sp) })),
  addSPIPReview: (spipId, review) => set((s) => ({ spips: s.spips.map((sp) => sp.id === spipId ? { ...sp, progressReviews: [...sp.progressReviews, { date: todayISO(), ...review }] } : sp) })),
  deleteSPIP: (id) => set((s) => ({ spips: s.spips.filter((sp) => sp.id !== id) })),

  // Curriculum
  addCurriculum: (c) => {
    const coveragePct = c.syllabusTopics > 0 ? Math.round((c.topicsCovered / c.syllabusTopics) * 100) : 0;
    set((s) => ({ curriculum: [...s.curriculum, { ...c, id: nextId(), coveragePct, lastUpdated: todayISO() }] }));
  },
  updateCurriculum: (id, updates) => set((s) => ({
    curriculum: s.curriculum.map((c) => {
      if (c.id !== id) return c;
      const merged = { ...c, ...updates };
      const coveragePct = merged.syllabusTopics > 0 ? Math.round((merged.topicsCovered / merged.syllabusTopics) * 100) : 0;
      return { ...merged, coveragePct, lastUpdated: todayISO() };
    }),
  })),
  deleteCurriculum: (id) => set((s) => ({ curriculum: s.curriculum.filter((c) => c.id !== id) })),

  // Calendar
  addCalendarEvent: (e) => set((s) => ({ calendar: [...s.calendar, { ...e, id: nextId() }] })),
  deleteCalendarEvent: (id) => set((s) => ({ calendar: s.calendar.filter((e) => e.id !== id) })),

  // Terms
  addTerm: (t) => set((s) => ({ terms: [...s.terms, { ...t, id: nextId() }] })),
  setCurrentTerm: (id) => set((s) => ({ terms: s.terms.map((t) => ({ ...t, isCurrent: t.id === id })) })),

  // Insights
  getOverallStats: () => {
    const st = get();
    const totalStudents = st.admissionInsights.reduce((s, a) => s + a.filled, 0);
    const totalTeachers = st.teacherActivity.length;
    const totalSubjects = st.subjectPerformance.length;
    const avgCoverage = st.subjectPerformance.length > 0 ? Math.round(st.subjectPerformance.reduce((s, p) => s + p.coveragePct, 0) / st.subjectPerformance.length) : 0;
    const avgPassRate = st.subjectPerformance.length > 0 ? Math.round(st.subjectPerformance.reduce((s, p) => s + p.passRate, 0) / st.subjectPerformance.length) : 0;
    const pendingReportCards = st.reportCards.filter((r) => r.status === 'Under Review' || r.status === 'Not Generated').length;
    const pendingTranscripts = st.transcripts.filter((t) => t.status === 'Pending Review' || t.status === 'Draft').length;
    const activeSPIPs = st.spips.filter((s) => s.status === 'Active' || s.status === 'Monitoring').length;
    const pendingHODApprovals = st.hodApprovals.filter((h) => h.status === 'Pending').length;
    const scheduledExams = st.exams.filter((e) => e.status === 'Scheduled').length;
    return { totalStudents, totalTeachers, totalSubjects, avgCoverage, avgPassRate, pendingReportCards, pendingTranscripts, activeSPIPs, pendingHODApprovals, scheduledExams };
  },

  loadExams: async () => {
    try {
      const data = await apiClient.get<any[]>('/academic/exams');
      set({ exams: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadTimetables: async () => {
    try {
      const data = await apiClient.get<any[]>('/academic/timetables');
      set({ timetables: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadHODApprovals: async () => {
    try {
      const data = await apiClient.get<any[]>('/academic/hod-approvals');
      set({ hodApprovals: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadReportCards: async () => {
    try {
      const data = await apiClient.get<any[]>('/academic/report-cards');
      set({ reportCards: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadTranscripts: async () => {
    try {
      const data = await apiClient.get<any[]>('/academic/transcripts');
      set({ transcripts: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadSPIPs: async () => {
    try {
      const data = await apiClient.get<any[]>('/academic/spips');
      set({ spips: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadCurriculum: async () => {
    try {
      const data = await apiClient.get<any[]>('/academic/curriculum');
      set({ curriculum: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadCalendar: async () => {
    try {
      const data = await apiClient.get<any[]>('/academic/calendar');
      set({ calendar: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadTerms: async () => {
    try {
      const data = await apiClient.get<any[]>('/academic/terms');
      set({ terms: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadSubjectPerformance: async () => {
    try {
      const data = await apiClient.get<any[]>('/academic/subject-performance');
      set({ subjectPerformance: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadTeacherActivity: async () => {
    try {
      const data = await apiClient.get<any[]>('/academic/teacher-activity');
      set({ teacherActivity: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadAdmissionInsights: async () => {
    try {
      const data = await apiClient.get<any[]>('/academic/admission-insights');
      set({ admissionInsights: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },

  // ── Subject Selections ──
  addSubjectSelection: (s) => set((st) => ({ subjectSelections: [{ ...s, id: nextId(), date: todayISO(), status: 'Pending' }, ...st.subjectSelections] })),
  updateSubjectSelection: (id, updates) => set((st) => ({ subjectSelections: st.subjectSelections.map((s) => s.id === id ? { ...s, ...updates } : s) })),
  reviewSubjectSelection: (id, status, reviewedBy, note) => set((st) => ({ subjectSelections: st.subjectSelections.map((s) => s.id === id ? { ...s, status, reviewedBy, reviewNote: note } : s) })),
  deleteSubjectSelection: (id) => set((st) => ({ subjectSelections: st.subjectSelections.filter((s) => s.id !== id) })),
  getPendingSubjectSelections: () => get().subjectSelections.filter((s) => s.status === 'Pending' || s.status === 'HOD Consulted' || s.status === 'Guidance Consulted'),

  // ── Class Lists ──
  addClassList: (c) => set((st) => ({ classLists: [{ ...c, id: nextId(), generatedDate: todayISO() }, ...st.classLists] })),
  deleteClassList: (id) => set((st) => ({ classLists: st.classLists.filter((c) => c.id !== id) })),
  getClassListByClass: (classForm) => get().classLists.filter((c) => c.classForm === classForm),

  // ── Report Supervision ──
  addReportSupervision: (r) => set((st) => ({ reportSupervisions: [{ ...r, id: nextId(), date: todayISO(), status: 'Assigned' }, ...st.reportSupervisions] })),
  updateReportSupervision: (id, updates) => set((st) => ({ reportSupervisions: st.reportSupervisions.map((r) => r.id === id ? { ...r, ...updates } : r) })),
  verifyReportSupervision: (id, verifiedBy) => set((st) => ({ reportSupervisions: st.reportSupervisions.map((r) => r.id === id ? { ...r, status: 'Verified', verifiedBy, completedDate: todayISO() } : r) })),
  deleteReportSupervision: (id) => set((st) => ({ reportSupervisions: st.reportSupervisions.filter((r) => r.id !== id) })),
  getPendingSupervisions: () => get().reportSupervisions.filter((r) => r.status === 'Assigned' || r.status === 'In Progress'),

  loadAll: async () => {
    await Promise.all([
      get().loadExams(),
      get().loadTimetables(),
      get().loadHODApprovals(),
      get().loadReportCards(),
      get().loadTranscripts(),
      get().loadSPIPs(),
      get().loadCurriculum(),
      get().loadCalendar(),
      get().loadTerms(),
      get().loadSubjectPerformance(),
      get().loadTeacherActivity(),
      get().loadAdmissionInsights(),
    ]);
  },
}));
