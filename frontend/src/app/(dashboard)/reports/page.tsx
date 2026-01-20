'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, FileText, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Report {
    id: number;
    name: string;
    description: string;
    created_at: string;
}

export default function ReportsPage() {
    // Ensuring response data is treated as an array
    const { data: reports, isLoading, isError } = useQuery({
        queryKey: ['reports'],
        queryFn: async () => {
            const response = await api.get<Report[]>('/definitions');
            return response.data;
        },
    });

    if (isLoading) {
        return <ReportsLoading />;
    }

    if (isError) {
        return <div className="p-8 text-center text-red-500">Erro ao carregar relatórios.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Meus Relatórios</h1>
                    <p className="text-gray-500">Gerencie todos os seus relatórios e dashboards.</p>
                </div>
                <Link href="/reports/create">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        Criar Relatório
                    </Button>
                </Link>
            </div>

            {reports && reports.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-gray-50">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                        <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Nenhum relatório encontrado</h3>
                    <p className="text-gray-500 mt-1 mb-4 text-center max-w-sm">
                        Você ainda não criou nenhum relatório. Comece criando um novo agora mesmo.
                    </p>
                    <Link href="/reports/create">
                        <Button variant="outline">Criar meu primeiro relatório</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {reports?.map((report) => (
                        <ReportCard key={report.id} report={report} />
                    ))}
                </div>
            )}
        </div>
    );
}

function ReportCard({ report }: { report: Report }) {
    return (
        <Card className="group hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-base font-semibold group-hover:text-blue-600 transition-colors">
                        <Link href={`/reports/${report.id}`} className="hover:underline">
                            {report.name}
                        </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-2 min-h-10">
                        {report.description || 'Sem descrição'}
                    </CardDescription>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                            <Link href={`/reports/${report.id}/run`} className="w-full">Executar</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Link href={`/reports/${report.id}`} className="w-full">Editar</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 focus:text-red-600">Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent>
                <div className="flex items-center text-sm text-gray-500 mt-2">
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(new Date(report.created_at), "d 'de' MMMM, yyyy", { locale: ptBR })}
                </div>
            </CardContent>
        </Card>
    );
}

function ReportsLoading() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-40 w-full" />
                ))}
            </div>
        </div>
    );
}
