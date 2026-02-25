'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface ResultsTableProps {
  data: Record<string, unknown>[];
  page?: number;
  pageSize?: number;
  totalRows?: number;
  totalPages?: number;
  onPageChange?: (newPage: number) => void;
}

export function ResultsTable({
  data,
  page = 1,
  pageSize = 500,
  totalRows = 0,
  totalPages = 1,
  onPageChange = () => {}
}: ResultsTableProps) {
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
          <div className="text-sm text-muted-foreground">
            Mostrando {(page - 1) * pageSize + 1} a{' '}
            {Math.min(page * pageSize, totalRows)} de {totalRows} resultados
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              Anterior
            </Button>
            <div className="flex items-center px-4 text-sm font-medium">
              Página {page} de {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
