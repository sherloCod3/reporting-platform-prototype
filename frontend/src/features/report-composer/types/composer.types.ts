import type { SqlResult } from '@/components/reports/types';

// Configuração da página

export interface PageConfig {
  width: number;

  height: number;

  marginTop: number;

  marginBottom: number;

  marginLeft: number;

  marginRight: number;
}

export const DEFAULT_PAGE_CONFIG: Readonly<PageConfig> = {
  width: 794,
  height: 1123,
  marginTop: 48,
  marginBottom: 48,
  marginLeft: 48,
  marginRight: 48
};

// Tipos de seção (União discriminada)

export type SectionType = 'header' | 'text' | 'table' | 'page-break';

interface SectionBase {
  id: string;

  type: SectionType;

  order: number;

  label: string;
}

export interface HeaderSection extends SectionBase {
  type: 'header';

  title: string;

  subtitle: string;

  showLogo: boolean;

  showDate: boolean;
}

export interface TextSection extends SectionBase {
  type: 'text';

  content: string;

  fontSize: number;

  bold: boolean;

  italic: boolean;

  alignment: 'left' | 'center' | 'right';

  sqlBinding?: SqlBinding;
}

export interface TableSection extends SectionBase {
  type: 'table';

  sqlBinding: SqlBinding;

  visibleColumns: string[];

  showRowNumbers: boolean;

  striped: boolean;

  maxRows?: number;
}

export interface PageBreakSection extends SectionBase {
  type: 'page-break';
}

export type ReportSection =
  | HeaderSection
  | TextSection
  | TableSection
  | PageBreakSection;

// Vinculação SQL

export interface SqlBinding {
  queryId?: string;

  query: string;

  lastResult?: SqlResult;
}

// Definição do relatório (Saída do Composer)

export interface ReportDefinition {
  id?: string;

  name: string;

  description: string;

  pageConfig: PageConfig;

  sections: ReportSection[];

  createdAt?: string;

  updatedAt?: string;
}

// Estado e ações do Composer (Reducer)

export interface ComposerState {
  sections: ReportSection[];

  pageConfig: PageConfig;

  selectedSectionId: string | null;

  history: ReportSection[][];

  historyIndex: number;

  viewMode: 'edit' | 'preview';
}

export type ComposerAction =
  | { type: 'ADD_SECTION'; payload: ReportSection }
  | { type: 'UPDATE_SECTION'; id: string; changes: Partial<ReportSection> }
  | { type: 'REMOVE_SECTION'; id: string }
  | { type: 'REORDER_SECTION'; id: string; direction: 'up' | 'down' }
  | { type: 'SELECT_SECTION'; id: string | null }
  | { type: 'UPDATE_PAGE_CONFIG'; changes: Partial<PageConfig> }
  | { type: 'SET_VIEW_MODE'; mode: 'edit' | 'preview' }
  | { type: 'COMMIT_HISTORY' }
  | { type: 'UNDO' }
  | { type: 'REDO' };
