/**
 * UserSelector Component
 * Seletor de usuário para admins
 */

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, User } from 'lucide-react';
import type { UserProfile } from '@/shared/types';

interface UserSelectorProps {
    users: UserProfile[];
    selectedUserId: string;
    onSelectUser: (userId: string) => void;
    totalProducts?: number;
    loading?: boolean;
}

export function UserSelector({
    users,
    selectedUserId,
    onSelectUser,
    totalProducts = 0,
    loading = false,
}: UserSelectorProps) {
    if (loading) {
        return (
            <Card className="animate-pulse">
                <CardHeader className="pb-3">
                    <div className="h-5 bg-muted rounded w-32" />
                </CardHeader>
                <CardContent>
                    <div className="h-10 bg-muted rounded" />
                </CardContent>
            </Card>
        );
    }

    if (users.length === 0) {
        return null;
    }

    return (
        <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Painel de Administração
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Select value={selectedUserId} onValueChange={onSelectUser}>
                    <SelectTrigger className="w-full max-w-md">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-primary" />
                                <span>Todos os Usuários ({totalProducts})</span>
                            </div>
                        </SelectItem>
                        {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span>
                                        {user.email} ({user.product_count || 0})
                                    </span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <p className="text-xs text-muted-foreground mt-2">
                    Selecione um usuário para visualizar seus produtos
                </p>
            </CardContent>
        </Card>
    );
}
