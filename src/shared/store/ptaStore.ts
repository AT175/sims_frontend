import { create } from 'zustand';

// ── Types ──

export interface Ward {
  id: string;
  name: string;
  className: string;
  house: string;
  attendance: string;
  avgScore: string;
  feesStatus: 'Cleared' | 'Owing' | 'Partial';
  reportCard?: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  date: string;
  author: string;
}

export interface FundraisingProject {
  id: string;
  project: string;
  targetAmount: number;
  raisedAmount: number;
  description?: string;
  contributions: Contribution[];
}

export interface Contribution {
  id: string;
  contributorName: string;
  amount: number;
  date: string;
}

export type RSVPStatus = 'Not Responded' | 'Will Attend' | 'Cannot Attend';

export interface PTAMeeting {
  id: string;
  date: string;
  time: string;
  topic: string;
  location: string;
  rsvp: RSVPStatus;
}

export interface ParentDirectoryEntry {
  id: string;
  name: string;
  phone: string;
  ptaRole: string;
  wardNames: string;
}

export type FeedbackStatus = 'Received' | 'Acknowledged' | 'Actioned' | 'Closed';

export interface FeedbackEntry {
  id: string;
  date: string;
  subject: string;
  body: string;
  status: FeedbackStatus;
  response?: string;
}

export type DueStatus = 'Paid' | 'Owing' | 'Partial';

export interface DueRecord {
  id: string;
  term: string;
  amount: number;
  amountPaid: number;
  status: DueStatus;
  dueDate: string;
  paidDate?: string;
  method?: string;
}

export type PaymentCategory = 'School Fees' | 'PTA Dues' | 'Special Levies';

export const PAYMENT_CATEGORIES: PaymentCategory[] = ['School Fees', 'PTA Dues', 'Special Levies'];

export type PaymentRecipient = 'School Accountant' | 'PTA';

export const PAYMENT_RECIPIENTS: PaymentRecipient[] = ['School Accountant', 'PTA'];

export interface PaymentItem {
  id: string;
  category: PaymentCategory;
  description: string;
  term: string;
  wardName: string;
  amount: number;
  amountPaid: number;
  status: DueStatus;
  dueDate: string;
  paidDate?: string;
  method?: string;
  recipient?: PaymentRecipient;
}

export type TransactionType = 'Income' | 'Expense';

export type IncomeCategory = 'PTA Dues' | 'Fundraising' | 'Donation' | 'Event Proceeds' | 'Other Income';

export type ExpenseCategory = 'Events' | 'Logistics' | 'Refreshments' | 'Venue Hire' | 'Stationery' | 'Transport' | 'Miscellaneous';

export interface FinanceTransaction {
  id: string;
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  date: string;
  method: string;
  recordedBy: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  term: string;
}

export type AccessRole = 'PTA Executive' | 'Class Rep' | 'Member' | 'Parent' | 'Staff Liaison';

export interface SubjectGrade {
  subject: string;
  caScore: number;
  examScore: number;
  total: number;
  grade: string;
  position?: string;
  remark?: string;
}

export interface ReportCard {
  id: string;
  wardName: string;
  term: string;
  academicYear: string;
  classTeacher: string;
  attendancePct: string;
  overallPosition?: string;
  overallGrade?: string;
  teacherRemark?: string;
  headmasterRemark?: string;
  subjects: SubjectGrade[];
  publishedDate: string;
}

export interface HealthVisit {
  id: string;
  wardName: string;
  date: string;
  complaint: string;
  diagnosis: string;
  treatment: string;
  medication?: string;
  temperature?: string;
  bloodPressure?: string;
  attendant: string;
  followUpRequired: boolean;
  followUpDate?: string;
  referredToHospital: boolean;
  resolved: boolean;
}

export interface AccessRecord {
  id: string;
  personName: string;
  role: AccessRole;
  resource: string;
  accessLevel: 'Full' | 'Read Only' | 'Restricted' | 'No Access';
  grantedDate: string;
  grantedBy: string;
  notes?: string;
}

// ── Constants ──

export const PTA_ROLES = ['Chairman', 'Vice Chairman', 'Secretary', 'Treasurer', 'Class Rep', 'Member'];

