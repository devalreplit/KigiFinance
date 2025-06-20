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

const productSchema = z.object({
  codigoBarras: z.string().optional(),
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  unidade: z.string().min(1, "Unidade é obrigatória"),
  classificacao: z.string().min(1, "Classificação é obrigatória"),
  precoUnitario: z.number().min(0.01, "Preço deve ser maior que zero"),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  onSuccess?: () => void;
  initialData?: Partial<ProductFormData>;
  productId?: number;
}

export function ProductForm({ onSuccess, initialData, productId }: ProductFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      codigoBarras: initialData?.codigoBarras || "",
      nome: initialData?.nome || "",
      unidade: initialData?.unidade || "",
      classificacao: initialData?.classificacao || "",
      precoUnitario: initialData?.precoUnitario || 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: api.createProduto,
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Produto criado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/produtos'] });
      form.reset();
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar produto. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProductFormData) => api.updateProduto(productId!, data),
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/produtos'] });
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar produto. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductFormData) => {
    if (productId) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{productId ? 'Editar Produto' : 'Novo Produto'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome do Produto</Label>
              <Input
                id="nome"
                {...form.register("nome")}
                placeholder="Digite o nome do produto"
              />
              {form.formState.errors.nome && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.nome.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="codigoBarras">Código de Barras</Label>
              <Input
                id="codigoBarras"
                {...form.register("codigoBarras")}
                placeholder="Digite ou escaneie o código"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="unidade">Unidade</Label>
              <Input
                id="unidade"
                {...form.register("unidade")}
                placeholder="kg, l, un, etc."
              />
              {form.formState.errors.unidade && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.unidade.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="classificacao">Classificação</Label>
              <Input
                id="classificacao"
                {...form.register("classificacao")}
                placeholder="Alimentação, Limpeza, etc."
              />
              {form.formState.errors.classificacao && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.classificacao.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="precoUnitario">Preço Unitário</Label>
              <Input
                id="precoUnitario"
                type="number"
                step="0.01"
                {...form.register("precoUnitario", { valueAsNumber: true })}
                placeholder="0,00"
              />
              {form.formState.errors.precoUnitario && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.precoUnitario.message}
                </p>
              )}
            </div>
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
