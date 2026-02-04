/**
 * Type definitions for the Report Editor
 */

export interface SqlResult {
    columns: string[];
    rows: unknown[][];
    rowCount: number;
    duration: number; // milliseconds
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
}

/**
 * Action types for the reducer
 */
export type EditorAction =
    | { type: "ADD_COMPONENT"; payload: Omit<Component, "id"> }
    | { type: "UPDATE_COMPONENT"; id: number; changes: Partial<Component> }
    | { type: "DELETE_COMPONENT"; id: number }
    | { type: "MOVE_COMPONENT"; id: number; x: number; y: number }
    | { type: "SELECT_COMPONENT"; id: number | null }
    | { type: "SET_DRAGGING"; id: number | null }
    | { type: "COMMIT_HISTORY" }
    | { type: "UNDO" }
    | { type: "REDO" }
    | { type: "BATCH"; actions: EditorAction[] };
