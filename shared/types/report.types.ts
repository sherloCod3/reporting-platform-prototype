export interface RowDataPacket {
  [ column: string ]: any;
}

export interface QueryResult {
  columns: string[];
  rows: RowDataPacket[] | any[];
  rowCount: number;
  duration: number;
  page?: number;
  pageSize?: number;
  totalRows?: number;
  totalPages?: number;
}

export interface ReportExecutionResult {
  success: boolean;
  data: QueryResult;
}
