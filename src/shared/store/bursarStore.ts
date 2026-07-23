import { create } from 'zustand';

// ── Types ──

export type CashTxnType = 'Income' | 'Expense';
export type CashTxnCategory = 'Fees' | 'Pocket Money' | 'Feeding' | 'Boarding Supplies' | 'Stationery' | 'Medical' | 'Transport' | 'Utilities' | 'Repairs' | 'Miscellaneous';
export type PocketMoneyTxnType = 'Deposit' | 'Withdrawal';
export type PettyCashStatus = 'Requested' | 'Approved' | 'Disbursed' | 'Rejected';
export type ImprestStatus = 'Active' | 'Retired' | 'Pending Retirement';
export type ProcurementStatus = 'Requisitioned' | 'Approved' | 'Ordered' | 'Delivered' | 'Rejected';
export type FeedingStatus = 'Served' | 'Not Served' | 'Absent';
export type ReturnPeriod = 'Daily' | 'Weekly' | 'Monthly';
export type ReturnStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected';

export interface CashTransaction {
  id: string;
  date: string;
  type: CashTxnType;
  category: CashTxnCategory;
  description: string;
  amount: number;
  receivedFrom?: string;
  paidTo?: string;
  receiptNo: string;
  balanceAfter: number;
  handledBy: string;
}

export interface StudentAccount {
  id: string;
  studentName: string;
  admNo: string;
  class: string;
  guardianName: string;
  guardianPhone: string;
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  transactions: PocketMoneyTxn[];
}

export interface PocketMoneyTxn {
  id: string;
  date: string;
  type: PocketMoneyTxnType;
  amount: number;
  description: string;
  balanceAfter: number;
  authorizedBy: string;
}

export interface PettyCashEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  requestedBy: string;
  status: PettyCashStatus;
  approvedBy?: string;
  dateApproved?: string;
  notes: string;
  receiptNo?: string;
}

export interface ImprestAccount {
  id: string;
  holder: string;
  department: string;
  amount: number;
  dateIssued: string;
  purpose: string;
  status: ImprestStatus;
  retiredAmount?: number;
  dateRetired?: string;
  retirementVoucherNo?: string;
  notes: string;
}

export interface ProcurementRequest {
  id: string;
  date: string;
  item: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
  actualCost?: number;
  supplier: string;
  requestedBy: string;
  department: string;
  status: ProcurementStatus;
  dateDelivered?: string;
  notes: string;
}

export interface FeedingRecord {
  id: string;
  date: string;
  meal: string;
  headcount: number;
  costPerHead: number;
  totalCost: number;
  status: FeedingStatus;
  notes: string;
}

export interface BoardingSupply {
  id: string;
  item: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  datePurchased: string;
  supplier: string;
  house: string;
  notes: string;
}

export interface BursaryReturn {
  id: string;
  period: ReturnPeriod;
  dateFrom: string;
  dateTo: string;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  status: ReturnStatus;
  submittedBy: string;
  dateSubmitted: string;
  approvedBy?: string;
  notes: string;
  lineItems: { description: string; amount: number; type: CashTxnType }[];
}

// ── Constants ──

export const CASH_TXN_CATEGORIES: CashTxnCategory[] = ['Fees', 'Pocket Money', 'Feeding', 'Boarding Supplies', 'Stationery', 'Medical', 'Transport', 'Utilities', 'Repairs', 'Miscellaneous'];
export const PETTY_CASH_STATUSES: PettyCashStatus[] = ['Requested', 'Approved', 'Disbursed', 'Rejected'];
export const IMPREST_STATUSES: ImprestStatus[] = ['Active', 'Retired', 'Pending Retirement'];
export const PROCUREMENT_STATUSES: ProcurementStatus[] = ['Requisitioned', 'Approved', 'Ordered', 'Delivered', 'Rejected'];
export const FEEDING_STATUSES: FeedingStatus[] = ['Served', 'Not Served', 'Absent'];
export const RETURN_PERIODS: ReturnPeriod[] = ['Daily', 'Weekly', 'Monthly'];
export const RETURN_STATUSES: ReturnStatus[] = ['Draft', 'Submitted', 'Approved', 'Rejected'];
export const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
export const HOUSES = ['House 1 (Boys)', 'House 2 (Boys)', 'House 3 (Girls)', 'House 4 (Girls)'];
export const SUPPLY_UNITS = ['units', 'pieces', 'sets', 'cartons', 'bags', 'litres', 'metres'];

