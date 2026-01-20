'use client';

import { createContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/api';
import { toast } from 'sonner';

interface User {
    id: number;
    email: string;
    role: 'admin' | 'user' | 'viewer';
}

interface Client {
    id: number;
    slug: string;
}

interface AuthContextType {
    user: User | null;
    client: Client | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [client, setClient] = useState<Client | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const storedToken = localStorage.getItem('@qreports:token');
        const storedUser = localStorage.getItem('@qreports:user');
        const storedClient = localStorage.getItem('@qreports:client');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            if (storedClient) setClient(JSON.parse(storedClient));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            const response = await api.post('/auth/login', { email, password });
            const { token, user, client } = response.data.data;

            localStorage.setItem('@qreports:token', token);
            localStorage.setItem('@qreports:user', JSON.stringify(user));
            localStorage.setItem('@qreports:client', JSON.stringify(client));

            setToken(token);
            setUser(user);
            setClient(client);

            toast.success('Login realizado com sucesso!');
            router.push('/');
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Falha no login');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('@qreports:token');
        localStorage.removeItem('@qreports:user');
        localStorage.removeItem('@qreports:client');
        setToken(null);
        setUser(null);
        setClient(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, client, token, isAuthenticated: !!token, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}


