import { create } from 'zustand';

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

// ── Helpers ──

const nextId = () => Math.random().toString(36).slice(2, 10);
const todayISO = () => new Date().toISOString().slice(0, 10);

// ── Initial Data ──

const INITIAL_EXAMS: Exam[] = [
  { id: 'e1', title: 'Mid-Sem 1 Elective Math', subject: 'Elective Mathematics', classForm: 'SHS2 Sci A', date: '2025-07-15', startTime: '08:00', endTime: '10:00', venue: 'Hall A', maxScore: 50, status: 'Scheduled', resultsStatus: 'Not Started', invigilator: 'Mr. Mensah', term: 'Term 3' },
  { id: 'e2', title: 'Mid-Sem 1 Chemistry', subject: 'Chemistry', classForm: 'SHS2 Sci A', date: '2025-07-16', startTime: '08:00', endTime: '10:00', venue: 'Hall A', maxScore: 50, status: 'Scheduled', resultsStatus: 'Not Started', invigilator: 'Mr. Adjei', term: 'Term 3' },
  { id: 'e3', title: 'Mid-Sem 1 English', subject: 'English Language', classForm: 'SHS2 Sci A', date: '2025-07-17', startTime: '10:00', endTime: '12:00', venue: 'Hall B', maxScore: 50, status: 'Scheduled', resultsStatus: 'Not Started', invigilator: 'Mrs. Boateng', term: 'Term 3' },
  { id: 'e4', title: 'Mid-Sem 1 Core Math', subject: 'Core Mathematics', classForm: 'SHS1 Sci A', date: '2025-07-18', startTime: '08:00', endTime: '10:00', venue: 'Hall A', maxScore: 50, status: 'Scheduled', resultsStatus: 'Not Started', invigilator: 'Mr. Mensah', term: 'Term 3' },
];

const INITIAL_TIMETABLES: Timetable[] = [
  { id: 't1', classForm: 'SHS1 Sci A', day: 'Monday', period: 1, startTime: '07:30', endTime: '08:20', subject: 'Core Mathematics', teacher: 'Mr. Mensah', room: 'A1', status: 'Published' },
  { id: 't2', classForm: 'SHS1 Sci A', day: 'Monday', period: 2, startTime: '08:20', endTime: '09:10', subject: 'English Language', teacher: 'Mrs. Boateng', room: 'A1', status: 'Published' },
  { id: 't3', classForm: 'SHS1 Sci A', day: 'Monday', period: 3, startTime: '09:10', endTime: '10:00', subject: 'Chemistry', teacher: 'Mr. Adjei', room: 'Lab 1', status: 'Published' },
  { id: 't4', classForm: 'SHS2 Sci A', day: 'Monday', period: 1, startTime: '07:30', endTime: '08:20', subject: 'Elective Mathematics', teacher: 'Mr. Mensah', room: 'B1', status: 'Published' },
  { id: 't5', classForm: 'SHS3 Sci A', day: 'Monday', period: 1, startTime: '07:30', endTime: '08:20', subject: 'Physics', teacher: 'Mr. Adjei', room: 'C1', status: 'Draft' },
];

const INITIAL_HOD_APPROVALS: HODApproval[] = [
  { id: 'h1', type: 'Teacher Assignment', from: 'Mr. Adjei', department: 'Science', detail: 'Assign Mr. Owusu to SHS1 Physics', date: '2025-07-08', status: 'Pending' },
  { id: 'h2', type: 'Syllabus Coverage Report', from: 'Mrs. Boateng', department: 'Languages', detail: 'Term 2 coverage: 80%', date: '2025-07-05', status: 'Pending' },
  { id: 'h3', type: 'Exam Paper Moderation', from: 'Mr. Mensah', department: 'Mathematics', detail: 'Core Math mid-sem paper for moderation', date: '2025-07-10', status: 'Pending' },
  { id: 'h4', type: 'Curriculum Change', from: 'Mr. Adjei', department: 'Science', detail: 'Add practical component to SHS2 Chemistry', date: '2025-06-28', status: 'Approved', reviewedBy: 'Academic Office', reviewDate: '2025-07-01', reviewNotes: 'Approved with minor adjustments' },
];

