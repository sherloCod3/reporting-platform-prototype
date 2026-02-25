import axios from 'axios';
import { API_URL } from './constants';

let csrfTokenPromise: Promise<string> | null = null;
let currentCsrfToken: string | null = null;

// Busca o CSRF Token
const fetchCsrfToken = async () => {
  if (!csrfTokenPromise) {
    csrfTokenPromise = axios.get(`${API_URL}/auth/csrf-token`, { withCredentials: true })
      .then(res => res.data.csrfToken)
      .catch(err => {
        console.error('Failed to fetch CSRF token:', err);
        return null;
      })
      .finally(() => { csrfTokenPromise = null; });
  }
  return csrfTokenPromise;
};

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Permite o envio de cookies HttpOnly
});

/** Anexa headers necessarios nas requisicoes de saida. */
api.interceptors.request.use(async config => {
  // Method types that need CSRF protection
  const needsCsrf = [ 'post', 'put', 'delete', 'patch' ].includes(config.method?.toLowerCase() || '');

  if (needsCsrf && typeof window !== 'undefined') {
    if (!currentCsrfToken) {
      currentCsrfToken = await fetchCsrfToken();
    }
    if (currentCsrfToken) {
      config.headers[ 'CSRF-Token' ] = currentCsrfToken;
    }
  }

  if (typeof window !== 'undefined') {
    const db = localStorage.getItem('@qreports:database');
    if (db) {
      config.headers[ 'x-database' ] = db;
    }
  }
  return config;
});

/** Redireciona para /login ao receber 401, limpando a sessao. Lida com CSRF invalido em 403. */
api.interceptors.response.use(
  response => {
    if (response.data && typeof response.data === 'object' && response.data.success === true && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  error => {
    // Limpa o CSRF token para ser re-buscado em caso de erro 403 (Invalid CSRF)
    if (error.response?.status === 403) {
      currentCsrfToken = null;
    }

    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('@qreports:user');
        localStorage.removeItem('@qreports:client');

        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
