'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { LayoutDashboard, FileBarChart, Database, Settings, LogOut, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const NAV_ITEMS = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { label: 'Users', icon: User, href: '/users' },
    { label: 'Relatórios', icon: FileBarChart, href: '/reports' },
    { label: 'Fontes de Dados', icon: Database, href: '/datasources' },
    { label: 'Configurações', icon: Settings, href: '/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, logout, user, client } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Carregando...</div>;
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-gray-50/40 flex">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 flex-col border-r bg-white h-screen sticky top-0">
                <div className="h-16 flex items-center px-6 border-b">
                    <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        QReports
                    </span>
                    {client && <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{client.slug}</span>}
                </div>
                
                <div className="flex-1 py-6 px-3 space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                        return (
                            <Link key={item.href} href={item.href}>
                                <div className={cn(
                                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                    isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                )}>
                                    <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-blue-700" : "text-gray-400")} />
                                    {item.label}
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <div className="p-4 mt-auto">
                    <Separator className="mb-4" />
                    <div className="flex items-center gap-3 mb-4 px-2">
                         <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs">
                            {user?.email[0].toUpperCase()}
                         </div>
                         <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                         </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                <div className="md:hidden h-16 border-b bg-white flex items-center px-4 justify-between sticky top-0 z-20">
                     <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64 p-0">
                           <div className="h-16 flex items-center px-6 border-b font-bold">QReports</div>
                           <div className="flex-1 py-4 px-3 space-y-1 overflow-auto">
                               {NAV_ITEMS.map((item) => {
                                   const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                                   return (
                                       <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)}>
                                           <div className={cn(
                                               "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                               isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                           )}>
                                               <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-blue-700" : "text-gray-400")} />
                                               {item.label}
                                           </div>
                                       </Link>
                                   );
                               })}
                           </div>

                           <div className="p-4 mt-auto">
                                <Separator className="mb-4" />
                                <div className="flex items-center gap-3 mb-4 px-2">
                                     <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs">
                                        {user?.email[0].toUpperCase()}
                                     </div>
                                     <div className="flex-1 overflow-hidden">
                                        <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                                        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                                     </div>
                                </div>
                                <Button variant="outline" size="sm" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => {
                                    setIsMobileOpen(false);
                                    logout();
                                }}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sair
                                </Button>
                           </div>
                        </SheetContent>
                    </Sheet>
                    <span className="font-bold">QReports</span>
                    <div className="w-5" /> {/* Spacer */}
                </div>
                
                <div className="flex-1 p-6 md:p-8 overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
