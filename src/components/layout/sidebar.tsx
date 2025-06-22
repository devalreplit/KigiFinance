import { Link, useLocation } from "wouter";
import { authService } from "@/service/auth";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { 
  Home, 
  Users, 
  DollarSign, 
  TrendingDown, 
  Package, 
  Building, 
  Calendar, 
  BarChart3,
  LogOut 
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", path: "/", icon: Home },
  { name: "Usuários", path: "/users", icon: Users },
  { name: "Entradas", path: "/income", icon: DollarSign },
  { name: "Saídas", path: "/expenses", icon: TrendingDown },
  { name: "Produtos", path: "/products", icon: Package },
  { name: "Empresas", path: "/companies", icon: Building },
  { name: "Parcelas", path: "/installments", icon: Calendar },
  { name: "Relatórios", path: "/reports", icon: BarChart3 },
];

export default function Sidebar() {
  const [location] = useLocation();
    const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      // Forçar recarregamento da página
      window.location.href = '/';
    }
  };

  return (
    <div className="h-full flex flex-col bg-green-50/80 backdrop-blur-sm border-r border-green-200/50">
      {/* Logo Section */}
      <div className="flex items-center px-4 py-6">
        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
          <span className="text-white font-bold text-sm">KG</span>
        </div>
        <span className="text-lg font-bold text-green-800">KIGI</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto">
        <div className="px-3 mb-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Menu Principal
          </p>
        </div>
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;

            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={cn(
                    "flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-green-600 text-white shadow-sm"
                      : "text-gray-700 hover:text-green-800 hover:bg-green-100"
                  )}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout Section */}
      <div className="p-3 border-t border-green-200/50">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sair
        </button>
      </div>
    </div>
  );
}