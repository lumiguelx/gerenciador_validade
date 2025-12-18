/**
 * EmptyState Component
 * Estado vazio genérico com ícone, título e ação
 */

import { ReactNode } from 'react';
import { Package2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyState({
    icon = <Package2 className="h-12 w-12" />,
    title,
    description,
    action,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 text-muted-foreground opacity-50">
                {icon}
            </div>
            <h3 className="mb-2 text-lg font-semibold">{title}</h3>
            {description && (
                <p className="mb-4 text-sm text-muted-foreground max-w-md">
                    {description}
                </p>
            )}
            {action && (
                <Button onClick={action.onClick} className="mt-2">
                    {action.label}
                </Button>
            )}
        </div>
    );
}
