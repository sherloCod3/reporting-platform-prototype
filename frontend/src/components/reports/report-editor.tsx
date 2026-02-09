"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Type,
  Table,
  BarChart,
  Image as ImageIcon,
  Undo,
  Redo,
  Play,
  Database,
  Minus,
  Plus,
  Maximize2,
  Settings,
  Layout,
  MousePointer2,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SqlEditor } from "@/components/sql/sql-editor";
import { useSqlExecution } from "@/hooks/use-sql-execution";
import { toast } from "sonner";
import type { Component, SqlResult } from "./types";
import { useReportEditor } from "@/hooks/use-report-editor";
import { CanvasItem } from "./canvas-item";
import { AxiosError } from "axios";

interface ReportEditorProps {
  initialData?: {
    name?: string;
    description?: string;
    components?: Component[];
    [key: string]: unknown;
  };
  onSave?: (components: Component[]) => void;
}

export function ReportEditor({
  initialData,
  onSave,
}: Readonly<ReportEditorProps>) {
  // ------------------------------------------------------------------
  // State Management
  // ------------------------------------------------------------------

  const {
    state,
    dispatch,
    addComponent,
    deleteComponent,
    undo,
    redo,
    snapToGrid,
  } = useReportEditor(initialData);

  // Dragging State (Local to avoid hook thrashing)
  const dragOffset = useRef({ x: 0, y: 0 });

  // Canvas Refs
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const paperRef = useRef<HTMLDivElement | null>(null);

  const PAPER_W = 794;
  const PAPER_H = 1123;

  // UI State
  const [zoom, setZoom] = useState(1);
  const [activeTool, setActiveTool] = useState<"select" | "hand">("select");

  // SQL Modal State
  const [sqlModalOpen, setSqlModalOpen] = useState(false);
  const [editingComponentId, setEditingComponentId] = useState<number | null>(
    null,
  );
  const [sqlQuery, setSqlQuery] = useState("");
  const [sqlResult, setSqlResult] = useState<SqlResult | null>(null);

  // ------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------

  const clampZoom = (value: number) => Math.min(2, Math.max(0.25, value));

  const fitToViewport = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();
    const availableW = Math.max(320, rect.width - 64);
    const availableH = Math.max(320, rect.height - 64);
    const next = Math.min(availableW / PAPER_W, availableH / PAPER_H);
    setZoom(clampZoom(next));
  }, []);

  // ------------------------------------------------------------------
  // Interaction Handlers
  // ------------------------------------------------------------------

  const startDrag = useCallback(
    (e: React.MouseEvent, id: number) => {
      e.stopPropagation();
      if (activeTool !== "select") return;

      dispatch({ type: "SET_DRAGGING", id });
      dispatch({ type: "SELECT_COMPONENT", id });

      // Calculate offset
      const currentComp = state.components.find((c) => c.id === id);
      if (paperRef.current && currentComp) {
        const paperRect = paperRef.current.getBoundingClientRect();
        // Calculate cursor position relative to component top-left
        // Note: we need to account for zoom scale in the offset calculation
        const relativeX = (e.clientX - paperRect.left) / zoom;
        const relativeY = (e.clientY - paperRect.top) / zoom;

        dragOffset.current = {
          x: relativeX - currentComp.x,
          y: relativeY - currentComp.y,
        };
      }
    },
    [activeTool, state.components, zoom, dispatch],
  );

  // Global Drag listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (state.draggingId !== null && paperRef.current) {
        const paperRect = paperRef.current.getBoundingClientRect();

        // Calculate raw position relative to paper
        // We divide by zoom to convert screen pixels back to CSS pixels
        const rawX = (e.clientX - paperRect.left) / zoom - dragOffset.current.x;
        const rawY = (e.clientY - paperRect.top) / zoom - dragOffset.current.y;

        const snappedX = snapToGrid(Math.max(0, rawX));
        const snappedY = snapToGrid(Math.max(0, rawY));

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
  }, [state.draggingId, zoom, snapToGrid, dispatch]);

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
        setEditingComponentId(null);
        setSqlQuery("");
        setSqlResult(null);
      }
      setSqlModalOpen(true);
    },
    [state.components],
  );

  const { executeQuery, isExecuting } = useSqlExecution();

  const handleExecuteSql = async () => {
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
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message || "Failed to execute query");
    }
  };

  const saveSqlToComponent = () => {
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
      toast.success("SQL query saved to component");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] w-full bg-app text-foreground border border-border rounded-lg overflow-hidden relative shadow-sm">
      {/* 1. Header & Toolbar (New Layout) */}
      <div className="h-14 border-b border-border bg-surface/80 backdrop-blur-sm flex items-center justify-between px-4 z-20">
        {/* Left: Tools */}
        <div className="flex items-center gap-1">
          <div className="bg-muted/50 p-1 rounded-md flex gap-1 border border-border/50">
            <Button
              variant={activeTool === "select" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setActiveTool("select")}
              title="Select Tool (V)">
              <MousePointer2 className="w-4 h-4" />
            </Button>
            <Button
              variant={activeTool === "hand" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setActiveTool("hand")}
              title="Hand Tool (H)">
              <Layout className="w-4 h-4 rotate-45" />
            </Button>
          </div>

          <div className="w-px h-6 bg-border mx-2" />

          {/* Insert Tools */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
              onClick={() => addComponent("text")}>
              <Type className="w-4 h-4 mr-1.5" />
              Text
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
              onClick={() => addComponent("table")}>
              <Table className="w-4 h-4 mr-1.5" />
              Table
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
              onClick={() => addComponent("chart")}>
              <BarChart className="w-4 h-4 mr-1.5" />
              Chart
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
              onClick={() => addComponent("image")}>
              <ImageIcon className="w-4 h-4 mr-1.5" />
              Image
            </Button>
          </div>
        </div>

        {/* Center: Title (Optional) or Info */}
        <div className="absolute left-1/2 transform -translate-x-1/2 text-sm font-semibold text-muted-foreground opacity-50 select-none">
          {initialData?.name || "Untitled Report"}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted/30 rounded-md border border-border/50">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={undo}
              disabled={state.historyIndex <= 0}>
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={redo}
              disabled={state.historyIndex >= state.history.length - 1}>
              <Redo className="w-4 h-4" />
            </Button>
          </div>

          <div className="w-px h-6 bg-border mx-1" />

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Page Settings">
            <Settings className="w-4 h-4 text-muted-foreground" />
          </Button>

          <Button
            size="sm"
            className="h-8 px-4 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            onClick={() => onSave?.(state.components)}>
            Save Report
          </Button>
        </div>
      </div>

      {/* 2. Workspace Area */}
      <div
        ref={viewportRef}
        className="flex-1 bg-app overflow-auto relative cursor-grab active:cursor-grabbing"
        onClick={() => dispatch({ type: "SELECT_COMPONENT", id: null })}>
        <div className="min-w-full min-h-full p-16 flex justify-center items-start">
          <div
            ref={paperRef}
            id="canvas-area"
            className="bg-canvas shadow-lg border border-border/50 relative transition-transform duration-200 ease-out origin-top canvas-grid-pattern"
            style={{
              width: PAPER_W,
              height: PAPER_H,
              transform: `scale(${zoom})`,
            }}
            onClick={(e) => e.stopPropagation()}>
            {state.components.map((comp) => (
              <CanvasItem
                key={comp.id}
                component={comp}
                isSelected={state.selectedId === comp.id}
                onSelect={(id) => dispatch({ type: "SELECT_COMPONENT", id })}
                onDelete={deleteComponent}
                onEditSql={openSqlEditor}
                onDragStart={startDrag}
              />
            ))}
          </div>
        </div>

        {/* Floating Zoom Controls (Bottom Right) */}
        <div className="absolute bottom-6 right-6 flex items-center gap-1 bg-background/95 backdrop-blur border border-border rounded-lg shadow-md p-1 pl-3 z-30">
          <span className="text-xs font-mono text-muted-foreground w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <div className="w-px h-4 bg-border mx-1" />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setZoom((z) => clampZoom(z - 0.1))}>
            <Minus className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setZoom((z) => clampZoom(z + 0.1))}>
            <Plus className="w-3.5 h-3.5" />
          </Button>
          <div className="w-px h-4 bg-border mx-1" />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={fitToViewport}
            title="Fit to screen">
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* SQL Editor Modal */}
      <Dialog open={sqlModalOpen} onOpenChange={setSqlModalOpen}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-6 gap-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              Configure Data Source
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleExecuteSql}
                disabled={isExecuting}>
                <Play className="w-4 h-4 mr-2 fill-current" />
                Run Query
              </Button>
              {editingComponentId !== null && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={saveSqlToComponent}>
                  Save & Close
                </Button>
              )}
            </div>
          </div>

          <div className="flex-1 min-h-0 border rounded-md overflow-hidden bg-muted/50 flex flex-col">
            <div className="flex-1 relative">
              <SqlEditor
                value={sqlQuery}
                onChange={setSqlQuery}
                height="100%"
              />
            </div>
            {/* Results Preview Panel (Mini) */}
            {sqlResult && (
              <div className="h-48 border-t border-border bg-background p-2 overflow-auto">
                <div className="text-xs text-muted-foreground mb-2 flex justify-between">
                  <span>Results: {sqlResult.rowCount} rows</span>
                  <span>{sqlResult.duration}ms</span>
                </div>
                {/* Simple Table Preview */}
                <table className="w-full text-xs text-left">
                  <thead className="text-muted-foreground font-medium">
                    <tr>
                      {sqlResult.columns.map((c) => (
                        <th
                          key={c}
                          className="p-1 border-b border-border font-normal">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sqlResult.rows.map((row, i) => (
                      <tr key={i} className="hover:bg-muted/50">
                        {row.map((cell, j) => (
                          <td
                            key={j}
                            className="p-1 border-b border-border/50 truncate max-w-[150px]">
                            {String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
