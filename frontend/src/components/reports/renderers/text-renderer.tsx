"use client";

import React, { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { ComponentStyle } from "../types";

interface TextRendererProps {
  content: string;
  width: number;
  height: number;
  style?: ComponentStyle;
  placeholder?: string;
}

export const TextRenderer = memo(function TextRenderer({
  content,
  width,
  height,
  style,
  placeholder = "(Double click to edit text)",
}: TextRendererProps) {
  const containerStyle = useMemo(() => {
    return {
      width: "100%",
      height: "100%",
      fontFamily: style?.fontFamily ?? "Inter",
      fontSize: style?.fontSize ? `${style.fontSize}px` : "14px",
      textAlign: style?.textAlign ?? "left",
      color: style?.color ?? "inherit",
      backgroundColor: style?.backgroundColor ?? "transparent",
      borderWidth: style?.borderWidth ? `${style.borderWidth}px` : "0px",
      borderColor: style?.borderColor ?? "transparent",
      borderStyle: style?.borderWidth ? "solid" : "none",
      borderRadius: style?.borderRadius ? `${style.borderRadius}px` : "0px",
      opacity: style?.opacity ?? 1,
      overflow: "hidden", // vital for fixed size
      lineHeight: 1.5,
    } as React.CSSProperties;
  }, [width, height, style]);

  return (
    <div
      className={cn(
        "whitespace-pre-wrap p-2 transition-colors",
        !content &&
          "text-muted-foreground/30 italic flex items-center justify-center h-full border-2 border-dashed border-muted-foreground/20",
      )}
      style={containerStyle}>
      {content || placeholder}
    </div>
  );
});
