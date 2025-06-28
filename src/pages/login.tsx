import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { toastSuccess, toastError } from "@/lib/toast-utils";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/service/apiService";
import { Loader2, LogIn } from "lucide-react";

interface LoginProps {
  onLogin: (login: string, senha: string) => Promise<boolean>;
}

export default function Login({ onLogin }: LoginProps) {
  const [formData, setFormData] = useState({
    login: "",
    senha: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { setUser } = useAuth();

  // Limpar localStorage ao carregar a tela de login
  useEffect(() => {
    console.log('🧹 Limpando localStorage ao carregar tela de login');

    // Limpar dados de autenticação
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');

    // Limpar dados relacionados ao usuário e autenticação
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('user_') || 
        key.startsWith('auth_') || 
        key.startsWith('kigi_') ||
        key.includes('token') ||
        key.includes('session')
      )) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    console.log('✅ localStorage limpo com sucesso');
  }, []);

  /**
   * FUNÇÃO HANDLESUBMIT - PROCESSAR FORMULÁRIO DE LOGIN
   * 
   * @param e - Evento de submit do formulário
   * 
   * Responsabilidade:
   * - Validar campos obrigatórios antes do envio
   * - Chamar serviço de autenticação com credenciais
   * - Exibir mensagens de sucesso ou erro apropriadas
   * - Gerenciar estado de loading durante processo
   * - Prevenir comportamento padrão do formulário
   * 
   * Regras de Negócio:
   * - Login e senha são obrigatórios
   * - Loading é ativado durante autenticação
   * - Sucesso exibe toast de boas-vindas
   * - Erro exibe mensagem específica ou genérica
   * - Redirecionamento é automático via AuthContext
   * - Loading sempre é desativado ao final (finally)
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.login || !formData.senha) {
      toastError({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos",
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log("Tentando fazer login com:", { login: formData.login, senha: formData.senha });

      if (typeof onLogin === 'function') {
        const success = await onLogin(formData.login, formData.senha);

        if (success) {
          toastSuccess({
            title: "Login realizado com sucesso",
            description: "Bem-vindo ao sistema KIGI!",
          });
        } else {
          toastError({
            title: "Erro no login",
            description: "Credenciais inválidas",
          });
        }
      } else {
        console.error('onLogin não é uma função:', onLogin);
        toastError({
          title: "Erro no login",
          description: "Função de login não disponível",
        });
      }
    } catch (error) {
      console.error("Erro no login:", error);
      toastError({
        title: "Erro no login",
        description: "Usuário ou senha incorretos",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-green-500 rounded-xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">KG</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Sistema KIGI
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Gestão financeira familiar inteligente
          </p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Fazer Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="login">Login</Label>
                <Input
                  id="login"
                  type="text"
                  placeholder="Digite seu login"
                  value={formData.login}
                  onChange={(e) => handleInputChange('login', e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>

              <div>
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  placeholder="Digite sua senha"
                  value={formData.senha}
                  onChange={(e) => handleInputChange('senha', e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4 mr-2" />
                )}
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Credenciais de Demonstração:
              </h3>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <p><strong>Login:</strong> admin</p>
                <p><strong>Senha:</strong> admin</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFormData({ login: 'admin', senha: 'admin' });
                }}
                className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Preencher automaticamente
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© 2024 Sistema KIGI. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}