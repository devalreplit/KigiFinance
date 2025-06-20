import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera, X } from "lucide-react";

interface BarcodeScannerProps {
  onScan: (codigo: string) => void;
}

export function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const startScanning = () => {
    setIsScanning(true);
    // Simulate barcode scanning - in a real app, you would use a camera library
    setTimeout(() => {
      const mockBarcode = "7891234567890";
      onScan(mockBarcode);
      setIsScanning(false);
      setIsOpen(false);
    }, 2000);
  };

  const stopScanning = () => {
    setIsScanning(false);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Camera className="h-4 w-4 mr-2" />
          Escanear Código
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Escanear Código de Barras</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          {!isScanning ? (
            <div className="text-center">
              <div className="w-48 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                <Camera className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Clique no botão abaixo para iniciar o escaneamento
              </p>
              <Button onClick={startScanning}>
                Iniciar Escaneamento
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-48 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4 animate-pulse">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Escaneando código de barras...
              </p>
              <Button variant="outline" onClick={stopScanning}>
                <X className="h-4 w-4 mr-2" />
                Parar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
