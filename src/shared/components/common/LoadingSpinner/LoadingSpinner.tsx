/**
 * LoadingSpinner Component
 * Spinner de loading centralizado
 */

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    text?: string;
    fullScreen?: boolean;
}

const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
};

export function LoadingSpinner({
    size = 'md',
    className,
    text,
    fullScreen = false,
}: LoadingSpinnerProps) {
    const spinner = (
        <>
            <Loader2 className={cn('animate-spin text-primary', sizeClasses[size], className)} />
            {text && (
                <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            )}
        </>
    );

    if (fullScreen) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center">
                {spinner}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-8">
            {spinner}
        </div>
    );
}
