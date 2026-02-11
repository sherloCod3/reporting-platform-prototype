'use client';

import { useContext } from 'react';
import { DatabaseContext } from '@/contexts/db-context';

/**
 * Custom hook to access the database context.
 * Must be used within a DatabaseProvider component.
 * @returns The database context value.
 * @throws Error if used outside of a DatabaseProvider.
 */
export function useDatabase() {
    const context = useContext(DatabaseContext);

    if (!context) {
        throw new Error('useDatabase must be used within DatabaseProvider');
    }

    return context;
}
