export type DatabaseRow = Record<string, string | number | boolean | null>;

export interface QueryResult<T = DatabaseRow> {
    columns: string[];
    rows: T[];
    rowCount: number;
    duration: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    meta?: Record<string, string | number | boolean | null>;
}

export interface PdfRequest {
    htmlContent: string;
    title?: string;
    orientation?: 'portrait' | 'landscape';
}