import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  X, 
  Clock, 
  Package, 
  Barcode,
  Filter,
  Sparkles
} from 'lucide-react';

interface Product {
  id: string;
  product_name: string;
  product_brand: string;
  barcode: string | null;
  expiry_date: string;
  quantity: number;
  status: string;
}

interface SmartSearchProps {
  products: Product[];
  onSearch: (term: string) => void;
  onFilter: (type: string, value: string) => void;
  searchTerm: string;
}

export default function SmartSearch({ products, onSearch, onFilter, searchTerm }: SmartSearchProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Carregar buscas recentes do localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (searchTerm.length > 1) {
      generateSuggestions(searchTerm);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, products]);

  const generateSuggestions = (term: string) => {
    const lowerTerm = term.toLowerCase();
    const suggestions = new Set<string>();

    // Sugestões de nomes de produtos
    products.forEach(product => {
      if (product.product_name.toLowerCase().includes(lowerTerm)) {
        suggestions.add(product.product_name);
      }
      if (product.product_brand?.toLowerCase().includes(lowerTerm)) {
        suggestions.add(product.product_brand);
      }
      if (product.barcode?.includes(term)) {
        suggestions.add(product.barcode);
      }
    });

    setSuggestions(Array.from(suggestions).slice(0, 5));
  };

  const handleSearch = (term: string) => {
    onSearch(term);
    
    if (term && !recentSearches.includes(term)) {
      const newRecent = [term, ...recentSearches.slice(0, 4)];
      setRecentSearches(newRecent);
      localStorage.setItem('recentSearches', JSON.stringify(newRecent));
    }
    
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(searchTerm);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  // Filtros por status
  const statusFilters = [
    { 
      label: 'Vencidos', 
      value: 'expired', 
      count: products.filter(p => new Date(p.expiry_date) < new Date()).length,
      color: 'bg-red-100 text-red-700 border-red-200'
    },
    { 
      label: 'Vencendo (7d)', 
      value: '7days', 
      count: products.filter(p => {
        const days = Math.ceil((new Date(p.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return days >= 0 && days <= 7;
      }).length,
      color: 'bg-amber-100 text-amber-700 border-amber-200'
    },
    { 
      label: 'Rebaixa 1', 
      value: 'primeira_rebaixa', 
      count: products.filter(p => p.status === 'primeira_rebaixa').length,
      color: 'bg-orange-100 text-orange-700 border-orange-200'
    },
    { 
      label: 'Rebaixa 2', 
      value: 'segunda_rebaixa', 
      count: products.filter(p => p.status === 'segunda_rebaixa').length,
      color: 'bg-red-100 text-red-700 border-red-200'
    }
  ];

  // Filtros por sessão
  const sessions = [
    'Farináceos & Leites',
    'Molho & Temperos', 
    'Biscoito & Matinais',
    'Laticínios & Danones',
    'Ilha',
    'Congelados',
    'Bebidas',
    'Perfumaria',
    'Limpeza',
    'Frente de Caixa'
  ];

  const sessionFilters = sessions.map(session => ({
    label: session,
    value: session,
    count: products.filter(p => p.product_brand === session).length,
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200'
  })).filter(filter => filter.count > 0);

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          ref={inputRef}
          placeholder="Buscar produtos, códigos ou sessões..."
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSearch('')}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="w-3 h-3" />
          </Button>
        )}

        {/* Suggestions Dropdown */}
        {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
          <Card className="absolute top-full left-0 right-0 mt-1 z-50 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg">
            <CardContent className="p-2">
              {/* Recent Searches */}
              {recentSearches.length > 0 && !searchTerm && (
                <div className="mb-2">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 px-2">
                    Buscas Recentes
                  </div>
                  {recentSearches.map((recent, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(recent)}
                      className="w-full text-left px-2 py-1 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded flex items-center gap-2"
                    >
                      <Clock className="w-3 h-3 text-slate-400" />
                      {recent}
                    </button>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 px-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Sugestões
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(suggestion)}
                      className="w-full text-left px-2 py-1 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded flex items-center gap-2"
                    >
                      <Package className="w-3 h-3 text-slate-400" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Filters */}
      <div className="space-y-3">
        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            filter.count > 0 && (
              <Badge
                key={filter.value}
                variant="outline"
                className={`cursor-pointer hover:shadow-sm transition-all ${filter.color}`}
                onClick={() => onFilter('status', filter.value)}
              >
                <Filter className="w-3 h-3 mr-1" />
                {filter.label} ({filter.count})
              </Badge>
            )
          ))}
        </div>

        {/* Session Filters */}
        {sessionFilters.length > 0 && (
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Sessões:</div>
            <div className="flex flex-wrap gap-2">
            {sessionFilters.map((filter) => (
              <Badge
                key={filter.value}
                variant="outline"
                className={`cursor-pointer hover:shadow-sm transition-all ${filter.color}`}
                onClick={() => onFilter('session', filter.value)}
              >
                <Package className="w-3 h-3 mr-1" />
                {filter.label} ({filter.count})
              </Badge>
            ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}