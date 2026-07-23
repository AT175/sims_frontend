import { create } from 'zustand';

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

// ── Constants ──

export const ROLL_CALL_STATUSES: RollCallStatus[] = ['Present', 'Absent', 'Excused', 'Late'];
export const DISCIPLINE_SEVERITIES: DisciplineSeverity[] = ['Minor', 'Moderate', 'Serious', 'Critical'];
export const HOUSE_TYPES: HouseType[] = ['Boys', 'Girls'];

const today = new Date().toISOString().slice(0, 10);

// ── Initial Data ──

const initialHouses: House[] = [
  { id: 'h1', name: 'Aggrey', type: 'Boys', housemaster: 'Mr. Owusu', phone: '024-111-2222', capacity: 220, occupied: 210, since: 'Sep 2024' },
  { id: 'h2', name: 'Danquah', type: 'Boys', housemaster: 'Mr. Tetteh', phone: '027-333-4444', capacity: 230, occupied: 215, since: 'Sep 2023' },
];

const initialStudents: BoardingStudent[] = [
  { id: 's1', admNo: '2026/001', name: 'Kwame Asante', class: 'SHS2 Sci A', house: 'Aggrey', room: 'A-12', bed: '1' },
  { id: 's2', admNo: '2026/003', name: 'Yao Mensah', class: 'SHS3 Bus A', house: 'Aggrey', room: 'B-05', bed: '2' },
  { id: 's3', admNo: '2026/015', name: 'Daniel Osei', class: 'SHS1 Sci A', house: 'Aggrey', room: 'C-08', bed: '1' },
  { id: 's4', admNo: '2026/022', name: 'Patrick Agyei', class: 'SHS2 Arts B', house: 'Aggrey', room: 'A-14', bed: '3' },
  { id: 's5', admNo: '2026/031', name: 'Kofi Baah', class: 'SHS1 Bus A', house: 'Aggrey', room: 'B-05', bed: '1' },
  { id: 's6', admNo: '2026/040', name: 'Samuel Tuffour', class: 'SHS3 Sci B', house: 'Aggrey', room: 'A-12', bed: '2' },
  { id: 's7', admNo: '2026/051', name: 'Ekow Mensah', class: 'SHS2 Arts A', house: 'Danquah', room: 'D-10', bed: '1' },
  { id: 's8', admNo: '2026/055', name: 'Bernard Asiedu', class: 'SHS1 Sci B', house: 'Danquah', room: 'D-11', bed: '2' },
];

const initialRooms: Room[] = [
  { id: 'r1', house: 'Aggrey', room: 'A-12', beds: 4, occupied: 4, studentNames: ['K. Asante', 'S. Tuffour', 'P. Agyei', 'J. Mensah'] },
  { id: 'r2', house: 'Aggrey', room: 'B-05', beds: 4, occupied: 3, studentNames: ['Y. Mensah', 'K. Baah', 'D. Osei'] },
  { id: 'r3', house: 'Aggrey', room: 'C-08', beds: 2, occupied: 1, studentNames: ['D. Osei'] },
  { id: 'r4', house: 'Aggrey', room: 'A-14', beds: 4, occupied: 2, studentNames: ['P. Agyei', 'F. Owusu'] },
  { id: 'r5', house: 'Danquah', room: 'D-10', beds: 4, occupied: 3, studentNames: ['E. Mensah', 'B. Asiedu', 'K. Frimpong'] },
  { id: 'r6', house: 'Danquah', room: 'D-11', beds: 4, occupied: 2, studentNames: ['B. Asiedu', 'A. Boateng'] },
];

const initialRollCalls: RollCallEntry[] = [
  { id: 'rc1', date: today, house: 'Aggrey', studentName: 'Kwame Asante', room: 'A-12', status: 'Present', recordedBy: 'Mr. Owusu' },
  { id: 'rc2', date: today, house: 'Aggrey', studentName: 'Yao Mensah', room: 'B-05', status: 'Present', recordedBy: 'Mr. Owusu' },
  { id: 'rc3', date: today, house: 'Aggrey', studentName: 'Daniel Osei', room: 'C-08', status: 'Absent', recordedBy: 'Mr. Owusu' },
  { id: 'rc4', date: today, house: 'Aggrey', studentName: 'Patrick Agyei', room: 'A-14', status: 'Excused', notes: 'Medical appointment', recordedBy: 'Mr. Owusu' },
  { id: 'rc5', date: today, house: 'Aggrey', studentName: 'Kofi Baah', room: 'B-05', status: 'Present', recordedBy: 'Mr. Owusu' },
  { id: 'rc6', date: today, house: 'Aggrey', studentName: 'Samuel Tuffour', room: 'A-12', status: 'Late', notes: 'Returned 10 min late', recordedBy: 'Mr. Owusu' },
];

const initialDiscipline: DisciplineLog[] = [
  { id: 'd1', date: '2026-07-05', house: 'Aggrey', studentName: 'Kwame Asante', incident: 'Bullying', severity: 'Serious', actionTaken: 'Escalated to Headmaster', recordedBy: 'Mr. Owusu', escalated: true },
  { id: 'd2', date: '2026-07-01', house: 'Aggrey', studentName: 'Daniel Osei', incident: 'Late return from town', severity: 'Minor', actionTaken: 'Warning given', recordedBy: 'Mr. Owusu', escalated: false },
  { id: 'd3', date: '2026-06-28', house: 'Danquah', studentName: 'Ekow Mensah', incident: 'Fighting in dormitory', severity: 'Moderate', actionTaken: 'Counselling referral', recordedBy: 'Mr. Tetteh', escalated: false },
];

const initialWelfare: WelfareNote[] = [
  { id: 'w1', date: '2026-07-05', house: 'Aggrey', studentName: 'Patrick Agyei', note: 'Homesick, spoke with guardian. Monitoring mood.', recordedBy: 'Mr. Owusu', resolved: false },
  { id: 'w2', date: '2026-07-03', house: 'Aggrey', studentName: 'Daniel Osei', note: 'Skipping meals, monitoring eating habits.', recordedBy: 'Mr. Owusu', resolved: false },
  { id: 'w3', date: '2026-06-30', house: 'Danquah', studentName: 'Bernard Asiedu', note: 'Exam stress, referred to counselling unit.', recordedBy: 'Mr. Tetteh', resolved: true },
];

// ── Store ──

interface BoardingState {
  houses: House[];
  students: BoardingStudent[];
  rooms: Room[];
  rollCalls: RollCallEntry[];
  discipline: DisciplineLog[];
  welfare: WelfareNote[];

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
  addRollCall: (rc) => set((st) => ({ rollCalls: [{ ...rc, id: genId() }, ...st.rollCalls] })),
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
  addDiscipline: (d) => set((st) => ({ discipline: [{ ...d, id: genId() }, ...st.discipline] })),
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
}));
