import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, TrendingUp, Users, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
              <Coins className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            KIGI
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-8">
            Sistema Financeiro Familiar
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Controle completo das finanças da sua família. Gerencie entradas, saídas, 
            parcelas e tenha uma visão clara do orçamento familiar.
          </p>
          
          <Button size="lg" asChild>
            <a href="/api/login">
              Fazer Login
            </a>
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Controle Financeiro</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Monitore todas as entradas e saídas da família com facilidade. 
                Visualize gráficos e relatórios detalhados.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Gestão Familiar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Gerencie múltiplos usuários com diferentes papéis. 
                Controle compartilhado das despesas familiares.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Seguro e Confiável</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Seus dados estão seguros com autenticação robusta 
                e backup automático de todas as informações.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Pronto para começar?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Faça login para acessar todas as funcionalidades do sistema.
          </p>
          <Button size="lg" asChild>
            <a href="/api/login">
              Entrar no Sistema
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
