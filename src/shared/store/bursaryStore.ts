import { create } from 'zustand';

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

const INITIAL_FEES: FeeRecord[] = [
  { id: '1', studentName: 'Kwame Asante', admNo: '2026/001', class: 'SHS2 Sci A', term: 'Term 3 2025/2026', feeType: 'Tuition', amountDue: 1200, amountPaid: 1200, balance: 0, status: 'Cleared', guardianName: 'Mr. Kofi Asante', guardianPhone: '024-555-1001', lastPaymentDate: '2026-01-10', lastPaymentMethod: 'Bank Transfer' },
  { id: '2', studentName: 'Ama Owusu', admNo: '2026/002', class: 'SHS1 Arts B', term: 'Term 3 2025/2026', feeType: 'Tuition', amountDue: 1200, amountPaid: 600, balance: 600, status: 'Partial', guardianName: 'Mrs. Akosua Owusu', guardianPhone: '027-555-1002', lastPaymentDate: '2026-02-15', lastPaymentMethod: 'Mobile Money' },
  { id: '3', studentName: 'Yao Mensah', admNo: '2026/003', class: 'SHS3 Bus A', term: 'Term 3 2025/2026', feeType: 'Tuition', amountDue: 1200, amountPaid: 900, balance: 300, status: 'Partial', guardianName: 'Mr. Daniel Mensah', guardianPhone: '020-555-1003', lastPaymentDate: '2026-03-01', lastPaymentMethod: 'Cash' },
  { id: '4', studentName: 'Efua Darko', admNo: '2025/145', class: 'SHS2 Sci B', term: 'Term 3 2025/2026', feeType: 'Tuition', amountDue: 1200, amountPaid: 1200, balance: 0, status: 'Cleared', guardianName: 'Mrs. Grace Darko', guardianPhone: '055-555-1004', lastPaymentDate: '2026-01-12', lastPaymentMethod: 'Bank Transfer' },
  { id: '5', studentName: 'Kofi Boateng', admNo: '2025/146', class: 'SHS3 Sci A', term: 'Term 3 2025/2026', feeType: 'Tuition', amountDue: 1200, amountPaid: 0, balance: 1200, status: 'Owing', guardianName: 'Mr. Samuel Boateng', guardianPhone: '024-555-1005' },
  { id: '6', studentName: 'Adwoa Frimpong', admNo: '2025/147', class: 'SHS1 Sci A', term: 'Term 3 2025/2026', feeType: 'Tuition', amountDue: 1200, amountPaid: 1200, balance: 0, status: 'Cleared', guardianName: 'Mr. Yaw Frimpong', guardianPhone: '027-555-1006', lastPaymentDate: '2026-01-20', lastPaymentMethod: 'Mobile Money' },
  { id: '7', studentName: 'Kojo Addo', admNo: '2024/098', class: 'SHS3 Arts A', term: 'Term 3 2025/2026', feeType: 'Tuition', amountDue: 1200, amountPaid: 0, balance: 1200, status: 'Owing', guardianName: 'Mr. Peter Addo', guardianPhone: '020-555-1007' },
  { id: '8', studentName: 'Ama Owusu', admNo: '2026/002', class: 'SHS1 Arts B', term: 'Term 3 2025/2026', feeType: 'Boarding', amountDue: 800, amountPaid: 800, balance: 0, status: 'Cleared', guardianName: 'Mrs. Akosua Owusu', guardianPhone: '027-555-1002', lastPaymentDate: '2026-01-15', lastPaymentMethod: 'Mobile Money' },
];

