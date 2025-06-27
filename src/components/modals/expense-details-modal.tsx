
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Autocomplete, AutocompleteOption } from "@/components/ui/autocomplete";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  userService,
  productService,
  companyService,
  expenseService,
  installmentService,
} from "@/service/apiService";
import {
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  ShoppingCart,
  Calendar,
  Users,
  Building2,
  DollarSign,
  Package,
  Eye,
  Loader2,
} from "lucide-react";
import {
  Usuario,
  Produto,
  Empresa,
  Saida,
  ItemSaidaInput,
  SaidaInput,
  Parcela,
} from "../../../types";

interface ExpenseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Saida | null;
  onExpenseUpdated: () => void;
}

export default function ExpenseDetailsModal({
  isOpen,
  onClose,
  expense,
  onExpenseUpdated,
}: ExpenseDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<Usuario[]>([]);
  const [companies, setCompanies] = useState<Empresa[]>([]);
  const [products, setProducts] = useState<Produto[]>([]);
  const [installments, setInstallments] = useState<Parcela[]>([]);
  const [loadingInstallments, setLoadingInstallments] = useState(false);
  const { toast } = useToast();

  // Estados para edição
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showObservacao, setShowObservacao] = useState(false);
  const [formData, setFormData] = useState({
    empresaId: "",
    observacoes: "",
    temParcelas: false,
    quantidadeParcelas: 1,
    dataPrimeiraParcela: new Date().toISOString().split("T")[0],
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
      if (expense.tipoPagamento === 'parcelado') {
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
    if (!expense || expense.tipoPagamento !== 'parcelado') return;
    
    try {
      setLoadingInstallments(true);
      // Carrega todas as parcelas e filtra as relacionadas a esta saída
      const allInstallments = await installmentService.getAll();
      const expenseInstallments = allInstallments.filter(
        installment => installment.saidaOriginalId === expense.id
      );
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
      observacoes: expense.observacao || "",
      temParcelas: expense.tipoPagamento === "parcelado",
      quantidadeParcelas: expense.numeroParcelas || 1,
      dataPrimeiraParcela: expense.dataPrimeiraParcela || new Date().toISOString().split("T")[0],
    });

    if (expense.itens) {
      setItems(
        expense.itens.map((item) => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
        }))
      );
    }

    setShowObservacao(Boolean(expense.observacao));
  };

  const getProductName = (produtoId: number) => {
    const product = products.find(p => p.id === produtoId);
    return product?.nome || `Produto ID: ${produtoId}`;
  };

  const getTitularesNames = (usuariosTitularesIds: number[]) => {
    const titulares = users.filter((u) => usuariosTitularesIds.includes(u.id));
    return titulares.map((t) => t.nome).join(", ") || "Usuários não encontrados";
  };

  const getEmpresaName = (empresaId: number) => {
    const empresa = companies.find((e) => e.id === empresaId);
    return empresa?.nome || "Empresa não encontrada";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancelar edição - restaurar dados originais
      initializeFormData();
    }
    setIsEditing(!isEditing);
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers((prev) => {
      const newSelection = prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId];

      if (newSelection.length === 0) {
        setFormData((prevForm) => ({ ...prevForm, empresaId: "" }));
      }

      return newSelection;
    });
  };

  const toggleFamiliaSelection = () => {
    const allUserIds = users.map((user) => user.id);
    if (selectedUsers.length === allUserIds.length) {
      setSelectedUsers([]);
      setFormData((prev) => ({ ...prev, empresaId: "" }));
    } else {
      setSelectedUsers(allUserIds);
    }
  };

  const addItem = () => {
    if (!formData.empresaId) {
      toast({
        title: "Selecione uma empresa",
        description: "Primeiro selecione uma empresa antes de adicionar itens",
        variant: "destructive",
      });
      return;
    }

    setItems([...items, { produtoId: 0, quantidade: 1, precoUnitario: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const updateItem = (
    index: number,
    field: keyof ItemSaidaInput,
    value: any
  ) => {
    const newItems = [...items];

    if (field === "produtoId" && value !== 0) {
      const productExistsInOtherItems = items.some(
        (item, i) =>
          i !== index && item.produtoId === value && item.produtoId !== 0
      );

      if (productExistsInOtherItems) {
        toast({
          title: "Produto já está na lista",
          description: "Produto já está na lista, altere a quantidade",
          variant: "destructive",
        });
        return;
      }
    }

    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce(
      (sum, item) => sum + item.quantidade * item.precoUnitario,
      0
    );
  };

  const handleSave = async () => {
    if (!expense) return;

    try {
      setSaving(true);

      // Converter itens para o formato correto incluindo nomeProduto e total
      const updatedItems = items.map(item => {
        const product = products.find(p => p.id === item.produtoId);
        return {
          ...item,
          nomeProduto: product?.nome || 'Produto não encontrado',
          total: item.quantidade * item.precoUnitario,
        };
      });

      const updatedExpenseData: Partial<Saida> = {
        empresaId: parseInt(formData.empresaId),
        usuariosTitularesIds: selectedUsers,
        itens: updatedItems,
        observacao: formData.observacoes,
        tipoPagamento: formData.temParcelas ? "parcelado" : "avista",
        numeroParcelas: formData.temParcelas ? formData.quantidadeParcelas : undefined,
        dataPrimeiraParcela: formData.temParcelas ? formData.dataPrimeiraParcela : undefined,
        valorTotal: updatedItems.reduce((sum, item) => sum + item.total, 0),
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
        description:
          error.response?.data?.message || "Não foi possível atualizar a saída",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const productOptions: AutocompleteOption[] = products.map((product) => ({
    value: product.id.toString(),
    label: product.nome,
    id: product.id,
  }));

  if (!expense) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <span>
                {isEditing ? "Editar Saída" : "Detalhes da Saída"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditToggle}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditToggle}
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
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-green-200" style={{ backgroundColor: '#f0fdf4' }}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <Label className="font-semibold text-green-800">Data da Saída</Label>
                  </div>
                  <p className="text-lg">{formatDate(expense.dataSaida)}</p>
                </CardContent>
              </Card>

              <Card className="border-green-200" style={{ backgroundColor: '#f0fdf4' }}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <Label className="font-semibold text-green-800">Valor Total</Label>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    {isEditing ? formatCurrency(calculateTotal()) : formatCurrency(expense.valorTotal)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Responsáveis */}
            <Card className="border-green-200" style={{ backgroundColor: '#f0fdf4' }}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-green-600" />
                  <Label className="font-semibold text-green-800">Responsáveis</Label>
                </div>
                {!isEditing ? (
                  <p>{getTitularesNames(expense.usuariosTitularesIds)}</p>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center space-x-3 p-2 bg-white dark:bg-gray-800 rounded-lg border border-green-100"
                        >
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => toggleUserSelection(user.id)}
                            className="w-4 h-4"
                          />
                          <Label className="cursor-pointer text-sm font-medium">
                            {user.nome}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center">
                      <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-100">
                        <Checkbox
                          checked={selectedUsers.length === users.length && users.length > 0}
                          onCheckedChange={toggleFamiliaSelection}
                          className="w-4 h-4"
                        />
                        <Label className="font-semibold text-green-600 cursor-pointer">
                          👨‍👩‍👧‍👦 Família
                        </Label>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Empresa */}
            <Card className="border-green-200" style={{ backgroundColor: '#f0fdf4' }}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-4 w-4 text-green-600" />
                  <Label className="font-semibold text-green-800">Empresa</Label>
                </div>
                {!isEditing ? (
                  <p>{getEmpresaName(expense.empresaId)}</p>
                ) : (
                  <Select
                    value={formData.empresaId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, empresaId: value }))
                    }
                    disabled={selectedUsers.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id.toString()}>
                          {company.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </CardContent>
            </Card>

            {/* Itens */}
            <Card className="border-green-200" style={{ backgroundColor: '#f0fdf4' }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-green-600" />
                    <Label className="font-semibold text-green-800">Itens da Compra</Label>
                  </div>
                  {isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addItem}
                      className="bg-green-500 text-white hover:bg-green-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Item
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  {(isEditing ? items : expense.itens || []).map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 border rounded-lg bg-white"
                    >
                      {isEditing && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="absolute top-2 right-2 text-red-600 hover:text-red-700"
                          disabled={items.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}

                      <div className="sm:col-span-5">
                        <Label className="text-sm font-medium">Produto</Label>
                        {!isEditing ? (
                          <p className="mt-1">{getProductName(item.produtoId)}</p>
                        ) : (
                          <Autocomplete
                            options={productOptions}
                            value={item.produtoId > 0 ? item.produtoId.toString() : ""}
                            onValueChange={(value) =>
                              updateItem(index, "produtoId", parseInt(value) || 0)
                            }
                            placeholder="Digite o nome do produto..."
                            className="mt-1"
                          />
                        )}
                      </div>

                      <div className="sm:col-span-3">
                        <Label className="text-sm font-medium">Quantidade</Label>
                        {!isEditing ? (
                          <p className="mt-1">{item.quantidade}</p>
                        ) : (
                          <Input
                            type="number"
                            value={item.quantidade}
                            onChange={(e) =>
                              updateItem(index, "quantidade", parseInt(e.target.value) || 0)
                            }
                            className="mt-1"
                            min="1"
                            max="20"
                          />
                        )}
                      </div>

                      <div className="sm:col-span-3">
                        <Label className="text-sm font-medium">Preço Unitário</Label>
                        {!isEditing ? (
                          <p className="mt-1">{formatCurrency(item.precoUnitario)}</p>
                        ) : (
                          <Input
                            type="text"
                            value={formatCurrency(item.precoUnitario).replace("R$", "").trim()}
                            onChange={(e) => {
                              const numericValue = e.target.value.replace(/\D/g, "");
                              const valueInReais = parseInt(numericValue || "0") / 100;
                              updateItem(index, "precoUnitario", valueInReais);
                            }}
                            className="mt-1"
                            placeholder="0,00"
                          />
                        )}
                      </div>

                      <div className="sm:col-span-1">
                        <Label className="text-sm font-medium">Total</Label>
                        <p className="mt-1 font-semibold text-green-600">
                          {formatCurrency(item.quantidade * item.precoUnitario)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tipo de Pagamento */}
            <Card className="border-green-200" style={{ backgroundColor: '#f0fdf4' }}>
              <CardContent className="p-4">
                <Label className="font-semibold text-green-800">Tipo de Pagamento</Label>
                <div className="mt-2">
                  <Badge
                    variant={expense.tipoPagamento === "parcelado" ? "default" : "secondary"}
                  >
                    {expense.tipoPagamento === "parcelado" ? "Parcelado" : "À Vista"}
                  </Badge>
                  {expense.tipoPagamento === "parcelado" && expense.numeroParcelas && (
                    <span className="ml-2 text-sm text-gray-600">
                      {expense.numeroParcelas}x de {formatCurrency(expense.valorTotal / expense.numeroParcelas)}
                    </span>
                  )}
                </div>

                {isEditing && (
                  <div className="mt-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.temParcelas}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, temParcelas: !!checked }))
                        }
                      />
                      <Label>Pagamento Parcelado</Label>
                    </div>

                    {formData.temParcelas && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <Label>Quantidade de Parcelas</Label>
                          <Input
                            type="number"
                            value={formData.quantidadeParcelas}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                quantidadeParcelas: parseInt(e.target.value) || 1,
                              }))
                            }
                            min="1"
                            max="60"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Data da Primeira Parcela</Label>
                          <Input
                            type="date"
                            value={formData.dataPrimeiraParcela}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                dataPrimeiraParcela: e.target.value,
                              }))
                            }
                            className="mt-1"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Parcelas - Mostrar apenas se for pagamento parcelado */}
            {expense.tipoPagamento === "parcelado" && (
              <Card className="border-green-200" style={{ backgroundColor: '#f0fdf4' }}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <Label className="font-semibold text-green-800">Parcelas</Label>
                  </div>
                  
                  {loadingInstallments ? (
                    <div className="flex justify-center items-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm">Carregando parcelas...</span>
                    </div>
                  ) : installments.length > 0 ? (
                    <div className="space-y-3">
                      {installments.map((installment) => (
                        <div
                          key={installment.id}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-100"
                        >
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
                                Vencimento: {new Date(installment.dataVencimento).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-green-600">
                              {formatCurrency(installment.valorParcela)}
                            </p>
                            <Badge
                              variant={
                                installment.status === 'paga' 
                                  ? 'default' 
                                  : installment.status === 'vencida' 
                                  ? 'destructive' 
                                  : 'secondary'
                              }
                              className="text-xs"
                            >
                              {installment.status === 'paga' 
                                ? 'Paga' 
                                : installment.status === 'vencida' 
                                ? 'Vencida' 
                                : 'A Vencer'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Nenhuma parcela encontrada para esta saída.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Observações */}
            {(expense.observacao || isEditing) && (
              <Card className="border-green-200" style={{ backgroundColor: '#f0fdf4' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="font-semibold text-green-800">Observações</Label>
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowObservacao(!showObservacao)}
                      >
                        {showObservacao ? <Eye className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                  {!isEditing ? (
                    <p>{expense.observacao || "Nenhuma observação"}</p>
                  ) : (
                    showObservacao && (
                      <Textarea
                        value={formData.observacoes}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, observacoes: e.target.value }))
                        }
                        placeholder="Observações adicionais..."
                        rows={3}
                      />
                    )
                  )}
                </CardContent>
              </Card>
            )}

            {/* Data de Registro */}
            <Card className="border-green-200" style={{ backgroundColor: '#f0fdf4' }}>
              <CardContent className="p-4">
                <Label className="font-semibold text-green-800">Registrado em</Label>
                <p className="mt-1 text-sm text-gray-600">
                  {formatDate(expense.dataHoraRegistro)}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
