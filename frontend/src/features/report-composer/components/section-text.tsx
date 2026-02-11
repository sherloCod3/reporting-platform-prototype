"use client";

/**
 * SectionText — Editable text block section for report composition.
 *
 * Supports inline text editing with basic formatting controls
 * (bold, italic, alignment, font size). Shows {{token}} placeholders
 * visually as badges — actual injection is deferred.
 */

import React, { memo, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TextSection } from "@/features/report-composer/types/composer.types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SectionTextProps {
  /** Text section data */
  section: TextSection;
  /** Whether this section is currently selected */
  isSelected: boolean;
  /** Called when a field changes */
  onUpdate: (id: string, changes: Partial<TextSection>) => void;
  /** Called when this section is clicked */
  onSelect: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Renders content with {{token}} placeholders highlighted as inline badges */
function renderTokenizedContent(content: string): React.ReactNode[] {
  const tokenRegex = /\{\{(\w+)\}\}/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null = tokenRegex.exec(content);

  while (match !== null) {
    // Text before the token
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    // Token badge
    parts.push(
      <span
        key={`token-${match.index}`}
        className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-primary/10 text-primary border border-primary/20 mx-0.5">
        {match[1]}
      </span>,
    );
    lastIndex = match.index + match[0].length;
    match = tokenRegex.exec(content);
  }

  // Remaining text after last token
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const SectionText: React.FC<Readonly<SectionTextProps>> = memo(
  function SectionText({ section, isSelected, onUpdate, onSelect }) {
    /** Handles content changes */
    const handleContentChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        onUpdate(section.id, { content: e.target.value });
      },
      [section.id, onUpdate],
    );

    /** Toggles bold formatting */
    const handleToggleBold = useCallback((): void => {
      onUpdate(section.id, { bold: !section.bold });
    }, [section.id, section.bold, onUpdate]);

    /** Toggles italic formatting */
    const handleToggleItalic = useCallback((): void => {
      onUpdate(section.id, { italic: !section.italic });
    }, [section.id, section.italic, onUpdate]);

    /** Sets text alignment */
    const handleSetAlignment = useCallback(
      (alignment: TextSection["alignment"]): void => {
        onUpdate(section.id, { alignment });
      },
      [section.id, onUpdate],
    );

    /** Adjusts font size within bounds (10–28px) */
    const handleFontSizeChange = useCallback(
      (delta: number): void => {
        const next = Math.min(28, Math.max(10, section.fontSize + delta));
        onUpdate(section.id, { fontSize: next });
      },
      [section.id, section.fontSize, onUpdate],
    );

    /** Pre-rendered tokenized content for the preview */
    const tokenizedPreview = useMemo(
      () => renderTokenizedContent(section.content || ""),
      [section.content],
    );

    /** Dynamic text style based on section formatting */
    const textStyle = useMemo(
      () => ({
        fontSize: `${section.fontSize}px`,
        fontWeight: section.bold ? 700 : 400,
        fontStyle: section.italic ? ("italic" as const) : ("normal" as const),
        textAlign: section.alignment,
      }),
      [section.fontSize, section.bold, section.italic, section.alignment],
    );

    return (
      <div
        className={cn(
          "composer-section group relative border rounded-md transition-all duration-200",
          isSelected
            ? "border-primary/40 ring-1 ring-primary/15 bg-primary/[0.03]"
            : "border-border/40 hover:border-border/70 bg-card/50",
        )}
        onClick={() => onSelect(section.id)}
        role="button"
        tabIndex={0}>
        {/* Text Content Area */}
        <div className="px-6 py-4">
          {isSelected ? (
            /* Editing Mode — Textarea */
            <Textarea
              value={section.content}
              onChange={handleContentChange}
              placeholder="Digite o conteúdo do bloco de texto... Use {{nome_coluna}} para tokens de injeção."
              className="min-h-[80px] border-none bg-transparent p-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground/30"
              style={textStyle}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            /* Preview Mode — Tokenized render */
            <div
              className={cn(
                "min-h-[40px] text-foreground whitespace-pre-wrap",
                !section.content && "text-muted-foreground/30 italic",
              )}
              style={textStyle}>
              {section.content
                ? tokenizedPreview
                : "Bloco de texto vazio — clique para editar"}
            </div>
          )}
        </div>

        {/* Formatting Toolbar (visible when selected) */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-200",
            isSelected ? "max-h-20 opacity-100" : "max-h-0 opacity-0",
          )}>
          <div className="px-4 py-2 border-t border-border/20 bg-muted/20 flex items-center gap-1">
            {/* Font Size Controls */}
            <div className="flex items-center gap-0.5 mr-2 bg-muted/40 rounded px-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFontSizeChange(-1);
                }}
                title="Diminuir fonte">
                <Minus className="w-3 h-3" />
              </Button>
              <span className="text-[10px] font-mono text-muted-foreground w-6 text-center tabular-nums">
                {section.fontSize}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFontSizeChange(1);
                }}
                title="Aumentar fonte">
                <Plus className="w-3 h-3" />
              </Button>
            </div>

            <div className="w-px h-4 bg-border/30 mx-1" />

            {/* Bold / Italic */}
            <Button
              variant={section.bold ? "secondary" : "ghost"}
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleBold();
              }}
              title="Negrito">
              <Bold className="w-3 h-3" />
            </Button>
            <Button
              variant={section.italic ? "secondary" : "ghost"}
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleItalic();
              }}
              title="Itálico">
              <Italic className="w-3 h-3" />
            </Button>

            <div className="w-px h-4 bg-border/30 mx-1" />

            {/* Alignment */}
            <Button
              variant={section.alignment === "left" ? "secondary" : "ghost"}
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                handleSetAlignment("left");
              }}
              title="Alinhar à esquerda">
              <AlignLeft className="w-3 h-3" />
            </Button>
            <Button
              variant={section.alignment === "center" ? "secondary" : "ghost"}
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                handleSetAlignment("center");
              }}
              title="Centralizar">
              <AlignCenter className="w-3 h-3" />
            </Button>
            <Button
              variant={section.alignment === "right" ? "secondary" : "ghost"}
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                handleSetAlignment("right");
              }}
              title="Alinhar à direita">
              <AlignRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  },
);

export default SectionText;
