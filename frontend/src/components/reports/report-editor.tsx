"use client";

import { useState, useRef, useEffect, useCallback, useReducer } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Type,
  Table,
  BarChart,
  Image as ImageIcon,
  Undo,
  Redo,
  Trash2,
  Play,
  AlertCircle,
  Database,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { SqlEditor } from "@/components/sql/sql-editor";
import { QueryResultsTable } from "@/components/sql/query-results-table";
import { useSqlExecution } from "@/hooks/use-sql-execution";
import { toast } from "sonner";
import type { Component, SqlResult, EditorState, EditorAction } from "./types";

/**
 * Reducer for managing editor state centrally.
 * Optimized to avoid unnecessary clones and support batching.
 */
function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "ADD_COMPONENT": {
      const newComp: Component = { ...action.payload, id: state.nextId };
      const newComponents = [...state.components, newComp];

      return {
        ...state,
        components: newComponents,
        history: [
          ...state.history.slice(0, state.historyIndex + 1),
          newComponents,
        ],
        historyIndex: state.historyIndex + 1,
        nextId: state.nextId + 1,
      };
    }

    case "UPDATE_COMPONENT": {
      const newComponents = state.components.map((c) =>
        c.id === action.id ? { ...c, ...action.changes } : c,
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
        c.id === action.id ? { ...c, x: action.x, y: action.y } : c,
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
        components: state.history[state.historyIndex - 1],
        historyIndex: state.historyIndex - 1,
      };
    }

    case "REDO": {
      if (state.historyIndex >= state.history.length - 1) return state;

      return {
        ...state,
        components: state.history[state.historyIndex + 1],
        historyIndex: state.historyIndex + 1,
      };
    }

    case "BATCH": {
      // Execute multiple actions without intermediate renders
      return action.actions.reduce(editorReducer, state);
    }

    default:
      return state;
  }
}

interface ReportEditorProps {
  initialData?: {
    name?: string;
    description?: string;
    components?: Component[];
    [key: string]: unknown;
  };
  onSave?: (components: Component[]) => void;
}

