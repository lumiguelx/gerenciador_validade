/**
 * useProducts Hook
 * Hook para buscar e gerenciar produtos com React Query
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Product } from '@/shared/types';
import { ProductService } from '../services';

export function useProducts(userId?: string, isAdmin: boolean = false) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['products', userId, isAdmin],
        queryFn: () => ProductService.getProducts(userId, isAdmin),
        staleTime: 1000 * 60 * 5, // 5 minutos
        gcTime: 1000 * 60 * 10, // 10 minutos (era cacheTime)
    });

    /**
     * Invalida cache e recarrega produtos
     */
    const refetch = () => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        return query.refetch();
    };

    /**
     * Atualiza produto no cache localmente (optimistic update)
     */
    const updateProductInCache = (productId: string, updates: Partial<Product>) => {
        queryClient.setQueryData<Product[]>(['products', userId, isAdmin], (old) => {
            if (!old) return old;
            return old.map(p => p.id === productId ? { ...p, ...updates } : p);
        });
    };

    /**
     * Remove produto do cache localmente
     */
    const removeProductFromCache = (productId: string) => {
        queryClient.setQueryData<Product[]>(['products', userId, isAdmin], (old) => {
            if (!old) return old;
            return old.filter(p => p.id !== productId);
        });
    };

    /**
     * Adiciona produto ao cache localmente
     */
    const addProductToCache = (product: Product) => {
        queryClient.setQueryData<Product[]>(['products', userId, isAdmin], (old) => {
            if (!old) return [product];
            return [...old, product];
        });
    };

    return {
        products: query.data || [],
        loading: query.isLoading,
        error: query.error,
        isRefetching: query.isRefetching,
        refetch,
        updateProductInCache,
        removeProductFromCache,
        addProductToCache,
    };
}
