
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario } from '../../types';
import { authService } from '@/service/apiService';

interface AuthContextType {
  user: Usuario | null;
  setUser: (user: Usuario | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (login: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const login = async (login: string, senha: string) => {
    try {
      const response = await authService.login(login, senha);
      setUser(response.user);
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      // Sempre limpar o estado do usuário, independente de erro
      setUser(null);
      
      // Forçar recarregamento da página para garantir limpeza completa
      window.location.href = '/';
    }
  };

  const refreshUser = async () => {
    try {
      setIsLoading(true);
      if (authService.isAuthenticated()) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Erro ao buscar usuário atual:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Inicializar usuário se há token válido
    const initializeAuth = async () => {
      if (authService.isAuthenticated()) {
        await refreshUser();
      } else {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      isAuthenticated,
      isLoading,
      login,
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
