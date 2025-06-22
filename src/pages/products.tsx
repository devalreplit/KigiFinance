import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { productService } from "@/service/apiService";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Edit, Trash2, Package, Loader2 } from "lucide-react";
import ProductModal from "@/components/modals/product-modal";
import { Produto } from "../../types";

export default function Products() {
  const [products, setProducts] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Produto | undefined>(undefined);
  const { toast } = useToast();

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar produtos",
        description: "Não foi possível carregar a lista de produtos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter(product =>
    product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.codigoBarras && product.codigoBarras.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.classificacao && product.classificacao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (product: Produto) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleting(id);
      await productService.delete(id);
      toast({
        title: "Produto excluído",
        description: "Produto excluído com sucesso",
      });
      loadProducts();
    } catch (error) {
      toast({
        title: "Erro ao excluir produto",
        description: "Não foi possível excluir o produto",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProduct(undefined);
  };

  const handleModalSuccess = () => {
    loadProducts();
    handleModalClose();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <div className="text-lg">Carregando produtos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Gestão de Produtos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie produtos e preços
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="mt-4 lg:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar produtos por nome, código ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <Card>
          <CardContent className="p-0">
            <table className="w-full table-fixed">
              <thead className="bg-muted/30">
                <tr className="border-b border-border">
                  <th className="w-[25%] px-4 py-4 text-left font-semibold text-foreground">
                    PRODUTO
                  </th>
                  <th className="w-[20%] px-4 py-4 text-left font-semibold text-foreground">
                    CATEGORIA
                  </th>
                  <th className="w-[15%] px-4 py-4 text-left font-semibold text-foreground">
                    PREÇO
                  </th>
                  <th className="w-[15%] px-4 py-4 text-left font-semibold text-foreground">
                    ESTOQUE
                  </th>
                  <th className="w-[10%] px-4 py-4 text-left font-semibold text-foreground">
                    STATUS
                  </th>
                  <th className="w-[15%] px-4 py-4 text-left font-semibold text-foreground">
                    AÇÕES
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-border hover:bg-accent/30 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Package className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-foreground truncate">{product.nome}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {product.codigoBarras || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-muted-foreground truncate">
                          {product.classificacao || 'Não categorizado'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-foreground">
                          {formatCurrency(product.precoUnitario)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-muted-foreground">
                          0 unidades
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={product.ativo ? "default" : "secondary"}>
                          {product.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(product)}
                            className="w-8 h-8 p-0 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                            title="Editar produto"
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                            disabled={deleting === product.id}
                            className="w-8 h-8 p-0 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors"
                            title="Excluir produto"
                          >
                            {deleting === product.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-600" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center">
                      <div className="flex flex-col items-center">
                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {searchTerm ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <Card key={product.id} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{product.nome}</h3>
                      <Badge variant={product.ativo ? "default" : "secondary"}>
                        {product.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(product)}
                      className="w-8 h-8 p-0 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                      title="Editar produto"
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      disabled={deleting === product.id}
                      className="w-8 h-8 p-0 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors"
                      title="Excluir produto"
                    >
                      {deleting === product.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-600" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span className="font-medium">Código:</span>
                    <span>{product.codigoBarras || "Não informado"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Categoria:</span>
                    <span>{product.classificacao || "Não categorizado"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Preço:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(product.precoUnitario)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Unidade:</span>
                    <span>{product.unidade}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum produto</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? "Nenhum produto encontrado" : "Comece criando um novo produto."}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Produto
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <ProductModal
        open={isModalOpen}
        onClose={handleModalClose}
        product={editingProduct}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}