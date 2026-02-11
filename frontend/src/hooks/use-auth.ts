'use client';

import { useContext } from 'react';
import { AuthContext } from '@/components/auth-context';

/**
 * Custom hook to access the authentication context.
 * Must be used within an AuthProvider component.
 * @returns The authentication context value.
 * @throws Error if used outside of an AuthProvider.
 */
export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }

    return context;
}
