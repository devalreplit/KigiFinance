import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusTagProps {
  status: 'paga' | 'vencida' | 'a vencer';
  className?: string;
}

export function StatusTag({ status, className }: StatusTagProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'paga':
        return {
          label: 'Paga',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        };
      case 'vencida':
        return {
          label: 'Vencida',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        };
      case 'a vencer':
        return {
          label: 'A Vencer',
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        };
      default:
        return {
          label: status,
          variant: 'secondary' as const,
          className: '',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
