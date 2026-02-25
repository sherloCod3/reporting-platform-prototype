import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { ResultsTable } from '@/components/reports/results-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, Download, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RunReportPage() {
  const params = useParams();
  const id = params.id as string;
  const [pdfJobId, setPdfJobId] = useState<string | null>(null);
  const [isPollingPdf, setIsPollingPdf] = useState(false);

  const pageSize = 500; // default for now

  // 1. Fetch Report Definition
  const { data: report, isLoading: isLoadingReport } = useQuery({
    queryKey: ['report', id],
    queryFn: async () => {
      const response = await api.get(`/definitions/${id}`);
      return response.data;
    }
  });

  // 2. Execute Query Mutation
  const executionMutation = useMutation({
    mutationFn: async ({ sql, page }: { sql: string; page: number }) => {
      const response = await api.post('/reports/execute', {
        query: sql,
        page,
        pageSize
      });
      return response.data; // Includes .data.rows, .data.page, .data.totalRows, etc.
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Erro na execução do relatório';
      toast.error(errorMessage);
    }
  });

  // 3. Export PDF Queue Initialization
  const exportPdfMutation = useMutation({
    mutationFn: async () => {
      // Send a basic HTML stub representing the data table for now
      // In a real scenario, this would use a robust react-to-html renderer
      const htmlStub = `
          <html>
            <head>
              <style>
                body { font-family: sans-serif; padding: 40px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, tx { border: 1px solid #ddd; padding: 12px; text-align: left; }
                th { background-color: #f5f5f5; }
                h1 { color: #333; }
              </style>
            </head>
            <body>
              <h1>${report?.name || 'Relatório'}</h1>
              <p>${report?.description || ''}</p>
              <table>
                <thead>
                  <tr>
                    ${executionMutation.data?.columns?.map((c: string) => `<th>${c}</th>`).join('') || ''}
                  </tr>
                </thead>
                <tbody>
                  ${
                    executionMutation.data?.rows
                      ?.slice(0, 50)
                      .map(
                        (r: Record<string, unknown>) => `
                    <tr>
                      ${executionMutation.data?.columns?.map((c: string) => `<td>${String(r[c] || '')}</td>`).join('') || ''}
                    </tr>
                  `
                      )
                      .join('') || ''
                  }
                </tbody>
              </table>
              ${executionMutation.data?.rows?.length > 50 ? '<p><i>... (truncado para visualização)</i></p>' : ''}
            </body>
          </html>`;

      const response = await api.post('/reports/export-pdf', {
        htmlContent: htmlStub
      });
      return response.data;
    },
    onSuccess: data => {
      if (data.success && data.jobId) {
        setPdfJobId(data.jobId);
        setIsPollingPdf(true);
        toast.info('Geração do PDF enfileirada...');
      }
    },
    onError: () => {
      toast.error('Erro ao iniciar exportação do PDF');
    }
  });

  // 4. Polling effect
  useEffect(() => {
    if (!isPollingPdf || !pdfJobId) return;

    const interval = setInterval(async () => {
      try {
        const response = await api.get(
          `/reports/export-pdf/${pdfJobId}/status`
        );
        const data = response.data;

        if (data.state === 'completed') {
          setIsPollingPdf(false);
          setPdfJobId(null);
          clearInterval(interval);

          // Decode base64 and trigger download
          if (data.pdfData) {
            const binaryString = window.atob(data.pdfData);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${report?.name || 'relatorio'}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('PDF gerado com sucesso!');
          }
        } else if (data.state === 'failed') {
          setIsPollingPdf(false);
          setPdfJobId(null);
          clearInterval(interval);
          toast.error(`Falha ao gerar PDF: ${data.error}`);
        }
      } catch (err: unknown) {
        console.error('Poll error:', err);
        setIsPollingPdf(false);
        clearInterval(interval);
        toast.error('Erro na comunicação com o servidor.');
      }
    }, 2000); // poll every 2 seconds

    return () => clearInterval(interval);
  }, [isPollingPdf, pdfJobId, report?.name]);

  const handleRun = () => {
    if (report?.sql_query) {
      executionMutation.mutate({ sql: report.sql_query, page: 1 });
    }
  };

  const handlePageChange = (newPage: number) => {
    if (report?.sql_query) {
      executionMutation.mutate({ sql: report.sql_query, page: newPage });
    }
  };

  const handleExportPdf = () => {
    exportPdfMutation.mutate();
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
          <Button
            variant="outline"
            disabled={
              !executionMutation.data ||
              exportPdfMutation.isPending ||
              isPollingPdf
            }
            onClick={handleExportPdf}
          >
            {isPollingPdf ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-500" />
            ) : exportPdfMutation.isSuccess && !isPollingPdf ? (
              <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {isPollingPdf ? 'Gerando PDF...' : 'Exportar PDF'}
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
          ) : executionMutation.data?.rows ? (
            <ResultsTable
              data={executionMutation.data.rows}
              page={executionMutation.data.page}
              pageSize={executionMutation.data.pageSize}
              totalRows={executionMutation.data.totalRows}
              totalPages={executionMutation.data.totalPages}
              onPageChange={handlePageChange}
            />
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
