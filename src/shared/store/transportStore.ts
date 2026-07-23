import { create } from 'zustand';

// ── Types ──

export type VehicleStatus = 'Active' | 'Maintenance' | 'Retired';
export type VehicleType = 'Coaster Bus (30-seater)' | 'Mini Bus (15-seater)' | 'Pickup Truck' | 'Saloon Car' | 'Van' | 'Truck';
export type MaintenanceStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Upcoming';
export type MaintenanceType = 'Oil Change' | 'Tire Replacement' | 'Engine Repair' | 'General Service' | 'Brake Service' | 'Body Work' | 'Other';
export type DriverStatus = 'On Duty' | 'Off Duty' | 'On Leave';
export type LicenseClass = 'B' | 'C' | 'D' | 'E';

export interface Vehicle {
  id: string;
  plate: string;
  type: VehicleType;
  insuranceExpiry: string;
  roadworthinessExpiry: string;
  status: VehicleStatus;
  assignedDriver?: string;
  notes?: string;
}

export interface TripLog {
  id: string;
  date: string;
  vehiclePlate: string;
  driverName: string;
  route: string;
  mileage: number;
  purpose: string;
  departureTime: string;
  returnTime?: string;
}

export interface MaintenanceRecord {
  id: string;
  vehiclePlate: string;
  type: MaintenanceType;
  dueDate: string;
  status: MaintenanceStatus;
  cost?: number;
  notes?: string;
  completedDate?: string;
}

export interface FuelLog {
  id: string;
  date: string;
  vehiclePlate: string;
  litres: number;
  costPerLitre: number;
  totalCost: number;
  odometer?: number;
  filledBy: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  license: LicenseClass;
  licenseExpiry: string;
  assignedVehicle: string;
  status: DriverStatus;
  dutyStart?: string;
  dutyEnd?: string;
}

// ── Constants ──

export const VEHICLE_STATUSES: VehicleStatus[] = ['Active', 'Maintenance', 'Retired'];
export const VEHICLE_TYPES: VehicleType[] = ['Coaster Bus (30-seater)', 'Mini Bus (15-seater)', 'Pickup Truck', 'Saloon Car', 'Van', 'Truck'];
export const MAINTENANCE_STATUSES: MaintenanceStatus[] = ['Upcoming', 'Scheduled', 'In Progress', 'Completed'];
export const MAINTENANCE_TYPES: MaintenanceType[] = ['Oil Change', 'Tire Replacement', 'Engine Repair', 'General Service', 'Brake Service', 'Body Work', 'Other'];
export const DRIVER_STATUSES: DriverStatus[] = ['On Duty', 'Off Duty', 'On Leave'];
export const LICENSE_CLASSES: LicenseClass[] = ['B', 'C', 'D', 'E'];

const today = new Date().toISOString().slice(0, 10);

// ── Initial Data ──

const initialVehicles: Vehicle[] = [
  { id: 'v1', plate: 'GV-1122-1', type: 'Coaster Bus (30-seater)', insuranceExpiry: '2026-12-31', roadworthinessExpiry: '2026-09-30', status: 'Active', assignedDriver: 'Mr. Kwabena' },
  { id: 'v2', plate: 'GV-2233-1', type: 'Mini Bus (15-seater)', insuranceExpiry: '2026-08-31', roadworthinessExpiry: '2026-07-15', status: 'Active', assignedDriver: 'Mr. Fiifi' },
  { id: 'v3', plate: 'GV-3344-1', type: 'Pickup Truck', insuranceExpiry: '2027-01-31', roadworthinessExpiry: '2026-11-30', status: 'Active', assignedDriver: 'Mr. Emma' },
  { id: 'v4', plate: 'GV-4455-1', type: 'Coaster Bus (30-seater)', insuranceExpiry: '2026-10-31', roadworthinessExpiry: '2026-08-20', status: 'Maintenance', notes: 'Engine overhaul in progress' },
  { id: 'v5', plate: 'GV-5566-1', type: 'Saloon Car', insuranceExpiry: '2026-09-30', roadworthinessExpiry: '2026-10-15', status: 'Active', assignedDriver: 'Mr. Kojo' },
];

