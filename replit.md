
# KIGI Frontend - Sistema Financeiro Familiar

## Overview

KIGI é um sistema financeiro familiar desenvolvido em React + TypeScript, focado no controle de entradas, saídas e parcelamentos. O sistema permite múltiplos usuários familiares (pai, mãe, filhos) gerenciarem suas finanças de forma consolidada, com capacidade de integração a webservice externo para persistência de dados.

## System Architecture

### Frontend Stack
- **Framework**: React 18 com TypeScript
- **Styling**: TailwindCSS + shadcn/ui components
- **Routing**: Wouter (lightweight React router)
- **Charts**: Recharts para visualizações
- **HTTP Client**: Axios para comunicação com API
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Barcode Scanning**: @zxing/library para leitura de códigos de barras

### Database Architecture
- **Database**: Oracle 11G (production target)
- **Schema**: Complete relational design with 7 main tables
- **Data Integrity**: Foreign keys, constraints, e triggers de validação
- **Performance**: Índices otimizados e sequences para IDs autoincrementais
- **Scripts**: Full DDL scripts available in `database_oracle_scripts.sql`

### Design System
- **Theme**: Green-based color scheme com CSS variables
- **Components**: shadcn/ui design system com adaptações customizadas
- **Responsive**: Mobile-first approach com sidebar navigation
- **Language**: Interface completa em português
- **Notifications**: Sistema de toast notifications

## Key Components

### Authentication System
- Autenticação baseada em token com persistência em localStorage
- Wrapper de rotas protegidas para acesso autenticado
- Auto-logout em caso de expiração do token
- Serviço de autenticação mock para desenvolvimento

### API Integration
- Comutação configurável entre mock/API real via variáveis de ambiente
- Interceptors do Axios para injeção automática de token
- Tratamento centralizado de erros
- Camada de abstração de serviços para todas as operações de API

### Data Management
- Persistência de dados mock usando localStorage
- Sincronização de dados em tempo real
- Interfaces type-safe para todas as entidades de dados
- Operações CRUD completas para todas as entidades principais

### User Interface
- Navegação sidebar responsiva para mobile
- Layout baseado em cards
- Validação de formulários e tratamento de erros
- Estados de loading e skeleton screens
- Notificações toast para feedback do usuário
- Scanner de código de barras integrado

## Core Features

### Gestão de Usuários
- CRUD completo de usuários familiares
- Papéis definidos: pai, mãe, filho, filha
- Sistema de ativação/desativação
- Modal dedicado para gestão

### Gestão de Empresas
- Cadastro e manutenção de empresas/estabelecimentos
- Sistema de ativação/desativação
- Modal dedicado para gestão

### Gestão de Produtos
- Catálogo completo de produtos
- Suporte a código de barras
- Classificação por categorias
- Unidades de medida configuráveis
- Scanner de código de barras integrado

### Sistema de Entradas (Receitas)
- Registro de receitas familiares
- Associação a usuário titular e empresa pagadora
- Data de referência configurável
- Modal dedicado para gestão

### Sistema de Saídas (Despesas)
- **Estrutura Unificada**: Saídas normais e parceladas em uma única tabela
- **Tipos de Saída**:
  - `normal`: Pagamentos à vista
  - `parcelada_pai`: Primeira parcela de um parcelamento
  - `parcela`: Parcelas subsequentes
- **Funcionalidades**:
  - Criação de saídas à vista ou parceladas
  - Gestão completa de parcelas (adicionar/remover)
  - Múltiplos itens por saída
  - Múltiplos titulares por saída
  - Tipos de pagamento: à vista, parcelado
  - Modal detalhado com modo de edição
  - Validações de integridade de dados

### Relatórios e Dashboard
- Dashboard com métricas financeiras
- Visualizações em gráficos (Recharts)
- Relatórios financeiros detalhados
- Análises de gastos por categoria

## Data Flow

### Authentication Flow
1. Usuário insere credenciais na página de login
2. AuthService valida contra API/serviço mock
3. Token armazenado no localStorage
4. Usuário redirecionado para dashboard
5. Rotas protegidas verificam status de autenticação

### CRUD Operations
1. Ação do usuário dispara chamada de serviço
2. Estado de loading ativado
3. API/serviço mock processa requisição
4. Tratamento de sucesso/erro com notificações toast
5. Atualização de dados e interface

### Mock Data Persistence
- localStorage usado para persistência de dados em desenvolvimento
- Dados iniciais carregados na primeira execução
- Todas as operações CRUD atualizam localStorage
- Dados sobrevivem ao refresh do browser

## Environment Configuration

### API Integration
- **Base URL**: Configurável via `VITE_API_URL` (.env)
- **Mock Mode**: Toggle via `VITE_USE_MOCK` (.env)
- **Authentication**: Bearer token no header Authorization
- **Timeout**: 10 segundos para requisições

### Core Dependencies
```json
{
  "react": "^18.2.0",
  "typescript": "^5.2.2",
  "tailwindcss": "^3.3.6",
  "axios": "^1.6.0",
  "wouter": "^2.12.1",
  "recharts": "^2.15.3",
  "@zxing/library": "^0.21.3"
}
```

## Project Structure

```
src/
├── components/
│   ├── layout/           # Sidebar e navegação mobile
│   ├── modals/           # Modais para CRUD de entidades
│   ├── ui/               # Componentes base do shadcn/ui
│   └── barcode-scanner.tsx
├── context/
│   └── AuthContext.tsx   # Contexto de autenticação
├── hooks/
│   ├── use-toast.ts      # Hook para notificações
│   └── useApi.ts         # Hook para operações de API
├── lib/
│   ├── utils.ts          # Utilitários gerais
│   └── toast-utils.ts    # Utilitários para toasts
├── pages/                # Páginas principais da aplicação
├── service/              # Camada de serviços (API/Mock)
└── main.tsx             # Entry point da aplicação
```

## Deployment Strategy

### Development
- Vite dev server na porta 5000
- Hot reload habilitado
- Modo mock data por padrão
- Configurado para Replit (host 0.0.0.0)

### Production Build
- Geração de assets estáticos via `npm run build`
- Assets otimizados e minificados
- Variáveis de ambiente injetadas em build time
- Servido do diretório `/dist`

### Replit Configuration
- Runtime Node.js 20
- Auto-deploy configurado
- Port forwarding da porta 5000
- Arquivos ocultos configurados (.env, node_modules)

## Current Status

✅ **Implementado e Funcionando**:
- Sistema de autenticação completo
- CRUD de todas as entidades (usuários, empresas, produtos, entradas, saídas)
- Sistema unificado de saídas com parcelamentos
- Modal detalhado de saídas com edição de parcelas
- Scanner de código de barras
- Persistência mock via localStorage
- Interface responsiva completa
- Sistema de notificações toast
- Validações de formulário
- Tratamento de erros
- Scripts completos de banco Oracle 11G

🔧 **Configuração Atual**:
- Modo mock ativo (`VITE_USE_MOCK=true`)
- Porta 5000 configurada e funcional
- Build sem erros
- Todos os componentes UI funcionais
- Documentação atualizada

## Development Notes

- Sistema completamente funcional em modo mock
- Pronto para integração com webservice externo
- Banco de dados Oracle 11G com schema completo
- Interface otimizada para dispositivos móveis
- Código TypeScript com tipagem completa
- Comentários em português em todo o código

## User Preferences

Preferred communication style: Simple, everyday language.
