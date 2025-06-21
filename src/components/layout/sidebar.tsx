import { Link, useLocation } from "wouter";
import { authService } from "@/service/auth";
import { cn } from "@/lib/utils";
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

  const handleLogout = () => {
    authService.logout();
    window.location.reload();
  };

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card/95 backdrop-blur-sm border-r border-border shadow-lg transform -translate-x-full transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-border bg-card/50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-primary-foreground font-bold text-sm">KG</span>
          </div>
          <span className="text-xl font-bold text-foreground">KIGI</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6">
        <div className="px-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Menu Principal
          </p>
        </div>
        <div className="mt-4 space-y-1 px-3">
          {menuItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={cn(
                    "flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/15 text-primary border border-primary/20 shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="absolute bottom-0 w-full p-4 border-t border-border bg-card/50">
        <div className="flex items-center space-x-3 p-2 rounded-lg bg-accent/30">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-sm">
            <span className="text-primary-foreground text-xs font-semibold">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              Admin
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Administrador
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-3 w-full flex items-center px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-all duration-200"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sair
        </button>
      </div>
    </div>
  );
}