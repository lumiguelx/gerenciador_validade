/**
 * ProductList Component
 * Lista de produtos agrupados por sessão
 */

import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import type { Product } from '@/shared/types';
import { groupProductsBySession } from '@/shared/utils';
import { ProductCard } from '../ProductCard';
import { getSessionIcon } from '@/shared/constants';

interface ProductListProps {
    products: Product[];
    onEdit?: (product: Product) => void;
    onDelete?: (id: string) => void;
    compact?: boolean;
}

export function ProductList({
    products,
    onEdit,
    onDelete,
    compact = false,
}: ProductListProps) {
    const grouped = groupProductsBySession(products);

    return (
        <div className="space-y-6">
            {Object.entries(grouped).map(([session, sessionProducts]) => (
                <div key={session}>
                    {/* Session Header */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">{getSessionIcon(session)}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <h2 className="font-semibold text-foreground">{session}</h2>
                        <Badge variant="secondary" className="ml-auto">
                            {sessionProducts.length}
                        </Badge>
                    </div>

                    {/* Products */}
                    <div className="space-y-2">
                        {sessionProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                compact={compact}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