const INITIAL_REPORT_CARDS: ReportCardEntry[] = [
  { id: 'r1', classForm: 'SHS1 Sci A', studentName: 'Kwame Asante', admNo: 'SHS1001', term: 'Term 2', academicYear: '2024/2025', subjects: [{ subject: 'Core Math', classScore: 28, examScore: 42, total: 70, grade: 'B+', position: '5th', remark: 'Good' }], totalScore: 70, average: 70, classPosition: '5th', conduct: 'Very Good', attendance: '95%', remarks: 'Keep it up', status: 'Released', generatedDate: '2025-04-10', reviewedBy: 'Academic Office' },
  { id: 'r2', classForm: 'SHS3 Sci A', studentName: 'Ama Serwaa', admNo: 'SHS3001', term: 'Term 2', academicYear: '2024/2025', subjects: [{ subject: 'Elective Math', classScore: 30, examScore: 45, total: 75, grade: 'A-', position: '3rd', remark: 'Excellent' }], totalScore: 75, average: 75, classPosition: '3rd', conduct: 'Excellent', attendance: '98%', remarks: 'Outstanding student', status: 'Under Review', generatedDate: '2025-04-12' },
];

const INITIAL_TRANSCRIPTS: Transcript[] = [
  { id: 'tr1', studentName: 'Kwame Asante', admNo: 'SHS1001', classForm: 'SHS1 Sci A', academicYear: '2024/2025', termsCovered: ['Term 1', 'Term 2'], yearSummary: [{ term: 'Term 1', subjects: [{ subject: 'Core Math', total: 68, grade: 'B+', remark: 'Good' }], average: 68, position: '6th' }, { term: 'Term 2', subjects: [{ subject: 'Core Math', total: 70, grade: 'B+', remark: 'Good' }], average: 70, position: '5th' }], cumulativeAverage: 69, overallPosition: '5th', conduct: 'Very Good', attendance: '95%', status: 'Approved', generatedDate: '2025-04-15', approvedBy: 'Academic Office', approvedDate: '2025-04-16' },
  { id: 'tr2', studentName: 'Yaa Mensimah', admNo: 'SHS3002', classForm: 'SHS3 Sci A', academicYear: '2024/2025', termsCovered: ['Term 1', 'Term 2'], yearSummary: [{ term: 'Term 1', subjects: [{ subject: 'Chemistry', total: 72, grade: 'A-', remark: 'Very Good' }], average: 72, position: '4th' }, { term: 'Term 2', subjects: [{ subject: 'Chemistry', total: 78, grade: 'A', remark: 'Excellent' }], average: 78, position: '2nd' }], cumulativeAverage: 75, overallPosition: '3rd', conduct: 'Excellent', attendance: '97%', status: 'Pending Review', generatedDate: '2025-07-08' },
];

