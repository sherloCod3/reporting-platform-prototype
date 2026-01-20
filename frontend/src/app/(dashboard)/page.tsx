'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DashboardCard } from '@/components/dashboard/dashboard-card';
import { FileBarChart, Plus, Database } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardPage() {
    const { user } = useAuth();

    return (
        <div className="space-y-8">
            <div className="relative overflow-hidden rounded-2xl gradient-bg p-8 text-white shadow-xl">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold tracking-tight">Olá, {user?.email.split('@')[0]}!</h1>
                    <p className="mt-2 text-blue-100 max-w-xl">
                        Bem-vindo ao QReports. Crie insights poderosos e gerencie seus dados com facilidade usando nossa nova interface.
                    </p>
                </div>
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-blue-500/20 blur-2xl"></div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <DashboardCard
                    title="Meus Relatórios"
                    description="Visualize, edite e acompanhe seus relatórios salvos e dashboards."
                    icon={FileBarChart}
                    gradient="gradient-report-1"
                    action={
                        <Link href="/reports">
                            <Button variant="outline" className="w-full hover:bg-slate-50 border-slate-200">
                                Acessar Relatórios
                            </Button>
                        </Link>
                    }
                />

                <DashboardCard
                    title="Criar Novo Relatório"
                    description="Comece do zero e crie visualizações impactantes com seus dados."
                    icon={Plus}
                    gradient="gradient-report-2"
                    action={
                        <Link href="/reports/create">
                            <Button className="w-full gradient-bg border-0 hover:opacity-90 transition-opacity">
                                Criar Agora
                            </Button>
                        </Link>
                    }
                />

                <DashboardCard
                    title="Fontes de Dados"
                    description="Conecte e gerencie bancos de dados (PostgreSQL, MySQL, etc)."
                    icon={Database}
                    gradient="gradient-report-3"
                    action={
                        <Link href="?action=datasources" scroll={false}>
                            <Button variant="outline" className="w-full hover:bg-slate-50 border-slate-200">
                                Gerenciar Conexões
                            </Button>
                        </Link>
                    }
                />
            </div>
        </div>
    );
}