const INITIAL_RECEIPTS: PaymentReceipt[] = [
  { id: '1', feeRecordId: '1', studentName: 'Kwame Asante', admNo: '2026/001', amount: 1200, method: 'Bank Transfer', date: '2026-01-10', receivedBy: 'Accountant', receiptNo: 'RCP-1001', term: 'Term 3 2025/2026', notes: 'Full tuition payment' },
  { id: '2', feeRecordId: '2', studentName: 'Ama Owusu', admNo: '2026/002', amount: 600, method: 'Mobile Money', date: '2026-02-15', receivedBy: 'Accountant', receiptNo: 'RCP-1002', term: 'Term 3 2025/2026', notes: 'Partial payment' },
  { id: '3', feeRecordId: '3', studentName: 'Yao Mensah', admNo: '2026/003', amount: 900, method: 'Cash', date: '2026-03-01', receivedBy: 'Accountant', receiptNo: 'RCP-1003', term: 'Term 3 2025/2026', notes: 'Installment payment' },
];

const INITIAL_PAYROLL: PayrollEntry[] = [
  { id: '1', staffName: 'J. Mensah', position: 'Senior Teacher', department: 'Mathematics', grossSalary: 4200, deductions: 630, netSalary: 3570, payPeriod: 'July 2026', status: 'Processed', ssfContribution: 420, taxDeduction: 210 },
  { id: '2', staffName: 'G. Adjei', position: 'HOD Science', department: 'Science', grossSalary: 4800, deductions: 720, netSalary: 4080, payPeriod: 'July 2026', status: 'Processed', ssfContribution: 480, taxDeduction: 240 },
  { id: '3', staffName: 'F. Boateng', position: 'Teacher (English)', department: 'English', grossSalary: 3600, deductions: 540, netSalary: 3060, payPeriod: 'July 2026', status: 'Pending', ssfContribution: 360, taxDeduction: 180 },
  { id: '4', staffName: 'A. Tetteh', position: 'Accountant', department: 'Finance', grossSalary: 4500, deductions: 675, netSalary: 3825, payPeriod: 'July 2026', status: 'Pending', ssfContribution: 450, taxDeduction: 225 },
  { id: '5', staffName: 'R. Amponsah', position: 'Asst. Headmaster', department: 'Administration', grossSalary: 5500, deductions: 825, netSalary: 4675, payPeriod: 'July 2026', status: 'Processed', ssfContribution: 550, taxDeduction: 275 },
  { id: '6', staffName: 'D. Asante', position: 'Counsellor', department: 'Counselling', grossSalary: 3800, deductions: 570, netSalary: 3230, payPeriod: 'July 2026', status: 'Pending', ssfContribution: 380, taxDeduction: 190 },
];

const INITIAL_EXPENDITURE: ExpenditureRecord[] = [
  { id: '1', date: '2026-07-06', category: 'Utilities', description: 'Electricity bill — July', amount: 3200, vendor: 'ECG', paymentMethod: 'Bank Transfer', authorizedBy: 'Headmaster', receiptNo: 'ECG-2026-07', notes: 'Monthly electricity' },
  { id: '2', date: '2026-07-05', category: 'Stores', description: 'Cleaning supplies bulk purchase', amount: 850, vendor: 'CleanCo Ltd', paymentMethod: 'Cheque', authorizedBy: 'Accountant', receiptNo: 'CC-045', notes: 'Detergents, disinfectants' },
  { id: '3', date: '2026-07-04', category: 'Repairs', description: 'Science lab equipment repair', amount: 1400, vendor: 'LabTech Services', paymentMethod: 'Cash', authorizedBy: 'HOD Science', notes: 'Microscope and centrifuge repair' },
  { id: '4', date: '2026-07-03', category: 'Transport', description: 'School bus fuel — Week 1', amount: 1800, vendor: 'Goil', paymentMethod: 'Card', authorizedBy: 'Transport Officer', receiptNo: 'GOIL-W1', notes: 'Diesel for 3 buses' },
  { id: '5', date: '2026-07-02', category: 'Equipment', description: 'New desktop computers (5 units)', amount: 15000, vendor: 'CompuGhana', paymentMethod: 'Bank Transfer', authorizedBy: 'Headmaster', receiptNo: 'CG-2026-07', notes: 'ICT lab upgrade' },
  { id: '6', date: '2026-06-28', category: 'Miscellaneous', description: 'Sports day logistics', amount: 1200, vendor: 'Various', paymentMethod: 'Cash', authorizedBy: 'Sports Coach', notes: 'Refreshments, medals, decorations' },
];