export const FEEDBACK_STATUSES: FeedbackStatus[] = ['Received', 'Acknowledged', 'Actioned', 'Closed'];

export const RSVP_STATUSES: RSVPStatus[] = ['Not Responded', 'Will Attend', 'Cannot Attend'];

export const DUE_STATUSES: DueStatus[] = ['Paid', 'Owing', 'Partial'];

export const ACCESS_ROLES: AccessRole[] = ['PTA Executive', 'Class Rep', 'Member', 'Parent', 'Staff Liaison'];

export const ACCESS_LEVELS = ['Full', 'Read Only', 'Restricted', 'No Access'] as const;

export const PAYMENT_METHODS = ['Cash', 'Mobile Money', 'Bank Transfer', 'Cheque'];

export const INCOME_CATEGORIES: IncomeCategory[] = ['PTA Dues', 'Fundraising', 'Donation', 'Event Proceeds', 'Other Income'];

export const EXPENSE_CATEGORIES: ExpenseCategory[] = ['Events', 'Logistics', 'Refreshments', 'Venue Hire', 'Stationery', 'Transport', 'Miscellaneous'];

export const TRANSACTION_TYPES: TransactionType[] = ['Income', 'Expense'];

export const GRADE_LETTERS = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'E', 'F'];

let idCounter = 400;
const nextId = () => String(++idCounter);
const todayISO = () => new Date().toISOString().slice(0, 10);

// ── Initial Data ──

const INITIAL_WARDS: Ward[] = [
  { id: '1', name: 'Kwame Asante', className: 'SHS2 Sci A', house: 'Aggrey', attendance: '92.5%', avgScore: '75.7%', feesStatus: 'Cleared' },
  { id: '2', name: 'Adwoa Asante', className: 'SHS1 Arts B', house: 'Mensah', attendance: '96%', avgScore: '81.2%', feesStatus: 'Cleared' },
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  { id: '1', title: 'Term 3 Mid-Semester Exam Schedule', body: 'Exams begin July 15. Please ensure your ward is prepared.', date: '2026-07-05', author: 'Headmaster' },
  { id: '2', title: 'PTA General Meeting - July 20', body: 'All parents are invited to the general meeting at 10am in the assembly hall.', date: '2026-07-03', author: 'PTA Chairman' },
  { id: '3', title: 'Visiting day rescheduled', body: 'Visiting day moved from July 7 to July 14.', date: '2026-06-28', author: 'Headmaster' },
];

const INITIAL_FUNDRAISING: FundraisingProject[] = [
  {
    id: '1', project: 'New Library Books', targetAmount: 15000, raisedAmount: 9200,
    contributions: [
      { id: '1', contributorName: 'Mr. Asante', amount: 500, date: '2026-05-10' },
      { id: '2', contributorName: 'Mrs. Owusu', amount: 300, date: '2026-05-15' },
    ],
  },
  {
    id: '2', project: 'School Bus Fund', targetAmount: 80000, raisedAmount: 45000,
    contributions: [
      { id: '3', contributorName: 'Mr. Mensah', amount: 1000, date: '2026-04-01' },
    ],
  },
  {
    id: '3', project: 'ICT Lab Upgrade', targetAmount: 30000, raisedAmount: 12500,
    contributions: [],
  },
];

const INITIAL_MEETINGS: PTAMeeting[] = [
  { id: '1', date: '2026-07-20', time: '10:00 AM', topic: 'General Meeting - Term 3 Review', location: 'Assembly Hall', rsvp: 'Not Responded' },
  { id: '2', date: '2026-08-15', time: '2:00 PM', topic: 'Executive Committee Meeting', location: 'Staff Common Room', rsvp: 'Not Responded' },
  { id: '3', date: '2026-09-05', time: '10:00 AM', topic: 'New Academic Year Planning', location: 'Assembly Hall', rsvp: 'Not Responded' },
];

