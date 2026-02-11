"use client";

/**
 * SectionPanel — Left sidebar listing all sections in composition order.
 *
 * Allows selecting, reordering (up/down), and deleting sections.
 * Each section shows its type icon, label, and action buttons.
 */

import React, { memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  FileText,
  Table,
  Type,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ReportSection,
  SectionType,
} from "@/features/report-composer/types/composer.types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SectionPanelProps {
  /** Ordered list of sections to display */
  sections: ReportSection[];
  /** Currently selected section ID */
  selectedId: string | null;
  /** Called when a section is clicked */
  onSelect: (id: string | null) => void;
  /** Called when a section should be moved */
  onMove: (id: string, direction: "up" | "down") => void;
  /** Called when a section should be deleted */
  onDelete: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Maps section type to its icon component */
const SECTION_ICONS: Record<SectionType, React.ElementType> = {
  header: FileText,
  text: Type,
  table: Table,
  "page-break": Minus,
};

/** Maps section type to its display color class */
const SECTION_COLORS: Record<SectionType, string> = {
  header: "text-blue-400",
  text: "text-emerald-400",
  table: "text-amber-400",
  "page-break": "text-muted-foreground",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const SectionPanel: React.FC<Readonly<SectionPanelProps>> = memo(
  function SectionPanel({ sections, selectedId, onSelect, onMove, onDelete }) {
    /** Handles item click — selects the section */
    const handleSelect = useCallback(
      (id: string): void => {
        onSelect(id);
      },
      [onSelect],
    );

    return (
      <div className="flex flex-col h-full">
        {/* Panel Header */}
        <div className="h-10 flex items-center px-3 border-b border-border/50 shrink-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Seções
          </span>
          <span className="ml-auto text-xs text-muted-foreground/60 tabular-nums">
            {sections.length}
          </span>
        </div>

        {/* Section List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
          {sections.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/50 text-xs text-center gap-2 select-none">
              <FileText className="w-8 h-8 opacity-30" />
              <span>Nenhuma seção adicionada.</span>
              <span className="text-[10px] opacity-70">
                Use a barra de ferramentas para inserir seções.
              </span>
            </div>
          )}

          {sections.map((section, index) => {
            const Icon = SECTION_ICONS[section.type];
            const colorClass = SECTION_COLORS[section.type];
            const isSelected = section.id === selectedId;
            const isFirst = index === 0;
            const isLast = index === sections.length - 1;

            return (
              <div
                key={section.id}
                className={cn(
                  "group flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer transition-colors duration-150",
                  "hover:bg-muted/40",
                  isSelected && "bg-primary/10 border border-primary/20",
                )}
                onClick={() => handleSelect(section.id)}
                role="button"
                tabIndex={0}>
                {/* Section Icon */}
                <div className={cn("shrink-0", colorClass)}>
                  <Icon className="w-3.5 h-3.5" />
                </div>

                {/* Section Label */}
                <span className="flex-1 text-xs font-medium text-foreground truncate">
                  {section.label}
                </span>

                {/* Action Buttons (visible on hover or when selected) */}
                <div
                  className={cn(
                    "flex items-center gap-0.5 shrink-0 transition-opacity duration-150",
                    isSelected
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-70",
                  )}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    disabled={isFirst}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMove(section.id, "up");
                    }}
                    title="Mover para cima">
                    <ChevronUp className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    disabled={isLast}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMove(section.id, "down");
                    }}
                    title="Mover para baixo">
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 hover:bg-destructive/10 hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(section.id);
                    }}
                    title="Remover seção">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);

export default SectionPanel;
