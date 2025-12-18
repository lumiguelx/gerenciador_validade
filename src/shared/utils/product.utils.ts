/**
 * Product Utilities
 * Funções para manipulação e cálculos relacionados a produtos
 */

import type { Product, ProductStats, ProductsBySession, ProductStatus } from '@/shared/types';
import { getDaysUntilExpiry } from './date.utils';

/**
 * Agrupa produtos por sessão
 */
export function groupProductsBySession(products: Product[]): ProductsBySession {
    const grouped: ProductsBySession = {};

    products.forEach(product => {
        const session = product.product_brand || 'Sem Sessão';
        if (!grouped[session]) {
            grouped[session] = [];
        }
        grouped[session].push(product);
    });

    return grouped;
}

/**
 * Calcula estatísticas dos produtos
 */
export function calculateProductStats(products: Product[]): ProductStats {
    const stats: ProductStats = {
        total: products.length,
        vencidos: 0,
        vencendo: 0,
    };

    products.forEach(product => {
        const days = getDaysUntilExpiry(product.expiry_date);

        if (days < 0) {
            stats.vencidos++;
        } else if (days >= 0 && days <= 7) {
            stats.vencendo++;
        }
    });

    return stats;
}

/**
 * Obtém a cor do status baseado em dias e status
 */
export function getStatusColor(days: number, status?: ProductStatus): string {
    if (days < 0) return 'bg-red-600 text-white';
    if (days <= 7) return 'bg-orange-500 text-white';
    if (status === 'primeira_rebaixa') return 'bg-warning-500 text-white';
    if (status === 'segunda_rebaixa') return 'bg-danger-500 text-white';
    return 'bg-success-600 text-white';
}

/**
 * Obtém o label do status baseado em dias e status
 */
export function getStatusLabel(days: number, status: ProductStatus): string {
    if (days < 0) return 'Vencido';
    if (days <= 7) return 'Vencendo';
    if (status === 'primeira_rebaixa') return 'R1';
    if (status === 'segunda_rebaixa') return 'R2';
    return 'OK';
}

/**
 * Filtra produtos por texto de busca
 */
export function filterProductsBySearch(products: Product[], searchTerm: string): Product[] {
    if (!searchTerm.trim()) return products;

    const term = searchTerm.toLowerCase();
    return products.filter(p =>
        p.product_name.toLowerCase().includes(term) ||
        p.barcode?.toLowerCase().includes(term) ||
        p.product_brand.toLowerCase().includes(term)
    );
}

/**
 * Filtra produtos por status
 */
export function filterProductsByStatus(products: Product[], statusFilter: string): Product[] {
    if (statusFilter === 'all') return products;

    if (statusFilter === 'vencido') {
        return products.filter(p => getDaysUntilExpiry(p.expiry_date) < 0);
    }

    if (statusFilter === 'vencendo') {
        return products.filter(p => {
            const days = getDaysUntilExpiry(p.expiry_date);
            return days >= 0 && days <= 7;
        });
    }

    return products.filter(p => p.status === statusFilter);
}

/**
 * Filtra produtos por sessão
 */
export function filterProductsBySession(products: Product[], sessionFilter: string): Product[] {
    if (sessionFilter === 'all') return products;
    return products.filter(p => p.product_brand === sessionFilter);
}

/**
 * Ordena produtos por data de validade (mais próximo primeiro)
 */
export function sortProductsByExpiry(products: Product[]): Product[] {
    return [...products].sort((a, b) => {
        const dateA = new Date(a.expiry_date).getTime();
        const dateB = new Date(b.expiry_date).getTime();
        return dateA - dateB;
    });
}

/**
 * Ordena produtos por nome
 */
export function sortProductsByName(products: Product[]): Product[] {
    return [...products].sort((a, b) =>
        a.product_name.localeCompare(b.product_name, 'pt-BR')
    );
}

/**
 * Ordena produtos por sessão
 */
export function sortProductsBySession(products: Product[]): Product[] {
    return [...products].sort((a, b) =>
        a.product_brand.localeCompare(b.product_brand, 'pt-BR')
    );
}

/**
 * Valida dados de um produto
 */
export function validateProductData(data: Partial<Product>): string[] {
    const errors: string[] = [];

    if (!data.product_name || data.product_name.trim() === '') {
        errors.push('Nome do produto é obrigatório');
    }

    if (!data.product_brand || data.product_brand.trim() === '') {
        errors.push('Sessão é obrigatória');
    }

    if (!data.expiry_date) {
        errors.push('Data de validade é obrigatória');
    }

    if (!data.quantity || data.quantity < 1) {
        errors.push('Quantidade deve ser maior que zero');
    }

    return errors;
}
