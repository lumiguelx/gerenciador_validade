import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  AlertTriangle, 
  Calendar,
  Package,
  Target
} from 'lucide-react';
import { differenceInDays, startOfWeek, endOfWeek } from 'date-fns';

interface Product {
  id: string;
  product_name: string;
  product_brand: string;
  expiry_date: string;
  quantity: number;
  status: string;
  created_at: string;
}

interface ProductInsightsProps {
  products: Product[];
}

export default function ProductInsights({ products }: ProductInsightsProps) {
  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);

  // Calcular estatísticas
  const byStatus = {
    normal: products.filter(p => p.status === 'normal').length,
    rebaixa1: products.filter(p => p.status === 'primeira_rebaixa').length,
    rebaixa2: products.filter(p => p.status === 'segunda_rebaixa').length,
  };

  const byExpiry = {
    expired: products.filter(p => differenceInDays(new Date(p.expiry_date), today) < 0).length,
    today: products.filter(p => differenceInDays(new Date(p.expiry_date), today) === 0).length,
    thisWeek: products.filter(p => {
      const days = differenceInDays(new Date(p.expiry_date), today);
      return days > 0 && days <= 7;
    }).length,
    thisMonth: products.filter(p => {
      const days = differenceInDays(new Date(p.expiry_date), today);
      return days > 7 && days <= 30;
    }).length,
  };

  const addedThisWeek = products.filter(p => {
    const createdDate = new Date(p.created_at);
    return createdDate >= weekStart && createdDate <= weekEnd;
  }).length;

  const criticalSession = (() => {
    const sessionExpiring = products
      .filter(p => differenceInDays(new Date(p.expiry_date), today) <= 7)
      .reduce((acc, product) => {
        const session = product.product_brand || 'Sem sessão';
        acc[session] = (acc[session] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const maxSession = Object.entries(sessionExpiring)
      .sort(([,a], [,b]) => b - a)[0];
    
    return maxSession ? { name: maxSession[0], count: maxSession[1] } : null;
  })();

  const efficiency = products.length > 0 ? Math.round((byStatus.normal / products.length) * 100) : 0;

  const getEfficiencyColor = (eff: number) => {
    if (eff >= 80) return 'text-emerald-600';
    if (eff >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getEfficiencyBg = (eff: number) => {
    if (eff >= 80) return 'bg-emerald-100 dark:bg-emerald-900/20';
    if (eff >= 60) return 'bg-amber-100 dark:bg-amber-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Resumo de Validades */}
      <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            Situação das Validades
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">Vencidos</span>
            <Badge variant="destructive" className="bg-red-600">
              {byExpiry.expired}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">Vence hoje</span>
            <Badge className="bg-orange-600">
              {byExpiry.today}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">Esta semana</span>
            <Badge className="bg-amber-600">
              {byExpiry.thisWeek}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">Este mês</span>
            <Badge variant="outline">
              {byExpiry.thisMonth}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Eficiência do Estoque */}
      <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-600" />
            Eficiência do Estoque
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`text-center p-4 rounded-lg ${getEfficiencyBg(efficiency)}`}>
            <div className={`text-2xl font-bold ${getEfficiencyColor(efficiency)}`}>
              {efficiency}%
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Produtos em condição normal
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Normal</span>
              <span className="font-medium">{byStatus.normal}</span>
            </div>
            <Progress 
              value={products.length > 0 ? (byStatus.normal / products.length) * 100 : 0} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Alertas e Ações */}
      <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-emerald-600" />
            Alertas Importantes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {byExpiry.expired > 0 && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium text-sm">
                  {byExpiry.expired} produtos vencidos
                </span>
              </div>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                Ação necessária imediatamente
              </p>
            </div>
          )}

          {criticalSession && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <Package className="w-4 h-4" />
                <span className="font-medium text-sm">
                  Sessão crítica: {criticalSession.name}
                </span>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                {criticalSession.count} produtos vencendo
              </p>
            </div>
          )}

          {addedThisWeek > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium text-sm">
                  {addedThisWeek} produtos adicionados
                </span>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Nesta semana
              </p>
            </div>
          )}

          {byExpiry.expired === 0 && byExpiry.today === 0 && byExpiry.thisWeek === 0 && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <Target className="w-4 h-4" />
                <span className="font-medium text-sm">
                  Estoque em boa condição
                </span>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                Nenhum produto crítico
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}