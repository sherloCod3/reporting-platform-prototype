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
      <div className="h-14 border-b border-border bg-surface/80 backdrop-blur-sm flex items-center justify-between px-4 z-20">
        {/* Left: Ferramentas de Inserção */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1">
            {INSERT_BUTTONS.map(btn => {
              const Icon = btn.icon;
              return (
                <Button
                  key={btn.type}
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => handleInsert(btn.type)}
                  disabled={viewMode === 'preview'}
                  title={`Inserir ${btn.label}`}
                >
                  <Icon className="w-4 h-4 mr-1.5" />
                  {btn.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Center: Nome do Relatório */}
        <div className="absolute left-1/2 transform -translate-x-1/2 text-sm font-semibold text-muted-foreground opacity-50 select-none">
          {reportName || 'Relatório Sem Título'}
        </div>

        {/* Right: Ações */}
        <div className="flex items-center gap-2">
          {/* Undo/Redo */}
          <div className="flex items-center bg-muted/30 rounded-md border border-border/50">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onUndo}
              disabled={!canUndo}
              title="Desfazer"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onRedo}
              disabled={!canRedo}
              title="Refazer"
            >
              <Redo className="w-4 h-4" />
            </Button>
          </div>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Botão de alternância de visualização */}
          <Button
            variant={viewMode === 'preview' ? 'default' : 'outline'}
            size="sm"
            className="h-8 px-4 text-xs font-medium gap-1.5"
            onClick={onTogglePreview}
          >
            {viewMode === 'preview' ? (
              <>
                <Pencil className="w-3.5 h-3.5" />
                Editar
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                Visualizar
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }
);

export default ComposerToolbar;
