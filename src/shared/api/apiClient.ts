const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || (__DEV__ ? 'http://localhost:3000/api' : 'https://sims-backends-3.onrender.com/api');

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
}

type AuthChangeCallback = (token: string | null, refreshToken: string | null, tenantId: string | null) => void;

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private refreshToken: string | null = null;
  private tenantId: string | null = null;
  private authChangeCallback: AuthChangeCallback | null = null;
  private isRefreshing = false;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setAuth(token: string | null, tenantId: string | null, refreshToken?: string | null) {
    this.token = token;
    this.tenantId = tenantId;
    if (refreshToken !== undefined) {
      this.refreshToken = refreshToken;
    }
  }

  onAuthChange(callback: AuthChangeCallback) {
    this.authChangeCallback = callback;
  }

  private async tryRefresh(): Promise<boolean> {
    if (!this.refreshToken) return false;
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
      if (!response.ok) return false;
      const data = await response.json();
      this.token = data.accessToken;
      this.refreshToken = data.refreshToken;
      if (this.authChangeCallback) {
        this.authChangeCallback(this.token, this.refreshToken, this.tenantId);
      }
      return true;
    } catch {
      return false;
    }
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const token = this.token;
    const tenantId = this.tenantId;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (tenantId) {
      headers['X-Tenant-Id'] = tenantId;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (response.status === 401 && token && !this.isRefreshing) {
      this.isRefreshing = true;
      const refreshed = await this.tryRefresh();
      this.isRefreshing = false;
      if (refreshed) {
        return this.request<T>(path, options);
      }
      this.token = null;
      this.refreshToken = null;
      if (this.authChangeCallback) {
        this.authChangeCallback(null, null, null);
      }
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `API error: ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>(path);
  }

  post<T>(path: string, body?: Record<string, unknown>): Promise<T> {
    return this.request<T>(path, { method: 'POST', body });
  }

  put<T>(path: string, body?: Record<string, unknown>): Promise<T> {
    return this.request<T>(path, { method: 'PUT', body });
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
