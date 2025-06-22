import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { authService } from "@/service/apiService";
import { userService, productService, companyService, expenseService } from "@/service/apiService";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ShoppingCart, Search, Loader2, QrCode } from "lucide-react";
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
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    descricao: "",
    valorTotal: 0,
    metodoPagamento: "",
    empresaId: "",
    usuarioId: "",
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

    try {
      setSubmitting(true);
      const currentUser = await authService.getCurrentUser();
      
      const expenseData: SaidaInput = {
        usuarioRegistroId: currentUser?.id || 1,
        dataSaida: new Date().toISOString().split('T')[0],
        empresaId: parseInt(formData.empresaId),
        tipoPagamento: formData.temParcelas ? "parcelado" : "avista",
        usuariosTitularesIds: [parseInt(formData.usuarioId)],
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
      usuarioId: "",
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
  };

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="usuarioId">Responsável *</Label>
                <Select value={formData.usuarioId} onValueChange={(value) => setFormData(prev => ({ ...prev, usuarioId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <div className="flex justify-between items-center mb-4">
                <Label className="text-lg font-semibold">Itens da Compra</Label>
                <Button type="button" onClick={addItem} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Item
                </Button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 border rounded-lg">
                    <div className="md:col-span-2">
                      <Label>Produto *</Label>
                      <div className="flex gap-2">
                        <Select 
                          value={item.produtoId.toString()} 
                          onValueChange={(value) => updateItem(index, 'produtoId', parseInt(value))}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Selecione o produto" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id.toString()}>
                                {product.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                      <Label>Quantidade *</Label>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantidade}
                        onChange={(e) => updateItem(index, 'quantidade', parseInt(e.target.value) || 1)}
                      />
                    </div>

                    <div>
                      <Label>Preço Unitário *</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.precoUnitario}
                        onChange={(e) => updateItem(index, 'precoUnitario', parseFloat(e.target.value) || 0)}
                      />
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
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Observações adicionais sobre a saída"
                rows={3}
              />
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
                disabled={submitting}
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