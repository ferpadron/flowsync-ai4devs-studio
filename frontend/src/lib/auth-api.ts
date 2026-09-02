import { apiRequest } from './api';

export type User = {
  id: number;
  fullName: string | null;
  email: string;
  createdAt: string;
  updatedAt: string;
  initials: string;
};

export type AuthPayload = {
  user: User;
  token: string;
};

export function signup(input: {
  email: string;
  password: string;
  passwordConfirmation: string;
}) {
  return apiRequest<AuthPayload>('/api/v1/auth/signup', {
    method: 'POST',
    body: { ...input, fullName: null },
  });
}

export function login(input: { email: string; password: string }) {
  return apiRequest<AuthPayload>('/api/v1/auth/login', {
    method: 'POST',
    body: input,
  });
}

export function getProfile(token: string) {
  return apiRequest<User>('/api/v1/account/profile', { token });
}

export function logout(token: string) {
  return apiRequest<{ message: string }>('/api/v1/account/logout', {
    method: 'POST',
    token,
  });
}
