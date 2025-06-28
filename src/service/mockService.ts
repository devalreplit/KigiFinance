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

/**
 * CLASSE MOCKSTORAGE - GERENCIAMENTO DE ARMAZENAMENTO LOCAL PARA DADOS MOCK
 * 
 * Responsabilidade:
 * - Simular persistência de dados usando localStorage
 * - Fornecer interface unificada para operações de storage
 * - Manter namespacing para evitar conflitos
 * - Tratar erros de parsing/storage
 * 
 * Padrão de uso:
 * - Todos os dados mock são prefixados com 'kigi_mock_'
 * - Serialização/deserialização automática via JSON
 * - Fallback para dados padrão em caso de erro
 */
class MockStorage {
  /**
   * FUNÇÃO GETSTORAGEKEY - GERAR CHAVE DE ARMAZENAMENTO
   * 
   * @param entity - Nome da entidade (users, companies, etc.)
   * @returns Chave prefixada para localStorage
   * 
   * Responsabilidade:
   * - Padronizar nomenclatura das chaves
   * - Evitar conflitos com outras aplicações
   */
  private static getStorageKey(entity: string): string {
    return `kigi_mock_${entity}`;
  }

  /**
   * FUNÇÃO GET - RECUPERAR DADOS DO LOCALSTORAGE
   * 
   * @param entity - Nome da entidade
   * @param defaultData - Dados padrão caso não existam no storage
   * @returns Array de entidades do tipo T
   * 
   * Responsabilidade:
   * - Recuperar dados serializados do localStorage
   * - Deserializar JSON de forma segura
   * - Retornar dados padrão em caso de erro
   * - Manter tipagem forte com generics
   */
  static get<T>(entity: string, defaultData: T[]): T[] {
    try {
      const stored = localStorage.getItem(this.getStorageKey(entity));
      return stored ? JSON.parse(stored) : defaultData;
    } catch {
      return defaultData;
    }
  }

  /**
   * FUNÇÃO SET - ARMAZENAR DADOS NO LOCALSTORAGE
   * 
   * @param entity - Nome da entidade
   * @param data - Array de dados a serem armazenados
   * 
   * Responsabilidade:
   * - Serializar dados para JSON
   * - Armazenar no localStorage com chave padronizada
   * - Manter persistência entre sessões
   */
  static set<T>(entity: string, data: T[]): void {
    localStorage.setItem(this.getStorageKey(entity), JSON.stringify(data));
  }

