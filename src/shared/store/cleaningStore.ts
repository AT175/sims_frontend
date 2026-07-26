import { create } from 'zustand';
import { apiClient } from '@shared/api/apiClient';

// ── Types ──

export interface CleaningTask {
  id: string;
  task: string;
  area: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  assignedTo: string;
  done: boolean;
  date: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface MaintenanceIssue {
  id: string;
  date: string;
  location: string;
  issue: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Reported' | 'Repair Scheduled' | 'Fixed';
  reportedBy: string;
  notes: string;
}

export interface InspectionReport {
  id: string;
  date: string;
  area: string;
  inspector: string;
  result: 'Passed' | 'Needs Attention' | 'Failed';
  score: number;
  notes: string;
}

export interface CleaningStaff {
  id: string;
  name: string;
  role: string;
  area: string;
  phone: string;
  status: 'Present' | 'Absent' | 'On Leave';
  todayCheckedIn: boolean;
}

export interface CleaningSupply {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
  category: string;
}

export interface DutyRosterEntry {
  id: string;
  area: string;
  assignedTo: string;
  frequency: string;
  time: string;
  status: 'Pending' | 'In Progress' | 'Completed';
}

// ── Helpers ──

let idCounter = 200;
const nextId = () => String(++idCounter);
const todayISO = () => new Date().toISOString().slice(0, 10);

// ── Initial Data ──

const AREAS = ['Assembly Hall', 'Dining Hall', 'Dormitory A', 'Dormitory B', 'Admin Block', 'Grounds', 'Toilets Block A', 'Toilets Block B', 'Library', 'Laboratory'];

const INITIAL_TASKS: CleaningTask[] = [];

const INITIAL_ISSUES: MaintenanceIssue[] = [];

const INITIAL_INSPECTIONS: InspectionReport[] = [];

const INITIAL_STAFF: CleaningStaff[] = [];

const INITIAL_SUPPLIES: CleaningSupply[] = [];

const INITIAL_ROSTER: DutyRosterEntry[] = [];

// ── Store ──

interface CleaningState {
  tasks: CleaningTask[];
  issues: MaintenanceIssue[];
  inspections: InspectionReport[];
  staff: CleaningStaff[];
  supplies: CleaningSupply[];
  roster: DutyRosterEntry[];

