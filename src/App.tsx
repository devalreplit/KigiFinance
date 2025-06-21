import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Users from "@/pages/users";
import Income from "@/pages/income";
import Expenses from "@/pages/expenses";
import Products from "@/pages/products";
import Companies from "@/pages/companies";
import Installments from "@/pages/installments";
import Reports from "@/pages/reports";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import { authService } from "@/service/auth";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Inicializar autenticação
    authService.initializeFromStorage();
    setIsAuthenticated(authService.isAuthenticated());
    setIsLoading(false);

    const checkAuth = () => setIsAuthenticated(authService.isAuthenticated());
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden">
      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <MobileNav />
      </div>

      {/* Desktop Sidebar */}
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-card/80 backdrop-blur-sm border-b border-border px-4 lg:px-6 shadow-sm" style={{ height: '73px' }}>
          <div className="flex items-center h-full">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <div className="relative max-w-xs lg:max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar produto, usuário..."
                    className="block w-full pl-10 pr-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
                <div className="relative hidden sm:block">
                  <button className="p-2 rounded-lg hover:bg-accent relative transition-colors">
                    <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM12 2l3.09 6.26L22 9l-5 4.87L18.18 22 12 18.82 5.82 22 7 13.87 2 9l6.91-.74L12 2z" />
                    </svg>
                    <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      3
                    </span>
                  </button>
                </div>
                <div className="flex items-center space-x-3 bg-gradient-to-r from-primary/10 to-primary/5 px-3 py-2 rounded-lg border border-primary/20">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-primary-foreground text-sm font-bold">KG</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">Admin</span>
                    <span className="text-xs text-primary font-medium">Administrador</span>
                  </div>
                  <button className="p-1 rounded-full hover:bg-primary/20 transition-colors">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={() => <Login onLogin={() => window.location.reload()} />} />
      <Route path="/" component={() => <ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/users" component={() => <ProtectedRoute><Users /></ProtectedRoute>} />
      <Route path="/income" component={() => <ProtectedRoute><Income /></ProtectedRoute>} />
      <Route path="/expenses" component={() => <ProtectedRoute><Expenses /></ProtectedRoute>} />
      <Route path="/products" component={() => <ProtectedRoute><Products /></ProtectedRoute>} />
      <Route path="/companies" component={() => <ProtectedRoute><Companies /></ProtectedRoute>} />
      <Route path="/installments" component={() => <ProtectedRoute><Installments /></ProtectedRoute>} />
      <Route path="/reports" component={() => <ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;