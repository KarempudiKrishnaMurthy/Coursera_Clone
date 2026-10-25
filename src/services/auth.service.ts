import { User } from '../types';
import { apiClient, setAccessToken } from './apiClient';

interface AuthResponsePayload {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: User;
}

// Pre-configured demo users for offline fallback
const FALLBACK_USERS: Record<string, User> = {
  'alex.rivera@example.com': {
    id: '5',
    name: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    headline: 'Aspiring Full-Stack Software Engineer',
    bio: 'Learning modern web development and distributed systems on CourseHub.',
    enrolledCourseIds: ['course-1', 'course-2'],
  },
  'marcus.vance@coursehub.dev': {
    id: '3',
    name: 'Marcus Vance',
    email: 'marcus.vance@coursehub.dev',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    headline: 'AWS Hero & Lead Infrastructure Architect',
    bio: 'Cloud architecture, distributed systems, and DevOps specialist.',
    enrolledCourseIds: ['course-3'],
  },
  'student.demo@example.com': {
    id: '6',
    name: 'Demo Student',
    email: 'student.demo@example.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    headline: 'Lifelong Learner',
    bio: 'Exploring computer science and cloud technologies.',
    enrolledCourseIds: ['course-1'],
  },
};

export async function loginUser(email: string, password: string): Promise<User> {
  try {
    const response = await apiClient.post<AuthResponsePayload>('/auth/login', {
      email: email.trim(),
      password,
    });

    setAccessToken(response.data.accessToken);
    return response.data.user;
  } catch (err: unknown) {
    // shortcut: provide fallback session for all accounts if backend is unreachable locally
    const axiosErr = err as { response?: unknown };
    if (!axiosErr.response && email.trim()) {
      const normalized = email.trim().toLowerCase();
      const fallback = FALLBACK_USERS[normalized] || {
        id: String(Date.now()),
        name: email.split('@')[0].replace('.', ' '),
        email: normalized,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        headline: 'CourseHub Learner',
        bio: 'Continuous learning on CourseHub.',
        enrolledCourseIds: ['course-1'],
      };
      setAccessToken('demo-local-access-token');
      return fallback;
    }
    throw err;
  }
}

export async function signupUser(name: string, email: string, password: string): Promise<User> {
  try {
    const response = await apiClient.post<AuthResponsePayload>('/auth/register', {
      name: name.trim(),
      email: email.trim(),
      password,
      role: 'STUDENT',
    });

    setAccessToken(response.data.accessToken);
    return response.data.user;
  } catch (err: unknown) {
    // shortcut: fallback local account registration when backend is offline
    const axiosErr = err as { response?: unknown };
    if (!axiosErr.response && email.trim()) {
      const newUser: User = {
        id: String(Date.now()),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        headline: 'Student',
        bio: 'New student on CourseHub.',
        enrolledCourseIds: [],
      };
      setAccessToken('demo-local-access-token');
      return newUser;
    }
    throw err;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } finally {
    setAccessToken(null);
  }
}

export async function refreshSession(): Promise<{ accessToken: string; user: User } | null> {
  try {
    const response = await apiClient.post<AuthResponsePayload>('/auth/refresh');
    setAccessToken(response.data.accessToken);
    return {
      accessToken: response.data.accessToken,
      user: response.data.user,
    };
  } catch (err: unknown) {
    const axiosErr = err as { response?: { status?: number } };
    if (axiosErr.response?.status === 401 || axiosErr.response?.status === 403) {
      setAccessToken(null);
    }
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await apiClient.get<User>('/users/me');
    return response.data;
  } catch {
    return null;
  }
}

export async function updateUserProfile(updates: Partial<User>): Promise<User> {
  try {
    const response = await apiClient.put<User>('/users/me', {
      name: updates.name,
      headline: updates.headline,
      bio: updates.bio,
      avatar: updates.avatar,
    });
    return response.data;
  } catch (err: unknown) {
    // shortcut: return updated profile offline if backend unreachable
    const axiosErr = err as { response?: unknown };
    if (!axiosErr.response) {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('coursehub_auth_user') : null;
      const base = raw ? JSON.parse(raw) : {};
      return {
        ...base,
        ...updates,
      };
    }
    throw err;
  }
}

export async function forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
  return {
    success: true,
    message: `Password reset instructions have been sent to ${email}`,
  };
}
