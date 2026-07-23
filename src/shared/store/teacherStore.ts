import { create } from 'zustand';

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

// ── Initial Data ──

const INITIAL_SUBJECTS: SubjectClass[] = [
  { id: 'tch-1', subject: 'Elective Mathematics', classForm: 'SHS2 Sci A', students: 38, hod: 'Mr. Mensah', isElective: true },
  { id: 'tch-2', subject: 'Elective Mathematics', classForm: 'SHS2 Sci B', students: 35, hod: 'Mr. Mensah', isElective: true },
  { id: 'tch-3', subject: 'Core Mathematics', classForm: 'SHS1 Sci A', students: 42, hod: 'Mr. Mensah', isElective: false },
];

const INITIAL_MATERIALS: LessonMaterial[] = [
  { id: 'tch-10', title: 'Quadratic Equations', type: 'Note', classForm: 'SHS2 Sci A', subject: 'Elective Mathematics', topic: 'Ch. 5', description: 'Complete notes on solving quadratics by factoring, completing the square, and the quadratic formula', dateUploaded: '2026-07-01', uploadedBy: 'Teacher' },
  { id: 'tch-11', title: 'Differentiation Rules', type: 'Slide', classForm: 'SHS2 Sci A', subject: 'Elective Mathematics', topic: 'Ch. 6', description: 'Power rule, product rule, quotient rule with examples', dateUploaded: '2026-07-03', uploadedBy: 'Teacher' },
  { id: 'tch-12', title: 'Indices & Logarithms', type: 'Past Q', classForm: 'SHS1 Sci A', subject: 'Core Mathematics', topic: 'Ch. 3', description: 'WASSCE past questions with solutions', dateUploaded: '2026-06-28', uploadedBy: 'Teacher' },
];

const INITIAL_AV: AVRecording[] = [
  { id: 'tch-20', title: 'Quadratic Formula Walkthrough', type: 'Video', duration: '12:30', classForm: 'SHS2 Sci A', subject: 'Elective Mathematics', topic: 'Quadratic equations', dateRecorded: '2026-07-02', recordedBy: 'Teacher' },
  { id: 'tch-21', title: 'Logarithms Explained', type: 'Audio', duration: '08:15', classForm: 'SHS1 Sci A', subject: 'Core Mathematics', topic: 'Indices & Logarithms', dateRecorded: '2026-06-30', recordedBy: 'Teacher' },
];

const INITIAL_LIVE: LiveSession[] = [
  { id: 'tch-30', subject: 'Elective Mathematics', classForm: 'SHS2 Sci A', scheduledTime: '2026-07-11 14:00', status: 'Scheduled', topic: 'Integration by substitution', startedBy: '', participants: 0 },
  { id: 'tch-31', subject: 'Core Mathematics', classForm: 'SHS1 Sci A', scheduledTime: '2026-07-12 10:00', status: 'Scheduled', topic: 'Surds and rationalization', startedBy: '', participants: 0 },
  { id: 'tch-32', subject: 'Elective Mathematics', classForm: 'SHS2 Sci B', scheduledTime: '2026-07-05 14:00', status: 'Ended', topic: 'Limits and continuity', startedBy: 'Teacher', participants: 33 },
];

