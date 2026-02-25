'use client';

import { createContext, useCallback, useEffect, useState } from 'react';
import { api } from '@/utils/api';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

interface DatabaseStatus {
  connected: boolean;
  host: string;
  database: string;
  user: string;
  latency: string;
}

interface DatabaseContextType {
  status: DatabaseStatus | null;
  databases: string[];
  isLoading: boolean;
  fetchStatus: () => Promise<void>;
  fetchDatabases: () => Promise<void>;
  switchDatabase: (database: string) => Promise<void>;
  testConnection: () => Promise<void>;
}

export const DatabaseContext = createContext<DatabaseContextType>(
  {} as DatabaseContextType
);

/** Provider de contexto para estado de conexao com o banco de dados. */
export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [databases, setDatabases] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      const response = await api.get('/db/status');
      setStatus(response.data);
    } catch {
      setStatus(null);
    }
  }, [user]);

  const fetchDatabases = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/db/databases');
      setDatabases(response.data.databases);
    } catch (error) {
      console.error('Failed to fetch databases:', error);
      toast.error('Could not load database list');
      setDatabases([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const switchDatabase = useCallback(
    async (database: string) => {
      setIsLoading(true);
      try {
        await api.post('/db/switch', { database });

        if (typeof window !== 'undefined') {
          localStorage.setItem('@qreports:database', database);
        }

        toast.success(`Switched to database: ${database}`);

        await fetchStatus();
      } catch (error) {
        console.error('Failed to switch database:', error);
        toast.error('Failed to switch database');
      } finally {
        setIsLoading(false);
      }
    },
    [fetchStatus]
  );

  const testConnection = useCallback(async () => {
    try {
      const response = await api.post('/db/test');
      const result = response.data;
      toast.success(`Connection test successful (${result.duration})`);
    } catch (error) {
      console.error('Connection test failed:', error);
      toast.error('Connection test failed');
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setStatus(null);
      return;
    }
    fetchStatus();
  }, [user, fetchStatus]);

  return (
    <DatabaseContext.Provider
      value={{
        status,
        databases,
        isLoading,
        fetchStatus,
        fetchDatabases,
        switchDatabase,
        testConnection
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
}
