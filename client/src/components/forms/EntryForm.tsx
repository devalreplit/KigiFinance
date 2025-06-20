import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const entrySchema = z.object({
  usuarioRegistroId: z.number().min(1, "Selecione um usuário"),
  usuarioTitularId: z.number().min(1, "Selecione o titular"),
  dataReferencia: z.string().min(1, "Data é obrigatória"),
  valor: z.number().min(0.01, "Valor deve ser maior que zero"),
  empresaPagadoraId: z.number().min(1, "Selecione uma empresa"),
});

type EntryFormData = z.infer<typeof entrySchema>;

interface EntryFormProps {
  onSuccess?: () => void;
}

export function EntryForm({ onSuccess }: EntryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: usuarios } = useQuery({
    queryKey: ['/api/family-users'],
    queryFn: api.getFamilyUsers,
  });

  const { data: empresas } = useQuery({
    queryKey: ['/api/empresas'],
    queryFn: api.getEmpresas,
  });

  const form = useForm<EntryFormData>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      usuarioRegistroId: undefined,
      usuarioTitularId: undefined,
      dataReferencia: new Date().toISOString().split('T')[0],
      valor: 0,
      empresaPagadoraId: undefined,
    },
  });

  const createMutation = useMutation({
    mutationFn: api.createEntrada,
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Entrada registrada com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/entradas'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/resumo'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/transacoes'] });
      form.reset();
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao registrar entrada. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EntryFormData) => {
    createMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Entrada Financeira</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="usuarioRegistroId">Usuário que Registra</Label>
              <Select 
                value={form.watch("usuarioRegistroId")?.toString()} 
                onValueChange={(value) => form.setValue("usuarioRegistroId", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o usuário" />
                </SelectTrigger>
                <SelectContent>
                  {usuarios?.map((usuario: any) => (
                    <SelectItem key={usuario.id} value={usuario.id.toString()}>
                      {usuario.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.usuarioRegistroId && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.usuarioRegistroId.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="usuarioTitularId">Usuário Titular</Label>
              <Select 
                value={form.watch("usuarioTitularId")?.toString()} 
                onValueChange={(value) => form.setValue("usuarioTitularId", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o titular" />
                </SelectTrigger>
                <SelectContent>
                  {usuarios?.map((usuario: any) => (
                    <SelectItem key={usuario.id} value={usuario.id.toString()}>
                      {usuario.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.usuarioTitularId && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.usuarioTitularId.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dataReferencia">Data de Referência</Label>
              <Input
                id="dataReferencia"
                type="date"
                {...form.register("dataReferencia")}
              />
              {form.formState.errors.dataReferencia && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.dataReferencia.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="valor">Valor</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                {...form.register("valor", { valueAsNumber: true })}
                placeholder="0,00"
              />
              {form.formState.errors.valor && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.valor.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="empresaPagadoraId">Empresa Pagadora</Label>
            <Select 
              value={form.watch("empresaPagadoraId")?.toString()} 
              onValueChange={(value) => form.setValue("empresaPagadoraId", parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a empresa" />
              </SelectTrigger>
              <SelectContent>
                {empresas?.map((empresa: any) => (
                  <SelectItem key={empresa.id} value={empresa.id.toString()}>
                    {empresa.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.empresaPagadoraId && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.empresaPagadoraId.message}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Registrando...' : 'Registrar Entrada'}
            </Button>
            {onSuccess && (
              <Button type="button" variant="outline" onClick={onSuccess}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
