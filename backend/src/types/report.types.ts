import type { QueryResult } from '@shared/types/report.types.js';

export type { QueryResult };

export interface ExecuteQueryRequest {
  query: string;
  params?: any[];
  page?: number;
  pageSize?: number;
}

export interface GeneratePdfRequest {
  htmlContent: string;
  title?: string;
  orientation?: 'portrait' | 'landscape';
}

export interface ReportExecutionResult {
  success: boolean;
  data: QueryResult;
}
