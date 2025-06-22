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
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

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
    return <Login />;
  }

  return (
    <div className="flex flex-col h-screen w-full max-w-full overflow-hidden">
      {/* Top Header - spans full width */}
      <header className="bg-gradient-to-b from-green-600 via-green-500 to-green-400 backdrop-blur-sm border-b border-green-400/20 px-3 lg:px-4 shadow-lg" style={{ height: '56px' }}>
        <div className="flex items-center h-full">
          <div className="flex items-center justify-between w-full">
            {/* Logo na esquerda */}
            <div className="flex items-center space-x-1.5">
              <div className="w-6 h-6 bg-gradient-to-br from-white to-green-100 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-green-800 font-bold text-xs">KG</span>
              </div>
              <span className="text-lg font-bold text-white">KIGI</span>
            </div>
            <div className="flex items-center space-x-1.5 lg:space-x-3 flex-shrink-0">
              <div className="relative hidden sm:block lg:block">
                <button className="p-1.5 rounded-lg hover:bg-accent relative transition-colors">
                  <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM12 2l3.09 6.26L22 9l-5 4.87L18.18 22 12 18.82 5.82 22 7 13.87 2 9l6.91-.74L12 2z" />
                  </svg>
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    3
                  </span>
                </button>
              </div>

              {/* User Info - Always visible */}
              <div className="flex items-center space-x-1.5 bg-white/80 backdrop-blur-sm px-1.5 py-1 rounded-lg border border-white/30 shadow-sm">
                <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white text-xs font-bold">KG</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-green-800 leading-tight">Administrador</span>
                </div>
                <button className="p-0.5 rounded-full hover:bg-green-100/50 transition-colors">
                  <svg className="w-3 h-3 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Mobile Menu Button */}
              <div className="lg:hidden flex items-center">
                <MobileNav />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <Sidebar />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-auto p-4 lg:p-8">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function Router() {
  const { login } = useAuth();
  return (
    <Switch>
      <Route path="/login" component={() => <Login onLogin={login} />} />
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
      <AuthProvider>
        <Toaster />
        <Router />
      </AuthProvider>
    </TooltipProvider>
  );
}

export default App;