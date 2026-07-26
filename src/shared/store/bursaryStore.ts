import { create } from 'zustand';
import { apiClient } from '@shared/api/apiClient';

// ── Types ──

export type FeeStatus = 'Cleared' | 'Owing' | 'Partial';
export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'Mobile Money' | 'Cheque' | 'Card';
export type PayrollStatus = 'Pending' | 'Processed' | 'Paid';
export type ExpenditureCategory = 'Utilities' | 'Stores' | 'Repairs' | 'Salaries' | 'Transport' | 'Equipment' | 'Miscellaneous' | 'Capital';
export type BudgetStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Active';
export type BudgetSubmissionStatus = 'Draft' | 'Pending Supervisor' | 'Supervisor Approved' | 'Pending Accountant' | 'Accountant Approved' | 'Rejected' | 'Disbursed';
export type InvoiceStatus = 'Issued' | 'Paid' | 'Overdue' | 'Cancelled';
export type BudgetDepartment = 'Academic' | 'Domestic/Boarding' | 'Administration' | 'Sports & Clubs' | 'Science Lab' | 'ICT' | 'Library' | 'Counselling' | 'Security' | 'Transport' | 'Health' | 'Cleaning';

export interface FeeRecord {
  id: string;
  studentName: string;
  admNo: string;
  class: string;
  term: string;
  feeType: string;
  amountDue: number;
  amountPaid: number;
  balance: number;
  status: FeeStatus;
  guardianName: string;
  guardianPhone: string;
  lastPaymentDate?: string;
  lastPaymentMethod?: PaymentMethod;
}

export interface PaymentReceipt {
  id: string;
  feeRecordId: string;
  studentName: string;
  admNo: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  receivedBy: string;
  receiptNo: string;
  term: string;
  notes: string;
}

export interface PayrollEntry {
  id: string;
  staffName: string;
  position: string;
  department: string;
  grossSalary: number;
  deductions: number;
  netSalary: number;
  payPeriod: string;
  status: PayrollStatus;
  bankAccount?: string;
  ssfContribution: number;
  taxDeduction: number;
}

export interface ExpenditureRecord {
  id: string;
  date: string;
  category: ExpenditureCategory;
  description: string;
  amount: number;
  vendor: string;
  paymentMethod: PaymentMethod;
  authorizedBy: string;
  receiptNo?: string;
  notes: string;
}

export interface BudgetItem {
  id: string;
  department: BudgetDepartment;
  allocated: number;
  spent: number;
  remaining: number;
  term: string;
  status: BudgetStatus;
  notes: string;
}

export interface BudgetSubmission {
  id: string;
  department: BudgetDepartment;
  submittedBy: string;
  supervisorName: string;
  dateSubmitted: string;
  items: { description: string; quantity: number; unitCost: number; total: number }[];
  totalRequested: number;
  status: BudgetSubmissionStatus;
  supervisorApprovedDate?: string;
  supervisorNotes?: string;
  accountantApprovedDate?: string;
  accountantNotes?: string;
  disbursedDate?: string;
  disbursedBy?: string;
  term: string;
  justification: string;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  studentName: string;
  admNo: string;
  class: string;
  guardianName: string;
  term: string;
  items: { description: string; amount: number }[];
  totalAmount: number;
  amountPaid: number;
  balance: number;
  status: InvoiceStatus;
  dateIssued: string;
  dueDate: string;
  issuedBy: string;
}

// ── Constants ──

export const FEE_STATUSES: FeeStatus[] = ['Cleared', 'Owing', 'Partial'];
export const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'Bank Transfer', 'Mobile Money', 'Cheque', 'Card'];
export const PAYROLL_STATUSES: PayrollStatus[] = ['Pending', 'Processed', 'Paid'];
export const EXPENDITURE_CATEGORIES: ExpenditureCategory[] = ['Utilities', 'Stores', 'Repairs', 'Salaries', 'Transport', 'Equipment', 'Miscellaneous', 'Capital'];
export const BUDGET_STATUSES: BudgetStatus[] = ['Draft', 'Submitted', 'Approved', 'Rejected', 'Active'];
export const BUDGET_SUBMISSION_STATUSES: BudgetSubmissionStatus[] = ['Draft', 'Pending Supervisor', 'Supervisor Approved', 'Pending Accountant', 'Accountant Approved', 'Rejected', 'Disbursed'];
export const INVOICE_STATUSES: InvoiceStatus[] = ['Issued', 'Paid', 'Overdue', 'Cancelled'];
export const BUDGET_DEPARTMENTS: BudgetDepartment[] = ['Academic', 'Domestic/Boarding', 'Administration', 'Sports & Clubs', 'Science Lab', 'ICT', 'Library', 'Counselling', 'Security', 'Transport', 'Health', 'Cleaning'];

