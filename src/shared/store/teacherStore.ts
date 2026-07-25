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

const INITIAL_QUESTION_BANK: QuestionBankItem[] = [
  { id: 'tch-130', subject: 'Elective Mathematics', topic: 'Differentiation', type: 'MCQ', question: 'What is the derivative of f(x) = 3x² + 2x - 5?', options: ['6x + 2', '3x + 2', '6x² + 2', '6x - 5'], correctAnswer: '6x + 2', marks: 2, difficulty: 'Easy', tags: ['power rule', 'polynomial'] },
  { id: 'tch-131', subject: 'Elective Mathematics', topic: 'Integration', type: 'Short Answer', question: 'Find the indefinite integral of ∫(4x³ + 2x) dx', correctAnswer: 'x⁴ + x² + C', marks: 3, difficulty: 'Medium', tags: ['indefinite integral', 'power rule'] },
  { id: 'tch-132', subject: 'Core Mathematics', topic: 'Indices & Logarithms', type: 'True/False', question: 'log₂(8) = 3', correctAnswer: 'True', marks: 1, difficulty: 'Easy', tags: ['logarithms'] },
  { id: 'tch-133', subject: 'Core Mathematics', topic: 'Surds', type: 'Fill in the Blank', question: 'Rationalize: 1/√2 = ___/2', correctAnswer: '√2', marks: 2, difficulty: 'Medium', tags: ['surds', 'rationalization'] },
  { id: 'tch-134', subject: 'Elective Mathematics', topic: 'Limits', type: 'Essay', question: 'Explain the concept of a limit and give an example of a function that has a removable discontinuity.', correctAnswer: 'A limit describes the value a function approaches as the input approaches a specified value. Example: f(x) = (x²-1)/(x-1) has a removable discontinuity at x=1, limit is 2.', marks: 5, difficulty: 'Hard', tags: ['limits', 'continuity'] },
];

const INITIAL_QUIZZES: Quiz[] = [
  { id: 'tch-140', title: 'Differentiation Quick Quiz', subject: 'Elective Mathematics', classForm: 'SHS2 Sci A', questionIds: ['tch-130'], totalMarks: 2, duration: 15, dueDate: '2026-07-15', expiryDate: '2026-07-17', status: 'Published', createdAt: '2026-07-08' },
];

const INITIAL_PARENT_COMMS: ParentCommunication[] = [
  { id: 'tch-150', studentName: 'Daniel Osei', admNo: '2026/004', classForm: 'SHS2 Sci A', guardianName: 'Mrs. Adwoa Osei', guardianPhone: '055-555-1004', channel: 'Phone Call', direction: 'Outgoing', subject: 'Poor performance in class test', notes: 'Called to discuss Daniel\'s recent test score of 45%. Mother agreed to ensure he does homework regularly. Will follow up in 2 weeks.', date: '2026-07-05', followUpNeeded: true, followUpDate: '2026-07-19' },
  { id: 'tch-151', studentName: 'Kwame Asante', admNo: '2026/001', classForm: 'SHS2 Sci A', guardianName: 'Mr. Kofi Asante', guardianPhone: '024-555-1001', channel: 'In-Person', direction: 'Incoming', subject: 'Praise for excellent work', notes: 'Father came to PTM to express gratitude for Kwame\'s improvement. Very supportive.', date: '2026-07-03', followUpNeeded: false },
];

const INITIAL_BEHAVIOR: BehaviorNote[] = [
  { id: 'tch-160', studentName: 'Samuel Aidoo', admNo: '2026/003', classForm: 'SHS2 Sci A', date: '2026-07-06', type: 'Positive', severity: 'Low', category: 'Class Participation', description: 'Consistently helps classmates during group work. Excellent leadership during pair activities.', actionTaken: 'Praised in class, noted for commendation.', reportedBy: 'Teacher' },
  { id: 'tch-161', studentName: 'Daniel Osei', admNo: '2026/004', classForm: 'SHS2 Sci A', date: '2026-07-04', type: 'Negative', severity: 'Medium', category: 'Disruption', description: 'Repeatedly distracted classmates during lesson on integration. Did not complete classwork.', actionTaken: 'Spoke privately after class. Parent contacted.', reportedBy: 'Teacher' },
];

const INITIAL_CALENDAR: CalendarEvent[] = [
  { id: 'tch-170', title: 'Elective Math — SHS2 Sci A', date: '2026-07-08', time: '08:00', type: 'Lesson', subject: 'Elective Mathematics', classForm: 'SHS2 Sci A' },
  { id: 'tch-171', title: 'Quadratic Eq. Exercise 3 Due', date: '2026-07-10', type: 'Assignment Due', subject: 'Elective Mathematics', classForm: 'SHS2 Sci A' },
  { id: 'tch-172', title: 'PLC Meeting', date: '2026-07-12', time: '15:00', type: 'Meeting' },
  { id: 'tch-173', title: 'Mid-Sem Quiz — SHS2 Sci B', date: '2026-07-12', type: 'Exam', subject: 'Elective Mathematics', classForm: 'SHS2 Sci B' },
  { id: 'tch-174', title: 'Syllabus submission deadline', date: '2026-07-20', type: 'Deadline' },
];

