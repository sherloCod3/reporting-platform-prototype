'use client';

import React, { useCallback } from 'react';
import { useReportComposer } from '@/features/report-composer/hooks/use-report-composer';
import { ComposerToolbar } from './composer-toolbar';
import { SectionPanel } from './section-panel';
import { SectionHeader } from './section-header';
import { SectionText } from './section-text';
import { SectionTable } from './section-table';
import { ReportPreview } from './report-preview';
import { cn } from '@/lib/utils';
import { Minus } from 'lucide-react';
import type {
  ReportSection,
  SectionType,
  HeaderSection,
  TextSection,
  TableSection
} from '@/features/report-composer/types/composer.types';

interface ReportComposerProps {
  reportName?: string;
}

interface SectionEditRendererProps {
  section: ReportSection;
  isSelected: boolean;
  onUpdate: (id: string, changes: Partial<ReportSection>) => void;
  onSelect: (id: string) => void;
}

function SectionEditRenderer({
  section,
  isSelected,
  onUpdate,
  onSelect
}: SectionEditRendererProps): React.ReactElement {
  switch (section.type) {
    case 'header':
      return (
        <SectionHeader
          section={section as HeaderSection}
          isSelected={isSelected}
          onUpdate={
            onUpdate as (id: string, changes: Partial<HeaderSection>) => void
          }
          onSelect={onSelect}
        />
      );

    case 'text':
      return (
        <SectionText
          section={section as TextSection}
          isSelected={isSelected}
          onUpdate={
            onUpdate as (id: string, changes: Partial<TextSection>) => void
          }
          onSelect={onSelect}
        />
      );

    case 'table':
      return (
        <SectionTable
          section={section as TableSection}
          isSelected={isSelected}
          onUpdate={
            onUpdate as (id: string, changes: Partial<TableSection>) => void
          }
          onSelect={onSelect}
        />
      );

    case 'page-break':
      return (
        <div
          className={cn(
            'composer-section group relative border rounded-md transition-all duration-200 cursor-pointer',
            isSelected
              ? 'border-primary/40 ring-1 ring-primary/15 bg-primary/[0.03]'
              : 'border-border/40 hover:border-border/70 bg-card/50'
          )}
          onClick={() => onSelect(section.id)}
          role="button"
          tabIndex={0}
        >
          <div className="flex items-center gap-3 px-6 py-3">
            <div className="flex-1 border-t-2 border-dashed border-muted-foreground/20" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/30 flex items-center gap-1 select-none">
              <Minus className="w-3 h-3" />
              Quebra de Página
              <Minus className="w-3 h-3" />
            </span>
            <div className="flex-1 border-t-2 border-dashed border-muted-foreground/20" />
          </div>
        </div>
      );
  }
}

export const ReportComposer: React.FC<Readonly<ReportComposerProps>> = ({
  reportName = ''
}) => {
  const {
    state,
    dispatch,
    addSection,
    removeSection,
    moveSection,
    updateSection,
    togglePreview,
    undo,
    redo,
    canUndo,
    canRedo
  } = useReportComposer();

  const handleInsert = useCallback(
    (type: SectionType): void => {
      addSection(type);
    },
    [addSection]
  );

  const handleSelectSection = useCallback(
    (id: string | null): void => {
      dispatch({ type: 'SELECT_SECTION', id });
    },
    [dispatch]
  );

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] w-full bg-app text-foreground border border-border rounded-lg overflow-hidden relative shadow-sm">
      {/* Barra de Tarefas */}
      <ComposerToolbar
        reportName={reportName}
        viewMode={state.viewMode}
        canUndo={canUndo}
        canRedo={canRedo}
        onInsert={handleInsert}
        onTogglePreview={togglePreview}
        onUndo={undo}
        onRedo={redo}
      />

      <div className="flex-1 flex min-h-0">
        <div
          className={cn(
            'w-56 border-r border-border bg-panel/50 backdrop-blur-sm shrink-0 transition-all duration-200',
            state.viewMode === 'preview' && 'w-0 overflow-hidden border-r-0'
          )}
        >
          <SectionPanel
            sections={state.sections}
            selectedId={state.selectedSectionId}
            onSelect={handleSelectSection}
            onMove={moveSection}
            onDelete={removeSection}
          />
        </div>

        {/* Center Canvas */}
        {state.viewMode === 'preview' ? (
          /* Modo Pre-Visualizar */
          <ReportPreview
            sections={state.sections}
            pageConfig={state.pageConfig}
          />
        ) : (
          /* Modo de Edição - Pilha vertical de seções */
          <div
            className="flex-1 bg-app overflow-auto"
            onClick={() => handleSelectSection(null)}
          >
            <div className="max-w-3xl mx-auto px-8 py-8 space-y-3">
              {state.sections.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 text-muted-foreground/20 select-none">
                  <span className="text-sm mb-2">
                    Comece adicionando seções ao relatório
                  </span>
                  <span className="text-xs opacity-50">
                    Use os botões na barra de ferramentas acima
                  </span>
                </div>
              )}

              {state.sections.map(section => (
                <div key={section.id} onClick={e => e.stopPropagation()}>
                  <SectionEditRenderer
                    section={section}
                    isSelected={state.selectedSectionId === section.id}
                    onUpdate={updateSection}
                    onSelect={handleSelectSection}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportComposer;
