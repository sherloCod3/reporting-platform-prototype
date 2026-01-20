import { api } from '@/utils/api';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    data: {
        token: string;
        user: User;
        client: Client;
        expiresIn: string;
    };
}

export interface User {
    id: number;
    email: string;
    role: 'admin' | 'user' | 'viewer';
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
    },
};