const initialTrips: TripLog[] = [
  { id: 't1', date: '2026-07-06', vehiclePlate: 'GV-1122-1', driverName: 'Mr. Kwabena', route: 'Campus -> Kumasi', mileage: 85, purpose: 'Stores procurement', departureTime: '08:00', returnTime: '14:30' },
  { id: 't2', date: '2026-07-05', vehiclePlate: 'GV-2233-1', driverName: 'Mr. Fiifi', route: 'Campus -> Ejisu', mileage: 42, purpose: 'Sports event', departureTime: '09:00', returnTime: '13:00' },
  { id: 't3', date: '2026-07-04', vehiclePlate: 'GV-3344-1', driverName: 'Mr. Emma', route: 'Campus -> KATH', mileage: 88, purpose: 'Student referral', departureTime: '10:00', returnTime: '16:00' },
];

const initialMaintenance: MaintenanceRecord[] = [
  { id: 'm1', vehiclePlate: 'GV-1122-1', type: 'Oil Change', dueDate: '2026-07-15', status: 'Upcoming' },
  { id: 'm2', vehiclePlate: 'GV-4455-1', type: 'Engine Repair', dueDate: '2026-07-10', status: 'In Progress', notes: 'Engine overhaul — parts ordered', cost: 3500 },
  { id: 'm3', vehiclePlate: 'GV-2233-1', type: 'Tire Replacement', dueDate: '2026-08-01', status: 'Scheduled', cost: 1200 },
  { id: 'm4', vehiclePlate: 'GV-3344-1', type: 'General Service', dueDate: '2026-07-20', status: 'Upcoming' },
];

const initialFuelLogs: FuelLog[] = [
  { id: 'f1', date: '2026-07-06', vehiclePlate: 'GV-1122-1', litres: 60, costPerLitre: 14, totalCost: 840, odometer: 45200, filledBy: 'Mr. Kwabena' },
  { id: 'f2', date: '2026-07-05', vehiclePlate: 'GV-2233-1', litres: 40, costPerLitre: 14, totalCost: 560, odometer: 32100, filledBy: 'Mr. Fiifi' },
  { id: 'f3', date: '2026-07-03', vehiclePlate: 'GV-3344-1', litres: 35, costPerLitre: 14, totalCost: 490, odometer: 28500, filledBy: 'Mr. Emma' },
];

const initialDrivers: Driver[] = [
  { id: 'd1', name: 'Mr. Kwabena', phone: '024 111 2222', license: 'C', licenseExpiry: '2027-06-30', assignedVehicle: 'GV-1122-1', status: 'On Duty', dutyStart: '08:00', dutyEnd: '16:00' },
  { id: 'd2', name: 'Mr. Fiifi', phone: '024 333 4444', license: 'C', licenseExpiry: '2026-11-30', assignedVehicle: 'GV-2233-1', status: 'Off Duty' },
  { id: 'd3', name: 'Mr. Emma', phone: '024 555 6666', license: 'B', licenseExpiry: '2027-03-31', assignedVehicle: 'GV-3344-1', status: 'On Duty', dutyStart: '10:00', dutyEnd: '18:00' },
  { id: 'd4', name: 'Mr. Kojo', phone: '024 777 8888', license: 'C', licenseExpiry: '2026-09-30', assignedVehicle: 'GV-5566-1', status: 'On Duty', dutyStart: '07:00', dutyEnd: '15:00' },
];

// ── Store ──

interface TransportState {
  vehicles: Vehicle[];
  trips: TripLog[];
  maintenance: MaintenanceRecord[];
  fuelLogs: FuelLog[];
  drivers: Driver[];

