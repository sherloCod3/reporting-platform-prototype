'use client';

import { useContext } from 'react';
import { AuthContext } from '@/components/auth-context';

/** Hook para acessar o contexto de autenticacao. Deve ser usado dentro de AuthProvider. */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
