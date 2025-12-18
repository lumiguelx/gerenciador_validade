/**
 * Open Food Facts Service
 * Integração com a API Open Food Facts para busca de produtos
 */

import type { OpenFoodFactsResponse } from '@/shared/types';

export class OpenFoodFactsService {
    private static readonly BASE_URL = 'https://world.openfoodfacts.org/api/v0';

    /**
     * Busca produto por código de barras
     */
    static async searchByBarcode(barcode: string): Promise<OpenFoodFactsResponse | null> {
        try {
            const response = await fetch(`${this.BASE_URL}/product/${barcode}.json`);

            if (!response.ok) {
                return null;
            }

            const data: OpenFoodFactsResponse = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching from Open Food Facts:', error);
            return null;
        }
    }

    /**
     * Extrai nome do produto da resposta
     */
    static getProductName(response: OpenFoodFactsResponse): string {
        if (response.status !== 1 || !response.product) {
            return '';
        }

        let name = response.product.product_name || '';

        // Adicionar quantidade se disponível
        if (response.product.quantity) {
            name += ` ${response.product.quantity}`;
        }

        return name.trim();
    }

    /**
     * Extrai marca do produto
     */
    static getProductBrand(response: OpenFoodFactsResponse): string {
        if (response.status !== 1 || !response.product) {
            return '';
        }

        return response.product.brands || '';
    }

    /**
     * Verifica se o produto foi encontrado
     */
    static isProductFound(response: OpenFoodFactsResponse | null): boolean {
        return response !== null && response.status === 1 && !!response.product;
    }

    /**
     * Busca e retorna informações formatadas do produto
     */
    static async getProductInfo(barcode: string): Promise<{
        found: boolean;
        name: string;
        brand: string;
        imageUrl?: string;
    }> {
        const response = await this.searchByBarcode(barcode);

        if (!this.isProductFound(response)) {
            return {
                found: false,
                name: '',
                brand: '',
            };
        }

        return {
            found: true,
            name: this.getProductName(response!),
            brand: this.getProductBrand(response!),
            imageUrl: response!.product?.image_url,
        };
    }
}
