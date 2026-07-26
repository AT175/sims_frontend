import { create } from 'zustand';
import { apiClient } from '@shared/api/apiClient';

// ── Types ──

export interface Club {
  id: string;
  name: string;
  category: string;
  patron: string;
  memberCount: number;
  meetingDay: string;
  description?: string;
}

export type FixtureStatus = 'Upcoming' | 'Completed' | 'Cancelled' | 'Postponed';

export interface Fixture {
  id: string;
  date: string;
  sport: string;
  match: string;
  venue: string;
  status: FixtureStatus;
  scoreHome?: string;
  scoreAway?: string;
  result?: string;
}

export interface ParticipationRecord {
  id: string;
  date: string;
  activity: string;
  participantCount: number;
  notes?: string;
}

export type EquipmentCondition = 'Good' | 'Fair' | 'Poor' | 'Needs Repair';

export interface SportsEquipment {
  id: string;
  item: string;
  quantity: number;
  condition: EquipmentCondition;
  location: string;
  notes?: string;
}

export type AchievementLevel = 'School' | 'Zonal' | 'Regional' | 'National' | 'International';

export interface Achievement {
  id: string;
  date: string;
  achievement: string;
  level: AchievementLevel;
  recipients?: string;
}

export type AccessRole = 'Sports Coordinator' | 'Coach' | 'Patron' | 'Teacher' | 'Student' | 'Admin Staff';

export interface AccessRecord {
  id: string;
  personName: string;
  role: AccessRole;
  resource: string;
  accessLevel: 'Full' | 'Read Only' | 'Restricted' | 'No Access';
  grantedDate: string;
  grantedBy: string;
  notes?: string;
}

// ── Constants ──

export const CLUB_CATEGORIES = [
  'Academic', 'Sports', 'Arts & Culture', 'Service', 'Religious', 'Special Interest',
];

export const SPORTS = [
  'Football', 'Volleyball', 'Basketball', 'Athletics', 'Table Tennis', 'Hockey', 'Handball', 'Cross Country',
];

export const FIXTURE_STATUSES: FixtureStatus[] = ['Upcoming', 'Completed', 'Cancelled', 'Postponed'];

export const EQUIPMENT_CONDITIONS: EquipmentCondition[] = ['Good', 'Fair', 'Poor', 'Needs Repair'];

export const ACHIEVEMENT_LEVELS: AchievementLevel[] = ['School', 'Zonal', 'Regional', 'National', 'International'];

export const ACCESS_ROLES: AccessRole[] = ['Sports Coordinator', 'Coach', 'Patron', 'Teacher', 'Student', 'Admin Staff'];

export const ACCESS_LEVELS = ['Full', 'Read Only', 'Restricted', 'No Access'] as const;

export const MEETING_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

let idCounter = 300;
const nextId = () => String(++idCounter);
const todayISO = () => new Date().toISOString().slice(0, 10);

// ── Initial Data ──

const INITIAL_CLUBS: Club[] = [];

const INITIAL_FIXTURES: Fixture[] = [];

const INITIAL_PARTICIPATION: ParticipationRecord[] = [];

const INITIAL_EQUIPMENT: SportsEquipment[] = [];

const INITIAL_ACHIEVEMENTS: Achievement[] = [];

const INITIAL_ACCESS: AccessRecord[] = [];

// ── Store ──

interface SportsState {
  clubs: Club[];
  fixtures: Fixture[];
  participation: ParticipationRecord[];
  equipment: SportsEquipment[];
  achievements: Achievement[];
  accessRecords: AccessRecord[];

  addClub: (club: Omit<Club, 'id'>) => void;
  updateClub: (id: string, updates: Partial<Club>) => void;
  deleteClub: (id: string) => void;

  addFixture: (fixture: Omit<Fixture, 'id' | 'status'>) => void;
  updateFixtureResult: (id: string, scoreHome: string, scoreAway: string, result: string) => void;
  cancelFixture: (id: string) => void;
  postponeFixture: (id: string) => void;

  addParticipation: (record: Omit<ParticipationRecord, 'id'>) => void;
  deleteParticipation: (id: string) => void;

  addEquipment: (equip: Omit<SportsEquipment, 'id'>) => void;
  updateEquipment: (id: string, updates: Partial<SportsEquipment>) => void;
  deleteEquipment: (id: string) => void;

  addAchievement: (ach: Omit<Achievement, 'id'>) => void;
  deleteAchievement: (id: string) => void;

