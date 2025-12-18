/**
 * Product Sessions (Departamentos)
 * Atualizado: sessões unificadas sem duplicatas
 */

export const SESSIONS = [
    'Farináceos & Leites',
    'Molho & Temperos',
    'Biscoito & Matinais',
    'Laticínios & Danones',
    'Bebidas Alcoólicas',
    'Perfumaria',
    'Limpeza',
    'Bebidas Não Alcoólicas'
] as const;

export type ProductSession = typeof SESSIONS[number];

/**
 * Ícones para cada sessão
 */
export const getSessionIcon = (session: string): string => {
    const icons: Record<string, string> = {
        'Farináceos & Leites': '🌾🥛',
        'Molho & Temperos': '🌶️',
        'Biscoito & Matinais': '🍪',
        'Laticínios & Danones': '🥛',
        'Bebidas Alcoólicas': '🍷',
        'Perfumaria': '💄',
        'Limpeza': '🧹',
        'Bebidas Não Alcoólicas': '🥤'
    };

    return icons[session] || '📦';
};
