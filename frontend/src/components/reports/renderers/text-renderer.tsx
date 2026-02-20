'use client';

import React, { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { ComponentStyle } from '../types';

interface TextRendererProps {
  content: string;
  width?: number;
  height?: number;
  style?: ComponentStyle;
  placeholder?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  alignment?: 'left' | 'center' | 'right' | 'justify';
}

export const TextRenderer = memo(function TextRenderer({
  content,
  width,
  height,
  style,
  placeholder = '(Clique duplo para editar o texto)',
  fontSize,
  bold,
  italic,
  alignment
}: TextRendererProps) {
  const containerStyle = useMemo(() => {
    return {
      width: '100%',
      height: '100%',
      fontFamily: style?.fontFamily ?? 'Inter',
      fontSize: fontSize
        ? `${fontSize}px`
        : style?.fontSize
          ? `${style.fontSize}px`
          : '14px',
      textAlign: alignment ?? style?.textAlign ?? 'left',
      fontWeight: bold ? 'bold' : 'normal',
      fontStyle: italic ? 'italic' : 'normal',
      color: style?.color ?? 'inherit',
      backgroundColor: style?.backgroundColor ?? 'transparent',
      borderWidth: style?.borderWidth ? `${style.borderWidth}px` : '0px',
      borderColor: style?.borderColor ?? 'transparent',
      borderStyle: style?.borderWidth ? 'solid' : 'none',
      borderRadius: style?.borderRadius ? `${style.borderRadius}px` : '0px',
      opacity: style?.opacity ?? 1,
      overflow: 'hidden',
      lineHeight: 1.5
    } as React.CSSProperties;
  }, [width, height, style, fontSize, bold, italic, alignment]);

  return (
    <div
      className={cn(
        'whitespace-pre-wrap p-2 transition-colors',
        !content &&
        'text-muted-foreground/30 italic flex items-center justify-center h-full border-2 border-dashed border-muted-foreground/20'
      )}
      style={containerStyle}
    >
      {content || placeholder}
    </div>
  );
});
