'use client';

import { ReportEditor } from '@/components/reports/report-editor';
import { reportApi } from '@/features/reports/api/reportApi';
import {
  useMutation,
  useSuspenseQuery,
  useQueryClient
} from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { ReportData } from '@/components/reports/types';

function EditReportContent() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const reportId = parseInt(id, 10);

  const { data: report } = useSuspenseQuery({
    queryKey: ['report', reportId],
    queryFn: () => reportApi.getById(reportId)
  });

  const updateReportMutation = useMutation({
    mutationFn: (data: Partial<Omit<ReportData, 'id'>>) =>
      reportApi.update(reportId, data),
    onSuccess: () => {
      toast.success('Report saved successfully');
      queryClient.invalidateQueries({ queryKey: ['report', reportId] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: error => {
      toast.error('Failed to save report');
      console.error(error);
    }
  });

  const handleSave = (data: Omit<ReportData, 'id'>) => {
    updateReportMutation.mutate(data);
  };

  return (
    <ReportEditor
      key={reportId}
      initialData={{
        title: report.title,
        description: report.description,
        components: report.components
      }}
      onSave={handleSave}
    />
  );
}

export default function EditReportPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <Edit2ReportContentWrapper />
    </Suspense>
  );
}

function Edit2ReportContentWrapper() {
  return <EditReportContent />;
}
