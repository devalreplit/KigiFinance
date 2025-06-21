// Simple API client without external dependencies
import { reportService, userService, companyService, productService, incomeService, expenseService } from "@/service/apiService";

export const api = {
  // Dashboard APIs
  getResumoFinanceiro: () => reportService.getFinancialSummary(),
  getUltimasTransacoes: (limit = 10) => reportService.getRecentTransactions(limit),
  
  // User APIs
  getFamilyUsers: () => userService.getAll(),
  
  // Company APIs
  getEmpresas: () => companyService.getAll(),
  
  // Product APIs
  getProdutos: () => productService.getAll(),
  
  // Income APIs
  getEntradas: () => incomeService.getAll(),
  
  // Expense APIs
  getSaidas: () => expenseService.getAll(),
};