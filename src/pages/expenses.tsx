import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { userService, companyService, expenseService } from "@/service/apiService";
import ExpenseDetailsModal from "@/components/modals/expense-details-modal";
import { Plus, TrendingDown, Loader2, Search, Calendar, ShoppingCart, Eye } from "lucide-react";
import { Usuario, Empresa, Saida } from "../../types";
import { useLocation } from "wouter";

/**
 * PÁGINA EXPENSES - GERENCIAMENTO DE SAÍDAS
 * 
 * Responsabilidade:
 * - Listar saídas financeiras (normais e parceladas pai)
 * - Permitir filtro por período (mês/ano)
 * - Fornecer acesso rápido para criar nova saída
 * - Exibir detalhes e permitir edição/exclusão via modal
 * - Implementar visualização responsiva (desktop/mobile)
 * 
 * Regras de Negócio:
 * - Por padrão carrega saídas do mês corrente
 * - Exibe apenas saídas principais (normal + parcelada_pai)
 * - Não exibe parcelas filhas na listagem principal
 * - Saídas parceladas mostram informação de parcelamento
 * - Ordenação por data mais recente primeiro
 */
export default function Expenses() {
  // Estados para dados da listagem
  const [saidas, setSaidas] = useState<Saida[]>([]);
  const [users, setUsers] = useState<Usuario[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para modal de detalhes
  const [selectedExpense, setSelectedExpense] = useState<Saida | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Hook de navegação
  const [, setLocation] = useLocation();

  // Estados para filtro temporal
  const [mesConsulta, setMesConsulta] = useState<string>("");
  const [anoConsulta, setAnoConsulta] = useState<string>("");
  const [periodoAtual, setPeriodoAtual] = useState<{mes: number, ano: number}>({
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear()
  });

  const { toast, toastSuccess, toastError } = useToast();

  /**
   * EFFECT HOOK - INICIALIZAÇÃO DA PÁGINA EXPENSES
   * 
   * Responsabilidade:
   * - Carregar dados iniciais ao montar o componente
   * - Executar apenas uma vez na montagem
   */
  useEffect(() => {
    loadData();
  }, []);

  /**
   * FUNÇÃO LOADDATA - CARREGAMENTO DE SAÍDAS
   * 
   * @param mes (opcional) - Mês para filtro (1-12). Se não informado, usa mês atual
   * @param ano (opcional) - Ano para filtro. Se não informado, usa ano atual
   * 
   * Responsabilidade:
   * - Carregar saídas do período especificado
   * - Carregar dados auxiliares (usuários, empresas)
   * - Filtrar apenas saídas principais (normal + parcelada_pai)
   * - Atualizar estados do componente
   * - Tratar erros de carregamento
   * 
   * Regras de Negócio:
   * - Por padrão carrega dados do mês corrente
   * - Saídas filtradas por data_saida do período (impacto financeiro)
   * - Exclui parcelas filhas da listagem principal
   * - Ordenação por data mais recente primeiro (implementada no serviço)
   * - Executa chamadas paralelas para otimizar performance
   */
  const loadData = async (mes?: number, ano?: number) => {
    try {
      setLoading(true);

      // Se não especificar mês/ano, usar o período atual (mês corrente)
      const mesParam = mes || periodoAtual.mes;
      const anoParam = ano || periodoAtual.ano;

      const [saidasData, usersData, empresasData] = await Promise.all([
        expenseService.getAll(mesParam, anoParam), // Buscar apenas saídas do período especificado
        userService.getAll(),
        companyService.getAll()
      ]);

      // Filtrar apenas saídas normais e parceladas pai (não incluir parcelas filhas)
      const saidasFiltradas = saidasData.filter(expense => 
        expense.tipoSaida === 'normal' || expense.tipoSaida === 'parcelada_pai'
      );

      setSaidas(saidasFiltradas);
      setUsers(usersData);
      setEmpresas(empresasData);

      // Atualizar período atual sendo exibido
      setPeriodoAtual({ mes: mesParam, ano: anoParam });

    } catch (error) {
      toastError({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as informações",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * FUNÇÃO HANDLEFILTRARPOR PERIODO - FILTRAR SAÍDAS POR MÊS/ANO
   * 
   * Responsabilidade:
   * - Validar mês e ano informados pelo usuário
   * - Aplicar filtro temporal às saídas
   * - Exibir mensagens de erro para dados inválidos
   * 
   * Regras de Negócio:
   * - Mês deve estar entre 1 e 12
   * - Ano deve estar entre 2020 e 2030 (range de funcionamento do sistema)
   * - Ambos os campos são obrigatórios para filtrar
   */
  const handleFiltrarPorPeriodo = () => {
    const mes = parseInt(mesConsulta);
    const ano = parseInt(anoConsulta);

    if (!mes || !ano || mes < 1 || mes > 12 || ano < 2020 || ano > 2030) {
      toastError({
        title: "Período inválido",
        description: "Por favor, informe um mês (1-12) e ano válidos",
      });
      return;
    }

    loadData(mes, ano);
  };

  /**
   * FUNÇÃO HANDLEVOLTARMESCORRENTE - RETORNAR PARA MÊS ATUAL
   * 
   * Responsabilidade:
   * - Resetar filtros de período
   * - Recarregar dados do mês atual
   * - Limpar campos de consulta
   * 
   * Regras de Negócio:
   * - Sempre retorna para o mês/ano atual da data do sistema
   */
  const handleVoltarMesCorrente = () => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();

    setMesConsulta("");
    setAnoConsulta("");
    loadData(mesAtual, anoAtual);
  };

  /**
   * FUNÇÃO FORMATCURRENCY - FORMATAR VALOR MONETÁRIO
   * 
   * @param value - Valor numérico a ser formatado
   * @returns String formatada como moeda brasileira
   * 
   * Responsabilidade:
   * - Formatar valores monetários no padrão brasileiro (R$)
   * - Padronizar exibição de valores na interface
   */
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  /**
   * FUNÇÃO FORMATDATE - FORMATAR DATA NO PADRÃO BRASILEIRO
   * 
   * @param dateString - String de data no formato ISO
   * @returns Data formatada no padrão dd/mm/aaaa
   * 
   * Responsabilidade:
   * - Converter datas ISO para formato brasileiro
   * - Padronizar exibição de datas na interface
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  /**
   * FUNÇÃO GETTITULARESNAMES - OBTER NOMES DOS RESPONSÁVEIS
   * 
   * @param usuariosTitularesIds - Array com IDs dos usuários responsáveis
   * @returns String com nomes dos responsáveis separados por vírgula
   * 
   * Responsabilidade:
   * - Resolver nomes dos usuários responsáveis a partir dos IDs
   * - Formatear lista de nomes de forma legível
   * - Fornecer fallback para IDs inexistentes
   */
  const getTitularesNames = (usuariosTitularesIds: number[]) => {
    const titulares = users.filter(u => usuariosTitularesIds.includes(u.id));
    return titulares.map(t => t.nome).join(', ') || 'Usuários não encontrados';
  };

  /**
   * FUNÇÃO GETEMPRESANAME - OBTER NOME DA EMPRESA
   * 
   * @param empresaId - ID da empresa
   * @returns Nome da empresa ou mensagem de fallback
   * 
   * Responsabilidade:
   * - Resolver nome da empresa a partir do ID
   * - Fornecer fallback para IDs inexistentes
   */
  const getEmpresaName = (empresaId: number) => {
    const empresa = empresas.find(e => e.id === empresaId);
    return empresa?.nome || 'Empresa não encontrada';
  };

  /**
   * FUNÇÃO HANDLENOVAENTRADA - NAVEGAR PARA FORMULÁRIO DE NOVA SAÍDA
   * 
   * Responsabilidade:
   * - Redirecionar usuário para página de criação de saída
   * - Utilizar roteamento programático
   */
  const handleNovaEntrada = () => {
    setLocation('/expenses/new');
  };

  /**
   * FUNÇÃO HANDLEVIEWEXPENSEDETAILS - ABRIR MODAL DE DETALHES
   * 
   * @param expense - Objeto Saida selecionada para visualização
   * 
   * Responsabilidade:
   * - Definir saída selecionada para o modal
   * - Abrir modal de detalhes
   * - Permitir visualização, edição e exclusão
   */
  const handleViewExpenseDetails = (expense: Saida) => {
    setSelectedExpense(expense);
    setIsDetailsModalOpen(true);
  };

  /**
   * FUNÇÃO HANDLECLOSEDETAILSMODAL - FECHAR MODAL DE DETALHES
   * 
   * Responsabilidade:
   * - Fechar modal de detalhes
   * - Limpar saída selecionada
   * - Resetar estado do modal
   */
  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedExpense(null);
  };

  /**
   * FUNÇÃO HANDLEEXPENSEUPDATED - CALLBACK APÓS ATUALIZAÇÃO DE SAÍDA
   * 
   * Responsabilidade:
   * - Recarregar dados após edição bem-sucedida
   * - Manter período atual selecionado
   * - Sincronizar listagem com dados atualizados
   */
  const handleExpenseUpdated = () => {
    // Recarregar dados após atualização
    loadData(periodoAtual.mes, periodoAtual.ano);
  };

  /**
   * FUNÇÃO HANDLEEXPENSEDELETED - CALLBACK APÓS EXCLUSÃO DE SAÍDA
   * 
   * Responsabilidade:
   * - Recarregar dados após exclusão bem-sucedida
   * - Exibir confirmação de exclusão
   * - Manter período atual selecionado
   * - Sincronizar listagem com dados atualizados
   */
  const handleExpenseDeleted = () => {
    // Recarregar dados após exclusão
    loadData(periodoAtual.mes, periodoAtual.ano);
    toastSuccess({
      title: "Sucesso!",
      description: "A saída foi excluída com sucesso",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="mr-2 h-8 w-8 animate-spin mx-auto mb-4" />
          <div className="text-lg">Carregando saídas...</div>
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
            Gerenciar Saídas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Saídas de {periodoAtual.mes.toString().padStart(2, '0')}/{periodoAtual.ano} 
            {periodoAtual.mes === new Date().getMonth() + 1 && periodoAtual.ano === new Date().getFullYear() 
              ? " (Mês Corrente)" 
              : ""
            }
          </p>
        </div>
        <Button onClick={handleNovaEntrada} className="bg-red-500 hover:bg-red-600 text-white mt-4 lg:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          Nova Saída
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
            <div className="bg-green-100 p-3 border-b border-green-200">
              <p className="text-sm text-green-700 text-center">
                💡 Clique em qualquer linha para ver detalhes e editar a saída
              </p>
            </div>
            <table className="w-full">
              <thead className="bg-green-50 border-b border-green-200">
                <tr>
                  <th className="text-left py-4 px-6 text-xs font-medium text-green-700 uppercase tracking-wider">EMPRESA</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-green-700 uppercase tracking-wider">DATA</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-green-700 uppercase tracking-wider">VALOR</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-green-700 uppercase tracking-wider">TIPO</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-green-700 uppercase tracking-wider">REGISTRO</th>
                </tr>
              </thead>
              <tbody>
                {saidas.length > 0 ? (
                  saidas.map((saida) => (
                    <tr 
                      key={saida.id} 
                      className="border-b border-gray-200 hover:bg-green-50 transition-colors cursor-pointer group"
                      onClick={() => handleViewExpenseDetails(saida)}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center border border-green-200 dark:border-green-800">
                            <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="font-medium text-foreground">{getEmpresaName(saida.empresaId)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-muted-foreground">{formatDate(saida.dataSaida)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-medium">
                          {formatCurrency(saida.valorTotal)}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-xs">
                            {saida.tipoSaida === "parcelada_pai" && saida.totalParcelas
                              ? `${saida.totalParcelas}x`
                              : "À vista"}
                          </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(saida.dataHoraRegistro)}
                          </span>
                          <Eye className="h-4 w-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center">
                      <div className="flex flex-col items-center">
                        <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          Nenhuma saída encontrada para {periodoAtual.mes.toString().padStart(2, '0')}/{periodoAtual.ano}
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
        {saidas.length > 0 && (
          <Card className="border-green-200" style={{ backgroundColor: '#f0fdf4' }}>
            <CardContent className="p-3">
              <p className="text-sm text-green-700 text-center">
                💡 Toque em qualquer card para ver detalhes e editar
              </p>
            </CardContent>
          </Card>
        )}
        {saidas.length > 0 ? (
          saidas.map((saida) => (
            <Card 
              key={saida.id} 
              className="border-green-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
              style={{ backgroundColor: '#f0fdf4' }}
              onClick={() => handleViewExpenseDetails(saida)}
            >
              <CardContent className="p-4">

                <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {getEmpresaName(saida.empresaId) || "Empresa não encontrada"}
                          </h3>
                          <Badge variant={saida.tipoPagamento === "avista" ? "secondary" : "default"}>
                            {saida.tipoPagamento === "avista" ? "À Vista" : `${saida.totalParcelas || 1}x`}
                          </Badge>
                          {saida.tipoSaida === 'parcelada_pai' && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              Parcelado
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(saida.dataSaida)}
                        </p>

                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-medium">
                          {formatCurrency(saida.valorTotal)}
                        </Badge>

                      </div>
                    </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">

                  <div className="flex justify-between">
                    <span className="font-medium">Registrado em:</span>
                    <span className="text-xs">{formatDate(saida.dataHoraRegistro)}</span>
                  </div>
                </div>

                <div className="flex justify-end mt-3">
                  <div className="flex items-center gap-1 text-green-600 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="h-4 w-4" />
                    <span>Ver detalhes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              Nenhuma saída em {periodoAtual.mes.toString().padStart(2, '0')}/{periodoAtual.ano}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {periodoAtual.mes === new Date().getMonth() + 1 && periodoAtual.ano === new Date().getFullYear()
                ? "Comece registrando uma nova saída."
                : "Não há saídas registradas neste período."
              }
            </p>
            <div className="mt-6">
              <Button
                onClick={handleNovaEntrada}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Saída
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalhes da Saída */}
      <ExpenseDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        expense={selectedExpense}
        onExpenseUpdated={handleExpenseUpdated}
        onExpenseDeleted={handleExpenseDeleted}
      />
    </div>
  );
}