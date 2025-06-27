import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { reportService, userService, productService, incomeService, expenseService } from "@/service/apiService";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, TrendingDown, Wallet, Users, Loader2, Package, Building, Calendar } from "lucide-react";
import { ResumoFinanceiro, Transacao, Usuario, Produto, Entrada, Saida } from "../../types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const { toast } = useToast();
  const [resumo, setResumo] = useState<ResumoFinanceiro | null>(null);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [parcelas, setParcelas] = useState([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [saidas, setSaidas] = useState<Saida[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [resumoData, transacoesData, usuariosData, produtosData, entradasData, saidasData] = await Promise.all([
        reportService.getFinancialSummary(),
        reportService.getRecentTransactions(10),
        userService.getAll(),
        productService.getAll(),
        incomeService.getAll(),
        expenseService.getAll(),
      ]);

      setResumo(resumoData);
      setTransacoes(transacoesData);
      setUsuarios(usuariosData);
      setProdutos(produtosData);
      setEntradas(entradasData);
      setSaidas(saidasData);
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Dados para gráficos
  const vendasDiarias = [
    { dia: 'Seg', valor: 380 },
    { dia: 'Ter', valor: 420 },
    { dia: 'Qua', valor: 450 },
    { dia: 'Qui', valor: 480 },
    { dia: 'Sex', valor: 520 },
    { dia: 'Sáb', valor: 390 },
    { dia: 'Dom', valor: 350 }
  ];

  const vendaCategoria = [
    { nome: 'Alimentação', valor: 35, cor: COLORS[0] },
    { nome: 'Transporte', valor: 20, cor: COLORS[1] },
    { nome: 'Lazer', valor: 18, cor: COLORS[2] },
    { nome: 'Saúde', valor: 15, cor: COLORS[3] },
    { nome: 'Outros', valor: 12, cor: COLORS[4] }
  ];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visão geral das finanças familiares
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-green-200" style={{ backgroundColor: '#f0fdf4' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-green-700">Saldo Familiar</h3>
              <Wallet className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-800 mt-2">
              {formatCurrency(resumo?.saldoFamiliar || 0)}
            </p>
            <p className="text-xs text-green-600 mt-1">Saldo atual da família</p>
          </CardContent>
        </Card>

        <Card className="border-green-200" style={{ backgroundColor: '#f0fdf4' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-green-700">Total Entradas</h3>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {formatCurrency(resumo?.totalEntradas || 0)}
            </p>
            <p className="text-xs text-green-600 mt-1">Receitas do período</p>
          </CardContent>
        </Card>

        <Card className="border-green-200" style={{ backgroundColor: '#f0fdf4' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-green-700">Total Saídas</h3>
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600 mt-2">
              {formatCurrency(resumo?.totalSaidas || 0)}
            </p>
            <p className="text-xs text-green-600 mt-1">Gastos do período</p>
          </CardContent>
        </Card>

        <Card className="border-green-200" style={{ backgroundColor: '#f0fdf4' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-green-700">Parcelas Pendentes</h3>
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-600 mt-2">
              {formatCurrency(resumo?.totalPendentes || 0)}
            </p>
            <p className="text-xs text-green-600 mt-1">A pagar</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Vendas Diárias */}
        <Card className="border-green-200" style={{ backgroundColor: '#f0fdf4' }}>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-green-800">Gastos da Semana</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vendasDiarias}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dia" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R$ ${value}`, 'Valor']} />
                  <Line type="monotone" dataKey="valor" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribuição por Categoria */}
        <Card className="border-green-200" style={{ backgroundColor: '#f0fdf4' }}>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-green-800">Gastos por Categoria</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vendaCategoria}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="valor"
                    label={({ nome, valor }) => `${nome}: ${valor}%`}
                  >
                    {vendaCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cor} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentual']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Transações Recentes */}
        <Card className="border-green-200" style={{ backgroundColor: '#f0fdf4' }}>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-green-800">Transações Recentes</h3>
            {transacoes.length > 0 ? (
              <div className="space-y-4">
                {transacoes.slice(0, 5).map((transacao) => (
                  <div key={transacao.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        transacao.tipo === 'entrada' 
                          ? 'bg-green-100 dark:bg-green-900' 
                          : 'bg-red-100 dark:bg-red-900'
                      }`}>
                        {transacao.tipo === 'entrada' ? (
                          <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{transacao.descricao}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(transacao.data).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className={`font-semibold ${
                      transacao.tipo === 'entrada' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transacao.tipo === 'entrada' ? '+' : '-'} {formatCurrency(transacao.valor)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Nenhuma transação encontrada
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="border-green-200" style={{ backgroundColor: '#f0fdf4' }}>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-green-800">Resumo Rápido</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Usuários Ativos</span>
                </div>
                <Badge variant="secondary">{usuarios.length}</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Package className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Produtos Cadastrados</span>
                </div>
                <Badge variant="secondary">{produtos.length}</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Entradas Este Mês</span>
                </div>
                <Badge variant="secondary">{entradas.length}</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  <span className="font-medium">Saídas Este Mês</span>
                </div>
                <Badge variant="secondary">{saidas.length}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}