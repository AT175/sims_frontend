import { apiClient } from './apiClient';

export interface VehicleDto {
  id: string; plate: string; type: string; insuranceExpiry: string | null;
  roadworthinessExpiry: string | null; status: string; assignedDriver: string | null; notes: string | null;
}

export interface TripLogDto {
  id: string; date: string; vehiclePlate: string; driverName: string; route: string;
  mileage: number; purpose: string; departureTime: string | null; returnTime: string | null;
}

export const transportApi = {
  async getVehicles(): Promise<VehicleDto[]> { return apiClient.get<VehicleDto[]>('/transport/vehicles'); },
  async createVehicle(data: any): Promise<VehicleDto> { return apiClient.post<VehicleDto>('/transport/vehicles', data); },
  async getTrips(): Promise<TripLogDto[]> { return apiClient.get<TripLogDto[]>('/transport/trips'); },
  async createTrip(data: any): Promise<TripLogDto> { return apiClient.post<TripLogDto>('/transport/trips', data); },
};
