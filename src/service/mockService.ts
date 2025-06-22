
import {
  Usuario,
  UsuarioInput,
  Empresa,
  EmpresaInput,
  Produto,
  ProdutoInput,
  Entrada,
  EntradaInput,
  Saida,
  SaidaInput,
} from '../../types';

// Sistema de storage local persistente
class MockStorage {
  private static getStorageKey(entity: string): string {
    return `kigi_mock_${entity}`;
  }

  static get<T>(entity: string, defaultData: T[]): T[] {
    try {
      const stored = localStorage.getItem(this.getStorageKey(entity));
      return stored ? JSON.parse(stored) : defaultData;
    } catch {
      return defaultData;
    }
  }

  static set<T>(entity: string, data: T[]): void {
    localStorage.setItem(this.getStorageKey(entity), JSON.stringify(data));
  }

  static clear(): void {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('kigi_mock_'));
    keys.forEach(key => localStorage.removeItem(key));
  }
}

// Dados iniciais
const initialUsers: Usuario[] = [
  {
    id: 1,
    nome: 'Admin',
    email: 'admin@kigi.com',
    senha: 'admin',
    papel: 'pai',
    ativo: true,
    criadoEm: '2024-01-01T00:00:00.000Z',
    atualizadoEm: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    nome: 'Maria Silva',
    email: 'maria@email.com',
    senha: '123456',
    papel: 'mae',
    ativo: true,
    criadoEm: '2024-01-01T00:00:00.000Z',
    atualizadoEm: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 3,
    nome: 'Pedro Silva',
    email: 'pedro@email.com',
    senha: '123456',
    papel: 'filho',
    ativo: true,
    criadoEm: '2024-01-01T00:00:00.000Z',
    atualizadoEm: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 4,
    nome: 'Ana Silva',
    email: 'ana@email.com',
    senha: '123456',
    papel: 'filha',
    ativo: true,
    criadoEm: '2024-01-01T00:00:00.000Z',
    atualizadoEm: '2024-01-01T00:00:00.000Z',
  },
];

const initialCompanies: Empresa[] = [
  {
    id: 1,
    nome: 'Supermercado ABC',
    cnpj: '12.345.678/0001-90',
    categoria: 'Alimentação',
    ativo: true,
    criadoEm: '2024-01-01T00:00:00.000Z',
    atualizadoEm: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    nome: 'Farmácia Central',
    cnpj: '98.765.432/0001-10',
    categoria: 'Saúde',
    ativo: true,
    criadoEm: '2024-01-01T00:00:00.000Z',
    atualizadoEm: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 3,
    nome: 'Posto Shell',
    cnpj: '11.222.333/0001-44',
    categoria: 'Combustível',
    ativo: true,
    criadoEm: '2024-01-01T00:00:00.000Z',
    atualizadoEm: '2024-01-01T00:00:00.000Z',
  },
];

const initialProducts: Produto[] = [
  {
    id: 1,
    codigoBarras: '7891234567890',
    nome: 'Arroz Integral 5kg',
    unidade: 'kg',
    classificacao: 'Alimentação',
    precoUnitario: 15.99,
    ativo: true,
    criadoEm: '2024-01-01T00:00:00.000Z',
    atualizadoEm: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    codigoBarras: '7891234567891',
    nome: 'Feijão Preto 1kg',
    unidade: 'kg',
    classificacao: 'Alimentação',
    precoUnitario: 8.50,
    ativo: true,
    criadoEm: '2024-01-01T00:00:00.000Z',
    atualizadoEm: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 3,
    codigoBarras: '7891234567892',
    nome: 'Óleo de Soja 900ml',
    unidade: 'ml',
    classificacao: 'Alimentação',
    precoUnitario: 4.99,
    ativo: true,
    criadoEm: '2024-01-01T00:00:00.000Z',
    atualizadoEm: '2024-01-01T00:00:00.000Z',
  },
];

const initialIncomes: Entrada[] = [
  {
    id: 1,
    usuarioRegistroId: 1,
    dataHoraRegistro: '2024-01-15T10:30:00.000Z',
    usuarioTitularId: 1,
    dataReferencia: '2024-01-15',
    valor: 5000.00,
    empresaPagadoraId: 1,
  },
  {
    id: 2,
    usuarioRegistroId: 2,
    dataHoraRegistro: '2024-01-20T14:00:00.000Z',
    usuarioTitularId: 2,
    dataReferencia: '2024-01-20',
    valor: 3500.00,
    empresaPagadoraId: 2,
  },
];

