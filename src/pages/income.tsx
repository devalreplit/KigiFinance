
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toastSuccess, toastError, toastInfo, toastWarning } from "@/lib/toast-utils";
import { userService, companyService, incomeService } from "@/service/apiService";
import IncomeModal from "@/components/modals/income-modal";
import { Plus, DollarSign, Loader2, TrendingUp, Search, Calendar } from "lucide-react";
import { Usuario, Empresa } from "../../types";

export default function Income() {
  const [entradas, setEntradas] = useState<any[]>([]);
  const [users, setUsers] = useState<Usuario[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estados para filtro de mês/ano
  const [mesConsulta, setMesConsulta] = useState<string>("");
  const [anoConsulta, setAnoConsulta] = useState<string>("");
  const [periodoAtual, setPeriodoAtual] = useState<{mes: number, ano: number}>({
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear()
  });
  
  

  useEffect(() => {
    loadData();
  }, []);

  // Carregar dados de entradas - por padrão carrega do mês corrente
  const loadData = async (mes?: number, ano?: number) => {
    try {
      setLoading(true);
      
      // Se não especificar mês/ano, usar o período atual (mês corrente)
      const mesParam = mes || periodoAtual.mes;
      const anoParam = ano || periodoAtual.ano;
      
      const [entradasData, usersData, empresasData] = await Promise.all([
        incomeService.getAll(mesParam, anoParam), // Buscar apenas entradas do período especificado
        userService.getAll(),
        companyService.getAll()
      ]);

      setEntradas(entradasData);
      setUsers(usersData);
      setEmpresas(empresasData);
      
      // Atualizar período atual sendo exibido
      setPeriodoAtual({ mes: mesParam, ano: anoParam });
      
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
    // Recarregar dados do período atual após fechar modal
    loadData(periodoAtual.mes, periodoAtual.ano);
  };

  // Filtrar entradas por mês/ano específico
  const handleFiltrarPorPeriodo = () => {
    const mes = parseInt(mesConsulta);
    const ano = parseInt(anoConsulta);
    
    if (!mes || !ano || mes < 1 || mes > 12 || ano < 2020 || ano > 2030) {
      toast({
        title: "Período inválido",
        description: "Por favor, informe um mês (1-12) e ano válidos",
        variant: "destructive",
      });
      return;
    }
    
    loadData(mes, ano);
  };

  // Voltar para o mês corrente
  const handleVoltarMesCorrente = () => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();
    
    setMesConsulta("");
    setAnoConsulta("");
    loadData(mesAtual, anoAtual);
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
        <div className="text-center lg:text-left">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Gerenciar Entradas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Entradas de {periodoAtual.mes.toString().padStart(2, '0')}/{periodoAtual.ano} 
            {periodoAtual.mes === new Date().getMonth() + 1 && periodoAtual.ano === new Date().getFullYear() 
              ? " (Mês Corrente)" 
              : ""
            }
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-green-500 hover:bg-green-600 text-white mt-4 lg:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          Nova Entrada
        </Button>
      </div>

      {/* Filtros de Período */}
      <Card className="border-green-200" style={{ backgroundColor: '#f0fdf4' }}>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <Label htmlFor="mes">Consultar Período Específico</Label>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <div className="flex gap-2 flex-1">
                  <div className="w-32 sm:w-32 flex-1 sm:flex-none">
                    <Select value={mesConsulta} onValueChange={setMesConsulta}>
                      <SelectTrigger>
                        <SelectValue placeholder="Mês" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">JAN</SelectItem>
                        <SelectItem value="2">FEV</SelectItem>
                        <SelectItem value="3">MAR</SelectItem>
                        <SelectItem value="4">ABR</SelectItem>
                        <SelectItem value="5">MAI</SelectItem>
                        <SelectItem value="6">JUN</SelectItem>
                        <SelectItem value="7">JUL</SelectItem>
                        <SelectItem value="8">AGO</SelectItem>
                        <SelectItem value="9">SET</SelectItem>
                        <SelectItem value="10">OUT</SelectItem>
                        <SelectItem value="11">NOV</SelectItem>
                        <SelectItem value="12">DEZ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-28 sm:w-28 flex-1 sm:flex-none">
                    <Select value={anoConsulta} onValueChange={setAnoConsulta}>
                      <SelectTrigger>
                        <SelectValue placeholder="Ano" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: new Date().getFullYear() - 2023 }, (_, i) => 2024 + i).map((ano) => (
                          <SelectItem key={ano} value={ano.toString()}>
                            {ano}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleFiltrarPorPeriodo}
                    variant="outline"
                    disabled={loading}
                    className="sm:flex-none"
                  >
                    <Search className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Consultar</span>
                  </Button>
                </div>
                <div className="flex justify-center sm:justify-start">
                  <Button 
                    onClick={handleVoltarMesCorrente}
                    variant="outline"
                    disabled={loading}
                    className="text-green-600 border-green-600 hover:bg-green-50"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Mês Corrente
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <Card className="border-green-100 shadow-sm">
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-green-50 border-b border-green-200">
                <tr>
                  <th className="text-left py-4 px-6 text-xs font-medium text-green-700 uppercase tracking-wider">TITULAR</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-green-700 uppercase tracking-wider">EMPRESA</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-green-700 uppercase tracking-wider">DATA</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-green-700 uppercase tracking-wider">VALOR</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-green-700 uppercase tracking-wider">REGISTRO</th>
                </tr>
              </thead>
              <tbody>
                {entradas.length > 0 ? (
                  entradas.map((entrada) => (
                    <tr key={entrada.id} className="border-b border-gray-200 hover:bg-green-50 transition-colors">
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
                        <p className="text-muted-foreground">
                          Nenhuma entrada encontrada para {periodoAtual.mes.toString().padStart(2, '0')}/{periodoAtual.ano}
                        </p>
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
            <Card key={entrada.id} className="border-green-200 shadow-sm hover:shadow-md transition-shadow"
              style={{ backgroundColor: '#f0fdf4' }}>
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
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              Nenhuma entrada em {periodoAtual.mes.toString().padStart(2, '0')}/{periodoAtual.ano}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {periodoAtual.mes === new Date().getMonth() + 1 && periodoAtual.ano === new Date().getFullYear()
                ? "Comece registrando uma nova entrada."
                : "Não há entradas registradas neste período."
              }
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
