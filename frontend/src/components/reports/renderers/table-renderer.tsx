'use client';

import React, { memo } from 'react';
import { cn } from '@/lib/utils';

import type { ComponentStyle } from '../types';

export interface TableRendererProps {
  columns: string[];
  rows: Record<string, unknown>[];
  showRowNumbers?: boolean;
  className?: string;
  emptyMessage?: string;
  striped?: boolean;
  style?: ComponentStyle;
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value);
  return '';
}

export const TableRenderer = memo(function TableRenderer({
  columns,
  rows,
  showRowNumbers = false,
  striped = false,
  className,
  emptyMessage = '(Tabela sem dados)',
  style
}: TableRendererProps) {
  const containerStyle = {
    opacity: style?.opacity ?? 1,
    backgroundColor: style?.backgroundColor,
    borderWidth: style?.borderWidth ? `${style.borderWidth}px` : undefined,
    borderColor: style?.borderColor,
    borderStyle: style?.borderWidth ? 'solid' : undefined,
    borderRadius: style?.borderRadius ? `${style.borderRadius}px` : undefined,
    fontFamily: style?.fontFamily,
    fontSize: style?.fontSize ? `${style.fontSize}px` : undefined,
    color: style?.color
  } as React.CSSProperties;

  if (!rows.length && !columns.length) {
    return (
      <div className="text-center py-6 text-muted-foreground/30 text-xs italic select-none">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto', className)} style={containerStyle}>
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            {showRowNumbers && (
              <th className="px-2 py-1.5 text-left text-muted-foreground font-semibold border-b-2 border-foreground/20 w-8 bg-muted/20">
                #
              </th>
            )}
            {columns.map(col => (
              <th
                key={col}
                className="px-2 py-1.5 text-left text-foreground font-semibold border-b-2 border-foreground/20 bg-muted/20"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={cn(
                'transition-colors',
                striped && i % 2 === 1 && 'bg-muted/10'
              )}
            >
              {showRowNumbers && (
                <td className="px-2 py-1 text-muted-foreground/50 border-b border-border/20">
                  {i + 1}
                </td>
              )}
              {columns.map((col, j) => (
                <td
                  key={j}
                  className="px-2 py-1 border-b border-border/20 text-foreground"
                >
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {formatCell((row as any)[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
