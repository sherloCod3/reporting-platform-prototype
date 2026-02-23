import axios from 'axios';
import { API_URL } from './constants';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/** Anexa o token JWT em todas as requisicoes de saida. */
api.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('@qreports:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const db = localStorage.getItem('@qreports:database');
    if (db) {
      config.headers[ 'x-database' ] = db;
    }
  }
  return config;
});

/** Redireciona para /login ao receber 401, limpando a sessao. */
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('@qreports:token');
        localStorage.removeItem('@qreports:user');

        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
