import { createContext } from 'react';

export type User = { id: number; email: string; role: 'admin' | 'user' };
export type Client = { id: number; slug: string };

export type AuthContextData = {
    user: User | null; // user logado
    client: Client | null;
    token: string | null;
    isAuthenticated: boolean; // flag
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
};

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);
