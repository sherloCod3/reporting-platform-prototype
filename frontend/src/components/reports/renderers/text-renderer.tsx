"use client";

import React, { memo, useMemo } from "react";
import { cn } from "@/lib/utils";

export interface TextRendererProps {
  content?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  alignment?: "left" | "center" | "right";
  className?: string;
  placeholder?: string;
}

export const TextRenderer = memo(function TextRenderer({
  content,
  fontSize = 14,
  bold = false,
  italic = false,
  alignment = "left",
  className,
  placeholder = "(Bloco de texto vazio)",
}: TextRendererProps) {
  const textStyle = useMemo(
    () => ({
      fontSize: `${fontSize}px`,
      fontWeight: bold ? 700 : 400,
      fontStyle: italic ? ("italic" as const) : ("normal" as const),
      textAlign: alignment,
      lineHeight: 1.6,
    }),
    [fontSize, bold, italic, alignment],
  );

  return (
    <div
      className={cn(
        "text-foreground whitespace-pre-wrap",
        !content && "text-muted-foreground/20 italic",
        className,
      )}
      style={textStyle}>
      {content || placeholder}
    </div>
  );
});
