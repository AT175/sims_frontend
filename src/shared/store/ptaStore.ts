import { create } from 'zustand';
import { apiClient } from '@shared/api/apiClient';

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

const INITIAL_WARDS: Ward[] = [];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [];

const INITIAL_FUNDRAISING: FundraisingProject[] = [];

const INITIAL_MEETINGS: PTAMeeting[] = [];

const INITIAL_DIRECTORY: ParentDirectoryEntry[] = [];

const INITIAL_FEEDBACK: FeedbackEntry[] = [];

const INITIAL_DUES: DueRecord[] = [];

const INITIAL_TRANSACTIONS: FinanceTransaction[] = [];

const INITIAL_BUDGETS: BudgetCategory[] = [];

const INITIAL_REPORT_CARDS: ReportCard[] = [];

const INITIAL_HEALTH_VISITS: HealthVisit[] = [];

const INITIAL_PAYMENTS: PaymentItem[] = [];

const INITIAL_ACCESS: AccessRecord[] = [];

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

  // API
  loadAnnouncements: () => Promise<void>;
  loadMeetings: () => Promise<void>;
  loadAll: () => Promise<void>;
}

export const usePTAStore = create<PTAState>((set, get) => ({
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

  addAnnouncement: async (a) => {
    const newAnn: Announcement = { ...a, id: nextId() };
    try {
      const created = await apiClient.post<any>('/pta/announcements', a);
      set((s) => ({ announcements: [{ ...newAnn, id: created.id || nextId() }, ...s.announcements] }));
    } catch {
      set((s) => ({ announcements: [newAnn, ...s.announcements] }));
    }
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

  loadAnnouncements: async () => {
    try {
      const data = await apiClient.get<any[]>('/pta/announcements');
      set({ announcements: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadMeetings: async () => {
    try {
      const data = await apiClient.get<any[]>('/pta/meetings');
      set({ meetings: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadAll: async () => {
    await Promise.all([
      get().loadAnnouncements(),
      get().loadMeetings(),
    ]);
  },

}));
