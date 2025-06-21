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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <MobileNav />
      </div>
      
      {/* Desktop Sidebar */}
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Buscar produto, usuário..."
                  className="block w-80 pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative">
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM12 2l3.09 6.26L22 9l-5 4.87L18.18 22 12 18.82 5.82 22 7 13.87 2 9l6.91-.74L12 2z" />
                  </svg>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    3
                  </span>
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">KG</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">João Silva</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Administrador</span>
                </div>
                <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                  <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
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