const initialExpenses: Saida[] = [
  {
    id: 1,
    usuarioRegistroId: 1,
    dataHoraRegistro: '2024-01-16T15:45:00.000Z',
    dataSaida: '2024-01-16',
    empresaId: 1,
    tipoPagamento: 'avista',
    usuariosTitularesIds: [1, 2],
    itens: [
      {
        produtoId: 1,
        nomeProduto: 'Arroz Integral 5kg',
        quantidade: 2,
        precoUnitario: 15.99,
        total: 31.98,
      },
      {
        produtoId: 2,
        nomeProduto: 'Feijão Preto 1kg',
        quantidade: 3,
        precoUnitario: 8.50,
        total: 25.50,
      },
    ],
    valorTotal: 57.48,
    observacao: 'Compras do mês',
  },
];

// Função para simular delay de rede
const mockDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Inicializar dados se não existirem
const initializeData = () => {
  if (!localStorage.getItem('kigi_mock_users')) {
    MockStorage.set('users', initialUsers);
  }
  if (!localStorage.getItem('kigi_mock_companies')) {
    MockStorage.set('companies', initialCompanies);
  }
  if (!localStorage.getItem('kigi_mock_products')) {
    MockStorage.set('products', initialProducts);
  }
  if (!localStorage.getItem('kigi_mock_incomes')) {
    MockStorage.set('incomes', initialIncomes);
  }
  if (!localStorage.getItem('kigi_mock_expenses')) {
    MockStorage.set('expenses', initialExpenses);
  }
};

// Inicializar dados na primeira execução
initializeData();

// Serviços de Autenticação Mock
export const mockAuthService = {
  login: async (username: string, senha: string): Promise<{ user: Usuario; token: string }> => {
    await mockDelay(1000);

    const users = MockStorage.get<Usuario>('users', initialUsers);
    
    console.log('Mock login - tentativa:', { username, senha });

    // Verificar credenciais
    const user = users.find(u => 
      (u.login === username || u.nome === username || username === 'admin') && 
      u.senha === senha && 
      u.ativo
    );

    // Verificação especial para admin/admin
    if (username === 'admin' && senha === 'admin') {
      const adminUser = users.find(u => u.nome === 'Admin') || users[0];
      return {
        user: adminUser,
        token: 'mock-jwt-token-' + Date.now()
      };
    }

    if (user) {
      return {
        user,
        token: 'mock-jwt-token-' + Date.now()
      };
    }

    throw new Error('Credenciais inválidas');
  },

  logout: async (): Promise<void> => {
    await mockDelay(300);
  },

  getCurrentUser: async (): Promise<Usuario> => {
    await mockDelay(200);
    const users = MockStorage.get<Usuario>('users', initialUsers);
    const adminUser = users.find(u => u.papel === 'pai') || users[0];
    return adminUser;
  },
};

