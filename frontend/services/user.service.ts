
import api from '@/lib/api';

export interface User {
    id: number;
    email: string;
    role: 'admin' | 'user' | 'viewer';
    client_id: number;
    client_slug?: string;
    active: 0 | 1;
}

export const UserService = {
    getAll: async () => {
        const response = await api.get('/auth/users');
        return response.data.data as User[];
    },

    create: async (data: any) => {
        const response = await api.post('/auth/users', data);
        return response.data;
    },

    update: async (id: number, data: any) => {
        const response = await api.put(`/auth/users/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/auth/users/${id}`);
        return response.data;
    }
};
