
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { UserService, User } from '@/services/user.service';

const userSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().optional(),
    role: z.enum(['admin', 'user', 'viewer']),
    clientId: z.string().min(1, 'Client is required'),
    active: z.number().optional()
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
    user?: User | null;
    onSuccess: () => void;
}

export function UserForm({ user, onSuccess }: UserFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            email: user?.email || '',
            password: '',
            role: user?.role || 'user',
            clientId: user?.client_id?.toString() || '',
            active: user?.active ?? 1
        },
    });

    const onSubmit = async (values: UserFormValues) => {
        setIsLoading(true);
        try {
            // ... (rest of logic remains similar but using typed values)
            const payload = {
                ...values,
                clientId: Number(values.clientId)
            };
            
            // ... rest of logic


            if (user) {
                // Update
                if (!payload.password) delete payload.password;
                await UserService.update(user.id, payload);
                toast.success('User updated successfully');
            } else {
                // Create
                if (!values.password) {
                    form.setError('password', { message: 'Password is required for new users' });
                    setIsLoading(false);
                    return;
                }
                await UserService.create(payload);
                toast.success('User created successfully');
            }
            onSuccess();
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            const errorMessage = error.response?.data?.error || 'Failed to save user';
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
                                <Input placeholder="email@company.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password {user && '(Leave empty to keep current)'}</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder={user ? "********" : "Secret123"} {...field} />
                            </FormControl>
                            <FormDescription>Min 6 characters recommended.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="viewer">Viewer</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="clientId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Client ID</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="1" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                 {user && (
                    <FormField
                        control={form.control}
                        name="active"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="1">Active</SelectItem>
                                        <SelectItem value="0">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onSuccess}>Cancel</Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {user ? 'Update User' : 'Create User'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
