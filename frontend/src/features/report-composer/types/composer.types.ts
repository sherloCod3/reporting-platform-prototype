/**
 * Type definitions for the section-based Report Composer.
 *
 * The composer uses a vertical-stack model (like Bold Reports):
 * sections are rendered top-to-bottom inside an A4 paper container.
 * This is intentionally separate from the free-form canvas model
 * used by the existing ReportEditor (Component with x/y positioning).
 */

import type { SqlResult } from "@/components/reports/types";

// ---------------------------------------------------------------------------
// Page Configuration
// ---------------------------------------------------------------------------

/** A4 portrait page dimensions at 96 DPI with configurable margins */
export interface PageConfig {
    /** Page width in CSS pixels (default: 794 — A4 at 96 DPI) */
    width: number;
    /** Page height in CSS pixels (default: 1123 — A4 at 96 DPI) */
    height: number;
    /** Top margin in CSS pixels */
    marginTop: number;
    /** Bottom margin in CSS pixels */
    marginBottom: number;
    /** Left margin in CSS pixels */
    marginLeft: number;
    /** Right margin in CSS pixels */
    marginRight: number;
}

/** Sensible defaults matching the existing canvas dimensions */
export const DEFAULT_PAGE_CONFIG: Readonly<PageConfig> = {
    width: 794,
    height: 1123,
    marginTop: 48,
    marginBottom: 48,
    marginLeft: 48,
    marginRight: 48,
};

// ---------------------------------------------------------------------------
// Section Types (Discriminated Union)
// ---------------------------------------------------------------------------

/** All possible section type discriminants */
export type SectionType = "header" | "text" | "table" | "page-break";

/** Common fields shared by all sections */
interface SectionBase {
    /** Unique identifier (UUID v4) */
    id: string;
    /** Discriminant for the section union */
    type: SectionType;
    /** Vertical ordering index within the report */
    order: number;
    /** User-friendly label displayed in the section panel */
    label: string;
}

/** Report header — title, subtitle, optional logo and date indicators */
export interface HeaderSection extends SectionBase {
    type: "header";
    /** Main report title */
    title: string;
    /** Subtitle or description line */
    subtitle: string;
    /** Whether to display a logo placeholder */
    showLogo: boolean;
    /** Whether to show the generation date */
    showDate: boolean;
}

/** Free-text block — supports alignment and basic formatting */
export interface TextSection extends SectionBase {
    type: "text";
    /** Text content, may contain {{column_name}} injection tokens */
    content: string;
    /** Font size in pixels */
    fontSize: number;
    /** Whether text is bold */
    bold: boolean;
    /** Whether text is italic */
    italic: boolean;
    /** Horizontal text alignment */
    alignment: "left" | "center" | "right";
    /** Optional SQL data binding for token injection */
    sqlBinding?: SqlBinding;
}

/** Data table section — bound to a SQL query */
export interface TableSection extends SectionBase {
    type: "table";
    /** SQL data binding (required for table sections) */
    sqlBinding: SqlBinding;
    /** Subset of columns to render (empty = all columns) */
    visibleColumns: string[];
    /** Whether to display row numbers */
    showRowNumbers: boolean;
    /** Whether to apply alternating row stripes */
    striped: boolean;
    /** Maximum rows shown in the preview (undefined = all) */
    maxRows?: number;
}

/** Visual page separator — forces a page break in PDF output */
export interface PageBreakSection extends SectionBase {
    type: "page-break";
}

/** Union type encompassing all section variants */
export type ReportSection =
    | HeaderSection
    | TextSection
    | TableSection
    | PageBreakSection;

// ---------------------------------------------------------------------------
// SQL Binding
// ---------------------------------------------------------------------------

/** Links a section to a SQL query and its cached result */
export interface SqlBinding {
    /** Optional reference identifier for saved queries */
    queryId?: string;
    /** Raw SQL query string */
    query: string;
    /** Cached result from the last execution (reuses existing SqlResult) */
    lastResult?: SqlResult;
}

// ---------------------------------------------------------------------------
// Report Definition (Composer Output)
// ---------------------------------------------------------------------------

/** Complete report definition produced by the composer */
export interface ReportDefinition {
    /** Persisted report identifier (undefined for new reports) */
    id?: string;
    /** Report display name */
    name: string;
    /** Report description */
    description: string;
    /** Page layout configuration */
    pageConfig: PageConfig;
    /** Ordered list of report sections */
    sections: ReportSection[];
    /** ISO 8601 creation timestamp */
    createdAt?: string;
    /** ISO 8601 last-updated timestamp */
    updatedAt?: string;
}

// ---------------------------------------------------------------------------
// Composer State & Actions (Reducer)
// ---------------------------------------------------------------------------

/** Internal state managed by the useReportComposer reducer */
export interface ComposerState {
    /** Current report definition being composed */
    sections: ReportSection[];
    /** Page configuration */
    pageConfig: PageConfig;
    /** Currently selected section ID (null = none) */
    selectedSectionId: string | null;
    /** History stack for undo/redo */
    history: ReportSection[][];
    /** Current position in the history stack */
    historyIndex: number;
    /** Active view mode — edit or preview */
    viewMode: "edit" | "preview";
}

/** All actions supported by the composer reducer */
export type ComposerAction =
    | { type: "ADD_SECTION"; payload: ReportSection }
    | { type: "UPDATE_SECTION"; id: string; changes: Partial<ReportSection> }
    | { type: "REMOVE_SECTION"; id: string }
    | { type: "REORDER_SECTION"; id: string; direction: "up" | "down" }
    | { type: "SELECT_SECTION"; id: string | null }
    | { type: "UPDATE_PAGE_CONFIG"; changes: Partial<PageConfig> }
    | { type: "SET_VIEW_MODE"; mode: "edit" | "preview" }
    | { type: "COMMIT_HISTORY" }
    | { type: "UNDO" }
    | { type: "REDO" };
