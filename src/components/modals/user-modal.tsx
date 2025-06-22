import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
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
    email: user?.email || "",
    senha: "",
    papel: user?.papel || "filho",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome || "",
        email: user.email || "",
        senha: "",
        papel: user.papel || "filho",
      });
    } else {
      setFormData({
        nome: "",
        email: "",
        senha: "",
        papel: "filho",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim() || !formData.email.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e email são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (!user && !formData.senha.trim()) {
      toast({
        title: "Senha obrigatória",
        description: "A senha é obrigatória para novos usuários",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const userData: UsuarioInput = {
        nome: formData.nome,
        email: formData.email,
        papel: formData.papel as "pai" | "mae" | "filho" | "filha",
        ...(formData.senha && { senha: formData.senha }),
      };

      if (user) {
        await userService.update(user.id, userData);
        toast({
          title: "Usuário atualizado",
          description: "Usuário atualizado com sucesso",
        });
      } else {
        await userService.create(userData);
        toast({
          title: "Usuário criado",
          description: "Usuário criado com sucesso",
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: user ? "Erro ao atualizar usuário" : "Erro ao criar usuário",
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
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Digite o email"
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