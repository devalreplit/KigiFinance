
# 🔄 ALTERAÇÕES NECESSÁRIAS - NOVA ESTRUTURA DE SAÍDAS

## 📋 **RESUMO DA NOVA ESTRUTURA**

### **CONCEITO PRINCIPAL**
- **Saída À Vista**: Um registro único simples
- **Saída Parcelada**: Primeira parcela = saída pai + parcelas filhas relacionadas
- **Eliminação de redundâncias**: Removidos campos desnecessários

### **ESTRUTURA FINAL**
```typescript
interface Saida {
  id: number;
  saidaPaiId?: number;           // NULL para saída pai, ID da pai para parcelas filhas
  tipoSaida: 'normal' | 'parcelada_pai' | 'parcela';
  numeroParcela: number;         // 1 para à vista/primeira parcela, 2,3,4... para parcelas filhas
  totalParcelas?: number;        // Total de parcelas (apenas para parcelada_pai)
  // ... outros campos mantidos
}
```

---

## 🎯 **ALTERAÇÕES POR MÓDULO**

### **1. ALTERAÇÕES NO BANCO DE DADOS**
**Arquivo:** `database_oracle_scripts.sql`

#### **1.1 Estrutura da Tabela SAIDAS**
- ✅ **CONCLUÍDO** - Já foi atualizada com a nova estrutura otimizada

#### **1.2 Remoção da Tabela PARCELAS**
- 🔄 **NECESSÁRIO** - Remover tabela `PARCELAS` (agora redundante)
- 🔄 **NECESSÁRIO** - Remover sequences, triggers e índices relacionados
- 🔄 **NECESSÁRIO** - Remover views que referenciam a tabela PARCELAS

---

### **2. ALTERAÇÕES NOS TYPES**
**Arquivo:** `types.ts`

#### **2.1 Interface Saida**
```typescript
// ATUAL
interface Saida {
  numeroParcelas?: number;
  dataPrimeiraParcela?: string;
}

// NOVA
interface Saida {
  saidaPaiId?: number;
  tipoSaida: 'normal' | 'parcelada_pai' | 'parcela';
  numeroParcela: number;
  totalParcelas?: number;
}
```

#### **2.2 Interface SaidaInput**
```typescript
// NOVA
interface SaidaInput {
  saidaPaiId?: number;
  tipoSaida?: 'normal' | 'parcelada_pai' | 'parcela';
  numeroParcela?: number;
  totalParcelas?: number;
}
```

#### **2.3 Remoção de Interface Parcela**
- 🔄 **NECESSÁRIO** - Remover interface `Parcela` e `ParcelaInput`

---

### **3. ALTERAÇÕES NO MOCK SERVICE**
**Arquivo:** `src/service/mockService.ts`

#### **3.1 Mock Data - Saídas**
- 🔄 **NECESSÁRIO** - Atualizar `mockExpenses` com nova estrutura
- 🔄 **NECESSÁRIO** - Criar exemplos de saídas parceladas (pai + filhas)

#### **3.2 Mock Service - Expenses**
```typescript
// NOVA FUNÇÃO
create: async (expenseData: SaidaInput): Promise<Saida> => {
  // Se é parcelado, criar saída pai + parcelas filhas
  // Se é à vista, criar apenas saída normal
}
```

#### **3.3 Remoção do Mock Installment Service**
- 🔄 **NECESSÁRIO** - Remover `mockInstallmentService` completamente

---

### **4. ALTERAÇÕES NO API SERVICE**
**Arquivo:** `src/service/apiService.ts`

#### **4.1 Real Expense Service**
```typescript
// ATUALIZAR
getWithInstallments: async (): Promise<Saida[]> => {
  // Buscar saídas where tipoSaida = 'parcelada_pai'
}
```

#### **4.2 Remoção do Real Installment Service**
- 🔄 **NECESSÁRIO** - Remover `realInstallmentService` completamente

#### **4.3 Atualização das Exportações**
```typescript
// REMOVER
export const installmentService = USE_MOCK ? mockInstallmentService : realInstallmentService;

// MANTER
export const expenseService = USE_MOCK ? mockExpenseService : realExpenseService;
```

