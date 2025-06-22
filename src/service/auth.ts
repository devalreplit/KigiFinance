import { authService as apiAuthService } from "./apiService";
import { Usuario } from "../../types";

class AuthService {
  async login(username: string, senha: string): Promise<Usuario> {
    try {
      console.log('AuthService.login - tentativa:', { username, senha });
      const response = await apiAuthService.login(username, senha);
      
      console.log('AuthService.login - resposta:', response);
      
      // Salvar token e usuário no localStorage
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      
      return response.user;
    } catch (error) {
      console.error('AuthService.login - erro:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await apiAuthService.logout();
    } catch (error) {
      // Mesmo se falhar no servidor, limpar dados locais
      console.error('Erro ao fazer logout:', error);
    } finally {
      // Limpar todos os dados de autenticação do localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      
      // Limpar qualquer outro dado relacionado ao usuário
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('user_') || key.startsWith('auth_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  }

  async getCurrentUser(): Promise<Usuario> {
    return await apiAuthService.getCurrentUser();
  }

  isAuthenticated(): boolean {
    const hasToken = localStorage.getItem('authToken') !== null;
    return hasToken;
  }
}

export const authService = new AuthService();