"use client";

/**
 * PreviewSectionRenderer — Dispatch component that maps each SectionType
 * to its read-only preview rendering for the PDF-faithful preview mode.
 *
 * This component is purely presentational — no editing, no interaction.
 * It renders exactly how each section will appear in the final PDF output.
 */

import React, { memo } from "react";
import { FileText, Calendar, Minus } from "lucide-react";
import type {
  ReportSection,
  HeaderSection,
  TextSection,
  TableSection,
} from "@/features/report-composer/types/composer.types";
import { TableRenderer } from "@/components/reports/renderers/table-renderer";
import { TextRenderer } from "@/components/reports/renderers/text-renderer";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PreviewSectionRendererProps {
  /** The section to render in preview mode */
  section: ReportSection;
}

// ---------------------------------------------------------------------------
// Sub-Renderers (Private — PDF-faithful output)
// ---------------------------------------------------------------------------

/** Renders a header section with title, subtitle, logo, and date */
function PreviewHeader({
  section,
}: {
  section: HeaderSection;
}): React.ReactElement {
  return (
    <div className="preview-section preview-header">
      {/* Top row: logo and date */}
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
              {new Date().toLocaleDateString("pt-BR")}
            </span>
          </div>
        )}
      </div>

      {/* Title and Subtitle */}
      <h1 className="text-xl font-bold text-foreground leading-tight">
        {section.title || "Título do Relatório"}
      </h1>
      {section.subtitle && (
        <p className="text-sm text-muted-foreground mt-1">{section.subtitle}</p>
      )}

      {/* Decorative separator — matches the edit mode visual */}
      <div className="h-px bg-gradient-to-r from-primary/30 via-primary/10 to-transparent mt-4" />
    </div>
  );
}

/** Renders a text section with formatting applied */
function PreviewText({
  section,
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

/** Renders a table section with data from the SQL binding */
function PreviewTable({
  section,
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

/** Renders a visual page break separator */
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

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export const PreviewSectionRenderer: React.FC<
  Readonly<PreviewSectionRendererProps>
> = memo(function PreviewSectionRenderer({ section }) {
  switch (section.type) {
    case "header":
      return <PreviewHeader section={section} />;
    case "text":
      return <PreviewText section={section} />;
    case "table":
      return <PreviewTable section={section} />;
    case "page-break":
      return <PreviewPageBreak />;
  }
});

export default PreviewSectionRenderer;
