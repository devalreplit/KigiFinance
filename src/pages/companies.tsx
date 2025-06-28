import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { companyService } from "@/service/apiService";
import { toastSuccess, toastError, toastInfo, toastWarning } from "@/lib/toast-utils";
import { toastSuccess, toastError } from "@/lib/toast-utils";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Building2, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import CompanyModal from "@/components/modals/company-modal";
import { Empresa } from "../../types";

export default function Companies() {
  const [companies, setCompanies] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Empresa | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Empresa | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await companyService.getAll();
      setCompanies(data);
    } catch (error) {
      toastError({
        title: "Erro ao carregar empresas",
        description: "Não foi possível carregar as empresas",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (company: Empresa) => {
    setEditingCompany(company);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (company: Empresa) => {
    setCompanyToDelete(company);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!companyToDelete) return;
    
    try {
      setDeleting(companyToDelete.id);
      await companyService.delete(companyToDelete.id);
      await loadCompanies();
      toastSuccess({
        title: "Empresa excluída",
        description: "Empresa excluída com sucesso",
      });
    } catch (error) {
      toastError({
        title: "Erro ao excluir empresa",
        description: "Não foi possível excluir a empresa",
      });
    } finally {
      setDeleting(null);
      setCompanyToDelete(null);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCompany(null);
    loadCompanies();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <div className="text-lg">Carregando empresas...</div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 lg:mb-8 gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground">Gestão de Empresas</h2>
          <p className="text-sm text-muted-foreground mt-1">Gerencie empresas e fornecedores</p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Empresa
        </Button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <Card className="border-green-100 shadow-sm">
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-green-50 border-b border-green-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                    Data de Criação
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-green-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="h-8 w-8 text-green-500 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {company.nome}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(company.criadoEm).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={company.ativo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {company.ativo ? "Ativa" : "Inativa"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(company)}
                          className="w-8 h-8 p-0 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                          title="Editar empresa"
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(company)}
                          disabled={deleting === company.id}
                          className="w-8 h-8 p-0 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors"
                          title="Excluir empresa"
                        >
                          {deleting === company.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-red-600" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {companies.map((company) => (
          <Card key={company.id} className="border-green-200 shadow-sm hover:shadow-md transition-shadow"
            style={{ backgroundColor: '#f0fdf4' }}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{company.nome}</h3>
                    <Badge 
                      className={`mt-1 ${company.ativo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {company.ativo ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(company)}
                    className="w-8 h-8 p-0 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                    title="Editar empresa"
                  >
                    <Edit className="h-4 w-4 text-blue-600" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(company)}
                    disabled={deleting === company.id}
                    className="w-8 h-8 p-0 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors"
                    title="Excluir empresa"
                  >
                    {deleting === company.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-red-600" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span className="font-medium">Criada em:</span>
                  <span>{new Date(company.criadoEm).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Atualizada em:</span>
                  <span>{new Date(company.atualizadoEm).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {companies.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma empresa</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comece criando uma nova empresa.
          </p>
          <div className="mt-6">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Empresa
            </Button>
          </div>
        </div>
      )}

      <CompanyModal
        open={isModalOpen}
        onClose={handleModalClose}
        company={editingCompany ? editingCompany : undefined}
        onSuccess={handleModalClose}
      />

      {/* Confirmação de exclusão */}
      <AlertDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Confirmar exclusão"
        description={`Tem certeza que deseja excluir a empresa "${companyToDelete?.nome}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}