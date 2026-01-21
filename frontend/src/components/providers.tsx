"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth-context";
import { DatabaseProvider } from "@/contexts/db-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DatabaseProvider>{children}</DatabaseProvider>
      </AuthProvider>
      <Toaster />
    </QueryClientProvider>
  );
}
