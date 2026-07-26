import { create } from 'zustand';
import { apiClient } from '@shared/api/apiClient';

// ── Types ──

export type RollCallStatus = 'Present' | 'Absent' | 'Excused' | 'Late';
export type DisciplineSeverity = 'Minor' | 'Moderate' | 'Serious' | 'Critical';
export type HouseType = 'Boys' | 'Girls';

export interface BoardingStudent {
  id: string;
  admNo: string;
  name: string;
  class: string;
  house: string;
  room: string;
  bed?: string;
}

export interface Room {
  id: string;
  house: string;
  room: string;
  beds: number;
  occupied: number;
  studentNames: string[];
}

export interface RollCallEntry {
  id: string;
  date: string;
  house: string;
  studentName: string;
  room: string;
  status: RollCallStatus;
  notes?: string;
  recordedBy: string;
}

export interface DisciplineLog {
  id: string;
  date: string;
  house: string;
  studentName: string;
  incident: string;
  severity: DisciplineSeverity;
  actionTaken: string;
  recordedBy: string;
  escalated: boolean;
}

export interface WelfareNote {
  id: string;
  date: string;
  house: string;
  studentName: string;
  note: string;
  recordedBy: string;
  resolved: boolean;
}

export interface House {
  id: string;
  name: string;
  type: HouseType;
  housemaster: string;
  phone: string;
  capacity: number;
  occupied: number;
  since: string;
}

export type BeddingCondition = 'Good' | 'Fair' | 'Poor' | 'Damaged';

export interface BeddingItem {
  id: string;
  house: string;
  room: string;
  item: string;
  quantity: number;
  condition: BeddingCondition;
  lastChecked: string;
  notes?: string;
}

export interface HouseMeeting {
  id: string;
  date: string;
  attendees: string[];
  agenda: string;
  minutes: string;
  decisions: string;
  chairedBy: string;
}

export type DormInspectionResult = 'Pass' | 'Fail' | 'Warning';

export interface DormInspection {
  id: string;
  date: string;
  house: string;
  room: string;
  inspector: string;
  cleanliness: DormInspectionResult;
  beddingCheck: DormInspectionResult;
  ventilation: DormInspectionResult;
  lighting: DormInspectionResult;
  security: DormInspectionResult;
  overallScore: number;
  notes: string;
  followUp: boolean;
}

// ── Constants ──

export const ROLL_CALL_STATUSES: RollCallStatus[] = ['Present', 'Absent', 'Excused', 'Late'];
export const DISCIPLINE_SEVERITIES: DisciplineSeverity[] = ['Minor', 'Moderate', 'Serious', 'Critical'];
export const HOUSE_TYPES: HouseType[] = ['Boys', 'Girls'];
export const BEDDING_CONDITIONS: BeddingCondition[] = ['Good', 'Fair', 'Poor', 'Damaged'];
export const DORM_INSPECTION_RESULTS: DormInspectionResult[] = ['Pass', 'Fail', 'Warning'];

const today = new Date().toISOString().slice(0, 10);

// ── Initial Data ──

const initialHouses: House[] = [];

const initialStudents: BoardingStudent[] = [];

const initialRooms: Room[] = [];

const initialRollCalls: RollCallEntry[] = [];

const initialDiscipline: DisciplineLog[] = [];

const initialWelfare: WelfareNote[] = [];
const initialBedding: BeddingItem[] = [];
const initialHouseMeetings: HouseMeeting[] = [];
const initialDormInspections: DormInspection[] = [];

// ── Store ──

interface BoardingState {
  houses: House[];
  students: BoardingStudent[];
  rooms: Room[];
  rollCalls: RollCallEntry[];
  discipline: DisciplineLog[];
  welfare: WelfareNote[];
  bedding: BeddingItem[];
  houseMeetings: HouseMeeting[];
  dormInspections: DormInspection[];

  // Students
  addStudent: (s: Omit<BoardingStudent, 'id'>) => void;
  updateStudent: (id: string, updates: Partial<BoardingStudent>) => void;
  deleteStudent: (id: string) => void;
  getStudentsByHouse: (house: string) => BoardingStudent[];

  // Rooms
  addRoom: (r: Omit<Room, 'id'>) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  getRoomsByHouse: (house: string) => Room[];

  // Roll call
  addRollCall: (rc: Omit<RollCallEntry, 'id'>) => void;
  updateRollCallStatus: (id: string, status: RollCallStatus) => void;
  deleteRollCall: (id: string) => void;
  getTodayRollCalls: (house: string) => RollCallEntry[];
  startRollCall: (house: string, recordedBy: string) => void;

