/**
 * Date Utilities
 * Funções para manipulação de datas de validade
 */

import { differenceInDays, format, isAfter, isBefore, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Calcula quantos dias faltam até a data de validade
 */
export function getDaysUntilExpiry(expiryDate: string): number {
    try {
        const expiry = typeof expiryDate === 'string' ? parseISO(expiryDate) : expiryDate;
        return differenceInDays(expiry, new Date());
    } catch {
        return 0;
    }
}

/**
 * Verifica se o produto está vencido
 */
export function isExpired(expiryDate: string): boolean {
    try {
        const expiry = typeof expiryDate === 'string' ? parseISO(expiryDate) : expiryDate;
        return isBefore(expiry, new Date());
    } catch {
        return false;
    }
}

/**
 * Verifica se o produto está vencendo em breve
 */
export function isExpiringSoon(expiryDate: string, days: number = 7): boolean {
    const daysUntil = getDaysUntilExpiry(expiryDate);
    return daysUntil >= 0 && daysUntil <= days;
}

/**
 * Formata data de validade para exibição
 */
export function formatExpiryDate(date: string, formatStr: string = 'dd/MM/yyyy'): string {
    try {
        const parsedDate = typeof date === 'string' ? parseISO(date) : date;
        return format(parsedDate, formatStr, { locale: ptBR });
    } catch {
        return date;
    }
}

/**
 * Formata data com hora para exibição
 */
export function formatDateTime(date: string, formatStr: string = 'dd/MM/yyyy HH:mm'): string {
    try {
        const parsedDate = typeof date === 'string' ? parseISO(date) : date;
        return format(parsedDate, formatStr, { locale: ptBR });
    } catch {
        return date;
    }
}

/**
 * Retorna texto descritivo sobre o tempo restante
 */
export function getExpiryDescription(expiryDate: string): string {
    const days = getDaysUntilExpiry(expiryDate);

    if (days < 0) {
        const absDays = Math.abs(days);
        return `Vencido há ${absDays} dia${absDays !== 1 ? 's' : ''}`;
    }

    if (days === 0) {
        return 'Vence hoje';
    }

    if (days === 1) {
        return 'Vence amanhã';
    }

    return `${days} dia${days !== 1 ? 's' : ''} restante${days !== 1 ? 's' : ''}`;
}

/**
 * Obtém a data atual no formato ISO (YYYY-MM-DD)
 */
export function getTodayISO(): string {
    return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Valida se uma string é uma data válida
 */
export function isValidDate(dateString: string): boolean {
    try {
        const date = parseISO(dateString);
        return date instanceof Date && !isNaN(date.getTime());
    } catch {
        return false;
    }
}
