/**
 * useProductMutations Hook
 * Hook para criar, editar e deletar produtos
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CreateProductInput, UpdateProductInput } from '@/shared/types';
import { ProductService } from '../services';

export function useProductMutations() {
    const queryClient = useQueryClient();

    /**
     * Mutation para criar produto
     */
    const createMutation = useMutation({
        mutationFn: (input: CreateProductInput) => ProductService.createProduct(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Produto criado com sucesso!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Erro ao criar produto');
        },
    });

    /**
     * Mutation para atualizar produto
     */
    const updateMutation = useMutation({
        mutationFn: ({ id, input }: { id: string; input: UpdateProductInput }) =>
            ProductService.updateProduct(id, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Produto atualizado com sucesso!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Erro ao atualizar produto');
        },
    });

    /**
     * Mutation para deletar produto
     */
    const deleteMutation = useMutation({
        mutationFn: (id: string) => ProductService.deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Produto removido com sucesso!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Erro ao remover produto');
        },
    });

    return {
        createProduct: createMutation.mutateAsync,
        updateProduct: updateMutation.mutateAsync,
        deleteProduct: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
