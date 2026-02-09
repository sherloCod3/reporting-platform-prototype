import React, { memo } from "react";
import { cn } from "@/lib/utils";
import { Table, BarChart, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Component } from "./types";

interface CanvasItemProps {
  component: Component;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onEditSql?: (id: number) => void;
  onDragStart: (e: React.MouseEvent, id: number) => void;
}

const formatPreviewCell = (value: unknown) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  return "";
};

export const CanvasItem = memo(function CanvasItem({
  component: comp,
  isSelected,
  onSelect,
  onDelete,
  onEditSql,
  onDragStart,
}: CanvasItemProps) {
  // Render different content based on type
  const renderContent = () => {
    switch (comp.type) {
      case "text":
        return (
          <div className="text-sm font-medium p-2 text-foreground">
            {comp.content}
          </div>
        );

      case "image":
        return (
          <div className="flex items-center justify-center h-full bg-muted/30 text-3xl text-muted-foreground select-none">
            🖼️
          </div>
        );

      case "chart":
        return (
          <div className="flex items-center justify-center h-full bg-muted/30 text-primary/60 select-none">
            <BarChart className="w-14 h-14" />
          </div>
        );

      case "table":
        return (
          <div className="text-xs w-full h-full overflow-hidden p-2 select-none">
            {comp.sqlResult ? (
              <div className="space-y-1">
                <div className="font-medium text-muted-foreground flex items-center justify-between">
                  <span>Resultados ({comp.sqlResult.rowCount})</span>
                </div>
                <div className="grid grid-cols-2 gap-1 opacity-90">
                  {comp.sqlResult.rows.slice(0, 10).map((r, i) => (
                    <div
                      key={`${comp.id}-${i}`}
                      className="bg-card border border-border rounded-sm px-1.5 py-1 truncate text-foreground">
                      {formatPreviewCell(r?.[1] || r?.[0])}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                <Table className="w-8 h-8 opacity-50" />
                <span>Sem dados SQL</span>
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
        "absolute bg-card cursor-move group transition-all duration-200 ease-out",
        "hover:shadow-md",
        isSelected
          ? "border-2 border-primary ring-1 ring-primary/20 z-10 shadow-lg"
          : "border border-border shadow-sm",
      )}
      style={{
        left: comp.x,
        top: comp.y,
        width: comp.width,
        height: comp.height,
      }}
      onMouseDown={(e) => onDragStart(e, comp.id)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(comp.id);
      }}
      role="button"
      tabIndex={0}>
      {/* Selection Actions Toolbar (Only when selected) */}
      <div
        className={cn(
          "absolute -top-10 right-0 flex gap-1 rounded-md border border-border bg-popover/95 backdrop-blur shadow-sm p-1",
          "transition-opacity duration-150",
          isSelected
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}>
        {comp.type === "table" && onEditSql && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs hover:bg-muted"
            onClick={(e) => {
              e.stopPropagation();
              onEditSql(comp.id);
            }}>
            <Edit className="w-3.5 h-3.5 mr-1.5" />
            Editar SQL
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
          title="Delete component"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(comp.id);
          }}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Resize Handle Hints */}
      <div
        className={cn(
          "absolute -bottom-1 -right-1 h-2.5 w-2.5 bg-primary rounded-sm cursor-se-resize",
          isSelected ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Render Component Content */}
      <div className="w-full h-full overflow-hidden">{renderContent()}</div>
    </div>
  );
});
