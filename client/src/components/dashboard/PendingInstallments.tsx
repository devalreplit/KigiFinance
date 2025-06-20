import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export function PendingInstallments() {
  const { data: parcelas, isLoading } = useQuery({
    queryKey: ['/api/parcelas/pendentes'],
    queryFn: api.getParcelasPendentes,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Próximas Parcelas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-5 w-20" />
                </div>
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
        <div className="flex items-center justify-between">
          <CardTitle>Próximas Parcelas</CardTitle>
          <a href="/parcelas" className="text-sm text-primary hover:underline">
            Ver todas
          </a>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {parcelas?.slice(0, 3).map((parcela: any) => (
            <div key={parcela.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Parcela {parcela.numeroParcela}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Vence em {new Date(parcela.dataVencimento).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  R$ {parseFloat(parcela.valorParcela).toFixed(2)}
                </p>
                <Badge variant={parcela.status === 'vencida' ? 'destructive' : 'secondary'}>
                  {parcela.status}
                </Badge>
              </div>
            </div>
          ))}
          
          {(!parcelas || parcelas.length === 0) && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Nenhuma parcela pendente
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