  // Tasks
  addTask: (task: Omit<CleaningTask, 'id' | 'date' | 'done'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  getTasksByArea: (area: string) => CleaningTask[];
  getTodayTasks: () => CleaningTask[];

  // Issues
  addIssue: (issue: Omit<MaintenanceIssue, 'id' | 'date' | 'status'>) => void;
  updateIssueStatus: (id: string, status: MaintenanceIssue['status']) => void;
  deleteIssue: (id: string) => void;

  // Inspections
  addInspection: (inspection: Omit<InspectionReport, 'id'>) => void;
  deleteInspection: (id: string) => void;
  getComplianceScore: () => number;

  // Staff
  toggleCheckIn: (id: string) => void;
  updateStaffStatus: (id: string, status: CleaningStaff['status']) => void;
  getPresentStaff: () => CleaningStaff[];

  // Supplies
  addSupply: (supply: Omit<CleaningSupply, 'id'>) => void;
  updateSupply: (id: string, supply: Omit<CleaningSupply, 'id'>) => void;
  deleteSupply: (id: string) => void;
  restockSupply: (id: string, qty: number) => void;
  getLowStockSupplies: () => CleaningSupply[];

  // Roster
  updateRosterStatus: (id: string, status: DutyRosterEntry['status']) => void;
  addRosterEntry: (entry: Omit<DutyRosterEntry, 'id' | 'status'>) => void;
  deleteRosterEntry: (id: string) => void;

  // API
  loadTasks: () => Promise<void>;
  loadIssues: () => Promise<void>;
  loadAll: () => Promise<void>;
}

export const useCleaningStore = create<CleaningState>((set, get) => ({
  tasks: INITIAL_TASKS,
  issues: INITIAL_ISSUES,
  inspections: INITIAL_INSPECTIONS,
  staff: INITIAL_STAFF,
  supplies: INITIAL_SUPPLIES,
  roster: INITIAL_ROSTER,

  // ── Tasks ──
  addTask: async (task) => {
    try {
      const created = await apiClient.post<any>('/cleaning/tasks', task);
      set((state) => ({ tasks: [{ ...task, id: created.id || nextId(), date: todayISO(), done: false }, ...state.tasks] }));
    } catch {
      set((state) => ({ tasks: [{ ...task, id: nextId(), date: todayISO(), done: false }, ...state.tasks] }));
    }
  },

  toggleTask: (id) => {
    set((state) => ({ tasks: state.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }));
  },

  deleteTask: (id) => {
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
  },

  getTasksByArea: (area) => {
    return get().tasks.filter((t) => t.area === area);
  },

  getTodayTasks: () => {
    const today = todayISO();
    return get().tasks.filter((t) => t.date === today);
  },

  // ── Issues ──
  addIssue: async (issue) => {
    try {
      const created = await apiClient.post<any>('/cleaning/issues', issue);
      set((state) => ({
        issues: [{ ...issue, id: created.id || nextId(), date: todayISO(), status: 'Reported' }, ...state.issues],
      }));
    } catch {
      set((state) => ({
        issues: [{ ...issue, id: nextId(), date: todayISO(), status: 'Reported' }, ...state.issues],
      }));
    }
  },

  updateIssueStatus: (id, status) => {
    set((state) => ({ issues: state.issues.map((i) => (i.id === id ? { ...i, status } : i)) }));
  },

  deleteIssue: (id) => {
    set((state) => ({ issues: state.issues.filter((i) => i.id !== id) }));
  },

  // ── Inspections ──
  addInspection: (inspection) => {
    set((state) => ({ inspections: [{ ...inspection, id: nextId() }, ...state.inspections] }));
  },

  deleteInspection: (id) => {
    set((state) => ({ inspections: state.inspections.filter((i) => i.id !== id) }));
  },

  getComplianceScore: () => {
    const insp = get().inspections;
    if (insp.length === 0) return 0;
    return Math.round(insp.reduce((s, i) => s + i.score, 0) / insp.length);
  },

  // ── Staff ──
  toggleCheckIn: (id) => {
    set((state) => ({
      staff: state.staff.map((s) => (s.id === id ? { ...s, todayCheckedIn: !s.todayCheckedIn } : s)),
    }));
  },

  updateStaffStatus: (id, status) => {
    set((state) => ({ staff: state.staff.map((s) => (s.id === id ? { ...s, status } : s)) }));
  },

  getPresentStaff: () => {
    return get().staff.filter((s) => s.status === 'Present');
  },

  // ── Supplies ──
  addSupply: (supply) => {
    set((state) => ({ supplies: [...state.supplies, { ...supply, id: nextId() }] }));
  },

  updateSupply: (id, supply) => {
    set((state) => ({ supplies: state.supplies.map((s) => (s.id === id ? { ...supply, id } : s)) }));
  },

  deleteSupply: (id) => {
    set((state) => ({ supplies: state.supplies.filter((s) => s.id !== id) }));
  },

  restockSupply: (id, qty) => {
    set((state) => ({
      supplies: state.supplies.map((s) => (s.id === id ? { ...s, quantity: s.quantity + qty } : s)),
    }));
  },

  getLowStockSupplies: () => {
    return get().supplies.filter((s) => s.quantity <= s.reorderLevel);
  },

  // ── Roster ──
  updateRosterStatus: (id, status) => {
    set((state) => ({ roster: state.roster.map((r) => (r.id === id ? { ...r, status } : r)) }));
  },

  addRosterEntry: (entry) => {
    set((state) => ({ roster: [...state.roster, { ...entry, id: nextId(), status: 'Pending' }] }));
  },

  deleteRosterEntry: (id) => {
    set((state) => ({ roster: state.roster.filter((r) => r.id !== id) }));
  },

  loadTasks: async () => {
    try {
      const data = await apiClient.get<any[]>('/cleaning/tasks');
      set({ tasks: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadIssues: async () => {
    try {
      const data = await apiClient.get<any[]>('/cleaning/issues');
      set({ issues: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadAll: async () => {
    await Promise.all([
      get().loadTasks(),
      get().loadIssues(),
    ]);
  },
}));

export const CLEANING_AREAS = AREAS;
