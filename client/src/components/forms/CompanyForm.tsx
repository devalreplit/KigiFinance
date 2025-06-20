import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const companySchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface CompanyFormProps {
  onSuccess?: () => void;
  initialData?: Partial<CompanyFormData>;
  companyId?: number;
}

export function CompanyForm({ onSuccess, initialData, companyId }: CompanyFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      nome: initialData?.nome || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: api.createEmpresa,
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Empresa criada com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/empresas'] });
      form.reset();
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar empresa. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CompanyFormData) => api.updateEmpresa(companyId!, data),
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Empresa atualizada com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/empresas'] });
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar empresa. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CompanyFormData) => {
    if (companyId) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{companyId ? 'Editar Empresa' : 'Nova Empresa'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome da Empresa</Label>
            <Input
              id="nome"
              {...form.register("nome")}
              placeholder="Digite o nome da empresa"
            />
            {form.formState.errors.nome && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.nome.message}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) ? 'Salvando...' : 'Salvar'}
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
