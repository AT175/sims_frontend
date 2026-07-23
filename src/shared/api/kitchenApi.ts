import { apiClient } from './apiClient';

export interface KitchenStockDto {
  id: string; name: string; quantity: number; unit: string | null;
  reorderLevel: number; category: string | null;
}

export interface KitchenMenuDto {
  id: string; day: string; breakfast: string; lunch: string; dinner: string;
}

export const kitchenApi = {
  async getStock(): Promise<KitchenStockDto[]> { return apiClient.get<KitchenStockDto[]>('/kitchen/stock'); },
  async createStock(data: any): Promise<KitchenStockDto> { return apiClient.post<KitchenStockDto>('/kitchen/stock', data); },
  async getMenus(): Promise<KitchenMenuDto[]> { return apiClient.get<KitchenMenuDto[]>('/kitchen/menus'); },
  async createMenu(data: any): Promise<KitchenMenuDto> { return apiClient.post<KitchenMenuDto>('/kitchen/menus', data); },
};
