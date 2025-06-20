import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface User {
  id: number;
  nome: string;
  papel: string;
}

interface UserSelectorProps {
  users: User[];
  selectedIds: number[];
  onSelectionChange: (selectedIds: number[]) => void;
  title?: string;
}

export function UserSelector({ 
  users, 
  selectedIds, 
  onSelectionChange,
  title = "Selecionar Usuários" 
}: UserSelectorProps) {
  const selectAll = () => {
    const allIds = users.map(user => user.id);
    onSelectionChange(allIds);
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  const toggleUser = (userId: number) => {
    if (selectedIds.includes(userId)) {
      onSelectionChange(selectedIds.filter(id => id !== userId));
    } else {
      onSelectionChange([...selectedIds, userId]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={selectAll}>
              <Users className="h-4 w-4 mr-2" />
              Família
            </Button>
            <Button variant="outline" size="sm" onClick={clearAll}>
              Limpar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center space-x-3 p-3 border rounded-lg">
              <Checkbox
                id={`user-${user.id}`}
                checked={selectedIds.includes(user.id)}
                onCheckedChange={() => toggleUser(user.id)}
              />
              <div className="flex-1">
                <Label htmlFor={`user-${user.id}`} className="text-sm font-medium cursor-pointer">
                  {user.nome}
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user.papel}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {users.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Nenhum usuário disponível
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
