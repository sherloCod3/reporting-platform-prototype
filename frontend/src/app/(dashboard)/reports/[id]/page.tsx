'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { reportApi } from '@/features/reports/api/reportApi';
import { ReportEditor } from '@/components/reports/report-editor';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditReportPage() {
  const params = useParams();
  const id = params.id as string;
  const reportId = parseInt(id, 10);

  const {
    data: report,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['report', reportId],
    queryFn: () => reportApi.getById(reportId)
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError) {
    return <div>Erro ao carregar relatório.</div>;
  }

  return (
    <ReportEditor
      key={reportId}
      initialData={{
        title: report?.title,
        description: report?.description,
        components: report?.components
      }}
    />
  );
}