const INITIAL_ASSIGNMENTS: Assignment[] = [
  { id: 'tch-40', title: 'Quadratic Eq. Exercise 3', description: 'Solve all questions on page 45, including word problems', classForm: 'SHS2 Sci A', subject: 'Elective Mathematics', dueDate: '2026-07-10', dateCreated: '2026-07-05', maxScore: 20, status: 'Published', createdBy: 'Teacher',
    submissions: [
      { id: 'tch-40a', assignmentId: 'tch-40', studentName: 'Kwame Asante', admNo: '2026/001', submittedDate: '2026-07-08', status: 'Graded', score: 18, feedback: 'Good work on factoring. Review Q5.' },
      { id: 'tch-40b', assignmentId: 'tch-40', studentName: 'Grace Opoku', admNo: '2026/002', submittedDate: '2026-07-09', status: 'Graded', score: 15, feedback: 'Watch sign errors in Q3.' },
      { id: 'tch-40c', assignmentId: 'tch-40', studentName: 'Samuel Aidoo', admNo: '2026/003', submittedDate: '2026-07-09', status: 'Graded', score: 19, feedback: 'Excellent. Neat presentation.' },
    ] },
  { id: 'tch-41', title: 'Indices Practice Set', description: 'Simplify and evaluate all expressions in Exercise 2.3', classForm: 'SHS1 Sci A', subject: 'Core Mathematics', dueDate: '2026-07-08', dateCreated: '2026-07-03', maxScore: 15, status: 'Published', createdBy: 'Teacher',
    submissions: [
      { id: 'tch-41a', assignmentId: 'tch-41', studentName: 'Kwame Asante', admNo: '2026/001', submittedDate: '2026-07-07', status: 'Graded', score: 13, feedback: 'Good effort.' },
    ] },
  { id: 'tch-42', title: 'Mid-Sem Quiz', description: 'Covers chapters 1-6. 50 marks, 1 hour.', classForm: 'SHS2 Sci B', subject: 'Elective Mathematics', dueDate: '2026-07-12', dateCreated: '2026-07-06', maxScore: 50, status: 'Published', createdBy: 'Teacher',
    submissions: [
      { id: 'tch-42a', assignmentId: 'tch-42', studentName: 'Daniel Osei', admNo: '2026/004', submittedDate: '2026-07-06', status: 'Submitted' },
    ] },
];

const INITIAL_GRADEBOOK: GradebookEntry[] = [
  { id: 'tch-50', studentName: 'Kwame Asante', admNo: '2026/001', classForm: 'SHS2 Sci A', subject: 'Elective Mathematics', term: 'Term 3 2025/2026', classwork: 8, classworkMax: 10, homework: 9, homeworkMax: 10, test: 17, testMax: 20, exam: 72, examMax: 100, total: 106, totalMax: 140, grade: 'A1' },
  { id: 'tch-51', studentName: 'Grace Opoku', admNo: '2026/002', classForm: 'SHS2 Sci A', subject: 'Elective Mathematics', term: 'Term 3 2025/2026', classwork: 7, classworkMax: 10, homework: 8, homeworkMax: 10, test: 15, testMax: 20, exam: 65, examMax: 100, total: 95, totalMax: 140, grade: 'B3' },
  { id: 'tch-52', studentName: 'Samuel Aidoo', admNo: '2026/003', classForm: 'SHS2 Sci A', subject: 'Elective Mathematics', term: 'Term 3 2025/2026', classwork: 9, classworkMax: 10, homework: 10, homeworkMax: 10, test: 18, testMax: 20, exam: 85, examMax: 100, total: 122, totalMax: 140, grade: 'A1' },
];

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  { id: 'tch-60', studentName: 'Kwame Asante', admNo: '2026/001', classForm: 'SHS2 Sci A', subject: 'Elective Mathematics', date: '2026-07-07', status: 'Present' },
  { id: 'tch-61', studentName: 'Grace Opoku', admNo: '2026/002', classForm: 'SHS2 Sci A', subject: 'Elective Mathematics', date: '2026-07-07', status: 'Present' },
  { id: 'tch-62', studentName: 'Samuel Aidoo', admNo: '2026/003', classForm: 'SHS2 Sci A', subject: 'Elective Mathematics', date: '2026-07-07', status: 'Late' },
  { id: 'tch-63', studentName: 'Daniel Osei', admNo: '2026/004', classForm: 'SHS2 Sci A', subject: 'Elective Mathematics', date: '2026-07-07', status: 'Absent' },
];

