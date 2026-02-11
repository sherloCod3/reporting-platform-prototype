"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Database,
  Plus,
  Trash2,
  Edit2,
  Server,
  CheckCircle2,
} from "lucide-react";

interface DatasourcesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DatasourcesModal({
  open,
  onOpenChange,
}: DatasourcesModalProps) {
  const [view, setView] = useState<"list" | "form">("list");
  const [isLoading, setIsLoading] = useState(false);

  // Mock data
  const [datasources] = useState([
    {
      id: 1,
      name: "Banco Principal",
      type: "PostgreSQL",
      host: "localhost",
      port: "5432",
    },
    {
      id: 2,
      name: "DW Analytics",
      type: "MySQL",
      host: "192.168.1.5",
      port: "3306",
    },
  ]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setView("list");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-background border-border">
        <div className="px-6 py-4 border-b border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <Database className="h-6 w-6" />
              Fontes de Dados
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {view === "list"
                ? "Gerencie suas conexões de banco de dados."
                : "Configure os detalhes da sua conexão."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6">
          {view === "list" ? (
            <div className="space-y-4">
              <div className="grid gap-3">
                {datasources.map((ds) => (
                  <div
                    key={ds.id}
                    className="group flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 hover:shadow-sm transition-all bg-background">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                        <Server className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold">
                          {ds.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {ds.type} • {ds.host}:{ds.port}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-primary">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => setView("form")}
                className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Nova Conexão
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome da Conexão</Label>
                    <Input placeholder="Ex: Produção" />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                      <option>PostgreSQL</option>
                      <option>MySQL</option>
                      <option>SQL Server</option>
                      <option>Oracle</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Host</Label>
                    <Input placeholder="localhost" />
                  </div>
                  <div className="space-y-2">
                    <Label>Porta</Label>
                    <Input placeholder="5432" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Usuário</Label>
                    <Input placeholder="user" />
                  </div>
                  <div className="space-y-2">
                    <Label>Senha</Label>
                    <Input type="password" placeholder="••••••" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Nome do Banco</Label>
                  <Input placeholder="my_database" />
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setView("list")}>
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="text-green-600 border-green-200 hover:bg-green-50">
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Testar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="">
                  {isLoading ? "Salvando..." : "Salvar Conexão"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
