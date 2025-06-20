import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Plus, Trash2 } from "lucide-react";

const exitSchema = z.object({
  usuarioRegistroId: z.number().min(1, "Selecione um usuário"),
  dataSaida: z.string().min(1, "Data é obrigatória"),
  empresaId: z.number().min(1, "Selecione uma empresa"),
  tipoPagamento: z.enum(['avista', 'parcelado'], {
    required_error: "Selecione o tipo de pagamento",
  }),
  usuariosTitularesIds: z.array(z.number()).min(1, "Selecione pelo menos um titular"),
  numeroParcelas: z.number().optional(),
  dataPrimeiraParcela: z.string().optional(),
  observacao: z.string().optional(),
});

type ExitFormData = z.infer<typeof exitSchema>;

interface Item {
  produtoId: number;
  quantidade: number;
  precoUnitario: number;
}

interface ExitFormProps {
  onSuccess?: () => void;
}

export function ExitForm({ onSuccess }: ExitFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [itens, setItens] = useState<Item[]>([{ produtoId: 0, quantidade: 1, precoUnitario: 0 }]);
  
  const { data: usuarios } = useQuery({
    queryKey: ['/api/family-users'],
    queryFn: api.getFamilyUsers,
  });

  const { data: empresas } = useQuery({
    queryKey: ['/api/empresas'],
    queryFn: api.getEmpresas,
  });

  const { data: produtos } = useQuery({
    queryKey: ['/api/produtos'],
    queryFn: api.getProdutos,
  });

  const form = useForm<ExitFormData>({
    resolver: zodResolver(exitSchema),
    defaultValues: {
      usuarioRegistroId: undefined,
      dataSaida: new Date().toISOString().split('T')[0],
      empresaId: undefined,
      tipoPagamento: 'avista',
      usuariosTitularesIds: [],
      observacao: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: ExitFormData & { itens: Item[] }) => api.createSaida(data),
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Saída registrada com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/saidas'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/resumo'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/transacoes'] });
      form.reset();
      setItens([{ produtoId: 0, quantidade: 1, precoUnitario: 0 }]);
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao registrar saída. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const addItem = () => {
    setItens([...itens, { produtoId: 0, quantidade: 1, precoUnitario: 0 }]);
  };

  const removeItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof Item, value: number) => {
    const newItens = [...itens];
    newItens[index] = { ...newItens[index], [field]: value };
    setItens(newItens);
  };

  const calculateTotal = () => {
    return itens.reduce((total, item) => total + (item.quantidade * item.precoUnitario), 0);
  };

  const selectAllUsers = () => {
    const allIds = usuarios?.map((u: any) => u.id) || [];
    form.setValue("usuariosTitularesIds", allIds);
  };

  const onSubmit = (data: ExitFormData) => {
    const validItens = itens.filter(item => item.produtoId > 0 && item.quantidade > 0 && item.precoUnitario > 0);
    
    if (validItens.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um item válido.",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({ ...data, itens: validItens });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Saída Financeira</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Itens da Compra */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-lg font-semibold">Itens da Compra</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </div>
            
            <div className="space-y-4">
              {itens.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label>Produto</Label>
                    <Select 
                      value={item.produtoId.toString()} 
                      onValueChange={(value) => updateItem(index, 'produtoId', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {produtos?.map((produto: any) => (
                          <SelectItem key={produto.id} value={produto.id.toString()}>
                            {produto.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={item.quantidade}
                      onChange={(e) => updateItem(index, 'quantidade', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div>
                    <Label>Preço Unit.</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.precoUnitario}
                      onChange={(e) => updateItem(index, 'precoUnitario', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div>
                    <Label>Total</Label>
                    <Input
                      value={`R$ ${(item.quantidade * item.precoUnitario).toFixed(2)}`}
                      disabled
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => removeItem(index)}
                      disabled={itens.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Total Geral:</span>
                <span className="text-2xl font-bold text-primary">
                  R$ {calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Dados da Saída */}
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
            </div>

            <div>
              <Label htmlFor="dataSaida">Data da Saída</Label>
              <Input
                id="dataSaida"
                type="date"
                {...form.register("dataSaida")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="empresaId">Empresa</Label>
              <Select 
                value={form.watch("empresaId")?.toString()} 
                onValueChange={(value) => form.setValue("empresaId", parseInt(value))}
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
            </div>

            <div>
              <Label htmlFor="tipoPagamento">Tipo de Pagamento</Label>
              <Select 
                value={form.watch("tipoPagamento")} 
                onValueChange={(value) => form.setValue("tipoPagamento", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="avista">À Vista</SelectItem>
                  <SelectItem value="parcelado">Parcelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Participantes */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-lg font-semibold">Participantes da Saída</Label>
              <Button type="button" variant="outline" size="sm" onClick={selectAllUsers}>
                Selecionar Família
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {usuarios?.map((usuario: any) => (
                <div key={usuario.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`user-${usuario.id}`}
                    checked={form.watch("usuariosTitularesIds").includes(usuario.id)}
                    onCheckedChange={(checked) => {
                      const current = form.watch("usuariosTitularesIds");
                      if (checked) {
                        form.setValue("usuariosTitularesIds", [...current, usuario.id]);
                      } else {
                        form.setValue("usuariosTitularesIds", current.filter(id => id !== usuario.id));
                      }
                    }}
                  />
                  <Label htmlFor={`user-${usuario.id}`} className="text-sm">
                    {usuario.nome}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="observacao">Observações</Label>
            <Textarea
              id="observacao"
              {...form.register("observacao")}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Registrando...' : 'Registrar Saída'}
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
