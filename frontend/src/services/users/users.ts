import { api } from '@/utils/api';

/**
 * Represents a system user.
 */
export interface User {
    id: number;
    email: string;
    role: 'admin' | 'user' | 'viewer';
    client_id: number;
    /** Status flag: 1 for active, 0 for inactive */
    active: number;
    client_slug?: string;
}

/**
 * Service for managing user data.
 * Handles CRUD operations via the backend API.
 */
export const UserService = {
    /**
     * Retrieves all registered users.
     */
    async getAll(): Promise<User[]> {
        const response = await api.get('/auth/users');
        return response.data.data;
    },

    /**
     * Creates a new user.
     * @param data - The user data to create.
     */
    async create(data: Partial<User>): Promise<User> {
        const response = await api.post('/auth/users', data);
        return response.data.data;
    },

    /**
     * Updates an existing user.
     * @param id - The ID of the user to update.
     * @param data - The partial data to update.
     */
    async update(id: number, data: Partial<User>): Promise<User> {
        const response = await api.put(`/auth/users/${id}`, data);
        return response.data;
    },

    /**
     * Deletes a user by ID.
     * @param id - The ID of the user to delete.
     */
    async delete(id: number): Promise<void> {
        await api.delete(`/auth/users/${id}`);
    }
};
