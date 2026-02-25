import { api } from '@/utils/api';

export interface User {
  id: number;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  client_id: number;
  active: number;
  client_slug?: string;
}

export const UserService = {
  async getAll(): Promise<User[]> {
    const response = await api.get('/auth/users');
    return response.data;
  },

  async create(data: Partial<User>): Promise<User> {
    const response = await api.post('/auth/users', data);
    return response.data;
  },

  async update(id: number, data: Partial<User>): Promise<User> {
    const response = await api.put(`/auth/users/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/auth/users/${id}`);
  }
};
