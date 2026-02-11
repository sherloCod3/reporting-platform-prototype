"use client";

/**
 * ReportPreview — Full A4-faithful read-only preview.
 *
 * Renders all sections top-to-bottom inside a paper container
 * with the same 794×1123 dimensions as the existing canvas.
 * Uses the same zoom/viewport pattern as the ReportEditor.
 */

import React, { memo, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Maximize2 } from "lucide-react";
import type {
  ReportSection,
  PageConfig,
} from "@/features/report-composer/types/composer.types";
import { PreviewSectionRenderer } from "./preview-section-renderer";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReportPreviewProps {
  /** Ordered list of sections to render */
  sections: ReportSection[];
  /** Page configuration for dimensions and margins */
  pageConfig: PageConfig;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const ReportPreview: React.FC<Readonly<ReportPreviewProps>> = memo(
  function ReportPreview({ sections, pageConfig }) {
    const [zoom, setZoom] = useState(1);
    const viewportRef = useRef<HTMLDivElement | null>(null);

    /** Clamps zoom to safe bounds */
    const clampZoom = useCallback(
      (value: number): number => Math.min(2, Math.max(0.25, value)),
      [],
    );

    /** Fits the paper to the viewport width */
    const fitToViewport = useCallback((): void => {
      const viewport = viewportRef.current;
      if (!viewport) return;

      const rect = viewport.getBoundingClientRect();
      const availableW = Math.max(320, rect.width - 64);
      const availableH = Math.max(320, rect.height - 64);
      const next = Math.min(
        availableW / pageConfig.width,
        availableH / pageConfig.height,
      );
      setZoom(clampZoom(next));
    }, [pageConfig.width, pageConfig.height, clampZoom]);

    return (
      <div ref={viewportRef} className="flex-1 bg-app overflow-auto relative">
        {/* Centered Paper Container */}
        <div className="min-w-full min-h-full p-16 flex justify-center items-start">
          <div
            className="preview-paper bg-canvas shadow-lg border border-border/50 relative transition-transform duration-200 ease-out origin-top"
            style={{
              width: pageConfig.width,
              minHeight: pageConfig.height,
              transform: `scale(${zoom})`,
              paddingTop: pageConfig.marginTop,
              paddingBottom: pageConfig.marginBottom,
              paddingLeft: pageConfig.marginLeft,
              paddingRight: pageConfig.marginRight,
            }}>
            {/* Render all sections in order */}
            {sections.map((section) => (
              <PreviewSectionRenderer key={section.id} section={section} />
            ))}

            {/* Empty state */}
            {sections.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32 text-muted-foreground/20 select-none">
                <span className="text-sm">Nenhuma seção para visualizar</span>
              </div>
            )}
          </div>
        </div>

        {/* Floating Zoom Controls (Bottom Right) — same pattern as ReportEditor */}
        <div className="absolute bottom-6 right-6 flex items-center gap-1 bg-background/95 backdrop-blur border border-border rounded-lg shadow-md p-1 pl-3 z-30">
          <span className="text-xs font-mono text-muted-foreground w-12 text-center tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <div className="w-px h-4 bg-border mx-1" />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setZoom((z) => clampZoom(z - 0.1))}>
            <Minus className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setZoom((z) => clampZoom(z + 0.1))}>
            <Plus className="w-3.5 h-3.5" />
          </Button>
          <div className="w-px h-4 bg-border mx-1" />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={fitToViewport}
            title="Ajustar à tela">
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    );
  },
);

export default ReportPreview;
