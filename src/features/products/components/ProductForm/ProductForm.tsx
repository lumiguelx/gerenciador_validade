/**
 * ProductForm Component
 * Formulário de produto com validação Zod e React Hook Form
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Save } from 'lucide-react';
import { productFormSchema, type ProductFormDataValidated } from '@/shared/utils';
import { SESSIONS } from '@/shared/constants';
import type { Product } from '@/shared/types';
import { useState } from 'react';

interface ProductFormProps {
    product?: Product;
    userId: string;
    onSubmit: (data: ProductFormDataValidated) => Promise<void>;
    onCancel?: () => void;
    quickMode?: boolean;
}

export function ProductForm({
    product,
    userId,
    onSubmit,
    onCancel,
    quickMode = false,
}: ProductFormProps) {
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<ProductFormDataValidated>({
        resolver: zodResolver(productFormSchema),
        defaultValues: product ? {
            product_name: product.product_name,
            product_brand: product.product_brand,
            barcode: product.barcode || undefined,
            expiry_date: product.expiry_date,
            quantity: product.quantity,
            status: product.status,
        } : {
            product_name: '',
            product_brand: '',
            barcode: '',
            expiry_date: '',
            quantity: 1,
            status: 'normal',
        },
    });

    const selectedBrand = watch('product_brand');
    const selectedStatus = watch('status');

    const handleFormSubmit = async (data: ProductFormDataValidated) => {
        try {
            setLoading(true);
            await onSubmit(data);
        } catch (error) {
            console.error('Form submit error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardContent className="p-6">
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
                    {/* Barcode */}
                    <div className="space-y-2">
                        <Label htmlFor="barcode">Código de Barras</Label>
                        <Input
                            id="barcode"
                            {...register('barcode')}
                            placeholder="Escaneie ou digite"
                            disabled={loading}
                        />
                        {errors.barcode && (
                            <p className="text-sm text-destructive">{errors.barcode.message}</p>
                        )}
                    </div>

                    {/* Product Name */}
                    {!quickMode && (
                        <div className="space-y-2">
                            <Label htmlFor="product_name">
                                Nome do Produto
                            </Label>
                            <Input
                                id="product_name"
                                {...register('product_name')}
                                placeholder="Ex: Coca Cola 2L"
                                disabled={loading}
                            />
                            {errors.product_name && (
                                <p className="text-sm text-destructive">{errors.product_name.message}</p>
                            )}
                        </div>
                    )}

                    {/* Session */}
                    <div className="space-y-2">
                        <Label htmlFor="product_brand">
                            Sessão <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={selectedBrand}
                            onValueChange={(value) => setValue('product_brand', value)}
                            disabled={loading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione a sessão" />
                            </SelectTrigger>
                            <SelectContent>
                                {SESSIONS.map((session) => (
                                    <SelectItem key={session} value={session}>
                                        {session}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.product_brand && (
                            <p className="text-sm text-destructive">{errors.product_brand.message}</p>
                        )}
                    </div>

                    {/* Expiry Date */}
                    <div className="space-y-2">
                        <Label htmlFor="expiry_date">
                            Data de Validade <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="expiry_date"
                            type="date"
                            {...register('expiry_date')}
                            disabled={loading}
                        />
                        {errors.expiry_date && (
                            <p className="text-sm text-destructive">{errors.expiry_date.message}</p>
                        )}
                    </div>

                    {/* Quantity */}
                    <div className="space-y-2">
                        <Label htmlFor="quantity">
                            Quantidade <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="quantity"
                            type="number"
                            min="1"
                            {...register('quantity', { valueAsNumber: true })}
                            placeholder="Digite a quantidade"
                            disabled={loading}
                        />
                        {errors.quantity && (
                            <p className="text-sm text-destructive">{errors.quantity.message}</p>
                        )}
                    </div>

                    {/* Status */}
                    {!quickMode && (
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={selectedStatus}
                                onValueChange={(value: any) => setValue('status', value)}
                                disabled={loading}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="primeira_rebaixa">1ª Rebaixa</SelectItem>
                                    <SelectItem value="segunda_rebaixa">2ª Rebaixa</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    {product ? 'Atualizar' : 'Salvar'}
                                </>
                            )}
                        </Button>

                        {onCancel && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