  /**
   * FUNÇÃO CLEAR - LIMPAR TODOS OS DADOS MOCK
   * 
   * Responsabilidade:
   * - Remover todos os dados mock do localStorage
   * - Manter outros dados não relacionados intactos
   * - Útil para reset completo em desenvolvimento
   */
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

// Gerar saídas para o mês corrente dinamicamente
const generateInitialExpenses = (): Saida[] => {
  const hoje = new Date();
  const mesCorrente = hoje.getMonth() + 1;
  const anoCorrente = hoje.getFullYear();

  return [
    // Saída à vista
    {
      id: 1,
      tipoSaida: 'normal',
      numeroParcela: 1,
      usuarioRegistroId: 1,
      dataHoraRegistro: new Date().toISOString(),
      dataSaida: `${anoCorrente}-${mesCorrente.toString().padStart(2, '0')}-16`,
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

    // Saída parcelada - 1ª parcela (saída pai)
    {
      id: 2,
      tipoSaida: 'parcelada_pai',
      numeroParcela: 1,
      totalParcelas: 3,
      usuarioRegistroId: 1,
      dataHoraRegistro: new Date().toISOString(),
      dataSaida: `${anoCorrente}-${mesCorrente.toString().padStart(2, '0')}-20`,
      empresaId: 2,
      tipoPagamento: 'parcelado',
      usuariosTitularesIds: [1],
      itens: [
        {
          produtoId: 3,
          nomeProduto: 'Óleo de Soja 900ml',
          quantidade: 10,
          precoUnitario: 15.00,
          total: 150.00,
        },
      ],
      valorTotal: 150.00,
      observacao: 'Compra parcelada em 3x',
    },

    // Parcelas filhas da saída parcelada
    {
      id: 3,
      saidaPaiId: 2,
      tipoSaida: 'parcela',
      numeroParcela: 2,
      usuarioRegistroId: 1,
      dataHoraRegistro: new Date().toISOString(),
      dataSaida: `${anoCorrente}-${(mesCorrente + 1).toString().padStart(2, '0')}-20`,
      empresaId: 2,
      tipoPagamento: 'parcelado',
      usuariosTitularesIds: [1],
      itens: [],
      valorTotal: 150.00,
      observacao: 'Parcela 2/3',
    },

    {
      id: 4,
      saidaPaiId: 2,
      tipoSaida: 'parcela',
      numeroParcela: 3,
      usuarioRegistroId: 1,
      dataHoraRegistro: new Date().toISOString(),
      dataSaida: `${anoCorrente}-${(mesCorrente + 2).toString().padStart(2, '0')}-20`,
      empresaId: 2,
      tipoPagamento: 'parcelado',
      usuariosTitularesIds: [1],
      itens: [],
      valorTotal: 150.00,
      observacao: 'Parcela 3/3',
    },
  ];
};

const initialExpenses: Saida[] = generateInitialExpenses();

/**
 * FUNÇÃO MOCKDELAY - SIMULAR LATÊNCIA DE REDE
 * 
 * @param ms - Millisegundos de delay (padrão: 500ms)
 * @returns Promise que resolve após o delay
 * 
 * Responsabilidade:
 * - Simular comportamento realista de API
 * - Permitir teste de estados de loading
 * - Facilitar transição para API real
 * - Melhorar experiência de desenvolvimento
 */
const mockDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * FUNÇÃO INITIALIZEDATA - INICIALIZAR DADOS MOCK
 * 
 * Responsabilidade:
 * - Verificar se dados já existem no localStorage
 * - Criar dados iniciais apenas na primeira execução
 * - Manter dados existentes entre sessões
 * - Garantir que aplicação sempre tenha dados para funcionar
 * 
 * Regras de Negócio:
 * - Executa apenas se dados não existem
 * - Preserva dados existentes modificados pelo usuário
 * - Inicializa todas as entidades necessárias
 */
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

// Inicializar dados na primeira execução do módulo
initializeData();

/**
 * SERVIÇO DE AUTENTICAÇÃO MOCK
 * 
 * Responsabilidade:
 * - Simular operações de autenticação
 * - Gerenciar sessão de usuário
 * - Validar credenciais
 * - Manter estado de autenticação
 */
export const mockAuthService = {
  /**
   * FUNÇÃO LOGIN - AUTENTICAR USUÁRIO
   * 
   * @param login - Login do usuário
   * @param senha - Senha do usuário
   * @returns Promise com usuário autenticado e token
   * 
   * Responsabilidade:
   * - Validar credenciais do usuário
   * - Buscar usuário ativo no sistema
   * - Gerar token de sessão
   * - Retornar dados de autenticação
   * 
   * Regras de Negócio:
   * - Usuário deve estar ativo (ativo = true)
   * - Login e senha devem coincidir exatamente
   * - Token é gerado com timestamp para unicidade
   * - Logs detalhados para debugging
   */
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

  /**
   * FUNÇÃO LOGOUT - ENCERRAR SESSÃO
   * 
   * Responsabilidade:
   * - Limpar dados de autenticação
   * - Remover token e usuário do localStorage
   * - Simular delay de operação de rede
   */
  logout: async (): Promise<void> => {
    await mockDelay(300);
    // Limpar dados de autenticação do localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  },

  /**
   * FUNÇÃO GETCURRENTUSER - OBTER USUÁRIO ATUAL
   * 
   * @returns Promise com dados do usuário logado
   * 
   * Responsabilidade:
   * - Recuperar usuário da sessão atual
   * - Validar dados salvos no localStorage
   * - Fornecer fallback para usuário padrão
   * - Tratar erros de parsing
   * 
   * Regras de Negócio:
   * - Prioriza usuário salvo no localStorage
   * - Fallback para usuário 'pai' ou primeiro usuário
   * - Remove dados corrompidos automaticamente
   */
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

  /**
   * FUNÇÃO ISAUTHENTICATED - VERIFICAR SE USUÁRIO ESTÁ AUTENTICADO
   * 
   * @returns Boolean indicando se há sessão ativa
   * 
   * Responsabilidade:
   * - Verificar presença de token de autenticação
   * - Determinar estado de autenticação
   * - Não valida expiração (simplificação para mock)
   */
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

/**
 * SERVIÇO DE SAÍDAS MOCK
 * 
 * Responsabilidade:
 * - Gerenciar saídas financeiras (CRUD)
 * - Implementar lógica de saídas parceladas
 * - Filtrar dados por período
 * - Manter consistência entre saídas pai e parcelas filhas
 * - Simular comportamento de API real
 */
export const mockExpenseService = {
  /**
   * FUNÇÃO GETALL - BUSCAR TODAS AS SAÍDAS
   * 
   * @param mes (opcional) - Mês para filtro (1-12)
   * @param ano (opcional) - Ano para filtro
   * @param incluirParcelas (opcional) - Se deve incluir parcelas filhas (padrão: false)
   * @returns Promise com array de saídas filtradas
   * 
   * Responsabilidade:
   * - Recuperar saídas do armazenamento mock
   * - Aplicar filtros de período quando especificados
   * - Controlar inclusão de parcelas filhas
   * - Ordenar por data mais recente primeiro
   * 
   * Regras de Negócio:
   * - Por padrão exclui parcelas filhas (tipoSaida === 'parcela')
   * - Filtro por mês/ano é baseado na data_saida (impacto financeiro)
   * - Ordenação decrescente por data de saída
   * - Sem filtro = retorna todas as saídas principais
   */
  getAll: async (mes?: number, ano?: number, incluirParcelas?: boolean): Promise<Saida[]> => {
    await mockDelay();
    const expenses = MockStorage.get<Saida>('expenses', initialExpenses);

    let filteredExpenses = expenses;

    // Filtrar por mês/ano se especificado
    if (mes && ano) {
      filteredExpenses = expenses.filter(expense => {
        const dataExpense = new Date(expense.dataSaida);
        const mesExpense = dataExpense.getMonth() + 1; // getMonth() retorna 0-11
        const anoExpense = dataExpense.getFullYear();

        return mesExpense === mes && anoExpense === ano;
      });
    }

    // Por padrão, não incluir parcelas filhas na listagem principal
    if (!incluirParcelas) {
      filteredExpenses = filteredExpenses.filter(expense => expense.tipoSaida !== 'parcela');
    }

    // Ordenar por data mais recente primeiro
    return filteredExpenses.sort((a, b) => 
      new Date(b.dataSaida).getTime() - new Date(a.dataSaida).getTime()
    );
  },

  /**
   * FUNÇÃO GETBYMONTHYEAR - BUSCAR SAÍDAS POR MÊS/ANO ESPECÍFICO
   * 
   * @param mes - Mês (1-12)
   * @param ano - Ano
   * @returns Promise com saídas do período especificado
   * 
   * Responsabilidade:
   * - Fornecer alias para getAll com filtro de período
   * - Manter compatibilidade de interface
   * - Simplificar chamadas com filtro temporal
   */
  getByMonthYear: async (mes: number, ano: number): Promise<Saida[]> => {
    return mockExpenseService.getAll(mes, ano);
  },

  /**
   * FUNÇÃO GETBYID - BUSCAR SAÍDA POR ID
   * 
   * @param id - ID da saída
   * @returns Promise com dados da saída
   * 
   * Responsabilidade:
   * - Recuperar saída específica por ID
   * - Validar existência da saída
   * - Lançar erro para IDs inexistentes
   */
  getById: async (id: number): Promise<Saida> => {
    await mockDelay();
    const expenses = MockStorage.get<Saida>('expenses', initialExpenses);
    const expense = expenses.find(e => e.id === id);
    if (!expense) throw new Error('Saída não encontrada');
    return expense;
  },

  /**
   * FUNÇÃO GETWITHINSTALLMENTS - BUSCAR APENAS SAÍDAS PARCELADAS PAI
   * 
   * @returns Promise com saídas do tipo 'parcelada_pai'
   * 
   * Responsabilidade:
   * - Filtrar apenas saídas parceladas principais
   * - Excluir saídas normais e parcelas filhas
   * - Útil para relatórios de parcelamento
   */
  getWithInstallments: async (): Promise<Saida[]> => {
    await mockDelay();
    const expenses = MockStorage.get<Saida>('expenses', initialExpenses);
    return expenses.filter(e => e.tipoSaida === 'parcelada_pai');
  },

  /**
   * FUNÇÃO GETINSTALLMENTS - BUSCAR PARCELAS DE UMA SAÍDA PAI
   * 
   * @param saidaPaiId - ID da saída pai
   * @returns Promise com parcelas filhas ordenadas por número
   */
  getInstallments: async (saidaPaiId: number): Promise<Saida[]> => {
    await mockDelay();
    const expenses = MockStorage.get<Saida>('expenses', initialExpenses);
    return expenses
      .filter(e => e.saidaPaiId === saidaPaiId)
      .sort((a, b) => a.numeroParcela - b.numeroParcela);
  },

  /**
   * FUNÇÃO ADDINSTALLMENT - ADICIONAR NOVA PARCELA
   * 
   * @param saidaPaiId - ID da saída pai
   * @returns Promise void
   */
  addInstallment: async (saidaPaiId: number): Promise<void> => {
    await mockDelay();
    const expenses = MockStorage.get<Saida>('expenses', initialExpenses);
    
    // Buscar saída pai
    const saidaPai = expenses.find(e => e.id === saidaPaiId);
    if (!saidaPai || saidaPai.tipoSaida !== 'parcelada_pai') {
      throw new Error('Saída pai não encontrada ou não é parcelada');
    }

    // Buscar parcelas existentes
    const parcelasExistentes = expenses.filter(e => e.saidaPaiId === saidaPaiId);
    const proximoNumero = Math.max(...parcelasExistentes.map(p => p.numeroParcela), 1) + 1;

    // Calcular nova data (um mês após a última parcela)
    const ultimaParcela = parcelasExistentes
      .sort((a, b) => b.numeroParcela - a.numeroParcela)[0] || saidaPai;
    const novaData = new Date(ultimaParcela.dataSaida);
    novaData.setMonth(novaData.getMonth() + 1);

    // Criar nova parcela
    const novaParcela: Saida = {
      id: Math.max(...expenses.map(e => e.id), 0) + 1,
      saidaPaiId: saidaPaiId,
      tipoSaida: 'parcela',
      numeroParcela: proximoNumero,
      usuarioRegistroId: saidaPai.usuarioRegistroId,
      dataHoraRegistro: new Date().toISOString(),
      dataSaida: novaData.toISOString().split('T')[0],
      empresaId: saidaPai.empresaId,
      tipoPagamento: saidaPai.tipoPagamento,
      usuariosTitularesIds: saidaPai.usuariosTitularesIds,
      itens: [],
      valorTotal: saidaPai.valorTotal / (saidaPai.totalParcelas || 1),
      observacao: `Parcela ${proximoNumero}`,
    };

    expenses.push(novaParcela);

    // Atualizar total de parcelas na saída pai
    const saidaPaiIndex = expenses.findIndex(e => e.id === saidaPaiId);
    if (saidaPaiIndex !== -1) {
      expenses[saidaPaiIndex].totalParcelas = proximoNumero;
    }

    MockStorage.set('expenses', expenses);
  },

  /**
   * FUNÇÃO REMOVEINSTALLMENT - REMOVER ÚLTIMA PARCELA
   * 
   * @param installmentId - ID da parcela a ser removida
   * @returns Promise void
   */
  removeInstallment: async (installmentId: number): Promise<void> => {
    await mockDelay();
    const expenses = MockStorage.get<Saida>('expenses', initialExpenses);
    
    // Buscar a parcela a ser removida
    const parcelaIndex = expenses.findIndex(e => e.id === installmentId);
    if (parcelaIndex === -1) {
      throw new Error('Parcela não encontrada');
    }

    const parcela = expenses[parcelaIndex];
    if (parcela.tipoSaida !== 'parcela') {
      throw new Error('Não é possível remover uma saída que não seja parcela');
    }

    // Buscar saída pai
    const saidaPai = expenses.find(e => e.id === parcela.saidaPaiId);
    if (!saidaPai) {
      throw new Error('Saída pai não encontrada');
    }

    // Verificar se não é a última parcela possível (mínimo 2 parcelas)
    const parcelas = expenses.filter(e => e.saidaPaiId === parcela.saidaPaiId);
    if (parcelas.length <= 1) {
      throw new Error('Não é possível remover a parcela. Mínimo de 2 parcelas necessário.');
    }

    // Remover a parcela
    expenses.splice(parcelaIndex, 1);

    // Atualizar total de parcelas na saída pai
    const saidaPaiIndex = expenses.findIndex(e => e.id === parcela.saidaPaiId);
    if (saidaPaiIndex !== -1) {
      expenses[saidaPaiIndex].totalParcelas = parcelas.length;
    }

    MockStorage.set('expenses', expenses);
  },

  /**
   * FUNÇÃO GETCHILDINSTALLMENTS - BUSCAR PARCELAS FILHAS
   * 
   * @param saidaPaiId - ID da saída pai
   * @returns Promise com parcelas filhas ordenadas por número
   * 
   * Responsabilidade:
   * - Recuperar parcelas filhas de uma saída parcelada
   * - Ordenar por número da parcela (1, 2, 3...)
   * - Manter relacionamento pai-filho
   * - Útil para exibir timeline de pagamentos
   */
  getChildInstallments: async (saidaPaiId: number): Promise<Saida[]> => {
    await mockDelay();
    const expenses = MockStorage.get<Saida>('expenses', initialExpenses);
    return expenses.filter(e => e.saidaPaiId === saidaPaiId).sort((a, b) => a.numeroParcela - b.numeroParcela);
  },

  /**
   * FUNÇÃO GETChildInstallments: async (saidaPaiId: number): Promise<Saida[]> => {
    await mockDelay();
    const expenses = MockStorage.get<Saida>('expenses', initialExpenses);
    return expenses.filter(e => e.saidaPaiId === saidaPaiId).sort((a, b) => a.numeroParcela - b.numeroParcela);
  },

  /**
   * FUNÇÃO CREATE - CRIAR NOVA SAÍDA
   * 
   * @param expenseData - Dados da saída a ser criada
   * @returns Promise com saída criada
   * 
   * Responsabilidade:
   * - Criar nova saída no sistema
   * - Calcular valor total baseado nos itens
   * - Determinar tipo de saída baseado no pagamento
   * - Gerar ID único para nova saída
   * - Enriquecer itens com dados de produtos
   * - Criar parcelas filhas para saídas parceladas
   * - Persistir dados no armazenamento
   * 
   * Regras de Negócio:
   * - ID é gerado como max(IDs existentes) + 1
   * - Tipo de saída: 'normal' para à vista, 'parcelada_pai' para parcelado
   * - Valor total = Σ(quantidade × preço) de todos os itens
   * - Data/hora de registro = timestamp atual
   * - Para saídas parceladas: criar parcelas filhas automaticamente
   * - Parcelas filhas: valor = valor_total / total_parcelas
   * - Parcelas filhas: data = data_primeira + (n-1) meses
   * - Parcelas filhas: não possuem itens (itens ficam apenas na saída pai)
   */
  create: async (expenseData: SaidaInput): Promise<Saida> => {
    await mockDelay();
    const expenses = MockStorage.get<Saida>('expenses', initialExpenses);
    const products = MockStorage.get<Produto>('products', initialProducts);

    const valorTotal = expenseData.itens.reduce((total, item) => total + (item.quantidade * item.precoUnitario), 0);

    const newExpense: Saida = {
      id: Math.max(...expenses.map(e => e.id), 0) + 1,
      saidaPaiId: expenseData.saidaPaiId,
      tipoSaida: expenseData.tipoSaida || (expenseData.tipoPagamento === 'avista' ? 'normal' : 'parcelada_pai'),
      numeroParcela: expenseData.numeroParcela || 1,
      totalParcelas: expenseData.totalParcelas,
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
      valorTotal: valorTotal,
      observacao: expenseData.observacao,
    };

    expenses.push(newExpense);

    // Se for saída parcelada (parcelada_pai), criar as parcelas filhas
    if (newExpense.tipoSaida === 'parcelada_pai' && expenseData.totalParcelas && expenseData.totalParcelas > 1) {
      const valorParcela = valorTotal / expenseData.totalParcelas;
      const baseDateSaida = new Date(expenseData.dataSaida);

      for (let i = 2; i <= expenseData.totalParcelas; i++) {
        const dataParcelaFilha = new Date(baseDateSaida);
        dataParcelaFilha.setMonth(dataParcelaFilha.getMonth() + (i - 1));

        const parcelaFilha: Saida = {
          id: Math.max(...expenses.map(e => e.id), newExpense.id) + 1,
          saidaPaiId: newExpense.id,
          tipoSaida: 'parcela',
          numeroParcela: i,
          usuarioRegistroId: expenseData.usuarioRegistroId,
          dataHoraRegistro: new Date().toISOString(),
          dataSaida: dataParcelaFilha.toISOString().split('T')[0],
          empresaId: expenseData.empresaId,
          tipoPagamento: expenseData.tipoPagamento,
          usuariosTitularesIds: expenseData.usuariosTitularesIds,
          itens: [], // Parcelas filhas não têm itens
          valorTotal: valorParcela,
          observacao: `Parcela ${i}/${expenseData.totalParcelas}`,
        };

        expenses.push(parcelaFilha);
      }
    }

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
    const expense = expenses.find(e => e.id === id);
    if (!expense) throw new Error('Saída não encontrada');

    // Se for saída parcelada pai, deletar também as parcelas filhas
    if (expense.tipoSaida === 'parcelada_pai') {
      const parcelasFilhas = expenses.filter(e => e.saidaPaiId === id);
      parcelasFilhas.forEach(parcela => {
        const parcelaIndex = expenses.findIndex(e => e.id === parcela.id);
        if (parcelaIndex !== -1) {
          expenses.splice(parcelaIndex, 1);
        }
      });
    }

    // Deletar a saída principal
    const index = expenses.findIndex(e => e.id === id);
    if (index !== -1) {
      expenses.splice(index, 1);
    }

    MockStorage.set('expenses', expenses);
  },
};



// Serviços de Relatórios Mock
export const mockReportService = {
  getFinancialSummary: async (): Promise<ResumoFinanceiro> => {
    await mockDelay();
    const incomes = MockStorage.get<Entrada>('incomes', initialIncomes);
    const expenses = MockStorage.get<Saida>('expenses', initialExpenses);

    const totalEntradas = incomes.reduce((sum, income) => sum + income.valor, 0);

    // Calcular total de saídas - somar todas as transações de impacto financeiro
    const totalSaidas = expenses.reduce((sum, expense) => sum + expense.valorTotal, 0);

    // Calcular total parcelado apenas das saídas pai
    const totalParcelado = expenses
      .filter(e => e.tipoSaida === 'parcelada_pai')
      .reduce((sum, e) => sum + (e.valorTotal * (e.totalParcelas || 1)), 0);

    // Calcular parcelas pendentes (parcelas futuras)
    const hoje = new Date();
    const totalPendentes = expenses
      .filter(e => e.tipoSaida === 'parcela' && new Date(e.dataSaida) > hoje)
      .reduce((sum, e) => sum + e.valorTotal, 0);

    return {
      saldoFamiliar: totalEntradas - totalSaidas,
      totalEntradas,
      totalSaidas,
      totalParcelado,
      totalPago: totalSaidas - totalPendentes,
      totalPendentes,
    };
  },

  getRecentTransactions: async (limit = 10): Promise<Transacao[]> => {
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
      ...expenses.map(expense => {
        let tipo = 'saida';
        let descricao = 'Saída registrada';

        if (expense.tipoSaida === 'parcelada_pai') {
          descricao = `Saída parcelada (${expense.numeroParcela}/${expense.totalParcelas})`;
        } else if (expense.tipoSaida === 'parcela') {
          tipo = 'parcela';
          descricao = `Parcela ${expense.numeroParcela}`;
        }

        return {
          id: `expense_${expense.id}`,
          tipo,
          data: expense.dataSaida,
          valor: expense.valorTotal,
          descricao,
        };
      }),
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