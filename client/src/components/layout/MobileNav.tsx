import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Menu, 
  X, 
  Home, 
  ArrowUp, 
  ArrowDown, 
  CreditCard, 
  Package, 
  Building, 
  Users, 
  BarChart3, 
  LogOut,
  Coins,
  User
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Entradas', href: '/entradas', icon: ArrowUp },
  { name: 'Saídas', href: '/saidas', icon: ArrowDown },
  { name: 'Parcelas', href: '/parcelas', icon: CreditCard },
  { name: 'Produtos', href: '/produtos', icon: Package },
  { name: 'Empresas', href: '/empresas', icon: Building },
  { name: 'Usuários', href: '/usuarios', icon: Users },
  { name: 'Relatórios', href: '/relatorios', icon: BarChart3 },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between h-16 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(true)}
            className="text-gray-600 dark:text-gray-300"
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <Coins className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">KIGI</span>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-600 dark:text-gray-300"
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
          <div className="relative flex flex-col w-64 h-full bg-white dark:bg-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
              <span className="text-xl font-bold text-gray-900 dark:text-white">KIGI</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-gray-600 dark:text-gray-300"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* User Info */}
            <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.familyUser?.nome || user?.firstName || 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.familyUser?.papel || 'Membro'}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
              <a
                href="/api/logout"
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sair
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