const INITIAL_ROSTER: StudentRosterEntry[] = [
  { id: 'tch-70', name: 'Kwame Asante', admNo: '2026/001', classForm: 'SHS2 Sci A', avgScore: '75.7%', attendancePct: '92%', lastGrade: 'B1', guardianName: 'Mr. Kofi Asante', guardianPhone: '024-555-1001' },
  { id: 'tch-71', name: 'Grace Opoku', admNo: '2026/002', classForm: 'SHS2 Sci A', avgScore: '67.8%', attendancePct: '88%', lastGrade: 'B3', guardianName: 'Mrs. Grace Opoku', guardianPhone: '027-555-1002' },
  { id: 'tch-72', name: 'Samuel Aidoo', admNo: '2026/003', classForm: 'SHS2 Sci A', avgScore: '87.1%', attendancePct: '96%', lastGrade: 'A1', guardianName: 'Mr. Samuel Aidoo', guardianPhone: '020-555-1003' },
  { id: 'tch-73', name: 'Daniel Osei', admNo: '2026/004', classForm: 'SHS2 Sci A', avgScore: '45.2%', attendancePct: '71%', lastGrade: 'D7', guardianName: 'Mrs. Adwoa Osei', guardianPhone: '055-555-1004' },
];

const INITIAL_ANNOUNCEMENTS: ClassAnnouncement[] = [
  { id: 'tch-80', title: 'Reminder: Assignment due Jul 10', body: 'Quadratic Equations Exercise 3 is due this Friday. Please submit during class hours.', classForm: 'SHS2 Sci A', date: '2026-07-06', postedBy: 'Teacher', priority: 'Important' },
  { id: 'tch-81', title: 'Extra tutorial Saturday 9am', body: 'I will hold an extra tutorial session on Saturday from 9am to 12pm in the Math lab. Focus: differentiation techniques.', classForm: 'SHS1 Sci A', date: '2026-07-04', postedBy: 'Teacher', priority: 'Normal' },
];

const INITIAL_LESSON_PLANS: LessonPlan[] = [
  { id: 'tch-90', subject: 'Elective Mathematics', classForm: 'SHS2 Sci A', date: '2026-07-08', topic: 'Integration by substitution', objectives: 'Students should be able to integrate composite functions using substitution', teachingMethods: 'Direct instruction + guided practice', resources: 'Whiteboard, textbook Ch.7, prepared examples', activities: '1. Review chain rule\n2. Introduce substitution method\n3. Worked examples\n4. Practice exercises', assessment: 'Exit ticket: 2 integration problems', homework: 'Exercise 7.2 Q1-10', status: 'Planned' },
  { id: 'tch-91', subject: 'Core Mathematics', classForm: 'SHS1 Sci A', date: '2026-07-07', topic: 'Surds and rationalization', objectives: 'Students should be able to simplify surds and rationalize denominators', teachingMethods: 'Discovery + pair work', resources: 'Whiteboard, worksheets', activities: '1. Define surds\n2. Simplification rules\n3. Rationalization\n4. Pair practice', assessment: 'Oral questioning', homework: 'Exercise 3.4 Q1-8', status: 'Taught', reflection: 'Students struggled with rationalization of binomial denominators. Will review next lesson.' },
];

const INITIAL_TIMETABLE: TimetableEntry[] = [
  { id: 'tch-100', day: 'Monday', period: 1, startTime: '08:00', endTime: '08:40', subject: 'Elective Mathematics', classForm: 'SHS2 Sci A', room: 'M1' },
  { id: 'tch-101', day: 'Monday', period: 2, startTime: '08:40', endTime: '09:20', subject: 'Elective Mathematics', classForm: 'SHS2 Sci A', room: 'M1' },
  { id: 'tch-102', day: 'Monday', period: 4, startTime: '10:00', endTime: '10:40', subject: 'Core Mathematics', classForm: 'SHS1 Sci A', room: 'M2' },
  { id: 'tch-103', day: 'Tuesday', period: 3, startTime: '09:20', endTime: '10:00', subject: 'Elective Mathematics', classForm: 'SHS2 Sci B', room: 'M1' },
  { id: 'tch-104', day: 'Wednesday', period: 1, startTime: '08:00', endTime: '08:40', subject: 'Elective Mathematics', classForm: 'SHS2 Sci B', room: 'M1' },
  { id: 'tch-105', day: 'Wednesday', period: 5, startTime: '10:40', endTime: '11:20', subject: 'Core Mathematics', classForm: 'SHS1 Sci A', room: 'M2' },
  { id: 'tch-106', day: 'Thursday', period: 2, startTime: '08:40', endTime: '09:20', subject: 'Elective Mathematics', classForm: 'SHS2 Sci A', room: 'M1' },
  { id: 'tch-107', day: 'Friday', period: 3, startTime: '09:20', endTime: '10:00', subject: 'Core Mathematics', classForm: 'SHS1 Sci A', room: 'M2' },
  { id: 'tch-108', day: 'Friday', period: 6, startTime: '11:20', endTime: '12:00', subject: 'Elective Mathematics', classForm: 'SHS2 Sci B', room: 'M1' },
];

const INITIAL_SYLLABUS: SyllabusTopic[] = [
  { id: 'tch-110', subject: 'Elective Mathematics', classForm: 'SHS2 Sci A', topic: 'Differentiation', subTopics: 'Power rule, product rule, quotient rule, chain rule', week: 1, status: 'Completed', dateTaught: '2026-06-28' },
  { id: 'tch-111', subject: 'Elective Mathematics', classForm: 'SHS2 Sci A', topic: 'Applications of Differentiation', subTopics: 'Max/min problems, rates of change, tangents and normals', week: 2, status: 'Completed', dateTaught: '2026-07-05' },
  { id: 'tch-112', subject: 'Elective Mathematics', classForm: 'SHS2 Sci A', topic: 'Integration', subTopics: 'Indefinite integrals, substitution method, definite integrals', week: 3, status: 'In Progress', notes: 'Started substitution method today' },
  { id: 'tch-113', subject: 'Elective Mathematics', classForm: 'SHS2 Sci A', topic: 'Applications of Integration', subTopics: 'Area under curve, volume of revolution', week: 4, status: 'Not Started' },
  { id: 'tch-114', subject: 'Elective Mathematics', classForm: 'SHS2 Sci A', topic: 'Differential Equations', subTopics: 'First order, separation of variables', week: 5, status: 'Not Started' },
  { id: 'tch-115', subject: 'Core Mathematics', classForm: 'SHS1 Sci A', topic: 'Indices & Logarithms', subTopics: 'Laws of indices, logarithmic functions, change of base', week: 1, status: 'Completed', dateTaught: '2026-06-28' },
  { id: 'tch-116', subject: 'Core Mathematics', classForm: 'SHS1 Sci A', topic: 'Surds', subTopics: 'Simplification, rationalization, operations', week: 2, status: 'Completed', dateTaught: '2026-07-07' },
  { id: 'tch-117', subject: 'Core Mathematics', classForm: 'SHS1 Sci A', topic: 'Sets & Operations', subTopics: 'Set notation, Venn diagrams, applications', week: 3, status: 'In Progress' },
  { id: 'tch-118', subject: 'Core Mathematics', classForm: 'SHS1 Sci A', topic: 'Relations & Functions', subTopics: 'Domain, range, composition, inverse', week: 4, status: 'Not Started' },
];

