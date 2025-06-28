// ============================
// 📂 types.ts
// ============================

export interface Usuario {
  id: number;
  nome: string;
  login: string;
  senha: string;
  papel: "pai" | "mae" | "filho" | "filha";
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface UsuarioInput {
  nome: string;
  login: string;
  senha?: string;
  papel: "pai" | "mae" | "filho" | "filha";
}

export interface Empresa {
  id: number;
  nome: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface EmpresaInput {
  nome: string;
}

export interface Produto {
  id: number;
  codigoBarras?: string;
  nome: string;
  unidade: string;
  classificacao: string;
  ativo?: boolean;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface ProdutoInput {
  codigoBarras?: string;
  nome: string;
  unidade: string;
  classificacao: string;
}

export interface Entrada {
  id: number;
  usuarioRegistroId: number;
  dataHoraRegistro: string;
  usuarioTitularId: number;
  dataReferencia: string;
  valor: number;
  empresaPagadoraId: number;
}

export interface EntradaInput {
  usuarioRegistroId: number;
  usuarioTitularId: number;
  dataReferencia: string;
  valor: number;
  empresaPagadoraId: number;
}

export interface ItemSaida {
  produtoId: number;
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number;
  total: number;
}

export interface Saida {
  id: number;
  saidaPaiId?: number;
  tipoSaida: 'normal' | 'parcelada_pai' | 'parcela';
  numeroParcela: number;
  usuarioRegistroId: number;
  dataHoraRegistro: string;
  dataSaida: string;
  empresaId: number;
  tipoPagamento: 'avista' | 'parcelado';
  usuariosTitularesIds: number[];
  itens: ItemSaida[];
  valorTotal: number;
  observacao?: string;
  totalParcelas?: number;
}

export interface SaidaInput {
  saidaPaiId?: number;
  tipoSaida?: 'normal' | 'parcelada_pai' | 'parcela';
  numeroParcela?: number;
  usuarioRegistroId: number;
  dataSaida: string;
  empresaId: number;
  tipoPagamento: "avista" | "parcelado";
  usuariosTitularesIds: number[];
  itens: ItemSaidaInput[];
  totalParcelas?: number;
  observacao?: string;
}

export interface ItemSaidaInput {
  produtoId: number;
  quantidade: number;
  precoUnitario: number;
}



export interface Transacao {
  id: number;
  tipo: "entrada" | "saida";
  data: string;
  valor: number;
  descricao: string;
}

export interface ResumoFinanceiro {
  saldoFamiliar: number;
  totalEntradas: number;
  totalSaidas: number;
  totalParcelado: number;
  totalPago: number;
  totalPendentes: number;
}

export interface FiltrosRelatorio {
  dataInicio?: string;
  dataFim?: string;
  usuarioId?: number;
  empresaId?: number;
  tipo?: "entrada" | "saida";
  formaPagamento?: "avista" | "parcelado";
  classificacao?: string;
}

export interface RelatorioFinanceiro {
  total: number;
  saldoFamiliar: number;
  transacoes: Transacao[];
  agrupadoPorClassificacao: { classificacao: string; total: number }[];
}