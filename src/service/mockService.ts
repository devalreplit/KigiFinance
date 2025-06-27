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
  Parcela,
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
    login: 'admin',
    senha: 'admin',
    papel: 'pai',
    ativo: true,
    criadoEm: '2024-01-01T00:00:00.000Z',
    atualizadoEm: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    nome: 'Maria Silva',
    login: 'maria',
    senha: '123456',
    papel: 'mae',
    ativo: true,
    criadoEm: '2024-01-01T00:00:00.000Z',
    atualizadoEm: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 3,
    nome: 'Pedro Silva',
    login: 'pedro',
    senha: '123456',
    papel: 'filho',
    ativo: true,
    criadoEm: '2024-01-01T00:00:00.000Z',
    atualizadoEm: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 4,
    nome: 'Ana Silva',
    login: 'ana',
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
    ativo: true,
    criadoEm: '2024-01-01T00:00:00.000Z',
    atualizadoEm: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    nome: 'Farmácia Central',
    ativo: true,
    criadoEm: '2024-01-01T00:00:00.000Z',
    atualizadoEm: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 3,
    nome: 'Posto Shell',
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

// Gerar entradas para o mês corrente e anterior dinamicamente
const generateInitialIncomes = (): Entrada[] => {
  const hoje = new Date();
  const mesCorrente = hoje.getMonth() + 1;
  const anoCorrente = hoje.getFullYear();

  // Calcular mês anterior
  let mesAnterior = mesCorrente - 1;
  let anoAnterior = anoCorrente;
  if (mesAnterior === 0) {
    mesAnterior = 12;
    anoAnterior = anoCorrente - 1;
  }

  return [
    // Entradas do mês corrente
    {
      id: 1,
      usuarioRegistroId: 1,
      dataHoraRegistro: new Date().toISOString(),
      usuarioTitularId: 1,
      dataReferencia: `${anoCorrente}-${mesCorrente.toString().padStart(2, '0')}-05`,
      valor: 5000.00,
      empresaPagadoraId: 1,
    },
    {
      id: 2,
      usuarioRegistroId: 2,
      dataHoraRegistro: new Date().toISOString(),
      usuarioTitularId: 2,
      dataReferencia: `${anoCorrente}-${mesCorrente.toString().padStart(2, '0')}-10`,
      valor: 3500.00,
      empresaPagadoraId: 2,
    },
    {
      id: 3,
      usuarioRegistroId: 1,
      dataHoraRegistro: new Date().toISOString(),
      usuarioTitularId: 3,
      dataReferencia: `${anoCorrente}-${mesCorrente.toString().padStart(2, '0')}-15`,
      valor: 1200.00,
      empresaPagadoraId: 3,
    },
    {
      id: 4,
      usuarioRegistroId: 2,
      dataHoraRegistro: new Date().toISOString(),
      usuarioTitularId: 4,
      dataReferencia: `${anoCorrente}-${mesCorrente.toString().padStart(2, '0')}-20`,
      valor: 800.00,
      empresaPagadoraId: 1,
    },

    // Entradas do mês anterior
    {
      id: 5,
      usuarioRegistroId: 1,
      dataHoraRegistro: new Date(anoAnterior, mesAnterior - 1, 5).toISOString(),
      usuarioTitularId: 1,
      dataReferencia: `${anoAnterior}-${mesAnterior.toString().padStart(2, '0')}-05`,
      valor: 4800.00,
      empresaPagadoraId: 1,
    },
    {
      id: 6,
      usuarioRegistroId: 2,
      dataHoraRegistro: new Date(anoAnterior, mesAnterior - 1, 12).toISOString(),
      usuarioTitularId: 2,
      dataReferencia: `${anoAnterior}-${mesAnterior.toString().padStart(2, '0')}-12`,
      valor: 3200.00,
      empresaPagadoraId: 2,
    },
    {
      id: 7,
      usuarioRegistroId: 1,
      dataHoraRegistro: new Date(anoAnterior, mesAnterior - 1, 18).toISOString(),
      usuarioTitularId: 3,
      dataReferencia: `${anoAnterior}-${mesAnterior.toString().padStart(2, '0')}-18`,
      valor: 950.00,
      empresaPagadoraId: 3,
    },
    {
      id: 8,
      usuarioRegistroId: 2,
      dataHoraRegistro: new Date(anoAnterior, mesAnterior - 1, 25).toISOString(),
      usuarioTitularId: 4,
      dataReferencia: `${anoAnterior}-${mesAnterior.toString().padStart(2, '0')}-25`,
      valor: 600.00,
      empresaPagadoraId: 2,
    },

    // Algumas entradas de meses mais antigos para testar filtros
    {
      id: 9,
      usuarioRegistroId: 1,
      dataHoraRegistro: '2024-10-15T10:30:00.000Z',
      usuarioTitularId: 1,
      dataReferencia: '2024-10-15',
      valor: 4500.00,
      empresaPagadoraId: 1,
    },
    {
      id: 10,
      usuarioRegistroId: 2,
      dataHoraRegistro: '2024-09-20T14:00:00.000Z',
      usuarioTitularId: 2,
      dataReferencia: '2024-09-20',
      valor: 3000.00,
      empresaPagadoraId: 2,
    },
  ];
};

