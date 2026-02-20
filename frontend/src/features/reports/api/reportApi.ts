import { Component, ReportData } from '@/components/reports/types';
import { api } from '@/utils/api';

export interface Report extends ReportData {
  created_at: string;
  updated_at: string;
}

export const reportApi = {
  create: async (data: Omit<ReportData, 'id'>): Promise<Report> => {
    const payload = {
      title: data.title,
      description: data.description,
      components: data.components
    };
    const response = await api.post<Report>('/reports', payload);
    return response.data;
  },

  getById: async (id: number): Promise<Report> => {
    const response = await api.get<Report>(`/reports/${id}`);
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<Omit<ReportData, 'id'>>
  ): Promise<Report> => {
    const response = await api.put<Report>(`/reports/${id}`, data);
    return response.data;
  }
};
