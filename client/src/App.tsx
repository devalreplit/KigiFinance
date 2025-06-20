import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { MainLayout } from "@/components/layout/MainLayout";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Users from "@/pages/Users";
import Entries from "@/pages/Entries";
import Exits from "@/pages/Exits";
import Products from "@/pages/Products";
import Companies from "@/pages/Companies";
import Installments from "@/pages/Installments";
import Reports from "@/pages/Reports";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/">
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </Route>
          <Route path="/usuarios">
            <MainLayout>
              <Users />
            </MainLayout>
          </Route>
          <Route path="/entradas">
            <MainLayout>
              <Entries />
            </MainLayout>
          </Route>
          <Route path="/saidas">
            <MainLayout>
              <Exits />
            </MainLayout>
          </Route>
          <Route path="/produtos">
            <MainLayout>
              <Products />
            </MainLayout>
          </Route>
          <Route path="/empresas">
            <MainLayout>
              <Companies />
            </MainLayout>
          </Route>
          <Route path="/parcelas">
            <MainLayout>
              <Installments />
            </MainLayout>
          </Route>
          <Route path="/relatorios">
            <MainLayout>
              <Reports />
            </MainLayout>
          </Route>
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        
        {/* Floating Action Button for Mobile */}
        <Button 
          size="icon"
          className="lg:hidden fixed bottom-4 right-4 w-14 h-14 rounded-full shadow-lg z-50"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
