import { create } from 'zustand';
import { User } from '../types';
import * as authService from '../services/auth.service';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  initAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  enrollCourseInUser: (courseId: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  initAuth: async () => {
    try {
      const session = await authService.refreshSession();
      if (session && session.user) {
        set({ user: session.user, isAuthenticated: true, isInitialized: true });
        return;
      }
    } catch {
      // No active refresh cookie
    }
    set({ user: null, isAuthenticated: false, isInitialized: true });
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const user = await authService.loginUser(email, password);
      set({ user, isAuthenticated: true, isLoading: false, isInitialized: true });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  signup: async (name, email, password) => {
    set({ isLoading: true });
    try {
      const user = await authService.signupUser(name, email, password);
      set({ user, isAuthenticated: true, isLoading: false, isInitialized: true });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await authService.logoutUser();
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },

  updateProfile: async (updates) => {
    set({ isLoading: true });
    try {
      const updated = await authService.updateUserProfile(updates);
      set({ user: updated, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  enrollCourseInUser: (courseId: string) => {
    const { user } = get();
    if (!user) return;
    const currentEnrolled = user.enrolledCourseIds || [];
    if (!currentEnrolled.includes(courseId)) {
      set({
        user: {
          ...user,
          enrolledCourseIds: [...currentEnrolled, courseId],
        },
      });
    }
  },
}));
