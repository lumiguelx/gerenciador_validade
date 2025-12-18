import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

interface Product {
  product_brand: string;
}

interface SessionChartProps {
  products: Product[];
}

export default function SessionChart({ products }: SessionChartProps) {
  const sessionCounts = products.reduce((acc, product) => {
    const session = product.product_brand || 'Sem Sessão';
    acc[session] = (acc[session] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedSessions = Object.entries(sessionCounts)
    .sort(([, a], [, b]) => b - a);

  const total = products.length;
  const maxCount = Math.max(...Object.values(sessionCounts));

  const colors = [
    'bg-blue-500',
    'bg-indigo-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-rose-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500'
  ];

  return (
    <Card className="shadow-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      <CardHeader className="border-b border-slate-200 dark:border-slate-700">
        <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2 text-lg">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Distribuição por Sessão
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {sortedSessions.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-center py-8">Nenhum produto cadastrado</p>
        ) : (
          <div className="space-y-4">
            {sortedSessions.map(([session, count], index) => {
              const percentage = ((count / total) * 100).toFixed(1);
              const barWidth = (count / maxCount) * 100;
              
              return (
                <div key={session} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-900 dark:text-white">{session}</span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full ${colors[index % colors.length]} transition-all duration-500 rounded-full`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
