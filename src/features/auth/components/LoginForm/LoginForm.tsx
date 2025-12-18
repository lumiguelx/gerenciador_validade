/**
 * LoginForm Component
 * Formulário de login com validação
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, LogIn } from 'lucide-react';
import { loginFormSchema, type LoginFormData } from '@/shared/utils';

interface LoginFormProps {
    onSubmit: (data: LoginFormData) => Promise<void>;
    loading?: boolean;
}

export function LoginForm({ onSubmit, loading = false }: LoginFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginFormSchema),
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="seu@email.com"
                    disabled={loading}
                    autoComplete="email"
                />
                {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                    id="password"
                    type="password"
                    {...register('password')}
                    placeholder="••••••••"
                    disabled={loading}
                    autoComplete="current-password"
                />
                {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                    </>
                ) : (
                    <>
                        <LogIn className="mr-2 h-4 w-4" />
                        Entrar
                    </>
                )}
            </Button>
        </form>
    );
}
