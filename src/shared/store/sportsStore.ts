import { create } from 'zustand';

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

const INITIAL_CLUBS: Club[] = [
  { id: '1', name: 'Debate Society', category: 'Academic', patron: 'Mrs. Boateng', memberCount: 45, meetingDay: 'Friday' },
  { id: '2', name: 'Science Club', category: 'Academic', patron: 'Mr. Adjei', memberCount: 62, meetingDay: 'Wednesday' },
  { id: '3', name: 'Drama Club', category: 'Arts & Culture', patron: 'Mrs. Mensah', memberCount: 38, meetingDay: 'Tuesday' },
  { id: '4', name: 'Math Club', category: 'Academic', patron: 'Mr. Mensah', memberCount: 52, meetingDay: 'Thursday' },
  { id: '5', name: 'Red Cross', category: 'Service', patron: 'Mr. Tetteh', memberCount: 40, meetingDay: 'Saturday' },
];

const INITIAL_FIXTURES: Fixture[] = [
  { id: '1', date: '2026-07-12', sport: 'Football', match: 'Aggrey vs Danquah', venue: 'School field', status: 'Upcoming' },
  { id: '2', date: '2026-07-12', sport: 'Volleyball', match: 'Mensah vs Yaa Asantewaa', venue: 'Court A', status: 'Upcoming' },
  { id: '3', date: '2026-07-20', sport: 'Athletics', match: 'Inter-school Relay', venue: 'Kumasi Stadium', status: 'Upcoming' },
  { id: '4', date: '2026-06-15', sport: 'Football', match: 'School vs KNUST SHS', venue: 'School field', status: 'Completed', scoreHome: '3', scoreAway: '1', result: 'Won 3-1' },
];

const INITIAL_PARTICIPATION: ParticipationRecord[] = [
  { id: '1', date: '2026-07-05', activity: 'Science Club meeting', participantCount: 58 },
  { id: '2', date: '2026-07-04', activity: 'Football practice', participantCount: 32 },
  { id: '3', date: '2026-07-03', activity: 'Debate practice', participantCount: 40 },
];

const INITIAL_EQUIPMENT: SportsEquipment[] = [
  { id: '1', item: 'Footballs', quantity: 15, condition: 'Good', location: 'Sports Store' },
  { id: '2', item: 'Volleyballs', quantity: 8, condition: 'Good', location: 'Sports Store' },
  { id: '3', item: 'Jerseys (sets)', quantity: 12, condition: 'Fair', location: 'Sports Store', notes: '6 good, 6 worn' },
  { id: '4', item: 'Athletics spikes', quantity: 20, condition: 'Good', location: 'Equipment Room' },
  { id: '5', item: 'Bib sets', quantity: 10, condition: 'Fair', location: 'Sports Store' },
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: '1', date: '2026-06', achievement: 'Inter-school Football Champions', level: 'Regional', recipients: 'Football Team' },
  { id: '2', date: '2026-05', achievement: 'National Science Quiz - 3rd Place', level: 'National', recipients: 'Science Club' },
  { id: '3', date: '2026-03', achievement: 'Debate Competition Winners', level: 'Zonal', recipients: 'Debate Society' },
];

const INITIAL_ACCESS: AccessRecord[] = [
  { id: '1', personName: 'Mr. Owusu', role: 'Sports Coordinator', resource: 'Sports Fixtures', accessLevel: 'Full', grantedDate: '2026-01-05', grantedBy: 'Headmaster' },
  { id: '2', personName: 'Mr. Owusu', role: 'Sports Coordinator', resource: 'Equipment & Kits', accessLevel: 'Full', grantedDate: '2026-01-05', grantedBy: 'Headmaster' },
  { id: '3', personName: 'All Patrons', role: 'Patron', resource: 'Clubs & Societies', accessLevel: 'Full', grantedDate: '2026-01-10', grantedBy: 'Sports Coordinator' },
  { id: '4', personName: 'All Students', role: 'Student', resource: 'Sports Fixtures', accessLevel: 'Read Only', grantedDate: '2026-01-10', grantedBy: 'Sports Coordinator' },
  { id: '5', personName: 'All Students', role: 'Student', resource: 'Equipment & Kits', accessLevel: 'No Access', grantedDate: '2026-01-10', grantedBy: 'Sports Coordinator' },
];

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
}

export const useSportsStore = create<SportsState>((set) => ({
  clubs: INITIAL_CLUBS,
  fixtures: INITIAL_FIXTURES,
  participation: INITIAL_PARTICIPATION,
  equipment: INITIAL_EQUIPMENT,
  achievements: INITIAL_ACHIEVEMENTS,
  accessRecords: INITIAL_ACCESS,

  addClub: (club) => {
    const newClub: Club = { ...club, id: nextId() };
    set((s) => ({ clubs: [newClub, ...s.clubs] }));
  },

  updateClub: (id, updates) => {
    set((s) => ({ clubs: s.clubs.map((c) => (c.id === id ? { ...c, ...updates } : c)) }));
  },

  deleteClub: (id) => {
    set((s) => ({ clubs: s.clubs.filter((c) => c.id !== id) }));
  },

  addFixture: (fixture) => {
    const newFixture: Fixture = { ...fixture, id: nextId(), status: 'Upcoming' };
    set((s) => ({ fixtures: [newFixture, ...s.fixtures] }));
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
}));
