'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, Play } from 'lucide-react';

const reportSchema = z.object({
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    description: z.string().optional(),
    sql_query: z.string().min(10, 'Query SQL deve ter pelo menos 10 caracteres'),
});

type ReportForm = z.infer<typeof reportSchema>;

interface ReportEditorProps {
    initialData?: ReportForm & { id?: number };
    isEditing?: boolean;
}

export function ReportEditor({ initialData, isEditing = false }: ReportEditorProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('general');

    const form = useForm<ReportForm>({
        resolver: zodResolver(reportSchema),
        defaultValues: {
            name: initialData?.name || '',
            description: initialData?.description || '',
            sql_query: initialData?.sql_query || 'SELECT * FROM users LIMIT 10',
        },
    });

    const mutation = useMutation({
        mutationFn: async (data: ReportForm) => {
            if (isEditing && initialData?.id) {
                return api.put(`/definitions/${initialData.id}`, data);
            }
            return api.post('/definitions', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reports'] });
            toast.success(isEditing ? 'Relatório atualizado!' : 'Relatório criado!');
            router.push('/reports');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao salvar relatório');
        },
    });

    const onSubmit = (data: ReportForm) => {
        mutation.mutate(data);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        {isEditing ? `Editar: ${initialData?.name}` : 'Novo Relatório'}
                    </h1>
                    <p className="text-gray-500">Defina a query SQL e as configurações do relatório.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" type="button" onClick={() => router.back()}>
                        Cancelar
                    </Button>
                    <Button onClick={form.handleSubmit(onSubmit)} disabled={mutation.isPending}>
                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Salvar
                    </Button>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList>
                            <TabsTrigger value="general">Geral</TabsTrigger>
                            <TabsTrigger value="query">Consulta SQL</TabsTrigger>
                            <TabsTrigger value="preview" disabled>Layout (Em breve)</TabsTrigger>
                        </TabsList>

                        <TabsContent value="general" className="mt-4">
                            <Card>
                                <CardContent className="pt-6 space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nome do Relatório</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ex: Vendas Mensais" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    Nome visível para os usuários.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Descrição</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Descreva o propósito deste relatório..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="query" className="mt-4">
                            <Card className="min-h-[400px] flex flex-col">
                                <CardContent className="pt-6 flex-1 flex flex-col space-y-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-sm font-medium">Editor SQL</h3>
                                         {/* Placeholder for future Test Run button inside editor */}
                                         <Button type="button" size="sm" variant="ghost" className="text-blue-600">
                                            <Play className="mr-2 h-3 w-3" />
                                            Testar Query (Em breve)
                                         </Button>
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="sql_query"
                                        render={({ field }) => (
                                            <FormItem className="flex-1 flex flex-col">
                                                <FormControl>
                                                    <Textarea 
                                                        className="font-mono text-sm flex-1 min-h-[300px] bg-slate-950 text-slate-50 border-input" 
                                                        placeholder="SELECT * FROM ..." 
                                                        spellCheck={false}
                                                        {...field} 
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </form>
            </Form>
        </div>
    );
}