const INITIAL_DIRECTORY: ParentDirectoryEntry[] = [
  { id: '1', name: 'Mr. Asante', phone: '024-XXX-XXXX', ptaRole: 'Member', wardNames: 'Kwame, Adwoa' },
  { id: '2', name: 'Mrs. Owusu', phone: '027-XXX-XXXX', ptaRole: 'Class Rep (SHS1)', wardNames: 'Kofi' },
  { id: '3', name: 'Mr. Mensah', phone: '020-XXX-XXXX', ptaRole: 'Treasurer', wardNames: 'Ama' },
];

const INITIAL_FEEDBACK: FeedbackEntry[] = [
  { id: '1', date: '2026-07-02', subject: 'Suggestion: more library hours', body: 'The library closes too early. Could it stay open until 6pm?', status: 'Received' },
  { id: '2', date: '2026-06-15', subject: 'Compliment: good exam organization', body: 'The mid-term exams were very well organized.', status: 'Acknowledged', response: 'Thank you for your kind words.' },
];

const INITIAL_DUES: DueRecord[] = [
  { id: '1', term: 'Term 3 2025/2026', amount: 200, amountPaid: 200, status: 'Paid', dueDate: '2026-01-15', paidDate: '2026-01-10', method: 'Mobile Money' },
  { id: '2', term: 'Term 1 2026/2027', amount: 200, amountPaid: 0, status: 'Owing', dueDate: '2026-09-15' },
];

const INITIAL_TRANSACTIONS: FinanceTransaction[] = [
  { id: '1', type: 'Income', category: 'PTA Dues', description: 'Term 3 dues collection', amount: 400, date: '2026-01-10', method: 'Mobile Money', recordedBy: 'PTA Treasurer' },
  { id: '2', type: 'Income', category: 'Fundraising', description: 'Library Books fund contribution', amount: 800, date: '2026-05-10', method: 'Cash', recordedBy: 'PTA Treasurer' },
  { id: '3', type: 'Income', category: 'Donation', description: 'Anonymous donor - Bus Fund', amount: 5000, date: '2026-04-15', method: 'Bank Transfer', recordedBy: 'PTA Chairman' },
  { id: '4', type: 'Expense', category: 'Events', description: 'General Meeting refreshments', amount: 350, date: '2026-03-20', method: 'Cash', recordedBy: 'PTA Treasurer' },
  { id: '5', type: 'Expense', category: 'Logistics', description: 'Printing and stationery for PTA', amount: 120, date: '2026-02-05', method: 'Cash', recordedBy: 'PTA Secretary' },
  { id: '6', type: 'Expense', category: 'Venue Hire', description: 'Hall rental for AGM', amount: 200, date: '2026-03-18', method: 'Bank Transfer', recordedBy: 'PTA Treasurer' },
];

const INITIAL_BUDGETS: BudgetCategory[] = [
  { id: '1', name: 'Events & Meetings', allocated: 2000, spent: 550, term: '2025/2026' },
  { id: '2', name: 'Logistics & Stationery', allocated: 800, spent: 120, term: '2025/2026' },
  { id: '3', name: 'Welfare Support', allocated: 1500, spent: 0, term: '2025/2026' },
  { id: '4', name: 'Project Fund', allocated: 5000, spent: 0, term: '2025/2026' },
];