const INITIAL_NOTIFICATIONS: TeacherNotification[] = [
  { id: 'tch-180', title: 'New Submission', message: 'Daniel Osei submitted Mid-Sem Quiz', type: 'Submission', date: '2026-07-06', read: false },
  { id: 'tch-181', title: 'HOD Feedback', message: 'Mr. Mensah reviewed your lesson plan on Integration', type: 'HOD Feedback', date: '2026-07-05', read: false },
  { id: 'tch-182', title: 'Assignment Due Soon', message: 'Quadratic Eq. Exercise 3 due in 2 days', type: 'Deadline', date: '2026-07-08', read: true },
];

const INITIAL_SHARED_RESOURCES: SharedResource[] = [
  { id: 'tch-190', title: 'Calculus Differentiation Notes', subject: 'Elective Mathematics', type: 'Notes', sharedBy: 'Mr. Adjei', sharedDate: '2026-07-02', description: 'Comprehensive notes on differentiation rules with worked examples', classForm: 'SHS2 Sci A' },
  { id: 'tch-191', title: 'WASSCE Past Questions — Algebra', subject: 'Core Mathematics', type: 'Past Questions', sharedBy: 'Mrs. Boateng', sharedDate: '2026-06-28', description: '10 years of WASSCE algebra questions with solutions', classForm: 'SHS1 Sci A' },
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
  loadLessonPlans: () => Promise<void>;
  loadAssignments: () => Promise<void>;
  loadGradebook: () => Promise<void>;
  loadAttendance: () => Promise<void>;
  loadSyllabus: () => Promise<void>;
  loadMaterials: () => Promise<void>;
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
  questionBank: INITIAL_QUESTION_BANK,
  quizzes: INITIAL_QUIZZES,
  parentComms: INITIAL_PARENT_COMMS,
  behaviorNotes: INITIAL_BEHAVIOR,
  calendarEvents: INITIAL_CALENDAR,
  teacherNotifications: INITIAL_NOTIFICATIONS,
  sharedResources: INITIAL_SHARED_RESOURCES,
  virtualClassroom: null,

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
  duplicateAssignment: (id, newClassForm) => {
    const orig = get().assignments.find((a) => a.id === id);
    if (!orig) return;
    set((s) => ({ assignments: [{ ...orig, id: nextId(), classForm: newClassForm, dateCreated: todayISO(), status: 'Draft', submissions: [] }, ...s.assignments] }));
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

  addQuestion: (q) => { set((s) => ({ questionBank: [{ ...q, id: nextId() }, ...s.questionBank] })); },
  updateQuestion: (id, updates) => { set((s) => ({ questionBank: s.questionBank.map((q) => q.id === id ? { ...q, ...updates } : q) })); },
  deleteQuestion: (id) => { set((s) => ({ questionBank: s.questionBank.filter((q) => q.id !== id) })); },

  addQuiz: (q) => {
    const questions = get().questionBank.filter((qn) => q.questionIds.includes(qn.id));
    const totalMarks = questions.reduce((sum, qn) => sum + qn.marks, 0);
    set((s) => ({ quizzes: [{ ...q, id: nextId(), totalMarks, createdAt: todayISO(), status: 'Draft' }, ...s.quizzes] }));
  },
  publishQuiz: (id) => { set((s) => ({ quizzes: s.quizzes.map((q) => q.id === id ? { ...q, status: 'Published' } : q) })); },
  closeQuiz: (id) => { set((s) => ({ quizzes: s.quizzes.map((q) => q.id === id ? { ...q, status: 'Closed' } : q) })); },
  deleteQuiz: (id) => { set((s) => ({ quizzes: s.quizzes.filter((q) => q.id !== id) })); },

  addParentComm: (c) => { set((s) => ({ parentComms: [{ ...c, id: nextId() }, ...s.parentComms] })); },
  deleteParentComm: (id) => { set((s) => ({ parentComms: s.parentComms.filter((c) => c.id !== id) })); },
  getFollowUps: () => get().parentComms.filter((c) => c.followUpNeeded),

  addBehaviorNote: (b) => { set((s) => ({ behaviorNotes: [{ ...b, id: nextId() }, ...s.behaviorNotes] })); },
  deleteBehaviorNote: (id) => { set((s) => ({ behaviorNotes: s.behaviorNotes.filter((b) => b.id !== id) })); },

  addCalendarEvent: (e) => { set((s) => ({ calendarEvents: [...s.calendarEvents, { ...e, id: nextId() }] })); },
  deleteCalendarEvent: (id) => { set((s) => ({ calendarEvents: s.calendarEvents.filter((e) => e.id !== id) })); },
  getCalendarForDate: (date) => get().calendarEvents.filter((e) => e.date === date).sort((a, b) => (a.time || '').localeCompare(b.time || '')),
  getCalendarForMonth: (year, month) => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return get().calendarEvents.filter((e) => e.date.startsWith(prefix)).sort((a, b) => a.date.localeCompare(b.date));
  },

  markNotificationRead: (id) => { set((s) => ({ teacherNotifications: s.teacherNotifications.map((n) => n.id === id ? { ...n, read: true } : n) })); },
  markAllNotificationsRead: () => { set((s) => ({ teacherNotifications: s.teacherNotifications.map((n) => ({ ...n, read: true })) })); },
  getUnreadNotificationCount: () => get().teacherNotifications.filter((n) => !n.read).length,

  addSharedResource: (r) => { set((s) => ({ sharedResources: [{ ...r, id: nextId(), sharedDate: todayISO() }, ...s.sharedResources] })); },
  deleteSharedResource: (id) => { set((s) => ({ sharedResources: s.sharedResources.filter((r) => r.id !== id) })); },

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
}));