---

### **5. ALTERAÇÕES NO FORMULÁRIO DE SAÍDAS**
**Arquivo:** `src/pages/expense-form.tsx`

#### **5.1 Estado do Formulário**
```typescript
// ATUAL
const [formData, setFormData] = useState({
  numeroParcelas: 1,
  dataPrimeiraParcela: new Date().toISOString().split("T")[0],
});

// NOVO
const [formData, setFormData] = useState({
  totalParcelas: 1,
  dataPrimeiraParcela: new Date().toISOString().split("T")[0],
});
```

#### **5.2 Lógica de Submissão**
```typescript
// NOVA LÓGICA
const handleSubmit = async (e: React.FormEvent) => {
  const expenseData: SaidaInput = {
    // Para à vista
    tipoSaida: 'normal',
    numeroParcela: 1,
    
    // Para parcelado
    tipoSaida: 'parcelada_pai',
    numeroParcela: 1,
    totalParcelas: formData.totalParcelas,
  };
};
```

#### **5.3 Preview das Parcelas**
- 🔄 **NECESSÁRIO** - Atualizar cálculos baseados em `totalParcelas`
- 🔄 **NECESSÁRIO** - Remover referências a `numeroParcelas`

---

### **6. ALTERAÇÕES NA LISTAGEM DE SAÍDAS**
**Arquivo:** `src/pages/expenses.tsx`

#### **6.1 Filtros e Queries**
```typescript
// NOVA LÓGICA - Buscar apenas saídas pai e normais
const loadData = async (mes?: number, ano?: number) => {
  // Filtrar saídas where tipoSaida IN ('normal', 'parcelada_pai')
};
```

#### **6.2 Exibição de Informações**
```typescript
// NOVO - Mostrar informações de parcelamento
const getParcelasInfo = (saida: Saida) => {
  if (saida.tipoSaida === 'parcelada_pai') {
    return `${saida.totalParcelas}x de ${formatCurrency(saida.valorTotal / saida.totalParcelas!)}`;
  }
  return 'À Vista';
};
```

---

### **7. ALTERAÇÕES NO MODAL DE DETALHES**
**Arquivo:** `src/components/modals/expense-details-modal.tsx`

#### **7.1 Carregamento de Parcelas**
```typescript
// NOVA LÓGICA
const loadInstallments = async () => {
  if (expense?.tipoSaida !== 'parcelada_pai') return;
  
  // Buscar todas as saídas where saidaPaiId = expense.id
  const parcelas = await expenseService.getAll().then(saidas => 
    saidas.filter(s => s.saidaPaiId === expense.id)
  );
};
```

#### **7.2 Atualização de Estado**
```typescript
// ATUALIZAR
setFormData({
  totalParcelas: expense.totalParcelas || 1,
  // Remover numeroParcelas
});
```

#### **7.3 Lógica de Edição**
```typescript
// NOVA LÓGICA DE SALVAMENTO
const handleSave = async () => {
  // Se mudou de parcelado para à vista: remover parcelas filhas
  // Se mudou quantidade de parcelas: recriar parcelas filhas
  // Se mudou de à vista para parcelado: criar parcelas filhas
};
```

---

### **8. ALTERAÇÕES NO DASHBOARD**
**Arquivo:** `src/pages/dashboard.tsx`

#### **8.1 Cálculos de Resumo**
```typescript
// NOVA LÓGICA
const getFinancialSummary = () => {
  const saidas = expenses.filter(e => e.tipoSaida === 'normal' || e.tipoSaida === 'parcelada_pai');
  const totalSaidas = saidas.reduce((sum, expense) => sum + expense.valorTotal, 0);
  
  const parceladas = saidas.filter(e => e.tipoSaida === 'parcelada_pai');
  const totalParcelado = parceladas.reduce((sum, expense) => sum + expense.valorTotal, 0);
};
```

---

### **9. ALTERAÇÕES NOS RELATÓRIOS**
**Arquivo:** `src/pages/reports.tsx`

