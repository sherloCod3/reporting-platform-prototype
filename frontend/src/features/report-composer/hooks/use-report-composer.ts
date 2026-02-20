import { useReducer, useCallback, useMemo } from 'react';
import type {
    ComposerState,
    ComposerAction,
    ReportSection,
    SectionType,
    PageConfig,
    HeaderSection,
    TextSection,
    TableSection,
    PageBreakSection
} from '@/features/report-composer/types/composer.types';
import { DEFAULT_PAGE_CONFIG } from '@/features/report-composer/types/composer.types';

// Gerador de UUID (evita dependência externa)

function generateId(): string {
    return crypto.randomUUID();
}

// Fábrica de Seções

function createSection(type: SectionType, order: number): ReportSection {
    const base = {
        id: generateId(),
        order
    };

    switch (type) {
        case 'header': {
            const section: HeaderSection = {
                ...base,
                type: 'header',
                label: 'Cabeçalho',
                title: 'Título do Relatório',
                subtitle: '',
                showLogo: true,
                showDate: true
            };
            return section;
        }

        case 'text': {
            const section: TextSection = {
                ...base,
                type: 'text',
                label: 'Bloco de Texto',
                content: '',
                fontSize: 14,
                bold: false,
                italic: false,
                alignment: 'left'
            };
            return section;
        }

        case 'table': {
            const section: TableSection = {
                ...base,
                type: 'table',
                label: 'Tabela de Dados',
                sqlBinding: { query: '' },
                visibleColumns: [],
                showRowNumbers: false,
                striped: true,
                maxRows: 50
            };
            return section;
        }

        case 'page-break': {
            const section: PageBreakSection = {
                ...base,
                type: 'page-break',
                label: 'Quebra de Página'
            };
            return section;
        }
    }
}

// Reducer

function reindex(sections: ReportSection[]): ReportSection[] {
    return sections.map((s, i) => ({ ...s, order: i }));
}

function composerReducer(
    state: ComposerState,
    action: ComposerAction
): ComposerState {
    switch (action.type) {
        case 'ADD_SECTION': {
            const updated = reindex([ ...state.sections, action.payload ]);
            return {
                ...state,
                sections: updated,
                selectedSectionId: action.payload.id,
                history: [ ...state.history.slice(0, state.historyIndex + 1), updated ],
                historyIndex: state.historyIndex + 1
            };
        }

        case 'UPDATE_SECTION': {
            const updated = state.sections.map(s =>
                s.id === action.id ? ({ ...s, ...action.changes } as ReportSection) : s
            );
            return { ...state, sections: updated };
        }

        case 'REMOVE_SECTION': {
            const updated = reindex(state.sections.filter(s => s.id !== action.id));
            const nextSelected =
                state.selectedSectionId === action.id ? null : state.selectedSectionId;
            return {
                ...state,
                sections: updated,
                selectedSectionId: nextSelected,
                history: [ ...state.history.slice(0, state.historyIndex + 1), updated ],
                historyIndex: state.historyIndex + 1
            };
        }

        case 'REORDER_SECTION': {
            const idx = state.sections.findIndex(s => s.id === action.id);
            const targetIdx = action.direction === 'up' ? idx - 1 : idx + 1;

            // Verificação de limites - não mover alem das bordas
            if (targetIdx < 0 || targetIdx >= state.sections.length) {
                return state;
            }

            const copy = [ ...state.sections ];
            const [ moved ] = copy.splice(idx, 1);
            copy.splice(targetIdx, 0, moved);
            const updated = reindex(copy);

            return {
                ...state,
                sections: updated,
                history: [ ...state.history.slice(0, state.historyIndex + 1), updated ],
                historyIndex: state.historyIndex + 1
            };
        }

        case 'SELECT_SECTION': {
            return { ...state, selectedSectionId: action.id };
        }

        case 'UPDATE_PAGE_CONFIG': {
            return {
                ...state,
                pageConfig: { ...state.pageConfig, ...action.changes }
            };
        }

        case 'SET_VIEW_MODE': {
            return { ...state, viewMode: action.mode };
        }

        case 'COMMIT_HISTORY': {
            return {
                ...state,
                history: [
                    ...state.history.slice(0, state.historyIndex + 1),
                    state.sections
                ],
                historyIndex: state.historyIndex + 1
            };
        }

        case 'UNDO': {
            if (state.historyIndex <= 0) return state;
            return {
                ...state,
                sections: state.history[ state.historyIndex - 1 ],
                historyIndex: state.historyIndex - 1
            };
        }

        case 'REDO': {
            if (state.historyIndex >= state.history.length - 1) return state;
            return {
                ...state,
                sections: state.history[ state.historyIndex + 1 ],
                historyIndex: state.historyIndex + 1
            };
        }

        default:
            return state;
    }
}

// Hook

export interface UseReportComposerReturn {
    state: ComposerState;
    dispatch: React.Dispatch<ComposerAction>;
    addSection: (type: SectionType) => void;
    removeSection: (id: string) => void;
    moveSection: (id: string, direction: 'up' | 'down') => void;
    updateSection: (id: string, changes: Partial<ReportSection>) => void;
    selectedSection: ReportSection | undefined;
    togglePreview: () => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

export function useReportComposer(
    initialPageConfig?: Partial<PageConfig>
): UseReportComposerReturn {
    const [ state, dispatch ] = useReducer(composerReducer, {
        sections: [],
        pageConfig: { ...DEFAULT_PAGE_CONFIG, ...initialPageConfig },
        selectedSectionId: null,
        history: [ [] ],
        historyIndex: 0,
        viewMode: 'edit'
    });

    const addSection = useCallback(
        (type: SectionType): void => {
            const section = createSection(type, state.sections.length);
            dispatch({ type: 'ADD_SECTION', payload: section });
        },
        [ state.sections.length ]
    );

    const removeSection = useCallback((id: string): void => {
        dispatch({ type: 'REMOVE_SECTION', id });
    }, []);

    const moveSection = useCallback(
        (id: string, direction: 'up' | 'down'): void => {
            dispatch({ type: 'REORDER_SECTION', id, direction });
        },
        []
    );

    const updateSection = useCallback(
        (id: string, changes: Partial<ReportSection>): void => {
            dispatch({ type: 'UPDATE_SECTION', id, changes });
        },
        []
    );

    const togglePreview = useCallback((): void => {
        const next = state.viewMode === 'edit' ? 'preview' : 'edit';
        dispatch({ type: 'SET_VIEW_MODE', mode: next });
    }, [ state.viewMode ]);

    const undo = useCallback((): void => {
        dispatch({ type: 'UNDO' });
    }, []);

    const redo = useCallback((): void => {
        dispatch({ type: 'REDO' });
    }, []);

    const selectedSection = useMemo(
        () => state.sections.find(s => s.id === state.selectedSectionId),
        [ state.sections, state.selectedSectionId ]
    );

    const canUndo = state.historyIndex > 0;
    const canRedo = state.historyIndex < state.history.length - 1;

    return {
        state,
        dispatch,
        addSection,
        removeSection,
        moveSection,
        updateSection,
        selectedSection,
        togglePreview,
        undo,
        redo,
        canUndo,
        canRedo
    };
}
