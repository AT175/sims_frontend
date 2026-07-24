import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthUser, RoleId } from '@shared/types';
import { authApi } from '@shared/api/authApi';
import { apiClient } from '@shared/api/apiClient';
import { useNotificationStore } from './notificationStore';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isTempLogin: boolean;
  login: (username: string, password: string) => Promise<void>;
  loginTemp: (username: string, password: string) => Promise<void>;
  logout: () => void;
  switchRole: (roleId: RoleId) => Promise<void>;
  updateProfile: (updates: { displayName?: string; profilePictureUrl?: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  uploadProfilePicture: (base64Image: string) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isTempLogin: false,

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(username, password);

      const user: AuthUser = {
        id: response.user.id,
        tenantId: response.user.tenantId,
        schoolName: response.user.schoolName ?? 'Unknown School',
        schoolLogoUrl: response.user.schoolLogoUrl,
        profilePictureUrl: response.user.profilePictureUrl ?? null,
        username: response.user.username,
        displayName: response.user.displayName,
        roles: response.user.roles as RoleId[],
        activeRole: response.user.activeRole as RoleId,
        token: response.accessToken,
        refreshToken: response.refreshToken,
      };

      apiClient.setAuth(user.token, user.tenantId);
      set({ user, isAuthenticated: true, isLoading: false, isTempLogin: false });
      useNotificationStore.getState().addNotification({
        title: 'Welcome back',
        message: `Logged in as ${user.displayName} (${user.activeRole})`,
        type: 'success',
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Login failed',
      });
    }
  },

  loginTemp: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.loginTemp(username, password);

      const user: AuthUser = {
        id: response.user.id,
        tenantId: response.user.tenantId,
        schoolName: response.user.schoolName ?? 'Unknown School',
        schoolLogoUrl: response.user.schoolLogoUrl,
        profilePictureUrl: response.user.profilePictureUrl ?? null,
        username: response.user.username,
        displayName: response.user.displayName,
        roles: response.user.roles as RoleId[],
        activeRole: response.user.activeRole as RoleId,
        token: response.accessToken,
        refreshToken: response.refreshToken,
      };

      apiClient.setAuth(user.token, user.tenantId);
      set({ user, isAuthenticated: true, isLoading: false, isTempLogin: true });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Login failed',
      });
    }
  },

  logout: () => {
    apiClient.setAuth(null, null);
    set({ user: null, isAuthenticated: false, error: null, isTempLogin: false });
  },

  switchRole: async (roleId: RoleId) => {
    const currentUser = get().user;
    if (!currentUser) return;

    // If role not in user's roles array, add it (e.g., assigned via access control)
    let userWithRole = currentUser;
    if (!currentUser.roles.includes(roleId)) {
      userWithRole = { ...currentUser, roles: [...currentUser.roles, roleId] };
      set({ user: userWithRole });
    }

    // Demo mode: switch role locally without API
    if (currentUser.token === 'demo-token') {
      set({ user: { ...userWithRole, activeRole: roleId }, isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await authApi.switchRole(roleId);

      const user: AuthUser = {
        ...currentUser,
        activeRole: response.user.activeRole as RoleId,
        profilePictureUrl: response.user.profilePictureUrl ?? currentUser.profilePictureUrl,
        token: response.accessToken,
        refreshToken: response.refreshToken,
      };

      apiClient.setAuth(user.token, user.tenantId);
      set({ user, isLoading: false });
      useNotificationStore.getState().addNotification({
        title: 'Role switched',
        message: `You are now using the ${roleId} dashboard.`,
        type: 'info',
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Role switch failed',
      });
    }
  },

  updateProfile: async (updates) => {
    const currentUser = get().user;
    if (!currentUser) return;
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.updateProfile(updates);
      set({ user: { ...currentUser, displayName: response.displayName, profilePictureUrl: response.profilePictureUrl }, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : 'Profile update failed' });
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.changePassword(currentPassword, newPassword);
      set({ isLoading: false });
      useNotificationStore.getState().addNotification({
        title: 'Password changed',
        message: 'Your password has been updated successfully.',
        type: 'success',
      });
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : 'Password change failed' });
    }
  },

  uploadProfilePicture: async (base64Image) => {
    const currentUser = get().user;
    if (!currentUser) return;
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.uploadProfilePicture(base64Image);
      set({ user: { ...currentUser, profilePictureUrl: response.profilePictureUrl }, isLoading: false });
      useNotificationStore.getState().addNotification({
        title: 'Profile picture updated',
        message: 'Your profile picture has been uploaded successfully.',
        type: 'success',
      });
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : 'Upload failed' });
    }
  },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'sims-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated, isTempLogin: state.isTempLogin }),
      onRehydrateStorage: () => (state) => {
        if (state?.user?.token) {
          apiClient.setAuth(state.user.token, state.user.tenantId);
        }
      },
    },
  ),
);
