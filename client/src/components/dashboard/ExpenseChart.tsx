import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const mockData = [
  { name: 'Alimentação', value: 2400, color: COLORS[0] },
  { name: 'Transporte', value: 1398, color: COLORS[1] },
  { name: 'Lazer', value: 980, color: COLORS[2] },
  { name: 'Outros', value: 490, color: COLORS[3] },
];

export function ExpenseChart() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Gastos por Categoria</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              30 dias
            </Button>
            <Button variant="ghost" size="sm">
              90 dias
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 lg:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={mockData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {mockData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`R$ ${value}`, 'Valor']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {mockData.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