export function ReportEditor({ initialData, onSave }: ReportEditorProps) {
  // ------------------------------------------------------------------
  // State Management - Centralized with useReducer
  // ------------------------------------------------------------------

  const [state, dispatch] = useReducer(editorReducer, {
    components: initialData?.components || [],
    history: [initialData?.components || []],
    historyIndex: 0,
    nextId: 1,
    selectedId: null,
    draggingId: null,
  });

  // Ref for accessing current state in closures (prevents stale closures)
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Other state not managed by reducer
  const gridSize = 20;
  const dragOffset = useRef({ x: 0, y: 0 });

  // SQL Editor Modal state
  const [sqlModalOpen, setSqlModalOpen] = useState(false);
  const [editingComponentId, setEditingComponentId] = useState<number | null>(
    null,
  );
  const [sqlQuery, setSqlQuery] = useState("");
  const [sqlResult, setSqlResult] = useState<SqlResult | null>(null);

  // ------------------------------------------------------------------
  // Helper Functions
  // ------------------------------------------------------------------

  const snapToGrid = (value: number) => {
    return Math.round(value / gridSize) * gridSize;
  };

  const addComponent = (type: Component["type"]) => {
    const sizes = {
      text: { w: 300, h: 60 },
      table: { w: 500, h: 200 },
      chart: { w: 400, h: 300 },
      image: { w: 300, h: 200 },
    };
    const size = sizes[type];

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
  };

  // ------------------------------------------------------------------
  // Event Handlers
  // ------------------------------------------------------------------

  /**
   * Initiates the drag operation for a component.
   * Calculates the offset to ensure smooth dragging relative to the cursor.
   */
  const startDrag = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    dispatch({ type: "SET_DRAGGING", id });
    dispatch({ type: "SELECT_COMPONENT", id });
    const comp = state.components.find((c) => c.id === id);
    if (comp) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (state.draggingId !== null) {
        const canvasRect = document
          .getElementById("canvas-area")
          ?.getBoundingClientRect();
        if (!canvasRect) return;

        const rawX = e.clientX - canvasRect.left - dragOffset.current.x;
        const rawY = e.clientY - canvasRect.top - dragOffset.current.y;

        const snappedX = Math.round(Math.max(0, rawX) / 20) * 20;
        const snappedY = Math.round(Math.max(0, rawY) / 20) * 20;

        dispatch({
          type: "MOVE_COMPONENT",
          id: state.draggingId,
          x: snappedX,
          y: snappedY,
        });
      }
    };

    const handleMouseUp = () => {
      if (state.draggingId !== null) {
        dispatch({
          type: "BATCH",
          actions: [
            { type: "COMMIT_HISTORY" },
            { type: "SET_DRAGGING", id: null },
          ],
        });
      }
    };

    if (state.draggingId !== null) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [state.draggingId]);

  /**
   * Opens the SQL editor modal.
   * If id is provided, loads the component's existing query.
   * If no id, opens a blank editor (global SQL access).
   */
  const openSqlEditor = useCallback(
    (id?: number) => {
      if (id !== undefined) {
        const comp = state.components.find((c) => c.id === id);
        if (comp) {
          setEditingComponentId(id);
          setSqlQuery(comp.sqlQuery || "");
          setSqlResult(comp.sqlResult || null);
        }
      } else {
        // Global SQL editor access (no component selected)
        setEditingComponentId(null);
        setSqlQuery("");
        setSqlResult(null);
      }
      setSqlModalOpen(true);
    },
    [state.components],
  );

  // Keyboard shortcut for SQL editor (Ctrl+Shift+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "S") {
        e.preventDefault();
        openSqlEditor();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openSqlEditor]);

  // SQL execution hook
  const { executeQuery, isExecuting, error } = useSqlExecution();

  const executeSql = async () => {
    try {
      const queryResult = await executeQuery(sqlQuery);
      if (queryResult) {
        setSqlResult({
          columns: queryResult.columns,
          rows: queryResult.rows,
          rowCount: queryResult.rowCount,
          duration: queryResult.duration,
        });
        toast.success("Query executed successfully");
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to execute query");
    }
  };

  const applySql = () => {
    if (editingComponentId !== null) {
      dispatch({
        type: "BATCH",
        actions: [
          {
            type: "UPDATE_COMPONENT",
            id: editingComponentId,
            changes: { sqlQuery, sqlResult: sqlResult || undefined },
          },
          { type: "COMMIT_HISTORY" },
        ],
      });
      setSqlModalOpen(false);
    }
  };

  const deleteComponent = (id: number) => {
    dispatch({ type: "DELETE_COMPONENT", id });
  };

  return (
    <div className="flex h-[800px] w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden relative">
      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 h-14 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 dark:text-white">
            Editor Visual
          </span>
          <div className="h-4 w-px bg-slate-300 mx-2" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch({ type: "UNDO" })}
            disabled={state.historyIndex <= 0}
            title="Undo">
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch({ type: "REDO" })}
            disabled={state.historyIndex >= state.history.length - 1}
            title="Redo">
            <Redo className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openSqlEditor()}
            className="flex items-center gap-1 text-xs"
            title="Open SQL Editor (Ctrl+Shift+S)">
            <Database className="w-4 h-4" />
            SQL Editor
          </Button>
          <div className="h-4 w-px bg-slate-300 mx-1" />
          <Button variant="outline" className="text-xs">
            Preview
          </Button>
          <Button
            className="gradient-bg text-white border-0 text-xs"
            onClick={() => onSave?.(state.components)}>
            Salvar Relatório
          </Button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div
        className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-900 pt-16 p-8 relative"
        onClick={() => dispatch({ type: "SELECT_COMPONENT", id: null })}>
        <div
          id="canvas-area"
          className="bg-white dark:bg-slate-800 shadow-xl w-[794px] h-[1123px] mx-auto relative canvas-grid ui-motion"
          onClick={(e) => e.stopPropagation()}>
          {state.components.map((comp) => (
            <div
              key={comp.id}
              className={cn(
                "absolute border cursor-move group",
                state.selectedId === comp.id
                  ? "border-indigo-500 ring-1 ring-indigo-500 z-10"
                  : "border-slate-300 dark:border-slate-600 border-dashed",
              )}
              style={{
                left: comp.x,
                top: comp.y,
                width: comp.width,
                height: comp.height,
              }}
              onMouseDown={(e) => startDrag(e, comp.id)}
              onClick={(e) => {
                e.stopPropagation();
                dispatch({ type: "SELECT_COMPONENT", id: comp.id });
              }}>
              {state.selectedId === comp.id && (
                <div className="absolute -top-8 right-0 flex gap-1 bg-indigo-500 rounded p-1 shadow-lg text-white">
                  {comp.type === "table" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openSqlEditor(comp.id);
                      }}
                      className="px-2 py-0.5 hover:bg-indigo-600 rounded text-xs flex items-center gap-1">
                      <Table className="w-3 h-3" /> SQL
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteComponent(comp.id);
                    }}
                    title="Delete component"
                    className="px-2 py-0.5 hover:bg-red-500 rounded text-xs">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div className="w-full h-full overflow-hidden p-2 pointer-events-none">
                {comp.type === "text" && (
                  <div className="text-lg font-medium">{comp.content}</div>
                )}
                {comp.type === "image" && (
                  <div className="flex items-center justify-center h-full bg-slate-50 dark:bg-slate-700/50 text-4xl">
                    🖼️
                  </div>
                )}
                {comp.type === "chart" && (
                  <div className="flex items-center justify-center h-full bg-indigo-50 text-indigo-400">
                    <BarChart className="w-16 h-16" />
                  </div>
                )}
                {comp.type === "table" && (
                  <div className="text-xs w-full h-full overflow-hidden">
                    {comp.sqlResult ? (
                      <div className="space-y-1">
                        <div className="font-semibold text-slate-500">
                          Resultados ({comp.sqlResult.rowCount})
                        </div>
                        <div className="grid grid-cols-2 gap-1 opacity-60">
                          {comp.sqlResult.rows.map((r, i) => (
                            <div key={i} className="bg-slate-100 p-1 truncate">
                              {String(r[1] ?? "")}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400">
                        Sem dados SQL
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Toolbar (Right) */}
      <div className="absolute right-4 top-20 flex flex-col gap-2 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => addComponent("text")}
          title="Texto">
          <Type className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => addComponent("table")}
          title="Tabela">
          <Table className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => addComponent("chart")}
          title="Gráfico">
          <BarChart className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => addComponent("image")}
          title="Imagem">
          <ImageIcon className="w-5 h-5" />
        </Button>
      </div>

      {/* SQL Editor Modal */}
      <Dialog open={sqlModalOpen} onOpenChange={setSqlModalOpen}>
        <DialogContent className="w-[95vw] max-w-[95vw] h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center gradient-bg text-white">
            <DialogTitle className="flex items-center gap-2">
              <Table className="w-5 h-5" /> Professional SQL Editor
            </DialogTitle>
            <DialogDescription className="sr-only">
              Professional SQL Editor with syntax highlighting
            </DialogDescription>
          </div>
          <div className="flex-1 flex flex-row overflow-hidden min-h-0">
            {/* Editor Panel */}
            <div className="flex-1 w-1/2 flex flex-col border-r p-4 bg-slate-50 dark:bg-slate-900 min-w-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">SQL Query</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="gradient-bg border-0 flex items-center gap-1"
                    onClick={executeSql}
                    disabled={isExecuting}>
                    {isExecuting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Execute (Ctrl+Enter)
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex-1 min-h-[300px]">
                <SqlEditor
                  value={sqlQuery}
                  onChange={setSqlQuery}
                  height="100%"
                  onExecute={executeSql}
                />
              </div>
              {error && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-start gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                  <span className="text-red-700 dark:text-red-300">
                    {error}
                  </span>
                </div>
              )}
            </div>
            {/* Results Panel */}
            <div className="flex-1 w-1/2 flex flex-col p-4 bg-white dark:bg-slate-800 overflow-hidden min-w-0 min-h-0">
              <h3 className="text-sm font-semibold mb-3">Results</h3>
              {sqlResult ? (
                <QueryResultsTable result={sqlResult} />
              ) : (
                <div className="flex-1 flex items-center justify-center border border-dashed rounded-md text-slate-400">
                  <div className="text-center">
                    <Table className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">
                      {isExecuting ? "Executing query..." : "No results yet"}
                    </p>
                    <p className="text-xs mt-1">
                      Press{" "}
                      <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs">
                        Ctrl+Enter
                      </kbd>{" "}
                      to execute
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="p-4 border-t bg-slate-50 dark:bg-slate-900 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setSqlModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={applySql}
              disabled={!sqlResult}
              className="gradient-bg border-0">
              Apply to Component
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
