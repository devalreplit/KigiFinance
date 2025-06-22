` tags.

```typescript
<replit_final_file>
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { userService, companyService, incomeService } from "@/service/apiService";
import IncomeModal from "@/components/modals/income-modal";
import { Plus, DollarSign, Loader2, TrendingUp } from "lucide-react";
import { Usuario, Empresa } from "../../types";

export default function Income() {
  const [entradas, setEntradas] = useState<any[]>([]);
  const [users, setUsers] = useState<Usuario[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [entradasData, usersData, empresasData] = await Promise.all([
        incomeService.getAll(),
        userService.getAll(),
        companyService.getAll()
      ]);

      setEntradas(entradasData);
      setUsers(usersData);
      setEmpresas(empresasData);
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as informações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    loadData();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getTitularName = (usuarioTitularId: number) => {
    const titular = users.find(u => u.id === usuarioTitularId);
    return titular?.nome || 'Usuário não encontrado';
  };

  const getEmpresaName = (empresaPagadoraId: number) => {
    const empresa = empresas.find(e => e.id === empresaPagadoraId);
    return empresa?.nome || 'Empresa não encontrada';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="mr-2 h-8 w-8 animate-spin mx-auto mb-4" />
          <div className="text-lg">Carregando entradas...</div>
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
            Gerenciar Entradas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registre e controle as entradas financeiras da família
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="mt-4 lg:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          Nova Entrada
        </Button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-6 font-semibold text-foreground">TITULAR</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">EMPRESA</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">DATA</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">VALOR</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">REGISTRO</th>
                </tr>
              </thead>
              <tbody>
                {entradas.length > 0 ? (
                  entradas.map((entrada) => (
                    <tr key={entrada.id} className="border-b border-border hover:bg-accent/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center border border-green-200 dark:border-green-800">
                            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="font-medium text-foreground">{getTitularName(entrada.usuarioTitularId)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-muted-foreground">{getEmpresaName(entrada.empresaPagadoraId)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-muted-foreground">{formatDate(entrada.dataReferencia)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-medium">
                          {formatCurrency(entrada.valor)}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(entrada.dataHoraRegistro)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center">
                      <div className="flex flex-col items-center">
                        <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Nenhuma entrada encontrada</p>
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
        {entradas.length > 0 ? (
          entradas.map((entrada) => (
            <Card key={entrada.id} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {getTitularName(entrada.usuarioTitularId)}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {getEmpresaName(entrada.empresaPagadoraId)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-medium">
                    {formatCurrency(entrada.valor)}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex justify-between">
                    <span className="font-medium">Data:</span>
                    <span>{formatDate(entrada.dataReferencia)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Registrado em:</span>
                    <span className="text-xs">{formatDate(entrada.dataHoraRegistro)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhuma entrada</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Comece registrando uma nova entrada.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Entrada
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <IncomeModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalClose}
      />
    </div>
  );
}