const INITIAL_SPIPS: SPIP[] = [
  {
    id: 's1',
    title: '2024/2025 Academic Excellence Improvement Plan',
    academicYear: '2024/2025',
    planLead: 'Mr. Osei (Academic Officer)',
    priority: 'High',
    status: 'Active',
    startDate: '2024-09-15',
    endDate: '2025-08-08',
    strengths: 'Strong science department results, dedicated teaching staff, good ICT infrastructure',
    weaknesses: 'Below-average Core Maths pass rate (58%), low English essay scores, inconsistent syllabus coverage in SHS1',
    rootCauses: 'Weak foundational skills from JHS in Mathematics, limited reading culture, uneven teacher pacing in SHS1 classes',
    priorityAreas: '1. Core Mathematics pass rate 2. English Language writing skills 3. Syllabus coverage consistency 4. Teacher professional development',
    goals: [
      { id: 'g1', title: 'Raise Core Maths pass rate', focusArea: 'Instruction', description: 'Improve Core Mathematics pass rate across all forms', baseline: '58% pass rate (Term 1)', target: '75% pass rate by end of year', currentProgress: '67% (Term 2 exams)', status: 'On Track', responsible: 'Mr. Mensah (HOD Maths)', deadline: '2025-08-08' },
      { id: 'g2', title: 'Improve English essay writing', focusArea: 'Instruction', description: 'Enhance student essay writing and comprehension skills', baseline: '50% average essay score', target: '65% average by Term 3', currentProgress: '57% (mid-Term 2)', status: 'On Track', responsible: 'Mrs. Boateng (HOD Languages)', deadline: '2025-08-08' },
      { id: 'g3', title: 'Standardize syllabus coverage', focusArea: 'Structures', description: 'Ensure all subjects maintain ≥80% coverage by mid-term', baseline: '64% average coverage (SHS1)', target: '85% coverage across all forms', currentProgress: '72% average', status: 'At Risk', responsible: 'All HODs', deadline: '2025-06-30' },
      { id: 'g4', title: 'Teacher PD on evidence-based practices', focusArea: 'People', description: 'Train all teachers on high-leverage instructional strategies', baseline: '0% trained', target: '100% of teaching staff trained by Term 3', currentProgress: '60% trained', status: 'On Track', responsible: 'Mr. Osei (Academic Officer)', deadline: '2025-07-31' },
    ],
    actionItems: [
      { id: 'a1', description: 'After-school remedial Maths sessions twice weekly', focusArea: 'Instruction', responsible: 'Mr. Mensah', timeline: 'Term 2-3', completed: true },
      { id: 'a2', description: 'Establish reading club and weekly essay assignments', focusArea: 'Instruction', responsible: 'Mrs. Boateng', timeline: 'Term 2-3', completed: true },
      { id: 'a3', description: 'Monthly HOD syllabus coverage audits', focusArea: 'Structures', responsible: 'All HODs', timeline: 'Ongoing', completed: false },
      { id: 'a4', description: 'PD workshop on metacognitive strategies', focusArea: 'People', responsible: 'Mr. Osei', timeline: 'Term 3', completed: false },
      { id: 'a5', description: 'Peer observation program across departments', focusArea: 'People', responsible: 'PLC Coordinator', timeline: 'Term 3', completed: false },
    ],
    milestones: [
      { id: 'm1', title: 'Term 2 exam pass rate ≥65%', targetDate: '2025-04-11', achievedDate: '2025-04-10', status: 'Achieved' },
      { id: 'm2', title: 'All HODs submit coverage reports', targetDate: '2025-06-15', status: 'Pending' },
      { id: 'm3', title: '80% teachers complete PD training', targetDate: '2025-07-15', status: 'Pending' },
      { id: 'm4', title: 'Final exam pass rate ≥75%', targetDate: '2025-08-08', status: 'Pending' },
    ],
    progressReviews: [
      { date: '2025-01-20', summary: 'Term 1 review: Maths pass rate improved from 58% to 62%. Reading club launched with 45 students.', recordedBy: 'Mr. Osei', outcomes: 'Continue remedial sessions. Add more reading materials to library.' },
      { date: '2025-04-15', summary: 'Term 2 review: Maths pass rate at 67%. English essay scores at 57%. SHS1 coverage still lagging at 68%.', recordedBy: 'Mr. Osei', outcomes: 'Escalate coverage concerns to HODs. Schedule extra Maths sessions for SHS1.' },
    ],
    teamMembers: ['Mr. Osei (Academic Officer)', 'Mr. Mensah (HOD Maths)', 'Mrs. Boateng (HOD Languages)', 'Mr. Adjei (HOD Science)', 'Mr. Asante (Headmaster)', 'Mrs. Owusu (PTA Rep)'],
    vision: 'To raise academic achievement across all subjects through targeted instruction, empowered teachers, and structured monitoring systems, ensuring every student reaches their full potential.',
  },
  {
    id: 's2',
    title: 'Digital Literacy & ICT Integration Plan',
    academicYear: '2024/2025',
    planLead: 'Mr. Adjei (HOD Science/ICT)',
    priority: 'Medium',
    status: 'Monitoring',
    startDate: '2024-10-01',
    endDate: '2025-08-08',
    strengths: 'Two functional ICT labs, reliable internet, interested teaching staff',
    weaknesses: 'Limited integration of ICT in non-ICT subjects, lack of digital resources for Science and Maths',
    rootCauses: 'No formal ICT integration training, absence of subject-specific digital content',
    priorityAreas: '1. ICT integration in Maths and Science 2. Digital resource creation 3. Teacher ICT skills training',
    goals: [
      { id: 'g1', title: 'Integrate ICT in 50% of Maths & Science lessons', focusArea: 'Instruction', description: 'Use ICT tools in at least half of Maths and Science classes', baseline: '10% of lessons use ICT', target: '50% of lessons by Term 3', currentProgress: '30%', status: 'Behind', responsible: 'Mr. Adjei', deadline: '2025-08-08' },
      { id: 'g2', title: 'Create digital resource library', focusArea: 'Structures', description: 'Build a shared library of digital teaching resources', baseline: '0 resources', target: '100 resources by year end', currentProgress: '35 resources', status: 'On Track', responsible: 'Librarian + ICT Team', deadline: '2025-08-08' },
    ],
    actionItems: [
      { id: 'a1', description: 'ICT integration workshop for Maths & Science teachers', focusArea: 'People', responsible: 'Mr. Adjei', timeline: 'Term 2', completed: true },
      { id: 'a2', description: 'Source and upload digital resources to shared drive', focusArea: 'Structures', responsible: 'ICT Team', timeline: 'Ongoing', completed: false },
      { id: 'a3', description: 'Peer observation of ICT-integrated lessons', focusArea: 'People', responsible: 'Mr. Adjei', timeline: 'Term 3', completed: false },
    ],
    milestones: [
      { id: 'm1', title: 'Workshop completed for all Maths/Science teachers', targetDate: '2025-02-28', achievedDate: '2025-02-25', status: 'Achieved' },
      { id: 'm2', title: '40% ICT integration in lessons', targetDate: '2025-06-30', status: 'Pending' },
      { id: 'm3', title: '75 digital resources uploaded', targetDate: '2025-07-15', status: 'Pending' },
    ],
    progressReviews: [
      { date: '2025-03-01', summary: 'Workshop completed. Teachers beginning to use ICT in lessons but adoption is slow.', recordedBy: 'Mr. Adjei', outcomes: 'Provide one-on-one support for struggling teachers. Set up peer mentoring.' },
    ],
    teamMembers: ['Mr. Adjei (HOD Science/ICT)', 'Mr. Mensah (HOD Maths)', 'Librarian', 'Mr. Osei (Academic Officer)'],
    vision: 'To create a digitally-enabled learning environment where ICT enhances teaching and learning across all subjects, preparing students for a technology-driven world.',
  },
];

