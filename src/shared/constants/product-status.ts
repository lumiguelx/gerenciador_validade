/**
 * Product Status Constants
 * Status de produtos e helpers relacionados
 */

import type { ProductStatus } from '@/shared/types';

export const PRODUCT_STATUSES: Record<ProductStatus, string> = {
    normal: 'Normal',
    primeira_rebaixa: 'Rebaixa 1',
    segunda_rebaixa: 'Rebaixa 2'
};

export const STATUS_VARIANTS: Record<ProductStatus, 'success' | 'warning' | 'danger'> = {
    normal: 'success',
    primeira_rebaixa: 'warning',
    segunda_rebaixa: 'danger'
};

export const STATUS_COLORS = {
    normal: {
        bg: 'bg-green-500',
        text: 'text-green-700',
        border: 'border-green-500',
        light: 'bg-green-50'
    },
    primeira_rebaixa: {
        bg: 'bg-yellow-500',
        text: 'text-yellow-700',
        border: 'border-yellow-500',
        light: 'bg-yellow-50'
    },
    segunda_rebaixa: {
        bg: 'bg-red-500',
        text: 'text-red-700',
        border: 'border-red-500',
        light: 'bg-red-50'
    },
    vencido: {
        bg: 'bg-red-600',
        text: 'text-red-900',
        border: 'border-red-600',
        light: 'bg-red-100'
    },
    vencendo: {
        bg: 'bg-orange-500',
        text: 'text-orange-700',
        border: 'border-orange-500',
        light: 'bg-orange-50'
    }
} as const;

export function getStatusLabel(status: ProductStatus): string {
    return PRODUCT_STATUSES[status] || status;
}

export function getStatusVariant(status: ProductStatus): 'success' | 'warning' | 'danger' {
    return STATUS_VARIANTS[status] || 'success';
}

export function getStatusColor(status: ProductStatus | 'vencido' | 'vencendo', element: keyof typeof STATUS_COLORS.normal = 'bg'): string {
    return STATUS_COLORS[status]?.[element] || STATUS_COLORS.normal[element];
}
