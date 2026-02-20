'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

interface ResultsTableProps {
  data: Record<string, unknown>[];
}

export function ResultsTable({ data }: ResultsTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        Nenhum dado encontrado.
      </div>
    );
  }

  const columns = Object.keys(data[0]);

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map(col => (
              <TableHead key={col}>{col}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => (
            <TableRow key={i}>
              {columns.map(col => (
                <TableCell key={col}>{String(row[col])}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
