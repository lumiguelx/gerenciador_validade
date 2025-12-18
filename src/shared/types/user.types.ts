/**
 * User Types
 * Tipos centralizados para usuários e autenticação
 */

export type UserRole = 'admin' | 'user';

export interface UserProfile {
    id: string;
    email: string;
    role: UserRole;
    product_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface AuthUser {
    id: string;
    email?: string;
    created_at?: string;
}

export interface Session {
    user: AuthUser;
    access_token: string;
    refresh_token: string;
    expires_at?: number;
}

export interface SignInCredentials {
    email: string;
    password: string;
}

export interface SignUpCredentials extends SignInCredentials {
    confirmPassword?: string;
}
