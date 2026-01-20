'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
    Type, Table, BarChart, Image as ImageIcon, 
    Undo, Redo, Trash2 
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface SqlResult {
    columns: string[];
    rows: (string | number | boolean | null)[][];
    rowCount: number;
    duration: string;
}

interface Component {
    id: number;
    type: 'text' | 'table' | 'chart' | 'image';
    x: number;
    y: number;
    width: number;
    height: number;
    content?: string;
    sqlQuery?: string;
    sqlResult?: SqlResult;
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
    // Canvas State
    const [components, setComponents] = useState<Component[]>(initialData?.components || []);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [nextId, setNextId] = useState(1);
    const gridSize = 20;
    
    // Dragging State
    const [draggingId, setDraggingId] = useState<number | null>(null);
    const dragOffset = useRef({ x: 0, y: 0 });
    
    // SQL Modal State
    const [sqlModalOpen, setSqlModalOpen] = useState(false);
    const [editingComponentId, setEditingComponentId] = useState<number | null>(null);
    const [sqlQuery, setSqlQuery] = useState('');
    const [sqlResult, setSqlResult] = useState<SqlResult | null>(null);
    const [sqlExecuting, setSqlExecuting] = useState(false);

    // Mock History
    const [history, setHistory] = useState<Component[][]>([]); 
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Refs for event handlers
    const componentsRef = useRef(components);
    useEffect(() => { componentsRef.current = components; }, [components]);

