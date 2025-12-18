/**
 * PageHeader Component
 * Header reutilizável com título e ações
 */

import { ReactNode } from 'react';
import { Package2 } from 'lucide-react';

interface PageHeaderProps {
    title?: string;
    subtitle?: string;
    icon?: ReactNode;
    actions?: ReactNode;
    showLogo?: boolean;
}

export function PageHeader({
    title = 'Controle de Validades',
    subtitle,
    icon,
    actions,
    showLogo = true,
}: PageHeaderProps) {
    return (
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    {showLogo && (
                        icon || <Package2 className="h-6 w-6 text-primary" />
                    )}
                    <div className="flex flex-col">
                        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
                        {subtitle && (
                            <p className="text-sm text-muted-foreground">{subtitle}</p>
                        )}
                    </div>
                </div>

                {actions && (
                    <div className="flex items-center gap-2">
                        {actions}
                    </div>
                )}
            </div>
        </header>
    );
}
