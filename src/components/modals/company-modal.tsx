import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { companyService } from "@/service/apiService";
import { Empresa, EmpresaInput } from "../../../types";

interface CompanyModalProps {
  open: boolean;
  onClose: () => void;
  company?: Empresa;
  onSuccess: () => void;
}

export default function CompanyModal({ open, onClose, company, onSuccess }: CompanyModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: company?.nome || "",
    cnpj: company?.cnpj || "",
    categoria: company?.categoria || "",
  });

  useEffect(() => {
    if (company) {
      setFormData({
        nome: company.nome || "",
        cnpj: company.cnpj || "",
        categoria: company.categoria || "",
      });
    } else {
      setFormData({
        nome: "",
        cnpj: "",
        categoria: "",
      });
    }
  }, [company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome da empresa é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const empresaData: EmpresaInput = {
        nome: formData.nome,
        cnpj: formData.cnpj,
        categoria: formData.categoria,
      };

      if (company) {
        await companyService.update(company.id, empresaData);
        toast({
          title: "Empresa atualizada",
          description: "Empresa atualizada com sucesso",
        });
      } else {
        await companyService.create(empresaData);
        toast({
          title: "Empresa criada",
          description: "Empresa criada com sucesso",
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: company ? "Erro ao atualizar empresa" : "Erro ao criar empresa",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{company ? "Editar Empresa" : "Nova Empresa"}</DialogTitle>
          <DialogDescription>
            {company ? "Edite as informações da empresa" : "Preencha os dados da nova empresa"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Empresa *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleInputChange("nome", e.target.value)}
              placeholder="Digite o nome da empresa"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              value={formData.cnpj}
              onChange={(e) => handleInputChange("cnpj", e.target.value)}
              placeholder="00.000.000/0000-00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria</Label>
            <Input
              id="categoria"
              value={formData.categoria}
              onChange={(e) => handleInputChange("categoria", e.target.value)}
              placeholder="Ex: Alimentação, Saúde, Combustível"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : (company ? "Atualizar" : "Criar")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}