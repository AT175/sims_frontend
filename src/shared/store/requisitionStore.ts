import { create } from 'zustand';
import { apiClient } from '@shared/api/apiClient';

// ── Types ──

export type RequisitionStatus =
  | 'Pending'
  | 'Senior Housemaster Approved'
  | 'Domestic Approved'
  | 'Issued'
  | 'Received'
  | 'Rejected';

export type ApprovalStep = 'senior_housemaster' | 'domestic' | 'stores' | 'house';

export interface ApprovalRecord {
  step: ApprovalStep;
  approver: string;
  date: string;
  action: 'approved' | 'rejected' | 'issued' | 'received';
  note?: string;
}

export interface Requisition {
  id: string;
  date: string;
  itemName: string;
  quantity: number;
  unit: string;
  department: string;
  status: RequisitionStatus;
  requestedBy: string;
  priority: 'Low' | 'Normal' | 'Urgent';
  notes: string;
  house?: string;
  approvals: ApprovalRecord[];
}

// ── Constants ──

export const REQUISITION_STATUSES: RequisitionStatus[] = [
  'Pending',
  'Senior Housemaster Approved',
  'Domestic Approved',
  'Issued',
  'Received',
  'Rejected',
];

const DEPARTMENT_MAP: Record<string, string> = {
  catering: 'Kitchen',
  cleaning: 'Cleaning',
  health: 'Health Centre',
  transport: 'Transport',
  academic: 'Academic',
  boarding: 'Boarding',
  sports: 'Sports',
  admin: 'Administration',
  maintenance: 'Maintenance',
  stores: 'Stores',
};

export const getDepartmentName = (role: string) => DEPARTMENT_MAP[role] || 'Administration';

let idCounter = 100;
const nextId = () => String(++idCounter);
const todayISO = () => new Date().toISOString().slice(0, 10);

const INITIAL_REQUISITIONS: Requisition[] = [];

// ── Store ──

interface RequisitionState {
  requisitions: Requisition[];
  submitRequisition: (req: Omit<Requisition, 'id' | 'date' | 'status' | 'approvals'>) => void;
  approveBySeniorHousemaster: (id: string, approver: string, note?: string) => void;
  approveByDomestic: (id: string, approver: string, note?: string) => void;
  issueByStores: (id: string, approver: string, note?: string) => void;
  receiveByHouse: (id: string, approver: string, note?: string) => void;
  rejectRequisition: (id: string, step: ApprovalStep, approver: string, note?: string) => void;
  updateStatus: (id: string, status: RequisitionStatus) => void;
  deleteRequisition: (id: string) => void;
  getByDepartment: (dept: string) => Requisition[];
  getByHouse: (house: string) => Requisition[];
  getPending: () => Requisition[];
  getPendingSeniorHousemaster: () => Requisition[];
  getPendingDomestic: () => Requisition[];
  getPendingStores: () => Requisition[];
  getPendingHouse: (house: string) => Requisition[];

  // Backend load methods
  loadRequisitions: () => Promise<void>;
  loadAll: () => Promise<void>;
}

export const useRequisitionStore = create<RequisitionState>((set, get) => ({
  requisitions: INITIAL_REQUISITIONS,

  submitRequisition: (req) => {
    const newReq: Requisition = {
      ...req,
      id: nextId(),
      date: todayISO(),
      status: 'Pending',
      approvals: [],
    };
    set((state) => ({ requisitions: [newReq, ...state.requisitions] }));
  },

  approveBySeniorHousemaster: (id, approver, note) => {
    set((state) => ({
      requisitions: state.requisitions.map((r) =>
        r.id === id && r.status === 'Pending'
          ? {
              ...r,
              status: 'Senior Housemaster Approved',
              approvals: [...r.approvals, { step: 'senior_housemaster', approver, date: todayISO(), action: 'approved', note }],
            }
          : r
      ),
    }));
  },

  approveByDomestic: (id, approver, note) => {
    set((state) => ({
      requisitions: state.requisitions.map((r) =>
        r.id === id && r.status === 'Senior Housemaster Approved'
          ? {
              ...r,
              status: 'Domestic Approved',
              approvals: [...r.approvals, { step: 'domestic', approver, date: todayISO(), action: 'approved', note }],
            }
          : r
      ),
    }));
  },

  issueByStores: (id, approver, note) => {
    set((state) => ({
      requisitions: state.requisitions.map((r) =>
        r.id === id && r.status === 'Domestic Approved'
          ? {
              ...r,
              status: 'Issued',
              approvals: [...r.approvals, { step: 'stores', approver, date: todayISO(), action: 'issued', note }],
            }
          : r
      ),
    }));
  },

  receiveByHouse: (id, approver, note) => {
    set((state) => ({
      requisitions: state.requisitions.map((r) =>
        r.id === id && r.status === 'Issued'
          ? {
              ...r,
              status: 'Received',
              approvals: [...r.approvals, { step: 'house', approver, date: todayISO(), action: 'received', note }],
            }
          : r
      ),
    }));
  },

  rejectRequisition: (id, step, approver, note) => {
    set((state) => ({
      requisitions: state.requisitions.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'Rejected',
              approvals: [...r.approvals, { step, approver, date: todayISO(), action: 'rejected', note }],
            }
          : r
      ),
    }));
  },

  updateStatus: (id, status) => {
    set((state) => ({
      requisitions: state.requisitions.map((r) =>
        r.id === id ? { ...r, status } : r
      ),
    }));
  },

  deleteRequisition: (id) => {
    set((state) => ({
      requisitions: state.requisitions.filter((r) => r.id !== id),
    }));
  },

  getByDepartment: (dept) => {
    return get().requisitions.filter((r) => r.department === dept);
  },

  getByHouse: (house) => {
    return get().requisitions.filter((r) => r.house === house);
  },

  getPending: () => {
    return get().requisitions.filter((r) => r.status === 'Pending');
  },

  getPendingSeniorHousemaster: () => {
    return get().requisitions.filter((r) => r.status === 'Pending' && r.department === 'Boarding');
  },

  getPendingDomestic: () => {
    return get().requisitions.filter((r) => r.status === 'Senior Housemaster Approved');
  },

  getPendingStores: () => {
    return get().requisitions.filter((r) => r.status === 'Domestic Approved');
  },

  getPendingHouse: (house) => {
    return get().requisitions.filter((r) => r.status === 'Issued' && r.house === house);
  },

  loadRequisitions: async () => {
    try {
      const data = await apiClient.get<any[]>('/requisitions');
      set({ requisitions: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadAll: async () => {
    await Promise.all([
      get().loadRequisitions(),
    ]);
  },

}));
