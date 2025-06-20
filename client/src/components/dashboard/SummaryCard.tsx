import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
    label: string;
  };
  iconColor: string;
}

export function SummaryCard({ title, value, icon: Icon, trend, iconColor }: SummaryCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
          <div className={`p-2 rounded-lg ${iconColor}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mt-2">
          {value}
        </p>
        {trend && (
          <div className="flex items-center mt-2">
            <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
