/**
 * Product Types
 * Tipos centralizados para produtos
 */

export type ProductStatus = 'normal' | 'primeira_rebaixa' | 'segunda_rebaixa';

export interface Product {
    id: string;
    user_id: string;
    product_name: string;
    product_brand: string;
    barcode: string | null;
    expiry_date: string;
    quantity: number;
    status: ProductStatus;
    created_at: string;
    updated_at?: string;
}

export interface ProductFormData {
    product_name: string;
    product_brand: string;
    barcode: string;
    expiry_date: string;
    quantity: string;
    status: ProductStatus;
}

export interface CreateProductInput {
    user_id: string;
    product_name: string;
    product_brand: string;
    barcode: string | null;
    expiry_date: string;
    quantity: number;
    status: ProductStatus;
}

export interface UpdateProductInput {
    product_name?: string;
    product_brand?: string;
    barcode?: string | null;
    expiry_date?: string;
    quantity?: number;
    status?: ProductStatus;
}

export interface ProductFilters {
    search: string;
    status: string;
    session: string;
}

export interface ProductStats {
    total: number;
    vencidos: number;
    vencendo: number;
}

export interface ProductsBySession {
    [session: string]: Product[];
}

export interface OpenFoodFactsProduct {
    product_name?: string;
    quantity?: string;
    brands?: string;
    image_url?: string;
}

export interface OpenFoodFactsResponse {
    status: number;
    product?: OpenFoodFactsProduct;
}
