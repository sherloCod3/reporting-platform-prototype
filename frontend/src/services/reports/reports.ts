import { api } from '@/utils/api';

export interface ReportDefinition {
    id: number;
    name: string;
    description: string;
    created_at: string;
}

export interface ReportDefinitionDetail extends ReportDefinition {
    sql_query: string;
    layout_json: Record<string, unknown>;
    updated_at: string;
}

export const reportsService = {
    async list(): Promise<ReportDefinition[]> {
        const response = await api.get('/definitions');
        return response.data;
    },

    async get(id: number): Promise<ReportDefinitionDetail> {
        const response = await api.get(`/definitions/${id}`);
        return response.data;
    },

    async create(data: { name: string; description?: string; sql_query?: string; layout_json?: Record<string, unknown> }): Promise<{ id: number; message: string }> {
        const response = await api.post('/definitions', data);
        return response.data;
    },

    async update(id: number, data: Partial<ReportDefinitionDetail>): Promise<{ message: string }> {
        const response = await api.put(`/definitions/${id}`, data);
        return response.data;
    },

    async delete(id: number): Promise<{ message: string }> {
        const response = await api.delete(`/definitions/${id}`);
        return response.data;
    },
};
