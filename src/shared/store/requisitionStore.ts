import { create } from 'zustand';

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

const INITIAL_REQUISITIONS: Requisition[] = [
  { id: '1', date: '2026-07-06', itemName: 'Cooking oil', quantity: 5, unit: 'gallons', department: 'Kitchen', status: 'Issued', requestedBy: 'Catering Officer', priority: 'Normal', notes: '', approvals: [{ step: 'stores', approver: 'Stores Officer', date: '2026-07-06', action: 'issued' }] },
  { id: '2', date: '2026-07-05', itemName: 'Cleaning detergent', quantity: 2, unit: 'cartons', department: 'Cleaning', status: 'Issued', requestedBy: 'Cleaning Supervisor', priority: 'Normal', notes: '', approvals: [{ step: 'stores', approver: 'Stores Officer', date: '2026-07-05', action: 'issued' }] },
  { id: '3', date: '2026-07-04', itemName: 'Chalk', quantity: 5, unit: 'boxes', department: 'Academic', status: 'Pending', requestedBy: 'Academic Office', priority: 'Normal', notes: 'For mid-sem exams', approvals: [] },
  { id: '4', date: '2026-07-03', itemName: 'First aid supplies', quantity: 10, unit: 'units', department: 'Health Centre', status: 'Pending', requestedBy: 'Nurse Adjei', priority: 'Urgent', notes: 'Running low on bandages', approvals: [] },
  { id: '5', date: '2026-07-02', itemName: 'Diesel', quantity: 50, unit: 'litres', department: 'Transport', status: 'Issued', requestedBy: 'Transport Officer', priority: 'Normal', notes: '', approvals: [{ step: 'stores', approver: 'Stores Officer', date: '2026-07-02', action: 'issued' }] },
  { id: '6', date: '2026-07-07', itemName: 'Bedsheets', quantity: 20, unit: 'units', department: 'Boarding', status: 'Pending', requestedBy: 'Mr. Owusu', priority: 'Urgent', notes: 'For Aggrey House — damaged sheets', house: 'Aggrey', approvals: [] },
  { id: '7', date: '2026-07-06', itemName: 'Dettol soap', quantity: 10, unit: 'cartons', department: 'Boarding', status: 'Senior Housemaster Approved', requestedBy: 'Mr. Tetteh', priority: 'Normal', notes: 'For Danquah House', house: 'Danquah', approvals: [{ step: 'senior_housemaster', approver: 'Senior Housemaster', date: '2026-07-06', action: 'approved' }] },
];

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
}));
