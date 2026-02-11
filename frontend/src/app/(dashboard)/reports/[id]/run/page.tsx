'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { ResultsTable } from '@/components/reports/results-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RunReportPage() {
    const params = useParams();
    const id = params.id as string;

    // 1. Fetch Report Definition
    const { data: report, isLoading: isLoadingReport } = useQuery({
        queryKey: ['report', id],
        queryFn: async () => {
            const response = await api.get(`/definitions/${id}`);
            return response.data;
        },
    });

    // 2. Execute Query Mutation
    const executionMutation = useMutation({
        mutationFn: async (sql: string) => {
            const response = await api.post('/reports/execute', { query: sql });
            return response.data; // Array of results
        },
        onError: (error: unknown) => {
            const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erro na execução do relatório';
            toast.error(errorMessage);
        },
    });

    const handleRun = () => {
        if (report?.sql_query) {
            executionMutation.mutate(report.sql_query);
        }
    };

    if (isLoadingReport) {
        return <ReportRunnerSkeleton />;
    }

    if (!report) {
        return <div>Relatório não encontrado.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{report.name}</h1>
                    <p className="text-gray-500">{report.description}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" disabled={!executionMutation.data}>
                        <Download className="mr-2 h-4 w-4" />
                        Exportar PDF
                    </Button>
                    <Button onClick={handleRun} disabled={executionMutation.isPending}>
                        {executionMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Play className="mr-2 h-4 w-4" />
                        )}
                        Executar Relatório
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Resultados</CardTitle>
                </CardHeader>
                <CardContent>
                    {executionMutation.isPending ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : executionMutation.isError ? (
                        <div className="text-center text-red-500 p-8">
                            Ocorreu um erro ao executar a consulta.
                        </div>
                    ) : executionMutation.data ? (
                        <ResultsTable data={executionMutation.data} />
                    ) : (
                        <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-border">
                            Clique em &quot;Executar Relatório&quot; para ver os dados.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function ReportRunnerSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="h-[400px] w-full" />
        </div>
    );
}