const INITIAL_CURRICULUM: CurriculumSubject[] = [
  { id: 'c1', subject: 'Elective Mathematics', department: 'Mathematics', hod: 'Mr. Mensah', classForm: 'SHS2 Sci A', syllabusTopics: 45, topicsCovered: 34, coveragePct: 76, status: 'In Progress', lastUpdated: '2025-07-08', notes: 'On track for term completion' },
  { id: 'c2', subject: 'Chemistry', department: 'Science', hod: 'Mr. Adjei', classForm: 'SHS2 Sci A', syllabusTopics: 40, topicsCovered: 27, coveragePct: 68, status: 'In Progress', lastUpdated: '2025-07-06', notes: 'Slightly behind schedule' },
  { id: 'c3', subject: 'English Language', department: 'Languages', hod: 'Mrs. Boateng', classForm: 'SHS2 Sci A', syllabusTopics: 38, topicsCovered: 30, coveragePct: 79, status: 'In Progress', lastUpdated: '2025-07-07', notes: 'Good progress' },
  { id: 'c4', subject: 'Core Mathematics', department: 'Mathematics', hod: 'Mr. Mensah', classForm: 'SHS1 Sci A', syllabusTopics: 42, topicsCovered: 27, coveragePct: 64, status: 'In Progress', lastUpdated: '2025-07-05', notes: 'Needs acceleration' },
  { id: 'c5', subject: 'Physics', department: 'Science', hod: 'Mr. Adjei', classForm: 'SHS3 Sci A', syllabusTopics: 50, topicsCovered: 45, coveragePct: 90, status: 'Completed', lastUpdated: '2025-06-28', notes: 'Syllabus completed, revision in progress' },
];

