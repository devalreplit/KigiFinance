import {
  Usuario,
  Empresa,
  Produto,
  Entrada,
  Saida,
  ResumoFinanceiro,
  Transacao,
} from '../../types';

// Dados mockados para desenvolvimento - apenas para referência
export const mockUsers: Usuario[] = [
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

export const mockCompanies: Empresa[] = [
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

export const mockProducts: Produto[] = [
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

// Gerar entradas mockadas dinamicamente para mês corrente e anterior
const generateMockIncomes = (): Entrada[] => {
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

    // Entradas do mês anterior
    {
      id: 4,
      usuarioRegistroId: 2,
      dataHoraRegistro: new Date(anoAnterior, mesAnterior - 1, 8).toISOString(),
      usuarioTitularId: 1,
      dataReferencia: `${anoAnterior}-${mesAnterior.toString().padStart(2, '0')}-08`,
      valor: 4800.00,
      empresaPagadoraId: 1,
    },
    {
      id: 5,
      usuarioRegistroId: 1,
      dataHoraRegistro: new Date(anoAnterior, mesAnterior - 1, 15).toISOString(),
      usuarioTitularId: 2,
      dataReferencia: `${anoAnterior}-${mesAnterior.toString().padStart(2, '0')}-15`,
      valor: 3200.00,
      empresaPagadoraId: 2,
    },
  ];
};

export const mockIncomes: Entrada[] = generateMockIncomes();

export const mockExpenses: Saida[] = [
  // Saída à vista
  {
    id: 1,
    tipoSaida: 'normal',
    numeroParcela: 1,
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

  // Saída parcelada - 1ª parcela (saída pai)
  {
    id: 2,
    tipoSaida: 'parcelada_pai',
    numeroParcela: 1,
    totalParcelas: 3,
    usuarioRegistroId: 1,
    dataHoraRegistro: '2024-01-20T10:30:00.000Z',
    dataSaida: '2024-01-20',
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

  // 2ª parcela da saída parcelada
  {
    id: 3,
    saidaPaiId: 2,
    tipoSaida: 'parcela',
    numeroParcela: 2,
    usuarioRegistroId: 1,
    dataHoraRegistro: '2024-02-20T10:30:00.000Z',
    dataSaida: '2024-02-20',
    empresaId: 2,
    tipoPagamento: 'parcelado',
    usuariosTitularesIds: [1],
    itens: [],
    valorTotal: 150.00,
    observacao: 'Parcela 2/3',
  },

  // 3ª parcela da saída parcelada
  {
    id: 4,
    saidaPaiId: 2,
    tipoSaida: 'parcela',
    numeroParcela: 3,
    usuarioRegistroId: 1,
    dataHoraRegistro: '2024-03-20T10:30:00.000Z',
    dataSaida: '2024-03-20',
    empresaId: 2,
    tipoPagamento: 'parcelado',
    usuariosTitularesIds: [1],
    itens: [],
    valorTotal: 150.00,
    observacao: 'Parcela 3/3',
  },
];

export const mockFinancialSummary: ResumoFinanceiro = {
  saldoFamiliar: 8442.52,
  totalEntradas: 8500.00,
  totalSaidas: 57.48,
  totalParcelado: 300.00,
  totalPago: 150.00,
  totalPendentes: 150.00,
};

export const mockTransactions: Transacao[] = [
  {
    id: 1,
    tipo: 'entrada',
    data: '2024-01-15',
    valor: 5000.00,
    descricao: 'Salário João Silva',
  },
  {
    id: 2,
    tipo: 'entrada',
    data: '2024-01-20',
    valor: 3500.00,
    descricao: 'Salário Maria Silva',
  },
  {
    id: 3,
    tipo: 'saida',
    data: '2024-01-16',
    valor: 57.48,
    descricao: 'Compras Supermercado ABC',
  },
];

export const mockDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

export const initialUsers: Usuario[] = [
  {
    id: 1,
    nome: "Administrador",
    login: "admin",
    senha: "admin",
    papel: "pai",
    ativo: true,
    criadoEm: "2024-01-01T00:00:00Z",
    atualizadoEm: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    nome: "João Silva",
    login: "joao",
    senha: "123456",
    papel: "pai",
    ativo: true,
    criadoEm: "2024-01-01T00:00:00Z",
    atualizadoEm: "2024-01-01T00:00:00Z",
  },
];
export const initialExpenses: Saida[] = [
  {
    id: 1,
    tipoSaida: 'normal',
    numeroParcela: 1,
    usuarioRegistroId: 1,
    dataHoraRegistro: "2024-01-10T10:30:00Z",
    dataSaida: "2024-01-10",
    empresaId: 1,
    tipoPagamento: "avista",
    usuariosTitularesIds: [1, 2],
    itens: [
      {
        produtoId: 1,
        nomeProduto: "Arroz Tio João 5kg",
        quantidade: 2,
        precoUnitario: 15.90,
        total: 31.80,
      },
      {
        produtoId: 2,
        nomeProduto: "Feijão Preto 1kg",
        quantidade: 1,
        precoUnitario: 8.50,
        total: 8.50,
      },
    ],
    valorTotal: 40.30,
    observacao: "Compras do mês",
  },
  {
    id: 2,
    tipoSaida: 'parcelada_pai',
    numeroParcela: 1,
    totalParcelas: 3,
    usuarioRegistroId: 1,
    dataHoraRegistro: "2024-01-15T14:20:00Z",
    dataSaida: "2024-01-15",
    empresaId: 2,
    tipoPagamento: "parcelado",
    usuariosTitularesIds: [1],
    itens: [
      {
        produtoId: 3,
        nomeProduto: "Óleo de Soja 900ml",
        quantidade: 12,
        precoUnitario: 4.99,
        total: 59.88,
      },
    ],
    valorTotal: 59.88,
    observacao: "Compra parcelada - primeira parcela",
  },
  {
    id: 3,
    saidaPaiId: 2,
    tipoSaida: 'parcela',
    numeroParcela: 2,
    usuarioRegistroId: 1,
    dataHoraRegistro: "2024-01-15T14:20:00Z",
    dataSaida: "2024-02-15",
    empresaId: 2,
    tipoPagamento: "parcelado",
    usuariosTitularesIds: [1],
    itens: [],
    valorTotal: 19.96,
    observacao: "Parcela 2/3",
  },
  {
    id: 4,
    saidaPaiId: 2,
    tipoSaida: 'parcela',
    numeroParcela: 3,
    usuarioRegistroId: 1,
    dataHoraRegistro: "2024-01-15T14:20:00Z",
    dataSaida: "2024-03-15",
    empresaId: 2,
    tipoPagamento: "parcelado",
    usuariosTitularesIds: [1],
    itens: [],
    valorTotal: 19.96,
    observacao: "Parcela 3/3",
  },
];