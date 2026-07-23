import { create } from 'zustand';

// ── Types ──

export type GateStatus = 'In' | 'Out' | 'Denied';
export type IncidentSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type IncidentStatus = 'Reported' | 'Under Investigation' | 'Escalated' | 'Resolved';
export type IncidentType = 'Theft' | 'Trespass' | 'Fight' | 'Vandalism' | 'Suspicious Activity' | 'Medical Emergency' | 'Fire' | 'Other';
export type ShiftName = 'Morning' | 'Evening' | 'Night';
export type VisitorStatus = 'Expected' | 'Arrived' | 'Departed' | 'Cancelled';

export interface Guard {
  id: string;
  name: string;
  phone: string;
  shift: ShiftName;
  zone: string;
  onLeave: boolean;
}

export interface GateLog {
  id: string;
  time: string;
  date: string;
  visitorName: string;
  vehiclePlate: string;
  purpose: string;
  host: string;
  status: GateStatus;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
}

export interface Incident {
  id: string;
  incidentId: string;
  date: string;
  time: string;
  type: IncidentType;
  location: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  reportedBy: string;
  assignedTo?: string;
  resolution?: string;
  witnesses?: string;
}

export interface PatrolShift {
  id: string;
  shift: ShiftName;
  startTime: string;
  endTime: string;
  guardName: string;
  zone: string;
  notes: string;
  completed: boolean;
}

export interface PreRegisteredVisitor {
  id: string;
  name: string;
  expectedDate: string;
  expectedTime: string;
  purpose: string;
  host: string;
  phone: string;
  vehiclePlate?: string;
  status: VisitorStatus;
  actualArrivalTime?: string;
  notes?: string;
}

export interface ChecklistItem {
  id: string;
  item: string;
  category: string;
  done: boolean;
  requiredTime: string;
  completedTime?: string;
  completedBy?: string;
}

// ── Constants ──

export const INCIDENT_TYPES: IncidentType[] = ['Theft', 'Trespass', 'Fight', 'Vandalism', 'Suspicious Activity', 'Medical Emergency', 'Fire', 'Other'];
export const INCIDENT_SEVERITIES: IncidentSeverity[] = ['Low', 'Medium', 'High', 'Critical'];
export const INCIDENT_STATUSES: IncidentStatus[] = ['Reported', 'Under Investigation', 'Escalated', 'Resolved'];
export const SHIFT_NAMES: ShiftName[] = ['Morning', 'Evening', 'Night'];
export const VISITOR_STATUSES: VisitorStatus[] = ['Expected', 'Arrived', 'Departed', 'Cancelled'];
export const GATE_STATUSES: GateStatus[] = ['In', 'Out', 'Denied'];

export const CHECKLIST_CATEGORIES = ['Perimeter', 'Gates', 'Dormitories', 'Academic Block', 'Kitchen', 'Utilities'];

const today = new Date().toISOString().slice(0, 10);
const nowTime = new Date().toTimeString().slice(0, 5);

// ── Initial Data ──

const initialGuards: Guard[] = [
  { id: 'g1', name: 'K. Asante', phone: '024 111 2222', shift: 'Morning', zone: 'Main gate + perimeter', onLeave: false },
  { id: 'g2', name: 'S. Osei', phone: '024 333 4444', shift: 'Evening', zone: 'Dormitory area', onLeave: false },
  { id: 'g3', name: 'D. Tetteh', phone: '024 555 6666', shift: 'Night', zone: 'Full perimeter', onLeave: false },
  { id: 'g4', name: 'M. Boateng', phone: '024 777 8888', shift: 'Morning', zone: 'Academic block', onLeave: true },
];

