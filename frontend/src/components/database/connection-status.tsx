'use client';

import { useDatabase } from '@/hooks/use-database';
import { Database, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  className?: string;
  compact?: boolean;
}

/** Exibe o status da conexao com o banco de dados. */
export function ConnectionStatus({
  className,
  compact = false
}: ConnectionStatusProps) {
  const { status } = useDatabase();

  if (!status) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 text-muted-foreground',
          className
        )}
      >
        <Circle className="h-2 w-2 fill-gray-400 text-gray-400" />
        {!compact && <span className="text-sm">No connection</span>}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Circle
        className={cn(
          'h-2 w-2',
          status.connected
            ? 'fill-green-500 text-green-500'
            : 'fill-red-500 text-red-500'
        )}
      />
      {!compact && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-medium">{status.database}</span>
          </div>
          <span className="text-xs text-muted-foreground">{status.host}</span>
        </div>
      )}
    </div>
  );
}
