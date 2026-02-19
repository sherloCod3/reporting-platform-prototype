// Basic interface for DB row (formerly imported from mysql2)
export interface RowDataPacket {
    [ column: string ]: any;
}

export interface QueryResult {
    columns: string[];
    rows: RowDataPacket[] | any[]; // Backend returns RowDataPacket[], Frontend sees JSON objects
    rowCount: number;
    duration: number; // in ms
}

export interface ReportExecutionResult {
    success: boolean;
    data: QueryResult;
}
