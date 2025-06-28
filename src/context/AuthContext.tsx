import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario } from '../../types';
import { authService } from '../service/apiService';

/**
 * CONTEXTO DE AUTENTICAÇÃO - GERENCIAMENTO DE SESSÃO DE USUÁRIO
 * 
 * Responsabilidade:
 * - Gerenciar estado de autenticação da aplicação
 * - Fornecer métodos para login e logout
 * - Manter dados do usuário logado
 * - Verificar status de autenticação
 * - Persistir sessão no localStorage
 * 
 * Regras de Negócio:
 * - Usuário deve estar autenticado para acessar sistema
 * - Dados de sessão são persistidos no localStorage
 * - Logout limpa todos os dados de autenticação
 * - Status é verificado automaticamente no carregamento
 * - Erros de autenticação limpam sessão automaticamente
 */

interface AuthContextType {
  user: Usuario | null;
  login: (login: string, senha: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * COMPONENTE AUTHPROVIDER - PROVEDOR DE CONTEXTO DE AUTENTICAÇÃO
 * 
 * @param children - Componentes filhos que terão acesso ao contexto
 * 
 * Responsabilidade:
 * - Fornecer contexto de autenticação para toda a aplicação
 * - Gerenciar estado de usuário logado
 * - Verificar status de autenticação na inicialização
 * - Implementar métodos de login e logout
 * - Manter consistência entre estado e localStorage
 * 
 * Regras de Negócio:
 * - Loading é true durante verificação de status
 * - Dados inconsistentes são limpos automaticamente
 * - Contexto é disponibilizado para componentes filhos
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * FUNÇÃO CHECKAUTHSTATUS - VERIFICAR STATUS DE AUTENTICAÇÃO
   * 
   * Responsabilidade:
   * - Verificar se usuário está autenticado via token
   * - Recuperar dados do usuário atual
   * - Limpar dados inconsistentes ou corrompidos
   * - Atualizar estado de loading
   * 
   * Regras de Negócio:
   * - Verifica token antes de buscar usuário
   * - Em caso de erro, limpa dados de autenticação
   * - Loading é sempre definido como false ao final
   * - Dados corrompidos são removidos automaticamente
   */
  const checkAuthStatus = async () => {
    try {
      if (authService.isAuthenticated()) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Erro ao verificar status de autenticação:', error);
      // Se houver erro, limpar dados de autenticação
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
    } finally {
      setLoading(false);
    }
  };

  /**
   * FUNÇÃO LOGIN - AUTENTICAR USUÁRIO
   * 
   * @param login - Login do usuário
   * @param senha - Senha do usuário
   * @throws Error se credenciais inválidas
   * 
   * Responsabilidade:
   * - Validar credenciais via serviço de autenticação
   * - Salvar token e dados do usuário no localStorage
   * - Atualizar estado do usuário logado
   * - Propagar erros de autenticação
   * 
   * Regras de Negócio:
   * - Credenciais devem ser válidas
   * - Token é salvo no localStorage para persistência
   * - Dados do usuário são serializados em JSON
   * - Erros são propagados para tratamento na UI
   */
  const login = async (login: string, senha: string) => {
    try {
      const { user: loggedUser, token } = await authService.login(login, senha);

      // Salvar token no localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUser', JSON.stringify(loggedUser));

      setUser(loggedUser);
    } catch (error) {
      throw error;
    }
  };

  /**
   * FUNÇÃO LOGOUT - ENCERRAR SESSÃO DO USUÁRIO
   * 
   * Responsabilidade:
   * - Limpar dados de autenticação do localStorage
   * - Resetar estado do usuário
   * - Chamar serviço de logout para limpeza no servidor
   * - Garantir limpeza completa da sessão
   * 
   * Regras de Negócio:
   * - Todos os dados de autenticação são removidos
   * - Estado é limpo imediatamente
   * - Serviço de logout é chamado em background
   * - Erros de logout não impedem limpeza local
   */
  const logout = () => {
    // Limpar dados do localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');

    // Limpar estado
    setUser(null);

    // Chamar serviço de logout se necessário
    authService.logout().catch(console.error);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * HOOK USEAUTH - ACESSAR CONTEXTO DE AUTENTICAÇÃO
 * 
 * @returns Contexto de autenticação com dados e métodos
 * @throws Error se usado fora do AuthProvider
 * 
 * Responsabilidade:
 * - Fornecer acesso ao contexto de autenticação
 * - Validar que está sendo usado dentro do provider
 * - Garantir tipagem correta do contexto
 * - Lançar erro descritivo se mal utilizado
 * 
 * Regras de Negócio:
 * - Deve ser usado apenas dentro de AuthProvider
 * - Retorna undefined se contexto não existe
 * - Erro em português para melhor experiência do desenvolvedor
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};