const INITIAL_BUDGET_ITEMS: BudgetItem[] = [
  { id: '1', department: 'Academic', allocated: 45000, spent: 28000, remaining: 17000, term: 'Term 3 2025/2026', status: 'Active', notes: 'Teaching materials, exam printing' },
  { id: '2', department: 'Domestic/Boarding', allocated: 80000, spent: 52000, remaining: 28000, term: 'Term 3 2025/2026', status: 'Active', notes: 'Food, boarding supplies, utilities' },
  { id: '3', department: 'Administration', allocated: 30000, spent: 18500, remaining: 11500, term: 'Term 3 2025/2026', status: 'Active', notes: 'Office supplies, communications' },
  { id: '4', department: 'Sports & Clubs', allocated: 15000, spent: 4200, remaining: 10800, term: 'Term 3 2025/2026', status: 'Active', notes: 'Equipment, fixtures, competitions' },
  { id: '5', department: 'Science Lab', allocated: 20000, spent: 8500, remaining: 11500, term: 'Term 3 2025/2026', status: 'Active', notes: 'Chemicals, apparatus, consumables' },
  { id: '6', department: 'ICT', allocated: 25000, spent: 15000, remaining: 10000, term: 'Term 3 2025/2026', status: 'Active', notes: 'Computers, software, internet' },
];

const INITIAL_BUDGET_SUBMISSIONS: BudgetSubmission[] = [
  { id: '1', department: 'Science Lab', submittedBy: 'G. Adjei (HOD Science)', supervisorName: 'Asst. Headmaster (Academic)', dateSubmitted: '2026-07-05', items: [
    { description: 'Chemistry reagents (Term 1)', quantity: 20, unitCost: 150, total: 3000 },
    { description: 'Biology specimens', quantity: 10, unitCost: 80, total: 800 },
    { description: 'Physics apparatus set', quantity: 5, unitCost: 400, total: 2000 },
  ], totalRequested: 5800, status: 'Accountant Approved', supervisorApprovedDate: '2026-07-06', supervisorNotes: 'Approved — essential for Term 1 labs.', accountantApprovedDate: '2026-07-07', accountantNotes: 'Approved. Allocate from Science Lab budget.', term: 'Term 1 2026/2027', justification: 'Required consumables for SHS1-3 practical lessons.' },
  { id: '2', department: 'Sports & Clubs', submittedBy: 'C. Dankwah (Sports Coach)', supervisorName: 'Asst. Headmaster (Academic)', dateSubmitted: '2026-07-08', items: [
    { description: 'Football jerseys (2 sets)', quantity: 2, unitCost: 1200, total: 2400 },
    { description: 'Athletics equipment', quantity: 1, unitCost: 3500, total: 3500 },
    { description: 'Trophies and medals', quantity: 1, unitCost: 800, total: 800 },
  ], totalRequested: 6700, status: 'Pending Accountant', supervisorApprovedDate: '2026-07-09', supervisorNotes: 'Approved — inter-schools competition preparation.', term: 'Term 1 2026/2027', justification: 'Upcoming inter-schools sports competition in October.' },
  { id: '3', department: 'Domestic/Boarding', submittedBy: 'Domestic Bursar', supervisorName: 'Senior Housemaster', dateSubmitted: '2026-07-09', items: [
    { description: 'Mattresses (double)', quantity: 30, unitCost: 450, total: 13500 },
    { description: 'Dining hall tables', quantity: 10, unitCost: 800, total: 8000 },
  ], totalRequested: 21500, status: 'Pending Supervisor', term: 'Term 1 2026/2027', justification: 'Replacement of worn-out boarding supplies for new intake.' },
  { id: '4', department: 'ICT', submittedBy: 'M. Owusu (ICT Teacher)', supervisorName: 'Asst. Headmaster (Academic)', dateSubmitted: '2026-07-07', items: [
    { description: 'Projector', quantity: 2, unitCost: 3000, total: 6000 },
    { description: 'Networking cables', quantity: 5, unitCost: 200, total: 1000 },
  ], totalRequested: 7000, status: 'Supervisor Approved', supervisorApprovedDate: '2026-07-08', supervisorNotes: 'Approved — ICT lab needs upgrade.', term: 'Term 1 2026/2027', justification: 'ICT lab expansion for new academic year.' },
  { id: '5', department: 'Library', submittedBy: 'L. Frimpong (Librarian)', supervisorName: 'Asst. Headmaster (Academic)', dateSubmitted: '2026-07-10', items: [
    { description: 'Reference books (set)', quantity: 1, unitCost: 5000, total: 5000 },
    { description: 'Fiction books', quantity: 50, unitCost: 40, total: 2000 },
  ], totalRequested: 7000, status: 'Pending Supervisor', term: 'Term 1 2026/2027', justification: 'Stocking library for new academic year reading program.' },
];

