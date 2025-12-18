/**
 * useProductStats Hook
 * Hook para calcular estatísticas de produtos
 */

import { useMemo } from 'react';
import type { Product, ProductStats } from '@/shared/types';
import { calculateProductStats } from '@/shared/utils';

export function useProductStats(products: Product[]): ProductStats {
    return useMemo(() => calculateProductStats(products), [products]);
}
