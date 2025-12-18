/**
 * ProductCard Component
 * Card individual de produto com ações
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import type { Product } from '@/shared/types';
import { getDaysUntilExpiry, formatExpiryDate, getExpiryDescription } from '@/shared/utils';
import { cn } from '@/lib/utils';

interface ProductCardProps {
    product: Product;
    onEdit?: (product: Product) => void;
    onDelete?: (id: string) => void;
    compact?: boolean;
}

export function ProductCard({
    product,
    onEdit,
    onDelete,
    compact = false,
}: ProductCardProps) {
    const days = getDaysUntilExpiry(product.expiry_date);
    const description = getExpiryDescription(product.expiry_date);

    // Determinar variante do badge
    const getBadgeVariant = () => {
        if (days < 0) return 'destructive';
        if (days <= 7) return 'default'; // warning-like
        if (product.status === 'primeira_rebaixa') return 'secondary';
        if (product.status === 'segunda_rebaixa') return 'destructive';
        return 'outline';
    };

    const getBadgeColor = () => {
        if (days < 0) return 'bg-danger-500 hover:bg-danger-600 text-white';
        if (days <= 7) return 'bg-warning-500 hover:bg-warning-600 text-white';
        if (product.status === 'segunda_rebaixa') return 'bg-danger-500 hover:bg-danger-600 text-white';
        if (product.status === 'primeira_rebaixa') return 'bg-warning-500 hover:bg-warning-600 text-white';
        return 'bg-success-600 hover:bg-success-700 text-white';
    };

    const getStatusLabel = () => {
        if (days < 0) return 'Vencido';
        if (days <= 7) return 'Vencendo';
        if (product.status === 'primeira_rebaixa') return 'R1';
        if (product.status === 'segunda_rebaixa') return 'R2';
        return 'OK';
    };

    return (
        <Card className="group hover:border-primary/50 hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                        <h3 className="font-medium text-foreground line-clamp-2 leading-snug">
                            {product.product_name}
                        </h3>

                        {!compact && (
                            <p className="text-sm text-muted-foreground truncate">
                                {product.product_brand}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <span>{formatExpiryDate(product.expiry_date)}</span>
                            <span className={cn(
                                'font-medium',
                                days < 0 && 'text-danger-600',
                                days <= 7 && days >= 0 && 'text-warning-600'
                            )}>
                                {description}
                            </span>
                            <span>• Qtd: {product.quantity}</span>
                        </div>
                    </div>

                    {/* Badge e Ações */}
                    <div className="flex items-center gap-2">
                        <Badge className={cn(getBadgeColor(), 'shrink-0')}>
                            {getStatusLabel()}
                        </Badge>

                        {!compact && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {onEdit && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                        onClick={() => onEdit(product)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                )}
                                {onDelete && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        onClick={() => onDelete(product.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