const initialGateLogs: GateLog[] = [
  { id: 'gl1', time: '14:30', date: today, visitorName: 'Mr. Oppong', vehiclePlate: 'GE-2345-1', purpose: 'PTA meeting', host: 'Headmaster', status: 'In', checkInTime: '14:30' },
  { id: 'gl2', time: '13:15', date: today, visitorName: 'Ms. Adjei', vehiclePlate: '-', purpose: 'Delivery', host: 'Kitchen', status: 'Out', checkInTime: '13:15', checkOutTime: '13:45' },
  { id: 'gl3', time: '11:00', date: today, visitorName: 'Dr. Frimpong', vehiclePlate: 'GR-1122-2', purpose: 'Medical visit', host: 'Sick Bay', status: 'In', checkInTime: '11:00' },
  { id: 'gl4', time: '09:45', date: today, visitorName: 'GES Inspector', vehiclePlate: 'GV-0099-1', purpose: 'Inspection', host: 'Headmaster', status: 'Out', checkInTime: '09:45', checkOutTime: '12:30' },
  { id: 'gl5', time: '08:20', date: today, visitorName: 'Unknown Person', vehiclePlate: '-', purpose: 'No ID', host: '-', status: 'Denied', notes: 'Could not produce valid identification' },
];

const initialIncidents: Incident[] = [
  { id: 'inc1', incidentId: 'INC-2026-001', date: '2026-07-05', time: '22:30', type: 'Theft', location: 'Boys dorm B', description: 'Student reported missing phone from dormitory room. Room was unattended during prep time.', severity: 'Medium', status: 'Under Investigation', reportedBy: 'K. Asante', assignedTo: 'S. Osei', witnesses: 'Roommates J. Mensah, K. Owusu' },
  { id: 'inc2', incidentId: 'INC-2026-002', date: '2026-07-03', time: '02:15', type: 'Trespass', location: 'Back fence', description: 'Motion sensor triggered at back fence. Patrol found signs of attempted entry.', severity: 'Low', status: 'Resolved', reportedBy: 'D. Tetteh', resolution: 'Fence repaired, motion sensors recalibrated. No breach confirmed.' },
  { id: 'inc3', incidentId: 'INC-2026-003', date: '2026-06-28', time: '19:45', type: 'Fight', location: 'Dining hall', description: 'Altercation between two students during dinner. Physical contact involved.', severity: 'High', status: 'Escalated', reportedBy: 'S. Osei', assignedTo: 'Headmaster', witnesses: 'Dining staff, several students', resolution: 'Escalated to Headmaster and parents notified. Students suspended pending investigation.' },
];

const initialPatrolShifts: PatrolShift[] = [
  { id: 'ps1', shift: 'Morning', startTime: '06:00', endTime: '14:00', guardName: 'K. Asante', zone: 'Main gate + perimeter', notes: 'Routine patrol', completed: true },
  { id: 'ps2', shift: 'Evening', startTime: '14:00', endTime: '22:00', guardName: 'S. Osei', zone: 'Dormitory area', notes: 'Focus on dormitory perimeter', completed: false },
  { id: 'ps3', shift: 'Night', startTime: '22:00', endTime: '06:00', guardName: 'D. Tetteh', zone: 'Full perimeter', notes: 'Full campus patrol every 2 hours', completed: false },
];

const initialVisitors: PreRegisteredVisitor[] = [
  { id: 'v1', name: 'GES Regional Director', expectedDate: '2026-07-10', expectedTime: '10:00', purpose: 'Inspection visit', host: 'Headmaster', phone: '020 123 4567', vehiclePlate: 'GV-0099-1', status: 'Expected' },
  { id: 'v2', name: 'Dr. Frimpong', expectedDate: '2026-07-08', expectedTime: '14:00', purpose: 'Medical check-up', host: 'Sick Bay', phone: '024 987 6543', status: 'Expected' },
  { id: 'v3', name: 'Mr. Oppong (PTA Chair)', expectedDate: today, expectedTime: '14:00', purpose: 'PTA meeting', host: 'Headmaster', phone: '024 555 1234', vehiclePlate: 'GE-2345-1', status: 'Arrived', actualArrivalTime: '14:30' },
];

