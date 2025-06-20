import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const userSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  senha: z.string().min(4, "Senha deve ter pelo menos 4 caracteres"),
  papel: z.enum(['pai', 'mae', 'filho', 'filha'], {
    required_error: "Selecione um papel",
  }),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  onSuccess?: () => void;
  initialData?: Partial<UserFormData>;
  userId?: number;
}

export function UserForm({ onSuccess, initialData, userId }: UserFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      nome: initialData?.nome || "",
      senha: initialData?.senha || "",
      papel: initialData?.papel || undefined,
    },
  });

  const createMutation = useMutation({
    mutationFn: api.createFamilyUser,
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/family-users'] });
      form.reset();
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar usuário. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UserFormData) => api.updateFamilyUser(userId!, data),
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/family-users'] });
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar usuário. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UserFormData) => {
    if (userId) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{userId ? 'Editar Usuário' : 'Novo Usuário'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              {...form.register("nome")}
              placeholder="Digite o nome do usuário"
            />
            {form.formState.errors.nome && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.nome.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              {...form.register("senha")}
              placeholder="Digite a senha"
            />
            {form.formState.errors.senha && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.senha.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="papel">Papel na Família</Label>
            <Select 
              value={form.watch("papel")} 
              onValueChange={(value) => form.setValue("papel", value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o papel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pai">Pai</SelectItem>
                <SelectItem value="mae">Mãe</SelectItem>
                <SelectItem value="filho">Filho</SelectItem>
                <SelectItem value="filha">Filha</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.papel && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.papel.message}
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
