import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { toastSuccess, toastError } from "@/lib/toast-utils";
import { userService } from "@/service/apiService";
import { Usuario, UsuarioInput } from "../../../types";

interface UserModalProps {
  open: boolean;
  onClose: () => void;
  user?: Usuario;
  onSuccess: () => void;
}

export default function UserModal({ open, onClose, user, onSuccess }: UserModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: user?.nome || "",
    login: user?.login || "",
    senha: "",
    papel: user?.papel || "filho",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome || "",
        login: user.login || "",
        senha: "",
        papel: user.papel || "filho",
      });
    } else {
      setFormData({
        nome: "",
        login: "",
        senha: "",
        papel: "filho",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim() || !formData.login.trim()) {
      toastError({
        title: "Campos obrigatórios",
        description: "Nome e login são obrigatórios",
      });
      return;
    }

    if (!user && !formData.senha.trim()) {
      toastError({
        title: "Senha obrigatória",
        description: "A senha é obrigatória para novos usuários",
      });
      return;
    }

    try {
      setLoading(true);

      const userData: UsuarioInput = {
        nome: formData.nome,
        login: formData.login,
        papel: formData.papel as "pai" | "mae" | "filho" | "filha",
        ...(formData.senha && { senha: formData.senha }),
      };

      if (user) {
        await userService.update(user.id, userData);
        toastSuccess({
          title: "Usuário atualizado",
          description: "Usuário atualizado com sucesso",
        });
      } else {
        await userService.create(userData);
        toastSuccess({
          title: "Usuário criado",
          description: "Usuário criado com sucesso",
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      toastError({
        title: "Erro",
        description: user ? "Erro ao atualizar usuário" : "Erro ao criar usuário",
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
          <DialogTitle>{user ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
          <DialogDescription>
            {user ? "Edite as informações do usuário" : "Preencha os dados do novo usuário"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleInputChange("nome", e.target.value)}
              placeholder="Digite o nome completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="login">Login *</Label>
            <Input
              id="login"
              type="text"
              value={formData.login}
              onChange={(e) => handleInputChange("login", e.target.value)}
              placeholder="Digite o login"
              required
            />
          </div>

          {!user && (
            <div className="space-y-2">
              <Label htmlFor="senha">Senha *</Label>
              <Input
                id="senha"
                type="password"
                value={formData.senha}
                onChange={(e) => handleInputChange("senha", e.target.value)}
                placeholder="Digite a senha"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="papel">Papel do Usuário *</Label>
            <Select value={formData.papel} onValueChange={(value) => handleInputChange("papel", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o papel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pai">Pai</SelectItem>
                <SelectItem value="mae">Mãe</SelectItem>
                <SelectItem value="filho">Filho</SelectItem>
                <SelectItem value="filha">Filha</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : (user ? "Atualizar" : "Criar")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}