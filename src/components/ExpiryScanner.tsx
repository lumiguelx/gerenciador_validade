import { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import Tesseract from 'tesseract.js';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, X } from 'lucide-react';
import { toast } from 'sonner';

interface ExpiryScannerProps {
  onDateDetected: (date: string) => void;
}

export default function ExpiryScanner({ onDateDetected }: ExpiryScannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const extractDate = (text: string): string | null => {
    // Padrões de data: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
    const datePatterns = [
      /(\d{2})[\/\-\.](\d{2})[\/\-\.](\d{4})/,
      /(\d{2})[\/\-\.](\d{2})[\/\-\.](\d{2})/,
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        const day = match[1];
        const month = match[2];
        const year = match[3].length === 2 ? `20${match[3]}` : match[3];
        return `${year}-${month}-${day}`;
      }
    }

    return null;
  };

  const captureAndScan = async () => {
    if (!webcamRef.current) return;

    setIsScanning(true);
    const imageSrc = webcamRef.current.getScreenshot();
    
    if (!imageSrc) {
      toast.error('Erro ao capturar imagem');
      setIsScanning(false);
      return;
    }

    try {
      const result = await Tesseract.recognize(imageSrc, 'por', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`Progresso: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      const detectedDate = extractDate(result.data.text);
      
      if (detectedDate) {
        toast.success('Data de validade detectada!');
        onDateDetected(detectedDate);
        setIsOpen(false);
      } else {
        toast.error('Nenhuma data encontrada. Tente novamente com melhor iluminação.');
      }
    } catch (error) {
      toast.error('Erro ao processar imagem. Tente novamente.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <>
      <Button 
        type="button" 
        variant="outline" 
        onClick={() => setIsOpen(true)}
        className="w-full"
      >
        <Calendar className="w-4 h-4 mr-2" />
        Ler Validade (OCR)
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Escanear Data de Validade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
                videoConstraints={{
                  facingMode: 'environment'
                }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Posicione a câmera sobre a data de validade com boa iluminação.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={captureAndScan}
                disabled={isScanning}
                className="flex-1"
              >
                <Calendar className="w-4 h-4 mr-2" />
                {isScanning ? 'Processando...' : 'Capturar'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
