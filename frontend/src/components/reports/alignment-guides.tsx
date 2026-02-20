import React from 'react';
import { AlignmentLine } from './types';

interface AlignmentGuidesProps {
  lines: AlignmentLine[];
  zoom: number;
}

export const AlignmentGuides: React.FC<AlignmentGuidesProps> = ({
  lines,
  zoom
}) => {
  if (lines.length === 0) return null;

  return (
    <svg
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-50"
      style={{ overflow: 'visible' }}
    >
      {lines.map((line, i) => (
        <line
          key={i}
          x1={line.type === 'vertical' ? line.x : line.start}
          y1={line.type === 'horizontal' ? line.y : line.start}
          x2={line.type === 'vertical' ? line.x : line.end}
          y2={line.type === 'horizontal' ? line.y : line.end}
          stroke="#3b82f6"
          strokeWidth={1 / zoom}
          strokeDasharray={`${4 / zoom}, ${2 / zoom}`}
        />
      ))}
    </svg>
  );
};
