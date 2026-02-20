export { ReportComposer } from './components/report-composer';

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
  ComposerAction
} from './types/composer.types';

export { DEFAULT_PAGE_CONFIG } from './types/composer.types';

export { useReportComposer } from './hooks/use-report-composer';
export type { UseReportComposerReturn } from './hooks/use-report-composer';
