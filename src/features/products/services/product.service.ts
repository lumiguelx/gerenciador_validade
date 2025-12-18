/**
 * Product Service
 * Encapsula todas as operações relacionadas a produtos
 */

import { supabase } from '@/integrations/supabase/client';
import type {
    Product,
    CreateProductInput,
    UpdateProductInput,
    ProductsBySession
} from '@/shared/types';
import { groupProductsBySession, sortProductsByExpiry } from '@/shared/utils';

export class ProductService {
    /**
     * Busca todos os produtos do usuário (ou todos se admin)
     */
    static async getProducts(userId?: string, isAdmin: boolean = false): Promise<Product[]> {
        let query = supabase
            .from('products')
            .select('*')
            .order('expiry_date', { ascending: true });

        // Se não for admin, filtrar por user_id
        if (!isAdmin && userId) {
            query = query.eq('user_id', userId);
        }

        // Se for admin e tiver userId específico, filtrar por esse usuário
        if (isAdmin && userId && userId !== 'all') {
            query = query.eq('user_id', userId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching products:', error);
            throw new Error('Erro ao carregar produtos');
        }

        return (data || []) as Product[];
    }

    /**
     * Busca um produto por ID
     */
    static async getProductById(id: string): Promise<Product | null> {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching product:', error);
            return null;
        }

        return data as Product;
    }

    /**
     * Cria um novo produto
     */
    static async createProduct(input: CreateProductInput): Promise<Product> {
        const { data, error } = await supabase
            .from('products')
            .insert([input])
            .select()
            .single();

        if (error) {
            console.error('Error creating product:', error);
            throw new Error('Erro ao criar produto');
        }

        return data as Product;
    }

    /**
     * Atualiza um produto existente
     */
    static async updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
        const { data, error } = await supabase
            .from('products')
            .update(input)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating product:', error);
            throw new Error('Erro ao atualizar produto');
        }

        return data as Product;
    }

    /**
     * Deleta um produto
     */
    static async deleteProduct(id: string): Promise<void> {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting product:', error);
            throw new Error('Erro ao deletar produto');
        }
    }

    /**
     * Busca produtos agrupados por sessão
     */
    static async getProductsBySession(userId?: string, isAdmin: boolean = false): Promise<ProductsBySession> {
        const products = await this.getProducts(userId, isAdmin);
        return groupProductsBySession(products);
    }

    /**
     * Busca produtos próximos ao vencimento
     */
    static async getExpiringProducts(days: number = 7, userId?: string): Promise<Product[]> {
        const products = await this.getProducts(userId, false);
        const sorted = sortProductsByExpiry(products);

        // Filtrar apenas produtos que vencem em X dias
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);

        return sorted.filter(p => {
            const expiryDate = new Date(p.expiry_date);
            return expiryDate >= today && expiryDate <= futureDate;
        });
    }

    /**
     * Busca produtos vencidos
     */
    static async getExpiredProducts(userId?: string): Promise<Product[]> {
        const products = await this.getProducts(userId, false);
        const today = new Date();

        return products.filter(p => {
            const expiryDate = new Date(p.expiry_date);
            return expiryDate < today;
        });
    }

    /**
     * Conta total de produtos do usuário
     */
    static async countProducts(userId: string): Promise<number> {
        const { count, error } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (error) {
            console.error('Error counting products:', error);
            return 0;
        }

        return count || 0;
    }
}
