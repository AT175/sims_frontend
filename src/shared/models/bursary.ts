import { SyncEnvelope, Term } from '@shared/types';

// --- Bursary/Finance entities (Section 7.2) ---

export interface StudentFeeLedger extends SyncEnvelope {
  studentId: string;
  term: Term;
  academicYear: string;
  totalDue: number;
  amountPaid: number;
  balance: number;
}

export type PaymentMethod = 'cash' | 'mobile_money' | 'bank' | 'capitation_grant';

export interface FeePayment extends SyncEnvelope {
  studentId: string;
  ledgerId: string;
  amount: number;
  method: PaymentMethod;
  reference: string | null;
  recordedByStaffId: string;
  paidAt: string;
}

export type PayrollStatus = 'pending' | 'processed' | 'paid';

export interface PayrollRecord extends SyncEnvelope {
  staffId: string;
  month: string;
  grossPay: number;
  deductions: number;
  netPay: number;
  status: PayrollStatus;
}

export interface ExpenditureEntry extends SyncEnvelope {
  category: string;
  description: string;
  amount: number;
  linkedRequisitionId: string | null;
  approvedByStaffId: string;
  spentAt: string;
}

export type BudgetApprovalStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface BudgetLine extends SyncEnvelope {
  term: Term | 'Annual';
  academicYear: string;
  department: string;
  allocatedAmount: number;
  spentAmount: number;
  approvalStatus: BudgetApprovalStatus;
}
