import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  CheckSquare, 
  Trash2, 
  Edit, 
  Download,
  AlertTriangle,
  Package
} from 'lucide-react';
import { toast } from 'sonner';

interface BulkActionsProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkStatusChange: (status: string) => void;
  onBulkExport: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

export default function BulkActions({
  selectedCount,
  onBulkDelete,
  onBulkStatusChange,
  onBulkExport,
  onSelectAll,
  onClearSelection
}: BulkActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<string>('');

  const handleBulkStatusChange = () => {
    if (!bulkStatus) {
      toast.error('Selecione um status primeiro');
      return;
    }
    onBulkStatusChange(bulkStatus);
    setBulkStatus('');
    toast.success(`Status alterado para ${selectedCount} produtos`);
  };

  const handleBulkDelete = () => {
    onBulkDelete();
    setShowDeleteDialog(false);
    toast.success(`${selectedCount} produtos deletados`);
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <span className="font-medium text-emerald-900 dark:text-emerald-100">
                  {selectedCount} produto(s) selecionado(s)
                </span>
              </div>
              <Badge variant="outline" className="bg-white dark:bg-slate-800">
                <Package className="w-3 h-3 mr-1" />
                Ações em Lote
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {/* Status Change */}
              <div className="flex items-center gap-2">
                <Select value={bulkStatus} onValueChange={setBulkStatus}>
                  <SelectTrigger className="w-40 h-8 text-sm">
                    <SelectValue placeholder="Alterar status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        Normal
                      </div>
                    </SelectItem>
                    <SelectItem value="primeira_rebaixa">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        Rebaixa 1
                      </div>
                    </SelectItem>
                    <SelectItem value="segunda_rebaixa">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                        Rebaixa 2
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleBulkStatusChange}
                  disabled={!bulkStatus}
                  size="sm"
                  className="h-8"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Aplicar
                </Button>
              </div>

              {/* Export Selected */}
              <Button
                onClick={onBulkExport}
                variant="outline"
                size="sm"
                className="h-8"
              >
                <Download className="w-3 h-3 mr-1" />
                Exportar
              </Button>

              {/* Delete Selected */}
              <Button
                onClick={() => setShowDeleteDialog(true)}
                variant="outline"
                size="sm"
                className="h-8 text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Deletar
              </Button>

              {/* Clear Selection */}
              <Button
                onClick={onClearSelection}
                variant="ghost"
                size="sm"
                className="h-8"
              >
                Limpar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar <strong>{selectedCount} produto(s)</strong>? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Deletar {selectedCount} Produtos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}