export const FEE_TYPES = ['Tuition', 'Boarding', 'Feeding', 'Sports', 'Library', 'ICT', 'Medical', 'Examination'];
export const TERMS = ['Term 1 2026/2027', 'Term 2 2026/2027', 'Term 3 2025/2026'];
export const CLASS_SECTIONS = [
  'SHS1 Sci A', 'SHS1 Sci B', 'SHS1 Arts A', 'SHS1 Arts B', 'SHS1 Bus A',
  'SHS2 Sci A', 'SHS2 Sci B', 'SHS2 Arts A', 'SHS2 Arts B', 'SHS2 Bus A',
  'SHS3 Sci A', 'SHS3 Sci B', 'SHS3 Arts A', 'SHS3 Arts B', 'SHS3 Bus A',
];

// ── Helpers ──

let idCounter = 900;
const nextId = () => String(++idCounter);
const todayISO = () => new Date().toISOString().slice(0, 10);
let receiptCounter = 1000;
const nextReceiptNo = () => `RCP-${++receiptCounter}`;
let invoiceCounter = 100;
const nextInvoiceNo = () => `INV-${new Date().getFullYear()}/${++invoiceCounter}`;

const calcFeeStatus = (paid: number, due: number): FeeStatus => paid >= due ? 'Cleared' : paid > 0 ? 'Partial' : 'Owing';

// ── Initial Data ──

const INITIAL_FEES: FeeRecord[] = [];

const INITIAL_RECEIPTS: PaymentReceipt[] = [];

const INITIAL_PAYROLL: PayrollEntry[] = [];

const INITIAL_EXPENDITURE: ExpenditureRecord[] = [];

const INITIAL_BUDGET_ITEMS: BudgetItem[] = [];

const INITIAL_BUDGET_SUBMISSIONS: BudgetSubmission[] = [];

const INITIAL_INVOICES: Invoice[] = [];

// ── Store ──

interface BursaryState {
  fees: FeeRecord[];
  receipts: PaymentReceipt[];
  payroll: PayrollEntry[];
  expenditure: ExpenditureRecord[];
  budgetItems: BudgetItem[];
  budgetSubmissions: BudgetSubmission[];
  invoices: Invoice[];

  // Fees
  recordPayment: (feeRecordId: string, amount: number, method: PaymentMethod, receivedBy: string, notes: string) => void;
  addFeeRecord: (fee: Omit<FeeRecord, 'id' | 'balance' | 'status'>) => void;
  updateFeeRecord: (id: string, fee: Partial<FeeRecord>) => void;
  deleteFeeRecord: (id: string) => void;
  getTotalCollected: () => number;
  getTotalOutstanding: () => number;

  // Receipts
  deleteReceipt: (id: string) => void;

  // Payroll
  processPayroll: (id: string) => void;
  payPayroll: (id: string) => void;
  addPayrollEntry: (entry: Omit<PayrollEntry, 'id'>) => void;
  deletePayrollEntry: (id: string) => void;
  getTotalPayroll: () => { gross: number; net: number; deductions: number };

  // Expenditure
  recordExpenditure: (exp: Omit<ExpenditureRecord, 'id' | 'date'>) => void;
  deleteExpenditure: (id: string) => void;
  getTotalExpenditure: () => number;
  getExpenditureByCategory: () => { category: ExpenditureCategory; total: number }[];

  // Budget Items
  addBudgetItem: (item: Omit<BudgetItem, 'id' | 'remaining'>) => void;
  updateBudgetItem: (id: string, item: Partial<BudgetItem>) => void;
  deleteBudgetItem: (id: string) => void;
  submitBudgetForApproval: (id: string) => void;
  getTotalBudget: () => { allocated: number; spent: number; remaining: number };

  // Budget Submissions (from departments via supervisors)
  approveBudgetSubmissionSupervisor: (id: string, notes: string) => void;
  approveBudgetSubmissionAccountant: (id: string, notes: string) => void;
  rejectBudgetSubmission: (id: string, notes: string) => void;
  disburseBudgetSubmission: (id: string, disbursedBy: string) => void;
  deleteBudgetSubmission: (id: string) => void;
  getPendingBudgetSubmissions: () => BudgetSubmission[];
  getApprovedBudgetSubmissions: () => BudgetSubmission[];

  // Invoices
  issueInvoice: (inv: Omit<Invoice, 'id' | 'invoiceNo' | 'dateIssued' | 'amountPaid' | 'balance' | 'status'>) => void;
  cancelInvoice: (id: string) => void;
  deleteInvoice: (id: string) => void;
  getOverdueInvoices: () => Invoice[];

