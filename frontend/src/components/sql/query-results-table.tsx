"use client";

import { useMemo } from "react";
import { Clock, Download, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QueryResult {
  columns: string[];
  rows: unknown[][];
  rowCount: number;
  duration: number;
}

interface QueryResultsTableProps {
  result: QueryResult;
}

export function QueryResultsTable({ result }: QueryResultsTableProps) {
  const formattedDuration = useMemo(() => {
    if (result.duration < 1000) {
      return `${result.duration}ms`;
    }
    return `${(result.duration / 1000).toFixed(2)}s`;
  }, [result.duration]);

  const formatCellValue = (value: unknown): string => {
    if (value === null) return "NULL";
    if (value === undefined) return "";
    if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const exportToCSV = () => {
    const headers = result.columns.join(",");
    const rows = result.rows
      .map((row) =>
        row
          .map((cell) => {
            const value = formatCellValue(cell);
            // Escape quotes and wrap in quotes if contains comma
            if (value.includes(",") || value.includes('"')) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(","),
      )
      .join("\n");

    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `query-results-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Results Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/20">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Table2 className="w-4 h-4" />
            <span className="font-medium">{result.rowCount}</span>
            <span>rows</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{formattedDuration}</span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={exportToCSV}
          className="flex items-center gap-1">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Results Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 sticky top-0">
            <tr>
              {result.columns.map((column, index) => (
                <th
                  key={index}
                  className="p-2 text-left font-semibold border-b border-border whitespace-nowrap text-xs text-muted-foreground">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-border hover:bg-muted/30">
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="p-2 max-w-md truncate"
                    title={formatCellValue(cell)}>
                    {cell === null ? (
                      <span className="text-slate-400 italic">NULL</span>
                    ) : (
                      formatCellValue(cell)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
