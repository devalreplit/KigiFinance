import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusTag } from "@/components/common/StatusTag";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, Calendar, DollarSign, CheckCircle } from "lucide-react";

export default function Installments() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: parcelas, isLoading } = useQuery({
    queryKey: ['/api/parcelas'],
    queryFn: api.getParcelas,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, dataPagamento }: { id: number; status: string; dataPagamento?: string }) =>
      api.updateParcelaStatus(id, status, dataPagamento),
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Status da parcela atualizado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/parcelas'] });
      queryClient.invalidateQueries({ queryKey: ['/api/parcelas/pendentes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/resumo'] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status da parcela. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleMarkAsPaid = (parcelaId: number) => {
    const today = new Date().toISOString().split('T')[0];
    updateStatusMutation.mutate({
      id: parcelaId,
      status: 'paga',
      dataPagamento: today,
    });
  };

  const filteredParcelas = parcelas?.filter((parcela: any) => {
    if (statusFilter === "all") return true;
    return parcela.status === statusFilter;
  }) || [];

  // Group parcelas by month
  const groupedParcelas = filteredParcelas.reduce((groups: any, parcela: any) => {
    const date = new Date(parcela.dataVencimento);
    const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    
    if (!groups[key]) {
      groups[key] = {
        month: monthName,
        parcelas: [],
      };
    }
    groups[key].parcelas.push(parcela);
    return groups;
  }, {});

  const sortedGroups = Object.entries(groupedParcelas).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Controle de Parcelas
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Gerencie e controle todas as parcelas pendentes
          </p>
        </div>
        <div className="mt-4 lg:mt-0">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="a vencer">A Vencer</SelectItem>
              <SelectItem value="vencida">Vencidas</SelectItem>
              <SelectItem value="paga">Pagas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Installments List */}
      {isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-5 w-20 mb-2" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sortedGroups.length > 0 ? (
        <div className="space-y-6">
          {sortedGroups.map(([key, group]: [string, any]) => (
            <Card key={key}>
              <CardHeader>
                <CardTitle className="text-lg capitalize">{group.month}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {group.parcelas.map((parcela: any) => (
                    <div key={parcela.id} className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 border rounded-lg">
                      <div className="flex items-start lg:items-center space-x-4 mb-4 lg:mb-0">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            Parcela {parcela.numeroParcela}
                          </h3>
                          <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-1 lg:space-y-0">
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <Calendar className="h-4 w-4 mr-1" />
                              Vence em {new Date(parcela.dataVencimento).toLocaleDateString()}
                            </div>
                            {parcela.dataPagamento && (
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Pago em {new Date(parcela.dataPagamento).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-4 lg:space-y-0">
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            R$ {parseFloat(parcela.valorParcela).toFixed(2)}
                          </p>
                          <StatusTag status={parcela.status} />
                        </div>
                        {parcela.status !== 'paga' && (
                          <Button
                            size="sm"
                            onClick={() => handleMarkAsPaid(parcela.id)}
                            disabled={updateStatusMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Marcar como Paga
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {statusFilter === "all" 
              ? "Nenhuma parcela encontrada" 
              : `Nenhuma parcela ${statusFilter === "a vencer" ? "a vencer" : statusFilter} encontrada`}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {statusFilter === "all"
              ? "As parcelas aparecerão aqui quando você registrar saídas parceladas."
              : "Ajuste o filtro para ver outras parcelas."}
          </p>
        </div>
      )}
    </div>
  );
}
