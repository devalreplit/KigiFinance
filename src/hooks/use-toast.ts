import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

/**
 * HOOK USE-TOAST - GERENCIAMENTO DE NOTIFICAÇÕES TOAST
 * 
 * Responsabilidade:
 * - Gerenciar estado global de notificações toast
 * - Fornecer API para criar, atualizar e remover toasts
 * - Controlar limite e tempo de exibição das notificações
 * - Implementar padrão reducer para mudanças de estado
 * 
 * Regras de Negócio:
 * - Máximo de 1 toast visível por vez (TOAST_LIMIT)
 * - Toasts são removidos automaticamente após timeout
 * - Estado é compartilhado globalmente via listeners
 * - IDs únicos são gerados para cada toast
 */

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

/**
 * FUNÇÃO ADDTOREMOVEQUEUE - AGENDAR REMOÇÃO DE TOAST
 * 
 * @param toastId - ID do toast a ser removido
 * 
 * Responsabilidade:
 * - Agendar remoção automática do toast após delay
 * - Evitar múltiplos timeouts para o mesmo toast
 * - Limpar recursos quando toast é removido
 * 
 * Regras de Negócio:
 * - Cada toast pode ter apenas um timeout ativo
 * - Timeout é limpo automaticamente após execução
 * - Remoção é despachada via reducer
 */
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

/**
 * FUNÇÃO REDUCER - GERENCIAR MUDANÇAS DE ESTADO DOS TOASTS
 * 
 * @param state - Estado atual dos toasts
 * @param action - Ação a ser executada
 * @returns Novo estado após aplicar a ação
 * 
 * Responsabilidade:
 * - Processar todas as ações relacionadas a toasts
 * - Manter imutabilidade do estado
 * - Aplicar regras de negócio (limite, remoção, etc.)
 * - Gerenciar ciclo de vida dos toasts
 * 
 * Regras de Negócio:
 * - ADD_TOAST: Adiciona novo toast respeitando limite
 * - UPDATE_TOAST: Atualiza toast existente por ID
 * - DISMISS_TOAST: Marca toast como fechado e agenda remoção
 * - REMOVE_TOAST: Remove toast definitivamente do estado
 */
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

/**
 * FUNÇÃO DISPATCH - DESPACHAR AÇÕES PARA O REDUCER
 * 
 * @param action - Ação a ser processada
 * 
 * Responsabilidade:
 * - Aplicar ação ao estado atual via reducer
 * - Notificar todos os listeners sobre mudança de estado
 * - Manter sincronização entre componentes
 * 
 * Regras de Negócio:
 * - Estado é atualizado imediatamente
 * - Todos os listeners são notificados em sequência
 * - Mudanças são propagadas para todos os componentes
 */
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

/**
 * FUNÇÃO TOAST - CRIAR NOVO TOAST
 * 
 * @param props - Propriedades do toast (título, descrição, tipo, etc.)
 * @returns Objeto com métodos para controlar o toast
 * 
 * Responsabilidade:
 * - Criar novo toast com ID único
 * - Fornecer métodos para atualizar e dispensar toast
 * - Configurar comportamento de abertura/fechamento
 * - Despachar ação para adicionar toast ao estado
 * 
 * Regras de Negócio:
 * - Cada toast recebe ID único gerado automaticamente
 * - Toast é criado no estado 'open: true'
 * - Callback onOpenChange é configurado para dispensar toast
 * - Retorna controles para manipular toast específico
 */
function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

/**
 * FUNÇÃO USETOAST - HOOK PARA USAR SISTEMA DE TOASTS
 * 
 * @returns Estado atual dos toasts e funções de controle
 * 
 * Responsabilidade:
 * - Fornecer acesso ao estado atual dos toasts
 * - Registrar componente como listener de mudanças
 * - Fornecer função toast para criar notificações
 * - Fornecer função dismiss para remover toasts
 * - Gerenciar cleanup de listeners
 * 
 * Regras de Negócio:
 * - Estado local sincronizado com estado global
 * - Listener é registrado no mount e removido no unmount
 * - Componente re-renderiza quando estado muda
 * - Funções de controle são expostas para uso externo
 */
function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }