import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Package2, Save, Loader2, CheckCircle, Zap, Sparkles, Calendar, Search } from 'lucide-react';
import BarcodeScanner from '@/components/BarcodeScanner';

export default function NewProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [productFound, setProductFound] = useState(false);
  const [suggestingSession, setSuggestingSession] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [useManufactureDate, setUseManufactureDate] = useState(false);
  const [manufactureDate, setManufactureDate] = useState('');
  const [shelfLifeMonths, setShelfLifeMonths] = useState(6);
  const [quickMode, setQuickMode] = useState(false);
  const [formData, setFormData] = useState({
    product_name: '',
    product_brand: '',
    barcode: '',
    expiry_date: '',
    quantity: 1,
    status: 'normal' as 'normal' | 'primeira_rebaixa' | 'segunda_rebaixa'
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      navigate('/auth');
      return;
    }

    setUserId(session.user.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error('Erro: usuário não autenticado');
      return;
    }

    if (!formData.product_name || !formData.expiry_date || !formData.product_brand) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (formData.quantity <= 0) {
      toast.error('A quantidade deve ser maior que 0');
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('products')
      .insert([{
        user_id: userId,
        product_name: formData.product_name,
        product_brand: formData.product_brand,
        barcode: formData.barcode || null,
        expiry_date: formData.expiry_date,
        quantity: formData.quantity,
        status: formData.status
      }]);

    setLoading(false);

    if (error) {
      toast.error('Erro ao adicionar produto: ' + error.message);
    } else {
      toast.success('Produto adicionado com sucesso!');
      navigate('/');
    }
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  };

  const findClosestMatch = (word: string, dictionary: string[]): string | null => {
    const lowerWord = word.toLowerCase();
    let closestMatch = '';
    let minDistance = Infinity;

    for (const dictWord of dictionary) {
      const distance = levenshteinDistance(lowerWord, dictWord.toLowerCase());
      if (distance < minDistance && distance <= 2) {
        minDistance = distance;
        closestMatch = dictWord;
      }
    }

    return minDistance <= 2 ? closestMatch : null;
  };

  const correctSpelling = (text: string): string => {
    const corrections: Record<string, string> = {
      'coca cola': 'Coca-Cola',
      'cocacola': 'Coca-Cola',
      'coca': 'Coca-Cola',
      'coa cola': 'Coca-Cola',
      'coca-cola': 'Coca-Cola',
      'coka cola': 'Coca-Cola',
      'coca kola': 'Coca-Cola',
      'pepsi cola': 'Pepsi',
      'pepsi': 'Pepsi',
      'pepsicola': 'Pepsi',
      'guarana': 'Guaraná',
      'guarana antarctica': 'Guaraná Antarctica',
      'guaraná': 'Guaraná',
      'fanta': 'Fanta',
      'sprite': 'Sprite',
      'iorgute': 'Iogurte',
      'iogute': 'Iogurte',
      'yogurt': 'Iogurte',
      'yogurte': 'Iogurte',
      'iogurte': 'Iogurte',
      'requeijao': 'Requeijão',
      'requeijão': 'Requeijão',
      'rekejao': 'Requeijão',
      'manteiga': 'Manteiga',
      'mantega': 'Manteiga',
      'leite': 'Leite',
      'lete': 'Leite',
      'queijo': 'Queijo',
      'kejo': 'Queijo',
      'macarrao': 'Macarrão',
      'macarrão': 'Macarrão',
      'makarao': 'Macarrão',
      'feijao': 'Feijão',
      'feijão': 'Feijão',
      'fejao': 'Feijão',
      'feijaum': 'Feijão',
      'acucar': 'Açúcar',
      'açucar': 'Açúcar',
      'acúcar': 'Açúcar',
      'asucar': 'Açúcar',
      'arroz': 'Arroz',
      'arros': 'Arroz',
      'farinha': 'Farinha',
      'detergente': 'Detergente',
      'deterjente': 'Detergente',
      'deterrente': 'Detergente',
      'sabao': 'Sabão',
      'sabão': 'Sabão',
      'sabaum': 'Sabão',
      'agua sanitaria': 'Água Sanitária',
      'água sanitária': 'Água Sanitária',
      'amaciante': 'Amaciante',
      'amasiante': 'Amaciante',
      'desinfetante': 'Desinfetante',
      'shampoo': 'Shampoo',
      'xampu': 'Shampoo',
      'shampo': 'Shampoo',
      'xampoo': 'Shampoo',
      'condicionador': 'Condicionador',
      'condiscionador': 'Condicionador',
      'sabonete': 'Sabonete',
      'saboneti': 'Sabonete',
      'creme dental': 'Creme Dental',
      'pasta de dente': 'Pasta de Dente',
      'desodorante': 'Desodorante',
      'desodoranti': 'Desodorante',
    };

    let corrected = text;

    for (const [wrong, right] of Object.entries(corrections)) {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
      corrected = corrected.replace(regex, right);
    }

    const commonProducts = [
      'Coca-Cola', 'Pepsi', 'Guaraná', 'Fanta', 'Sprite',
      'Iogurte', 'Leite', 'Queijo', 'Requeijão', 'Manteiga',
      'Arroz', 'Feijão', 'Macarrão', 'Açúcar', 'Farinha',
      'Detergente', 'Sabão', 'Amaciante', 'Desinfetante',
      'Shampoo', 'Condicionador', 'Sabonete', 'Desodorante',
      'Biscoito', 'Bolacha', 'Chocolate', 'Sorvete',
      'Cerveja', 'Vinho', 'Suco', 'Água',
      'Pizza', 'Lasanha', 'Hambúrguer', 'Nugget'
    ];

    const words = corrected.split(' ');
    const correctedWords = words.map(word => {
      if (word.length <= 2 || /^\d+/.test(word)) {
        return word;
      }

      const match = findClosestMatch(word, commonProducts);
      return match || word;
    });

    corrected = correctedWords.join(' ');

    corrected = corrected.replace(/\b(\w+)\b/g, (word) => {
      const lower = word.toLowerCase();
      if (['de', 'da', 'do', 'e', 'a', 'o', 'em', 'com'].includes(lower)) {
        return lower;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });

    return corrected;
  };

  const calculateExpiryDate = (mfgDate: string, months: number): string => {
    const date = new Date(mfgDate);
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
  };

  const handleManufactureDateChange = (date: string) => {
    setManufactureDate(date);
    if (date && shelfLifeMonths) {
      const expiryDate = calculateExpiryDate(date, shelfLifeMonths);
      setFormData(prev => ({ ...prev, expiry_date: expiryDate }));
      toast.success(`Validade calculada: ${new Date(expiryDate).toLocaleDateString('pt-BR')}`);
    }
  };

  const handleShelfLifeChange = (months: number) => {
    setShelfLifeMonths(months);
    if (manufactureDate && months) {
      const expiryDate = calculateExpiryDate(manufactureDate, months);
      setFormData(prev => ({ ...prev, expiry_date: expiryDate }));
      toast.success(`Validade calculada: ${new Date(expiryDate).toLocaleDateString('pt-BR')}`);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const suggestSessionLocal = (productName: string) => {
    const name = productName.toLowerCase();

    const rules = {
      'Farináceos & Leites': ['arroz', 'feijão', 'macarrão', 'massa', 'farinha', 'trigo', 'aveia', 'cereal', 'grão', 'leite'],
      'Molho & Temperos': ['molho', 'ketchup', 'mostarda', 'maionese', 'tempero', 'sal', 'pimenta', 'vinagre', 'azeite', 'óleo'],
      'Biscoito & Matinais': ['biscoito', 'bolacha', 'pão', 'torrada', 'cereal matinal', 'granola', 'barra de cereal'],
      'Laticínios & Danones': ['iogurte', 'queijo', 'requeijão', 'manteiga', 'margarina', 'creme de leite', 'nata', 'danone'],
      'Ilha': ['chocolate', 'bala', 'chiclete', 'doce', 'bombom', 'pirulito', 'snack', 'salgadinho'],
      'Congelados': ['congelado', 'sorvete', 'pizza', 'lasanha', 'nugget', 'hambúrguer', 'batata frita'],
      'Bebidas': ['refrigerante', 'suco', 'água', 'cerveja', 'vinho', 'energético', 'chá', 'café', 'coca', 'pepsi', 'guaraná', 'fanta'],
      'Perfumaria': ['shampoo', 'condicionador', 'sabonete', 'creme', 'desodorante', 'perfume', 'pasta de dente', 'escova'],
      'Limpeza': ['detergente', 'sabão', 'amaciante', 'desinfetante', 'água sanitária', 'limpa', 'esponja', 'pano']
    };

    let suggestion = '';
    let maxMatches = 0;

    for (const [category, keywords] of Object.entries(rules)) {
      const matches = keywords.filter(keyword => name.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        suggestion = category;
      }
    }

    return suggestion;
  };

  const suggestSession = async () => {
    if (!formData.product_name) {
      toast.error('Digite o nome do produto primeiro');
      return;
    }

    setSuggestingSession(true);
    toast.info('IA analisando produto...');

    try {
      const { data, error } = await supabase.functions.invoke('suggest-session', {
        body: { productName: formData.product_name }
      });

      if (!error && data?.suggestion) {
        handleChange('product_brand', data.suggestion);
        toast.success(`IA sugeriu: ${data.suggestion}`);
        setSuggestingSession(false);
        return;
      }
    } catch (error) {
      console.log('Groq API não disponível, usando IA local');
    }

    setTimeout(() => {
      const suggestion = suggestSessionLocal(formData.product_name);

      if (suggestion) {
        handleChange('product_brand', suggestion);
        toast.success(`Sugestão: ${suggestion}`);
      } else {
        toast.warning('Não foi possível sugerir. Selecione manualmente.');
      }
      setSuggestingSession(false);
    }, 500);
  };

  const handleBarcodeDetected = async (detectedBarcode: string) => {
    handleChange('barcode', detectedBarcode);
    setSearching(true);
    setProductFound(false);
    toast.info('Buscando informações do produto...');

    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${detectedBarcode}.json`);
      const data = await response.json();

      if (data.status === 1 && data.product) {
        const product = data.product;

        let productName = product.product_name || '';

        if (product.quantity) {
          productName += ` ${product.quantity}`;
        }

        if (productName) {
          handleChange('product_name', productName);
        }

        setProductFound(true);
        toast.success('Produto encontrado! Nome preenchido automaticamente');
      } else {
        setProductFound(false);
        toast.warning('Produto não encontrado na base de dados. Preencha manualmente.');
      }
    } catch (error) {
      setProductFound(false);
      toast.error('Erro ao buscar produto. Preencha manualmente.');
    } finally {
      setSearching(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="container mx-auto px-6 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <CardHeader className="border-b border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 flex items-center justify-center">
                  <img src="/jojo_fav.png" alt="Jojo" className="w-10 h-10" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">Novo Produto</CardTitle>
                  <CardDescription className="text-purple-200/60 mt-1">Cadastre um novo produto no sistema</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Toggle Modo Rápido */}
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-xl border border-purple-200 dark:border-purple-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 dark:bg-purple-800/50 p-2 rounded-lg">
                      <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-purple-800 dark:text-purple-200">Modo Rápido</h3>
                      <p className="text-sm text-purple-600/70 dark:text-purple-400/70">Apenas 3 campos essenciais</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setQuickMode(!quickMode)}
                    className={quickMode
                      ? 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white'
                      : 'bg-purple-100 dark:bg-purple-800/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-800/50'
                    }
                  >
                    {quickMode ? 'Ativado' : 'Desativado'}
                  </Button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {!quickMode && (
                  <div className="space-y-2">
                    <Label htmlFor="product_name" className="text-purple-100 font-medium">
                      Nome do Produto <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="product_name"
                      placeholder="Ex: coca cola 2l"
                      value={formData.product_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, product_name: e.target.value }))}
                      onBlur={(e) => {
                        const corrected = correctSpelling(e.target.value);
                        if (corrected !== e.target.value) {
                          setFormData(prev => ({ ...prev, product_name: corrected }));
                          toast.success('Nome corrigido automaticamente');
                        }
                      }}
                      required
                      disabled={loading}
                      className="bg-black/20 border-white/10 text-white placeholder:text-white/30 focus:border-purple-500/50 focus:ring-purple-500/20"
                    />
                    <p className="text-xs text-purple-300/50 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Correção automática ao sair do campo
                    </p>
                  </div>
                )}

                {quickMode && (
                  <div className="space-y-4 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                    <div className="text-center mb-4">
                      <div className="flex items-center justify-center gap-2 text-purple-300">
                        <Zap className="w-5 h-5" />
                        <h3 className="font-semibold">Modo Rápido Ativado</h3>
                      </div>
                      <p className="text-sm text-purple-200/60">Escaneie o código e preencha validade e quantidade</p>
                    </div>
                  </div>
                )}

                {/* Código de Barras */}
                <div className="space-y-2">
                  <Label htmlFor="barcode" className="text-purple-100 font-medium">
                    Código de Barras {quickMode && <span className="text-rose-500">*</span>}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="barcode"
                      placeholder="Escaneie ou digite"
                      value={formData.barcode}
                      onChange={(e) => handleChange('barcode', e.target.value)}
                      disabled={loading}
                      required={quickMode}
                      className="bg-black/20 border-white/10 text-white placeholder:text-white/30 focus:border-purple-500/50 focus:ring-purple-500/20"
                    />
                    <Button
                      type="button"
                      onClick={() => formData.barcode && handleBarcodeDetected(formData.barcode)}
                      disabled={!formData.barcode || loading || searching}
                      variant="outline"
                      className="border-white/10 bg-white/5 text-purple-200 hover:bg-white/10 hover:text-white min-w-[100px]"
                    >
                      {searching ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Buscando
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Buscar
                        </>
                      )}
                    </Button>
                  </div>
                  <BarcodeScanner onBarcodeDetected={handleBarcodeDetected} />
                  {productFound && (
                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                      <CheckCircle className="w-4 h-4" />
                      Produto encontrado no Open Food Facts
                    </div>
                  )}
                </div>

                {!quickMode && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="product_brand" className="text-purple-100 font-medium">
                        Sessão <span className="text-rose-500">*</span>
                      </Label>
                      <Button
                        type="button"
                        onClick={suggestSession}
                        disabled={!formData.product_name || loading || suggestingSession}
                        variant="outline"
                        size="sm"
                        className="border-violet-500/30 text-violet-300 hover:bg-violet-500/20 hover:text-violet-200"
                      >
                        {suggestingSession ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            IA Sugerindo...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 mr-1" />
                            Sugerir com IA
                          </>
                        )}
                      </Button>
                    </div>
                    <Select
                      value={formData.product_brand}
                      onValueChange={(value) => handleChange('product_brand', value)}
                      disabled={loading}
                    >
                      <SelectTrigger className="bg-black/20 border-white/10 text-white focus:ring-purple-500/50">
                        <SelectValue placeholder="Selecione a sessão" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a103c] border-purple-500/20 text-white">
                        <SelectItem value="Farináceos & Leites">Farináceos & Leites</SelectItem>
                        <SelectItem value="Molho & Temperos">Molho & Temperos</SelectItem>
                        <SelectItem value="Biscoito & Matinais">Biscoito & Matinais</SelectItem>
                        <SelectItem value="Laticínios & Danones">Laticínios & Danones</SelectItem>
                        <SelectItem value="Ilha">Ilha</SelectItem>
                        <SelectItem value="Congelados">Congelados</SelectItem>
                        <SelectItem value="Bebidas">Bebidas</SelectItem>
                        <SelectItem value="Perfumaria">Perfumaria</SelectItem>
                        <SelectItem value="Limpeza">Limpeza</SelectItem>
                        <SelectItem value="Frente de Caixa">Frente de Caixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Data de Validade */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="expiry_date" className="text-purple-100 font-medium">
                      Data de Validade <span className="text-rose-500">*</span>
                    </Label>
                    <Button
                      type="button"
                      onClick={() => setUseManufactureDate(!useManufactureDate)}
                      variant="outline"
                      size="sm"
                      className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20 hover:text-purple-200"
                    >
                      <Calendar className="w-3 h-3 mr-1" />
                      {useManufactureDate ? 'Modo Manual' : 'Calcular por Fabricação'}
                    </Button>
                  </div>

                  {useManufactureDate ? (
                    <div className="space-y-3 p-4 bg-violet-500/10 rounded-xl border border-violet-500/20">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="manufacture_date" className="text-sm text-purple-200">
                            Data de Fabricação
                          </Label>
                          <Input
                            id="manufacture_date"
                            type="date"
                            value={manufactureDate}
                            onChange={(e) => handleManufactureDateChange(e.target.value)}
                            className="bg-black/20 border-white/10 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
                          />
                        </div>
                        <div>
                          <Label htmlFor="shelf_life" className="text-sm text-purple-200">
                            Validade (meses)
                          </Label>
                          <Input
                            id="shelf_life"
                            type="number"
                            min="1"
                            max="60"
                            value={shelfLifeMonths}
                            onChange={(e) => handleShelfLifeChange(parseInt(e.target.value))}
                            className="bg-black/20 border-white/10 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
                          />
                        </div>
                      </div>
                      {formData.expiry_date && (
                        <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                          <CheckCircle className="w-4 h-4" />
                          Validade calculada: {new Date(formData.expiry_date).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Input
                      id="expiry_date"
                      type="date"
                      value={formData.expiry_date}
                      onChange={(e) => handleChange('expiry_date', e.target.value)}
                      required
                      disabled={loading}
                      className="bg-black/20 border-white/10 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-purple-100 font-medium">
                    Quantidade <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val > 0 || e.target.value === '') {
                        handleChange('quantity', val || 1);
                      }
                    }}
                    required
                    disabled={loading}
                    className="bg-black/20 border-white/10 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-purple-100 font-medium">
                    Status <span className="text-rose-500">*</span>
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange('status', value)}
                    disabled={loading}
                  >
                    <SelectTrigger className="bg-black/20 border-white/10 text-white focus:ring-purple-500/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a103c] border-purple-500/20 text-white">
                      <SelectItem value="normal">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-emerald-500" />
                          Normal
                        </div>
                      </SelectItem>
                      <SelectItem value="primeira_rebaixa">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-amber-500" />
                          Rebaixa 1
                        </div>
                      </SelectItem>
                      <SelectItem value="segunda_rebaixa">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-orange-500" />
                          Rebaixa 2
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="flex-1 border-white/10 bg-white/5 text-purple-200 hover:bg-white/10 hover:text-white"
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg shadow-purple-500/25"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Produto
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