const initialChecklist: ChecklistItem[] = [
  { id: 'cl1', item: 'Main gate locked after 22:00', category: 'Gates', done: true, requiredTime: '22:00', completedTime: '22:05', completedBy: 'D. Tetteh' },
  { id: 'cl2', item: 'Back fence inspected', category: 'Perimeter', done: true, requiredTime: '06:30', completedTime: '06:35', completedBy: 'K. Asante' },
  { id: 'cl3', item: 'Dormitory doors secured', category: 'Dormitories', done: true, requiredTime: '21:00', completedTime: '21:10', completedBy: 'S. Osei' },
  { id: 'cl4', item: 'Kitchen locked', category: 'Kitchen', done: false, requiredTime: '20:00' },
  { id: 'cl5', item: 'Lab equipment checked', category: 'Academic Block', done: false, requiredTime: '17:00' },
  { id: 'cl6', item: 'Generator room locked', category: 'Utilities', done: true, requiredTime: '18:00', completedTime: '18:02', completedBy: 'K. Asante' },
  { id: 'cl7', item: 'Front gate barrier tested', category: 'Gates', done: true, requiredTime: '06:00', completedTime: '06:00', completedBy: 'K. Asante' },
  { id: 'cl8', item: 'CCTV cameras operational check', category: 'Perimeter', done: false, requiredTime: '07:00' },
];

// ── Store ──

interface SecurityState {
  guards: Guard[];
  gateLogs: GateLog[];
  incidents: Incident[];
  patrolShifts: PatrolShift[];
  visitors: PreRegisteredVisitor[];
  checklist: ChecklistItem[];

  // Gate log
  addGateLog: (log: Omit<GateLog, 'id'>) => void;
  updateGateStatus: (id: string, status: GateStatus) => void;
  deleteGateLog: (id: string) => void;
  getTodayGateLogs: () => GateLog[];
  getCurrentlyIn: () => GateLog[];

  // Incidents
  addIncident: (incident: Omit<Incident, 'id'>) => void;
  updateIncidentStatus: (id: string, status: IncidentStatus) => void;
  updateIncident: (id: string, updates: Partial<Incident>) => void;
  deleteIncident: (id: string) => void;
  getActiveIncidents: () => Incident[];
  getCriticalIncidents: () => Incident[];

  // Patrol
  addPatrolShift: (shift: Omit<PatrolShift, 'id'>) => void;
  updatePatrolShift: (id: string, updates: Partial<PatrolShift>) => void;
  deletePatrolShift: (id: string) => void;

  // Visitors
  addVisitor: (visitor: Omit<PreRegisteredVisitor, 'id'>) => void;
  updateVisitorStatus: (id: string, status: VisitorStatus, actualArrivalTime?: string) => void;
  deleteVisitor: (id: string) => void;
  getExpectedVisitors: () => PreRegisteredVisitor[];

  // Checklist
  toggleChecklistItem: (id: string, completedBy: string) => void;
  addChecklistItem: (item: Omit<ChecklistItem, 'id' | 'done'>) => void;
  deleteChecklistItem: (id: string) => void;
  getPendingChecklist: () => ChecklistItem[];
  getChecklistProgress: () => { done: number; total: number; pct: number };

  // Guards
  addGuard: (guard: Omit<Guard, 'id'>) => void;
  updateGuard: (id: string, updates: Partial<Guard>) => void;
  deleteGuard: (id: string) => void;
}

let counter = 100;
const genId = () => `sec-${++counter}-${Date.now()}`;

