import { create } from 'zustand';
import { apiClient } from '@shared/api/apiClient';

// ── Types ──

export type ApprovalCategory = 'Budget Revision' | 'Procurement' | 'Discipline Escalation' | 'Policy Change' | 'Other';
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';
export type DisciplineSeverity = 'minor' | 'serious' | 'critical';
export type DisciplineStatus = 'Open' | 'Escalated' | 'Resolved';
export type BroadcastAudience = 'All Staff' | 'Teaching Staff' | 'Non-Teaching Staff' | 'All Students' | 'Parents' | 'Everyone';
export type BroadcastPriority = 'Normal' | 'Important' | 'Urgent';

export interface HeadmasterApproval {
  id: string;
  category: ApprovalCategory;
  requester: string;
  department: string;
  date: string;
  details: string;
  status: ApprovalStatus;
  reviewedBy?: string;
  reviewDate?: string;
  reviewNotes?: string;
}

export interface DisciplineCase {
  id: string;
  student: string;
  house: string;
  incident: string;
  date: string;
  severity: DisciplineSeverity;
  status: DisciplineStatus;
  reportedBy: string;
  resolutionNotes?: string;
  resolvedDate?: string;
}

export interface Broadcast {
  id: string;
  title: string;
  body: string;
  audience: BroadcastAudience;
  priority: BroadcastPriority;
  date: string;
  postedBy: string;
}

// ── Initial Data ──

const INITIAL_APPROVALS: HeadmasterApproval[] = [];

const INITIAL_DISCIPLINE: DisciplineCase[] = [];

const INITIAL_BROADCASTS: Broadcast[] = [];

// ── Helpers ──

let idCounter = 100;
const nextId = () => String(++idCounter);
const todayISO = () => new Date().toISOString().slice(0, 10);

// ── Store ──

export interface HeadmasterState {
  approvals: HeadmasterApproval[];
  disciplineCases: DisciplineCase[];
  broadcasts: Broadcast[];

  addApproval: (item: Omit<HeadmasterApproval, 'id' | 'date' | 'status'>) => void;
  reviewApproval: (id: string, status: ApprovalStatus, reviewedBy: string, notes?: string) => void;
  deleteApproval: (id: string) => void;
  getPendingApprovals: () => HeadmasterApproval[];

  addDisciplineCase: (item: Omit<DisciplineCase, 'id' | 'status'>) => void;
  escalateDisciplineCase: (id: string) => void;
  resolveDisciplineCase: (id: string, notes: string) => void;
  deleteDisciplineCase: (id: string) => void;

  addBroadcast: (item: Omit<Broadcast, 'id' | 'date'>) => void;
  deleteBroadcast: (id: string) => void;

  // Backend load methods
  loadApprovals: () => Promise<void>;
  loadDisciplineCases: () => Promise<void>;
  loadBroadcasts: () => Promise<void>;
  loadAll: () => Promise<void>;
}

export const useHeadmasterStore = create<HeadmasterState>((set, get) => ({
  approvals: INITIAL_APPROVALS,
  disciplineCases: INITIAL_DISCIPLINE,
  broadcasts: INITIAL_BROADCASTS,

  addApproval: (item) => {
    set((s) => ({ approvals: [{ ...item, id: nextId(), date: todayISO(), status: 'Pending' }, ...s.approvals] }));
  },
  reviewApproval: (id, status, reviewedBy, notes) => {
    set((s) => ({
      approvals: s.approvals.map((a) =>
        a.id === id ? { ...a, status, reviewedBy, reviewDate: todayISO(), reviewNotes: notes } : a
      ),
    }));
  },
  deleteApproval: (id) => {
    set((s) => ({ approvals: s.approvals.filter((a) => a.id !== id) }));
  },
  getPendingApprovals: () => get().approvals.filter((a) => a.status === 'Pending'),

  addDisciplineCase: (item) => {
    set((s) => ({ disciplineCases: [{ ...item, id: nextId(), status: 'Open' }, ...s.disciplineCases] }));
  },
  escalateDisciplineCase: (id) => {
    set((s) => ({ disciplineCases: s.disciplineCases.map((d) => (d.id === id ? { ...d, status: 'Escalated' } : d)) }));
  },
  resolveDisciplineCase: (id, notes) => {
    set((s) => ({
      disciplineCases: s.disciplineCases.map((d) =>
        d.id === id ? { ...d, status: 'Resolved', resolutionNotes: notes, resolvedDate: todayISO() } : d
      ),
    }));
  },
  deleteDisciplineCase: (id) => {
    set((s) => ({ disciplineCases: s.disciplineCases.filter((d) => d.id !== id) }));
  },

  addBroadcast: (item) => {
    set((s) => ({ broadcasts: [{ ...item, id: nextId(), date: todayISO() }, ...s.broadcasts] }));
  },
  deleteBroadcast: (id) => {
    set((s) => ({ broadcasts: s.broadcasts.filter((b) => b.id !== id) }));
  },

  loadApprovals: async () => {
    try {
      const data = await apiClient.get<any[]>('/headmaster/approvals');
      set({ approvals: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadDisciplineCases: async () => {
    try {
      const data = await apiClient.get<any[]>('/headmaster/discipline-cases');
      set({ disciplineCases: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadBroadcasts: async () => {
    try {
      const data = await apiClient.get<any[]>('/headmaster/broadcasts');
      set({ broadcasts: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadAll: async () => {
    await Promise.all([
      get().loadApprovals(),
      get().loadBroadcasts(),
      get().loadDisciplineCases(),
    ]);
  },

}));