const INITIAL_REMEDIAL: RemedialStudent[] = [
  { id: 'tch-120', studentName: 'Daniel Osei', admNo: '2026/004', classForm: 'SHS2 Sci A', subject: 'Elective Mathematics', area: 'Factoring quadratics', intervention: 'After-school practice sessions, simplified worksheets', dateStarted: '2026-07-01', progress: 'Improving', notes: 'Showing improvement in simple factoring. Needs more practice on complex expressions.' },
];

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

  // Assignments
  addAssignment: (a: Omit<Assignment, 'id' | 'dateCreated' | 'status' | 'submissions' | 'createdBy'>) => void;
  publishAssignment: (id: string) => void;
  closeAssignment: (id: string) => void;
  deleteAssignment: (id: string) => void;
  submitAssignment: (assignmentId: string, studentName: string, admNo: string) => void;
  gradeSubmission: (submissionId: string, score: number, feedback: string) => void;

  // Gradebook
  addGradeEntry: (g: Omit<GradebookEntry, 'id' | 'total' | 'totalMax' | 'grade'>) => void;
  updateGradeEntry: (id: string, updates: Partial<GradebookEntry>) => void;
  deleteGradeEntry: (id: string) => void;
  getGradebookForClass: (classForm: string, subject: string) => GradebookEntry[];

  // Attendance
  markAttendance: (records: Omit<AttendanceRecord, 'id'>[]) => void;
  getAttendanceForDate: (classForm: string, date: string) => AttendanceRecord[];
  getAttendanceStats: (classForm: string) => { present: number; absent: number; late: number; excused: number };

  // Roster
  addRosterEntry: (r: Omit<StudentRosterEntry, 'id'>) => void;
  updateRosterEntry: (id: string, updates: Partial<StudentRosterEntry>) => void;

  // Announcements
  addAnnouncement: (a: Omit<ClassAnnouncement, 'id' | 'date'>) => void;
  deleteAnnouncement: (id: string) => void;

  // Lesson plans
  addLessonPlan: (lp: Omit<LessonPlan, 'id' | 'status'>) => void;
  updateLessonPlan: (id: string, updates: Partial<LessonPlan>) => void;
  deleteLessonPlan: (id: string) => void;
  markLessonTaught: (id: string, reflection: string) => void;

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
}