// ── Helpers ──

let idCounter = 500;
const nextId = () => String(++idCounter);
const todayISO = () => new Date().toISOString().slice(0, 10);
let cashReceiptCounter = 2000;
const nextCashReceiptNo = () => `CSH-${++cashReceiptCounter}`;

// ── Initial Data ──

const INITIAL_CASH_TXNS: CashTransaction[] = [
  { id: '1', date: '2026-07-10', type: 'Income', category: 'Fees', description: 'Fee payment — Kwame Asante', amount: 500, receivedFrom: 'Mr. Kofi Asante (Parent)', paidTo: '', receiptNo: 'CSH-2001', balanceAfter: 12500, handledBy: 'Bursar' },
  { id: '2', date: '2026-07-10', type: 'Income', category: 'Pocket Money', description: 'Pocket money deposit — Ama Owusu', amount: 100, receivedFrom: 'Mrs. Owusu (Parent)', paidTo: '', receiptNo: 'CSH-2002', balanceAfter: 12600, handledBy: 'Bursar' },
  { id: '3', date: '2026-07-09', type: 'Expense', category: 'Feeding', description: 'Foodstuff purchase — Day 5', amount: 850, receivedFrom: '', paidTo: 'Makola Market Vendor', receiptNo: 'CSH-2003', balanceAfter: 12000, handledBy: 'Bursar' },
  { id: '4', date: '2026-07-09', type: 'Expense', category: 'Boarding Supplies', description: 'Mattress replacement — House 1', amount: 450, receivedFrom: '', paidTo: 'Bedding Ghana Ltd', receiptNo: 'CSH-2004', balanceAfter: 11150, handledBy: 'Bursar' },
  { id: '5', date: '2026-07-08', type: 'Income', category: 'Fees', description: 'Fee payment — Yao Mensah', amount: 300, receivedFrom: 'Mr. Daniel Mensah (Parent)', paidTo: '', receiptNo: 'CSH-2005', balanceAfter: 11600, handledBy: 'Bursar' },
  { id: '6', date: '2026-07-08', type: 'Expense', category: 'Stationery', description: 'Office supplies — registry forms', amount: 120, receivedFrom: '', paidTo: 'Stationery World', receiptNo: 'CSH-2006', balanceAfter: 11300, handledBy: 'Bursar' },
  { id: '7', date: '2026-07-07', type: 'Expense', category: 'Utilities', description: 'Water bill — July', amount: 600, receivedFrom: '', paidTo: 'Ghana Water Co.', receiptNo: 'CSH-2007', balanceAfter: 11180, handledBy: 'Bursar' },
];

