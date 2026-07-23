import { apiClient } from './apiClient';

export interface FeeRecordDto {
  id: string;
  studentName: string;
  admNo: string;
  class: string | null;
  term: string;
  feeType: string;
  amountDue: number;
  amountPaid: number;
  balance: number;
  status: string;
  guardianName: string | null;
  guardianPhone: string | null;
  lastPaymentDate: string | null;
  lastPaymentMethod: string | null;
}

export interface PaymentReceiptDto {
  id: string;
  feeRecordId: string;
  studentName: string;
  admNo: string;
  amount: number;
  method: string;
  date: string;
  receivedBy: string;
  receiptNo: string;
  term: string;
  notes: string;
}

export interface FeeSummaryDto {
  totalBilled: number;
  totalCollected: number;
  totalOutstanding: number;
  recordCount: number;
}

export const bursaryApi = {
  async getFeeRecords(): Promise<FeeRecordDto[]> {
    return apiClient.get<FeeRecordDto[]>('/bursary/fees');
  },

  async createFeeRecord(data: {
    studentName: string;
    admNo: string;
    class?: string;
    term: string;
    feeType: string;
    amountDue: number;
    guardianName?: string;
    guardianPhone?: string;
  }): Promise<FeeRecordDto> {
    return apiClient.post<FeeRecordDto>('/bursary/fees', data as any);
  },

  async recordPayment(data: {
    feeRecordId: string;
    amount: number;
    method: string;
    receivedBy: string;
    term: string;
    notes?: string;
  }): Promise<PaymentReceiptDto> {
    return apiClient.post<PaymentReceiptDto>('/bursary/payments', data as any);
  },

  async getReceipts(): Promise<PaymentReceiptDto[]> {
    return apiClient.get<PaymentReceiptDto[]>('/bursary/receipts');
  },

  async getSummary(): Promise<FeeSummaryDto> {
    return apiClient.get<FeeSummaryDto>('/bursary/summary');
  },
};