  // API
  loadFees: () => Promise<void>;
  loadReceipts: () => Promise<void>;
  loadPayroll: () => Promise<void>;
  loadExpenditure: () => Promise<void>;
  loadBudgetItems: () => Promise<void>;
  loadBudgetSubmissions: () => Promise<void>;
  loadInvoices: () => Promise<void>;
  loadAll: () => Promise<void>;
}

export const useBursaryStore = create<BursaryState>((set, get) => ({
  fees: INITIAL_FEES,
  receipts: INITIAL_RECEIPTS,
  payroll: INITIAL_PAYROLL,
  expenditure: INITIAL_EXPENDITURE,
  budgetItems: INITIAL_BUDGET_ITEMS,
  budgetSubmissions: INITIAL_BUDGET_SUBMISSIONS,
  invoices: INITIAL_INVOICES,

  recordPayment: async (feeRecordId, amount, method, receivedBy, notes) => {
    const fee = get().fees.find((f) => f.id === feeRecordId);
    if (!fee) return;
    const newPaid = fee.amountPaid + amount;
    const newBalance = fee.amountDue - newPaid;
    const newStatus = calcFeeStatus(newPaid, fee.amountDue);
    const receipt: PaymentReceipt = {
      id: nextId(), feeRecordId, studentName: fee.studentName, admNo: fee.admNo,
      amount, method, date: todayISO(), receivedBy, receiptNo: nextReceiptNo(),
      term: fee.term, notes,
    };
    try {
      await apiClient.post<any>('/bursary/receipts', { feeRecordId, amount, method, receivedBy, notes, term: fee.term });
    } catch {}
    set((s) => ({
      fees: s.fees.map((f) => f.id === feeRecordId ? { ...f, amountPaid: newPaid, balance: newBalance, status: newStatus, lastPaymentDate: todayISO(), lastPaymentMethod: method } : f),
      receipts: [receipt, ...s.receipts],
    }));
  },
  addFeeRecord: (fee) => {
    const balance = fee.amountDue - fee.amountPaid;
    const status = calcFeeStatus(fee.amountPaid, fee.amountDue);
    set((s) => ({ fees: [{ ...fee, id: nextId(), balance, status }, ...s.fees] }));
  },
  updateFeeRecord: (id, fee) => {
    set((s) => ({ fees: s.fees.map((f) => (f.id === id ? { ...f, ...fee } : f)) }));
  },
  deleteFeeRecord: (id) => {
    set((s) => ({ fees: s.fees.filter((f) => f.id !== id) }));
  },
  getTotalCollected: () => get().fees.reduce((s, f) => s + f.amountPaid, 0),
  getTotalOutstanding: () => get().fees.reduce((s, f) => s + f.balance, 0),

  deleteReceipt: (id) => {
    set((s) => ({ receipts: s.receipts.filter((r) => r.id !== id) }));
  },

  processPayroll: (id) => {
    set((s) => ({ payroll: s.payroll.map((p) => (p.id === id ? { ...p, status: 'Processed' } : p)) }));
  },
  payPayroll: (id) => {
    set((s) => ({ payroll: s.payroll.map((p) => (p.id === id ? { ...p, status: 'Paid' } : p)) }));
  },
  addPayrollEntry: (entry) => {
    set((s) => ({ payroll: [...s.payroll, { ...entry, id: nextId() }] }));
  },
  deletePayrollEntry: (id) => {
    set((s) => ({ payroll: s.payroll.filter((p) => p.id !== id) }));
  },
  getTotalPayroll: () => {
    const p = get().payroll;
    return { gross: p.reduce((s, e) => s + e.grossSalary, 0), net: p.reduce((s, e) => s + e.netSalary, 0), deductions: p.reduce((s, e) => s + e.deductions, 0) };
  },

  recordExpenditure: async (exp) => {
    const newExp: ExpenditureRecord = { ...exp, id: nextId(), date: todayISO() };
    try {
      const created = await apiClient.post<any>('/bursary/expenditure', exp);
      set((s) => ({ expenditure: [{ ...newExp, id: created.id || nextId() }, ...s.expenditure] }));
    } catch {
      set((s) => ({ expenditure: [newExp, ...s.expenditure] }));
    }
  },
  deleteExpenditure: (id) => {
    set((s) => ({ expenditure: s.expenditure.filter((e) => e.id !== id) }));
  },
  getTotalExpenditure: () => get().expenditure.reduce((s, e) => s + e.amount, 0),
  getExpenditureByCategory: () => {
    const cats = EXPENDITURE_CATEGORIES;
    return cats.map((category) => ({ category, total: get().expenditure.filter((e) => e.category === category).reduce((s, e) => s + e.amount, 0) })).filter((c) => c.total > 0);
  },

  addBudgetItem: (item) => {
    const remaining = item.allocated - item.spent;
    set((s) => ({ budgetItems: [...s.budgetItems, { ...item, id: nextId(), remaining }] }));
  },
  updateBudgetItem: (id, item) => {
    set((s) => ({ budgetItems: s.budgetItems.map((b) => (b.id === id ? { ...b, ...item, remaining: (item.allocated ?? b.allocated) - (item.spent ?? b.spent) } : b)) }));
  },
  deleteBudgetItem: (id) => {
    set((s) => ({ budgetItems: s.budgetItems.filter((b) => b.id !== id) }));
  },
  submitBudgetForApproval: (id) => {
    set((s) => ({ budgetItems: s.budgetItems.map((b) => (b.id === id ? { ...b, status: 'Submitted' } : b)) }));
  },
  getTotalBudget: () => {
    const items = get().budgetItems;
    return { allocated: items.reduce((s, b) => s + b.allocated, 0), spent: items.reduce((s, b) => s + b.spent, 0), remaining: items.reduce((s, b) => s + b.remaining, 0) };
  },

  approveBudgetSubmissionSupervisor: (id, notes) => {
    set((s) => ({
      budgetSubmissions: s.budgetSubmissions.map((b) =>
        b.id === id ? { ...b, status: 'Pending Accountant', supervisorApprovedDate: todayISO(), supervisorNotes: notes } : b
      ),
    }));
  },
  approveBudgetSubmissionAccountant: (id, notes) => {
    set((s) => ({
      budgetSubmissions: s.budgetSubmissions.map((b) =>
        b.id === id ? { ...b, status: 'Accountant Approved', accountantApprovedDate: todayISO(), accountantNotes: notes } : b
      ),
    }));
  },
  rejectBudgetSubmission: (id, notes) => {
    set((s) => ({
      budgetSubmissions: s.budgetSubmissions.map((b) =>
        b.id === id ? { ...b, status: 'Rejected', accountantNotes: notes } : b
      ),
    }));
  },
  disburseBudgetSubmission: (id, disbursedBy) => {
    set((s) => ({
      budgetSubmissions: s.budgetSubmissions.map((b) =>
        b.id === id ? { ...b, status: 'Disbursed', disbursedDate: todayISO(), disbursedBy } : b
      ),
    }));
  },
  deleteBudgetSubmission: (id) => {
    set((s) => ({ budgetSubmissions: s.budgetSubmissions.filter((b) => b.id !== id) }));
  },
  getPendingBudgetSubmissions: () => {
    return get().budgetSubmissions.filter((b) => b.status === 'Pending Accountant' || b.status === 'Supervisor Approved');
  },
  getApprovedBudgetSubmissions: () => {
    return get().budgetSubmissions.filter((b) => b.status === 'Accountant Approved');
  },

  issueInvoice: (inv) => {
    const newInv: Invoice = {
      ...inv, id: nextId(), invoiceNo: nextInvoiceNo(), dateIssued: todayISO(),
      amountPaid: 0, balance: inv.totalAmount, status: 'Issued',
    };
    set((s) => ({ invoices: [newInv, ...s.invoices] }));
  },
  cancelInvoice: (id) => {
    set((s) => ({ invoices: s.invoices.map((i) => (i.id === id ? { ...i, status: 'Cancelled' } : i)) }));
  },
  deleteInvoice: (id) => {
    set((s) => ({ invoices: s.invoices.filter((i) => i.id !== id) }));
  },
  getOverdueInvoices: () => {
    return get().invoices.filter((i) => i.status === 'Overdue');
  },

  loadFees: async () => {
    try {
      const data = await apiClient.get<any[]>('/bursary/fees');
      set({ fees: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadReceipts: async () => {
    try {
      const data = await apiClient.get<any[]>('/bursary/receipts');
      set({ receipts: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadPayroll: async () => {
    try {
      const data = await apiClient.get<any[]>('/bursary/payroll');
      set({ payroll: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadExpenditure: async () => {
    try {
      const data = await apiClient.get<any[]>('/bursary/expenditure');
      set({ expenditure: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadBudgetItems: async () => {
    try {
      const data = await apiClient.get<any[]>('/bursary/budget-items');
      set({ budgetItems: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadBudgetSubmissions: async () => {
    try {
      const data = await apiClient.get<any[]>('/bursary/budget-submissions');
      set({ budgetSubmissions: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadInvoices: async () => {
    try {
      const data = await apiClient.get<any[]>('/bursary/invoices');
      set({ invoices: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadAll: async () => {
    await Promise.all([
      get().loadFees(),
      get().loadReceipts(),
      get().loadPayroll(),
      get().loadExpenditure(),
      get().loadBudgetItems(),
      get().loadBudgetSubmissions(),
      get().loadInvoices(),
    ]);
  },
}));
