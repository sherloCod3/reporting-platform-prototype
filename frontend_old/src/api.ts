import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    timeout: 30000, // evita requests travados
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('@qreports:token'); // obtém o token do localStorage
    if (token) {
        config.headers = config.headers ?? {}; // garantir headers existem
        config.headers.Authorization = `Bearer ${token}`; // adiciona o token ao cabeçalho (injeta bearer)
    }
    return config;
});

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // se 401 (não autorizado), limpa token e redireciona
        if (error.response?.status === 401) {
            localStorage.removeItem('@qreports:token');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);
