import { create } from 'zustand';

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

const INITIAL_TASKS: CleaningTask[] = [
  { id: '1', task: 'Assembly hall swept & mopped', area: 'Assembly Hall', frequency: 'Daily', assignedTo: 'Mr. Kofi', done: true, date: todayISO(), priority: 'High' },
  { id: '2', task: 'Dining hall cleaned after breakfast', area: 'Dining Hall', frequency: 'Daily', assignedTo: 'Ms. Esi', done: true, date: todayISO(), priority: 'High' },
  { id: '3', task: 'Dining hall cleaned after lunch', area: 'Dining Hall', frequency: 'Daily', assignedTo: 'Ms. Esi', done: false, date: todayISO(), priority: 'High' },
  { id: '4', task: 'Dormitory A toilets cleaned', area: 'Dormitory A', frequency: 'Daily', assignedTo: 'Mr. Yaw', done: true, date: todayISO(), priority: 'High' },
  { id: '5', task: 'Dormitory B toilets cleaned', area: 'Dormitory B', frequency: 'Daily', assignedTo: 'Mr. Yaw', done: false, date: todayISO(), priority: 'High' },
  { id: '6', task: 'Admin block windows cleaned', area: 'Admin Block', frequency: 'Weekly', assignedTo: 'Ms. Adjoa', done: false, date: todayISO(), priority: 'Medium' },
  { id: '7', task: 'Waste bins emptied', area: 'Grounds', frequency: 'Daily', assignedTo: 'Mr. Samuel', done: true, date: todayISO(), priority: 'Medium' },
  { id: '8', task: 'Library floor vacuumed', area: 'Library', frequency: 'Daily', assignedTo: 'Ms. Adjoa', done: false, date: todayISO(), priority: 'Low' },
  { id: '9', task: 'Laboratory surfaces disinfected', area: 'Laboratory', frequency: 'Daily', assignedTo: 'Mr. Kofi', done: false, date: todayISO(), priority: 'High' },
  { id: '10', task: 'Toilets Block A disinfected', area: 'Toilets Block A', frequency: 'Daily', assignedTo: 'Mr. Yaw', done: true, date: todayISO(), priority: 'High' },
];

const INITIAL_ISSUES: MaintenanceIssue[] = [
  { id: '1', date: '2026-07-05', location: 'Dorm B toilet', issue: 'Broken pipe', priority: 'High', status: 'Reported', reportedBy: 'Mr. Yaw', notes: 'Water leaking continuously, needs plumber' },
  { id: '2', date: '2026-07-03', location: 'Dining hall', issue: 'Cracked window', priority: 'Low', status: 'Repair Scheduled', reportedBy: 'Ms. Esi', notes: 'Window pane cracked, glass dangerous' },
  { id: '3', date: '2026-06-28', location: 'Assembly hall', issue: 'Faulty light', priority: 'Medium', status: 'Fixed', reportedBy: 'Mr. Kofi', notes: 'Light fixed by maintenance team' },
];

const INITIAL_INSPECTIONS: InspectionReport[] = [
  { id: '1', date: '2026-07-05', area: 'Dormitories', inspector: 'Mr. Tetteh', result: 'Passed', score: 92, notes: 'Generally clean, minor issues in Block B' },
  { id: '2', date: '2026-07-03', area: 'Dining Hall', inspector: 'Mrs. Adjei', result: 'Passed', score: 88, notes: 'Good standard, floor needs more attention' },
  { id: '3', date: '2026-06-28', area: 'Toilets (Block A)', inspector: 'Mr. Tetteh', result: 'Needs Attention', score: 65, notes: 'Soap dispensers empty, floor wet' },
];

const INITIAL_STAFF: CleaningStaff[] = [
  { id: '1', name: 'Mr. Kofi', role: 'Senior Cleaner', area: 'Assembly Hall + Lab', phone: '024 111 2222', status: 'Present', todayCheckedIn: true },
  { id: '2', name: 'Ms. Esi', role: 'Cleaner', area: 'Dining Hall', phone: '024 333 4444', status: 'Present', todayCheckedIn: true },
  { id: '3', name: 'Mr. Yaw', role: 'Cleaner', area: 'Dormitories', phone: '024 555 6666', status: 'Present', todayCheckedIn: false },
  { id: '4', name: 'Ms. Adjoa', role: 'Cleaner', area: 'Admin Block + Library', phone: '024 777 8888', status: 'Present', todayCheckedIn: true },
  { id: '5', name: 'Mr. Samuel', role: 'Groundskeeper', area: 'Grounds', phone: '024 999 0000', status: 'On Leave', todayCheckedIn: false },
  { id: '6', name: 'Mr. Daniel', role: 'Cleaner', area: 'Toilets', phone: '020 111 3333', status: 'Present', todayCheckedIn: false },
];

