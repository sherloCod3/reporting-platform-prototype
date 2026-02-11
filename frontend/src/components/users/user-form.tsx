'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UserService, User } from '@/services/users/users';
import { toast } from 'sonner';

const userSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().optional(),
    role: z.enum(['admin', 'user', 'viewer']),
    client_id: z.coerce.number().min(1, 'Cliente é obrigatório'),
    active: z.coerce.number().default(1),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
    user?: User | null;
    onSuccess?: () => void;
}

export function UserForm({ user, onSuccess }: UserFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<UserFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(userSchema) as any,
        defaultValues: {
            email: user?.email || '',
            password: '',
            role: user?.role || 'viewer',
            client_id: user?.client_id || 0,
            active: user?.active ?? 1,
        },
    });

    const onSubmit = async (data: UserFormData) => {
        setIsLoading(true);
        try {
            if (user) {
                // Remove password if empty (no change)
                if (!data.password) delete data.password;
                await UserService.update(user.id, data);
                toast.success('Usuário atualizado com sucesso!');
            } else {
                if (!data.password) {
                    toast.error('Senha é obrigatória para novos usuários');
                    return;
                }
                await UserService.create(data);
                toast.success('Usuário criado com sucesso!');
            }
            onSuccess?.();
            form.reset();
        } catch (error: unknown) {
            console.error(error);
            const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erro ao salvar usuário';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="email@exemplo.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                {!user && (
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Senha</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="******" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                 {user && (
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Senha (deixe em branco para manter)</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="Nova senha" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Perfil</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o perfil" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="admin">Administrador</SelectItem>
                                    <SelectItem value="user">Usuário</SelectItem>
                                    <SelectItem value="viewer">Visualizador</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <FormField
                    control={form.control}
                    name="client_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>ID do Cliente</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="1" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Salvando...' : (user ? 'Atualizar Usuário' : 'Criar Usuário')}
                </Button>
            </form>
        </Form>
    );
}
