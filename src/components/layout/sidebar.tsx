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
      {/* Navigation */}
      <nav className="flex-1 mt-4 px-3 overflow-y-auto">
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
                      ? "bg-primary/15 text-primary border border-primary/20 shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
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


    </div>
  );
}