const INITIAL_STUDENT_ACCOUNTS: StudentAccount[] = [
  { id: '1', studentName: 'Kwame Asante', admNo: '2026/001', class: 'SHS2 Sci A', guardianName: 'Mr. Kofi Asante', guardianPhone: '024-555-1001', balance: 150, totalDeposited: 300, totalWithdrawn: 150, transactions: [
    { id: 't1', date: '2026-07-01', type: 'Deposit', amount: 200, description: 'Opening deposit', balanceAfter: 200, authorizedBy: 'Bursar' },
    { id: 't2', date: '2026-07-05', type: 'Withdrawal', amount: 50, description: 'Personal effects', balanceAfter: 150, authorizedBy: 'Bursar' },
    { id: 't3', date: '2026-07-10', type: 'Deposit', amount: 100, description: 'Top-up from parent', balanceAfter: 250, authorizedBy: 'Bursar' },
    { id: 't4', date: '2026-07-10', type: 'Withdrawal', amount: 100, description: 'Snacks & toiletries', balanceAfter: 150, authorizedBy: 'Bursar' },
  ]},
  { id: '2', studentName: 'Ama Owusu', admNo: '2026/002', class: 'SHS1 Arts B', guardianName: 'Mrs. Akosua Owusu', guardianPhone: '027-555-1002', balance: 80, totalDeposited: 200, totalWithdrawn: 120, transactions: [
    { id: 't5', date: '2026-07-02', type: 'Deposit', amount: 150, description: 'Opening deposit', balanceAfter: 150, authorizedBy: 'Bursar' },
    { id: 't6', date: '2026-07-06', type: 'Withdrawal', amount: 70, description: 'Toiletries', balanceAfter: 80, authorizedBy: 'Bursar' },
    { id: 't7', date: '2026-07-10', type: 'Deposit', amount: 50, description: 'Pocket money top-up', balanceAfter: 130, authorizedBy: 'Bursar' },
    { id: 't8', date: '2026-07-10', type: 'Withdrawal', amount: 50, description: 'Snacks', balanceAfter: 80, authorizedBy: 'Bursar' },
  ]},
  { id: '3', studentName: 'Yao Mensah', admNo: '2026/003', class: 'SHS3 Bus A', guardianName: 'Mr. Daniel Mensah', guardianPhone: '020-555-1003', balance: 25, totalDeposited: 100, totalWithdrawn: 75, transactions: [
    { id: 't9', date: '2026-07-03', type: 'Deposit', amount: 100, description: 'Opening deposit', balanceAfter: 100, authorizedBy: 'Bursar' },
    { id: 't10', date: '2026-07-07', type: 'Withdrawal', amount: 75, description: 'Photocopy & printing', balanceAfter: 25, authorizedBy: 'Bursar' },
  ]},
  { id: '4', studentName: 'Efua Darko', admNo: '2025/145', class: 'SHS2 Sci B', guardianName: 'Mrs. Grace Darko', guardianPhone: '055-555-1004', balance: 200, totalDeposited: 250, totalWithdrawn: 50, transactions: [
    { id: 't11', date: '2026-07-01', type: 'Deposit', amount: 200, description: 'Opening deposit', balanceAfter: 200, authorizedBy: 'Bursar' },
    { id: 't12', date: '2026-07-08', type: 'Withdrawal', amount: 50, description: 'Medical — paracetamol', balanceAfter: 150, authorizedBy: 'Bursar' },
    { id: 't13', date: '2026-07-09', type: 'Deposit', amount: 50, description: 'Top-up', balanceAfter: 200, authorizedBy: 'Bursar' },
  ]},
  { id: '5', studentName: 'Kofi Boateng', admNo: '2025/146', class: 'SHS3 Sci A', guardianName: 'Mr. Samuel Boateng', guardianPhone: '024-555-1005', balance: 0, totalDeposited: 50, totalWithdrawn: 50, transactions: [
    { id: 't14', date: '2026-07-04', type: 'Deposit', amount: 50, description: 'Opening deposit', balanceAfter: 50, authorizedBy: 'Bursar' },
    { id: 't15', date: '2026-07-06', type: 'Withdrawal', amount: 50, description: 'Transport — town pass', balanceAfter: 0, authorizedBy: 'Bursar' },
  ]},
];

const INITIAL_PETTY_CASH: PettyCashEntry[] = [
  { id: '1', date: '2026-07-10', description: 'Taxi fare for registry errand', amount: 30, requestedBy: 'Registry Clerk', status: 'Approved', approvedBy: 'Bursar', dateApproved: '2026-07-10', notes: 'Urgent document delivery to GES', receiptNo: 'PC-001' },
  { id: '2', date: '2026-07-09', description: 'Photocopying exam scripts', amount: 45, requestedBy: 'Academic Office', status: 'Disbursed', approvedBy: 'Bursar', dateApproved: '2026-07-09', notes: '150 copies @ 30p', receiptNo: 'PC-002' },
  { id: '3', date: '2026-07-10', description: 'Cleaning materials — emergency', amount: 60, requestedBy: 'Cleaning Supervisor', status: 'Requested', notes: 'Disinfectant and mops' },
  { id: '4', date: '2026-07-08', description: 'First aid supplies', amount: 35, requestedBy: 'Health Centre', status: 'Disbursed', approvedBy: 'Bursar', dateApproved: '2026-07-08', notes: 'Bandages, antiseptic', receiptNo: 'PC-003' },
];

