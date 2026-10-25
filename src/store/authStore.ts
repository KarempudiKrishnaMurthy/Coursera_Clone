import { create } from 'zustand';
import { User } from '../types';
import * as authService from '../services/auth.service';
import { setAccessToken } from '../services/apiClient';

const USER_STORAGE_KEY = 'coursehub_auth_user';

const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const persistUser = (user: User | null) => {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  } catch (err) {
    console.error('Failed to persist auth user', err);
  }
};

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

const initialUser = getStoredUser();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialUser,
  isAuthenticated: !!initialUser,
  isLoading: false,
  isInitialized: !!initialUser,

  initAuth: async () => {
    try {
      const session = await authService.refreshSession();
      if (session && session.user) {
        persistUser(session.user);
        set({ user: session.user, isAuthenticated: true, isInitialized: true });
        return;
      }
    } catch {
      // Refresh network error or unauthenticated
    }

    // Preserve local session if backend is offline or running standalone demo
    const stored = getStoredUser();
    if (stored) {
      set({ user: stored, isAuthenticated: true, isInitialized: true });
      return;
    }

    set({ user: null, isAuthenticated: false, isInitialized: true });
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const user = await authService.loginUser(email, password);
      persistUser(user);
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
      persistUser(user);
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
      persistUser(null);
      setAccessToken(null);
      set({ user: null, isAuthenticated: false, isInitialized: true });
    }
  },

  updateProfile: async (updates) => {
    set({ isLoading: true });
    try {
      const updated = await authService.updateUserProfile(updates);
      persistUser(updated);
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
      const updated = {
        ...user,
        enrolledCourseIds: [...currentEnrolled, courseId],
      };
      persistUser(updated);
      set({ user: updated });
    }
  },
}));
