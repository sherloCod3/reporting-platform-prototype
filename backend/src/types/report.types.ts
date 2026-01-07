import type { RowDataPacket } from "mysql2";

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

// O resultado de uma query
export interface QueryResult {
    columns: string[];
    rows: RowDataPacket[] | RowDataPacket[][] | any[];
    rowCount: number;
    duration: number; // em ms
}

export interface ReportExecutionResult {
    success: boolean;
    data: QueryResult;
}