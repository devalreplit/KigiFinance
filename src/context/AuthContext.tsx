
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario } from '../../types';
import { authService } from '@/service/auth';

interface AuthContextType {
  user: Usuario | null;
  setUser: (user: Usuario | null) => void;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<Usuario | null>(null);

  const isAuthenticated = !!user && authService.isAuthenticated();

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      if (authService.isAuthenticated()) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Erro ao buscar usuário atual:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    // Inicializar usuário se há token válido
    if (authService.isAuthenticated()) {
      refreshUser();
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      isAuthenticated,
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
