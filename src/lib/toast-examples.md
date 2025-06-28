
# Padrão de Uso dos Toasts

Para manter consistência visual em toda a aplicação, sempre use as funções utilitárias do arquivo `toast-utils.ts`:

## Importação
```typescript
import { toastSuccess, toastError, toastInfo, toastWarning } from "@/lib/toast-utils";
```

## Exemplos de Uso

### Toast de Sucesso (Verde)
```typescript
toastSuccess({
  title: "Sucesso!",
  description: "Operação realizada com sucesso",
});
```

### Toast de Erro (Vermelho)
```typescript
toastError({
  title: "Erro!",
  description: "Ocorreu um erro na operação",
});
```

### Toast de Informação (Azul)
```typescript
toastInfo({
  title: "Informação",
  description: "Dados atualizados",
});
```

### Toast de Aviso (Laranja)
```typescript
toastWarning({
  title: "Atenção!",
  description: "Verifique os dados antes de continuar",
});
```

## ❌ NÃO USE
```typescript
// Evite usar diretamente o hook useToast para mensagens coloridas
const { toast } = useToast();
toast({ title: "Mensagem" }); // Não terá as cores adequadas
```

## ✅ USE
```typescript
// Sempre use as funções utilitárias
toastSuccess({ title: "Mensagem de sucesso" });
toastError({ title: "Mensagem de erro" });
```
