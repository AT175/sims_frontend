import { create } from 'zustand';
import { apiClient } from '@shared/api/apiClient';

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

const INITIAL_CASH_TXNS: CashTransaction[] = [];

const INITIAL_STUDENT_ACCOUNTS: StudentAccount[] = [];

const INITIAL_PETTY_CASH: PettyCashEntry[] = [];

const INITIAL_IMPREST: ImprestAccount[] = [];

const INITIAL_PROCUREMENT: ProcurementRequest[] = [];

const INITIAL_FEEDING: FeedingRecord[] = [];

const INITIAL_BOARDING_SUPPLIES: BoardingSupply[] = [];

const INITIAL_RETURNS: BursaryReturn[] = [];

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

  // Backend load methods
  loadProcurement: () => Promise<void>;
  loadPettyCash: () => Promise<void>;
  loadCashTransactions: () => Promise<void>;
  loadStudentAccounts: () => Promise<void>;
  loadImprest: () => Promise<void>;
  loadFeeding: () => Promise<void>;
  loadBoardingSupplies: () => Promise<void>;
  loadReturns: () => Promise<void>;
  loadAll: () => Promise<void>;
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
  cashBalance: 0,

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

  loadProcurement: async () => {
    try {
      const data = await apiClient.get<any[]>('/bursar/procurement');
      set({ procurement: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadPettyCash: async () => {
    try {
      const data = await apiClient.get<any[]>('/bursar/petty-cash');
      set({ pettyCash: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadCashTransactions: async () => {
    try {
      const data = await apiClient.get<any[]>('/bursar/cash-transactions');
      set({ cashTransactions: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadStudentAccounts: async () => {
    try {
      const data = await apiClient.get<any[]>('/bursar/student-accounts');
      set({ studentAccounts: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadImprest: async () => {
    try {
      const data = await apiClient.get<any[]>('/bursar/imprest');
      set({ imprest: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadFeeding: async () => {
    try {
      const data = await apiClient.get<any[]>('/bursar/feeding');
      set({ feeding: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadBoardingSupplies: async () => {
    try {
      const data = await apiClient.get<any[]>('/bursar/boarding-supplies');
      set({ boardingSupplies: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadReturns: async () => {
    try {
      const data = await apiClient.get<any[]>('/bursar/returns');
      set({ returns: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadAll: async () => {
    await Promise.all([
      get().loadProcurement(),
      get().loadPettyCash(),
      get().loadCashTransactions(),
      get().loadStudentAccounts(),
      get().loadImprest(),
      get().loadFeeding(),
      get().loadBoardingSupplies(),
      get().loadReturns(),
    ]);
  },
}));
