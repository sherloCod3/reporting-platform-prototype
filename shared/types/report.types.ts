export interface RowDataPacket {
  [column: string]: any;
}

export interface QueryResult {
  columns: string[];
  rows: RowDataPacket[] | any[];
  rowCount: number;
  duration: number;
}

export interface ReportExecutionResult {
  success: boolean;
  data: QueryResult;
}
