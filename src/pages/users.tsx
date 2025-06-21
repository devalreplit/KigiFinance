import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { userService } from "@/service/apiService";
import UserModal from "@/components/modals/user-modal";
import { getRoleColor, getRoleLabel } from "@/lib/utils";
import { Plus, Edit, Trash2, Loader2, Users as UsersIcon } from "lucide-react";
import { Usuario } from "../../types";

export default function Users() {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | undefined>(undefined);
  const [deleting, setDeleting] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar usuários",
        description: "Não foi possível carregar a lista de usuários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: Usuario) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleting(id);
      await userService.delete(id);
      await loadUsers();
      toast({
        title: "Usuário excluído",
        description: "Usuário excluído com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir usuário",
        description: "Não foi possível excluir o usuário",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingUser(undefined);
    loadUsers();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="mr-2 h-8 w-8 animate-spin mx-auto mb-4" />
          <div className="text-lg">Carregando usuários...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Gerenciar Usuários
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Controle os membros da família e suas permissões
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="mt-4 lg:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-6 font-semibold text-foreground">USUÁRIO</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">EMAIL</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">FUNÇÃO</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">STATUS</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-accent/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <UsersIcon className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium text-foreground">{user.nome}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-muted-foreground">{user.email || "Não informado"}</span>
                      </td>
                      <td className="py-4 px-6">
                        <Badge
                          variant="secondary"
                          className={`${getRoleColor(user.papel)} text-white`}
                        >
                          {getRoleLabel(user.papel)}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant={user.ativo ? "default" : "secondary"}>
                          {user.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(user)}
                            className="hover:bg-primary/10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                            disabled={deleting === user.id}
                            className="hover:bg-destructive/10 hover:text-destructive"
                          >
                            {deleting === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center">
                      <div className="flex flex-col items-center">
                        <UsersIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Nenhum usuário encontrado</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <UserModal
        open={isModalOpen}
        onClose={handleModalClose}
        user={editingUser}
        onSuccess={handleModalClose}
      />
    </div>
  );
}