import axios, { AxiosError } from "axios";
import type { ApiResponse, QueryResult, PdfRequest, DatabaseRow } from "../types/api.types";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor - erros e log no console (desenvolvimento)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!axios.isCancel(error)) {
            console.error("API Error:", error.response?.data || error.message);
        }
        return Promise.reject(error);
    }
);


export const ReportService = {

    async executeQuery<T = DatabaseRow>(query: string): Promise<QueryResult<T>> {
        try {
            const { data } = await api.post<ApiResponse<QueryResult<T>>>('/reports/execute', { query });
            return data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    async downloadPdf(htmlContent: string, fileName = 'relatorio.pdf'): Promise<void> {
        try {
            const response = await api.post('/reports/export-pdf',
                { htmlContent } as PdfRequest,
                {
                    responseType: 'blob',
                }
            );

            const url = window.URL.createObjectURL(new Blob([ response.data ]));

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            throw handleApiError(error);
        }
    }
};

function handleApiError(error: unknown): Error {
    if (error instanceof AxiosError && error.response?.data?.message) {
        return new Error(error.response.data.message);
    }
    return new Error('Erro de comunicação com o servidor');
}