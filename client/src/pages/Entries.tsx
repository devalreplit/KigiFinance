import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { EntryForm } from "@/components/forms/EntryForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, ArrowUp, Calendar, Building, User } from "lucide-react";

export default function Entries() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: entradas, isLoading } = useQuery({
    queryKey: ['/api/entradas'],
    queryFn: api.getEntradas,
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

  const getUserName = (userId: number) => {
    return usuarios?.find((u: any) => u.id === userId)?.nome || 'Usuário não encontrado';
  };

  const getEmpresaName = (empresaId: number) => {
    return empresas?.find((e: any) => e.id === empresaId)?.nome || 'Empresa não encontrada';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Entradas Financeiras
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Gerencie todas as entradas de dinheiro da família
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Entrada
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Nova Entrada</DialogTitle>
            </DialogHeader>
            <EntryForm onSuccess={handleCloseDialog} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Entries List */}
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
        ) : entradas && entradas.length > 0 ? (
          entradas.map((entrada: any) => (
            <Card key={entrada.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start lg:items-center space-x-4 mb-4 lg:mb-0">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <ArrowUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Entrada Financeira
                      </h3>
                      <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-1 lg:space-y-0">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <User className="h-4 w-4 mr-1" />
                          {getUserName(entrada.usuarioTitularId)}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Building className="h-4 w-4 mr-1" />
                          {getEmpresaName(entrada.empresaPagadoraId)}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(entrada.dataReferencia).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      + R$ {parseFloat(entrada.valor).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Registrado em {new Date(entrada.dataHoraRegistro).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <ArrowUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhuma entrada registrada
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Comece registrando a primeira entrada financeira da família.
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Primeira Entrada
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Registrar Nova Entrada</DialogTitle>
                </DialogHeader>
                <EntryForm onSuccess={handleCloseDialog} />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
}
