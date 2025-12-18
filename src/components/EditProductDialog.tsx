import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Save, X } from 'lucide-react';

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

interface EditProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updatedProduct: Product) => void;
}

export default function EditProductDialog({ product, open, onOpenChange, onSuccess }: EditProductDialogProps) {
  const [quantity, setQuantity] = useState(product?.quantity || 1);
  const [status, setStatus] = useState(product?.status || 'normal');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setQuantity(product.quantity);
      setStatus(product.status);
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setLoading(true);
    const { error } = await supabase
      .from('products')
      .update({
        quantity,
        status
      })
      .eq('id', product.id);

    if (error) {
      toast.error('Erro ao atualizar produto: ' + error.message);
    } else {
      const updatedProduct = { ...product, quantity, status };
      onSuccess(updatedProduct);
      onOpenChange(false);
    }
    setLoading(false);
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-blue-200/50 dark:border-blue-800/30 bg-white dark:bg-slate-800">
        <DialogHeader>
          <DialogTitle className="text-blue-800 dark:text-blue-200">Editar Produto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-blue-700 dark:text-blue-300">Produto</Label>
            <Input 
              value={product.product_name} 
              disabled 
              className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-blue-700 dark:text-blue-300">Sessão</Label>
            <Input 
              value={product.product_brand} 
              disabled 
              className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-blue-700 dark:text-blue-300">Quantidade</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              required
              className="border-blue-200 dark:border-blue-700 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-blue-700 dark:text-blue-300">Status</Label>
            <Select value={status} onValueChange={(value: any) => setStatus(value)}>
              <SelectTrigger className="border-blue-200 dark:border-blue-700 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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

          <div className="flex gap-2 justify-end pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
