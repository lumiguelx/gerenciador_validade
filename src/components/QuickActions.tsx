import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Plus, 
  Search, 
  Filter, 
  Download,
  Keyboard,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface QuickActionsProps {
  onNewProduct: () => void;
  onQuickSearch: (term: string) => void;
  onFilterExpiring: () => void;
  onExport: () => void;
  stats: {
    total: number;
    expiring: number;
    expired: number;
  };
}

export default function QuickActions({ 
  onNewProduct, 
  onQuickSearch, 
  onFilterExpiring, 
  onExport,
  stats 
}: QuickActionsProps) {
  const [showShortcuts, setShowShortcuts] = useState(false);

  const shortcuts = [
    { key: 'Ctrl + N', action: 'Novo produto' },
    { key: 'Ctrl + F', action: 'Buscar' },
    { key: 'Ctrl + E', action: 'Exportar' },
    { key: 'Esc', action: 'Limpar filtros' },
  ];

  return (
    <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-600" />
            Ações Rápidas
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <Keyboard className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <div className="text-lg font-bold text-slate-900 dark:text-white">{stats.total}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Total</div>
          </div>
          <div className="text-center p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div className="text-lg font-bold text-amber-600">{stats.expiring}</div>
            <div className="text-xs text-amber-600">Vencendo</div>
          </div>
          <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-lg font-bold text-red-600">{stats.expired}</div>
            <div className="text-xs text-red-600">Vencidos</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button
            onClick={onNewProduct}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm h-9"
          >
            <Plus className="w-4 h-4 mr-1" />
            Novo
          </Button>
          <Button
            onClick={onExport}
            variant="outline"
            className="text-sm h-9"
          >
            <Download className="w-4 h-4 mr-1" />
            Exportar
          </Button>
        </div>

        {/* Alert Actions */}
        {(stats.expiring > 0 || stats.expired > 0) && (
          <div className="space-y-2">
            {stats.expired > 0 && (
              <Button
                onClick={() => onQuickSearch('vencido')}
                variant="outline"
                className="w-full text-red-600 border-red-200 hover:bg-red-50 text-sm h-8"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Ver {stats.expired} Vencidos
              </Button>
            )}
            {stats.expiring > 0 && (
              <Button
                onClick={onFilterExpiring}
                variant="outline"
                className="w-full text-amber-600 border-amber-200 hover:bg-amber-50 text-sm h-8"
              >
                <Clock className="w-4 h-4 mr-2" />
                Ver {stats.expiring} Vencendo
              </Button>
            )}
          </div>
        )}

        {/* Keyboard Shortcuts */}
        {showShortcuts && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
              Atalhos do Teclado
            </div>
            <div className="space-y-1">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">{shortcut.action}</span>
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    {shortcut.key}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}