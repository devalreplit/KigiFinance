import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * FUNÇÃO CN - COMBINAR CLASSES CSS COM TAILWIND
 * 
 * @param inputs - Classes CSS a serem combinadas
 * @returns String com classes CSS otimizadas
 * 
 * Responsabilidade:
 * - Combinar múltiplas classes CSS de forma inteligente
 * - Resolver conflitos entre classes do Tailwind
 * - Otimizar output final removendo duplicatas
 * - Suportar condicionais e arrays de classes
 * 
 * Regras de Negócio:
 * - Classes condicionais (undefined/null) são ignoradas
 * - Conflitos do Tailwind são resolvidos (última classe prevalece)
 * - Funciona com strings, arrays, objetos e condicionais
 * - Utiliza clsx para flexibilidade e twMerge para otimização
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * FUNÇÃO FORMATCURRENCY - FORMATAR VALORES MONETÁRIOS
 * 
 * @param value - Valor numérico a ser formatado
 * @returns String formatada como moeda brasileira (R$)
 * 
 * Responsabilidade:
 * - Formatar valores numéricos como moeda brasileira
 * - Aplicar separadores de milhares e decimais corretos
 * - Incluir símbolo da moeda (R$)
 * - Manter consistência de formatação em toda aplicação
 * 
 * Regras de Negócio:
 * - Formato: R$ 1.234,56 (padrão brasileiro)
 * - Sempre exibe 2 casas decimais
 * - Usa vírgula como separador decimal
 * - Usa ponto como separador de milhares
 * - Valores negativos são precedidos por sinal de menos
 */
export function formatCurrency(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numValue);
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR').format(dateObj);
}

export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
}

export function addMonths(date: Date, months: number): Date {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
}

export function getStatusBadgeColor(status: string): string {
  switch (status) {
    case 'paga':
      return 'bg-green-100 text-green-800';
    case 'vencida':
      return 'bg-red-100 text-red-800';
    case 'a_vencer':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'paga':
      return 'Paga';
    case 'vencida':
      return 'Vencida';
    case 'a_vencer':
      return 'A Vencer';
    default:
      return 'Pendente';
  }
}

export function getRoleColor(papel: string): string {
  switch (papel.toLowerCase()) {
    case 'pai':
      return 'bg-blue-600 text-white border-blue-600';
    case 'mae':
      return 'bg-pink-600 text-white border-pink-600';
    case 'filho':
      return 'bg-green-600 text-white border-green-600';
    case 'filha':
      return 'bg-purple-600 text-white border-purple-600';
    default:
      return 'bg-gray-600 text-white border-gray-600';
  }
}

export function getRoleLabel(papel: string): string {
  switch (papel) {
    case 'pai':
      return 'Pai';
    case 'mae':
      return 'Mãe';
    case 'filho':
      return 'Filho';
    case 'filha':
      return 'Filha';
    default:
      return papel;
  }
}