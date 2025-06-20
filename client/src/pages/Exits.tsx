import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ExitForm } from "@/components/forms/ExitForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, ArrowDown, Calendar, Building, Users } from "lucide-react";

export default function Exits() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: saidas, isLoading } = useQuery({
    queryKey: ['/api/saidas'],
    queryFn: api.getSaidas,
  });

  const { data: usuarios } = useQuery({
    queryKey: ['/api/family-users'],
    queryFn: api.getFamilyUsers,
  });

  const { data: empresas } = useQuery({
    queryKey: ['/api/empresas'],
    queryFn: api.getEmpresas,
  });

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const getEmpresaName = (empresaId: number) => {
    return empresas?.find((e: any) => e.id === empresaId)?.nome || 'Empresa não encontrada';
  };

  const getTitularesNames = (titularesIds: number[]) => {
    if (!usuarios || !Array.isArray(titularesIds)) return 'N/A';
    const names = titularesIds.map(id => 
      usuarios.find((u: any) => u.id === id)?.nome || 'Usuário não encontrado'
    );
    return names.join(', ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Saídas Financeiras
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Gerencie todas as saídas de dinheiro da família
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Saída
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Nova Saída</DialogTitle>
            </DialogHeader>
            <ExitForm onSuccess={handleCloseDialog} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Exits List */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-6 w-24 mb-1" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : saidas && saidas.length > 0 ? (
          saidas.map((saida: any) => (
            <Card key={saida.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start lg:items-center space-x-4 mb-4 lg:mb-0">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                      <ArrowDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Saída Financeira
                        </h3>
                        <Badge variant={saida.tipoPagamento === 'avista' ? 'default' : 'secondary'}>
                          {saida.tipoPagamento === 'avista' ? 'À Vista' : 'Parcelado'}
                        </Badge>
                      </div>
                      <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-1 lg:space-y-0">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Building className="h-4 w-4 mr-1" />
                          {getEmpresaName(saida.empresaId)}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Users className="h-4 w-4 mr-1" />
                          {getTitularesNames(saida.usuariosTitularesIds)}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(saida.dataSaida).toLocaleDateString()}
                        </div>
                      </div>
                      {saida.observacao && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {saida.observacao}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      - R$ {parseFloat(saida.valorTotal).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Registrado em {new Date(saida.dataHoraRegistro).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <ArrowDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhuma saída registrada
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Comece registrando a primeira saída financeira da família.
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Primeira Saída
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl">
                <DialogHeader>
                  <DialogTitle>Registrar Nova Saída</DialogTitle>
                </DialogHeader>
                <ExitForm onSuccess={handleCloseDialog} />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
}
