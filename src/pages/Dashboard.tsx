import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Package2, Plus, LogOut, Trash2, PackageOpen, Pencil, 
  AlertTriangle, FileText, Search, X, ArrowUpDown, Loader2, 
  Shield, Users, User, Clock,
  Filter, Download, CheckSquare, ChevronLeft, ChevronRight
} from 'lucide-react';

import SmartSearch from '@/components/SmartSearch';
import BulkActions from '@/components/BulkActions';
import ProductInsights from '@/components/ProductInsights';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import EditProductDialog from '@/components/EditProductDialog';
import SessionChart from '@/components/SessionChart';

interface Product {
  id: string;
  product_name: string;
  product_brand: string;
  barcode: string | null;
  expiry_date: string;
  quantity: number;
  status: 'normal' | 'primeira_rebaixa' | 'segunda_rebaixa';
  created_at: string;
  user_id?: string;
  user_email?: string;
}

interface UserProfile {
  id: string;
  email: string;
  role: string;
  product_count?: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sessionFilter, setSessionFilter] = useState<string>('all');
  const [daysFilter, setDaysFilter] = useState<string>('all');

  const [sortField, setSortField] = useState<'name' | 'date' | 'quantity'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [exportingPDF, setExportingPDF] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [exportModalOpen, setExportModalOpen] = useState(false);
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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

  useEffect(() => {
    checkAuth();

    const handleOnline = () => {
      toast.success('Conectado - Sincronizando dados');
      if (isAdmin) {
        loadProducts(selectedUserId);
      } else {
        loadProducts('mine');
      }
    };

    const handleOffline = () => {
      toast.warning('Modo offline - Dados salvos localmente');
    };

    const handleKeyboard = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        navigate('/novo-produto');
      }
      if (e.key === 'Escape' && (searchTerm || sessionFilter !== 'all' || daysFilter !== 'all')) {
        setSearchTerm('');
        setSessionFilter('all');
        setDaysFilter('all');
        toast.info('Filtros limpos');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('keydown', handleKeyboard);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('keydown', handleKeyboard);
    };
  }, [searchTerm, sessionFilter, daysFilter, navigate]);

  // Removed notification system as requested

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/auth');
      return;
    }

    setUserId(session.user.id);
    await checkAdminStatus(session.user.id);
    // loadProducts será chamado pelo useEffect quando isAdmin for definido

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  };

  const checkAdminStatus = async (uid: string) => {
    try {
      const { data, error } = await (supabase
        .from('user_profiles' as any)
        .select('role')
        .eq('id', uid)
        .single() as any);
      
      if (error) return;
      
      if (data?.role === 'admin') {
        setIsAdmin(true);
        setSelectedUserId('all'); // Admin vê todos os produtos por padrão
        await loadAllUsers();
      } else {
        setSelectedUserId('mine'); // Usuário normal vê apenas seus produtos
      }
    } catch (err) {
      console.error('Error checking admin status:', err);
    }
  };

  const loadAllUsers = async () => {
    try {
      const { data, error } = await (supabase.rpc as any)('get_users_with_products');
      
      if (!error && data) {
        setAllUsers(data.map((u: any) => ({
          id: u.id,
          email: u.email || 'Sem email',
          role: 'user',
          product_count: u.product_count,
        })));
      }
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const loadProducts = async (targetUserId?: string) => {
    setLoading(true);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('products')
        .select('*')
        .order('expiry_date', { ascending: true });

      // Aplicar filtro baseado na seleção do admin
      if (isAdmin && targetUserId) {
        if (targetUserId === 'mine') {
          // Admin vendo apenas seus produtos
          query = query.eq('user_id', session.user.id);
        } else if (targetUserId === 'all') {
          // Admin vendo todos os produtos - não aplicar filtro de user_id
          // query permanece sem filtro de usuário
        } else {
          // Admin vendo produtos de um usuário específico
          query = query.eq('user_id', targetUserId);
        }
      } else {
        // Usuário normal vendo apenas seus produtos
        query = query.eq('user_id', session.user.id);
      }

      const { data, error } = await query;

      if (error) {
        toast.error('Erro ao carregar produtos: ' + error.message);
      } else {
        let productsWithEmail = (data || []) as Product[];
        
        if (isAdmin && allUsers.length > 0) {
          productsWithEmail = productsWithEmail.map(p => ({
            ...p,
            user_email: allUsers.find(u => u.id === p.user_id)?.email || 'Desconhecido'
          }));
        }
        
        setProducts(productsWithEmail);
        setFilteredProducts(productsWithEmail);
      }
    } catch (err) {
      console.error('Error loading products:', err);
      toast.error('Erro ao carregar produtos');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      loadProducts(selectedUserId);
    } else if (userId) {
      // Para usuários normais, carregar apenas seus produtos
      loadProducts('mine');
    }
  }, [selectedUserId, isAdmin, userId]);

  useEffect(() => {
    let filtered = [...products];

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por sessão
    if (sessionFilter !== 'all') {
      filtered = filtered.filter(p => p.product_brand === sessionFilter);
    }

    // Filtro por dias
    if (daysFilter !== 'all') {
      filtered = filtered.filter(p => {
        const days = getDaysUntilExpiry(p.expiry_date);
        
        switch (daysFilter) {
          case 'expired':
            return days < 0;
          case '0':
            return days === 0;
          case '7':
            return days >= 0 && days <= 7;
          case '15':
            return days >= 0 && days <= 15;
          case '30':
            return days >= 0 && days <= 30;
          default:
            return true;
        }
      });
    }

    // Ordenação
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'name') {
        comparison = a.product_name.localeCompare(b.product_name);
      } else if (sortField === 'date') {
        comparison = new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
      } else if (sortField === 'quantity') {
        comparison = a.quantity - b.quantity;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredProducts(filtered);
  }, [searchTerm, sessionFilter, daysFilter, products, sortField, sortOrder]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logout realizado com sucesso');
    navigate('/auth');
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erro ao deletar produto: ' + error.message);
    } else {
      toast.success('Produto deletado com sucesso');
      // Atualizar apenas a lista local sem recarregar tudo
      setProducts(prev => prev.filter(p => p.id !== id));
      setSelectedProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };



  const handleSort = (field: 'name' | 'date' | 'quantity') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setEditDialogOpen(true);
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    return differenceInDays(new Date(expiryDate), new Date());
  };

  const isExpiringSoon = (expiryDate: string) => {
    const days = getDaysUntilExpiry(expiryDate);
    return days <= 7 && days >= 0;
  };

  const isExpired = (expiryDate: string) => {
    return getDaysUntilExpiry(expiryDate) < 0;
  };

  const expiringProducts = products.filter(p => isExpiringSoon(p.expiry_date));
  const expiredProducts = products.filter(p => isExpired(p.expiry_date));

  const handleSelectProduct = (productId: string, checked: boolean) => {
    const newSelected = new Set(selectedProducts);
    if (checked) {
      newSelected.add(productId);
    } else {
      newSelected.delete(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(new Set(paginatedProducts.map(p => p.id)));
    } else {
      setSelectedProducts(new Set());
    }
  };

  // Calcular produtos paginados
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset página quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sessionFilter, daysFilter]);

  const handleBulkDelete = async () => {
    const selectedIds = Array.from(selectedProducts);
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', selectedIds);

      if (error) {
        toast.error('Erro ao deletar produtos: ' + error.message);
      } else {
        toast.success(`${selectedIds.length} produtos deletados com sucesso`);
        // Atualizar apenas a lista local
        setProducts(prev => prev.filter(p => !selectedIds.includes(p.id)));
        setSelectedProducts(new Set());
      }
    } catch (err) {
      toast.error('Erro ao deletar produtos');
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    const selectedIds = Array.from(selectedProducts);
    
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: newStatus })
        .in('id', selectedIds);

      if (error) {
        toast.error('Erro ao atualizar status: ' + error.message);
      } else {
        toast.success(`Status atualizado para ${selectedIds.length} produtos`);
        // Atualizar apenas a lista local
        setProducts(prev => prev.map(p => 
          selectedIds.includes(p.id) ? { ...p, status: newStatus as any } : p
        ));
        setSelectedProducts(new Set());
      }
    } catch (err) {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleExportPDF = async (exportType: 'all' | 'session' | 'selected') => {
    setExportingPDF(true);
    
    try {
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      
      let productsToExport: Product[] = [];
      let title = 'Relatório de Validades';
      
      switch (exportType) {
        case 'all':
          productsToExport = products;
          title = 'Relatório Completo';
          break;
        case 'session':
          if (sessionFilter === 'all') {
            toast.error('Selecione uma sessão primeiro');
            setExportingPDF(false);
            return;
          }
          productsToExport = products.filter(p => p.product_brand === sessionFilter);
          title = `Relatório - ${sessionFilter}`;
          break;
        case 'selected':
          if (selectedProducts.size === 0) {
            toast.error('Selecione pelo menos um produto');
            setExportingPDF(false);
            return;
          }
          productsToExport = products.filter(p => selectedProducts.has(p.id));
          title = `Relatório - ${selectedProducts.size} Produtos Selecionados`;
          break;
      }
      
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 105, 15, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }), 105, 22, { align: 'center' });
      
      // Filtros aplicados
      let filterText = '';
      if (sessionFilter !== 'all') filterText += `Sessão: ${sessionFilter} | `;
      if (daysFilter !== 'all') {
        const daysLabels: Record<string, string> = {
          'expired': 'Vencidos',
          '0': 'Vence hoje',
          '7': 'Vence em 7 dias',
          '15': 'Vence em 15 dias',
          '30': 'Vence em 30 dias'
        };
        filterText += `Filtro: ${daysLabels[daysFilter]} | `;
      }
      if (isAdmin && selectedUserId !== 'mine') {
        const userName = selectedUserId === 'all' ? 'Todos usuários' : allUsers.find(u => u.id === selectedUserId)?.email || '';
        filterText += `Usuário: ${userName}`;
      }
      
      if (filterText) {
        doc.setFontSize(9);
        doc.text(filterText, 14, 28);
      }
      
      // Resumo
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumo:', 14, filterText ? 36 : 32);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      
      const stats = {
        total: productsToExport.length,
        normal: productsToExport.filter(p => p.status === 'normal').length,
        primeira: productsToExport.filter(p => p.status === 'primeira_rebaixa').length,
        segunda: productsToExport.filter(p => p.status === 'segunda_rebaixa').length
      };
      
      doc.text(`Total: ${stats.total} | Normal: ${stats.normal} | Rebaixa 1: ${stats.primeira} | Rebaixa 2: ${stats.segunda}`, 14, filterText ? 42 : 38);
      
      const exportedExpired = productsToExport.filter(p => isExpired(p.expiry_date)).length;
      const exportedExpiring = productsToExport.filter(p => isExpiringSoon(p.expiry_date) && !isExpired(p.expiry_date)).length;
      
      if (exportedExpired > 0 || exportedExpiring > 0) {
        doc.setFont('helvetica', 'bold');
        doc.text(`Alertas: ${exportedExpired} vencido(s), ${exportedExpiring} vencendo em 7 dias`, 14, filterText ? 48 : 44);
      }
      
      // Tabela
      const tableData = productsToExport.map(p => {
        const days = getDaysUntilExpiry(p.expiry_date);
        const expired = isExpired(p.expiry_date);
        return [
          p.product_name,
          p.product_brand || '-',
          format(new Date(p.expiry_date), 'dd/MM/yyyy'),
          expired ? 'VENCIDO' : days.toString(),
          p.quantity.toString(),
          p.status === 'normal' ? 'Normal' : p.status === 'primeira_rebaixa' ? 'Rebaixa 1' : 'Rebaixa 2'
        ];
      });
      
      autoTable(doc, {
        startY: filterText ? 54 : 50,
        head: [['Produto', 'Sessão', 'Validade', 'Dias', 'Qtd', 'Status']],
        body: tableData,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 35 },
          2: { cellWidth: 25 },
          3: { cellWidth: 18 },
          4: { cellWidth: 15 },
          5: { cellWidth: 27 }
        }
      });
      
      // Nome do arquivo
      const fileName = exportType === 'session' && sessionFilter !== 'all'
        ? `validades-${sessionFilter.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'dd-MM-yyyy')}.pdf`
        : `validades-${exportType}-${format(new Date(), 'dd-MM-yyyy')}.pdf`;
      
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = fileName;
      link.click();
      
      toast.success(`PDF gerado com sucesso: ${productsToExport.length} produtos`);
      setExportModalOpen(false);
    } catch (error) {
      toast.error('Erro ao gerar PDF');
    } finally {
      setExportingPDF(false);
    }
  };

  const getStatusBadge = (status: Product['status'], daysUntilExpiry: number) => {
    if (daysUntilExpiry === 0) {
      return <Badge className="bg-rose-600 text-white border-0 font-medium px-3 py-1">Último dia</Badge>;
    }
    
    const styles = {
      normal: 'bg-emerald-600 text-white border-0 font-medium px-3 py-1',
      primeira_rebaixa: 'bg-amber-500 text-white border-0 font-medium px-3 py-1',
      segunda_rebaixa: 'bg-orange-600 text-white border-0 font-medium px-3 py-1'
    };

    const labels = {
      normal: 'Normal',
      primeira_rebaixa: 'Rebaixa 1',
      segunda_rebaixa: 'Rebaixa 2'
    };

    return <Badge className={styles[status]}>{labels[status]}</Badge>;
  };

  const stats = {
    total: products.length,
    normal: products.filter(p => p.status === 'normal').length,
    primeira: products.filter(p => p.status === 'primeira_rebaixa').length,
    segunda: products.filter(p => p.status === 'segunda_rebaixa').length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg mb-4 inline-block">
            <img src="/yama-favicon.svg" alt="YAMA" className="w-12 h-12 animate-pulse" />
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
      {/* Clean White Sidebar - Hidden on mobile, drawer on mobile */}
      <div className="print:hidden hidden lg:flex w-64 clean-sidebar shadow-sm flex-col">
        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center">
              <img src="/yama-favicon.svg" alt="YAMA" className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Bobo Validades</h1>
            </div>
          </div>
        </div>

        {/* Admin Panel in Sidebar */}
        {isAdmin && allUsers.length > 0 && (
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <div className="text-gray-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
              <Shield className="h-3 w-3" />
              Administração
            </div>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-full bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mine">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-emerald-600" />
                    <span>Meus Produtos</span>
                  </div>
                </SelectItem>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3 text-emerald-600" />
                    <span>Todos os Usuários ({allUsers.reduce((sum, user) => sum + (user.product_count || 0), 0)})</span>
                  </div>
                </SelectItem>
                {allUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      <span>{user.email} ({user.product_count || 0})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          <div className="text-gray-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
            Menu Principal
          </div>
          
          <Button
            onClick={() => navigate('/novo-produto')}
            className="w-full justify-start bg-emerald-500 hover:bg-emerald-600 text-white border-0 h-12"
          >
            <Plus className="w-5 h-5 mr-3" />
            Novo Produto
          </Button>
          
          <Button
            onClick={() => setExportModalOpen(true)}
            variant="ghost"
            className="w-full justify-start text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 h-12"
          >
            <FileText className="w-5 h-5 mr-3" />
            Exportar Relatório
          </Button>

          {/* Quick Stats */}
          <div className="mt-8">
            <div className="text-gray-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
              Estatísticas
            </div>
            <div className="space-y-3">
              <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-slate-700">
                <div className="text-gray-900 dark:text-white text-2xl font-bold">{stats.total}</div>
                <div className="text-gray-600 dark:text-slate-400 text-sm">Total de Produtos</div>
              </div>
              {expiredProducts.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <div className="text-red-600 dark:text-red-400 text-xl font-bold">{expiredProducts.length}</div>
                  <div className="text-red-500 dark:text-red-400 text-sm">Produtos Vencidos</div>
                </div>
              )}
              {expiringProducts.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <div className="text-amber-600 dark:text-amber-400 text-xl font-bold">{expiringProducts.length}</div>
                  <div className="text-amber-500 dark:text-amber-400 text-sm">Vencendo em 7 dias</div>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-700">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 h-12"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sair do Sistema
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50" 
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Drawer */}
          <div className="relative w-72 max-w-[85vw] clean-sidebar shadow-xl flex flex-col">
            {/* Mobile Header */}
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/yama-favicon.svg" alt="YAMA" className="w-8 h-8" />
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">Bobo Validades</h1>
                </div>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Admin Panel in Mobile Sidebar */}
            {isAdmin && allUsers.length > 0 && (
              <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                <div className="text-gray-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  Administração
                </div>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="w-full bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mine">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-emerald-600" />
                        <span>Meus Produtos</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-emerald-600" />
                        <span>Todos os Usuários ({allUsers.reduce((sum, user) => sum + (user.product_count || 0), 0)})</span>
                      </div>
                    </SelectItem>
                    {allUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          <span>{user.email} ({user.product_count || 0})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Mobile Navigation Menu */}
            <nav className="flex-1 p-4 space-y-2">
              <div className="text-gray-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
                Menu Principal
              </div>
              
              <Button
                onClick={() => {
                  navigate('/novo-produto');
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start bg-emerald-500 hover:bg-emerald-600 text-white border-0 h-12"
              >
                <Plus className="w-5 h-5 mr-3" />
                Novo Produto
              </Button>
              
              <Button
                onClick={() => {
                  setExportModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                variant="ghost"
                className="w-full justify-start text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 h-12"
              >
                <FileText className="w-5 h-5 mr-3" />
                Exportar Relatório
              </Button>

              {/* Mobile Quick Stats */}
              <div className="mt-6">
                <div className="text-gray-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
                  Estatísticas
                </div>
                <div className="space-y-3">
                  <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-slate-700">
                    <div className="text-gray-900 dark:text-white text-xl font-bold">{stats.total}</div>
                    <div className="text-gray-600 dark:text-slate-400 text-sm">Total de Produtos</div>
                  </div>
                  {expiredProducts.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                      <div className="text-red-600 dark:text-red-400 text-xl font-bold">{expiredProducts.length}</div>
                      <div className="text-red-500 dark:text-red-400 text-sm">Produtos Vencidos</div>
                    </div>
                  )}
                  {expiringProducts.length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                      <div className="text-amber-600 dark:text-amber-400 text-xl font-bold">{expiringProducts.length}</div>
                      <div className="text-amber-500 dark:text-amber-400 text-sm">Vencendo em 7 dias</div>
                    </div>
                  )}
                </div>
              </div>
            </nav>

            {/* Mobile Bottom Actions */}
            <div className="p-4 border-t border-gray-200 dark:border-slate-700">
              <Button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                variant="ghost"
                className="w-full justify-start text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 h-12"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sair do Sistema
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header with Menu */}
        <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-3 sm:px-4 lg:px-6 py-3 lg:py-4">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button + Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 touch-target"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center gap-2 lg:hidden">
                <img src="/yama-favicon.svg" alt="YAMA" className="w-6 h-6 sm:w-8 sm:h-8" />
                <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">Bobo Validades</h1>
              </div>
              <div className="hidden lg:block">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
                <p className="text-gray-600 dark:text-gray-400">Controle de validades e estoque</p>
              </div>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
              <div className="hidden sm:block text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <span className="hidden md:inline">{filteredProducts.length} de {products.length} produtos</span>
                <span className="md:hidden">{filteredProducts.length}/{products.length}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 touch-target"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-2 sm:p-4 lg:p-6 overflow-auto bg-gray-50 dark:bg-slate-900 mobile-container">


          {/* Search and Filters */}
          <div className="mb-6">
            <SmartSearch
              products={products}
              onSearch={setSearchTerm}
              onFilter={(type, value) => {
                if (type === 'status') {
                  if (value === 'expired') setDaysFilter('expired');
                  else if (value === '7days') setDaysFilter('7');
                } else if (type === 'session') {
                  setSessionFilter(value);
                }
              }}
              searchTerm={searchTerm}
            />
            
            {/* Active Filters Display */}
            {(sessionFilter !== 'all' || daysFilter !== 'all' || searchTerm) && (
              <div className="mt-3 flex flex-wrap gap-2 items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Filtros ativos:</span>
                {sessionFilter !== 'all' && (
                  <Badge 
                    variant="outline" 
                    className="bg-emerald-50 text-emerald-700 border-emerald-200 cursor-pointer hover:bg-emerald-100"
                    onClick={() => setSessionFilter('all')}
                  >
                    Sessão: {sessionFilter}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                )}
                {daysFilter !== 'all' && (
                  <Badge 
                    variant="outline" 
                    className="bg-amber-50 text-amber-700 border-amber-200 cursor-pointer hover:bg-amber-100"
                    onClick={() => setDaysFilter('all')}
                  >
                    Dias: {daysFilter === 'expired' ? 'Vencidos' : `${daysFilter} dias`}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                )}
                {searchTerm && (
                  <Badge 
                    variant="outline" 
                    className="bg-blue-50 text-blue-700 border-blue-200 cursor-pointer hover:bg-blue-100"
                    onClick={() => setSearchTerm('')}
                  >
                    Busca: {searchTerm}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSessionFilter('all');
                    setDaysFilter('all');
                    toast.info('Filtros limpos');
                  }}
                  className="h-7 text-xs"
                >
                  Limpar todos
                </Button>
              </div>
            )}
          </div>

          {/* Bulk Actions */}
          {selectedProducts.size > 0 && (
            <div className="mb-6">
              <BulkActions
                selectedCount={selectedProducts.size}
                onBulkDelete={handleBulkDelete}
                onBulkStatusChange={handleBulkStatusChange}
                onBulkExport={() => handleExportPDF('selected')}
                onSelectAll={() => handleSelectAll(true)}
                onClearSelection={() => setSelectedProducts(new Set())}
              />
            </div>
          )}

          {/* Product Insights */}
          <div className="mb-6">
            <ProductInsights products={products} />
          </div>

          {/* Alertas */}
          {(expiredProducts.length > 0 || expiringProducts.length > 0) && (
            <div className="mb-6 space-y-3">
              {expiredProducts.length > 0 && (
                <Alert variant="destructive" className="border-rose-500/50 bg-rose-50 dark:bg-rose-900/20">
                  <AlertTriangle className="h-5 w-5" />
                  <AlertDescription className="font-medium">
                    {expiredProducts.length} produto(s) vencido(s) - Verifique urgentemente
                  </AlertDescription>
                </Alert>
              )}
              {expiringProducts.length > 0 && (
                <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-900/20">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <AlertDescription className="text-amber-800 dark:text-amber-200 font-medium">
                    {expiringProducts.length} produto(s) vencendo nos próximos 7 dias
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Gráfico de Sessões */}
          <div className="mb-6">
            <SessionChart products={products} />
          </div>

          {/* Tabela de Produtos */}
          <Card className="border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
            <CardHeader className="border-b border-gray-200 dark:border-slate-700 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                    Produtos Cadastrados
                  </CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">
                    {filteredProducts.length} de {products.length} produtos
                    {selectedProducts.size > 0 && (
                      <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-medium">
                        • {selectedProducts.size} selecionados
                      </span>
                    )}
                    {totalPages > 1 && (
                      <span className="ml-2 text-slate-400">
                        • Página {currentPage} de {totalPages}
                      </span>
                    )}
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => navigate('/novo-produto')} 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Produto
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-emerald-100 dark:bg-emerald-800/30 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <PackageOpen className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-medium text-emerald-800 dark:text-emerald-200 mb-2">
                    {products.length === 0 ? 'Nenhum produto cadastrado' : 'Nenhum produto encontrado'}
                  </h3>
                  <p className="text-emerald-600/70 dark:text-emerald-400/70 mb-6">
                    {products.length === 0 
                      ? 'Comece adicionando seu primeiro produto' 
                      : 'Tente ajustar os filtros de busca'}
                  </p>
                  {products.length === 0 && (
                    <Button 
                      onClick={() => navigate('/novo-produto')}
                      className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Produto
                    </Button>
                  )}
                </div>
              ) : (
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-100 dark:border-slate-800/30 hover:bg-gray-50/50 dark:hover:bg-slate-900/20">
                        <TableHead className="w-12">
                          <Checkbox
                            checked={paginatedProducts.length > 0 && paginatedProducts.every(p => selectedProducts.has(p.id))}
                            onCheckedChange={handleSelectAll}
                            className="border-emerald-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                          />
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center gap-1">
                            Produto
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </TableHead>
                        <TableHead>Sessão</TableHead>
                        <TableHead 
                          className="cursor-pointer hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                          onClick={() => handleSort('date')}
                        >
                          <div className="flex items-center gap-1">
                            Validade
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </TableHead>
                        <TableHead>Dias</TableHead>
                        <TableHead 
                          className="cursor-pointer hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                          onClick={() => handleSort('quantity')}
                        >
                          <div className="flex items-center gap-1">
                            Qtd
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedProducts.map((product) => {
                        const daysUntilExpiry = getDaysUntilExpiry(product.expiry_date);
                        const expired = isExpired(product.expiry_date);
                        const expiringSoon = isExpiringSoon(product.expiry_date);
                        
                        return (
                          <TableRow 
                            key={product.id} 
                            className={`border-gray-100 dark:border-slate-800/30 transition-colors ${
                              expired 
                                ? 'bg-rose-50/50 dark:bg-rose-900/10 hover:bg-rose-100/50 dark:hover:bg-rose-900/20' 
                                : expiringSoon 
                                  ? 'bg-amber-50/50 dark:bg-amber-900/10 hover:bg-amber-100/50 dark:hover:bg-amber-900/20'
                                  : 'hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20'
                            }`}
                          >
                            <TableCell>
                              <Checkbox
                                checked={selectedProducts.has(product.id)}
                                onCheckedChange={(checked) => handleSelectProduct(product.id, checked as boolean)}
                                className="border-emerald-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                              />
                            </TableCell>
                            <TableCell className="font-medium">{product.product_name}</TableCell>
                            <TableCell className="text-muted-foreground">{product.product_brand || '-'}</TableCell>
                            <TableCell>{format(new Date(product.expiry_date), 'dd/MM/yyyy')}</TableCell>
                            <TableCell>
                              <span className={`font-medium ${
                                expired 
                                  ? 'text-rose-600 dark:text-rose-400' 
                                  : expiringSoon 
                                    ? 'text-amber-600 dark:text-amber-400' 
                                    : 'text-emerald-600 dark:text-emerald-400'
                              }`}>
                                {expired ? 'Vencido' : daysUntilExpiry}
                              </span>
                            </TableCell>
                            <TableCell>{product.quantity}</TableCell>
                            <TableCell>{getStatusBadge(product.status, daysUntilExpiry)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(product)}
                                  className="h-8 w-8 p-0 hover:bg-emerald-100 dark:hover:bg-emerald-800/30"
                                >
                                  <Pencil className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(product.id)}
                                  className="h-8 w-8 p-0 hover:bg-rose-100 dark:hover:bg-rose-800/30"
                                >
                                  <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-3 p-4">
                  {paginatedProducts.map((product) => {
                    const daysUntilExpiry = getDaysUntilExpiry(product.expiry_date);
                    const expired = isExpired(product.expiry_date);
                    const expiringSoon = isExpiringSoon(product.expiry_date);
                    
                    return (
                      <div 
                        key={product.id}
                        className={`rounded-lg border p-4 space-y-3 ${
                          expired 
                            ? 'bg-rose-50/50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800' 
                            : expiringSoon 
                              ? 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
                              : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'
                        }`}
                      >
                        {/* Header with checkbox and actions */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <Checkbox
                              checked={selectedProducts.has(product.id)}
                              onCheckedChange={(checked) => handleSelectProduct(product.id, checked as boolean)}
                              className="border-emerald-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                {product.product_name}
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {product.product_brand || 'Sem sessão'}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(product)}
                              className="h-8 w-8 p-0 hover:bg-emerald-100 dark:hover:bg-emerald-800/30"
                            >
                              <Pencil className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(product.id)}
                              className="h-8 w-8 p-0 hover:bg-rose-100 dark:hover:bg-rose-800/30"
                            >
                              <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                            </Button>
                          </div>
                        </div>

                        {/* Product details */}
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Validade</p>
                            <p className="font-medium text-gray-900 dark:text-white text-xs">
                              {format(new Date(product.expiry_date), 'dd/MM/yy')}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Dias</p>
                            <p className={`font-bold text-xs ${
                              expired 
                                ? 'text-rose-600 dark:text-rose-400' 
                                : expiringSoon 
                                  ? 'text-amber-600 dark:text-amber-400' 
                                  : 'text-emerald-600 dark:text-emerald-400'
                            }`}>
                              {expired ? 'Vencido' : daysUntilExpiry}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Qtd</p>
                            <p className="font-medium text-gray-900 dark:text-white text-xs">{product.quantity}</p>
                          </div>
                        </div>

                        {/* Status badge */}
                        <div>
                          {getStatusBadge(product.status, daysUntilExpiry)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Controles de Paginação */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 lg:px-6 py-4 border-t border-gray-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 order-2 sm:order-1">
                    <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} de {filteredProducts.length}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 order-3 sm:order-2">
                    <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}>
                      <SelectTrigger className="w-16 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 hidden sm:inline">por página</span>
                  </div>
                  
                  <div className="flex items-center gap-1 order-1 sm:order-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="h-8 w-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Modal de Exportação PDF */}
      <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
        <DialogContent className="sm:max-w-md border-emerald-200/50 dark:border-emerald-800/30 bg-white dark:bg-slate-800">
          <DialogHeader>
            <DialogTitle className="text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
              <Download className="w-5 h-5" />
              Exportar PDF
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-emerald-600/70 dark:text-emerald-400/70">
              Escolha o que deseja exportar:
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={() => handleExportPDF('all')}
                disabled={exportingPDF}
                className="w-full justify-start bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white"
              >
                <Package2 className="w-4 h-4 mr-2" />
                Todos os Produtos ({products.length})
              </Button>
              
              <Button
                onClick={() => handleExportPDF('session')}
                disabled={exportingPDF || sessionFilter === 'all'}
                variant="outline"
                className="w-full justify-start border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
              >
                <Filter className="w-4 h-4 mr-2" />
                Sessão Atual {sessionFilter !== 'all' && `(${sessionFilter})`}
              </Button>
              
              <Button
                onClick={() => handleExportPDF('selected')}
                disabled={exportingPDF || selectedProducts.size === 0}
                variant="outline"
                className="w-full justify-start border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                Produtos Selecionados ({selectedProducts.size})
              </Button>
            </div>
            
            {exportingPDF && (
              <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Gerando PDF...</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setExportModalOpen(false)}
              className="border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print View */}
      <div className="hidden print:block p-8">
        <h1 className="text-2xl font-bold mb-4">Relatório de Validades</h1>
        <p className="text-sm text-gray-600 mb-6">{format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left">Produto</th>
              <th className="border border-gray-300 p-2 text-left">Sessão</th>
              <th className="border border-gray-300 p-2 text-left">Validade</th>
              <th className="border border-gray-300 p-2 text-left">Dias</th>
              <th className="border border-gray-300 p-2 text-left">Qtd</th>
              <th className="border border-gray-300 p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => {
              const days = getDaysUntilExpiry(product.expiry_date);
              const expired = isExpired(product.expiry_date);
              return (
                <tr key={product.id}>
                  <td className="border border-gray-300 p-2">{product.product_name}</td>
                  <td className="border border-gray-300 p-2">{product.product_brand || '-'}</td>
                  <td className="border border-gray-300 p-2">{format(new Date(product.expiry_date), 'dd/MM/yyyy')}</td>
                  <td className="border border-gray-300 p-2">{expired ? 'VENCIDO' : days}</td>
                  <td className="border border-gray-300 p-2">{product.quantity}</td>
                  <td className="border border-gray-300 p-2">
                    {product.status === 'normal' ? 'Normal' : product.status === 'primeira_rebaixa' ? 'Rebaixa 1' : 'Rebaixa 2'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <EditProductDialog
        product={editProduct}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={(updatedProduct) => {
          // Atualizar apenas o produto específico na lista local
          setProducts(prev => prev.map(p => 
            p.id === updatedProduct.id ? updatedProduct : p
          ));
          setEditDialogOpen(false);
          toast.success('Produto atualizado com sucesso');
        }}
      />
    </div>
  );
}