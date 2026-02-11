import { useReducer, useCallback } from "react";
import type { Component, EditorState, EditorAction } from "@/components/reports/types";

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

        case "RESIZE_COMPONENT": {
            const existing = state.components.find((c) => c.id === action.id);
            // Optimization: Skip if no change
            if (
                existing &&
                existing.width === action.width &&
                existing.height === action.height &&
                existing.x === action.x &&
                existing.y === action.y
            ) {
                return state;
            }

            const newComponents = state.components.map((c) =>
                c.id === action.id
                    ? {
                        ...c,
                        x: action.x,
                        y: action.y,
                        width: action.width,
                        height: action.height,
                    }
                    : c
            );

            return {
                ...state,
                components: newComponents,
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

        case "SET_RESIZING": {
            return {
                ...state,
                resizing: action.payload,
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

        case "UPDATE_METADATA": {
            return {
                ...state,
                ...action.changes,
            };
        }

        case "SET_ALIGNMENT_LINES": {
            return {
                ...state,
                alignmentLines: action.lines,
            };
        }

        case "LOAD_REPORT": {
            return {
                ...state,
                title: action.payload.title,
                description: action.payload.description,
                components: action.payload.components,
                history: [ action.payload.components ], // Reset history to loaded state
                historyIndex: 0,
                nextId: (action.payload.components.length > 0
                    ? Math.max(...action.payload.components.map(c => c.id))
                    : 0) + 1,
                selectedId: null,
            };
        }

        default:
            return state;
    }
}

// Hook
export function useReportEditor(initialData?: { title?: string; description?: string; components?: Component[] }) {
    const [ state, dispatch ] = useReducer(editorReducer, {
        title: initialData?.title || "Untitled Report", // Default title
        description: initialData?.description || "",
        components: initialData?.components || [],
        history: [ initialData?.components || [] ],
        historyIndex: 0,
        // CORRECTION: Use Max ID + 1 to avoid collisions with existing IDs (e.g. if we have id 5, 20)
        nextId: (initialData?.components && initialData.components.length > 0)
            ? Math.max(...initialData.components.map(c => c.id)) + 1
            : 1,
        selectedId: null,
        draggingId: null,
        resizing: null,
        alignmentLines: [],
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

    const loadReport = useCallback((data: { title: string; description: string; components: Component[] }) => {
        dispatch({ type: "LOAD_REPORT", payload: data });
    }, []);

    return {
        state,
        dispatch,
        addComponent,
        deleteComponent,
        undo,
        redo,
        snapToGrid,
        loadReport
    };
}
