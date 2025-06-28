
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { userService, companyService, productService, expenseService } from "@/service/apiService";
import { formatCurrency } from "@/lib/utils";
import Autocomplete, { AutocompleteOption } from "@/components/ui/autocomplete";
import { 
  Calendar, 
  Edit, 
  Save, 
  X, 
  Trash2, 
  Users, 
  Building, 
  ShoppingCart, 
  Plus, 
  Minus,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { Usuario, Empresa, Produto, Saida, ItemSaidaInput } from "../../../types";

interface ExpenseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Saida | null;
  onExpenseUpdated: () => void;
  onExpenseDeleted?: () => void;
}

export default function ExpenseDetailsModal({
  isOpen,
  onClose,
  expense,
  onExpenseUpdated,
  onExpenseDeleted,
}: ExpenseDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const [users, setUsers] = useState<Usuario[]>([]);
  const [companies, setCompanies] = useState<Empresa[]>([]);
  const [products, setProducts] = useState<Produto[]>([]);
  const [installments, setInstallments] = useState<Saida[]>([]);
  const [loadingInstallments, setLoadingInstallments] = useState(false);
  
  const { toast } = useToast();

  // Estados para edição
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    empresaId: "",
    observacao: "",
    totalParcelas: 1,
  });
  const [items, setItems] = useState<ItemSaidaInput[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (expense && users.length > 0) {
      initializeFormData();
      if (expense.tipoSaida === 'parcelada_pai') {
        loadInstallments();
      }
    }
  }, [expense, users]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, companiesData, productsData] = await Promise.all([
        userService.getAll(),
        companyService.getAll(),
        productService.getAll(),
      ]);
      setUsers(usersData);
      setCompanies(companiesData);
      setProducts(productsData);
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados necessários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadInstallments = async () => {
    if (!expense || expense.tipoSaida !== 'parcelada_pai') return;
    
    try {
      setLoadingInstallments(true);
      const allExpenses = await expenseService.getAll();
      const expenseInstallments = allExpenses.filter(
        saida => saida.saidaPaiId === expense.id
      ).sort((a, b) => a.numeroParcela - b.numeroParcela);
      setInstallments(expenseInstallments);
    } catch (error) {
      console.error('Erro ao carregar parcelas:', error);
      toast({
        title: "Erro ao carregar parcelas",
        description: "Não foi possível carregar as parcelas desta saída",
        variant: "destructive",
      });
    } finally {
      setLoadingInstallments(false);
    }
  };

  const initializeFormData = () => {
    if (!expense) return;

    setSelectedUsers(expense.usuariosTitularesIds || []);
    setFormData({
      empresaId: expense.empresaId.toString(),
      observacao: expense.observacao || "",
      totalParcelas: expense.totalParcelas || 1,
    });
    setItems(expense.itens.map(item => ({
      produtoId: item.produtoId,
      quantidade: item.quantidade,
      precoUnitario: item.precoUnitario,
    })));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getUserNames = (userIds: number[]) => {
    const userNames = users.filter(u => userIds.includes(u.id)).map(u => u.nome);
    return userNames.length > 0 ? userNames.join(', ') : 'Usuários não encontrados';
  };

  const getCompanyName = (companyId: number) => {
    const company = companies.find(c => c.id === companyId);
    return company?.nome || 'Empresa não encontrada';
  };

  const getProductName = (productId: number) => {
    const product = products.find(p => p.id === productId);
    return product?.nome || 'Produto não encontrado';
  };

  const addItem = () => {
    setItems([...items, { produtoId: 0, quantidade: 1, precoUnitario: 0 }]);
  };

  const updateItem = (index: number, field: keyof ItemSaidaInput, value: number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.quantidade * item.precoUnitario), 0);
  };

  const handleAddInstallment = async () => {
    if (!expense || expense.tipoSaida !== 'parcelada_pai') return;

    try {
      setSaving(true);
      const novoNumero = Math.max(...installments.map(i => i.numeroParcela), expense.numeroParcela) + 1;
      const valorParcela = expense.valorTotal;
      
      // Calcular data da nova parcela (próximo mês da última parcela)
      const ultimaParcela = installments.length > 0 
        ? installments[installments.length - 1] 
        : expense;
      const dataUltima = new Date(ultimaParcela.dataSaida);
      const novaData = new Date(dataUltima);
      novaData.setMonth(novaData.getMonth() + 1);

      const novaParcela = {
        saidaPaiId: expense.id,
        tipoSaida: 'parcela' as const,
        numeroParcela: novoNumero,
        usuarioRegistroId: expense.usuarioRegistroId,
        dataSaida: novaData.toISOString().split('T')[0],
        empresaId: expense.empresaId,
        tipoPagamento: expense.tipoPagamento,
        usuariosTitularesIds: expense.usuariosTitularesIds,
        itens: [],
        observacao: `Parcela ${novoNumero}/${(expense.totalParcelas || 1) + 1}`,
      };

      await expenseService.create(novaParcela);
      
      // Atualizar total de parcelas da saída pai
      await expenseService.update(expense.id, {
        totalParcelas: (expense.totalParcelas || 1) + 1
      });

      toast({
        title: "Parcela adicionada",
        description: "Nova parcela criada com sucesso",
      });

      loadInstallments();
      onExpenseUpdated();
    } catch (error) {
      toast({
        title: "Erro ao adicionar parcela",
        description: "Não foi possível adicionar a nova parcela",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveInstallment = async () => {
    if (!expense || expense.tipoSaida !== 'parcelada_pai' || installments.length === 0) return;

    try {
      setSaving(true);
      const ultimaParcela = installments[installments.length - 1];
      
      // Verificar se a parcela já foi paga (data já passou)
      if (new Date(ultimaParcela.dataSaida) <= new Date()) {
        toast({
          title: "Não é possível remover",
          description: "Não é possível remover uma parcela que já venceu",
          variant: "destructive",
        });
        return;
      }

      await expenseService.delete(ultimaParcela.id);
      
      // Atualizar total de parcelas da saída pai
      await expenseService.update(expense.id, {
        totalParcelas: Math.max(1, (expense.totalParcelas || 1) - 1)
      });

      toast({
        title: "Parcela removida",
        description: "Parcela removida com sucesso",
      });

      loadInstallments();
      onExpenseUpdated();
    } catch (error) {
      toast({
        title: "Erro ao remover parcela",
        description: "Não foi possível remover a parcela",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!expense) return;

    try {
      setSaving(true);

      // Validações
      if (selectedUsers.length === 0) {
        toast({
          title: "Erro de validação",
          description: "Selecione pelo menos um responsável",
          variant: "destructive",
        });
        return;
      }

      if (!formData.empresaId) {
        toast({
          title: "Erro de validação",
          description: "Selecione uma empresa",
          variant: "destructive",
        });
        return;
      }

      if (items.length === 0 || items.some(item => item.produtoId === 0 || item.quantidade <= 0 || item.precoUnitario <= 0)) {
        toast({
          title: "Erro de validação",
          description: "Todos os itens devem ter produto, quantidade e preço válidos",
          variant: "destructive",
        });
        return;
      }

      const valorTotal = calculateTotal();

      const updatedExpenseData = {
        empresaId: parseInt(formData.empresaId),
        usuariosTitularesIds: selectedUsers,
        observacao: formData.observacao,
        valorTotal: valorTotal,
        itens: items.map(item => {
          const product = products.find(p => p.id === item.produtoId);
          return {
            produtoId: item.produtoId,
            nomeProduto: product?.nome || 'Produto não encontrado',
            quantidade: item.quantidade,
            precoUnitario: item.precoUnitario,
            total: item.quantidade * item.precoUnitario,
          };
        }),
      };

      await expenseService.update(expense.id, updatedExpenseData);

      toast({
        title: "Saída atualizada",
        description: "Saída atualizada com sucesso",
      });

      setIsEditing(false);
      onExpenseUpdated();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar saída",
        description: error.response?.data?.message || "Não foi possível atualizar a saída",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!expense || !onExpenseDeleted) return;

    try {
      setDeleting(true);

      // Se for saída parcelada, deletar também as parcelas filhas
      if (expense.tipoSaida === 'parcelada_pai') {
        for (const installment of installments) {
          await expenseService.delete(installment.id);
        }
      }

      await expenseService.delete(expense.id);

      toast({
        title: "Saída excluída",
        description: "Saída e todas as parcelas relacionadas foram excluídas com sucesso",
      });

      setShowDeleteDialog(false);
      onClose();
      onExpenseDeleted();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir saída",
        description: error.response?.data?.message || "Não foi possível excluir a saída",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const productOptions: AutocompleteOption[] = products.map((product) => ({
    value: product.id.toString(),
    label: product.nome,
    id: product.id,
  }));

  if (!expense) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Detalhes da Saída</span>
              <div className="flex gap-2">
                {!isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        initializeFormData();
                      }}
                      disabled={saving}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Salvar
                    </Button>
                  </>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Carregando dados...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Informações Básicas */}
              <Card className="border-green-200" style={{ backgroundColor: '#f0fdf4' }}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="font-semibold text-green-800">Data da Saída</Label>
                      <p className="text-sm mt-1">{formatDate(expense.dataSaida)}</p>
                    </div>
                    <div>
                      <Label className="font-semibold text-green-800">Valor Total</Label>
                      <p className="text-lg font-bold text-green-600 mt-1">
                        {formatCurrency(isEditing ? calculateTotal() : expense.valorTotal)}
                      </p>
                    </div>
                    <div>
                      <Label className="font-semibold text-green-800">Tipo de Pagamento</Label>
                      <div className="mt-1">
                        <Badge variant={expense.tipoSaida === "parcelada_pai" ? "default" : "secondary"}>
                          {expense.tipoSaida === "parcelada_pai" ? "Parcelado" : "À Vista"}
                        </Badge>
                        {expense.tipoSaida === "parcelada_pai" && expense.totalParcelas && (
                          <span className="ml-2 text-sm text-gray-600">
                            {expense.totalParcelas}x de {formatCurrency(expense.valorTotal)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="font-semibold text-green-800">Registrado em</Label>
                      <p className="text-sm mt-1">{formatDate(expense.dataHoraRegistro)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Empresa */}
              <Card className="border-green-200" style={{ backgroundColor: '#f0fdf4' }}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Building className="h-4 w-4 text-green-600" />
                    <Label className="font-semibold text-green-800">Empresa</Label>
                  </div>
                  
                  {isEditing ? (
                    <Select value={formData.empresaId} onValueChange={(value) => setFormData(prev => ({ ...prev, empresaId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id.toString()}>
                            {company.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm">{getCompanyName(expense.empresaId)}</p>
                  )}
                </CardContent>
              </Card>

              {/* Responsáveis */}
              <Card className="border-green-200" style={{ backgroundColor: '#f0fdf4' }}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-green-600" />
                    <Label className="font-semibold text-green-800">Responsáveis</Label>
                  </div>
                  
                  {isEditing ? (
                    <div className="space-y-2">
                      {users.map((user) => (
                        <div key={user.id} className="flex items-center space-x-2">
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedUsers([...selectedUsers, user.id]);
                              } else {
                                setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                              }
                            }}
                          />
                          <Label className="cursor-pointer">{user.nome}</Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm">{getUserNames(expense.usuariosTitularesIds)}</p>
                  )}
                </CardContent>
              </Card>

              {/* Itens da Compra */}
              <Card className="border-green-200" style={{ backgroundColor: '#f0fdf4' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-green-600" />
                      <Label className="font-semibold text-green-800">Itens da Compra</Label>
                    </div>
                    {isEditing && (
                      <Button variant="outline" size="sm" onClick={addItem}>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Item
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {isEditing ? (
                      items.map((item, index) => (
                        <div key={index} className="flex gap-2 items-end p-3 bg-white rounded border">
                          <div className="flex-1">
                            <Label className="text-xs">Produto</Label>
                            <Autocomplete
                              options={productOptions}
                              value={item.produtoId.toString()}
                              onValueChange={(value) => updateItem(index, 'produtoId', parseInt(value))}
                              placeholder="Selecione um produto"
                            />
                          </div>
                          <div className="w-24">
                            <Label className="text-xs">Qtd</Label>
                            <Input
                              type="number"
                              value={item.quantidade}
                              onChange={(e) => updateItem(index, 'quantidade', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.1"
                            />
                          </div>
                          <div className="w-32">
                            <Label className="text-xs">Preço Unit.</Label>
                            <Input
                              type="number"
                              value={item.precoUnitario}
                              onChange={(e) => updateItem(index, 'precoUnitario', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div className="w-32">
                            <Label className="text-xs">Total</Label>
                            <div className="p-2 bg-gray-50 rounded text-sm font-medium">
                              {formatCurrency(item.quantidade * item.precoUnitario)}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(index)}
                            disabled={items.length === 1}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      expense.itens.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-white rounded border">
                          <div>
                            <p className="font-medium">{item.nomeProduto}</p>
                            <p className="text-sm text-gray-600">
                              {item.quantidade} × {formatCurrency(item.precoUnitario)}
                            </p>
                          </div>
                          <p className="font-bold text-green-600">
                            {formatCurrency(item.total)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Parcelas - Apenas para saídas parceladas */}
              {expense.tipoSaida === "parcelada_pai" && (
                <Card className="border-green-200" style={{ backgroundColor: '#f0fdf4' }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-green-600" />
                        <Label className="font-semibold text-green-800">Parcelas</Label>
                      </div>
                      {isEditing && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRemoveInstallment}
                            disabled={saving || installments.length === 0}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <Minus className="h-4 w-4 mr-2" />
                            Remover Parcela
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAddInstallment}
                            disabled={saving}
                            className="text-green-600 border-green-300 hover:bg-green-50"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Parcela
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {loadingInstallments ? (
                      <div className="flex justify-center items-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm">Carregando parcelas...</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Primeira parcela (saída pai) */}
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-100">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-green-600">1</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Parcela 1</p>
                              <p className="text-xs text-gray-500">
                                Vencimento: {formatDate(expense.dataSaida)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-green-600">
                              {formatCurrency(expense.valorTotal)}
                            </p>
                            <Badge variant="default" className="text-xs">Paga</Badge>
                          </div>
                        </div>

                        {/* Parcelas filhas */}
                        {installments.map((installment) => (
                          <div key={installment.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-100">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-green-600">
                                  {installment.numeroParcela}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium">
                                  Parcela {installment.numeroParcela}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Vencimento: {formatDate(installment.dataSaida)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-green-600">
                                {formatCurrency(installment.valorTotal)}
                              </p>
                              <Badge
                                variant={
                                  new Date(installment.dataSaida) <= new Date() 
                                    ? 'default' 
                                    : 'secondary'
                                }
                                className="text-xs"
                              >
                                {new Date(installment.dataSaida) <= new Date() ? 'Paga' : 'A vencer'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Observações */}
              <Card className="border-green-200" style={{ backgroundColor: '#f0fdf4' }}>
                <CardContent className="p-4">
                  <Label className="font-semibold text-green-800">Observações</Label>
                  {isEditing ? (
                    <Textarea
                      value={formData.observacao}
                      onChange={(e) => setFormData(prev => ({ ...prev, observacao: e.target.value }))}
                      placeholder="Digite observações sobre esta saída..."
                      className="mt-2"
                    />
                  ) : (
                    <p className="text-sm mt-2">{expense.observacao || "Nenhuma observação"}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              {expense?.tipoSaida === 'parcelada_pai' 
                ? `Esta ação irá excluir a saída parcelada e todas as ${installments.length} parcelas relacionadas. Esta ação não pode ser desfeita.`
                : 'Esta ação irá excluir a saída permanentemente. Esta ação não pode ser desfeita.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