export const useTeacherStore = create<TeacherState>((set, get) => ({
  subjects: INITIAL_SUBJECTS,
  materials: INITIAL_MATERIALS,
  avRecordings: INITIAL_AV,
  liveSessions: INITIAL_LIVE,
  assignments: INITIAL_ASSIGNMENTS,
  gradebook: INITIAL_GRADEBOOK,
  attendance: INITIAL_ATTENDANCE,
  roster: INITIAL_ROSTER,
  announcements: INITIAL_ANNOUNCEMENTS,
  lessonPlans: INITIAL_LESSON_PLANS,
  timetable: INITIAL_TIMETABLE,
  syllabus: INITIAL_SYLLABUS,
  remedial: INITIAL_REMEDIAL,

  addMaterial: (m) => {
    set((s) => ({ materials: [{ ...m, id: nextId(), dateUploaded: todayISO() }, ...s.materials] }));
  },
  deleteMaterial: (id) => {
    set((s) => ({ materials: s.materials.filter((m) => m.id !== id) }));
  },

  addAV: (a) => {
    set((s) => ({ avRecordings: [{ ...a, id: nextId(), dateRecorded: todayISO() }, ...s.avRecordings] }));
  },
  deleteAV: (id) => {
    set((s) => ({ avRecordings: s.avRecordings.filter((a) => a.id !== id) }));
  },

  startLiveSession: (id, startedBy) => {
    set((s) => ({ liveSessions: s.liveSessions.map((l) => l.id === id ? { ...l, status: 'Live', startedBy } : l) }));
  },
  endLiveSession: (id) => {
    set((s) => ({ liveSessions: s.liveSessions.map((l) => l.id === id ? { ...l, status: 'Ended' } : l) }));
  },
  scheduleLiveSession: (sess) => {
    set((s) => ({ liveSessions: [...s.liveSessions, { ...sess, id: nextId(), status: 'Scheduled', startedBy: '', participants: 0 }] }));
  },
  cancelLiveSession: (id) => {
    set((s) => ({ liveSessions: s.liveSessions.map((l) => l.id === id ? { ...l, status: 'Cancelled' } : l) }));
  },

  addAssignment: (a) => {
    set((s) => ({ assignments: [{ ...a, id: nextId(), dateCreated: todayISO(), status: 'Draft', submissions: [], createdBy: 'Teacher' }, ...s.assignments] }));
  },
  publishAssignment: (id) => {
    set((s) => ({ assignments: s.assignments.map((a) => a.id === id ? { ...a, status: 'Published' } : a) }));
  },
  closeAssignment: (id) => {
    set((s) => ({ assignments: s.assignments.map((a) => a.id === id ? { ...a, status: 'Closed' } : a) }));
  },
  deleteAssignment: (id) => {
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
    set((s) => ({
      assignments: s.assignments.map((a) => ({
        ...a,
        submissions: a.submissions.map((sub) => sub.id === submissionId ? { ...sub, score, feedback, status: 'Graded' } : sub),
      })),
    }));
  },

  addGradeEntry: (g) => {
    const total = g.classwork + g.homework + g.test + g.exam;
    const totalMax = g.classworkMax + g.homeworkMax + g.testMax + g.examMax;
    const grade = calcGrade(total, totalMax);
    set((s) => ({ gradebook: [...s.gradebook, { ...g, id: nextId(), total, totalMax, grade }] }));
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
    set((s) => ({ gradebook: s.gradebook.filter((g) => g.id !== id) }));
  },
  getGradebookForClass: (classForm, subject) => {
    return get().gradebook.filter((g) => g.classForm === classForm && g.subject === subject);
  },

  markAttendance: (records) => {
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

  addAnnouncement: (a) => {
    set((s) => ({ announcements: [{ ...a, id: nextId(), date: todayISO() }, ...s.announcements] }));
  },
  deleteAnnouncement: (id) => {
    set((s) => ({ announcements: s.announcements.filter((a) => a.id !== id) }));
  },

  addLessonPlan: (lp) => {
    set((s) => ({ lessonPlans: [{ ...lp, id: nextId(), status: 'Planned' }, ...s.lessonPlans] }));
  },
  updateLessonPlan: (id, updates) => {
    set((s) => ({ lessonPlans: s.lessonPlans.map((lp) => lp.id === id ? { ...lp, ...updates } : lp) }));
  },
  deleteLessonPlan: (id) => {
    set((s) => ({ lessonPlans: s.lessonPlans.filter((lp) => lp.id !== id) }));
  },
  markLessonTaught: (id, reflection) => {
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

  addSyllabusTopic: (topic) => {
    set((s) => ({ syllabus: [...s.syllabus, { ...topic, id: nextId(), status: 'Not Started' }] }));
  },
  updateSyllabusTopic: (id, updates) => {
    set((s) => ({ syllabus: s.syllabus.map((t) => t.id === id ? { ...t, ...updates } : t) }));
  },
  deleteSyllabusTopic: (id) => {
    set((s) => ({ syllabus: s.syllabus.filter((t) => t.id !== id) }));
  },
  getSyllabusProgress: (subject, classForm) => {
    const topics = get().syllabus.filter((t) => t.subject === subject && t.classForm === classForm);
    const completed = topics.filter((t) => t.status === 'Completed').length;
    return { completed, total: topics.length, pct: topics.length > 0 ? Math.round((completed / topics.length) * 100) : 0 };
  },

  addRemedialStudent: (r) => {
    set((s) => ({ remedial: [{ ...r, id: nextId() }, ...s.remedial] }));
  },
  updateRemedialProgress: (id, progress, notes) => {
    set((s) => ({ remedial: s.remedial.map((r) => r.id === id ? { ...r, progress, notes } : r) }));
  },
  deleteRemedialStudent: (id) => {
    set((s) => ({ remedial: s.remedial.filter((r) => r.id !== id) }));
  },
}));
