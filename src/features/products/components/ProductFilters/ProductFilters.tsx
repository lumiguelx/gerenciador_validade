/**
 * ProductFilters Component
 * Filtros de busca, status e sessão
 */

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import type { ProductFilters as IProductFilters } from '@/shared/types';
import { SESSIONS } from '@/shared/constants';

interface ProductFiltersProps {
    filters: IProductFilters;
    onChange: (filters: IProductFilters) => void;
    onClear: () => void;
    hasActiveFilters: boolean;
}

export function ProductFilters({
    filters,
    onChange,
    onClear,
    hasActiveFilters,
}: ProductFiltersProps) {
    const updateFilter = (key: keyof IProductFilters, value: string) => {
        onChange({ ...filters, [key]: value });
    };

    return (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar produto ou código..."
                    value={filters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Session Filter */}
            <Select
                value={filters.session}
                onValueChange={(value) => updateFilter('session', value)}
            >
                <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Todas as sessões" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todas as Sessões</SelectItem>
                    {SESSIONS.map((session) => (
                        <SelectItem key={session} value={session}>
                            {session}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
                value={filters.status}
                onValueChange={(value) => updateFilter('status', value)}
            >
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="vencido">🔴 Vencidos</SelectItem>
                    <SelectItem value="vencendo">⚠️ Vencendo (7 dias)</SelectItem>
                    <SelectItem value="normal">✅ Normal</SelectItem>
                    <SelectItem value="primeira_rebaixa">🟡 Rebaixa 1</SelectItem>
                    <SelectItem value="segunda_rebaixa">🔴 Rebaixa 2</SelectItem>
                </SelectContent>
            </Select>

            {/* Clear Filters */}
            {hasActiveFilters && (
                <Button
                    variant="outline"
                    size="icon"
                    onClick={onClear}
                    className="shrink-0"
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
