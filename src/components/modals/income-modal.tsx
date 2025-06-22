
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/useApi";
import { userService, companyService, incomeService } from "@/service/apiService";
import { authService } from "@/service/auth";
import { Loader2 } from "lucide-react";
import { Usuario, Empresa, EntradaInput } from "../../../types";

interface IncomeModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function IncomeModal({ open, onClose, onSuccess }: IncomeModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    usuarioTitularId: "",
    dataReferencia: new Date().toISOString().split('T')[0],
    valor: "",
    empresaPagadoraId: "",
  });

  const { data: users, isLoading: isLoadingUsers } = useApi(() => userService.getAll());
  const { data: empresasPagadoras, isLoading: isLoadingCompanies } = useApi(() => companyService.getAll());

  useEffect(() => {
    if (!open) {
      // Reset form when modal closes
      setFormData({
        usuarioTitularId: "",
        dataReferencia: new Date().toISOString().split('T')[0],
        valor: "",
        empresaPagadoraId: "",
      });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.usuarioTitularId || !formData.valor || !formData.empresaPagadoraId) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        toast({
          title: "Erro de autenticação",
          description: "Usuário não encontrado",
          variant: "destructive",
        });
        return;
      }

      const entradaData: EntradaInput = {
        usuarioRegistroId: currentUser.id,
        usuarioTitularId: parseInt(formData.usuarioTitularId),
        dataReferencia: formData.dataReferencia,
        valor: parseFloat(formData.valor),
        empresaPagadoraId: parseInt(formData.empresaPagadoraId),
      };

      await incomeService.create(entradaData);

      toast({
        title: "Entrada registrada",
        description: "Entrada financeira registrada com sucesso",
      });

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao registrar entrada",
        description: "Não foi possível registrar a entrada",
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
          <DialogTitle>Registrar Entrada</DialogTitle>
          <DialogDescription>
            Preencha os dados da nova entrada financeira
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="usuarioTitularId">Titular da Entrada *</Label>
            <Select value={formData.usuarioTitularId} onValueChange={(value) => handleInputChange('usuarioTitularId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o titular" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingUsers ? (
                  <SelectItem value="loading">Carregando...</SelectItem>
                ) : (
                  users?.map((user: Usuario) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.nome}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="empresaPagadoraId">Empresa Pagadora *</Label>
            <Select value={formData.empresaPagadoraId} onValueChange={(value) => handleInputChange('empresaPagadoraId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a empresa" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingCompanies ? (
                  <SelectItem value="loading">Carregando...</SelectItem>
                ) : (
                  empresasPagadoras?.map((empresa: Empresa) => (
                    <SelectItem key={empresa.id} value={empresa.id.toString()}>
                      {empresa.nome}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataReferencia">Data de Referência *</Label>
            <Input
              id="dataReferencia"
              type="date"
              value={formData.dataReferencia}
              onChange={(e) => handleInputChange('dataReferencia', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor">Valor (R$) *</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={formData.valor}
              onChange={(e) => handleInputChange('valor', e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Registrar Entrada"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
