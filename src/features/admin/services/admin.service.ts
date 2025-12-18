/**
 * Admin Service
 * Serviço para operações administrativas
 */

import { supabase } from '@/integrations/supabase/client';
import type { UserProfile } from '@/shared/types';

export class AdminService {
    /**
     * Busca todos os usuários com contagem de produtos
     */
    static async getAllUsers(): Promise<UserProfile[]> {
        try {
            const { data, error } = await (supabase.rpc as any)('get_users_with_products');

            if (error) {
                console.error('Error fetching users:', error);
                return [];
            }

            if (!data) {
                return [];
            }

            return data.map((u: any) => ({
                id: u.id,
                email: u.email || 'Sem email',
                role: 'user',
                product_count: u.product_count,
            })) as UserProfile[];
        } catch (error) {
            console.error('Error loading users:', error);
            return [];
        }
    }

    /**
     * Promove um usuário a admin
     */
    static async promoteToAdmin(userId: string): Promise<void> {
        try {
            const { error } = await (supabase
                .from('user_profiles' as any)
                .update({ role: 'admin', updated_at: new Date().toISOString() })
                .eq('id', userId) as any);

            if (error) {
                console.error('Error promoting user:', error);
                throw new Error('Erro ao promover usuário');
            }
        } catch (error) {
            console.error('Error promoting to admin:', error);
            throw error;
        }
    }

    /**
     * Remove privilégios de admin de um usuário
     */
    static async demoteFromAdmin(userId: string): Promise<void> {
        try {
            const { error } = await (supabase
                .from('user_profiles' as any)
                .update({ role: 'user', updated_at: new Date().toISOString() })
                .eq('id', userId) as any);

            if (error) {
                console.error('Error demoting user:', error);
                throw new Error('Erro ao remover privilégios de admin');
            }
        } catch (error) {
            console.error('Error demoting from admin:', error);
            throw error;
        }
    }

    /**
     * Busca estatísticas gerais do sistema
     */
    static async getSystemStats(): Promise<{
        totalUsers: number;
        totalProducts: number;
        totalExpired: number;
        totalExpiring: number;
    }> {
        try {
            // Buscar total de usuários
            const { count: totalUsers } = await (supabase
                .from('user_profiles' as any)
                .select('*', { count: 'exact', head: true }) as any);

            // Buscar total de produtos
            const { count: totalProducts } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true });

            // Buscar vencidos (simplificado - idealmente usar uma view ou função)
            const { data: allProducts } = await supabase
                .from('products')
                .select('expiry_date');

            const today = new Date();
            const futureDate = new Date();
            futureDate.setDate(today.getDate() + 7);

            let totalExpired = 0;
            let totalExpiring = 0;

            allProducts?.forEach(p => {
                const expiryDate = new Date(p.expiry_date);
                if (expiryDate < today) {
                    totalExpired++;
                } else if (expiryDate >= today && expiryDate <= futureDate) {
                    totalExpiring++;
                }
            });

            return {
                totalUsers: totalUsers || 0,
                totalProducts: totalProducts || 0,
                totalExpired,
                totalExpiring,
            };
        } catch (error) {
            console.error('Error fetching system stats:', error);
            return {
                totalUsers: 0,
                totalProducts: 0,
                totalExpired: 0,
                totalExpiring: 0,
            };
        }
    }

    /**
     * Deleta um usuário e todos os seus produtos
     */
    static async deleteUser(userId: string): Promise<void> {
        try {
            // Primeiro deletar produtos do usuário
            const { error: productsError } = await supabase
                .from('products')
                .delete()
                .eq('user_id', userId);

            if (productsError) {
                console.error('Error deleting user products:', productsError);
                throw new Error('Erro ao deletar produtos do usuário');
            }

            // Depois deletar perfil (isso também deleta o auth.users via CASCADE)
            const { error: profileError } = await (supabase
                .from('user_profiles' as any)
                .delete()
                .eq('id', userId) as any);

            if (profileError) {
                console.error('Error deleting user profile:', profileError);
                throw new Error('Erro ao deletar usuário');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
}
