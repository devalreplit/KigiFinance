import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Autocomplete, AutocompleteOption } from "@/components/ui/autocomplete";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { authService } from "@/service/apiService";
import {
  userService,
  productService,
  companyService,
  expenseService,
} from "@/service/apiService";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Trash2,
  ShoppingCart,
  Search,
  Loader2,
  QrCode,
  MessageCircle,
} from "lucide-react";
import BarcodeScanner from "@/components/barcode-scanner";
import {
  Usuario,
  Produto,
  Empresa,
  SaidaInput,
  ItemSaidaInput,
} from "../../types";

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
    dataPrimeiraParcela: new Date().toISOString().split("T")[0],
  });

  const [items, setItems] = useState<ItemSaidaInput[]>([
    {
      produtoId: 0,
      quantidade: 1,
      precoUnitario: 0,
    },
  ]);

  // Observador para resetar parcelas quando necessário
  useEffect(() => {
    const hasValidItemsCheck = items.some(
      (item) =>
        item.produtoId !== 0 && item.quantidade > 0 && item.precoUnitario > 0,
    );

    if (formData.temParcelas && !hasValidItemsCheck) {
      setFormData((prev) => ({
        ...prev,
        temParcelas: false,
        quantidadeParcelas: 1,
        dataPrimeiraParcela: new Date().toISOString().split("T")[0],
      }));
    }
  }, [formData.temParcelas, items]);

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
    setSelectedUsers((prev) => {
      const newSelection = prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId];

      // Se não há usuários selecionados, limpar empresa
      if (newSelection.length === 0) {
        setFormData((prevForm) => ({ ...prevForm, empresaId: "" }));
      }

      return newSelection;
    });
  };

  const toggleFamiliaSelection = () => {
    const allUserIds = users.map((user) => user.id);
    if (selectedUsers.length === allUserIds.length) {
      // Se todos estão selecionados, desmarcar todos
      setSelectedUsers([]);
      setFormData((prev) => ({ ...prev, empresaId: "" }));
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
  const shouldShowObservacao =
    showObservacao || formData.observacoes.length > 0;

  // Função para verificar se produto já existe na lista
  const isProductInList = (productId: number) => {
    return items.some(
      (item) => item.produtoId === productId && productId !== 0,
    );
  };

  // Função para verificar se há itens válidos
  const hasValidItems = () => {
    return items.some(
      (item) =>
        item.produtoId !== 0 && item.quantidade > 0 && item.precoUnitario > 0,
    );
  };

  // Função para verificar se há itens inválidos
  const hasInvalidItems = () => {
    return items.some(
      (item) =>
        item.produtoId === 0 || item.quantidade <= 0 || item.precoUnitario <= 0,
    );
  };

  const addItem = () => {
    // Só adiciona se empresa foi selecionada e não há itens inválidos
    if (!formData.empresaId) {
      toast({
        title: "Selecione uma empresa",
        description: "Primeiro selecione uma empresa antes de adicionar itens",
        variant: "destructive",
      });
      return;
    }

    if (hasInvalidItems()) {
      toast({
        title: "Complete os itens atuais",
        description:
          "Complete todos os campos dos itens existentes antes de adicionar novos",
        variant: "destructive",
      });
      return;
    }

    // Adiciona um novo item vazio à lista (sem produto selecionado)
    setItems([...items, { produtoId: 0, quantidade: 1, precoUnitario: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);

      // Se não há mais itens válidos, resetar parcelas
      const hasValidItemsAfterRemoval = newItems.some(
        (item) => item.produtoId !== 0,
      );
      if (!hasValidItemsAfterRemoval) {
        setFormData((prev) => ({
          ...prev,
          valorTotal: 0,
          temParcelas: false,
          quantidadeParcelas: 1,
          dataPrimeiraParcela: new Date().toISOString().split("T")[0],
        }));
      } else {
        updateTotalValue(newItems);
      }
    }
  };

  const updateItem = (
    index: number,
    field: keyof ItemSaidaInput,
    value: any,
  ) => {
    const newItems = [...items];

    // Se está atualizando o produto, verificar se já existe em OUTROS itens
    if (field === "produtoId" && value !== 0) {
      // Verifica se o produto já existe em outros itens (excluindo o item atual)
      const productExistsInOtherItems = items.some(
        (item, i) =>
          i !== index && item.produtoId === value && item.produtoId !== 0,
      );

      if (productExistsInOtherItems) {
        toast({
          title: "Produto já está na lista",
          description: "Produto já está na lista, altere a quantidade",
          variant: "destructive",
        });

        // Forçar limpeza completa do item
        newItems[index] = { 
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
    }

    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
    updateTotalValue(newItems);
  };

  const updateTotalValue = (currentItems: ItemSaidaInput[]) => {
    const total = currentItems.reduce(
      (sum, item) => sum + item.quantidade * item.precoUnitario,
      0,
    );
    setFormData((prev) => ({ ...prev, valorTotal: total }));
  };

  // Removido - função duplicada já existe acima

  const handleProductSearch = async (query: string) => {
    if (!query || query.length < 3) return;

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
        updateItem(scanningIndex, "precoUnitario", product.precoUnitario);

        toast({
          title: "Produto encontrado",
          description: `${product.nome} adicionado à lista`,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0 || items.some((item) => item.produtoId === 0)) {
      toast({
        title: "Erro de validação",
        description: "Todos os itens devem ter um produto selecionado",
        variant: "destructive",
      });
      return;
    }

    if (items.some((item) => item.precoUnitario <= 0)) {
      toast({
        title: "Erro de validação",
        description: "Todos os itens devem ter preço unitário maior que zero",
        variant: "destructive",
      });
      return;
    }

    if (items.some((item) => item.quantidade <= 0)) {
      toast({
        title: "Erro de validação",
        description: "Todos os itens devem ter quantidade maior que zero",
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
        dataSaida: new Date().toISOString().split("T")[0],
        empresaId: parseInt(formData.empresaId),
        tipoPagamento: formData.temParcelas ? "parcelado" : "avista",
        usuariosTitularesIds: selectedUsers,
        itens: items,
        numeroParcelas: formData.temParcelas
          ? formData.quantidadeParcelas
          : undefined,
        dataPrimeiraParcela: formData.temParcelas
          ? formData.dataPrimeiraParcela
          : undefined,
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
        description:
          error.response?.data?.message || "Não foi possível registrar a saída",
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
      dataPrimeiraParcela: new Date().toISOString().split("T")[0],
    });
    setItems([
      {
        produtoId: 0,
        quantidade: 1,
        precoUnitario: 0,
      },
    ]);
    setSelectedUsers([]);
    setShowObservacao(false);
  };

  // Converter produtos para o formato do autocomplete
  const productOptions: AutocompleteOption[] = products.map((product) => ({
    value: product.id.toString(),
    label: product.nome,
    id: product.id,
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
      <div className="text-center">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          Registrar Saída
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Registre gastos e compras familiares
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3 border-2 border-green-200 dark:border-green-700 rounded-xl p-4">
                <div className="flex items-center justify-center gap-2 bg-green-100 dark:bg-green-900 py-2 px-4 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <Label className="text-sm font-semibold text-green-800 dark:text-green-300">
                    Responsáveis *
                  </Label>
                </div>
                <div className="space-y-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-750 rounded-xl border border-green-200 dark:border-gray-600 shadow-sm">
                  {/* Lista de usuários - 2 por linha no mobile, horizontal no desktop */}
                  <div className="grid grid-cols-2 md:flex md:flex-wrap md:justify-center gap-3">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center space-x-3 p-2 bg-white dark:bg-gray-800 rounded-lg border border-green-100 dark:border-gray-600 hover:shadow-sm transition-shadow"
                      >
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => toggleUserSelection(user.id)}
                          className="w-4 h-4"
                        />
                        <Label className="cursor-pointer text-sm font-medium text-gray-800 dark:text-gray-200">
                          {user.nome}
                        </Label>
                      </div>
                    ))}
                  </div>

                  {/* Separador */}
                  <div className="border-t border-green-200 dark:border-gray-600"></div>

                  {/* Opção Família - centralizada */}
                  <div className="flex justify-center">
                    <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-100 dark:border-gray-600 hover:shadow-sm transition-shadow">
                      <Checkbox
                        checked={
                          selectedUsers.length === users.length &&
                          users.length > 0
                        }
                        onCheckedChange={toggleFamiliaSelection}
                        className="w-4 h-4"
                      />
                      <Label className="font-semibold text-green-600 dark:text-green-400 cursor-pointer">
                        👨‍👩‍👧‍👦 Família
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 border-2 border-green-200 dark:border-green-700 rounded-xl p-4">
                <div className="flex items-center justify-center gap-2 bg-green-100 dark:bg-green-900 py-2 px-4 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <Label
                    htmlFor="empresaId"
                    className="text-sm font-semibold text-green-800 dark:text-green-300"
                  >
                    Empresa *
                  </Label>
                </div>
                <div
                  className={`p-3 rounded-lg border w-full ${selectedUsers.length > 0 ? "bg-white dark:bg-gray-800 border-green-100 dark:border-gray-600" : "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"}`}
                >
                  <Select
                    value={formData.empresaId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, empresaId: value }))
                    }
                    disabled={selectedUsers.length === 0}
                  >
                    <SelectTrigger
                      className={`w-full ${selectedUsers.length > 0 ? "border-green-200 focus:border-green-400 focus:ring-green-400" : "bg-gray-100 dark:bg-gray-700 border-gray-300 cursor-not-allowed"}`}
                    >
                      <SelectValue
                        placeholder={
                          selectedUsers.length === 0
                            ? "Primeiro selecione os responsáveis"
                            : "Selecione a empresa"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem
                          key={company.id}
                          value={company.id.toString()}
                        >
                          {company.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3 border-2 border-green-200 dark:border-green-700 rounded-xl p-4">
              <div className="flex items-center justify-center gap-2 bg-green-100 dark:bg-green-900 py-2 px-4 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <Label className="text-sm font-semibold text-green-800 dark:text-green-300">
                  Itens da Compra *
                </Label>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="relative grid grid-cols-1 md:grid-cols-5 gap-3 p-4 border rounded-lg"
                    style={{ backgroundColor: '#f0fdf4' }}
                  >
                    {/* Botão de excluir no canto superior direito - desktop */}
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (!formData.empresaId) {
                            toast({
                              title: "Selecione uma empresa",
                              description:
                                "Primeiro selecione uma empresa antes de remover itens",
                              variant: "destructive",
                            });
                            return;
                          }
                          removeItem(index);
                        }}
                        className="absolute top-2 right-2 text-red-600 hover:text-red-700 hidden md:flex z-10"
                        disabled={!formData.empresaId}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}

                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-center flex-1 md:text-left">Produto *</Label>
                        {items.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (!formData.empresaId) {
                                toast({
                                  title: "Selecione uma empresa",
                                  description:
                                    "Primeiro selecione uma empresa antes de remover itens",
                                  variant: "destructive",
                                });
                                return;
                              }
                              removeItem(index);
                            }}
                            className="text-red-600 hover:text-red-700 md:hidden"
                            disabled={!formData.empresaId}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Autocomplete
                          key={`autocomplete-${index}-${item.produtoId}-${Date.now()}`}
                          options={productOptions}
                          value={
                            item.produtoId > 0 ? item.produtoId.toString() : ""
                          }
                          onValueChange={(value) =>
                            updateItem(index, "produtoId", parseInt(value) || 0)
                          }
                          placeholder={
                            !formData.empresaId
                              ? "Primeiro selecione uma empresa"
                              : "Digite o nome do produto..."
                          }
                          onSearch={handleProductSearch}
                          loading={productSearchLoading}
                          emptyMessage="Nenhum produto encontrado"
                          className="flex-1"
                          disabled={!formData.empresaId}

                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (!formData.empresaId) {
                              toast({
                                title: "Selecione uma empresa",
                                description:
                                  "Primeiro selecione uma empresa antes de usar o scanner",
                                variant: "destructive",
                              });
                              return;
                            }
                            setScanningIndex(index);
                            setShowScanner(true);
                          }}
                          disabled={!formData.empresaId}
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-center block mb-2 md:text-left">Quantidade * (0-20)</Label>
                      <div className="flex items-center justify-center gap-4 py-2">
                        <button
                          type="button"
                          className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() =>
                            item.quantidade > 0 &&
                            updateItem(index, "quantidade", item.quantidade - 1)
                          }
                          disabled={item.quantidade <= 0 || !formData.empresaId}
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
                              if (!formData.empresaId) {
                                toast({
                                  title: "Selecione uma empresa",
                                  description:
                                    "Primeiro selecione uma empresa antes de alterar quantidades",
                                  variant: "destructive",
                                });
                                return;
                              }
                              const value = e.target.value.replace(
                                /[^0-9]/g,
                                "",
                              );
                              const numValue = parseInt(value) || 0;
                              if (numValue >= 0 && numValue <= 20) {
                                updateItem(index, "quantidade", numValue);
                              }
                            }}
                            className="w-20 text-center text-xl font-bold"
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck="false"
                            disabled={!formData.empresaId}
                          />
                          <span className="text-xs text-gray-500 mt-1">
                            0-20
                          </span>
                        </div>

                        <button
                          type="button"
                          className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() =>
                            item.quantidade < 20 &&
                            updateItem(index, "quantidade", item.quantidade + 1)
                          }
                          disabled={
                            item.quantidade >= 20 || !formData.empresaId
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-center block mb-2 md:text-left text-sm font-medium text-green-700 dark:text-green-300">
                        Preço Unitário *
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10">
                          R$
                        </span>
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={formatCurrency(item.precoUnitario)
                            .replace("R$", "")
                            .trim()}
                          onChange={(e) => {
                            if (!formData.empresaId) {
                              toast({
                                title: "Selecione uma empresa",
                                description:
                                  "Primeiro selecione uma empresa antes de definir preços",
                                variant: "destructive",
                              });
                              return;
                            }

                            // Remove tudo que não é número
                            const numericValue = e.target.value.replace(
                              /\D/g,
                              "",
                            );

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
                          disabled={!formData.empresaId}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1 text-center">
                        Digite apenas números (centavos)
                      </div>
                    </div>

                    <div className="hidden md:flex items-end">
                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (!formData.empresaId) {
                              toast({
                                title: "Selecione uma empresa",
                                description:
                                  "Primeiro selecione uma empresa antes de remover itens",
                                variant: "destructive",
                              });
                              return;
                            }
                            removeItem(index);
                          }}
                          className="text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border-red-200 hover:border-red-300 transition-all duration-200"
                          disabled={!formData.empresaId}
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
                  disabled={hasInvalidItems() || !formData.empresaId}
                  className="bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-300 disabled:text-gray-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Item
                </Button>
              </div>
            </div>

            {/* Payment Options */}
            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl border ${hasValidItems() ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-750 border-green-200 dark:border-gray-600" : "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="temParcelas"
                      checked={formData.temParcelas}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          temParcelas: !!checked,
                        }))
                      }
                      className="w-5 h-5"
                      disabled={!hasValidItems()}
                    />
                    <Label
                      htmlFor="temParcelas"
                      className={`text-sm font-semibold cursor-pointer ${hasValidItems() ? "text-green-800 dark:text-green-300" : "text-gray-500 dark:text-gray-400"}`}
                    >
                      💳 Pagamento Parcelado
                    </Label>
                  </div>
                  {formData.temParcelas && (
                    <div className="ml-auto">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {formData.quantidadeParcelas}x
                      </span>
                    </div>
                  )}
                </div>
                {!hasValidItems() && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Adicione itens válidos para habilitar o parcelamento
                  </p>
                )}
              </div>

              {formData.temParcelas && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-750 rounded-xl border border-green-200 dark:border-gray-600 shadow-sm">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <Label className="text-sm font-semibold text-green-800 dark:text-green-300">
                        Quantidade de Parcelas
                      </Label>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-100 dark:border-gray-600">
                      <button
                        type="button"
                        className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-xl font-bold text-green-600 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        onClick={() =>
                          formData.quantidadeParcelas > 1 &&
                          setFormData((prev) => ({
                            ...prev,
                            quantidadeParcelas: prev.quantidadeParcelas - 1,
                          }))
                        }
                        disabled={formData.quantidadeParcelas <= 1}
                      >
                        -
                      </button>

                      <div className="flex flex-col items-center flex-1">
                        <Input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={formData.quantidadeParcelas.toString()}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, "");
                            const numValue = parseInt(value) || 1;
                            if (numValue >= 1 && numValue <= 60) {
                              setFormData((prev) => ({
                                ...prev,
                                quantidadeParcelas: numValue,
                              }));
                            }
                          }}
                          className="w-full text-center text-xl font-bold border-green-200 focus:border-green-400 focus:ring-green-400"
                          autoComplete="off"
                          autoCorrect="off"
                          spellCheck="false"
                        />
                        <span className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
                          1 a 60 parcelas
                        </span>
                      </div>

                      <button
                        type="button"
                        className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-xl font-bold text-green-600 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        onClick={() =>
                          formData.quantidadeParcelas < 60 &&
                          setFormData((prev) => ({
                            ...prev,
                            quantidadeParcelas: prev.quantidadeParcelas + 1,
                          }))
                        }
                        disabled={formData.quantidadeParcelas >= 60}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <Label
                        htmlFor="dataPrimeiraParcela"
                        className="text-sm font-semibold text-green-800 dark:text-green-300"
                      >
                        Data da Primeira Parcela
                      </Label>
                    </div>
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-100 dark:border-gray-600">
                      <Input
                        id="dataPrimeiraParcela"
                        type="date"
                        value={formData.dataPrimeiraParcela}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dataPrimeiraParcela: e.target.value,
                          }))
                        }
                        className="border-green-200 focus:border-green-400 focus:ring-green-400 text-center font-medium"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <div className="space-y-4">
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-100 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-700 dark:text-green-300">
                            Valor por parcela:
                          </span>
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(
                              formData.valorTotal / formData.quantidadeParcelas,
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Preview das parcelas */}
                      <div className="mt-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-750 rounded-xl border border-green-200 dark:border-gray-600 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <h4 className="text-sm font-semibold text-green-800 dark:text-green-300">
                            Preview das Parcelas
                          </h4>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden md:block">
                          <div className="grid grid-cols-3 gap-4 mb-3 px-3 py-2 bg-green-100 dark:bg-gray-700 rounded-lg">
                            <div className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">
                              Parcela
                            </div>
                            <div className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">
                              Vencimento
                            </div>
                            <div className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide text-right">
                              Valor
                            </div>
                          </div>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {Array.from(
                              { length: formData.quantidadeParcelas },
                              (_, index) => {
                                const parcelaDate = new Date(
                                  formData.dataPrimeiraParcela,
                                );
                                parcelaDate.setMonth(
                                  parcelaDate.getMonth() + index,
                                );
                                const valorParcela =
                                  formData.valorTotal /
                                  formData.quantidadeParcelas;

                                return (
                                  <div
                                    key={index}
                                    className="grid grid-cols-3 gap-4 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-green-100 dark:border-gray-600 hover:shadow-sm transition-shadow"
                                  >
                                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                      {String(index + 1).padStart(2, "0")}ª
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                      {parcelaDate.toLocaleDateString("pt-BR")}
                                    </div>
                                    <div className="text-sm font-semibold text-green-600 dark:text-green-400 text-right">
                                      {formatCurrency(valorParcela)}
                                    </div>
                                  </div>
                                );
                              },
                            )}
                          </div>
                        </div>

                        {/* Mobile Layout */}
                        <div className="md:hidden space-y-3 max-h-48 overflow-y-auto">
                          {Array.from(
                            { length: formData.quantidadeParcelas },
                            (_, index) => {
                              const parcelaDate = new Date(
                                formData.dataPrimeiraParcela,
                              );
                              parcelaDate.setMonth(
                                parcelaDate.getMonth() + index,
                              );
                              const valorParcela =
                                formData.valorTotal /
                                formData.quantidadeParcelas;

                              return (
                                <div
                                  key={index}
                                  className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-100 dark:border-gray-600 shadow-sm"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-bold text-white">
                                          {index + 1}
                                        </span>
                                      </div>
                                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                        Parcela{" "}
                                        {String(index + 1).padStart(2, "0")}
                                      </span>
                                    </div>
                                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                      {formatCurrency(valorParcela)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                    <svg
                                      className="w-3 h-3"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      />
                                    </svg>
                                    Vence em{" "}
                                    {parcelaDate.toLocaleDateString("pt-BR")}
                                  </div>
                                </div>
                              );
                            },
                          )}
                        </div>

                        {formData.quantidadeParcelas > 6 && (
                          <div className="mt-3 pt-3 border-t border-green-200 dark:border-gray-600">
                            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                              {formData.quantidadeParcelas} parcela(s) • Role
                              para ver todas
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Observations */}
            <div className="space-y-3 border-2 border-green-200 dark:border-green-700 rounded-xl p-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-750 rounded-xl border border-green-200 dark:border-gray-600">
                <div className="flex items-center justify-center gap-3 bg-green-100 dark:bg-green-900 py-2 px-4 rounded-lg">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={toggleObservacao}
                    className="p-2 h-8 w-8 bg-green-200 dark:bg-green-800 hover:bg-green-300 dark:hover:bg-green-700 rounded-full"
                  >
                    <MessageCircle className="h-3 w-3 text-green-600 dark:text-green-300" />
                  </Button>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <Label className="text-sm font-semibold text-green-800 dark:text-green-300">
                      Observações
                    </Label>
                  </div>
                </div>
              </div>

              {shouldShowObservacao && (
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-100 dark:border-gray-600">
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        observacoes: e.target.value,
                      }))
                    }
                    placeholder="Observações adicionais sobre a saída"
                    rows={3}
                    className="border-green-200 focus:border-green-400 focus:ring-green-400"
                  />
                </div>
              )}
            </div>

            {/* Total */}
            <div className="p-6 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-xl border border-green-300 dark:border-green-600 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-lg font-semibold text-green-800 dark:text-green-200">
                    Total da Saída:
                  </span>
                </div>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(formData.valorTotal)}
                </span>
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
              <Button type="button" variant="outline" onClick={handleClear}>
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