'use client';

import React, { memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  FileText,
  Table,
  Type,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  ReportSection,
  SectionType
} from '@/features/report-composer/types/composer.types';

interface SectionPanelProps {
  sections: ReportSection[];

  selectedId: string | null;

  onSelect: (id: string | null) => void;

  onMove: (id: string, direction: 'up' | 'down') => void;

  onDelete: (id: string) => void;
}

const SECTION_ICONS: Record<SectionType, React.ElementType> = {
  header: FileText,
  text: Type,
  table: Table,
  'page-break': Minus
};

const SECTION_COLORS: Record<SectionType, string> = {
  header: 'text-blue-400',
  text: 'text-emerald-400',
  table: 'text-amber-400',
  'page-break': 'text-muted-foreground'
};

export const SectionPanel: React.FC<Readonly<SectionPanelProps>> = memo(
  function SectionPanel({ sections, selectedId, onSelect, onMove, onDelete }) {
    const handleSelect = useCallback(
      (id: string): void => {
        onSelect(id);
      },
      [onSelect]
    );

    return (
      <div className="flex flex-col h-full">
        <div className="h-10 flex items-center px-3 border-b border-border/50 shrink-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Seções
          </span>
          <span className="ml-auto text-xs text-muted-foreground/60 tabular-nums">
            {sections.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          {sections.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center mt-4">
              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3 shadow-inner">
                <FileText className="w-6 h-6 text-muted-foreground/40" />
              </div>
              <span className="text-[13px] font-medium text-foreground/80 mb-1">
                Nenhuma seção
              </span>
              <span className="text-[11px] text-muted-foreground leading-relaxed balance">
                Use a barra de ferramentas para começar seu relatório.
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
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer transition-all duration-200 ease-out outline-none',
                  'hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                  isSelected
                    ? 'bg-primary/5 shadow-[inset_2px_0_0_0_var(--brand-primary)]'
                    : 'text-muted-foreground'
                )}
                onClick={() => handleSelect(section.id)}
                role="button"
                tabIndex={0}
              >
                {/* Visual Indicator of selection (Von Restorff) */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand-primary rounded-l-lg shadow-shadow-glow" />
                )}

                <div
                  className={cn(
                    'shrink-0 transition-transform duration-200',
                    isSelected ? 'scale-110 text-brand-primary' : colorClass
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <span
                  className={cn(
                    'flex-1 text-[13px] font-medium truncate transition-colors',
                    isSelected ? 'text-foreground font-semibold' : ''
                  )}
                >
                  {section.label}
                </span>

                <div
                  className={cn(
                    'flex items-center gap-0.5 shrink-0 transition-opacity duration-150',
                    isSelected
                      ? 'opacity-100'
                      : 'opacity-0 group-hover:opacity-70'
                  )}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    disabled={isFirst}
                    onClick={e => {
                      e.stopPropagation();
                      onMove(section.id, 'up');
                    }}
                    title="Mover para cima"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    disabled={isLast}
                    onClick={e => {
                      e.stopPropagation();
                      onMove(section.id, 'down');
                    }}
                    title="Mover para baixo"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 hover:bg-destructive/10 hover:text-destructive"
                    onClick={e => {
                      e.stopPropagation();
                      onDelete(section.id);
                    }}
                    title="Remover seção"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

export default SectionPanel;
