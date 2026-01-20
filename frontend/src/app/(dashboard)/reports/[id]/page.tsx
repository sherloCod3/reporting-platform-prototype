'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { ReportEditor } from '@/components/reports/report-editor';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditReportPage() {
    const params = useParams();
    const id = params.id as string;

    const { data: report, isLoading, isError } = useQuery({
        queryKey: ['report', id],
        queryFn: async () => {
            const response = await api.get(`/definitions/${id}`);
            return response.data;
        },
    });

    if (isLoading) {
        return <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full" />
        </div>;
    }

    if (isError) {
        return <div>Erro ao carregar relatório.</div>;
    }

    return <ReportEditor initialData={report} />;
}
