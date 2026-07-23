import { create } from 'zustand';

// ── Types ──

export type ExeatStatus = 'Pending' | 'Approved' | 'Rejected' | 'Checked Out' | 'Checked In' | 'Expired';

export type ExeatReason = 'Medical' | 'Family Emergency' | 'Personal' | 'Funeral' | 'Appointment' | 'Other';

export interface Exeat {
  id: string;
  exeatNo: string;
  date: string;
  studentName: string;
  admissionNo: string;
  house: string;
  class: string;
  reason: ExeatReason;
  reasonDetail: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  guardianName: string;
  guardianPhone: string;
  transportMode: string;
  status: ExeatStatus;
  issuedBy: string;
  approvedBy: string;
  approvedDate: string;
  checkedOutAt: string;
  checkedOutBy: string;
  checkedInAt: string;
  checkedInBy: string;
}

// ── Constants ──

export const EXEAT_STATUSES: ExeatStatus[] = [
  'Pending',
  'Approved',
  'Rejected',
  'Checked Out',
  'Checked In',
  'Expired',
];

export const EXEAT_REASONS: ExeatReason[] = [
  'Medical',
  'Family Emergency',
  'Personal',
  'Funeral',
  'Appointment',
  'Other',
];

export const TRANSPORT_MODES = ['School Bus', 'Private Car', 'Taxi', 'Public Transport', 'Walking'];

let idCounter = 0;
const nextId = () => `exeat-${++idCounter}`;
const nextExeatNo = () => {
  const yr = new Date().getFullYear();
  return `EX/${yr}/${String(++idCounter).padStart(4, '0')}`;
};
const todayISO = () => new Date().toISOString().slice(0, 10);
const nowISO = () => new Date().toISOString();

const INITIAL_EXEATS: Exeat[] = [
  {
    id: 'exeat-1', exeatNo: 'EX/2026/0001', date: '2026-07-07',
    studentName: 'Kwame Asante', admissionNo: '2026/001', house: 'Aggrey', class: 'SHS2 Sci A',
    reason: 'Medical', reasonDetail: 'Hospital appointment for eye checkup',
    destination: 'Korle-Bu Teaching Hospital', departureDate: '2026-07-08', returnDate: '2026-07-09',
    guardianName: 'Mr. K. Asante Sr.', guardianPhone: '024-111-2222', transportMode: 'Private Car',
    status: 'Approved', issuedBy: 'Mr. Owusu', approvedBy: 'Senior Housemaster', approvedDate: '2026-07-07',
    checkedOutAt: '', checkedOutBy: '', checkedInAt: '', checkedInBy: '',
  },
  {
    id: 'exeat-2', exeatNo: 'EX/2026/0002', date: '2026-07-07',
    studentName: 'Ama Mensah', admissionNo: '2026/045', house: 'Mensah', class: 'SHS1 Arts B',
    reason: 'Family Emergency', reasonDetail: 'Father hospitalised',
    destination: 'Home — Kumasi', departureDate: '2026-07-07', returnDate: '2026-07-10',
    guardianName: 'Mrs. Mensah', guardianPhone: '020-333-4444', transportMode: 'Private Car',
    status: 'Pending', issuedBy: 'Mrs. Adjei', approvedBy: '', approvedDate: '',
    checkedOutAt: '', checkedOutBy: '', checkedInAt: '', checkedInBy: '',
  },
  {
    id: 'exeat-3', exeatNo: 'EX/2026/0003', date: '2026-07-06',
    studentName: 'Yaw Tetteh', admissionNo: '2026/078', house: 'Danquah', class: 'SHS3 Bus A',
    reason: 'Funeral', reasonDetail: 'Grandmother\'s funeral',
    destination: 'Home — Cape Coast', departureDate: '2026-07-06', returnDate: '2026-07-08',
    guardianName: 'Mr. Tetteh Sr.', guardianPhone: '027-555-6666', transportMode: 'Taxi',
    status: 'Checked Out', issuedBy: 'Mr. Tetteh', approvedBy: 'Senior Housemaster', approvedDate: '2026-07-06',
    checkedOutAt: '2026-07-06T08:30:00.000Z', checkedOutBy: 'Sgt. Boateng',
    checkedInAt: '', checkedInBy: '',
  },
];

