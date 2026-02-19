import type { QueryResult } from "@shared/types/report.types.js";

// Re-export specific types used internally if needed, or deprecate this file in favor of direct imports.
// For now, we keep it but point to shared types to avoid breaking changes in imports if possible, 
// though direct imports are preferred.

export type { QueryResult };

// Frontend envia para executar
export interface ExecuteQueryRequest {
    query: string;
    params?: any[]; // statements futuros
}

// Frontend envia para gerar PDF
export interface GeneratePdfRequest {
    htmlContent: string;
    title?: string;
    orientation?: 'portrait' | 'landscape';
}

export interface ReportExecutionResult {
    success: boolean;
    data: QueryResult;
}