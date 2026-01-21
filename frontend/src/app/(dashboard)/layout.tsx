'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Separator } from '@/components/ui/separator';
import { DatasourcesModal } from '@/components/datasources/datasources-modal';
import { AppSidebar } from '@/components/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

function UrlModalManager() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const isDatasourcesOpen = searchParams?.get('action') === 'datasources';
    
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            router.push(pathname);
        }
    };

    return <DatasourcesModal open={isDatasourcesOpen} onOpenChange={handleOpenChange} />;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    // searchParams moved to UrlModalManager
    
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);
    
    // handleOpenChange moved to UrlModalManager

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Carregando...</div>;
    }

    if (!isAuthenticated) return null;

    if (!isAuthenticated) return null;

    return (
        <SidebarProvider>
            <Suspense fallback={null}>
                <UrlModalManager />
            </Suspense>
            
            <AppSidebar />
            
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white sticky top-0 z-10 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    {/* Add Breadcrumbs or simple title here if needed, or keep it clean */}
                    <span className="font-bold">QReports</span>
                </header>
                <div className="flex-1 p-6 md:p-8 overflow-auto bg-gray-50/40">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