const INITIAL_IMPREST: ImprestAccount[] = [
  { id: '1', holder: 'Catering Officer', department: 'Kitchen', amount: 5000, dateIssued: '2026-07-01', purpose: 'Weekly foodstuff purchase', status: 'Active', notes: 'Imprest for Week 1-2 food supplies' },
  { id: '2', holder: 'Transport Officer', department: 'Transport', amount: 2000, dateIssued: '2026-07-01', purpose: 'Fuel and minor repairs', status: 'Active', notes: 'Diesel for school buses' },
  { id: '3', holder: 'Domestic Bursar', department: 'Domestic', amount: 3000, dateIssued: '2026-06-15', purpose: 'Boarding supplies replenishment', status: 'Pending Retirement', retiredAmount: 2850, notes: 'Awaiting retirement voucher' },
  { id: '4', holder: 'Science HOD', department: 'Science Lab', amount: 1500, dateIssued: '2026-06-01', purpose: 'Lab consumables', status: 'Retired', retiredAmount: 1500, dateRetired: '2026-06-30', retirementVoucherNo: 'RV-001', notes: 'Fully retired' },
];

const INITIAL_PROCUREMENT: ProcurementRequest[] = [
  { id: '1', date: '2026-07-09', item: 'Rice (50kg bags)', quantity: 10, unit: 'bags', estimatedCost: 4000, actualCost: 3850, supplier: 'Ghana Grains Ltd', requestedBy: 'Catering Officer', department: 'Kitchen', status: 'Delivered', dateDelivered: '2026-07-10', notes: 'Delivered in good condition' },
  { id: '2', date: '2026-07-08', item: 'Mattresses (double)', quantity: 20, unit: 'units', estimatedCost: 9000, supplier: 'Bedding Ghana Ltd', requestedBy: 'Domestic Bursar', department: 'Domestic', status: 'Ordered', notes: 'For House 1 replacement' },
  { id: '3', date: '2026-07-07', item: 'Chemistry reagents', quantity: 5, unit: 'sets', estimatedCost: 750, supplier: 'LabTech Services', requestedBy: 'Science HOD', department: 'Science Lab', status: 'Approved', notes: 'For SHS2 practicals' },
  { id: '4', date: '2026-07-10', item: 'Cleaning supplies (bulk)', quantity: 1, unit: 'cartons', estimatedCost: 500, supplier: 'CleanCo Ltd', requestedBy: 'Cleaning Supervisor', department: 'Cleaning', status: 'Requisitioned', notes: 'Detergents, disinfectants, mops' },
  { id: '5', date: '2026-07-05', item: 'Diesel (for buses)', quantity: 200, unit: 'litres', estimatedCost: 1600, actualCost: 1580, supplier: 'Goil', requestedBy: 'Transport Officer', department: 'Transport', status: 'Delivered', dateDelivered: '2026-07-06', notes: '200L diesel for 3 buses' },
];

