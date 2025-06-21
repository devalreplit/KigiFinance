import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, X, Check, RotateCcw, Monitor, Smartphone, AlertTriangle } from "lucide-react";
import { BrowserMultiFormatReader, Exception } from '@zxing/library';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export default function BarcodeScanner({ isOpen, onClose, onScan }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop'>('mobile');
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  // Detectar tipo de dispositivo
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setDeviceType(isMobile ? 'mobile' : 'desktop');
  }, []);

  // Listar câmeras disponíveis
  const getCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(cameras);
      
      if (cameras.length === 0) {
        setError('Nenhuma câmera encontrada neste dispositivo.');
        return false;
      }

      // Selecionar câmera traseira por padrão em mobile
      if (deviceType === 'mobile') {
        const backCamera = cameras.find(camera => 
          camera.label.toLowerCase().includes('back') || 
          camera.label.toLowerCase().includes('traseira') ||
          camera.label.toLowerCase().includes('environment')
        );
        setSelectedCameraId(backCamera?.deviceId || cameras[0].deviceId);
      } else {
        setSelectedCameraId(cameras[0].deviceId);
      }
      
      return true;
    } catch (err) {
      console.error('Erro ao listar câmeras:', err);
      setError('Não foi possível acessar as câmeras do dispositivo.');
      return false;
    }
  };

  // Iniciar scanner
  const startScanning = async () => {
    setError(null);
    setScannedCode(null);
    
    try {
      // Verificar suporte à câmera
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError(deviceType === 'desktop' 
          ? 'Câmera não suportada neste navegador de desktop. Tente usar Chrome, Firefox ou Edge.' 
          : 'Câmera não suportada neste navegador.');
        return;
      }

      // Listar câmeras
      const hasCameras = await getCameras();
      if (!hasCameras) return;

      // Inicializar leitor de código
      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserMultiFormatReader();
      }

      const codeReader = codeReaderRef.current;
      setIsScanning(true);

      // Configurar constraints da câmera
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedCameraId ? { exact: selectedCameraId } : undefined,
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          facingMode: deviceType === 'mobile' ? 'environment' : 'user'
        }
      };

      // Iniciar stream de vídeo
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Aguardar vídeo carregar
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => resolve(true);
          }
        });

        // Iniciar decodificação contínua
        codeReader.decodeFromVideoDevice(selectedCameraId, videoRef.current, (result, err) => {
          if (result) {
            const code = result.getText();
            setScannedCode(code);
            setIsScanning(false);
            
            // Parar stream
            stream.getTracks().forEach(track => track.stop());
            codeReader.reset();
          }
          
          if (err && !(err instanceof Exception)) {
            console.error('Erro durante scan:', err);
          }
        });
      }
    } catch (err) {
      console.error('Erro no scanner:', err);
      setIsScanning(false);
      
      if (err instanceof Exception) {
        if (err.message.includes('NotAllowedError') || err.message.includes('Permission denied')) {
          setError('Permissão de câmera negada. Por favor, permita o acesso à câmera nas configurações do navegador.');
        } else if (err.message.includes('NotFoundError') || err.message.includes('No video input devices found')) {
          setError(deviceType === 'desktop' 
            ? 'Nenhuma câmera encontrada. Conecte uma webcam ao seu computador e tente novamente.' 
            : 'Nenhuma câmera encontrada neste dispositivo.');
        } else if (err.message.includes('NotReadableError') || err.message.includes('Could not start video source')) {
          setError('Câmera em uso por outro aplicativo. Feche outros apps que possam estar usando a câmera.');
        } else {
          setError('Não foi possível escanear código. Verifique se há luz suficiente e tente novamente.');
        }
      } else {
        setError('Erro inesperado ao acessar a câmera. Tente recarregar a página.');
      }
    }
  };

  // Parar scanner
  const stopScanning = () => {
    setIsScanning(false);
    
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Usar código escaneado
  const handleUseCode = () => {
    if (scannedCode) {
      onScan(scannedCode);
      handleClose();
    }
  };

  // Escanear novamente
  const handleScanAgain = () => {
    setScannedCode(null);
    setError(null);
    startScanning();
  };

  // Fechar modal
  const handleClose = () => {
    stopScanning();
    setScannedCode(null);
    setError(null);
    onClose();
  };

  // Trocar câmera
  const switchCamera = async () => {
    if (availableCameras.length > 1) {
      const currentIndex = availableCameras.findIndex(cam => cam.deviceId === selectedCameraId);
      const nextIndex = (currentIndex + 1) % availableCameras.length;
      setSelectedCameraId(availableCameras[nextIndex].deviceId);
      
      if (isScanning) {
        stopScanning();
        setTimeout(startScanning, 500);
      }
    }
  };

  // Auto-iniciar quando modal abrir
  useEffect(() => {
    if (isOpen && !isScanning && !scannedCode && !error) {
      setTimeout(startScanning, 300);
    }

    return () => {
      stopScanning();
    };
  }, [isOpen]);

  // Verificar suporte à câmera
  const isCameraSupported = navigator.mediaDevices && navigator.mediaDevices.getUserMedia;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Camera className="mr-2 h-5 w-5" />
            Scanner de Código
            <div className="ml-auto flex items-center text-xs text-muted-foreground">
              {deviceType === 'mobile' ? (
                <Smartphone className="h-4 w-4" />
              ) : (
                <Monitor className="h-4 w-4" />
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!isCameraSupported ? (
            <div className="text-center p-8">
              <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <p className="text-red-600 mb-4 font-medium">
                Câmera não suportada
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {deviceType === 'desktop' 
                  ? 'Este navegador não suporta acesso à câmera. Use Chrome, Firefox ou Edge.'
                  : 'Este dispositivo não suporta acesso à câmera.'}
              </p>
              <Button onClick={handleClose}>
                Fechar
              </Button>
            </div>
          ) : error ? (
            <div className="text-center p-6">
              <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <p className="text-red-600 mb-4 font-medium">Erro no Scanner</p>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <div className="space-x-2">
                <Button onClick={startScanning} variant="outline">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Tentar Novamente
                </Button>
                <Button onClick={handleClose}>
                  Fechar
                </Button>
              </div>
            </div>
          ) : scannedCode ? (
            <div className="text-center p-6">
              <div className="p-4 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg mb-4">
                <Check className="mx-auto h-8 w-8 mb-2" />
                <p className="font-medium">Código detectado:</p>
                <p className="text-lg font-bold mt-2 break-all">{scannedCode}</p>
              </div>
              <div className="space-x-2">
                <Button onClick={handleUseCode} className="bg-green-600 hover:bg-green-700">
                  <Check className="mr-2 h-4 w-4" />
                  Usar Este Código
                </Button>
                <Button onClick={handleScanAgain} variant="outline">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Escanear Novamente
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-4 relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600"
                  style={{ maxHeight: '300px', objectFit: 'cover' }}
                />
                
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-lg">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
                      <p className="text-sm font-medium">Procurando código...</p>
                    </div>
                  </div>
                )}

                {/* Overlay de scanning */}
                {isScanning && (
                  <div className="absolute inset-4 border-2 border-green-500 rounded-lg">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-500 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-500 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-500 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-500 rounded-br-lg"></div>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                {deviceType === 'mobile' 
                  ? 'Posicione o código dentro do quadro. Funciona com códigos de barras e QR codes.'
                  : 'Posicione o código em frente à webcam. Certifique-se que há boa iluminação.'}
              </p>
              
              <div className="space-y-2">
                <div className="flex space-x-2 justify-center">
                  {!isScanning ? (
                    <Button onClick={startScanning} className="bg-green-600 hover:bg-green-700">
                      <Camera className="mr-2 h-4 w-4" />
                      Iniciar Scanner
                    </Button>
                  ) : (
                    <Button onClick={stopScanning} variant="outline">
                      Parar Scanner
                    </Button>
                  )}
                  
                  {availableCameras.length > 1 && (
                    <Button onClick={switchCamera} variant="outline" size="sm">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <Button onClick={handleClose} variant="outline" className="w-full">
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}