const INITIAL_REPORT_CARDS: ReportCard[] = [
  {
    id: 'rc1', wardName: 'Kwame Asante', term: 'Term 2', academicYear: '2025/2026',
    classTeacher: 'Mr. J. Adjei', attendancePct: '94%', overallPosition: '12th of 45', overallGrade: 'B+',
    teacherRemark: 'Kwame has shown improvement in Science. Needs to work on Mathematics.',
    headmasterRemark: 'A satisfactory term. Keep pushing.',
    subjects: [
      { subject: 'English Language', caScore: 28, examScore: 45, total: 73, grade: 'B', position: '15th', remark: 'Good' },
      { subject: 'Core Mathematics', caScore: 22, examScore: 38, total: 60, grade: 'C+', position: '22nd', remark: 'Average' },
      { subject: 'Integrated Science', caScore: 30, examScore: 48, total: 78, grade: 'B+', position: '8th', remark: 'Very Good' },
      { subject: 'Social Studies', caScore: 26, examScore: 42, total: 68, grade: 'B', position: '14th', remark: 'Good' },
      { subject: 'Physics', caScore: 29, examScore: 46, total: 75, grade: 'B+', position: '7th', remark: 'Very Good' },
      { subject: 'Chemistry', caScore: 27, examScore: 44, total: 71, grade: 'B', position: '10th', remark: 'Good' },
    ],
    publishedDate: '2026-04-05',
  },
  {
    id: 'rc2', wardName: 'Adwoa Asante', term: 'Term 2', academicYear: '2025/2026',
    classTeacher: 'Mrs. F. Owusu', attendancePct: '97%', overallPosition: '3rd of 50', overallGrade: 'A',
    teacherRemark: 'Adwoa is an excellent student. Keep up the great work!',
    headmasterRemark: 'Outstanding performance. Highly commended.',
    subjects: [
      { subject: 'English Language', caScore: 32, examScore: 52, total: 84, grade: 'A', position: '2nd', remark: 'Excellent' },
      { subject: 'Core Mathematics', caScore: 30, examScore: 50, total: 80, grade: 'A', position: '5th', remark: 'Excellent' },
      { subject: 'Integrated Science', caScore: 31, examScore: 49, total: 80, grade: 'A', position: '4th', remark: 'Excellent' },
      { subject: 'Social Studies', caScore: 33, examScore: 51, total: 84, grade: 'A', position: '1st', remark: 'Excellent' },
      { subject: 'Government', caScore: 30, examScore: 48, total: 78, grade: 'B+', position: '3rd', remark: 'Very Good' },
      { subject: 'Economics', caScore: 29, examScore: 47, total: 76, grade: 'B+', position: '5th', remark: 'Very Good' },
    ],
    publishedDate: '2026-04-05',
  },
];

const INITIAL_HEALTH_VISITS: HealthVisit[] = [
  {
    id: 'hv1', wardName: 'Kwame Asante', date: '2026-06-15',
    complaint: 'Headache and fever', diagnosis: 'Malaria (mild)',
    treatment: 'Administered antimalarial (Coartem)', medication: 'Coartem — 3 days',
    temperature: '38.5°C', bloodPressure: '120/80',
    attendant: 'Nurse Adjei', followUpRequired: true, followUpDate: '2026-06-18',
    referredToHospital: false, resolved: true,
  },
  {
    id: 'hv2', wardName: 'Kwame Asante', date: '2026-07-01',
    complaint: 'Stomach pain after meals', diagnosis: 'Gastritis',
    treatment: 'Given antacid, advised on diet', medication: 'Omeprazole — 5 days',
    temperature: '36.8°C', bloodPressure: '118/76',
    attendant: 'Nurse Adjei', followUpRequired: false,
    referredToHospital: false, resolved: true,
  },
];

