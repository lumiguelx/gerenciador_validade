/**
 * Environment Configuration
 * Validação e export de variáveis de ambiente
 */

const getEnvVar = (key: string): string => {
    const value = import.meta.env[key];
    if (!value) {
        console.warn(`Missing environment variable: ${key}`);
        return '';
    }
    return value;
};

export const env = {
    supabase: {
        url: getEnvVar('VITE_SUPABASE_URL'),
        anonKey: getEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY'),
    },

    app: {
        name: 'Bobo Validades',
        version: '2.0.0',
        env: import.meta.env.MODE || 'development',
    },

    features: {
        enableDarkMode: true,
        enableOfflineMode: true,
        enableAnalytics: false,
    },
} as const;

export const isDevelopment = env.app.env === 'development';
export const isProduction = env.app.env === 'production';