const INITIAL_SUPPLIES: CleaningSupply[] = [
  { id: '1', name: 'Bleach', quantity: 15, unit: 'gallons', reorderLevel: 8, category: 'Disinfectant' },
  { id: '2', name: 'Detergent', quantity: 6, unit: 'cartons', reorderLevel: 10, category: 'Cleaning Agent' },
  { id: '3', name: 'Mops', quantity: 12, unit: 'units', reorderLevel: 6, category: 'Equipment' },
  { id: '4', name: 'Brooms', quantity: 8, unit: 'units', reorderLevel: 5, category: 'Equipment' },
  { id: '5', name: 'Dustbins', quantity: 20, unit: 'units', reorderLevel: 10, category: 'Equipment' },
  { id: '6', name: 'Soap dispensers refill', quantity: 4, unit: 'cartons', reorderLevel: 8, category: 'Hygiene' },
  { id: '7', name: 'Toilet paper rolls', quantity: 45, unit: 'rolls', reorderLevel: 30, category: 'Hygiene' },
  { id: '8', name: 'Gloves (pairs)', quantity: 18, unit: 'pairs', reorderLevel: 12, category: 'PPE' },
  { id: '9', name: 'Dettol', quantity: 5, unit: 'gallons', reorderLevel: 6, category: 'Disinfectant' },
  { id: '10', name: 'Trash bags', quantity: 30, unit: 'packs', reorderLevel: 15, category: 'Consumables' },
];

const INITIAL_ROSTER: DutyRosterEntry[] = [
  { id: '1', area: 'Assembly Hall', assignedTo: 'Mr. Kofi + 2', frequency: 'Daily', time: '06:00 - 07:00', status: 'Completed' },
  { id: '2', area: 'Dining Hall', assignedTo: 'Ms. Esi + 3', frequency: 'Daily (3x)', time: 'After each meal', status: 'In Progress' },
  { id: '3', area: 'Dormitories (A)', assignedTo: 'Mr. Yaw', frequency: 'Daily', time: '07:00 - 09:00', status: 'Completed' },
  { id: '4', area: 'Administration Block', assignedTo: 'Ms. Adjoa', frequency: 'Daily', time: '06:00 - 08:00', status: 'Completed' },
  { id: '5', area: 'Grounds/Lawns', assignedTo: 'Mr. Samuel + 2', frequency: 'Weekly', time: 'Saturdays', status: 'Pending' },
  { id: '6', area: 'Toilets Block A', assignedTo: 'Mr. Daniel', frequency: 'Daily', time: '06:00 - 08:00', status: 'In Progress' },
  { id: '7', area: 'Toilets Block B', assignedTo: 'Mr. Daniel', frequency: 'Daily', time: '08:00 - 10:00', status: 'Pending' },
  { id: '8', area: 'Library', assignedTo: 'Ms. Adjoa', frequency: 'Daily', time: '10:00 - 11:00', status: 'Pending' },
];

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
}

export const useCleaningStore = create<CleaningState>((set, get) => ({
  tasks: INITIAL_TASKS,
  issues: INITIAL_ISSUES,
  inspections: INITIAL_INSPECTIONS,
  staff: INITIAL_STAFF,
  supplies: INITIAL_SUPPLIES,
  roster: INITIAL_ROSTER,

  // ── Tasks ──
  addTask: (task) => {
    set((state) => ({ tasks: [{ ...task, id: nextId(), date: todayISO(), done: false }, ...state.tasks] }));
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
  addIssue: (issue) => {
    set((state) => ({
      issues: [{ ...issue, id: nextId(), date: todayISO(), status: 'Reported' }, ...state.issues],
    }));
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
}));

export const CLEANING_AREAS = AREAS;
