"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { FileBarChart, Plus, Database } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-background p-8">
        <h1 className="text-[32px] font-bold tracking-[-0.02em]">
          Olá, {user?.email.split("@")[0]}!
        </h1>
        <div className="mt-3 h-0.5 w-12 bg-primary/70" />
        <p className="mt-4 max-w-xl text-sm text-muted-foreground">
          Bem-vindo ao QReports. Crie insights poderosos e gerencie seus dados
          com facilidade.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Meus Relatórios"
          description="Visualize, edite e acompanhe seus relatórios salvos e dashboards."
          icon={FileBarChart}
          action={
            <Link href="/reports">
              <Button
                variant="outline"
                className="w-full">
                Acessar Relatórios
              </Button>
            </Link>
          }
        />

        <DashboardCard
          title="Criar Novo Relatório"
          description="Comece do zero e crie visualizações impactantes com seus dados."
          icon={Plus}
          action={
            <Link href="/reports/create">
              <Button className="w-full">
                Criar Agora
              </Button>
            </Link>
          }
        />

        <DashboardCard
          title="Fontes de Dados"
          description="Conecte e gerencie bancos de dados (PostgreSQL, MySQL, etc)."
          icon={Database}
          action={
            <Link href="?action=datasources" scroll={false}>
              <Button
                variant="outline"
                className="w-full">
                Gerenciar Conexões
              </Button>
            </Link>
          }
        />
      </div>
    </div>
  );
}