const INITIAL_FEEDING: FeedingRecord[] = [
  { id: '1', date: '2026-07-10', meal: 'Breakfast', headcount: 480, costPerHead: 5, totalCost: 2400, status: 'Served', notes: 'Porridge + bread' },
  { id: '2', date: '2026-07-10', meal: 'Lunch', headcount: 475, costPerHead: 12, totalCost: 5700, status: 'Served', notes: 'Jollof rice + chicken' },
  { id: '3', date: '2026-07-10', meal: 'Dinner', headcount: 470, costPerHead: 10, totalCost: 4700, status: 'Served', notes: 'Banku + tilapia' },
  { id: '4', date: '2026-07-09', meal: 'Breakfast', headcount: 482, costPerHead: 5, totalCost: 2410, status: 'Served', notes: 'Tea + eggs' },
  { id: '5', date: '2026-07-09', meal: 'Lunch', headcount: 478, costPerHead: 12, totalCost: 5736, status: 'Served', notes: 'Fufu + goat soup' },
  { id: '6', date: '2026-07-09', meal: 'Dinner', headcount: 472, costPerHead: 10, totalCost: 4720, status: 'Served', notes: 'Rice + stew' },
];

const INITIAL_BOARDING_SUPPLIES: BoardingSupply[] = [
  { id: '1', item: 'Mattresses (double)', quantity: 5, unit: 'units', unitCost: 450, totalCost: 2250, datePurchased: '2026-07-09', supplier: 'Bedding Ghana Ltd', house: 'House 1 (Boys)', notes: 'Replacement of worn-out mattresses' },
  { id: '2', item: 'Bed sheets (sets)', quantity: 20, unit: 'sets', unitCost: 80, totalCost: 1600, datePurchased: '2026-07-05', supplier: 'Textile House', house: 'House 3 (Girls)', notes: 'New intake supplies' },
  { id: '3', item: 'Buckets', quantity: 30, unit: 'pieces', unitCost: 25, totalCost: 750, datePurchased: '2026-07-03', supplier: 'Plastic World', house: 'House 2 (Boys)', notes: 'For new students' },
  { id: '4', item: 'Detergent (cartons)', quantity: 4, unit: 'cartons', unitCost: 120, totalCost: 480, datePurchased: '2026-07-07', supplier: 'CleanCo Ltd', house: 'House 4 (Girls)', notes: 'Monthly cleaning supplies' },
  { id: '5', item: 'Mosquito nets', quantity: 50, unit: 'pieces', unitCost: 35, totalCost: 1750, datePurchased: '2026-07-01', supplier: 'Health Supplies Ltd', house: 'All Houses', notes: 'Malaria prevention' },
];

const INITIAL_RETURNS: BursaryReturn[] = [
  { id: '1', period: 'Daily', dateFrom: '2026-07-10', dateTo: '2026-07-10', totalIncome: 600, totalExpense: 850, netBalance: -250, status: 'Submitted', submittedBy: 'Bursar', dateSubmitted: '2026-07-10', notes: 'Day 10 returns', lineItems: [
    { description: 'Fee payment — Kwame Asante', amount: 500, type: 'Income' },
    { description: 'Pocket money deposit — Ama Owusu', amount: 100, type: 'Income' },
    { description: 'Foodstuff purchase — Day 5', amount: 850, type: 'Expense' },
  ]},
  { id: '2', period: 'Daily', dateFrom: '2026-07-09', dateTo: '2026-07-09', totalIncome: 300, totalExpense: 1170, netBalance: -870, status: 'Approved', submittedBy: 'Bursar', dateSubmitted: '2026-07-09', approvedBy: 'Accountant', notes: 'Day 9 returns', lineItems: [
    { description: 'Fee payment — Yao Mensah', amount: 300, type: 'Income' },
    { description: 'Mattress replacement — House 1', amount: 450, type: 'Expense' },
    { description: 'Office supplies', amount: 120, type: 'Expense' },
    { description: 'Water bill — July', amount: 600, type: 'Expense' },
  ]},
  { id: '3', period: 'Weekly', dateFrom: '2026-07-04', dateTo: '2026-07-10', totalIncome: 900, totalExpense: 3170, netBalance: -2270, status: 'Draft', submittedBy: 'Bursar', dateSubmitted: '', notes: 'Week 2 summary — pending submission', lineItems: [
    { description: 'Total fees collected', amount: 800, type: 'Income' },
    { description: 'Pocket money deposits', amount: 100, type: 'Income' },
    { description: 'Feeding costs', amount: 1700, type: 'Expense' },
    { description: 'Boarding supplies', amount: 450, type: 'Expense' },
    { description: 'Utilities', amount: 600, type: 'Expense' },
    { description: 'Miscellaneous', amount: 420, type: 'Expense' },
  ]},
];

