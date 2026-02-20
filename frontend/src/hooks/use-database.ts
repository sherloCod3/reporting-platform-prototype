'use client';

import { useContext } from 'react';
import { DatabaseContext } from '@/contexts/db-context';

/** Hook para acessar o contexto de banco de dados. Deve ser usado dentro de DatabaseProvider. */
export function useDatabase() {
  const context = useContext(DatabaseContext);

  if (!context) {
    throw new Error('useDatabase must be used within DatabaseProvider');
  }

  return context;
}