  // Discipline
  addDiscipline: (d: Omit<DisciplineLog, 'id'>) => void;
  updateDiscipline: (id: string, updates: Partial<DisciplineLog>) => void;
  deleteDiscipline: (id: string) => void;
  getDisciplineByHouse: (house: string) => DisciplineLog[];
  escalateDiscipline: (id: string) => void;

  // Welfare
  addWelfare: (w: Omit<WelfareNote, 'id'>) => void;
  updateWelfare: (id: string, updates: Partial<WelfareNote>) => void;
  deleteWelfare: (id: string) => void;
  getWelfareByHouse: (house: string) => WelfareNote[];
  resolveWelfare: (id: string) => void;

  // House assignment
  assignHousemaster: (houseId: string, housemasterName: string, phone: string) => void;
  getHouseByHousemaster: (housemasterName: string) => House | undefined;
  assignStudentToHouse: (studentId: string, house: string, room: string) => void;
  getHouseList: () => { house: string; students: BoardingStudent[] }[];

  // Bedding
  addBedding: (b: Omit<BeddingItem, 'id'>) => void;
  updateBedding: (id: string, updates: Partial<BeddingItem>) => void;
  deleteBedding: (id: string) => void;
  getBeddingByHouse: (house: string) => BeddingItem[];

  // House Meetings
  addHouseMeeting: (m: Omit<HouseMeeting, 'id'>) => void;
  deleteHouseMeeting: (id: string) => void;

  // Dorm Inspections
  addDormInspection: (d: Omit<DormInspection, 'id'>) => void;
  deleteDormInspection: (id: string) => void;
  getDormInspectionsByHouse: (house: string) => DormInspection[];

  // API
  loadRollCalls: () => Promise<void>;
  loadDiscipline: () => Promise<void>;
  loadAll: () => Promise<void>;
}

let counter = 100;
const genId = () => `bd-${++counter}-${Date.now()}`;