// ── Store ──

interface BursarState {
  cashTransactions: CashTransaction[];
  studentAccounts: StudentAccount[];
  pettyCash: PettyCashEntry[];
  imprest: ImprestAccount[];
  procurement: ProcurementRequest[];
  feeding: FeedingRecord[];
  boardingSupplies: BoardingSupply[];
  returns: BursaryReturn[];
  cashBalance: number;

  // Cash
  recordCashTransaction: (txn: Omit<CashTransaction, 'id' | 'receiptNo' | 'balanceAfter'>) => void;
  deleteCashTransaction: (id: string) => void;
  getCashBalance: () => number;
  getTotalIncome: () => number;
  getTotalExpense: () => number;

  // Student Accounts (Pocket Money)
  depositPocketMoney: (accountId: string, amount: number, description: string, authorizedBy: string) => void;
  withdrawPocketMoney: (accountId: string, amount: number, description: string, authorizedBy: string) => void;
  addStudentAccount: (acc: Omit<StudentAccount, 'id' | 'balance' | 'totalDeposited' | 'totalWithdrawn' | 'transactions'>) => void;
  deleteStudentAccount: (id: string) => void;

  // Petty Cash
  approvePettyCash: (id: string, approvedBy: string) => void;
  disbursePettyCash: (id: string) => void;
  rejectPettyCash: (id: string) => void;
  addPettyCashEntry: (entry: Omit<PettyCashEntry, 'id' | 'status'>) => void;
  deletePettyCash: (id: string) => void;

  // Imprest
  retireImprest: (id: string, retiredAmount: number, voucherNo: string) => void;
  addImprest: (imp: Omit<ImprestAccount, 'id' | 'status'>) => void;
  deleteImprest: (id: string) => void;

  // Procurement
  approveProcurement: (id: string) => void;
  orderProcurement: (id: string) => void;
  deliverProcurement: (id: string, actualCost: number) => void;
  rejectProcurement: (id: string) => void;
  addProcurement: (req: Omit<ProcurementRequest, 'id' | 'status'>) => void;
  deleteProcurement: (id: string) => void;

  // Feeding
  addFeedingRecord: (rec: Omit<FeedingRecord, 'id' | 'totalCost'>) => void;
  updateFeedingStatus: (id: string, status: FeedingStatus) => void;
  deleteFeedingRecord: (id: string) => void;
  getFeedingCostByMeal: () => { meal: string; total: number; count: number }[];

  // Boarding Supplies
  addBoardingSupply: (sup: Omit<BoardingSupply, 'id' | 'totalCost'>) => void;
  deleteBoardingSupply: (id: string) => void;
  getBoardingSupplyTotal: () => number;

  // Returns
  submitReturn: (id: string) => void;
  approveReturn: (id: string, approvedBy: string) => void;
  rejectReturn: (id: string) => void;
  generateReturn: (period: ReturnPeriod, dateFrom: string, dateTo: string) => void;
  deleteReturn: (id: string) => void;
}