const INITIAL_PAYMENTS: PaymentItem[] = [
  { id: 'p1', category: 'School Fees', description: 'Tuition — Term 3', term: 'Term 3 2025/2026', wardName: 'Kwame Asante', amount: 1200, amountPaid: 1200, status: 'Paid', dueDate: '2026-01-15', paidDate: '2026-01-10', method: 'Bank Transfer', recipient: 'School Accountant' },
  { id: 'p2', category: 'School Fees', description: 'Boarding — Term 3', term: 'Term 3 2025/2026', wardName: 'Kwame Asante', amount: 800, amountPaid: 800, status: 'Paid', dueDate: '2026-01-15', paidDate: '2026-01-10', method: 'Bank Transfer', recipient: 'School Accountant' },
  { id: 'p3', category: 'School Fees', description: 'Tuition — Term 1', term: 'Term 1 2026/2027', wardName: 'Kwame Asante', amount: 1200, amountPaid: 600, status: 'Partial', dueDate: '2026-09-15', method: 'Mobile Money', recipient: 'School Accountant' },
  { id: 'p4', category: 'School Fees', description: 'Boarding — Term 1', term: 'Term 1 2026/2027', wardName: 'Kwame Asante', amount: 800, amountPaid: 0, status: 'Owing', dueDate: '2026-09-15', recipient: 'School Accountant' },
  { id: 'p5', category: 'School Fees', description: 'Tuition — Term 3', term: 'Term 3 2025/2026', wardName: 'Adwoa Asante', amount: 1200, amountPaid: 1200, status: 'Paid', dueDate: '2026-01-15', paidDate: '2026-01-12', method: 'Bank Transfer', recipient: 'School Accountant' },
  { id: 'p6', category: 'School Fees', description: 'Tuition — Term 1', term: 'Term 1 2026/2027', wardName: 'Adwoa Asante', amount: 1200, amountPaid: 0, status: 'Owing', dueDate: '2026-09-15', recipient: 'School Accountant' },
  { id: 'p7', category: 'PTA Dues', description: 'PTA Dues — Term 3', term: 'Term 3 2025/2026', wardName: 'Kwame Asante', amount: 200, amountPaid: 200, status: 'Paid', dueDate: '2026-01-15', paidDate: '2026-01-10', method: 'Mobile Money', recipient: 'PTA' },
  { id: 'p8', category: 'PTA Dues', description: 'PTA Dues — Term 1', term: 'Term 1 2026/2027', wardName: 'Kwame Asante', amount: 200, amountPaid: 0, status: 'Owing', dueDate: '2026-09-15', recipient: 'PTA' },
  { id: 'p9', category: 'PTA Dues', description: 'PTA Dues — Term 1', term: 'Term 1 2026/2027', wardName: 'Adwoa Asante', amount: 200, amountPaid: 0, status: 'Owing', dueDate: '2026-09-15', recipient: 'PTA' },
  { id: 'p10', category: 'Special Levies', description: 'ICT Lab Development Levy', term: '2025/2026', wardName: 'Kwame Asante', amount: 150, amountPaid: 150, status: 'Paid', dueDate: '2026-03-31', paidDate: '2026-03-20', method: 'Cash', recipient: 'School Accountant' },
  { id: 'p11', category: 'Special Levies', description: 'Sports & Culture Levy', term: '2025/2026', wardName: 'Kwame Asante', amount: 100, amountPaid: 0, status: 'Owing', dueDate: '2026-10-15', recipient: 'School Accountant' },
  { id: 'p12', category: 'Special Levies', description: 'ICT Lab Development Levy', term: '2025/2026', wardName: 'Adwoa Asante', amount: 150, amountPaid: 150, status: 'Paid', dueDate: '2026-03-31', paidDate: '2026-03-25', method: 'Mobile Money', recipient: 'School Accountant' },
  { id: 'p13', category: 'Special Levies', description: 'Sports & Culture Levy', term: '2025/2026', wardName: 'Adwoa Asante', amount: 100, amountPaid: 0, status: 'Owing', dueDate: '2026-10-15', recipient: 'School Accountant' },
];

const INITIAL_ACCESS: AccessRecord[] = [
  { id: '1', personName: 'PTA Chairman', role: 'PTA Executive', resource: 'Announcements', accessLevel: 'Full', grantedDate: '2026-01-05', grantedBy: 'Headmaster' },
  { id: '2', personName: 'PTA Treasurer', role: 'PTA Executive', resource: 'Fundraising Projects', accessLevel: 'Full', grantedDate: '2026-01-05', grantedBy: 'Headmaster' },
  { id: '3', personName: 'All Parents', role: 'Parent', resource: 'Meeting Schedule', accessLevel: 'Read Only', grantedDate: '2026-01-10', grantedBy: 'PTA Chairman' },
  { id: '4', personName: 'All Parents', role: 'Parent', resource: 'Parent Directory', accessLevel: 'Read Only', grantedDate: '2026-01-10', grantedBy: 'PTA Chairman' },
];

// ── Store ──

interface PTAState {
  wards: Ward[];
  announcements: Announcement[];
  fundraising: FundraisingProject[];
  meetings: PTAMeeting[];
  directory: ParentDirectoryEntry[];
  feedback: FeedbackEntry[];
  dues: DueRecord[];
  payments: PaymentItem[];
  transactions: FinanceTransaction[];
  budgets: BudgetCategory[];
  reportCards: ReportCard[];
  healthVisits: HealthVisit[];
  accessRecords: AccessRecord[];

