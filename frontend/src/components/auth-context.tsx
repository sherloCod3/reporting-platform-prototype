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
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

/** Provider de autenticacao. Gerencia sessao, token e dados do usuario. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storedUser = localStorage.getItem('@qreports:user');
      const storedClient = localStorage.getItem('@qreports:client');

      if (storedUser) {
        setUser(JSON.parse(storedUser));
        if (storedClient) {
          setClient(JSON.parse(storedClient));
        }
      }
    } catch (error) {
      console.error('Failed to parse auth storage:', error);
      localStorage.removeItem('@qreports:user');
      localStorage.removeItem('@qreports:client');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Autentica o usuario e armazena a sessao no localStorage (só dados do usuario). O token já vem via HttpOnly cookie */
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/login', { email, password });
      const { user, client } = response.data.data;

      localStorage.setItem('@qreports:user', JSON.stringify(user));
      localStorage.setItem('@qreports:client', JSON.stringify(client));

      setUser(user);
      setClient(client);

      toast.success('Login realizado com sucesso!');
      router.push('/');
    } catch (error: unknown) {
      console.error(error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Falha no login';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      localStorage.removeItem('@qreports:user');
      localStorage.removeItem('@qreports:client');
      setUser(null);
      setClient(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        client,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
