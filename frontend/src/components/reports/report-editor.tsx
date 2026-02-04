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
  Minus,
  Plus,
  Maximize2,
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
      return action.actions.reduce((s, a) => editorReducer(s, a), state);
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

const formatPreviewCell = (value: unknown) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
};

export function ReportEditor({ initialData, onSave }: Readonly<ReportEditorProps>) {
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
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const paperRef = useRef<HTMLDivElement | null>(null);

  const PAPER_W = 794;
  const PAPER_H = 1123;

  // SQL Editor Modal state
  const [sqlModalOpen, setSqlModalOpen] = useState(false);
  const [editingComponentId, setEditingComponentId] = useState<number | null>(
    null,
  );
  const [sqlQuery, setSqlQuery] = useState("");
  const [sqlResult, setSqlResult] = useState<SqlResult | null>(null);

  // Canvas zoom (Figma-like)
  const [zoom, setZoom] = useState(1);
  
  // SQL Editor panel resize
  const [editorWidth, setEditorWidth] = useState(50); // percentage
  const [isResizing, setIsResizing] = useState(false);

  // ------------------------------------------------------------------
  // Helper Functions
  // ------------------------------------------------------------------

  const snapToGrid = (value: number) => {
    return Math.round(value / gridSize) * gridSize;
  };

  const clampZoom = (value: number) => Math.min(2, Math.max(0.25, value));

  const fitToViewport = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();
    // padding around page + room for zoom controls/status bar
    const availableW = Math.max(320, rect.width - 64);
    const availableH = Math.max(320, rect.height - 64);
    const next = Math.min(availableW / PAPER_W, availableH / PAPER_H);
    setZoom(clampZoom(next));
  }, []);

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
      globalThis.addEventListener("mousemove", handleMouseMove);
      globalThis.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      globalThis.removeEventListener("mousemove", handleMouseMove);
      globalThis.removeEventListener("mouseup", handleMouseUp);
    };
  }, [state.draggingId]);

  // Re-fit when viewport changes size
  useEffect(() => {
    const handleResize = () => {
      // keep current zoom, but if it was previously "fit-like" this will still be usable.
      // Users can always hit "fit" explicitly.
    };
    globalThis.addEventListener("resize", handleResize);
    return () => globalThis.removeEventListener("resize", handleResize);
  }, []);

  // Panel resize handler
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const modal = document.querySelector('[role="dialog"]') as HTMLElement;
      if (!modal) return;
      const rect = modal.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(30, Math.min(70, (x / rect.width) * 100));
      setEditorWidth(percentage);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    globalThis.addEventListener("mousemove", handleMouseMove);
    globalThis.addEventListener("mouseup", handleMouseUp);
    return () => {
      globalThis.removeEventListener("mousemove", handleMouseMove);
      globalThis.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

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
    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
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
    <div className="flex h-[800px] w-full bg-background text-foreground border border-border rounded-xl overflow-hidden relative">
      {/* Layout: Activity bar + content */}
      <div className="flex w-full h-full">
        {/* Activity Bar (VS Code style) */}
        <div className="w-14 shrink-0 bg-muted/30 border-r border-border flex flex-col items-center py-2 gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => addComponent("text")}
            title="Texto (T)"
            className="h-9 w-9">
            <Type className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => addComponent("table")}
            title="Tabela (B)"
            className="h-9 w-9">
            <Table className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => addComponent("chart")}
            title="Gráfico (G)"
            className="h-9 w-9">
            <BarChart className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => addComponent("image")}
            title="Imagem (I)"
            className="h-9 w-9">
            <ImageIcon className="w-5 h-5" />
          </Button>
        </div>

        {/* Main */}
        <div className="flex-1 min-w-0 flex flex-col relative">
          {/* Top Bar (48px) */}
          <div className="h-12 border-b border-border bg-background/80 backdrop-blur flex items-center px-4 gap-3 z-20">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="text-muted-foreground truncate">Relatórios</span>
              <span className="text-muted-foreground">/</span>
              <span className="font-semibold truncate">
                {initialData?.name || "Editor Visual"}
              </span>
            </div>

            {/* Actions (center) */}
            <div className="flex-1 flex items-center justify-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => dispatch({ type: "UNDO" })}
                disabled={state.historyIndex <= 0}
                title="Undo"
                className="h-9 w-9">
                <Undo className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => dispatch({ type: "REDO" })}
                disabled={state.historyIndex >= state.history.length - 1}
                title="Redo"
                className="h-9 w-9">
                <Redo className="w-4 h-4" />
              </Button>
              <div className="w-px h-5 bg-border mx-2" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => openSqlEditor()}
                className="flex items-center gap-1 text-xs h-8"
                title="Open SQL Editor (Ctrl+Shift+S)">
                <Database className="w-4 h-4" />
                SQL Editor
              </Button>
            </div>

            {/* Save (right) */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs">
                Preview
              </Button>
              <Button size="sm" className="h-8 text-xs" onClick={() => onSave?.(state.components)}>
                Salvar
              </Button>
            </div>
          </div>

          {/* Canvas viewport */}
          <div
            ref={viewportRef}
            className="flex-1 min-h-0 overflow-auto bg-muted/20 relative"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                dispatch({ type: "SELECT_COMPONENT", id: null });
              }
            }}
            onClick={() => dispatch({ type: "SELECT_COMPONENT", id: null })}>
            {/* Zoom controls */}
            <div className="absolute top-3 right-3 z-20">
              <div className="flex items-center gap-1 bg-background/95 backdrop-blur border border-border rounded-lg shadow-sm p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  title="Zoom out"
                  onClick={() => setZoom((z) => clampZoom(Number((z - 0.1).toFixed(2))))}>
                  <Minus className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs tabular-nums"
                  title="Reset zoom"
                  onClick={() => setZoom(1)}>
                  {Math.round(zoom * 100)}%
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  title="Zoom in"
                  onClick={() => setZoom((z) => clampZoom(Number((z + 0.1).toFixed(2))))}>
                  <Plus className="w-4 h-4" />
                </Button>
                <div className="w-px h-5 bg-border mx-1" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  title="Fit"
                  onClick={fitToViewport}>
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-8">
              <div
                id="canvas-area"
                className="mx-auto w-fit"
                role="presentation"
                onClick={(e) => e.stopPropagation()}>
                <div
                  ref={paperRef}
                  className="relative canvas-grid bg-background border border-border shadow-sm ui-motion w-[794px] h-[1123px]"
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: "top left",
                  }}>
                  {/* Components */}
                  {state.components.map((comp) => (
                    <div
                      key={comp.id}
                      className={cn(
                        "absolute border bg-background cursor-move group",
                        "hover:border-primary/50 hover:shadow-sm",
                        state.selectedId === comp.id
                          ? "border-primary ring-1 ring-primary/20 z-10"
                          : "border-border",
                      )}
                      style={{
                        left: comp.x,
                        top: comp.y,
                        width: comp.width,
                        height: comp.height,
                      }}
                      onMouseDown={(e) => startDrag(e, comp.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          dispatch({ type: "SELECT_COMPONENT", id: comp.id });
                        }
                        if (e.key === "Delete" || e.key === "Backspace") {
                          e.preventDefault();
                          deleteComponent(comp.id);
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch({ type: "SELECT_COMPONENT", id: comp.id });
                      }}>
                      {/* Floating mini-toolbar */}
                      <div
                        className={cn(
                          "absolute -top-9 right-0 flex gap-1 rounded-md border border-border bg-background/95 backdrop-blur shadow-sm p-1",
                          "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto",
                          state.selectedId === comp.id && "opacity-100 pointer-events-auto",
                        )}>
                        {comp.type === "table" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              openSqlEditor(comp.id);
                            }}>
                            <Table className="w-3.5 h-3.5 mr-1" />
                            SQL
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title="Delete component"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteComponent(comp.id);
                          }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      {/* Resize handle (visual affordance) */}
                      <div
                        className={cn(
                          "absolute -bottom-1.5 -right-1.5 h-3 w-3 rounded-sm bg-primary/20",
                          state.selectedId === comp.id ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                        )}
                      />

                      <div className="w-full h-full overflow-hidden p-2 pointer-events-none text-sm">
                        {comp.type === "text" && (
                          <div className="text-sm font-medium">{comp.content}</div>
                        )}
                        {comp.type === "image" && (
                          <div className="flex items-center justify-center h-full bg-muted/30 text-3xl text-muted-foreground">
                            🖼️
                          </div>
                        )}
                        {comp.type === "chart" && (
                          <div className="flex items-center justify-center h-full bg-muted/30 text-primary/60">
                            <BarChart className="w-14 h-14" />
                          </div>
                        )}
                        {comp.type === "table" && (
                          <div className="text-xs w-full h-full overflow-hidden">
                            {comp.sqlResult ? (
                              <div className="space-y-1">
                                <div className="font-medium text-muted-foreground">
                                  Resultados ({comp.sqlResult.rowCount})
                                </div>
                                <div className="grid grid-cols-2 gap-1 opacity-70">
                                  {comp.sqlResult.rows.slice(0, 10).map((r, i) => (
                                    <div
                                      key={`${comp.id}-${i}`}
                                      className="bg-muted/40 border border-border rounded-sm px-1.5 py-1 truncate">
                                      {formatPreviewCell(r?.[1])}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-full text-muted-foreground">
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
            </div>
          </div>

          {/* Status bar (28px) */}
          <div className="h-7 border-t border-border bg-background/80 backdrop-blur flex items-center px-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-3 min-w-0">
              <span className="truncate">Conectado</span>
              <span>•</span>
              <span>{state.components.length} componentes</span>
              <span>•</span>
              <span>Zoom {Math.round(zoom * 100)}%</span>
            </div>
            <div className="ml-auto min-w-0 truncate">
              {state.selectedId !== null
                ? `Selecionado: #${state.selectedId}`
                : "Nenhum componente selecionado"}
            </div>
          </div>
        </div>
      </div>

      {/* SQL Editor Modal */}
      <Dialog open={sqlModalOpen} onOpenChange={setSqlModalOpen}>
        <DialogContent className="w-[95vw] max-w-[95vw] h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <DialogTitle className="text-base font-semibold">
              SQL Editor
            </DialogTitle>
            <DialogDescription className="sr-only">
              Professional SQL Editor with syntax highlighting
            </DialogDescription>
            <p className="text-xs text-muted-foreground">
              {editingComponentId !== null
                ? `Componente #${editingComponentId}`
                : "Editor global"}
            </p>
          </div>
          <div className="flex-1 flex flex-row min-h-0 relative">
            {/* Editor Panel */}
            <div
              className="flex flex-col min-w-0 border-r border-border bg-muted/20"
              style={{ width: `${editorWidth}%` }}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  SQL Query
                </h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex items-center gap-1.5 h-7 text-xs"
                    onClick={executeSql}
                    disabled={isExecuting}>
                    {isExecuting ? (
                      <>
                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        Execute
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex-1 min-h-0 relative">
                <SqlEditor
                  value={sqlQuery}
                  onChange={setSqlQuery}
                  height="100%"
                  onExecute={executeSql}
                />
              </div>
              {error && (
                <div className="px-4 py-2 border-t border-destructive/30 bg-destructive/10 flex items-start gap-2 text-xs">
                  <AlertCircle className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" />
                  <span className="text-destructive">{error}</span>
                </div>
              )}
            </div>

            {/* Resize Handle */}
            <div
              className="w-1 bg-border hover:bg-primary/50 transition-colors cursor-col-resize active:bg-primary"
              onMouseDown={() => setIsResizing(true)}
            />

            {/* Results Panel */}
            <div
              className="flex flex-col min-w-0 bg-background"
              style={{ width: `${100 - editorWidth}%` }}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Results
                </h3>
                <div className="text-xs text-muted-foreground tabular-nums">
                  {sqlResult ? `${sqlResult.rowCount} rows • ${sqlResult.duration}ms` : "—"}
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                {sqlResult ? (
                  <QueryResultsTable result={sqlResult} />
                ) : (
                  <div className="flex-1 flex items-center justify-center border border-border rounded-md text-muted-foreground bg-muted/10 m-4">
                    <div className="text-center">
                      <Table className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-xs">
                        {isExecuting ? "Executing query..." : "No results yet"}
                      </p>
                      <p className="text-xs mt-1 text-muted-foreground/70">
                        Press{" "}
                        <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs">
                          Ctrl+Enter
                        </kbd>{" "}
                        to execute
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-border bg-muted/20 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setSqlModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={applySql}
              disabled={!sqlResult}
              >
              Apply to Component
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
