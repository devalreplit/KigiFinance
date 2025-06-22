import { authService as apiAuthService } from "./apiService";
import { Usuario } from "../../types";

class AuthService {
  async login(username: string, senha: string): Promise<Usuario> {
    try {
      console.log('AuthService.login - tentativa:', { username, senha });
      const response = await apiAuthService.login(username, senha);
      
      console.log('AuthService.login - resposta:', response);
      
      // Salvar token no localStorage
      localStorage.setItem('authToken', response.token);
      
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
      localStorage.removeItem('authToken');
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