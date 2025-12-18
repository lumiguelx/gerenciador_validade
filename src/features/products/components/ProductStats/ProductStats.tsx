/**
 * ProductStats Component
 * Cards de estatísticas de produtos
 */

import { Card, CardContent } from '@/components/ui/card';
import type { ProductStats } from '@/shared/types';

interface ProductStatsProps {
    stats: ProductStats;
    loading?: boolean;
}

export function ProductStats({ stats, loading = false }: ProductStatsProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                            <div className="h-8 bg-muted rounded mb-2" />
                            <div className="h-4 bg-muted rounded w-20" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
            {/* Total */}
            <Card>
                <CardContent className="p-6 text-center">
                    <p className="text-3xl font-bold text-primary">{stats.total}</p>
                    <p className="text-xs text-muted-foreground mt-1">Total de Produtos</p>
                </CardContent>
            </Card>

            {/* Vencidos */}
            <Card className="border-danger-500/20 bg-danger-50/50 dark:bg-danger-950/20">
                <CardContent className="p-6 text-center">
                    <p className="text-3xl font-bold text-danger-600 dark:text-danger-400">
                        {stats.vencidos}
                    </p>
                    <p className="text-xs text-danger-700 dark:text-danger-300 mt-1">
                        Vencidos
                    </p>
                </CardContent>
            </Card>

            {/* Vencendo */}
            <Card className="border-warning-500/20 bg-warning-50/50 dark:bg-warning-950/20">
                <CardContent className="p-6 text-center">
                    <p className="text-3xl font-bold text-warning-600 dark:text-warning-400">
                        {stats.vencendo}
                    </p>
                    <p className="text-xs text-warning-700 dark:text-warning-300 mt-1">
                        Vencendo (7 dias)
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
