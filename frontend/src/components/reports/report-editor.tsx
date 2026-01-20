'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ReportEditorProps {
    report?: any;
    onSave?: (data: any) => void;
}

export function ReportEditor({ report, onSave }: ReportEditorProps) {
    const [name, setName] = useState(report?.name || '');
    const [description, setDescription] = useState(report?.description || '');
    const [sqlQuery, setSqlQuery] = useState(report?.sql_query || '');

    const handleSave = () => {
        onSave?.({ name, description, sql_query: sqlQuery });
    };

    return (
        <div className="space-y-4">
            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="name">Nome do Relatório</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="sql">SQL Query</Label>
                    <Textarea 
                        id="sql" 
                        value={sqlQuery} 
                        onChange={(e) => setSqlQuery(e.target.value)} 
                        className="font-mono h-[200px]"
                    />
                </div>
            </div>
            <div className="flex justify-end">
                <Button onClick={handleSave}>Salvar</Button>
            </div>
        </div>
    );
}
