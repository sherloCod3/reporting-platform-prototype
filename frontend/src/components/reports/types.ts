import type { QueryResult } from '@shared/types/report.types';

export type SqlResult = QueryResult;

export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export interface ComponentStyle {
  fontFamily?: string;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  fontWeight?: string | number;
  fontStyle?: string;
  color?: string;
  backgroundColor?: string;
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  opacity?: number;
}

export interface Component {
  id: number;
  type: 'text' | 'table' | 'chart' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  sqlQuery?: string;
  sqlResult?: SqlResult;
  style?: ComponentStyle;
}

export interface AlignmentLine {
  type: 'vertical' | 'horizontal';
  x?: number;
  y?: number;
  start: number;
  end: number;
}

export interface EditorState {
  title: string;
  description: string;
  components: Component[];
  history: Component[][];
  historyIndex: number;
  nextId: number;
  selectedId: number | null;
  draggingId: number | null;

  resizing: {
    id: number;
    handle: ResizeHandle;
    startX: number;
    startY: number;
    initialBounds: { x: number; y: number; width: number; height: number };
  } | null;

  alignmentLines: AlignmentLine[];
}

export type EditorAction =
  | { type: 'ADD_COMPONENT'; payload: Omit<Component, 'id'> }
  | { type: 'UPDATE_COMPONENT'; id: number; changes: Partial<Component> }
  | {
    type: 'UPDATE_METADATA';
    changes: Partial<{ title: string; description: string }>;
  }
  | { type: 'DELETE_COMPONENT'; id: number }
  | { type: 'MOVE_COMPONENT'; id: number; x: number; y: number }
  | { type: 'SELECT_COMPONENT'; id: number | null }
  | { type: 'SET_DRAGGING'; id: number | null }
  | {
    type: 'SET_RESIZING';
    payload: {
      id: number;
      handle: ResizeHandle;
      startX: number;
      startY: number;
      initialBounds: { x: number; y: number; width: number; height: number };
    } | null;
  }
  | {
    type: 'RESIZE_COMPONENT';
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }
  | { type: 'COMMIT_HISTORY' }
  | { type: 'UNDO' }
  | { type: 'SET_ALIGNMENT_LINES'; lines: AlignmentLine[] }
  | { type: 'REDO' }
  | {
    type: 'LOAD_REPORT';
    payload: { title: string; description: string; components: Component[] };
  }
  | { type: 'BATCH'; actions: EditorAction[] };

export interface ReportData {
  id?: number;
  title: string;
  description: string;
  components: Component[];
}
