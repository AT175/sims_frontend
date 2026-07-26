import { create } from 'zustand';
import { apiClient } from '@shared/api/apiClient';

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

const initialVehicles: Vehicle[] = [];

const initialTrips: TripLog[] = [];

const initialMaintenance: MaintenanceRecord[] = [];

const initialFuelLogs: FuelLog[] = [];

const initialDrivers: Driver[] = [];

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

  // Backend load methods
  loadVehicles: () => Promise<void>;
  loadTrips: () => Promise<void>;
  loadDrivers: () => Promise<void>;
  loadMaintenance: () => Promise<void>;
  loadAll: () => Promise<void>;
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

  loadVehicles: async () => {
    try {
      const data = await apiClient.get<any[]>('/transport/vehicles');
      set({ vehicles: (data || []).map((d) => ({ ...d, id: d.id || genId() })) });
    } catch {}
  },
  loadTrips: async () => {
    try {
      const data = await apiClient.get<any[]>('/transport/trips');
      set({ trips: (data || []).map((d) => ({ ...d, id: d.id || genId() })) });
    } catch {}
  },
  loadDrivers: async () => {
    try {
      const data = await apiClient.get<any[]>('/transport/drivers');
      set({ drivers: (data || []).map((d) => ({ ...d, id: d.id || genId() })) });
    } catch {}
  },
  loadMaintenance: async () => {
    try {
      const data = await apiClient.get<any[]>('/transport/maintenance');
      set({ maintenance: (data || []).map((d) => ({ ...d, id: d.id || genId() })) });
    } catch {}
  },
  loadAll: async () => {
    await Promise.all([
      get().loadVehicles(),
      get().loadTrips(),
      get().loadDrivers(),
      get().loadMaintenance(),
    ]);
  },
}));
