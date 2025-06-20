import { apiRequest } from "./queryClient";

export const api = {
  // Family Users
  getFamilyUsers: () => fetch('/api/family-users').then(res => res.json()),
  createFamilyUser: (data: any) => apiRequest('POST', '/api/family-users', data),
  updateFamilyUser: (id: number, data: any) => apiRequest('PUT', `/api/family-users/${id}`, data),
  deleteFamilyUser: (id: number) => apiRequest('DELETE', `/api/family-users/${id}`),

  // Companies
  getEmpresas: () => fetch('/api/empresas').then(res => res.json()),
  createEmpresa: (data: any) => apiRequest('POST', '/api/empresas', data),
  updateEmpresa: (id: number, data: any) => apiRequest('PUT', `/api/empresas/${id}`, data),
  deleteEmpresa: (id: number) => apiRequest('DELETE', `/api/empresas/${id}`),

  // Products
  getProdutos: () => fetch('/api/produtos').then(res => res.json()),
  searchProdutos: (query: string) => fetch(`/api/produtos/search?q=${query}`).then(res => res.json()),
  createProduto: (data: any) => apiRequest('POST', '/api/produtos', data),
  updateProduto: (id: number, data: any) => apiRequest('PUT', `/api/produtos/${id}`, data),
  deleteProduto: (id: number) => apiRequest('DELETE', `/api/produtos/${id}`),

  // Entries
  getEntradas: () => fetch('/api/entradas').then(res => res.json()),
  createEntrada: (data: any) => apiRequest('POST', '/api/entradas', data),

  // Exits
  getSaidas: () => fetch('/api/saidas').then(res => res.json()),
  createSaida: (data: any) => apiRequest('POST', '/api/saidas', data),

  // Installments
  getParcelas: () => fetch('/api/parcelas').then(res => res.json()),
  getParcelasPendentes: () => fetch('/api/parcelas/pendentes').then(res => res.json()),
  updateParcelaStatus: (id: number, status: string, dataPagamento?: string) => 
    apiRequest('PUT', `/api/parcelas/${id}/status`, { status, dataPagamento }),

  // Dashboard
  getResumoFinanceiro: () => fetch('/api/dashboard/resumo').then(res => res.json()),
  getUltimasTransacoes: () => fetch('/api/dashboard/transacoes').then(res => res.json()),
};
