/**
 * Validation Utilities
 * Schemas Zod para validação de formulários
 */

import { z } from 'zod';

/**
 * Schema para login
 */
export const loginFormSchema = z.object({
    email: z
        .string()
        .min(1, 'Email é obrigatório')
        .email('Email inválido'),
    password: z
        .string()
        .min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

/**
 * Schema para cadastro
 */
export const signUpFormSchema = z.object({
    email: z
        .string()
        .min(1, 'Email é obrigatório')
        .email('Email inválido'),
    password: z
        .string()
        .min(6, 'Senha deve ter pelo menos 6 caracteres')
        .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
        .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
        .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
});

export type SignUpFormData = z.infer<typeof signUpFormSchema>;

/**
 * Schema para produto
 */
export const productFormSchema = z.object({
    product_name: z
        .string()
        .min(1, 'Nome do produto é obrigatório')
        .max(200, 'Nome muito longo (máximo 200 caracteres)'),
    product_brand: z
        .string()
        .min(1, 'Sessão é obrigatória'),
    barcode: z
        .string()
        .optional()
        .nullable(),
    expiry_date: z
        .string()
        .min(1, 'Data de validade é obrigatória')
        .refine(date => {
            const parsed = new Date(date);
            return parsed instanceof Date && !isNaN(parsed.getTime());
        }, 'Data inválida'),
    quantity: z
        .number()
        .int('Quantidade deve ser um número inteiro')
        .min(1, 'Quantidade deve ser pelo menos 1')
        .max(9999, 'Quantidade muito alta'),
    status: z.enum(['normal', 'primeira_rebaixa', 'segunda_rebaixa']),
});

export type ProductFormDataValidated = z.infer<typeof productFormSchema>;

/**
 * Schema simplificado para modo rápido
 */
export const quickProductFormSchema = productFormSchema.extend({
    product_name: z.string().optional().default('Produto sem nome'),
});

export type QuickProductFormData = z.infer<typeof quickProductFormSchema>;

/**
 * Helper para formatar erros Zod
 */
export function formatZodError(error: z.ZodError): Record<string, string> {
    const errors: Record<string, string> = {};
    error.errors.forEach(err => {
        const path = err.path.join('.');
        errors[path] = err.message;
    });
    return errors;
}

/**
 * Valida email simples (sem Zod)
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Valida código de barras (formato EAN-13 ou similar)
 */
export function isValidBarcode(barcode: string): boolean {
    // Aceita códigos com 8, 12, 13 ou 14 dígitos
    const barcodeRegex = /^\d{8}$|^\d{12,14}$/;
    return barcodeRegex.test(barcode.trim());
}