#### **9.1 Queries de Relatório**
```typescript
// ATUALIZAR FILTROS
const loadTransactions = async () => {
  // Considerar apenas saídas pai (normal + parcelada_pai)
  // Não incluir parcelas filhas nos cálculos de total
};
```

---

### **10. ALTERAÇÕES NO MOCK DATA**
**Arquivo:** `src/service/mockData.ts`

#### **10.1 Dados de Exemplo**
```typescript
// NOVO EXEMPLO DE SAÍDA PARCELADA
export const mockExpenses: Saida[] = [
  // Saída à vista
  {
    id: 1,
    tipoSaida: 'normal',
    numeroParcela: 1,
    // ... outros campos
  },
  
  // Saída parcelada - PAI (primeira parcela)
  {
    id: 2,
    tipoSaida: 'parcelada_pai',
    numeroParcela: 1,
    totalParcelas: 3,
    dataSaida: '2024-01-15',
    valorTotal: 100.00,
  },
  
  // Parcelas filhas
  {
    id: 3,
    saidaPaiId: 2,
    tipoSaida: 'parcela',
    numeroParcela: 2,
    dataSaida: '2024-02-15',
    valorTotal: 100.00,
  },
  {
    id: 4,
    saidaPaiId: 2,
    tipoSaida: 'parcela',
    numeroParcela: 3,
    dataSaida: '2024-03-15',
    valorTotal: 100.00,
  },
];
```

#### **10.2 Remoção de Mock Installments**
- 🔄 **NECESSÁRIO** - Remover `mockInstallments` e tipos relacionados

---

## 🔄 **SEQUÊNCIA DE IMPLEMENTAÇÃO RECOMENDADA**

### **FASE 1: Preparação (1-2 alterações)**
1. ✅ **Banco de dados** - Já atualizado
2. 🔄 **Types** - Atualizar interfaces

### **FASE 2: Dados Mock (3-4 alterações)**
3. 🔄 **Mock Data** - Criar exemplos com nova estrutura
4. 🔄 **Mock Service** - Implementar nova lógica

### **FASE 3: API Service (1 alteração)**
5. 🔄 **API Service** - Remover installments, atualizar exports

### **FASE 4: Formulários (2-3 alterações)**
6. 🔄 **Expense Form** - Atualizar lógica de criação
7. 🔄 **Expense Details Modal** - Atualizar lógica de edição

### **FASE 5: Listagens e Relatórios (2-3 alterações)**
8. 🔄 **Expenses Page** - Atualizar filtros e exibição
9. 🔄 **Dashboard** - Atualizar cálculos
10. 🔄 **Reports** - Atualizar queries

---

## ⚠️ **PONTOS DE ATENÇÃO**

### **Compatibilidade**
- Migração de dados existentes
- Teste com dados legados

### **UX/UI**
- Clareza na distinção entre saída pai e parcelas
- Não mostrar parcelas filhas na listagem principal
- Preview claro do parcelamento

### **Performance**
- Otimizar queries para não buscar parcelas filhas desnecessariamente
- Índices apropriados para `saidaPaiId`

### **Validações**
- Saída pai sempre tem `numeroParcela = 1`
- Parcelas filhas sempre têm `saidaPaiId` válido
- Soma das parcelas = valor total

---

## 🎯 **RESULTADO FINAL ESPERADO**

### **Para Saídas À Vista**
```typescript
{
  id: 1,
  tipoSaida: 'normal',
  numeroParcela: 1,
  valorTotal: 100.00
}
```

### **Para Saídas Parceladas (3x R$ 100)**
```typescript
// PRIMEIRA PARCELA (SAÍDA PAI)
{
  id: 2,
  tipoSaida: 'parcelada_pai',
  numeroParcela: 1,
  totalParcelas: 3,
  dataSaida: '2024-01-15',
  valorTotal: 100.00
}

// PARCELAS FILHAS
{
  id: 3,
  saidaPaiId: 2,
  tipoSaida: 'parcela',
  numeroParcela: 2,
  dataSaida: '2024-02-15',
  valorTotal: 100.00
}
```

---

**📝 PRÓXIMOS PASSOS:**
Aguardando sua autorização para iniciar as alterações no código, começando pela FASE 1 (Types).
