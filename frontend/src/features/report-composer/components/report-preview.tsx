'use client';

import React, { memo, useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Maximize2 } from 'lucide-react';
import type {
  ReportSection,
  PageConfig
} from '@/features/report-composer/types/composer.types';
import { PreviewSectionRenderer } from './preview-section-renderer';

interface ReportPreviewProps {
  sections: ReportSection[];

  pageConfig: PageConfig;
}

export const ReportPreview: React.FC<Readonly<ReportPreviewProps>> = memo(
  function ReportPreview({ sections, pageConfig }) {
    const [zoom, setZoom] = useState(1);
    const viewportRef = useRef<HTMLDivElement | null>(null);

    const clampZoom = useCallback(
      (value: number): number => Math.min(2, Math.max(0.25, value)),
      []
    );

    const fitToViewport = useCallback((): void => {
      const viewport = viewportRef.current;
      if (!viewport) return;

      const rect = viewport.getBoundingClientRect();
      const availableW = Math.max(320, rect.width - 64);
      const availableH = Math.max(320, rect.height - 64);
      const next = Math.min(
        availableW / pageConfig.width,
        availableH / pageConfig.height
      );
      setZoom(clampZoom(next));
    }, [pageConfig.width, pageConfig.height, clampZoom]);

    return (
      <div ref={viewportRef} className="flex-1 bg-app overflow-auto relative">
        {/* Container de papel centralizado */}
        <div className="min-w-full min-h-full p-16 flex justify-center items-start">
          <div
            className="preview-paper bg-canvas shadow-elevation-3 border border-border/40 relative transition-transform duration-200 ease-out origin-top"
            style={{
              width: pageConfig.width,
              minHeight: pageConfig.height,
              transform: `scale(${zoom})`,
              paddingTop: pageConfig.marginTop,
              paddingBottom: pageConfig.marginBottom,
              paddingLeft: pageConfig.marginLeft,
              paddingRight: pageConfig.marginRight
            }}
          >
            {/* Renderiza todas as seções em ordem */}
            {sections.map(section => (
              <PreviewSectionRenderer key={section.id} section={section} />
            ))}

            {/* Estado vazio */}
            {sections.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground/30 select-none">
                <div className="flex flex-col items-center text-center max-w-[200px] opacity-70">
                  <span className="text-[13px] font-medium mb-1">
                    Página em branco
                  </span>
                  <span className="text-[11px] leading-relaxed">
                    As seções adicionadas aparecerão publicadas aqui.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-6 right-6 flex items-center gap-1 bg-background/95 backdrop-blur border border-border rounded-lg shadow-md p-1 pl-3 z-30">
          <span className="text-xs font-mono text-muted-foreground w-12 text-center tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <div className="w-px h-4 bg-border mx-1" />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setZoom(z => clampZoom(z - 0.1))}
          >
            <Minus className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setZoom(z => clampZoom(z + 0.1))}
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
          <div className="w-px h-4 bg-border mx-1" />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={fitToViewport}
            title="Ajustar à tela"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    );
  }
);

export default ReportPreview;
