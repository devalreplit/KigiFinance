import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart3, 
  Download, 
  Filter, 
  Calendar, 
  DollarSign,
  ArrowUp,
  ArrowDown,
  FileText
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export default function Reports() {
  const [filters, setFilters] = useState({
    dataInicio: "",
    dataFim: "",
    usuarioId: "",
    empresaId: "",
    tipo: "",
  });

  const { data: transacoes, isLoading: isLoadingTransacoes } = useQuery({
    queryKey: ['/api/dashboard/transacoes'],
    queryFn: api.getUltimasTransacoes,
  });

  const { data: resumo, isLoading: isLoadingResumo } = useQuery({
    queryKey: ['/api/dashboard/resumo'],
    queryFn: api.getResumoFinanceiro,
  });

  const { data: usuarios } = useQuery({
    queryKey: ['/api/family-users'],
    queryFn: api.getFamilyUsers,
  });

  const { data: empresas } = useQuery({
    queryKey: ['/api/empresas'],
    queryFn: api.getEmpresas,
  });

  // Mock data for charts - in a real app, this would come from filtered API calls
  const monthlyData = [
    { month: 'Jan', entradas: 8500, saidas: 6200 },
    { month: 'Fev', entradas: 9200, saidas: 7100 },
    { month: 'Mar', entradas: 8800, saidas: 6800 },
    { month: 'Abr', entradas: 9500, saidas: 7300 },
    { month: 'Mai', entradas: 8700, saidas: 6500 },
    { month: 'Jun', entradas: 9100, saidas: 6900 },
  ];

  const categoryData = [
    { name: 'Alimentação', value: 2400, color: COLORS[0] },
    { name: 'Transporte', value: 1398, color: COLORS[1] },
    { name: 'Lazer', value: 980, color: COLORS[2] },
    { name: 'Saúde', value: 750, color: COLORS[3] },
    { name: 'Outros', value: 490, color: COLORS[4] },
  ];

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      dataInicio: "",
      dataFim: "",
      usuarioId: "",
      empresaId: "",
      tipo: "",
    });
  };

  const exportData = (format: 'csv' | 'pdf') => {
    // In a real app, this would generate and download the file
    console.log(`Exporting data as ${format.toUpperCase()}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Relatórios Financeiros
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Análise detalhada das finanças familiares
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 lg:mt-0">
          <Button variant="outline" size="sm" onClick={() => exportData('csv')}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportData('pdf')}>
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="dataInicio">Data Inicial</Label>
              <Input
                id="dataInicio"
                type="date"
                value={filters.dataInicio}
                onChange={(e) => handleFilterChange('dataInicio', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="dataFim">Data Final</Label>
              <Input
                id="dataFim"
                type="date"
                value={filters.dataFim}
                onChange={(e) => handleFilterChange('dataFim', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="usuarioId">Usuário</Label>
              <Select value={filters.usuarioId} onValueChange={(value) => handleFilterChange('usuarioId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os usuários" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os usuários</SelectItem>
                  {usuarios?.map((usuario: any) => (
                    <SelectItem key={usuario.id} value={usuario.id.toString()}>
                      {usuario.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="empresaId">Empresa</Label>
              <Select value={filters.empresaId} onValueChange={(value) => handleFilterChange('empresaId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as empresas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as empresas</SelectItem>
                  {empresas?.map((empresa: any) => (
                    <SelectItem key={empresa.id} value={empresa.id.toString()}>
                      {empresa.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={filters.tipo} onValueChange={(value) => handleFilterChange('tipo', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os tipos</SelectItem>
                  <SelectItem value="entrada">Entradas</SelectItem>
                  <SelectItem value="saida">Saídas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={clearFilters}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoadingResumo ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Saldo Total</h3>
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  R$ {resumo?.saldoFamiliar?.toFixed(2) || '0,00'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Entradas</h3>
                  <ArrowUp className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  R$ {resumo?.totalEntradas?.toFixed(2) || '0,00'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Saídas</h3>
                  <ArrowDown className="h-5 w-5 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-red-600 mt-2">
                  R$ {resumo?.totalSaidas?.toFixed(2) || '0,00'}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tendência Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R$ ${value}`, '']} />
                  <Bar dataKey="entradas" fill="hsl(var(--chart-2))" name="Entradas" />
                  <Bar dataKey="saidas" fill="hsl(var(--chart-4))" name="Saídas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`R$ ${value}`, 'Valor']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingTransacoes ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-8 w-8 rounded" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {transacoes?.map((transacao: any) => (
                    <tr key={transacao.id}>
                      <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">
                        {new Date(transacao.data).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={transacao.tipo === 'entrada' ? 'default' : 'destructive'}>
                          {transacao.tipo === 'entrada' ? (
                            <ArrowUp className="w-3 h-3 mr-1" />
                          ) : (
                            <ArrowDown className="w-3 h-3 mr-1" />
                          )}
                          {transacao.tipo}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">
                        {transacao.descricao}
                      </td>
                      <td className={`py-4 px-4 text-sm font-medium text-right ${
                        transacao.tipo === 'entrada' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transacao.tipo === 'entrada' ? '+' : '-'} R$ {transacao.valor.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