const INITIAL_CALENDAR: CalendarEvent[] = [
  { id: 'ev1', title: 'Term 3 Begins', type: 'Term Start', date: '2025-05-12', description: 'Start of Term 3', term: 'Term 3' },
  { id: 'ev2', title: 'Mid-Semester Exams', type: 'Exam', date: '2025-07-15', endDate: '2025-07-22', description: 'Term 3 mid-semester examinations', term: 'Term 3' },
  { id: 'ev3', title: 'Republic Day Holiday', type: 'Holiday', date: '2025-07-01', description: 'Public holiday', term: 'Term 3' },
  { id: 'ev4', title: 'End of Term 3', type: 'Term End', date: '2025-08-08', description: 'End of academic year', term: 'Term 3' },
  { id: 'ev5', title: 'HOD Meeting', type: 'Meeting', date: '2025-07-12', description: 'Monthly HOD review meeting', term: 'Term 3' },
  { id: 'ev6', title: 'Report Cards Due', type: 'Deadline', date: '2025-08-05', description: 'All report cards must be generated and reviewed', term: 'Term 3' },
];

const INITIAL_TERMS: AcademicTerm[] = [
  { id: 'tm1', term: 'Term 1', academicYear: '2024/2025', startDate: '2024-09-10', endDate: '2024-12-13', midTermBreak: '2024-10-28', isCurrent: false },
  { id: 'tm2', term: 'Term 2', academicYear: '2024/2025', startDate: '2025-01-13', endDate: '2025-04-11', midTermBreak: '2025-02-24', isCurrent: false },
  { id: 'tm3', term: 'Term 3', academicYear: '2024/2025', startDate: '2025-05-12', endDate: '2025-08-08', midTermBreak: '2025-06-23', isCurrent: true },
];

const INITIAL_SUBJECT_PERFORMANCE: SubjectPerformance[] = [
  { id: 'sp1', subject: 'Elective Mathematics', department: 'Mathematics', hod: 'Mr. Mensah', avgScore: 64, coveragePct: 76, teacherCount: 2, studentCount: 85, passRate: 72, trend: 'up' },
  { id: 'sp2', subject: 'Chemistry', department: 'Science', hod: 'Mr. Adjei', avgScore: 61, coveragePct: 68, teacherCount: 2, studentCount: 85, passRate: 65, trend: 'stable' },
  { id: 'sp3', subject: 'Physics', department: 'Science', hod: 'Mr. Adjei', avgScore: 67, coveragePct: 90, teacherCount: 1, studentCount: 35, passRate: 78, trend: 'up' },
  { id: 'sp4', subject: 'English Language', department: 'Languages', hod: 'Mrs. Boateng', avgScore: 70, coveragePct: 79, teacherCount: 3, studentCount: 200, passRate: 82, trend: 'up' },
  { id: 'sp5', subject: 'Core Mathematics', department: 'Mathematics', hod: 'Mr. Mensah', avgScore: 58, coveragePct: 64, teacherCount: 3, studentCount: 200, passRate: 60, trend: 'down' },
];

