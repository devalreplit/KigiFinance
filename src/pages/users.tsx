import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { userService } from "@/service/apiService";
import UserModal from "@/components/modals/user-modal";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { getRoleColor, getRoleLabel } from "@/lib/utils";
import { Plus, Edit, Trash2, Loader2, Users as UsersIcon } from "lucide-react";
import { Usuario } from "../../types";

export default function Users() {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | undefined>(undefined);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Usuario | null>(null);
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

  const handleDeleteClick = (user: Usuario) => {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    
    try {
      setDeleting(userToDelete.id);
      await userService.delete(userToDelete.id);
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
      setUserToDelete(null);
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

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <Card>
          <CardContent className="p-0">
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
                          <div className="w-8 h-8 bg-primary/15 rounded-full flex items-center justify-center border border-primary/20">
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
                          className={`${getRoleColor(user.papel)} text-white font-medium shadow-sm border-0`}
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
                            className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(user)}
                            disabled={deleting === user.id}
                            className="hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors"
                          >
                            {deleting === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-600" />
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
          </CardContent>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {users.length > 0 ? (
          users.map((user) => (
            <Card key={user.id} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <UsersIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{user.nome}</h3>
                      <Badge 
                        variant="secondary"
                        className={`mt-1 ${getRoleColor(user.papel)} text-white font-medium shadow-sm border-0`}
                      >
                        {getRoleLabel(user.papel)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(user)}
                      className="w-8 h-8 p-0 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                      title="Editar usuário"
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(user)}
                      disabled={deleting === user.id}
                      className="w-8 h-8 p-0 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors"
                      title="Excluir usuário"
                    >
                      {deleting === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-600" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <span>{user.email || "Não informado"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <Badge variant={user.ativo ? "default" : "secondary"}>
                      {user.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Criado em:</span>
                    <span>{new Date(user.criadoEm).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum usuário</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece criando um novo usuário.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <UserModal
        open={isModalOpen}
        onClose={handleModalClose}
        user={editingUser}
        onSuccess={handleModalClose}
      />

      {/* Confirmação de exclusão */}
      <AlertDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Confirmar exclusão"
        description={`Tem certeza que deseja excluir o usuário "${userToDelete?.nome}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}