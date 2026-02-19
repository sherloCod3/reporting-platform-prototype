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
  Eye,
  Edit2,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SqlEditor } from "@/components/sql/sql-editor";
import { useSqlExecution } from "@/hooks/use-sql-execution";
import { toast } from "sonner";
import type {
  Component,
  SqlResult,
  ResizeHandle,
  AlignmentLine,
  ReportData,
} from "./types";
import { useReportEditor } from "@/hooks/use-report-editor";
import { CanvasItem } from "./canvas-item";
import { AlignmentGuides } from "./alignment-guides";
import { PropertiesPanel } from "./properties-panel";
import { AxiosError } from "axios";

interface ReportEditorProps {
  initialData?: Partial<ReportData>;
  onSave?: (data: ReportData) => void;
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
  } = useReportEditor({
    title: initialData?.title,
    description: initialData?.description,
    components: initialData?.components,
  });

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
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: "UPDATE_METADATA",
      changes: { title: e.target.value },
    });
  };

  // ------------------------------------------------------------------
  // Interaction Handlers
  // ------------------------------------------------------------------

  const calculateAlignment = useCallback(
    (
      id: number,
      x: number,
      y: number,
      w: number,
      h: number,
      components: Component[],
      gridSnapper: (val: number) => number,
    ) => {
      const SNAP_THRESHOLD = 10; // Increased from 5 to 8-10 for stickier alignment
      const lines: AlignmentLine[] = [];

      // 1. Start with Raw Position
      let finalX = x;
      let finalY = y;

      // Flags to track if we found an alignment snap
      let snappedX = false;
      let snappedY = false;

      // Edges to check: [value, type, isCenter]
      const horizontalCandidates = [
        { val: y, type: "start" }, // Top
        { val: y + h / 2, type: "center" }, // Middle
        { val: y + h, type: "end" }, // Bottom
      ];

      const verticalCandidates = [
        { val: x, type: "start" }, // Left
        { val: x + w / 2, type: "center" }, // Center
        { val: x + w, type: "end" }, // Right
      ];

      // 2. Check Alignments (Highest Priority)
      components.forEach((other) => {
        if (other.id === id) return;

        const otherCenters = {
          x: other.x + other.width / 2,
          y: other.y + other.height / 2,
        };

        const otherH = [
          other.y, // Top
          otherCenters.y, // Middle
          other.y + other.height, // Bottom
        ];

        const otherV = [
          other.x, // Left
          otherCenters.x, // Center
          other.x + other.width, // Right
        ];

        // Check Horizontal Alignment (Y-axis)
        // Only snap if we haven't already hard-snapped to a line (or prioritize closest?)
        // For simplicity, we accumulate small diffs, but let's strictly set if matched
        if (!snappedY) {
          horizontalCandidates.forEach((cand) => {
            otherH.forEach((target) => {
              if (Math.abs(cand.val - target) < SNAP_THRESHOLD) {
                const diff = target - cand.val;
                finalY += diff;
                snappedY = true; // Mark as snapped to alignment
                lines.push({
                  type: "horizontal",
                  y: target,
                  start: Math.min(x, other.x), // Visuals use current pos
                  end: Math.max(x + w, other.x + other.width),
                });
              }
            });
          });
        }

        // Check Vertical Alignment (X-axis)
        if (!snappedX) {
          verticalCandidates.forEach((cand) => {
            otherV.forEach((target) => {
              if (Math.abs(cand.val - target) < SNAP_THRESHOLD) {
                const diff = target - cand.val;
                finalX += diff;
                snappedX = true; // Mark as snapped to alignment
                lines.push({
                  type: "vertical",
                  x: target,
                  start: Math.min(y, other.y),
                  end: Math.max(y + h, other.y + other.height),
                });
              }
            });
          });
        }
      });

      // 3. Fallback to Grid Snap if NO alignment found
      if (!snappedX) {
        finalX = gridSnapper(x);
      }
      if (!snappedY) {
        finalY = gridSnapper(y);
      }

      return { x: finalX, y: finalY, lines };
    },
    [],
  );

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

  const startResize = useCallback(
    (e: React.MouseEvent, id: number, handle: ResizeHandle) => {
      e.stopPropagation();
      e.preventDefault(); // Prevent native drag/select interactions

      const comp = state.components.find((c) => c.id === id);
      if (!comp) return;

      dispatch({
        type: "SET_RESIZING",
        payload: {
          id,
          handle,
          startX: e.clientX,
          startY: e.clientY,
          initialBounds: {
            x: comp.x,
            y: comp.y,
            width: comp.width,
            height: comp.height,
          },
        },
      });
    },
    [state.components, dispatch],
  );

  // Global Drag listeners
  useEffect(() => {
    // Define handleMouseUp first so it can be called by handleMouseMove
    const handleMouseUp = () => {
      // Clear alignment lines on drop
      if (state.alignmentLines.length > 0) {
        dispatch({ type: "SET_ALIGNMENT_LINES", lines: [] });
      }

      if (state.draggingId !== null) {
        dispatch({
          type: "BATCH",
          actions: [
            { type: "COMMIT_HISTORY" },
            { type: "SET_DRAGGING", id: null },
          ],
        });
      } else if (state.resizing) {
        dispatch({
          type: "BATCH",
          actions: [
            { type: "COMMIT_HISTORY" },
            { type: "SET_RESIZING", payload: null },
            { type: "SELECT_COMPONENT", id: state.resizing.id }, // Re-select after resize
          ],
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Disable global drag in preview mode (safety check)
      if (mode === "preview") return;

      // Robustness: If buttons are 0, mouse is not pressed. Cancel operation.
      if (e.buttons === 0) {
        handleMouseUp();
        return;
      }

      if (state.draggingId !== null && paperRef.current) {
        const paperRect = paperRef.current.getBoundingClientRect();

        // Calculate raw position relative to paper
        // We divide by zoom to convert screen pixels back to CSS pixels
        const rawX = (e.clientX - paperRect.left) / zoom - dragOffset.current.x;
        const rawY = (e.clientY - paperRect.top) / zoom - dragOffset.current.y;

        // Use Alignment instead of just grid snapping for drag
        const currentComp = state.components.find(
          (c) => c.id === state.draggingId,
        );
        if (currentComp) {
          const { x, y, lines } = calculateAlignment(
            state.draggingId,
            rawX,
            rawY,
            currentComp.width,
            currentComp.height,
            state.components,
            snapToGrid,
          );

          dispatch({
            type: "BATCH",
            actions: [
              { type: "MOVE_COMPONENT", id: state.draggingId, x, y },
              { type: "SET_ALIGNMENT_LINES", lines },
            ],
          });
        }
      } else if (state.resizing) {
        // RESIZE LOGIC
        const { handle, startX, startY, initialBounds } = state.resizing;

        // Calculate delta in CSS pixels (accounting for zoom)
        const deltaX = (e.clientX - startX) / zoom;
        const deltaY = (e.clientY - startY) / zoom;

        let newX = initialBounds.x;
        let newY = initialBounds.y;
        let newW = initialBounds.width;
        let newH = initialBounds.height;

        // Apply delta based on handle
        if (handle.includes("e")) newW = initialBounds.width + deltaX;
        if (handle.includes("w")) {
          newW = initialBounds.width - deltaX;
          newX = initialBounds.x + deltaX;
        }
        if (handle.includes("s")) newH = initialBounds.height + deltaY;
        if (handle.includes("n")) {
          newH = initialBounds.height - deltaY;
          newY = initialBounds.y + deltaY;
        }

        // Enforce Minimums & Corrections
        const MIN_SIZE = 20;

        if (newW < MIN_SIZE) {
          newW = MIN_SIZE;
          if (handle.includes("w")) {
            newX = initialBounds.x + initialBounds.width - MIN_SIZE;
          }
        }
        if (newH < MIN_SIZE) {
          newH = MIN_SIZE;
          if (handle.includes("n")) {
            newY = initialBounds.y + initialBounds.height - MIN_SIZE;
          }
        }

        // Apply Snap to Grid
        const snappedX = snapToGrid(newX);
        const snappedY = snapToGrid(newY);
        const snappedW = snapToGrid(newW);
        const snappedH = snapToGrid(newH);

        dispatch({
          type: "RESIZE_COMPONENT",
          id: state.resizing.id,
          x: snappedX,
          y: snappedY,
          width: snappedW,
          height: snappedH,
        });
      }
    };

    if (state.draggingId !== null || state.resizing !== null) {
      globalThis.addEventListener("mousemove", handleMouseMove);
      globalThis.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      globalThis.removeEventListener("mousemove", handleMouseMove);
      globalThis.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    state.draggingId,
    state.resizing,
    zoom,
    snapToGrid,
    dispatch,
    mode,
    calculateAlignment,
    state.components,
    state.alignmentLines.length,
  ]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode === "preview") return;

      // Delete
      if (e.key === "Delete" || e.key === "Backspace") {
        if (state.selectedId !== null) {
          dispatch({ type: "DELETE_COMPONENT", id: state.selectedId });
        }
      }

      // Arrows (Nudge)
      if (state.selectedId !== null) {
        const comp = state.components.find((c) => c.id === state.selectedId);
        if (comp) {
          const step = e.shiftKey ? 10 : 1;
          let { x, y } = comp;
          let handled = false;

          if (e.key === "ArrowLeft") {
            x -= step;
            handled = true;
          }
          if (e.key === "ArrowRight") {
            x += step;
            handled = true;
          }
          if (e.key === "ArrowUp") {
            y -= step;
            handled = true;
          }
          if (e.key === "ArrowDown") {
            y += step;
            handled = true;
          }

          if (handled) {
            e.preventDefault();
            dispatch({ type: "MOVE_COMPONENT", id: comp.id, x, y });
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.selectedId, state.components, dispatch, mode]);

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

  const updateComponent = (id: number, changes: Partial<Component>) => {
    dispatch({ type: "UPDATE_COMPONENT", id, changes });
  };

  const selectedComponent = state.selectedId
    ? state.components.find((c) => c.id === state.selectedId) || null
    : null;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] w-full bg-app text-foreground border border-border rounded-lg overflow-hidden relative shadow-sm">
      {/* 1. Header & Toolbar (New Layout) */}
      <div className="h-14 border-b border-border bg-surface/80 backdrop-blur-sm flex items-center justify-between px-4 z-20">
        {/* Left: Tools */}
        <div className="flex items-center gap-1">
          {/* Mode Toggle */}
          <div className="bg-muted/50 p-1 rounded-md flex gap-1 border border-border/50 mr-2">
            <Button
              variant={mode === "edit" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => setMode("edit")}
              title="Edit Mode">
              <Edit2 className="w-3.5 h-3.5 mr-1.5" />
              Edit
            </Button>
            <Button
              variant={mode === "preview" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => {
                setMode("preview");
                dispatch({ type: "SELECT_COMPONENT", id: null });
              }}
              title="Preview Mode">
              <Eye className="w-3.5 h-3.5 mr-1.5" />
              Preview
            </Button>
          </div>

          {mode === "edit" && (
            <>
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
            </>
          )}
        </div>

        {/* Center: Title (Editable) */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
          <input
            type="text"
            value={state.title}
            onChange={handleTitleChange}
            disabled={mode === "preview"}
            className="text-sm font-semibold text-center bg-transparent border-none outline-none focus:ring-1 focus:ring-primary rounded px-2 w-64 text-foreground placeholder:text-muted-foreground/50 transition-colors"
            placeholder="Untitled Report"
          />
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
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}>
            {isSidebarOpen ? (
              <PanelRightClose className="w-4 h-4 text-muted-foreground" />
            ) : (
              <PanelRightOpen className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>

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
            onClick={() =>
              onSave?.({
                title: state.title,
                description: state.description,
                components: state.components,
              })
            }>
            Save Report
          </Button>
        </div>
      </div>

      {/* Main Content Area (Workspace + Sidebar) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 2. Workspace Area */}
        <div
          ref={viewportRef}
          className="flex-1 bg-app overflow-auto relative cursor-grab active:cursor-grabbing"
          onClick={() => dispatch({ type: "SELECT_COMPONENT", id: null })}>
          <div className="min-w-full min-h-full p-16 flex justify-center items-start">
            <div
              ref={paperRef}
              id="canvas-area"
              className={`bg-canvas shadow-lg border border-border/50 relative transition-transform duration-200 ease-out origin-top ${
                mode === "edit" ? "canvas-grid-pattern" : ""
              }`}
              style={{
                width: PAPER_W,
                height: PAPER_H,
                transform: `scale(${zoom})`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                // User Request: Click inside canvas also deselects
                dispatch({ type: "SELECT_COMPONENT", id: null });
              }}>
              <AlignmentGuides lines={state.alignmentLines} zoom={zoom} />
              {state.components.map((comp) => (
                <CanvasItem
                  key={comp.id}
                  component={comp}
                  isSelected={state.selectedId === comp.id}
                  onSelect={(id) => dispatch({ type: "SELECT_COMPONENT", id })}
                  onDelete={deleteComponent}
                  onEditSql={openSqlEditor}
                  onDragStart={startDrag}
                  onResizeStart={startResize}
                  readOnly={mode === "preview"}
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

        {/* 3. Properties Panel (Right Sidebar) */}
        {mode === "edit" && isSidebarOpen && (
          <PropertiesPanel
            component={selectedComponent}
            onUpdate={updateComponent}
          />
        )}
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
                        {sqlResult.columns.map((col, j) => (
                          <td
                            key={j}
                            className="p-1 border-b border-border/50 truncate max-w-[150px]">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {String((row as any)[col] ?? "")}
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
