import { apiClient } from './apiClient';

export interface BookDto {
  id: string; title: string; author: string; category: string | null;
  isbn: string | null; totalCopies: number; availableCopies: number;
}

export interface CirculationDto {
  id: string; date: string; bookId: string; bookTitle: string;
  borrowerName: string; borrowerClass: string | null; dueDate: string;
  returnDate: string | null; status: string;
}

export const libraryApi = {
  async getBooks(): Promise<BookDto[]> { return apiClient.get<BookDto[]>('/library/books'); },
  async createBook(data: any): Promise<BookDto> { return apiClient.post<BookDto>('/library/books', data); },
  async getCirculation(): Promise<CirculationDto[]> { return apiClient.get<CirculationDto[]>('/library/circulation'); },
  async createCirculation(data: any): Promise<CirculationDto> { return apiClient.post<CirculationDto>('/library/circulation', data); },
  async returnBook(id: string): Promise<CirculationDto> { return apiClient.put<CirculationDto>(`/library/circulation/${id}/return`, {}); },
};
