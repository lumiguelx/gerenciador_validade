/**
 * useAuth Hook
 * Hook centralizado para autenticação e gerenciamento de usuário
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services';
import type { AuthUser, SignInCredentials, SignUpCredentials } from '@/shared/types';

export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);
    const navigate = useNavigate();

    /**
     * Verifica sessão e carrega usuário
     */
    const checkAuth = useCallback(async () => {
        try {
            setLoading(true);
            const session = await AuthService.getSession();

            if (!session) {
                setUser(null);
                setIsAdmin(false);
                setLoading(false);
                return null;
            }

            const currentUser = session.user as AuthUser;
            setUser(currentUser);

            // Verificar se é admin
            const adminStatus = await AuthService.isAdmin(currentUser.id);
            setIsAdmin(adminStatus);

            setLoading(false);
            return currentUser;
        } catch (error) {
            console.error('Check auth error:', error);
            setUser(null);
            setIsAdmin(false);
            setLoading(false);
            return null;
        }
    }, []);

    /**
     * Realiza login
     */
    const signIn = useCallback(async (credentials: SignInCredentials) => {
        try {
            setLoading(true);
            await AuthService.signIn(credentials);
            await checkAuth();
            navigate('/');
        } catch (error) {
            setLoading(false);
            throw error;
        }
    }, [checkAuth, navigate]);

    /**
     * Realiza cadastro
     */
    const signUp = useCallback(async (credentials: SignUpCredentials) => {
        try {
            setLoading(true);
            await AuthService.signUp(credentials);
            await checkAuth();
            navigate('/');
        } catch (error) {
            setLoading(false);
            throw error;
        }
    }, [checkAuth, navigate]);

    /**
     * Realiza logout
     */
    const signOut = useCallback(async () => {
        try {
            setLoading(true);
            await AuthService.signOut();
            setUser(null);
            setIsAdmin(false);
            navigate('/auth');
        } catch (error) {
            console.error('Sign out error:', error);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    /**
     * Verifica auth ao montar
     */
    useEffect(() => {
        if (!initialized) {
            checkAuth().then(() => {
                setInitialized(true);
            });
        }
    }, [initialized, checkAuth]);

    /**
     * Observa mudanças de autenticação
     */
    useEffect(() => {
        const { data: { subscription } } = AuthService.onAuthStateChange(async (session) => {
            if (session) {
                const currentUser = session.user as AuthUser;
                setUser(currentUser);
                const adminStatus = await AuthService.isAdmin(currentUser.id);
                setIsAdmin(adminStatus);
            } else {
                setUser(null);
                setIsAdmin(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return {
        user,
        isAdmin,
        loading,
        initialized,
        signIn,
        signUp,
        signOut,
        checkAuth,
    };
}
