"use client";

/**
 * SectionTable — Data table section with SQL query binding.
 *
 * Displays a truncated preview of query results and provides
 * access to the SQL editor modal. Column visibility and display
 * options are configurable when the section is selected.
 */

import React, { memo, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Table, Database, Play, Edit, Rows3 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SqlEditor } from "@/components/sql/sql-editor";
import { useSqlExecution } from "@/hooks/use-sql-execution";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type {
  TableSection,
  SqlBinding,
} from "@/features/report-composer/types/composer.types";
import type { SqlResult } from "@/components/reports/types";
import type { AxiosError } from "axios";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SectionTableProps {
  /** Table section data */
  section: TableSection;
  /** Whether this section is currently selected */
  isSelected: boolean;
  /** Called when a field changes */
  onUpdate: (id: string, changes: Partial<TableSection>) => void;
  /** Called when this section is clicked */
  onSelect: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Formats a cell value for display in the preview */
function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  return "";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const SectionTable: React.FC<Readonly<SectionTableProps>> = memo(
  function SectionTable({ section, isSelected, onUpdate, onSelect }) {
    // SQL editor modal state (local to this instance)
    const [modalOpen, setModalOpen] = useState(false);
    const [localQuery, setLocalQuery] = useState(section.sqlBinding.query);
    const [localResult, setLocalResult] = useState<SqlResult | null>(
      section.sqlBinding.lastResult ?? null,
    );

    const { executeQuery, isExecuting } = useSqlExecution();

    /** Opens the SQL editor modal pre-filled with the current query */
    const handleOpenModal = useCallback((): void => {
      setLocalQuery(section.sqlBinding.query);
      setLocalResult(section.sqlBinding.lastResult ?? null);
      setModalOpen(true);
    }, [section.sqlBinding]);

    /** Executes the current query and caches the result */
    const handleExecute = useCallback(async (): Promise<void> => {
      try {
        const result = await executeQuery(localQuery);
        if (result) {
          const sqlResult: SqlResult = {
            columns: result.columns,
            rows: result.rows,
            rowCount: result.rowCount,
            duration: result.duration,
          };
          setLocalResult(sqlResult);
          toast.success("Consulta executada com sucesso");
        }
      } catch (err: unknown) {
        const error = err as AxiosError<{ message: string }>;
        toast.error(
          error.response?.data?.message || "Falha ao executar consulta",
        );
      }
    }, [localQuery, executeQuery]);

    /** Saves the query and result back to the section state */
    const handleSaveAndClose = useCallback((): void => {
      const binding: SqlBinding = {
        ...section.sqlBinding,
        query: localQuery,
        lastResult: localResult ?? undefined,
      };
      onUpdate(section.id, { sqlBinding: binding });
      setModalOpen(false);
      toast.success("Fonte de dados vinculada à seção");
    }, [section.id, section.sqlBinding, localQuery, localResult, onUpdate]);

    /** Toggles row numbers */
    const handleToggleRowNumbers = useCallback(
      (checked: boolean): void => {
        onUpdate(section.id, { showRowNumbers: checked });
      },
      [section.id, onUpdate],
    );

    /** Toggles striped rows */
    const handleToggleStriped = useCallback(
      (checked: boolean): void => {
        onUpdate(section.id, { striped: checked });
      },
      [section.id, onUpdate],
    );

    /** Max rows change */
    const handleMaxRowsChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>): void => {
        const val = parseInt(e.target.value, 10);
        onUpdate(section.id, { maxRows: isNaN(val) ? undefined : val });
      },
      [section.id, onUpdate],
    );

    const hasData = Boolean(section.sqlBinding.lastResult);
    const previewRows = section.sqlBinding.lastResult?.rows.slice(0, 5) ?? [];
    const previewColumns = section.sqlBinding.lastResult?.columns ?? [];

    return (
      <div
        className={cn(
          "composer-section group relative border rounded-md transition-all duration-200",
          isSelected
            ? "border-primary/40 ring-1 ring-primary/15 bg-primary/[0.03]"
            : "border-border/40 hover:border-border/70 bg-card/50",
        )}
        onClick={() => onSelect(section.id)}
        role="button"
        tabIndex={0}>
        {/* Table Preview or Empty State */}
        <div className="px-6 py-4">
          {hasData ? (
            /* Data Preview — First 5 rows */
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Rows3 className="w-3 h-3" />
                  {section.sqlBinding.lastResult?.rowCount} registros
                </span>
                <span className="font-mono text-[10px] opacity-60">
                  {section.sqlBinding.lastResult?.duration}ms
                </span>
              </div>

              <div className="overflow-x-auto rounded border border-border/30">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/30">
                      {section.showRowNumbers && (
                        <th className="px-2 py-1 text-left text-muted-foreground font-medium border-b border-border/20 w-8">
                          #
                        </th>
                      )}
                      {previewColumns.map((col) => (
                        <th
                          key={col}
                          className="px-2 py-1 text-left text-muted-foreground font-medium border-b border-border/20 truncate max-w-[120px]">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, i) => (
                      <tr
                        key={i}
                        className={cn(
                          "transition-colors",
                          section.striped && i % 2 === 1 && "bg-muted/15",
                        )}>
                        {section.showRowNumbers && (
                          <td className="px-2 py-1 text-muted-foreground/50 border-b border-border/10">
                            {i + 1}
                          </td>
                        )}
                        {row.map((cell, j) => (
                          <td
                            key={j}
                            className="px-2 py-1 border-b border-border/10 truncate max-w-[120px]">
                            {formatCell(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {(section.sqlBinding.lastResult?.rowCount ?? 0) > 5 && (
                <div className="text-[10px] text-muted-foreground/40 text-center">
                  Exibindo 5 de {section.sqlBinding.lastResult?.rowCount}{" "}
                  registros
                </div>
              )}
            </div>
          ) : (
            /* Empty State — No data bound */
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground/40 gap-2 select-none">
              <Table className="w-10 h-10 opacity-30" />
              <span className="text-xs">Nenhuma fonte de dados vinculada</span>
              <Button
                variant="outline"
                size="sm"
                className="text-xs mt-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenModal();
                }}>
                <Database className="w-3.5 h-3.5 mr-1.5" />
                Vincular SQL
              </Button>
            </div>
          )}
        </div>

        {/* Settings Panel (visible when selected) */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-200",
            isSelected ? "max-h-40 opacity-100" : "max-h-0 opacity-0",
          )}>
          <div className="px-6 py-3 border-t border-border/20 bg-muted/20 flex items-center gap-6 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenModal();
              }}>
              <Edit className="w-3 h-3 mr-1.5" />
              {hasData ? "Editar SQL" : "Vincular SQL"}
            </Button>

            <div className="flex items-center gap-2">
              <Switch
                id={`rownums-${section.id}`}
                checked={section.showRowNumbers}
                onCheckedChange={handleToggleRowNumbers}
              />
              <Label
                htmlFor={`rownums-${section.id}`}
                className="text-xs text-muted-foreground cursor-pointer">
                Nº Linha
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id={`striped-${section.id}`}
                checked={section.striped}
                onCheckedChange={handleToggleStriped}
              />
              <Label
                htmlFor={`striped-${section.id}`}
                className="text-xs text-muted-foreground cursor-pointer">
                Listrada
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">
                Max linhas:
              </Label>
              <Input
                type="number"
                value={section.maxRows ?? ""}
                onChange={handleMaxRowsChange}
                className="w-16 h-7 text-xs"
                min={1}
                placeholder="∞"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>

        {/* SQL Editor Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-6 gap-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Fonte de Dados — Tabela
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleExecute}
                  disabled={isExecuting}>
                  <Play className="w-4 h-4 mr-2 fill-current" />
                  Executar
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSaveAndClose}
                  disabled={!localResult}>
                  Salvar e Fechar
                </Button>
              </div>
            </div>

            <div className="flex-1 min-h-0 border rounded-md overflow-hidden bg-muted/50 flex flex-col">
              <div className="flex-1 relative">
                <SqlEditor
                  value={localQuery}
                  onChange={setLocalQuery}
                  height="100%"
                />
              </div>
              {/* Result Preview Panel */}
              {localResult && (
                <div className="h-48 border-t border-border bg-background p-2 overflow-auto">
                  <div className="text-xs text-muted-foreground mb-2 flex justify-between">
                    <span>Resultados: {localResult.rowCount} registros</span>
                    <span>{localResult.duration}ms</span>
                  </div>
                  <table className="w-full text-xs text-left">
                    <thead className="text-muted-foreground font-medium">
                      <tr>
                        {localResult.columns.map((c) => (
                          <th
                            key={c}
                            className="p-1 border-b border-border font-normal">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {localResult.rows.map((row, i) => (
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
  },
);

export default SectionTable;
