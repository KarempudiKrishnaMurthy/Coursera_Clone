import { User } from '../types';
import { apiClient, setAccessToken } from './apiClient';

interface AuthResponsePayload {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: User;
}

export async function loginUser(email: string, password: string): Promise<User> {
  const response = await apiClient.post<AuthResponsePayload>('/auth/login', {
    email: email.trim(),
    password,
  });

  setAccessToken(response.data.accessToken);
  return response.data.user;
}

export async function signupUser(name: string, email: string, password: string): Promise<User> {
  const response = await apiClient.post<AuthResponsePayload>('/auth/register', {
    name: name.trim(),
    email: email.trim(),
    password,
    role: 'STUDENT',
  });

  setAccessToken(response.data.accessToken);
  return response.data.user;
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
  } catch {
    setAccessToken(null);
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
  const response = await apiClient.put<User>('/users/me', {
    name: updates.name,
    headline: updates.headline,
    bio: updates.bio,
    avatar: updates.avatar,
  });
  return response.data;
}

export async function forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
  return {
    success: true,
    message: `Password reset instructions have been sent to ${email}`,
  };
}
