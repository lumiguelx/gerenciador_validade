/**
 * BarcodeScanner Component  
 * Scanner de código de barras com integração Open Food Facts
 */

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, X, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { OpenFoodFactsService } from '../../services';

interface BarcodeScannerProps {
    onBarcodeDetected: (barcode: string) => void;
    onProductFound?: (productInfo: { name: string; brand: string }) => void;
}

export function BarcodeScanner({
    onBarcodeDetected,
    onProductFound,
}: BarcodeScannerProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [searching, setSearching] = useState(false);
    const [barcode, setBarcode] = useState('');
    const [productFound, setProductFound] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleBarcodeInput = async (value: string) => {
        setBarcode(value);

        // Auto-buscar quando tiver 8+ dígitos
        if (value.length >= 8) {
            await searchProduct(value);
        }
    };

    const searchProduct = async (code: string) => {
        setSearching(true);
        setProductFound(false);

        try {
            const info = await OpenFoodFactsService.getProductInfo(code);

            if (info.found) {
                setProductFound(true);
                toast.success('Produto encontrado!');
                onBarcodeDetected(code);

                if (onProductFound && info.name) {
                    onProductFound({
                        name: info.name,
                        brand: info.brand,
                    });
                }
            } else {
                toast.info('Produto não encontrado na base de dados');
                onBarcodeDetected(code);
            }
        } catch (error) {
            console.error('Error searching product:', error);
            toast.error('Erro ao buscar produto');
        } finally {
            setSearching(false);
        }
    };

    const handleManualSearch = () => {
        if (barcode.trim()) {
            searchProduct(barcode.trim());
        }
    };

    const startScanning = () => {
        setIsScanning(true);
        toast.info('Por favor, digite o código de barras manualmente');
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    };

    const stopScanning = () => {
        setIsScanning(false);
        setBarcode('');
        setProductFound(false);
    };

    if (!isScanning) {
        return (
            <Button
                type="button"
                variant="outline"
                onClick={startScanning}
                className="w-full"
            >
                <Camera className="mr-2 h-4 w-4" />
                Escanear Código de Barras
            </Button>
        );
    }

    return (
        <Card className="p-4 border-primary/50">
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                        <Camera className="h-4 w-4 text-primary" />
                        Scanner de Código
                    </h3>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={stopScanning}
                        className="h-8 w-8"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={barcode}
                        onChange={(e) => handleBarcodeInput(e.target.value)}
                        placeholder="Digite o código de barras..."
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={searching}
                    />
                    <Button
                        type="button"
                        onClick={handleManualSearch}
                        disabled={!barcode.trim() || searching}
                        size="sm"
                    >
                        {searching ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            'Buscar'
                        )}
                    </Button>
                </div>

                {productFound && (
                    <div className="flex items-center gap-2 text-success-600 text-sm">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Produto encontrado no Open Food Facts!</span>
                    </div>
                )}

                <p className="text-xs text-muted-foreground">
                    Digite o código de barras ou use um leitor externo
                </p>
            </div>
        </Card>
    );
}