export const useBursarStore = create<BursarState>((set, get) => ({
  cashTransactions: INITIAL_CASH_TXNS,
  studentAccounts: INITIAL_STUDENT_ACCOUNTS,
  pettyCash: INITIAL_PETTY_CASH,
  imprest: INITIAL_IMPREST,
  procurement: INITIAL_PROCUREMENT,
  feeding: INITIAL_FEEDING,
  boardingSupplies: INITIAL_BOARDING_SUPPLIES,
  returns: INITIAL_RETURNS,
  cashBalance: 12500,

  recordCashTransaction: (txn) => {
    const balance = get().cashBalance + (txn.type === 'Income' ? txn.amount : -txn.amount);
    const receipt: CashTransaction = { ...txn, id: nextId(), receiptNo: nextCashReceiptNo(), balanceAfter: balance };
    set((s) => ({ cashTransactions: [receipt, ...s.cashTransactions], cashBalance: balance }));
  },
  deleteCashTransaction: (id) => {
    set((s) => ({ cashTransactions: s.cashTransactions.filter((t) => t.id !== id) }));
  },
  getCashBalance: () => get().cashBalance,
  getTotalIncome: () => get().cashTransactions.filter((t) => t.type === 'Income').reduce((s, t) => s + t.amount, 0),
  getTotalExpense: () => get().cashTransactions.filter((t) => t.type === 'Expense').reduce((s, t) => s + t.amount, 0),

  depositPocketMoney: (accountId, amount, description, authorizedBy) => {
    set((s) => ({
      studentAccounts: s.studentAccounts.map((acc) => {
        if (acc.id !== accountId) return acc;
        const newBalance = acc.balance + amount;
        const txn: PocketMoneyTxn = { id: nextId(), date: todayISO(), type: 'Deposit', amount, description, balanceAfter: newBalance, authorizedBy };
        return { ...acc, balance: newBalance, totalDeposited: acc.totalDeposited + amount, transactions: [...acc.transactions, txn] };
      }),
    }));
  },
  withdrawPocketMoney: (accountId, amount, description, authorizedBy) => {
    const acc = get().studentAccounts.find((a) => a.id === accountId);
    if (!acc || acc.balance < amount) return;
    set((s) => ({
      studentAccounts: s.studentAccounts.map((a) => {
        if (a.id !== accountId) return a;
        const newBalance = a.balance - amount;
        const txn: PocketMoneyTxn = { id: nextId(), date: todayISO(), type: 'Withdrawal', amount, description, balanceAfter: newBalance, authorizedBy };
        return { ...a, balance: newBalance, totalWithdrawn: a.totalWithdrawn + amount, transactions: [...a.transactions, txn] };
      }),
    }));
  },
  addStudentAccount: (acc) => {
    set((s) => ({ studentAccounts: [...s.studentAccounts, { ...acc, id: nextId(), balance: 0, totalDeposited: 0, totalWithdrawn: 0, transactions: [] }] }));
  },
  deleteStudentAccount: (id) => {
    set((s) => ({ studentAccounts: s.studentAccounts.filter((a) => a.id !== id) }));
  },

  approvePettyCash: (id, approvedBy) => {
    set((s) => ({ pettyCash: s.pettyCash.map((p) => (p.id === id ? { ...p, status: 'Approved', approvedBy, dateApproved: todayISO() } : p)) }));
  },
  disbursePettyCash: (id) => {
    set((s) => ({ pettyCash: s.pettyCash.map((p) => (p.id === id ? { ...p, status: 'Disbursed' } : p)) }));
  },
  rejectPettyCash: (id) => {
    set((s) => ({ pettyCash: s.pettyCash.map((p) => (p.id === id ? { ...p, status: 'Rejected' } : p)) }));
  },
  addPettyCashEntry: (entry) => {
    set((s) => ({ pettyCash: [{ ...entry, id: nextId(), status: 'Requested' }, ...s.pettyCash] }));
  },
  deletePettyCash: (id) => {
    set((s) => ({ pettyCash: s.pettyCash.filter((p) => p.id !== id) }));
  },

  retireImprest: (id, retiredAmount, voucherNo) => {
    set((s) => ({ imprest: s.imprest.map((i) => (i.id === id ? { ...i, status: 'Retired', retiredAmount, dateRetired: todayISO(), retirementVoucherNo: voucherNo } : i)) }));
  },
  addImprest: (imp) => {
    set((s) => ({ imprest: [...s.imprest, { ...imp, id: nextId(), status: 'Active' }] }));
  },
  deleteImprest: (id) => {
    set((s) => ({ imprest: s.imprest.filter((i) => i.id !== id) }));
  },

  approveProcurement: (id) => {
    set((s) => ({ procurement: s.procurement.map((p) => (p.id === id ? { ...p, status: 'Approved' } : p)) }));
  },
  orderProcurement: (id) => {
    set((s) => ({ procurement: s.procurement.map((p) => (p.id === id ? { ...p, status: 'Ordered' } : p)) }));
  },
  deliverProcurement: (id, actualCost) => {
    set((s) => ({ procurement: s.procurement.map((p) => (p.id === id ? { ...p, status: 'Delivered', actualCost, dateDelivered: todayISO() } : p)) }));
  },
  rejectProcurement: (id) => {
    set((s) => ({ procurement: s.procurement.map((p) => (p.id === id ? { ...p, status: 'Rejected' } : p)) }));
  },
  addProcurement: (req) => {
    set((s) => ({ procurement: [{ ...req, id: nextId(), status: 'Requisitioned' }, ...s.procurement] }));
  },
  deleteProcurement: (id) => {
    set((s) => ({ procurement: s.procurement.filter((p) => p.id !== id) }));
  },

  addFeedingRecord: (rec) => {
    const totalCost = rec.headcount * rec.costPerHead;
    set((s) => ({ feeding: [{ ...rec, id: nextId(), totalCost }, ...s.feeding] }));
  },
  updateFeedingStatus: (id, status) => {
    set((s) => ({ feeding: s.feeding.map((f) => (f.id === id ? { ...f, status } : f)) }));
  },
  deleteFeedingRecord: (id) => {
    set((s) => ({ feeding: s.feeding.filter((f) => f.id !== id) }));
  },
  getFeedingCostByMeal: () => {
    return MEAL_TYPES.map((meal) => {
      const items = get().feeding.filter((f) => f.meal === meal);
      return { meal, total: items.reduce((s, f) => s + f.totalCost, 0), count: items.length };
    }).filter((m) => m.count > 0);
  },

  addBoardingSupply: (sup) => {
    const totalCost = sup.quantity * sup.unitCost;
    set((s) => ({ boardingSupplies: [{ ...sup, id: nextId(), totalCost }, ...s.boardingSupplies] }));
  },
  deleteBoardingSupply: (id) => {
    set((s) => ({ boardingSupplies: s.boardingSupplies.filter((b) => b.id !== id) }));
  },
  getBoardingSupplyTotal: () => get().boardingSupplies.reduce((s, b) => s + b.totalCost, 0),

  submitReturn: (id) => {
    set((s) => ({ returns: s.returns.map((r) => (r.id === id ? { ...r, status: 'Submitted', dateSubmitted: todayISO() } : r)) }));
  },
  approveReturn: (id, approvedBy) => {
    set((s) => ({ returns: s.returns.map((r) => (r.id === id ? { ...r, status: 'Approved', approvedBy } : r)) }));
  },
  rejectReturn: (id) => {
    set((s) => ({ returns: s.returns.map((r) => (r.id === id ? { ...r, status: 'Rejected' } : r)) }));
  },
  generateReturn: (period, dateFrom, dateTo) => {
    const txns = get().cashTransactions.filter((t) => t.date >= dateFrom && t.date <= dateTo);
    const totalIncome = txns.filter((t) => t.type === 'Income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = txns.filter((t) => t.type === 'Expense').reduce((s, t) => s + t.amount, 0);
    const lineItems = txns.map((t) => ({ description: t.description, amount: t.amount, type: t.type }));
    const newReturn: BursaryReturn = {
      id: nextId(), period, dateFrom, dateTo, totalIncome, totalExpense,
      netBalance: totalIncome - totalExpense, status: 'Draft', submittedBy: 'Bursar',
      dateSubmitted: '', notes: `${period} return generated from cash transactions`, lineItems,
    };
    set((s) => ({ returns: [newReturn, ...s.returns] }));
  },
  deleteReturn: (id) => {
    set((s) => ({ returns: s.returns.filter((r) => r.id !== id) }));
  },
}));
