import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, X, RefreshCw, AlertCircle, Scan } from 'lucide-react';
import { toast } from 'sonner';

interface BarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void;
}

export default function BarcodeScanner({ onBarcodeDetected }: BarcodeScannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerIdRef = useRef('barcode-scanner-' + Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        startScanning();
      }, 300);
      return () => {
        clearTimeout(timer);
        stopScanning();
      };
    }
    return () => {
      stopScanning();
    };
  }, [isOpen]);

  const startScanning = async () => {
    try {
      setError(null);
      setIsLoading(true);

      const element = document.getElementById(scannerIdRef.current);
      if (!element) {
        throw new Error('Elemento do scanner não foi encontrado. Aguarde um momento e tente novamente.');
      }

      scannerRef.current = new Html5Qrcode(scannerIdRef.current);

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.777778,
      };
      
      await scannerRef.current.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          toast.success('Código detectado!');
          onBarcodeDetected(decodedText);
          handleClose();
        },
        () => {}
      );

      setIsLoading(false);
      setIsScanning(true);
    } catch (err: any) {
      let errorMessage = 'Erro ao acessar câmera';
      
      if (err.message) {
        if (err.message.includes('Permission')) {
          errorMessage = 'Permissão negada. Clique no ícone de cadeado na barra de endereço e permita a câmera.';
        } else if (err.message.includes('NotFound')) {
          errorMessage = 'Nenhuma câmera encontrada no dispositivo.';
        } else if (err.message.includes('NotAllowed')) {
          errorMessage = 'Acesso à câmera foi bloqueado. Verifique as configurações do navegador.';
        } else if (err.message.includes('NotReadable')) {
          errorMessage = 'Câmera está sendo usada por outro aplicativo.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Erro ao parar scanner:', err);
      }
    }
    scannerRef.current = null;
    setIsScanning(false);
  };

  const handleClose = async () => {
    await stopScanning();
    setIsOpen(false);
    setError(null);
    setIsLoading(false);
  };

  return (
    <>
      <Button 
        type="button" 
        variant="outline" 
        onClick={() => setIsOpen(true)}
        className="w-full border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30"
      >
        <Camera className="w-4 h-4 mr-2" />
        Ler Código de Barras
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md border-purple-200/50 dark:border-purple-800/30 bg-white dark:bg-[#1A1625]">
          <DialogHeader>
            <DialogTitle className="text-purple-800 dark:text-purple-200 flex items-center gap-2">
              <Scan className="w-5 h-5" />
              Scanner de Código de Barras
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {error ? (
              <div className="space-y-3">
                <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-center">
                  <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                  <p className="text-rose-600 dark:text-rose-400 font-medium mb-2">{error}</p>
                  <p className="text-sm text-rose-500/80 dark:text-rose-400/80 mb-3">
                    Permita o acesso à câmera nas configurações do navegador
                  </p>
                  <Button 
                    onClick={() => {
                      setError(null);
                      startScanning();
                    }}
                    size="sm"
                    variant="outline"
                    className="border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Tentar Novamente
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground space-y-1 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="font-medium text-purple-700 dark:text-purple-300">Como permitir câmera:</p>
                  <p>1. Clique no ícone de cadeado na barra de endereço</p>
                  <p>2. Procure "Câmera" ou "Camera"</p>
                  <p>3. Selecione "Permitir"</p>
                  <p>4. Recarregue a página (F5)</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div 
                  id={scannerIdRef.current} 
                  className="rounded-xl overflow-hidden"
                  style={{ 
                    width: '100%',
                    minHeight: '300px',
                    border: '2px solid rgb(168, 85, 247)',
                    boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)'
                  }}
                />
                {isLoading && (
                  <div className="mt-3 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-full">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                        Preparando câmera...
                      </span>
                    </div>
                  </div>
                )}
                {isScanning && !isLoading && (
                  <div className="mt-3 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-full">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                        Escaneando...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
            <p className="text-sm text-purple-600/70 dark:text-purple-400/70 text-center">
              {error 
                ? 'Verifique as permissões da câmera' 
                : 'Posicione o código de barras no centro da tela'}
            </p>
            <Button
              variant="outline"
              onClick={handleClose}
              className="w-full border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30"
            >
              <X className="w-4 h-4 mr-2" />
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
