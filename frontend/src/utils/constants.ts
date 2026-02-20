export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const STORAGE_KEYS = {
  TOKEN: '@qreports:token',
  USER: '@qreports:user'
} as const;

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  USERS: '/users'
} as const;