const INITIAL_TEACHER_ACTIVITY: TeacherActivity[] = [
  { id: 'ta1', teacherName: 'Mr. Mensah', department: 'Mathematics', lessonPlansThisTerm: 28, materialsUploaded: 12, assignmentsCreated: 8, attendanceMarkedPct: 95, syllabusCoverage: 76, lastActive: '2025-07-10', status: 'Active' },
  { id: 'ta2', teacherName: 'Mr. Adjei', department: 'Science', lessonPlansThisTerm: 24, materialsUploaded: 8, assignmentsCreated: 6, attendanceMarkedPct: 88, syllabusCoverage: 68, lastActive: '2025-07-09', status: 'Active' },
  { id: 'ta3', teacherName: 'Mrs. Boateng', department: 'Languages', lessonPlansThisTerm: 30, materialsUploaded: 15, assignmentsCreated: 10, attendanceMarkedPct: 98, syllabusCoverage: 79, lastActive: '2025-07-10', status: 'Active' },
  { id: 'ta4', teacherName: 'Mr. Owusu', department: 'Science', lessonPlansThisTerm: 5, materialsUploaded: 2, assignmentsCreated: 1, attendanceMarkedPct: 60, syllabusCoverage: 40, lastActive: '2025-07-03', status: 'On Leave' },
];

const INITIAL_ADMISSION_INSIGHTS: AdmissionInsight[] = [
  { id: 'ai1', classForm: 'SHS1 Sci A', applied: 120, admitted: 42, rejected: 65, pending: 13, capacity: 45, filled: 42 },
  { id: 'ai2', classForm: 'SHS1 Arts B', applied: 95, admitted: 40, rejected: 48, pending: 7, capacity: 45, filled: 40 },
  { id: 'ai3', classForm: 'SHS1 Bus C', applied: 70, admitted: 35, rejected: 30, pending: 5, capacity: 40, filled: 35 },
  { id: 'ai4', classForm: 'SHS1 Gen D', applied: 55, admitted: 38, rejected: 12, pending: 5, capacity: 40, filled: 38 },
];

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

  // Exams
  addExam: (e) => set((s) => ({ exams: [...s.exams, { ...e, id: nextId() }] })),
  updateExam: (id, updates) => set((s) => ({ exams: s.exams.map((e) => e.id === id ? { ...e, ...updates } : e) })),
  deleteExam: (id) => set((s) => ({ exams: s.exams.filter((e) => e.id !== id) })),
  updateExamResultsStatus: (id, status) => set((s) => ({ exams: s.exams.map((e) => e.id === id ? { ...e, resultsStatus: status } : e) })),

  // Timetables
  addTimetable: (t) => set((s) => ({ timetables: [...s.timetables, { ...t, id: nextId() }] })),
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
    const avgCoverage = Math.round(st.subjectPerformance.reduce((s, p) => s + p.coveragePct, 0) / st.subjectPerformance.length);
    const avgPassRate = Math.round(st.subjectPerformance.reduce((s, p) => s + p.passRate, 0) / st.subjectPerformance.length);
    const pendingReportCards = st.reportCards.filter((r) => r.status === 'Under Review' || r.status === 'Not Generated').length;
    const pendingTranscripts = st.transcripts.filter((t) => t.status === 'Pending Review' || t.status === 'Draft').length;
    const activeSPIPs = st.spips.filter((s) => s.status === 'Active' || s.status === 'Monitoring').length;
    const pendingHODApprovals = st.hodApprovals.filter((h) => h.status === 'Pending').length;
    const scheduledExams = st.exams.filter((e) => e.status === 'Scheduled').length;
    return { totalStudents, totalTeachers, totalSubjects, avgCoverage, avgPassRate, pendingReportCards, pendingTranscripts, activeSPIPs, pendingHODApprovals, scheduledExams };
  },
}));
