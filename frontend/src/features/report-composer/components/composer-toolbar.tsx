'use client';

import React, { memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Type,
  Table,
  Minus,
  Undo,
  Redo,
  Eye,
  Pencil
} from 'lucide-react';
import type { SectionType } from '@/features/report-composer/types/composer.types';
import { cn } from '@/lib/utils';

interface ComposerToolbarProps {
  reportName: string;

  viewMode: 'edit' | 'preview';

  canUndo: boolean;

  canRedo: boolean;

  onInsert: (type: SectionType) => void;

  onTogglePreview: () => void;

  onUndo: () => void;

  onRedo: () => void;
}

interface InsertButton {
  type: SectionType;
  label: string;
  icon: React.ElementType;
}

const INSERT_BUTTONS: readonly InsertButton[] = [
  { type: 'header', label: 'Cabeçalho', icon: FileText },
  { type: 'text', label: 'Texto', icon: Type },
  { type: 'table', label: 'Tabela', icon: Table },
  { type: 'page-break', label: 'Quebra', icon: Minus }
] as const;

export const ComposerToolbar: React.FC<Readonly<ComposerToolbarProps>> = memo(
  function ComposerToolbar({
    reportName,
    viewMode,
    canUndo,
    canRedo,
    onInsert,
    onTogglePreview,
    onUndo,
    onRedo
  }) {
    const handleInsert = useCallback(
      (type: SectionType): void => {
        onInsert(type);
      },
      [onInsert]
    );

    return (
      <div className="h-16 border-b border-border/50 bg-surface/60 backdrop-blur-xl flex items-center justify-between px-6 z-20 shadow-sm sticky top-0">
        {/* Left: Ferramentas de Inserção (Gestalt: Context/Proximity) */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-muted/30 border border-border/40">
            {INSERT_BUTTONS.map(btn => {
              const Icon = btn.icon;
              return (
                <Button
                  key={btn.type}
                  variant="ghost"
                  size="sm"
                  className="h-9 px-3 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors"
                  onClick={() => handleInsert(btn.type)}
                  disabled={viewMode === 'preview'}
                  title={`Inserir ${btn.label}`}
                >
                  <Icon className="w-4 h-4 mr-2 opacity-70" />
                  {btn.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Center: Nome do Relatório */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand-primary/60" />
          <span className="text-[14px] font-semibold text-foreground/80 select-none tracking-tight">
            {reportName || 'Relatório Sem Título'}
          </span>
        </div>

        {/* Right: Ações */}
        <div className="flex items-center gap-3">
          {/* Undo/Redo */}
          <div className="flex items-center gap-0.5 p-1 bg-muted/30 rounded-lg border border-border/40">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={onUndo}
              disabled={!canUndo}
              title="Desfazer"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={onRedo}
              disabled={!canRedo}
              title="Refazer"
            >
              <Redo className="w-4 h-4" />
            </Button>
          </div>

          <div className="w-px h-8 bg-border/50 mx-1" />

          {/* Botão de alternância de visualização - Fitts Law (Large Target) & Von Restorff (Color) */}
          <Button
            variant={viewMode === 'preview' ? 'default' : 'outline'}
            className={cn(
              'h-10 px-5 text-[13px] font-medium gap-2 transition-all duration-200',
              viewMode === 'preview'
                ? 'bg-brand-primary hover:bg-brand-primary-dark shadow-md'
                : 'hover:bg-muted/50 border-border/60'
            )}
            onClick={onTogglePreview}
          >
            {viewMode === 'preview' ? (
              <>
                <Pencil className="w-4 h-4" />
                Continuar Editando
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-brand-primary" />
                Visualizar PDF
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }
);

export default ComposerToolbar;
