import api from './api';
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
  ResumoFinanceiro,
  Transacao,
} from '../../types';

// Importar serviços mockados
import {
  mockAuthService,
  mockUserService,
  mockCompanyService,
  mockProductService,
  mockIncomeService,
  mockExpenseService,
  mockInstallmentService,
  mockReportService,
} from './mockService';

// Flag para alternar entre dados mock (desenvolvimento) e API real (produção)
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// Serviços de Autenticação para comunicação com webservice externo
const realAuthService = {
  login: async (login: string, senha: string): Promise<{ user: Usuario; token: string }> => {
    const response = await api.post('/auth/login', { login, senha });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('authToken');
  },

  getCurrentUser: async (): Promise<Usuario> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  isAuthenticated: (): boolean => {
    const hasToken = localStorage.getItem('authToken') !== null;
    return hasToken;
  },
};

// Serviços de Usuários Reais
const realUserService = {
  getAll: async (): Promise<Usuario[]> => {
    const response = await api.get('/usuarios');
    return response.data;
  },

  getById: async (id: number): Promise<Usuario> => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  create: async (userData: UsuarioInput): Promise<Usuario> => {
    const response = await api.post('/usuarios', userData);
    return response.data;
  },

  update: async (id: number, userData: Partial<UsuarioInput>): Promise<Usuario> => {
    const response = await api.put(`/usuarios/${id}`, userData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/usuarios/${id}`);
  },
};

// Serviços de Empresas Reais
const realCompanyService = {
  getAll: async (): Promise<Empresa[]> => {
    const response = await api.get('/empresas');
    return response.data;
  },

  getById: async (id: number): Promise<Empresa> => {
    const response = await api.get(`/empresas/${id}`);
    return response.data;
  },

  create: async (companyData: EmpresaInput): Promise<Empresa> => {
    const response = await api.post('/empresas', companyData);
    return response.data;
  },

  update: async (id: number, companyData: Partial<EmpresaInput>): Promise<Empresa> => {
    const response = await api.put(`/empresas/${id}`, companyData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/empresas/${id}`);
  },
};

// Serviços de Produtos Reais
const realProductService = {
  getAll: async (): Promise<Produto[]> => {
    const response = await api.get('/produtos');
    return response.data;
  },

  getById: async (id: number): Promise<Produto> => {
    const response = await api.get(`/produtos/${id}`);
    return response.data;
  },

  getByBarcode: async (barcode: string): Promise<Produto> => {
    const response = await api.get(`/produtos/barcode/${barcode}`);
    return response.data;
  },

  search: async (query: string): Promise<Produto[]> => {
    const response = await api.get(`/produtos/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  create: async (productData: ProdutoInput): Promise<Produto> => {
    const response = await api.post('/produtos', productData);
    return response.data;
  },

  update: async (id: number, productData: Partial<ProdutoInput>): Promise<Produto> => {
    const response = await api.put(`/produtos/${id}`, productData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/produtos/${id}`);
  },
};

