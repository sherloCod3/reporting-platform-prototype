"use client";

import { ReportEditor } from "@/components/reports/report-editor";
import { reportApi } from "@/features/reports/api/reportApi";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ReportData } from "@/components/reports/types";

export default function CreateReportPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createReportMutation = useMutation({
    mutationFn: reportApi.create,
    onSuccess: (data) => {
      toast.success("Report created successfully");
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      router.push(`/reports/${data.id}/edit`);
    },
    onError: (error) => {
      toast.error("Failed to create report");
      console.error(error);
    },
  });

  const handleSave = (data: Omit<ReportData, "id">) => {
    createReportMutation.mutate(data);
  };

  return <ReportEditor onSave={handleSave} />;
}
