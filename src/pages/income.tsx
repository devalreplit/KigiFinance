import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApi, useMutation } from "@/hooks/useApi";
import { userService, companyService, incomeService } from "@/service/apiService";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/service/auth";
import { Loader2, Plus, DollarSign } from "lucide-react";
import { Usuario, Empresa, EntradaInput } from "../../types";

export default function Income() {
  const [formData, setFormData] = useState({
    usuarioTitularId: "",
    dataReferencia: new Date().toISOString().split('T')[0],
    valor: "",
    empresaPagadoraId: "",
  });

  const { toast } = useToast();

  const { data: users, isLoading: isLoadingUsers, refetch: refetchUsers } = useApi(() => userService.getAll());
  const { data: empresasPagadoras, isLoading: isLoadingCompanies, refetch: refetchCompanies } = useApi(() => companyService.getAll());
  const { data: entradas, isLoading: isLoadingEntradas, refetch: refetchEntradas } = useApi(() => incomeService.getAll());

  const createMutation = useMutation(incomeService.create, {
    onSuccess: () => {
      refetchEntradas();
      refetchUsers();
      refetchCompanies();

      toast({
        title: "Entrada registrada",
        description: "Entrada financeira registrada com sucesso",
      });

      // Reset form
      setFormData({
        usuarioTitularId: "",
        dataReferencia: new Date().toISOString().split('T')[0],
        valor: "",
        empresaPagadoraId: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao registrar entrada",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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

    await createMutation.mutate(entradaData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Registrar Entrada
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registre receitas e ganhos familiares
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
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

              <div>
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

              <div>
                <Label htmlFor="dataReferencia">Data de Referência *</Label>
                <Input
                  id="dataReferencia"
                  type="date"
                  value={formData.dataReferencia}
                  onChange={(e) => handleInputChange('dataReferencia', e.target.value)}
                  required
                />
              </div>

              <div>
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
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormData({
                  usuarioTitularId: "",
                  dataReferencia: new Date().toISOString().split('T')[0],
                  valor: "",
                  empresaPagadoraId: "",
                })}
              >
                Limpar
              </Button>
              <Button type="submit" disabled={createMutation.isLoading}>
                {createMutation.isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Registrar Entrada
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Entradas Recentes */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-600" />
            Entradas Recentes
          </h3>
          
          {isLoadingEntradas ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : entradas && entradas.length > 0 ? (
            <div className="space-y-4">
              {entradas.slice(0, 5).map((entrada: any) => {
                const titular = users?.find((u: Usuario) => u.id === entrada.usuarioTitularId);
                const empresa = empresasPagadoras?.find((e: Empresa) => e.id === entrada.empresaPagadoraId);
                
                return (
                  <div key={entrada.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {titular?.nome || 'Usuário não encontrado'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {empresa?.nome || 'Empresa não encontrada'} • {new Date(entrada.dataReferencia).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600 dark:text-green-400">
                        R$ {entrada.valor.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Nenhuma entrada registrada ainda</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}