    const commitHistory = useCallback((newState: Component[]) => {
        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1);
            newHistory.push(JSON.parse(JSON.stringify(newState)));
            return newHistory;
        });
        setHistoryIndex(prev => prev + 1);
    }, [historyIndex]);

    const undo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(prev => prev - 1);
            setComponents(JSON.parse(JSON.stringify(history[historyIndex - 1])));
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(prev => prev + 1);
            setComponents(JSON.parse(JSON.stringify(history[historyIndex + 1])));
        }
    };

    const snapToGrid = (value: number) => {
        return Math.round(value / gridSize) * gridSize;
    };

    const addComponent = (type: Component['type']) => {
        const sizes = { text: { w:300, h:60 }, table: { w:500, h:200 }, chart: { w:400, h:300 }, image: { w:300, h:200 } };
        const size = sizes[type];
        
        const newComp: Component = {
            id: nextId,
            type,
            x: snapToGrid(50),
            y: snapToGrid(50 + (components.length * 50)),
            width: size.w,
            height: size.h,
            content: type === 'text' ? 'Novo Texto' : '',
            sqlQuery: type === 'table' ? 'SELECT * FROM users LIMIT 5' : undefined
        };
        
        const newComponents = [...components, newComp];
        setComponents(newComponents);
        setNextId(nextId + 1);
        commitHistory(newComponents);
    };

    // Drag Logic
    const startDrag = (e: React.MouseEvent, id: number) => {
        e.stopPropagation(); 
        setDraggingId(id);
        setSelectedId(id);
        const comp = components.find(c => c.id === id);
        if (comp) {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            dragOffset.current = { 
                x: e.clientX - rect.left, 
                y: e.clientY - rect.top 
            };
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (draggingId !== null) {
                const canvasRect = document.getElementById('canvas-area')?.getBoundingClientRect();
                if (!canvasRect) return;

                const rawX = e.clientX - canvasRect.left - dragOffset.current.x;
                const rawY = e.clientY - canvasRect.top - dragOffset.current.y;

                const snappedX = Math.round(Math.max(0, rawX) / 20) * 20; 
                const snappedY = Math.round(Math.max(0, rawY) / 20) * 20;

                setComponents(prev => prev.map(c => 
                    c.id === draggingId ? { ...c, x: snappedX, y: snappedY } : c
                ));
            }
        };

        const handleMouseUp = () => {
            if (draggingId !== null) {
                setDraggingId(null);
                // Commit using the ref to avoid stale closure state
                commitHistory(componentsRef.current);
            }
        };

        if (draggingId !== null) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggingId, commitHistory]); 

    const openSqlEditor = (id: number) => {
        const comp = components.find(c => c.id === id);
        if (comp) {
            setEditingComponentId(id);
            setSqlQuery(comp.sqlQuery || '');
            setSqlResult(comp.sqlResult || null);
            setSqlModalOpen(true);
        }
    };

    const executeSql = async () => {
        setSqlExecuting(true);
        setTimeout(() => {
            setSqlResult({
                columns: ['id', 'name', 'role'],
                rows: [[1, 'Admin', 'superuser'], [2, 'User', 'editor']],
                rowCount: 2,
                duration: '12ms'
            });
            setSqlExecuting(false);
        }, 800);
    };

    const applySql = () => {
        if (editingComponentId !== null) {
            const updated = components.map(c => c.id === editingComponentId ? { ...c, sqlQuery, sqlResult: sqlResult || undefined } : c);
            setComponents(updated);
            commitHistory(updated);
            setSqlModalOpen(false);
        }
    };

    const deleteComponent = (id: number) => {
        const updated = components.filter(c => c.id !== id);
        setComponents(updated);
        commitHistory(updated);
    };

    return (
        <div className="flex h-[800px] w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden relative">
            
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 h-14 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 z-20">
                <div className="flex items-center gap-2">
                     <span className="font-bold text-slate-700 dark:text-white">Editor Visual</span>
                     <div className="h-4 w-px bg-slate-300 mx-2"/>
                     <Button variant="ghost" size="icon" onClick={undo} disabled={historyIndex <= 0} title="Undo">
                        <Undo className="w-4 h-4"/>
                     </Button>
                     <Button variant="ghost" size="icon" onClick={redo} disabled={historyIndex >= history.length - 1} title="Redo">
                        <Redo className="w-4 h-4"/>
                     </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="text-xs">Preview</Button>
                    <Button className="gradient-bg text-white border-0 text-xs" onClick={() => onSave?.(components)}>Salvar Relatório</Button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-900 pt-16 p-8 relative" onClick={() => setSelectedId(null)}>
                <div 
                    id="canvas-area"
                    className="bg-white dark:bg-slate-800 shadow-xl w-[794px] h-[1123px] mx-auto relative canvas-grid ui-motion"
                    onClick={(e) => e.stopPropagation()} 
                >
                    {components.map(comp => (
                        <div 
                            key={comp.id}
                            className={cn(
                                "absolute border cursor-move group",
                                selectedId === comp.id ? "border-indigo-500 ring-1 ring-indigo-500 z-10" : "border-slate-300 dark:border-slate-600 border-dashed"
                            )}
                            style={{ left: comp.x, top: comp.y, width: comp.width, height: comp.height }}
                            onMouseDown={(e) => startDrag(e, comp.id)}
                            onClick={(e) => { e.stopPropagation(); setSelectedId(comp.id); }}
                        >
                            {selectedId === comp.id && (
                                <div className="absolute -top-8 right-0 flex gap-1 bg-indigo-500 rounded p-1 shadow-lg text-white">
                                    {comp.type === 'table' && (
                                        <button onClick={(e) => { e.stopPropagation(); openSqlEditor(comp.id); }} className="px-2 py-0.5 hover:bg-indigo-600 rounded text-xs flex items-center gap-1">
                                            <Table className="w-3 h-3"/> SQL
                                        </button>
                                    )}
                                    <button onClick={(e) => { e.stopPropagation(); deleteComponent(comp.id); }} className="px-2 py-0.5 hover:bg-red-500 rounded text-xs">
                                        <Trash2 className="w-3 h-3"/>
                                    </button>
                                </div>
                            )}

                            <div className="w-full h-full overflow-hidden p-2 pointer-events-none">
                                {comp.type === 'text' && <div className="text-lg font-medium">{comp.content}</div>}
                                {comp.type === 'image' && <div className="flex items-center justify-center h-full bg-slate-50 dark:bg-slate-700/50 text-4xl">🖼️</div>}
                                {comp.type === 'chart' && <div className="flex items-center justify-center h-full bg-indigo-50 text-indigo-400"><BarChart className="w-16 h-16"/></div>}
                                {comp.type === 'table' && (
                                    <div className="text-xs w-full h-full overflow-hidden">
                                        {comp.sqlResult ? (
                                            <div className="space-y-1">
                                                <div className="font-semibold text-slate-500">Resultados ({comp.sqlResult.rowCount})</div>
                                                <div className="grid grid-cols-2 gap-1 opacity-60">
                                                    {comp.sqlResult.rows.map((r, i) => (
                                                        <div key={i} className="bg-slate-100 p-1 truncate">{r[1]}</div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-slate-400">Sem dados SQL</div>
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
                <Button variant="ghost" size="icon" onClick={() => addComponent('text')} title="Texto"><Type className="w-5 h-5"/></Button>
                <Button variant="ghost" size="icon" onClick={() => addComponent('table')} title="Tabela"><Table className="w-5 h-5"/></Button>
                <Button variant="ghost" size="icon" onClick={() => addComponent('chart')} title="Gráfico"><BarChart className="w-5 h-5"/></Button>
                <Button variant="ghost" size="icon" onClick={() => addComponent('image')} title="Imagem"><ImageIcon className="w-5 h-5"/></Button>
            </div>

            {/* SQL Editor Modal */}
            <Dialog open={sqlModalOpen} onOpenChange={setSqlModalOpen}>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center gradient-bg text-white">
                        <DialogTitle className="flex items-center gap-2"><Table className="w-5 h-5"/> Editor SQL</DialogTitle>
                    </div>
                    <div className="flex-1 flex">
                        <div className="flex-1 flex flex-col border-r p-4 bg-slate-50 dark:bg-slate-900">
                            <h3 className="text-sm font-semibold mb-2">Query</h3>
                            <textarea 
                                className="flex-1 bg-slate-100 dark:bg-slate-800 p-4 border rounded-md font-mono text-sm resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={sqlQuery}
                                onChange={e => setSqlQuery(e.target.value)}
                                placeholder="SELECT * FROM table..."
                            />
                            <Button className="mt-4 gradient-bg border-0" onClick={executeSql} disabled={sqlExecuting}>
                                {sqlExecuting ? 'Executando...' : 'Executar Query'}
                            </Button>
                        </div>
                        <div className="flex-1 flex flex-col p-4 bg-white dark:bg-slate-800">
                            <h3 className="text-sm font-semibold mb-2">Resultados</h3>
                            {sqlResult ? (
                                <div className="border rounded-md overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-100">
                                            <tr>
                                                {sqlResult.columns.map((c:string) => <th key={c} className="p-2 text-left">{c}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sqlResult.rows.map((row, i) => (
                                                <tr key={i} className="border-t">
                                                    {row.map((cell, j) => <td key={j} className="p-2">{cell as React.ReactNode}</td>)}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-slate-400 border border-dashed rounded-md">
                                    Nenhum resultado
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="p-4 border-t bg-slate-50 flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setSqlModalOpen(false)}>Cancelar</Button>
                        <Button onClick={applySql} disabled={!sqlResult} className="gradient-bg border-0">Aplicar</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
