import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { PendingInstallments } from "@/components/dashboard/PendingInstallments";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Wallet, 
  ArrowUp, 
  ArrowDown, 
  CreditCard, 
  Download, 
  Plus 
} from "lucide-react";

export default function Dashboard() {
  const { data: resumo, isLoading: isLoadingResumo } = useQuery({
    queryKey: ['/api/dashboard/resumo'],
    queryFn: api.getResumoFinanceiro,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Visão geral financeira da família
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 lg:mt-0">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {isLoadingResumo ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))
        ) : (
          <>
            <SummaryCard
              title="Saldo Familiar"
              value={`R$ ${resumo?.saldoFamiliar?.toFixed(2) || '0,00'}`}
              icon={Wallet}
              iconColor="bg-primary/10 text-primary"
              trend={{
                value: "+8.2%",
                isPositive: true,
                label: "vs mês anterior"
              }}
            />
            <SummaryCard
              title="Total Entradas"
              value={`R$ ${resumo?.totalEntradas?.toFixed(2) || '0,00'}`}
              icon={ArrowUp}
              iconColor="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
            />
            <SummaryCard
              title="Total Saídas"
              value={`R$ ${resumo?.totalSaidas?.toFixed(2) || '0,00'}`}
              icon={ArrowDown}
              iconColor="bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
            />
            <SummaryCard
              title="Parcelas Pendentes"
              value={`R$ ${resumo?.totalPendentes?.toFixed(2) || '0,00'}`}
              icon={CreditCard}
              iconColor="bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400"
            />
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Expense Chart */}
        <div className="lg:col-span-8">
          <ExpenseChart />
        </div>

        {/* Pending Installments */}
        <div className="lg:col-span-4">
          <PendingInstallments />
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-12">
          <RecentTransactions />
        </div>
      </div>
    </div>
  );
}
