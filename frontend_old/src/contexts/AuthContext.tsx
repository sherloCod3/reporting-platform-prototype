import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { AuthContext, type Client, type User } from './AuthContextType';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('@qreports:token')
  ); // token em memória (lazy initialization)
  const [user, setUser] = useState<User | null>(null); // usuário em memória
  const [client, setClient] = useState<Client | null>(null); // cliente em memória
  const isAuthenticated = !!token;

  async function login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password }); // chama o backend
    const { token: newToken, user, client } = response.data.data; // pega os dados do response

    localStorage.setItem('@qreports:token', newToken); // persiste o token no localStorage
    setToken(newToken); // atualiza o token em memória
    setUser(user); // atualiza o usuário em memória
    setClient(client); // atualiza o cliente em memória
  }

  function logout() {
    localStorage.removeItem('@qreports:token');
    setToken(null);
    setUser(null);
    setClient(null);
  }

  useEffect(() => {
    if (token && !user) {
      api
        .get('/auth/me')
        .then(res => {
          setUser(res.data.data.user);
          setClient(res.data.data.client);
        })
        .catch(() => {
          logout(); // se token inválido, desloga
        });
    }
  }, [token, user]);

  const value = useMemo(
    () => ({
      user,
      client,
      token,
      isAuthenticated,
      login,
      logout
    }),
    [user, client, token, isAuthenticated]
  ); // memo do contexto
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
