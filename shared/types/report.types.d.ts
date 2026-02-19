import type { RowDataPacket } from "mysql2";
export interface QueryResult {
    columns: string[];
    rows: RowDataPacket[] | RowDataPacket[][] | any[];
    rowCount: number;
    duration: number;
}
export interface ReportExecutionResult {
    success: boolean;
    data: QueryResult;
}
//# sourceMappingURL=report.types.d.ts.map