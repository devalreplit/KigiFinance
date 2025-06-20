import {
  users,
  familyUsers,
  empresas,
  produtos,
  entradas,
  saidas,
  itensSaida,
  parcelas,
  type User,
  type UpsertUser,
  type FamilyUser,
  type FamilyUserInput,
  type Empresa,
  type EmpresaInput,
  type Produto,
  type ProdutoInput,
  type Entrada,
  type EntradaInput,
  type Saida,
  type SaidaInput,
  type Parcela,
  type ParcelaInput,
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Family user operations
  getFamilyUsers(): Promise<FamilyUser[]>;
  getFamilyUser(id: number): Promise<FamilyUser | undefined>;
  getFamilyUserByUserId(userId: string): Promise<FamilyUser | undefined>;
  createFamilyUser(data: FamilyUserInput & { userId: string }): Promise<FamilyUser>;
  updateFamilyUser(id: number, data: Partial<FamilyUserInput>): Promise<FamilyUser>;
  deleteFamilyUser(id: number): Promise<void>;
  
  // Company operations
  getEmpresas(): Promise<Empresa[]>;
  getEmpresa(id: number): Promise<Empresa | undefined>;
  createEmpresa(data: EmpresaInput): Promise<Empresa>;
  updateEmpresa(id: number, data: Partial<EmpresaInput>): Promise<Empresa>;
  deleteEmpresa(id: number): Promise<void>;
  
  // Product operations
  getProdutos(): Promise<Produto[]>;
  getProduto(id: number): Promise<Produto | undefined>;
  searchProdutos(query: string): Promise<Produto[]>;
  createProduto(data: ProdutoInput): Promise<Produto>;
  updateProduto(id: number, data: Partial<ProdutoInput>): Promise<Produto>;
  deleteProduto(id: number): Promise<void>;
  
  // Entry operations
  getEntradas(): Promise<Entrada[]>;
  createEntrada(data: EntradaInput): Promise<Entrada>;
  
  // Exit operations
  getSaidas(): Promise<Saida[]>;
  createSaida(data: SaidaInput & { itens: any[] }): Promise<Saida>;
  
  // Installment operations
  getParcelas(): Promise<Parcela[]>;
  getParcelasPendentes(): Promise<Parcela[]>;
  updateParcelaStatus(id: number, status: string, dataPagamento?: string): Promise<Parcela>;
  
  // Dashboard operations
  getResumoFinanceiro(): Promise<any>;
  getUltimasTransacoes(): Promise<any[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private familyUsers: Map<number, FamilyUser> = new Map();
  private empresas: Map<number, Empresa> = new Map();
  private produtos: Map<number, Produto> = new Map();
  private entradas: Map<number, Entrada> = new Map();
  private saidas: Map<number, Saida> = new Map();
  private itensSaida: Map<number, any> = new Map();
  private parcelas: Map<number, Parcela> = new Map();
  
  private currentUserId = 1;
  private currentFamilyUserId = 1;
  private currentEmpresaId = 1;
  private currentProdutoId = 1;
  private currentEntradaId = 1;
  private currentSaidaId = 1;
  private currentItemSaidaId = 1;
  private currentParcelaId = 1;

  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    if (existingUser) {
      const updatedUser = { ...existingUser, ...userData, updatedAt: new Date() };
      this.users.set(userData.id!, updatedUser);
      return updatedUser;
    } else {
      const newUser: User = {
        ...userData,
        id: userData.id!,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.users.set(userData.id!, newUser);
      return newUser;
    }
  }

  // Family user operations
  async getFamilyUsers(): Promise<FamilyUser[]> {
    return Array.from(this.familyUsers.values());
  }

  async getFamilyUser(id: number): Promise<FamilyUser | undefined> {
    return this.familyUsers.get(id);
  }

  async getFamilyUserByUserId(userId: string): Promise<FamilyUser | undefined> {
    return Array.from(this.familyUsers.values()).find(u => u.userId === userId);
  }

  async createFamilyUser(data: FamilyUserInput & { userId: string }): Promise<FamilyUser> {
    const familyUser: FamilyUser = {
      ...data,
      id: this.currentFamilyUserId++,
      createdAt: new Date(),
    };
    this.familyUsers.set(familyUser.id, familyUser);
    return familyUser;
  }

  async updateFamilyUser(id: number, data: Partial<FamilyUserInput>): Promise<FamilyUser> {
    const existing = this.familyUsers.get(id);
    if (!existing) throw new Error('Family user not found');
    
    const updated = { ...existing, ...data };
    this.familyUsers.set(id, updated);
    return updated;
  }

  async deleteFamilyUser(id: number): Promise<void> {
    this.familyUsers.delete(id);
  }

  // Company operations
  async getEmpresas(): Promise<Empresa[]> {
    return Array.from(this.empresas.values());
  }

  async getEmpresa(id: number): Promise<Empresa | undefined> {
    return this.empresas.get(id);
  }

  async createEmpresa(data: EmpresaInput): Promise<Empresa> {
    const empresa: Empresa = {
      ...data,
      id: this.currentEmpresaId++,
      createdAt: new Date(),
    };
    this.empresas.set(empresa.id, empresa);
    return empresa;
  }

  async updateEmpresa(id: number, data: Partial<EmpresaInput>): Promise<Empresa> {
    const existing = this.empresas.get(id);
    if (!existing) throw new Error('Empresa not found');
    
    const updated = { ...existing, ...data };
    this.empresas.set(id, updated);
    return updated;
  }

  async deleteEmpresa(id: number): Promise<void> {
    this.empresas.delete(id);
  }

  // Product operations
  async getProdutos(): Promise<Produto[]> {
    return Array.from(this.produtos.values());
  }

  async getProduto(id: number): Promise<Produto | undefined> {
    return this.produtos.get(id);
  }

  async searchProdutos(query: string): Promise<Produto[]> {
    const produtos = Array.from(this.produtos.values());
    return produtos.filter(p => 
      p.nome.toLowerCase().includes(query.toLowerCase())
    );
  }

  async createProduto(data: ProdutoInput): Promise<Produto> {
    const produto: Produto = {
      ...data,
      id: this.currentProdutoId++,
      createdAt: new Date(),
    };
    this.produtos.set(produto.id, produto);
    return produto;
  }

  async updateProduto(id: number, data: Partial<ProdutoInput>): Promise<Produto> {
    const existing = this.produtos.get(id);
    if (!existing) throw new Error('Produto not found');
    
    const updated = { ...existing, ...data };
    this.produtos.set(id, updated);
    return updated;
  }

  async deleteProduto(id: number): Promise<void> {
    this.produtos.delete(id);
  }

  // Entry operations
  async getEntradas(): Promise<Entrada[]> {
    return Array.from(this.entradas.values());
  }

  async createEntrada(data: EntradaInput): Promise<Entrada> {
    const entrada: Entrada = {
      ...data,
      id: this.currentEntradaId++,
      dataHoraRegistro: new Date(),
    };
    this.entradas.set(entrada.id, entrada);
    return entrada;
  }

  // Exit operations
  async getSaidas(): Promise<Saida[]> {
    return Array.from(this.saidas.values());
  }

  async createSaida(data: SaidaInput & { itens: any[] }): Promise<Saida> {
    const valorTotal = data.itens.reduce((sum, item) => sum + (item.quantidade * item.precoUnitario), 0);
    
    const saida: Saida = {
      ...data,
      id: this.currentSaidaId++,
      dataHoraRegistro: new Date(),
      valorTotal: valorTotal.toString(),
    };
    this.saidas.set(saida.id, saida);

    // Create items
    for (const item of data.itens) {
      const itemSaida = {
        id: this.currentItemSaidaId++,
        saidaId: saida.id,
        produtoId: item.produtoId,
        quantidade: item.quantidade.toString(),
        precoUnitario: item.precoUnitario.toString(),
        total: (item.quantidade * item.precoUnitario).toString(),
      };
      this.itensSaida.set(itemSaida.id, itemSaida);
    }

    return saida;
  }

  // Installment operations
  async getParcelas(): Promise<Parcela[]> {
    return Array.from(this.parcelas.values());
  }

  async getParcelasPendentes(): Promise<Parcela[]> {
    return Array.from(this.parcelas.values()).filter(p => p.status !== 'paga');
  }

  async updateParcelaStatus(id: number, status: string, dataPagamento?: string): Promise<Parcela> {
    const existing = this.parcelas.get(id);
    if (!existing) throw new Error('Parcela not found');
    
    const updated = { 
      ...existing, 
      status, 
      dataPagamento: dataPagamento || existing.dataPagamento 
    };
    this.parcelas.set(id, updated);
    return updated;
  }

  // Dashboard operations
  async getResumoFinanceiro(): Promise<any> {
    const entradas = Array.from(this.entradas.values());
    const saidas = Array.from(this.saidas.values());
    const parcelas = Array.from(this.parcelas.values());

    const totalEntradas = entradas.reduce((sum, e) => sum + parseFloat(e.valor), 0);
    const totalSaidas = saidas.reduce((sum, s) => sum + parseFloat(s.valorTotal), 0);
    const totalPendentes = parcelas
      .filter(p => p.status !== 'paga')
      .reduce((sum, p) => sum + parseFloat(p.valorParcela), 0);

    return {
      saldoFamiliar: totalEntradas - totalSaidas,
      totalEntradas,
      totalSaidas,
      totalParcelado: parcelas.reduce((sum, p) => sum + parseFloat(p.valorParcela), 0),
      totalPago: parcelas
        .filter(p => p.status === 'paga')
        .reduce((sum, p) => sum + parseFloat(p.valorParcela), 0),
      totalPendentes,
    };
  }

  async getUltimasTransacoes(): Promise<any[]> {
    const entradas = Array.from(this.entradas.values());
    const saidas = Array.from(this.saidas.values());

    const transacoes = [
      ...entradas.map(e => ({
        id: e.id,
        tipo: 'entrada' as const,
        data: e.dataReferencia,
        valor: parseFloat(e.valor),
        descricao: `Entrada financeira`,
      })),
      ...saidas.map(s => ({
        id: s.id,
        tipo: 'saida' as const,
        data: s.dataSaida,
        valor: parseFloat(s.valorTotal),
        descricao: `Saída financeira`,
      })),
    ];

    return transacoes.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).slice(0, 10);
  }
}

export const storage = new MemStorage();