  grantAccess: (record: Omit<AccessRecord, 'id' | 'grantedDate'>) => void;
  revokeAccess: (id: string) => void;

  // API
  loadClubs: () => Promise<void>;
  loadFixtures: () => Promise<void>;
  loadAll: () => Promise<void>;
}

export const useSportsStore = create<SportsState>((set, get) => ({
  clubs: INITIAL_CLUBS,
  fixtures: INITIAL_FIXTURES,
  participation: INITIAL_PARTICIPATION,
  equipment: INITIAL_EQUIPMENT,
  achievements: INITIAL_ACHIEVEMENTS,
  accessRecords: INITIAL_ACCESS,

  addClub: async (club) => {
    try {
      const created = await apiClient.post<any>('/sports/clubs', club);
      set((s) => ({ clubs: [{ ...club, id: created.id || nextId() }, ...s.clubs] }));
    } catch {
      set((s) => ({ clubs: [{ ...club, id: nextId() }, ...s.clubs] }));
    }
  },

  updateClub: (id, updates) => {
    set((s) => ({ clubs: s.clubs.map((c) => (c.id === id ? { ...c, ...updates } : c)) }));
  },

  deleteClub: (id) => {
    set((s) => ({ clubs: s.clubs.filter((c) => c.id !== id) }));
  },

  addFixture: async (fixture) => {
    try {
      const created = await apiClient.post<any>('/sports/fixtures', fixture);
      set((s) => ({ fixtures: [{ ...fixture, id: created.id || nextId(), status: 'Upcoming' }, ...s.fixtures] }));
    } catch {
      set((s) => ({ fixtures: [{ ...fixture, id: nextId(), status: 'Upcoming' }, ...s.fixtures] }));
    }
  },

  updateFixtureResult: (id, scoreHome, scoreAway, result) => {
    set((s) => ({
      fixtures: s.fixtures.map((f) =>
        f.id === id ? { ...f, status: 'Completed' as FixtureStatus, scoreHome, scoreAway, result } : f
      ),
    }));
  },

  cancelFixture: (id) => {
    set((s) => ({
      fixtures: s.fixtures.map((f) => (f.id === id ? { ...f, status: 'Cancelled' as FixtureStatus } : f)),
    }));
  },

  postponeFixture: (id) => {
    set((s) => ({
      fixtures: s.fixtures.map((f) => (f.id === id ? { ...f, status: 'Postponed' as FixtureStatus } : f)),
    }));
  },

  addParticipation: (record) => {
    const newRecord: ParticipationRecord = { ...record, id: nextId() };
    set((s) => ({ participation: [newRecord, ...s.participation] }));
  },

  deleteParticipation: (id) => {
    set((s) => ({ participation: s.participation.filter((p) => p.id !== id) }));
  },

  addEquipment: (equip) => {
    const newEquip: SportsEquipment = { ...equip, id: nextId() };
    set((s) => ({ equipment: [newEquip, ...s.equipment] }));
  },

  updateEquipment: (id, updates) => {
    set((s) => ({ equipment: s.equipment.map((e) => (e.id === id ? { ...e, ...updates } : e)) }));
  },

  deleteEquipment: (id) => {
    set((s) => ({ equipment: s.equipment.filter((e) => e.id !== id) }));
  },

  addAchievement: (ach) => {
    const newAch: Achievement = { ...ach, id: nextId() };
    set((s) => ({ achievements: [newAch, ...s.achievements] }));
  },

  deleteAchievement: (id) => {
    set((s) => ({ achievements: s.achievements.filter((a) => a.id !== id) }));
  },

  grantAccess: (record) => {
    const newRecord: AccessRecord = { ...record, id: nextId(), grantedDate: todayISO() };
    set((s) => ({ accessRecords: [newRecord, ...s.accessRecords] }));
  },

  revokeAccess: (id) => {
    set((s) => ({ accessRecords: s.accessRecords.filter((a) => a.id !== id) }));
  },

  loadClubs: async () => {
    try {
      const data = await apiClient.get<any[]>('/sports/clubs');
      set({ clubs: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadFixtures: async () => {
    try {
      const data = await apiClient.get<any[]>('/sports/fixtures');
      set({ fixtures: (data || []).map((d) => ({ ...d, id: d.id || nextId() })) });
    } catch {}
  },
  loadAll: async () => {
    await Promise.all([
      get().loadClubs(),
      get().loadFixtures(),
    ]);
  },

}));