export const useSecurityStore = create<SecurityState>((set, get) => ({
  guards: initialGuards,
  gateLogs: initialGateLogs,
  incidents: initialIncidents,
  patrolShifts: initialPatrolShifts,
  visitors: initialVisitors,
  checklist: initialChecklist,

  // Gate log
  addGateLog: (log) => set((s) => ({ gateLogs: [{ ...log, id: genId() }, ...s.gateLogs] })),
  updateGateStatus: (id, status) => set((s) => ({
    gateLogs: s.gateLogs.map((g) => {
      if (g.id !== id) return g;
      const updates: Partial<GateLog> = { status };
      if (status === 'Out') updates.checkOutTime = nowTime;
      if (status === 'In') updates.checkInTime = nowTime;
      return { ...g, ...updates };
    }),
  })),
  deleteGateLog: (id) => set((s) => ({ gateLogs: s.gateLogs.filter((g) => g.id !== id) })),
  getTodayGateLogs: () => get().gateLogs.filter((g) => g.date === today),
  getCurrentlyIn: () => get().gateLogs.filter((g) => g.status === 'In'),

  // Incidents
  addIncident: (incident) => set((s) => ({ incidents: [{ ...incident, id: genId() }, ...s.incidents] })),
  updateIncidentStatus: (id, status) => set((s) => ({
    incidents: s.incidents.map((i) => i.id === id ? { ...i, status, resolution: status === 'Resolved' ? i.resolution || 'Resolved by security team' : i.resolution } : i),
  })),
  updateIncident: (id, updates) => set((s) => ({ incidents: s.incidents.map((i) => i.id === id ? { ...i, ...updates } : i) })),
  deleteIncident: (id) => set((s) => ({ incidents: s.incidents.filter((i) => i.id !== id) })),
  getActiveIncidents: () => get().incidents.filter((i) => i.status !== 'Resolved'),
  getCriticalIncidents: () => get().incidents.filter((i) => i.severity === 'Critical' || i.severity === 'High'),

  // Patrol
  addPatrolShift: (shift) => set((s) => ({ patrolShifts: [...s.patrolShifts, { ...shift, id: genId() }] })),
  updatePatrolShift: (id, updates) => set((s) => ({ patrolShifts: s.patrolShifts.map((p) => p.id === id ? { ...p, ...updates } : p) })),
  deletePatrolShift: (id) => set((s) => ({ patrolShifts: s.patrolShifts.filter((p) => p.id !== id) })),

  // Visitors
  addVisitor: (visitor) => set((s) => ({ visitors: [{ ...visitor, id: genId() }, ...s.visitors] })),
  updateVisitorStatus: (id, status, actualArrivalTime) => set((s) => ({
    visitors: s.visitors.map((v) => v.id === id ? { ...v, status, actualArrivalTime: actualArrivalTime || v.actualArrivalTime } : v),
  })),
  deleteVisitor: (id) => set((s) => ({ visitors: s.visitors.filter((v) => v.id !== id) })),
  getExpectedVisitors: () => get().visitors.filter((v) => v.status === 'Expected'),

  // Checklist
  toggleChecklistItem: (id, completedBy) => set((s) => ({
    checklist: s.checklist.map((c) => c.id === id ? {
      ...c,
      done: !c.done,
      completedTime: !c.done ? nowTime : undefined,
      completedBy: !c.done ? completedBy : undefined,
    } : c),
  })),
  addChecklistItem: (item) => set((s) => ({ checklist: [...s.checklist, { ...item, id: genId(), done: false }] })),
  deleteChecklistItem: (id) => set((s) => ({ checklist: s.checklist.filter((c) => c.id !== id) })),
  getPendingChecklist: () => get().checklist.filter((c) => !c.done),
  getChecklistProgress: () => {
    const total = get().checklist.length;
    const done = get().checklist.filter((c) => c.done).length;
    return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  },

  // Guards
  addGuard: (guard) => set((s) => ({ guards: [...s.guards, { ...guard, id: genId() }] })),
  updateGuard: (id, updates) => set((s) => ({ guards: s.guards.map((g) => g.id === id ? { ...g, ...updates } : g) })),
  deleteGuard: (id) => set((s) => ({ guards: s.guards.filter((g) => g.id !== id) })),
}));