const initialIncomes: Entrada[] = generateInitialIncomes();

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
  login: async (login: string, senha: string): Promise<{ user: Usuario; token: string }> => {
    await mockDelay(500);

    console.log('🔍 mockAuthService.login - tentativa:', { login, senha });

    const users = MockStorage.get<Usuario>('users', initialUsers);
    console.log('🔍 mockAuthService.login - usuários disponíveis:', users);

    // Buscar usuário apenas por login
    const user = users.find(u => 
      u.ativo && u.login === login
    );

    console.log('🔍 mockAuthService.login - usuário encontrado:', user);

    if (!user || user.senha !== senha) {
      console.log('🔍 mockAuthService.login - credenciais inválidas');
      throw new Error('Credenciais inválidas');
    }

    const token = 'mock-jwt-token-' + Date.now();
    console.log('🔍 mockAuthService.login - sucesso, token:', token);

    return { user, token };
  },

  logout: async (): Promise<void> => {
    await mockDelay(300);
    // Limpar dados de autenticação do localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  },

  getCurrentUser: async (): Promise<Usuario> => {
    await mockDelay(200);

    // Verificar se há usuário salvo no localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (error) {
        console.error('Erro ao parsear usuário do localStorage:', error);
        localStorage.removeItem('currentUser');
      }
    }

    // Fallback para usuário admin padrão
    const users = MockStorage.get<Usuario>('users', initialUsers);
    const adminUser = users.find(u => u.papel === 'pai') || users[0];
    return adminUser;
  },

  isAuthenticated: (): boolean => {
    const hasToken = localStorage.getItem('authToken') !== null;
    return hasToken;
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
      senha: userData.senha || '',
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

    // Verificar se nome já existe
    if (companyData.nome && companies.find(c => c.nome === companyData.nome && c.ativo)) {
      throw new Error('Nome da empresa já está em uso');
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

    // Verificar se nome já existe (excluindo a empresa atual)
    if (companyData.nome && companies.find(c => c.nome === companyData.nome && c.id !== id && c.ativo)) {
      throw new Error('Nome da empresa já está em uso');
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

  search: async (query: string): Promise<Produto[]> => {
    await mockDelay(300); // Simular delay da API

    const products = MockStorage.get<Produto>('products', initialProducts);
    const normalizedQuery = query.toLowerCase();
    return products.filter(product =>
      product.nome.toLowerCase().includes(normalizedQuery) ||
      (product.classificacao && product.classificacao.toLowerCase().includes(normalizedQuery)) ||
      (product.codigoBarras && product.codigoBarras.includes(query))
    );
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

// Income Service - Entradas
export const mockIncomeService = {
  // Retorna apenas as entradas do mês corrente (padrão)
  getAll: async (mes?: number, ano?: number): Promise<Entrada[]> => {
    await mockDelay();
    const incomes = MockStorage.get<Entrada>('incomes', initialIncomes);

    // Se não especificar mês/ano, filtrar pelo mês corrente
    if (!mes || !ano) {
      const hoje = new Date();
      mes = hoje.getMonth() + 1; // getMonth() retorna 0-11, precisamos 1-12
      ano = hoje.getFullYear();
    }

    // Filtrar entradas pelo mês e ano especificados
    const entradasFiltradas = incomes.filter(entrada => {
      const dataEntrada = new Date(entrada.dataReferencia);
      const mesEntrada = dataEntrada.getMonth() + 1;
      const anoEntrada = dataEntrada.getFullYear();

      return mesEntrada === mes && anoEntrada === ano;
    });

    // Ordenar por data mais recente primeiro
    return entradasFiltradas.sort((a, b) => 
      new Date(b.dataReferencia).getTime() - new Date(a.dataReferencia).getTime()
    );
  },

  // Função específica para buscar entradas de um mês/ano específico
  getByMonthYear: async (mes: number, ano: number): Promise<Entrada[]> => {
    return mockIncomeService.getAll(mes, ano);
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
  // Buscar saídas com filtro opcional de mês/ano
  getAll: async (mes?: number, ano?: number): Promise<Saida[]> => {
    await mockDelay();
    const expenses = MockStorage.get<Saida>('expenses', initialExpenses);

    // Se não especificar mês/ano, retornar todas as saídas
    if (!mes || !ano) {
      return expenses.sort((a, b) => 
        new Date(b.dataSaida).getTime() - new Date(a.dataSaida).getTime()
      );
    }

    // Filtrar saídas por mês/ano específico
    const filteredExpenses = expenses.filter(expense => {
      const dataExpense = new Date(expense.dataSaida);
      const mesExpense = dataExpense.getMonth() + 1; // getMonth() retorna 0-11
      const anoExpense = dataExpense.getFullYear();
      
      return mesExpense === mes && anoExpense === ano;
    });

    // Ordenar por data mais recente primeiro
    return filteredExpenses.sort((a, b) => 
      new Date(b.dataSaida).getTime() - new Date(a.dataSaida).getTime()
    );
  },

  // Função específica para buscar saídas de um mês/ano específico
  getByMonthYear: async (mes: number, ano: number): Promise<Saida[]> => {
    return mockExpenseService.getAll(mes, ano);
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
    const installments: Parcela[] = [];

    expenses.filter(e => e.tipoPagamento === 'parcelado').forEach(expense => {
      const numeroParcelas = expense.numeroParcelas || 3;
      const valorParcela = expense.valorTotal / numeroParcelas;
      
      // Usar a data da primeira parcela se disponível, senão usar data da saída + 1 mês
      const baseDate = expense.dataPrimeiraParcela 
        ? new Date(expense.dataPrimeiraParcela)
        : new Date(expense.dataSaida);
      
      if (expense.dataPrimeiraParcela) {
        baseDate.setDate(baseDate.getDate() + 1); // Ajustar timezone
      } else {
        baseDate.setMonth(baseDate.getMonth() + 1);
      }

      for (let i = 1; i <= numeroParcelas; i++) {
        const dueDate = new Date(baseDate);
        dueDate.setMonth(dueDate.getMonth() + (i - 1));

        // Determinar status baseado na data
        const today = new Date();
        let status: 'paga' | 'vencida' | 'a vencer' = 'a vencer';
        
        if (dueDate < today) {
          status = i === 1 ? 'paga' : 'vencida'; // Primeira parcela paga, outras vencidas
        }

        installments.push({
          id: expense.id * 100 + i, // ID único mais robusto
          saidaOriginalId: expense.id,
          numeroParcela: i,
          dataVencimento: dueDate.toISOString().split('T')[0],
          valorParcela: valorParcela,
          status: status,
          dataPagamento: status === 'paga' ? new Date().toISOString().split('T')[0] : undefined,
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