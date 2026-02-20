import { api } from '@/utils/api';

import type { LoginResponse, User } from '@shared/types/api.types';

export type { LoginResponse, User };

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Client {
  id: number;
  slug: string;
}

export interface Client {
  id: number;
  slug: string;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async getUsers(): Promise<User[]> {
    const response = await api.get('/auth/users');
    return response.data;
  }
};
