import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import {
  Table,
  BarChart,
  Trash2,
  Edit,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Component } from './types';
import { TableRenderer } from './renderers/table-renderer';
import { TextRenderer } from './renderers/text-renderer';
import type { ResizeHandle } from './types';

interface CanvasItemProps {
  component: Component;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onEditSql?: (id: number) => void;
  onDragStart: (e: React.MouseEvent, id: number) => void;
  onResizeStart?: (
    e: React.MouseEvent,
    id: number,
    handle: ResizeHandle
  ) => void;
  readOnly?: boolean;
}

export const CanvasItem = memo(function CanvasItem({
  component: comp,
  isSelected,
  onSelect,
  onDelete,
  onEditSql,
  onDragStart,
  onResizeStart,
  readOnly = false
}: CanvasItemProps) {
  const renderContent = () => {
    switch (comp.type) {
      case 'text':
        return (
          <div className="h-full">
            <TextRenderer content={comp.content || ''} style={comp.style} />
          </div>
        );

      case 'image':
        return (
          <div className="flex items-center justify-center h-full bg-muted/30 text-muted-foreground select-none">
            <ImageIcon className="w-14 h-14" />
          </div>
        );

      case 'chart':
        return (
          <div className="flex items-center justify-center h-full bg-muted/30 text-primary/60 select-none">
            <BarChart className="w-14 h-14" />
          </div>
        );

      case 'table':
        return (
          <div className="w-full h-full overflow-hidden select-none">
            {comp.sqlResult ? (
              <div className="space-y-1 h-full flex flex-col">
                <div className="font-medium text-muted-foreground flex items-center justify-between shrink-0">
                  <span className="text-xs">
                    Resultados ({comp.sqlResult.rowCount})
                  </span>
                </div>
                <TableRenderer
                  columns={comp.sqlResult.columns}
                  rows={comp.sqlResult.rows}
                  className="flex-1 border rounded-sm border-border/50 bg-background/50"
                  emptyMessage="Sem dados"
                  striped
                  style={comp.style}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                <Table className="w-8 h-8 opacity-50" />
                <span className="text-xs">Sem dados SQL</span>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'absolute bg-card transition-all duration-200 ease-out',
        !readOnly && 'cursor-move hover:shadow-md',
        isSelected && !readOnly
          ? 'border-2 border-primary ring-1 ring-primary/20 z-10 shadow-lg'
          : !readOnly
            ? 'border border-border shadow-sm'
            : ''
      )}
      style={{
        left: comp.x,
        top: comp.y,
        width: comp.width,
        height: comp.height
      }}
      onMouseDown={e => !readOnly && onDragStart(e, comp.id)}
      onClick={e => {
        e.stopPropagation();
        onSelect(comp.id);
      }}
      role="button"
      tabIndex={0}
    >
      {!readOnly && (
        <div
          className={cn(
            'absolute -top-10 right-0 flex gap-1 rounded-md border border-border bg-popover/95 backdrop-blur shadow-sm p-1',
            'transition-opacity duration-150',
            isSelected
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none'
          )}
        >
          {comp.type === 'table' && onEditSql && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs hover:bg-muted"
              onClick={e => {
                e.stopPropagation();
                onEditSql(comp.id);
              }}
            >
              <Edit className="w-3.5 h-3.5 mr-1.5" />
              Editar SQL
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
            title="Delete component"
            onClick={e => {
              e.stopPropagation();
              onDelete(comp.id);
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {!readOnly && isSelected && (
        <>
          {(['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as ResizeHandle[]).map(
            handle => (
              <div
                key={handle}
                className={cn(
                  'absolute w-3 h-3 bg-white border border-primary rounded-full z-20',
                  'hover:bg-primary hover:scale-125 transition-transform',
                  handle.includes('n') ? '-top-1.5' : '',
                  handle.includes('s') ? '-bottom-1.5' : '',
                  handle.includes('w') ? '-left-1.5' : '',
                  handle.includes('e') ? '-right-1.5' : '',
                  handle === 'n' || handle === 's'
                    ? 'left-1/2 -translate-x-1/2'
                    : '',
                  handle === 'w' || handle === 'e'
                    ? 'top-1/2 -translate-y-1/2'
                    : '',
                  handle === 'nw' || handle === 'se'
                    ? 'cursor-nwse-resize'
                    : '',
                  handle === 'ne' || handle === 'sw'
                    ? 'cursor-nesw-resize'
                    : '',
                  handle === 'n' || handle === 's' ? 'cursor-ns-resize' : '',
                  handle === 'w' || handle === 'e' ? 'cursor-ew-resize' : ''
                )}
                onMouseDown={e => {
                  e.stopPropagation();
                  onResizeStart?.(e, comp.id, handle);
                }}
              />
            )
          )}
        </>
      )}

      <div className="w-full h-full overflow-hidden">{renderContent()}</div>
    </div>
  );
});