// Serviços de Usuários Mock
export const mockUserService = {
  getAll: async (): Promise<Usuario[]> => {
    await mockDelay();
    const users = MockStorage.get<Usuario>('users', initialUsers);
    return users.filter(u => u.ativo);
  },

  getById: async (id: number): Promise<Usuario> => {
    await mockDelay();
    const users = MockStorage.get<Usuario>('users', initialUsers);
    const user = users.find(u => u.id === id);
    if (!user) throw new Error('Usuário não encontrado');
    return user;
  },

  create: async (userData: UsuarioInput): Promise<Usuario> => {
    await mockDelay();
    const users = MockStorage.get<Usuario>('users', initialUsers);
    
    // Verificar se login já existe
    if (users.find(u => u.login === userData.login && u.ativo)) {
      throw new Error('Login já está em uso');
    }

    const newUser: Usuario = {
      id: Math.max(...users.map(u => u.id), 0) + 1,
      ...userData,
      ativo: true,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
    
    users.push(newUser);
    MockStorage.set('users', users);
    return newUser;
  },

  update: async (id: number, userData: Partial<UsuarioInput>): Promise<Usuario> => {
    await mockDelay();
    const users = MockStorage.get<Usuario>('users', initialUsers);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('Usuário não encontrado');
    
    // Verificar se login já existe (excluindo o usuário atual)
    if (userData.login && users.find(u => u.login === userData.login && u.id !== id && u.ativo)) {
      throw new Error('Login já está em uso');
    }

    users[index] = {
      ...users[index],
      ...userData,
      atualizadoEm: new Date().toISOString(),
    };
    
    MockStorage.set('users', users);
    return users[index];
  },

  delete: async (id: number): Promise<void> => {
    await mockDelay();
    const users = MockStorage.get<Usuario>('users', initialUsers);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('Usuário não encontrado');
    
    users[index].ativo = false;
    users[index].atualizadoEm = new Date().toISOString();
    MockStorage.set('users', users);
  },
};

// Serviços de Empresas Mock
export const mockCompanyService = {
  getAll: async (): Promise<Empresa[]> => {
    await mockDelay();
    const companies = MockStorage.get<Empresa>('companies', initialCompanies);
    return companies.filter(c => c.ativo);
  },

  getById: async (id: number): Promise<Empresa> => {
    await mockDelay();
    const companies = MockStorage.get<Empresa>('companies', initialCompanies);
    const company = companies.find(c => c.id === id);
    if (!company) throw new Error('Empresa não encontrada');
    return company;
  },

  create: async (companyData: EmpresaInput): Promise<Empresa> => {
    await mockDelay();
    const companies = MockStorage.get<Empresa>('companies', initialCompanies);
    
    // Verificar se CNPJ já existe
    if (companyData.cnpj && companies.find(c => c.cnpj === companyData.cnpj && c.ativo)) {
      throw new Error('CNPJ já está em uso');
    }

    const newCompany: Empresa = {
      id: Math.max(...companies.map(c => c.id), 0) + 1,
      ...companyData,
      ativo: true,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
    
    companies.push(newCompany);
    MockStorage.set('companies', companies);
    return newCompany;
  },

  update: async (id: number, companyData: Partial<EmpresaInput>): Promise<Empresa> => {
    await mockDelay();
    const companies = MockStorage.get<Empresa>('companies', initialCompanies);
    const index = companies.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Empresa não encontrada');
    
    // Verificar se CNPJ já existe (excluindo a empresa atual)
    if (companyData.cnpj && companies.find(c => c.cnpj === companyData.cnpj && c.id !== id && c.ativo)) {
      throw new Error('CNPJ já está em uso');
    }

    companies[index] = {
      ...companies[index],
      ...companyData,
      atualizadoEm: new Date().toISOString(),
    };
    
    MockStorage.set('companies', companies);
    return companies[index];
  },

  delete: async (id: number): Promise<void> => {
    await mockDelay();
    const companies = MockStorage.get<Empresa>('companies', initialCompanies);
    const index = companies.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Empresa não encontrada');
    
    companies[index].ativo = false;
    companies[index].atualizadoEm = new Date().toISOString();
    MockStorage.set('companies', companies);
  },
};

// Serviços de Produtos Mock
export const mockProductService = {
  getAll: async (): Promise<Produto[]> => {
    await mockDelay();
    const products = MockStorage.get<Produto>('products', initialProducts);
    return products.filter(p => p.ativo);
  },

  getById: async (id: number): Promise<Produto> => {
    await mockDelay();
    const products = MockStorage.get<Produto>('products', initialProducts);
    const product = products.find(p => p.id === id);
    if (!product) throw new Error('Produto não encontrado');
    return product;
  },

  getByBarcode: async (barcode: string): Promise<Produto> => {
    await mockDelay();
    const products = MockStorage.get<Produto>('products', initialProducts);
    const product = products.find(p => p.codigoBarras === barcode && p.ativo);
    if (!product) throw new Error('Produto não encontrado');
    return product;
  },

  create: async (productData: ProdutoInput): Promise<Produto> => {
    await mockDelay();
    const products = MockStorage.get<Produto>('products', initialProducts);
    
    // Verificar se código de barras já existe
    if (productData.codigoBarras && products.find(p => p.codigoBarras === productData.codigoBarras && p.ativo)) {
      throw new Error('Código de barras já está em uso');
    }

    const newProduct: Produto = {
      id: Math.max(...products.map(p => p.id), 0) + 1,
      ...productData,
      ativo: true,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
    
    products.push(newProduct);
    MockStorage.set('products', products);
    return newProduct;
  },

  update: async (id: number, productData: Partial<ProdutoInput>): Promise<Produto> => {
    await mockDelay();
    const products = MockStorage.get<Produto>('products', initialProducts);
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Produto não encontrado');
    
    // Verificar se código de barras já existe (excluindo o produto atual)
    if (productData.codigoBarras && products.find(p => p.codigoBarras === productData.codigoBarras && p.id !== id && p.ativo)) {
      throw new Error('Código de barras já está em uso');
    }

    products[index] = {
      ...products[index],
      ...productData,
      atualizadoEm: new Date().toISOString(),
    };
    
    MockStorage.set('products', products);
    return products[index];
  },

  delete: async (id: number): Promise<void> => {
    await mockDelay();
    const products = MockStorage.get<Produto>('products', initialProducts);
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Produto não encontrado');
    
    products[index].ativo = false;
    products[index].atualizadoEm = new Date().toISOString();
    MockStorage.set('products', products);
  },
};

// Serviços de Entradas Mock
export const mockIncomeService = {
  getAll: async (): Promise<Entrada[]> => {
    await mockDelay();
    const incomes = MockStorage.get<Entrada>('incomes', initialIncomes);
    return incomes;
  },

  getById: async (id: number): Promise<Entrada> => {
    await mockDelay();
    const incomes = MockStorage.get<Entrada>('incomes', initialIncomes);
    const income = incomes.find(i => i.id === id);
    if (!income) throw new Error('Entrada não encontrada');
    return income;
  },

  create: async (incomeData: EntradaInput): Promise<Entrada> => {
    await mockDelay();
    const incomes = MockStorage.get<Entrada>('incomes', initialIncomes);
    
    const newIncome: Entrada = {
      id: Math.max(...incomes.map(i => i.id), 0) + 1,
      ...incomeData,
      dataHoraRegistro: new Date().toISOString(),
    };
    
    incomes.push(newIncome);
    MockStorage.set('incomes', incomes);
    return newIncome;
  },

  update: async (id: number, incomeData: Partial<EntradaInput>): Promise<Entrada> => {
    await mockDelay();
    const incomes = MockStorage.get<Entrada>('incomes', initialIncomes);
    const index = incomes.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Entrada não encontrada');
    
    incomes[index] = {
      ...incomes[index],
      ...incomeData,
    };
    
    MockStorage.set('incomes', incomes);
    return incomes[index];
  },

  delete: async (id: number): Promise<void> => {
    await mockDelay();
    const incomes = MockStorage.get<Entrada>('incomes', initialIncomes);
    const index = incomes.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Entrada não encontrada');
    
    incomes.splice(index, 1);
    MockStorage.set('incomes', incomes);
  },
};

// Serviços de Saídas Mock
export const mockExpenseService = {
  getAll: async (): Promise<Saida[]> => {
    await mockDelay();
    const expenses = MockStorage.get<Saida>('expenses', initialExpenses);
    return expenses;
  },

  getById: async (id: number): Promise<Saida> => {
    await mockDelay();
    const expenses = MockStorage.get<Saida>('expenses', initialExpenses);
    const expense = expenses.find(e => e.id === id);
    if (!expense) throw new Error('Saída não encontrada');
    return expense;
  },

  getWithInstallments: async (): Promise<Saida[]> => {
    await mockDelay();
    const expenses = MockStorage.get<Saida>('expenses', initialExpenses);
    return expenses.filter(e => e.tipoPagamento === 'parcelado');
  },

  create: async (expenseData: SaidaInput): Promise<Saida> => {
    await mockDelay();
    const expenses = MockStorage.get<Saida>('expenses', initialExpenses);
    const products = MockStorage.get<Produto>('products', initialProducts);
    
    const newExpense: Saida = {
      id: Math.max(...expenses.map(e => e.id), 0) + 1,
      usuarioRegistroId: expenseData.usuarioRegistroId,
      dataHoraRegistro: new Date().toISOString(),
      dataSaida: expenseData.dataSaida,
      empresaId: expenseData.empresaId,
      tipoPagamento: expenseData.tipoPagamento,
      usuariosTitularesIds: expenseData.usuariosTitularesIds,
      itens: expenseData.itens.map(item => {
        const product = products.find(p => p.id === item.produtoId);
        return {
          ...item,
          nomeProduto: product?.nome || 'Produto não encontrado',
          total: item.quantidade * item.precoUnitario,
        };
      }),
      valorTotal: expenseData.itens.reduce((total, item) => total + (item.quantidade * item.precoUnitario), 0),
      observacao: expenseData.observacao,
    };
    
    expenses.push(newExpense);
    MockStorage.set('expenses', expenses);
    return newExpense;
  },

  update: async (id: number, expenseData: Partial<Saida>): Promise<Saida> => {
    await mockDelay();
    const expenses = MockStorage.get<Saida>('expenses', initialExpenses);
    const index = expenses.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Saída não encontrada');
    
    expenses[index] = {
      ...expenses[index],
      ...expenseData,
    };
    
    MockStorage.set('expenses', expenses);
    return expenses[index];
  },

  delete: async (id: number): Promise<void> => {
    await mockDelay();
    const expenses = MockStorage.get<Saida>('expenses', initialExpenses);
    const index = expenses.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Saída não encontrada');
    
    expenses.splice(index, 1);
    MockStorage.set('expenses', expenses);
  },
};

// Serviços de Parcelas Mock
export const mockInstallmentService = {
  getAll: async () => {
    await mockDelay();
    // Gerar parcelas dinamicamente baseado nas saídas parceladas
    const expenses = MockStorage.get<Saida>('expenses', initialExpenses);
    const installments: any[] = [];
    
    expenses.filter(e => e.tipoPagamento === 'parcelado').forEach(expense => {
      // Simular 3 parcelas para cada saída parcelada
      for (let i = 1; i <= 3; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i);
        
        installments.push({
          id: expense.id * 10 + i,
          saidaOriginalId: expense.id,
          numeroParcela: i,
          dataVencimento: dueDate.toISOString().split('T')[0],
          valorParcela: expense.valorTotal / 3,
          status: i === 1 ? 'paga' : 'a vencer',
          dataPagamento: i === 1 ? new Date().toISOString().split('T')[0] : undefined,
        });
      }
    });
    
    return installments;
  },

  getById: async (id: number) => {
    await mockDelay();
    const installments = await mockInstallmentService.getAll();
    const installment = installments.find(i => i.id === id);
    if (!installment) throw new Error('Parcela não encontrada');
    return installment;
  },

  markAsPaid: async (id: number, paymentDate: string): Promise<void> => {
    await mockDelay();
    // Simulação de marcar como paga
    console.log(`Parcela ${id} marcada como paga em ${paymentDate}`);
  },
};

// Serviços de Relatórios Mock
export const mockReportService = {
  getFinancialSummary: async () => {
    await mockDelay();
    const incomes = MockStorage.get<Entrada>('incomes', initialIncomes);
    const expenses = MockStorage.get<Saida>('expenses', initialExpenses);
    
    const totalEntradas = incomes.reduce((sum, income) => sum + income.valor, 0);
    const totalSaidas = expenses.reduce((sum, expense) => sum + expense.valorTotal, 0);
    const totalParcelado = expenses
      .filter(e => e.tipoPagamento === 'parcelado')
      .reduce((sum, expense) => sum + expense.valorTotal, 0);
    
    return {
      saldoFamiliar: totalEntradas - totalSaidas,
      totalEntradas,
      totalSaidas,
      totalParcelado,
      totalPago: totalParcelado / 3, // Simulando 1/3 pago
      totalPendentes: (totalParcelado * 2) / 3, // Simulando 2/3 pendente
    };
  },

  getRecentTransactions: async (limit = 10) => {
    await mockDelay();
    const incomes = MockStorage.get<Entrada>('incomes', initialIncomes);
    const expenses = MockStorage.get<Saida>('expenses', initialExpenses);
    
    const transactions: any[] = [
      ...incomes.map(income => ({
        id: `income_${income.id}`,
        tipo: 'entrada',
        data: income.dataReferencia,
        valor: income.valor,
        descricao: `Entrada registrada`,
      })),
      ...expenses.map(expense => ({
        id: `expense_${expense.id}`,
        tipo: 'saida',
        data: expense.dataSaida,
        valor: expense.valorTotal,
        descricao: `Saída registrada`,
      })),
    ];
    
    return transactions
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, limit);
  },

  getDetailedReport: async (filters: any) => {
    await mockDelay();
    const summary = await mockReportService.getFinancialSummary();
    const transactions = await mockReportService.getRecentTransactions(50);
    
    return {
      total: summary.saldoFamiliar,
      transactions: transactions.filter(t => {
        // Aplicar filtros se necessário
        return true;
      }),
    };
  },
};

// Função para resetar todos os dados mockados
export const resetMockData = () => {
  MockStorage.clear();
  initializeData();
  console.log('Dados mockados resetados para o estado inicial');
};

// Exportar função para verificar dados atuais
export const getCurrentMockData = () => {
  return {
    users: MockStorage.get<Usuario>('users', initialUsers),
    companies: MockStorage.get<Empresa>('companies', initialCompanies),
    products: MockStorage.get<Produto>('products', initialProducts),
    incomes: MockStorage.get<Entrada>('incomes', initialIncomes),
    expenses: MockStorage.get<Saida>('expenses', initialExpenses),
  };
};
