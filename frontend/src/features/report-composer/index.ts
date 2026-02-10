/**
 * Public API for the report-composer feature.
 *
 * Barrel file exporting the feature entry component and core types.
 * Consumers should import from this file, not from internal paths.
 */

// Feature entry component
export { ReportComposer } from "./components/report-composer";

// Core types
export type {
    PageConfig,
    SectionType,
    HeaderSection,
    TextSection,
    TableSection,
    PageBreakSection,
    ReportSection,
    SqlBinding,
    ReportDefinition,
    ComposerState,
    ComposerAction,
} from "./types/composer.types";

// Constants
export { DEFAULT_PAGE_CONFIG } from "./types/composer.types";

// Hook
export { useReportComposer } from "./hooks/use-report-composer";
export type { UseReportComposerReturn } from "./hooks/use-report-composer";
