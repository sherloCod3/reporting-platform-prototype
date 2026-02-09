import { useReducer, useCallback } from "react";
import type { Component, EditorState } from "@/components/reports/types";

// Actions
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

// Reducer
function editorReducer(state: EditorState, action: EditorAction): EditorState {
    switch (action.type) {
        case "ADD_COMPONENT": {
            const newComp: Component = { ...action.payload, id: state.nextId };
            const newComponents = [ ...state.components, newComp ];

            return {
                ...state,
                components: newComponents,
                history: [
                    ...state.history.slice(0, state.historyIndex + 1),
                    newComponents,
                ],
                historyIndex: state.historyIndex + 1,
                nextId: state.nextId + 1,
                selectedId: newComp.id, // Auto-select new component
            };
        }

        case "UPDATE_COMPONENT": {
            const newComponents = state.components.map((c) =>
                c.id === action.id ? { ...c, ...action.changes } : c
            );

            return {
                ...state,
                components: newComponents,
            };
        }

        case "DELETE_COMPONENT": {
            const newComponents = state.components.filter((c) => c.id !== action.id);

            return {
                ...state,
                components: newComponents,
                history: [
                    ...state.history.slice(0, state.historyIndex + 1),
                    newComponents,
                ],
                historyIndex: state.historyIndex + 1,
                selectedId: state.selectedId === action.id ? null : state.selectedId,
            };
        }

        case "MOVE_COMPONENT": {
            // Early return if position hasn't changed (performance optimization)
            const existing = state.components.find((c) => c.id === action.id);
            if (existing?.x === action.x && existing?.y === action.y) {
                return state;
            }

            const newComponents = state.components.map((c) =>
                c.id === action.id ? { ...c, x: action.x, y: action.y } : c
            );

            return {
                ...state,
                components: newComponents,
            };
        }

        case "SELECT_COMPONENT": {
            return {
                ...state,
                selectedId: action.id,
            };
        }

        case "SET_DRAGGING": {
            return {
                ...state,
                draggingId: action.id,
            };
        }

        case "COMMIT_HISTORY": {
            return {
                ...state,
                history: [
                    ...state.history.slice(0, state.historyIndex + 1),
                    state.components,
                ],
                historyIndex: state.historyIndex + 1,
            };
        }

        case "UNDO": {
            if (state.historyIndex <= 0) return state;

            return {
                ...state,
                components: state.history[ state.historyIndex - 1 ],
                historyIndex: state.historyIndex - 1,
            };
        }

        case "REDO": {
            if (state.historyIndex >= state.history.length - 1) return state;

            return {
                ...state,
                components: state.history[ state.historyIndex + 1 ],
                historyIndex: state.historyIndex + 1,
            };
        }

        case "BATCH": {
            return action.actions.reduce((s, a) => editorReducer(s, a), state);
        }

        default:
            return state;
    }
}

// Hook
export function useReportEditor(initialData?: { components?: Component[] }) {
    const [ state, dispatch ] = useReducer(editorReducer, {
        components: initialData?.components || [],
        history: [ initialData?.components || [] ],
        historyIndex: 0,
        nextId: (initialData?.components?.length || 0) + 1,
        selectedId: null,
        draggingId: null,
    });

    const snapToGrid = useCallback((value: number, gridSize = 20) => {
        return Math.round(value / gridSize) * gridSize;
    }, []);

    const addComponent = useCallback((type: Component[ "type" ]) => {
        const sizes = {
            text: { w: 300, h: 60 },
            table: { w: 500, h: 200 },
            chart: { w: 400, h: 300 },
            image: { w: 300, h: 200 },
        };
        const size = sizes[ type ];

        dispatch({
            type: "ADD_COMPONENT",
            payload: {
                type,
                x: snapToGrid(50),
                y: snapToGrid(50 + state.components.length * 50),
                width: size.w,
                height: size.h,
                content: type === "text" ? "Novo Texto" : "",
                sqlQuery: type === "table" ? "SELECT * FROM users LIMIT 5" : undefined,
            },
        });
    }, [ state.components.length, snapToGrid ]);

    const deleteComponent = useCallback((id: number) => {
        dispatch({ type: "DELETE_COMPONENT", id });
    }, []);

    const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
    const redo = useCallback(() => dispatch({ type: "REDO" }), []);

    return {
        state,
        dispatch,
        addComponent,
        deleteComponent,
        undo,
        redo,
        snapToGrid
    };
}
