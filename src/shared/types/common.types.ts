/**
 * Common Types
 * Tipos compartilhados e utilitários
 */

export type Size = 'sm' | 'md' | 'lg';
export type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info';

export interface PaginationParams {
    page: number;
    pageSize: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    totalPages: number;
}

export interface ApiError {
    message: string;
    code?: string;
    details?: unknown;
}

export interface ToastOptions {
    title?: string;
    description?: string;
    variant?: Variant;
    duration?: number;
}