export const useBoardingStore = create<BoardingState>((set, get) => ({
  houses: initialHouses,
  students: initialStudents,
  rooms: initialRooms,
  rollCalls: initialRollCalls,
  discipline: initialDiscipline,
  welfare: initialWelfare,
  bedding: initialBedding,
  houseMeetings: initialHouseMeetings,
  dormInspections: initialDormInspections,

  // Students
  addStudent: (s) => set((st) => ({ students: [...st.students, { ...s, id: genId() }] })),
  updateStudent: (id, updates) => set((st) => ({ students: st.students.map((s) => s.id === id ? { ...s, ...updates } : s) })),
  deleteStudent: (id) => set((st) => ({ students: st.students.filter((s) => s.id !== id) })),
  getStudentsByHouse: (house) => get().students.filter((s) => s.house === house),

  // Rooms
  addRoom: (r) => set((st) => ({ rooms: [...st.rooms, { ...r, id: genId() }] })),
  updateRoom: (id, updates) => set((st) => ({ rooms: st.rooms.map((r) => r.id === id ? { ...r, ...updates } : r) })),
  deleteRoom: (id) => set((st) => ({ rooms: st.rooms.filter((r) => r.id !== id) })),
  getRoomsByHouse: (house) => get().rooms.filter((r) => r.house === house),

  // Roll call
  addRollCall: async (rc) => {
    try {
      const created = await apiClient.post<any>('/boarding/roll-call', rc);
      set((st) => ({ rollCalls: [{ ...rc, id: created.id || genId() }, ...st.rollCalls] }));
    } catch {
      set((st) => ({ rollCalls: [{ ...rc, id: genId() }, ...st.rollCalls] }));
    }
  },
  updateRollCallStatus: (id, status) => set((st) => ({ rollCalls: st.rollCalls.map((rc) => rc.id === id ? { ...rc, status } : rc) })),
  deleteRollCall: (id) => set((st) => ({ rollCalls: st.rollCalls.filter((rc) => rc.id !== id) })),
  getTodayRollCalls: (house) => get().rollCalls.filter((rc) => rc.date === today && rc.house === house),
  startRollCall: (house, recordedBy) => {
    const existing = get().rollCalls.filter((rc) => rc.date === today && rc.house === house);
    if (existing.length > 0) return; // Already started
    const students = get().students.filter((s) => s.house === house);
    const newEntries: RollCallEntry[] = students.map((s) => ({
      id: genId(), date: today, house, studentName: s.name, room: s.room,
      status: 'Absent', recordedBy,
    }));
    set((st) => ({ rollCalls: [...newEntries, ...st.rollCalls] }));
  },

  // Discipline
  addDiscipline: async (d) => {
    try {
      const created = await apiClient.post<any>('/boarding/discipline', d);
      set((st) => ({ discipline: [{ ...d, id: created.id || genId() }, ...st.discipline] }));
    } catch {
      set((st) => ({ discipline: [{ ...d, id: genId() }, ...st.discipline] }));
    }
  },
  updateDiscipline: (id, updates) => set((st) => ({ discipline: st.discipline.map((d) => d.id === id ? { ...d, ...updates } : d) })),
  deleteDiscipline: (id) => set((st) => ({ discipline: st.discipline.filter((d) => d.id !== id) })),
  getDisciplineByHouse: (house) => get().discipline.filter((d) => d.house === house),
  escalateDiscipline: (id) => set((st) => ({ discipline: st.discipline.map((d) => d.id === id ? { ...d, escalated: true, actionTaken: d.actionTaken + ' → Escalated to Headmaster' } : d) })),

  // Welfare
  addWelfare: (w) => set((st) => ({ welfare: [{ ...w, id: genId() }, ...st.welfare] })),
  updateWelfare: (id, updates) => set((st) => ({ welfare: st.welfare.map((w) => w.id === id ? { ...w, ...updates } : w) })),
  deleteWelfare: (id) => set((st) => ({ welfare: st.welfare.filter((w) => w.id !== id) })),
  getWelfareByHouse: (house) => get().welfare.filter((w) => w.house === house),
  resolveWelfare: (id) => set((st) => ({ welfare: st.welfare.map((w) => w.id === id ? { ...w, resolved: true } : w) })),

  // House assignment
  assignHousemaster: (houseId, housemasterName, phone) => set((st) => ({
    houses: st.houses.map((h) => h.id === houseId ? { ...h, housemaster: housemasterName, phone } : h),
  })),
  getHouseByHousemaster: (housemasterName) => get().houses.find((h) => h.housemaster === housemasterName),
  assignStudentToHouse: (studentId, house, room) => set((st) => ({
    students: st.students.map((s) => s.id === studentId ? { ...s, house, room } : s),
    houses: st.houses.map((h) => h.name === house ? { ...h, occupied: st.students.filter((s) => s.house === house).length + 1 } : h),
  })),
  getHouseList: () => {
    const houses = get().houses;
    return houses.map((h) => ({ house: h.name, students: get().students.filter((s) => s.house === h.name) }));
  },

  // Bedding
  addBedding: (b) => set((st) => ({ bedding: [{ ...b, id: genId() }, ...st.bedding] })),
  updateBedding: (id, updates) => set((st) => ({ bedding: st.bedding.map((b) => b.id === id ? { ...b, ...updates } : b) })),
  deleteBedding: (id) => set((st) => ({ bedding: st.bedding.filter((b) => b.id !== id) })),
  getBeddingByHouse: (house) => get().bedding.filter((b) => b.house === house),

  // House Meetings
  addHouseMeeting: (m) => set((st) => ({ houseMeetings: [{ ...m, id: genId() }, ...st.houseMeetings] })),
  deleteHouseMeeting: (id) => set((st) => ({ houseMeetings: st.houseMeetings.filter((m) => m.id !== id) })),

  // Dorm Inspections
  addDormInspection: (d) => set((st) => ({ dormInspections: [{ ...d, id: genId() }, ...st.dormInspections] })),
  deleteDormInspection: (id) => set((st) => ({ dormInspections: st.dormInspections.filter((d) => d.id !== id) })),
  getDormInspectionsByHouse: (house) => get().dormInspections.filter((d) => d.house === house),

  loadRollCalls: async () => {
    try {
      const data = await apiClient.get<any[]>('/boarding/roll-call');
      set({ rollCalls: (data || []).map((d) => ({ ...d, id: d.id || genId() })) });
    } catch {}
  },
  loadDiscipline: async () => {
    try {
      const data = await apiClient.get<any[]>('/boarding/discipline');
      set({ discipline: (data || []).map((d) => ({ ...d, id: d.id || genId() })) });
    } catch {}
  },
  loadAll: async () => {
    await Promise.all([
      get().loadRollCalls(),
      get().loadDiscipline(),
    ]);
  },
}));
