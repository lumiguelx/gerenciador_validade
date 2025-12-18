/**
 * useProductFilters Hook
 * Hook para gerenciar filtros de produtos
 */

import { useState, useMemo } from 'react';
import type { Product, ProductFilters } from '@/shared/types';
import {
    filterProductsBySearch,
    filterProductsByStatus,
    filterProductsBySession
} from '@/shared/utils';

export function useProductFilters(products: Product[]) {
    const [filters, setFilters] = useState<ProductFilters>({
        search: '',
        status: 'all',
        session: 'all',
    });

    /**
     * Produtos filtrados (memoizado)
     */
    const filteredProducts = useMemo(() => {
        let filtered = products;

        // Aplicar busca
        if (filters.search) {
            filtered = filterProductsBySearch(filtered, filters.search);
        }

        // Aplicar filtro de status
        if (filters.status !== 'all') {
            filtered = filterProductsByStatus(filtered, filters.status);
        }

        // Aplicar filtro de sessão
        if (filters.session !== 'all') {
            filtered = filterProductsBySession(filtered, filters.session);
        }

        return filtered;
    }, [products, filters]);

    /**
     * Atualiza um filtro específico
     */
    const updateFilter = <K extends keyof ProductFilters>(
        key: K,
        value: ProductFilters[K]
    ) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    /**
     * Limpa todos os filtros
     */
    const clearFilters = () => {
        setFilters({
            search: '',
            status: 'all',
            session: 'all',
        });
    };

    /**
     * Verifica se há filtros ativos
     */
    const hasActiveFilters = useMemo(() => {
        return filters.search !== '' ||
            filters.status !== 'all' ||
            filters.session !== 'all';
    }, [filters]);

    return {
        filters,
        filteredProducts,
        setFilters,
        updateFilter,
        clearFilters,
        hasActiveFilters,
    };
}
