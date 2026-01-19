'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileBarChart, Plus, Database } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export default function DashboardPage() {
    const { user } = useAuth();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Olá, {user?.email.split('@')[0]}</h1>
                <p className="text-gray-500 mt-2">Bem-vindo ao QReports. O que você gostaria de fazer hoje?</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Relatórios</CardTitle>
                        <FileBarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Meus Relatórios</div>
                        <CardDescription className="mt-1">
                            Visualize e gerencie seus relatórios salvos.
                        </CardDescription>
                        <div className="mt-4">
                            <Link href="/reports">
                                <Button variant="outline" className="w-full">
                                    Ver Todos
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Criar Novo</CardTitle>
                        <Plus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Novo Relatório</div>
                        <CardDescription className="mt-1">
                            Crie um novo relatório do zero.
                        </CardDescription>
                        <div className="mt-4">
                             <Link href="/reports/create">
                                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                                    Criar Agora
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                 <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-indigo-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Fontes de Dados</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Conexões</div>
                        <CardDescription className="mt-1">
                            Gerencie suas conexões de banco de dados.
                        </CardDescription>
                        <div className="mt-4">
                            <Link href="/datasources">
                                <Button variant="outline" className="w-full">
                                    Gerenciar
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