const INITIAL_INVOICES: Invoice[] = [
  { id: '1', invoiceNo: 'INV-2026/101', studentName: 'Kofi Boateng', admNo: '2025/146', class: 'SHS3 Sci A', guardianName: 'Mr. Samuel Boateng', term: 'Term 3 2025/2026', items: [
    { description: 'Tuition Fee', amount: 1200 }, { description: 'Boarding Fee', amount: 800 }, { description: 'Examination Fee', amount: 150 },
  ], totalAmount: 2150, amountPaid: 0, balance: 2150, status: 'Overdue', dateIssued: '2026-01-15', dueDate: '2026-02-15', issuedBy: 'Accountant' },
  { id: '2', invoiceNo: 'INV-2026/102', studentName: 'Kojo Addo', admNo: '2024/098', class: 'SHS3 Arts A', guardianName: 'Mr. Peter Addo', term: 'Term 3 2025/2026', items: [
    { description: 'Tuition Fee', amount: 1200 }, { description: 'Examination Fee', amount: 150 },
  ], totalAmount: 1350, amountPaid: 0, balance: 1350, status: 'Overdue', dateIssued: '2026-01-15', dueDate: '2026-02-15', issuedBy: 'Accountant' },
  { id: '3', invoiceNo: 'INV-2026/103', studentName: 'Ama Owusu', admNo: '2026/002', class: 'SHS1 Arts B', guardianName: 'Mrs. Akosua Owusu', term: 'Term 3 2025/2026', items: [
    { description: 'Tuition Fee', amount: 1200 }, { description: 'Boarding Fee', amount: 800 },
  ], totalAmount: 2000, amountPaid: 1400, balance: 600, status: 'Issued', dateIssued: '2026-01-15', dueDate: '2026-03-15', issuedBy: 'Accountant' },
];

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
}

export const useBursaryStore = create<BursaryState>((set, get) => ({
  fees: INITIAL_FEES,
  receipts: INITIAL_RECEIPTS,
  payroll: INITIAL_PAYROLL,
  expenditure: INITIAL_EXPENDITURE,
  budgetItems: INITIAL_BUDGET_ITEMS,
  budgetSubmissions: INITIAL_BUDGET_SUBMISSIONS,
  invoices: INITIAL_INVOICES,

  recordPayment: (feeRecordId, amount, method, receivedBy, notes) => {
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

  recordExpenditure: (exp) => {
    set((s) => ({ expenditure: [{ ...exp, id: nextId(), date: todayISO() }, ...s.expenditure] }));
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
}));