// Serviços de Entradas Reais
const realIncomeService = {
  // Buscar entradas com filtro opcional de mês/ano
  getAll: async (mes?: number, ano?: number): Promise<Entrada[]> => {
    let url = '/entradas';

    // Se especificar mês/ano, adicionar como query parameters
    if (mes && ano) {
      url += `?mes=${mes}&ano=${ano}`;
    }

    const response = await api.get(url);
    return response.data;
  },

  // Função específica para buscar entradas de um mês/ano específico
  getByMonthYear: async (mes: number, ano: number): Promise<Entrada[]> => {
    const response = await api.get(`/entradas?mes=${mes}&ano=${ano}`);
    return response.data;
  },

  getById: async (id: number): Promise<Entrada> => {
    const response = await api.get(`/entradas/${id}`);
    return response.data;
  },

  create: async (incomeData: EntradaInput): Promise<Entrada> => {
    const response = await api.post('/entradas', incomeData);
    return response.data;
  },

  update: async (id: number, incomeData: Partial<EntradaInput>): Promise<Entrada> => {
    const response = await api.put(`/entradas/${id}`, incomeData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/entradas/${id}`);
  },
};

// Serviços de Saídas Reais
const realExpenseService = {
  // Buscar saídas com filtro opcional de mês/ano
  getAll: async (mes?: number, ano?: number): Promise<Saida[]> => {
    let url = '/saidas';

    // Se especificar mês/ano, adicionar como query parameters
    if (mes && ano) {
      url += `?mes=${mes}&ano=${ano}`;
    }

    const response = await api.get(url);
    return response.data;
  },

  // Função específica para buscar saídas de um mês/ano específico
  getByMonthYear: async (mes: number, ano: number): Promise<Saida[]> => {
    const response = await api.get(`/saidas?mes=${mes}&ano=${ano}`);
    return response.data;
  },

  getById: async (id: number): Promise<Saida> => {
    const response = await api.get(`/saidas/${id}`);
    return response.data;
  },

  getWithInstallments: async (): Promise<Saida[]> => {
    const response = await api.get('/saidas/parcelas');
    return response.data;
  },

  create: async (expenseData: SaidaInput): Promise<Saida> => {
    const response = await api.post('/saidas', expenseData);
    return response.data;
  },

  update: async (id: number, expenseData: Partial<Saida>): Promise<Saida> => {
    const response = await api.put(`/saidas/${id}`, expenseData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/saidas/${id}`);
  },

  getInstallments: async (saidaPaiId: number): Promise<Saida[]> => {
    const response = await api.get(`/saidas/${saidaPaiId}/parcelas`);
    return response.data;
  },

  addInstallment: async (saidaPaiId: number): Promise<void> => {
    await api.post(`/saidas/${saidaPaiId}/parcelas`);
  },

  removeInstallment: async (installmentId: number): Promise<void> => {
    await api.delete(`/saidas/parcelas/${installmentId}`);
  },
};

// Serviços de Parcelas Reais
const realInstallmentService = {
  getAll: async (): Promise<Parcela[]> => {
    const response = await api.get('/parcelas');
    return response.data;
  },

  getById: async (id: number): Promise<Parcela> => {
    const response = await api.get(`/parcelas/${id}`);
    return response.data;
  },

  markAsPaid: async (id: number, paymentDate: string): Promise<void> => {
    await api.put(`/parcelas/${id}/pagar`, { dataPagamento: paymentDate });
  },
};

// Serviços de Relatórios Reais
const realReportService = {
  getFinancialSummary: async (): Promise<ResumoFinanceiro> => {
    const response = await api.get('/relatorios/resumo');
    return response.data;
  },

  getRecentTransactions: async (limit = 10): Promise<Transacao[]> => {
    const response = await api.get(`/relatorios/transacoes?limit=${limit}`);
    return response.data;
  },

  getDetailedReport: async (filters: any): Promise<any> => {
    const response = await api.post('/relatorios/detalhado', filters);
    return response.data;
  },
};

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK === 'true';

// Configuração do serviço baseado na variável de ambiente
export const authService = USE_MOCK_API ? mockAuthService : realAuthService;
export const userService = USE_MOCK_API ? mockUserService : realUserService;
export const companyService = USE_MOCK_API ? mockCompanyService : realCompanyService;
export const productService = USE_MOCK_API ? mockProductService : realProductService;
export const incomeService = USE_MOCK_API ? mockIncomeService : realIncomeService;
export const expenseService = USE_MOCK_API ? mockExpenseService : realExpenseService;
export const reportService = USE_MOCK_API ? mockReportService : realReportService;

// Log para indicar qual modo está sendo usado
console.log(`🔧 Modo de operação: ${USE_MOCK ? 'MOCK' : 'API REAL'}`);