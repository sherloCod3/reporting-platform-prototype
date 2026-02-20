'use client';

import React, { memo } from 'react';
import { FileText, Calendar, Minus } from 'lucide-react';
import type {
  ReportSection,
  HeaderSection,
  TextSection,
  TableSection
} from '@/features/report-composer/types/composer.types';
import { TableRenderer } from '@/components/reports/renderers/table-renderer';
import { TextRenderer } from '@/components/reports/renderers/text-renderer';

interface PreviewSectionRendererProps {
  section: ReportSection;
}

// Sub-Renderers (Privados - saída fiel ao PDF)

function PreviewHeader({
  section
}: {
  section: HeaderSection;
}): React.ReactElement {
  return (
    <div className="preview-section preview-header">
      {/* Linha superior: logo e data */}
      <div className="flex items-center justify-between mb-3">
        {section.showLogo && (
          <div className="flex items-center gap-2 text-muted-foreground/60">
            <div className="w-7 h-7 rounded bg-muted/40 border border-border/20 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
        )}
        {section.showDate && (
          <div className="flex items-center gap-1 text-muted-foreground/50 ml-auto">
            <Calendar className="w-3 h-3" />
            <span className="text-[10px] font-mono">
              {new Date().toLocaleDateString('pt-BR')}
            </span>
          </div>
        )}
      </div>

      {/* Título e Subtítulo */}
      <h1 className="text-xl font-bold text-foreground leading-tight">
        {section.title || 'Título do Relatório'}
      </h1>
      {section.subtitle && (
        <p className="text-sm text-muted-foreground mt-1">{section.subtitle}</p>
      )}

      {/* Separador decorativo - alinhado com o visual de edição */}
      <div className="h-px bg-linear-to-r from-primary/30 via-primary/10 to-transparent mt-4" />
    </div>
  );
}

function PreviewText({
  section
}: {
  section: TextSection;
}): React.ReactElement {
  return (
    <div className="preview-section">
      <TextRenderer
        content={section.content}
        fontSize={section.fontSize}
        bold={section.bold}
        italic={section.italic}
        alignment={section.alignment}
      />
    </div>
  );
}

function PreviewTable({
  section
}: {
  section: TableSection;
}): React.ReactElement {
  const result = section.sqlBinding.lastResult;
  const columns = result?.columns ?? [];
  const maxRows = section.maxRows ?? result?.rows.length ?? 0;
  const rows = result?.rows.slice(0, maxRows) ?? [];

  return (
    <div className="preview-section preview-table">
      <TableRenderer
        columns={columns}
        rows={rows}
        showRowNumbers={section.showRowNumbers}
        striped={section.striped}
        emptyMessage="(Tabela sem dados vinculados)"
      />
    </div>
  );
}

function PreviewPageBreak(): React.ReactElement {
  return (
    <div className="preview-section preview-page-break">
      <div className="flex items-center gap-3 py-2">
        <div className="flex-1 border-t-2 border-dashed border-muted-foreground/15" />
        <div className="flex items-center gap-1.5 text-muted-foreground/25 text-[10px] uppercase tracking-widest select-none">
          <Minus className="w-3 h-3" />
          Quebra de Página
          <Minus className="w-3 h-3" />
        </div>
        <div className="flex-1 border-t-2 border-dashed border-muted-foreground/15" />
      </div>
    </div>
  );
}

export const PreviewSectionRenderer: React.FC<
  Readonly<PreviewSectionRendererProps>
> = memo(function PreviewSectionRenderer({ section }) {
  switch (section.type) {
    case 'header':
      return <PreviewHeader section={section} />;
    case 'text':
      return <PreviewText section={section} />;
    case 'table':
      return <PreviewTable section={section} />;
    case 'page-break':
      return <PreviewPageBreak />;
  }
});

export default PreviewSectionRenderer;
