import { create } from 'zustand';
import { apiClient } from '@shared/api/apiClient';

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

const initialGuards: Guard[] = [];

const initialGateLogs: GateLog[] = [];

const initialIncidents: Incident[] = [];

const initialPatrolShifts: PatrolShift[] = [];

const initialVisitors: PreRegisteredVisitor[] = [];

const initialChecklist: ChecklistItem[] = [];

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

  // API
  loadIncidents: () => Promise<void>;
  loadGateLogs: () => Promise<void>;
  loadAll: () => Promise<void>;
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
  addGateLog: async (log) => {
    try {
      const created = await apiClient.post<any>('/security/gate-logs', log);
      set((s) => ({ gateLogs: [{ ...log, id: created.id || genId() }, ...s.gateLogs] }));
    } catch {
      set((s) => ({ gateLogs: [{ ...log, id: genId() }, ...s.gateLogs] }));
    }
  },
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
  addIncident: async (incident) => {
    try {
      const created = await apiClient.post<any>('/security/incidents', incident);
      set((s) => ({ incidents: [{ ...incident, id: created.id || genId() }, ...s.incidents] }));
    } catch {
      set((s) => ({ incidents: [{ ...incident, id: genId() }, ...s.incidents] }));
    }
  },
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

  loadIncidents: async () => {
    try {
      const data = await apiClient.get<any[]>('/security/incidents');
      set({ incidents: (data || []).map((d) => ({ ...d, id: d.id || genId() })) });
    } catch {}
  },
  loadGateLogs: async () => {
    try {
      const data = await apiClient.get<any[]>('/security/gate-logs');
      set({ gateLogs: (data || []).map((d) => ({ ...d, id: d.id || genId() })) });
    } catch {}
  },
  loadAll: async () => {
    await Promise.all([
      get().loadGateLogs(),
      get().loadIncidents(),
    ]);
  },

}));