  addAnnouncement: (a: Omit<Announcement, 'id'>) => void;
  deleteAnnouncement: (id: string) => void;

  addFundraisingProject: (p: Omit<FundraisingProject, 'id' | 'raisedAmount' | 'contributions'>) => void;
  contribute: (projectId: string, contributorName: string, amount: number) => void;
  deleteFundraisingProject: (id: string) => void;

  setRSVP: (meetingId: string, status: RSVPStatus) => void;

  addDirectoryEntry: (e: Omit<ParentDirectoryEntry, 'id'>) => void;
  deleteDirectoryEntry: (id: string) => void;

  submitFeedback: (subject: string, body: string) => void;
  respondToFeedback: (id: string, response: string) => void;
  updateFeedbackStatus: (id: string, status: FeedbackStatus) => void;

  payDues: (id: string, amount: number, method: string) => void;

  payPayment: (id: string, amount: number, method: string, recipient: PaymentRecipient) => void;

  addReportCard: (rc: Omit<ReportCard, 'id'>) => void;
  deleteReportCard: (id: string) => void;

  addHealthVisit: (hv: Omit<HealthVisit, 'id'>) => void;
  deleteHealthVisit: (id: string) => void;

  addTransaction: (t: Omit<FinanceTransaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;

  addBudgetCategory: (b: Omit<BudgetCategory, 'id' | 'spent'>) => void;
  updateBudgetCategory: (id: string, updates: Partial<BudgetCategory>) => void;
  deleteBudgetCategory: (id: string) => void;

  grantAccess: (record: Omit<AccessRecord, 'id' | 'grantedDate'>) => void;
  revokeAccess: (id: string) => void;
}

export const usePTAStore = create<PTAState>((set) => ({
  wards: INITIAL_WARDS,
  announcements: INITIAL_ANNOUNCEMENTS,
  fundraising: INITIAL_FUNDRAISING,
  meetings: INITIAL_MEETINGS,
  directory: INITIAL_DIRECTORY,
  feedback: INITIAL_FEEDBACK,
  dues: INITIAL_DUES,
  payments: INITIAL_PAYMENTS,
  transactions: INITIAL_TRANSACTIONS,
  budgets: INITIAL_BUDGETS,
  reportCards: INITIAL_REPORT_CARDS,
  healthVisits: INITIAL_HEALTH_VISITS,
  accessRecords: INITIAL_ACCESS,

  addAnnouncement: (a) => {
    const newAnn: Announcement = { ...a, id: nextId() };
    set((s) => ({ announcements: [newAnn, ...s.announcements] }));
  },

  deleteAnnouncement: (id) => {
    set((s) => ({ announcements: s.announcements.filter((a) => a.id !== id) }));
  },

  addFundraisingProject: (p) => {
    const newProj: FundraisingProject = { ...p, id: nextId(), raisedAmount: 0, contributions: [] };
    set((s) => ({ fundraising: [newProj, ...s.fundraising] }));
  },

  contribute: (projectId, contributorName, amount) => {
    set((s) => ({
      fundraising: s.fundraising.map((p) =>
        p.id === projectId
          ? {
              ...p,
              raisedAmount: p.raisedAmount + amount,
              contributions: [
                { id: nextId(), contributorName, amount, date: todayISO() },
                ...p.contributions,
              ],
            }
          : p
      ),
    }));
  },

  deleteFundraisingProject: (id) => {
    set((s) => ({ fundraising: s.fundraising.filter((p) => p.id !== id) }));
  },

  setRSVP: (meetingId, status) => {
    set((s) => ({
      meetings: s.meetings.map((m) => (m.id === meetingId ? { ...m, rsvp: status } : m)),
    }));
  },

  addDirectoryEntry: (e) => {
    const newEntry: ParentDirectoryEntry = { ...e, id: nextId() };
    set((s) => ({ directory: [newEntry, ...s.directory] }));
  },

  deleteDirectoryEntry: (id) => {
    set((s) => ({ directory: s.directory.filter((e) => e.id !== id) }));
  },

  submitFeedback: (subject, body) => {
    const newFeedback: FeedbackEntry = {
      id: nextId(),
      date: todayISO(),
      subject,
      body,
      status: 'Received',
    };
    set((s) => ({ feedback: [newFeedback, ...s.feedback] }));
  },

  respondToFeedback: (id, response) => {
    set((s) => ({
      feedback: s.feedback.map((f) =>
        f.id === id ? { ...f, response, status: 'Acknowledged' as FeedbackStatus } : f
      ),
    }));
  },

  updateFeedbackStatus: (id, status) => {
    set((s) => ({
      feedback: s.feedback.map((f) => (f.id === id ? { ...f, status } : f)),
    }));
  },

  payDues: (id, amount, method) => {
    set((s) => ({
      dues: s.dues.map((d) => {
        if (d.id !== id) return d;
        const newPaid = d.amountPaid + amount;
        const status: DueStatus = newPaid >= d.amount ? 'Paid' : newPaid > 0 ? 'Partial' : 'Owing';
        return {
          ...d,
          amountPaid: newPaid,
          status,
          paidDate: status === 'Paid' ? todayISO() : d.paidDate,
          method,
        };
      }),
    }));
  },

  payPayment: (id, amount, method, recipient) => {
    set((s) => ({
      payments: s.payments.map((p) => {
        if (p.id !== id) return p;
        const newPaid = p.amountPaid + amount;
        const status: DueStatus = newPaid >= p.amount ? 'Paid' : newPaid > 0 ? 'Partial' : 'Owing';
        return {
          ...p,
          amountPaid: newPaid,
          status,
          paidDate: status === 'Paid' ? todayISO() : p.paidDate,
          method,
          recipient,
        };
      }),
    }));
  },

  addReportCard: (rc) => {
    const newRC: ReportCard = { ...rc, id: nextId() };
    set((s) => ({ reportCards: [newRC, ...s.reportCards] }));
  },

  deleteReportCard: (id) => {
    set((s) => ({ reportCards: s.reportCards.filter((r) => r.id !== id) }));
  },

  addHealthVisit: (hv) => {
    const newHV: HealthVisit = { ...hv, id: nextId() };
    set((s) => ({ healthVisits: [newHV, ...s.healthVisits] }));
  },

  deleteHealthVisit: (id) => {
    set((s) => ({ healthVisits: s.healthVisits.filter((h) => h.id !== id) }));
  },

  addTransaction: (t) => {
    const newTxn: FinanceTransaction = { ...t, id: nextId() };
    set((s) => {
      let budgets = s.budgets;
      if (t.type === 'Expense') {
        budgets = s.budgets.map((b) =>
          b.name === t.category ? { ...b, spent: b.spent + t.amount } : b
        );
      }
      return { transactions: [newTxn, ...s.transactions], budgets };
    });
  },

  deleteTransaction: (id) => {
    set((s) => {
      const txn = s.transactions.find((t) => t.id === id);
      let budgets = s.budgets;
      if (txn && txn.type === 'Expense') {
        budgets = s.budgets.map((b) =>
          b.name === txn.category ? { ...b, spent: Math.max(0, b.spent - txn.amount) } : b
        );
      }
      return { transactions: s.transactions.filter((t) => t.id !== id), budgets };
    });
  },

  addBudgetCategory: (b) => {
    const newBudget: BudgetCategory = { ...b, id: nextId(), spent: 0 };
    set((s) => ({ budgets: [...s.budgets, newBudget] }));
  },

  updateBudgetCategory: (id, updates) => {
    set((s) => ({ budgets: s.budgets.map((b) => (b.id === id ? { ...b, ...updates } : b)) }));
  },

  deleteBudgetCategory: (id) => {
    set((s) => ({ budgets: s.budgets.filter((b) => b.id !== id) }));
  },

  grantAccess: (record) => {
    const newRecord: AccessRecord = { ...record, id: nextId(), grantedDate: todayISO() };
    set((s) => ({ accessRecords: [newRecord, ...s.accessRecords] }));
  },

  revokeAccess: (id) => {
    set((s) => ({ accessRecords: s.accessRecords.filter((a) => a.id !== id) }));
  },
}));
