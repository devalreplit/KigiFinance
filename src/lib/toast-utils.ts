import { toast } from "@/hooks/use-toast";

/**
 * UTILITÁRIOS DE TOAST - FUNÇÕES HELPER PARA NOTIFICAÇÕES
 * 
 * Responsabilidade:
 * - Padronizar criação de toasts na aplicação
 * - Fornecer funções semânticas para diferentes tipos de notificação
 * - Simplificar uso do sistema de toast
 * - Manter consistência visual e de comportamento
 * 
 * Regras de Negócio:
 * - Success: notificações de operações bem-sucedidas
 * - Error: notificações de erros e falhas
 * - Info: notificações informativas neutras
 * - Warning: notificações de alerta e cuidado
 * - Título sempre obrigatório, descrição opcional
 */

interface ToastOptions {
  title: string;
  description?: string;
}

/**
 * FUNÇÃO TOASTSUCCESS - EXIBIR TOAST DE SUCESSO
 * 
 * @param options - Título e descrição opcional do toast
 * 
 * Responsabilidade:
 * - Exibir notificação de sucesso com variante padrão
 * - Comunicar operações concluídas com êxito
 * - Fornecer feedback positivo ao usuário
 * 
 * Regras de Negócio:
 * - Usa variante "default" (geralmente verde)
 * - Título obrigatório, descrição opcional
 * - Usado para confirmações de ações bem-sucedidas
 */
export const toastSuccess = ({ title, description }: ToastOptions) => {
  toast({
    title,
    description,
    variant: "default",
  });
};

/**
 * FUNÇÃO TOASTERROR - EXIBIR TOAST DE ERRO
 * 
 * @param options - Título e descrição opcional do toast
 * 
 * Responsabilidade:
 * - Exibir notificação de erro com variante destrutiva
 * - Comunicar falhas e problemas ao usuário
 * - Fornecer feedback sobre operações que falharam
 * 
 * Regras de Negócio:
 * - Usa variante "destructive" (geralmente vermelha)
 * - Título obrigatório, descrição opcional
 * - Usado para erros de validação, falhas de API, etc.
 */
export const toastError = ({ title, description }: ToastOptions) => {
  toast({
    title,
    description,
    variant: "destructive",
  });
};

/**
 * FUNÇÃO TOASTINFO - EXIBIR TOAST INFORMATIVO
 * 
 * @param options - Título e descrição opcional do toast
 * 
 * Responsabilidade:
 * - Exibir notificação informativa neutra
 * - Comunicar informações gerais ao usuário
 * - Fornecer contexto sobre estado do sistema
 * 
 * Regras de Negócio:
 * - Usa variante "default" (neutra)
 * - Título obrigatório, descrição opcional
 * - Usado para informações de status, dicas, etc.
 */
export const toastInfo = ({ title, description }: ToastOptions) => {
  toast({
    title,
    description,
    variant: "default",
  });
};

/**
 * FUNÇÃO TOASTWARNING - EXIBIR TOAST DE AVISO
 * 
 * @param options - Título e descrição opcional do toast
 * 
 * Responsabilidade:
 * - Exibir notificação de aviso/cuidado
 * - Alertar usuário sobre situações que requerem atenção
 * - Fornecer feedback sobre ações que podem ter consequências
 * 
 * Regras de Negócio:
 * - Usa variante "default" (poderia ser "warning" se disponível)
 * - Título obrigatório, descrição opcional
 * - Usado para alertas, confirmações necessárias, etc.
 */
export const toastWarning = ({ title, description }: ToastOptions) => {
  toast({
    title,
    description,
    variant: "default",
  });
};