  // Vehicles
  addVehicle: (v: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  getActiveVehicles: () => Vehicle[];
  getMaintenanceVehicles: () => Vehicle[];
  getExpiringInsurance: (days: number) => Vehicle[];

  // Trips
  addTrip: (t: Omit<TripLog, 'id'>) => void;
  deleteTrip: (id: string) => void;
  getTodayTrips: () => TripLog[];

  // Maintenance
  addMaintenance: (m: Omit<MaintenanceRecord, 'id'>) => void;
  updateMaintenanceStatus: (id: string, status: MaintenanceStatus) => void;
  deleteMaintenance: (id: string) => void;
  getUpcomingMaintenance: () => MaintenanceRecord[];
  getInProgressMaintenance: () => MaintenanceRecord[];

  // Fuel
  addFuelLog: (f: Omit<FuelLog, 'id'>) => void;
  deleteFuelLog: (id: string) => void;
  getTotalFuelCost: () => number;
  getTotalFuelLitres: () => number;

  // Drivers
  addDriver: (d: Omit<Driver, 'id'>) => void;
  updateDriver: (id: string, updates: Partial<Driver>) => void;
  deleteDriver: (id: string) => void;
  getOnDutyDrivers: () => Driver[];
}

let counter = 100;
const genId = () => `tr-${++counter}-${Date.now()}`;

export const useTransportStore = create<TransportState>((set, get) => ({
  vehicles: initialVehicles,
  trips: initialTrips,
  maintenance: initialMaintenance,
  fuelLogs: initialFuelLogs,
  drivers: initialDrivers,

  // Vehicles
  addVehicle: (v) => set((s) => ({ vehicles: [...s.vehicles, { ...v, id: genId() }] })),
  updateVehicle: (id, updates) => set((s) => ({ vehicles: s.vehicles.map((v) => v.id === id ? { ...v, ...updates } : v) })),
  deleteVehicle: (id) => set((s) => ({ vehicles: s.vehicles.filter((v) => v.id !== id) })),
  getActiveVehicles: () => get().vehicles.filter((v) => v.status === 'Active'),
  getMaintenanceVehicles: () => get().vehicles.filter((v) => v.status === 'Maintenance'),
  getExpiringInsurance: (days) => {
    const limit = new Date();
    limit.setDate(limit.getDate() + days);
    return get().vehicles.filter((v) => {
      const expiry = new Date(v.insuranceExpiry);
      return expiry <= limit;
    });
  },

  // Trips
  addTrip: (t) => set((s) => ({ trips: [{ ...t, id: genId() }, ...s.trips] })),
  deleteTrip: (id) => set((s) => ({ trips: s.trips.filter((t) => t.id !== id) })),
  getTodayTrips: () => get().trips.filter((t) => t.date === today),

  // Maintenance
  addMaintenance: (m) => set((s) => ({ maintenance: [...s.maintenance, { ...m, id: genId() }] })),
  updateMaintenanceStatus: (id, status) => set((s) => ({
    maintenance: s.maintenance.map((m) => m.id === id ? {
      ...m,
      status,
      completedDate: status === 'Completed' ? today : m.completedDate,
    } : m),
  })),
  deleteMaintenance: (id) => set((s) => ({ maintenance: s.maintenance.filter((m) => m.id !== id) })),
  getUpcomingMaintenance: () => get().maintenance.filter((m) => m.status === 'Upcoming' || m.status === 'Scheduled'),
  getInProgressMaintenance: () => get().maintenance.filter((m) => m.status === 'In Progress'),

  // Fuel
  addFuelLog: (f) => set((s) => ({ fuelLogs: [{ ...f, id: genId() }, ...s.fuelLogs] })),
  deleteFuelLog: (id) => set((s) => ({ fuelLogs: s.fuelLogs.filter((f) => f.id !== id) })),
  getTotalFuelCost: () => get().fuelLogs.reduce((sum, f) => sum + f.totalCost, 0),
  getTotalFuelLitres: () => get().fuelLogs.reduce((sum, f) => sum + f.litres, 0),

  // Drivers
  addDriver: (d) => set((s) => ({ drivers: [...s.drivers, { ...d, id: genId() }] })),
  updateDriver: (id, updates) => set((s) => ({ drivers: s.drivers.map((d) => d.id === id ? { ...d, ...updates } : d) })),
  deleteDriver: (id) => set((s) => ({ drivers: s.drivers.filter((d) => d.id !== id) })),
  getOnDutyDrivers: () => get().drivers.filter((d) => d.status === 'On Duty'),
}));
