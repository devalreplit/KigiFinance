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
import { AlertDialog } from "@/components/ui/alert-dialog";
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
  AlertTriangle,
  QrCode
} from "lucide-react";
import { Usuario, Empresa, Produto, Saida, ItemSaidaInput } from "../../../types";
import BarcodeScanner from "@/components/barcode-scanner";

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
  const [showScanner, setShowScanner] = useState(false);
  const [scanningIndex, setScanningIndex] = useState<number | null>(null);
  const [productSearchLoading, setProductSearchLoading] = useState(false);
  
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
    if (isOpen && expense) {
      initializeFormData();
    }
  }, [isOpen, expense]);

  useEffect(() => {
    if (isOpen && expense?.tipoSaida === "parcelada_pai") {
      loadInstallments();
    }
  }, [isOpen, expense?.tipoSaida]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersResponse, companiesResponse, productsResponse] = await Promise.all([
        userService.getAll(),
        companyService.getAll(),
        productService.getAll(),
      ]);
      
      setUsers(usersResponse);
      setCompanies(companiesResponse);
      setProducts(productsResponse);
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
    if (!expense || expense.tipoSaida !== "parcelada_pai") return;
    
    try {
      setLoadingInstallments(true);
      const installmentsData = await expenseService.getInstallments(expense.id);
      setInstallments(installmentsData);
    } catch (error) {
      console.error("Erro ao carregar parcelas:", error);
    } finally {
      setLoadingInstallments(false);
    }
  };

  const productOptions: AutocompleteOption[] = products.map(product => ({
    value: product.id.toString(),
    label: product.nome,
  }));

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

  const handleProductSearch = async (query: string) => {
    if (!query || query.length < 3) return;

    try {
      setProductSearchLoading(true);
      // Em um cenário real, você faria uma chamada para buscar produtos
      // baseado na query. Por agora, vamos filtrar os produtos locais
      // mas mantemos a estrutura para futuras integrações com API
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    } finally {
      setProductSearchLoading(false);
    }
  };

  const handleBarcodeScanned = async (barcode: string) => {
    if (scanningIndex === null) return;

    try {
      setProductSearchLoading(true);
      const product = await productService.getByBarcode(barcode);

      if (product) {
        // Verificar se o produto já está na lista em outros itens (excluindo o item atual)
        const productExistsInOtherItems = items.some(
          (item, i) =>
            i !== scanningIndex &&
            item.produtoId === product.id &&
            item.produtoId !== 0,
        );

        if (productExistsInOtherItems) {
          toast({
            title: "Produto já está na lista",
            description: "Produto já está na lista, altere a quantidade",
            variant: "destructive",
          });

          // Forçar limpeza completa do item
          const newItems = [...items];
          newItems[scanningIndex] = { 
            produtoId: 0, 
            quantidade: 1, 
            precoUnitario: 0 
          };
          setItems(newItems);

          // Forçar re-render do componente para garantir limpeza visual
          setTimeout(() => {
            setItems([...newItems]);
          }, 10);

          return;
        }

        updateItem(scanningIndex, "produtoId", product.id);
        // Note: Produto não tem precoUnitario, apenas define o produto

        toast({
          title: "Produto encontrado",
          description: `${product.nome} adicionado à lista`,
          className: "bg-green-600 text-white border-green-600",
        });
      } else {
        toast({
          title: "Produto não encontrado",
          description: "Nenhum produto encontrado com este código de barras",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao buscar produto",
        description: "Não foi possível buscar o produto pelo código de barras",
        variant: "destructive",
      });
    } finally {
      setProductSearchLoading(false);
      setShowScanner(false);
      setScanningIndex(null);
    }
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.quantidade * item.precoUnitario), 0);
  };

  const handleAddInstallment = async () => {
    if (!expense || expense.tipoSaida !== "parcelada_pai") return;

    try {
      setLoadingInstallments(true);
      await expenseService.addInstallment(expense.id);
      await loadInstallments();
      
      toast({
        title: "Parcela adicionada",
        description: "Nova parcela adicionada com sucesso",
        className: "bg-green-600 text-white border-green-600",
      });
    } catch (error) {
      toast({
        title: "Erro ao adicionar parcela",
        description: "Não foi possível adicionar nova parcela",
        variant: "destructive",
      });
    } finally {
      setLoadingInstallments(false);
    }
  };

  const handleRemoveInstallment = async () => {
    if (!expense || expense.tipoSaida !== "parcelada_pai" || installments.length === 0) return;

    try {
      setLoadingInstallments(true);
      const lastInstallment = installments[installments.length - 1];
      await expenseService.removeInstallment(lastInstallment.id);
      await loadInstallments();
      
      toast({
        title: "Parcela removida",
        description: "Última parcela removida com sucesso",
        className: "bg-green-600 text-white border-green-600",
      });
    } catch (error) {
      toast({
        title: "Erro ao remover parcela",
        description: "Não foi possível remover a parcela",
        variant: "destructive",
      });
    } finally {
      setLoadingInstallments(false);
    }
  };

  const handleSave = async () => {
    if (!expense) return;

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

    if (items.length === 0 || items.some(item => item.produtoId === 0)) {
      toast({
        title: "Erro de validação",
        description: "Todos os itens devem ter um produto selecionado",
        variant: "destructive",
      });
      return;
    }

    if (items.some(item => item.quantidade <= 0)) {
      toast({
        title: "Erro de validação",
        description: "Todos os itens devem ter quantidade maior que zero",
        variant: "destructive",
      });
      return;
    }

    if (items.some(item => item.precoUnitario <= 0)) {
      toast({
        title: "Erro de validação",
        description: "Todos os itens devem ter preço unitário maior que zero",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const updatedItems = items.map(item => ({
        produtoId: item.produtoId,
        nomeProduto: getProductName(item.produtoId),
        quantidade: item.quantidade,
        precoUnitario: item.precoUnitario,
        total: item.quantidade * item.precoUnitario,
      }));

      const updatedExpense = {
        ...expense,
        empresaId: parseInt(formData.empresaId),
        usuariosTitularesIds: selectedUsers,
        itens: updatedItems,
        observacao: formData.observacao,
        valorTotal: calculateTotal(),
      };

      await expenseService.update(expense.id, updatedExpense);

      toast({
        title: "Saída atualizada",
        description: "Saída atualizada com sucesso",
        variant: "default",
        className: "bg-green-600 text-white border-green-600",
      });

      setIsEditing(false);
      onExpenseUpdated();
    } catch (error) {
      toast({
        title: "Erro ao atualizar saída",
        description: "Não foi possível atualizar a saída",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!expense) return;

    try {
      setDeleting(true);
      await expenseService.delete(expense.id);

      toast({
        title: "Saída excluída",
        description: "Saída excluída com sucesso",
        className: "bg-green-600 text-white border-green-600",
      });

      setShowDeleteDialog(false);
      onClose();
      
      if (onExpenseDeleted) {
        onExpenseDeleted();
      }
    } catch (error) {
      toast({
        title: "Erro ao excluir saída",
        description: "Não foi possível excluir a saída",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  if (!expense) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-green-600" />
                Detalhes da Saída
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="text-green-600 border-green-300 hover:bg-green-50"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
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
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : (
            <div className="space-y-6 mt-6">
              {/* Informações Básicas */}
              <Card className="border-green-200" style={{ backgroundColor: '#f0fdf4' }}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="font-semibold text-green-800">Data da Saída</Label>
                      <p className="text-sm mt-1">{formatDate(expense.dataSaida)}</p>
                    </div>
                    <div>
                      <Label className="font-semibold text-green-800">Valor Total</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="bg-green-100 text-green-800 font-medium">
                          {formatCurrency(isEditing ? calculateTotal() : expense.valorTotal)}
                        </Badge>
                        <Badge variant={expense.tipoPagamento === "parcelado" ? "default" : "secondary"}>
                          {expense.tipoPagamento === "parcelada_pai" ? "Parcelado" : "À Vista"}
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

              {/* Responsáveis */}
              <Card className="border-green-200" style={{ backgroundColor: '#f0fdf4' }}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-green-600" />
                    <Label className="font-semibold text-green-800">Responsáveis</Label>
                  </div>
                  
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        {users.map((user) => (
                          <div key={user.id} className="flex items-center space-x-2">
                            <Checkbox
                              checked={selectedUsers.includes(user.id)}
                              onCheckedChange={() => toggleUserSelection(user.id)}
                            />
                            <Label className="text-sm">{user.nome}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm">{getUserNames(expense.usuariosTitularesIds)}</p>
                  )}
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

              {/* Itens da Compra */}
              <Card className="border-green-200" style={{ backgroundColor: '#f0fdf4' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-green-600" />
                      <Label className="font-semibold text-green-800">Itens da Compra</Label>
                    </div>
                    {isEditing && (
                      <Button
                        type="button"
                        onClick={addItem}
                        variant="outline"
                        size="sm"
                        className="bg-green-500 text-white hover:bg-green-600"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Item
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {isEditing ? (
                      items.map((item, index) => (
                        <div
                          key={index}
                          className="relative grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 border rounded-lg"
                          style={{ backgroundColor: '#f0fdf4' }}
                        >
                          {/* Botão de excluir no canto superior direito - desktop */}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className={`absolute top-2 right-2 hidden sm:flex z-10 ${
                              items.length === 1 
                                ? "text-gray-400 hover:text-gray-400 bg-gray-100 hover:bg-gray-100 border-gray-200 cursor-not-allowed" 
                                : "text-green-600 hover:text-green-700"
                            }`}
                            disabled={items.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>

                          <div className="sm:col-span-5">
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-center flex-1 sm:text-left">Produto *</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeItem(index)}
                                className={`sm:hidden ${
                                  items.length === 1 
                                    ? "text-gray-400 hover:text-gray-400 bg-gray-100 hover:bg-gray-100 border-gray-200 cursor-not-allowed" 
                                    : "text-green-600 hover:text-green-700"
                                }`}
                                disabled={items.length === 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex gap-2">
                              <Autocomplete
                                key={`autocomplete-${index}-${item.produtoId}-${Date.now()}`}
                                options={productOptions}
                                value={item.produtoId > 0 ? item.produtoId.toString() : ""}
                                onValueChange={(value) => updateItem(index, "produtoId", parseInt(value) || 0)}
                                placeholder="Digite o nome do produto..."
                                onSearch={handleProductSearch}
                                loading={productSearchLoading}
                                emptyMessage="Nenhum produto encontrado"
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setScanningIndex(index);
                                  setShowScanner(true);
                                }}
                              >
                                <QrCode className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <Label className="text-center block mb-2 sm:text-center">Quantidade * (0-20)</Label>
                            <div className="flex items-center justify-center gap-4 py-2">
                              <button
                                type="button"
                                className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() =>
                                  item.quantidade > 0 &&
                                  updateItem(index, "quantidade", item.quantidade - 1)
                                }
                                disabled={item.quantidade <= 0}
                              >
                                -
                              </button>

                              <div className="flex flex-col items-center">
                                <Input
                                  type="tel"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={item.quantidade.toString()}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9]/g, "");
                                    const numValue = parseInt(value) || 0;
                                    if (numValue >= 0 && numValue <= 20) {
                                      updateItem(index, "quantidade", numValue);
                                    }
                                  }}
                                  className="w-20 text-center text-xl font-bold"
                                  autoComplete="off"
                                  autoCorrect="off"
                                  spellCheck="false"
                                />
                                <span className="text-xs text-gray-500 mt-1">0-20</span>
                              </div>

                              <button
                                type="button"
                                className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() =>
                                  item.quantidade < 20 &&
                                  updateItem(index, "quantidade", item.quantidade + 1)
                                }
                                disabled={item.quantidade >= 20}
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <Label className="text-center block mb-2 sm:text-right text-sm font-medium text-green-700 dark:text-green-300">
                              Preço Unitário *
                            </Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10">
                                R$
                              </span>
                              <Input
                                type="text"
                                inputMode="decimal"
                                value={formatCurrency(item.precoUnitario).replace("R$", "").trim()}
                                onChange={(e) => {
                                  // Remove tudo que não é número
                                  const numericValue = e.target.value.replace(/\D/g, "");

                                  // Se vazio, define como 0
                                  if (numericValue === "") {
                                    updateItem(index, "precoUnitario", 0);
                                    return;
                                  }

                                  // Converte centavos para reais (divide por 100)
                                  const valueInReais = parseInt(numericValue) / 100;

                                  // Limita a 999999.99 (R$ 999.999,99)
                                  if (valueInReais <= 999999.99) {
                                    updateItem(index, "precoUnitario", valueInReais);
                                  }
                                }}
                                onKeyDown={(e) => {
                                  // Permite: números, backspace, delete, tab, escape, enter
                                  if (
                                    [8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                                    // Permite: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                                    (e.keyCode === 65 && e.ctrlKey === true) ||
                                    (e.keyCode === 67 && e.ctrlKey === true) ||
                                    (e.keyCode === 86 && e.ctrlKey === true) ||
                                    (e.keyCode === 88 && e.ctrlKey === true) ||
                                    // Permite: números do teclado principal e numérico
                                    (e.keyCode >= 48 && e.keyCode <= 57) ||
                                    (e.keyCode >= 96 && e.keyCode <= 105)
                                  ) {
                                    return;
                                  }
                                  // Para outros, cancela
                                  e.preventDefault();
                                }}
                                placeholder="0,00"
                                className="text-center text-lg font-medium pl-12 pr-4"
                                autoComplete="off"
                                autoCorrect="off"
                                spellCheck="false"
                              />
                            </div>
                            <div className="text-xs text-gray-500 mt-1 text-center">
                              Digite apenas números (centavos)
                            </div>
                          </div>
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
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {installments.map((installment, index) => (
                          <div key={installment.id} className="flex justify-between items-center p-2 bg-white rounded border">
                            <span className="text-sm">
                              Parcela {installment.numeroParcela} de {expense.totalParcelas}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{formatDate(installment.dataSaida)}</span>
                              <Badge variant="secondary">
                                {formatCurrency(installment.valorTotal)}
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
                  <Label className="font-semibold text-green-800 mb-3 block">Observações</Label>
                  
                  {isEditing ? (
                    <Textarea
                      value={formData.observacao}
                      onChange={(e) => setFormData(prev => ({ ...prev, observacao: e.target.value }))}
                      placeholder="Adicione observações sobre esta saída..."
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm">{expense.observacao || "Nenhuma observação"}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Confirmar Exclusão"
        description={
          expense?.tipoSaida === 'parcelada_pai' 
            ? `Esta ação irá excluir a saída parcelada e todas as ${installments.length} parcelas relacionadas. Esta ação não pode ser desfeita.`
            : 'Esta ação irá excluir a saída permanentemente. Esta ação não pode ser desfeita.'
        }
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleDelete}
        destructive={true}
      />

      {/* Scanner de Código de Barras */}
      <BarcodeScanner
        isOpen={showScanner}
        onClose={() => {
          setShowScanner(false);
          setScanningIndex(null);
        }}
        onScan={handleBarcodeScanned}
      />
    </>
  );
}