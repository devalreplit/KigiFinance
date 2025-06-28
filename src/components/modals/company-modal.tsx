import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { toastSuccess, toastError } from "@/lib/toast-utils";
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
  });

  useEffect(() => {
    if (company) {
      setFormData({
        nome: company.nome || "",
      });
    } else {
      setFormData({
        nome: "",
      });
    }
  }, [company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      toastError({
        title: "Campos obrigatórios",
        description: "Nome da empresa é obrigatório",
      });
      return;
    }

    try {
      setLoading(true);

      const empresaData: EmpresaInput = {
        nome: formData.nome,
      };

      if (company) {
        await companyService.update(company.id, empresaData);
        toastSuccess({
          title: "Empresa atualizada",
          description: "Empresa atualizada com sucesso",
        });
      } else {
        await companyService.create(empresaData);
        toastSuccess({
          title: "Empresa criada",
          description: "Empresa criada com sucesso",
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      toastError({
        title: "Erro",
        description: company ? "Erro ao atualizar empresa" : "Erro ao criar empresa",
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