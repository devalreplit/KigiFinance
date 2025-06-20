import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, ArrowDown } from "lucide-react";

export function RecentTransactions() {
  const { data: transacoes, isLoading } = useQuery({
    queryKey: ['/api/dashboard/transacoes'],
    queryFn: api.getUltimasTransacoes,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="mb-4 lg:mb-0">Transações Recentes</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              Filtrar
            </Button>
            <Button variant="default" size="sm">
              Ver todas
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
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

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {transacoes?.map((transacao: any) => (
            <div key={transacao.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant={transacao.tipo === 'entrada' ? 'default' : 'destructive'}>
                  {transacao.tipo === 'entrada' ? (
                    <ArrowUp className="w-3 h-3 mr-1" />
                  ) : (
                    <ArrowDown className="w-3 h-3 mr-1" />
                  )}
                  {transacao.tipo}
                </Badge>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(transacao.data).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                {transacao.descricao}
              </h3>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${
                  transacao.tipo === 'entrada' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {transacao.tipo === 'entrada' ? '+' : '-'} R$ {transacao.valor.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {(!transacoes || transacoes.length === 0) && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Nenhuma transação encontrada
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
