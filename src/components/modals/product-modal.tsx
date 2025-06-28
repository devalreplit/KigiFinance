import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toastSuccess, toastError } from "@/lib/toast-utils";
import { productService } from "@/service/apiService";
import { QrCode } from "lucide-react";
import BarcodeScanner from "@/components/barcode-scanner";
import { Produto, ProdutoInput } from "../../../types";

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  product?: Produto;
  onSuccess: () => void;
}

export default function ProductModal({ open, onClose, product, onSuccess }: ProductModalProps) {
  
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: product?.nome || "",
    codigoBarras: product?.codigoBarras || "",
    unidade: product?.unidade || "un",
    classificacao: product?.classificacao || "",
  });

  useEffect(() => {
    if (product) {
      setFormData({
        nome: product.nome || "",
        codigoBarras: product.codigoBarras || "",
        unidade: product.unidade || "un",
        classificacao: product.classificacao || "",
      });
    } else {
      setFormData({
        nome: "",
        codigoBarras: "",
        unidade: "un",
        classificacao: "",
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      toastError({
        title: "Campos obrigatórios",
        description: "Nome é obrigatório",
      });
      return;
    }

    try {
      setLoading(true);

      const productData: ProdutoInput = {
        nome: formData.nome,
        codigoBarras: formData.codigoBarras || undefined,
        unidade: formData.unidade,
        classificacao: formData.classificacao,
      };

      if (product) {
        await productService.update(product.id, productData);
        toastSuccess({
          title: "Produto atualizado",
          description: "Produto atualizado com sucesso",
        });
      } else {
        await productService.create(productData);
        toastSuccess({
          title: "Produto criado",
          description: "Produto criado com sucesso",
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toastError({
        title: "Erro",
        description: product ? "Erro ao atualizar produto" : "Erro ao criar produto",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBarcodeScanned = (barcode: string) => {
    handleInputChange("codigoBarras", barcode);
    setShowScanner(false);
    toastSuccess({
      title: "Código detectado",
      description: `Código ${barcode} adicionado ao produto`,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{product ? "Editar Produto" : "Novo Produto"}</DialogTitle>
            <DialogDescription>
              {product ? "Edite as informações do produto" : "Preencha os dados do novo produto"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange("nome", e.target.value)}
                placeholder="Digite o nome do produto"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="codigoBarras">Código de Barras</Label>
              <div className="flex space-x-2">
                <Input
                  id="codigoBarras"
                  value={formData.codigoBarras}
                  onChange={(e) => handleInputChange("codigoBarras", e.target.value)}
                  placeholder="Digite ou escaneie o código"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowScanner(true)}
                  className="px-3"
                >
                  <QrCode className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unidade">Unidade *</Label>
              <Input
                id="unidade"
                value={formData.unidade}
                onChange={(e) => handleInputChange("unidade", e.target.value)}
                placeholder="Ex: kg, un, lt"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="classificacao">Classificação</Label>
              <Input
                id="classificacao"
                value={formData.classificacao}
                onChange={(e) => handleInputChange("classificacao", e.target.value)}
                placeholder="Ex: Alimentação, Limpeza, Higiene"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : (product ? "Atualizar" : "Criar")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Scanner de código de barras */}
      <BarcodeScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleBarcodeScanned}
      />
    </>
  );
}