// ── Store ──

interface ExeatState {
  exeats: Exeat[];
  createExeat: (exeat: Omit<Exeat, 'id' | 'exeatNo' | 'date' | 'status' | 'approvedBy' | 'approvedDate' | 'checkedOutAt' | 'checkedOutBy' | 'checkedInAt' | 'checkedInBy'>) => string;
  approveExeat: (id: string, approvedBy: string) => void;
  rejectExeat: (id: string, approvedBy: string) => void;
  checkOut: (id: string, checkedOutBy: string) => void;
  checkIn: (id: string, checkedInBy: string) => void;
  expireOverdue: () => void;
  deleteExeat: (id: string) => void;
  getByHouse: (house: string) => Exeat[];
  getPending: () => Exeat[];
  getApproved: () => Exeat[];
  getActiveAtGate: () => Exeat[];
  getById: (id: string) => Exeat | undefined;
}

export const useExeatStore = create<ExeatState>((set, get) => ({
  exeats: INITIAL_EXEATS,

  createExeat: (exeat) => {
    const id = nextId();
    const newExeat: Exeat = {
      ...exeat,
      id,
      exeatNo: nextExeatNo(),
      date: todayISO(),
      status: 'Pending',
      approvedBy: '',
      approvedDate: '',
      checkedOutAt: '',
      checkedOutBy: '',
      checkedInAt: '',
      checkedInBy: '',
    };
    set((state) => ({ exeats: [newExeat, ...state.exeats] }));
    return id;
  },

  approveExeat: (id, approvedBy) => {
    set((state) => ({
      exeats: state.exeats.map((e) =>
        e.id === id && e.status === 'Pending'
          ? { ...e, status: 'Approved', approvedBy, approvedDate: todayISO() }
          : e
      ),
    }));
  },

  rejectExeat: (id, approvedBy) => {
    set((state) => ({
      exeats: state.exeats.map((e) =>
        e.id === id && (e.status === 'Pending' || e.status === 'Approved')
          ? { ...e, status: 'Rejected', approvedBy, approvedDate: todayISO() }
          : e
      ),
    }));
  },

  checkOut: (id, checkedOutBy) => {
    set((state) => ({
      exeats: state.exeats.map((e) =>
        e.id === id && e.status === 'Approved'
          ? { ...e, status: 'Checked Out', checkedOutAt: nowISO(), checkedOutBy }
          : e
      ),
    }));
  },

  checkIn: (id, checkedInBy) => {
    set((state) => ({
      exeats: state.exeats.map((e) =>
        e.id === id && e.status === 'Checked Out'
          ? { ...e, status: 'Checked In', checkedInAt: nowISO(), checkedInBy }
          : e
      ),
    }));
  },

  expireOverdue: () => {
    const today = todayISO();
    set((state) => ({
      exeats: state.exeats.map((e) =>
        e.status === 'Approved' && e.returnDate < today
          ? { ...e, status: 'Expired' }
          : e
      ),
    }));
  },

  deleteExeat: (id) => {
    set((state) => ({ exeats: state.exeats.filter((e) => e.id !== id) }));
  },

  getByHouse: (house) => get().exeats.filter((e) => e.house === house),

  getPending: () => get().exeats.filter((e) => e.status === 'Pending'),

  getApproved: () => get().exeats.filter((e) => e.status === 'Approved'),

  getActiveAtGate: () => get().exeats.filter((e) => e.status === 'Approved' || e.status === 'Checked Out'),

  getById: (id) => get().exeats.find((e) => e.id === id),
}));
