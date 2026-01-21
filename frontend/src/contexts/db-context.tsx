"use client";

import { createContext, useCallback, useEffect, useState } from "react";
import { api } from "@/utils/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

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
  {} as DatabaseContextType,
);

/**
 * Database Context Provider
 * Manages global database connection state and operations.
 */
export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [databases, setDatabases] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Fetches the current database connection status.
   */
  const fetchStatus = useCallback(async () => {
    // Only fetch if user is authenticated
    if (!user) {
      return;
    }

    try {
      const response = await api.get("/db/status");
      setStatus(response.data.data);
    } catch (error) {
      console.error("Failed to fetch database status:", error);
      setStatus(null);
    }
  }, [user]);

  /**
   * Fetches the list of available databases.
   */
  const fetchDatabases = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/db/databases");
      setDatabases(response.data.data.databases);
    } catch (error) {
      console.error("Failed to fetch databases:", error);
      toast.error("Could not load database list");
      setDatabases([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Switches to a different database.
   */
  const switchDatabase = useCallback(
    async (database: string) => {
      setIsLoading(true);
      try {
        await api.post("/db/switch", { database });
        toast.success(`Switched to database: ${database}`);

        // Refresh status after switching
        await fetchStatus();
      } catch (error) {
        console.error("Failed to switch database:", error);
        toast.error("Failed to switch database");
      } finally {
        setIsLoading(false);
      }
    },
    [fetchStatus],
  );

  /**
   * Tests the current database connection.
   */
  const testConnection = useCallback(async () => {
    try {
      const response = await api.post("/db/test");
      const result = response.data.data;
      toast.success(`Connection test successful (${result.duration})`);
    } catch (error) {
      console.error("Connection test failed:", error);
      toast.error("Connection test failed");
    }
  }, []);

  // Load status on mount and when user changes
  useEffect(() => {
    // Only fetch if user is authenticated
    if (!user) {
      setStatus(null);
      return;
    }

    fetchStatus();

    // Refresh status every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus, user]);

  return (
    <DatabaseContext.Provider
      value={{
        status,
        databases,
        isLoading,
        fetchStatus,
        fetchDatabases,
        switchDatabase,
        testConnection,
      }}>
      {children}
    </DatabaseContext.Provider>
  );
}
