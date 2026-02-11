/**
 * Type definitions for the Report Editor
 */

export interface SqlResult {
    columns: string[];
    rows: unknown[][];
    rowCount: number;
    duration: number; // milliseconds
}

export type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

export interface ComponentStyle {
    fontFamily?: string;
    fontSize?: number;
    textAlign?: "left" | "center" | "right" | "justify";
    color?: string; // Text color
    backgroundColor?: string;
    borderWidth?: number;
    borderColor?: string;
    borderRadius?: number;
    opacity?: number;
}

export interface Component {
    id: number;
    type: "text" | "table" | "chart" | "image";
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
    type: "vertical" | "horizontal";
    x?: number;
    y?: number;
    start: number;
    end: number;
}

/**
 * Editor state managed by useReducer
 */
export interface EditorState {
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

/**
 * Action types for the reducer
 */
export type EditorAction =
    | { type: "ADD_COMPONENT"; payload: Omit<Component, "id"> }
    | { type: "UPDATE_COMPONENT"; id: number; changes: Partial<Component> }
    | { type: "DELETE_COMPONENT"; id: number }
    | { type: "MOVE_COMPONENT"; id: number; x: number; y: number }
    | { type: "DELETE_COMPONENT"; id: number }
    | { type: "MOVE_COMPONENT"; id: number; x: number; y: number }
    | { type: "SELECT_COMPONENT"; id: number | null }
    | { type: "SET_DRAGGING"; id: number | null }
    | {
        type: "SET_RESIZING";
        payload: {
            id: number;
            handle: ResizeHandle;
            startX: number;
            startY: number;
            initialBounds: { x: number; y: number; width: number; height: number };
        } | null;
    }
    | { type: "RESIZE_COMPONENT"; id: number; x: number; y: number; width: number; height: number }
    | { type: "COMMIT_HISTORY" }
    | { type: "UNDO" }
    | { type: "SET_ALIGNMENT_LINES"; lines: AlignmentLine[] }
    | { type: "REDO" }
    | { type: "BATCH"; actions: EditorAction[] };
