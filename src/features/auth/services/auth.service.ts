/**
 * Auth Service
 * Serviço de autenticação e gerenciamento de sessão
 */

import { supabase } from '@/integrations/supabase/client';
import type { AuthUser, Session, SignInCredentials, SignUpCredentials } from '@/shared/types';

export class AuthService {
    /**
     * Realiza login com email e senha
     */
    static async signIn(credentials: SignInCredentials): Promise<Session> {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
        });

        if (error) {
            console.error('Sign in error:', error);
            throw new Error('Email ou senha incorretos');
        }

        if (!data.session) {
            throw new Error('Erro ao criar sessão');
        }

        return data.session as Session;
    }

    /**
     * Realiza cadastro de novo usuário
     */
    static async signUp(credentials: SignUpCredentials): Promise<AuthUser> {
        const { data, error } = await supabase.auth.signUp({
            email: credentials.email,
            password: credentials.password,
            options: {
                emailRedirectTo: undefined,
                data: {
                    email_confirmed: true
                }
            }
        });

        if (error) {
            console.error('Sign up error:', error);

            if (error.message.includes('already registered')) {
                throw new Error('Email já cadastrado');
            }

            throw new Error('Erro ao criar conta');
        }

        if (!data.user) {
            throw new Error('Erro ao criar usuário');
        }

        // Auto login após cadastro
        try {
            await this.signIn({
                email: credentials.email,
                password: credentials.password,
            });
        } catch (signInError) {
            console.error('Auto sign-in error:', signInError);
        }

        return data.user as AuthUser;
    }

    /**
     * Realiza logout
     */
    static async signOut(): Promise<void> {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Sign out error:', error);
            throw new Error('Erro ao fazer logout');
        }
    }

    /**
     * Obtém a sessão atual
     */
    static async getSession(): Promise<Session | null> {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            console.error('Get session error:', error);
            return null;
        }

        return data.session as Session | null;
    }

    /**
     * Obtém o usuário atual
     */
    static async getCurrentUser(): Promise<AuthUser | null> {
        const session = await this.getSession();
        return session?.user as AuthUser | null;
    }

    /**
     * Verifica se o usuário é admin
     */
    static async isAdmin(userId: string): Promise<boolean> {
        try {
            const { data, error } = await (supabase
                .from('user_profiles' as any)
                .select('role')
                .eq('id', userId)
                .single() as any);

            if (error) {
                console.error('Error checking admin status:', error);
                return false;
            }

            return data?.role === 'admin';
        } catch (error) {
            console.error('Error checking admin:', error);
            return false;
        }
    }

    /**
     * Obtém perfil do usuário
     */
    static async getUserProfile(userId: string) {
        try {
            const { data, error } = await (supabase
                .from('user_profiles' as any)
                .select('*')
                .eq('id', userId)
                .single() as any);

            if (error) {
                console.error('Error fetching user profile:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
    }

    /**
     * Atualiza senha do usuário
     */
    static async updatePassword(newPassword: string): Promise<void> {
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) {
            console.error('Update password error:', error);
            throw new Error('Erro ao atualizar senha');
        }
    }

    /**
     * Envia email de recuperação de senha
     */
    static async resetPassword(email: string): Promise<void> {
        const { error } = await supabase.auth.resetPasswordForEmail(email);

        if (error) {
            console.error('Reset password error:', error);
            throw new Error('Erro ao enviar email de recuperação');
        }
    }

    /**
     * Observa mudanças no estado de autenticação
     */
    static onAuthStateChange(callback: (session: Session | null) => void) {
        return supabase.auth.onAuthStateChange((_event, session) => {
            callback(session as Session | null);
        });
    }
}
