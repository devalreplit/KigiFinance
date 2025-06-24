import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Autocomplete, AutocompleteOption } from "@/components/ui/autocomplete";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { authService } from "@/service/apiService";
import { userService, productService, companyService, expenseService } from "@/service/apiService";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ShoppingCart, Search, Loader2, QrCode, MessageCircle } from "lucide-react";
import BarcodeScanner from "@/components/barcode-scanner";
import { Usuario, Produto, Empresa, SaidaInput, ItemSaidaInput } from "../../types";

export default function Expenses() {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [companies, setCompanies] = useState<Empresa[]>([]);
  const [products, setProducts] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanningIndex, setScanningIndex] = useState<number | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showObservacao, setShowObservacao] = useState(false);
  const [productSearchLoading, setProductSearchLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    descricao: "",
    valorTotal: 0,
    metodoPagamento: "",
    empresaId: "",
    observacoes: "",
    temParcelas: false,
    quantidadeParcelas: 1,
    dataPrimeiraParcela: new Date().toISOString().split('T')[0],
  });

  const [items, setItems] = useState<ItemSaidaInput[]>([
    {
      produtoId: 0,
      quantidade: 1,
      precoUnitario: 0,
    },
  ]);

  useEffect(() => {
    loadData();
  }, []);

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

  // Funções para gerenciar seleção de usuários
  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleFamiliaSelection = () => {
    const allUserIds = users.map(user => user.id);
    if (selectedUsers.length === allUserIds.length) {
      // Se todos estão selecionados, desmarcar todos
      setSelectedUsers([]);
    } else {
      // Se nem todos estão selecionados, selecionar todos
      setSelectedUsers(allUserIds);
    }
  };

  // Função para controlar exibição do campo observação
  const toggleObservacao = () => {
    setShowObservacao(!showObservacao);
  };

  // Verificar se deve mostrar observação baseado no texto
  const shouldShowObservacao = showObservacao || formData.observacoes.length > 0;

  const addItem = () => {
    setItems([...items, { produtoId: 0, quantidade: 1, precoUnitario: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      updateTotalValue(newItems);
    }
  };

  const updateItem = (index: number, field: keyof ItemSaidaInput, value: string | number) => {
    const newItems = items.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };
        return updatedItem;
      }
      return item;
    });
    setItems(newItems);
    updateTotalValue(newItems);
  };

  const updateTotalValue = (currentItems: ItemSaidaInput[]) => {
    const total = currentItems.reduce((sum, item) => sum + (item.quantidade * item.precoUnitario), 0);
    setFormData(prev => ({ ...prev, valorTotal: total }));
  };

  const hasValidItems = () => {
    return items.some(item => item.produtoId > 0 && item.precoUnitario > 0);
  };

  const hasInvalidItems = () => {
    return items.some(item => item.produtoId === 0 || item.precoUnitario === 0);
  };

  const handleProductSearch = async (query: string) => {
    if (!query || query.length < 2) return;
    
    try {
      setProductSearchLoading(true);
      // Em um cenário real, você faria uma chamada para buscar produtos
      // baseado na query. Por agora, vamos filtrar os produtos locais
      // mas mantemos a estrutura para futuras integrações com API
      
      // Exemplo de como seria a chamada real:
      // const searchResults = await productService.search(query);
      // setProducts(searchResults);
      
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    } finally {
      setProductSearchLoading(false);
    }
  };

  const handleBarcodeScanned = async (barcode: string) => {
    if (scanningIndex === null) return;

    try {
      const product = await productService.getByBarcode(barcode);
      updateItem(scanningIndex, 'produtoId', product.id);
      setShowScanner(false);
      setScanningIndex(null);

      toast({
        title: "Produto encontrado",
        description: `${product.nome} adicionado ao item`,
      });
    } catch (error) {
      toast({
        title: "Produto não encontrado",
        description: "Código de barras não encontrado no sistema",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0 || items.some(item => item.produtoId === 0)) {
      toast({
        title: "Erro de validação",
        description: "Todos os itens devem ter um produto selecionado",
        variant: "destructive",
      });
      return;
    }

    if (selectedUsers.length === 0) {
      toast({
        title: "Erro de validação",
        description: "Selecione pelo menos um responsável pela saída",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const currentUser = await authService.getCurrentUser();
      
      const expenseData: SaidaInput = {
        usuarioRegistroId: currentUser?.id || 1,
        dataSaida: new Date().toISOString().split('T')[0],
        empresaId: parseInt(formData.empresaId),
        tipoPagamento: formData.temParcelas ? "parcelado" : "avista",
        usuariosTitularesIds: selectedUsers,
        itens: items,
        numeroParcelas: formData.temParcelas ? formData.quantidadeParcelas : undefined,
        dataPrimeiraParcela: formData.temParcelas ? formData.dataPrimeiraParcela : undefined,
        observacao: formData.observacoes,
      };

      await expenseService.create(expenseData);

      toast({
        title: "Saída registrada",
        description: "Saída registrada com sucesso",
      });

      handleClear();
    } catch (error: any) {
      toast({
        title: "Erro ao registrar saída",
        description: error.response?.data?.message || "Não foi possível registrar a saída",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData({
      descricao: "",
      valorTotal: 0,
      metodoPagamento: "",
      empresaId: "",
      observacoes: "",
      temParcelas: false,
      quantidadeParcelas: 1,
      dataPrimeiraParcela: new Date().toISOString().split('T')[0],
    });
    setItems([{
      produtoId: 0,
      quantidade: 1,
      precoUnitario: 0,
    }]);
    setSelectedUsers([]);
    setShowObservacao(false);
  };

  // Converter produtos para o formato do autocomplete
  const productOptions: AutocompleteOption[] = products.map(product => ({
    value: product.id.toString(),
    label: product.nome,
    id: product.id
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Registrar Saída
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registre gastos e compras familiares
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">Responsáveis *</Label>
                <div className="space-y-3 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                  {/* Lista de usuários - 2 por linha */}
                  <div className="grid grid-cols-2 gap-3">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => toggleUserSelection(user.id)}
                          className="w-4 h-4"
                        />
                        <Label className="cursor-pointer text-sm">
                          {user.nome}
                        </Label>
                      </div>
                    ))}
                  </div>
                  
                  {/* Separador */}
                  <div className="border-t border-gray-200 dark:border-gray-700"></div>
                  
                  {/* Opção Família - centralizada */}
                  <div className="flex justify-center">
                    <div className="flex items-center space-x-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Checkbox
                        checked={selectedUsers.length === users.length && users.length > 0}
                        onCheckedChange={toggleFamiliaSelection}
                        className="w-4 h-4"
                      />
                      <Label className="font-medium text-blue-600 dark:text-blue-400 cursor-pointer">
                        👨‍👩‍👧‍👦 Família
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="empresaId">Empresa *</Label>
                <Select value={formData.empresaId} onValueChange={(value) => setFormData(prev => ({ ...prev, empresaId: value }))}>
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
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="mb-4">
                <Label className="text-lg font-semibold">Itens da Compra</Label>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 border rounded-lg">
                    <div className="md:col-span-2">
                      <Label>Produto *</Label>
                      <div className="flex gap-2">
                        <Autocomplete
                          options={productOptions}
                          value={item.produtoId > 0 ? item.produtoId.toString() : ""}
                          onValueChange={(value) => updateItem(index, 'produtoId', parseInt(value) || 0)}
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

                    <div>
                      <Label>Quantidade * (0-20)</Label>
                      <div className="flex items-center justify-center gap-4 py-2">
                        <button
                          type="button"
                          className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => item.quantidade > 0 && updateItem(index, 'quantidade', item.quantidade - 1)}
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
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              const numValue = parseInt(value) || 0;
                              if (numValue >= 0 && numValue <= 20) {
                                updateItem(index, 'quantidade', numValue);
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
                          onClick={() => item.quantidade < 20 && updateItem(index, 'quantidade', item.quantidade + 1)}
                          disabled={item.quantidade >= 20}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label>Preço Unitário *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10">R$</span>
                        <Input
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={formatCurrency(item.precoUnitario).replace('R$', '').trim()}
                          onChange={(e) => {
                            // Remove tudo que não é número
                            const numericValue = e.target.value.replace(/\D/g, '');
                            
                            // Se vazio, define como 0
                            if (numericValue === '') {
                              updateItem(index, 'precoUnitario', 0);
                              return;
                            }
                            
                            // Converte centavos para reais (divide por 100)
                            const valueInReais = parseInt(numericValue) / 100;
                            
                            // Limita a 999999.99 (R$ 999.999,99)
                            if (valueInReais <= 999999.99) {
                              updateItem(index, 'precoUnitario', valueInReais);
                            }
                          }}
                          onKeyDown={(e) => {
                            // Permite: números, backspace, delete, tab, escape, enter
                            if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                                // Permite: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                                (e.keyCode === 65 && e.ctrlKey === true) ||
                                (e.keyCode === 67 && e.ctrlKey === true) ||
                                (e.keyCode === 86 && e.ctrlKey === true) ||
                                (e.keyCode === 88 && e.ctrlKey === true) ||
                                // Permite: números do teclado principal e numérico
                                (e.keyCode >= 48 && e.keyCode <= 57) ||
                                (e.keyCode >= 96 && e.keyCode <= 105)) {
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

                    <div className="flex items-end">
                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-center">
                <Button 
                  type="button" 
                  onClick={addItem} 
                  variant="outline" 
                  size="sm"
                  disabled={hasInvalidItems()}
                  className="bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-300 disabled:text-gray-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Item
                </Button>
              </div>
            </div>

            {/* Payment Options */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="temParcelas"
                  checked={formData.temParcelas}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, temParcelas: !!checked }))}
                />
                <Label htmlFor="temParcelas">Parcelado</Label>
              </div>

              {formData.temParcelas && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label htmlFor="quantidadeParcelas">Quantidade de Parcelas</Label>
                    <Input
                      id="quantidadeParcelas"
                      type="number"
                      min="1"
                      max="60"
                      value={formData.quantidadeParcelas}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantidadeParcelas: parseInt(e.target.value) || 1 }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="dataPrimeiraParcela">Data da Primeira Parcela</Label>
                    <Input
                      id="dataPrimeiraParcela"
                      type="date"
                      value={formData.dataPrimeiraParcela}
                      onChange={(e) => setFormData(prev => ({ ...prev, dataPrimeiraParcela: e.target.value }))}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">
                      Valor por parcela: <span className="font-semibold">{formatCurrency(formData.valorTotal / formData.quantidadeParcelas)}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Observations */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={toggleObservacao}
                  className="p-1 h-8 w-8"
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
                <Label className="text-sm font-medium">Observações</Label>
              </div>
              
              {shouldShowObservacao && (
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Observações adicionais sobre a saída"
                  rows={3}
                  className="mt-2"
                />
              )}
            </div>

            {/* Total */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold text-primary">{formatCurrency(formData.valorTotal)}</span>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={submitting || !hasValidItems()}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  "Registrar Saída"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
              >
                Limpar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          isOpen={showScanner}
          onClose={() => {
            setShowScanner(false);
            setScanningIndex(null);
          }}
          onScan={handleBarcodeScanned}
        />
      )}
    </div>
  );
}